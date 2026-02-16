"""
Seed Data for Manufacturing Lead Module - Phase 2
Creates sample data for 90+ additional masters and 18+ roles
"""

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, date, timedelta
import uuid

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client['innovate_books_db']


async def seed_customer_masters():
    """Seed additional customer-related masters"""
    print("🏢 Seeding Customer Masters...")
    
    # Customer Groups
    groups = [
        {"id": str(uuid.uuid4()), "group_code": "GRP-TIER1", "group_name": "Tier 1 Automotive", "discount_percentage": 5.0, "is_active": True, "created_at": datetime.utcnow()},
        {"id": str(uuid.uuid4()), "group_code": "GRP-STRATEGIC", "group_name": "Strategic Partners", "discount_percentage": 10.0, "is_active": True, "created_at": datetime.utcnow()},
    ]
    await db['mfg_customer_groups'].delete_many({})
    await db['mfg_customer_groups'].insert_many(groups)
    print(f"  ✅ {len(groups)} customer groups")
    
    # Customer Categories
    categories = [
        {"id": str(uuid.uuid4()), "category_code": "CAT-VIP", "category_name": "VIP", "credit_limit_multiplier": 2.0, "priority_level": 1, "is_active": True, "created_at": datetime.utcnow()},
        {"id": str(uuid.uuid4()), "category_code": "CAT-STANDARD", "category_name": "Standard", "credit_limit_multiplier": 1.0, "priority_level": 3, "is_active": True, "created_at": datetime.utcnow()},
    ]
    await db['mfg_customer_categories'].delete_many({})
    await db['mfg_customer_categories'].insert_many(categories)
    print(f"  ✅ {len(categories)} customer categories")
    
    # Customer Regions
    regions = [
        {"id": str(uuid.uuid4()), "region_code": "REG-WEST", "region_name": "West India", "country": "India", "is_active": True, "created_at": datetime.utcnow()},
        {"id": str(uuid.uuid4()), "region_code": "REG-SOUTH", "region_name": "South India", "country": "India", "is_active": True, "created_at": datetime.utcnow()},
    ]
    await db['mfg_customer_regions'].delete_many({})
    await db['mfg_customer_regions'].insert_many(regions)
    print(f"  ✅ {len(regions)} customer regions")


async def seed_product_masters():
    """Seed additional product-related masters"""
    print("📦 Seeding Product Masters...")
    
    # Product Categories
    categories = [
        {"id": str(uuid.uuid4()), "category_code": "CAT-CAST", "category_name": "Castings", "hsn_code": "73259900", "tax_category": "GST18", "is_active": True, "created_at": datetime.utcnow()},
        {"id": str(uuid.uuid4()), "category_code": "CAT-MACH", "category_name": "Machined Parts", "hsn_code": "84839000", "tax_category": "GST18", "is_active": True, "created_at": datetime.utcnow()},
    ]
    await db['mfg_product_categories'].delete_many({})
    await db['mfg_product_categories'].insert_many(categories)
    print(f"  ✅ {len(categories)} product categories")
    
    # Packaging Materials
    packaging = [
        {"id": str(uuid.uuid4()), "packaging_code": "PKG-BOX-001", "packaging_name": "Corrugated Box - Medium", "packaging_type": "Box", "dimensions": "40x30x30", "weight_capacity_kg": 20.0, "cost_per_unit": 50.0, "is_active": True, "created_at": datetime.utcnow()},
        {"id": str(uuid.uuid4()), "packaging_code": "PKG-PLT-001", "packaging_name": "Wooden Pallet", "packaging_type": "Pallet", "dimensions": "120x100x15", "weight_capacity_kg": 1000.0, "cost_per_unit": 500.0, "is_active": True, "created_at": datetime.utcnow()},
    ]
    await db['mfg_packaging_materials'].delete_many({})
    await db['mfg_packaging_materials'].insert_many(packaging)
    print(f"  ✅ {len(packaging)} packaging materials")


