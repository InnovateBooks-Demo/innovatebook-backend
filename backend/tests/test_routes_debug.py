#!/usr/bin/env python3
"""
Routes Debug Test
Check what routes are available
"""

import asyncio
import aiohttp
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Backend URL from environment
BACKEND_URL = "https://saas-finint.preview.emergentagent.com/api"

async def test_routes():
    """Test various routes to see what's available"""
    
    async with aiohttp.ClientSession() as session:
        # Login demo user first
        login_data = {
            "email": "demo@innovatebooks.com",
            "password": "Demo1234"
        }
        
        async with session.post(
            f"{BACKEND_URL}/enterprise/auth/login",
            json=login_data,
            headers={"Content-Type": "application/json"}
        ) as response:
            if response.status != 200:
                logger.error(f"Login failed: {response.status}")
                return
            
            login_response = await response.json()
            token = login_response.get("access_token")
            
            if not token:
                logger.error("No access token received")
                return
            
            logger.info(f"✅ Login successful")
            
            # Test different customer endpoints
            endpoints_to_test = [
                "/customers",  # Legacy endpoint
                "/finance/customers",  # Enterprise endpoint
            ]
            
            for endpoint in endpoints_to_test:
                logger.info(f"🔍 Testing {endpoint}")
                
                async with session.get(
                    f"{BACKEND_URL}{endpoint}",
                    headers={"Authorization": f"Bearer {token}"}
                ) as test_response:
                    logger.info(f"  Status: {test_response.status}")
                    
                    if test_response.status == 200:
                        data = await test_response.json()
                        if isinstance(data, dict) and "customers" in data:
                            logger.info(f"  ✅ Success - Found {len(data['customers'])} customers")
                        elif isinstance(data, list):
                            logger.info(f"  ✅ Success - Found {len(data)} customers")
                        else:
                            logger.info(f"  ✅ Success - Response: {type(data)}")
                    else:
                        error_text = await test_response.text()
                        logger.error(f"  ❌ Failed: {error_text}")

if __name__ == "__main__":
    asyncio.run(test_routes())