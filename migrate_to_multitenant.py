"""
Migration Script: Add org_id to existing data
Creates a default demo organization and assigns all existing data to it
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import logging
from datetime import datetime, timezone

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

# Collections that need org_id
COLLECTIONS_TO_MIGRATE = [
    "customers",
    "vendors",
    "invoices",
    "bills",
    "payments",
    "expenses",
    "leads",
    "employees",
    "bank_accounts",
    "journal_entries",
    "cash_flow",
    "budgets",
    "manufacturing_data",
    "operations_data",
    "capital_data",
    "products",
    "services",
    "projects",
    "contracts",
    "quotes",
    "purchase_orders",
    "sales_orders",
    "inventory",
    "assets"
]

DEMO_ORG_ID = "org_demo_legacy"
DEMO_ORG_NAME = "Legacy Demo Organization"

async def main():
    """Run migration"""
    logger.info("🔄 Starting multi-tenant migration...")
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Step 1: Create demo organization
    logger.info("📦 Step 1: Creating demo organization...")
    existing_org = await db.organizations.find_one({"org_id": DEMO_ORG_ID}, {"_id": 0})
    
    if not existing_org:
        org_doc = {
            "org_id": DEMO_ORG_ID,
            "org_name": DEMO_ORG_NAME,
            "org_slug": "legacy_demo",
            "subscription_status": "active",  # Give demo org active status
            "subscription_id": None,
            "razorpay_customer_id": None,
            "is_demo": True,
            "trial_ends_at": None,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        await db.organizations.insert_one(org_doc)
        logger.info(f"✅ Demo organization created: {DEMO_ORG_ID}")
    else:
        logger.info("✅ Demo organization already exists")
    
    # Step 2: Migrate existing user to demo org
    logger.info("👤 Step 2: Migrating existing users...")
    
    # Check if old demo user exists
    old_user = await db.users.find_one({"email": "demo@innovatebooks.com"}, {"_id": 0})
    
    if old_user:
        # Create enterprise user from old user
        existing_enterprise_user = await db.enterprise_users.find_one(
            {"email": "demo@innovatebooks.com"},
            {"_id": 0}
        )
        
        if not existing_enterprise_user:
            # Get Org Admin role
            org_admin_role = await db.roles.find_one(
                {"role_name": "Organization Admin", "is_system_role": True},
                {"_id": 0}
            )
            
            enterprise_user_doc = {
                "user_id": old_user.get("id", "user_demo_legacy"),
                "org_id": DEMO_ORG_ID,
                "email": old_user["email"],
                "password_hash": old_user.get("password_hash", old_user.get("password", "")),
                "full_name": old_user.get("full_name", "Demo User"),
                "role_id": org_admin_role["role_id"] if org_admin_role else None,
                "is_super_admin": False,
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }
            await db.enterprise_users.insert_one(enterprise_user_doc)
            logger.info(f"✅ Migrated user: {old_user['email']}")
    
    # Step 3: Add org_id to all collections
    logger.info("🔄 Step 3: Adding org_id to existing data...")
    
    for collection_name in COLLECTIONS_TO_MIGRATE:
        try:
            # Check if collection exists
            collection_list = await db.list_collection_names()
            if collection_name not in collection_list:
                logger.info(f"⏭️  Skipping {collection_name} (doesn't exist)")
                continue
            
            # Count documents without org_id
            count = await db[collection_name].count_documents({"org_id": {"$exists": False}})
            
            if count == 0:
                logger.info(f"✅ {collection_name}: Already migrated")
                continue
            
            # Add org_id to all documents
            result = await db[collection_name].update_many(
                {"org_id": {"$exists": False}},
                {"$set": {"org_id": DEMO_ORG_ID}}
            )
            
            logger.info(f"✅ {collection_name}: Updated {result.modified_count} documents")
            
        except Exception as e:
            logger.error(f"❌ Error migrating {collection_name}: {e}")
    
    # Step 4: Create indexes for org_id
    logger.info("🔍 Step 4: Creating indexes for org_id...")
    
    for collection_name in COLLECTIONS_TO_MIGRATE:
        try:
            if collection_name in await db.list_collection_names():
                await db[collection_name].create_index("org_id")
                logger.info(f"✅ Created index on {collection_name}.org_id")
        except Exception as e:
            logger.warning(f"⚠️  Index creation warning for {collection_name}: {e}")
    
    logger.info("🎉 Multi-tenant migration complete!")
    logger.info("\n" + "="*60)
    logger.info("📋 MIGRATION SUMMARY:")
    logger.info(f"   Demo Org ID: {DEMO_ORG_ID}")
    logger.info(f"   Demo Org Name: {DEMO_ORG_NAME}")
    logger.info(f"   All existing data assigned to demo org")
    logger.info(f"   Collections migrated: {len(COLLECTIONS_TO_MIGRATE)}")
    logger.info("="*60)
    
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
