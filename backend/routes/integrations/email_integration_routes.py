"""
INNOVATE BOOKS - EMAIL INTEGRATION API
Send/receive emails from leads and contacts with templates
"""

from fastapi import APIRouter, Depends, Query, HTTPException, BackgroundTasks
from typing import Optional, List
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
import uuid

router = APIRouter(prefix="/api/emails", tags=["emails"])

def get_db():
    from main import db
    return db

async def get_current_user_simple(credentials = Depends(__import__('fastapi.security', fromlist=['HTTPBearer']).HTTPBearer())):
    import jwt
    import os
    token = credentials.credentials
    JWT_SECRET = os.environ.get("JWT_SECRET_KEY")
    if not JWT_SECRET:
        raise RuntimeError("JWT_SECRET_KEY is missing in environment")

    payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    return {"user_id": payload.get("user_id") or payload.get("sub"), "org_id": payload.get("org_id", "default"), "full_name": payload.get("full_name", "User"), "email": payload.get("email")}

def generate_id(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:8].upper()}"

class EmailCompose(BaseModel):
    to: List[str]
    cc: Optional[List[str]] = []
    bcc: Optional[List[str]] = []
    subject: str
    body: str
    body_type: str = "html"  # html or plain
    linked_entity_type: Optional[str] = None
    linked_entity_id: Optional[str] = None
    template_id: Optional[str] = None
    attachments: Optional[List[str]] = []  # document_ids
    track_opens: bool = True
    track_clicks: bool = True
    schedule_at: Optional[str] = None

class EmailTemplate(BaseModel):
    name: str
    subject: str
    body: str
    category: str = "general"  # general, sales, support, marketing
    variables: Optional[List[str]] = []

