"""
Comprehensive ₹100 Crore Financial Year Seed Data
April 2025 to March 2026
Covers all modules: Commerce, Finance, Workforce, Operations, Capital, Intelligence
"""

import asyncio
import random
import uuid
from datetime import datetime, timedelta, timezone
from motor.motor_asyncio import AsyncIOMotorClient
import os

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'innovate_books_db')

# Constants
ORG_ID = "org_default_innovate"
FINANCIAL_YEAR_START = datetime(2025, 4, 1, tzinfo=timezone.utc)
FINANCIAL_YEAR_END = datetime(2026, 3, 31, tzinfo=timezone.utc)
TARGET_REVENUE = 100_00_00_000  # ₹100 crores = 100,00,00,000

# Company Names for realistic data
CUSTOMER_COMPANIES = [
    "Tata Steel Limited", "Reliance Industries", "Infosys Technologies", "Wipro Limited",
    "HCL Technologies", "Tech Mahindra", "Larsen & Toubro", "Bharti Airtel",
    "HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank",
    "Mahindra & Mahindra", "Bajaj Auto", "Hero MotoCorp", "Maruti Suzuki",
    "Asian Paints", "Titan Company", "Hindustan Unilever", "ITC Limited",
    "Sun Pharmaceutical", "Dr. Reddy's Labs", "Cipla Limited", "Lupin Limited",
    "Adani Enterprises", "JSW Steel", "Vedanta Limited", "Coal India",
    "Power Grid Corporation", "NTPC Limited", "ONGC", "Indian Oil Corporation",
    "BPCL", "GAIL India", "UltraTech Cement", "Grasim Industries",
    "Nestle India", "Britannia Industries", "Dabur India", "Godrej Consumer",
    "Kotak Mahindra Bank", "IndusInd Bank", "Yes Bank", "Federal Bank",
    "Bandhan Bank", "AU Small Finance", "RBL Bank", "IDFC First Bank",
    "Tata Consultancy Services", "Mphasis Limited", "Mindtree Limited", "L&T Infotech"
]

VENDOR_COMPANIES = [
    "Amazon Web Services India", "Microsoft India", "Google Cloud India",
    "Salesforce India", "Oracle India", "SAP India", "Adobe Systems India",
    "Cisco Systems India", "IBM India", "Dell Technologies",
    "HP India", "Lenovo India", "Apple India", "Samsung India",
    "Siemens India", "ABB India", "Schneider Electric", "Honeywell India",
    "Bosch India", "Continental India", "ZF India", "Denso India",
    "Caterpillar India", "John Deere India", "CNH Industrial", "AGCO India",
    "DHL Express India", "FedEx India", "Blue Dart", "Gati Limited",
    "Delhivery", "Ecom Express", "XpressBees", "Shadowfax",
    "Swiggy", "Zomato", "BigBasket", "Blinkit", "Zepto", "Dunzo"
]

PRODUCTS = [
    {"name": "Enterprise Software License", "base_price": 500000, "category": "Software"},
    {"name": "Cloud Infrastructure (Annual)", "base_price": 2500000, "category": "Cloud"},
    {"name": "Data Analytics Platform", "base_price": 1500000, "category": "Analytics"},
    {"name": "CRM Solution", "base_price": 800000, "category": "Software"},
    {"name": "ERP Implementation", "base_price": 5000000, "category": "Implementation"},
    {"name": "Cybersecurity Suite", "base_price": 1200000, "category": "Security"},
    {"name": "AI/ML Platform License", "base_price": 3500000, "category": "AI"},
    {"name": "IoT Platform Subscription", "base_price": 1800000, "category": "IoT"},
    {"name": "Managed IT Services (Annual)", "base_price": 4500000, "category": "Services"},
    {"name": "Professional Services", "base_price": 2000000, "category": "Services"},
    {"name": "Training & Certification", "base_price": 500000, "category": "Training"},
    {"name": "Support & Maintenance", "base_price": 600000, "category": "Support"},
    {"name": "Hardware - Servers", "base_price": 1500000, "category": "Hardware"},
    {"name": "Hardware - Networking", "base_price": 800000, "category": "Hardware"},
    {"name": "Hardware - Storage", "base_price": 2000000, "category": "Hardware"}
]

SERVICES = [
    {"name": "Consulting Services", "rate": 15000, "unit": "day"},
    {"name": "Development Services", "rate": 12000, "unit": "day"},
    {"name": "Support Services", "rate": 8000, "unit": "day"},
    {"name": "Training Services", "rate": 25000, "unit": "session"},
    {"name": "Implementation Services", "rate": 20000, "unit": "day"}
]

EMPLOYEES = [
    {"name": "Rajesh Kumar", "role": "Sales Manager", "dept": "Sales"},
    {"name": "Priya Sharma", "role": "Account Executive", "dept": "Sales"},
    {"name": "Amit Patel", "role": "Senior Consultant", "dept": "Consulting"},
    {"name": "Sunita Reddy", "role": "Project Manager", "dept": "Delivery"},
    {"name": "Vikram Singh", "role": "Technical Lead", "dept": "Engineering"},
    {"name": "Ananya Iyer", "role": "Finance Manager", "dept": "Finance"},
    {"name": "Rahul Gupta", "role": "HR Manager", "dept": "HR"},
    {"name": "Meera Nair", "role": "Marketing Head", "dept": "Marketing"},
    {"name": "Deepak Joshi", "role": "Operations Head", "dept": "Operations"},
    {"name": "Kavita Menon", "role": "Support Manager", "dept": "Support"}
]


def generate_id(prefix):
    return f"{prefix}-{uuid.uuid4().hex[:8].upper()}"


def random_date_in_month(year, month):
    """Generate random date in a given month"""
    start = datetime(year, month, 1, tzinfo=timezone.utc)
    if month == 12:
        end = datetime(year + 1, 1, 1, tzinfo=timezone.utc)
    else:
        end = datetime(year, month + 1, 1, tzinfo=timezone.utc)
    delta = end - start
    random_days = random.randint(0, delta.days - 1)
    return start + timedelta(days=random_days)


