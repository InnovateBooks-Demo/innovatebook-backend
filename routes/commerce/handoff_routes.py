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
from routes.deps import get_db, get_current_user_member

_logger = _logging.getLogger(__name__)

router = APIRouter(prefix="/revenue/handoff", tags=["Handoff"])


# ── Helpers ────────────────────────────────────────────────────────────────

def _normalize_items(raw_items: list) -> list:
    """Ensure every item has item_id and unified field names."""
    normalized = []
    for i, item in enumerate(raw_items or []):
        item_id = item.get("item_id") or item.get("id") or f"ITEM-{i + 1:03d}"
        normalized.append({
            "item_id":   item_id,
            "name":      item.get("name") or item.get("item_name") or f"Item {i + 1}",
            "quantity":  item.get("quantity", 0),
            "price":     item.get("price") or item.get("unit_price", 0),
            "total":     item.get("total") or item.get("total_price", 0),
        })
    return normalized


# ── GET /{lead_id} ─────────────────────────────────────────────────────────

@router.get("/{lead_id}")
async def get_handoff_details(
    lead_id: str,
    current_user: dict = Depends(get_current_user_member),
    db = Depends(get_db)
):
    """Return a structured Execution Summary for the Handoff module."""
    user_id = current_user["user_id"]
    org_id  = current_user.get("org_id")

    try:
        _logger.info(f"[HANDOFF GET] lead_id={lead_id} user_id={user_id} org_id={org_id}")
        handoff = await db.revenue_workflow_handoffs.find_one({"lead_id": lead_id})

        if not handoff:
            contract = await db.revenue_workflow_contracts.find_one({
                "lead_id": lead_id,
                "contract_status": "SIGNED"
            })
            if contract:
                try:
                    _logger.info(f"[HANDOFF GET] Auto-creating handoff for lead={lead_id} by user={user_id}")
                    await HandoffService.auto_create_handoff(lead_id, contract["contract_id"], db)
                    handoff = await db.revenue_workflow_handoffs.find_one({"lead_id": lead_id})
                except Exception as init_err:
                    _logger.error(f"[HANDOFF GET] Auto-create failed: {init_err}", exc_info=True)
                    raise HTTPException(
                        status_code=400,
                        detail=f"Handoff initialization failed: {str(init_err)}"
                    )

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

        # ── Enrich: Contract ────────────────────────────────────────────
        contract = await db.revenue_workflow_contracts.find_one(
            {"contract_id": handoff_data.get("contract_id")}
        )
        contract_data = dict(contract) if contract else {}
        snapshot = contract_data.get("commercial_snapshot") or contract_data.get("contract_data") or {}
        items = _normalize_items(snapshot.get("items", []))

        summary = {
            "client_name": (
                contract_data.get("party_name")
                or snapshot.get("client_name")
                or snapshot.get("party_name", "")
            ),
            "items":       items,
            "total_value": snapshot.get("total_value", 0),
            "currency":    snapshot.get("currency", "INR"),
            "duration":    snapshot.get("duration", ""),
        }

        # ── Enrich: Onboarding ──────────────────────────────────────────
        onboarding = await db.revenue_workflow_onboarding.find_one(
            {"contract_id": handoff_data.get("contract_id")}
        )
        onboarding_data = dict(onboarding) if onboarding else {}
        onboarding_data.pop("_id", None)

        onboarding_block = {
            "status":          onboarding_data.get("onboarding_status", "PENDING"),
            "gst":             onboarding_data.get("gst", ""),
            "billing_address": onboarding_data.get("address") or onboarding_data.get("billing_address", ""),
            "contacts": {
                "billing": onboarding_data.get("billing_contact", ""),
                "admin":   onboarding_data.get("admin_contact", ""),
            },
            "documents": onboarding_data.get("documents", {}),
        }

        # ── Clean handoff block (mapped_data preserved exactly) ─────────
        handoff_block = {
            "lead_id":              handoff_data.get("lead_id"),
            "contract_id":          handoff_data.get("contract_id"),
            "onboarding_id":        handoff_data.get("onboarding_id"),
            "handoff_id":           handoff_data.get("handoff_id"),
            "handoff_stage":        handoff_data.get("handoff_stage"),
            "handoff_status":       handoff_data.get("handoff_status"),
            "mapped_data":          handoff_data.get("mapped_data", {}),
            "operations_record_id": handoff_data.get("operations_record_id"),
            "finance_record_id":    handoff_data.get("finance_record_id"),
            "validation_status":    handoff_data.get("validation_status"),
            "errors":               handoff_data.get("errors", []),
            "handoff_metadata":     handoff_data.get("handoff_metadata", {}),
        }

        _logger.info(
            f"[HANDOFF GET] OK stage={handoff_block['handoff_stage']} "
            f"status={handoff_block['handoff_status']} lead={lead_id} user={user_id}"
        )
        return {"summary": summary, "onboarding": onboarding_block, "handoff": handoff_block}

    except HTTPException:
        raise
    except Exception as e:
        _logger.error(f"[HANDOFF GET FATAL] lead_id={lead_id} user_id={user_id} error={e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to load handoff data. Please try again.")


# ── PATCH /{lead_id}/mapping ────────────────────────────────────────────────

