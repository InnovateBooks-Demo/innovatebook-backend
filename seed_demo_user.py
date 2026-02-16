"""
Create a demo user for testing login/signup system
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime, timezone
import os
import secrets

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# MongoDB connection
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'innovate_books_db')

async def seed_demo_user():
    """Create a demo user with proper authentication setup"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("="*60)
    print("SEEDING DEMO USER FOR AUTHENTICATION TESTING")
    print("="*60)
    
    # Demo user credentials
    demo_email = "demo@innovatebooks.com"
    demo_password = "Demo1234"
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": demo_email})
    if existing_user:
        print(f"❌ User {demo_email} already exists. Deleting...")
        await db.users.delete_one({"email": demo_email})
        # Also delete related data
        await db.tenants.delete_many({"_id": {"$in": [m["tenant_id"] for m in await db.user_tenant_mappings.find({"user_id": existing_user["_id"]}).to_list(None)]}})
        await db.user_tenant_mappings.delete_many({"user_id": existing_user["_id"]})
        await db.user_sessions.delete_many({"user_id": existing_user["_id"]})
    
    # Generate IDs
    user_id = str(secrets.token_urlsafe(16))
    tenant_id = str(secrets.token_urlsafe(16))
    
    # Hash password properly
    password_hash = pwd_context.hash(demo_password)
    
    # Create User
    user_doc = {
        "_id": user_id,
        "email": demo_email,
        "mobile": "9999999999",
        "mobile_country_code": "+91",
        "full_name": "Demo User",
        "password_hash": password_hash,  # Correct field name
        "role": "cfo",
        "status": "active",  # Required
        "email_verified": True,  # Required
        "mobile_verified": True,
        "email_verified_at": datetime.now(timezone.utc),
        "mobile_verified_at": datetime.now(timezone.utc),
        "failed_login_attempts": 0,
        "account_locked_until": None,
        "last_login": None,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
        "google_id": None,
        "microsoft_id": None,
        "apple_id": None
    }
    
    result = await db.users.insert_one(user_doc)
    print(f"✅ User created: {demo_email}")
    print(f"   User ID: {user_id}")
    
    # Create Tenant
    tenant_doc = {
        "_id": tenant_id,
        "company_name": "Demo Company",
        "business_type": "private_limited",
        "industry": "saas_it",
        "company_size": "51_200",
        "country": "IN",
        "website": "https://demo.com",
        "registered_address": "Demo Address",
        "operating_address": "Demo Address",
        "address_same_as_registered": True,
        "timezone": "Asia/Kolkata",
        "language": "en",
        "referral_code": None,
        "solutions_enabled": {
            "commerce": True,
            "workforce": False,
            "capital": True,
            "operations": False,
            "finance": True
        },
        "insights_enabled": True,
        "status": "active",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    await db.tenants.insert_one(tenant_doc)
    print(f"✅ Tenant created: Demo Company")
    print(f"   Tenant ID: {tenant_id}")
    
    # Create User-Tenant Mapping
    mapping_doc = {
        "_id": str(secrets.token_urlsafe(16)),
        "user_id": user_id,
        "tenant_id": tenant_id,
        "role": "owner",
        "permissions": ["*"],  # Full access
        "is_primary": True,
        "status": "active",
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.user_tenant_mappings.insert_one(mapping_doc)
    print(f"✅ User-Tenant mapping created")
    
    print("="*60)
    print("DEMO USER CREATED SUCCESSFULLY!")
    print("="*60)
    print(f"Email: {demo_email}")
    print(f"Password: {demo_password}")
    print("="*60)
    print("You can now login at: http://localhost:3000/auth/login")
    print("="*60)
    
    # Verify the user can be found
    verify_user = await db.users.find_one({"email": demo_email})
    if verify_user:
        print("\n✅ VERIFICATION SUCCESSFUL:")
        print(f"   - Email: {verify_user['email']}")
        print(f"   - Status: {verify_user.get('status')}")
        print(f"   - Email Verified: {verify_user.get('email_verified')}")
        print(f"   - Has Password Hash: {bool(verify_user.get('password_hash'))}")
        
        # Verify tenant mapping
        mapping = await db.user_tenant_mappings.find_one({"user_id": user_id})
        print(f"   - Has Tenant Mapping: {bool(mapping)}")
        if mapping:
            print(f"   - Role: {mapping.get('role')}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_demo_user())