async def seed_parties(db):
    """Seed customers and vendors"""
    print("📦 Seeding Parties (Customers & Vendors)...")
    
    customers = []
    for i, company in enumerate(CUSTOMER_COMPANIES):
        customer = {
            "customer_id": generate_id("CUST"),
            "org_id": ORG_ID,
            "name": company,
            "company_name": company,
            "email": f"accounts@{company.lower().replace(' ', '').replace('&', '')[:15]}.com",
            "phone": f"+91 {random.randint(70, 99)}{random.randint(10000000, 99999999)}",
            "address": f"{random.randint(1, 999)}, {random.choice(['MG Road', 'Brigade Road', 'Whitefield', 'Electronic City', 'Bandra', 'Andheri', 'Gurgaon', 'Noida'])}, {random.choice(['Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Pune'])}",
            "gstin": f"{random.randint(10, 35)}AABCT{random.randint(1000, 9999)}A1Z{random.randint(1, 9)}",
            "pan": f"AABCT{random.randint(1000, 9999)}A",
            "credit_limit": random.choice([5000000, 10000000, 20000000, 50000000, 100000000]),
            "payment_terms": random.choice([15, 30, 45, 60]),
            "status": "active",
            "tier": random.choice(["platinum", "gold", "silver"]),
            "industry": random.choice(["IT", "Manufacturing", "Banking", "Retail", "Healthcare", "Energy"]),
            "created_at": FINANCIAL_YEAR_START.isoformat()
        }
        customers.append(customer)
    
    vendors = []
    for company in VENDOR_COMPANIES:
        vendor = {
            "vendor_id": generate_id("VEND"),
            "org_id": ORG_ID,
            "name": company,
            "company_name": company,
            "email": f"sales@{company.lower().replace(' ', '').replace('&', '')[:15]}.com",
            "phone": f"+91 {random.randint(70, 99)}{random.randint(10000000, 99999999)}",
            "address": f"{random.randint(1, 999)}, Business Park, {random.choice(['Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad'])}",
            "gstin": f"{random.randint(10, 35)}AABCV{random.randint(1000, 9999)}A1Z{random.randint(1, 9)}",
            "pan": f"AABCV{random.randint(1000, 9999)}A",
            "payment_terms": random.choice([30, 45, 60]),
            "status": "active",
            "category": random.choice(["Technology", "Services", "Hardware", "Logistics"]),
            "created_at": FINANCIAL_YEAR_START.isoformat()
        }
        vendors.append(vendor)
    
    await db.parties_customers.delete_many({"org_id": ORG_ID})
    await db.parties_vendors.delete_many({"org_id": ORG_ID})
    
    if customers:
        await db.parties_customers.insert_many(customers)
    if vendors:
        await db.parties_vendors.insert_many(vendors)
    
    print(f"  ✅ Created {len(customers)} customers and {len(vendors)} vendors")
    return customers, vendors


async def seed_catalog(db):
    """Seed catalog items"""
    print("📦 Seeding Catalog Items...")
    
    items = []
    for product in PRODUCTS:
        item = {
            "item_id": generate_id("ITEM"),
            "org_id": ORG_ID,
            "name": product["name"],
            "description": f"Premium {product['name']} for enterprise customers",
            "category": product["category"],
            "sku": f"SKU-{product['category'][:3].upper()}-{random.randint(1000, 9999)}",
            "base_price": product["base_price"],
            "currency": "INR",
            "unit": "unit",
            "tax_rate": 18,  # GST
            "hsn_code": f"{random.randint(8400, 8599)}",
            "status": "active",
            "created_at": FINANCIAL_YEAR_START.isoformat()
        }
        items.append(item)
    
    await db.catalog_items.delete_many({"org_id": ORG_ID})
    if items:
        await db.catalog_items.insert_many(items)
    
    print(f"  ✅ Created {len(items)} catalog items")
    return items


