"""
Email Campaigns Module
Bulk templated emails with tracking
"""

from fastapi import APIRouter, HTTPException, Depends, Header, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import uuid
import jwt
import os
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter(prefix="/api/email-campaigns", tags=["Email Campaigns"])

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'innovate_books_db')
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

JWT_SECRET = os.environ["JWT_SECRET_KEY"]  # must be set in backend/.env


async def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return {
            "user_id": payload.get("user_id"), 
            "org_id": payload.get("org_id")}
    except:
        raise HTTPException(status_code=401, detail="Invalid token")


def serialize_doc(doc):
    if doc and "_id" in doc:
        del doc["_id"]
    return doc


def serialize_docs(docs):
    return [serialize_doc(d) for d in docs]


# Collections
campaigns_col = db.email_campaigns
templates_col = db.email_templates
recipients_col = db.email_recipients
tracking_col = db.email_tracking


# ============== PYDANTIC MODELS ==============

class TemplateCreate(BaseModel):
    name: str
    subject: str
    body_html: str
    body_text: Optional[str] = None
    category: str = "general"  # general, marketing, transactional, newsletter
    variables: List[str] = []  # List of variable names like {{first_name}}


class CampaignCreate(BaseModel):
    name: str
    template_id: str
    subject_override: Optional[str] = None
    scheduled_at: Optional[str] = None  # ISO datetime for scheduling
    recipient_type: str = "manual"  # manual, segment, all_customers, all_vendors


class RecipientAdd(BaseModel):
    campaign_id: str
    email: str
    name: Optional[str] = None
    variables: dict = {}  # Variable values for template


# ============== TEMPLATES ==============

