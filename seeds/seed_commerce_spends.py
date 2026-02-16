"""
Seed script for IB Commerce - Spend Module (Module 9)
Generates sample expense/spend data
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

# Expense statuses and types
EXPENSE_STATUSES = ['Draft', 'Submitted', 'Approved', 'Reimbursed', 'Rejected']
EXPENSE_TYPES = ['Travel', 'Food', 'Accommodation', 'Office Supplies', 'Software', 'Training']
EXPENSE_CATEGORIES = ['CapEx', 'OpEx', 'Recurring', 'One-time']

# Sample employees
EMPLOYEES = [
    {'id': 'EMP-001', 'name': 'John Smith', 'department': 'Sales'},
    {'id': 'EMP-002', 'name': 'Jane Doe', 'department': 'IT'},
    {'id': 'EMP-003', 'name': 'Mike Johnson', 'department': 'Operations'},
]


async def seed_spends():
    """Seed sample spends into commerce_spend collection"""
    
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    try:
        # Clear existing spends
        await db.commerce_spend.delete_many({})
        print("✅ Cleared existing spends")
        
        spends = []
        
        # Create 5 sample spends
        for i in range(1, 6):
            employee = random.choice(EMPLOYEES)
            expense_status = random.choice(EXPENSE_STATUSES)
            expense_type = random.choice(EXPENSE_TYPES)
            expense_category = random.choice(EXPENSE_CATEGORIES)
            
            # Generate dates
            expense_date = date.today() - timedelta(days=random.randint(5, 30))
            submission_date = None
            approval_date = None
            reimbursement_date = None
            
            if expense_status in ['Submitted', 'Approved', 'Reimbursed']:
                submission_date = expense_date + timedelta(days=random.randint(1, 3))
            
            if expense_status in ['Approved', 'Reimbursed']:
                approval_date = submission_date + timedelta(days=random.randint(1, 5))
            
            if expense_status == 'Reimbursed':
                reimbursement_date = approval_date + timedelta(days=random.randint(1, 7))
            
            # Calculate amounts
            expense_amount = random.randint(5000, 50000)
            tax_amount = expense_amount * 0.18
            net_expense = expense_amount + tax_amount
            
            spend_data = {
                'id': f'spend-uuid-{i}',
                'expense_id': f'EXP-2025-{str(i).zfill(3)}',
                'employee_id': employee['id'],
                'reported_by': employee['id'],
                'expense_status': expense_status,
                'expense_type': expense_type,
                'expense_category': expense_category,
                'expense_date': expense_date.isoformat(),
                'expense_amount': expense_amount,
                'currency': 'INR',
                'description': f'{expense_type} expense for business purpose',
                'category_code': f'CAT-{expense_type[:3].upper()}-001',
                'cost_center': f'CC-{employee["department"].upper()}-001',
                
                # Submission & Approval
                'submission_date': submission_date.isoformat() if submission_date else None,
                'approval_required': True,
                'approver_id': 'MGR-001' if expense_status in ['Approved', 'Reimbursed'] else None,
                'approval_date': approval_date.isoformat() if approval_date else None,
                'approval_remarks': 'Approved as per policy' if expense_status in ['Approved', 'Reimbursed'] else None,
                'rejection_reason': 'Not compliant with policy' if expense_status == 'Rejected' else None,
                
                # Financial Details
                'tax_amount': tax_amount,
                'net_expense': net_expense,
                'reimbursement_method': 'Bank Transfer' if expense_status == 'Reimbursed' else None,
                'reimbursement_date': reimbursement_date.isoformat() if reimbursement_date else None,
                'reimbursement_ref_no': f'REF-{random.randint(100000, 999999)}' if expense_status == 'Reimbursed' else None,
                
                # Compliance & Audit
                'policy_id': 'POL-EXP-001',
                'compliance_status': 'Pass' if expense_status != 'Rejected' else 'Fail',
                'audit_trail': [
                    {'action': 'Created', 'by': employee['id'], 'timestamp': expense_date.isoformat()}
                ],
                
                # Project/Cost Center Mapping
                'project_id': f'PROJ-2025-{random.randint(1, 5)}',
                'cost_center': f'CC-{employee["department"].upper()}-001',
                'department': employee['department'],
                
                # Timestamps
                'created_at': datetime.now(timezone.utc).isoformat(),
                'updated_at': datetime.now(timezone.utc).isoformat()
            }
            
            spends.append(spend_data)
        
        # Insert spends
        if spends:
            result = await db.commerce_spend.insert_many(spends)
            print(f"✅ Successfully seeded {len(result.inserted_ids)} spends")
            
            # Print summary
            print("\n📊 Spend Summary:")
            for spend in spends:
                status_emoji = "✅" if spend['expense_status'] == 'Reimbursed' else "🔄" if spend['expense_status'] in ['Approved', 'Submitted'] else "📋" if spend['expense_status'] == 'Draft' else "❌"
                print(f"  {status_emoji} {spend['expense_id']} - {spend['expense_type']} - Status: {spend['expense_status']} - Amount: ₹{spend['net_expense']:,.2f}")
        
        print("\n✅ Spend seeding completed successfully!")
        
    except Exception as e:
        print(f"❌ Error seeding spends: {str(e)}")
        raise
    
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(seed_spends())