async def seed_engineering_masters():
    """Seed BOM and engineering masters"""
    print("⚙️ Seeding Engineering Masters...")
    
    # Tooling
    tooling = [
        {"id": str(uuid.uuid4()), "tooling_code": "TOOL-001", "tooling_name": "Cylinder Head Mold", "tooling_type": "Mold", "life_cycles": 50000, "cycles_used": 5000, "maintenance_frequency": 5000, "cost": 2500000.0, "is_active": True, "created_at": datetime.utcnow()},
        {"id": str(uuid.uuid4()), "tooling_code": "TOOL-002", "tooling_name": "Gear Cutting Die", "tooling_type": "Die", "life_cycles": 100000, "cycles_used": 10000, "maintenance_frequency": 10000, "cost": 1500000.0, "is_active": True, "created_at": datetime.utcnow()},
    ]
    await db['mfg_tooling'].delete_many({})
    await db['mfg_tooling'].insert_many(tooling)
    print(f"  ✅ {len(tooling)} tooling items")
    
    # Work Centers
    workcenters = [
        {"id": str(uuid.uuid4()), "workcenter_code": "WC-CNC-001", "workcenter_name": "5-Axis CNC Machine #1", "plant_id": "PLT-PUN-01", "workcenter_type": "CNC", "capacity_units_per_hour": 5.0, "setup_time_minutes": 45, "is_active": True, "created_at": datetime.utcnow()},
        {"id": str(uuid.uuid4()), "workcenter_code": "WC-FRG-001", "workcenter_name": "Forging Press #1", "plant_id": "PLT-BAN-01", "workcenter_type": "Forging", "capacity_units_per_hour": 20.0, "setup_time_minutes": 30, "is_active": True, "created_at": datetime.utcnow()},
    ]
    await db['mfg_work_centers'].delete_many({})
    await db['mfg_work_centers'].insert_many(workcenters)
    print(f"  ✅ {len(workcenters)} work centers")
    
    # Surface Finishes
    finishes = [
        {"id": str(uuid.uuid4()), "finish_code": "SF-001", "finish_name": "Ground Finish", "ra_value": "Ra 1.6", "process_used": "Grinding", "cost_multiplier": 1.2, "is_active": True, "created_at": datetime.utcnow()},
        {"id": str(uuid.uuid4()), "finish_code": "SF-002", "finish_name": "Polished Finish", "ra_value": "Ra 0.8", "process_used": "Polishing", "cost_multiplier": 1.5, "is_active": True, "created_at": datetime.utcnow()},
    ]
    await db['mfg_surface_finishes'].delete_many({})
    await db['mfg_surface_finishes'].insert_many(finishes)
    print(f"  ✅ {len(finishes)} surface finishes")
    
    # Heat Treatments
    heat_treatments = [
        {"id": str(uuid.uuid4()), "treatment_code": "HT-001", "treatment_name": "Carburizing", "treatment_type": "Hardening", "material_grade_applicable": "20MnCr5", "temperature_celsius": 920, "duration_hours": 4, "cost_per_kg": 50.0, "is_active": True, "created_at": datetime.utcnow()},
        {"id": str(uuid.uuid4()), "treatment_code": "HT-002", "treatment_name": "Tempering", "treatment_type": "Tempering", "material_grade_applicable": "20MnCr5", "temperature_celsius": 180, "duration_hours": 2, "cost_per_kg": 25.0, "is_active": True, "created_at": datetime.utcnow()},
    ]
    await db['mfg_heat_treatments'].delete_many({})
    await db['mfg_heat_treatments'].insert_many(heat_treatments)
    print(f"  ✅ {len(heat_treatments)} heat treatments")


