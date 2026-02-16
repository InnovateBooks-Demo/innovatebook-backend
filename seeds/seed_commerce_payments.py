"""
Seed script for IB Commerce - Pay Module (Module 8)
Generates sample vendor payment data linked to procurements
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

# Payment statuses
PAYMENT_STATUSES = ['Draft', 'Pending', 'Approved', 'Paid', 'Reconciled']
PAYMENT_TYPES = ['Advance', 'Full', 'Partial', 'Retention Release']
PAYMENT_METHODS = ['Bank Transfer', 'NEFT', 'RTGS', 'Cheque', 'UPI']


async def seed_payments():
    """Seed sample payments into commerce_pay collection"""
    
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    try:
        # Clear existing payments
        await db.commerce_pay.delete_many({})
        print("✅ Cleared existing payments")
        
        # Fetch procurements to link payments
        procurements = await db.commerce_procure.find().to_list(length=10)
        if not procurements:
            print("⚠️  No procurements found. Please run seed_commerce_procurements.py first.")
            return
        
        payments = []
        
        # Create 5 sample payments
        for i, proc in enumerate(procurements[:5], 1):
            payment_status = random.choice(PAYMENT_STATUSES)
            payment_type = random.choice(PAYMENT_TYPES)
            payment_method = random.choice(PAYMENT_METHODS)
            
            # Get procurement details
            vendor_id = proc.get('vendor_id', f'VEND-2025-{str(i).zfill(3)}')
            vendor_name = proc.get('vendor_name', f'Vendor {i}')
            po_id = proc.get('po_id', f'PO-2025-{str(i).zfill(3)}')
            estimated_value = proc.get('estimated_value', 500000)
            
            # Generate dates
            invoice_date = date.today() - timedelta(days=random.randint(15, 45))
            due_date = invoice_date + timedelta(days=30)
            payment_date = None
            if payment_status in ['Paid', 'Reconciled']:
                payment_date = due_date - timedelta(days=random.randint(0, 5))
            
            # Calculate amounts
            invoice_amount = estimated_value
            tds_amount = invoice_amount * 0.02  # 2% TDS
            retention_amount = invoice_amount * 0.05 if payment_type != 'Retention Release' else 0  # 5% retention
            net_payable = invoice_amount - tds_amount - retention_amount
            
            payment_data = {
                'id': f'pay-uuid-{i}',
                'payment_id': f'PAY-2025-{str(i).zfill(3)}',
                'vendor_id': vendor_id,
                'invoice_id': f'VINV-2025-{str(i).zfill(3)}',
                'po_id': po_id or f'PO-2025-{str(i).zfill(3)}',
                'payment_status': payment_status,
                'sop_version': 'v1.0',
                'payment_type': payment_type,
                
                # Invoice & Matching Data
                'invoice_number': f'VINV-2025-{str(i).zfill(3)}',
                'invoice_date': invoice_date.isoformat(),
                'invoice_amount': invoice_amount,
                'matched_po_id': po_id or f'PO-2025-{str(i).zfill(3)}',
                'grn_id': f'GRN-2025-{str(i).zfill(3)}' if payment_status in ['Paid', 'Reconciled'] else None,
                'match_status': 'Pass' if payment_status in ['Approved', 'Paid', 'Reconciled'] else 'Pending',
                'discrepancy_notes': None,
                
                # Financial Terms
                'due_date': due_date.isoformat(),
                'currency': 'INR',
                'exchange_rate': 1.0,
                'payment_amount': net_payable if payment_status in ['Paid', 'Reconciled'] else 0,
                'retention_amount': retention_amount,
                'tds_amount': tds_amount,
                'net_payable': net_payable,
                'payment_method': payment_method,
                'payment_mode': 'Auto',
                
                # Approval & Authorization
                'approval_path': [
                    {'level': 'L1', 'approver': 'MGR-001'},
                    {'level': 'L2', 'approver': 'DIR-001'}
                ],
                'approvers': ['MGR-001', 'DIR-001'],
                'approval_status': 'Approved' if payment_status in ['Approved', 'Paid', 'Reconciled'] else 'Pending',
                'approval_remarks': 'Approved as per policy' if payment_status in ['Approved', 'Paid', 'Reconciled'] else None,
                'approval_date': datetime.now(timezone.utc).isoformat() if payment_status in ['Approved', 'Paid', 'Reconciled'] else None,
                'sod_validation': 'Pass',
                
                # Execution & Bank Data
                'bank_name': 'HDFC Bank' if payment_status in ['Paid', 'Reconciled'] else None,
                'bank_account_no': '1234567890' if payment_status in ['Paid', 'Reconciled'] else None,
                'transaction_ref_no': f'UTR-{random.randint(100000000000, 999999999999)}' if payment_status in ['Paid', 'Reconciled'] else None,
                'payment_date': payment_date.isoformat() if payment_date else None,
                'payment_batch_id': f'BATCH-{i}' if payment_status in ['Paid', 'Reconciled'] else None,
                'execution_status': 'Completed' if payment_status in ['Paid', 'Reconciled'] else 'Pending',
                'failure_reason': None,
                
                # Tax & Compliance
                'vendor_tax_id': f'GSTIN-{random.randint(10, 99)}VEND1234X1Y2',
                'tds_section': '194C',
                'tax_compliance_status': 'Pass',
                'retention_policy_id': 'RET-POL-001',
                'regulatory_flag': False,
                
                # Timestamps
                'created_at': datetime.now(timezone.utc).isoformat(),
                'updated_at': datetime.now(timezone.utc).isoformat()
            }
            
            payments.append(payment_data)
        
        # Insert payments
        if payments:
            result = await db.commerce_pay.insert_many(payments)
            print(f"✅ Successfully seeded {len(result.inserted_ids)} payments")
            
            # Print summary
            print("\n📊 Payment Summary:")
            for pay in payments:
                status_emoji = "✅" if pay['payment_status'] == 'Paid' else "🔄" if pay['payment_status'] in ['Approved', 'Pending'] else "📋" if pay['payment_status'] == 'Draft' else "💰" if pay['payment_status'] == 'Reconciled' else "⚠️"
                print(f"  {status_emoji} {pay['payment_id']} - {pay['invoice_number']} - Status: {pay['payment_status']} - Amount: ₹{pay['net_payable']:,.2f}")
        
        print("\n✅ Payment seeding completed successfully!")
        
    except Exception as e:
        print(f"❌ Error seeding payments: {str(e)}")
        raise
    
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(seed_payments())
