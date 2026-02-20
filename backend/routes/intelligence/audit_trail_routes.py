"""
INNOVATE BOOKS - AUDIT TRAIL API
Complete change history tracking for all entities
"""

from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Optional, List, Any
from datetime import datetime, timezone, timedelta
import uuid
import json

router = APIRouter(prefix="/api/audit", tags=["audit"])

def get_db():
    from app_state import db
    return db

async def get_current_user_simple(credentials = Depends(__import__('fastapi.security', fromlist=['HTTPBearer']).HTTPBearer())):
    import jwt
    import os
    token = credentials.credentials
    JWT_SECRET = os.environ.get("JWT_SECRET_KEY")
    if not JWT_SECRET:
        raise RuntimeError("JWT_SECRET_KEY is missing in environment")

    payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    return {"user_id": payload.get("user_id") or payload.get("sub"), "org_id": payload.get("org_id", "default"), "full_name": payload.get("full_name", "User")}

def generate_id(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:8].upper()}"

# Helper to compute diff between two objects
def compute_diff(old_data: dict, new_data: dict) -> List[dict]:
    """Compute differences between two objects"""
    changes = []
    
    # Get all keys
    all_keys = set(old_data.keys()) | set(new_data.keys())
    
    for key in all_keys:
        if key.startswith("_"):  # Skip internal fields
            continue
        
        old_val = old_data.get(key)
        new_val = new_data.get(key)
        
        if old_val != new_val:
            changes.append({
                "field": key,
                "old_value": old_val,
                "new_value": new_val
            })
    
    return changes

@router.post("/log")
async def log_audit_entry(
    entity_type: str,
    entity_id: str,
    action: str,
    changes: Optional[List[dict]] = None,
    old_data: Optional[dict] = None,
    new_data: Optional[dict] = None,
    metadata: Optional[dict] = None,
    current_user: dict = Depends(get_current_user_simple)
):
    """
    Log an audit entry for any entity change
    action: created, updated, deleted, viewed, exported, approved, rejected
    """
    db = get_db()
    
    # Auto-compute changes if old and new data provided
    if old_data and new_data and not changes:
        changes = compute_diff(old_data, new_data)
    
    audit_entry = {
        "audit_id": generate_id("AUD"),
        "org_id": current_user.get("org_id"),
        "entity_type": entity_type,
        "entity_id": entity_id,
        "action": action,
        "changes": changes or [],
        "user_id": current_user.get("user_id"),
        "user_name": current_user.get("full_name"),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "ip_address": metadata.get("ip_address") if metadata else None,
        "user_agent": metadata.get("user_agent") if metadata else None,
        "metadata": metadata or {}
    }
    
    await db.audit_trail.insert_one(audit_entry)
    audit_entry.pop("_id", None)
    
    return {"success": True, "audit_id": audit_entry["audit_id"]}

@router.get("/entity/{entity_type}/{entity_id}")
async def get_entity_audit_trail(
    entity_type: str,
    entity_id: str,
    limit: int = Query(100, le=500),
    current_user: dict = Depends(get_current_user_simple)
):
    """Get complete audit trail for a specific entity"""
    db = get_db()
    
    entries = await db.audit_trail.find(
        {"entity_type": entity_type, "entity_id": entity_id},
        {"_id": 0}
    ).sort("timestamp", -1).limit(limit).to_list(limit)
    
    return {
        "entity_type": entity_type,
        "entity_id": entity_id,
        "entries": entries,
        "total": len(entries)
    }

@router.get("/user/{user_id}")
async def get_user_audit_trail(
    user_id: str,
    days: int = Query(30, le=90),
    limit: int = Query(200, le=1000),
    current_user: dict = Depends(get_current_user_simple)
):
    """Get all actions performed by a specific user"""
    db = get_db()
    
    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    
    entries = await db.audit_trail.find(
        {
            "user_id": user_id,
            "timestamp": {"$gte": cutoff}
        },
        {"_id": 0}
    ).sort("timestamp", -1).limit(limit).to_list(limit)
    
    return {
        "user_id": user_id,
        "entries": entries,
        "total": len(entries),
        "days": days
    }

