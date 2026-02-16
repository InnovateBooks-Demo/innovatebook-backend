"""
Seed Users for Lead Assignment
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'innovate_books_db')


async def seed_users():
    """Create users for lead assignment"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    users = [
        {
            "user_id": "USER-001",
            "name": "Rajesh Kumar",
            "email": "rajesh.kumar@innovatebooks.com",
            "role": "Sales Manager",
            "department": "Sales",
            "phone": "+91-98765-43210",
            "status": "Active",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "user_id": "USER-002",
            "name": "Priya Sharma",
            "email": "priya.sharma@innovatebooks.com",
            "role": "Sales Executive",
            "department": "Sales",
            "phone": "+91-98765-43211",
            "status": "Active",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "user_id": "USER-003",
            "name": "Amit Patel",
            "email": "amit.patel@innovatebooks.com",
            "role": "Account Manager",
            "department": "Sales",
            "phone": "+91-98765-43212",
            "status": "Active",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "user_id": "USER-004",
            "name": "Neha Singh",
            "email": "neha.singh@innovatebooks.com",
            "role": "Sales Executive",
            "department": "Sales",
            "phone": "+91-98765-43213",
            "status": "Active",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "user_id": "TEAM-001",
            "name": "Sales Team",
            "email": "sales@innovatebooks.com",
            "role": "Team",
            "department": "Sales",
            "phone": "+91-98765-43200",
            "status": "Active",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    # Clear existing users
    await db.users.delete_many({})
    
    # Insert users
    result = await db.users.insert_many(users)
    
    print(f"✅ Seeded {len(result.inserted_ids)} users")
    for user in users:
        print(f"   - {user['name']} ({user['role']})")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(seed_users())
