"""
INNOVATE BOOKS - COMPREHENSIVE SEED DATA
Company Profile: 20 Employees, ₹100 Crores Annual Turnover
Industry: Technology Services & Products
"""

from fastapi import APIRouter, Depends
from datetime import datetime, timezone, timedelta
import uuid
import random
from typing import List

router = APIRouter(prefix="/api/seed", tags=["seed"])

def get_db():
    from main import db
    return db


# ============= EMPLOYEE STRUCTURE (20 Employees) =============
EMPLOYEES = [
    # Leadership (3)
    {"id": "EMP001", "name": "Rajesh Kumar", "email": "rajesh.kumar@innovatebooks.com", "role": "CEO", "department": "Leadership", "salary": 4500000, "reports_to": None},
    {"id": "EMP002", "name": "Priya Sharma", "email": "priya.sharma@innovatebooks.com", "role": "CFO", "department": "Finance", "salary": 3600000, "reports_to": "EMP001"},
    {"id": "EMP003", "name": "Amit Patel", "email": "amit.patel@innovatebooks.com", "role": "CTO", "department": "Technology", "salary": 3600000, "reports_to": "EMP001"},
    
    # Sales & Revenue (4)
    {"id": "EMP004", "name": "Sunita Reddy", "email": "sunita.reddy@innovatebooks.com", "role": "Sales Director", "department": "Sales", "salary": 2400000, "reports_to": "EMP001"},
    {"id": "EMP005", "name": "Vikram Singh", "email": "vikram.singh@innovatebooks.com", "role": "Senior Sales Manager", "department": "Sales", "salary": 1500000, "reports_to": "EMP004"},
    {"id": "EMP006", "name": "Deepika Nair", "email": "deepika.nair@innovatebooks.com", "role": "Sales Executive", "department": "Sales", "salary": 900000, "reports_to": "EMP005"},
    {"id": "EMP007", "name": "Karthik Menon", "email": "karthik.menon@innovatebooks.com", "role": "Business Development Executive", "department": "Sales", "salary": 800000, "reports_to": "EMP005"},
    
    # Finance & Accounts (3)
    {"id": "EMP008", "name": "Lakshmi Iyer", "email": "lakshmi.iyer@innovatebooks.com", "role": "Finance Manager", "department": "Finance", "salary": 1800000, "reports_to": "EMP002"},
    {"id": "EMP009", "name": "Ramesh Gupta", "email": "ramesh.gupta@innovatebooks.com", "role": "Senior Accountant", "department": "Finance", "salary": 1200000, "reports_to": "EMP008"},
    {"id": "EMP010", "name": "Anita Verma", "email": "anita.verma@innovatebooks.com", "role": "Accounts Executive", "department": "Finance", "salary": 700000, "reports_to": "EMP009"},
    
    # Technology (5)
    {"id": "EMP011", "name": "Suresh Babu", "email": "suresh.babu@innovatebooks.com", "role": "Engineering Manager", "department": "Technology", "salary": 2400000, "reports_to": "EMP003"},
    {"id": "EMP012", "name": "Meera Krishnan", "email": "meera.krishnan@innovatebooks.com", "role": "Senior Developer", "department": "Technology", "salary": 1800000, "reports_to": "EMP011"},
    {"id": "EMP013", "name": "Arjun Das", "email": "arjun.das@innovatebooks.com", "role": "Full Stack Developer", "department": "Technology", "salary": 1500000, "reports_to": "EMP011"},
    {"id": "EMP014", "name": "Neha Saxena", "email": "neha.saxena@innovatebooks.com", "role": "QA Engineer", "department": "Technology", "salary": 1200000, "reports_to": "EMP011"},
    {"id": "EMP015", "name": "Rohit Jain", "email": "rohit.jain@innovatebooks.com", "role": "DevOps Engineer", "department": "Technology", "salary": 1400000, "reports_to": "EMP011"},
    
    # Operations & Delivery (3)
    {"id": "EMP016", "name": "Kavitha Rajan", "email": "kavitha.rajan@innovatebooks.com", "role": "Operations Manager", "department": "Operations", "salary": 1800000, "reports_to": "EMP001"},
    {"id": "EMP017", "name": "Mohammed Ali", "email": "mohammed.ali@innovatebooks.com", "role": "Delivery Lead", "department": "Operations", "salary": 1500000, "reports_to": "EMP016"},
    {"id": "EMP018", "name": "Pooja Agarwal", "email": "pooja.agarwal@innovatebooks.com", "role": "Project Coordinator", "department": "Operations", "salary": 900000, "reports_to": "EMP017"},
    
    # HR & Admin (2)
    {"id": "EMP019", "name": "Sanjay Mishra", "email": "sanjay.mishra@innovatebooks.com", "role": "HR Manager", "department": "HR", "salary": 1500000, "reports_to": "EMP001"},
    {"id": "EMP020", "name": "Divya Kapoor", "email": "divya.kapoor@innovatebooks.com", "role": "Admin Executive", "department": "Admin", "salary": 600000, "reports_to": "EMP019"},
]

