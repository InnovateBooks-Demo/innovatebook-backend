import os
import logging
import hashlib
from datetime import datetime, timezone, timedelta
from apscheduler.schedulers.background import BackgroundScheduler
from services.email_service import send_email
from services.token_service import generate_portal_token, generate_token_expiry

logger = logging.getLogger(__name__)

# Base configuration from environment
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3002")

async def check_pending_contracts(db):
    """
    Background job to check for unsigned contracts and send reminders at Day 2, 5, and 7.
    """
    try:
        now = datetime.now(timezone.utc)
        
        # 1. Query contracts that are NOT signed yet
        # We also exclude already expired ones to avoid re-triggering logic
        cursor = db.revenue_workflow_contracts.find({
            "contract_status": {"$nin": ["SIGNED", "EXPIRED"]}
        })
        
        async for contract in cursor:
            contract_id = contract.get("contract_id")
            created_at_str = contract.get("created_at")
            if not created_at_str: continue
            
            # Handle ISO format with 'Z' or offset
            created_at = datetime.fromisoformat(created_at_str.replace('Z', '+00:00'))
            delta = now - created_at
            days_old = delta.total_seconds() / 86400.0
            
            # Determine applicable milestone
            target_milestone = 0
            if days_old >= 7.0:
                target_milestone = 7
            elif days_old >= 5.0:
                target_milestone = 5
            elif days_old >= 2.0:
                target_milestone = 2
            
            if target_milestone == 0: continue
            
            # 2. Refinement: Prevent duplicate or too frequent sends
            current_milestone = contract.get("reminder_milestone", 0)
            last_reminder_at_str = contract.get("last_reminder_at")
            
            if current_milestone >= target_milestone:
                continue
            
            if last_reminder_at_str:
                last_reminder_at = datetime.fromisoformat(last_reminder_at_str.replace('Z', '+00:00'))
                if (now - last_reminder_at).total_seconds() < 12 * 3600:
                    continue # Safety throttle
                    
            # 3. Process the Reminder/Expiry
            await process_contract_reminder(db, contract, target_milestone, now)
            
    except Exception as e:
        logger.error(f"Error in background reminder job: {e}")

async def process_contract_reminder(db, contract, milestone, now):
    """Handles the actual email dispatch and database updates for a specific contract milestone."""
    contract_id = contract.get("contract_id")
    org_id = contract.get("org_id")
    
    # Resolve recipient info from the active portal token
    token_doc = await db.revenue_portal_tokens.find_one({
        "contract_id": contract_id,
        "status": "active"
    })
    
    if not token_doc:
        # If no active token, check if we can find one mapping to the lead
        token_doc = await db.revenue_portal_tokens.find_one({
            "contract_id": contract_id
        }, sort=[("created_at", -1)])
        
    if not token_doc:
        logger.warning(f"No token found for contract {contract_id}, skipping reminder.")
        return

    email = token_doc.get("email")
    client_name = token_doc.get("name") or "Valued Client"
    
    # 4. Expiry Logic (Milestone 7)
    is_expiry = (milestone == 7)
    
    # 5. Determine Link
    # Check if they have a registered account
    client_user = await db.client_portal_users.find_one({"email": email, "org_id": org_id})
    
    portal_link = ""
    if client_user:
        portal_link = f"{FRONTEND_URL}/dashboard"
    else:
        # Generate a NEW token for the reminder to ensure it works
        raw_token, hashed = generate_portal_token()
        expiry = generate_token_expiry(7)
        
        # Invalidate old tokens for this contract
        await db.revenue_portal_tokens.update_many(
            {"contract_id": contract_id, "status": "active"},
            {"$set": {"status": "expired", "updated_at": now.isoformat()}}
        )
        
        # Insert new token
        await db.revenue_portal_tokens.insert_one({
            "token_hash": hashed,
            "contract_id": contract_id,
            "lead_id": contract.get("lead_id"),
            "org_id": org_id,
            "sender_user_id": token_doc.get("sender_user_id"),
            "email": email,
            "name": client_name,
            "expires_at": expiry,
            "status": "active",
            "created_at": now.isoformat()
        })
        portal_link = f"{FRONTEND_URL}/portal/{raw_token}"
        
    # 6. Send Email
    subject = "Reminder: Action Required on Your Contract"
    if is_expiry:
        subject = "FINAL NOTICE: Your Contract Link is Expiring"
    
    body = f"""
    <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: {'#e11d48' if is_expiry else '#3b82f6'};">{'Contract Milestone Update' if is_expiry else 'Pending Contract Action'}</h2>
        <p>Hello {client_name},</p>
        <p>You have a pending contract <strong>({contract_id})</strong> awaiting your action.</p>
        {f'<p style="color: #e11d48; font-weight: bold;">Note: This is your final notice. Unsigned contracts are marked as expired after 7 days.</p>' if is_expiry else ''}
        <div style="margin: 25px 0;">
            <a href="{portal_link}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Contract</a>
        </div>
        <p>If you have already signed or have questions, please reach out to your representative.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 0.8rem; color: #777;">Secure notification from InnovateBook Revenue Cloud.</p>
    </div>
    """
    
    try:
        send_email(email, subject, body)
        
        # Update Contract
        updates = {
            "reminder_milestone": milestone,
            "last_reminder_at": now.isoformat()
        }
        if is_expiry:
            updates["contract_status"] = "EXPIRED"
            
        await db.revenue_workflow_contracts.update_one(
            {"contract_id": contract_id},
            {"$set": updates}
        )
        
        # Audit Logs
        await db.revenue_workflow_audits.insert_one({
            "event_type": "reminder_sent" if not is_expiry else "contract_expired",
            "milestone": milestone,
            "contract_id": contract_id,
            "recipient": email,
            "timestamp": now.isoformat()
        })
        
    except Exception as e:
        logger.error(f"Failed to send reminder for {contract_id}: {e}")

def start_reminder_scheduler(db):
    """
    Initializes and starts the background scheduler for contract reminders.
    Uses BackgroundScheduler for in-process lifecycle management.
    """
    scheduler = BackgroundScheduler()
    
    def run_check():
        import asyncio
        # Run the async logic using a blocking call or run_until_complete if appropriate
        # Since APScheduler is running in a background thread, we need a local loop handler
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(check_pending_contracts(db))
            loop.close()
        except Exception as e:
            logger.error(f"Error in scheduler execution thread: {e}")

    # Standard interval: 12 hours
    scheduler.add_job(run_check, 'interval', hours=12)
    scheduler.start()
    logger.info("Contract Reminder Scheduler started (12h cycle)")
