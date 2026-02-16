import asyncio
import os
import secrets
from datetime import datetime, timedelta, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext

# Configuration
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "innovate_books_db")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def main():
    print(f"Connecting to {MONGO_URL} / {DB_NAME}...")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    # Clean up test data
    test_email = "test.invite.user@example.com"
    test_org_id = "test_org_" + secrets.token_hex(4)
    # Clean up old test data
    print(f"Cleaning up old test data for {test_email}...")
    await db.users.delete_one({"email": test_email})
    await db.user_invites.delete_many({"email": test_email})
    await db.org_users.delete_many({"user_id": {"$exists": True}, "org_id": test_org_id}) # Be careful not to delete all
    await db.enterprise_users.delete_many({"email": test_email})
    await db.organizations.delete_one({"org_id": test_org_id})

    # 0. Seed Organization (Required for middleware validation)
    await db.organizations.insert_one({
        "org_id": test_org_id,
        "name": "Test Organization",
        "status": "active",
        "is_active": True,
        "subscription_status": "active",
        "plan": "enterprise",
        "created_at": datetime.now(timezone.utc)
    })
    print(f"[OK] Seeded mock organization: {test_org_id}")

    # 1. Create Invite
    invite_token = secrets.token_urlsafe(32)
    role_id = "admin"
    
    print(f"Creating invite with token: {invite_token}")
    curr_time = datetime.now(timezone.utc)
    invite_doc = {
        "invite_token": invite_token,
        "email": test_email,
        "org_id": test_org_id,
        "role_id": role_id,
        "api_key": "test_key",
        "status": "pending",
        "expires_at": curr_time + timedelta(days=7),
        "created_at": curr_time,
        "updated_at": curr_time
    }
    await db.user_invites.insert_one(invite_doc)

    # 2. Simulate Acceptance via API (using httpx or requests)?
    # Actually, we can just call the logic or simulate the request if we want to test the ROUTE.
    # To test the route properly, we should hit the endpoint.
    import httpx
    
    base_url = "http://localhost:8000" # Assuming internal
    
    accept_payload = {
        "token": invite_token,
        "full_name": "Test Invite User",
        "password": "SecurePassword123!"
    }
    
    print("Calling /api/public/invites/accept...")
    async with httpx.AsyncClient() as http_client:
        try:
            resp = await http_client.post(f"{base_url}/api/public/invites/accept", json=accept_payload)
            print(f"Response: {resp.status_code} - {resp.text}")
            
            if resp.status_code != 201:
                print("❌ Accept failed!")
                return
        except Exception as e:
            print(f"[ERROR] Failed to connect to server: {e}")
            return

    # 3. Verify Database State
    print("\nVerifying Database State...")
    
    # Check users
    user = await db.users.find_one({"email": test_email})
    if user:
        print(f"[OK] User found in 'users': {user['user_id']}")
        if user.get("password_hash"):
             print("[OK] Password hash present in 'users'")
    else:
        print("[ERROR] User NOT found in 'users'")

    # Check org_users
    if user:
        org_user = await db.org_users.find_one({"user_id": user["user_id"], "org_id": test_org_id})
        if org_user:
            print(f"[OK] Membership found in 'org_users': role={org_user.get('role')}")
        else:
            print("[ERROR] Membership NOT found in 'org_users'")

    # Check enterprise_users (Should BE updated for directory listing, but NO password)
    ent_user = await db.enterprise_users.find_one({"email": test_email, "org_id": test_org_id})
    if ent_user:
        print("[OK] Directory Record found in 'enterprise_users'")
        if ent_user.get("user_id") == user["user_id"]:
             print(f"[OK] Linked to correct user_id: {user['user_id']}")
        else:
             print(f"[ERROR] Mismatched user_id in enterprise_users: {ent_user.get('user_id')}")
        
        if "password_hash" not in ent_user:
             print("[OK] Correct: No password_hash in 'enterprise_users'")
        else:
             print("[ERROR] SECURITY RISK: password_hash FOUND in 'enterprise_users'!")
    else:
        print("[ERROR] Directory Record NOT found in 'enterprise_users' (Should exist for listing)")

    # 4. Try Login
    print("\nTesting Login...")
    login_payload = {
        "email": test_email, # Uppercase check?
        "password": "SecurePassword123!"
    }
    
    async with httpx.AsyncClient() as http_client:
        try:
            resp = await http_client.post(f"{base_url}/api/auth/login", json=login_payload)
            print(f"Login Response: {resp.status_code}")
             
            if resp.status_code == 200:
                data = resp.json()
                print("[OK] Login Successful")
                print(f"Token: {data.get('access_token')[:10]}...")
                if data.get("user", {}).get("email") == test_email:
                    print("[OK] User email matches")
                
                # 5. Test Users List Endpoint (Refactored)
                print("\nTesting Users List Endpoint...")
                token = data.get("access_token")
                if token:
                    headers = {"Authorization": f"Bearer {token}"}
                    try:
                        list_resp = await http_client.get(
                            f"{base_url}/api/enterprise/org-admin/users", 
                            headers=headers
                        )
                        print(f"List Users Response: {list_resp.status_code}")
                        if list_resp.status_code == 200:
                            list_data = list_resp.json()
                            users_list = list_data.get("users", [])
                            print(f"[OK] Users List retrieved: {len(users_list)} users")
                            
                            # Verify our user is in the list
                            found_me = next((u for u in users_list if u["email"] == test_email), None)
                            if found_me:
                                print(f"[OK] Found self in users list: {found_me['full_name']} ({found_me['role']})")
                                if found_me.get("last_active"):
                                    print(f"[OK] Last active populated: {found_me['last_active']}")
                                else:
                                    print("[WARN] Last active NOT populated (might be null for fresh user)")
                            else:
                                print("[ERROR] Self NOT found in users list!")
                        else:
                            print(f"[ERROR] List Users Failed: {list_resp.text}")
                    except Exception as e:
                        print(f"[ERROR] List Users request failed: {e}")
                else:
                    print(f"[WARN] No access token received, skipping users list test (might need tenant selection)")
                    print(f"Login Response Data: {data}")

            else:
                 print(f"[ERROR] Login Failed: {resp.status_code} - {resp.text}")
                 print(f"Sent Credentials: {login_payload}")

        except Exception as e:
             print(f"[ERROR] Login request failed: {e}")

    # Clean up?
    # await db.users.delete_one({"email": test_email})
    
if __name__ == "__main__":
    asyncio.run(main())
