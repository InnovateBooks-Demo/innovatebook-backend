"""
Seed data script for Innovate Books Financial Analysis Tool
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv
import os
from pathlib import Path
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def seed_customers():
    customers = [
        {
            "id": "cust-001",
            "name": "Tech Solutions Pvt Ltd",
            "contact_person": "Rajesh Kumar",
            "email": "rajesh@techsolutions.com",
            "phone": "+91-9876543210",
            "gstin": "27AAAAA0000A1Z5",
            "pan": "AAAAA0000A",
            "credit_limit": 500000,
            "payment_terms": "Net 30",
            "address": "Mumbai, Maharashtra",
            "outstanding_amount": 250000,
            "overdue_amount": 50000,
            "avg_payment_days": 35,
            "status": "Active",
            "created_at": (datetime.now(timezone.utc) - timedelta(days=180)).isoformat()
        },
        {
            "id": "cust-002",
            "name": "Global Enterprises",
            "contact_person": "Priya Sharma",
            "email": "priya@globalent.com",
            "phone": "+91-9876543211",
            "gstin": "27BBBBB1111B2Z6",
            "pan": "BBBBB1111B",
            "credit_limit": 750000,
            "payment_terms": "Net 45",
            "address": "Delhi, NCR",
            "outstanding_amount": 180000,
            "overdue_amount": 0,
            "avg_payment_days": 42,
            "status": "Active",
            "created_at": (datetime.now(timezone.utc) - timedelta(days=150)).isoformat()
        },
        {
            "id": "cust-003",
            "name": "Startup Innovations",
            "contact_person": "Amit Patel",
            "email": "amit@startupinnov.com",
            "phone": "+91-9876543212",
            "gstin": "27CCCCC2222C3Z7",
            "pan": "CCCCC2222C",
            "credit_limit": 300000,
            "payment_terms": "Net 30",
            "address": "Bangalore, Karnataka",
            "outstanding_amount": 125000,
            "overdue_amount": 25000,
            "avg_payment_days": 38,
            "status": "Active",
            "created_at": (datetime.now(timezone.utc) - timedelta(days=120)).isoformat()
        }
    ]
    
    await db.customers.delete_many({})
    await db.customers.insert_many(customers)
    print(f"✓ Seeded {len(customers)} customers")

async def seed_vendors():
    vendors = [
        {
            "id": "vend-001",
            "name": "Office Supplies Co",
            "contact_person": "Suresh Reddy",
            "email": "suresh@officesupplies.com",
            "phone": "+91-9876543213",
            "gstin": "27DDDDD3333D4Z8",
            "pan": "DDDDD3333D",
            "payment_terms": "Net 15",
            "bank_account": "1234567890",
            "ifsc": "HDFC0001234",
            "address": "Mumbai, Maharashtra",
            "total_payable": 85000,
            "overdue_amount": 15000,
            "avg_payment_days": 18,
            "status": "Active",
            "created_at": (datetime.now(timezone.utc) - timedelta(days=200)).isoformat()
        },
        {
            "id": "vend-002",
            "name": "Cloud Services Inc",
            "contact_person": "Neha Singh",
            "email": "neha@cloudservices.com",
            "phone": "+91-9876543214",
            "gstin": "27EEEEE4444E5Z9",
            "pan": "EEEEE4444E",
            "payment_terms": "Net 30",
            "bank_account": "0987654321",
            "ifsc": "ICIC0004321",
            "address": "Pune, Maharashtra",
            "total_payable": 150000,
            "overdue_amount": 0,
            "avg_payment_days": 25,
            "status": "Active",
            "created_at": (datetime.now(timezone.utc) - timedelta(days=180)).isoformat()
        },
        {
            "id": "vend-003",
            "name": "Marketing Agency Pro",
            "contact_person": "Vikram Malhotra",
            "email": "vikram@marketingpro.com",
            "phone": "+91-9876543215",
            "gstin": "27FFFFF5555F6Z0",
            "pan": "FFFFF5555F",
            "payment_terms": "Net 30",
            "bank_account": "5555666677",
            "ifsc": "AXIS0005678",
            "address": "Delhi, NCR",
            "total_payable": 95000,
            "overdue_amount": 20000,
            "avg_payment_days": 32,
            "status": "Active",
            "created_at": (datetime.now(timezone.utc) - timedelta(days=160)).isoformat()
        }
    ]
    
    await db.vendors.delete_many({})
    await db.vendors.insert_many(vendors)
    print(f"✓ Seeded {len(vendors)} vendors")

async def seed_invoices():
    now = datetime.now(timezone.utc)
    invoices = []
    
    for i in range(1, 16):
        days_ago = random.randint(1, 90)
        invoice_date = now - timedelta(days=days_ago)
        due_date = invoice_date + timedelta(days=30)
        
        base_amount = random.randint(50000, 200000)
        gst_amount = base_amount * 0.18
        total_amount = base_amount + gst_amount
        
        status_choices = ["Unpaid", "Partially Paid", "Paid"]
        status = random.choice(status_choices)
        
        amount_received = 0
        if status == "Paid":
            amount_received = total_amount
        elif status == "Partially Paid":
            amount_received = total_amount * random.uniform(0.3, 0.7)
        
        customer_id = random.choice(["cust-001", "cust-002", "cust-003"])
        customer_names = {"cust-001": "Tech Solutions Pvt Ltd", "cust-002": "Global Enterprises", "cust-003": "Startup Innovations"}
        
        invoices.append({
            "id": f"inv-{i:03d}",
            "invoice_number": f"INV-{1000 + i}",
            "customer_id": customer_id,
            "customer_name": customer_names[customer_id],
            "invoice_date": invoice_date.isoformat(),
            "due_date": due_date.isoformat(),
            "base_amount": base_amount,
            "gst_percent": 18,
            "gst_amount": gst_amount,
            "tds_percent": 0,
            "tds_amount": 0,
            "total_amount": total_amount,
            "amount_received": amount_received,
            "amount_outstanding": total_amount - amount_received,
            "status": status,
            "items": [
                {"description": "Professional Services", "quantity": 1, "rate": base_amount, "amount": base_amount}
            ],
            "created_at": invoice_date.isoformat()
        })
    
    await db.invoices.delete_many({})
    await db.invoices.insert_many(invoices)
    print(f"✓ Seeded {len(invoices)} invoices")

async def seed_bills():
    now = datetime.now(timezone.utc)
    bills = []
    
    for i in range(1, 13):
        days_ago = random.randint(1, 90)
        bill_date = now - timedelta(days=days_ago)
        due_date = bill_date + timedelta(days=random.choice([15, 30]))
        
        base_amount = random.randint(20000, 100000)
        gst_amount = base_amount * 0.18
        total_amount = base_amount + gst_amount
        
        status_choices = ["Pending", "Partially Paid", "Paid"]
        status = random.choice(status_choices)
        
        amount_paid = 0
        if status == "Paid":
            amount_paid = total_amount
        elif status == "Partially Paid":
            amount_paid = total_amount * random.uniform(0.3, 0.7)
        
        vendor_id = random.choice(["vend-001", "vend-002", "vend-003"])
        vendor_names = {"vend-001": "Office Supplies Co", "vend-002": "Cloud Services Inc", "vend-003": "Marketing Agency Pro"}
        
        categories = ["Office Expenses", "Cloud Services", "Marketing", "Utilities", "Rent"]
        
        bills.append({
            "id": f"bill-{i:03d}",
            "bill_number": f"BILL-{2000 + i}",
            "vendor_id": vendor_id,
            "vendor_name": vendor_names[vendor_id],
            "bill_date": bill_date.isoformat(),
            "due_date": due_date.isoformat(),
            "base_amount": base_amount,
            "gst_percent": 18,
            "gst_amount": gst_amount,
            "tds_percent": 0,
            "tds_amount": 0,
            "total_amount": total_amount,
            "amount_paid": amount_paid,
            "amount_outstanding": total_amount - amount_paid,
            "status": status,
            "expense_category": random.choice(categories),
            "items": [
                {"description": random.choice(categories), "quantity": 1, "rate": base_amount, "amount": base_amount}
            ],
            "created_at": bill_date.isoformat()
        })
    
    await db.bills.delete_many({})
    await db.bills.insert_many(bills)
    print(f"✓ Seeded {len(bills)} bills")

async def seed_bank_accounts():
    accounts = [
        {
            "id": "bank-001",
            "bank_name": "HDFC Bank",
            "account_number": "50100123456789",
            "account_type": "Current",
            "ifsc": "HDFC0001234",
            "branch": "Mumbai Main",
            "opening_balance": 2500000,
            "current_balance": 3250000,
            "status": "Active",
            "created_at": (datetime.now(timezone.utc) - timedelta(days=365)).isoformat()
        },
        {
            "id": "bank-002",
            "bank_name": "ICICI Bank",
            "account_number": "60200987654321",
            "account_type": "Current",
            "ifsc": "ICIC0004321",
            "branch": "Pune Branch",
            "opening_balance": 1500000,
            "current_balance": 1850000,
            "status": "Active",
            "created_at": (datetime.now(timezone.utc) - timedelta(days=300)).isoformat()
        }
    ]
    
    await db.bank_accounts.delete_many({})
    await db.bank_accounts.insert_many(accounts)
    print(f"✓ Seeded {len(accounts)} bank accounts")

async def seed_transactions():
    now = datetime.now(timezone.utc)
    transactions = []
    
    bank_ids = ["bank-001", "bank-002"]
    bank_names = {"bank-001": "HDFC Bank", "bank-002": "ICICI Bank"}
    
    for i in range(1, 31):
        days_ago = random.randint(1, 60)
        trans_date = now - timedelta(days=days_ago)
        
        bank_id = random.choice(bank_ids)
        trans_type = random.choice(["Credit", "Debit"])
        
        if trans_type == "Credit":
            amount = random.randint(50000, 200000)
            descriptions = ["Customer Payment", "Invoice Settlement", "Revenue Receipt", "Sales Income"]
        else:
            amount = random.randint(20000, 100000)
            descriptions = ["Vendor Payment", "Salary Disbursement", "Office Rent", "Utility Bill", "Tax Payment"]
        
        transactions.append({
            "id": f"trans-{i:03d}",
            "bank_account_id": bank_id,
            "bank_name": bank_names[bank_id],
            "transaction_date": trans_date.isoformat(),
            "description": random.choice(descriptions),
            "transaction_type": trans_type,
            "amount": amount,
            "reference_no": f"UTR{random.randint(100000000000, 999999999999)}",
            "balance": random.randint(1500000, 3500000),
            "status": random.choice(["New", "Matched"]),
            "linked_entity": None,
            "created_at": trans_date.isoformat()
        })
    
    await db.transactions.delete_many({})
    await db.transactions.insert_many(transactions)
    print(f"✓ Seeded {len(transactions)} transactions")

async def seed_cash_flow():
    now = datetime.now(timezone.utc)
    cash_flows = []
    
    categories_in = ["Sales", "Collections", "Refunds", "Other Income"]
    categories_out = ["Vendor Payments", "Salaries", "Rent", "Utilities", "Marketing", "Taxes"]
    
    for i in range(1, 51):
        days_ago = random.randint(1, 60)
        date = now - timedelta(days=days_ago)
        
        flow_type = random.choice(["Inflow", "Outflow"])
        
        if flow_type == "Inflow":
            amount = random.randint(50000, 250000)
            category = random.choice(categories_in)
            source = random.choice(["Tech Solutions Pvt Ltd", "Global Enterprises", "Startup Innovations"])
        else:
            amount = random.randint(20000, 150000)
            category = random.choice(categories_out)
            source = random.choice(["Office Supplies Co", "Cloud Services Inc", "Marketing Agency Pro", "Landlord", "Employees"])
        
        cash_flows.append({
            "id": f"cf-{i:03d}",
            "date": date.isoformat(),
            "type": flow_type,
            "category": category,
            "amount": amount,
            "source": source,
            "description": f"{category} - {source}",
            "is_actual": True,
            "created_at": date.isoformat()
        })
    
    await db.cash_flow.delete_many({})
    await db.cash_flow.insert_many(cash_flows)
    print(f"✓ Seeded {len(cash_flows)} cash flow entries")

async def main():
    print("\\n🌱 Starting seed data generation...")
    print("=" * 50)
    
    await seed_customers()
    await seed_vendors()
    await seed_invoices()
    await seed_bills()
    await seed_bank_accounts()
    await seed_transactions()
    await seed_cash_flow()
    
    print("=" * 50)
    print("✅ All seed data generated successfully!\\n")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