async def seed_revenue_workflow(db, customers, items):
    """Seed complete revenue workflow: Leads → Evaluations → Commits → Contracts → Handoffs"""
    print("📦 Seeding Revenue Workflow (₹100 Cr target)...")
    
    leads = []
    evaluations = []
    commits = []
    contracts = []
    handoffs = []
    invoices = []
    receivables = []
    
    # Monthly revenue distribution (in lakhs) to achieve ₹100 Cr
    monthly_targets = {
        4: 600, 5: 700, 6: 750, 7: 800, 8: 850, 9: 900,
        10: 950, 11: 1000, 12: 1100, 1: 1000, 2: 900, 3: 1450
    }  # Total = 10000 lakhs = ₹100 Cr
    
    total_revenue = 0
    deal_count = 0
    
    for month_offset in range(12):
        year = 2025 if month_offset < 9 else 2026
        month = ((3 + month_offset) % 12) + 1
        if month_offset >= 9:
            month = month_offset - 8
        
        actual_month = 4 + month_offset if month_offset < 9 else month_offset - 8
        target_revenue = monthly_targets.get(actual_month, 800) * 100000  # Convert lakhs to rupees
        
        month_revenue = 0
        while month_revenue < target_revenue:
            customer = random.choice(customers)
            product = random.choice(items)
            
            # Variable deal sizes
            quantity = random.randint(1, 10)
            unit_price = product["base_price"] * random.uniform(0.9, 1.3)
            deal_value = int(unit_price * quantity)
            
            # Ensure we don't overshoot too much
            if month_revenue + deal_value > target_revenue * 1.2:
                deal_value = int(target_revenue - month_revenue)
                if deal_value < 100000:
                    break
            
            deal_date = random_date_in_month(year, actual_month if month_offset < 9 else (month_offset - 8 + 1))
            
            # Create Lead
            lead_id = generate_id("LEAD")
            lead = {
                "lead_id": lead_id,
                "org_id": ORG_ID,
                "customer_id": customer["customer_id"],
                "customer_name": customer["name"],
                "title": f"{product['name']} - {customer['name']}",
                "description": f"Opportunity for {product['name']} implementation",
                "source": random.choice(["Website", "Referral", "Trade Show", "Cold Call", "Partner"]),
                "status": "converted",
                "stage": "closed_won",
                "deal_value": deal_value,
                "currency": "INR",
                "probability": 100,
                "expected_close_date": deal_date.isoformat(),
                "actual_close_date": deal_date.isoformat(),
                "owner": random.choice(EMPLOYEES)["name"],
                "created_at": (deal_date - timedelta(days=random.randint(30, 90))).isoformat(),
                "updated_at": deal_date.isoformat()
            }
            leads.append(lead)
            
            # Create Evaluation
            eval_id = generate_id("EVAL")
            evaluation = {
                "evaluation_id": eval_id,
                "org_id": ORG_ID,
                "lead_id": lead_id,
                "customer_id": customer["customer_id"],
                "customer_name": customer["name"],
                "title": f"Evaluation: {lead['title']}",
                "status": "approved",
                "deal_value": deal_value,
                "technical_score": random.randint(70, 100),
                "commercial_score": random.randint(70, 100),
                "risk_score": random.choice(["low", "medium"]),
                "recommendation": "proceed",
                "evaluated_by": random.choice(EMPLOYEES)["name"],
                "evaluated_at": (deal_date - timedelta(days=random.randint(15, 45))).isoformat(),
                "created_at": (deal_date - timedelta(days=random.randint(45, 60))).isoformat()
            }
            evaluations.append(evaluation)
            
            # Create Commit
            commit_id = generate_id("COMM")
            commit = {
                "commit_id": commit_id,
                "org_id": ORG_ID,
                "lead_id": lead_id,
                "evaluation_id": eval_id,
                "customer_id": customer["customer_id"],
                "customer_name": customer["name"],
                "title": f"Commitment: {lead['title']}",
                "status": "approved",
                "committed_value": deal_value,
                "payment_terms": customer["payment_terms"],
                "delivery_terms": "30 days from PO",
                "approved_by": "Deepak Joshi",
                "approved_at": (deal_date - timedelta(days=random.randint(10, 20))).isoformat(),
                "created_at": (deal_date - timedelta(days=random.randint(20, 30))).isoformat()
            }
            commits.append(commit)
            
            # Create Contract
            contract_id = generate_id("CONT")
            contract = {
                "contract_id": contract_id,
                "org_id": ORG_ID,
                "lead_id": lead_id,
                "commit_id": commit_id,
                "customer_id": customer["customer_id"],
                "customer_name": customer["name"],
                "title": f"Contract: {lead['title']}",
                "status": "executed",
                "contract_value": deal_value,
                "start_date": deal_date.isoformat(),
                "end_date": (deal_date + timedelta(days=365)).isoformat(),
                "signed_by_customer": True,
                "signed_by_company": True,
                "signed_date": (deal_date - timedelta(days=5)).isoformat(),
                "created_at": (deal_date - timedelta(days=10)).isoformat()
            }
            contracts.append(contract)
            
            # Create Handoff
            handoff_id = generate_id("HAND")
            handoff = {
                "handoff_id": handoff_id,
                "org_id": ORG_ID,
                "contract_id": contract_id,
                "customer_id": customer["customer_id"],
                "customer_name": customer["name"],
                "title": f"Handoff: {lead['title']}",
                "status": "completed",
                "handoff_value": deal_value,
                "delivery_team": "Operations",
                "project_manager": random.choice(EMPLOYEES)["name"],
                "kickoff_date": deal_date.isoformat(),
                "created_at": deal_date.isoformat()
            }
            handoffs.append(handoff)
            
            # Create Invoice
            invoice_id = generate_id("INV")
            tax_amount = int(deal_value * 0.18)
            total_amount = deal_value + tax_amount
            
            invoice = {
                "invoice_id": invoice_id,
                "org_id": ORG_ID,
                "customer_id": customer["customer_id"],
                "customer_name": customer["name"],
                "contract_id": contract_id,
                "invoice_number": f"INV-{year}-{str(deal_count + 1).zfill(5)}",
                "invoice_date": deal_date.isoformat(),
                "due_date": (deal_date + timedelta(days=customer["payment_terms"])).isoformat(),
                "subtotal": deal_value,
                "tax_amount": tax_amount,
                "total_amount": total_amount,
                "status": random.choice(["paid", "paid", "paid", "partial", "pending"]),
                "items": [{"description": product["name"], "quantity": quantity, "unit_price": unit_price, "amount": deal_value}],
                "created_at": deal_date.isoformat()
            }
            invoices.append(invoice)
            
            # Create Receivable
            paid_amount = total_amount if invoice["status"] == "paid" else (int(total_amount * 0.5) if invoice["status"] == "partial" else 0)
            receivable = {
                "receivable_id": generate_id("RCV"),
                "org_id": ORG_ID,
                "customer_id": customer["customer_id"],
                "customer_name": customer["name"],
                "invoice_id": invoice_id,
                "invoice_number": invoice["invoice_number"],
                "amount": total_amount,
                "paid_amount": paid_amount,
                "balance": total_amount - paid_amount,
                "due_date": invoice["due_date"],
                "status": "closed" if paid_amount == total_amount else ("partial" if paid_amount > 0 else "open"),
                "created_at": deal_date.isoformat()
            }
            receivables.append(receivable)
            
            month_revenue += deal_value
            total_revenue += deal_value
            deal_count += 1
    
    # Clear and insert
    await db.revenue_workflow_leads.delete_many({"org_id": ORG_ID})
    await db.revenue_workflow_evaluations.delete_many({"org_id": ORG_ID})
    await db.revenue_workflow_commits.delete_many({"org_id": ORG_ID})
    await db.revenue_workflow_contracts.delete_many({"org_id": ORG_ID})
    await db.revenue_workflow_handoffs.delete_many({"org_id": ORG_ID})
    await db.fin_invoices.delete_many({"org_id": ORG_ID})
    await db.fin_receivables.delete_many({"org_id": ORG_ID})
    
    if leads: await db.revenue_workflow_leads.insert_many(leads)
    if evaluations: await db.revenue_workflow_evaluations.insert_many(evaluations)
    if commits: await db.revenue_workflow_commits.insert_many(commits)
    if contracts: await db.revenue_workflow_contracts.insert_many(contracts)
    if handoffs: await db.revenue_workflow_handoffs.insert_many(handoffs)
    if invoices: await db.fin_invoices.insert_many(invoices)
    if receivables: await db.fin_receivables.insert_many(receivables)
    
    print(f"  ✅ Created {len(leads)} leads, {len(evaluations)} evaluations, {len(commits)} commits")
    print(f"  ✅ Created {len(contracts)} contracts, {len(handoffs)} handoffs")
    print(f"  ✅ Created {len(invoices)} invoices, {len(receivables)} receivables")
    print(f"  ✅ Total Revenue: ₹{total_revenue:,.0f} ({total_revenue/10000000:.2f} Cr)")
    
    return leads, invoices, receivables


