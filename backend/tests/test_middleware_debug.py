#!/usr/bin/env python3
"""
Middleware Debug Test
Test the middleware directly
"""

import asyncio
import aiohttp
import json
import logging
import os
from motor.motor_asyncio import AsyncIOMotorClient

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Backend URL from environment
BACKEND_URL = "https://saas-finint.preview.emergentagent.com/api"

async def test_middleware_directly():
    """Test middleware logic directly"""
    
    # Connect to database
    mongo_url = os.environ.get('MONGO_URL')
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ.get('DB_NAME', 'innovate_books_db')]
    
    # Import the middleware function
    import sys
    sys.path.append('/app/backend')
    
    from enterprise_middleware import check_permission
    
    user_id = "user_demo_legacy"
    module = "customers"
    action = "view"
    
    logger.info(f"🔍 Testing check_permission directly")
    logger.info(f"  user_id: {user_id}")
    logger.info(f"  module: {module}")
    logger.info(f"  action: {action}")
    
    try:
        result = await check_permission(user_id, module, action, db)
        logger.info(f"✅ Permission check result: {result}")
    except Exception as e:
        logger.error(f"❌ Permission check failed: {e}")
        import traceback
        traceback.print_exc()
    
    await client.close()

if __name__ == "__main__":
    asyncio.run(test_middleware_directly())