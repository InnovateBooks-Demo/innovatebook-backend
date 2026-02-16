"""
IB Commerce - API Routes for all 12 modules (ENTERPRISE EDITION)
Complete REST API endpoints with CRUD operations + Multi-tenant support
"""

from fastapi import APIRouter, HTTPException, Depends, Query, BackgroundTasks
from typing import List, Optional
from datetime import datetime, timezone
from commerce_models import *
import uuid
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
from auto_sop_workflow import run_complete_sop_workflow

# Import enterprise middleware
from enterprise_middleware import (
    subscription_guard,
    require_active_subscription,
    require_permission,
    get_org_scope
)

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create router
commerce_router = APIRouter(prefix="/commerce", tags=["IB Commerce"])


def get_db():
    """Database dependency"""
    return db


# ==================== HELPER FUNCTIONS ====================

def generate_sequential_id(prefix: str, count: int) -> str:
    """Generate sequential IDs like LEAD-2025-001"""
    year = datetime.now().year
    return f"{prefix}-{year}-{str(count + 1).zfill(3)}"


# # ==================== MODULE 1: LEAD ROUTES ====================

# @commerce_router.post("/leads", response_model=Lead, dependencies=[Depends(require_active_subscription), Depends(require_permission("leads", "create"))])
# async def create_lead(
#     lead_data: LeadCreate, 
#     background_tasks: BackgroundTasks,
#     token_payload: dict = Depends(validate_tenant),
#     org_id: Optional[str] = Depends(get_org_scope),
#     db=Depends(get_db)
# ):
#     """Create a new lead with automatic background enrichment (org-scoped, requires active subscription)"""
#     try:
#         # Get count for sequential ID (org-scoped)
#         query = {"org_id": org_id} if org_id else {}
#         count = await db.commerce_leads.count_documents(query)
#         user_id = token_payload.get("user_id")
        
#         # Create lead object
#         lead = Lead(
#             **lead_data.dict(),
#             lead_id=generate_sequential_id("REV-LEAD", count),
#             owner_id=user_id,              # ✅ FIX
#             captured_by=user_id,            # optional but good
#             org_id=org_id,
#             sop_run_ids=[str(uuid.uuid4())]
#         )
#         # lead = Lead(
#         #     **lead_data.dict(),
#         #     lead_id=generate_sequential_id("LEAD", count),
#         #     captured_by="current_user_id",  # TODO: Get from auth
#         #     org_id=org_id,  # Add org_id
#         #     sop_run_ids=[str(uuid.uuid4())]
#         # )
        
#         # Insert to DB
#         lead_dict = lead.dict()
#         await db.commerce_leads.insert_one(lead_dict)
        
#         # ✨ IMMEDIATELY set status to "Enriching" (before background task)
#         await db.commerce_leads.update_one(
#             {"lead_id": lead.lead_id},
#             {
#                 "$set": {
#                     "lead_status": "Enriching",
#                     "enrichment_status": "In Progress",
#                     "current_sop_stage": "Lead_Enrich_SOP",
#                     "updated_at": datetime.now(timezone.utc)
#                 }
#             }
#         )
        
#         # ✨ TRIGGER COMPLETE AUTOMATIC SOP WORKFLOW
#         # This will run ALL stages automatically: Enrich → Validate → Qualify → Score → Assign
#         print(f"🚀 Lead {lead.lead_id} created, scheduling COMPLETE automatic SOP workflow...")
#         background_tasks.add_task(
#             run_complete_sop_workflow,
#             lead.lead_id,
#             lead_data.dict(),
#             db
#         )
        
#         # Return updated lead
#         updated_lead = await db.commerce_leads.find_one({"lead_id": lead.lead_id})
#         return Lead(**updated_lead)
        
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Failed to create lead: {str(e)}")


# @commerce_router.get("/leads", response_model=List[Lead])
# async def get_leads(
#     skip: int = Query(0, ge=0),
#     limit: int = Query(50, ge=1, le=100),
#     status: Optional[LeadStatus] = None,
#     db=Depends(get_db)
# ):
#     """Get all leads with pagination and filters"""
#     try:
#         query = {}
#         if status:
#             query["lead_status"] = status.value
        
#         cursor = db.commerce_leads.find(query).skip(skip).limit(limit).sort("created_at", -1)
#         leads = await cursor.to_list(length=limit)
        
#         return [Lead(**lead) for lead in leads]
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Failed to fetch leads: {str(e)}")


# @commerce_router.get("/leads/{lead_id}", response_model=Lead)
# async def get_lead(lead_id: str, db=Depends(get_db)):
#     """Get a specific lead by ID"""
#     try:
#         lead = await db.commerce_leads.find_one({"lead_id": lead_id})
#         if not lead:
#             raise HTTPException(status_code=404, detail="Lead not found")
#         return Lead(**lead)
#     except HTTPException:
#         raise
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Failed to fetch lead: {str(e)}")


# @commerce_router.put("/leads/{lead_id}", response_model=Lead)
# async def update_lead(lead_id: str, lead_data: LeadCreate, db=Depends(get_db)):
#     """Update a lead"""
#     try:
#         existing_lead = await db.commerce_leads.find_one({"lead_id": lead_id})
#         if not existing_lead:
#             raise HTTPException(status_code=404, detail="Lead not found")
        
#         updated_data = lead_data.dict()
#         updated_data["updated_at"] = datetime.now(timezone.utc)
        
#         await db.commerce_leads.update_one(
#             {"lead_id": lead_id},
#             {"$set": updated_data}
#         )
        
#         updated_lead = await db.commerce_leads.find_one({"lead_id": lead_id})
#         return Lead(**updated_lead)
#     except HTTPException:
#         raise
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Failed to update lead: {str(e)}")


# @commerce_router.delete("/leads/{lead_id}")
# async def delete_lead(lead_id: str, db=Depends(get_db)):
#     """Delete a lead"""
#     try:
#         result = await db.commerce_leads.delete_one({"lead_id": lead_id})
#         if result.deleted_count == 0:
#             raise HTTPException(status_code=404, detail="Lead not found")
#         return {"message": "Lead deleted successfully"}
#     except HTTPException:
#         raise
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Failed to delete lead: {str(e)}")


# @commerce_router.patch("/leads/{lead_id}/status")
# async def update_lead_status(lead_id: str, status: LeadStatus, db=Depends(get_db)):
#     """Update lead status (workflow transition)"""
#     try:
#         result = await db.commerce_leads.update_one(
#             {"lead_id": lead_id},
#             {
#                 "$set": {
#                     "lead_status": status.value,
#                     "updated_at": datetime.now(timezone.utc)
#                 }
#             }
#         )
#         if result.modified_count == 0:
#             raise HTTPException(status_code=404, detail="Lead not found")
        
#         updated_lead = await db.commerce_leads.find_one({"lead_id": lead_id})
#         return Lead(**updated_lead)
#     except HTTPException:
#         raise
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Failed to update status: {str(e)}")


from typing import Any, Dict, List, Optional
from fastapi import BackgroundTasks, Depends, HTTPException, Query, status
from datetime import datetime, timezone
import uuid

# ==================== MODULE 1: LEAD ROUTES ====================

@commerce_router.post(
    "/leads",
    response_model=Lead,
    dependencies=[Depends(require_active_subscription), Depends(require_permission("leads", "create"))],
)
async def create_lead(
    lead_data: LeadCreate,
    background_tasks: BackgroundTasks,
    token_payload: dict = Depends(validate_tenant),
    org_id: Optional[str] = Depends(get_org_scope),
    db=Depends(get_db),
):
    """Create a new lead with automatic background enrichment (org-scoped, requires active subscription)"""
    try:
        # ✅ Org scoped count
        query = {"org_id": org_id} if org_id else {}
        count = await db.commerce_leads.count_documents(query)

        user_id = token_payload.get("user_id")

        lead = Lead(
            **lead_data.dict(),
            lead_id=generate_sequential_id("REV-LEAD", count),
            owner_id=user_id,       # ✅ FIX
            captured_by=user_id,    # ✅ FIX
            org_id=org_id,
            sop_run_ids=[str(uuid.uuid4())],
        )

        lead_dict = lead.dict()
        await db.commerce_leads.insert_one(lead_dict)

        # ✨ Immediately set enrichment status
        await db.commerce_leads.update_one(
            {"lead_id": lead.lead_id},
            {
                "$set": {
                    "lead_status": "Enriching",
                    "enrichment_status": "In Progress",
                    "current_sop_stage": "Lead_Enrich_SOP",
                    "updated_at": datetime.now(timezone.utc),
                }
            },
        )

        # ✨ Trigger SOP workflow
        background_tasks.add_task(
            run_complete_sop_workflow,
            lead.lead_id,
            lead_data.dict(),
            db,
        )

        updated_lead = await db.commerce_leads.find_one({"lead_id": lead.lead_id})
        return Lead(**updated_lead)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create lead: {str(e)}")


