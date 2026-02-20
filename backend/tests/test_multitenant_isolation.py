#!/usr/bin/env python3
"""
Multi-Tenant Isolation Test
Test data isolation between organizations using existing demo org
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

class MultiTenantIsolationTester:
    def __init__(self):
        self.session = None
        self.super_admin_token = None
        self.demo_org_token = None
        self.new_org_id = None
        self.new_org_admin_token = None
        
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
    
    async def test_1_super_admin_login(self) -> bool:
        """Test super admin login"""
        logger.info("🔐 Test 1: Super Admin Login")
        
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
        logger.info("✅ Super admin login successful")
        return True
    
    async def test_2_demo_org_login(self) -> bool:
        """Test demo organization login"""
        logger.info("🔑 Test 2: Demo Organization Login")
        
        response = await self.make_request(
            "POST", "/enterprise/auth/login",
            {
                "email": "demo@innovatebooks.com",
                "password": "Demo1234"
            }
        )
        
        if not response.get("success"):
            logger.error("❌ Demo org login failed")
            return False
        
        self.demo_org_token = response.get("access_token")
        logger.info("✅ Demo org login successful")
        return True
    
    async def test_3_create_new_organization(self) -> bool:
        """Test creating a new organization"""
        logger.info("🏢 Test 3: Create New Organization")
        
        import time
        self.timestamp = int(time.time())
        self.admin_email = f"admin{self.timestamp}@testorg.com"
        
        response = await self.make_request(
            "POST", "/enterprise/super-admin/organizations/create",
            {
                "org_name": f"Test Isolation Org {self.timestamp}",
                "admin_email": self.admin_email,
                "admin_full_name": "Test Admin",
                "admin_password": "TestAdmin123!"
            },
            token=self.super_admin_token
        )
        
        if not response.get("success"):
            logger.error("❌ Failed to create new organization")
            return False
        
        self.new_org_id = response["data"]["org_id"]
        logger.info(f"✅ New organization created: {self.new_org_id}")
        logger.info(f"  Admin email: {self.admin_email}")
        return True
    
    async def test_4_activate_new_org_subscription(self) -> bool:
        """Test activating new organization subscription"""
        logger.info("💳 Test 4: Activate New Organization Subscription")
        
        response = await self.make_request(
            "POST", f"/enterprise/super-admin/organizations/{self.new_org_id}/override-subscription?new_status=active",
            None,
            token=self.super_admin_token
        )
        
        if not response.get("success"):
            logger.error("❌ Failed to activate new organization subscription")
            return False
        
        logger.info("✅ New organization subscription activated")
        return True
    
    async def test_5_new_org_admin_login(self) -> bool:
        """Test new organization admin login"""
        logger.info("🔑 Test 5: New Organization Admin Login")
        
        logger.info(f"  Attempting login with: {self.admin_email}")
        
        response = await self.make_request(
            "POST", "/enterprise/auth/login",
            {
                "email": self.admin_email,
                "password": "TestAdmin123!"
            }
        )
        
        if not response.get("success"):
            logger.error("❌ New org admin login failed")
            return False
        
        self.new_org_admin_token = response.get("access_token")
        logger.info("✅ New org admin login successful")
        return True
    
    async def test_6_demo_org_create_data(self) -> bool:
        """Test demo organization creating data"""
        logger.info("📊 Test 6: Demo Organization Create Data")
        
        # Create customer in demo org
        customer_data = {
            "name": "Demo Org Customer",
            "email": "democustomer@example.com",
            "phone": "+1234567890",
            "contact_person": "Demo Contact",
            "credit_limit": 50000.0,
            "payment_terms": "Net 30"
        }
        
        response = await self.make_request(
            "POST", "/finance/customers",
            customer_data,
            token=self.demo_org_token
        )
        
        if not response.get("success"):
            logger.error("❌ Demo org failed to create customer")
            return False
        
        logger.info("✅ Demo org created customer successfully")
        return True
    
    async def test_7_new_org_isolation_verification(self) -> bool:
        """Test new organization sees zero customers (isolation)"""
        logger.info("🔒 Test 7: New Organization Isolation Verification")
        
        # New org should see 0 customers
        response = await self.make_request(
            "GET", "/finance/customers",
            token=self.new_org_admin_token
        )
        
        if not response.get("success"):
            logger.error("❌ New org cannot query customers")
            return False
        
        customers = response.get("customers", [])
        if len(customers) != 0:
            logger.error(f"❌ New org sees {len(customers)} customers, expected 0")
            return False
        
        logger.info("✅ New org sees 0 customers (perfect isolation)")
        return True
    
    async def test_8_demo_org_sees_own_data(self) -> bool:
        """Test demo organization sees its own data"""
        logger.info("📋 Test 8: Demo Organization Sees Own Data")
        
        # Demo org should see its customers
        response = await self.make_request(
            "GET", "/finance/customers",
            token=self.demo_org_token
        )
        
        if not response.get("success"):
            logger.error("❌ Demo org cannot query customers")
            return False
        
        customers = response.get("customers", [])
        if len(customers) == 0:
            logger.error("❌ Demo org sees 0 customers, expected at least 1")
            return False
        
        logger.info(f"✅ Demo org sees {len(customers)} customers (own data)")
        return True
    
    async def test_9_cross_org_data_creation(self) -> bool:
        """Test new organization creating its own data"""
        logger.info("🏗️ Test 9: New Organization Create Own Data")
        
        # Create customer in new org
        customer_data = {
            "name": "New Org Customer",
            "email": "neworgcustomer@example.com",
            "phone": "+1234567891",
            "contact_person": "New Org Contact",
            "credit_limit": 75000.0,
            "payment_terms": "Net 15"
        }
        
        response = await self.make_request(
            "POST", "/finance/customers",
            customer_data,
            token=self.new_org_admin_token
        )
        
        if not response.get("success"):
            logger.error("❌ New org failed to create customer")
            return False
        
        logger.info("✅ New org created customer successfully")
        
        # Verify new org now sees 1 customer
        response = await self.make_request(
            "GET", "/finance/customers",
            token=self.new_org_admin_token
        )
        
        if not response.get("success"):
            logger.error("❌ New org cannot query customers after creation")
            return False
        
        customers = response.get("customers", [])
        if len(customers) != 1:
            logger.error(f"❌ New org sees {len(customers)} customers, expected 1")
            return False
        
        logger.info("✅ New org now sees 1 customer (its own)")
        return True
    
    async def run_all_tests(self) -> dict:
        """Run all multi-tenant isolation tests"""
        logger.info("🚀 Starting Multi-Tenant Isolation Testing")
        
        tests = [
            ("Super Admin Login", self.test_1_super_admin_login),
            ("Demo Organization Login", self.test_2_demo_org_login),
            ("Create New Organization", self.test_3_create_new_organization),
            ("Activate New Org Subscription", self.test_4_activate_new_org_subscription),
            ("New Org Admin Login", self.test_5_new_org_admin_login),
            ("Demo Org Create Data", self.test_6_demo_org_create_data),
            ("New Org Isolation Verification", self.test_7_new_org_isolation_verification),
            ("Demo Org Sees Own Data", self.test_8_demo_org_sees_own_data),
            ("New Org Create Own Data", self.test_9_cross_org_data_creation),
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
        
        if passed == total:
            logger.info("🎉 ALL TESTS PASSED - Multi-tenant isolation is working correctly!")
        else:
            logger.error(f"❌ {total - passed} tests failed - Issues need to be addressed")
        
        return results

async def main():
    """Main test execution"""
    async with MultiTenantIsolationTester() as tester:
        results = await tester.run_all_tests()
        
        # Print detailed results
        print("\n" + "="*60)
        print("MULTI-TENANT ISOLATION TEST RESULTS")
        print("="*60)
        
        for test_name, result in results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{test_name:<35} {status}")
        
        print("="*60)
        
        return results

if __name__ == "__main__":
    asyncio.run(main())
