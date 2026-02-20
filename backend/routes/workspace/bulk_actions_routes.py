"""
INNOVATE BOOKS - BULK ACTIONS API
Mass operations across all modules
"""

from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Optional, List
from datetime import datetime, timezone
from pydantic import BaseModel
import csv
import io

router = APIRouter(prefix="/api/bulk", tags=["bulk"])

def get_db():
    from server import db
    return db

async def get_current_user_simple(credentials = Depends(__import__('fastapi.security', fromlist=['HTTPBearer']).HTTPBearer())):
    import jwt
    import os
    token = credentials.credentials
    JWT_SECRET = os.environ.get("JWT_SECRET_KEY")
    if not JWT_SECRET:
        raise RuntimeError("JWT_SECRET_KEY is missing in environment")

    payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    return {"user_id": payload.get("user_id") or payload.get("sub"), "org_id": payload.get("org_id", "default")}

class BulkUpdateRequest(BaseModel):
    entity_type: str
    entity_ids: List[str]
    updates: dict

class BulkDeleteRequest(BaseModel):
    entity_type: str
    entity_ids: List[str]

class BulkAssignRequest(BaseModel):
    entity_type: str
    entity_ids: List[str]
    assignee_id: str
    assignee_name: Optional[str] = None

# Entity type to collection mapping
ENTITY_COLLECTIONS = {
    "lead": "leads",
    "customer": "customers",
    "vendor": "vendors",
    "invoice": "invoices",
    "bill": "bills",
    "project": "ops_projects",
    "task": "workspace_tasks",
    "person": "wf_people",
    "signal": "intel_signals",
    "contract": "contracts"
}

ENTITY_ID_FIELD = {
    "lead": "lead_id",
    "customer": "customer_id",
    "vendor": "vendor_id",
    "invoice": "invoice_id",
    "bill": "bill_id",
    "project": "project_id",
    "task": "task_id",
    "person": "person_id",
    "signal": "signal_id",
    "contract": "contract_id"
}

@router.post("/update")
async def bulk_update(
    request: BulkUpdateRequest,
    current_user: dict = Depends(get_current_user_simple)
):
    """
    Bulk update multiple entities
    """
    db = get_db()
    
    if request.entity_type not in ENTITY_COLLECTIONS:
        raise HTTPException(status_code=400, detail=f"Invalid entity type: {request.entity_type}")
    
    collection = ENTITY_COLLECTIONS[request.entity_type]
    id_field = ENTITY_ID_FIELD[request.entity_type]
    
    # Add audit fields
    updates = {**request.updates}
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    updates["updated_by"] = current_user.get("user_id")
    
    result = await db[collection].update_many(
        {id_field: {"$in": request.entity_ids}},
        {"$set": updates}
    )
    
    return {
        "success": True,
        "matched": result.matched_count,
        "modified": result.modified_count
    }

@router.post("/delete")
async def bulk_delete(
    request: BulkDeleteRequest,
    current_user: dict = Depends(get_current_user_simple)
):
    """
    Bulk delete multiple entities (soft delete by default)
    """
    db = get_db()
    
    if request.entity_type not in ENTITY_COLLECTIONS:
        raise HTTPException(status_code=400, detail=f"Invalid entity type: {request.entity_type}")
    
    collection = ENTITY_COLLECTIONS[request.entity_type]
    id_field = ENTITY_ID_FIELD[request.entity_type]
    
    # Soft delete - mark as deleted
    result = await db[collection].update_many(
        {id_field: {"$in": request.entity_ids}},
        {"$set": {
            "deleted": True,
            "deleted_at": datetime.now(timezone.utc).isoformat(),
            "deleted_by": current_user.get("user_id")
        }}
    )
    
    return {
        "success": True,
        "deleted": result.modified_count
    }

