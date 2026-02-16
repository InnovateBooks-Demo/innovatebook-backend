"""
Seed script to add more demo users to reach at least 10 users
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import uuid
import os
import bcrypt

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = "innovate_books_db"

async def seed_more_users():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("🚀 Adding more demo users...")
    
    # Define additional users to reach 10+ total
    new_users = [
        {
            "_id": str(uuid.uuid4()),
            "email": "robert.martin@innovatebooks.com",
            "full_name": "Robert Martin",
            "role": "Sales Director",
            "status": "active",
            "email_verified": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "_id": str(uuid.uuid4()),
            "email": "amanda.garcia@innovatebooks.com",
            "full_name": "Amanda Garcia",
            "role": "Operations Manager",
            "status": "active",
            "email_verified": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "_id": str(uuid.uuid4()),
            "email": "thomas.lee@innovatebooks.com",
            "full_name": "Thomas Lee",
            "role": "Finance Analyst",
            "status": "active",
            "email_verified": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "_id": str(uuid.uuid4()),
            "email": "sophia.rodriguez@innovatebooks.com",
            "full_name": "Sophia Rodriguez",
            "role": "Customer Success Manager",
            "status": "active",
            "email_verified": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "_id": str(uuid.uuid4()),
            "email": "daniel.kim@innovatebooks.com",
            "full_name": "Daniel Kim",
            "role": "DevOps Engineer",
            "status": "active",
            "email_verified": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "_id": str(uuid.uuid4()),
            "email": "olivia.taylor@innovatebooks.com",
            "full_name": "Olivia Taylor",
            "role": "Content Strategist",
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
    for user_data in new_users:
        # Check if user already exists
        existing_user = await db.users.find_one({"email": user_data["email"]})
        if not existing_user:
            user_data["password_hash"] = hashed_password.decode('utf-8')
            await db.users.insert_one(user_data)
            print(f"✅ Created user: {user_data['full_name']} ({user_data['role']})")
            
            # Add to all channels
            await db.channels.update_many(
                {},
                {"$addToSet": {"members": user_data["_id"]}}
            )
            
            inserted_count += 1
        else:
            print(f"ℹ️  User already exists: {user_data['email']}")
    
    # Count total users
    total_users = await db.users.count_documents({"email": {"$regex": "@innovatebooks.com"}})
    
    print(f"\n✅ Seeding complete! Created {inserted_count} new users.")
    print(f"📊 Total users with @innovatebooks.com: {total_users}")
    print(f"🔑 All users can login with password: Demo1234")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_more_users())