async def seed_procurement_workflow(db, vendors, items):
    """Seed procurement workflow with ₹40 Cr spend"""
    print("📦 Seeding Procurement Workflow (₹40 Cr target)...")
    
    purchase_requests = []
    purchase_orders = []
    bills = []
    payables = []
    
    target_spend = 40_00_00_000  # ₹40 Cr
    total_spend = 0
    po_count = 0
    
    for month_offset in range(12):
        year = 2025 if month_offset < 9 else 2026
        actual_month = 4 + month_offset if month_offset < 9 else month_offset - 8
        monthly_target = target_spend / 12
        
        month_spend = 0
        while month_spend < monthly_target:
            vendor = random.choice(vendors)
            
            po_value = random.randint(500000, 5000000)
            if month_spend + po_value > monthly_target * 1.2:
                po_value = int(monthly_target - month_spend)
                if po_value < 100000:
                    break
            
            po_date = random_date_in_month(year, actual_month if month_offset < 9 else (month_offset - 8 + 1))
            
            # Purchase Request
            pr_id = generate_id("PR")
            pr = {
                "request_id": pr_id,
                "org_id": ORG_ID,
                "vendor_id": vendor["vendor_id"],
                "vendor_name": vendor["name"],
                "title": f"Purchase from {vendor['name']}",
                "description": f"Procurement of goods/services from {vendor['name']}",
                "requested_by": random.choice(EMPLOYEES)["name"],
                "department": random.choice(["IT", "Operations", "Engineering", "Marketing"]),
                "estimated_value": po_value,
                "status": "approved",
                "priority": random.choice(["high", "medium", "low"]),
                "created_at": (po_date - timedelta(days=random.randint(10, 30))).isoformat(),
                "approved_at": (po_date - timedelta(days=5)).isoformat()
            }
            purchase_requests.append(pr)
            
            # Purchase Order
            po_id = generate_id("PO")
            tax_amount = int(po_value * 0.18)
            total_amount = po_value + tax_amount
            
            po = {
                "po_id": po_id,
                "org_id": ORG_ID,
                "vendor_id": vendor["vendor_id"],
                "vendor_name": vendor["name"],
                "request_id": pr_id,
                "po_number": f"PO-{year}-{str(po_count + 1).zfill(5)}",
                "po_date": po_date.isoformat(),
                "delivery_date": (po_date + timedelta(days=30)).isoformat(),
                "subtotal": po_value,
                "tax_amount": tax_amount,
                "total_amount": total_amount,
                "status": random.choice(["received", "received", "received", "partial", "ordered"]),
                "payment_terms": vendor["payment_terms"],
                "created_at": po_date.isoformat()
            }
            purchase_orders.append(po)
            
            # Bill (if received)
            if po["status"] in ["received", "partial"]:
                bill_id = generate_id("BILL")
                bill = {
                    "bill_id": bill_id,
                    "org_id": ORG_ID,
                    "vendor_id": vendor["vendor_id"],
                    "vendor_name": vendor["name"],
                    "po_id": po_id,
                    "bill_number": f"VB-{year}-{str(po_count + 1).zfill(5)}",
                    "bill_date": (po_date + timedelta(days=random.randint(30, 45))).isoformat(),
                    "due_date": (po_date + timedelta(days=30 + vendor["payment_terms"])).isoformat(),
                    "subtotal": po_value,
                    "tax_amount": tax_amount,
                    "total_amount": total_amount,
                    "status": random.choice(["paid", "paid", "paid", "approved", "pending"]),
                    "created_at": (po_date + timedelta(days=35)).isoformat()
                }
                bills.append(bill)
                
                # Payable
                paid_amount = total_amount if bill["status"] == "paid" else 0
                payable = {
                    "payable_id": generate_id("PAY"),
                    "org_id": ORG_ID,
                    "vendor_id": vendor["vendor_id"],
                    "vendor_name": vendor["name"],
                    "bill_id": bill_id,
                    "bill_number": bill["bill_number"],
                    "amount": total_amount,
                    "paid_amount": paid_amount,
                    "balance": total_amount - paid_amount,
                    "due_date": bill["due_date"],
                    "status": "closed" if paid_amount == total_amount else "open",
                    "created_at": bill["bill_date"]
                }
                payables.append(payable)
            
            month_spend += po_value
            total_spend += po_value
            po_count += 1
    
    # Clear and insert
    await db.procure_workflow_requests.delete_many({"org_id": ORG_ID})
    await db.purchase_orders.delete_many({"org_id": ORG_ID})
    await db.fin_bills.delete_many({"org_id": ORG_ID})
    await db.fin_payables.delete_many({"org_id": ORG_ID})
    
    if purchase_requests: await db.procure_workflow_requests.insert_many(purchase_requests)
    if purchase_orders: await db.purchase_orders.insert_many(purchase_orders)
    if bills: await db.fin_bills.insert_many(bills)
    if payables: await db.fin_payables.insert_many(payables)
    
    print(f"  ✅ Created {len(purchase_requests)} purchase requests, {len(purchase_orders)} POs")
    print(f"  ✅ Created {len(bills)} bills, {len(payables)} payables")
    print(f"  ✅ Total Spend: ₹{total_spend:,.0f} ({total_spend/10000000:.2f} Cr)")
    
    return purchase_orders, bills, payables