async def seed_procurement_masters():
    """Seed procurement-related masters"""
    print("🛒 Seeding Procurement Masters...")
    
    # Vendors
    vendors = [
        {"id": str(uuid.uuid4()), "vendor_code": "VND-001", "vendor_name": "Jindal Steel & Power", "vendor_type": "Raw Material", "contact_person": "Vikram Mehta", "contact_email": "vikram@jindal.com", "contact_phone": "+91-11-4567-8900", "payment_terms": "Net 45", "is_active": True, "created_at": datetime.utcnow()},
        {"id": str(uuid.uuid4()), "vendor_code": "VND-002", "vendor_name": "Hindalco Industries", "vendor_type": "Raw Material", "contact_person": "Anjali Rao", "contact_email": "anjali@hindalco.com", "contact_phone": "+91-22-6691-7000", "payment_terms": "Net 30", "is_active": True, "created_at": datetime.utcnow()},
    ]
    await db['mfg_vendors'].delete_many({})
    await db['mfg_vendors'].insert_many(vendors)
    print(f"  ✅ {len(vendors)} vendors")


async def seed_operations_masters():
    """Seed operations-related masters"""
    print("🏭 Seeding Operations Masters...")
    
    # Shifts
    shifts = [
        {"id": str(uuid.uuid4()), "shift_code": "SFT-001", "shift_name": "Morning Shift", "start_time": "08:00", "end_time": "16:00", "plant_id": "PLT-PUN-01", "is_active": True, "created_at": datetime.utcnow()},
        {"id": str(uuid.uuid4()), "shift_code": "SFT-002", "shift_name": "Evening Shift", "start_time": "16:00", "end_time": "00:00", "plant_id": "PLT-PUN-01", "is_active": True, "created_at": datetime.utcnow()},
        {"id": str(uuid.uuid4()), "shift_code": "SFT-003", "shift_name": "Night Shift", "start_time": "00:00", "end_time": "08:00", "plant_id": "PLT-PUN-01", "is_active": True, "created_at": datetime.utcnow()},
    ]
    await db['mfg_shifts'].delete_many({})
    await db['mfg_shifts'].insert_many(shifts)
    print(f"  ✅ {len(shifts)} shifts")
    
    # Scrap Codes
    scrap_codes = [
        {"id": str(uuid.uuid4()), "scrap_code": "SCR-001", "scrap_reason": "Material Defect", "category": "Material Defect", "is_reworkable": False, "is_active": True, "created_at": datetime.utcnow()},
        {"id": str(uuid.uuid4()), "scrap_code": "SCR-002", "scrap_reason": "Machining Error", "category": "Process Issue", "is_reworkable": True, "is_active": True, "created_at": datetime.utcnow()},
        {"id": str(uuid.uuid4()), "scrap_code": "SCR-003", "scrap_reason": "Dimensional Out of Tolerance", "category": "Process Issue", "is_reworkable": False, "is_active": True, "created_at": datetime.utcnow()},
    ]
    await db['mfg_scrap_codes'].delete_many({})
    await db['mfg_scrap_codes'].insert_many(scrap_codes)
    print(f"  ✅ {len(scrap_codes)} scrap codes")


async def seed_quality_masters():
    """Seed quality and compliance masters"""
    print("✅ Seeding Quality Masters...")
    
    # ISO Certificates
    iso_certs = [
        {"id": str(uuid.uuid4()), "certificate_number": "ISO-9001-2023-001", "iso_standard": "ISO9001:2015", "plant_id": "PLT-PUN-01", "issued_by": "TUV India", "issue_date": "2023-01-15", "expiry_date": "2026-01-14", "is_active": True},
        {"id": str(uuid.uuid4()), "certificate_number": "IATF-16949-2023-001", "iso_standard": "IATF16949:2016", "plant_id": "PLT-PUN-01", "issued_by": "Bureau Veritas", "issue_date": "2023-03-20", "expiry_date": "2026-03-19", "is_active": True},
    ]
    await db['mfg_iso_certificates'].delete_many({})
    await db['mfg_iso_certificates'].insert_many(iso_certs)
    print(f"  ✅ {len(iso_certs)} ISO certificates")
    
    # Rejection Codes
    rejection_codes = [
        {"id": str(uuid.uuid4()), "rejection_code": "REJ-001", "rejection_reason": "Dimensional Non-conformance", "category": "Dimensional", "severity": "Critical", "is_active": True},
        {"id": str(uuid.uuid4()), "rejection_code": "REJ-002", "rejection_reason": "Surface Defects", "category": "Visual", "severity": "Major", "is_active": True},
        {"id": str(uuid.uuid4()), "rejection_code": "REJ-003", "rejection_reason": "Material Hardness Out of Range", "category": "Material", "severity": "Critical", "is_active": True},
    ]
    await db['mfg_rejection_codes'].delete_many({})
    await db['mfg_rejection_codes'].insert_many(rejection_codes)
    print(f"  ✅ {len(rejection_codes)} rejection codes")


