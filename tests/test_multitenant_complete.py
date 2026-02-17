#!/usr/bin/env python3
"""
Complete Multi-Tenant Data Isolation Test
Includes subscription override for testing
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
    sys.exit(1)

super_admin_token = response.json()["access_token"]
print(f"✅ Super admin logged in")

# Step 2: Create Test Organization
print("\n[2] Creating test organization...")
test_org_data = {
    "org_name": f"Test Org {int(__import__('time').time())}",
    "admin_email": f"admin_{int(__import__('time').time())}@test.com",
    "admin_password": "TestPass123!",
    "admin_full_name": "Test Admin"
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
org_id = org_data['org_id']
print(f"✅ Organization created: {org_id}")

# Step 3: Override subscription to active (so we can test writes)
print("\n[3] Activating subscription for testing...")
response = requests.post(
    f"{API_URL}/enterprise/super-admin/organizations/{org_id}/override-subscription?new_status=active",
    headers={"Authorization": f"Bearer {super_admin_token}"}
)
if response.status_code == 200:
    print(f"✅ Subscription activated")
else:
    print(f"⚠️ Could not activate subscription: {response.status_code}")

# Step 4: Login as new org admin
print("\n[4] Logging in as new org admin...")
response = requests.post(
    f"{API_URL}/auth/login",
    json={
        "email": test_org_data["admin_email"],
        "password": test_org_data["admin_password"],
        "remember_me": False
    }
)

if response.status_code != 200:
    print(f"❌ Login failed: {response.status_code}")
    print(response.text)
    sys.exit(1)

org_admin_token = response.json()["access_token"]
print(f"✅ Logged in successfully")

# Step 5: Verify token has org_id
print("\n[5] Verifying token...")
import base64
token_parts = org_admin_token.split('.')
if len(token_parts) >= 2:
    payload = token_parts[1]
    payload += '=' * (4 - len(payload) % 4)
    decoded = json.loads(base64.urlsafe_b64decode(payload))
    
    if decoded.get("org_id") == org_id:
        print(f"✅ Token has correct org_id: {org_id}")
    else:
        print(f"❌ Token org_id mismatch!")
        sys.exit(1)

# Step 6: Verify empty customer list
print("\n[6] Checking initial customer list...")
response = requests.get(
    f"{API_URL}/finance/customers",
    headers={"Authorization": f"Bearer {org_admin_token}"}
)

if response.status_code != 200:
    print(f"❌ Failed to fetch customers: {response.status_code}")
    sys.exit(1)

customers = response.json().get("customers", [])
if len(customers) == 0:
    print(f"✅ Customer list is empty (proper isolation)")
else:
    print(f"❌ DATA LEAK! Found {len(customers)} customers")
    sys.exit(1)

# Step 7: Create a customer
print("\n[7] Creating a customer...")
response = requests.post(
    f"{API_URL}/finance/customers",
    json={
        "name": "Test Customer",
        "email": "test@example.com",
        "phone": "1234567890"
    },
    headers={"Authorization": f"Bearer {org_admin_token}"}
)

if response.status_code != 200:
    print(f"❌ Failed to create customer: {response.status_code}")
    print(response.text)
    sys.exit(1)

new_customer = response.json().get("customer", {})
if new_customer.get('org_id') == org_id:
    print(f"✅ Customer created with correct org_id")
else:
    print(f"❌ Customer has wrong org_id")
    sys.exit(1)

# Step 8: Verify customer list now has exactly 1
print("\n[8] Verifying customer list...")
response = requests.get(
    f"{API_URL}/finance/customers",
    headers={"Authorization": f"Bearer {org_admin_token}"}
)

customers = response.json().get("customers", [])
if len(customers) == 1 and customers[0]['org_id'] == org_id:
    print(f"✅ Sees exactly 1 customer (their own)")
else:
    print(f"❌ Expected 1 customer with correct org_id")
    sys.exit(1)

print("\n" + "=" * 80)
print("🎉 ALL TESTS PASSED - DATA ISOLATION WORKING CORRECTLY!")
print("=" * 80)
print("\nKey Results:")
print(f"  ✅ New org admin token contains correct org_id")
print(f"  ✅ New org starts with ZERO customers (no data leak)")
print(f"  ✅ New org can create their own customers")
print(f"  ✅ New org only sees their own data")
