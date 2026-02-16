"""
Demo Mode Service
Handles demo data creation, management, and removal
"""
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

# Collections that contain demo data
DEMO_DATA_COLLECTIONS = [
    "leads",
    "customers",
    "vendors",
    "invoices",
    "payments",
    "expenses",
    "employees",
    "manufacturing_data",
    "operations_data",
    "capital_data"
]

async def tag_as_demo_record(collection_name: str, record_id: str, org_id: str, db):
    """
    Tag a specific record as demo data
    """
    await db[collection_name].update_one(
        {"id": record_id, "org_id": org_id},
        {"$set": {"is_demo_record": True}}
    )

async def create_demo_data_for_org(org_id: str, db):
    """
    Create sample demo data for new organization
    This runs when org is first created in trial mode
    """
    try:
        logger.info(f"🎨 Creating demo data for org: {org_id}")
        
        # Demo Customers
        demo_customers = [
            {
                "id": f"demo_cust_1_{org_id}",
                "org_id": org_id,
                "name": "Acme Corp",
                "contact_person": "John Doe",
                "email": "john@acmecorp.com",
                "phone": "+1234567890",
                "credit_limit": 100000,
                "payment_terms": "Net 30",
                "outstanding_amount": 25000,
                "status": "Active",
                "is_demo_record": True
            },
            {
                "id": f"demo_cust_2_{org_id}",
                "org_id": org_id,
                "name": "TechStart Inc",
                "contact_person": "Jane Smith",
                "email": "jane@techstart.com",
                "phone": "+1234567891",
                "credit_limit": 50000,
                "payment_terms": "Net 15",
                "outstanding_amount": 15000,
                "status": "Active",
                "is_demo_record": True
            }
        ]
        await db.customers.insert_many(demo_customers)
        
        # Demo Leads
        demo_leads = [
            {
                "id": f"demo_lead_1_{org_id}",
                "org_id": org_id,
                "company_name": "Future Solutions",
                "contact_person": "Mike Johnson",
                "email": "mike@futuresolutions.com",
                "phone": "+1234567892",
                "status": "Qualified",
                "source": "Website",
                "estimated_value": 75000,
                "is_demo_record": True
            }
        ]
        await db.leads.insert_many(demo_leads)
        
        # Demo Invoices
        demo_invoices = [
            {
                "id": f"demo_inv_1_{org_id}",
                "org_id": org_id,
                "invoice_number": "INV-DEMO-001",
                "customer_id": f"demo_cust_1_{org_id}",
                "customer_name": "Acme Corp",
                "base_amount": 20000,
                "gst_amount": 3600,
                "total_amount": 23600,
                "amount_outstanding": 23600,
                "status": "Unpaid",
                "due_date": "2025-02-15",
                "is_demo_record": True
            }
        ]
        await db.invoices.insert_many(demo_invoices)
        
        logger.info(f"✅ Demo data created for org: {org_id}")
        
    except Exception as e:
        logger.error(f"❌ Demo data creation failed: {e}")

async def is_demo_mode(org_id: str, db) -> bool:
    """
    Check if organization is in demo mode
    """
    org = await db.organizations.find_one({"org_id": org_id}, {"_id": 0})
    if not org:
        return False
    return org.get("is_demo", False)

async def remove_demo_data(org_id: str, db):
    """
    Remove all demo data for organization
    Called when subscription becomes active
    """
    try:
        logger.info(f"🧹 Removing demo data for org: {org_id}")
        
        removed_counts = {}
        
        for collection_name in DEMO_DATA_COLLECTIONS:
            result = await db[collection_name].delete_many({
                "org_id": org_id,
                "is_demo_record": True
            })
            removed_counts[collection_name] = result.deleted_count
        
        logger.info(f"✅ Demo data removed: {removed_counts}")
        
    except Exception as e:
        logger.error(f"❌ Demo data removal failed: {e}")

async def block_write_in_trial(org_id: str, subscription_status: str) -> Dict[str, Any]:
    """
    Check if write operations should be blocked
    Returns error response if blocked, None if allowed
    """
    if subscription_status in ["trial", "expired", "cancelled"]:
        return {
            "error": "UPGRADE_REQUIRED",
            "message": f"Your subscription is {subscription_status}. Upgrade to unlock write access.",
            "subscription_status": subscription_status,
            "upgrade_url": "/billing"
        }
    return None