@router.post("/send")
async def send_email(
    email: EmailCompose,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user_simple)
):
    """Send an email (queued for delivery)"""
    db = get_db()
    
    email_doc = {
        "email_id": generate_id("EML"),
        "org_id": current_user.get("org_id"),
        "from_email": current_user.get("email", "noreply@innovatebooks.com"),
        "from_name": current_user.get("full_name"),
        "to": email.to,
        "cc": email.cc,
        "bcc": email.bcc,
        "subject": email.subject,
        "body": email.body,
        "body_type": email.body_type,
        "linked_entity_type": email.linked_entity_type,
        "linked_entity_id": email.linked_entity_id,
        "template_id": email.template_id,
        "attachments": email.attachments,
        "track_opens": email.track_opens,
        "track_clicks": email.track_clicks,
        "status": "queued" if not email.schedule_at else "scheduled",
        "scheduled_at": email.schedule_at,
        "sent_at": None,
        "opened_at": None,
        "clicked_at": None,
        "opens_count": 0,
        "clicks": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user.get("user_id"),
        "thread_id": None,
        "in_reply_to": None
    }
    
    await db.emails.insert_one(email_doc)
    
    # Log activity
    await db.activity_feed.insert_one({
        "activity_id": generate_id("ACT"),
        "module": "Email",
        "action": "sent",
        "entity_type": "email",
        "entity_id": email_doc["email_id"],
        "entity_name": email.subject,
        "description": f"Email sent to {', '.join(email.to)}",
        "user_id": current_user.get("user_id"),
        "user_name": current_user.get("full_name"),
        "org_id": current_user.get("org_id"),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "metadata": {"recipients": email.to}
    })
    
    # In production, this would queue to an email service
    # For now, mark as sent immediately
    await db.emails.update_one(
        {"email_id": email_doc["email_id"]},
        {"$set": {"status": "sent", "sent_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    email_doc.pop("_id", None)
    email_doc["status"] = "sent"
    
    return {"success": True, "email": email_doc}

@router.get("/")
async def list_emails(
    folder: str = Query("sent", enum=["sent", "drafts", "scheduled", "inbox"]),
    linked_entity_type: Optional[str] = None,
    linked_entity_id: Optional[str] = None,
    limit: int = Query(50, le=200),
    current_user: dict = Depends(get_current_user_simple)
):
    """List emails by folder"""
    db = get_db()
    
    query = {"org_id": current_user.get("org_id")}
    
    if folder == "sent":
        query["status"] = "sent"
    elif folder == "drafts":
        query["status"] = "draft"
    elif folder == "scheduled":
        query["status"] = "scheduled"
    elif folder == "inbox":
        query["direction"] = "inbound"
    
    if linked_entity_type:
        query["linked_entity_type"] = linked_entity_type
    if linked_entity_id:
        query["linked_entity_id"] = linked_entity_id
    
    emails = await db.emails.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    
    return {
        "emails": emails,
        "total": len(emails),
        "folder": folder
    }

@router.get("/entity/{entity_type}/{entity_id}")
async def get_entity_emails(
    entity_type: str,
    entity_id: str,
    limit: int = Query(50, le=200),
    current_user: dict = Depends(get_current_user_simple)
):
    """Get all emails linked to an entity (lead, customer, etc.)"""
    db = get_db()
    
    emails = await db.emails.find({
        "linked_entity_type": entity_type,
        "linked_entity_id": entity_id
    }, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    
    return {
        "emails": emails,
        "total": len(emails),
        "entity_type": entity_type,
        "entity_id": entity_id
    }

# EMAIL TEMPLATES - Must be defined before /{email_id} to avoid route conflicts

@router.post("/templates")
async def create_template(
    template: EmailTemplate,
    current_user: dict = Depends(get_current_user_simple)
):
    """Create an email template"""
    db = get_db()
    
    template_doc = {
        "template_id": generate_id("TPL"),
        "org_id": current_user.get("org_id"),
        **template.dict(),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user.get("user_id"),
        "usage_count": 0
    }
    
    await db.email_templates.insert_one(template_doc)
    template_doc.pop("_id", None)
    
    return {"success": True, "template": template_doc}

@router.get("/templates")
async def list_templates(
    category: Optional[str] = None,
    current_user: dict = Depends(get_current_user_simple)
):
    """List email templates"""
    db = get_db()
    
    query = {"org_id": current_user.get("org_id")}
    if category:
        query["category"] = category
    
    templates = await db.email_templates.find(query, {"_id": 0}).sort("usage_count", -1).to_list(100)
    
    # Add default templates if none exist
    if not templates:
        default_templates = [
            {
                "template_id": "TPL-DEFAULT-1",
                "name": "Introduction Email",
                "subject": "Introduction from {{company_name}}",
                "body": "<p>Hi {{first_name}},</p><p>I wanted to reach out and introduce myself. I'm {{sender_name}} from {{company_name}}.</p><p>We specialize in helping businesses like yours with {{value_proposition}}.</p><p>Would you be open to a quick 15-minute call this week to explore how we might help?</p><p>Best regards,<br>{{sender_name}}</p>",
                "category": "sales",
                "variables": ["first_name", "company_name", "sender_name", "value_proposition"],
                "org_id": current_user.get("org_id"),
                "usage_count": 0
            },
            {
                "template_id": "TPL-DEFAULT-2",
                "name": "Follow-up Email",
                "subject": "Following up on our conversation",
                "body": "<p>Hi {{first_name}},</p><p>I wanted to follow up on our recent conversation about {{topic}}.</p><p>Have you had a chance to review the information I sent over? I'd love to answer any questions you might have.</p><p>Looking forward to hearing from you.</p><p>Best,<br>{{sender_name}}</p>",
                "category": "sales",
                "variables": ["first_name", "topic", "sender_name"],
                "org_id": current_user.get("org_id"),
                "usage_count": 0
            },
            {
                "template_id": "TPL-DEFAULT-3",
                "name": "Thank You Email",
                "subject": "Thank you for your time",
                "body": "<p>Hi {{first_name}},</p><p>Thank you for taking the time to meet with me today. I really enjoyed learning more about {{company_name}} and your goals.</p><p>As discussed, I'll {{next_steps}}.</p><p>Please don't hesitate to reach out if you have any questions.</p><p>Best regards,<br>{{sender_name}}</p>",
                "category": "sales",
                "variables": ["first_name", "company_name", "next_steps", "sender_name"],
                "org_id": current_user.get("org_id"),
                "usage_count": 0
            },
            {
                "template_id": "TPL-DEFAULT-4",
                "name": "Invoice Reminder",
                "subject": "Reminder: Invoice #{{invoice_number}} is due",
                "body": "<p>Hi {{first_name}},</p><p>This is a friendly reminder that invoice #{{invoice_number}} for {{amount}} is due on {{due_date}}.</p><p>If you have already made the payment, please disregard this message.</p><p>You can view and pay the invoice online at: {{invoice_link}}</p><p>Thank you for your business!</p><p>Best regards,<br>{{company_name}}</p>",
                "category": "general",
                "variables": ["first_name", "invoice_number", "amount", "due_date", "invoice_link", "company_name"],
                "org_id": current_user.get("org_id"),
                "usage_count": 0
            }
        ]
        await db.email_templates.insert_many(default_templates)
        # Remove _id fields added by MongoDB
        for t in default_templates:
            t.pop("_id", None)
        templates = default_templates
    
    return {"templates": templates, "total": len(templates)}

@router.get("/templates/{template_id}")
async def get_template(
    template_id: str,
    current_user: dict = Depends(get_current_user_simple)
):
    """Get template details"""
    db = get_db()
    
    template = await db.email_templates.find_one({"template_id": template_id}, {"_id": 0})
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    return template

@router.put("/templates/{template_id}")
async def update_template(
    template_id: str,
    template: EmailTemplate,
    current_user: dict = Depends(get_current_user_simple)
):
    """Update a template"""
    db = get_db()
    
    result = await db.email_templates.update_one(
        {"template_id": template_id},
        {"$set": {**template.dict(), "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Template not found")
    
    return {"success": True}

@router.delete("/templates/{template_id}")
async def delete_template(
    template_id: str,
    current_user: dict = Depends(get_current_user_simple)
):
    """Delete a template"""
    db = get_db()
    
    result = await db.email_templates.delete_one({"template_id": template_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Template not found")
    
    return {"success": True}

@router.get("/stats")
async def get_email_stats(
    days: int = Query(30, le=90),
    current_user: dict = Depends(get_current_user_simple)
):
    """Get email statistics"""
    db = get_db()
    
    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    base_query = {"org_id": current_user.get("org_id"), "created_at": {"$gte": cutoff}}
    
    total_sent = await db.emails.count_documents({**base_query, "status": "sent"})
    total_opened = await db.emails.count_documents({**base_query, "opened_at": {"$ne": None}})
    total_clicked = await db.emails.count_documents({**base_query, "clicked_at": {"$ne": None}})
    
    open_rate = (total_opened / total_sent * 100) if total_sent > 0 else 0
    click_rate = (total_clicked / total_sent * 100) if total_sent > 0 else 0
    
    return {
        "total_sent": total_sent,
        "total_opened": total_opened,
        "total_clicked": total_clicked,
        "open_rate": round(open_rate, 1),
        "click_rate": round(click_rate, 1),
        "days": days
    }

# Dynamic email_id route - MUST be last to avoid catching other routes
@router.get("/{email_id}")
async def get_email(
    email_id: str,
    current_user: dict = Depends(get_current_user_simple)
):
    """Get email details"""
    db = get_db()
    
    email = await db.emails.find_one({"email_id": email_id}, {"_id": 0})
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")
    
    return email

@router.post("/{email_id}/track/open")
async def track_email_open(email_id: str):
    """Track email open (called from tracking pixel)"""
    db = get_db()
    
    await db.emails.update_one(
        {"email_id": email_id},
        {
            "$set": {"opened_at": datetime.now(timezone.utc).isoformat()},
            "$inc": {"opens_count": 1}
        }
    )
    
    return {"success": True}

@router.post("/{email_id}/track/click")
async def track_email_click(
    email_id: str,
    url: str
):
    """Track email link click"""
    db = get_db()
    
    await db.emails.update_one(
        {"email_id": email_id},
        {
            "$set": {"clicked_at": datetime.now(timezone.utc).isoformat()},
            "$push": {"clicks": {"url": url, "clicked_at": datetime.now(timezone.utc).isoformat()}}
        }
    )
    
    return {"success": True}
