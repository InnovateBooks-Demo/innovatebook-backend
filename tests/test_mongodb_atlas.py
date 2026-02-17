#!/usr/bin/env python3
"""Test MongoDB Atlas Connection"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

async def test_connection():
    # MongoDB Atlas connection string
    mongo_url = "mongodb+srv://revanth_db_user:jsV7MHIVnLm7mfpb@innovatebooks.x17hrss.mongodb.net/"
    db_name = "innovate_books_db"
    
    print("=" * 80)
    print("TESTING MONGODB ATLAS CONNECTION")
    print("=" * 80)
    
    try:
        # Connect
        print("\n[1] Connecting to MongoDB Atlas...")
        client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=5000)
        db = client[db_name]
        
        # Test connection
        await client.admin.command('ping')
        print("✅ Connected to MongoDB Atlas successfully")
        
        # List collections
        print("\n[2] Listing collections...")
        collections = await db.list_collection_names()
        print(f"✅ Found {len(collections)} collections")
        
        # Check organizations
        print("\n[3] Checking organizations...")
        org_count = await db.organizations.count_documents({})
        print(f"✅ Organizations: {org_count}")
        
        if org_count > 0:
            orgs = await db.organizations.find({}, {"_id": 0, "org_id": 1, "org_name": 1}).to_list(10)
            for org in orgs:
                print(f"   - {org.get('org_name')} ({org.get('org_id')})")
        
        # Check enterprise_users
        print("\n[4] Checking enterprise_users...")
        user_count = await db.enterprise_users.count_documents({})
        print(f"✅ Enterprise Users: {user_count}")
        
        # Check customers
        print("\n[5] Checking customers...")
        customer_count = await db.customers.count_documents({})
        print(f"✅ Customers: {customer_count}")
        
        # Group by org_id
        pipeline = [
            {"$group": {"_id": "$org_id", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        result = await db.customers.aggregate(pipeline).to_list(10)
        print("\n   Customers by organization:")
        for item in result:
            print(f"   - {item['_id']}: {item['count']} customers")
        
        print("\n" + "=" * 80)
        print("✅ MONGODB ATLAS CONNECTION TEST PASSED")
        print("=" * 80)
        
        client.close()
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_connection())
