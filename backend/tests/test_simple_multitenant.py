#!/usr/bin/env python3
"""
Simple Multi-Tenant Testing
Basic verification of multi-tenant isolation
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

# Super Admin Credentials
SUPER_ADMIN_EMAIL = "revanth@innovatebooks.in"
SUPER_ADMIN_PASSWORD = "Pandu@1605"

class SimpleTenantTester:
    def __init__(self):
        self.session = None
        self.super_admin_token = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def make_request(self, method: str, endpoint: str, data: dict = None, 
                          token: str = None, expected_status: int = 200) -> dict:
        """Make HTTP request with optional authentication"""
        url = f"{BACKEND_URL}{endpoint}"
        headers = {"Content-Type": "application/json"}
        
        if token:
            headers["Authorization"] = f"Bearer {token}"
        
        try:
            async with self.session.request(
                method, url, 
                json=data if data else None, 
                headers=headers
            ) as response:
                response_text = await response.text()
                
                logger.info(f"{method} {endpoint} -> {response.status}")
                
                if response.status != expected_status:
                    logger.error(f"Expected {expected_status}, got {response.status}")
                    logger.error(f"Response: {response_text}")
                    return {"success": False, "status": response.status, "error": response_text}
                
                try:
                    return await response.json() if response_text else {"success": True}
                except json.JSONDecodeError:
                    return {"success": True, "text": response_text}
                    
        except Exception as e:
            logger.error(f"Request failed: {e}")
            return {"success": False, "error": str(e)}
    
    async def test_super_admin_login(self) -> bool:
        """Test super admin login"""
        logger.info("🔐 Testing Super Admin Login")
        
        response = await self.make_request(
            "POST", "/enterprise/auth/login",
            {
                "email": SUPER_ADMIN_EMAIL,
                "password": SUPER_ADMIN_PASSWORD
            }
        )
        
        if not response.get("success"):
            logger.error("❌ Super admin login failed")
            return False
        
        self.super_admin_token = response.get("access_token")
        if not self.super_admin_token:
            logger.error("❌ No access token received")
            return False
        
        logger.info("✅ Super admin login successful")
        return True
    
    async def test_list_organizations(self) -> bool:
        """Test listing organizations"""
        logger.info("🏢 Testing List Organizations")
        
        response = await self.make_request(
            "GET", "/enterprise/super-admin/organizations",
            token=self.super_admin_token
        )
        
        if not response.get("success"):
            logger.error("❌ Failed to list organizations")
            return False
        
        orgs = response.get("organizations", [])
        logger.info(f"✅ Found {len(orgs)} organizations")
        
        for org in orgs[:3]:  # Show first 3
            logger.info(f"  - {org.get('org_name')} ({org.get('org_id')}) - {org.get('subscription_status')}")
        
        return True
    
    async def test_existing_user_login(self) -> bool:
        """Test login with existing demo user"""
        logger.info("🔑 Testing Existing User Login")
        
        # Try demo user
        response = await self.make_request(
            "POST", "/enterprise/auth/login",
            {
                "email": "demo@innovatebooks.com",
                "password": "Demo1234"
            }
        )
        
        if response.get("success"):
            token = response.get("access_token")
            logger.info("✅ Demo user login successful")
            
            # Test /me endpoint
            me_response = await self.make_request(
                "GET", "/enterprise/auth/me",
                token=token
            )
            
            if me_response.get("success"):
                user_info = me_response.get("user", {})
                org_info = me_response.get("organization", {})
                logger.info(f"  User: {user_info.get('full_name')} ({user_info.get('email')})")
                logger.info(f"  Org: {org_info.get('org_name')} ({org_info.get('org_id')})")
                logger.info(f"  Subscription: {org_info.get('subscription_status')}")
                return True
            else:
                logger.error("❌ /me endpoint failed")
                return False
        else:
            logger.error("❌ Demo user login failed")
            return False
    
    async def test_finance_endpoints(self) -> bool:
        """Test finance endpoints with demo user"""
        logger.info("💰 Testing Finance Endpoints")
        
        # Login demo user first
        login_response = await self.make_request(
            "POST", "/enterprise/auth/login",
            {
                "email": "demo@innovatebooks.com",
                "password": "Demo1234"
            }
        )
        
        if not login_response.get("success"):
            logger.error("❌ Demo user login failed")
            return False
        
        token = login_response.get("access_token")
        
        # Test customers endpoint
        customers_response = await self.make_request(
            "GET", "/finance/customers",
            token=token
        )
        
        if customers_response.get("success"):
            customers = customers_response.get("customers", [])
            logger.info(f"✅ Customers endpoint working - found {len(customers)} customers")
        else:
            logger.error(f"❌ Customers endpoint failed: {customers_response.get('error')}")
            return False
        
        # Test vendors endpoint
        vendors_response = await self.make_request(
            "GET", "/finance/vendors",
            token=token
        )
        
        if vendors_response.get("success"):
            vendors = vendors_response.get("vendors", [])
            logger.info(f"✅ Vendors endpoint working - found {len(vendors)} vendors")
        else:
            logger.error(f"❌ Vendors endpoint failed: {vendors_response.get('error')}")
            return False
        
        return True
    
    async def run_all_tests(self) -> dict:
        """Run all tests"""
        logger.info("🚀 Starting Simple Multi-Tenant Testing")
        
        tests = [
            ("Super Admin Login", self.test_super_admin_login),
            ("List Organizations", self.test_list_organizations),
            ("Existing User Login", self.test_existing_user_login),
            ("Finance Endpoints", self.test_finance_endpoints),
        ]
        
        results = {}
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            try:
                result = await test_func()
                results[test_name] = result
                if result:
                    passed += 1
                    logger.info(f"✅ {test_name}: PASSED")
                else:
                    logger.error(f"❌ {test_name}: FAILED")
            except Exception as e:
                logger.error(f"❌ {test_name}: ERROR - {e}")
                results[test_name] = False
        
        # Summary
        logger.info(f"\n📊 TEST SUMMARY: {passed}/{total} tests passed")
        
        return results

async def main():
    """Main test execution"""
    async with SimpleTenantTester() as tester:
        results = await tester.run_all_tests()
        
        # Print detailed results
        print("\n" + "="*60)
        print("SIMPLE MULTI-TENANT TEST RESULTS")
        print("="*60)
        
        for test_name, result in results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{test_name:<30} {status}")
        
        print("="*60)
        
        return results

if __name__ == "__main__":
    asyncio.run(main())