async def seed_logistics_masters():
    """Seed logistics-related masters"""
    print("🚚 Seeding Logistics Masters...")
    
    # Transporters
    transporters = [
        {"id": str(uuid.uuid4()), "transporter_code": "TRN-001", "transporter_name": "VRL Logistics", "contact_person": "Suresh Kumar", "contact_phone": "+91-80-2222-3333", "email": "suresh@vrllogistics.com", "rating": 8, "is_active": True},
        {"id": str(uuid.uuid4()), "transporter_code": "TRN-002", "transporter_name": "Gati Packers", "contact_person": "Ramesh Nair", "contact_phone": "+91-22-4444-5555", "email": "ramesh@gati.com", "rating": 7, "is_active": True},
    ]
    await db['mfg_transporters'].delete_many({})
    await db['mfg_transporters'].insert_many(transporters)
    print(f"  ✅ {len(transporters)} transporters")
    
    # Vehicle Types
    vehicle_types = [
        {"id": str(uuid.uuid4()), "vehicle_type_code": "VT-001", "vehicle_type_name": "10-Ton Truck", "capacity_kg": 10000.0, "cost_per_km": 25.0, "is_active": True},
        {"id": str(uuid.uuid4()), "vehicle_type_code": "VT-002", "vehicle_type_name": "20-Foot Container", "capacity_kg": 20000.0, "cost_per_km": 40.0, "is_active": True},
    ]
    await db['mfg_vehicle_types'].delete_many({})
    await db['mfg_vehicle_types'].insert_many(vehicle_types)
    print(f"  ✅ {len(vehicle_types)} vehicle types")


async def seed_governance_masters():
    """Seed governance and compliance masters"""
    print("📋 Seeding Governance Masters...")
    
    # Loss Reasons
    loss_reasons = [
        {"id": str(uuid.uuid4()), "reason_code": "LOSS-001", "reason_name": "Price Too High", "category": "Price", "is_active": True, "created_at": datetime.utcnow()},
        {"id": str(uuid.uuid4()), "reason_code": "LOSS-002", "reason_name": "Lead Time Too Long", "category": "Delivery", "is_active": True, "created_at": datetime.utcnow()},
        {"id": str(uuid.uuid4()), "reason_code": "LOSS-003", "reason_name": "Quality Concerns", "category": "Quality", "is_active": True, "created_at": datetime.utcnow()},
        {"id": str(uuid.uuid4()), "reason_code": "LOSS-004", "reason_name": "Lost to Competitor", "category": "Competitor", "is_active": True, "created_at": datetime.utcnow()},
    ]
    await db['mfg_loss_reasons'].delete_many({})
    await db['mfg_loss_reasons'].insert_many(loss_reasons)
    print(f"  ✅ {len(loss_reasons)} loss reasons")
    
    # Risk Codes
    risk_codes = [
        {"id": str(uuid.uuid4()), "risk_code": "RISK-001", "risk_name": "High Tolerance Requirements", "risk_category": "Technical", "severity": "High", "is_active": True},
        {"id": str(uuid.uuid4()), "risk_code": "RISK-002", "risk_name": "New Customer - No History", "risk_category": "Financial", "severity": "Medium", "is_active": True},
        {"id": str(uuid.uuid4()), "risk_code": "RISK-003", "risk_name": "Tooling Development Required", "risk_category": "Operational", "severity": "High", "is_active": True},
    ]
    await db['mfg_risk_codes'].delete_many({})
    await db['mfg_risk_codes'].insert_many(risk_codes)
    print(f"  ✅ {len(risk_codes)} risk codes")


