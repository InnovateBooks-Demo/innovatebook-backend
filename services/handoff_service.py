"""
Handoff Service - Revenue Workflow
Handles validation and execution of data transfer from Contract to Operations/Finance.
"""
from datetime import datetime, timezone
import uuid
import logging
from typing import Dict, Any, List, Optional
from models.commerce_models import (
    RevenueHandoff, 
    HandoffStage, 
    HandoffStatus,
    HandoffMetadata,
    MappingSnapshot,
    ValidationStatus
)

logger = logging.getLogger(__name__)

class HandoffService:
    @staticmethod
    async def auto_create_handoff(lead_id: str, contract_id: str, db) -> RevenueHandoff:
        """
        Triggered when a contract is signed.
        Initializes the handoff record with a commercial baseline.
        """
        # 1. Idempotency Check (Prevent duplicate creation via lead_id)
        existing = await db.revenue_workflow_handoffs.find_one({"lead_id": lead_id})
        if existing:
            # Strip MongoDB internal _id for Pydantic compatibility
            existing.pop("_id", None)
            return RevenueHandoff(**existing)

        # 2. Fetch Source Documents
        contract = await db.revenue_workflow_contracts.find_one({"contract_id": contract_id})
        if not contract:
            logger.error(f"Auto-create handoff failed: Contract {contract_id} not found.")
            raise ValueError(f"Contract {contract_id} not found for handoff.")

        # Ensure correct status (Defense)
        current_status = contract.get("contract_status")
        if current_status != "SIGNED":
             logger.warning(f"Aborting handoff creation for lead {lead_id}: Contract status is {current_status}, not SIGNED.")
             raise ValueError(f"Cannot initialize handoff: Contract status is {current_status} (expected SIGNED).")

        # Resolve commercial snapshot — dual-schema support
        # New contracts use `commercial_snapshot`, older ones use `contract_data`
        snapshot = contract.get("commercial_snapshot")
        if snapshot:
            logger.info(f"[Handoff] Using commercial_snapshot for contract {contract_id}.")
        else:
            snapshot = contract.get("contract_data")
            if snapshot:
                logger.warning(f"[Handoff] Using contract_data fallback for contract {contract_id}. Consider migrating to commercial_snapshot.")
            else:
                logger.error(f"[Handoff] Commercial baseline missing for contract {contract_id}.")
                raise ValueError(f"Commercial baseline missing for contract {contract_id}. Neither commercial_snapshot nor contract_data found.")

        # Normalize snapshot fields — handles field name variations across schema versions
        snapshot = dict(snapshot) if snapshot else {}
        normalized = {
            "client_name": snapshot.get("client_name") or snapshot.get("party_name", ""),
            "items":       snapshot.get("items", []),
            "total_value": snapshot.get("total_value", 0.0),
            "currency":    snapshot.get("currency", "INR"),
        }

        # Resolve onboarding (non-blocking — PENDING if missing)
        onboarding = await db.revenue_workflow_onboarding.find_one({"contract_id": contract_id})
        if not onboarding:
            logger.warning(f"[Handoff] Onboarding not found for contract {contract_id}. Setting onboarding_id=PENDING.")
        onboarding_id = (onboarding or {}).get("onboarding_id") or "PENDING"

        # 3. Capture Commercial Metadata (Baseline)
        metadata = HandoffMetadata(
            currency=normalized["currency"],
            total_value=normalized["total_value"],
            payment_terms=contract.get("payment_terms", "Net 30"),
            captured_at=datetime.now(timezone.utc)
        )

        # 4. Generate Handoff Record
        count = await db.revenue_workflow_handoffs.count_documents({})
        handoff_id = f"REV-HO-2026-{str(count + 1).zfill(4)}"

        handoff_doc = {
            "id": str(uuid.uuid4()),
            "handoff_id": handoff_id,
            "lead_id": lead_id,
            "contract_id": contract_id,
            "onboarding_id": onboarding_id,
            "handoff_stage": HandoffStage.INIT,
            "handoff_status": HandoffStatus.PENDING,
            "handoff_metadata": metadata.model_dump() if hasattr(metadata, "model_dump") else metadata.dict(),
            "mapped_data": MappingSnapshot().model_dump() if hasattr(MappingSnapshot(), "model_dump") else MappingSnapshot().dict(),
            "validation_status": ValidationStatus.PENDING,
            "errors": [],
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }

        await db.revenue_workflow_handoffs.insert_one(handoff_doc)
        logger.info(f"Handoff record created: {handoff_id}", extra={"lead_id": lead_id, "contract_id": contract_id})
        
        # Strip _id before returning
        handoff_doc.pop("_id", None)
        return RevenueHandoff(**handoff_doc)

    @staticmethod
    async def validate_revenue_handoff(handoff: RevenueHandoff, db) -> Dict[str, Any]:
        """
        Comprehensive multi-module validation suite for Handoff.
        Refined with defensive null checks.
        """
        errors = []
        
        # 1. Resolve Onboarding Record
        onboarding = await db.revenue_workflow_onboarding.find_one({"contract_id": handoff.contract_id})
        
        if not onboarding:
            errors.append("Onboarding record not found for this contract.")
        else:
            # 2. Onboarding Status Guard
            onb_status = onboarding.get("onboarding_status") or onboarding.get("status")
            if onb_status != "COMPLETED":
                errors.append(f"Onboarding must be COMPLETED (current: {onb_status}).")
            
            # 3. Tax & Identity Checks
            if not onboarding.get("gst"):
                errors.append("Validated GST ID is missing from onboarding record.")
            if not onboarding.get("address") and not onboarding.get("billing_address"):
                errors.append("Billing address is required for finance record creation.")
            
        # 4. Delivery Ownership — check every item has an owner
        mapping_data = handoff.mapped_data
        ops_mapping = mapping_data.ops_mapping if hasattr(mapping_data, "ops_mapping") else (mapping_data or {}).get("ops_mapping", [])

        if not ops_mapping:
            errors.append("Ops mapping is empty. All contract items must be mapped before PUSH.")
        else:
            items_without_owner = [
                m.get("item_id", "unknown") for m in ops_mapping
                if not m.get("delivery_owner_id")
            ]
            if items_without_owner:
                errors.append(f"Delivery Owner missing for item(s): {items_without_owner}.")

        # 5. Commercial Integrity — dual-schema snapshot, every item must be mapped
        contract = await db.revenue_workflow_contracts.find_one({"contract_id": handoff.contract_id})
        if not contract:
            errors.append("Source contract not found.")
        else:
            contract_data = dict(contract)
            snapshot = contract_data.get("commercial_snapshot") or contract_data.get("contract_data") or {}
            contract_items = snapshot.get("items", [])

            mapped_item_ids = {m.get("item_id") for m in ops_mapping}
            for item in contract_items:
                i_id = item.get("item_id") or item.get("id")
                if i_id and i_id not in mapped_item_ids:
                    errors.append(f"Contract item '{item.get('item_name', i_id)}' is not mapped.")

        return {
            "success": len(errors) == 0,
            "errors": errors
        }

    @staticmethod
    async def execute_handoff_push(lead_id: str, user_id: str, db) -> Dict[str, Any]:
        """
        Executes record creation in Ops and Finance modules.
        Fully wrapped — NEVER returns HTTP 500 for business errors.
        All failures are logged with exc_info for full traceability.
        """
        # ── TOP-LEVEL SAFETY NET ─────────────────────────────────────────────
        try:
            logger.info(f"[HANDOFF PUSH START] lead_id={lead_id} user_id={user_id}")

            # 1. Fetch Handoff Document
            handoff_doc = await db.revenue_workflow_handoffs.find_one({"lead_id": lead_id})
            if not handoff_doc:
                logger.warning(f"[HANDOFF PUSH] No handoff record found for lead_id={lead_id}")
                return {
                    "success": False,
                    "handoff_status": "failed",
                    "errors": [f"Handoff record not found for lead {lead_id}"]
                }

            # Safe copy — strip MongoDB internal _id
            handoff_data = dict(handoff_doc)
            handoff_data.pop("_id", None)
            logger.info(f"[HANDOFF PUSH] Found handoff {handoff_data.get('handoff_id')} stage={handoff_data.get('handoff_stage')} status={handoff_data.get('handoff_status')}")

            # 2. Idempotency — already fully completed
            if handoff_data.get("handoff_status") == HandoffStatus.COMPLETED:
                logger.info(f"[HANDOFF PUSH] Already completed — returning early.")
                return {
                    "success": True,
                    "handoff_status": HandoffStatus.COMPLETED,
                    "handoff_stage": HandoffStage.DONE,
                    "operations_record_id": handoff_data.get("operations_record_id"),
                    "finance_record_id": handoff_data.get("finance_record_id"),
                    "errors": [],
                    "message": "Handoff already completed."
                }

            # 3. Pre-flight Validation (build Pydantic object safely)
            try:
                handoff_obj = RevenueHandoff(**handoff_data)
            except Exception as pydantic_err:
                logger.error(f"[HANDOFF PUSH] Pydantic model error: {pydantic_err}", exc_info=True)
                return {
                    "success": False,
                    "handoff_status": "failed",
                    "errors": [f"Handoff data schema error: {str(pydantic_err)}"]
                }

            try:
                val_result = await HandoffService.validate_revenue_handoff(handoff_obj, db)
            except Exception as val_err:
                logger.error(f"[HANDOFF PUSH] Validation threw exception: {val_err}", exc_info=True)
                return {
                    "success": False,
                    "handoff_status": "failed",
                    "errors": [f"Validation error: {str(val_err)}"]
                }

            if not val_result["success"]:
                logger.warning(f"[HANDOFF PUSH] Validation failed: {val_result['errors']}")
                return {
                    "success": False,
                    "handoff_status": "failed",
                    "errors": val_result["errors"]
                }

            # 4. Transition to IN_PROGRESS
            await db.revenue_workflow_handoffs.update_one(
                {"lead_id": lead_id},
                {"$set": {
                    "handoff_status": HandoffStatus.IN_PROGRESS,
                    "handoff_stage": HandoffStage.PUSH,
                    "updated_at": datetime.now(timezone.utc)
                }}
            )
            logger.info(f"[HANDOFF PUSH] Stage set to PUSH/IN_PROGRESS")

            success_count = 0
            total_tasks = 2
            errors = []
            wo_id = handoff_data.get("operations_record_id")
            inv_id = handoff_data.get("finance_record_id")

            # 5. CREATE OPERATIONS RECORD (Work Order)
            if not wo_id:
                try:
                    wo_id = f"WO-{lead_id}-{str(uuid.uuid4())[:8]}"
                    logger.info(f"[HANDOFF PUSH] Creating Work Order {wo_id}")

                    contract = await db.revenue_workflow_contracts.find_one(
                        {"contract_id": handoff_data.get("contract_id")}
                    )
                    lead = await db.revenue_workflow_leads.find_one({"lead_id": lead_id})
                    lead_safe = dict(lead) if lead else {}
                    contract_safe = dict(contract) if contract else {}

                    work_order = {
                        "work_order_id": wo_id,
                        "source_contract_id": handoff_data.get("contract_id", ""),
                        "source_type": "revenue",
                        "party_id": lead_id,
                        "party_name": (
                            lead_safe.get("company_name")
                            or lead_safe.get("party_name")
                            or contract_safe.get("party_name", "")
                        ),
                        "status": "pending",
                        "created_by": user_id,
                        "created_at": datetime.now(timezone.utc).isoformat()
                    }
                    await db.ops_work_orders.insert_one(work_order)
                    success_count += 1
                    logger.info(f"[HANDOFF PUSH] Work Order created: {wo_id}")
                except Exception as ops_err:
                    logger.error(f"[HANDOFF PUSH OPS ERROR] {ops_err}", exc_info=True)
                    errors.append(f"Ops record creation failed: {str(ops_err)}")
            else:
                logger.info(f"[HANDOFF PUSH] Work Order already exists: {wo_id} — skipping.")
                success_count += 1  # Count pre-existing as success for idempotent retry

            # 6. CREATE FINANCE RECORD (Invoice Draft)
            if not inv_id:
                try:
                    inv_id = f"INV-DRAFT-{lead_id}-{str(uuid.uuid4())[:8]}"
                    logger.info(f"[HANDOFF PUSH] Creating Invoice {inv_id}")

                    metadata = handoff_data.get("handoff_metadata") or {}

                    invoice = {
                        "id": inv_id,
                        "customer_id": lead_id,
                        "contract_id": handoff_data.get("contract_id", ""),
                        "amount": metadata.get("total_value", 0),
                        "currency": metadata.get("currency", "INR"),
                        "payment_terms": metadata.get("payment_terms", "Net 30"),
                        "status": "draft",
                        "created_by": user_id,
                        "created_at": datetime.now(timezone.utc)
                    }
                    await db.invoices.insert_one(invoice)
                    success_count += 1
                    logger.info(f"[HANDOFF PUSH] Invoice created: {inv_id}")
                except Exception as fin_err:
                    logger.error(f"[HANDOFF PUSH FINANCE ERROR] {fin_err}", exc_info=True)
                    errors.append(f"Finance record creation failed: {str(fin_err)}")
            else:
                logger.info(f"[HANDOFF PUSH] Invoice already exists: {inv_id} — skipping.")
                success_count += 1  # Count pre-existing as success for idempotent retry

            # 7. Determine Final Status
            if success_count == total_tasks:
                final_status = HandoffStatus.COMPLETED
                final_stage  = HandoffStage.DONE
            elif success_count > 0:
                final_status = HandoffStatus.PARTIAL
                final_stage  = HandoffStage.PUSH
            else:
                final_status = HandoffStatus.FAILED
                final_stage  = HandoffStage.PUSH

            logger.info(f"[HANDOFF PUSH] Final: status={final_status} stage={final_stage} success_count={success_count}/{total_tasks}")

            # 8. Persist Final State
            await db.revenue_workflow_handoffs.update_one(
                {"lead_id": lead_id},
                {"$set": {
                    "handoff_stage":         final_stage,
                    "handoff_status":        final_status,
                    "operations_record_id":  wo_id,
                    "finance_record_id":     inv_id,
                    "errors":                errors,
                    "completed_at":          datetime.now(timezone.utc) if final_status == HandoffStatus.COMPLETED else None,
                    "updated_at":            datetime.now(timezone.utc)
                }}
            )

            return {
                "success":               final_status == HandoffStatus.COMPLETED,
                "handoff_status":        final_status,
                "handoff_stage":         final_stage,
                "operations_record_id":  wo_id,
                "finance_record_id":     inv_id,
                "errors":                errors
            }

        # ── ABSOLUTE SAFETY NET — catches anything that escaped above ────────
        except Exception as fatal_err:
            logger.error(f"[HANDOFF PUSH FATAL] lead_id={lead_id} error={fatal_err}", exc_info=True)
            try:
                await db.revenue_workflow_handoffs.update_one(
                    {"lead_id": lead_id},
                    {"$set": {
                        "handoff_status": HandoffStatus.FAILED,
                        "errors":         [str(fatal_err)],
                        "updated_at":     datetime.now(timezone.utc)
                    }}
                )
            except Exception:
                pass  # DB write failure — still must not raise
            return {
                "success":        False,
                "handoff_status": HandoffStatus.FAILED,
                "errors":         [str(fatal_err)]
            }

    # Alias so routes can call either name
    execute_push = execute_handoff_push


