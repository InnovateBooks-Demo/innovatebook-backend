"""
Seed sample Commit data for IB Commerce module
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone, date, timedelta
import uuid
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Sample commit data - Updated to match current Commit model
sample_commits = [
    {
        "id": str(uuid.uuid4()),
        "commit_id": "COMM-2025-001",
        "contract_number": "CONT-2025-001",
        "evaluation_id": "EVAL-2025-002",
        "customer_id": "CUST-001",
        "commit_type": "Customer Contract",
        "commit_status": "Draft",
        "sop_version": "v1.0",
        "created_by": "demo_user",
        "created_on": datetime.now(timezone.utc).isoformat(),
        "contract_title": "GMC Supply Chain Platform License Agreement",
        "effective_date": (date.today() + timedelta(days=30)).isoformat(),
        "expiry_date": (date.today() + timedelta(days=30+730)).isoformat(),
        "contract_value": 25000000.0,
        "currency": "INR",
        "governing_law": "India",
        "signature_method": "Digital",
        "payment_terms": "Net 45",
        "billing_cycle": "Quarterly",
        "price_basis": "Fixed",
        "discount_percent": 0.0,
        "tax_treatment": "GST",
        "retention_percent": 0.0,
        "advance_percent": 0.0,
        "penalty_clause_ids": [],
        "clauses": [],
        "approval_path": [],
        "approvers_list": [],
        "approval_status": "Pending",
        "risk_score": 0.0,
        "control_checklist": {},
        "deviation_flag": False,
        "audit_ready": False,
        "order_value": 0.0,
        "delivery_schedule": {},
        "version_number": 1,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "commit_id": "COMM-2025-002",
        "contract_number": "CONT-2025-002",
        "evaluation_id": "EVAL-2025-003",
        "customer_id": "CUST-002",
        "commit_type": "Customer Contract",
        "commit_status": "Under Review",
        "sop_version": "v1.0",
        "created_by": "demo_user",
        "created_on": datetime.now(timezone.utc).isoformat(),
        "contract_title": "HC Plus Hospital Management System Agreement",
        "effective_date": (date.today() + timedelta(days=60)).isoformat(),
        "expiry_date": (date.today() + timedelta(days=60+365)).isoformat(),
        "contract_value": 4500000.0,
        "currency": "INR",
        "governing_law": "India",
        "signature_method": "Digital",
        "payment_terms": "Net 30",
        "billing_cycle": "Monthly",
        "price_basis": "Fixed",
        "discount_percent": 0.0,
        "tax_treatment": "GST",
        "retention_percent": 0.0,
        "advance_percent": 0.0,
        "penalty_clause_ids": [],
        "clauses": [],
        "approval_path": [],
        "approvers_list": [],
        "approval_status": "Pending",
        "risk_score": 0.0,
        "control_checklist": {},
        "deviation_flag": False,
        "audit_ready": False,
        "order_value": 0.0,
        "delivery_schedule": {},
        "version_number": 1,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "commit_id": "COMM-2025-003",
        "contract_number": "CONT-2025-003",
        "evaluation_id": "EVAL-2025-004",
        "customer_id": "CUST-003",
        "commit_type": "Customer Contract",
        "commit_status": "Approved",
        "sop_version": "v1.0",
        "created_by": "demo_user",
        "created_on": datetime.now(timezone.utc).isoformat(),
        "contract_title": "Retail King Omnichannel Platform Master Agreement",
        "effective_date": (date.today() + timedelta(days=15)).isoformat(),
        "expiry_date": (date.today() + timedelta(days=15+547)).isoformat(),
        "contract_value": 12000000.0,
        "currency": "INR",
        "governing_law": "India",
        "signature_method": "Digital",
        "payment_terms": "Net 30",
        "billing_cycle": "Monthly",
        "price_basis": "Fixed",
        "discount_percent": 0.0,
        "tax_treatment": "GST",
        "retention_percent": 0.0,
        "advance_percent": 0.0,
        "penalty_clause_ids": [],
        "clauses": [],
        "approval_path": [],
        "approvers_list": [],
        "approval_status": "Pending",
        "risk_score": 0.0,
        "control_checklist": {},
        "deviation_flag": False,
        "audit_ready": False,
        "order_value": 0.0,
        "delivery_schedule": {},
        "version_number": 1,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "commit_id": "COMM-2025-004",
        "contract_number": "CONT-2025-004",
        "evaluation_id": "EVAL-2025-001",
        "customer_id": "CUST-004",
        "commit_type": "Customer Contract",
        "commit_status": "Executed",
        "sop_version": "v1.0",
        "created_by": "demo_user",
        "created_on": datetime.now(timezone.utc).isoformat(),
        "contract_title": "TechVision Enterprise Software License Agreement",
        "effective_date": date.today().isoformat(),
        "expiry_date": (date.today() + timedelta(days=365)).isoformat(),
        "contract_value": 8000000.0,
        "currency": "INR",
        "governing_law": "India",
        "signature_method": "Digital",
        "payment_terms": "Net 30",
        "billing_cycle": "Monthly",
        "price_basis": "Fixed",
        "discount_percent": 0.0,
        "tax_treatment": "GST",
        "retention_percent": 0.0,
        "advance_percent": 0.0,
        "penalty_clause_ids": [],
        "clauses": [],
        "approval_path": [],
        "approvers_list": [],
        "approval_status": "Pending",
        "risk_score": 0.0,
        "control_checklist": {},
        "deviation_flag": False,
        "audit_ready": False,
        "order_value": 0.0,
        "delivery_schedule": {},
        "version_number": 1,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
]

async def seed_commits():
    try:
        # Clear existing commits
        result = await db.commerce_commit.delete_many({})
        print(f"Cleared {result.deleted_count} existing commitments")
        
        # Insert sample commits
        result = await db.commerce_commit.insert_many(sample_commits)
        print(f"✅ Successfully seeded {len(result.inserted_ids)} sample commitments")
        
        # Verify
        count = await db.commerce_commit.count_documents({})
        print(f"Total commitments in database: {count}")
        
        # Show summary
        print("\nSeeded Commitments Summary:")
        for commit in sample_commits:
            print(f"  - {commit['commit_id']}: {commit['contract_title']} ({commit['commit_status']}) - ₹{commit['contract_value']/100000}L")
        
    except Exception as e:
        print(f"❌ Error seeding commitments: {str(e)}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(seed_commits())