async def seed_bank_statements(db, receivables, payables):
    """Seed bank statements for reconciliation"""
    print("📦 Seeding Bank Statements...")
    
    # Create bank account
    account = {
        "account_id": generate_id("BANK"),
        "org_id": ORG_ID,
        "account_name": "Main Operating Account",
        "bank_name": "HDFC Bank",
        "account_number": "50200012345678",
        "ifsc_code": "HDFC0001234",
        "account_type": "current",
        "opening_balance": 50000000,
        "current_balance": 0,
        "status": "active",
        "created_at": FINANCIAL_YEAR_START.isoformat()
    }
    
    statements = []
    running_balance = account["opening_balance"]
    
    # Add credits from receivables
    for rcv in receivables:
        if rcv["paid_amount"] > 0:
            running_balance += rcv["paid_amount"]
            stmt = {
                "entry_id": generate_id("TXN"),
                "org_id": ORG_ID,
                "account_id": account["account_id"],
                "transaction_date": rcv["created_at"],
                "value_date": rcv["created_at"],
                "description": f"NEFT CR-{rcv['customer_name'][:20]}-{rcv['invoice_number']}",
                "debit_amount": 0,
                "credit_amount": rcv["paid_amount"],
                "balance": running_balance,
                "reference": rcv["invoice_number"],
                "type": "credit",
                "status": "matched" if random.random() > 0.3 else "unmatched",
                "matched": random.random() > 0.3,
                "created_at": rcv["created_at"]
            }
            statements.append(stmt)
    
    # Add debits from payables
    for pay in payables:
        if pay["paid_amount"] > 0:
            running_balance -= pay["paid_amount"]
            stmt = {
                "entry_id": generate_id("TXN"),
                "org_id": ORG_ID,
                "account_id": account["account_id"],
                "transaction_date": pay["created_at"],
                "value_date": pay["created_at"],
                "description": f"NEFT DR-{pay['vendor_name'][:20]}-{pay['bill_number']}",
                "debit_amount": pay["paid_amount"],
                "credit_amount": 0,
                "balance": running_balance,
                "reference": pay["bill_number"],
                "type": "debit",
                "status": "matched" if random.random() > 0.3 else "unmatched",
                "matched": random.random() > 0.3,
                "created_at": pay["created_at"]
            }
            statements.append(stmt)
    
    account["current_balance"] = running_balance
    
    await db.fin_bank_accounts.delete_many({"org_id": ORG_ID})
    await db.fin_bank_statements.delete_many({"org_id": ORG_ID})
    
    await db.fin_bank_accounts.insert_one(account)
    if statements:
        await db.fin_bank_statements.insert_many(statements)
    
    print(f"  ✅ Created 1 bank account with {len(statements)} transactions")
    print(f"  ✅ Closing Balance: ₹{running_balance:,.0f}")


async def seed_workforce(db):
    """Seed workforce data: employees, attendance, payroll"""
    print("📦 Seeding Workforce Data...")
    
    employees = []
    attendance_records = []
    payroll_records = []
    leave_requests = []
    
    employee_data = [
        {"name": "Rajesh Kumar", "role": "Sales Manager", "dept": "Sales", "salary": 150000},
        {"name": "Priya Sharma", "role": "Account Executive", "dept": "Sales", "salary": 80000},
        {"name": "Amit Patel", "role": "Senior Consultant", "dept": "Consulting", "salary": 120000},
        {"name": "Sunita Reddy", "role": "Project Manager", "dept": "Delivery", "salary": 140000},
        {"name": "Vikram Singh", "role": "Technical Lead", "dept": "Engineering", "salary": 160000},
        {"name": "Ananya Iyer", "role": "Finance Manager", "dept": "Finance", "salary": 130000},
        {"name": "Rahul Gupta", "role": "HR Manager", "dept": "HR", "salary": 110000},
        {"name": "Meera Nair", "role": "Marketing Head", "dept": "Marketing", "salary": 140000},
        {"name": "Deepak Joshi", "role": "Operations Head", "dept": "Operations", "salary": 150000},
        {"name": "Kavita Menon", "role": "Support Manager", "dept": "Support", "salary": 100000},
        {"name": "Arjun Reddy", "role": "Software Engineer", "dept": "Engineering", "salary": 90000},
        {"name": "Sneha Patil", "role": "QA Engineer", "dept": "Engineering", "salary": 75000},
        {"name": "Mohit Sharma", "role": "DevOps Engineer", "dept": "Engineering", "salary": 95000},
        {"name": "Ritu Verma", "role": "Business Analyst", "dept": "Consulting", "salary": 85000},
        {"name": "Karan Malhotra", "role": "Sales Executive", "dept": "Sales", "salary": 60000}
    ]
    
    for emp in employee_data:
        emp_id = generate_id("EMP")
        employee = {
            "employee_id": emp_id,
            "org_id": ORG_ID,
            "name": emp["name"],
            "email": f"{emp['name'].lower().replace(' ', '.')}@innovatebooks.com",
            "role": emp["role"],
            "department": emp["dept"],
            "salary": emp["salary"],
            "joining_date": "2024-01-01",
            "status": "active",
            "manager": "Deepak Joshi" if emp["name"] != "Deepak Joshi" else None,
            "created_at": FINANCIAL_YEAR_START.isoformat()
        }
        employees.append(employee)
        
        # Generate monthly payroll
        for month_offset in range(12):
            year = 2025 if month_offset < 9 else 2026
            month = 4 + month_offset if month_offset < 9 else month_offset - 8
            
            basic = int(emp["salary"] * 0.5)
            hra = int(emp["salary"] * 0.2)
            special = int(emp["salary"] * 0.3)
            pf = int(basic * 0.12)
            tax = int(emp["salary"] * 0.1)
            net = emp["salary"] - pf - tax
            
            payroll = {
                "payroll_id": generate_id("PAY"),
                "org_id": ORG_ID,
                "employee_id": emp_id,
                "employee_name": emp["name"],
                "month": f"{year}-{str(month).zfill(2)}",
                "basic": basic,
                "hra": hra,
                "special_allowance": special,
                "gross": emp["salary"],
                "pf_deduction": pf,
                "tax_deduction": tax,
                "net_salary": net,
                "status": "paid",
                "paid_date": f"{year}-{str(month).zfill(2)}-28",
                "created_at": f"{year}-{str(month).zfill(2)}-25T00:00:00Z"
            }
            payroll_records.append(payroll)
        
        # Generate some leave requests
        for _ in range(random.randint(2, 5)):
            leave_date = random_date_in_month(random.choice([2025, 2026]), random.randint(1, 12))
            leave = {
                "leave_id": generate_id("LV"),
                "org_id": ORG_ID,
                "employee_id": emp_id,
                "employee_name": emp["name"],
                "leave_type": random.choice(["casual", "sick", "earned", "wfh"]),
                "start_date": leave_date.isoformat(),
                "end_date": (leave_date + timedelta(days=random.randint(1, 3))).isoformat(),
                "days": random.randint(1, 3),
                "reason": random.choice(["Personal work", "Medical", "Family function", "Travel"]),
                "status": random.choice(["approved", "approved", "pending", "rejected"]),
                "created_at": (leave_date - timedelta(days=7)).isoformat()
            }
            leave_requests.append(leave)
    
    await db.workforce_employees.delete_many({"org_id": ORG_ID})
    await db.workforce_payroll.delete_many({"org_id": ORG_ID})
    await db.workforce_leaves.delete_many({"org_id": ORG_ID})
    
    if employees: await db.workforce_employees.insert_many(employees)
    if payroll_records: await db.workforce_payroll.insert_many(payroll_records)
    if leave_requests: await db.workforce_leaves.insert_many(leave_requests)
    
    total_payroll = sum(p["net_salary"] for p in payroll_records)
    print(f"  ✅ Created {len(employees)} employees, {len(payroll_records)} payroll records")
    print(f"  ✅ Created {len(leave_requests)} leave requests")
    print(f"  ✅ Total Payroll: ₹{total_payroll:,.0f} ({total_payroll/10000000:.2f} Cr)")


