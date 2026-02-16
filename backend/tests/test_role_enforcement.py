import asyncio
import httpx
import secrets
from datetime import datetime, timezone, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
import os

# Configuration
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "innovate_books_db")
BASE_URL = "http://localhost:8000"

async def main():
    print("Connecting to DB...")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Setup Data
    org_id = "test_org_enforce_" + secrets.token_hex(4)
    owner_id = "user_owner_" + secrets.token_hex(4)
    member_id = "user_member_" + secrets.token_hex(4)
    
    print(f"Seeding Org: {org_id}")
    await db.organizations.insert_one({
        "org_id": org_id,
        "name": "Enforce Org",
        "status": "active",
        "subscription_status": "active",
        "plan": "enterprise"
    })
    
    # Pre-Seed Cleanup
    await db.users.delete_one({"email": "owner@test.com"})
    await db.users.delete_one({"email": "member@test.com"})
    
    # Seed Inviters
    print("Seeding Inviters (Owner & Member)...")
    # Owner
    await db.users.insert_one({"user_id": owner_id, "email": "owner@test.com", "full_name": "Owner User"})
    await db.org_users.insert_one({"user_id": owner_id, "org_id": org_id, "role": "owner", "status": "active"})
    await db.enterprise_users.insert_one({"user_id": owner_id, "org_id": org_id, "role": "owner", "is_super_admin": False})

    # Member
    await db.users.insert_one({"user_id": member_id, "email": "member@test.com", "full_name": "Member User"})
    await db.org_users.insert_one({"user_id": member_id, "org_id": org_id, "role": "member", "status": "active"})
    # Note: enterprise_users might accept 'member' or 'role_id'. Logic checks org_users for role.
    
    # Ensure Roles exist
    await db.roles.update_one({"role_id": "member"}, {"$set": {"role_name": "Member", "is_system": True}}, upsert=True)
    await db.roles.update_one({"role_id": "admin"}, {"$set": {"role_name": "Admin", "is_system": True}}, upsert=True)
    await db.roles.update_one({"role_id": "manager"}, {"$set": {"role_name": "Manager", "is_system": True}}, upsert=True)

    async with httpx.AsyncClient() as client:
        
        # TEST 1: API Endpoint `create_invite` (using default hardcoded user)
        # The hardcoded user in deps.py has role="admin". Check if allowed to invite "admin".
        # Expectation: 403 because inviter must be "owner" or "super_admin".
        print("\n--- Test 1: Create Invite API (Admin creating Admin) ---")
        try:
            resp = await client.post(f"{BASE_URL}/api/admin/invites", json={
                "email": f"newadmin_{secrets.token_hex(2)}@test.com",
                "role_id": "admin"
            })
            if resp.status_code == 403:
                print("[PASS] Blocked Admin from inviting Admin")
            else:
                print(f"[FAIL] Unexpected status: {resp.status_code} - {resp.text}")
        except Exception as e:
            print(f"[ERROR] API Call failed: {e}")

        # TEST 2: Create Invite API (Admin creating Member)
        # Expectation: 200 (Admins can invite members)
        print("\n--- Test 2: Create Invite API (Admin creating Member) ---")
        try:
            resp = await client.post(f"{BASE_URL}/api/admin/invites", json={
                "email": f"newmember_{secrets.token_hex(2)}@test.com",
                "role_id": "member"
            })
            if resp.status_code == 201 or resp.status_code == 200:
                print("[PASS] Allowed Admin to invite Member")
            else:
                print(f"[FAIL] Unexpected status: {resp.status_code} - {resp.text}")
        except Exception as e:
            print(f"[ERROR] API Call failed: {e}")


        # TEST 3: Accept Invite (Admin Invite from Member)
        # Expectation: 403
        print("\n--- Test 3: Accept Invite (Role=Admin, Inviter=Member) ---")
        token_bad = secrets.token_urlsafe(32)
        email_bad = f"bad_invite_{secrets.token_hex(2)}@test.com"
        await db.user_invites.insert_one({
            "invite_token": token_bad,
            "org_id": org_id,
            "email": email_bad,
            "role_id": "admin",
            "invited_by": member_id, # Member trying to make Admin
            "status": "pending",
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
        })
        
        resp = await client.post(f"{BASE_URL}/api/public/invites/accept", json={
            "token": token_bad,
            "password": "Password123!",
            "full_name": "Bad Invitee"
        })
        if resp.status_code == 403:
             print("[PASS] Rejected Admin invite from Member")
        else:
             print(f"[FAIL] Accepted invalid invite! Status: {resp.status_code} - {resp.text}")


        # TEST 4: Accept Invite (Admin Invite from Owner)
        # Expectation: 201
        print("\n--- Test 4: Accept Invite (Role=Admin, Inviter=Owner) ---")
        token_good = secrets.token_urlsafe(32)
        email_good = f"good_invite_{secrets.token_hex(2)}@test.com"
        await db.user_invites.insert_one({
            "invite_token": token_good,
            "org_id": org_id,
            "email": email_good,
            "role_id": "admin",
            "invited_by": owner_id, # Owner making Admin
            "status": "pending",
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
        })
        
        resp = await client.post(f"{BASE_URL}/api/public/invites/accept", json={
            "token": token_good,
            "password": "Password123!",
            "full_name": "Good Invitee"
        })
        if resp.status_code == 201:
             print("[PASS] Accepted Admin invite from Owner")
        else:
             print(f"[FAIL] Rejected valid invite! Status: {resp.status_code} - {resp.text}")

        # TEST 5: Accept Invite (Member Invite from Member)
        # Expectation: 201
        print("\n--- Test 5: Accept Invite (Role=Member, Inviter=Member) ---")
        token_mem = secrets.token_urlsafe(32)
        email_mem = f"mem_invite_{secrets.token_hex(2)}@test.com"
        await db.user_invites.insert_one({
            "invite_token": token_mem,
            "org_id": org_id,
            "email": email_mem,
            "role_id": "member",
            "invited_by": member_id, # Member making Member
            "status": "pending",
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
        })
        
        resp = await client.post(f"{BASE_URL}/api/public/invites/accept", json={
            "token": token_mem,
            "password": "Password123!",
            "full_name": "Member Invitee"
        })
        if resp.status_code == 201:
             print("[PASS] Accepted Member invite from Member")
        else:
             print(f"[FAIL] Rejected valid invite! Status: {resp.status_code} - {resp.text}")

    # Cleanup
    # await db.organizations.delete_one({"org_id": org_id})
    # await db.users.delete_many({"email": {"$regex": "@test.com"}}) 
    # ...

if __name__ == "__main__":
    asyncio.run(main())
