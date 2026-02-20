"""
Auto-seed ₹100 Cr Financial Year Demo Data on Startup
This module is imported and called from main.py on application startup
"""

import random
import uuid
from datetime import datetime, timedelta, timezone
from typing import Tuple, List, Dict, Any

# Constants
ORG_ID = "org_default_innovate"
FINANCIAL_YEAR_START = datetime(2025, 4, 1, tzinfo=timezone.utc)
TARGET_REVENUE = 100_00_00_000  # ₹100 crores

# Company Names
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
    "DHL Express India", "FedEx India", "Blue Dart", "Gati Limited",
    "Delhivery", "Ecom Express", "XpressBees", "Shadowfax"
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

EMPLOYEES = [
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


def generate_id(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:8].upper()}"


def random_date_in_month(year: int, month: int) -> datetime:
    start = datetime(year, month, 1, tzinfo=timezone.utc)
    if month == 12:
        end = datetime(year + 1, 1, 1, tzinfo=timezone.utc)
    else:
        end = datetime(year, month + 1, 1, tzinfo=timezone.utc)
    delta = end - start
    random_days = random.randint(0, delta.days - 1)
    return start + timedelta(days=random_days)


async def seed_100cr_data(db) -> Dict[str, Any]:
    """
    Seed comprehensive ₹100 Cr financial year data.
    Called from main.py on startup if data is missing.
    """
    results = {
        "customers": 0,
        "vendors": 0,
        "leads": 0,
        "invoices": 0,
        "purchase_orders": 0,
        "employees": 0,
        "projects": 0,
        "total_revenue": 0,
        "total_spend": 0
    }
    
    try:
        # 1. Seed Customers
        customers = []
        for company in CUSTOMER_COMPANIES:
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
        
        if customers:
            await db.parties_customers.insert_many(customers)
            results["customers"] = len(customers)
        
        # 2. Seed Vendors
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
                "payment_terms": random.choice([30, 45, 60]),
                "status": "active",
                "category": random.choice(["Technology", "Services", "Hardware", "Logistics"]),
                "created_at": FINANCIAL_YEAR_START.isoformat()
            }
            vendors.append(vendor)
        
        if vendors:
            await db.parties_vendors.insert_many(vendors)
            results["vendors"] = len(vendors)
        
        # 3. Seed Catalog Items
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
                "tax_rate": 18,
                "hsn_code": f"{random.randint(8400, 8599)}",
                "status": "active",
                "created_at": FINANCIAL_YEAR_START.isoformat()
            }
            items.append(item)
        
        if items:
            await db.catalog_items.insert_many(items)
        
        # 4. Seed Revenue Workflow (Leads, Invoices, Receivables)
        leads = []
        invoices = []
        receivables = []
        
        monthly_targets = {
            4: 600, 5: 700, 6: 750, 7: 800, 8: 850, 9: 900,
            10: 950, 11: 1000, 12: 1100, 1: 1000, 2: 900, 3: 1450
        }
        
        total_revenue = 0
        deal_count = 0
        
        for month_offset in range(12):
            year = 2025 if month_offset < 9 else 2026
            actual_month = 4 + month_offset if month_offset < 9 else month_offset - 8
            target_revenue = monthly_targets.get(actual_month, 800) * 100000
            
            month_revenue = 0
            while month_revenue < target_revenue:
                customer = random.choice(customers)
                product = random.choice(items)
                
                quantity = random.randint(1, 10)
                unit_price = product["base_price"] * random.uniform(0.9, 1.3)
                deal_value = int(unit_price * quantity)
                
                if month_revenue + deal_value > target_revenue * 1.2:
                    deal_value = int(target_revenue - month_revenue)
                    if deal_value < 100000:
                        break
                
                deal_date = random_date_in_month(year, actual_month if month_offset < 9 else (month_offset - 8 + 1))
                
                # Lead
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
                
                # Invoice
                invoice_id = generate_id("INV")
                tax_amount = int(deal_value * 0.18)
                total_amount = deal_value + tax_amount
                
                invoice = {
                    "invoice_id": invoice_id,
                    "org_id": ORG_ID,
                    "customer_id": customer["customer_id"],
                    "customer_name": customer["name"],
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
                
                # Receivable
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
        
        if leads:
            await db.revenue_workflow_leads.insert_many(leads)
            results["leads"] = len(leads)
        if invoices:
            await db.fin_invoices.insert_many(invoices)
            results["invoices"] = len(invoices)
        if receivables:
            await db.fin_receivables.insert_many(receivables)
        
        results["total_revenue"] = total_revenue
        
        # 5. Seed Procurement (Purchase Orders, Bills, Payables)
        purchase_orders = []
        bills = []
        payables = []
        
        target_spend = 40_00_00_000
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
                
                po_id = generate_id("PO")
                tax_amount = int(po_value * 0.18)
                total_amount = po_value + tax_amount
                
                po = {
                    "po_id": po_id,
                    "org_id": ORG_ID,
                    "vendor_id": vendor["vendor_id"],
                    "vendor_name": vendor["name"],
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
        
        if purchase_orders:
            await db.purchase_orders.insert_many(purchase_orders)
            results["purchase_orders"] = len(purchase_orders)
        if bills:
            await db.fin_bills.insert_many(bills)
        if payables:
            await db.fin_payables.insert_many(payables)
        
        results["total_spend"] = total_spend
        
        # 6. Seed Bank Statements
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
        await db.fin_bank_accounts.insert_one(account)
        if statements:
            await db.fin_bank_statements.insert_many(statements)
        
        # 7. Seed Employees & Payroll
        emp_docs = []
        payroll_records = []
        
        for emp in EMPLOYEES:
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
            emp_docs.append(employee)
            
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
        
        if emp_docs:
            await db.workforce_employees.insert_many(emp_docs)
            results["employees"] = len(emp_docs)
        if payroll_records:
            await db.workforce_payroll.insert_many(payroll_records)
        
        # 8. Seed Projects & Tasks
        projects = []
        tasks = []
        
        for lead in leads[:50]:
            proj_id = generate_id("PROJ")
            project = {
                "project_id": proj_id,
                "org_id": ORG_ID,
                "name": f"Project: {lead['title'][:40]}",
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
            
            for task_type in ["Planning", "Design", "Development", "Testing", "Deployment", "Training"]:
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
        
        if projects:
            await db.ops_projects.insert_many(projects)
            results["projects"] = len(projects)
        if tasks:
            await db.ops_tasks.insert_many(tasks)
        
        # 9. Seed Workspace Tasks & Approvals
        ws_tasks = []
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
            ws_tasks.append(task)
        
        if ws_tasks:
            await db.workspace_tasks.insert_many(ws_tasks)
        
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
        
        if approvals:
            await db.workspace_approvals.insert_many(approvals)
        
        # 10. Seed Channels
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
        
        if channel_docs:
            await db.workspace_channels.insert_many(channel_docs)
        
        # 11. Seed Intelligence Signals
        signals = []
        
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
        
        if signals:
            await db.intel_signals.insert_many(signals)
        
        # 12. Seed Activity Feed
        activities = []
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
        
        if activities:
            await db.activity_feed.insert_many(activities)
        
        return results
        
    except Exception as e:
        print(f"Error in seed_100cr_data: {e}")
        raise e
