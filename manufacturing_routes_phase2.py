"""
Manufacturing Lead Module - Phase 2 API Routes
CRUD operations for 90+ additional masters
"""

from fastapi import APIRouter, HTTPException
from typing import List, Optional
from datetime import datetime
import os
from motor.motor_asyncio import AsyncIOMotorClient

# Import all Phase 2 models
from manufacturing_models_phase2 import *
from manufacturing_models_phase2_part2 import *

router = APIRouter(prefix="/api/manufacturing/phase2", tags=["Manufacturing Phase 2"])

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client['innovate_books_db']

# Helper function
def serialize_doc(doc):
    """Convert MongoDB document to JSON-serializable format"""
    if doc is None:
        return None
    doc['_id'] = str(doc['_id'])
    for key, value in doc.items():
        if isinstance(value, datetime):
            doc[key] = value.isoformat()
        elif isinstance(value, date):
            doc[key] = value.isoformat()
    return doc


# ============================================================================
# GENERIC MASTER CRUD ROUTES
# ============================================================================

# Master type to collection mapping
MASTER_COLLECTIONS = {
    # Customer Masters
    "customer-groups": "mfg_customer_groups",
    "customer-categories": "mfg_customer_categories",
    "customer-regions": "mfg_customer_regions",
    "customer-credit-profiles": "mfg_customer_credit_profiles",
    "customer-contracts": "mfg_customer_contracts",
    "customer-slas": "mfg_customer_slas",
    
    # Product Masters
    "product-categories": "mfg_product_categories",
    "sku-aliases": "mfg_sku_aliases",
    "packaging-materials": "mfg_packaging_materials",
    "labeling": "mfg_labeling",
    "product-compliance": "mfg_product_compliance",
    
    # BOM & Engineering Masters
    "component-boms": "mfg_component_boms",
    "substitute-materials": "mfg_substitute_materials",
    "tooling": "mfg_tooling",
    "work-centers": "mfg_work_centers",
    "work-center-capabilities": "mfg_work_center_capabilities",
    "process-routes": "mfg_process_routes",
    "engineering-drawings": "mfg_engineering_drawings",
    "tolerance-templates": "mfg_tolerance_templates",
    "surface-finishes": "mfg_surface_finishes",
    "heat-treatments": "mfg_heat_treatments",
    "testing-methods": "mfg_testing_methods",
    "qc-parameters": "mfg_qc_parameters",
    "calibration-equipment": "mfg_calibration_equipment",
    
    # Procurement Masters
    "vendors": "mfg_vendors",
    "vendor-ratings": "mfg_vendor_ratings",
    "rm-lead-times": "mfg_rm_lead_times",
    "rm-sources": "mfg_rm_sources",
    "rm-substitutions": "mfg_rm_substitutions",
    "rm-prices": "mfg_rm_prices",
    
    # Commerce Masters
    "discount-structures": "mfg_discount_structures",
    "payment-terms": "mfg_payment_terms",
    "delivery-terms": "mfg_delivery_terms",
    "freight-terms": "mfg_freight_terms",
    "incoterms": "mfg_incoterms",
    "credit-limits": "mfg_credit_limits",
    "billing-locations": "mfg_billing_locations",
    
    # Operations Masters
    "shifts": "mfg_shifts",
    "capacity": "mfg_capacity",
    "machine-availability": "mfg_machine_availability",
    "mold-tool-maintenance": "mfg_mold_tool_maintenance",
    "batches": "mfg_batches",
    "lot-traceability": "mfg_lot_traceability",
    "scrap-codes": "mfg_scrap_codes",
    "yield-percentages": "mfg_yield_percentages",
    
    # Quality & Compliance Masters
    "iso-certificates": "mfg_iso_certificates",
    "customer-required-certificates": "mfg_customer_required_certificates",
    "test-protocols": "mfg_test_protocols",
    "inspection-levels": "mfg_inspection_levels",
    "msds": "mfg_msds",
    "hazard-classifications": "mfg_hazard_classifications",
    "calibration-certificates": "mfg_calibration_certificates",
    "rejection-codes": "mfg_rejection_codes",
    
    # Logistics Masters
    "packaging-templates": "mfg_packaging_templates",
    "palletization": "mfg_palletization",
    "transporters": "mfg_transporters",
    "vehicle-types": "mfg_vehicle_types",
    "routes": "mfg_routes",
    "ports": "mfg_ports",
    "export-documentation": "mfg_export_documentation",
    
    # Governance Masters
    "approval-matrices": "mfg_approval_matrices",
    "sop-stages": "mfg_sop_stages",
    "risk-codes": "mfg_risk_codes",
    "loss-reasons": "mfg_loss_reasons",
    "escalation-matrices": "mfg_escalation_matrices",
    "slas": "mfg_slas",
    "access-policies": "mfg_access_policies",
    "sod-rules": "mfg_sod_rules",
    "data-retention-policies": "mfg_data_retention_policies",
    "exception-handling": "mfg_exception_handling",
}


@router.get("/masters/{master_type}")
async def get_masters(master_type: str, skip: int = 0, limit: int = 100):
    """Generic GET endpoint for all masters"""
    if master_type not in MASTER_COLLECTIONS:
        raise HTTPException(status_code=404, detail=f"Master type '{master_type}' not found")
    
    collection_name = MASTER_COLLECTIONS[master_type]
    collection = db[collection_name]
    
    total = await collection.count_documents({})
    items = await collection.find().skip(skip).limit(limit).to_list(length=limit)
    
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "items": [serialize_doc(item) for item in items]
    }