@router.patch("/{lead_id}/mapping")
async def update_handoff_mapping(
    lead_id: str,
    mapping: MappingSnapshot,
    current_user: dict = Depends(get_current_user_member),
    db = Depends(get_db)
):
    """Autosave delivery owner assignments. Transitions Init → Map stage."""
    user_id = current_user["user_id"]
    try:
        _logger.info(f"[HANDOFF MAPPING] lead_id={lead_id} user_id={user_id}")
        handoff = await db.revenue_workflow_handoffs.find_one({"lead_id": lead_id})
        if not handoff:
            raise HTTPException(status_code=404, detail="Handoff record not found.")

        if handoff.get("handoff_stage") == HandoffStage.DONE:
            raise HTTPException(status_code=400, detail="Handoff is completed and locked for edits.")

        current_stage = handoff.get("handoff_stage")
        new_stage = HandoffStage.MAP if current_stage == HandoffStage.INIT else current_stage
        mapping_dict = mapping.model_dump() if hasattr(mapping, "model_dump") else mapping.dict()

        await db.revenue_workflow_handoffs.update_one(
            {"lead_id": lead_id},
            {"$set": {
                "mapped_data":    mapping_dict,
                "handoff_stage":  new_stage,
                "last_mapped_by": user_id,
                "updated_at":     datetime.now(timezone.utc)
            }}
        )
        _logger.info(f"[HANDOFF MAPPING] Saved stage={new_stage} lead={lead_id} user={user_id}")
        return {"success": True, "new_stage": new_stage}

    except HTTPException:
        raise
    except Exception as e:
        _logger.error(f"[HANDOFF MAPPING ERROR] lead_id={lead_id} user_id={user_id} error={e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to save mapping. Please try again.")


# ── PATCH /{lead_id}/stage ─────────────────────────────────────────────────

@router.patch("/{lead_id}/stage")
async def advance_handoff_stage(
    lead_id: str,
    current_user: dict = Depends(get_current_user_member),
    db = Depends(get_db)
):
    """Sequential stage advancement: Init → Map → Push.
    Does NOT execute the push — that requires POST /push explicitly."""
    user_id = current_user["user_id"]
    try:
        _logger.info(f"[HANDOFF STAGE] Advance request lead_id={lead_id} user_id={user_id}")
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
                detail=f"Cannot advance beyond '{current_stage}'. Stage is already at its final position."
            )

        # ── Server-side guard: Map → Push requires complete mapping ───────
        if current_stage == HandoffStage.MAP:
            mapped_data = handoff.get("mapped_data") or {}
            ops_mapping = mapped_data.get("ops_mapping", []) if isinstance(mapped_data, dict) else []
            unassigned  = [m for m in ops_mapping if not m.get("delivery_owner_id")]
            if not ops_mapping or unassigned:
                count = len(unassigned) if unassigned else "all"
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Cannot proceed to Push: {count} item(s) have no Delivery Owner assigned. "
                        "Assign all owners in the Mapping stage first."
                    )
                )

        await db.revenue_workflow_handoffs.update_one(
            {"lead_id": lead_id},
            {"$set": {
                "handoff_stage":     next_stage,
                "stage_advanced_by": user_id,
                "updated_at":        datetime.now(timezone.utc)
            }}
        )
        _logger.info(
            f"[HANDOFF STAGE] Advanced {current_stage} → {next_stage} "
            f"lead={lead_id} user={user_id}"
        )
        return {"success": True, "previous_stage": current_stage, "new_stage": next_stage}

    except HTTPException:
        raise
    except Exception as e:
        _logger.error(f"[HANDOFF STAGE ERROR] lead_id={lead_id} user_id={user_id} error={e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to advance stage. Please try again.")


# ── POST /{lead_id}/push ───────────────────────────────────────────────────

@router.post("/{lead_id}/push")
async def initiate_handoff_push(
    lead_id: str,
    current_user: dict = Depends(get_current_user_member),
    db = Depends(get_db)
):
    """Trigger the formal push to Operations (Work Order) and Finance (Invoice).
    user_id is extracted from the JWT — never passed as a query param."""
    user_id = current_user["user_id"]
    org_id  = current_user.get("org_id")

    _logger.info(
        f"[HANDOFF PUSH] Push request lead_id={lead_id} "
        f"user_id={user_id} org_id={org_id}"
    )
    try:
        result = await HandoffService.execute_push(lead_id, user_id, db, org_id=org_id)

        _logger.info(
            f"[HANDOFF PUSH] Result: status={result.get('handoff_status')} "
            f"stage={result.get('handoff_stage')} "
            f"ops={result.get('operations_record_id')} "
            f"fin={result.get('finance_record_id')} "
            f"errors={result.get('errors')} "
            f"lead={lead_id} user={user_id}"
        )

        if not result.get("success"):
            raise HTTPException(
                status_code=400,
                detail={
                    "handoff_status":       result.get("handoff_status", "failed"),
                    "errors":               result.get("errors", []),
                    "operations_record_id": result.get("operations_record_id"),
                    "finance_record_id":    result.get("finance_record_id"),
                }
            )
        return result

    except HTTPException:
        raise
    except Exception as e:
        _logger.error(f"[HANDOFF PUSH FATAL] lead_id={lead_id} user_id={user_id} error={e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "handoff_status": "failed",
                "errors":         ["An unexpected server error occurred. Please contact support."],
            }
        )
