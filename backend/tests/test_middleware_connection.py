#!/usr/bin/env python3
"""
Test middleware database connection
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

async def test_simple_endpoint():
    """Test a simple endpoint to see if middleware works"""
    
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
                text = await response.text()
                logger.error(f"Error: {text}")
                return
            
            login_response = await response.json()
            token = login_response.get("access_token")
            
            if not token:
                logger.error("No access token received")
                return
            
            logger.info(f"✅ Login successful")
            
            # Test /me endpoint (should work)
            async with session.get(
                f"{BACKEND_URL}/enterprise/auth/me",
                headers={"Authorization": f"Bearer {token}"}
            ) as me_response:
                logger.info(f"/me status: {me_response.status}")
                if me_response.status == 200:
                    me_data = await me_response.json()
                    logger.info(f"✅ /me working - User: {me_data.get('user', {}).get('full_name')}")
                else:
                    error_text = await me_response.text()
                    logger.error(f"❌ /me failed: {error_text}")
            
            # Test customers endpoint (currently failing)
            async with session.get(
                f"{BACKEND_URL}/finance/customers",
                headers={"Authorization": f"Bearer {token}"}
            ) as customers_response:
                logger.info(f"/finance/customers status: {customers_response.status}")
                if customers_response.status == 200:
                    customers_data = await customers_response.json()
                    logger.info(f"✅ Customers working - Found {len(customers_data.get('customers', []))} customers")
                else:
                    error_text = await customers_response.text()
                    logger.error(f"❌ Customers failed: {error_text}")

if __name__ == "__main__":
    asyncio.run(test_simple_endpoint())
