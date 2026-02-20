#!/usr/bin/env python3
"""
Middleware Database Test
Test using the same database connection as middleware
"""

import asyncio
import logging
import os
from motor.motor_asyncio import AsyncIOMotorClient

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_middleware_db():
    """Test using the same database connection as middleware"""
    
    # Use the exact same connection as enterprise_middleware.py
    mongo_url = os.environ.get('MONGO_URL')
    client = AsyncIOMotorClient(mongo_url)
    db_instance = client[os.environ.get('DB_NAME', 'innovate_books_db')]
    
    logger.info(f"🔍 Testing with middleware database connection")
    logger.info(f"  MONGO_URL: {mongo_url}")
    logger.info(f"  DB_NAME: {os.environ.get('DB_NAME', 'innovate_books_db')}")
    
    # Test basic database connectivity
    try:
        # Test if we can access collections
        user_count = await db_instance.enterprise_users.count_documents({})
        logger.info(f"✅ Database connection working - {user_count} enterprise users")
        
        submodule_count = await db_instance.submodules.count_documents({})
        logger.info(f"✅ Database connection working - {submodule_count} submodules")
        
        permission_count = await db_instance.role_permissions.count_documents({})
        logger.info(f"✅ Database connection working - {permission_count} role permissions")
        
    except Exception as e:
        logger.error(f"❌ Database connection failed: {e}")
        return False
    
    # Now test the permission check logic manually
    user_id = "user_demo_legacy"
    module = "customers"
    action = "view"
    
    logger.info(f"🔍 Manual permission check")
    logger.info(f"  user_id: {user_id}")
    logger.info(f"  module: {module}")
    logger.info(f"  action: {action}")
    
    try:
        # Step 1: Get user's role
        user = await db_instance.enterprise_users.find_one({"user_id": user_id}, {"_id": 0})
        if not user:
            logger.error("❌ User not found")
            return False
        
        logger.info(f"✅ User found: {user.get('full_name')}")
        logger.info(f"  Role ID: {user.get('role_id')}")
        
        # Super admin has all permissions
        if user.get("is_super_admin"):
            logger.info("✅ User is super admin")
            return True
        
        role_id = user.get("role_id")
        if not role_id:
            logger.error("❌ User has no role")
            return False
        
        # Step 2: Find the submodule
        submodule_name = f"{module}.{action}"
        logger.info(f"🔍 Looking for submodule: {submodule_name}")
        
        submodule = await db_instance.submodules.find_one(
            {"submodule_name": submodule_name},
            {"_id": 0}
        )
        if not submodule:
            logger.error(f"❌ Submodule not found: {submodule_name}")
            return False
        
        logger.info(f"✅ Submodule found: {submodule.get('submodule_id')}")
        
        # Step 3: Check if role has permission
        permission = await db_instance.role_permissions.find_one(
            {
                "role_id": role_id,
                "submodule_id": submodule["submodule_id"],
                "granted": True
            },
            {"_id": 0}
        )
        
        if permission:
            logger.info(f"✅ Permission granted: {permission.get('permission_id')}")
            return True
        else:
            logger.error(f"❌ Permission denied")
            return False
            
    except Exception as e:
        logger.error(f"❌ Permission check error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    result = asyncio.run(test_middleware_db())
    print(f"\nFinal result: {'✅ PASS' if result else '❌ FAIL'}")
