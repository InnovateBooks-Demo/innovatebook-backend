"""
Seed script for IB Commerce - Collect Module (Module 6)
Generates sample collections/receivables data linked to bills
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
PAYMENT_STATUSES = ['Pending', 'Partial', 'Paid', 'Overdue']
COLLECTION_PRIORITIES = ['High', 'Medium', 'Low']
PAYMENT_METHODS = ['Bank Transfer', 'UPI', 'Card', 'Cheque', 'Cash']
PAYMENT_BEHAVIORS = ['Excellent', 'Good', 'Average', 'Poor']


async def seed_collections():
    """Seed sample collections into commerce_collect collection"""
    
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    try:
        # Clear existing collections
        await db.commerce_collect.delete_many({})
        print("✅ Cleared existing collections")
        
        # Fetch bills to link collections
        bills = await db.commerce_bills.find().to_list(length=10)
        if not bills:
            print("⚠️  No bills found. Please run seed_commerce_bills.py first.")
            return
        
        collections = []
        
        # Create 5 sample collections linked to bills
        for i, bill in enumerate(bills[:5], 1):
            payment_status = random.choice(PAYMENT_STATUSES)
            priority = random.choice(COLLECTION_PRIORITIES)
            
            # Calculate amounts based on bill
            invoice_amount = bill.get('invoice_amount', 100000)
            amount_due = invoice_amount
            
            # Set amounts based on payment status
            if payment_status == 'Paid':
                amount_received = amount_due
                amount_outstanding = 0
                payment_received_date = datetime.now(timezone.utc) - timedelta(days=random.randint(1, 10))
            elif payment_status == 'Partial':
                amount_received = amount_due * random.uniform(0.3, 0.7)
                amount_outstanding = amount_due - amount_received
                payment_received_date = None
            else:
                amount_received = 0
                amount_outstanding = amount_due
                payment_received_date = None
            
            # Calculate due date and overdue days
            invoice_date = bill.get('invoice_date')
            if isinstance(invoice_date, str):
                invoice_date = datetime.fromisoformat(invoice_date.replace('Z', '+00:00'))
            
            # Ensure invoice_date is timezone-aware
            if invoice_date.tzinfo is None:
                invoice_date = invoice_date.replace(tzinfo=timezone.utc)
            
            due_date = invoice_date + timedelta(days=30)
            days_overdue = max(0, (datetime.now(timezone.utc) - due_date).days)
            
            # Set dunning level based on days overdue
            if days_overdue > 90:
                dunning_level = 5
            elif days_overdue > 60:
                dunning_level = 4
            elif days_overdue > 30:
                dunning_level = 3
            elif days_overdue > 15:
                dunning_level = 2
            elif days_overdue > 0:
                dunning_level = 1
            else:
                dunning_level = 0
            
            collection_data = {
                'id': f'collect-uuid-{i}',
                'collection_id': f'COLL-2025-{str(i).zfill(3)}',
                'invoice_id': bill.get('invoice_id'),
                'customer_id': bill.get('customer_id'),
                'payment_status': payment_status,
                
                # Payment Details
                'amount_due': amount_due,
                'amount_received': amount_received,
                'amount_outstanding': amount_outstanding,
                'currency': 'INR',
                'due_date': due_date.date().isoformat(),
                'payment_received_date': payment_received_date.date().isoformat() if payment_received_date else None,
                
                # Collection Schedule
                'collection_priority': priority,
                'days_overdue': days_overdue,
                'dunning_level': dunning_level,
                'last_followup_date': (datetime.now(timezone.utc) - timedelta(days=random.randint(1, 5))).date().isoformat() if days_overdue > 0 else None,
                'next_followup_date': (datetime.now(timezone.utc) + timedelta(days=random.randint(1, 7))).date().isoformat() if payment_status in ['Pending', 'Partial', 'Overdue'] else None,
                
                # Payment Details
                'payment_method': random.choice(PAYMENT_METHODS) if payment_status in ['Paid', 'Partial'] else None,
                'payment_reference': f'UTR-{random.randint(100000000000, 999999999999)}' if payment_status in ['Paid', 'Partial'] else None,
                'bank_account': 'HDFC Bank - 1234567890' if payment_status in ['Paid', 'Partial'] else None,
                
                # Dispute & Resolution
                'dispute_flag': random.choice([True, False]) if payment_status == 'Overdue' else False,
                'dispute_reason': 'Quality issue raised by customer' if payment_status == 'Overdue' and random.random() > 0.5 else None,
                'dispute_resolution_date': None,
                'partial_settlement': payment_status == 'Partial',
                'writeoff_flag': False,
                'writeoff_amount': 0,
                'writeoff_reason': None,
                'writeoff_approved_by': None,
                
                # Customer Behavior Analysis
                'customer_payment_behavior': random.choice(PAYMENT_BEHAVIORS),
                'avg_payment_delay_days': random.randint(0, 15) if payment_status != 'Paid' else 0,
                
                # Timestamps
                'created_at': datetime.now(timezone.utc).isoformat(),
                'updated_at': datetime.now(timezone.utc).isoformat()
            }
            
            collections.append(collection_data)
        
        # Insert collections
        if collections:
            result = await db.commerce_collect.insert_many(collections)
            print(f"✅ Successfully seeded {len(result.inserted_ids)} collections")
            
            # Print summary
            print("\n📊 Collections Summary:")
            for coll in collections:
                status_emoji = "✅" if coll['payment_status'] == 'Paid' else "⏳" if coll['payment_status'] == 'Partial' else "⚠️" if coll['payment_status'] == 'Overdue' else "📋"
                print(f"  {status_emoji} {coll['collection_id']} - Invoice: {coll['invoice_id']} - Status: {coll['payment_status']} - Due: ₹{coll['amount_outstanding']:,.2f}")
        
        print("\n✅ Collection seeding completed successfully!")
        
    except Exception as e:
        print(f"❌ Error seeding collections: {str(e)}")
        raise
    
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(seed_collections())
