"""
Finance Module Data Seeding Script
Seeds sample data for all finance modules
"""

import asyncio
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
import os
from uuid import uuid4
import random

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client['innovate_books']

async def clear_finance_data():
    """Clear existing finance data"""
    print("Clearing existing finance data...")
    await db.customers.delete_many({})
    await db.vendors.delete_many({})
    await db.invoices.delete_many({})
    await db.bills.delete_many({})
    await db.collections.delete_many({})
    await db.payments.delete_many({})
    await db.banking_accounts.delete_many({})
    await db.banking_transactions.delete_many({})
    await db.cashflow_actuals.delete_many({})
    await db.cashflow_budgets.delete_many({})
    print("✓ Finance data cleared")

async def seed_customers():
    """Seed customer data"""
    print("\nSeeding customers...")
    customers = [
        {
            "id": f"CUST-{str(i+1).zfill(4)}",
            "customer_name": name,
            "email": f"{name.lower().replace(' ', '.')}@company.com",
            "phone": f"+91-{9000000000 + i}",
            "address": f"{i+1}, Business District, Mumbai",
            "gstin": f"27AAAAA{str(i+1).zfill(4)}A1Z5",
            "outstanding": random.randint(50000, 500000),
            "credit_limit": 1000000,
            "created_at": datetime.utcnow() - timedelta(days=random.randint(30, 365))
        }
        for i, name in enumerate([
            "Tata Motors Limited",
            "Reliance Industries",
            "Mahindra & Mahindra",
            "Larsen & Toubro",
            "Adani Enterprises",
            "Infosys Limited",
            "Wipro Technologies",
            "HCL Technologies",
            "Tech Mahindra",
            "Asian Paints Limited",
            "Bajaj Auto Limited",
            "Hero MotoCorp",
            "Maruti Suzuki India",
            "TVS Motor Company",
            "Godrej Industries"
        ])
    ]
    await db.customers.insert_many(customers)
    print(f"✓ Seeded {len(customers)} customers")
    return customers

async def seed_vendors():
    """Seed vendor data"""
    print("\nSeeding vendors...")
    vendors = [
        {
            "id": f"VEND-{str(i+1).zfill(4)}",
            "vendor_name": name,
            "email": f"accounts@{name.lower().replace(' ', '')}.com",
            "phone": f"+91-{8000000000 + i}",
            "address": f"{i+1}, Industrial Area, Pune",
            "gstin": f"27BBBBB{str(i+1).zfill(4)}B2Z6",
            "payable": random.randint(30000, 400000),
            "payment_terms": "Net 30",
            "created_at": datetime.utcnow() - timedelta(days=random.randint(30, 365))
        }
        for i, name in enumerate([
            "Steel Authority India",
            "Hindalco Industries",
            "JSW Steel Limited",
            "Ultratech Cement",
            "ACC Cement",
            "Ambuja Cements",
            "Grasim Industries",
            "Vedanta Resources",
            "Tata Steel Limited",
            "SAIL Limited",
            "BHEL Limited",
            "Crompton Greaves",
            "ABB India Limited",
            "Siemens India",
            "Schneider Electric"
        ])
    ]
    await db.vendors.insert_many(vendors)
    print(f"✓ Seeded {len(vendors)} vendors")
    return vendors

async def seed_invoices(customers):
    """Seed invoice data"""
    print("\nSeeding invoices...")
    invoices = []
    invoice_num = 1001
    
    for customer in customers[:10]:  # Create invoices for first 10 customers
        num_invoices = random.randint(2, 5)
        for _ in range(num_invoices):
            invoice_date = datetime.utcnow() - timedelta(days=random.randint(1, 90))
            due_date = invoice_date + timedelta(days=30)
            items = [
                {
                    "description": f"Product {j+1}",
                    "quantity": random.randint(10, 100),
                    "rate": random.randint(1000, 5000),
                    "amount": 0
                }
                for j in range(random.randint(2, 5))
            ]
            for item in items:
                item["amount"] = item["quantity"] * item["rate"]
            
            subtotal = sum(item["amount"] for item in items)
            tax = subtotal * 0.18
            total = subtotal + tax
            
            status = random.choice(["Draft", "Sent", "Paid", "Overdue"])
            
            invoice = {
                "id": str(uuid4()),
                "invoice_number": f"INV-{invoice_num}",
                "customer_id": customer["id"],
                "customer_name": customer["customer_name"],
                "invoice_date": invoice_date,
                "due_date": due_date,
                "items": items,
                "subtotal": subtotal,
                "tax": tax,
                "total_amount": total,
                "amount_paid": total if status == "Paid" else 0,
                "status": status,
                "created_at": invoice_date
            }
            invoices.append(invoice)
            invoice_num += 1
    
    await db.invoices.insert_many(invoices)
    print(f"✓ Seeded {len(invoices)} invoices")
    return invoices

