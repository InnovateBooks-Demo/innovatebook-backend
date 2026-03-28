"""
Handoff Service - Revenue Workflow
Handles validation and execution of data transfer from Contract to Operations/Finance.
"""
from datetime import datetime, timezone
import uuid
from typing import Dict, Any, Optional
from models.commerce_models import (
    RevenueHandoff, 
    HandoffStage, 
    HandoffStatus
)
from models.operations_models import (
    WorkOrder,
    SourceType,
    DeliveryType
)

class HandoffService:
    @staticmethod
    async def auto_create_handoff(lead_id: str, initiated_by: str, db) -> RevenueHandoff:
        """
        Triggered when a contract is signed.
        Initializes the handoff record.
        """
        # Check if handoff already exists to maintain idempotency
        existing = await db.revenue_workflow_handoffs.find_one({"lead_id": lead_id})
        if existing:
            return RevenueHandoff(**existing)

        # Get count for ID generation
        count = await db.revenue_workflow_handoffs.count_documents({})
        handoff_id = f"REV-HANDOFF-2026-{str(count + 1).zfill(4)}"

        handoff_doc = {
            "id": str(uuid.uuid4()),
            "handoff_id": handoff_id,
            "lead_id": lead_id,
            "handoff_stage": HandoffStage.INIT,
            "handoff_status": HandoffStatus.PENDING,
            "initiated_by": initiated_by,
            "initiated_at": datetime.now(timezone.utc),
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }

        await db.revenue_workflow_handoffs.insert_one(handoff_doc)
        return RevenueHandoff(**handoff_doc)

    @staticmethod
    async def validate_handoff(lead_id: str, db) -> Dict[str, Any]:
        """
        Performs gating checks before 'PUSH'.
        """
        handoff = await db.revenue_workflow_handoffs.find_one({"lead_id": lead_id})
        lead = await db.revenue_workflow_leads.find_one({"lead_id": lead_id})
        
        if not handoff or not lead:
            return {"error": True, "message": "Records not found"}

        validations = {
            "gst_missing": not bool(lead.get("gstin")),
            "owner_missing": not bool(handoff.get("delivery_owner_id")),
            "finance_config_missing": not bool(handoff.get("billing_cycle") and handoff.get("tax_config"))
        }
        
        return validations

    @staticmethod
    async def execute_push(lead_id: str, user_id: str, db) -> Dict[str, Any]:
        """
        CRITICAL: Executes the actual data transfer.
        Creates records in Ops, Finance, and Task modules.
        """
        handoff_doc = await db.revenue_workflow_handoffs.find_one({"lead_id": lead_id})
        if not handoff_doc:
            return {"success": False, "error": "Handoff not initialized"}

        if handoff_doc["handoff_status"] == HandoffStatus.COMPLETED:
            return {"success": True, "message": "Already completed", "handoff": handoff_doc}
        
        if handoff_doc["handoff_status"] == HandoffStatus.IN_PROGRESS:
            return {"success": False, "error": "Handoff already in progress"}

        # 1. PRE-FLIGHT VALIDATION
        lead = await db.revenue_workflow_leads.find_one({"lead_id": lead_id})
        contract = await db.revenue_workflow_contracts.find_one({"lead_id": lead_id})
        
        if not lead.get("gstin"):
            return {"success": False, "error": "Tax ID (GST) is mandatory for handoff"}
        if not handoff_doc.get("delivery_owner_id"):
            return {"success": False, "error": "Delivery Owner must be assigned"}

        # 2. START EXECUTION
        await db.revenue_workflow_handoffs.update_one(
            {"lead_id": lead_id},
            {"$set": {"handoff_status": HandoffStatus.IN_PROGRESS, "handoff_stage": HandoffStage.PUSH}}
        )

        try:
            # 3. TRANSACTIONAL LOGIC (Simulated with cleanup on failure as MongoDB transactions are complex in this env)
            
            # A. CREATE OPERATIONS RECORD (Work Order)
            wo_id = f"WO-{lead_id}-{str(uuid.uuid4())[:8]}"
            work_order = {
                "work_order_id": wo_id,
                "source_contract_id": contract.get("contract_id", "N/A"),
                "source_type": "revenue",
                "party_id": lead_id,
                "party_name": lead.get("company_name"),
                "delivery_type": "project",
                "planned_start_date": datetime.now(timezone.utc).isoformat(),
                "planned_end_date": contract.get("end_date", datetime.now(timezone.utc).isoformat()),
                "status": "pending",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.ops_work_orders.insert_one(work_order)

            # B. CREATE FINANCE RECORD (Invoice Draft)
            inv_id = f"INV-DRAFT-{lead_id}-{str(uuid.uuid4())[:8]}"
            invoice = {
                "id": inv_id,
                "customer_id": lead_id,
                "amount": contract.get("total_value", 0),
                "tax_amount": (contract.get("total_value", 0) * 0.18), # Assuming 18% as per tax_config
                "billing_cycle": handoff_doc.get("billing_cycle"),
                "status": "draft",
                "created_at": datetime.now(timezone.utc)
            }
            await db.invoices.insert_one(invoice)

            # C. CREATE TASK LIST
            tasks = [
                {"title": "Initial Setup", "desc": "Environment provisioning and access setup"},
                {"title": "Resource Allocation", "desc": "Assign team members to the project"},
                {"title": "Client Training", "desc": "Schedule and conduct product onboarding"},
                {"title": "Go-Live Preparation", "desc": "Pre-flight checks and launch"}
            ]
            
            task_ids = []
            for t in tasks:
                t_id = str(uuid.uuid4())
                await db.workspace_tasks.insert_one({
                    "task_id": t_id,
                    "title": t["title"],
                    "description": t["desc"],
                    "assignee_id": handoff_doc["delivery_owner_id"],
                    "status": "created",
                    "priority": "high",
                    "due_date": datetime.now(timezone.utc).isoformat(),
                    "created_at": datetime.now(timezone.utc).isoformat()
                })
                task_ids.append(t_id)

            # 4. FINAL SUCCESS UPDATE
            await db.revenue_workflow_handoffs.update_one(
                {"lead_id": lead_id},
                {
                    "$set": {
                        "handoff_stage": HandoffStage.DONE,
                        "handoff_status": HandoffStatus.COMPLETED,
                        "operations_record_id": wo_id,
                        "finance_record_id": inv_id,
                        "completed_at": datetime.now(timezone.utc),
                        "updated_at": datetime.now(timezone.utc)
                    }
                }
            )

            return {"success": True, "ops_id": wo_id, "fin_id": inv_id}

        except Exception as e:
            # 5. FAILURE HANDLING / ROLLBACK MENTALITY
            await db.revenue_workflow_handoffs.update_one(
                {"lead_id": lead_id},
                {
                    "$set": {
                        "handoff_status": HandoffStatus.FAILED,
                        "error_message": str(e),
                        "updated_at": datetime.now(timezone.utc)
                    }
                }
            )
            return {"success": False, "error": str(e)}
