import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime, timezone

async def seed_all():
    client = AsyncIOMotorClient(os.environ.get('MONGO_URL'))
    db = client[os.environ.get('DB_NAME', 'innovate_books')]
    
    print("=" * 70)
    print("SEEDING ALL COMMERCE MODULES")
    print("=" * 70)
    
    # Clear and seed Bills
    await db.commerce_bills.delete_many({})
    bills = [
        {'id': f'bill-{i}', 'invoice_id': f'INV-2025-{str(i).zfill(3)}', 'customer_name': f'Customer {i}', 
         'invoice_amount': 100000 * i, 'tax_amount': 18000 * i, 'net_amount': 118000 * i,
         'invoice_status': 'Issued', 'invoice_date': datetime.now(timezone.utc), 
         'due_date': datetime.now(timezone.utc), 'payment_terms': 'Net 30'}
        for i in range(1, 6)
    ]
    await db.commerce_bills.insert_many(bills)
    print(f"✅ Bills: Seeded {len(bills)} records")
    
    # Clear and seed Collections
    await db.commerce_collect.delete_many({})
    collections = [
        {'id': f'collect-{i}', 'collection_id': f'COLL-2025-{str(i).zfill(3)}', 'invoice_id': f'INV-2025-{str(i).zfill(3)}',
         'customer_id': f'CUST-{str(i).zfill(3)}', 'amount_due': 100000 * i, 'amount_received': 50000 * i,
         'amount_outstanding': 50000 * i, 'payment_status': 'Partial', 'collection_priority': 'High',
         'due_date': datetime.now(timezone.utc)}
        for i in range(1, 6)
    ]
    await db.commerce_collect.insert_many(collections)
    print(f"✅ Collections: Seeded {len(collections)} records")
    
    # Clear and seed Procurements
    await db.commerce_procure.delete_many({})
    procurements = [
        {'id': f'procure-{i}', 'procurement_id': f'PROC-2025-{str(i).zfill(3)}', 'po_number': f'PO-{str(i).zfill(3)}',
         'vendor_name': f'Vendor {i}', 'vendor_id': f'VEND-{str(i).zfill(3)}', 'procurement_category': 'Goods',
         'order_value': 75000 * i, 'procurement_status': 'Ordered', 'order_date': datetime.now(timezone.utc),
         'expected_delivery_date': datetime.now(timezone.utc), 'payment_terms': 'Net 30'}
        for i in range(1, 6)
    ]
    await db.commerce_procure.insert_many(procurements)
    print(f"✅ Procurements: Seeded {len(procurements)} records")
    
    # Clear and seed Payments
    await db.commerce_pay.delete_many({})
    payments = [
        {'id': f'pay-{i}', 'payment_id': f'PAY-2025-{str(i).zfill(3)}', 'procurement_id': f'PROC-2025-{str(i).zfill(3)}',
         'vendor_name': f'Vendor {i}', 'vendor_id': f'VEND-{str(i).zfill(3)}', 'invoice_number': f'VINV-{str(i).zfill(3)}',
         'invoice_amount': 75000 * i, 'amount_paid': 75000 * i if i % 2 == 0 else 0, 'payment_status': 'Paid' if i % 2 == 0 else 'Pending',
         'payment_mode': 'Bank Transfer', 'invoice_date': datetime.now(timezone.utc), 
         'payment_due_date': datetime.now(timezone.utc)}
        for i in range(1, 6)
    ]
    await db.commerce_pay.insert_many(payments)
    print(f"✅ Payments: Seeded {len(payments)} records")
    
    # Clear and seed Expenses
    await db.commerce_spend.delete_many({})
    expenses = [
        {'id': f'expense-{i}', 'expense_id': f'EXP-2025-{str(i).zfill(3)}', 'expense_category': 'Operations',
         'expense_type': 'Fixed', 'vendor_name': f'Vendor {i}', 'expense_amount': 15000 * i,
         'expense_status': 'Approved', 'payment_mode': 'Bank Transfer', 'expense_date': datetime.now(timezone.utc)}
        for i in range(1, 6)
    ]
    await db.commerce_spend.insert_many(expenses)
    print(f"✅ Expenses: Seeded {len(expenses)} records")
    
    # Clear and seed Tax
    await db.commerce_tax.delete_many({})
    tax_entries = [
        {'id': f'tax-{i}', 'tax_id': f'TAX-2025-{str(i).zfill(3)}', 'transaction_type': 'Sale',
         'transaction_id': f'TXN-{str(i).zfill(3)}', 'taxable_amount': 100000 * i, 'gst_rate': 18,
         'cgst_amount': 9000 * i, 'sgst_amount': 9000 * i, 'igst_amount': 0, 
         'total_tax_amount': 18000 * i, 'filing_status': 'Pending', 'tax_period': '2025-01'}
        for i in range(1, 6)
    ]
    await db.commerce_tax.insert_many(tax_entries)
    print(f"✅ Tax: Seeded {len(tax_entries)} records")
    
    # Clear and seed Reconciliations
    await db.commerce_reconcile.delete_many({})
    reconciliations = [
        {'id': f'reconcile-{i}', 'reconcile_id': f'REC-2025-{str(i).zfill(3)}', 'reconciliation_type': 'Bank',
         'account_name': f'Account {i}', 'account_id': f'ACC-{str(i).zfill(3)}', 'book_balance': 500000 * i,
         'bank_balance': 495000 * i, 'variance_amount': 5000, 'reconciliation_status': 'Pending',
         'reconciliation_period': '2025-01'}
        for i in range(1, 6)
    ]
    await db.commerce_reconcile.insert_many(reconciliations)
    print(f"✅ Reconciliations: Seeded {len(reconciliations)} records")
    
    # Clear and seed Governance
    await db.commerce_govern.delete_many({})
    governance = [
        {'id': f'govern-{i}', 'govern_id': f'GOV-2025-{str(i).zfill(3)}', 'governance_type': 'Compliance Audit',
         'entity_name': f'Entity {i}', 'auditor_name': f'Auditor {i}', 'compliance_score': 80 + i,
         'audit_status': 'Draft', 'audit_period': '2025-01', 'audit_findings': 'Sample findings'}
        for i in range(1, 6)
    ]
    await db.commerce_govern.insert_many(governance)
    print(f"✅ Governance: Seeded {len(governance)} records")
    
    print("=" * 70)
    print("ALL MODULES SEEDED SUCCESSFULLY!")
    print("=" * 70)
    
    # Wait a bit to ensure writes complete
    await asyncio.sleep(1)
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_all())
