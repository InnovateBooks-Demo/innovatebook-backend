"""
INNOVATE BOOKS - ACTIVITY FEED API
Unified activity timeline across all modules
"""

from fastapi import APIRouter, Depends, Query
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import uuid

router = APIRouter(prefix="/api/activity", tags=["activity"])

def get_db():
    from main import db
    return db

async def get_current_user_simple(credentials = Depends(__import__('fastapi.security', fromlist=['HTTPBearer']).HTTPBearer())):
    """Simple auth check"""
    import jwt
    import os
    token = credentials.credentials
    JWT_SECRET = os.environ.get("JWT_SECRET_KEY")
    if not JWT_SECRET:
        raise RuntimeError("JWT_SECRET_KEY is missing in environment")

    payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    return {"user_id": payload.get("user_id") or payload.get("sub"), "org_id": payload.get("org_id", "default"), "full_name": payload.get("full_name", "User")}

@router.get("/feed")
async def get_activity_feed(
    module: Optional[str] = Query(None, description="Filter by module"),
    action: Optional[str] = Query(None, description="Filter by action type"),
    user_id: Optional[str] = Query(None, description="Filter by user"),
    days: int = Query(7, le=30, description="Number of days to look back"),
    limit: int = Query(50, le=200),
    current_user: dict = Depends(get_current_user_simple)
):
    """
    Get unified activity feed across all modules
    """
    db = get_db()
    
    query = {}
    if module:
        query["module"] = module
    if action:
        query["action"] = action
    if user_id:
        query["user_id"] = user_id
    
    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    query["timestamp"] = {"$gte": cutoff}
    
    activities = await db.activity_feed.find(
        query, {"_id": 0}
    ).sort("timestamp", -1).limit(limit).to_list(limit)
    
    return {
        "activities": activities,
        "total": len(activities),
        "filters": {"module": module, "action": action, "user_id": user_id, "days": days}
    }

@router.post("/log")
async def log_activity(
    module: str,
    action: str,
    entity_type: str,
    entity_id: str,
    entity_name: Optional[str] = None,
    description: Optional[str] = None,
    metadata: Optional[dict] = None,
    current_user: dict = Depends(get_current_user_simple)
):
    """
    Log an activity to the unified feed
    """
    db = get_db()
    
    activity = {
        "activity_id": f"ACT-{uuid.uuid4().hex[:8].upper()}",
        "module": module,
        "action": action,
        "entity_type": entity_type,
        "entity_id": entity_id,
        "entity_name": entity_name,
        "description": description or f"{action.replace('_', ' ').title()} {entity_type}",
        "user_id": current_user.get("user_id"),
        "user_name": current_user.get("full_name", "User"),
        "org_id": current_user.get("org_id"),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "metadata": metadata or {}
    }
    
    await db.activity_feed.insert_one(activity)
    
    return {"success": True, "activity_id": activity["activity_id"]}

