"""
Handoff Routes - Revenue Workflow
"""
from fastapi import APIRouter, HTTPException, Depends, status
from typing import Dict, Any, Optional
from services.handoff_service import HandoffService
from models.commerce_models import RevenueHandoffMappingUpdate
from routes.deps import get_db, get_current_user, User

router = APIRouter(prefix="/revenue/leads/{lead_id}/handoff", tags=["Revenue Handoff"])

@router.get("")
async def get_handoff_details(lead_id: str, db=Depends(get_db)):
    """
    GET aggregated handoff data and validations.
    """
    handoff = await db.revenue_workflow_handoffs.find_one({"lead_id": lead_id}, {"_id": 0})
    if not handoff:
        # Try to auto-create if lead is in handoff stage but record missing
        lead = await db.revenue_workflow_leads.find_one({"lead_id": lead_id})
        if lead and lead.get("main_stage") == "handoff":
             handoff_obj = await HandoffService.auto_create_handoff(lead_id, "system", db)
             handoff = handoff_obj.dict()
        else:
            raise HTTPException(status_code=404, detail="Handoff record not found")

    lead = await db.revenue_workflow_leads.find_one({"lead_id": lead_id}, {"_id": 0})
    contract = await db.revenue_workflow_contracts.find_one({"lead_id": lead_id}, {"_id": 0})
    validations = await HandoffService.validate_handoff(lead_id, db)

    return {
        "success": True,
        "lead": lead,
        "contract": contract,
        "handoff": handoff,
        "validations": validations
    }

@router.patch("/mapping")
async def update_handoff_mapping(
    lead_id: str, 
    mapping: RevenueHandoffMappingUpdate, 
    db=Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    PATCH update mapping data and move stage to 'map'.
    """
    update_data = mapping.dict(exclude_unset=True)
    update_data["handoff_stage"] = "map"
    
    result = await db.revenue_workflow_handoffs.update_one(
        {"lead_id": lead_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Handoff record not found")
    
    return {"success": True, "message": "Mapping updated"}

@router.post("/initiate")
async def initiate_handoff(
    lead_id: str, 
    db=Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    POST execute the handoff push logic.
    """
    result = await HandoffService.execute_push(lead_id, current_user.user_id, db)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    
    return result
