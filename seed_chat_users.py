"""
Seed script to create multiple demo users for IB Chat
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import uuid
import os
import bcrypt

# Get MongoDB URL from environment
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = "innovate_books_db"

async def seed_chat_users():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("🚀 Seeding IB Chat users...")
    
    # Define users with different roles
    users = [
        {
            "_id": str(uuid.uuid4()),
            "email": "sarah.johnson@innovatebooks.com",
            "full_name": "Sarah Johnson",
            "role": "CEO",
            "status": "active",
            "email_verified": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "_id": str(uuid.uuid4()),
            "email": "michael.chen@innovatebooks.com",
            "full_name": "Michael Chen",
            "role": "CTO",
            "status": "active",
            "email_verified": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "_id": str(uuid.uuid4()),
            "email": "priya.sharma@innovatebooks.com",
            "full_name": "Priya Sharma",
            "role": "Product Manager",
            "status": "active",
            "email_verified": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "_id": str(uuid.uuid4()),
            "email": "david.wilson@innovatebooks.com",
            "full_name": "David Wilson",
            "role": "Senior Developer",
            "status": "active",
            "email_verified": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "_id": str(uuid.uuid4()),
            "email": "emily.davis@innovatebooks.com",
            "full_name": "Emily Davis",
            "role": "UX Designer",
            "status": "active",
            "email_verified": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "_id": str(uuid.uuid4()),
            "email": "james.brown@innovatebooks.com",
            "full_name": "James Brown",
            "role": "Marketing Manager",
            "status": "active",
            "email_verified": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "_id": str(uuid.uuid4()),
            "email": "lisa.anderson@innovatebooks.com",
            "full_name": "Lisa Anderson",
            "role": "HR Manager",
            "status": "active",
            "email_verified": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    # Hash password for all users (using "Demo1234")
    password = "Demo1234"
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
    
    inserted_count = 0
    for user_data in users:
        # Check if user already exists
        existing_user = await db.users.find_one({"email": user_data["email"]})
        if not existing_user:
            user_data["password_hash"] = hashed_password.decode('utf-8')
            await db.users.insert_one(user_data)
            print(f"✅ Created user: {user_data['full_name']} ({user_data['role']})")
            
            # Add to general channel
            general_channel = await db.channels.find_one({"name": "general"})
            if general_channel:
                await db.channels.update_one(
                    {"_id": general_channel["_id"]},
                    {"$addToSet": {"members": user_data["_id"]}}
                )
            
            inserted_count += 1
        else:
            print(f"ℹ️  User already exists: {user_data['email']}")
    
    print(f"\n✅ Seeding complete! Created {inserted_count} new users.")
    print(f"📧 All users can login with password: Demo1234")
    print(f"\n👥 User List:")
    for user_data in users:
        print(f"   - {user_data['email']} ({user_data['role']})")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_chat_users())
