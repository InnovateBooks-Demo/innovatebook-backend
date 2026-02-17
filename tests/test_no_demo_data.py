#!/usr/bin/env python3
"""
Test that new organizations DON'T get demo data
"""
import requests
import json
import time

API_URL = "https://saas-finint.preview.emergentagent.com/api"
SUPER_ADMIN_CREDS = {
    "email": "revanth@innovatebooks.in",
    "password": "Pandu@1605"
}

print("=" * 80)
print("TEST: NO DEMO DATA FOR NEW ORGANIZATIONS")
print("=" * 80)

# Step 1: Super Admin Login
print("\n[1] Logging in as Super Admin...")
response = requests.post(
    f"{API_URL}/enterprise/auth/login",
    json=SUPER_ADMIN_CREDS
)
if response.status_code != 200:
    print(f"❌ Login failed: {response.status_code}")
    exit(1)

super_admin_token = response.json()["access_token"]
print("✅ Logged in")

# Step 2: Create a NEW organization
timestamp = int(time.time())
print(f"\n[2] Creating new organization (timestamp: {timestamp})...")
test_org_data = {
    "org_name": f"Clean Org Test {timestamp}",
    "admin_email": f"cleanadmin{timestamp}@test.com",
    "admin_password": "TestPass123!",
    "admin_full_name": "Clean Admin"
}

response = requests.post(
    f"{API_URL}/enterprise/super-admin/organizations/create",
    json=test_org_data,
    headers={"Authorization": f"Bearer {super_admin_token}"}
)

if response.status_code != 200:
    print(f"❌ Failed: {response.status_code}")
    print(response.text)
    exit(1)

org_data = response.json()["data"]
org_id = org_data['org_id']
print(f"✅ Organization created: {org_id}")

# Step 3: Login as new org admin
print(f"\n[3] Logging in as new org admin...")
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
    exit(1)

org_admin_token = response.json()["access_token"]
print("✅ Logged in successfully")

# Step 4: Check customers
print(f"\n[4] Checking customers...")
response = requests.get(
    f"{API_URL}/finance/customers",
    headers={"Authorization": f"Bearer {org_admin_token}"}
)

if response.status_code != 200:
    print(f"⚠️ API call failed: {response.status_code}")
    exit(1)

customers = response.json().get("customers", [])
print(f"   Customers found: {len(customers)}")

if len(customers) == 0:
    print("\n✅ PERFECT! No demo data created")
    print("✅ New organization starts with clean slate")
else:
    print(f"\n❌ ISSUE: Found {len(customers)} customers")
    print("   Expected: 0 (clean slate)")
    for customer in customers[:5]:
        is_demo = customer.get('is_demo_record', False)
        print(f"   - {customer.get('name')} (Demo: {is_demo}, Org: {customer.get('org_id')})")

print("\n" + "=" * 80)