@router.get("/recent")
async def get_recent_changes(
    entity_type: Optional[str] = None,
    action: Optional[str] = None,
    hours: int = Query(24, le=168),
    limit: int = Query(100, le=500),
    current_user: dict = Depends(get_current_user_simple)
):
    """Get recent changes across the system"""
    db = get_db()
    
    cutoff = (datetime.now(timezone.utc) - timedelta(hours=hours)).isoformat()
    
    query = {
        "org_id": current_user.get("org_id"),
        "timestamp": {"$gte": cutoff}
    }
    if entity_type:
        query["entity_type"] = entity_type
    if action:
        query["action"] = action
    
    entries = await db.audit_trail.find(query, {"_id": 0}).sort("timestamp", -1).limit(limit).to_list(limit)
    
    return {
        "entries": entries,
        "total": len(entries),
        "hours": hours
    }

@router.get("/stats")
async def get_audit_stats(
    days: int = Query(30, le=90),
    current_user: dict = Depends(get_current_user_simple)
):
    """Get audit statistics"""
    db = get_db()
    
    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    base_query = {"org_id": current_user.get("org_id"), "timestamp": {"$gte": cutoff}}
    
    # Total entries
    total = await db.audit_trail.count_documents(base_query)
    
    # By action
    action_pipeline = [
        {"$match": base_query},
        {"$group": {"_id": "$action", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    by_action = await db.audit_trail.aggregate(action_pipeline).to_list(20)
    
    # By entity type
    entity_pipeline = [
        {"$match": base_query},
        {"$group": {"_id": "$entity_type", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    by_entity = await db.audit_trail.aggregate(entity_pipeline).to_list(20)
    
    # By user
    user_pipeline = [
        {"$match": base_query},
        {"$group": {"_id": {"user_id": "$user_id", "user_name": "$user_name"}, "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]
    by_user = await db.audit_trail.aggregate(user_pipeline).to_list(10)
    
    # Daily trend
    daily_pipeline = [
        {"$match": base_query},
        {"$addFields": {"date": {"$substr": ["$timestamp", 0, 10]}}},
        {"$group": {"_id": "$date", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ]
    daily = await db.audit_trail.aggregate(daily_pipeline).to_list(90)
    
    return {
        "total": total,
        "days": days,
        "by_action": {r["_id"]: r["count"] for r in by_action},
        "by_entity_type": {r["_id"]: r["count"] for r in by_entity},
        "top_users": [{"user_id": r["_id"]["user_id"], "user_name": r["_id"]["user_name"], "count": r["count"]} for r in by_user],
        "daily_trend": [{"date": r["_id"], "count": r["count"]} for r in daily]
    }

@router.get("/field-history/{entity_type}/{entity_id}/{field_name}")
async def get_field_history(
    entity_type: str,
    entity_id: str,
    field_name: str,
    current_user: dict = Depends(get_current_user_simple)
):
    """Get the change history for a specific field"""
    db = get_db()
    
    entries = await db.audit_trail.find(
        {
            "entity_type": entity_type,
            "entity_id": entity_id,
            "changes.field": field_name
        },
        {"_id": 0}
    ).sort("timestamp", -1).to_list(100)
    
    # Extract field changes
    history = []
    for entry in entries:
        for change in entry.get("changes", []):
            if change.get("field") == field_name:
                history.append({
                    "timestamp": entry.get("timestamp"),
                    "user_name": entry.get("user_name"),
                    "old_value": change.get("old_value"),
                    "new_value": change.get("new_value")
                })
    
    return {
        "entity_type": entity_type,
        "entity_id": entity_id,
        "field": field_name,
        "history": history
    }

@router.post("/compare")
async def compare_versions(
    entity_type: str,
    entity_id: str,
    timestamp1: str,
    timestamp2: str,
    current_user: dict = Depends(get_current_user_simple)
):
    """Compare entity state at two different timestamps"""
    db = get_db()
    
    # Get all changes between the two timestamps
    entries = await db.audit_trail.find({
        "entity_type": entity_type,
        "entity_id": entity_id,
        "timestamp": {"$gt": timestamp1, "$lte": timestamp2}
    }, {"_id": 0}).sort("timestamp", 1).to_list(1000)
    
    # Aggregate all changes
    all_changes = {}
    for entry in entries:
        for change in entry.get("changes", []):
            field = change.get("field")
            if field not in all_changes:
                all_changes[field] = {
                    "field": field,
                    "old_value": change.get("old_value"),
                    "new_value": change.get("new_value"),
                    "change_count": 1
                }
            else:
                all_changes[field]["new_value"] = change.get("new_value")
                all_changes[field]["change_count"] += 1
    
    return {
        "entity_type": entity_type,
        "entity_id": entity_id,
        "from_timestamp": timestamp1,
        "to_timestamp": timestamp2,
        "changes": list(all_changes.values()),
        "entries_count": len(entries)
    }