@router.get("/templates")
async def list_templates(category: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    """List all email templates"""
    org_id = current_user.get("org_id")
    query = {"org_id": org_id, "deleted": {"$ne": True}}
    if category:
        query["category"] = category
    
    templates = await templates_col.find(query).to_list(100)
    return {"templates": serialize_docs(templates)}


@router.post("/templates")
async def create_template(template: TemplateCreate, current_user: dict = Depends(get_current_user)):
    """Create a new email template"""
    org_id = current_user.get("org_id")
    
    new_template = {
        "template_id": f"TPL-{uuid.uuid4().hex[:8].upper()}",
        "org_id": org_id,
        **template.dict(),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user.get("user_id"),
        "usage_count": 0
    }
    
    await templates_col.insert_one(new_template)
    return serialize_doc(new_template)


@router.get("/templates/{template_id}")
async def get_template(template_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific template"""
    org_id = current_user.get("org_id")
    template = await templates_col.find_one({"template_id": template_id, "org_id": org_id})
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    return serialize_doc(template)


@router.put("/templates/{template_id}")
async def update_template(template_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Update a template"""
    org_id = current_user.get("org_id")
    
    allowed_fields = ["name", "subject", "body_html", "body_text", "category", "variables"]
    update_data = {k: v for k, v in data.items() if k in allowed_fields}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await templates_col.update_one(
        {"template_id": template_id, "org_id": org_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Template not found")
    
    template = await templates_col.find_one({"template_id": template_id})
    return serialize_doc(template)


@router.delete("/templates/{template_id}")
async def delete_template(template_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a template"""
    org_id = current_user.get("org_id")
    result = await templates_col.update_one(
        {"template_id": template_id, "org_id": org_id},
        {"$set": {"deleted": True, "deleted_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Template not found")
    
    return {"success": True, "message": "Template deleted"}


# ============== CAMPAIGNS ==============

@router.get("/campaigns")
async def list_campaigns(status: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    """List all campaigns"""
    org_id = current_user.get("org_id")
    query = {"org_id": org_id, "deleted": {"$ne": True}}
    if status:
        query["status"] = status
    
    campaigns = await campaigns_col.find(query).sort("created_at", -1).to_list(100)
    
    # Enrich with stats
    for campaign in campaigns:
        recipients = await recipients_col.find({"campaign_id": campaign.get("campaign_id")}).to_list(10000)
        campaign["recipient_count"] = len(recipients)
        campaign["sent_count"] = sum(1 for r in recipients if r.get("status") == "sent")
        campaign["opened_count"] = sum(1 for r in recipients if r.get("opened"))
        campaign["clicked_count"] = sum(1 for r in recipients if r.get("clicked"))
    
    return {"campaigns": serialize_docs(campaigns)}


@router.post("/campaigns")
async def create_campaign(campaign: CampaignCreate, current_user: dict = Depends(get_current_user)):
    """Create a new campaign"""
    org_id = current_user.get("org_id")
    
    # Verify template exists
    template = await templates_col.find_one({"template_id": campaign.template_id, "org_id": org_id})
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    new_campaign = {
        "campaign_id": f"CMP-{uuid.uuid4().hex[:8].upper()}",
        "org_id": org_id,
        **campaign.dict(),
        "template_name": template.get("name"),
        "status": "draft",  # draft, scheduled, sending, completed, paused
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user.get("user_id"),
        "stats": {
            "total_recipients": 0,
            "sent": 0,
            "delivered": 0,
            "opened": 0,
            "clicked": 0,
            "bounced": 0,
            "unsubscribed": 0
        }
    }
    
    await campaigns_col.insert_one(new_campaign)
    return serialize_doc(new_campaign)


@router.get("/campaigns/{campaign_id}")
async def get_campaign(campaign_id: str, current_user: dict = Depends(get_current_user)):
    """Get campaign details with recipients"""
    org_id = current_user.get("org_id")
    campaign = await campaigns_col.find_one({"campaign_id": campaign_id, "org_id": org_id})
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    # Get recipients
    recipients = await recipients_col.find({"campaign_id": campaign_id}).to_list(1000)
    campaign["recipients"] = serialize_docs(recipients)
    
    # Get template
    template = await templates_col.find_one({"template_id": campaign.get("template_id")})
    if template:
        campaign["template"] = serialize_doc(template)
    
    return serialize_doc(campaign)


@router.put("/campaigns/{campaign_id}")
async def update_campaign(campaign_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Update a campaign"""
    org_id = current_user.get("org_id")
    
    campaign = await campaigns_col.find_one({"campaign_id": campaign_id, "org_id": org_id})
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    if campaign.get("status") not in ["draft", "scheduled"]:
        raise HTTPException(status_code=400, detail="Cannot update campaign that has been sent")
    
    allowed_fields = ["name", "subject_override", "scheduled_at"]
    update_data = {k: v for k, v in data.items() if k in allowed_fields}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await campaigns_col.update_one({"campaign_id": campaign_id}, {"$set": update_data})
    
    updated = await campaigns_col.find_one({"campaign_id": campaign_id})
    return serialize_doc(updated)


@router.delete("/campaigns/{campaign_id}")
async def delete_campaign(campaign_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a campaign"""
    org_id = current_user.get("org_id")
    result = await campaigns_col.update_one(
        {"campaign_id": campaign_id, "org_id": org_id},
        {"$set": {"deleted": True, "deleted_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    return {"success": True, "message": "Campaign deleted"}


# ============== RECIPIENTS ==============

@router.post("/campaigns/{campaign_id}/recipients")
async def add_recipient(campaign_id: str, recipient: RecipientAdd, current_user: dict = Depends(get_current_user)):
    """Add a recipient to a campaign"""
    org_id = current_user.get("org_id")
    
    # Verify campaign exists and is in draft status
    campaign = await campaigns_col.find_one({"campaign_id": campaign_id, "org_id": org_id})
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    if campaign.get("status") not in ["draft", "scheduled"]:
        raise HTTPException(status_code=400, detail="Cannot add recipients to sent campaign")
    
    # Check if recipient already exists
    existing = await recipients_col.find_one({"campaign_id": campaign_id, "email": recipient.email})
    if existing:
        raise HTTPException(status_code=400, detail="Recipient already added")
    
    new_recipient = {
        "recipient_id": f"RCP-{uuid.uuid4().hex[:8].upper()}",
        "campaign_id": campaign_id,
        "org_id": org_id,
        "email": recipient.email,
        "name": recipient.name,
        "variables": recipient.variables,
        "status": "pending",  # pending, sent, failed, bounced
        "opened": False,
        "clicked": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await recipients_col.insert_one(new_recipient)
    
    # Update campaign stats
    await campaigns_col.update_one(
        {"campaign_id": campaign_id},
        {"$inc": {"stats.total_recipients": 1}}
    )
    
    return serialize_doc(new_recipient)


@router.post("/campaigns/{campaign_id}/recipients/bulk")
async def add_bulk_recipients(campaign_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Add multiple recipients at once"""
    org_id = current_user.get("org_id")
    
    campaign = await campaigns_col.find_one({"campaign_id": campaign_id, "org_id": org_id})
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    recipients_data = data.get("recipients", [])
    if not recipients_data:
        raise HTTPException(status_code=400, detail="No recipients provided")
    
    added = 0
    skipped = 0
    
    for r in recipients_data:
        email = r.get("email")
        if not email:
            continue
        
        existing = await recipients_col.find_one({"campaign_id": campaign_id, "email": email})
        if existing:
            skipped += 1
            continue
        
        new_recipient = {
            "recipient_id": f"RCP-{uuid.uuid4().hex[:8].upper()}",
            "campaign_id": campaign_id,
            "org_id": org_id,
            "email": email,
            "name": r.get("name"),
            "variables": r.get("variables", {}),
            "status": "pending",
            "opened": False,
            "clicked": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await recipients_col.insert_one(new_recipient)
        added += 1
    
    # Update campaign stats
    await campaigns_col.update_one(
        {"campaign_id": campaign_id},
        {"$inc": {"stats.total_recipients": added}}
    )
    
    return {"success": True, "added": added, "skipped": skipped}


@router.delete("/campaigns/{campaign_id}/recipients/{recipient_id}")
async def remove_recipient(campaign_id: str, recipient_id: str, current_user: dict = Depends(get_current_user)):
    """Remove a recipient from a campaign"""
    org_id = current_user.get("org_id")
    
    result = await recipients_col.delete_one({
        "recipient_id": recipient_id,
        "campaign_id": campaign_id,
        "org_id": org_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Recipient not found")
    
    # Update campaign stats
    await campaigns_col.update_one(
        {"campaign_id": campaign_id},
        {"$inc": {"stats.total_recipients": -1}}
    )
    
    return {"success": True, "message": "Recipient removed"}


# ============== CAMPAIGN ACTIONS ==============

@router.post("/campaigns/{campaign_id}/send")
async def send_campaign(campaign_id: str, background_tasks: BackgroundTasks, current_user: dict = Depends(get_current_user)):
    """Send the campaign to all recipients"""
    org_id = current_user.get("org_id")
    
    campaign = await campaigns_col.find_one({"campaign_id": campaign_id, "org_id": org_id})
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    if campaign.get("status") not in ["draft", "scheduled"]:
        raise HTTPException(status_code=400, detail="Campaign already sent or in progress")
    
    # Check if there are recipients
    recipient_count = await recipients_col.count_documents({"campaign_id": campaign_id})
    if recipient_count == 0:
        raise HTTPException(status_code=400, detail="No recipients in campaign")
    
    # Update status to sending
    await campaigns_col.update_one(
        {"campaign_id": campaign_id},
        {"$set": {
            "status": "sending",
            "started_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # In a real implementation, this would trigger an async email sending job
    # For demo, we'll simulate sending
    background_tasks.add_task(simulate_campaign_send, campaign_id, org_id)
    
    return {"success": True, "message": "Campaign sending started", "recipient_count": recipient_count}


async def simulate_campaign_send(campaign_id: str, org_id: str):
    """Simulate sending emails (in real implementation, use email service)"""
    import asyncio
    import random
    
    recipients = await recipients_col.find({"campaign_id": campaign_id, "status": "pending"}).to_list(10000)
    
    sent = 0
    failed = 0
    
    for recipient in recipients:
        # Simulate email sending (95% success rate)
        success = random.random() > 0.05
        
        if success:
            await recipients_col.update_one(
                {"recipient_id": recipient.get("recipient_id")},
                {"$set": {
                    "status": "sent",
                    "sent_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            sent += 1
        else:
            await recipients_col.update_one(
                {"recipient_id": recipient.get("recipient_id")},
                {"$set": {
                    "status": "failed",
                    "error": "Simulated delivery failure"
                }}
            )
            failed += 1
        
        # Small delay to simulate sending
        await asyncio.sleep(0.01)
    
    # Update campaign stats and status
    await campaigns_col.update_one(
        {"campaign_id": campaign_id},
        {"$set": {
            "status": "completed",
            "completed_at": datetime.now(timezone.utc).isoformat(),
            "stats.sent": sent,
            "stats.delivered": sent,
            "stats.bounced": failed
        }}
    )


@router.post("/campaigns/{campaign_id}/pause")
async def pause_campaign(campaign_id: str, current_user: dict = Depends(get_current_user)):
    """Pause a sending campaign"""
    org_id = current_user.get("org_id")
    
    result = await campaigns_col.update_one(
        {"campaign_id": campaign_id, "org_id": org_id, "status": "sending"},
        {"$set": {"status": "paused"}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Campaign not in sending status")
    
    return {"success": True, "message": "Campaign paused"}


@router.post("/campaigns/{campaign_id}/resume")
async def resume_campaign(campaign_id: str, background_tasks: BackgroundTasks, current_user: dict = Depends(get_current_user)):
    """Resume a paused campaign"""
    org_id = current_user.get("org_id")
    
    campaign = await campaigns_col.find_one({"campaign_id": campaign_id, "org_id": org_id, "status": "paused"})
    if not campaign:
        raise HTTPException(status_code=400, detail="Campaign not paused")
    
    await campaigns_col.update_one(
        {"campaign_id": campaign_id},
        {"$set": {"status": "sending"}}
    )
    
    background_tasks.add_task(simulate_campaign_send, campaign_id, org_id)
    
    return {"success": True, "message": "Campaign resumed"}


# ============== TRACKING ==============

@router.get("/track/open/{recipient_id}")
async def track_open(recipient_id: str):
    """Track email open (called via tracking pixel)"""
    await recipients_col.update_one(
        {"recipient_id": recipient_id},
        {"$set": {
            "opened": True,
            "opened_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Update campaign stats
    recipient = await recipients_col.find_one({"recipient_id": recipient_id})
    if recipient:
        await campaigns_col.update_one(
            {"campaign_id": recipient.get("campaign_id")},
            {"$inc": {"stats.opened": 1}}
        )
    
    # Return transparent 1x1 pixel
    return {"status": "tracked"}


@router.get("/track/click/{recipient_id}")
async def track_click(recipient_id: str, url: str = ""):
    """Track link click"""
    await recipients_col.update_one(
        {"recipient_id": recipient_id},
        {"$set": {
            "clicked": True,
            "clicked_at": datetime.now(timezone.utc).isoformat()
        },
        "$push": {
            "click_history": {
                "url": url,
                "clicked_at": datetime.now(timezone.utc).isoformat()
            }
        }}
    )
    
    # Update campaign stats
    recipient = await recipients_col.find_one({"recipient_id": recipient_id})
    if recipient:
        await campaigns_col.update_one(
            {"campaign_id": recipient.get("campaign_id")},
            {"$inc": {"stats.clicked": 1}}
        )
    
    return {"status": "tracked", "redirect": url}


@router.get("/campaigns/{campaign_id}/analytics")
async def get_campaign_analytics(campaign_id: str, current_user: dict = Depends(get_current_user)):
    """Get detailed campaign analytics"""
    org_id = current_user.get("org_id")
    
    campaign = await campaigns_col.find_one({"campaign_id": campaign_id, "org_id": org_id})
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    recipients = await recipients_col.find({"campaign_id": campaign_id}).to_list(10000)
    
    total = len(recipients)
    sent = sum(1 for r in recipients if r.get("status") == "sent")
    opened = sum(1 for r in recipients if r.get("opened"))
    clicked = sum(1 for r in recipients if r.get("clicked"))
    failed = sum(1 for r in recipients if r.get("status") == "failed")
    
    analytics = {
        "campaign_id": campaign_id,
        "campaign_name": campaign.get("name"),
        "status": campaign.get("status"),
        "metrics": {
            "total_recipients": total,
            "sent": sent,
            "delivered": sent - failed,
            "opened": opened,
            "clicked": clicked,
            "failed": failed,
            "open_rate": round((opened / sent * 100), 2) if sent > 0 else 0,
            "click_rate": round((clicked / sent * 100), 2) if sent > 0 else 0,
            "click_to_open_rate": round((clicked / opened * 100), 2) if opened > 0 else 0,
            "bounce_rate": round((failed / total * 100), 2) if total > 0 else 0
        },
        "timeline": {
            "created_at": campaign.get("created_at"),
            "started_at": campaign.get("started_at"),
            "completed_at": campaign.get("completed_at")
        }
    }
    
    return analytics


# ============== DEFAULT TEMPLATES ==============

@router.post("/templates/seed")
async def seed_default_templates(current_user: dict = Depends(get_current_user)):
    """Create default email templates"""
    org_id = current_user.get("org_id")
    
    default_templates = [
        {
            "name": "Welcome Email",
            "subject": "Welcome to {{company_name}}!",
            "body_html": """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #3A4E63;">Welcome, {{first_name}}!</h1>
                <p>Thank you for joining {{company_name}}. We're excited to have you on board.</p>
                <p>Here's what you can do next:</p>
                <ul>
                    <li>Complete your profile</li>
                    <li>Explore our features</li>
                    <li>Connect with your team</li>
                </ul>
                <a href="{{cta_url}}" style="display: inline-block; padding: 12px 24px; background: #3A4E63; color: white; text-decoration: none; border-radius: 6px;">Get Started</a>
                <p style="margin-top: 24px; color: #666;">Best regards,<br>The {{company_name}} Team</p>
            </div>
            """,
            "category": "transactional",
            "variables": ["first_name", "company_name", "cta_url"]
        },
        {
            "name": "Invoice Reminder",
            "subject": "Reminder: Invoice #{{invoice_number}} is due",
            "body_html": """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #3A4E63;">Invoice Reminder</h2>
                <p>Dear {{customer_name}},</p>
                <p>This is a friendly reminder that invoice #{{invoice_number}} for {{amount}} is due on {{due_date}}.</p>
                <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
                    <p><strong>Invoice:</strong> #{{invoice_number}}</p>
                    <p><strong>Amount:</strong> {{amount}}</p>
                    <p><strong>Due Date:</strong> {{due_date}}</p>
                </div>
                <a href="{{payment_url}}" style="display: inline-block; padding: 12px 24px; background: #3A4E63; color: white; text-decoration: none; border-radius: 6px;">Pay Now</a>
                <p style="margin-top: 24px; color: #666;">If you've already made this payment, please disregard this reminder.</p>
            </div>
            """,
            "category": "transactional",
            "variables": ["customer_name", "invoice_number", "amount", "due_date", "payment_url"]
        },
        {
            "name": "Newsletter",
            "subject": "{{month}} Newsletter - Updates from {{company_name}}",
            "body_html": """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #3A4E63;">{{month}} Newsletter</h1>
                <p>Hello {{first_name}},</p>
                <p>Here's what's new this month:</p>
                <div style="border-left: 4px solid #3A4E63; padding-left: 16px; margin: 16px 0;">
                    {{content}}
                </div>
                <a href="{{read_more_url}}" style="display: inline-block; padding: 12px 24px; background: #3A4E63; color: white; text-decoration: none; border-radius: 6px;">Read More</a>
            </div>
            """,
            "category": "newsletter",
            "variables": ["first_name", "month", "company_name", "content", "read_more_url"]
        },
        {
            "name": "Promotional Offer",
            "subject": "Special Offer: {{offer_title}}",
            "body_html": """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #3A4E63 0%, #0055cc 100%); color: white; padding: 32px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1>{{offer_title}}</h1>
                    <p style="font-size: 24px; font-weight: bold;">{{discount}}% OFF</p>
                </div>
                <div style="padding: 24px;">
                    <p>Dear {{first_name}},</p>
                    <p>{{offer_description}}</p>
                    <p style="font-size: 14px; color: #666;">Offer valid until {{expiry_date}}</p>
                    <a href="{{cta_url}}" style="display: inline-block; padding: 12px 24px; background: #3A4E63; color: white; text-decoration: none; border-radius: 6px;">Claim Offer</a>
                </div>
            </div>
            """,
            "category": "marketing",
            "variables": ["first_name", "offer_title", "discount", "offer_description", "expiry_date", "cta_url"]
        }
    ]
    
    created = 0
    for template in default_templates:
        existing = await templates_col.find_one({"name": template["name"], "org_id": org_id})
        if not existing:
            template["template_id"] = f"TPL-{uuid.uuid4().hex[:8].upper()}"
            template["org_id"] = org_id
            template["created_at"] = datetime.now(timezone.utc).isoformat()
            template["created_by"] = current_user.get("user_id")
            template["usage_count"] = 0
            await templates_col.insert_one(template)
            created += 1
    
    return {"success": True, "message": f"Created {created} default templates"}