# ============= CUSTOMERS (Enterprise Clients for ₹100 Cr Turnover) =============
CUSTOMERS = [
    {"id": "CUST001", "name": "Tata Consultancy Services", "short_name": "TCS", "contact_person": "Arun Krishnamurthy", "email": "arun.k@tcs.com", "phone": "+91-9876543210", "annual_value": 25000000, "industry": "IT Services", "tier": "Enterprise"},
    {"id": "CUST002", "name": "Infosys Limited", "short_name": "Infosys", "contact_person": "Sneha Reddy", "email": "sneha.reddy@infosys.com", "phone": "+91-9876543211", "annual_value": 20000000, "industry": "IT Services", "tier": "Enterprise"},
    {"id": "CUST003", "name": "Wipro Technologies", "short_name": "Wipro", "contact_person": "Rahul Mehta", "email": "rahul.mehta@wipro.com", "phone": "+91-9876543212", "annual_value": 18000000, "industry": "IT Services", "tier": "Enterprise"},
    {"id": "CUST004", "name": "HDFC Bank", "short_name": "HDFC", "contact_person": "Priya Joshi", "email": "priya.joshi@hdfcbank.com", "phone": "+91-9876543213", "annual_value": 15000000, "industry": "Banking", "tier": "Enterprise"},
    {"id": "CUST005", "name": "Reliance Industries", "short_name": "RIL", "contact_person": "Vikram Shah", "email": "vikram.shah@ril.com", "phone": "+91-9876543214", "annual_value": 12000000, "industry": "Conglomerate", "tier": "Enterprise"},
    {"id": "CUST006", "name": "Larsen & Toubro", "short_name": "L&T", "contact_person": "Sunil Kumar", "email": "sunil.kumar@larsentoubro.com", "phone": "+91-9876543215", "annual_value": 8000000, "industry": "Engineering", "tier": "Large"},
    {"id": "CUST007", "name": "Mahindra Group", "short_name": "Mahindra", "contact_person": "Anand Sharma", "email": "anand.sharma@mahindra.com", "phone": "+91-9876543216", "annual_value": 6000000, "industry": "Automotive", "tier": "Large"},
    {"id": "CUST008", "name": "Axis Bank", "short_name": "Axis", "contact_person": "Kavya Nair", "email": "kavya.nair@axisbank.com", "phone": "+91-9876543217", "annual_value": 5000000, "industry": "Banking", "tier": "Large"},
    {"id": "CUST009", "name": "Tech Mahindra", "short_name": "Tech M", "contact_person": "Deepak Gupta", "email": "deepak.gupta@techmahindra.com", "phone": "+91-9876543218", "annual_value": 4000000, "industry": "IT Services", "tier": "Large"},
    {"id": "CUST010", "name": "Godrej Industries", "short_name": "Godrej", "contact_person": "Meena Patel", "email": "meena.patel@godrej.com", "phone": "+91-9876543219", "annual_value": 3500000, "industry": "FMCG", "tier": "Mid-Market"},
    {"id": "CUST011", "name": "Bharti Airtel", "short_name": "Airtel", "contact_person": "Rajiv Khanna", "email": "rajiv.khanna@airtel.com", "phone": "+91-9876543220", "annual_value": 3000000, "industry": "Telecom", "tier": "Mid-Market"},
    {"id": "CUST012", "name": "Hindustan Unilever", "short_name": "HUL", "contact_person": "Shalini Rao", "email": "shalini.rao@hul.com", "phone": "+91-9876543221", "annual_value": 2500000, "industry": "FMCG", "tier": "Mid-Market"},
]

