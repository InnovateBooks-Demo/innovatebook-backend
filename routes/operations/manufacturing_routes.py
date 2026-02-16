"""
Manufacturing Lead Module - API Routes
Complete CRUD operations, workflow engine, feasibility checks, costing, approvals
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date
import os
from motor.motor_asyncio import AsyncIOMotorClient

from manufacturing_models import (
    ManufacturingLead, ManufacturingLeadCreate, ManufacturingLeadUpdate,
    CustomerMaster, ProductFamilyMaster, SKUMaster, BOMMaster, RawMaterialMaster,
    PlantMaster, PriceListMaster, UOMMaster, CurrencyMaster, TaxMaster,
    LeadStatus, WorkflowStage, FeasibilityStatus, ApprovalStatus, ApprovalType,
    TechnicalSpecification, CommercialData, FeasibilityCheck, CostingData,
    ApprovalRecord, AuditLog, WorkflowTransition, RolePermissions, UserRole
)

# Import Phase 3 engines
from manufacturing_automation_engine import automation_engine
from manufacturing_validation_engine import validation_engine

router = APIRouter(prefix="/api/manufacturing", tags=["Manufacturing"])

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client['innovate_books_db']

# Collections
leads_collection = db['mfg_leads']
customers_collection = db['mfg_customers']
product_families_collection = db['mfg_product_families']
skus_collection = db['mfg_skus']
boms_collection = db['mfg_boms']
raw_materials_collection = db['mfg_raw_materials']
plants_collection = db['mfg_plants']
price_lists_collection = db['mfg_price_lists']
uoms_collection = db['mfg_uoms']
currencies_collection = db['mfg_currencies']
taxes_collection = db['mfg_taxes']
roles_collection = db['mfg_roles']


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def serialize_doc(doc):
    """Convert MongoDB document to JSON-serializable format"""
    if doc is None:
        return None
    
    # Only convert _id if it exists (main documents have it, nested ones don't)
    if '_id' in doc:
        doc['_id'] = str(doc['_id'])
    
    # Handle datetime serialization
    for key, value in doc.items():
        if isinstance(value, datetime):
            doc[key] = value.isoformat()
        elif isinstance(value, date):
            doc[key] = value.isoformat()
        elif isinstance(value, list):
            doc[key] = [serialize_doc(item) if isinstance(item, dict) else item for item in value]
        elif isinstance(value, dict):
            doc[key] = serialize_doc(value)
    return doc


async def generate_lead_id():
    """Generate next lead ID: MFGL-2025-0001"""
    year = datetime.now().year
    prefix = f"MFGL-{year}-"
    
    # Find last lead ID for this year
    last_lead = await leads_collection.find_one(
        {"lead_id": {"$regex": f"^{prefix}"}},
        sort=[("lead_id", -1)]
    )
    
    if last_lead:
        last_num = int(last_lead['lead_id'].split('-')[-1])
        new_num = last_num + 1
    else:
        new_num = 1
    
    return f"{prefix}{new_num:04d}"


def add_audit_log(lead: dict, user_id: str, user_name: str, action: str, notes: str = None, 
                  field_changed: str = None, old_value=None, new_value=None):
    """Add audit log entry to lead"""
    if 'audit_logs' not in lead:
        lead['audit_logs'] = []
    
    log_entry = {
        "timestamp": datetime.utcnow(),
        "user_id": user_id,
        "user_name": user_name,
        "action": action,
        "notes": notes,
        "field_changed": field_changed,
        "old_value": old_value,
        "new_value": new_value
    }
    lead['audit_logs'].append(log_entry)


# ============================================================================
# LEAD CRUD OPERATIONS
# ============================================================================

@router.post("/leads", response_model=dict)
async def create_lead(lead_data: ManufacturingLeadCreate):
    """
    Create a new manufacturing lead
    Validates customer, initializes workflow at Intake stage
    """
    # Mock current user for MVP (replace with actual auth)
    current_user = {
        "id": "user-001",
        "name": "Demo Sales Rep",
        "email": "demo@innovatebooks.com",
        "role": "Sales Rep"
    }
    
    # Validate customer exists
    customer = await customers_collection.find_one({"id": lead_data.customer_id})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Generate lead ID
    lead_id = await generate_lead_id()
    
    # Convert delivery date string to datetime object (MongoDB compatible)
    delivery_date = datetime.fromisoformat(lead_data.delivery_date_required)
    
    # Build technical specs
    tech_specs = TechnicalSpecification(
        material_grade=lead_data.material_grade,
        tolerances=lead_data.tolerances,
        surface_finish=lead_data.surface_finish,
        coating=lead_data.coating,
        certifications_required=lead_data.certifications_required or []
    )
    
    # Build commercial data
    commercial = CommercialData(
        expected_price_per_unit=lead_data.expected_price_per_unit,
        currency=lead_data.currency,
        payment_terms=lead_data.payment_terms
    )
    
    # Create lead document
    lead = ManufacturingLead(
        lead_id=lead_id,
        rfq_number=lead_data.rfq_number,
        priority=lead_data.priority,
        status=LeadStatus.NEW,
        current_stage=WorkflowStage.INTAKE,
        customer_id=lead_data.customer_id,
        customer_name=customer['customer_name'],
        customer_industry=customer['industry'],
        contact_person=lead_data.contact_person,
        contact_email=lead_data.contact_email,
        contact_phone=lead_data.contact_phone,
        product_family_id=lead_data.product_family_id,
        sku_id=lead_data.sku_id,
        product_description=lead_data.product_description,
        quantity=lead_data.quantity,
        uom=lead_data.uom,
        delivery_date_required=delivery_date,
        application=lead_data.application,
        technical_specs=tech_specs,
        commercial_data=commercial,
        sample_required=lead_data.sample_required,
        sample_quantity=lead_data.sample_quantity,
        feasibility=FeasibilityCheck(),
        created_by=current_user['id'],
        created_by_name=current_user['name']
    )
    
    # Add audit log
    lead_dict = lead.dict()
    add_audit_log(lead_dict, current_user['id'], current_user['name'], 
                  "created", f"Lead {lead_id} created")
    
    # Convert datetime objects to ISO strings for MongoDB
    for key, value in lead_dict.items():
        if isinstance(value, (datetime, date)):
            lead_dict[key] = value.isoformat()
        elif isinstance(value, dict):
            for sub_key, sub_value in value.items():
                if isinstance(sub_value, (datetime, date)):
                    value[sub_key] = sub_value.isoformat()
    
    # Insert to database
    result = await leads_collection.insert_one(lead_dict)
    
    if result.inserted_id:
        created_lead = await leads_collection.find_one({"_id": result.inserted_id})
        
        # Phase 3: Run validation
        validation_result = validation_engine.validate_lead(created_lead)
        
        # Phase 3: Trigger automation rules asynchronously
        try:
            automation_results = await automation_engine.execute_automation("lead_created", created_lead)
        except Exception as e:
            print(f"Automation error: {e}")
            automation_results = []
        
        # Get updated lead after automation
        updated_lead = await leads_collection.find_one({"_id": result.inserted_id})
        
        return {
            "success": True,
            "message": f"Manufacturing lead {lead_id} created successfully",
            "lead": serialize_doc(updated_lead),
            "validation": validation_result,
            "automation_triggered": len(automation_results) > 0,
            "automation_rules_executed": len(automation_results)
        }
    
    raise HTTPException(status_code=500, detail="Failed to create lead")


@router.get("/leads", response_model=dict)
async def get_leads(
    status: Optional[str] = None,
    stage: Optional[str] = None,
    priority: Optional[str] = None,
    customer_id: Optional[str] = None,
    assigned_to: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
):
    """
    Get list of manufacturing leads with filters
    """
    query = {}
    
    if status:
        query['status'] = status
    if stage:
        query['current_stage'] = stage
    if priority:
        query['priority'] = priority
    if customer_id:
        query['customer_id'] = customer_id
    if assigned_to:
        query['assigned_to'] = assigned_to
    
    total_count = await leads_collection.count_documents(query)
    leads = await leads_collection.find(query).skip(skip).limit(limit).sort("created_at", -1).to_list(length=limit)
    
    return {
        "total": total_count,
        "skip": skip,
        "limit": limit,
        "leads": [serialize_doc(lead) for lead in leads]
    }


@router.get("/leads/{lead_id}", response_model=dict)
async def get_lead_details(lead_id: str):
    """
    Get detailed information about a specific lead
    """
    lead = await leads_collection.find_one({"lead_id": lead_id})
    
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    return {
        "success": True,
        "lead": serialize_doc(lead)
    }


@router.put("/leads/{lead_id}", response_model=dict)
async def update_lead(lead_id: str, update_data: ManufacturingLeadUpdate):
    """
    Update manufacturing lead details
    """
    # Mock current user
    current_user = {
        "id": "user-001",
        "name": "Demo Sales Rep",
        "email": "demo@innovatebooks.com"
    }
    
    lead = await leads_collection.find_one({"lead_id": lead_id})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    # Build update dict (only non-None values)
    update_dict = {}
    update_data_dict = update_data.dict(exclude_unset=True)
    
    for key, value in update_data_dict.items():
        if value is not None:
            # Track changes for audit
            old_value = lead.get(key)
            if old_value != value:
                add_audit_log(lead, current_user['id'], current_user['name'],
                            "updated", field_changed=key, old_value=old_value, new_value=value)
                update_dict[key] = value
    
    if update_dict:
        update_dict['updated_at'] = datetime.utcnow()
        update_dict['audit_logs'] = lead['audit_logs']
        
        result = await leads_collection.update_one(
            {"lead_id": lead_id},
            {"$set": update_dict}
        )
        
        if result.modified_count > 0:
            updated_lead = await leads_collection.find_one({"lead_id": lead_id})
            return {
                "success": True,
                "message": f"Lead {lead_id} updated successfully",
                "lead": serialize_doc(updated_lead)
            }
    
    return {
        "success": True,
        "message": "No changes to update",
        "lead": serialize_doc(lead)
    }


@router.delete("/leads/{lead_id}", response_model=dict)
async def delete_lead(lead_id: str):
    """
    Delete a manufacturing lead (soft delete - mark as deleted)
    """
    current_user = {"id": "user-001", "name": "Admin"}
    
    lead = await leads_collection.find_one({"lead_id": lead_id})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    # Soft delete
    result = await leads_collection.update_one(
        {"lead_id": lead_id},
        {"$set": {"is_deleted": True, "deleted_at": datetime.utcnow(), "deleted_by": current_user['id']}}
    )
    
    if result.modified_count > 0:
        return {"success": True, "message": f"Lead {lead_id} deleted successfully"}
    
    raise HTTPException(status_code=500, detail="Failed to delete lead")


# ============================================================================
# WORKFLOW OPERATIONS
# ============================================================================

class StageTransitionRequest(BaseModel):
    to_stage: str
    notes: Optional[str] = None

@router.patch("/leads/{lead_id}/stage", response_model=dict)
async def transition_workflow_stage(
    lead_id: str,
    request: StageTransitionRequest
):
    """
    Transition lead to next workflow stage
    Validates stage progression rules (relaxed for MVP)
    """
    current_user = {"id": "user-001", "name": "Demo User"}
    
    lead = await leads_collection.find_one({"lead_id": lead_id})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    from_stage = lead['current_stage']
    to_stage_value = request.to_stage
    
    # Relaxed stage progression rules for MVP (allow most transitions)
    valid_transitions = {
        "Intake": ["Feasibility", "Costing"],  # Allow skip
        "Feasibility": ["Costing", "Intake", "Approval"],  # Flexible
        "Costing": ["Approval", "Feasibility", "Intake"],  # Can go back
        "Approval": ["Convert", "Costing", "Feasibility"],  # Can go back multiple stages
        "Convert": []  # Terminal stage
    }
    
    if to_stage_value not in valid_transitions.get(from_stage, []):
        # For MVP, just warn but allow transition (less strict)
        print(f"⚠️ Warning: Non-standard transition from {from_stage} to {to_stage_value}")
    
    # Update stage and add audit log
    add_audit_log(lead, current_user['id'], current_user['name'],
                  "stage_changed", notes=request.notes, field_changed="current_stage",
                  old_value=from_stage, new_value=to_stage_value)
    
    # Update status based on stage
    status_map = {
        "Intake": LeadStatus.INTAKE,
        "Feasibility": LeadStatus.FEASIBILITY_CHECK,
        "Costing": LeadStatus.COSTING,
        "Approval": LeadStatus.APPROVAL_PENDING,
        "Convert": LeadStatus.CONVERTED
    }
    
    result = await leads_collection.update_one(
        {"lead_id": lead_id},
        {
            "$set": {
                "current_stage": to_stage_value,
                "status": status_map.get(to_stage_value, LeadStatus.NEW).value,
                "updated_at": datetime.utcnow(),
                "audit_logs": lead['audit_logs']
            }
        }
    )
    
    if result.modified_count > 0:
        updated_lead = await leads_collection.find_one({"lead_id": lead_id})
        
        # Phase 3: Trigger automation for stage change
        try:
            automation_results = await automation_engine.execute_automation("stage_changed", updated_lead)
        except Exception as e:
            print(f"Automation error on stage change: {e}")
            automation_results = []
        
        # Get lead again after automation
        final_lead = await leads_collection.find_one({"lead_id": lead_id})
        
        return {
            "success": True,
            "message": f"Lead transitioned from {from_stage} to {to_stage_value}",
            "lead": serialize_doc(final_lead),
            "automation_triggered": len(automation_results) > 0,
            "automation_rules_executed": len(automation_results)
        }
    
    raise HTTPException(status_code=500, detail="Failed to update stage")


# ============================================================================
# FEASIBILITY OPERATIONS
# ============================================================================

@router.post("/leads/{lead_id}/feasibility", response_model=dict)
async def update_feasibility(
    lead_id: str,
    feasibility_type: str,  # "engineering", "production", "qc", "rm"
    is_feasible: bool,
    notes: Optional[str] = None,
    plant_id: Optional[str] = None,
    rm_lead_time: Optional[int] = None,
# removed current_user parameter
):
    """
    Update feasibility check for a specific area
    """
    current_user = {"id": "user-001", "name": "Engineering Lead", "role": "Engineering Lead"}
    
    lead = await leads_collection.find_one({"lead_id": lead_id})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    feasibility = lead.get('feasibility', {})
    
    # Update specific feasibility area
    if feasibility_type == "engineering":
        feasibility['engineering_feasible'] = is_feasible
        feasibility['engineering_notes'] = notes
        feasibility['engineering_checked_by'] = current_user['name']
        feasibility['engineering_checked_at'] = datetime.utcnow()
    elif feasibility_type == "production":
        feasibility['production_feasible'] = is_feasible
        feasibility['production_notes'] = notes
        feasibility['production_plant_id'] = plant_id
        feasibility['production_checked_by'] = current_user['name']
        feasibility['production_checked_at'] = datetime.utcnow()
    elif feasibility_type == "qc":
        feasibility['qc_feasible'] = is_feasible
        feasibility['qc_notes'] = notes
        feasibility['qc_checked_by'] = current_user['name']
        feasibility['qc_checked_at'] = datetime.utcnow()
    elif feasibility_type == "rm":
        feasibility['rm_feasible'] = is_feasible
        feasibility['rm_notes'] = notes
        feasibility['rm_lead_time'] = rm_lead_time
    else:
        raise HTTPException(status_code=400, detail="Invalid feasibility type")
    
    # Calculate overall feasibility status
    eng = feasibility.get('engineering_feasible')
    prod = feasibility.get('production_feasible')
    qc_check = feasibility.get('qc_feasible')
    rm = feasibility.get('rm_feasible')
    
    if all([eng is not None, prod is not None, qc_check is not None, rm is not None]):
        if all([eng, prod, qc_check, rm]):
            feasibility['overall_status'] = FeasibilityStatus.FEASIBLE.value
        elif any([eng is False, prod is False, qc_check is False, rm is False]):
            feasibility['overall_status'] = FeasibilityStatus.NOT_FEASIBLE.value
        else:
            feasibility['overall_status'] = FeasibilityStatus.CONDITIONAL.value
    else:
        feasibility['overall_status'] = FeasibilityStatus.IN_PROGRESS.value
    
    # Add audit log
    add_audit_log(lead, current_user['id'], current_user['name'],
                  f"feasibility_{feasibility_type}_updated",
                  notes=f"{feasibility_type.title()} feasibility: {'Feasible' if is_feasible else 'Not Feasible'}")
    
    result = await leads_collection.update_one(
        {"lead_id": lead_id},
        {
            "$set": {
                "feasibility": feasibility,
                "updated_at": datetime.utcnow(),
                "audit_logs": lead['audit_logs']
            }
        }
    )
    
    if result.modified_count > 0:
        updated_lead = await leads_collection.find_one({"lead_id": lead_id})
        return {
            "success": True,
            "message": f"{feasibility_type.title()} feasibility updated",
            "lead": serialize_doc(updated_lead)
        }
    
    raise HTTPException(status_code=500, detail="Failed to update feasibility")


# ============================================================================
# COSTING OPERATIONS
# ============================================================================

@router.post("/leads/{lead_id}/costing", response_model=dict)
async def calculate_costing(
    lead_id: str,
    bom_id: Optional[str] = None,
    material_cost: float = 0.0,
    labor_cost: float = 0.0,
    overhead_cost: float = 0.0,
    tooling_cost: float = 0.0,
    margin_percentage: float = 20.0,
# removed current_user parameter
):
    """
    Calculate and update costing for the lead
    """
    current_user = {"id": "user-003", "name": "Pricing Manager"}
    
    lead = await leads_collection.find_one({"lead_id": lead_id})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    # Calculate total cost and quoted price
    total_cost = material_cost + labor_cost + overhead_cost + tooling_cost
    quoted_price = total_cost * (1 + margin_percentage / 100)
    
    costing = {
        "bom_id": bom_id,
        "material_cost": material_cost,
        "labor_cost": labor_cost,
        "overhead_cost": overhead_cost,
        "tooling_cost": tooling_cost,
        "total_cost_per_unit": total_cost,
        "margin_percentage": margin_percentage,
        "quoted_price": quoted_price,
        "calculated_at": datetime.utcnow(),
        "calculated_by": current_user['name']
    }
    
    # Add audit log
    add_audit_log(lead, current_user['id'], current_user['name'],
                  "costing_calculated",
                  notes=f"Costing calculated: Cost={total_cost}, Price={quoted_price}, Margin={margin_percentage}%")
    
    result = await leads_collection.update_one(
        {"lead_id": lead_id},
        {
            "$set": {
                "costing": costing,
                "bom_id": bom_id,
                "updated_at": datetime.utcnow(),
                "audit_logs": lead['audit_logs']
            }
        }
    )
    
    if result.modified_count > 0:
        updated_lead = await leads_collection.find_one({"lead_id": lead_id})
        return {
            "success": True,
            "message": "Costing calculated successfully",
            "costing": costing,
            "lead": serialize_doc(updated_lead)
        }
    
    raise HTTPException(status_code=500, detail="Failed to update costing")


# ============================================================================
# APPROVAL OPERATIONS
# ============================================================================

class ApprovalSubmitRequest(BaseModel):
    approval_types: List[str]  # List of approval type strings

@router.post("/leads/{lead_id}/approvals/submit", response_model=dict)
async def submit_for_approval(
    lead_id: str,
    request: ApprovalSubmitRequest
):
    """
    Submit lead for approvals
    Creates approval records for each approval type
    """
    current_user = {"id": "user-001", "name": "Sales Manager"}
    
    lead = await leads_collection.find_one({"lead_id": lead_id})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    # Create approval records
    approvals = lead.get('approvals', [])
    
    # Role mapping for approvers
    approver_roles = {
        ApprovalType.TECHNICAL: "Engineering Lead",
        ApprovalType.PRODUCTION: "Production Manager",
        ApprovalType.QC: "QC Manager",
        ApprovalType.PRICING: "Pricing Manager",
        ApprovalType.CREDIT: "Finance Head",
        ApprovalType.MANAGEMENT: "Finance Head",
        ApprovalType.COMPLIANCE: "QC Manager"
    }
    
    for approval_type_str in request.approval_types:
        # Check if already exists
        existing = next((a for a in approvals if a['approval_type'] == approval_type_str), None)
        if not existing:
            # Convert string to enum for role lookup
            try:
                approval_type_enum = ApprovalType(approval_type_str)
            except ValueError:
                continue  # Skip invalid approval types
            
            approval = {
                "approval_type": approval_type_str,
                "status": ApprovalStatus.PENDING.value,
                "approver_role": approver_roles.get(approval_type_enum, "Manager"),
                "submitted_at": datetime.utcnow()
            }
            approvals.append(approval)
    
    # Add audit log
    add_audit_log(lead, current_user['id'], current_user['name'],
                  "approvals_submitted",
                  notes=f"Submitted for approvals: {', '.join(request.approval_types)}")
    
    result = await leads_collection.update_one(
        {"lead_id": lead_id},
        {
            "$set": {
                "approvals": approvals,
                "approval_status": ApprovalStatus.PENDING.value,
                "updated_at": datetime.utcnow(),
                "audit_logs": lead['audit_logs']
            }
        }
    )
    
    if result.modified_count > 0:
        updated_lead = await leads_collection.find_one({"lead_id": lead_id})
        return {
            "success": True,
            "message": "Submitted for approvals",
            "lead": serialize_doc(updated_lead)
        }
    
    raise HTTPException(status_code=500, detail="Failed to submit approvals")


class ApprovalResponse(BaseModel):
    approved: bool
    comments: Optional[str] = None
    rejection_reason: Optional[str] = None

@router.post("/leads/{lead_id}/approvals/{approval_type}/respond", response_model=dict)
async def respond_to_approval(
    lead_id: str,
    approval_type: str,  # Changed to string to match path parameter
    response: ApprovalResponse
):
    """
    Approve or reject a specific approval
    """
    current_user = {"id": "user-005", "name": "Finance Head", "role": "Finance Head"}
    
    lead = await leads_collection.find_one({"lead_id": lead_id})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    approvals = lead.get('approvals', [])
    
    # Find the approval record
    approval = next((a for a in approvals if a['approval_type'] == approval_type), None)
    if not approval:
        raise HTTPException(status_code=404, detail="Approval record not found")
    
    # Update approval
    approval['status'] = ApprovalStatus.APPROVED.value if response.approved else ApprovalStatus.REJECTED.value
    approval['approver_id'] = current_user['id']
    approval['approver_name'] = current_user['name']
    approval['responded_at'] = datetime.utcnow()
    approval['comments'] = response.comments
    if not response.approved:
        approval['rejection_reason'] = response.rejection_reason
    
    # Check if all approvals are completed
    all_approved = all(a['status'] == ApprovalStatus.APPROVED.value for a in approvals)
    any_rejected = any(a['status'] == ApprovalStatus.REJECTED.value for a in approvals)
    
    overall_status = ApprovalStatus.APPROVED if all_approved else (ApprovalStatus.REJECTED if any_rejected else ApprovalStatus.PENDING)
    
    # Add audit log
    action = "approved" if response.approved else "rejected"
    add_audit_log(lead, current_user['id'], current_user['name'],
                  f"approval_{action}",
                  notes=f"{approval_type} approval {action}: {response.comments or response.rejection_reason or 'No comments'}")
    
    result = await leads_collection.update_one(
        {"lead_id": lead_id},
        {
            "$set": {
                "approvals": approvals,
                "approval_status": overall_status.value,
                "updated_at": datetime.utcnow(),
                "audit_logs": lead['audit_logs']
            }
        }
    )
    
    if result.modified_count > 0:
        updated_lead = await leads_collection.find_one({"lead_id": lead_id})
        return {
            "success": True,
            "message": f"{approval_type} approval {action}",
            "lead": serialize_doc(updated_lead)
        }
    
    raise HTTPException(status_code=500, detail="Failed to update approval")


# ============================================================================
# CONVERSION OPERATION
# ============================================================================

@router.post("/leads/{lead_id}/convert", response_model=dict)
async def convert_lead(
    lead_id: str,
    create_evaluation: bool = True,
# removed current_user parameter
):
    """
    Convert approved lead to Evaluation/Quotation
    """
    if not current_user:
        current_user = {"id": "user-001", "name": "Sales Manager"}
    
    lead = await leads_collection.find_one({"lead_id": lead_id})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    # Validate lead is approved
    if lead.get('approval_status') != ApprovalStatus.APPROVED.value:
        raise HTTPException(status_code=400, detail="Lead must be approved before conversion")
    
    # Mock evaluation creation (integrate with Evaluate module later)
    evaluation_id = f"EVAL-{datetime.now().year}-{lead_id.split('-')[-1]}"
    
    # Add audit log
    add_audit_log(lead, current_user['id'], current_user['name'],
                  "converted",
                  notes=f"Lead converted to evaluation {evaluation_id}")
    
    result = await leads_collection.update_one(
        {"lead_id": lead_id},
        {
            "$set": {
                "is_converted": True,
                "converted_to_evaluation_id": evaluation_id,
                "converted_at": datetime.utcnow(),
                "status": LeadStatus.CONVERTED.value,
                "current_stage": WorkflowStage.CONVERT.value,
                "updated_at": datetime.utcnow(),
                "audit_logs": lead['audit_logs']
            }
        }
    )
    
    if result.modified_count > 0:
        updated_lead = await leads_collection.find_one({"lead_id": lead_id})
        return {
            "success": True,
            "message": f"Lead converted successfully",
            "evaluation_id": evaluation_id,
            "lead": serialize_doc(updated_lead)
        }
    
    raise HTTPException(status_code=500, detail="Failed to convert lead")


# ============================================================================
# MASTER DATA CRUD OPERATIONS
# ============================================================================

# Customer Master
@router.get("/masters/customers", response_model=dict)
async def get_customers(skip: int = 0, limit: int = 100):
    """Get all customers"""
    customers = await customers_collection.find().skip(skip).limit(limit).to_list(length=limit)
    total = await customers_collection.count_documents({})
    return {"total": total, "customers": [serialize_doc(c) for c in customers]}

@router.post("/masters/customers", response_model=dict)
async def create_customer(customer: CustomerMaster):
    """Create new customer"""
    result = await customers_collection.insert_one(customer.dict())
    if result.inserted_id:
        created = await customers_collection.find_one({"_id": result.inserted_id})
        return {"success": True, "customer": serialize_doc(created)}
    raise HTTPException(status_code=500, detail="Failed to create customer")

# Product Family Master
@router.get("/masters/product-families", response_model=dict)
async def get_product_families():
    """Get all product families"""
    families = await product_families_collection.find().to_list(length=100)
    return {"product_families": [serialize_doc(f) for f in families]}

@router.post("/masters/product-families", response_model=dict)
async def create_product_family(family: ProductFamilyMaster):
    """Create new product family"""
    result = await product_families_collection.insert_one(family.dict())
    if result.inserted_id:
        created = await product_families_collection.find_one({"_id": result.inserted_id})
        return {"success": True, "product_family": serialize_doc(created)}
    raise HTTPException(status_code=500, detail="Failed to create product family")

# SKU Master
@router.get("/masters/skus", response_model=dict)
async def get_skus(product_family_id: Optional[str] = None):
    """Get all SKUs"""
    query = {}
    if product_family_id:
        query['product_family_id'] = product_family_id
    skus = await skus_collection.find(query).to_list(length=200)
    return {"skus": [serialize_doc(s) for s in skus]}

@router.post("/masters/skus", response_model=dict)
async def create_sku(sku: SKUMaster):
    """Create new SKU"""
    result = await skus_collection.insert_one(sku.dict())
    if result.inserted_id:
        created = await skus_collection.find_one({"_id": result.inserted_id})
        return {"success": True, "sku": serialize_doc(created)}
    raise HTTPException(status_code=500, detail="Failed to create SKU")

# BOM Master
@router.get("/masters/boms", response_model=dict)
async def get_boms():
    """Get all BOMs"""
    boms = await boms_collection.find().to_list(length=100)
    return {"boms": [serialize_doc(b) for b in boms]}

@router.post("/masters/boms", response_model=dict)
async def create_bom(bom: BOMMaster):
    """Create new BOM"""
    result = await boms_collection.insert_one(bom.dict())
    if result.inserted_id:
        created = await boms_collection.find_one({"_id": result.inserted_id})
        return {"success": True, "bom": serialize_doc(created)}
    raise HTTPException(status_code=500, detail="Failed to create BOM")

# Raw Material Master
@router.get("/masters/raw-materials", response_model=dict)
async def get_raw_materials():
    """Get all raw materials"""
    materials = await raw_materials_collection.find().to_list(length=200)
    return {"raw_materials": [serialize_doc(m) for m in materials]}

@router.post("/masters/raw-materials", response_model=dict)
async def create_raw_material(material: RawMaterialMaster):
    """Create new raw material"""
    result = await raw_materials_collection.insert_one(material.dict())
    if result.inserted_id:
        created = await raw_materials_collection.find_one({"_id": result.inserted_id})
        return {"success": True, "raw_material": serialize_doc(created)}
    raise HTTPException(status_code=500, detail="Failed to create raw material")

# Plant Master
@router.get("/masters/plants", response_model=dict)
async def get_plants():
    """Get all plants"""
    plants = await plants_collection.find().to_list(length=50)
    return {"plants": [serialize_doc(p) for p in plants]}

@router.post("/masters/plants", response_model=dict)
async def create_plant(plant: PlantMaster):
    """Create new plant"""
    result = await plants_collection.insert_one(plant.dict())
    if result.inserted_id:
        created = await plants_collection.find_one({"_id": result.inserted_id})
        return {"success": True, "plant": serialize_doc(created)}
    raise HTTPException(status_code=500, detail="Failed to create plant")

# UOM Master
@router.get("/masters/uoms", response_model=dict)
async def get_uoms():
    """Get all UOMs"""
    uoms = await uoms_collection.find().to_list(length=50)
    return {"uoms": [serialize_doc(u) for u in uoms]}

# Currency Master
@router.get("/masters/currencies", response_model=dict)
async def get_currencies():
    """Get all currencies"""
    currencies = await currencies_collection.find().to_list(length=50)
    return {"currencies": [serialize_doc(c) for c in currencies]}

# Tax Master
@router.get("/masters/taxes", response_model=dict)
async def get_taxes():
    """Get all taxes"""
    taxes = await taxes_collection.find().to_list(length=50)
    return {"taxes": [serialize_doc(t) for t in taxes]}


# ============================================================================
# RBAC & ROLES
# ============================================================================

@router.get("/roles", response_model=dict)
async def get_roles():
    """Get all roles with permissions"""
    roles = await roles_collection.find().to_list(length=20)
    return {"roles": [serialize_doc(r) for r in roles]}


# ============================================================================
# ANALYTICS & REPORTS
# ============================================================================

@router.get("/analytics/funnel", response_model=dict)
async def get_lead_funnel():
    """Get lead funnel analytics"""
    pipeline = [
        {"$group": {
            "_id": "$current_stage",
            "count": {"$sum": 1},
            "total_value": {"$sum": {"$multiply": ["$quantity", {"$ifNull": ["$costing.quoted_price", 0]}]}}
        }}
    ]
    
    results = await leads_collection.aggregate(pipeline).to_list(length=10)
    
    funnel = {}
    for result in results:
        stage = result['_id']
        funnel[stage] = {
            "count": result['count'],
            "total_value": result['total_value']
        }
    
    return {"funnel": funnel}


@router.get("/analytics/feasibility", response_model=dict)
async def get_feasibility_report():
    """Get feasibility analysis report"""
    pipeline = [
        {"$group": {
            "_id": "$feasibility.overall_status",
            "count": {"$sum": 1}
        }}
    ]
    
    results = await leads_collection.aggregate(pipeline).to_list(length=10)
    
    report = {}
    for result in results:
        status = result['_id']
        report[status] = result['count']
    
    return {"feasibility_report": report}