async def seed_operations(db, leads):
    """Seed operations data: projects, tasks, work orders"""
    print("📦 Seeding Operations Data...")
    
    projects = []
    tasks = []
    work_orders = []
    
    for lead in leads[:50]:  # Create projects for top 50 leads
        proj_id = generate_id("PROJ")
        project = {
            "project_id": proj_id,
            "org_id": ORG_ID,
            "name": f"Project: {lead['title']}",
            "customer_name": lead["customer_name"],
            "lead_id": lead["lead_id"],
            "value": lead["deal_value"],
            "status": random.choice(["in_progress", "completed", "completed", "on_hold"]),
            "progress": random.randint(20, 100),
            "start_date": lead["actual_close_date"],
            "planned_end_date": (datetime.fromisoformat(lead["actual_close_date"].replace("Z", "+00:00")) + timedelta(days=90)).isoformat(),
            "project_manager": lead["owner"],
            "team_size": random.randint(3, 10),
            "created_at": lead["actual_close_date"]
        }
        projects.append(project)
        
        # Create tasks for each project
        task_types = ["Planning", "Design", "Development", "Testing", "Deployment", "Training"]
        for task_type in task_types:
            task = {
                "task_id": generate_id("TASK"),
                "org_id": ORG_ID,
                "project_id": proj_id,
                "title": f"{task_type} - {project['name'][:30]}",
                "description": f"{task_type} phase for the project",
                "assigned_to": random.choice(EMPLOYEES)["name"],
                "status": random.choice(["completed", "completed", "in_progress", "pending"]),
                "priority": random.choice(["high", "medium", "low"]),
                "due_date": (datetime.fromisoformat(lead["actual_close_date"].replace("Z", "+00:00")) + timedelta(days=random.randint(15, 60))).isoformat(),
                "estimated_hours": random.randint(20, 100),
                "actual_hours": random.randint(15, 120),
                "created_at": lead["actual_close_date"]
            }
            tasks.append(task)
        
        # Create work order
        wo = {
            "work_order_id": generate_id("WO"),
            "org_id": ORG_ID,
            "project_id": proj_id,
            "customer_name": lead["customer_name"],
            "title": f"Work Order: {project['name'][:30]}",
            "type": random.choice(["implementation", "support", "enhancement"]),
            "status": random.choice(["active", "completed", "completed"]),
            "value": project["value"],
            "created_at": lead["actual_close_date"]
        }
        work_orders.append(wo)
    
    await db.ops_projects.delete_many({"org_id": ORG_ID})
    await db.ops_tasks.delete_many({"org_id": ORG_ID})
    await db.ops_work_orders.delete_many({"org_id": ORG_ID})
    
    if projects: await db.ops_projects.insert_many(projects)
    if tasks: await db.ops_tasks.insert_many(tasks)
    if work_orders: await db.ops_work_orders.insert_many(work_orders)
    
    print(f"  ✅ Created {len(projects)} projects, {len(tasks)} tasks, {len(work_orders)} work orders")


