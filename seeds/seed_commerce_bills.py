"""
Seed script for IB Commerce - Bill Module (Module 5)
Generates sample billing/invoicing data linked to executions
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone, date, timedelta
import os
import random
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = 'innovate_books_db'

# Sample data
INVOICE_TYPES = ['Milestone', 'Time-based', 'Retainer', 'Advance']
INVOICE_STATUSES = ['Draft', 'Approved', 'Issued', 'Paid']
PAYMENT_TERMS = ['Net 30', 'Net 45', 'Net 60', 'Due on Receipt', 'Net 15']

# Sample customers
CUSTOMERS = [
    {
        'name': 'TechCorp Enterprises', 
        'tax_id': 'GSTIN-29ABCDE1234F1Z5',
        'customer_id': 'CUST-2025-001'
    },
    {
        'name': 'GMC Supply Chain', 
        'tax_id': 'GSTIN-07FGHIJ5678K2L6',
        'customer_id': 'CUST-2025-002'
    },
    {
        'name': 'RetailMax Solutions', 
        'tax_id': 'GSTIN-27KLMNO9012P3Q7',
        'customer_id': 'CUST-2025-003'
    },
]

# Sample line items
SAMPLE_ITEMS = [
    {
        'item_id': 'ITEM-001',
        'item_description': 'Software Development Services',
        'quantity': 1,
        'rate': 250000,
        'line_amount': 250000,
        'tax_code': 'GST18',
        'hsn_sac_code': '998312'
    },
    {
        'item_id': 'ITEM-002',
        'item_description': 'Cloud Infrastructure Setup',
        'quantity': 1,
        'rate': 150000,
        'line_amount': 150000,
        'tax_code': 'GST18',
        'hsn_sac_code': '998314'
    },
    {
        'item_id': 'ITEM-003',
        'item_description': 'Consulting Services',
        'quantity': 40,
        'rate': 5000,
        'line_amount': 200000,
        'tax_code': 'GST18',
        'hsn_sac_code': '998319'
    },
]


async def seed_bills():
    """Seed sample bills into commerce_bills collection"""
    
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    try:
        # Clear existing bills
        await db.commerce_bills.delete_many({})
        print("✅ Cleared existing bills")
        
        # Fetch executions to link bills
        executions = await db.commerce_execute.find().to_list(length=10)
        if not executions:
            print("⚠️  No executions found. Please run seed_commerce_executions.py first.")
            return
        
        bills = []
        
        # Create 5 sample bills
        for i in range(1, 6):
            customer = random.choice(CUSTOMERS)
            execution = random.choice(executions) if executions else None
            invoice_type = random.choice(INVOICE_TYPES)
            invoice_status = random.choice(INVOICE_STATUSES)
            payment_terms = random.choice(PAYMENT_TERMS)
            
            # Generate dates (convert to datetime for MongoDB)
            invoice_date_obj = date.today() - timedelta(days=random.randint(10, 90))
            due_date_obj = invoice_date_obj + timedelta(days=30)
            invoice_date = datetime.combine(invoice_date_obj, datetime.min.time()).replace(tzinfo=timezone.utc)
            due_date = datetime.combine(due_date_obj, datetime.min.time()).replace(tzinfo=timezone.utc)
            
            # Select random items
            num_items = random.randint(1, 3)
            selected_items = random.sample(SAMPLE_ITEMS, num_items)
            
            # Calculate amounts
            invoice_amount = sum(item['line_amount'] for item in selected_items)
            tax_amount = invoice_amount * 0.18  # 18% GST
            net_amount = invoice_amount + tax_amount
            
            bill_data = {
                'id': f'bill-uuid-{i}',
                'invoice_id': f'INV-2025-{str(i).zfill(3)}',
                'linked_execution_id': execution['execution_id'] if execution else f'EXEC-2025-{str(i).zfill(3)}',
                'contract_id': f'CONT-2025-{str(i).zfill(3)}',
                'customer_id': customer['customer_id'],
                'customer_name': customer['name'],
                'invoice_status': invoice_status,
                'invoice_date': invoice_date,
                'sop_version': 'v1.0',
                
                # Financial Details
                'invoice_type': invoice_type,
                'currency': 'INR',
                'exchange_rate': 1.0,
                'invoice_amount': invoice_amount,
                'tax_amount': tax_amount,
                'net_amount': net_amount,
                'discount_percent': 0.0,
                'retention_percent': 0.0,
                'payment_terms': payment_terms,
                'due_date': due_date,
                
                # Items
                'items': selected_items,
                
                # Tax & Compliance
                'tax_structure': {'CGST': tax_amount / 2, 'SGST': tax_amount / 2},
                'tax_registration_number': 'GSTIN-19XYZAB1234C1D5',
                'customer_tax_id': customer['tax_id'],
                'einvoice_irn': f'IRN-{i}' * 10 if invoice_status in ['Issued', 'Paid'] else None,
                'hsn_sac_code': selected_items[0]['hsn_sac_code'],
                'eway_bill_number': None,
                'tax_compliance_status': 'Pass',
                
                # Approval & Dispatch
                'approval_status': 'Approved' if invoice_status in ['Issued', 'Paid'] else 'Pending',
                'approved_by': 'ADMIN-001' if invoice_status in ['Issued', 'Paid'] else None,
                'approval_remarks': 'Approved for issuance' if invoice_status in ['Issued', 'Paid'] else None,
                'dispatched_on': datetime.now(timezone.utc) if invoice_status in ['Issued', 'Paid'] else None,
                'dispatch_method': 'Email',
                'dispatch_proof': f'email-receipt-{i}' if invoice_status in ['Issued', 'Paid'] else None,
                
                # Customer Acknowledgment
                'acknowledged_on': datetime.now(timezone.utc) if invoice_status == 'Paid' else None,
                'acknowledged_by': customer['customer_id'] if invoice_status == 'Paid' else None,
                'acknowledgment_proof': None,
                'dispute_flag': False,
                'dispute_reason': None,
                'resolution_sop_id': None,
                
                # Timestamps
                'created_at': datetime.now(timezone.utc),
                'updated_at': datetime.now(timezone.utc)
            }
            
            bills.append(bill_data)
        
        # Insert bills
        if bills:
            result = await db.commerce_bills.insert_many(bills)
            print(f"✅ Successfully seeded {len(result.inserted_ids)} bills")
            
            # Print summary
            print("\n📊 Bill Summary:")
            for bill in bills:
                print(f"  • {bill['invoice_id']} - {bill['customer_name']} - Status: {bill['invoice_status']} - Amount: ₹{bill['net_amount']:,.2f}")
        
        print("\n✅ Bill seeding completed successfully!")
        
    except Exception as e:
        print(f"❌ Error seeding bills: {str(e)}")
        raise
    
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(seed_bills())
