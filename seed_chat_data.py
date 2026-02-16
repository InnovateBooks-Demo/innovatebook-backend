"""
Seed script for IB Chat demo data
Creates default channels and sample messages
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import uuid
import os

# Get MongoDB URL from environment
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = "innovate_books_db"

async def seed_chat_data():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("🚀 Seeding IB Chat data...")
    
    # Get the demo user
    demo_user = await db.users.find_one({"email": "demo@innovatebooks.com"})
    if not demo_user:
        print("❌ Demo user not found! Please run the main seed script first.")
        return
    
    user_id = demo_user["_id"]
    print(f"✅ Found demo user: {demo_user.get('full_name', 'Demo User')}")
    
    # Create default channels
    now = datetime.now(timezone.utc)
    
    channels = [
        {
            "_id": str(uuid.uuid4()),
            "name": "general",
            "description": "General discussion for the team",
            "type": "public",
            "creator_id": user_id,
            "members": [user_id],
            "created_at": now.isoformat(),
            "updated_at": now.isoformat()
        },
        {
            "_id": str(uuid.uuid4()),
            "name": "random",
            "description": "Random chats and fun stuff",
            "type": "public",
            "creator_id": user_id,
            "members": [user_id],
            "created_at": now.isoformat(),
            "updated_at": now.isoformat()
        },
        {
            "_id": str(uuid.uuid4()),
            "name": "announcements",
            "description": "Important company announcements",
            "type": "public",
            "creator_id": user_id,
            "members": [user_id],
            "created_at": now.isoformat(),
            "updated_at": now.isoformat()
        }
    ]
    
    # Check if channels already exist
    existing_channels = await db.channels.count_documents({})
    if existing_channels == 0:
        await db.channels.insert_many(channels)
        print(f"✅ Created {len(channels)} default channels")
    else:
        print(f"ℹ️  Channels already exist ({existing_channels} channels)")
    
    # Create welcome messages for general channel
    general_channel = await db.channels.find_one({"name": "general"})
    if general_channel:
        existing_messages = await db.messages.count_documents({"channel_id": general_channel["_id"]})
        if existing_messages == 0:
            welcome_messages = [
                {
                    "_id": str(uuid.uuid4()),
                    "channel_id": general_channel["_id"],
                    "user_id": user_id,
                    "user_name": demo_user.get("full_name", "Demo User"),
                    "user_avatar": None,
                    "content": "Welcome to IB Chat! 🎉 This is a complete enterprise chat application with Slack/Teams features.",
                    "type": "text",
                    "parent_id": None,
                    "mentions": [],
                    "reactions": [],
                    "file_url": None,
                    "file_name": None,
                    "edited": False,
                    "created_at": now.isoformat(),
                    "updated_at": now.isoformat()
                },
                {
                    "_id": str(uuid.uuid4()),
                    "channel_id": general_channel["_id"],
                    "user_id": user_id,
                    "user_name": demo_user.get("full_name", "Demo User"),
                    "user_avatar": None,
                    "content": "Features include: Real-time messaging, File sharing, Emoji reactions, Direct messages, and much more!",
                    "type": "text",
                    "parent_id": None,
                    "mentions": [],
                    "reactions": [
                        {"emoji": "👍", "user_ids": [user_id], "count": 1},
                        {"emoji": "🚀", "user_ids": [user_id], "count": 1}
                    ],
                    "file_url": None,
                    "file_name": None,
                    "edited": False,
                    "created_at": now.isoformat(),
                    "updated_at": now.isoformat()
                }
            ]
            await db.messages.insert_many(welcome_messages)
            print(f"✅ Created welcome messages in #general")
        else:
            print(f"ℹ️  Messages already exist in #general")
    
    print("✅ IB Chat seeding complete!")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_chat_data())