async def seed_capital(db):
    """Seed capital/investment data: cap table, funding rounds"""
    print("📦 Seeding Capital Data...")
    
    # Shareholders
    shareholders = [
        {"name": "Founders (Promoters)", "type": "founder", "shares": 6000000},
        {"name": "ESOP Pool", "type": "esop", "shares": 1000000},
        {"name": "Angel Investors", "type": "angel", "shares": 1500000},
        {"name": "Seed Fund VC", "type": "seed", "shares": 1500000}
    ]
    
    owners = []
    ownership_lots = []
    
    for sh in shareholders:
        owner_id = generate_id("OWN")
        owner = {
            "owner_id": owner_id,
            "org_id": ORG_ID,
            "name": sh["name"],
            "type": sh["type"],
            "email": f"{sh['name'].lower().replace(' ', '.').replace('(', '').replace(')', '')}@email.com",
            "status": "active",
            "created_at": FINANCIAL_YEAR_START.isoformat()
        }
        owners.append(owner)
        
        lot = {
            "lot_id": generate_id("LOT"),
            "org_id": ORG_ID,
            "owner_id": owner_id,
            "shares": sh["shares"],
            "share_class": "common",
            "price_per_share": 10 if sh["type"] == "founder" else 50,
            "acquisition_date": "2024-01-01",
            "vesting_status": "vested" if sh["type"] != "esop" else "vesting",
            "created_at": FINANCIAL_YEAR_START.isoformat()
        }
        ownership_lots.append(lot)
    
    # Funding rounds history
    funding_rounds = [
        {
            "round_id": generate_id("RND"),
            "org_id": ORG_ID,
            "round_name": "Seed Round",
            "round_type": "seed",
            "pre_money_valuation": 50000000,
            "investment_amount": 10000000,
            "post_money_valuation": 60000000,
            "lead_investor": "Seed Fund VC",
            "date": "2024-06-01",
            "status": "closed",
            "created_at": "2024-06-01T00:00:00Z"
        },
        {
            "round_id": generate_id("RND"),
            "org_id": ORG_ID,
            "round_name": "Pre-Series A",
            "round_type": "bridge",
            "pre_money_valuation": 100000000,
            "investment_amount": 25000000,
            "post_money_valuation": 125000000,
            "lead_investor": "Growth Capital Partners",
            "date": "2025-03-01",
            "status": "closed",
            "created_at": "2025-03-01T00:00:00Z"
        }
    ]
    
    await db.capital_owners.delete_many({"org_id": ORG_ID})
    await db.capital_ownership_lots.delete_many({"org_id": ORG_ID})
    await db.capital_funding_rounds.delete_many({"org_id": ORG_ID})
    
    if owners: await db.capital_owners.insert_many(owners)
    if ownership_lots: await db.capital_ownership_lots.insert_many(ownership_lots)
    if funding_rounds: await db.capital_funding_rounds.insert_many(funding_rounds)
    
    total_shares = sum(sh["shares"] for sh in shareholders)
    print(f"  ✅ Created {len(owners)} shareholders, {len(funding_rounds)} funding rounds")
    print(f"  ✅ Total Shares: {total_shares:,} | Pre-Series A Valuation: ₹12.5 Cr")


async def seed_intelligence(db, leads, invoices):
    """Seed intelligence signals and metrics"""
    print("📦 Seeding Intelligence Data...")
    
    signals = []
    
    # Revenue signals
    monthly_revenue = {}
    for inv in invoices:
        month = inv["invoice_date"][:7]
        monthly_revenue[month] = monthly_revenue.get(month, 0) + inv["total_amount"]
    
    for month, revenue in monthly_revenue.items():
        signal = {
            "signal_id": generate_id("SIG"),
            "org_id": ORG_ID,
            "type": "revenue_milestone",
            "category": "finance",
            "title": f"Monthly Revenue: ₹{revenue/10000000:.2f} Cr",
            "description": f"Revenue for {month}",
            "value": revenue,
            "severity": "info" if revenue > 8_00_00_000 else "warning",
            "status": "active",
            "created_at": f"{month}-15T00:00:00Z"
        }
        signals.append(signal)
    
    # Deal signals
    high_value_deals = [l for l in leads if l.get("deal_value", 0) > 5000000]
    for deal in high_value_deals[:20]:
        signal = {
            "signal_id": generate_id("SIG"),
            "org_id": ORG_ID,
            "type": "high_value_deal",
            "category": "sales",
            "title": f"Deal Won: {deal['customer_name']}",
            "description": f"₹{deal['deal_value']/100000:.1f}L deal closed",
            "value": deal["deal_value"],
            "severity": "success",
            "status": "active",
            "related_entity_id": deal["lead_id"],
            "created_at": deal["actual_close_date"]
        }
        signals.append(signal)
    
    # Risk signals
    for _ in range(10):
        signal = {
            "signal_id": generate_id("SIG"),
            "org_id": ORG_ID,
            "type": random.choice(["payment_delay", "credit_limit_breach", "collection_risk"]),
            "category": "risk",
            "title": random.choice([
                "Payment Overdue Alert",
                "Credit Limit Warning",
                "Collection Risk Detected"
            ]),
            "description": "System detected potential risk requiring attention",
            "severity": random.choice(["warning", "critical"]),
            "status": random.choice(["active", "acknowledged", "resolved"]),
            "created_at": random_date_in_month(2025, random.randint(4, 12)).isoformat()
        }
        signals.append(signal)
    
    await db.intel_signals.delete_many({"org_id": ORG_ID})
    if signals: await db.intel_signals.insert_many(signals)
    
    print(f"  ✅ Created {len(signals)} intelligence signals")