@router.post("/assign")
async def bulk_assign(
    request: BulkAssignRequest,
    current_user: dict = Depends(get_current_user_simple)
):
    """
    Bulk assign entities to a user
    """
    db = get_db()
    
    if request.entity_type not in ENTITY_COLLECTIONS:
        raise HTTPException(status_code=400, detail=f"Invalid entity type: {request.entity_type}")
    
    collection = ENTITY_COLLECTIONS[request.entity_type]
    id_field = ENTITY_ID_FIELD[request.entity_type]
    
    # Different fields for different entity types
    assign_field = "assigned_to" if request.entity_type in ["task", "lead"] else "owner_id"
    assign_name_field = "assigned_to_name" if request.entity_type in ["task", "lead"] else "owner_name"
    
    updates = {
        assign_field: request.assignee_id,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    if request.assignee_name:
        updates[assign_name_field] = request.assignee_name
    
    result = await db[collection].update_many(
        {id_field: {"$in": request.entity_ids}},
        {"$set": updates}
    )
    
    return {
        "success": True,
        "assigned": result.modified_count
    }

@router.post("/status")
async def bulk_status_change(
    entity_type: str,
    entity_ids: List[str],
    new_status: str,
    current_user: dict = Depends(get_current_user_simple)
):
    """
    Bulk change status of entities
    """
    db = get_db()
    
    if entity_type not in ENTITY_COLLECTIONS:
        raise HTTPException(status_code=400, detail=f"Invalid entity type: {entity_type}")
    
    collection = ENTITY_COLLECTIONS[entity_type]
    id_field = ENTITY_ID_FIELD[entity_type]
    
    # Different status field names
    status_field = "lead_status" if entity_type == "lead" else "status"
    
    result = await db[collection].update_many(
        {id_field: {"$in": entity_ids}},
        {"$set": {
            status_field: new_status,
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "updated_by": current_user.get("user_id")
        }}
    )
    
    return {
        "success": True,
        "updated": result.modified_count
    }

@router.get("/export/{entity_type}")
async def bulk_export(
    entity_type: str,
    entity_ids: Optional[str] = Query(None, description="Comma-separated IDs"),
    format: str = Query("json", enum=["json", "csv"]),
    current_user: dict = Depends(get_current_user_simple)
):
    """
    Export entities as JSON or CSV
    """
    db = get_db()
    
    if entity_type not in ENTITY_COLLECTIONS:
        raise HTTPException(status_code=400, detail=f"Invalid entity type: {entity_type}")
    
    collection = ENTITY_COLLECTIONS[entity_type]
    id_field = ENTITY_ID_FIELD[entity_type]
    
    query = {}
    if entity_ids:
        ids = entity_ids.split(",")
        query[id_field] = {"$in": ids}
    
    entities = await db[collection].find(query, {"_id": 0}).limit(1000).to_list(1000)
    
    if format == "csv":
        if not entities:
            return {"csv": "", "count": 0}
        
        # Collect all unique fieldnames from all entities
        all_fieldnames = set()
        for entity in entities:
            all_fieldnames.update(entity.keys())
        fieldnames = sorted(list(all_fieldnames))
        
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction='ignore')
        writer.writeheader()
        writer.writerows(entities)
        
        return {
            "format": "csv",
            "data": output.getvalue(),
            "count": len(entities)
        }
    
    return {
        "format": "json",
        "data": entities,
        "count": len(entities)
    }

@router.post("/tag")
async def bulk_add_tags(
    entity_type: str,
    entity_ids: List[str],
    tags: List[str],
    current_user: dict = Depends(get_current_user_simple)
):
    """
    Add tags to multiple entities
    """
    db = get_db()
    
    if entity_type not in ENTITY_COLLECTIONS:
        raise HTTPException(status_code=400, detail=f"Invalid entity type: {entity_type}")
    
    collection = ENTITY_COLLECTIONS[entity_type]
    id_field = ENTITY_ID_FIELD[entity_type]
    
    result = await db[collection].update_many(
        {id_field: {"$in": entity_ids}},
        {
            "$addToSet": {"tags": {"$each": tags}},
            "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
        }
    )
    
    return {
        "success": True,
        "tagged": result.modified_count
    }

@router.delete("/tag")
async def bulk_remove_tags(
    entity_type: str,
    entity_ids: List[str],
    tags: List[str],
    current_user: dict = Depends(get_current_user_simple)
):
    """
    Remove tags from multiple entities
    """
    db = get_db()
    
    if entity_type not in ENTITY_COLLECTIONS:
        raise HTTPException(status_code=400, detail=f"Invalid entity type: {entity_type}")
    
    collection = ENTITY_COLLECTIONS[entity_type]
    id_field = ENTITY_ID_FIELD[entity_type]
    
    result = await db[collection].update_many(
        {id_field: {"$in": entity_ids}},
        {
            "$pullAll": {"tags": tags},
            "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
        }
    )
    
    return {
        "success": True,
        "untagged": result.modified_count
    }

@router.get("/count/{entity_type}")
async def get_bulk_count(
    entity_type: str,
    filter_status: Optional[str] = None,
    current_user: dict = Depends(get_current_user_simple)
):
    """
    Get count of entities for bulk operations preview
    """
    db = get_db()
    
    if entity_type not in ENTITY_COLLECTIONS:
        raise HTTPException(status_code=400, detail=f"Invalid entity type: {entity_type}")
    
    collection = ENTITY_COLLECTIONS[entity_type]
    
    query = {"deleted": {"$ne": True}}
    if filter_status:
        status_field = "lead_status" if entity_type == "lead" else "status"
        query[status_field] = filter_status
    
    count = await db[collection].count_documents(query)
    
    return {"entity_type": entity_type, "count": count, "filter": filter_status}
