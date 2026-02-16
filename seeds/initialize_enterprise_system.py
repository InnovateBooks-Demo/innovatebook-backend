"""
Enterprise System Initialization Script
Run this once to set up:
- Modules and submodules
- System roles
- Super admin user
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import logging
from datetime import datetime, timezone

from rbac_engine import initialize_modules_and_permissions, create_system_roles
from enterprise_auth_service import hash_password

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

async def main():
    """Initialize enterprise system"""
    logger.info("🚀 Starting enterprise system initialization...")
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # 1. Initialize modules and submodules
    logger.info("📦 Step 1: Initializing modules and submodules...")
    await initialize_modules_and_permissions(db)
    
    # 2. Create system roles
    logger.info("👥 Step 2: Creating system roles...")
    await create_system_roles(db)
    
    # 3. Create Super Admin user
    logger.info("🔐 Step 3: Creating super admin user...")
    super_admin_email = "superadmin@innovatebooks.com"
    import os

    super_admin_password = os.environ.get("SUPER_ADMIN_PASSWORD")
    if not super_admin_password:
        raise RuntimeError("SUPER_ADMIN_PASSWORD is required for initialization")
  # Change in production
    
    existing_super_admin = await db.enterprise_users.find_one(
        {"email": super_admin_email},
        {"_id": 0}
    )
    
    if not existing_super_admin:
        super_admin_doc = {
            "user_id": "user_super_admin",
            "org_id": None,
            "email": super_admin_email,
            "password_hash": hash_password(super_admin_password),
            "full_name": "Super Administrator",
            "role_id": None,
            "is_super_admin": True,
            "is_active": True,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        await db.enterprise_users.insert_one(super_admin_doc)
        logger.info(f"✅ Super admin created: {super_admin_email}")
        logger.info(f"🔑 Password: {super_admin_password}")
    else:
        logger.info("✅ Super admin already exists")
    
    # 4. Assign all permissions to Org Admin role
    logger.info("🔐 Step 4: Assigning permissions to Org Admin role...")
    org_admin_role = await db.roles.find_one(
        {"role_name": "Organization Admin", "is_system_role": True},
        {"_id": 0}
    )
    
    if org_admin_role:
        # Get all submodules
        all_submodules = await db.submodules.find({}, {"_id": 0}).to_list(None)
        submodule_ids = [s["submodule_id"] for s in all_submodules]
        
        # Remove existing permissions
        await db.role_permissions.delete_many({"role_id": org_admin_role["role_id"]})
        
        # Assign all permissions
        for submodule_id in submodule_ids:
            permission_doc = {
                "permission_id": f"perm_org_admin_{submodule_id}",
                "role_id": org_admin_role["role_id"],
                "submodule_id": submodule_id,
                "granted": True,
                "created_at": datetime.now(timezone.utc)
            }
            await db.role_permissions.insert_one(permission_doc)
        
        logger.info(f"✅ Assigned {len(submodule_ids)} permissions to Org Admin role")
    
    logger.info("🎉 Enterprise system initialization complete!")
    logger.info("\n" + "="*60)
    logger.info("📋 SUMMARY:")
    logger.info(f"   Super Admin Email: {super_admin_email}")
    logger.info(f"   Super Admin Password: {super_admin_password}")
    logger.info(f"   Login URL: /api/enterprise/auth/login")
    logger.info("="*60)
    
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