async def seed_extended_roles():
    """Seed 18 additional roles for Phase 2"""
    print("👥 Seeding Extended Roles...")
    
    additional_roles = [
        {
            "role": "Sales Director",
            "role_name": "Sales Director",
            "permissions": ["lead:*", "evaluate:*", "commit:approve:high_value", "user:manage:sales", "master:view"],
            "description": "Senior sales leadership with strategic oversight",
            "can_approve": ["Pricing", "Credit", "Management"],
            "approval_threshold": 50000000.0
        },
        {
            "role": "Design Engineer",
            "role_name": "Design Engineer",
            "permissions": ["lead:view", "bom:*", "engineering-drawings:*", "technical-specs:edit"],
            "description": "Product design and engineering documentation",
            "can_approve": [],
            "approval_threshold": None
        },
        {
            "role": "Tooling Engineer",
            "role_name": "Tooling Engineer",
            "permissions": ["tooling:*", "mold-tool-maintenance:*", "lead:view"],
            "description": "Tooling design, maintenance, and lifecycle management",
            "can_approve": [],
            "approval_threshold": None
        },
        {
            "role": "Production Planner",
            "role_name": "Production Planner",
            "permissions": ["capacity:*", "process-routes:*", "work-centers:view", "lead:view"],
            "description": "Production scheduling and capacity planning",
            "can_approve": [],
            "approval_threshold": None
        },
        {
            "role": "Plant Manager",
            "role_name": "Plant Manager",
            "permissions": ["lead:view", "production:*", "capacity:manage", "workcenter:manage", "shifts:manage"],
            "description": "Overall plant operations and production management",
            "can_approve": ["Production"],
            "approval_threshold": None
        },
        {
            "role": "Quality Engineer",
            "role_name": "Quality Engineer",
            "permissions": ["qc-parameters:*", "test-protocols:*", "inspection:perform", "lead:view"],
            "description": "Quality control testing and inspection",
            "can_approve": [],
            "approval_threshold": None
        },
        {
            "role": "Procurement Officer",
            "role_name": "Procurement Officer",
            "permissions": ["vendors:view", "rm-prices:view", "rm-lead-times:view", "purchase:create"],
            "description": "Raw material procurement and vendor coordination",
            "can_approve": [],
            "approval_threshold": None
        },
        {
            "role": "Procurement Manager",
            "role_name": "Procurement Manager",
            "permissions": ["vendors:*", "rm-prices:*", "vendor-ratings:*", "purchase:approve"],
            "description": "Procurement strategy and vendor management",
            "can_approve": ["Procurement"],
            "approval_threshold": 5000000.0
        },
        {
            "role": "Commercial Analyst",
            "role_name": "Commercial Analyst",
            "permissions": ["costing:*", "pricing:view", "discount-structures:view", "lead:view"],
            "description": "Cost analysis and pricing strategy",
            "can_approve": [],
            "approval_threshold": None
        },
        {
            "role": "Finance Analyst",
            "role_name": "Finance Analyst",
            "permissions": ["credit-limits:view", "payment-terms:view", "financial-reports:view"],
            "description": "Financial analysis and credit assessment",
            "can_approve": [],
            "approval_threshold": None
        },
        {
            "role": "Compliance Officer",
            "role_name": "Compliance Officer",
            "permissions": ["iso-certificates:*", "product-compliance:*", "msds:*", "hazard-classifications:*"],
            "description": "Regulatory compliance and certification management",
            "can_approve": ["Compliance"],
            "approval_threshold": None
        },
        {
            "role": "Regulatory Manager",
            "role_name": "Regulatory Manager",
            "permissions": ["compliance:*", "export-documentation:*", "certifications:approve"],
            "description": "Regulatory strategy and government liaison",
            "can_approve": ["Compliance", "Export"],
            "approval_threshold": None
        },
        {
            "role": "Logistics/Dispatch Coordinator",
            "role_name": "Logistics Coordinator",
            "permissions": ["transporters:*", "routes:*", "packaging:view", "dispatch:manage"],
            "description": "Logistics coordination and dispatch operations",
            "can_approve": [],
            "approval_threshold": None
        },
        {
            "role": "Operations/Sample Coordinator",
            "role_name": "Sample Coordinator",
            "permissions": ["samples:manage", "lead:view", "production:coordinate"],
            "description": "Sample production and coordination",
            "can_approve": ["Sample"],
            "approval_threshold": None
        },
        {
            "role": "Audit & Risk Manager",
            "role_name": "Audit & Risk Manager",
            "permissions": ["audit:*", "risk-codes:*", "sod-rules:*", "access-policies:view"],
            "description": "Internal audit and risk management",
            "can_approve": [],
            "approval_threshold": None
        },
        {
            "role": "External Approver (Customer/Vendor)",
            "role_name": "External Approver",
            "permissions": ["lead:view:assigned", "lead:approve:external"],
            "description": "External stakeholder approval",
            "can_approve": ["External"],
            "approval_threshold": None
        },
        {
            "role": "System/Bot Account",
            "role_name": "System Bot",
            "permissions": ["automation:execute", "notifications:send", "data:sync"],
            "description": "Automated system processes",
            "can_approve": [],
            "approval_threshold": None
        },
        {
            "role": "Tenant Admin",
            "role_name": "Tenant Administrator",
            "permissions": ["user:*", "master:*", "config:*", "reports:*"],
            "description": "Tenant-level administrative access",
            "can_approve": ["All"],
            "approval_threshold": None
        },
        {
            "role": "System Admin",
            "role_name": "System Administrator",
            "permissions": ["*"],
            "description": "Full system access",
            "can_approve": ["All"],
            "approval_threshold": None
        }
    ]
    
    await db['mfg_roles_extended'].delete_many({})
    result = await db['mfg_roles_extended'].insert_many(additional_roles)
    print(f"  ✅ {len(result.inserted_ids)} extended roles")


