"""
Seed script for IB Commerce - Procure Module (Module 7)
Generates sample procurement/purchase order data
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

# Procurement statuses (matching RequisitionStatus enum)
REQUISITION_STATUSES = ['Draft', 'In Review', 'Approved', 'PO Created', 'Rejected']
PO_STATUSES = ['Draft', 'Approved', 'Sent', 'Acknowledged', 'Received', 'Closed']
PROCUREMENT_PRIORITIES = ['High', 'Medium', 'Low']
PAYMENT_TERMS = ['Net 30', 'Net 45', 'Net 60', 'COD', 'Advance']

# Sample vendors
VENDORS = [
    {
        'vendor_id': 'VEND-2025-001',
        'vendor_name': 'TechSupply Inc',
        'contact_person': 'John Doe',
        'email': 'john@techsupply.com'
    },
    {
        'vendor_id': 'VEND-2025-002',
        'vendor_name': 'Office Essentials Ltd',
        'contact_person': 'Jane Smith',
        'email': 'jane@officeessentials.com'
    },
    {
        'vendor_id': 'VEND-2025-003',
        'vendor_name': 'Industrial Parts Co',
        'contact_person': 'Mike Johnson',
        'email': 'mike@industrialparts.com'
    },
]

# Sample line items
SAMPLE_ITEMS = [
    {
        'item_code': 'ITEM-HW-001',
        'item_description': 'Dell Latitude Laptops',
        'quantity': 10,
        'unit_price': 65000,
        'total_price': 650000,
        'hsn_code': '847130'
    },
    {
        'item_code': 'ITEM-SW-001',
        'item_description': 'Microsoft Office Licenses',
        'quantity': 50,
        'unit_price': 8000,
        'total_price': 400000,
        'hsn_code': '998313'
    },
    {
        'item_code': 'ITEM-OFF-001',
        'item_description': 'Office Furniture Set',
        'quantity': 5,
        'unit_price': 45000,
        'total_price': 225000,
        'hsn_code': '940330'
    },
]


async def seed_procurements():
    """Seed sample procurements into commerce_procure collection"""
    
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    try:
        # Clear existing procurements
        await db.commerce_procure.delete_many({})
        print("✅ Cleared existing procurements")
        
        procurements = []
        
        # Create 5 sample procurements
        for i in range(1, 6):
            vendor = random.choice(VENDORS)
            requisition_status = random.choice(REQUISITION_STATUSES)
            po_status_value = random.choice(PO_STATUSES) if requisition_status == 'PO Created' else 'Draft'
            priority = random.choice(PROCUREMENT_PRIORITIES)
            
            # Generate dates
            requisition_date = datetime.now(timezone.utc) - timedelta(days=random.randint(10, 60))
            required_by_date = requisition_date + timedelta(days=random.randint(15, 45))
            
            # Set dates based on status
            approved_date = None
            order_date = None
            expected_delivery_date = None
            actual_delivery_date = None
            
            if requisition_status in ['Approved', 'PO Created']:
                approved_date = requisition_date + timedelta(days=random.randint(1, 5))
            
            if requisition_status == 'PO Created':
                order_date = approved_date + timedelta(days=random.randint(1, 3))
                expected_delivery_date = order_date + timedelta(days=random.randint(7, 21))
            
            # Select random items
            num_items = random.randint(1, 3)
            selected_items = random.sample(SAMPLE_ITEMS, num_items)
            
            # Calculate amounts
            procurement_amount = sum(item['total_price'] for item in selected_items)
            tax_amount = procurement_amount * 0.18  # 18% GST
            total_amount = procurement_amount + tax_amount
            
            procurement_data = {
                'id': f'procure-uuid-{i}',
                'requisition_id': f'REQ-2025-{str(i).zfill(3)}',
                'requested_by': f'USER-{random.randint(1, 10)}',
                'request_date': requisition_date.date().isoformat(),
                'requisition_status': requisition_status,
                'purpose': f'Business requirement for {selected_items[0]["item_description"].split()[0]} procurement',
                'category': random.choice(['CapEx', 'OpEx', 'Services', 'Consumables']),
                'cost_center': random.choice(['CC-IT-001', 'CC-OPS-002', 'CC-ADM-003', 'CC-SAL-004']),
                'estimated_value': procurement_amount,
                'currency': 'INR',
                'budget_code': f'BUD-2025-{str(i).zfill(3)}',
                
                # Vendor Details
                'vendor_id': vendor['vendor_id'],
                'vendor_name': vendor['vendor_name'],
                'vendor_category': random.choice(['Approved', 'Preferred', 'New']),
                'vendor_rating': random.uniform(3.5, 5.0),
                'compliance_status': 'Pass' if requisition_status in ['Approved', 'PO Created'] else 'Pending',
                'vendor_gstin': f'GSTIN-{random.randint(10, 99)}ABCDE1234F1Z5',
                'contact_person': vendor['contact_person'],
                'payment_terms': random.choice(PAYMENT_TERMS),
                
                # Budget & Financial Control
                'budget_available': procurement_amount * 1.5,
                'budget_locked': procurement_amount if requisition_status in ['Approved', 'PO Created'] else 0,
                'threshold_exceeded': False,
                'approval_required_level': 'L1' if procurement_amount < 500000 else 'L2',
                'approved_value': procurement_amount if requisition_status in ['Approved', 'PO Created'] else 0,
                
                # Purchase Order Data
                'po_id': f'PO-2025-{str(i).zfill(3)}' if requisition_status == 'PO Created' else None,
                'po_date': order_date.date().isoformat() if order_date else None,
                'po_value': total_amount if requisition_status == 'PO Created' else 0,
                'po_status': po_status_value,
                'delivery_schedule': {'expected_date': expected_delivery_date.date().isoformat() if expected_delivery_date else None} if requisition_status == 'PO Created' else {},
                'po_document': f'PO-DOC-{i}.pdf' if requisition_status == 'PO Created' else None,
                'vendor_acknowledgment': 'Acknowledged' if requisition_status == 'PO Created' else 'Pending',
                
                # Timestamps
                'created_at': datetime.now(timezone.utc).isoformat(),
                'updated_at': datetime.now(timezone.utc).isoformat()
            }
            
            procurements.append(procurement_data)
        
        # Insert procurements
        if procurements:
            result = await db.commerce_procure.insert_many(procurements)
            print(f"✅ Successfully seeded {len(result.inserted_ids)} procurements")
            
            # Print summary
            print("\n📊 Procurement Summary:")
            for proc in procurements:
                status_emoji = "✅" if proc['requisition_status'] == 'Received' else "🔄" if proc['requisition_status'] in ['Ordered', 'Approved'] else "📋" if proc['requisition_status'] == 'Requested' else "⚠️" if proc['requisition_status'] == 'Cancelled' else "📝"
                print(f"  {status_emoji} {proc['requisition_id']} - {proc['vendor_name']} - Status: {proc['requisition_status']} - Amount: ₹{proc['po_value']:,.2f}")
        
        print("\n✅ Procurement seeding completed successfully!")
        
    except Exception as e:
        print(f"❌ Error seeding procurements: {str(e)}")
        raise
    
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(seed_procurements())
