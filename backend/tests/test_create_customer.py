#!/usr/bin/env python3
"""
Create Customer Test
Test creating a customer via API
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

async def test_create_customer():
    """Test creating a customer"""
    
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
            
            # Try to create a customer
            customer_data = {
                "name": "Test Customer Multi-Tenant",
                "email": "testcustomer@example.com",
                "phone": "+1234567890",
                "contact_person": "Test Contact",
                "credit_limit": 50000.0,
                "payment_terms": "Net 30"
            }
            
            logger.info(f"🔍 Creating customer via /finance/customers")
            
            async with session.post(
                f"{BACKEND_URL}/finance/customers",
                json=customer_data,
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                }
            ) as create_response:
                logger.info(f"  Status: {create_response.status}")
                
                if create_response.status == 200:
                    data = await create_response.json()
                    logger.info(f"  ✅ Customer created successfully")
                    logger.info(f"  Customer ID: {data.get('customer', {}).get('id')}")
                else:
                    error_text = await create_response.text()
                    logger.error(f"  ❌ Failed to create customer: {error_text}")
                    
                    # If creation failed, try to get customers to see if read works
                    logger.info(f"🔍 Trying to get customers via /finance/customers")
                    
                    async with session.get(
                        f"{BACKEND_URL}/finance/customers",
                        headers={"Authorization": f"Bearer {token}"}
                    ) as get_response:
                        logger.info(f"  Get Status: {get_response.status}")
                        
                        if get_response.status == 200:
                            get_data = await get_response.json()
                            customers = get_data.get("customers", [])
                            logger.info(f"  ✅ Get customers successful - Found {len(customers)} customers")
                        else:
                            get_error = await get_response.text()
                            logger.error(f"  ❌ Get customers failed: {get_error}")

if __name__ == "__main__":
    asyncio.run(test_create_customer())
