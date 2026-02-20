#!/usr/bin/env python3
"""
JWT Token Debug Test
Check what's in the JWT token
"""

import asyncio
import aiohttp
import json
import jwt
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Backend URL from environment
BACKEND_URL = "https://saas-finint.preview.emergentagent.com/api"

async def test_jwt_token():
    """Test JWT token contents"""
    
    async with aiohttp.ClientSession() as session:
        # Login demo user
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
            
            logger.info(f"✅ Login successful, token received")
            
            # Decode JWT token (without verification for debugging)
            try:
                decoded = jwt.decode(token, options={"verify_signature": False})
                logger.info("🔍 JWT Token Contents:")
                for key, value in decoded.items():
                    logger.info(f"  {key}: {value}")
                
                # Check required fields
                required_fields = ["user_id", "org_id", "role_id", "subscription_status"]
                for field in required_fields:
                    if field in decoded:
                        logger.info(f"✅ {field}: {decoded[field]}")
                    else:
                        logger.error(f"❌ Missing {field}")
                
            except Exception as e:
                logger.error(f"Failed to decode JWT: {e}")
            
            # Test /me endpoint
            async with session.get(
                f"{BACKEND_URL}/enterprise/auth/me",
                headers={"Authorization": f"Bearer {token}"}
            ) as me_response:
                if me_response.status == 200:
                    me_data = await me_response.json()
                    logger.info("✅ /me endpoint successful")
                    logger.info(f"  User: {me_data.get('user', {}).get('full_name')}")
                    logger.info(f"  Org: {me_data.get('organization', {}).get('org_name')}")
                else:
                    logger.error(f"❌ /me endpoint failed: {me_response.status}")
                    error_text = await me_response.text()
                    logger.error(f"  Error: {error_text}")
            
            # Test customers endpoint
            async with session.get(
                f"{BACKEND_URL}/finance/customers",
                headers={"Authorization": f"Bearer {token}"}
            ) as customers_response:
                if customers_response.status == 200:
                    customers_data = await customers_response.json()
                    logger.info("✅ Customers endpoint successful")
                    logger.info(f"  Found {len(customers_data.get('customers', []))} customers")
                else:
                    logger.error(f"❌ Customers endpoint failed: {customers_response.status}")
                    error_text = await customers_response.text()
                    logger.error(f"  Error: {error_text}")

if __name__ == "__main__":
    asyncio.run(test_jwt_token())
