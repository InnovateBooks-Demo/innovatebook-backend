import sys
import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load env
load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'backend', '.env'))

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'innovate_books_db')

async def check_user_state(email):
    print(f"\n--- Checking state for: {repr(email)} ---")
    print(f"DB: {DB_NAME}")
    
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Check User
    user = await db.users.find_one({"email": email})
    if not user:
        print("❌ User NOT FOUND in 'users' collection")
    else:
        print("✅ User FOUND")
        print(f"  _id: {user.get('_id')}")
        print(f"  user_id: {user.get('user_id')}")
        print(f"  status: {user.get('status')}")
        print(f"  email_verified: {user.get('email_verified')}")
        
        pw_hash = user.get('password_hash', '')
        print(f"  password_hash prefix: {repr(pw_hash[:4])}")
        print(f"  Starts with $2: {pw_hash.startswith('$2')}")
        
        # Check Mappings
        mappings_cursor = db.org_users.find({"user_id": user.get("user_id")})
        mappings = await mappings_cursor.to_list(length=100)
        
        print(f"\n✅ Org Mappings Found: {len(mappings)}")
        for m in mappings:
            print(f"  - Org: {m.get('org_id')}, Status: {m.get('status')}, Role: {m.get('role')}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python verify_invite_login_state.py <email>")
        sys.exit(1)
        
    email = sys.argv[1]
    asyncio.run(check_user_state(email))
