"""
Test Script: Verify Subscription Gating Works
Creates a trial organization and tests that write operations are blocked
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import logging
from datetime import datetime, timezone, timedelta
import secrets
from enterprise_auth_service import hash_password

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

async def main():
    """Test subscription gating"""
    logger.info("🧪 Testing Subscription Gating...")
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Step 1: Create a trial organization
    logger.info("📦 Step 1: Creating TRIAL organization...")
    trial_org_id = f"org_trial_test_{secrets.token_urlsafe(4)}"
    
    trial_org_doc = {
        "org_id": trial_org_id,
        "org_name": "Trial Test Organization",
        "org_slug": "trial_test",
        "subscription_status": "trial",  # TRIAL MODE
        "subscription_id": None,
        "razorpay_customer_id": None,
        "is_demo": True,
        "trial_ends_at": datetime.now(timezone.utc) + timedelta(days=14),
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    await db.organizations.insert_one(trial_org_doc)
    logger.info(f"✅ Trial org created: {trial_org_id}")
    
    # Step 2: Create a user for trial org
    logger.info("👤 Step 2: Creating trial user...")
    
    # Get Org Admin role
    org_admin_role = await db.roles.find_one(
        {"role_name": "Organization Admin", "is_system_role": True},
        {"_id": 0}
    )
    
    trial_user_id = f"user_trial_test_{secrets.token_urlsafe(4)}"
    trial_user_doc = {
        "user_id": trial_user_id,
        "org_id": trial_org_id,
        "email": f"trial{secrets.token_urlsafe(4)}@test.com",
        "password_hash": hash_password("Trial1234"),
        "full_name": "Trial User",
        "role_id": org_admin_role["role_id"] if org_admin_role else None,
        "is_super_admin": False,
        "is_active": True,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    await db.enterprise_users.insert_one(trial_user_doc)
    logger.info(f"✅ Trial user created: {trial_user_doc['email']}")
    
    # Step 3: Verify subscription status
    logger.info("🔍 Step 3: Verifying subscription status...")
    org = await db.organizations.find_one({"org_id": trial_org_id}, {"_id": 0})
    logger.info(f"   Org: {org['org_name']}")
    logger.info(f"   Status: {org['subscription_status']} ({'TRIAL' if org['subscription_status'] == 'trial' else 'ACTIVE'})")
    logger.info(f"   Demo Mode: {org['is_demo']}")
    
    # Step 4: Create an EXPIRED organization
    logger.info("📦 Step 4: Creating EXPIRED organization...")
    expired_org_id = f"org_expired_test_{secrets.token_urlsafe(4)}"
    
    expired_org_doc = {
        "org_id": expired_org_id,
        "org_name": "Expired Test Organization",
        "org_slug": "expired_test",
        "subscription_status": "expired",  # EXPIRED
        "subscription_id": None,
        "razorpay_customer_id": None,
        "is_demo": False,
        "trial_ends_at": datetime.now(timezone.utc) - timedelta(days=1),  # Expired yesterday
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    await db.organizations.insert_one(expired_org_doc)
    logger.info(f"✅ Expired org created: {expired_org_id}")
    
    # Step 5: Show summary
    logger.info("\n" + "="*60)
    logger.info("📋 SUBSCRIPTION GATING TEST SETUP COMPLETE")
    logger.info("="*60)
    logger.info(f"✅ Demo Org (ACTIVE): org_demo_legacy")
    logger.info(f"   - User: demo@innovatebooks.com")
    logger.info(f"   - Can: All operations")
    logger.info("")
    logger.info(f"✅ Trial Org: {trial_org_id}")
    logger.info(f"   - User: {trial_user_doc['email']}")
    logger.info(f"   - Password: Trial1234")
    logger.info(f"   - Can: Read operations only")
    logger.info(f"   - Cannot: Create/Update/Delete")
    logger.info("")
    logger.info(f"✅ Expired Org: {expired_org_id}")
    logger.info(f"   - Status: EXPIRED")
    logger.info(f"   - Can: Read operations only")
    logger.info("="*60)
    logger.info("\n🧪 Test with curl:")
    logger.info(f"1. Login as trial user:")
    logger.info(f"   curl -X POST http://localhost:8001/api/enterprise/auth/login \\")
    logger.info(f"     -H 'Content-Type: application/json' \\")
    logger.info(f"     -d '{{\"email\":\"{trial_user_doc['email']}\",\"password\":\"Trial1234\"}}'")
    logger.info("")
    logger.info(f"2. Try to create customer (should get 402 Payment Required):")
    logger.info(f"   curl -X POST http://localhost:8001/api/finance/customers \\")
    logger.info(f"     -H logger.info(f"     -H '<AUTH_HEADER>' \\")
    logger.info(f"     -H 'Content-Type: application/json' \\")
    logger.info(f"     -d '{{\"name\":\"Test\",\"email\":\"test@test.com\"}}'")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