@router.get("/stats")
async def get_activity_stats(
    days: int = Query(7, le=30),
    current_user: dict = Depends(get_current_user_simple)
):
    """
    Get activity statistics
    """
    db = get_db()
    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    
    # Total activities
    total = await db.activity_feed.count_documents({"timestamp": {"$gte": cutoff}})
    
    # By module
    module_pipeline = [
        {"$match": {"timestamp": {"$gte": cutoff}}},
        {"$group": {"_id": "$module", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    by_module = await db.activity_feed.aggregate(module_pipeline).to_list(20)
    
    # By action
    action_pipeline = [
        {"$match": {"timestamp": {"$gte": cutoff}}},
        {"$group": {"_id": "$action", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    by_action = await db.activity_feed.aggregate(action_pipeline).to_list(20)
    
    # By user
    user_pipeline = [
        {"$match": {"timestamp": {"$gte": cutoff}}},
        {"$group": {"_id": {"user_id": "$user_id", "user_name": "$user_name"}, "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]
    by_user = await db.activity_feed.aggregate(user_pipeline).to_list(10)
    
    # Daily breakdown
    daily_pipeline = [
        {"$match": {"timestamp": {"$gte": cutoff}}},
        {"$addFields": {"date": {"$substr": ["$timestamp", 0, 10]}}},
        {"$group": {"_id": "$date", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ]
    daily = await db.activity_feed.aggregate(daily_pipeline).to_list(30)
    
    return {
        "total": total,
        "period_days": days,
        "by_module": {r["_id"]: r["count"] for r in by_module},
        "by_action": {r["_id"]: r["count"] for r in by_action},
        "top_users": [{"user_id": r["_id"]["user_id"], "user_name": r["_id"]["user_name"], "count": r["count"]} for r in by_user],
        "daily": [{"date": r["_id"], "count": r["count"]} for r in daily]
    }

@router.get("/entity/{entity_type}/{entity_id}")
async def get_entity_activity(
    entity_type: str,
    entity_id: str,
    limit: int = Query(50, le=200),
    current_user: dict = Depends(get_current_user_simple)
):
    """
    Get all activity for a specific entity
    """
    db = get_db()
    
    activities = await db.activity_feed.find(
        {"entity_type": entity_type, "entity_id": entity_id},
        {"_id": 0}
    ).sort("timestamp", -1).limit(limit).to_list(limit)
    
    return {
        "entity_type": entity_type,
        "entity_id": entity_id,
        "activities": activities,
        "total": len(activities)
    }

@router.post("/seed")
async def seed_activity_data(current_user: dict = Depends(get_current_user_simple)):
    """Seed sample activity data for demo"""
    db = get_db()
    
    sample_activities = [
        {"module": "Commerce", "action": "created", "entity_type": "lead", "entity_id": "LEAD-001", "entity_name": "TechCorp Solutions", "description": "Created new lead"},
        {"module": "Commerce", "action": "updated", "entity_type": "lead", "entity_id": "LEAD-001", "entity_name": "TechCorp Solutions", "description": "Updated lead status to Qualified"},
        {"module": "Commerce", "action": "converted", "entity_type": "lead", "entity_id": "LEAD-001", "entity_name": "TechCorp Solutions", "description": "Converted lead to customer"},
        {"module": "Finance", "action": "created", "entity_type": "invoice", "entity_id": "INV-001", "entity_name": "INV-2024-001", "description": "Created invoice for ₹2,50,000"},
        {"module": "Finance", "action": "sent", "entity_type": "invoice", "entity_id": "INV-001", "entity_name": "INV-2024-001", "description": "Sent invoice to customer"},
        {"module": "Finance", "action": "payment_received", "entity_type": "invoice", "entity_id": "INV-001", "entity_name": "INV-2024-001", "description": "Payment received"},
        {"module": "Operations", "action": "created", "entity_type": "project", "entity_id": "PRJ-001", "entity_name": "Website Redesign", "description": "Created new project"},
        {"module": "Operations", "action": "milestone_completed", "entity_type": "project", "entity_id": "PRJ-001", "entity_name": "Website Redesign", "description": "Completed milestone: Design Phase"},
        {"module": "Workforce", "action": "created", "entity_type": "person", "entity_id": "EMP-001", "entity_name": "Rahul Sharma", "description": "Added new employee"},
        {"module": "Workforce", "action": "assigned", "entity_type": "person", "entity_id": "EMP-001", "entity_name": "Rahul Sharma", "description": "Assigned to Project Phoenix"},
        {"module": "Workspace", "action": "completed", "entity_type": "task", "entity_id": "TSK-001", "entity_name": "Review contracts", "description": "Completed task"},
        {"module": "Workspace", "action": "approved", "entity_type": "approval", "entity_id": "APR-001", "entity_name": "Budget approval", "description": "Approved budget request"},
        {"module": "Intelligence", "action": "detected", "entity_type": "signal", "entity_id": "SIG-001", "entity_name": "Cash flow warning", "description": "System detected cash flow anomaly"},
        {"module": "Intelligence", "action": "generated", "entity_type": "recommendation", "entity_id": "REC-001", "entity_name": "Revenue optimization", "description": "AI generated recommendation"},
    ]
    
    import random
    now = datetime.now(timezone.utc)
    
    for i, act in enumerate(sample_activities):
        act["activity_id"] = f"ACT-{uuid.uuid4().hex[:8].upper()}"
        act["user_id"] = current_user.get("user_id")
        act["user_name"] = current_user.get("full_name", "Demo User")
        act["org_id"] = current_user.get("org_id")
        act["timestamp"] = (now - timedelta(hours=random.randint(1, 168))).isoformat()
        act["metadata"] = {}
    
    await db.activity_feed.delete_many({"org_id": current_user.get("org_id")})
    await db.activity_feed.insert_many(sample_activities)
    
    return {"success": True, "seeded": len(sample_activities)}