async def seed_workspace(db, leads, projects):
    """Seed workspace: tasks, approvals, channels, chats"""
    print("📦 Seeding Workspace Data...")
    
    # Workspace tasks
    tasks = []
    for lead in leads[:30]:
        task = {
            "task_id": generate_id("TSK"),
            "org_id": ORG_ID,
            "title": f"Follow up: {lead['customer_name']}",
            "description": f"Follow up on {lead['title']}",
            "assigned_to": lead["owner"],
            "due_date": (datetime.fromisoformat(lead["created_at"].replace("Z", "+00:00")) + timedelta(days=7)).isoformat(),
            "priority": random.choice(["high", "medium", "low"]),
            "status": random.choice(["completed", "completed", "in_progress", "pending"]),
            "related_to": {"type": "lead", "id": lead["lead_id"]},
            "created_at": lead["created_at"]
        }
        tasks.append(task)
    
    # Approvals
    approvals = []
    for proj in projects[:20]:
        approval = {
            "approval_id": generate_id("APR"),
            "org_id": ORG_ID,
            "title": f"Budget Approval: {proj['name'][:30]}",
            "description": f"Approve budget for project value ₹{proj['value']/100000:.1f}L",
            "type": "budget",
            "requested_by": proj["project_manager"],
            "approver": "Deepak Joshi",
            "amount": proj["value"],
            "status": random.choice(["approved", "approved", "pending"]),
            "created_at": proj["created_at"]
        }
        approvals.append(approval)
    
    # Channels
    channels = [
        {"name": "General", "description": "General discussions", "members_count": 15},
        {"name": "Sales Team", "description": "Sales team coordination", "members_count": 5},
        {"name": "Engineering", "description": "Tech discussions", "members_count": 8},
        {"name": "Project Updates", "description": "Project status updates", "members_count": 12},
        {"name": "Finance", "description": "Finance team channel", "members_count": 4}
    ]
    
    channel_docs = []
    for ch in channels:
        channel = {
            "channel_id": generate_id("CH"),
            "org_id": ORG_ID,
            "name": ch["name"],
            "description": ch["description"],
            "type": "public",
            "members_count": ch["members_count"],
            "created_by": "Deepak Joshi",
            "created_at": FINANCIAL_YEAR_START.isoformat()
        }
        channel_docs.append(channel)
    
    await db.workspace_tasks.delete_many({"org_id": ORG_ID})
    await db.workspace_approvals.delete_many({"org_id": ORG_ID})
    await db.workspace_channels.delete_many({"org_id": ORG_ID})
    
    if tasks: await db.workspace_tasks.insert_many(tasks)
    if approvals: await db.workspace_approvals.insert_many(approvals)
    if channel_docs: await db.workspace_channels.insert_many(channel_docs)
    
    print(f"  ✅ Created {len(tasks)} tasks, {len(approvals)} approvals, {len(channel_docs)} channels")


async def seed_activity_feed(db, leads, invoices):
    """Seed activity feed"""
    print("📦 Seeding Activity Feed...")
    
    activities = []
    
    # Lead activities
    for lead in leads[:50]:
        activity = {
            "activity_id": generate_id("ACT"),
            "org_id": ORG_ID,
            "type": "deal_won",
            "title": f"Deal Won: {lead['customer_name']}",
            "description": f"₹{lead['deal_value']/100000:.1f}L deal closed by {lead['owner']}",
            "user": lead["owner"],
            "entity_type": "lead",
            "entity_id": lead["lead_id"],
            "created_at": lead["actual_close_date"]
        }
        activities.append(activity)
    
    # Invoice activities
    for inv in invoices[:50]:
        if inv["status"] == "paid":
            activity = {
                "activity_id": generate_id("ACT"),
                "org_id": ORG_ID,
                "type": "payment_received",
                "title": f"Payment Received: {inv['invoice_number']}",
                "description": f"₹{inv['total_amount']/100000:.1f}L received from {inv['customer_name']}",
                "user": "System",
                "entity_type": "invoice",
                "entity_id": inv["invoice_id"],
                "created_at": inv["invoice_date"]
            }
            activities.append(activity)
    
    await db.activity_feed.delete_many({"org_id": ORG_ID})
    if activities: await db.activity_feed.insert_many(activities)
    
    print(f"  ✅ Created {len(activities)} activity feed entries")


async def main():
    """Main seeding function"""
    print("\n" + "="*60)
    print("🚀 STARTING ₹100 CRORE FINANCIAL YEAR SEED")
    print("📅 Period: April 2025 - March 2026")
    print("="*60 + "\n")
    
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    try:
        # 1. Parties (Customers & Vendors)
        customers, vendors = await seed_parties(db)
        
        # 2. Catalog Items
        items = await seed_catalog(db)
        
        # 3. Revenue Workflow (₹100 Cr)
        leads, invoices, receivables = await seed_revenue_workflow(db, customers, items)
        
        # 4. Procurement Workflow (₹40 Cr)
        pos, bills, payables = await seed_procurement_workflow(db, vendors, items)
        
        # 5. Bank Statements
        await seed_bank_statements(db, receivables, payables)
        
        # 6. Workforce (Employees, Payroll)
        await seed_workforce(db)
        
        # 7. Operations (Projects, Tasks)
        await seed_operations(db, leads)
        
        # 8. Capital (Cap Table, Funding)
        await seed_capital(db)
        
        # 9. Intelligence (Signals)
        await seed_intelligence(db, leads, invoices)
        
        # 10. Workspace (Tasks, Approvals, Channels)
        projects = await db.ops_projects.find({"org_id": ORG_ID}).to_list(100)
        await seed_workspace(db, leads, projects)
        
        # 11. Activity Feed
        await seed_activity_feed(db, leads, invoices)
        
        print("\n" + "="*60)
        print("✅ SEEDING COMPLETE!")
        print("="*60)
        print(f"\n📊 Summary:")
        print(f"  • {len(customers)} Customers")
        print(f"  • {len(vendors)} Vendors")
        print(f"  • {len(leads)} Revenue Deals (~₹100 Cr)")
        print(f"  • {len(pos)} Purchase Orders (~₹40 Cr)")
        print(f"  • 15 Employees with 12 months payroll")
        print(f"  • 50 Projects with 300 tasks")
        print(f"  • 4 Shareholders, 2 Funding Rounds")
        print(f"  • 100+ Intelligence Signals")
        print(f"  • Workspace: Tasks, Approvals, Channels")
        print(f"\n🎯 Total Revenue: ~₹100 Cr")
        print(f"🎯 Total Spend: ~₹40 Cr")
        print(f"🎯 Net Margin: ~₹60 Cr")
        print("="*60 + "\n")
        
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(main())
