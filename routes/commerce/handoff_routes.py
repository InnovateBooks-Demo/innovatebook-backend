from fastapi import APIRouter, Depends, HTTPException, Request
from typing import Dict, Any, List
from datetime import datetime, timezone
import logging as _logging
from models.commerce_models import (
    RevenueHandoff, 
    MappingSnapshot, 
    HandoffStage, 
    HandoffStatus
)
from services.handoff_service import HandoffService
from routes.deps import get_db

_logger = _logging.getLogger(__name__)

router = APIRouter(prefix="/revenue/handoff", tags=["Handoff"])


def _normalize_items(raw_items: list) -> list:
    """Ensure every item has item_id and unified field names."""
    normalized = []
    for i, item in enumerate(raw_items or []):
        item_id = item.get("item_id") or item.get("id") or f"ITEM-{i + 1:03d}"
        normalized.append({
            "item_id": item_id,
            "name": item.get("name") or item.get("item_name") or f"Item {i + 1}",
            "quantity": item.get("quantity", 0),
            "price": item.get("price") or item.get("unit_price", 0),
            "total": item.get("total") or item.get("total_price", 0),
        })
    return normalized


@router.get("/{lead_id}")
async def get_handoff_details(lead_id: str, db = Depends(get_db)):
    """Return a structured Execution Summary for the Handoff module."""
    handoff = await db.revenue_workflow_handoffs.find_one({"lead_id": lead_id})

    if not handoff:
        # Fallback: auto-create if a SIGNED contract exists
        contract = await db.revenue_workflow_contracts.find_one({
            "lead_id": lead_id,
            "contract_status": "SIGNED"
        })
        if contract:
            try:
                _logger.info(f"Auto-creating handoff via GET fallback for lead {lead_id}")
                await HandoffService.auto_create_handoff(lead_id, contract["contract_id"], db)
                handoff = await db.revenue_workflow_handoffs.find_one({"lead_id": lead_id})
            except Exception as e:
                _logger.error(f"Fallback auto-creation failed for lead {lead_id}: {str(e)}")
                raise HTTPException(status_code=400, detail=f"Handoff initialization failed: {str(e)}")

        if not handoff:
            return {
                "success": False,
                "message": "not_initialized",
                "handoff_stage": HandoffStage.INIT,
                "handoff_status": HandoffStatus.PENDING,
                "errors": ["Workflow not yet initialized. Requires SIGNED contract."]
            }

    handoff_data = dict(handoff)
    handoff_data.pop("_id", None)

    # ── Enrich with Contract data ──────────────────────────────────────────
    contract = await db.revenue_workflow_contracts.find_one(
        {"contract_id": handoff_data.get("contract_id")}
    )
    contract_data = dict(contract) if contract else {}
    snapshot = contract_data.get("commercial_snapshot") or contract_data.get("contract_data") or {}

    raw_items = snapshot.get("items", [])
    items = _normalize_items(raw_items)

    summary = {
        "client_name": (
            contract_data.get("party_name")
            or snapshot.get("client_name")
            or snapshot.get("party_name", "")
        ),
        "items": items,
        "total_value": snapshot.get("total_value", 0),
        "currency": snapshot.get("currency", "INR"),
        "duration": snapshot.get("duration", ""),
    }

    # ── Enrich with Onboarding data ────────────────────────────────────────
    onboarding = await db.revenue_workflow_onboarding.find_one(
        {"contract_id": handoff_data.get("contract_id")}
    )
    onboarding_data = dict(onboarding) if onboarding else {}
    onboarding_data.pop("_id", None)

    onboarding_block = {
        "status": onboarding_data.get("onboarding_status", "PENDING"),
        "gst": onboarding_data.get("gst", ""),
        "billing_address": onboarding_data.get("address") or onboarding_data.get("billing_address", ""),
        "contacts": {
            "billing": onboarding_data.get("billing_contact", ""),
            "admin": onboarding_data.get("admin_contact", ""),
        },
        "documents": onboarding_data.get("documents", {}),
    }

    # ── Clean Handoff object (mapped_data preserved exactly) ──────────────
    handoff_block = {
        "lead_id":              handoff_data.get("lead_id"),
        "contract_id":          handoff_data.get("contract_id"),
        "onboarding_id":        handoff_data.get("onboarding_id"),
        "handoff_id":           handoff_data.get("handoff_id"),
        "handoff_stage":        handoff_data.get("handoff_stage"),
        "handoff_status":       handoff_data.get("handoff_status"),
        "mapped_data":          handoff_data.get("mapped_data", {}),  # preserved exactly
        "operations_record_id": handoff_data.get("operations_record_id"),
        "finance_record_id":    handoff_data.get("finance_record_id"),
        "validation_status":    handoff_data.get("validation_status"),
        "errors":               handoff_data.get("errors", []),
        "handoff_metadata":     handoff_data.get("handoff_metadata", {}),
    }

    return {
        "summary":    summary,
        "onboarding": onboarding_block,
        "handoff":    handoff_block,
    }


@router.patch("/{lead_id}/mapping")
async def update_handoff_mapping(lead_id: str, mapping: MappingSnapshot, db = Depends(get_db)):
    """Update delivery owner and mapping logic before pushing to execution."""
    handoff = await db.revenue_workflow_handoffs.find_one({"lead_id": lead_id})
    if not handoff:
        raise HTTPException(status_code=404, detail="Handoff record not found")
    
    if handoff.get("handoff_stage") == HandoffStage.DONE:
        raise HTTPException(status_code=400, detail="Handoff is completed and locked for edits.")

    # Determine next stage
    current_stage = handoff.get("handoff_stage")
    new_stage = HandoffStage.MAP if current_stage == HandoffStage.INIT else current_stage
    
    await db.revenue_workflow_handoffs.update_one(
        {"lead_id": lead_id},
        {"$set": {
            "mapped_data": mapping.model_dump() if hasattr(mapping, "model_dump") else mapping.dict(),
            "handoff_stage": new_stage,
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    return {"success": True, "new_stage": new_stage}


@router.patch("/{lead_id}/stage")
async def advance_handoff_stage(lead_id: str, db = Depends(get_db)):
    """Advance the handoff stage sequentially: Init → Map → Push.
    Does NOT execute the push — that requires POST /push explicitly."""
    handoff = await db.revenue_workflow_handoffs.find_one({"lead_id": lead_id})
    if not handoff:
        raise HTTPException(status_code=404, detail="Handoff record not found.")

    current_stage = handoff.get("handoff_stage")

    STAGE_PROGRESSION = {
        HandoffStage.INIT: HandoffStage.MAP,
        HandoffStage.MAP:  HandoffStage.PUSH,
    }

    next_stage = STAGE_PROGRESSION.get(current_stage)
    if not next_stage:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot advance from stage '{current_stage}'. Already at {current_stage}."
        )

    await db.revenue_workflow_handoffs.update_one(
        {"lead_id": lead_id},
        {"$set": {
            "handoff_stage": next_stage,
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    return {"success": True, "previous_stage": current_stage, "new_stage": next_stage}


@router.post("/{lead_id}/push")

async def initiate_handoff_push(lead_id: str, request: Request, user_id: str = "system", db = Depends(get_db)):
    """Trigger the formal push to Operations (Work Order) and Finance (Invoice)."""
    result = await HandoffService.execute_push(lead_id, user_id, db)
    if not result.get("success"):
        # Return 400 with structured errors — never 500
        raise HTTPException(
            status_code=400,
            detail=result.get("errors") or result.get("error") or "Handoff push failed."
        )
    return result