# @commerce_router.get("/leads")
# async def get_leads(
#     skip: int = Query(0, ge=0),
#     limit: int = Query(50, ge=1, le=100),
#     status_filter: Optional[LeadStatus] = None,
#     org_id: Optional[str] = Depends(get_org_scope),
#     db=Depends(get_db),
# ):
#     """
#     Get all leads (org-scoped) with pagination and filters.
#     ✅ Adds owner_name by resolving owner_id -> users collection.
#     """
#     try:
#         # ✅ org scoped query
#         query: Dict[str, Any] = {"org_id": org_id} if org_id else {}

#         if status_filter:
#             query["lead_status"] = status_filter.value

#         cursor = (
#             db.commerce_leads.find(query)
#             .skip(skip)
#             .limit(limit)
#             .sort("created_at", -1)
#         )

#         leads = await cursor.to_list(length=limit)

#         # ✅ Resolve owner_id -> owner_name
#         owner_ids = list({l.get("owner_id") for l in leads if l.get("owner_id")})

#         if owner_ids:
#             # If your users are in enterprise_users, change db.users ->A:
#             # users = await db.enterprise_users.find(...)
#             users = await db.users.find(
#                 {"user_id": {"$in": owner_ids}},
#                 {"_id": 0, "user_id": 1, "first_name": 1, "last_name": 1, "full_name": 1, "email": 1},
#             ).to_list(None)

#             user_map = {}
#             for u in users:
#                 full = (u.get("full_name") or "").strip()
#                 if not full:
#                     full = f'{u.get("first_name","")} {u.get("last_name","")}'.strip()
#                 if not full:
#                     full = (u.get("email") or "—").strip()
#                 user_map[u["user_id"]] = full

#             for lead in leads:
#                 lead["owner_name"] = user_map.get(lead.get("owner_id"), "—")
#         else:
#             for lead in leads:
#                 lead["owner_name"] = "—"

