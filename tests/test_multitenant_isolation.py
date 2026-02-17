#!/usr/bin/env python3
"""
Multi-Tenant Data Isolation Test
Tests that new organizations have proper data isolation
"""
import requests
import json
import sys

API_URL = "https://saas-finint.preview.emergentagent.com/api"
SUPER_ADMIN_CREDS = {
    "email": "revanth@innovatebooks.in",
    "password": "Pandu@1605"
}

print("=" * 80)
print("MULTI-TENANT DATA ISOLATION TEST")
print("=" * 80)

# Step 1: Super Admin Login
print("\n[1] Super Admin Login...")
response = requests.post(
    f"{API_URL}/enterprise/auth/login",
    json=SUPER_ADMIN_CREDS
)
if response.status_code != 200:
    print(f"❌ Super admin login failed: {response.status_code}")
    print(response.text)
    sys.exit(1)

super_admin_token = response.json()["access_token"]
print(f"✅ Super admin logged in successfully")

# Step 2: Create Test Organization
print("\n[2] Creating test organization...")
test_org_data = {
    "org_name": f"Test Org Isolation {int(__import__('time').time())}",
    "admin_email": f"testadmin_{int(__import__('time').time())}@example.com",
    "admin_password": "TestAdmin123!",
    "admin_full_name": "Test Admin User"
}

response = requests.post(
    f"{API_URL}/enterprise/super-admin/organizations/create",
    json=test_org_data,
    headers={"Authorization": f"Bearer {super_admin_token}"}
)

if response.status_code != 200:
    print(f"❌ Organization creation failed: {response.status_code}")
    print(response.text)
    sys.exit(1)

org_data = response.json()["data"]
print(f"✅ Organization created: {org_data['org_name']}")
print(f"   Org ID: {org_data['org_id']}")
print(f"   Admin Email: {test_org_data['admin_email']}")

# Step 3: Login as new org admin via LEGACY /auth/login
print("\n[3] Logging in as new org admin (via /auth/login)...")
response = requests.post(
    f"{API_URL}/auth/login",
    json={
        "email": test_org_data["admin_email"],
        "password": test_org_data["admin_password"],
        "remember_me": False
    }
)

if response.status_code != 200:
    print(f"❌ Org admin login failed: {response.status_code}")
    print(response.text)
    sys.exit(1)

org_admin_token = response.json()["access_token"]
print(f"✅ Org admin logged in successfully")

# Step 4: Decode the JWT token to verify org_id
print("\n[4] Verifying token contents...")
import base64
token_parts = org_admin_token.split('.')
if len(token_parts) >= 2:
    # Decode payload (add padding if needed)
    payload = token_parts[1]
    payload += '=' * (4 - len(payload) % 4)
    decoded = json.loads(base64.urlsafe_b64decode(payload))
    print(f"   Token payload: {json.dumps(decoded, indent=2)}")
    
    if "org_id" in decoded:
        print(f"✅ Token contains org_id: {decoded['org_id']}")
        if decoded['org_id'] == org_data['org_id']:
            print(f"✅ Token org_id MATCHES created organization!")
        else:
            print(f"❌ Token org_id MISMATCH! Expected: {org_data['org_id']}, Got: {decoded['org_id']}")
            sys.exit(1)
    else:
        print(f"❌ Token MISSING org_id field!")
        sys.exit(1)
else:
    print(f"⚠️ Could not decode token")

# Step 5: Fetch customers using new org admin token
print("\n[5] Fetching customers as new org admin...")
response = requests.get(
    f"{API_URL}/finance/customers",
    headers={"Authorization": f"Bearer {org_admin_token}"}
)

if response.status_code != 200:
    print(f"❌ Failed to fetch customers: {response.status_code}")
    print(response.text)
    sys.exit(1)

customers = response.json().get("customers", [])
print(f"   Customers returned: {len(customers)}")

# Step 6: Check if customers are properly scoped
if len(customers) == 0:
    print(f"✅ PERFECT! New org admin sees ZERO customers (proper data isolation)")
else:
    print(f"❌ DATA LEAK! New org admin should see ZERO customers but sees {len(customers)}")
    print(f"   Customer org_ids: {[c.get('org_id', 'NO_ORG_ID') for c in customers[:5]]}")
    sys.exit(1)

# Step 7: Create a customer in the new org
print("\n[6] Creating a test customer in new organization...")
response = requests.post(
    f"{API_URL}/finance/customers",
    json={
        "name": "Test Customer for New Org",
        "email": "test@neworg.com",
        "phone": "1234567890"
    },
    headers={"Authorization": f"Bearer {org_admin_token}"}
)

if response.status_code != 200:
    print(f"❌ Failed to create customer: {response.status_code}")
    print(response.text)
    sys.exit(1)

new_customer = response.json().get("customer", {})
print(f"✅ Customer created: {new_customer.get('id', 'N/A')}")
if new_customer.get('org_id') == org_data['org_id']:
    print(f"✅ Customer has correct org_id: {new_customer['org_id']}")
else:
    print(f"❌ Customer org_id mismatch! Expected: {org_data['org_id']}, Got: {new_customer.get('org_id', 'NONE')}")
    sys.exit(1)

# Step 8: Verify new org admin now sees exactly 1 customer
print("\n[7] Verifying new org admin sees only their own customer...")
response = requests.get(
    f"{API_URL}/finance/customers",
    headers={"Authorization": f"Bearer {org_admin_token}"}
)

customers = response.json().get("customers", [])
print(f"   Customers returned: {len(customers)}")

if len(customers) == 1:
    print(f"✅ PERFECT! New org admin sees exactly 1 customer (their own)")
    if customers[0]['org_id'] == org_data['org_id']:
        print(f"✅ Customer belongs to correct org: {org_data['org_id']}")
    else:
        print(f"❌ Customer has wrong org_id: {customers[0]['org_id']}")
        sys.exit(1)
else:
    print(f"❌ Expected 1 customer, but found {len(customers)}")
    sys.exit(1)

# Step 9: Login as legacy demo user and verify they DON'T see the new org's customer
print("\n[8] Logging in as legacy demo user...")
response = requests.post(
    f"{API_URL}/auth/login",
    json={
        "email": "demo@innovatebooks.com",
        "password": "Demo1234",
        "remember_me": False
    }
)

if response.status_code != 200:
    print(f"⚠️ Demo user login failed (might not exist): {response.status_code}")
else:
    demo_token = response.json()["access_token"]
    print(f"✅ Demo user logged in successfully")
    
    print("\n[9] Fetching customers as demo user...")
    response = requests.get(
        f"{API_URL}/finance/customers",
        headers={"Authorization": f"Bearer {demo_token}"}
    )
    
    if response.status_code == 200:
        demo_customers = response.json().get("customers", [])
        print(f"   Demo user sees {len(demo_customers)} customers")
        
        # Check if any customer belongs to the new org (should be ZERO)
        new_org_customers = [c for c in demo_customers if c.get('org_id') == org_data['org_id']]
        if len(new_org_customers) == 0:
            print(f"✅ PERFECT! Demo user CANNOT see new org's customers (proper isolation)")
        else:
            print(f"❌ DATA LEAK! Demo user can see {len(new_org_customers)} customers from new org!")
            sys.exit(1)
    else:
        print(f"⚠️ Could not fetch demo customers: {response.status_code}")

print("\n" + "=" * 80)
print("🎉 ALL TESTS PASSED - MULTI-TENANT DATA ISOLATION IS WORKING!")
print("=" * 80)