# ============= VENDORS (Suppliers) =============
VENDORS = [
    {"id": "VND001", "name": "Amazon Web Services", "short_name": "AWS", "contact_person": "John Smith", "email": "enterprise@aws.com", "phone": "+1-800-AWS-0000", "annual_spend": 8000000, "category": "Cloud Infrastructure", "payment_terms": "Net 30"},
    {"id": "VND002", "name": "Microsoft Azure", "short_name": "Azure", "contact_person": "Sarah Johnson", "email": "azure@microsoft.com", "phone": "+1-800-MSFT-000", "annual_spend": 5000000, "category": "Cloud Infrastructure", "payment_terms": "Net 30"},
    {"id": "VND003", "name": "Google Cloud Platform", "short_name": "GCP", "contact_person": "Mike Chen", "email": "cloud@google.com", "phone": "+1-800-GCP-0000", "annual_spend": 3000000, "category": "Cloud Infrastructure", "payment_terms": "Net 30"},
    {"id": "VND004", "name": "Salesforce India", "short_name": "SFDC", "contact_person": "Ravi Kumar", "email": "ravi.kumar@salesforce.com", "phone": "+91-9988776655", "annual_spend": 2500000, "category": "CRM Software", "payment_terms": "Annual"},
    {"id": "VND005", "name": "Zoho Corporation", "short_name": "Zoho", "contact_person": "Sridhar Vembu", "email": "enterprise@zoho.com", "phone": "+91-9988776656", "annual_spend": 1500000, "category": "Business Software", "payment_terms": "Annual"},
    {"id": "VND006", "name": "Dell Technologies India", "short_name": "Dell", "contact_person": "Amit Verma", "email": "amit.verma@dell.com", "phone": "+91-9988776657", "annual_spend": 4000000, "category": "Hardware", "payment_terms": "Net 45"},
    {"id": "VND007", "name": "HP India", "short_name": "HP", "contact_person": "Priya Menon", "email": "priya.menon@hp.com", "phone": "+91-9988776658", "annual_spend": 2000000, "category": "Hardware", "payment_terms": "Net 45"},
    {"id": "VND008", "name": "Cisco Systems India", "short_name": "Cisco", "contact_person": "Rajesh Nair", "email": "rajesh.nair@cisco.com", "phone": "+91-9988776659", "annual_spend": 3500000, "category": "Networking", "payment_terms": "Net 30"},
]

