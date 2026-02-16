"""
Seed Data for Manufacturing Lead Module - Phase 1
Creates:
- 10 Master Data (Customers, Product Families, SKUs, BOMs, RM, Plants, UOMs, Currencies, Taxes)
- 7 Roles with RBAC permissions
- 10 Sample Manufacturing Leads
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


async def seed_customers():
    """Seed customer master data"""
    print("🏭 Seeding Customers...")
    
    customers = [
        {
            "id": f"CUST-{str(uuid.uuid4())[:8]}",
            "customer_code": "CUST001",
            "customer_name": "Tata Motors Limited",
            "industry": "Automotive",
            "region": "West",
            "country": "India",
            "credit_rating": "A",
            "credit_limit": 50000000.0,
            "gstin": "27AAACT2727Q1ZW",
            "pan": "AAACT2727Q",
            "contact_person": "Rajesh Kumar",
            "contact_email": "rajesh.kumar@tatamotors.com",
            "contact_phone": "+91-22-6665-8282",
            "payment_terms": "Net 45",
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "id": f"CUST-{str(uuid.uuid4())[:8]}",
            "customer_code": "CUST002",
            "customer_name": "Mahindra Aerospace",
            "industry": "Aerospace",
            "region": "South",
            "country": "India",
            "credit_rating": "A",
            "credit_limit": 30000000.0,
            "gstin": "29AABCM3731M1ZX",
            "pan": "AABCM3731M",
            "contact_person": "Priya Sharma",
            "contact_email": "priya.sharma@mahindra.com",
            "contact_phone": "+91-80-4321-5678",
            "payment_terms": "Net 60",
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "id": f"CUST-{str(uuid.uuid4())[:8]}",
            "customer_code": "CUST003",
            "customer_name": "L&T Construction Equipment",
            "industry": "Industrial Machinery",
            "region": "West",
            "country": "India",
            "credit_rating": "A",
            "credit_limit": 40000000.0,
            "gstin": "27AAACL0287B1ZW",
            "pan": "AAACL0287B",
            "contact_person": "Amit Patel",
            "contact_email": "amit.patel@larsentoubro.com",
            "contact_phone": "+91-22-6752-5656",
            "payment_terms": "Net 30",
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "id": f"CUST-{str(uuid.uuid4())[:8]}",
            "customer_code": "CUST004",
            "customer_name": "Bharat Forge Limited",
            "industry": "Metals & Forging",
            "region": "West",
            "country": "India",
            "credit_rating": "A",
            "credit_limit": 35000000.0,
            "gstin": "27AAACB2902D1Z0",
            "pan": "AAACB2902D",
            "contact_person": "Suresh Deshmukh",
            "contact_email": "suresh.d@bharatforge.com",
            "contact_phone": "+91-20-6702-5555",
            "payment_terms": "Net 45",
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "id": f"CUST-{str(uuid.uuid4())[:8]}",
            "customer_code": "CUST005",
            "customer_name": "Samsung Electronics India",
            "industry": "Electronics & PCB",
            "region": "North",
            "country": "India",
            "credit_rating": "A",
            "credit_limit": 60000000.0,
            "gstin": "06AAECS0529K1ZW",
            "pan": "AAECS0529K",
            "contact_person": "Deepak Singh",
            "contact_email": "deepak.singh@samsung.com",
            "contact_phone": "+91-124-467-7200",
            "payment_terms": "Net 60",
            "is_active": True,
            "created_at": datetime.utcnow()
        }
    ]
    
    await db['mfg_customers'].delete_many({})
    result = await db['mfg_customers'].insert_many(customers)
    print(f"✅ Inserted {len(result.inserted_ids)} customers")
    return customers


async def seed_product_families():
    """Seed product family master data"""
    print("📦 Seeding Product Families...")
    
    families = [
        {
            "id": f"PF-{str(uuid.uuid4())[:8]}",
            "family_code": "PF001",
            "family_name": "Engine Components",
            "category": "Castings",
            "industry_type": "Automotive",
            "description": "Cylinder heads, blocks, crankcases",
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "id": f"PF-{str(uuid.uuid4())[:8]}",
            "family_code": "PF002",
            "family_name": "Transmission Gears",
            "category": "Forgings",
            "industry_type": "Automotive",
            "description": "Spur gears, helical gears, bevel gears",
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "id": f"PF-{str(uuid.uuid4())[:8]}",
            "family_code": "PF003",
            "family_name": "Structural Brackets",
            "category": "Machined Parts",
            "industry_type": "Aerospace",
            "description": "Aluminum and titanium structural components",
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "id": f"PF-{str(uuid.uuid4())[:8]}",
            "family_code": "PF004",
            "family_name": "PCB Assemblies",
            "category": "Assemblies",
            "industry_type": "Electronics & PCB",
            "description": "Printed Circuit Board assemblies",
            "is_active": True,
            "created_at": datetime.utcnow()
        }
    ]
    
    await db['mfg_product_families'].delete_many({})
    result = await db['mfg_product_families'].insert_many(families)
    print(f"✅ Inserted {len(result.inserted_ids)} product families")
    return families


async def seed_skus():
    """Seed SKU master data"""
    print("🔧 Seeding SKUs...")
    
    families = await db['mfg_product_families'].find().to_list(length=10)
    
    skus = [
        {
            "id": f"SKU-{str(uuid.uuid4())[:8]}",
            "sku_code": "SKU-ENG-001",
            "sku_name": "Cylinder Head - 1.5L Diesel",
            "product_family_id": families[0]['id'] if families else "PF001",
            "uom": "PC",
            "specification": "Aluminum casting, 4-valve DOHC",
            "drawing_number": "DRG-CH-1500D-V2",
            "material_grade": "AlSi9Cu3",
            "weight_per_unit": 8.5,
            "standard_cost": 4500.0,
            "standard_price": 6750.0,
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "id": f"SKU-{str(uuid.uuid4())[:8]}",
            "sku_code": "SKU-TRN-001",
            "sku_name": "Transmission Gear - 5th Speed",
            "product_family_id": families[1]['id'] if len(families) > 1 else "PF002",
            "uom": "PC",
            "specification": "Helical gear, carburized & hardened",
            "drawing_number": "DRG-TG-5SPD-V1",
            "material_grade": "20MnCr5",
            "weight_per_unit": 1.2,
            "standard_cost": 850.0,
            "standard_price": 1275.0,
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "id": f"SKU-{str(uuid.uuid4())[:8]}",
            "sku_code": "SKU-ASP-001",
            "sku_name": "Wing Bracket - AL7075-T6",
            "product_family_id": families[2]['id'] if len(families) > 2 else "PF003",
            "uom": "PC",
            "specification": "CNC machined from billet, anodized",
            "drawing_number": "DRG-WB-7075-V3",
            "material_grade": "AL7075-T6",
            "weight_per_unit": 0.45,
            "standard_cost": 1200.0,
            "standard_price": 2400.0,
            "is_active": True,
            "created_at": datetime.utcnow()
        }
    ]
    
    await db['mfg_skus'].delete_many({})
    result = await db['mfg_skus'].insert_many(skus)
    print(f"✅ Inserted {len(result.inserted_ids)} SKUs")
    return skus


async def seed_raw_materials():
    """Seed raw material master data"""
    print("⚙️ Seeding Raw Materials...")
    
    materials = [
        {
            "id": f"RM-{str(uuid.uuid4())[:8]}",
            "rm_code": "RM-AL-001",
            "rm_name": "Aluminum Ingot - AlSi9Cu3",
            "grade": "AlSi9Cu3",
            "specification": "EN AC-46000, Silicon 8-10%, Copper 2-4%",
            "uom": "KG",
            "lead_time_days": 15,
            "standard_cost": 280.0,
            "moq": 500.0,
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "id": f"RM-{str(uuid.uuid4())[:8]}",
            "rm_code": "RM-STL-001",
            "rm_name": "Alloy Steel Bar - 20MnCr5",
            "grade": "20MnCr5",
            "specification": "EN 10084, Carburizing grade steel",
            "uom": "KG",
            "lead_time_days": 30,
            "standard_cost": 85.0,
            "moq": 1000.0,
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "id": f"RM-{str(uuid.uuid4())[:8]}",
            "rm_code": "RM-AL-002",
            "rm_name": "Aluminum Plate - 7075-T6",
            "grade": "AL7075-T6",
            "specification": "AMS 4045, Aerospace grade",
            "uom": "KG",
            "lead_time_days": 45,
            "standard_cost": 650.0,
            "moq": 250.0,
            "is_active": True,
            "created_at": datetime.utcnow()
        }
    ]
    
    await db['mfg_raw_materials'].delete_many({})
    result = await db['mfg_raw_materials'].insert_many(materials)
    print(f"✅ Inserted {len(result.inserted_ids)} raw materials")
    return materials


async def seed_plants():
    """Seed plant master data"""
    print("🏭 Seeding Plants...")
    
    plants = [
        {
            "id": f"PLT-{str(uuid.uuid4())[:8]}",
            "plant_code": "PLT-PUN-01",
            "plant_name": "Pune Casting & Machining Plant",
            "location": "Pune, Maharashtra",
            "country": "India",
            "capacity_units_per_month": 50000.0,
            "capabilities": ["Aluminum Casting", "CNC Machining", "Heat Treatment", "Assembly"],
            "certifications": ["ISO9001:2015", "IATF16949:2016"],
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "id": f"PLT-{str(uuid.uuid4())[:8]}",
            "plant_code": "PLT-CHE-01",
            "plant_name": "Chennai Precision Machining Plant",
            "location": "Chennai, Tamil Nadu",
            "country": "India",
            "capacity_units_per_month": 30000.0,
            "capabilities": ["CNC Turning", "CNC Milling", "Grinding", "Quality Inspection"],
            "certifications": ["ISO9001:2015", "AS9100D"],
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "id": f"PLT-{str(uuid.uuid4())[:8]}",
            "plant_code": "PLT-BAN-01",
            "plant_name": "Bangalore Forging Plant",
            "location": "Bangalore, Karnataka",
            "country": "India",
            "capacity_units_per_month": 40000.0,
            "capabilities": ["Hot Forging", "Cold Forging", "Heat Treatment", "Machining"],
            "certifications": ["ISO9001:2015", "ISO14001:2015"],
            "is_active": True,
            "created_at": datetime.utcnow()
        }
    ]
    
    await db['mfg_plants'].delete_many({})
    result = await db['mfg_plants'].insert_many(plants)
    print(f"✅ Inserted {len(result.inserted_ids)} plants")
    return plants


async def seed_uoms():
    """Seed UOM master data"""
    print("📏 Seeding UOMs...")
    
    uoms = [
        {"id": f"UOM-{str(uuid.uuid4())[:8]}", "uom_code": "PC", "uom_name": "Piece", "category": "Quantity", "conversion_to_base": 1.0, "base_uom": "PC", "is_active": True},
        {"id": f"UOM-{str(uuid.uuid4())[:8]}", "uom_code": "KG", "uom_name": "Kilogram", "category": "Weight", "conversion_to_base": 1.0, "base_uom": "KG", "is_active": True},
        {"id": f"UOM-{str(uuid.uuid4())[:8]}", "uom_code": "MT", "uom_name": "Metric Ton", "category": "Weight", "conversion_to_base": 1000.0, "base_uom": "KG", "is_active": True},
        {"id": f"UOM-{str(uuid.uuid4())[:8]}", "uom_code": "SET", "uom_name": "Set", "category": "Quantity", "conversion_to_base": 1.0, "base_uom": "SET", "is_active": True},
        {"id": f"UOM-{str(uuid.uuid4())[:8]}", "uom_code": "M", "uom_name": "Meter", "category": "Length", "conversion_to_base": 1.0, "base_uom": "M", "is_active": True},
    ]
    
    await db['mfg_uoms'].delete_many({})
    result = await db['mfg_uoms'].insert_many(uoms)
    print(f"✅ Inserted {len(result.inserted_ids)} UOMs")
    return uoms


async def seed_currencies():
    """Seed currency master data"""
    print("💱 Seeding Currencies...")
    
    currencies = [
        {"id": f"CUR-{str(uuid.uuid4())[:8]}", "currency_code": "INR", "currency_name": "Indian Rupee", "symbol": "₹", "conversion_to_inr": 1.0, "is_active": True, "updated_at": datetime.utcnow()},
        {"id": f"CUR-{str(uuid.uuid4())[:8]}", "currency_code": "USD", "currency_name": "US Dollar", "symbol": "$", "conversion_to_inr": 83.5, "is_active": True, "updated_at": datetime.utcnow()},
        {"id": f"CUR-{str(uuid.uuid4())[:8]}", "currency_code": "EUR", "currency_name": "Euro", "symbol": "€", "conversion_to_inr": 91.2, "is_active": True, "updated_at": datetime.utcnow()},
        {"id": f"CUR-{str(uuid.uuid4())[:8]}", "currency_code": "GBP", "currency_name": "British Pound", "symbol": "£", "conversion_to_inr": 106.8, "is_active": True, "updated_at": datetime.utcnow()},
    ]
    
    await db['mfg_currencies'].delete_many({})
    result = await db['mfg_currencies'].insert_many(currencies)
    print(f"✅ Inserted {len(result.inserted_ids)} currencies")
    return currencies


async def seed_taxes():
    """Seed tax master data"""
    print("📊 Seeding Taxes...")
    
    taxes = [
        {"id": f"TAX-{str(uuid.uuid4())[:8]}", "tax_code": "GST18", "tax_name": "GST 18%", "tax_rate": 18.0, "applicability": "Domestic", "country": "India", "is_active": True, "created_at": datetime.utcnow()},
        {"id": f"TAX-{str(uuid.uuid4())[:8]}", "tax_code": "GST12", "tax_name": "GST 12%", "tax_rate": 12.0, "applicability": "Domestic", "country": "India", "is_active": True, "created_at": datetime.utcnow()},
        {"id": f"TAX-{str(uuid.uuid4())[:8]}", "tax_code": "IGST18", "tax_name": "IGST 18%", "tax_rate": 18.0, "applicability": "Interstate", "country": "India", "is_active": True, "created_at": datetime.utcnow()},
        {"id": f"TAX-{str(uuid.uuid4())[:8]}", "tax_code": "EXP", "tax_name": "Export (Zero-rated)", "tax_rate": 0.0, "applicability": "Export", "country": "India", "is_active": True, "created_at": datetime.utcnow()},
    ]
    
    await db['mfg_taxes'].delete_many({})
    result = await db['mfg_taxes'].insert_many(taxes)
    print(f"✅ Inserted {len(result.inserted_ids)} taxes")
    return taxes


async def seed_boms():
    """Seed BOM master data"""
    print("📋 Seeding BOMs...")
    
    skus = await db['mfg_skus'].find().to_list(length=10)
    materials = await db['mfg_raw_materials'].find().to_list(length=10)
    
    if not skus or not materials:
        print("⚠️ Skipping BOMs - SKUs or materials not found")
        return []
    
    boms = [
        {
            "id": f"BOM-{str(uuid.uuid4())[:8]}",
            "bom_id": "BOM-ENG-001-V1",
            "sku_id": skus[0]['id'],
            "version": "1.0",
            "components": [
                {"rm_id": materials[0]['id'], "quantity": 10.0, "uom": "KG", "cost": 2800.0}
            ],
            "total_material_cost": 2800.0,
            "manufacturing_cost": 1200.0,
            "overhead_cost": 500.0,
            "total_cost": 4500.0,
            "is_active": True,
            "approved_by": "Engineering Manager",
            "approved_at": datetime.utcnow(),
            "created_at": datetime.utcnow()
        }
    ]
    
    await db['mfg_boms'].delete_many({})
    result = await db['mfg_boms'].insert_many(boms)
    print(f"✅ Inserted {len(result.inserted_ids)} BOMs")
    return boms


async def seed_roles():
    """Seed RBAC roles with permissions"""
    print("👥 Seeding Roles & Permissions...")
    
    roles = [
        {
            "role": "Sales Rep",
            "role_name": "Sales Representative",
            "permissions": ["lead:create", "lead:view", "lead:edit", "lead:assign"],
            "description": "Can create and manage assigned leads",
            "can_approve": [],
            "approval_threshold": None
        },
        {
            "role": "Sales Manager",
            "role_name": "Sales Manager",
            "permissions": ["lead:create", "lead:view", "lead:edit", "lead:delete", "lead:assign", "lead:convert"],
            "description": "Can manage all leads and assign to reps",
            "can_approve": [],
            "approval_threshold": None
        },
        {
            "role": "Engineering Lead",
            "role_name": "Engineering Lead",
            "permissions": ["lead:view", "lead:edit", "bom:view", "bom:bind", "lead:approve:technical"],
            "description": "Technical feasibility and BOM mapping",
            "can_approve": ["Technical"],
            "approval_threshold": None
        },
        {
            "role": "Production Manager",
            "role_name": "Production Manager",
            "permissions": ["lead:view", "lead:edit", "lead:approve:production"],
            "description": "Production feasibility and plant allocation",
            "can_approve": ["Production"],
            "approval_threshold": None
        },
        {
            "role": "QC Manager",
            "role_name": "Quality Control Manager",
            "permissions": ["lead:view", "lead:edit", "lead:approve:qc"],
            "description": "Quality feasibility and certification checks",
            "can_approve": ["QC", "Compliance"],
            "approval_threshold": None
        },
        {
            "role": "Pricing Manager",
            "role_name": "Pricing Manager",
            "permissions": ["lead:view", "lead:edit", "costing:view", "costing:edit", "lead:approve:pricing"],
            "description": "Costing and pricing approval",
            "can_approve": ["Pricing"],
            "approval_threshold": 5000000.0  # 50 Lakhs
        },
        {
            "role": "Finance Head",
            "role_name": "Finance Head / CFO",
            "permissions": ["lead:view", "lead:edit", "lead:approve:credit", "lead:approve:management", "audit:view"],
            "description": "Credit approval and management approval",
            "can_approve": ["Credit", "Management"],
            "approval_threshold": None  # No limit
        }
    ]
    
    await db['mfg_roles'].delete_many({})
    result = await db['mfg_roles'].insert_many(roles)
    print(f"✅ Inserted {len(result.inserted_ids)} roles")
    return roles


async def seed_leads():
    """Seed sample manufacturing leads"""
    print("📝 Seeding Sample Leads...")
    
    customers = await db['mfg_customers'].find().to_list(length=10)
    families = await db['mfg_product_families'].find().to_list(length=10)
    skus = await db['mfg_skus'].find().to_list(length=10)
    
    if not customers:
        print("⚠️ Skipping leads - customers not found")
        return []
    
    leads = []
    
    # Lead 1: Tata Motors - Cylinder Head (New, Intake stage)
    leads.append({
        "id": f"LEAD-{str(uuid.uuid4())[:8]}",
        "lead_id": "MFGL-2025-0001",
        "rfq_number": "TML/RFQ/2025/0234",
        "status": "New",
        "priority": "High",
        "lead_score": 0,
        "current_stage": "Intake",
        "customer_id": customers[0]['id'],
        "customer_name": customers[0]['customer_name'],
        "customer_industry": customers[0]['industry'],
        "contact_person": customers[0]['contact_person'],
        "contact_email": customers[0]['contact_email'],
        "contact_phone": customers[0]['contact_phone'],
        "product_family_id": families[0]['id'] if families else None,
        "sku_id": skus[0]['id'] if skus else None,
        "product_description": "Cylinder Head for 1.5L Diesel Engine - 4 Valve DOHC",
        "quantity": 10000.0,
        "uom": "PC",
        "delivery_date_required": (date.today() + timedelta(days=120)).isoformat(),
        "application": "Passenger vehicle diesel engine",
        "technical_specs": {
            "material_grade": "AlSi9Cu3",
            "tolerances": "±0.05mm on critical dimensions",
            "surface_finish": "Ra 1.6 on sealing surfaces",
            "coating": "None",
            "machining_type": "CNC Machining",
            "certifications_required": ["IATF16949", "PPAP Level 3"],
            "msds_required": False,
            "drawing_files": []
        },
        "commercial_data": {
            "expected_price_per_unit": 6500.0,
            "expected_total_value": 65000000.0,
            "currency": "INR",
            "payment_terms": "Net 45",
            "incoterms": "EXW Pune"
        },
        "sample_required": True,
        "sample_quantity": 5,
        "sample_lead_time": 45,
        "feasibility": {
            "overall_status": "Not Started"
        },
        "approvals": [],
        "approval_status": "Not Submitted",
        "assigned_to": "user-001",
        "assigned_to_name": "Demo Sales Rep",
        "assigned_to_role": "Sales Rep",
        "risk_level": "Medium",
        "risk_notes": "High volume, tight tolerances",
        "is_lost": False,
        "is_converted": False,
        "audit_logs": [{
            "timestamp": datetime.utcnow(),
            "user_id": "user-001",
            "user_name": "Demo Sales Rep",
            "action": "created",
            "notes": "Lead MFGL-2025-0001 created"
        }],
        "created_by": "user-001",
        "created_by_name": "Demo Sales Rep",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    })
    
    # Lead 2: Mahindra Aerospace - Wing Bracket (Feasibility Check stage)
    if len(customers) > 1 and len(families) > 2:
        leads.append({
            "id": f"LEAD-{str(uuid.uuid4())[:8]}",
            "lead_id": "MFGL-2025-0002",
            "rfq_number": "MAE/RFQ/2025/0089",
            "status": "Feasibility Check",
            "priority": "Urgent",
            "lead_score": 85,
            "current_stage": "Feasibility",
            "customer_id": customers[1]['id'],
            "customer_name": customers[1]['customer_name'],
            "customer_industry": customers[1]['industry'],
            "contact_person": customers[1]['contact_person'],
            "contact_email": customers[1]['contact_email'],
            "contact_phone": customers[1]['contact_phone'],
            "product_family_id": families[2]['id'],
            "sku_id": skus[2]['id'] if len(skus) > 2 else None,
            "product_description": "Aircraft Wing Bracket - AL7075-T6",
            "quantity": 500.0,
            "uom": "PC",
            "delivery_date_required": (date.today() + timedelta(days=90)).isoformat(),
            "application": "Commercial aircraft wing assembly",
            "technical_specs": {
                "material_grade": "AL7075-T6",
                "tolerances": "±0.025mm",
                "surface_finish": "Ra 0.8",
                "coating": "Anodized Type II",
                "machining_type": "5-Axis CNC Milling",
                "certifications_required": ["AS9100D", "NADCAP"],
                "msds_required": False,
                "drawing_files": []
            },
            "commercial_data": {
                "expected_price_per_unit": 2200.0,
                "expected_total_value": 1100000.0,
                "currency": "INR",
                "payment_terms": "Net 60",
                "incoterms": "DAP Chennai"
            },
            "sample_required": True,
            "sample_quantity": 3,
            "sample_lead_time": 30,
            "feasibility": {
                "engineering_feasible": True,
                "engineering_notes": "Design reviewed - feasible with current capabilities",
                "engineering_checked_by": "Engineering Lead",
                "engineering_checked_at": datetime.utcnow(),
                "production_feasible": True,
                "production_notes": "Chennai plant has 5-axis capability, capacity available",
                "production_plant_id": "PLT-CHE-01",
                "production_checked_by": "Production Manager",
                "production_checked_at": datetime.utcnow(),
                "qc_feasible": None,
                "rm_feasible": None,
                "overall_status": "In Progress"
            },
            "approvals": [],
            "approval_status": "Not Submitted",
            "assigned_to": "user-002",
            "assigned_to_name": "Senior Sales Manager",
            "assigned_to_role": "Sales Manager",
            "risk_level": "High",
            "risk_notes": "Aerospace critical part - stringent quality requirements",
            "is_lost": False,
            "is_converted": False,
            "audit_logs": [
                {
                    "timestamp": datetime.utcnow() - timedelta(days=2),
                    "user_id": "user-002",
                    "user_name": "Senior Sales Manager",
                    "action": "created",
                    "notes": "Lead MFGL-2025-0002 created"
                },
                {
                    "timestamp": datetime.utcnow() - timedelta(days=1),
                    "user_id": "user-003",
                    "user_name": "Engineering Lead",
                    "action": "feasibility_engineering_updated",
                    "notes": "Engineering feasibility: Feasible"
                }
            ],
            "created_by": "user-002",
            "created_by_name": "Senior Sales Manager",
            "created_at": datetime.utcnow() - timedelta(days=2),
            "updated_at": datetime.utcnow()
        })
    
    # Lead 3: L&T - Transmission Gears (Costing stage)
    if len(customers) > 2 and len(families) > 1:
        leads.append({
            "id": f"LEAD-{str(uuid.uuid4())[:8]}",
            "lead_id": "MFGL-2025-0003",
            "rfq_number": "LT/CE/RFQ/2025/0456",
            "status": "Costing",
            "priority": "High",
            "lead_score": 75,
            "current_stage": "Costing",
            "customer_id": customers[2]['id'],
            "customer_name": customers[2]['customer_name'],
            "customer_industry": customers[2]['industry'],
            "contact_person": customers[2]['contact_person'],
            "contact_email": customers[2]['contact_email'],
            "contact_phone": customers[2]['contact_phone'],
            "product_family_id": families[1]['id'],
            "sku_id": skus[1]['id'] if len(skus) > 1 else None,
            "product_description": "Heavy Duty Transmission Gears Set",
            "quantity": 5000.0,
            "uom": "SET",
            "delivery_date_required": (date.today() + timedelta(days=150)).isoformat(),
            "application": "Construction equipment transmission",
            "technical_specs": {
                "material_grade": "20MnCr5",
                "tolerances": "DIN 5 Quality",
                "surface_finish": "Ground",
                "coating": "None",
                "machining_type": "Hobbing + Grinding",
                "heat_treatment": "Carburizing + Hardening",
                "hardness": "HRC 58-62 (case), HRC 30-40 (core)",
                "certifications_required": ["ISO9001", "Material Test Certificate"],
                "msds_required": False,
                "drawing_files": []
            },
            "commercial_data": {
                "expected_price_per_unit": 1200.0,
                "expected_total_value": 6000000.0,
                "currency": "INR",
                "payment_terms": "Net 30",
                "incoterms": "FOR Mumbai"
            },
            "sample_required": False,
            "feasibility": {
                "engineering_feasible": True,
                "engineering_notes": "Standard forging process applicable",
                "engineering_checked_by": "Engineering Lead",
                "engineering_checked_at": datetime.utcnow() - timedelta(days=3),
                "production_feasible": True,
                "production_notes": "Bangalore forging plant - capacity confirmed",
                "production_plant_id": "PLT-BAN-01",
                "production_checked_by": "Production Manager",
                "production_checked_at": datetime.utcnow() - timedelta(days=2),
                "qc_feasible": True,
                "qc_notes": "Heat treatment and hardness testing capability available",
                "qc_checked_by": "QC Manager",
                "qc_checked_at": datetime.utcnow() - timedelta(days=2),
                "rm_feasible": True,
                "rm_notes": "20MnCr5 bars available from regular supplier",
                "rm_lead_time": 30,
                "overall_status": "Feasible"
            },
            "costing": {
                "bom_id": None,
                "material_cost": 320.0,
                "labor_cost": 180.0,
                "overhead_cost": 100.0,
                "tooling_cost": 50.0,
                "total_cost_per_unit": 650.0,
                "margin_percentage": 25.0,
                "quoted_price": 812.5,
                "calculated_at": datetime.utcnow() - timedelta(hours=2),
                "calculated_by": "Pricing Manager"
            },
            "approvals": [],
            "approval_status": "Not Submitted",
            "assigned_to": "user-002",
            "assigned_to_name": "Senior Sales Manager",
            "assigned_to_role": "Sales Manager",
            "risk_level": "Low",
            "risk_notes": "Standard product line",
            "is_lost": False,
            "is_converted": False,
            "audit_logs": [
                {
                    "timestamp": datetime.utcnow() - timedelta(days=5),
                    "user_id": "user-002",
                    "user_name": "Senior Sales Manager",
                    "action": "created",
                    "notes": "Lead MFGL-2025-0003 created"
                },
                {
                    "timestamp": datetime.utcnow() - timedelta(hours=2),
                    "user_id": "user-005",
                    "user_name": "Pricing Manager",
                    "action": "costing_calculated",
                    "notes": "Costing calculated: Cost=650.0, Price=812.5, Margin=25.0%"
                }
            ],
            "created_by": "user-002",
            "created_by_name": "Senior Sales Manager",
            "created_at": datetime.utcnow() - timedelta(days=5),
            "updated_at": datetime.utcnow()
        })
    
    if leads:
        await db['mfg_leads'].delete_many({})
        result = await db['mfg_leads'].insert_many(leads)
        print(f"✅ Inserted {len(result.inserted_ids)} sample leads")
    
    return leads


async def main():
    """Main seed function"""
    print("\n🚀 Starting Manufacturing Module - Phase 1 Seed Data Creation\n")
    print("=" * 70)
    
    try:
        # Seed all master data
        await seed_customers()
        await seed_product_families()
        await seed_skus()
        await seed_raw_materials()
        await seed_plants()
        await seed_uoms()
        await seed_currencies()
        await seed_taxes()
        await seed_boms()
        await seed_roles()
        
        # Seed sample leads
        await seed_leads()
        
        print("\n" + "=" * 70)
        print("✅ Manufacturing Module Phase 1 - Seed Data Creation Complete!")
        print("=" * 70)
        
        # Summary
        customers_count = await db['mfg_customers'].count_documents({})
        families_count = await db['mfg_product_families'].count_documents({})
        skus_count = await db['mfg_skus'].count_documents({})
        materials_count = await db['mfg_raw_materials'].count_documents({})
        plants_count = await db['mfg_plants'].count_documents({})
        roles_count = await db['mfg_roles'].count_documents({})
        leads_count = await db['mfg_leads'].count_documents({})
        
        print("\n📊 Summary:")
        print(f"   - Customers: {customers_count}")
        print(f"   - Product Families: {families_count}")
        print(f"   - SKUs: {skus_count}")
        print(f"   - Raw Materials: {materials_count}")
        print(f"   - Plants: {plants_count}")
        print(f"   - UOMs: 5")
        print(f"   - Currencies: 4")
        print(f"   - Taxes: 4")
        print(f"   - Roles: {roles_count}")
        print(f"   - Sample Leads: {leads_count}")
        print("\n")
        
    except Exception as e:
        print(f"\n❌ Error during seed: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(main())