async def seed_bills(vendors):
    """Seed bill data"""
    print("\nSeeding bills...")
    bills = []
    bill_num = 2001
    
    for vendor in vendors[:10]:  # Create bills for first 10 vendors
        num_bills = random.randint(2, 4)
        for _ in range(num_bills):
            bill_date = datetime.utcnow() - timedelta(days=random.randint(1, 90))
            due_date = bill_date + timedelta(days=30)
            items = [
                {
                    "description": f"Material {j+1}",
                    "quantity": random.randint(50, 200),
                    "rate": random.randint(500, 3000),
                    "amount": 0
                }
                for j in range(random.randint(2, 4))
            ]
            for item in items:
                item["amount"] = item["quantity"] * item["rate"]
            
            subtotal = sum(item["amount"] for item in items)
            tax = subtotal * 0.18
            total = subtotal + tax
            
            status = random.choice(["Draft", "Pending", "Paid", "Overdue"])
            
            bill = {
                "id": str(uuid4()),
                "bill_number": f"BILL-{bill_num}",
                "vendor_id": vendor["id"],
                "vendor_name": vendor["vendor_name"],
                "bill_date": bill_date,
                "due_date": due_date,
                "items": items,
                "subtotal": subtotal,
                "tax": tax,
                "total_amount": total,
                "amount_paid": total if status == "Paid" else 0,
                "status": status,
                "created_at": bill_date
            }
            bills.append(bill)
            bill_num += 1
    
    await db.bills.insert_many(bills)
    print(f"✓ Seeded {len(bills)} bills")
    return bills

async def seed_collections(invoices):
    """Seed collection data"""
    print("\nSeeding collections...")
    collections = []
    
    for invoice in invoices:
        if invoice["status"] in ["Sent", "Paid", "Overdue"]:
            status = "Collected" if invoice["status"] == "Paid" else "Pending"
            if invoice["status"] == "Overdue":
                status = "Overdue"
            
            collection = {
                "id": str(uuid4()),
                "invoice_id": invoice["id"],
                "invoice_number": invoice["invoice_number"],
                "customer_name": invoice["customer_name"],
                "amount_due": invoice["total_amount"],
                "amount_collected": invoice["amount_paid"],
                "due_date": invoice["due_date"],
                "status": status,
                "created_at": invoice["created_at"]
            }
            collections.append(collection)
    
    await db.collections.insert_many(collections)
    print(f"✓ Seeded {len(collections)} collections")

async def seed_payments(bills):
    """Seed payment data"""
    print("\nSeeding payments...")
    payments = []
    
    for bill in bills:
        if bill["status"] in ["Pending", "Paid"]:
            payment = {
                "id": str(uuid4()),
                "bill_id": bill["id"],
                "bill_number": bill["bill_number"],
                "vendor_name": bill["vendor_name"],
                "amount": bill["total_amount"],
                "payment_date": bill["due_date"] if bill["status"] == "Paid" else None,
                "payment_method": "Bank Transfer",
                "status": bill["status"],
                "created_at": bill["created_at"]
            }
            payments.append(payment)
    
    await db.payments.insert_many(payments)
    print(f"✓ Seeded {len(payments)} payments")