# ============= PRODUCTS/SERVICES CATALOG =============
CATALOG_ITEMS = [
    # Software Products
    {"id": "PROD001", "name": "IB Commerce Suite", "category": "Software", "type": "Product", "unit_price": 500000, "cost_price": 150000, "hsn_code": "998314", "gst_rate": 18},
    {"id": "PROD002", "name": "IB Finance Module", "category": "Software", "type": "Product", "unit_price": 300000, "cost_price": 90000, "hsn_code": "998314", "gst_rate": 18},
    {"id": "PROD003", "name": "IB Workforce Manager", "category": "Software", "type": "Product", "unit_price": 250000, "cost_price": 75000, "hsn_code": "998314", "gst_rate": 18},
    {"id": "PROD004", "name": "IB Analytics Platform", "category": "Software", "type": "Product", "unit_price": 400000, "cost_price": 120000, "hsn_code": "998314", "gst_rate": 18},
    
    # Services
    {"id": "SVC001", "name": "Implementation Services", "category": "Services", "type": "Service", "unit_price": 15000, "cost_price": 8000, "hsn_code": "998313", "gst_rate": 18, "unit": "per day"},
    {"id": "SVC002", "name": "Technical Consulting", "category": "Services", "type": "Service", "unit_price": 20000, "cost_price": 10000, "hsn_code": "998313", "gst_rate": 18, "unit": "per day"},
    {"id": "SVC003", "name": "Support & Maintenance", "category": "Services", "type": "Service", "unit_price": 50000, "cost_price": 20000, "hsn_code": "998313", "gst_rate": 18, "unit": "per month"},
    {"id": "SVC004", "name": "Training Services", "category": "Services", "type": "Service", "unit_price": 10000, "cost_price": 5000, "hsn_code": "998313", "gst_rate": 18, "unit": "per day"},
    {"id": "SVC005", "name": "Custom Development", "category": "Services", "type": "Service", "unit_price": 18000, "cost_price": 9000, "hsn_code": "998314", "gst_rate": 18, "unit": "per day"},
    
    # Cloud Subscriptions
    {"id": "SUB001", "name": "IB Cloud - Basic", "category": "Subscription", "type": "Subscription", "unit_price": 25000, "cost_price": 8000, "hsn_code": "998315", "gst_rate": 18, "unit": "per month"},
    {"id": "SUB002", "name": "IB Cloud - Professional", "category": "Subscription", "type": "Subscription", "unit_price": 75000, "cost_price": 25000, "hsn_code": "998315", "gst_rate": 18, "unit": "per month"},
    {"id": "SUB003", "name": "IB Cloud - Enterprise", "category": "Subscription", "type": "Subscription", "unit_price": 200000, "cost_price": 60000, "hsn_code": "998315", "gst_rate": 18, "unit": "per month"},
]