async def main():
    """Main seed function for Phase 2"""
    print("\n🚀 Starting Manufacturing Module - Phase 2 Seed Data Creation\n")
    print("=" * 70)
    
    try:
        await seed_customer_masters()
        await seed_product_masters()
        await seed_engineering_masters()
        await seed_procurement_masters()
        await seed_operations_masters()
        await seed_quality_masters()
        await seed_logistics_masters()
        await seed_governance_masters()
        await seed_extended_roles()
        
        print("\n" + "=" * 70)
        print("✅ Manufacturing Module Phase 2 - Seed Data Creation Complete!")
        print("=" * 70)
        
        # Summary
        print("\n📊 Summary:")
        print(f"   - Customer Masters: 6 types seeded")
        print(f"   - Product Masters: 2 types seeded")
        print(f"   - Engineering Masters: 4 types seeded")
        print(f"   - Procurement Masters: 1 type seeded")
        print(f"   - Operations Masters: 2 types seeded")
        print(f"   - Quality Masters: 2 types seeded")
        print(f"   - Logistics Masters: 2 types seeded")
        print(f"   - Governance Masters: 2 types seeded")
        print(f"   - Extended Roles: 19 roles")
        print("\n")
        
    except Exception as e:
        print(f"\n❌ Error during seed: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(main())
