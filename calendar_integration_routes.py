"""
INNOVATE BOOKS - CALENDAR INTEGRATION API
Unified calendar with tasks, meetings, deadlines, and milestones
"""

from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Optional, List
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
import uuid

router = APIRouter(prefix="/api/calendar", tags=["calendar"])

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
    return {
        "user_id": payload.get("user_id") or payload.get("sub"), 
        "org_id": payload.get("org_id", "default"), 
        "full_name": payload.get("full_name", "User")}

def generate_id(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:8].upper()}"

class CalendarEvent(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: str
    end_time: Optional[str] = None
    all_day: bool = False
    event_type: str = "meeting"  # meeting, task, deadline, milestone, reminder
    location: Optional[str] = None
    attendees: Optional[List[str]] = []
    linked_entity_type: Optional[str] = None
    linked_entity_id: Optional[str] = None
    recurrence: Optional[dict] = None
    color: Optional[str] = None
    reminder_minutes: Optional[int] = 15

@router.get("/events")
async def get_calendar_events(
    start_date: str = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: str = Query(..., description="End date (YYYY-MM-DD)"),
    event_type: Optional[str] = None,
    include_tasks: bool = True,
    include_deadlines: bool = True,
    current_user: dict = Depends(get_current_user_simple)
):
    """Get all calendar events within a date range"""
    db = get_db()
    
    events = []
    user_id = current_user.get("user_id")
    
    # Query custom events
    event_query = {
        "org_id": current_user.get("org_id"),
        "start_time": {"$gte": start_date, "$lte": end_date + "T23:59:59"}
    }
    if event_type:
        event_query["event_type"] = event_type
    
    custom_events = await db.calendar_events.find(event_query, {"_id": 0}).to_list(500)
    events.extend(custom_events)
    
    # Include tasks as events
    if include_tasks:
        tasks = await db.workspace_tasks.find({
            "due_date": {"$gte": start_date, "$lte": end_date + "T23:59:59"},
            "$or": [{"assigned_to": user_id}, {"created_by": user_id}]
        }, {"_id": 0}).to_list(200)
        
        for task in tasks:
            events.append({
                "event_id": f"task_{task.get('task_id')}",
                "title": task.get("title"),
                "description": task.get("description"),
                "start_time": task.get("due_date"),
                "end_time": task.get("due_date"),
                "all_day": True,
                "event_type": "task",
                "color": "#3B82F6" if task.get("status") == "open" else "#10B981",
                "linked_entity_type": "task",
                "linked_entity_id": task.get("task_id"),
                "status": task.get("status"),
                "priority": task.get("priority")
            })
    
    # Include invoice/bill deadlines
    if include_deadlines:
        # Invoice due dates
        invoices = await db.invoices.find({
            "due_date": {"$gte": start_date, "$lte": end_date},
            "status": {"$in": ["sent", "overdue"]}
        }, {"_id": 0, "invoice_id": 1, "invoice_number": 1, "due_date": 1, "total": 1, "customer_name": 1}).to_list(100)
        
        for inv in invoices:
            events.append({
                "event_id": f"inv_{inv.get('invoice_id')}",
                "title": f"Invoice Due: {inv.get('invoice_number')}",
                "description": f"₹{inv.get('total', 0):,.0f} from {inv.get('customer_name', 'Customer')}",
                "start_time": inv.get("due_date"),
                "all_day": True,
                "event_type": "deadline",
                "color": "#EF4444",
                "linked_entity_type": "invoice",
                "linked_entity_id": inv.get("invoice_id")
            })
        
        # Bill payment deadlines
        bills = await db.bills.find({
            "due_date": {"$gte": start_date, "$lte": end_date},
            "status": {"$in": ["approved", "overdue"]}
        }, {"_id": 0, "bill_id": 1, "bill_number": 1, "due_date": 1, "total": 1, "vendor_name": 1}).to_list(100)
        
        for bill in bills:
            events.append({
                "event_id": f"bill_{bill.get('bill_id')}",
                "title": f"Bill Due: {bill.get('bill_number')}",
                "description": f"₹{bill.get('total', 0):,.0f} to {bill.get('vendor_name', 'Vendor')}",
                "start_time": bill.get("due_date"),
                "all_day": True,
                "event_type": "deadline",
                "color": "#F59E0B",
                "linked_entity_type": "bill",
                "linked_entity_id": bill.get("bill_id")
            })
        
        # Project milestones
        projects = await db.ops_projects.find({
            "milestones": {"$exists": True}
        }, {"_id": 0, "project_id": 1, "name": 1, "milestones": 1}).to_list(100)
        
        for project in projects:
            for milestone in project.get("milestones", []):
                due = milestone.get("due_date", "")
                if due >= start_date and due <= end_date:
                    events.append({
                        "event_id": f"ms_{project.get('project_id')}_{milestone.get('id', '')}",
                        "title": f"Milestone: {milestone.get('name')}",
                        "description": f"Project: {project.get('name')}",
                        "start_time": due,
                        "all_day": True,
                        "event_type": "milestone",
                        "color": "#8B5CF6",
                        "linked_entity_type": "project",
                        "linked_entity_id": project.get("project_id"),
                        "status": milestone.get("status")
                    })
    
    # Sort by start time
    events.sort(key=lambda x: x.get("start_time", ""))
    
    return {
        "events": events,
        "total": len(events),
        "date_range": {"start": start_date, "end": end_date}
    }

@router.post("/events")
async def create_calendar_event(
    event: CalendarEvent,
    current_user: dict = Depends(get_current_user_simple)
):
    """Create a new calendar event"""
    db = get_db()
    
    event_doc = {
        "event_id": generate_id("EVT"),
        "org_id": current_user.get("org_id"),
        **event.dict(),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user.get("user_id"),
        "created_by_name": current_user.get("full_name")
    }
    
    await db.calendar_events.insert_one(event_doc)
    event_doc.pop("_id", None)
    
    return {"success": True, "event": event_doc}

@router.put("/events/{event_id}")
async def update_calendar_event(
    event_id: str,
    event: CalendarEvent,
    current_user: dict = Depends(get_current_user_simple)
):
    """Update a calendar event"""
    db = get_db()
    
    result = await db.calendar_events.update_one(
        {"event_id": event_id},
        {"$set": {
            **event.dict(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "updated_by": current_user.get("user_id")
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    
    return {"success": True}

@router.delete("/events/{event_id}")
async def delete_calendar_event(
    event_id: str,
    current_user: dict = Depends(get_current_user_simple)
):
    """Delete a calendar event"""
    db = get_db()
    
    result = await db.calendar_events.delete_one({"event_id": event_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    
    return {"success": True}

@router.get("/upcoming")
async def get_upcoming_events(
    days: int = Query(7, le=30),
    limit: int = Query(20, le=100),
    current_user: dict = Depends(get_current_user_simple)
):
    """Get upcoming events for the next N days"""
    now = datetime.now(timezone.utc)
    start_date = now.strftime("%Y-%m-%d")
    end_date = (now + timedelta(days=days)).strftime("%Y-%m-%d")
    
    result = await get_calendar_events(start_date, end_date, None, True, True, current_user)
    
    # Filter to only future events and limit
    upcoming = [e for e in result["events"] if e.get("start_time", "") >= now.isoformat()][:limit]
    
    return {
        "events": upcoming,
        "total": len(upcoming),
        "days": days
    }

@router.get("/today")
async def get_today_events(current_user: dict = Depends(get_current_user_simple)):
    """Get all events for today"""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    return await get_calendar_events(today, today, None, True, True, current_user)

@router.post("/events/{event_id}/attendees")
async def add_attendees(
    event_id: str,
    attendees: List[str],
    current_user: dict = Depends(get_current_user_simple)
):
    """Add attendees to an event"""
    db = get_db()
    
    result = await db.calendar_events.update_one(
        {"event_id": event_id},
        {"$addToSet": {"attendees": {"$each": attendees}}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    
    return {"success": True}

@router.get("/summary")
async def get_calendar_summary(
    current_user: dict = Depends(get_current_user_simple)
):
    """Get calendar summary with counts by type"""
    db = get_db()
    now = datetime.now(timezone.utc)
    today = now.strftime("%Y-%m-%d")
    week_end = (now + timedelta(days=7)).strftime("%Y-%m-%d")
    month_end = (now + timedelta(days=30)).strftime("%Y-%m-%d")
    
    # Get this week's events
    this_week = await get_calendar_events(today, week_end, None, True, True, current_user)
    
    # Count by type
    type_counts = {}
    for event in this_week["events"]:
        event_type = event.get("event_type", "other")
        type_counts[event_type] = type_counts.get(event_type, 0) + 1
    
    # Get overdue tasks
    overdue_tasks = await db.workspace_tasks.count_documents({
        "due_date": {"$lt": today},
        "status": "open"
    })
    
    return {
        "today": len([e for e in this_week["events"] if e.get("start_time", "").startswith(today)]),
        "this_week": len(this_week["events"]),
        "by_type": type_counts,
        "overdue_tasks": overdue_tasks
    }
