"""
Comprehensive Data Seeding Script for Innovate Books
Creates interconnected sample data that flows through the entire system:
- Customers & Vendors
- Bank Accounts & Transactions
- Invoices & Bills with Categories
- Auto-generated Journal Entries
- Financial Reports (P&L, Balance Sheet, etc.)
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta, timezone
import uuid
import os
from dotenv import load_dotenv
import random

load_dotenv()

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'innovate_books_db')
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

async def clear_all_data():
    """Clear all existing data"""
    print("🗑️  Clearing all existing data...")
    collections = ['customers', 'vendors', 'bank_accounts', 'transactions', 
                   'invoices', 'bills', 'journal_entries']
    for collection in collections:
        result = await db[collection].delete_many({})
        print(f"   Deleted {result.deleted_count} records from {collection}")

async def seed_customers():
    """Create 10 sample customers"""
    print("\n👥 Creating 10 sample customers...")
    customers = []
    companies = [
        ("TechCorp Solutions", "tech@techcorp.com", "+91-9876543210"),
        ("Global Retail Ltd", "contact@globalretail.com", "+91-9876543211"),
        ("Manufacturing Inc", "info@manufacturing.com", "+91-9876543212"),
        ("Healthcare Systems", "hello@healthcare.com", "+91-9876543213"),
        ("Education Services", "admin@eduservices.com", "+91-9876543214"),
        ("Logistics Express", "support@logistics.com", "+91-9876543215"),
        ("Financial Advisors", "contact@finadvisors.com", "+91-9876543216"),
        ("Real Estate Group", "info@realestate.com", "+91-9876543217"),
        ("Media & Marketing", "hello@mediamarketing.com", "+91-9876543218"),
        ("Consulting Partners", "team@consulting.com", "+91-9876543219"),
    ]
    
    for idx, (name, email, phone) in enumerate(companies, 1):
        customer = {
            "id": str(uuid.uuid4()),
            "customer_id": f"CUST-{1000 + idx}",
            "name": name,
            "contact_person": f"Contact Person {idx}",
            "email": email,
            "phone": phone,
            "address": f"{idx * 100} Business Street, Mumbai, India",
            "gstin": f"27AAACR{5201 + idx}K1Z{idx}",
            "pan": f"AAACR{5201 + idx}K",
            "credit_limit": 500000.0 + (idx * 100000),
            "payment_terms": "Net 30",
            "outstanding_amount": 0,
            "total_invoiced": 0,
            "status": "Active",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        customers.append(customer)
    
    await db.customers.insert_many(customers)
    print(f"   ✅ Created {len(customers)} customers")
    return customers

async def seed_vendors():
    """Create 8 sample vendors"""
    print("\n🏢 Creating 8 sample vendors...")
    vendors = []
    companies = [
        ("Office Supplies Co", "sales@officesupplies.com", "+91-9876540001"),
        ("IT Services Provider", "contact@itservices.com", "+91-9876540002"),
        ("Marketing Agency", "hello@marketingagency.com", "+91-9876540003"),
        ("Cloud Infrastructure", "support@cloudinfra.com", "+91-9876540004"),
        ("Legal Services LLP", "info@legalservices.com", "+91-9876540005"),
        ("Accounting Firm", "team@accountingfirm.com", "+91-9876540006"),
        ("Software Licenses", "sales@softwarelicenses.com", "+91-9876540007"),
        ("Facility Management", "contact@facilitymanagement.com", "+91-9876540008"),
    ]
    
    for idx, (name, email, phone) in enumerate(companies, 1):
        vendor = {
            "id": str(uuid.uuid4()),
            "name": name,
            "contact_person": f"Vendor Contact {idx}",
            "email": email,
            "phone": phone,
            "address": f"{idx * 50} Vendor Lane, Delhi, India",
            "gstin": f"07AAACR{6201 + idx}K1Z{idx}",
            "pan": f"AAACR{6201 + idx}K",
            "payment_terms": "Net 45",
            "bank_account": f"ACC{1234567890 + idx}",
            "ifsc": f"HDFC000{idx}",
            "total_payable": 0.0,
            "overdue_amount": 0.0,
            "avg_payment_days": 0.0,
            "status": "Active",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        vendors.append(vendor)
    
    await db.vendors.insert_many(vendors)
    print(f"   ✅ Created {len(vendors)} vendors")
    return vendors

async def seed_bank_accounts():
    """Create 3 bank accounts"""
    print("\n🏦 Creating 3 bank accounts...")
    accounts = [
        {
            "id": str(uuid.uuid4()),
            "account_id": "BANK-001",
            "bank_name": "HDFC Bank",
            "account_number": "50100123456789",
            "ifsc": "HDFC0001234",
            "branch": "Andheri West Branch",
            "account_type": "Current",
            "opening_balance": 5000000.00,
            "current_balance": 5000000.00,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "account_id": "BANK-002",
            "bank_name": "ICICI Bank",
            "account_number": "60200123456789",
            "ifsc": "ICIC0002345",
            "branch": "Bandra Branch",
            "account_type": "Current",
            "opening_balance": 3000000.00,
            "current_balance": 3000000.00,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "account_id": "BANK-003",
            "bank_name": "Axis Bank",
            "account_number": "70300123456789",
            "ifsc": "UTIB0003456",
            "branch": "Powai Branch",
            "account_type": "Savings",
            "opening_balance": 1000000.00,
            "current_balance": 1000000.00,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.bank_accounts.insert_many(accounts)
    print(f"   ✅ Created {len(accounts)} bank accounts")
    return accounts

async def get_categories():
    """Get categories for invoices and bills"""
    revenue_category = await db.category_master.find_one({
        "cashflow_activity": "Operating",
        "cashflow_flow": "Inflow"
    })
    
    expense_category = await db.category_master.find_one({
        "cashflow_activity": "Operating",
        "cashflow_flow": "Outflow"
    })
    
    return revenue_category, expense_category

async def seed_invoices(customers, revenue_category):
    """Create 15 invoices with various statuses"""
    print("\n📄 Creating 15 invoices with auto-posted journal entries...")
    invoices = []
    
    # Create invoices over last 90 days
    for i in range(15):
        customer = customers[i % len(customers)]
        days_ago = random.randint(1, 90)
        invoice_date = datetime.now(timezone.utc) - timedelta(days=days_ago)
        due_date = invoice_date + timedelta(days=30)
        
        base_amount = round(random.uniform(100000, 1000000), 2)
        gst_percent = 18
        gst_amount = round(base_amount * (gst_percent / 100), 2)
        total_amount = round(base_amount + gst_amount, 2)
        tds_percent = 2
        tds_amount = round(base_amount * (tds_percent / 100), 2)
        net_receivable = round(total_amount - tds_amount, 2)
        
        # 60% finalized, 30% paid, 10% draft
        rand = random.random()
        if rand < 0.3:  # 30% paid
            status = "Paid"
            amount_received = net_receivable
            payment_date = invoice_date + timedelta(days=random.randint(15, 45))
        elif rand < 0.9:  # 60% finalized (unpaid)
            status = "Finalized"
            amount_received = 0
            payment_date = None
        else:  # 10% draft
            status = "Draft"
            amount_received = 0
            payment_date = None
        
        balance_due = max(0, net_receivable - amount_received)
        
        invoice = {
            "id": str(uuid.uuid4()),
            "invoice_number": f"INV-{3000 + i}",
            "customer_id": customer["id"],
            "customer_name": customer["name"],
            "invoice_date": invoice_date.isoformat(),
            "due_date": due_date.isoformat(),
            "base_amount": base_amount,
            "gst_percent": gst_percent,
            "gst_amount": gst_amount,
            "tds_percent": tds_percent,
            "tds_amount": tds_amount,
            "total_amount": total_amount,
            "net_receivable": net_receivable,
            "amount_received": round(amount_received, 2),
            "balance_due": round(balance_due, 2),
            "status": status,
            "payment_date": payment_date.isoformat() if payment_date else None,
            "category_id": revenue_category["id"] if revenue_category else None,
            "coa_account": revenue_category["coa_account"] if revenue_category else "Revenue",
            "journal_entry_id": None,
            "items": [
                {
                    "description": f"Professional Services - Period {i+1}",
                    "quantity": 1,
                    "unit_price": round(base_amount, 2),
                    "amount": round(base_amount, 2)
                }
            ],
            "created_at": invoice_date.isoformat()
        }
        
        # Create journal entry for Finalized and Paid invoices
        if status in ["Finalized", "Paid"]:
            journal_entry = {
                "id": str(uuid.uuid4()),
                "transaction_id": invoice["id"],
                "transaction_type": "Invoice",
                "entry_date": invoice_date,
                "description": f"Invoice {invoice['invoice_number']} - {customer['name']}",
                "line_items": [
                    {
                        "account": "Accounts Receivable",
                        "debit": round(net_receivable, 2),
                        "credit": 0,
                        "description": f"AR for {invoice['invoice_number']}"
                    },
                    {
                        "account": revenue_category["coa_account"] if revenue_category else "Service Revenue",
                        "debit": 0,
                        "credit": round(base_amount, 2),
                        "description": f"Revenue for {invoice['invoice_number']}"
                    },
                    {
                        "account": "GST Payable",
                        "debit": 0,
                        "credit": round(gst_amount, 2),
                        "description": f"GST for {invoice['invoice_number']}"
                    },
                    {
                        "account": "TDS Receivable",
                        "debit": round(tds_amount, 2),
                        "credit": 0,
                        "description": f"TDS for {invoice['invoice_number']}"
                    }
                ],
                "total_debit": round(net_receivable + tds_amount, 2),
                "total_credit": round(base_amount + gst_amount, 2),
                "status": "Posted",
                "created_at": invoice_date.isoformat()
            }
            
            result = await db.journal_entries.insert_one(journal_entry)
            invoice["journal_entry_id"] = journal_entry["id"]
        
        invoices.append(invoice)
    
    await db.invoices.insert_many(invoices)
    print(f"   ✅ Created {len(invoices)} invoices")
    print(f"      - Draft: {len([i for i in invoices if i['status'] == 'Draft'])}")
    print(f"      - Finalized: {len([i for i in invoices if i['status'] == 'Finalized'])}")
    print(f"      - Paid: {len([i for i in invoices if i['status'] == 'Paid'])}")
    return invoices

async def seed_bills(vendors, expense_category):
    """Create 12 bills with various statuses"""
    print("\n📋 Creating 12 bills with auto-posted journal entries...")
    bills = []
    
    # Create bills over last 90 days
    for i in range(12):
        vendor = vendors[i % len(vendors)]
        days_ago = random.randint(1, 90)
        bill_date = datetime.now(timezone.utc) - timedelta(days=days_ago)
        due_date = bill_date + timedelta(days=30)
        
        base_amount = random.uniform(50000, 500000)
        gst_percent = 18
        gst_amount = base_amount * (gst_percent / 100)
        total_amount = base_amount + gst_amount
        tds_percent = 2
        tds_amount = base_amount * (tds_percent / 100)
        net_payable = total_amount - tds_amount
        
        # 60% approved, 30% paid, 10% draft
        rand = random.random()
        if rand < 0.3:  # 30% paid
            status = "Paid"
            amount_paid = net_payable
            payment_date = bill_date + timedelta(days=random.randint(15, 45))
        elif rand < 0.9:  # 60% approved (unpaid)
            status = "Approved"
            amount_paid = 0
            payment_date = None
        else:  # 10% draft
            status = "Draft"
            amount_paid = 0
            payment_date = None
        
        balance_due = max(0, net_payable - amount_paid)
        
        bill = {
            "id": str(uuid.uuid4()),
            "bill_number": f"BILL-{4000 + i}",
            "vendor_id": vendor["id"],
            "vendor_name": vendor["name"],
            "bill_date": bill_date.isoformat(),
            "due_date": due_date.isoformat(),
            "base_amount": round(base_amount, 2),
            "gst_percent": gst_percent,
            "gst_amount": round(gst_amount, 2),
            "tds_percent": tds_percent,
            "tds_amount": round(tds_amount, 2),
            "total_amount": round(total_amount, 2),
            "net_payable": round(net_payable, 2),
            "amount_paid": round(amount_paid, 2),
            "balance_due": round(balance_due, 2),
            "status": status,
            "payment_date": payment_date.isoformat() if payment_date else None,
            "category_id": expense_category["id"] if expense_category else None,
            "coa_account": expense_category["coa_account"] if expense_category else "Operating Expense",
            "journal_entry_id": None,
            "expense_category": "Purchase",
            "items": [
                {
                    "description": f"Service/Product Purchase - Period {i+1}",
                    "quantity": 1,
                    "unit_price": round(base_amount, 2),
                    "amount": round(base_amount, 2)
                }
            ],
            "created_at": bill_date.isoformat()
        }
        
        # Create journal entry for Approved and Paid bills
        if status in ["Approved", "Paid"]:
            journal_entry = {
                "id": str(uuid.uuid4()),
                "transaction_id": bill["id"],
                "transaction_type": "Bill",
                "entry_date": bill_date,
                "description": f"Bill {bill['bill_number']} - {vendor['name']}",
                "line_items": [
                    {
                        "account": expense_category["coa_account"] if expense_category else "Operating Expense",
                        "debit": round(base_amount, 2),
                        "credit": 0,
                        "description": f"Expense for {bill['bill_number']}"
                    },
                    {
                        "account": "Input GST",
                        "debit": round(gst_amount, 2),
                        "credit": 0,
                        "description": f"GST for {bill['bill_number']}"
                    },
                    {
                        "account": "Accounts Payable",
                        "debit": 0,
                        "credit": round(net_payable, 2),
                        "description": f"AP for {bill['bill_number']}"
                    },
                    {
                        "account": "TDS Payable",
                        "debit": 0,
                        "credit": round(tds_amount, 2),
                        "description": f"TDS for {bill['bill_number']}"
                    }
                ],
                "total_debit": round(base_amount + gst_amount, 2),
                "total_credit": round(net_payable + tds_amount, 2),
                "status": "Posted",
                "created_at": bill_date.isoformat()
            }
            
            result = await db.journal_entries.insert_one(journal_entry)
            bill["journal_entry_id"] = journal_entry["id"]
        
        bills.append(bill)
    
    await db.bills.insert_many(bills)
    print(f"   ✅ Created {len(bills)} bills")
    print(f"      - Draft: {len([b for b in bills if b['status'] == 'Draft'])}")
    print(f"      - Approved: {len([b for b in bills if b['status'] == 'Approved'])}")
    print(f"      - Paid: {len([b for b in bills if b['status'] == 'Paid'])}")
    return bills

async def seed_bank_transactions(bank_accounts, invoices, bills):
    """Create bank transactions for paid invoices and bills"""
    print("\n💰 Creating bank transactions...")
    transactions = []
    transaction_id = 1
    
    # Get main bank account
    main_account = bank_accounts[0]
    
    # Create transactions for paid invoices (receipts)
    paid_invoices = [inv for inv in invoices if inv['status'] == 'Paid']
    for invoice in paid_invoices:
        transaction = {
            "id": str(uuid.uuid4()),
            "bank_account_id": main_account["id"],
            "bank_name": main_account["bank_name"],
            "transaction_date": invoice["payment_date"],
            "description": f"Payment received for {invoice['invoice_number']}",
            "transaction_type": "Credit",
            "amount": invoice["amount_received"],
            "reference_no": f"REF-{invoice['invoice_number']}",
            "balance": 0,  # Will be calculated
            "status": "Reconciled",
            "linked_entity": invoice["invoice_number"],
            "created_at": invoice["payment_date"]
        }
        transactions.append(transaction)
        transaction_id += 1
    
    # Create transactions for paid bills (payments)
    paid_bills = [bill for bill in bills if bill['status'] == 'Paid']
    for bill in paid_bills:
        transaction = {
            "id": str(uuid.uuid4()),
            "bank_account_id": main_account["id"],
            "bank_name": main_account["bank_name"],
            "transaction_date": bill["payment_date"],
            "description": f"Payment made for {bill['bill_number']}",
            "transaction_type": "Debit",
            "amount": bill["amount_paid"],
            "reference_no": f"REF-{bill['bill_number']}",
            "balance": 0,  # Will be calculated
            "status": "Reconciled",
            "linked_entity": bill["bill_number"],
            "created_at": bill["payment_date"]
        }
        transactions.append(transaction)
        transaction_id += 1
    
    # Sort transactions by date
    transactions.sort(key=lambda x: x["transaction_date"])
    
    # Calculate running balance
    running_balance = main_account["opening_balance"]
    for transaction in transactions:
        if transaction["transaction_type"] == "Credit":
            running_balance += transaction["amount"]
        else:  # Debit
            running_balance -= transaction["amount"]
        transaction["balance"] = round(running_balance, 2)
    
    if transactions:
        await db.transactions.insert_many(transactions)
        # Update bank account balance
        await db.bank_accounts.update_one(
            {"id": main_account["id"]},
            {"$set": {"current_balance": round(running_balance, 2)}}
        )
    
    print(f"   ✅ Created {len(transactions)} bank transactions")
    return transactions

async def update_customer_vendor_totals(invoices, bills):
    """Update outstanding amounts for customers and vendors"""
    print("\n🔄 Updating customer and vendor totals...")
    
    # Update customer totals
    customer_totals = {}
    for invoice in invoices:
        cust_id = invoice["customer_id"]
        if cust_id not in customer_totals:
            customer_totals[cust_id] = {"outstanding": 0, "total_invoiced": 0}
        customer_totals[cust_id]["outstanding"] += invoice["balance_due"]
        customer_totals[cust_id]["total_invoiced"] += invoice["total_amount"]
    
    for cust_id, totals in customer_totals.items():
        await db.customers.update_one(
            {"id": cust_id},
            {"$set": {
                "outstanding_amount": round(totals["outstanding"], 2),
                "total_invoiced": round(totals["total_invoiced"], 2)
            }}
        )
    
    # Update vendor totals
    vendor_totals = {}
    for bill in bills:
        vend_id = bill["vendor_id"]
        if vend_id not in vendor_totals:
            vendor_totals[vend_id] = {"outstanding": 0, "total_invoiced": 0}
        vendor_totals[vend_id]["outstanding"] += bill["balance_due"]
        vendor_totals[vend_id]["total_invoiced"] += bill["total_amount"]
    
    for vend_id, totals in vendor_totals.items():
        await db.vendors.update_one(
            {"id": vend_id},
            {"$set": {
                "outstanding_amount": round(totals["outstanding"], 2),
                "total_invoiced": round(totals["total_invoiced"], 2)
            }}
        )
    
    print(f"   ✅ Updated totals for {len(customer_totals)} customers and {len(vendor_totals)} vendors")

async def verify_data():
    """Verify the seeded data"""
    print("\n🔍 Verifying seeded data...")
    
    customer_count = await db.customers.count_documents({})
    vendor_count = await db.vendors.count_documents({})
    bank_account_count = await db.bank_accounts.count_documents({})
    invoice_count = await db.invoices.count_documents({})
    bill_count = await db.bills.count_documents({})
    journal_entry_count = await db.journal_entries.count_documents({})
    transaction_count = await db.transactions.count_documents({})
    
    print(f"\n📊 Data Summary:")
    print(f"   Customers: {customer_count}")
    print(f"   Vendors: {vendor_count}")
    print(f"   Bank Accounts: {bank_account_count}")
    print(f"   Invoices: {invoice_count}")
    print(f"   Bills: {bill_count}")
    print(f"   Journal Entries: {journal_entry_count}")
    print(f"   Bank Transactions: {transaction_count}")
    
    # Verify journal entries are balanced
    journal_entries = await db.journal_entries.find({}).to_list(length=None)
    unbalanced = []
    for je in journal_entries:
        if abs(je['total_debit'] - je['total_credit']) > 0.01:
            unbalanced.append(je['entry_number'])
    
    if unbalanced:
        print(f"\n   ⚠️  Warning: {len(unbalanced)} journal entries are not balanced!")
    else:
        print(f"\n   ✅ All {journal_entry_count} journal entries are balanced!")
    
    print("\n✨ Data seeding complete! All data flows through the system:")
    print("   - Customers → Invoices → Journal Entries → Financial Reports")
    print("   - Vendors → Bills → Journal Entries → Financial Reports")
    print("   - Bank Accounts → Transactions (linked to invoices/bills)")

async def main():
    """Main seeding function"""
    print("=" * 80)
    print("COMPREHENSIVE DATA SEEDING FOR INNOVATE BOOKS")
    print("=" * 80)
    
    # Clear existing data
    await clear_all_data()
    
    # Get categories (should already exist)
    revenue_category, expense_category = await get_categories()
    
    if not revenue_category or not expense_category:
        print("\n❌ Error: Categories not found! Please run category_master_seed.py first.")
        return
    
    print(f"\n✅ Using categories:")
    print(f"   Revenue: {revenue_category['category_name']} ({revenue_category['coa_account']})")
    print(f"   Expense: {expense_category['category_name']} ({expense_category['coa_account']})")
    
    # Seed data in order
    customers = await seed_customers()
    vendors = await seed_vendors()
    bank_accounts = await seed_bank_accounts()
    invoices = await seed_invoices(customers, revenue_category)
    bills = await seed_bills(vendors, expense_category)
    transactions = await seed_bank_transactions(bank_accounts, invoices, bills)
    
    # Update totals
    await update_customer_vendor_totals(invoices, bills)
    
    # Verify data
    await verify_data()
    
    print("\n" + "=" * 80)
    print("✅ DATA SEEDING COMPLETE!")
    print("=" * 80)

if __name__ == "__main__":
    asyncio.run(main())
