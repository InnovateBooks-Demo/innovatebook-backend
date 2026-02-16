"""
Engagement Routes for Lead Module
Handles activity tracking, follow-ups, and engagement scoring
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import uuid

engagement_router = APIRouter(prefix="/api/commerce/leads", tags=["Lead Engagement"])

# Pydantic Models
class EngagementCreate(BaseModel):
    engagement_type: str  # Call, Email, Meeting, Note, Task, WhatsApp, Other
    engagement_mode: str  # Inbound, Outbound
    subject: str
    details: str
    outcome: str  # Interested, No Response, Follow-up Needed, Rejected, Completed
    next_follow_up_date: Optional[str] = None
    duration: Optional[int] = None  # in minutes
    attachments: Optional[List[str]] = []

class Engagement(BaseModel):
    engagement_id: str
    lead_id: str
    engagement_type: str
    engagement_mode: str
    subject: str
    details: str
    outcome: str
    next_follow_up_date: Optional[str] = None
    duration: Optional[int] = None
    timestamp: str
    logged_by: str
    attachments: List[str] = []


@engagement_router.post("/{lead_id}/engagements")
async def create_engagement(lead_id: str, engagement: EngagementCreate, db):
    """Log a new engagement activity"""
    try:
        # Get lead
        lead = await db.commerce_leads.find_one({"lead_id": lead_id})
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        
        # Create engagement record
        engagement_id = f"ENG-{uuid.uuid4().hex[:12].upper()}"
        engagement_doc = {
            "engagement_id": engagement_id,
            "lead_id": lead_id,
            **engagement.dict(),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "logged_by": "current_user",  # TODO: Get from auth context
            "created_at": datetime.now(timezone.utc)
        }
        
        # Insert engagement
        await db.lead_engagements.insert_one(engagement_doc)
        
        # Calculate engagement score increase
        engagement_points = calculate_engagement_points(engagement.engagement_type, engagement.outcome)
        
        # Update lead's engagement score
        current_engagement_score = lead.get("engagement_score", 0)
        new_engagement_score = min(55, current_engagement_score + engagement_points)  # Max 55 points
        
        # Calculate new total score
        fit_score = lead.get("fit_score", 0)
        intent_score = lead.get("intent_score", 0)
        potential_score = lead.get("potential_score", 0)
        new_total_score = fit_score + intent_score + potential_score + new_engagement_score
        
        # Determine new category
        if new_total_score >= 76:
            new_category = "Hot"
        elif new_total_score >= 51:
            new_category = "Warm"
        else:
            new_category = "Cold"
        
        # Update lead
        update_data = {
            "engagement_score": new_engagement_score,
            "lead_score": new_total_score,
            "lead_score_category": new_category,
            "last_contacted_date": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc)
        }
        
        # Update status based on outcome
        if engagement.outcome == "Interested" and lead.get("lead_status") == "New":
            update_data["lead_status"] = "Qualified"
        elif lead.get("lead_status") == "New":
            update_data["lead_status"] = "Contacted"
        
        await db.commerce_leads.update_one(
            {"lead_id": lead_id},
            {"$set": update_data}
        )
        
        return {
            "success": True,
            "engagement_id": engagement_id,
            "message": "Engagement logged successfully",
            "engagement_score_increase": engagement_points,
            "new_total_score": new_total_score,
            "new_category": new_category
        }
        
    except Exception as e:
        print(f"Error creating engagement: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@engagement_router.get("/{lead_id}/engagements")
async def get_lead_engagements(lead_id: str, db):
    """Get all engagements for a lead"""
    try:
        engagements = await db.lead_engagements.find(
            {"lead_id": lead_id}
        ).sort("timestamp", -1).to_list(length=100)
        
        # Remove MongoDB _id
        for eng in engagements:
            eng.pop("_id", None)
            eng.pop("created_at", None)
        
        return engagements
        
    except Exception as e:
        print(f"Error fetching engagements: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def calculate_engagement_points(engagement_type: str, outcome: str) -> float:
    """Calculate points to add to engagement score based on activity"""
    base_points = {
        "Meeting": 10,
        "Call": 5,
        "Email": 3,
        "WhatsApp": 3,
        "Note": 1,
        "Task": 2,
        "Other": 2
    }
    
    outcome_multiplier = {
        "Interested": 2.0,
        "Completed": 1.5,
        "Follow-up Needed": 1.0,
        "No Response": 0.5,
        "Rejected": 0.3
    }
    
    points = base_points.get(engagement_type, 2)
    multiplier = outcome_multiplier.get(outcome, 1.0)
    
    return points * multiplier