async def seed_banking():
    """Seed banking data"""
    print("\nSeeding banking data...")
    
    # Create bank accounts
    accounts = [
        {
            "id": str(uuid4()),
            "bank_name": "HDFC Bank",
            "account_number": "50100123456789",
            "ifsc_code": "HDFC0001234",
            "account_type": "Current",
            "balance": 13562282.37,
            "is_active": True,
            "created_at": datetime.utcnow() - timedelta(days=365)
        },
        {
            "id": str(uuid4()),
            "bank_name": "ICICI Bank",
            "account_number": "602101234567890",
            "ifsc_code": "ICIC0006021",
            "account_type": "Current",
            "balance": 8437291.50,
            "is_active": True,
            "created_at": datetime.utcnow() - timedelta(days=300)
        },
        {
            "id": str(uuid4()),
            "bank_name": "State Bank of India",
            "account_number": "12345678901234",
            "ifsc_code": "SBIN0001234",
            "account_type": "Current",
            "balance": 5632189.75,
            "is_active": True,
            "created_at": datetime.utcnow() - timedelta(days=400)
        },
        {
            "id": str(uuid4()),
            "bank_name": "Axis Bank",
            "account_number": "918020012345678",
            "ifsc_code": "UTIB0001234",
            "account_type": "Savings",
            "balance": 2345678.90,
            "is_active": False,
            "created_at": datetime.utcnow() - timedelta(days=500)
        }
    ]
    await db.banking_accounts.insert_many(accounts)
    print(f"✓ Seeded {len(accounts)} bank accounts")
    
    # Create bank transactions for first account
    transactions = []
    balance = 10000000.00
    for i in range(30):
        txn_type = random.choice(["credit", "debit"])
        amount = random.randint(50000, 500000)
        
        if txn_type == "credit":
            balance += amount
        else:
            balance -= amount
        
        transactions.append({
            "id": str(uuid4()),
            "account_id": accounts[0]["id"],
            "date": datetime.utcnow() - timedelta(days=30-i),
            "description": random.choice([
                "Customer Payment Received",
                "Vendor Payment Made",
                "Salary Payment",
                "Utility Bill Payment",
                "GST Payment",
                "Rent Payment",
                "Equipment Purchase",
                "Sales Revenue",
                "Raw Material Purchase"
            ]),
            "type": txn_type,
            "amount": amount,
            "balance": balance,
            "category": random.choice(["Operating", "Investment", "Financing"])
        })
    
    await db.banking_transactions.insert_many(transactions)
    print(f"✓ Seeded {len(transactions)} bank transactions")

async def seed_cashflow():
    """Seed cash flow data"""
    print("\nSeeding cash flow data...")
    
    # Create cash flow actuals
    actuals = []
    opening_balance = 13562282.37
    
    for month in range(1, 13):
        inflows = random.randint(5000000, 15000000)
        outflows = random.randint(4000000, 12000000)
        
        transactions = [
            {
                "date": datetime(2024, month, random.randint(1, 28)),
                "description": desc,
                "category": cat,
                "type": typ,
                "amount": random.randint(100000, 2000000),
                "balance": 0
            }
            for desc, cat, typ in [
                ("Customer Payment", "Operating", "inflow"),
                ("Material Purchase", "Operating", "outflow"),
                ("Salary Payment", "Operating", "outflow"),
                ("Sales Revenue", "Operating", "inflow"),
                ("Rent Payment", "Operating", "outflow"),
                ("Equipment Sale", "Investment", "inflow"),
                ("Machinery Purchase", "Investment", "outflow"),
            ]
        ]
        
        actuals.append({
            "id": str(uuid4()),
            "month": month,
            "year": 2024,
            "opening_balance": opening_balance,
            "total_inflows": inflows,
            "total_outflows": outflows,
            "closing_balance": opening_balance + inflows - outflows,
            "transactions": transactions,
            "created_at": datetime(2024, month, 1)
        })
        opening_balance = opening_balance + inflows - outflows
    
    await db.cashflow_actuals.insert_many(actuals)
    print(f"✓ Seeded {len(actuals)} cash flow actuals")
    
    # Create cash flow budgets
    budgets = []
    for month in range(1, 13):
        budgets.append({
            "id": str(uuid4()),
            "month": month,
            "year": 2025,
            "amount": random.randint(8000000, 15000000),
            "category": "Operating",
            "created_at": datetime.utcnow()
        })
    
    await db.cashflow_budgets.insert_many(budgets)
    print(f"✓ Seeded {len(budgets)} cash flow budgets")

async def main():
    """Main seeding function"""
    print("=" * 60)
    print("FINANCE MODULE DATA SEEDING")
    print("=" * 60)
    
    try:
        # Clear existing data
        await clear_finance_data()
        
        # Seed data in order
        customers = await seed_customers()
        vendors = await seed_vendors()
        invoices = await seed_invoices(customers)
        bills = await seed_bills(vendors)
        await seed_collections(invoices)
        await seed_payments(bills)
        await seed_banking()
        await seed_cashflow()
        
        print("\n" + "=" * 60)
        print("✓ FINANCE MODULE SEEDING COMPLETED SUCCESSFULLY!")
        print("=" * 60)
        print("\nSeeded Data Summary:")
        print(f"  • {len(customers)} Customers")
        print(f"  • {len(vendors)} Vendors")
        print(f"  • {len(invoices)} Invoices")
        print(f"  • {len(bills)} Bills")
        print(f"  • Collections (linked to invoices)")
        print(f"  • Payments (linked to bills)")
        print(f"  • 4 Bank Accounts")
        print(f"  • 30 Bank Transactions")
        print(f"  • 12 months Cash Flow Actuals")
        print(f"  • 12 months Cash Flow Budgets")
        print("\n")
        
    except Exception as e:
        print(f"\n❌ Error during seeding: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(main())