#         # ✅ return raw dicts so owner_name is included
#         return {"success": True, "leads": leads, "count": len(leads)}

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Failed to fetch leads: {str(e)}")
@commerce_router.get("/leads")
async def get_leads(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[LeadStatus] = None,
    org_id: Optional[str] = Depends(get_org_scope),
    db=Depends(get_db)
):
    try:
        query: Dict[str, Any] = {"org_id": org_id} if org_id else {}

        if status:
            query["lead_status"] = status.value

        cursor = (
            db.commerce_leads.find(query)
            .skip(skip)
            .limit(limit)
            .sort("created_at", -1)
        )

        leads = await cursor.to_list(length=limit)

        # collect owner_ids
        owner_ids = list({l.get("owner_id") for l in leads if l.get("owner_id")})

        # default value
        for lead in leads:
            lead["owner_name"] = "—"

        if owner_ids:
            # 1) ensure these users exist in this org (enterprise_users)
            ent_users = await db.enterprise_users.find(
                {"user_id": {"$in": owner_ids}, "org_id": org_id},
                {"_id": 0, "user_id": 1},
            ).to_list(None)

            ent_user_ids = [u["user_id"] for u in ent_users]

            if ent_user_ids:
                # 2) fetch actual names from users
                users = await db.users.find(
                    {"user_id": {"$in": ent_user_ids}},
                    {"_id": 0, "user_id": 1, "first_name": 1, "last_name": 1, "email": 1},
                ).to_list(None)

                user_map = {}
                for u in users:
                    name = f'{u.get("first_name","")} {u.get("last_name","")}'.strip()
                    if not name:
                        name = (u.get("email") or "—").strip()
                    user_map[u["user_id"]] = name

                for lead in leads:
                    lead["owner_name"] = user_map.get(lead.get("owner_id"), "—")

        return {"success": True, "leads": leads, "count": len(leads)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch leads: {str(e)}")

@commerce_router.get("/leads/{lead_id}", response_model=Lead)
async def get_lead(lead_id: str, db=Depends(get_db)):
    """Get a specific lead by ID"""
    try:
        lead = await db.commerce_leads.find_one({"lead_id": lead_id})
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        return Lead(**lead)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch lead: {str(e)}")


@commerce_router.put("/leads/{lead_id}", response_model=Lead)
async def update_lead(lead_id: str, lead_data: LeadCreate, db=Depends(get_db)):
    """Update a lead"""
    try:
        existing_lead = await db.commerce_leads.find_one({"lead_id": lead_id})
        if not existing_lead:
            raise HTTPException(status_code=404, detail="Lead not found")

        updated_data = lead_data.dict()
        updated_data["updated_at"] = datetime.now(timezone.utc)

        await db.commerce_leads.update_one({"lead_id": lead_id}, {"$set": updated_data})

        updated_lead = await db.commerce_leads.find_one({"lead_id": lead_id})
        return Lead(**updated_lead)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update lead: {str(e)}")


@commerce_router.delete("/leads/{lead_id}")
async def delete_lead(lead_id: str, db=Depends(get_db)):
    """Delete a lead"""
    try:
        result = await db.commerce_leads.delete_one({"lead_id": lead_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Lead not found")
        return {"message": "Lead deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete lead: {str(e)}")


@commerce_router.patch("/leads/{lead_id}/status")
async def update_lead_status(lead_id: str, status: LeadStatus, db=Depends(get_db)):
    """Update lead status (workflow transition)"""
    try:
        result = await db.commerce_leads.update_one(
            {"lead_id": lead_id},
            {"$set": {"lead_status": status.value, "updated_at": datetime.now(timezone.utc)}},
        )
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Lead not found")

        updated_lead = await db.commerce_leads.find_one({"lead_id": lead_id})
        return Lead(**updated_lead)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update status: {str(e)}")


# ==================== MODULE 2: EVALUATE ROUTES ====================

@commerce_router.post("/evaluate", response_model=Evaluate)
async def create_evaluation(eval_data: EvaluateCreate, db=Depends(get_db)):
    """Create a new evaluation"""
    try:
        count = await db.commerce_evaluate.count_documents({})
        
        evaluation = Evaluate(
            **eval_data.dict(),
            evaluation_id=generate_sequential_id("EVAL", count),
            initiated_by="current_user_id"
        )
        
        # Calculate margin
        if evaluation.estimated_revenue > 0:
            evaluation.gross_margin_percent = (
                (evaluation.estimated_revenue - evaluation.estimated_cost) / 
                evaluation.estimated_revenue
            ) * 100
        
        eval_dict = evaluation.dict()
        # Convert date objects to ISO format strings for MongoDB
        if 'expected_close_date' in eval_dict and eval_dict['expected_close_date']:
            eval_dict['expected_close_date'] = eval_dict['expected_close_date'].isoformat()
        await db.commerce_evaluate.insert_one(eval_dict)
        
        return evaluation
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create evaluation: {str(e)}")


@commerce_router.get("/evaluate", response_model=List[Evaluate])
async def get_evaluations(
    skip: int = 0,
    limit: int = 50,
    status: Optional[EvaluationStatus] = None,
    db=Depends(get_db)
):
    """Get all evaluations"""
    try:
        query = {}
        if status:
            query["evaluation_status"] = status.value
        
        cursor = db.commerce_evaluate.find(query).skip(skip).limit(limit).sort("created_at", -1)
        evaluations = await cursor.to_list(length=limit)
        
        return [Evaluate(**e) for e in evaluations]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch evaluations: {str(e)}")


@commerce_router.get("/evaluate/{evaluation_id}", response_model=Evaluate)
async def get_evaluation(evaluation_id: str, db=Depends(get_db)):
    """Get a specific evaluation"""
    try:
        evaluation = await db.commerce_evaluate.find_one({"evaluation_id": evaluation_id})
        if not evaluation:
            raise HTTPException(status_code=404, detail="Evaluation not found")
        return Evaluate(**evaluation)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch evaluation: {str(e)}")


@commerce_router.put("/evaluate/{evaluation_id}", response_model=Evaluate)
async def update_evaluation(evaluation_id: str, eval_data: EvaluateCreate, db=Depends(get_db)):
    """Update an evaluation"""
    try:
        existing_eval = await db.commerce_evaluate.find_one({"evaluation_id": evaluation_id})
        if not existing_eval:
            raise HTTPException(status_code=404, detail="Evaluation not found")
        
        updated_data = eval_data.dict()
        updated_data["updated_at"] = datetime.now(timezone.utc)
        
        # Convert date objects to ISO format strings for MongoDB
        if 'expected_close_date' in updated_data and updated_data['expected_close_date']:
            updated_data['expected_close_date'] = updated_data['expected_close_date'].isoformat()
        
        # Recalculate margin
        if updated_data.get("expected_deal_value", 0) > 0:
            estimated_cost = updated_data.get("estimated_cost", 0)
            estimated_revenue = updated_data.get("expected_deal_value", 0)
            updated_data["gross_margin_percent"] = (
                (estimated_revenue - estimated_cost) / estimated_revenue
            ) * 100
        
        await db.commerce_evaluate.update_one(
            {"evaluation_id": evaluation_id},
            {"$set": updated_data}
        )
        
        updated_eval = await db.commerce_evaluate.find_one({"evaluation_id": evaluation_id})
        return Evaluate(**updated_eval)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update evaluation: {str(e)}")


@commerce_router.delete("/evaluate/{evaluation_id}")
async def delete_evaluation(evaluation_id: str, db=Depends(get_db)):
    """Delete an evaluation"""
    try:
        result = await db.commerce_evaluate.delete_one({"evaluation_id": evaluation_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Evaluation not found")
        return {"message": "Evaluation deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete evaluation: {str(e)}")


@commerce_router.patch("/evaluate/{evaluation_id}/status")
async def update_evaluation_status(evaluation_id: str, status: EvaluationStatus, db=Depends(get_db)):
    """Update evaluation status (workflow transition)"""
    try:
        result = await db.commerce_evaluate.update_one(
            {"evaluation_id": evaluation_id},
            {
                "$set": {
                    "evaluation_status": status.value,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Evaluation not found")
        
        updated_eval = await db.commerce_evaluate.find_one({"evaluation_id": evaluation_id})
        return Evaluate(**updated_eval)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update status: {str(e)}")


# ==================== MODULE 3: COMMIT ROUTES ====================

@commerce_router.post("/commit", response_model=Commit)
async def create_commit(commit_data: CommitCreate, db=Depends(get_db)):
    """Create a new commitment/contract"""
    try:
        count = await db.commerce_commit.count_documents({})
        
        commit = Commit(
            **commit_data.dict(),
            commit_id=generate_sequential_id("COMM", count),
            contract_number=generate_sequential_id("CONT", count),
            created_by="current_user_id"
        )
        
        commit_dict = commit.dict()
        # Convert date objects to ISO format strings for MongoDB
        for date_field in ['effective_date', 'expiry_date', 'created_on', 'created_at', 'updated_at']:
            if date_field in commit_dict and commit_dict[date_field]:
                if hasattr(commit_dict[date_field], 'isoformat'):
                    commit_dict[date_field] = commit_dict[date_field].isoformat()
        await db.commerce_commit.insert_one(commit_dict)
        
        return commit
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create commitment: {str(e)}")


@commerce_router.get("/commit", response_model=List[Commit])
async def get_commits(skip: int = 0, limit: int = 50, status: str = None, db=Depends(get_db)):
    """Get all commitments with optional status filter"""
    try:
        filter_query = {}
        if status:
            filter_query["commitment_status"] = status
            
        cursor = db.commerce_commit.find(filter_query).skip(skip).limit(limit).sort("created_at", -1)
        commits = await cursor.to_list(length=limit)
        return [Commit(**c) for c in commits]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch commitments: {str(e)}")


@commerce_router.get("/commit/{commit_id}", response_model=Commit)
async def get_commit(commit_id: str, db=Depends(get_db)):
    """Get a specific commitment"""
    try:
        commit = await db.commerce_commit.find_one({"commit_id": commit_id})
        if not commit:
            raise HTTPException(status_code=404, detail="Commitment not found")
        return Commit(**commit)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch commitment: {str(e)}")


@commerce_router.put("/commit/{commit_id}", response_model=Commit)
async def update_commit(commit_id: str, commit_data: CommitCreate, db=Depends(get_db)):
    """Update a commitment"""
    try:
        existing_commit = await db.commerce_commit.find_one({"commit_id": commit_id})
        if not existing_commit:
            raise HTTPException(status_code=404, detail="Commitment not found")
        
        updated_data = commit_data.dict()
        updated_data["updated_at"] = datetime.now(timezone.utc)
        
        # Convert date objects to ISO format strings for MongoDB
        for date_field in ['effective_date', 'expiry_date', 'updated_at']:
            if date_field in updated_data and updated_data[date_field]:
                if hasattr(updated_data[date_field], 'isoformat'):
                    updated_data[date_field] = updated_data[date_field].isoformat()
        
        await db.commerce_commit.update_one(
            {"commit_id": commit_id},
            {"$set": updated_data}
        )
        
        updated_commit = await db.commerce_commit.find_one({"commit_id": commit_id})
        return Commit(**updated_commit)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update commitment: {str(e)}")


@commerce_router.delete("/commit/{commit_id}")
async def delete_commit(commit_id: str, db=Depends(get_db)):
    """Delete a commitment"""
    try:
        result = await db.commerce_commit.delete_one({"commit_id": commit_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Commitment not found")
        return {"message": "Commitment deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete commitment: {str(e)}")


@commerce_router.patch("/commit/{commit_id}/status")
async def update_commit_status(commit_id: str, status: CommitStatus, db=Depends(get_db)):
    """Update commitment status (workflow transition)"""
    try:
        result = await db.commerce_commit.update_one(
            {"commit_id": commit_id},
            {
                "$set": {
                    "commit_status": status.value,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Commitment not found")
        
        updated_commit = await db.commerce_commit.find_one({"commit_id": commit_id})
        return Commit(**updated_commit)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update status: {str(e)}")


# ==================== MODULE 4: EXECUTE ROUTES ====================

@commerce_router.post("/execute", response_model=Execute)
async def create_execution(exec_data: ExecuteCreate, db=Depends(get_db)):
    """Create a new execution record"""
    try:
        count = await db.commerce_execute.count_documents({})
        
        execution = Execute(
            **exec_data.dict(),
            execution_id=generate_sequential_id("EXEC", count)
        )
        
        exec_dict = execution.dict()
        await db.commerce_execute.insert_one(exec_dict)
        
        return execution
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create execution: {str(e)}")


@commerce_router.get("/execute")
async def get_executions(skip: int = 0, limit: int = 50, status: str = None, db=Depends(get_db)):
    """Get all executions with optional status filter"""
    try:
        filter_query = {}
        if status:
            filter_query["execution_status"] = status
        
        print(f"DEBUG: Querying with filter: {filter_query}")
        cursor = db.commerce_execute.find(filter_query).skip(skip).limit(limit).sort("created_at", -1)
        executions = await cursor.to_list(length=limit)
        print(f"DEBUG: Found {len(executions)} executions in DB")
        
        # Convert to dict and handle dates manually
        result = []
        for e in executions:
            print(f"DEBUG: Processing {e.get('execution_id')}")
            exec_dict = {
                'id': e.get('id'),
                'execution_id': e.get('execution_id'),
                'commit_id': e.get('commit_id'),
                'order_id': e.get('order_id'),
                'execution_status': e.get('execution_status'),
                'execution_type': e.get('execution_type'),
                'scheduled_date': e.get('scheduled_date').isoformat() if hasattr(e.get('scheduled_date'), 'isoformat') else str(e.get('scheduled_date')),
                'description': e.get('description'),
                'created_at': e.get('created_at').isoformat() if hasattr(e.get('created_at'), 'isoformat') else str(e.get('created_at')),
                'updated_at': e.get('updated_at').isoformat() if hasattr(e.get('updated_at'), 'isoformat') else str(e.get('updated_at'))
            }
            result.append(exec_dict)
        
        print(f"DEBUG: Returning {len(result)} results")
        return result
    except Exception as e:
        print(f"DEBUG: Exception occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch executions: {str(e)}")


@commerce_router.get("/execute/{execution_id}", response_model=Execute)
async def get_execution(execution_id: str, db=Depends(get_db)):
    """Get a specific execution"""
    try:
        execution = await db.commerce_execute.find_one({"execution_id": execution_id})
        if not execution:
            raise HTTPException(status_code=404, detail="Execution not found")
        return Execute(**execution)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch execution: {str(e)}")


@commerce_router.put("/execute/{execution_id}", response_model=Execute)
async def update_execution(execution_id: str, exec_data: ExecuteCreate, db=Depends(get_db)):
    """Update an execution"""
    try:
        existing_exec = await db.commerce_execute.find_one({"execution_id": execution_id})
        if not existing_exec:
            raise HTTPException(status_code=404, detail="Execution not found")
        
        updated_data = exec_data.dict()
        updated_data["updated_at"] = datetime.now(timezone.utc)
        
        # Convert date objects to ISO format strings for MongoDB
        for date_field in ['planned_start', 'planned_end', 'actual_start', 'actual_end', 'updated_at']:
            if date_field in updated_data and updated_data[date_field]:
                if hasattr(updated_data[date_field], 'isoformat'):
                    updated_data[date_field] = updated_data[date_field].isoformat()
        
        await db.commerce_execute.update_one(
            {"execution_id": execution_id},
            {"$set": updated_data}
        )
        
        updated_exec = await db.commerce_execute.find_one({"execution_id": execution_id})
        return Execute(**updated_exec)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update execution: {str(e)}")


@commerce_router.delete("/execute/{execution_id}")
async def delete_execution(execution_id: str, db=Depends(get_db)):
    """Delete an execution"""
    try:
        result = await db.commerce_execute.delete_one({"execution_id": execution_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Execution not found")
        return {"message": "Execution deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete execution: {str(e)}")


@commerce_router.patch("/execute/{execution_id}/status")
async def update_execution_status(execution_id: str, status: ExecutionStatus, db=Depends(get_db)):
    """Update execution status (workflow transition)"""
    try:
        result = await db.commerce_execute.update_one(
            {"execution_id": execution_id},
            {
                "$set": {
                    "execution_status": status.value,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Execution not found")
        
        updated_exec = await db.commerce_execute.find_one({"execution_id": execution_id})
        return Execute(**updated_exec)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update status: {str(e)}")


# ==================== MODULE 5: BILL ROUTES ====================

@commerce_router.post("/bills", response_model=Bill)
async def create_bill(bill_data: BillCreate, db=Depends(get_db)):
    """Create a new invoice/bill"""
    try:
        count = await db.commerce_bills.count_documents({})
        
        # Calculate amounts
        total_amount = sum(item.line_amount for item in bill_data.items)
        tax_amount = total_amount * 0.18  # Assuming 18% GST
        
        bill = Bill(
            **bill_data.dict(),
            invoice_id=generate_sequential_id("INV", count),
            invoice_amount=total_amount,
            tax_amount=tax_amount,
            net_amount=total_amount + tax_amount,
            due_date=datetime.now(timezone.utc).date(),
            tax_registration_number="GSTIN_PLACEHOLDER",
            customer_tax_id="CUSTOMER_GSTIN"
        )
        
        bill_dict = bill.dict()
        # Convert date objects to ISO format strings for MongoDB
        for date_field in ['invoice_date', 'due_date', 'created_at', 'updated_at']:
            if date_field in bill_dict and bill_dict[date_field]:
                if hasattr(bill_dict[date_field], 'isoformat'):
                    bill_dict[date_field] = bill_dict[date_field].isoformat()
        await db.commerce_bills.insert_one(bill_dict)
        
        return bill
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create bill: {str(e)}")


@commerce_router.get("/bills")
async def get_bills(skip: int = 0, limit: int = 50, status: str = None, db=Depends(get_db)):
    """Get all bills with optional status filter"""
    try:
        filter_query = {}
        if status:
            filter_query["invoice_status"] = status
            
        cursor = db.commerce_bills.find(filter_query).skip(skip).limit(limit).sort("created_at", -1)
        bills = await cursor.to_list(length=limit)
        
        result = []
        for b in bills:
            bill_dict = {
                'id': b.get('id'),
                'invoice_id': b.get('invoice_id'),
                'execution_id': b.get('execution_id'),
                'invoice_date': b.get('invoice_date').isoformat() if hasattr(b.get('invoice_date'), 'isoformat') else str(b.get('invoice_date')),
                'due_date': b.get('due_date').isoformat() if hasattr(b.get('due_date'), 'isoformat') else str(b.get('due_date')),
                'invoice_amount': b.get('invoice_amount'),
                'invoice_status': b.get('invoice_status'),
                'customer_name': b.get('customer_name'),
                'created_at': b.get('created_at').isoformat() if hasattr(b.get('created_at'), 'isoformat') else str(b.get('created_at')),
                'updated_at': b.get('updated_at').isoformat() if hasattr(b.get('updated_at'), 'isoformat') else str(b.get('updated_at'))
            }
            result.append(bill_dict)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch bills: {str(e)}")


@commerce_router.get("/bills/{invoice_id}")
async def get_bill(invoice_id: str, db=Depends(get_db)):
    """Get a specific bill"""
    try:
        bill = await db.commerce_bills.find_one({"invoice_id": invoice_id})
        if not bill:
            raise HTTPException(status_code=404, detail="Bill not found")
        
        bill_dict = {
            'id': bill.get('id'),
            'invoice_id': bill.get('invoice_id'),
            'execution_id': bill.get('execution_id'),
            'customer_id': bill.get('customer_id'),
            'customer_name': bill.get('customer_name'),
            'invoice_date': bill.get('invoice_date').isoformat() if hasattr(bill.get('invoice_date'), 'isoformat') else str(bill.get('invoice_date')),
            'due_date': bill.get('due_date').isoformat() if hasattr(bill.get('due_date'), 'isoformat') else str(bill.get('due_date')),
            'invoice_amount': bill.get('invoice_amount'),
            'tax_amount': bill.get('tax_amount'),
            'net_amount': bill.get('net_amount'),
            'invoice_status': bill.get('invoice_status'),
            'payment_terms': bill.get('payment_terms'),
            'created_at': bill.get('created_at').isoformat() if hasattr(bill.get('created_at'), 'isoformat') else str(bill.get('created_at')),
            'updated_at': bill.get('updated_at').isoformat() if hasattr(bill.get('updated_at'), 'isoformat') else str(bill.get('updated_at'))
        }
        return bill_dict
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch bill: {str(e)}")


@commerce_router.put("/bills/{invoice_id}")
async def update_bill(invoice_id: str, bill_data: BillCreate, db=Depends(get_db)):
    """Update a bill"""
    try:
        existing_bill = await db.commerce_bills.find_one({"invoice_id": invoice_id})
        if not existing_bill:
            raise HTTPException(status_code=404, detail="Bill not found")
        
        updated_data = bill_data.dict()
        updated_data["updated_at"] = datetime.now(timezone.utc)
        
        # Convert date objects to ISO format strings for MongoDB
        for date_field in ['invoice_date', 'due_date', 'updated_at']:
            if date_field in updated_data and updated_data[date_field]:
                if hasattr(updated_data[date_field], 'isoformat'):
                    updated_data[date_field] = updated_data[date_field].isoformat()
        
        await db.commerce_bills.update_one(
            {"invoice_id": invoice_id},
            {"$set": updated_data}
        )
        
        updated_bill = await db.commerce_bills.find_one({"invoice_id": invoice_id}, {"_id": 0})
        return updated_bill
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update bill: {str(e)}")


@commerce_router.delete("/bills/{invoice_id}")
async def delete_bill(invoice_id: str, db=Depends(get_db)):
    """Delete a bill"""
    try:
        result = await db.commerce_bills.delete_one({"invoice_id": invoice_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Bill not found")
        return {"message": "Bill deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete bill: {str(e)}")


@commerce_router.patch("/bills/{invoice_id}/status")
async def update_bill_status(invoice_id: str, status: str, db=Depends(get_db)):
    """Update bill status"""
    try:
        result = await db.commerce_bills.update_one(
            {"invoice_id": invoice_id},
            {
                "$set": {
                    "invoice_status": status,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Bill not found")
        
        updated_bill = await db.commerce_bills.find_one({"invoice_id": invoice_id}, {"_id": 0})
        return updated_bill
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update status: {str(e)}")


# ==================== MODULE 6: COLLECT ROUTES ====================

@commerce_router.post("/collect", response_model=Collect)
async def create_collection(collect_data: CollectCreate, db=Depends(get_db)):
    """Create a new collection record"""
    try:
        count = await db.commerce_collect.count_documents({})
        
        collection = Collect(
            **collect_data.dict(),
            collection_id=generate_sequential_id("COLL", count),
            amount_outstanding=collect_data.amount_due,
            due_date=datetime.now(timezone.utc).date()
        )
        
        collect_dict = collection.dict()
        # Convert date objects to ISO format strings for MongoDB
        for date_field in ['due_date', 'payment_received_date', 'last_followup_date', 'next_followup_date', 'dispute_resolution_date', 'created_at', 'updated_at']:
            if date_field in collect_dict and collect_dict[date_field]:
                if hasattr(collect_dict[date_field], 'isoformat'):
                    collect_dict[date_field] = collect_dict[date_field].isoformat()
        await db.commerce_collect.insert_one(collect_dict)
        
        return collection
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create collection: {str(e)}")


@commerce_router.get("/collect", response_model=List[Collect])
async def get_collections(skip: int = 0, limit: int = 50, status: str = None, db=Depends(get_db)):
    """Get all collections with optional status filter"""
    try:
        filter_query = {}
        if status:
            filter_query["payment_status"] = status
            
        cursor = db.commerce_collect.find(filter_query).skip(skip).limit(limit).sort("created_at", -1)
        collections = await cursor.to_list(length=limit)
        return [Collect(**c) for c in collections]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch collections: {str(e)}")


@commerce_router.get("/collect/{collection_id}")
async def get_collection(collection_id: str, db=Depends(get_db)):
    """Get a specific collection"""
    try:
        collection = await db.commerce_collect.find_one({"collection_id": collection_id})
        if not collection:
            raise HTTPException(status_code=404, detail="Collection not found")
        
        return Collect(**collection)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch collection: {str(e)}")


@commerce_router.put("/collect/{collection_id}")
async def update_collection(collection_id: str, collect_data: CollectCreate, db=Depends(get_db)):
    """Update a collection"""
    try:
        collection = await db.commerce_collect.find_one({"collection_id": collection_id})
        if not collection:
            raise HTTPException(status_code=404, detail="Collection not found")
        
        updated_data = collect_data.dict()
        updated_data["updated_at"] = datetime.now(timezone.utc)
        
        # Convert date objects to ISO format strings for MongoDB
        for date_field in ['due_date', 'payment_received_date', 'last_followup_date', 'next_followup_date', 'dispute_resolution_date', 'updated_at']:
            if date_field in updated_data and updated_data[date_field]:
                if hasattr(updated_data[date_field], 'isoformat'):
                    updated_data[date_field] = updated_data[date_field].isoformat()
        
        await db.commerce_collect.update_one(
            {"collection_id": collection_id},
            {"$set": updated_data}
        )
        
        updated_collection = await db.commerce_collect.find_one({"collection_id": collection_id}, {"_id": 0})
        return updated_collection
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update collection: {str(e)}")


@commerce_router.delete("/collect/{collection_id}")
async def delete_collection(collection_id: str, db=Depends(get_db)):
    """Delete a collection"""
    try:
        result = await db.commerce_collect.delete_one({"collection_id": collection_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Collection not found")
        
        return {"message": "Collection deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete collection: {str(e)}")


@commerce_router.patch("/collect/{collection_id}/status")
async def update_collection_status(collection_id: str, status: str, db=Depends(get_db)):
    """Update collection payment status"""
    try:
        valid_statuses = ["Pending", "Partial", "Paid", "Overdue"]
        if status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
        
        collection = await db.commerce_collect.find_one({"collection_id": collection_id})
        if not collection:
            raise HTTPException(status_code=404, detail="Collection not found")
        
        await db.commerce_collect.update_one(
            {"collection_id": collection_id},
            {
                "$set": {
                    "payment_status": status,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        updated_collection = await db.commerce_collect.find_one({"collection_id": collection_id}, {"_id": 0})
        return updated_collection
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update status: {str(e)}")


@commerce_router.patch("/collect/{collection_id}/payment")
async def record_payment(
    collection_id: str, 
    payment_amount: float,
    payment_method: str = None,
    payment_reference: str = None,
    db=Depends(get_db)
):
    """Record a payment for a collection"""
    try:
        collection = await db.commerce_collect.find_one({"collection_id": collection_id})
        if not collection:
            raise HTTPException(status_code=404, detail="Collection not found")
        
        # Calculate new amounts
        current_received = collection.get("amount_received", 0)
        new_received = current_received + payment_amount
        amount_due = collection.get("amount_due", 0)
        new_outstanding = amount_due - new_received
        
        # Determine new status
        if new_outstanding <= 0:
            new_status = "Paid"
        elif new_received > 0:
            new_status = "Partial"
        else:
            new_status = "Pending"
        
        update_data = {
            "amount_received": new_received,
            "amount_outstanding": max(0, new_outstanding),
            "payment_status": new_status,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        if new_status == "Paid":
            update_data["payment_received_date"] = datetime.now(timezone.utc).date().isoformat()
        
        if payment_method:
            update_data["payment_method"] = payment_method
        
        if payment_reference:
            update_data["payment_reference"] = payment_reference
        
        await db.commerce_collect.update_one(
            {"collection_id": collection_id},
            {"$set": update_data}
        )
        
        updated_collection = await db.commerce_collect.find_one({"collection_id": collection_id}, {"_id": 0})
        return updated_collection
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to record payment: {str(e)}")


# ==================== MODULE 7: PROCURE ROUTES ====================

@commerce_router.post("/procure", response_model=Procure)
async def create_procurement(procure_data: ProcureCreate, db=Depends(get_db)):
    """Create a new procurement requisition"""
    try:
        count = await db.commerce_procure.count_documents({})
        
        procurement = Procure(
            **procure_data.dict(),
            requisition_id=generate_sequential_id("REQ", count)
        )
        
        procure_dict = procurement.dict()
        await db.commerce_procure.insert_one(procure_dict)
        
        return procurement
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create procurement: {str(e)}")


@commerce_router.get("/procure", response_model=List[Procure])
async def get_procurements(skip: int = 0, limit: int = 50, status: str = None, db=Depends(get_db)):
    """Get all procurements with optional status filter"""
    try:
        filter_query = {}
        if status:
            filter_query["procurement_status"] = status
            
        cursor = db.commerce_procure.find(filter_query).skip(skip).limit(limit).sort("created_at", -1)
        procurements = await cursor.to_list(length=limit)
        return [Procure(**p) for p in procurements]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch procurements: {str(e)}")


@commerce_router.get("/procure/{requisition_id}")
async def get_procurement(requisition_id: str, db=Depends(get_db)):
    """Get a specific procurement"""
    try:
        procurement = await db.commerce_procure.find_one({"requisition_id": requisition_id})
        if not procurement:
            raise HTTPException(status_code=404, detail="Procurement not found")
        
        return Procure(**procurement)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch procurement: {str(e)}")


@commerce_router.put("/procure/{requisition_id}")
async def update_procurement(requisition_id: str, procure_data: ProcureCreate, db=Depends(get_db)):
    """Update a procurement"""
    try:
        procurement = await db.commerce_procure.find_one({"requisition_id": requisition_id})
        if not procurement:
            raise HTTPException(status_code=404, detail="Procurement not found")
        
        updated_data = procure_data.dict()
        updated_data["updated_at"] = datetime.now(timezone.utc)
        
        # Convert date objects to ISO format strings for MongoDB
        for date_field in ['requisition_date', 'required_by_date', 'approved_date', 'order_date', 'expected_delivery_date', 'actual_delivery_date', 'updated_at']:
            if date_field in updated_data and updated_data[date_field]:
                if hasattr(updated_data[date_field], 'isoformat'):
                    updated_data[date_field] = updated_data[date_field].isoformat()
        
        await db.commerce_procure.update_one(
            {"requisition_id": requisition_id},
            {"$set": updated_data}
        )
        
        updated_procurement = await db.commerce_procure.find_one({"requisition_id": requisition_id}, {"_id": 0})
        return updated_procurement
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update procurement: {str(e)}")


@commerce_router.delete("/procure/{requisition_id}")
async def delete_procurement(requisition_id: str, db=Depends(get_db)):
    """Delete a procurement"""
    try:
        result = await db.commerce_procure.delete_one({"requisition_id": requisition_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Procurement not found")
        
        return {"message": "Procurement deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete procurement: {str(e)}")


@commerce_router.patch("/procure/{requisition_id}/status")
async def update_procurement_status(requisition_id: str, status: str, db=Depends(get_db)):
    """Update procurement status"""
    try:
        valid_statuses = ["Draft", "Requested", "Approved", "Ordered", "Received", "Cancelled"]
        if status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
        
        procurement = await db.commerce_procure.find_one({"requisition_id": requisition_id})
        if not procurement:
            raise HTTPException(status_code=404, detail="Procurement not found")
        
        await db.commerce_procure.update_one(
            {"requisition_id": requisition_id},
            {
                "$set": {
                    "procurement_status": status,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        updated_procurement = await db.commerce_procure.find_one({"requisition_id": requisition_id}, {"_id": 0})
        return updated_procurement
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update status: {str(e)}")


# ==================== MODULE 8: PAY ROUTES ====================

@commerce_router.post("/pay", response_model=Pay)
async def create_payment(pay_data: PayCreate, db=Depends(get_db)):
    """Create a new payment record"""
    try:
        count = await db.commerce_pay.count_documents({})
        
        payment = Pay(
            **pay_data.dict(),
            payment_id=generate_sequential_id("PAY", count),
            matched_po_id=pay_data.po_id,
            vendor_tax_id="VENDOR_GSTIN"
        )
        
        # Calculate net payable
        payment.net_payable = payment.invoice_amount - payment.tds_amount - payment.retention_amount
        payment.payment_amount = payment.net_payable
        
        pay_dict = payment.dict()
        await db.commerce_pay.insert_one(pay_dict)
        
        return payment
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create payment: {str(e)}")


@commerce_router.get("/pay", response_model=List[Pay])
async def get_payments(skip: int = 0, limit: int = 50, status: str = None, db=Depends(get_db)):
    """Get all payments with optional status filter"""
    try:
        filter_query = {}
        if status:
            filter_query["payment_status"] = status
            
        cursor = db.commerce_pay.find(filter_query).skip(skip).limit(limit).sort("created_at", -1)
        payments = await cursor.to_list(length=limit)
        return [Pay(**p) for p in payments]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch payments: {str(e)}")


@commerce_router.get("/pay/{payment_id}")
async def get_payment(payment_id: str, db=Depends(get_db)):
    """Get a specific payment"""
    try:
        payment = await db.commerce_pay.find_one({"payment_id": payment_id})
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")
        
        return Pay(**payment)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch payment: {str(e)}")


@commerce_router.put("/pay/{payment_id}")
async def update_payment(payment_id: str, pay_data: PayCreate, db=Depends(get_db)):
    """Update a payment"""
    try:
        payment = await db.commerce_pay.find_one({"payment_id": payment_id})
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")
        
        updated_data = pay_data.dict()
        updated_data["updated_at"] = datetime.now(timezone.utc)
        
        # Convert date objects to ISO format strings for MongoDB
        for date_field in ['invoice_date', 'due_date', 'payment_date', 'approval_date', 'updated_at']:
            if date_field in updated_data and updated_data[date_field]:
                if hasattr(updated_data[date_field], 'isoformat'):
                    updated_data[date_field] = updated_data[date_field].isoformat()
        
        await db.commerce_pay.update_one(
            {"payment_id": payment_id},
            {"$set": updated_data}
        )
        
        updated_payment = await db.commerce_pay.find_one({"payment_id": payment_id}, {"_id": 0})
        return updated_payment
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update payment: {str(e)}")


@commerce_router.delete("/pay/{payment_id}")
async def delete_payment(payment_id: str, db=Depends(get_db)):
    """Delete a payment"""
    try:
        result = await db.commerce_pay.delete_one({"payment_id": payment_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Payment not found")
        
        return {"message": "Payment deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete payment: {str(e)}")


@commerce_router.patch("/pay/{payment_id}/status")
async def update_payment_status(payment_id: str, status: str, db=Depends(get_db)):
    """Update payment status"""
    try:
        valid_statuses = ["Draft", "Pending", "Approved", "Paid", "Reconciled", "Failed"]
        if status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
        
        payment = await db.commerce_pay.find_one({"payment_id": payment_id})
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")
        
        update_data = {
            "payment_status": status,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Set payment date if status is Paid
        if status == "Paid" and not payment.get("payment_date"):
            update_data["payment_date"] = datetime.now(timezone.utc).date().isoformat()
            update_data["execution_status"] = "Completed"
        
        await db.commerce_pay.update_one(
            {"payment_id": payment_id},
            {"$set": update_data}
        )
        
        updated_payment = await db.commerce_pay.find_one({"payment_id": payment_id}, {"_id": 0})
        return updated_payment
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update status: {str(e)}")


@commerce_router.patch("/pay/{payment_id}/approve")
async def approve_payment(payment_id: str, approver_id: str, remarks: str = None, db=Depends(get_db)):
    """Approve a payment"""
    try:
        payment = await db.commerce_pay.find_one({"payment_id": payment_id})
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")
        
        await db.commerce_pay.update_one(
            {"payment_id": payment_id},
            {
                "$set": {
                    "approval_status": "Approved",
                    "approval_remarks": remarks,
                    "approval_date": datetime.now(timezone.utc).isoformat(),
                    "payment_status": "Approved",
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        updated_payment = await db.commerce_pay.find_one({"payment_id": payment_id}, {"_id": 0})
        return updated_payment
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to approve payment: {str(e)}")


# ==================== MODULE 9: SPEND ROUTES ====================

@commerce_router.post("/spend", response_model=Spend)
async def create_spend(spend_data: SpendCreate, db=Depends(get_db)):
    """Create a new spend/expense record"""
    try:
        count = await db.commerce_spend.count_documents({})
        
        spend = Spend(
            **spend_data.dict(),
            expense_id=generate_sequential_id("EXP", count),
            reported_by="current_user_id",
            net_expense=spend_data.expense_amount
        )
        
        spend_dict = spend.dict()
        await db.commerce_spend.insert_one(spend_dict)
        
        return spend
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create spend: {str(e)}")


@commerce_router.get("/spend", response_model=List[Spend])
async def get_spends(skip: int = 0, limit: int = 50, status: str = None, db=Depends(get_db)):
    """Get all spends with optional status filter"""
    try:
        filter_query = {}
        if status:
            filter_query["expense_status"] = status
            
        cursor = db.commerce_spend.find(filter_query).skip(skip).limit(limit).sort("created_at", -1)
        spends = await cursor.to_list(length=limit)
        return [Spend(**s) for s in spends]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch spends: {str(e)}")


@commerce_router.get("/spend/{expense_id}")
async def get_spend(expense_id: str, db=Depends(get_db)):
    """Get a specific spend"""
    try:
        spend = await db.commerce_spend.find_one({"expense_id": expense_id})
        if not spend:
            raise HTTPException(status_code=404, detail="Spend not found")
        
        return Spend(**spend)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch spend: {str(e)}")


@commerce_router.put("/spend/{expense_id}")
async def update_spend(expense_id: str, spend_data: SpendCreate, db=Depends(get_db)):
    """Update a spend"""
    try:
        spend = await db.commerce_spend.find_one({"expense_id": expense_id})
        if not spend:
            raise HTTPException(status_code=404, detail="Spend not found")
        
        updated_data = spend_data.dict()
        updated_data["updated_at"] = datetime.now(timezone.utc)
        
        # Convert date objects to ISO format strings for MongoDB
        for date_field in ['expense_date', 'submission_date', 'approval_date', 'reimbursement_date', 'updated_at']:
            if date_field in updated_data and updated_data[date_field]:
                if hasattr(updated_data[date_field], 'isoformat'):
                    updated_data[date_field] = updated_data[date_field].isoformat()
        
        await db.commerce_spend.update_one(
            {"expense_id": expense_id},
            {"$set": updated_data}
        )
        
        updated_spend = await db.commerce_spend.find_one({"expense_id": expense_id}, {"_id": 0})
        return updated_spend
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update spend: {str(e)}")


@commerce_router.delete("/spend/{expense_id}")
async def delete_spend(expense_id: str, db=Depends(get_db)):
    """Delete a spend"""
    try:
        result = await db.commerce_spend.delete_one({"expense_id": expense_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Spend not found")
        
        return {"message": "Spend deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete spend: {str(e)}")


@commerce_router.patch("/spend/{expense_id}/status")
async def update_spend_status(expense_id: str, status: str, db=Depends(get_db)):
    """Update spend status"""
    try:
        valid_statuses = ["Draft", "Submitted", "Approved", "Paid", "Rejected"]
        if status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
        
        spend = await db.commerce_spend.find_one({"expense_id": expense_id})
        if not spend:
            raise HTTPException(status_code=404, detail="Spend not found")
        
        update_data = {
            "expense_status": status,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Set dates based on status
        if status == "Submitted" and not spend.get("submission_date"):
            update_data["submission_date"] = datetime.now(timezone.utc).date().isoformat()
        elif status == "Approved" and not spend.get("approval_date"):
            update_data["approval_date"] = datetime.now(timezone.utc).date().isoformat()
        elif status == "Paid" and not spend.get("reimbursement_date"):
            update_data["reimbursement_date"] = datetime.now(timezone.utc).date().isoformat()
        
        await db.commerce_spend.update_one(
            {"expense_id": expense_id},
            {"$set": update_data}
        )
        
        updated_spend = await db.commerce_spend.find_one({"expense_id": expense_id}, {"_id": 0})
        return updated_spend
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update status: {str(e)}")


# ==================== MODULE 10: TAX ROUTES ====================

@commerce_router.post("/tax", response_model=Tax)
async def create_tax(tax_data: TaxCreate, db=Depends(get_db)):
    """Create a new tax record"""
    try:
        count = await db.commerce_tax.count_documents({})
        
        tax = Tax(
            **tax_data.dict(),
            tax_id=generate_sequential_id("TAX", count)
        )
        
        tax_dict = tax.dict()
        await db.commerce_tax.insert_one(tax_dict)
        
        return tax
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create tax: {str(e)}")


@commerce_router.get("/tax", response_model=List[Tax])
async def get_taxes(skip: int = 0, limit: int = 50, status: Optional[str] = None, db=Depends(get_db)):
    """Get all tax records with optional status filter"""
    try:
        query = {}
        if status:
            query["tax_status"] = status
        
        cursor = db.commerce_tax.find(query, {"_id": 0}).skip(skip).limit(limit).sort("created_at", -1)
        taxes = await cursor.to_list(length=limit)
        return [Tax(**t) for t in taxes]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch taxes: {str(e)}")


@commerce_router.get("/tax/{tax_id}", response_model=Tax)
async def get_tax_details(tax_id: str, db=Depends(get_db)):
    """Get tax record details"""
    try:
        tax = await db.commerce_tax.find_one({"tax_id": tax_id}, {"_id": 0})
        if not tax:
            raise HTTPException(status_code=404, detail="Tax record not found")
        return Tax(**tax)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch tax details: {str(e)}")


@commerce_router.put("/tax/{tax_id}", response_model=Tax)
async def update_tax(tax_id: str, tax_data: TaxCreate, db=Depends(get_db)):
    """Update tax record"""
    try:
        tax = await db.commerce_tax.find_one({"tax_id": tax_id}, {"_id": 0})
        if not tax:
            raise HTTPException(status_code=404, detail="Tax record not found")
        
        # Update fields
        update_data = tax_data.dict()
        update_data["updated_at"] = datetime.now(timezone.utc)
        
        # Serialize dates
        if isinstance(update_data.get('filing_due_date'), date):
            update_data['filing_due_date'] = update_data['filing_due_date'].isoformat()
        
        await db.commerce_tax.update_one(
            {"tax_id": tax_id},
            {"$set": update_data}
        )
        
        updated_tax = await db.commerce_tax.find_one({"tax_id": tax_id}, {"_id": 0})
        return Tax(**updated_tax)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update tax: {str(e)}")


@commerce_router.delete("/tax/{tax_id}")
async def delete_tax(tax_id: str, db=Depends(get_db)):
    """Delete tax record"""
    try:
        result = await db.commerce_tax.delete_one({"tax_id": tax_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Tax record not found")
        return {"message": "Tax record deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete tax: {str(e)}")


@commerce_router.patch("/tax/{tax_id}/status")
async def update_tax_status(tax_id: str, status: str, db=Depends(get_db)):
    """Update tax status (Draft → Calculated → Filed → Paid)"""
    try:
        valid_statuses = ["Draft", "Calculated", "Filed", "Paid"]
        if status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
        
        tax = await db.commerce_tax.find_one({"tax_id": tax_id}, {"_id": 0})
        if not tax:
            raise HTTPException(status_code=404, detail="Tax record not found")
        
        update_data = {
            "tax_status": status,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Set filing date when status is Filed
        if status == "Filed" and not tax.get("filing_date"):
            update_data["filing_date"] = datetime.now(timezone.utc).date().isoformat()
        
        await db.commerce_tax.update_one(
            {"tax_id": tax_id},
            {"$set": update_data}
        )
        
        updated_tax = await db.commerce_tax.find_one({"tax_id": tax_id}, {"_id": 0})
        return Tax(**updated_tax)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update tax status: {str(e)}")


# ==================== MODULE 11: RECONCILE ROUTES ====================

@commerce_router.post("/reconcile", response_model=Reconcile)
async def create_reconciliation(reconcile_data: ReconcileCreate, db=Depends(get_db)):
    """Create a new reconciliation record"""
    try:
        count = await db.commerce_reconcile.count_documents({})
        
        reconciliation = Reconcile(
            **reconcile_data.dict(),
            reconcile_id=generate_sequential_id("REC", count)
        )
        
        reconcile_dict = reconciliation.dict()
        await db.commerce_reconcile.insert_one(reconcile_dict)
        
        return reconciliation
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create reconciliation: {str(e)}")


@commerce_router.get("/reconcile", response_model=List[Reconcile])
async def get_reconciliations(skip: int = 0, limit: int = 50, status: Optional[str] = None, db=Depends(get_db)):
    """Get all reconciliations with optional status filter"""
    try:
        query = {}
        if status:
            query["reconcile_status"] = status
        
        cursor = db.commerce_reconcile.find(query, {"_id": 0}).skip(skip).limit(limit).sort("created_at", -1)
        reconciliations = await cursor.to_list(length=limit)
        return [Reconcile(**r) for r in reconciliations]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch reconciliations: {str(e)}")


@commerce_router.get("/reconcile/{reconcile_id}", response_model=Reconcile)
async def get_reconciliation_details(reconcile_id: str, db=Depends(get_db)):
    """Get reconciliation details"""
    try:
        reconciliation = await db.commerce_reconcile.find_one({"reconcile_id": reconcile_id}, {"_id": 0})
        if not reconciliation:
            raise HTTPException(status_code=404, detail="Reconciliation not found")
        return Reconcile(**reconciliation)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch reconciliation details: {str(e)}")


@commerce_router.put("/reconcile/{reconcile_id}", response_model=Reconcile)
async def update_reconciliation(reconcile_id: str, reconcile_data: ReconcileCreate, db=Depends(get_db)):
    """Update reconciliation"""
    try:
        reconciliation = await db.commerce_reconcile.find_one({"reconcile_id": reconcile_id}, {"_id": 0})
        if not reconciliation:
            raise HTTPException(status_code=404, detail="Reconciliation not found")
        
        # Update fields
        update_data = reconcile_data.dict()
        update_data["updated_at"] = datetime.now(timezone.utc)
        
        # Serialize dates
        if isinstance(update_data.get('period_start'), date):
            update_data['period_start'] = update_data['period_start'].isoformat()
        if isinstance(update_data.get('period_end'), date):
            update_data['period_end'] = update_data['period_end'].isoformat()
        
        await db.commerce_reconcile.update_one(
            {"reconcile_id": reconcile_id},
            {"$set": update_data}
        )
        
        updated_reconciliation = await db.commerce_reconcile.find_one({"reconcile_id": reconcile_id}, {"_id": 0})
        return Reconcile(**updated_reconciliation)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update reconciliation: {str(e)}")


@commerce_router.delete("/reconcile/{reconcile_id}")
async def delete_reconciliation(reconcile_id: str, db=Depends(get_db)):
    """Delete reconciliation"""
    try:
        result = await db.commerce_reconcile.delete_one({"reconcile_id": reconcile_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Reconciliation not found")
        return {"message": "Reconciliation deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete reconciliation: {str(e)}")


@commerce_router.patch("/reconcile/{reconcile_id}/status")
async def update_reconciliation_status(reconcile_id: str, status: str, db=Depends(get_db)):
    """Update reconciliation status (Open → Matched → Partially Matched → Closed)"""
    try:
        valid_statuses = ["Open", "Matched", "Partially Matched", "Closed"]
        if status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
        
        reconciliation = await db.commerce_reconcile.find_one({"reconcile_id": reconcile_id}, {"_id": 0})
        if not reconciliation:
            raise HTTPException(status_code=404, detail="Reconciliation not found")
        
        update_data = {
            "reconcile_status": status,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Set closure date when status is Closed
        if status == "Closed" and not reconciliation.get("closure_date"):
            update_data["closure_date"] = datetime.now(timezone.utc).date().isoformat()
            update_data["final_status"] = "Closed"
        
        await db.commerce_reconcile.update_one(
            {"reconcile_id": reconcile_id},
            {"$set": update_data}
        )
        
        updated_reconciliation = await db.commerce_reconcile.find_one({"reconcile_id": reconcile_id}, {"_id": 0})
        return Reconcile(**updated_reconciliation)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update reconciliation status: {str(e)}")


# ==================== MODULE 12: GOVERN ROUTES ====================

@commerce_router.post("/govern", response_model=Govern)
async def create_governance(govern_data: GovernCreate, db=Depends(get_db)):
    """Create a new governance/SOP record"""
    try:
        count = await db.commerce_govern.count_documents({})
        
        governance = Govern(
            **govern_data.dict(),
            govern_id=generate_sequential_id("GOV", count)
        )
        
        govern_dict = governance.dict()
        await db.commerce_govern.insert_one(govern_dict)
        
        return governance
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create governance: {str(e)}")


@commerce_router.get("/govern", response_model=List[Govern])
async def get_governances(skip: int = 0, limit: int = 50, status: Optional[str] = None, db=Depends(get_db)):
    """Get all governance records with optional status filter"""
    try:
        query = {}
        if status:
            query["sop_status"] = status
        
        cursor = db.commerce_govern.find(query, {"_id": 0}).skip(skip).limit(limit).sort("created_at", -1)
        governances = await cursor.to_list(length=limit)
        return [Govern(**g) for g in governances]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch governance records: {str(e)}")


@commerce_router.get("/govern/{govern_id}", response_model=Govern)
async def get_governance_details(govern_id: str, db=Depends(get_db)):
    """Get governance record details"""
    try:
        governance = await db.commerce_govern.find_one({"govern_id": govern_id}, {"_id": 0})
        if not governance:
            raise HTTPException(status_code=404, detail="Governance record not found")
        return Govern(**governance)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch governance details: {str(e)}")


@commerce_router.put("/govern/{govern_id}", response_model=Govern)
async def update_governance(govern_id: str, govern_data: GovernCreate, db=Depends(get_db)):
    """Update governance record"""
    try:
        governance = await db.commerce_govern.find_one({"govern_id": govern_id}, {"_id": 0})
        if not governance:
            raise HTTPException(status_code=404, detail="Governance record not found")
        
        # Update fields
        update_data = govern_data.dict()
        update_data["updated_at"] = datetime.now(timezone.utc)
        
        # Serialize dates
        if isinstance(update_data.get('effective_date'), date):
            update_data['effective_date'] = update_data['effective_date'].isoformat()
        
        await db.commerce_govern.update_one(
            {"govern_id": govern_id},
            {"$set": update_data}
        )
        
        updated_governance = await db.commerce_govern.find_one({"govern_id": govern_id}, {"_id": 0})
        return Govern(**updated_governance)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update governance: {str(e)}")


@commerce_router.delete("/govern/{govern_id}")
async def delete_governance(govern_id: str, db=Depends(get_db)):
    """Delete governance record"""
    try:
        result = await db.commerce_govern.delete_one({"govern_id": govern_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Governance record not found")
        return {"message": "Governance record deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete governance: {str(e)}")


@commerce_router.patch("/govern/{govern_id}/status")
async def update_governance_status(govern_id: str, status: str, db=Depends(get_db)):
    """Update governance status (Draft → Active → Under Review → Archived)"""
    try:
        valid_statuses = ["Draft", "Active", "Under Review", "Archived"]
        if status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
        
        governance = await db.commerce_govern.find_one({"govern_id": govern_id}, {"_id": 0})
        if not governance:
            raise HTTPException(status_code=404, detail="Governance record not found")
        
        update_data = {
            "sop_status": status,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Set review date when status is Active
        if status == "Active" and not governance.get("review_date"):
            update_data["review_date"] = datetime.now(timezone.utc).date().isoformat()
        
        await db.commerce_govern.update_one(
            {"govern_id": govern_id},
            {"$set": update_data}
        )
        
        updated_governance = await db.commerce_govern.find_one({"govern_id": govern_id}, {"_id": 0})
        return Govern(**updated_governance)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update governance status: {str(e)}")


# ==================== DASHBOARD & ANALYTICS ====================

@commerce_router.get("/dashboard/stats")
async def get_dashboard_stats(db=Depends(get_db)):
    """Get dashboard statistics for all modules"""
    try:
        stats = {
            "lead": {
                "total": await db.commerce_leads.count_documents({}),
                "captured": await db.commerce_leads.count_documents({"lead_status": "Captured"}),
                "qualified": await db.commerce_leads.count_documents({"lead_status": "Qualified"}),
                "converted": await db.commerce_leads.count_documents({"lead_status": "Converted"})
            },
            "evaluate": {
                "total": await db.commerce_evaluate.count_documents({}),
                "in_review": await db.commerce_evaluate.count_documents({"evaluation_status": "In Review"}),
                "approved": await db.commerce_evaluate.count_documents({"evaluation_status": "Approved"})
            },
            "commit": {
                "total": await db.commerce_commit.count_documents({}),
                "draft": await db.commerce_commit.count_documents({"commit_status": "Draft"}),
                "executed": await db.commerce_commit.count_documents({"commit_status": "Executed"})
            },
            "bills": {
                "total": await db.commerce_bills.count_documents({}),
                "issued": await db.commerce_bills.count_documents({"invoice_status": "Issued"}),
                "paid": await db.commerce_bills.count_documents({"invoice_status": "Paid"})
            },
            "collect": {
                "total": await db.commerce_collect.count_documents({}),
                "pending": await db.commerce_collect.count_documents({"payment_status": "Pending"}),
                "overdue": await db.commerce_collect.count_documents({"payment_status": "Overdue"})
            },
            "procure": {
                "total": await db.commerce_procure.count_documents({}),
                "approved": await db.commerce_procure.count_documents({"requisition_status": "Approved"})
            },
            "pay": {
                "total": await db.commerce_pay.count_documents({}),
                "paid": await db.commerce_pay.count_documents({"payment_status": "Paid"})
            },
            "spend": {
                "total": await db.commerce_spend.count_documents({}),
                "approved": await db.commerce_spend.count_documents({"expense_status": "Approved"})
            },
            "tax": {
                "total": await db.commerce_tax.count_documents({}),
                "filed": await db.commerce_tax.count_documents({"tax_status": "Filed"})
            },
            "reconcile": {
                "total": await db.commerce_reconcile.count_documents({}),
                "matched": await db.commerce_reconcile.count_documents({"reconcile_status": "Matched"})
            },
            "govern": {
                "total": await db.commerce_govern.count_documents({}),
                "active": await db.commerce_govern.count_documents({"sop_status": "Active"})
            }
        }
        
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch dashboard stats: {str(e)}")


@commerce_router.get("/users")
async def get_users(db=Depends(get_db)):
    """Get all active users for assignment"""
    try:
        users = await db.users.find({"status": "Active"}).to_list(length=100)
        return [
            {
                "user_id": user.get("user_id"),
                "name": user.get("name"),
                "email": user.get("email"),
                "role": user.get("role"),
                "department": user.get("department")
            }
            for user in users
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch users: {str(e)}")
