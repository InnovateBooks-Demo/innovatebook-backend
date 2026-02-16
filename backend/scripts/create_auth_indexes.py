import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
import pymongo

# Configuration
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "innovate_books_db")

async def create_indexes():
    print(f"Connecting to {MONGO_URL} / {DB_NAME}...")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    print("Creating indexes...")

    # 1. Unique index on users.email
    # Note: partialFilterExpression allows for users where email might be missing temporarily if that's a case, 
    # but here we want strict uniqueness.
    try:
        await db.users.create_index(
            [("email", pymongo.ASCENDING)],
            unique=True,
            name="unique_email_idx"
        )
        print("✅ Created unique index on users.email")
    except Exception as e:
        print(f"⚠️ Could not create users.email index: {e}")

    # 2. Unique compound index on org_users(user_id, org_id)
    try:
        await db.org_users.create_index(
            [("user_id", pymongo.ASCENDING), ("org_id", pymongo.ASCENDING)],
            unique=True,
            name="unique_org_membership_idx"
        )
        print("✅ Created unique index on org_users(user_id, org_id)")
    except Exception as e:
        print(f"⚠️ Could not create org_users(user_id, org_id) index: {e}")

if __name__ == "__main__":
    asyncio.run(create_indexes())