@router.get("/comprehensive")
async def seed_comprehensive_data():
    """Seed comprehensive data for 20 employees, ₹100 Cr turnover company"""
    db = get_db()
    now = datetime.now(timezone.utc)
    org_id = "org_innovatebooks"
    
    results = {
        "employees": 0,
        "customers": 0,
        "vendors": 0,
        "catalog_items": 0,
        "leads": 0,
        "deals": 0,
        "invoices": 0,
        "purchase_orders": 0,
        "transactions": 0,
        "tasks": 0,
        "approvals": 0
    }
    
    # ============= SEED EMPLOYEES =============
    for emp in EMPLOYEES:
        existing = await db.employees.find_one({"employee_id": emp["id"]})
        if not existing:
            await db.employees.insert_one({
                "employee_id": emp["id"],
                "full_name": emp["name"],
                "email": emp["email"],
                "role": emp["role"],
                "department": emp["department"],
                "annual_salary": emp["salary"],
                "reports_to": emp["reports_to"],
                "org_id": org_id,
                "status": "active",
                "join_date": (now - timedelta(days=random.randint(100, 1000))).isoformat(),
                "created_at": now.isoformat()
            })
            results["employees"] += 1
    
    # ============= SEED CUSTOMERS =============
    for cust in CUSTOMERS:
        existing = await db.customers.find_one({"customer_id": cust["id"]})
        if not existing:
            await db.customers.insert_one({
                "customer_id": cust["id"],
                "company_name": cust["name"],
                "short_name": cust["short_name"],
                "contact_person": cust["contact_person"],
                "email": cust["email"],
                "phone": cust["phone"],
                "annual_contract_value": cust["annual_value"],
                "industry": cust["industry"],
                "tier": cust["tier"],
                "payment_terms": "Net 30",
                "gstin": f"27AABCT{random.randint(1000, 9999)}A1Z5",
                "address": f"Corporate Office, {cust['short_name']} Towers, Mumbai 400001",
                "org_id": org_id,
                "status": "active",
                "created_at": now.isoformat()
            })
            results["customers"] += 1
    
    # ============= SEED VENDORS =============
    for vnd in VENDORS:
        existing = await db.vendors.find_one({"vendor_id": vnd["id"]})
        if not existing:
            await db.vendors.insert_one({
                "vendor_id": vnd["id"],
                "company_name": vnd["name"],
                "short_name": vnd["short_name"],
                "contact_person": vnd["contact_person"],
                "email": vnd["email"],
                "phone": vnd["phone"],
                "annual_spend": vnd["annual_spend"],
                "category": vnd["category"],
                "payment_terms": vnd["payment_terms"],
                "org_id": org_id,
                "status": "active",
                "created_at": now.isoformat()
            })
            results["vendors"] += 1
    
    # ============= SEED CATALOG ITEMS =============
    for item in CATALOG_ITEMS:
        existing = await db.catalog_items.find_one({"item_id": item["id"]})
        if not existing:
            await db.catalog_items.insert_one({
                "item_id": item["id"],
                "name": item["name"],
                "category": item["category"],
                "type": item["type"],
                "unit_price": item["unit_price"],
                "cost_price": item["cost_price"],
                "hsn_code": item["hsn_code"],
                "gst_rate": item["gst_rate"],
                "unit": item.get("unit", "per unit"),
                "org_id": org_id,
                "status": "active",
                "created_at": now.isoformat()
            })
            results["catalog_items"] += 1
    
    # ============= SEED LEADS (Potential ₹15 Cr pipeline) =============
    lead_companies = [
        {"name": "ICICI Bank", "value": 5000000, "stage": "qualified"},
        {"name": "Bajaj Finserv", "value": 4000000, "stage": "proposal"},
        {"name": "Kotak Mahindra Bank", "value": 3500000, "stage": "negotiation"},
        {"name": "Sun Pharma", "value": 3000000, "stage": "discovery"},
        {"name": "Asian Paints", "value": 2500000, "stage": "qualified"},
        {"name": "Maruti Suzuki", "value": 4500000, "stage": "proposal"},
        {"name": "Adani Group", "value": 6000000, "stage": "discovery"},
        {"name": "JSW Steel", "value": 3000000, "stage": "qualified"},
    ]
    
    for i, lead in enumerate(lead_companies):
        lead_id = f"LEAD-2024-{str(i+1).zfill(4)}"
        existing = await db.leads.find_one({"id": lead_id})
        if not existing:
            await db.leads.insert_one({
                "id": lead_id,
                "company": lead["name"],
                "contact_name": f"Contact at {lead['name']}",
                "email": f"contact@{lead['name'].lower().replace(' ', '')}.com",
                "phone": f"+91-98765{str(43220+i)}",
                "deal_value": lead["value"],
                "lifecycle_stage": lead["stage"],
                "lead_source": random.choice(["Website", "Referral", "LinkedIn", "Conference"]),
                "assigned_to": random.choice(["EMP005", "EMP006", "EMP007"]),
                "lead_score": random.randint(60, 95),
                "org_id": org_id,
                "created_at": (now - timedelta(days=random.randint(10, 90))).isoformat()
            })
            results["leads"] += 1
    
    # ============= SEED DEALS/CONTRACTS (Active Revenue) =============
    deal_data = [
        {"customer": "CUST001", "value": 25000000, "status": "active", "products": ["PROD001", "SVC001", "SUB003"]},
        {"customer": "CUST002", "value": 20000000, "status": "active", "products": ["PROD001", "PROD002", "SVC002"]},
        {"customer": "CUST003", "value": 18000000, "status": "active", "products": ["PROD001", "SVC003", "SUB002"]},
        {"customer": "CUST004", "value": 15000000, "status": "active", "products": ["PROD004", "SVC001", "SUB003"]},
        {"customer": "CUST005", "value": 12000000, "status": "active", "products": ["PROD001", "PROD003", "SVC002"]},
        {"customer": "CUST006", "value": 8000000, "status": "active", "products": ["PROD002", "SVC001", "SUB002"]},
        {"customer": "CUST007", "value": 6000000, "status": "active", "products": ["PROD003", "SVC003", "SUB001"]},
        {"customer": "CUST008", "value": 5000000, "status": "active", "products": ["PROD001", "SVC004"]},
    ]
    
    for i, deal in enumerate(deal_data):
        deal_id = f"DEAL-2024-{str(i+1).zfill(4)}"
        existing = await db.deals.find_one({"deal_id": deal_id})
        if not existing:
            await db.deals.insert_one({
                "deal_id": deal_id,
                "customer_id": deal["customer"],
                "deal_value": deal["value"],
                "status": deal["status"],
                "products": deal["products"],
                "contract_start": (now - timedelta(days=random.randint(30, 180))).isoformat(),
                "contract_end": (now + timedelta(days=random.randint(180, 365))).isoformat(),
                "sales_owner": random.choice(["EMP004", "EMP005"]),
                "org_id": org_id,
                "created_at": now.isoformat()
            })
            results["deals"] += 1
    
    # ============= SEED INVOICES (₹8 Cr+ monthly billing) =============
    invoice_num = 1
    for month_offset in range(12):  # Last 12 months
        month_date = now - timedelta(days=30 * month_offset)
        
        # Generate invoices for active customers
        for cust in CUSTOMERS[:8]:  # Top 8 customers
            invoice_id = f"INV-2024-{str(invoice_num).zfill(5)}"
            existing = await db.invoices.find_one({"invoice_id": invoice_id})
            if not existing:
                monthly_value = cust["annual_value"] / 12
                gst = monthly_value * 0.18
                total = monthly_value + gst
                
                await db.invoices.insert_one({
                    "invoice_id": invoice_id,
                    "customer_id": cust["id"],
                    "customer_name": cust["name"],
                    "invoice_date": month_date.isoformat(),
                    "due_date": (month_date + timedelta(days=30)).isoformat(),
                    "subtotal": monthly_value,
                    "gst_amount": gst,
                    "total_amount": total,
                    "status": "paid" if month_offset > 1 else random.choice(["paid", "pending"]),
                    "payment_date": (month_date + timedelta(days=random.randint(15, 45))).isoformat() if month_offset > 1 else None,
                    "org_id": org_id,
                    "created_at": month_date.isoformat()
                })
                results["invoices"] += 1
            invoice_num += 1
    
    # ============= SEED PURCHASE ORDERS (₹30 Cr annual procurement) =============
    po_num = 1
    for quarter in range(4):  # 4 quarters
        quarter_date = now - timedelta(days=90 * quarter)
        
        for vnd in VENDORS:
            po_id = f"PO-2024-{str(po_num).zfill(5)}"
            existing = await db.purchase_orders.find_one({"po_id": po_id})
            if not existing:
                quarterly_value = vnd["annual_spend"] / 4
                gst = quarterly_value * 0.18
                total = quarterly_value + gst
                
                await db.purchase_orders.insert_one({
                    "po_id": po_id,
                    "vendor_id": vnd["id"],
                    "vendor_name": vnd["name"],
                    "po_date": quarter_date.isoformat(),
                    "delivery_date": (quarter_date + timedelta(days=30)).isoformat(),
                    "subtotal": quarterly_value,
                    "gst_amount": gst,
                    "total_amount": total,
                    "status": "completed" if quarter > 0 else random.choice(["approved", "pending"]),
                    "category": vnd["category"],
                    "approved_by": "EMP002",
                    "org_id": org_id,
                    "created_at": quarter_date.isoformat()
                })
                results["purchase_orders"] += 1
            po_num += 1
    
    # ============= SEED BANK TRANSACTIONS =============
    # Revenue collections (₹100 Cr inflow)
    for month_offset in range(12):
        month_date = now - timedelta(days=30 * month_offset)
        
        # Collections from customers
        for cust in CUSTOMERS[:8]:
            monthly_collection = cust["annual_value"] / 12
            txn_id = f"TXN-{str(uuid.uuid4())[:8].upper()}"
            
            await db.transactions.insert_one({
                "txn_id": txn_id,
                "type": "credit",
                "category": "revenue",
                "amount": monthly_collection * 1.18,  # Including GST
                "description": f"Payment from {cust['name']}",
                "reference": f"INV-2024-{random.randint(10000, 99999)}",
                "party_id": cust["id"],
                "party_name": cust["name"],
                "txn_date": (month_date + timedelta(days=random.randint(15, 45))).isoformat(),
                "org_id": org_id,
                "created_at": now.isoformat()
            })
            results["transactions"] += 1
        
        # Vendor payments
        for vnd in VENDORS[:4]:  # Top 4 vendors
            monthly_payment = vnd["annual_spend"] / 12
            txn_id = f"TXN-{str(uuid.uuid4())[:8].upper()}"
            
            await db.transactions.insert_one({
                "txn_id": txn_id,
                "type": "debit",
                "category": "expense",
                "amount": monthly_payment * 1.18,
                "description": f"Payment to {vnd['name']}",
                "reference": f"PO-2024-{random.randint(10000, 99999)}",
                "party_id": vnd["id"],
                "party_name": vnd["name"],
                "txn_date": (month_date + timedelta(days=random.randint(20, 50))).isoformat(),
                "org_id": org_id,
                "created_at": now.isoformat()
            })
            results["transactions"] += 1
        
        # Salary disbursements (₹4.2 Cr annual)
        total_salary = sum(emp["salary"] for emp in EMPLOYEES)
        txn_id = f"TXN-{str(uuid.uuid4())[:8].upper()}"
        await db.transactions.insert_one({
            "txn_id": txn_id,
            "type": "debit",
            "category": "salary",
            "amount": total_salary / 12,
            "description": f"Salary disbursement - {month_date.strftime('%B %Y')}",
            "reference": f"SAL-{month_date.strftime('%Y%m')}",
            "txn_date": month_date.replace(day=28).isoformat(),
            "org_id": org_id,
            "created_at": now.isoformat()
        })
        results["transactions"] += 1
    
    # ============= SEED WORKSPACE TASKS =============
    workspace_tasks = [
        {"title": "Review TCS Contract Renewal", "type": "review", "priority": "high", "assigned": "EMP004", "context": "deal"},
        {"title": "Prepare Infosys Q4 Proposal", "type": "action", "priority": "urgent", "assigned": "EMP005", "context": "deal"},
        {"title": "Upload AWS Invoice for Approval", "type": "upload", "priority": "medium", "assigned": "EMP010", "context": "procurement"},
        {"title": "Confirm Wipro Delivery Schedule", "type": "confirm", "priority": "high", "assigned": "EMP017", "context": "project"},
        {"title": "Respond to HDFC Support Query", "type": "respond", "priority": "urgent", "assigned": "EMP012", "context": "support"},
        {"title": "Review Monthly Financial Report", "type": "review", "priority": "high", "assigned": "EMP008", "context": "finance"},
        {"title": "Complete Employee Onboarding Docs", "type": "upload", "priority": "medium", "assigned": "EMP019", "context": "hr"},
        {"title": "Approve Dell Hardware PO", "type": "confirm", "priority": "high", "assigned": "EMP002", "context": "procurement"},
    ]
    
    for i, task in enumerate(workspace_tasks):
        task_id = f"TASK-SEED-{str(i+1).zfill(4)}"
        existing = await db.workspace_tasks.find_one({"task_id": task_id})
        if not existing:
            await db.workspace_tasks.insert_one({
                "task_id": task_id,
                "context_id": f"CTX-{task['context'].upper()}-001",
                "task_type": task["type"],
                "title": task["title"],
                "description": f"Task: {task['title']}",
                "assigned_to_user": task["assigned"],
                "assigned_to_role": None,
                "due_at": (now + timedelta(days=random.randint(1, 14))).isoformat(),
                "priority": task["priority"],
                "status": "open",
                "visibility_scope": "internal_only",
                "source": "manual",
                "created_by": "EMP001",
                "created_at": now.isoformat(),
                "updated_at": now.isoformat(),
                "completed_at": None,
                "completed_by": None,
                "notes": None
            })
            results["tasks"] += 1
    
    # ============= SEED WORKSPACE APPROVALS =============
    workspace_approvals = [
        {"title": "Approve AWS Infrastructure Upgrade", "type": "expense_approval", "approver": "EMP002", "value": 2500000},
        {"title": "Approve Reliance Contract Extension", "type": "deal_approval", "approver": "EMP001", "value": 15000000},
        {"title": "Approve New Hire - Senior Developer", "type": "general", "approver": "EMP001", "value": 1800000},
        {"title": "Approve Marketing Budget Q1", "type": "expense_approval", "approver": "EMP002", "value": 1000000},
        {"title": "Approve Cisco Network Upgrade", "type": "expense_approval", "approver": "EMP003", "value": 3500000},
    ]
    
    for i, approval in enumerate(workspace_approvals):
        approval_id = f"APPR-SEED-{str(i+1).zfill(4)}"
        existing = await db.workspace_approvals.find_one({"approval_id": approval_id})
        if not existing:
            await db.workspace_approvals.insert_one({
                "approval_id": approval_id,
                "context_id": f"CTX-APPROVAL-{str(i+1).zfill(3)}",
                "linked_task_id": None,
                "approval_type": approval["type"],
                "title": approval["title"],
                "description": f"Approval required for: {approval['title']} (Value: ₹{approval['value']:,})",
                "approver_role": None,
                "approver_user": approval["approver"],
                "decision": "pending",
                "decision_reason": None,
                "decided_at": None,
                "decided_by": None,
                "context_snapshot": {"value": approval["value"], "currency": "INR"},
                "requested_by": "EMP004",
                "created_at": now.isoformat(),
                "due_at": (now + timedelta(days=3)).isoformat(),
                "priority": "high"
            })
            results["approvals"] += 1
    
    # ============= SEED WORKSPACE CHANNELS =============
    channels = [
        {"name": "General", "type": "general", "description": "Company-wide announcements and updates"},
        {"name": "Sales Team", "type": "deal", "description": "Sales pipeline and deal discussions"},
        {"name": "Tech Team", "type": "project", "description": "Technical discussions and updates"},
        {"name": "Finance Team", "type": "general", "description": "Finance and accounting discussions"},
        {"name": "Leadership", "type": "leadership", "description": "Leadership team discussions"},
    ]
    
    for ch in channels:
        existing = await db.workspace_channels.find_one({"name": ch["name"]})
        if not existing:
            channel_id = f"CH-{str(uuid.uuid4())[:8].upper()}"
            # Add relevant employees based on channel type
            if ch["name"] == "Sales Team":
                members = ["EMP004", "EMP005", "EMP006", "EMP007"]
            elif ch["name"] == "Tech Team":
                members = ["EMP003", "EMP011", "EMP012", "EMP013", "EMP014", "EMP015"]
            elif ch["name"] == "Finance Team":
                members = ["EMP002", "EMP008", "EMP009", "EMP010"]
            elif ch["name"] == "Leadership":
                members = ["EMP001", "EMP002", "EMP003", "EMP004"]
            else:
                members = [emp["id"] for emp in EMPLOYEES]
            
            await db.workspace_channels.insert_one({
                "channel_id": channel_id,
                "channel_type": ch["type"],
                "name": ch["name"],
                "description": ch["description"],
                "context_id": None,
                "member_roles": [],
                "member_users": members,
                "visibility_scope": "internal_only",
                "created_by": "EMP001",
                "created_at": now.isoformat(),
                "is_active": True
            })
    
    return {
        "success": True,
        "message": "Comprehensive seed data created successfully",
        "company_profile": {
            "name": "Innovate Books Pvt Ltd",
            "employees": 20,
            "annual_turnover": "₹100 Crores",
            "industry": "Technology Services & Products"
        },
        "data_seeded": results,
        "financial_summary": {
            "annual_revenue": "₹100,000,000",
            "annual_procurement": "₹30,000,000",
            "annual_salary_expense": "₹42,000,000",
            "top_customers": len(CUSTOMERS),
            "active_vendors": len(VENDORS),
            "products_services": len(CATALOG_ITEMS)
        }
    }


@router.get("/clear")
async def clear_seed_data():
    """Clear all seeded data (use with caution)"""
    db = get_db()
    
    collections = [
        "employees", "customers", "vendors", "catalog_items",
        "leads", "deals", "invoices", "purchase_orders", "transactions",
        "workspace_tasks", "workspace_approvals", "workspace_channels",
        "workspace_chats", "workspace_chat_messages", "workspace_channel_messages",
        "workspace_notifications", "workspace_contexts"
    ]
    
    results = {}
    for collection in collections:
        result = await db[collection].delete_many({})
        results[collection] = result.deleted_count
    
    return {
        "success": True,
        "message": "All seed data cleared",
        "deleted_counts": results
    }
