#!/usr/bin/env python3
"""Test MongoDB Atlas Connection with SSL"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import certifi

async def test_connection():
    # MongoDB Atlas connection string with SSL
    mongo_url = "mongodb+srv://revanth_db_user:jsV7MHIVnLm7mfpb@innovatebooks.x17hrss.mongodb.net/innovate_books_db?retryWrites=true&w=majority"
    
    print("Testing MongoDB Atlas Connection...")
    
    try:
        # Connect with SSL certificate
        client = AsyncIOMotorClient(
            mongo_url,
            tlsCAFile=certifi.where(),
            serverSelectionTimeoutMS=10000
        )
        
        # Test connection
        await client.admin.command('ping')
        print("✅ Connected to MongoDB Atlas successfully!")
        
        # Test database access
        db = client.get_default_database()
        collections = await db.list_collection_names()
        print(f"✅ Found {len(collections)} collections")
        
        client.close()
        return True
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False

if __name__ == "__main__":
    asyncio.run(test_connection())
