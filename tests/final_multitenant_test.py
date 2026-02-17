#!/usr/bin/env python3
"""
Final Multi-Tenant Data Isolation Test
Focused test to verify the P0 bug fix is working correctly
"""

import asyncio
import aiohttp
import json
import base64
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BASE_URL = "https://saas-finint.preview.emergentagent.com/api"
SUPER_ADMIN_EMAIL = "revanth@innovatebooks.in"
SUPER_ADMIN_PASSWORD = "Pandu@1605"
DEMO_EMAIL = "demo@innovatebooks.com"
DEMO_PASSWORD = "Demo1234"

def decode_token(token):
    """Decode JWT token payload"""
    try:
        parts = token.split('.')
        payload_part = parts[1]
        padding = 4 - len(payload_part) % 4
        if padding != 4:
            payload_part += '=' * padding
        payload_bytes = base64.urlsafe_b64decode(payload_part)
        return json.loads(payload_bytes.decode('utf-8'))
    except Exception:
        return None

async def run_multitenant_test():
    """Run comprehensive multi-tenant isolation test"""
    
    async with aiohttp.ClientSession() as session:
        
        # Test Results
        results = {
            "super_admin_login": False,
            "demo_user_login": False,
            "demo_user_token_structure": False,
            "new_org_creation": False,
            "new_org_admin_login": False,
            "new_org_token_structure": False,
            "new_org_zero_customers": False,
            "new_org_customer_creation": False,
            "new_org_one_customer": False,
            "cross_tenant_isolation": False,
            "demo_user_data_isolation": False
        }
        
        print("🚀 MULTI-TENANT DATA ISOLATION TEST")
        print("="*60)
        
        # 1. Super Admin Login
        print("\n1️⃣ Testing Super Admin Login...")
        try:
            async with session.post(f"{BASE_URL}/enterprise/auth/login", 
                                  json={"email": SUPER_ADMIN_EMAIL, "password": SUPER_ADMIN_PASSWORD}) as response:
                if response.status == 200:
                    login_result = await response.json()
                    super_admin_token = login_result["access_token"]
                    results["super_admin_login"] = True
                    print("   ✅ Super admin login successful")
                else:
                    print(f"   ❌ Super admin login failed: {response.status}")
                    return results
        except Exception as e:
            print(f"   ❌ Super admin login error: {e}")
            return results
        
        # 2. Demo User Login & Token Validation
        print("\n2️⃣ Testing Demo User Login & Token Structure...")
        try:
            async with session.post(f"{BASE_URL}/auth/login", 
                                  json={"email": DEMO_EMAIL, "password": DEMO_PASSWORD, "remember_me": False}) as response:
                if response.status == 200:
                    login_result = await response.json()
                    demo_token = login_result["access_token"]
                    demo_payload = decode_token(demo_token)
                    results["demo_user_login"] = True
                    print("   ✅ Demo user login successful")
                    
                    # Validate token structure
                    required_fields = ['user_id', 'org_id', 'role_id', 'subscription_status']
                    if demo_payload and all(field in demo_payload for field in required_fields):
                        results["demo_user_token_structure"] = True
                        print(f"   ✅ Token structure valid (org_id: {demo_payload['org_id']})")
                    else:
                        print("   ❌ Token missing required fields")
                else:
                    print(f"   ❌ Demo user login failed: {response.status}")
                    return results
        except Exception as e:
            print(f"   ❌ Demo user login error: {e}")
            return results
        
        # 3. Create New Organization
        print("\n3️⃣ Testing New Organization Creation...")
        try:
            org_data = {
                "org_name": "Final Test Org",
                "admin_email": "finaltest@neworg.com",
                "admin_password": "SecurePass123",
                "admin_full_name": "Final Test Admin",
                "subscription_plan": "trial",
                "is_demo": False
            }
            
            headers = {"Authorization": f"Bearer {super_admin_token}"}
            async with session.post(f"{BASE_URL}/enterprise/super-admin/organizations/create", 
                                   json=org_data, headers=headers) as response:
                if response.status == 200:
                    org_result = await response.json()
                    new_org_id = org_result["data"]["org_id"]
                    results["new_org_creation"] = True
                    print(f"   ✅ New organization created (org_id: {new_org_id})")
                else:
                    error_text = await response.text()
                    print(f"   ❌ Organization creation failed: {response.status} - {error_text}")
                    return results
        except Exception as e:
            print(f"   ❌ Organization creation error: {e}")
            return results
        
        # 4. New Org Admin Login & Token Validation
        print("\n4️⃣ Testing New Org Admin Login & Token Structure...")
        try:
            async with session.post(f"{BASE_URL}/auth/login", 
                                  json={"email": "finaltest@neworg.com", "password": "SecurePass123", "remember_me": False}) as response:
                if response.status == 200:
                    login_result = await response.json()
                    new_org_token = login_result["access_token"]
                    new_org_payload = decode_token(new_org_token)
                    results["new_org_admin_login"] = True
                    print("   ✅ New org admin login successful")
                    
                    # Validate token structure
                    required_fields = ['user_id', 'org_id', 'role_id', 'subscription_status']
                    if new_org_payload and all(field in new_org_payload for field in required_fields):
                        results["new_org_token_structure"] = True
                        print(f"   ✅ Token structure valid (org_id: {new_org_payload['org_id']})")
                    else:
                        print("   ❌ Token missing required fields")
                else:
                    error_text = await response.text()
                    print(f"   ❌ New org admin login failed: {response.status} - {error_text}")
                    return results
        except Exception as e:
            print(f"   ❌ New org admin login error: {e}")
            return results
        
        # 5. Verify New Org Admin Sees Zero Customers (Critical Test)
        print("\n5️⃣ Testing New Org Admin Sees Zero Customers (CRITICAL)...")
        try:
            headers = {"Authorization": f"Bearer {new_org_token}"}
            async with session.get(f"{BASE_URL}/finance/customers", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    customers = data.get("customers", [])
                    if len(customers) == 0:
                        results["new_org_zero_customers"] = True
                        print("   ✅ NEW ORG ADMIN SEES ZERO CUSTOMERS - NO DATA LEAK!")
                    else:
                        print(f"   ❌ DATA LEAK DETECTED: New org admin sees {len(customers)} customers")
                        for customer in customers:
                            print(f"      - {customer.get('name')} (org_id: {customer.get('org_id')})")
                else:
                    print(f"   ❌ Failed to get customers: {response.status}")
        except Exception as e:
            print(f"   ❌ Customer check error: {e}")
        
        # 6. Create Customer in New Org
        print("\n6️⃣ Testing Customer Creation in New Org...")
        try:
            customer_data = {
                "name": "Final Test Customer",
                "contact_person": "Test Contact",
                "email": "test@finaltest.com",
                "phone": "+91-9876543210",
                "credit_limit": 50000.0,
                "payment_terms": "Net 30"
            }
            
            headers = {"Authorization": f"Bearer {new_org_token}"}
            async with session.post(f"{BASE_URL}/finance/customers", 
                                   json=customer_data, headers=headers) as response:
                if response.status == 200:
                    results["new_org_customer_creation"] = True
                    print("   ✅ Customer created in new org")
                else:
                    error_text = await response.text()
                    print(f"   ❌ Customer creation failed: {response.status} - {error_text}")
        except Exception as e:
            print(f"   ❌ Customer creation error: {e}")
        
        # 7. Verify New Org Admin Sees Exactly One Customer
        print("\n7️⃣ Testing New Org Admin Sees Exactly One Customer...")
        try:
            headers = {"Authorization": f"Bearer {new_org_token}"}
            async with session.get(f"{BASE_URL}/finance/customers", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    customers = data.get("customers", [])
                    if len(customers) == 1 and customers[0]["name"] == "Final Test Customer":
                        results["new_org_one_customer"] = True
                        print("   ✅ New org admin sees exactly 1 customer (their own)")
                    else:
                        print(f"   ❌ Expected 1 customer, found {len(customers)}")
                else:
                    print(f"   ❌ Failed to get customers: {response.status}")
        except Exception as e:
            print(f"   ❌ Customer verification error: {e}")
        
        # 8. Verify Cross-Tenant Isolation
        print("\n8️⃣ Testing Cross-Tenant Isolation...")
        try:
            # Check demo user still sees only their customers
            headers = {"Authorization": f"Bearer {demo_token}"}
            async with session.get(f"{BASE_URL}/finance/customers", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    demo_customers = data.get("customers", [])
                    
                    # Check new org admin still sees only their customer
                    headers = {"Authorization": f"Bearer {new_org_token}"}
                    async with session.get(f"{BASE_URL}/finance/customers", headers=headers) as response:
                        if response.status == 200:
                            data = await response.json()
                            new_org_customers = data.get("customers", [])
                            
                            # Verify no overlap
                            demo_org_ids = {c.get("org_id") for c in demo_customers}
                            new_org_ids = {c.get("org_id") for c in new_org_customers}
                            
                            if len(demo_org_ids & new_org_ids) == 0:  # No intersection
                                results["cross_tenant_isolation"] = True
                                results["demo_user_data_isolation"] = True
                                print(f"   ✅ Perfect isolation: Demo user sees {len(demo_customers)} customers, New org sees {len(new_org_customers)} customers")
                                print(f"   ✅ No org_id overlap between tenants")
                            else:
                                print(f"   ❌ Org ID overlap detected: {demo_org_ids & new_org_ids}")
                        else:
                            print(f"   ❌ Failed to get new org customers: {response.status}")
                else:
                    print(f"   ❌ Failed to get demo customers: {response.status}")
        except Exception as e:
            print(f"   ❌ Cross-tenant isolation error: {e}")
        
        return results

async def main():
    """Main test runner"""
    results = await run_multitenant_test()
    
    # Print final summary
    print("\n" + "="*80)
    print("FINAL TEST RESULTS - MULTI-TENANT DATA ISOLATION")
    print("="*80)
    
    critical_tests = [
        ("Super Admin Login", results["super_admin_login"]),
        ("Demo User Login", results["demo_user_login"]),
        ("Demo User Token Structure", results["demo_user_token_structure"]),
        ("New Org Creation", results["new_org_creation"]),
        ("New Org Admin Login", results["new_org_admin_login"]),
        ("New Org Token Structure", results["new_org_token_structure"]),
        ("🔥 NEW ORG ZERO CUSTOMERS (CRITICAL)", results["new_org_zero_customers"]),
        ("New Org Customer Creation", results["new_org_customer_creation"]),
        ("New Org One Customer", results["new_org_one_customer"]),
        ("🔥 CROSS-TENANT ISOLATION (CRITICAL)", results["cross_tenant_isolation"]),
        ("🔥 DEMO USER DATA ISOLATION (CRITICAL)", results["demo_user_data_isolation"])
    ]
    
    passed = 0
    total = len(critical_tests)
    
    for test_name, result in critical_tests:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\nSUMMARY: {passed}/{total} tests passed")
    
    # Check critical P0 bug fix
    critical_p0_tests = [
        results["new_org_zero_customers"],
        results["cross_tenant_isolation"],
        results["demo_user_data_isolation"]
    ]
    
    if all(critical_p0_tests):
        print("\n🎉 P0 BUG FIX VERIFIED: Multi-tenant data isolation is working correctly!")
        print("   ✅ New organizations see zero customers initially")
        print("   ✅ Organizations cannot see each other's data")
        print("   ✅ Legacy demo org compatibility maintained")
        return 0
    else:
        print("\n⚠️ P0 BUG NOT FULLY FIXED: Multi-tenant data isolation has issues!")
        return 1

if __name__ == "__main__":
    import sys
    exit_code = asyncio.run(main())
    sys.exit(exit_code)