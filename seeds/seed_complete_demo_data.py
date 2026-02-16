#!/usr/bin/env python3
"""
Comprehensive Demo Data Seeder for Innovate Books
Creates complete dataset with proper relationships
"""

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta, timezone
import random

MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017')

async def clear_all_data():
    """Clear all existing data"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.innovate_books
    
    collections = ['users', 'customers', 'vendors', 'invoices', 'bills', 
                   'bank_accounts', 'transactions', 'journal_entries']
    
    print("🗑️  Clearing all existing data...")
    for collection in collections:
        result = await db[collection].delete_many({})
        print(f"   Deleted {result.deleted_count} records from {collection}")
    
    client.close()
    print("✅ All data cleared!\n")

async def seed_demo_data():
    """Seed comprehensive demo data"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.innovate_books
    
    print("🌱 Seeding demo data...\n")
    
    # 1. Create Demo User
    print("1️⃣  Creating demo user...")
    demo_user = {
        "id": "user-demo-001",
        "username": "demo@innovatebooks.com",
        "email": "demo@innovatebooks.com",
        "password": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5/lWx.8oVuF3m",  # demo123
        "full_name": "Demo User",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(demo_user)
    print("   ✅ Demo user created (email: demo@innovatebooks.com, password: demo123)\n")
    
    # 2. Create Customers
    print("2️⃣  Creating 5 customers...")
    customers = [
        {
            "id": "CUST-001",
            "customer_id": "CUST-001",
            "name": "Tech Solutions India Pvt Ltd",
            "email": "accounts@techsolutions.in",
            "phone": "+91-9876543210",
            "address": "123, MG Road, Bangalore, Karnataka - 560001",
            "gstin": "29ABCDE1234F1Z5",
            "outstanding": 0,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "CUST-002",
            "customer_id": "CUST-002",
            "name": "Global Enterprises Ltd",
            "email": "finance@globalent.com",
            "phone": "+91-9876543211",
            "address": "456, Nehru Place, New Delhi - 110019",
            "gstin": "07FGHIJ5678K2L6",
            "outstanding": 0,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "CUST-003",
            "customer_id": "CUST-003",
            "name": "Smart Systems Corporation",
            "email": "billing@smartsys.com",
            "phone": "+91-9876543212",
            "address": "789, Park Street, Kolkata - 700016",
            "gstin": "19MNOPQ9012R3S7",
            "outstanding": 0,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "CUST-004",
            "customer_id": "CUST-004",
            "name": "Digital Innovations Pvt Ltd",
            "email": "accounts@digitalinno.in",
            "phone": "+91-9876543213",
            "address": "321, Anna Salai, Chennai - 600002",
            "gstin": "33TUVWX3456Y4Z8",
            "outstanding": 0,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "CUST-005",
            "customer_id": "CUST-005",
            "name": "Mega Corp Industries",
            "email": "payables@megacorp.com",
            "phone": "+91-9876543214",
            "address": "654, Bandra West, Mumbai - 400050",
            "gstin": "27ABCXY7890Z5A9",
            "outstanding": 0,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    await db.customers.insert_many(customers)
    print(f"   ✅ Created {len(customers)} customers\n")
    
    # 3. Create Vendors
    print("3️⃣  Creating 5 vendors...")
    vendors = [
        {
            "id": "VEND-001",
            "vendor_id": "VEND-001",
            "name": "Office Supplies Co",
            "email": "sales@officesupplies.in",
            "phone": "+91-9988776655",
            "address": "101, Market Road, Pune - 411001",
            "gstin": "27PQRST1234U5V6",
            "outstanding": 0,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "VEND-002",
            "vendor_id": "VEND-002",
            "name": "Cloud Services India",
            "email": "billing@cloudservices.in",
            "phone": "+91-9988776656",
            "address": "202, Cyber City, Hyderabad - 500081",
            "gstin": "36WXYZ5678A6B7",
            "outstanding": 0,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "VEND-003",
            "vendor_id": "VEND-003",
            "name": "Marketing Solutions Ltd",
            "email": "accounts@marketingsol.com",
            "phone": "+91-9988776657",
            "address": "303, Commercial Street, Bangalore - 560001",
            "gstin": "29CDEFG9012H7I8",
            "outstanding": 0,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "VEND-004",
            "vendor_id": "VEND-004",
            "name": "IT Equipment Traders",
            "email": "sales@itequipment.in",
            "phone": "+91-9988776658",
            "address": "404, Tech Park, Gurgaon - 122001",
            "gstin": "06JKLMN3456O8P9",
            "outstanding": 0,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "VEND-005",
            "vendor_id": "VEND-005",
            "name": "Professional Services Hub",
            "email": "billing@prohub.com",
            "phone": "+91-9988776659",
            "address": "505, Business Bay, Mumbai - 400001",
            "gstin": "27QRSTU6789V9W0",
            "outstanding": 0,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    await db.vendors.insert_many(vendors)
    print(f"   ✅ Created {len(vendors)} vendors\n")
    
    # 4. Create Bank Account
    print("4️⃣  Creating bank account...")
    bank_account = {
        "id": "BANK-001",
        "account_number": "1234567890",
        "bank_name": "HDFC Bank",
        "branch": "MG Road Branch",
        "ifsc": "HDFC0001234",
        "account_type": "Current",
        "balance": 5000000.00,  # 50 Lakhs opening balance
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.bank_accounts.insert_one(bank_account)
    print("   ✅ Bank account created (HDFC Bank, Balance: ₹50,00,000)\n")
    
    # 5. Create Invoices with Categories (will auto-create journal entries)
    print("5️⃣  Creating 8 invoices (Finalized - will auto-post journals)...")
    base_date = datetime.now(timezone.utc) - timedelta(days=60)
    
    invoices_data = [
        {"customer_idx": 0, "base_amount": 100000, "days_ago": 60, "category": "CAT_OP_INF_001", "desc": "Software Development Services"},
        {"customer_idx": 1, "base_amount": 150000, "days_ago": 50, "category": "CAT_OP_INF_003", "desc": "Consulting Services"},
        {"customer_idx": 2, "base_amount": 80000, "days_ago": 45, "category": "CAT_OP_INF_001", "desc": "Web Application Development"},
        {"customer_idx": 0, "base_amount": 120000, "days_ago": 40, "category": "CAT_OP_INF_004", "desc": "Annual Subscription"},
        {"customer_idx": 3, "base_amount": 200000, "days_ago": 35, "category": "CAT_OP_INF_001", "desc": "Mobile App Development"},
        {"customer_idx": 4, "base_amount": 90000, "days_ago": 30, "category": "CAT_OP_INF_003", "desc": "IT Support Services"},
        {"customer_idx": 1, "base_amount": 175000, "days_ago": 20, "category": "CAT_OP_INF_001", "desc": "Enterprise Software License"},
        {"customer_idx": 2, "base_amount": 110000, "days_ago": 10, "category": "CAT_OP_INF_003", "desc": "Technical Consulting"},
    ]
    
    invoices = []
    for idx, inv_data in enumerate(invoices_data):
        inv_date = base_date + timedelta(days=60 - inv_data["days_ago"])
        due_date = inv_date + timedelta(days=30)
        
        base_amt = inv_data["base_amount"]
        gst_amt = base_amt * 0.18
        total_amt = base_amt + gst_amt
        
        invoice = {
            "id": f"inv-{idx+1001}",
            "invoice_number": f"INV-{idx+1001}",
            "customer_id": customers[inv_data["customer_idx"]]["id"],
            "customer_name": customers[inv_data["customer_idx"]]["name"],
            "invoice_date": inv_date.isoformat(),
            "due_date": due_date.isoformat(),
            "base_amount": base_amt,
            "gst_percent": 18.0,
            "gst_amount": gst_amt,
            "tds_percent": 0.0,
            "tds_amount": 0.0,
            "total_amount": total_amt,
            "amount_received": 0.0,
            "amount_outstanding": total_amt,
            "net_receivable": total_amt,
            "balance_due": total_amt,
            "status": "Finalized",  # This will trigger journal entry creation
            "category_id": inv_data["category"],
            "coa_account": "Sales Revenue",
            "journal_entry_id": None,  # Will be populated when we create journals manually
            "items": [{"description": inv_data["desc"], "quantity": 1, "unit_price": base_amt, "amount": base_amt}],
            "created_at": inv_date.isoformat()
        }
        invoices.append(invoice)
    
    await db.invoices.insert_many(invoices)
    print(f"   ✅ Created {len(invoices)} invoices\n")
    
    # 6. Create Bills with Categories
    print("6️⃣  Creating 6 bills (Approved - will auto-post journals)...")
    bills_data = [
        {"vendor_idx": 0, "base_amount": 25000, "days_ago": 55, "category": "CAT_OP_OUT_001", "desc": "Office Supplies Purchase"},
        {"vendor_idx": 1, "base_amount": 50000, "days_ago": 48, "category": "CAT_OP_OUT_002", "desc": "Cloud Infrastructure Services"},
        {"vendor_idx": 2, "base_amount": 35000, "days_ago": 42, "category": "CAT_OP_OUT_013", "desc": "Digital Marketing Campaign"},
        {"vendor_idx": 3, "base_amount": 75000, "days_ago": 38, "category": "CAT_OP_OUT_001", "desc": "Laptop and Equipment Purchase"},
        {"vendor_idx": 4, "base_amount": 40000, "days_ago": 25, "category": "CAT_OP_OUT_003", "desc": "Legal and Professional Fees"},
        {"vendor_idx": 1, "base_amount": 55000, "days_ago": 15, "category": "CAT_OP_OUT_002", "desc": "Software Licenses"},
    ]
    
    bills = []
    for idx, bill_data in enumerate(bills_data):
        bill_date = base_date + timedelta(days=60 - bill_data["days_ago"])
        due_date = bill_date + timedelta(days=30)
        
        base_amt = bill_data["base_amount"]
        gst_amt = base_amt * 0.18
        total_amt = base_amt + gst_amt
        
        bill = {
            "id": f"bill-{idx+2001}",
            "bill_number": f"BILL-{idx+2001}",
            "vendor_id": vendors[bill_data["vendor_idx"]]["id"],
            "vendor_name": vendors[bill_data["vendor_idx"]]["name"],
            "bill_date": bill_date.isoformat(),
            "due_date": due_date.isoformat(),
            "base_amount": base_amt,
            "gst_percent": 18.0,
            "gst_amount": gst_amt,
            "tds_percent": 0.0,
            "tds_amount": 0.0,
            "total_amount": total_amt,
            "amount_paid": 0.0,
            "amount_outstanding": total_amt,
            "status": "Approved",  # This will trigger journal entry creation
            "category_id": bill_data["category"],
            "coa_account": "Operating Expense",
            "journal_entry_id": None,
            "expense_category": "Operating Expense",
            "items": [{"description": bill_data["desc"], "quantity": 1, "unit_price": base_amt, "amount": base_amt}],
            "created_at": bill_date.isoformat()
        }
        bills.append(bill)
    
    await db.bills.insert_many(bills)
    print(f"   ✅ Created {len(bills)} bills\n")
    
    # 7. Create Journal Entries (since invoices/bills are already created, we need to manually create journals)
    print("7️⃣  Creating journal entries for invoices and bills...")
    journal_entries = []
    
    # Journal entries for invoices
    for invoice in invoices:
        journal = {
            "id": f"journal-inv-{invoice['id']}",
            "transaction_id": invoice['id'],
            "transaction_type": "Invoice",
            "entry_date": invoice['invoice_date'],
            "description": f"Invoice {invoice['invoice_number']} raised",
            "line_items": [
                {
                    "account": "Accounts Receivable",
                    "description": f"Invoice {invoice['invoice_number']} - {invoice['customer_name']}",
                    "debit": invoice['total_amount'],
                    "credit": 0.0
                },
                {
                    "account": "Sales Revenue",
                    "description": f"Revenue from {invoice['invoice_number']}",
                    "debit": 0.0,
                    "credit": invoice['base_amount']
                },
                {
                    "account": "Output GST",
                    "description": f"GST on {invoice['invoice_number']}",
                    "debit": 0.0,
                    "credit": invoice['gst_amount']
                }
            ],
            "total_debit": invoice['total_amount'],
            "total_credit": invoice['total_amount'],
            "posted_by": demo_user['id'],
            "status": "Posted",
            "created_at": invoice['invoice_date']
        }
        journal_entries.append(journal)
        
        # Update invoice with journal_entry_id
        await db.invoices.update_one(
            {"id": invoice['id']},
            {"$set": {"journal_entry_id": journal['id']}}
        )
    
    # Journal entries for bills
    for bill in bills:
        journal = {
            "id": f"journal-bill-{bill['id']}",
            "transaction_id": bill['id'],
            "transaction_type": "Bill",
            "entry_date": bill['bill_date'],
            "description": f"Bill {bill['bill_number']} approved",
            "line_items": [
                {
                    "account": "Operating Expense",
                    "description": f"Bill {bill['bill_number']} - {bill['vendor_name']}",
                    "debit": bill['base_amount'],
                    "credit": 0.0
                },
                {
                    "account": "Input GST",
                    "description": f"GST on {bill['bill_number']}",
                    "debit": bill['gst_amount'],
                    "credit": 0.0
                },
                {
                    "account": "Accounts Payable",
                    "description": f"Bill {bill['bill_number']} - {bill['vendor_name']}",
                    "debit": 0.0,
                    "credit": bill['total_amount']
                }
            ],
            "total_debit": bill['total_amount'],
            "total_credit": bill['total_amount'],
            "posted_by": demo_user['id'],
            "status": "Posted",
            "created_at": bill['bill_date']
        }
        journal_entries.append(journal)
        
        # Update bill with journal_entry_id
        await db.bills.update_one(
            {"id": bill['id']},
            {"$set": {"journal_entry_id": journal['id']}}
        )
    
    await db.journal_entries.insert_many(journal_entries)
    print(f"   ✅ Created {len(journal_entries)} journal entries (auto-posted)\n")
    
    # 8. Create Bank Transactions (some matching invoices/bills)
    print("8️⃣  Creating 12 bank transactions (some matchable with invoices/bills)...")
    transactions = []
    
    # Credit transactions (payments from customers - match with invoices)
    credit_txns = [
        {"inv_idx": 0, "days_ago": 55, "amount": 118000, "type": "Credit"},  # Full payment for INV-1001
        {"inv_idx": 1, "days_ago": 45, "amount": 177000, "type": "Credit"},  # Full payment for INV-1002
        {"inv_idx": 2, "days_ago": 40, "amount": 94400, "type": "Credit"},   # Full payment for INV-1003
        {"inv_idx": 4, "days_ago": 28, "amount": 236000, "type": "Credit"},  # Full payment for INV-1005
    ]
    
    for txn_data in credit_txns:
        invoice = invoices[txn_data["inv_idx"]]
        txn_date = base_date + timedelta(days=60 - txn_data["days_ago"])
        
        transaction = {
            "id": f"txn-credit-{txn_data['inv_idx']}",
            "transaction_date": txn_date.isoformat(),
            "description": f"Payment received from {invoice['customer_name']} for {invoice['invoice_number']}",
            "type": txn_data["type"],
            "amount": txn_data["amount"],
            "bank_account_id": bank_account['id'],
            "bank_name": bank_account['bank_name'],
            "category": "Customer Payment",
            "is_reconciled": False,
            "matched_invoice_id": None,
            "created_at": txn_date.isoformat()
        }
        transactions.append(transaction)
    
    # Debit transactions (payments to vendors - match with bills)
    debit_txns = [
        {"bill_idx": 0, "days_ago": 50, "amount": 29500, "type": "Debit"},   # Full payment for BILL-2001
        {"bill_idx": 1, "days_ago": 43, "amount": 59000, "type": "Debit"},   # Full payment for BILL-2002
        {"bill_idx": 3, "days_ago": 33, "amount": 88500, "type": "Debit"},   # Full payment for BILL-2004
    ]
    
    for txn_data in debit_txns:
        bill = bills[txn_data["bill_idx"]]
        txn_date = base_date + timedelta(days=60 - txn_data["days_ago"])
        
        transaction = {
            "id": f"txn-debit-{txn_data['bill_idx']}",
            "transaction_date": txn_date.isoformat(),
            "description": f"Payment made to {bill['vendor_name']} for {bill['bill_number']}",
            "type": txn_data["type"],
            "amount": txn_data["amount"],
            "bank_account_id": bank_account['id'],
            "bank_name": bank_account['bank_name'],
            "category": "Vendor Payment",
            "is_reconciled": False,
            "matched_bill_id": None,
            "created_at": txn_date.isoformat()
        }
        transactions.append(transaction)
    
    # Additional unmatched transactions
    other_txns = [
        {"days_ago": 52, "amount": 50000, "type": "Credit", "desc": "Investment received from promoters"},
        {"days_ago": 46, "amount": 30000, "type": "Debit", "desc": "Office rent payment"},
        {"days_ago": 35, "amount": 15000, "type": "Debit", "desc": "Electricity bill payment"},
        {"days_ago": 22, "amount": 25000, "type": "Credit", "desc": "Interest income from FD"},
        {"days_ago": 12, "amount": 45000, "type": "Debit", "desc": "Employee salary payment"},
    ]
    
    for idx, txn_data in enumerate(other_txns):
        txn_date = base_date + timedelta(days=60 - txn_data["days_ago"])
        
        transaction = {
            "id": f"txn-other-{idx}",
            "transaction_date": txn_date.isoformat(),
            "description": txn_data["desc"],
            "type": txn_data["type"],
            "amount": txn_data["amount"],
            "bank_account_id": bank_account['id'],
            "bank_name": bank_account['bank_name'],
            "category": "Other",
            "is_reconciled": False,
            "created_at": txn_date.isoformat()
        }
        transactions.append(transaction)
    
    await db.transactions.insert_many(transactions)
    print(f"   ✅ Created {len(transactions)} bank transactions\n")
    
    client.close()
    
    print("=" * 60)
    print("✅ DEMO DATA SEEDING COMPLETE!")
    print("=" * 60)
    print("\n📊 Summary:")
    print(f"   • 1 Demo User (login: demo@innovatebooks.com / demo123)")
    print(f"   • 5 Customers")
    print(f"   • 5 Vendors")
    print(f"   • 1 Bank Account (₹50,00,000 balance)")
    print(f"   • 8 Invoices (Finalized - with journal entries)")
    print(f"   • 6 Bills (Approved - with journal entries)")
    print(f"   • 14 Journal Entries (auto-posted)")
    print(f"   • 12 Bank Transactions (7 matchable, 5 unmatched)")
    print("\n🎯 What to Test:")
    print("   1. Financial Reporting → All 5 statements should show data")
    print("   2. Banking → Transactions tab → Try AI-powered matching")
    print("   3. Invoices → View details → See journal entries")
    print("   4. Bills → View details → See journal entries")
    print("   5. Create new invoice/bill → Watch auto-posting")
    print("\n" + "=" * 60 + "\n")

async def main():
    await clear_all_data()
    await seed_demo_data()

if __name__ == "__main__":
    asyncio.run(main())
