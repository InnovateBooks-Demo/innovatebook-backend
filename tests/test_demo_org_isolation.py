#!/usr/bin/env python3
"""
Test that demo organization still works and is isolated
"""
import requests
import json

API_URL = "https://saas-finint.preview.emergentagent.com/api"

print("=" * 80)
print("TESTING DEMO ORG ISOLATION")
print("=" * 80)

# Check if demo user exists
print("\n[1] Attempting to login as demo user...")
response = requests.post(
    f"{API_URL}/auth/login",
    json={
        "email": "demo@innovatebooks.com",
        "password": "Demo1234",
        "remember_me": False
    }
)

if response.status_code == 200:
    demo_token = response.json()["access_token"]
    print(f"✅ Demo user login successful")
    
    # Decode token
    import base64
    token_parts = demo_token.split('.')
    payload = token_parts[1]
    payload += '=' * (4 - len(payload) % 4)
    decoded = json.loads(base64.urlsafe_b64decode(payload))
    print(f"\nDemo user token payload:")
    print(json.dumps(decoded, indent=2))
    
    # Fetch demo user's customers
    print("\n[2] Fetching demo user's customers...")
    response = requests.get(
        f"{API_URL}/finance/customers",
        headers={"Authorization": f"Bearer {demo_token}"}
    )
    
    if response.status_code == 200:
        customers = response.json().get("customers", [])
        print(f"✅ Demo user sees {len(customers)} customers")
        if len(customers) > 0:
            demo_org_id = customers[0].get('org_id', 'UNKNOWN')
            print(f"   Demo org_id: {demo_org_id}")
            
            # Check all customers belong to same org
            all_same_org = all(c.get('org_id') == demo_org_id for c in customers)
            if all_same_org:
                print(f"✅ All customers belong to same demo org")
            else:
                print(f"❌ Customers from multiple orgs!")
    else:
        print(f"❌ Failed to fetch customers: {response.status_code}")
else:
    print(f"⚠️ Demo user does not exist or wrong credentials")
    print(f"   This is OK if demo data was never migrated")

print("\n" + "=" * 80)