@router.post("/masters/{master_type}")
async def create_master(master_type: str, data: dict):
    """Generic POST endpoint for all masters"""
    if master_type not in MASTER_COLLECTIONS:
        raise HTTPException(status_code=404, detail=f"Master type '{master_type}' not found")
    
    collection_name = MASTER_COLLECTIONS[master_type]
    collection = db[collection_name]
    
    # Add metadata
    if 'id' not in data:
        data['id'] = str(uuid.uuid4())
    if 'created_at' not in data:
        data['created_at'] = datetime.utcnow()
    if 'is_active' not in data:
        data['is_active'] = True
    
    result = await collection.insert_one(data)
    
    if result.inserted_id:
        created = await collection.find_one({"_id": result.inserted_id})
        return {"success": True, "item": serialize_doc(created)}
    
    raise HTTPException(status_code=500, detail="Failed to create master")


@router.get("/masters/{master_type}/{item_id}")
async def get_master_by_id(master_type: str, item_id: str):
    """Generic GET by ID endpoint"""
    if master_type not in MASTER_COLLECTIONS:
        raise HTTPException(status_code=404, detail=f"Master type '{master_type}' not found")
    
    collection_name = MASTER_COLLECTIONS[master_type]
    collection = db[collection_name]
    
    item = await collection.find_one({"id": item_id})
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    return {"success": True, "item": serialize_doc(item)}


@router.put("/masters/{master_type}/{item_id}")
async def update_master(master_type: str, item_id: str, data: dict):
    """Generic PUT endpoint"""
    if master_type not in MASTER_COLLECTIONS:
        raise HTTPException(status_code=404, detail=f"Master type '{master_type}' not found")
    
    collection_name = MASTER_COLLECTIONS[master_type]
    collection = db[collection_name]
    
    # Add updated timestamp
    data['updated_at'] = datetime.utcnow()
    
    result = await collection.update_one(
        {"id": item_id},
        {"$set": data}
    )
    
    if result.modified_count > 0:
        updated = await collection.find_one({"id": item_id})
        return {"success": True, "item": serialize_doc(updated)}
    
    raise HTTPException(status_code=404, detail="Item not found or no changes made")


@router.delete("/masters/{master_type}/{item_id}")
async def delete_master(master_type: str, item_id: str):
    """Generic DELETE endpoint (soft delete)"""
    if master_type not in MASTER_COLLECTIONS:
        raise HTTPException(status_code=404, detail=f"Master type '{master_type}' not found")
    
    collection_name = MASTER_COLLECTIONS[master_type]
    collection = db[collection_name]
    
    result = await collection.update_one(
        {"id": item_id},
        {"$set": {"is_active": False, "deleted_at": datetime.utcnow()}}
    )
    
    if result.modified_count > 0:
        return {"success": True, "message": "Item deleted successfully"}
    
    raise HTTPException(status_code=404, detail="Item not found")


# ============================================================================
# EXTENDED RBAC ROUTES
# ============================================================================

@router.get("/roles")
async def get_all_roles():
    """Get all 25+ roles with permissions"""
    roles = await db['mfg_roles_extended'].find().to_list(length=50)
    return {"roles": [serialize_doc(r) for r in roles]}


@router.get("/roles/{role_name}")
async def get_role_details(role_name: str):
    """Get specific role details"""
    role = await db['mfg_roles_extended'].find_one({"role": role_name})
    
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    return {"success": True, "role": serialize_doc(role)}


@router.get("/permissions")
async def get_all_permissions():
    """Get complete list of all permissions"""
    permissions = [
        # Lead permissions
        "lead:create", "lead:view", "lead:edit", "lead:delete", "lead:assign",
        "lead:convert", "lead:close", "lead:reassign",
        
        # Approval permissions
        "lead:approve:technical", "lead:approve:production", "lead:approve:qc",
        "lead:approve:pricing", "lead:approve:credit", "lead:approve:management",
        "lead:approve:compliance",
        
        # Master permissions
        "master:view", "master:create", "master:edit", "master:delete",
        
        # BOM permissions
        "bom:view", "bom:create", "bom:edit", "bom:bind",
        
        # Costing permissions
        "costing:view", "costing:edit", "costing:calculate",
        
        # Task permissions
        "task:create", "task:assign", "task:complete",
        
        # Attachment permissions
        "attachment:add", "attachment:view", "attachment:delete",
        
        # Audit permissions
        "audit:view", "audit:export",
        
        # User management
        "user:manage", "user:view",
        
        # Admin permissions
        "admin:override", "admin:sod_override",
    ]
    
    return {"permissions": permissions}


# ============================================================================
# MASTER STATISTICS
# ============================================================================

@router.get("/stats")
async def get_master_statistics():
    """Get statistics for all master data"""
    stats = {}
    
    for master_type, collection_name in MASTER_COLLECTIONS.items():
        collection = db[collection_name]
        total = await collection.count_documents({})
        active = await collection.count_documents({"is_active": True})
        
        stats[master_type] = {
            "total": total,
            "active": active,
            "inactive": total - active
        }
    
    return {"statistics": stats}
