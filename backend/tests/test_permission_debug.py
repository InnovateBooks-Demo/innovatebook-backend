#!/usr/bin/env python3
"""
Permission Debug Test
Manually check permission logic
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def debug_permission_check():
    """Debug permission checking logic"""
    
    mongo_url = os.environ.get('MONGO_URL')
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ.get('DB_NAME', 'innovate_books_db')]
    
    user_id = "user_demo_legacy"
    module = "customers"
    action = "view"
    
    logger.info(f"🔍 Checking permission for user_id: {user_id}, module: {module}, action: {action}")
    
    # Step 1: Get user's role
    user = await db.enterprise_users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        logger.error("❌ User not found")
        return False
    
    logger.info(f"✅ User found: {user.get('full_name')} ({user.get('email')})")
    logger.info(f"  Role ID: {user.get('role_id')}")
    logger.info(f"  Is Super Admin: {user.get('is_super_admin')}")
    
    # Super admin has all permissions
    if user.get("is_super_admin"):
        logger.info("✅ User is super admin - has all permissions")
        return True
    
    role_id = user.get("role_id")
    if not role_id:
        logger.error("❌ User has no role assigned")
        return False
    
    # Step 2: Find the submodule
    submodule_name = f"{module}.{action}"
    logger.info(f"🔍 Looking for submodule: {submodule_name}")
    
    submodule = await db.submodules.find_one(
        {"submodule_name": submodule_name},
        {"_id": 0}
    )
    if not submodule:
        logger.error(f"❌ Submodule not found: {submodule_name}")
        
        # List all submodules to see what's available
        all_submodules = await db.submodules.find({}, {"_id": 0}).to_list(None)
        logger.info("Available submodules:")
        for sub in all_submodules:
            if "customer" in sub.get("submodule_name", "").lower():
                logger.info(f"  - {sub.get('submodule_name')} ({sub.get('submodule_id')})")
        
        return False
    
    logger.info(f"✅ Submodule found: {submodule.get('submodule_name')} ({submodule.get('submodule_id')})")
    
    # Step 3: Check if role has permission
    logger.info(f"🔍 Checking permission for role: {role_id}, submodule: {submodule['submodule_id']}")
    
    permission = await db.role_permissions.find_one(
        {
            "role_id": role_id,
            "submodule_id": submodule["submodule_id"],
            "granted": True
        },
        {"_id": 0}
    )
    
    if permission:
        logger.info(f"✅ Permission found: {permission}")
        return True
    else:
        logger.error(f"❌ Permission not found")
        
        # Check if permission exists but not granted
        permission_not_granted = await db.role_permissions.find_one(
            {
                "role_id": role_id,
                "submodule_id": submodule["submodule_id"]
            },
            {"_id": 0}
        )
        
        if permission_not_granted:
            logger.error(f"❌ Permission exists but not granted: {permission_not_granted}")
        else:
            logger.error(f"❌ No permission record found at all")
            
            # List all permissions for this role
            all_permissions = await db.role_permissions.find({"role_id": role_id}, {"_id": 0}).to_list(None)
            logger.info(f"All permissions for role {role_id}:")
            for perm in all_permissions:
                logger.info(f"  - {perm.get('submodule_id')} -> {perm.get('granted')}")
        
        return False
    
    await client.close()

if __name__ == "__main__":
    asyncio.run(debug_permission_check())