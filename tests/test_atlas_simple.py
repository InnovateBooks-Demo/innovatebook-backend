#!/usr/bin/env python3
"""Simple MongoDB Atlas Test"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import ssl

async def test():
    # Try with explicit SSL context
    mongo_url = "mongodb+srv://revanth_db_user:jsV7MHIVnLm7mfpb@innovatebooks.x17hrss.mongodb.net/?retryWrites=true&w=majority"
    
    print("Testing MongoDB Atlas with different SSL approaches...\n")
    
    # Approach 1: Default SSL
    print("[1] Testing with default SSL...")
    try:
        client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=5000)
        await client.admin.command('ping')
        print("✅ Default SSL works!")
        client.close()
        return True
    except Exception as e:
        print(f"❌ Default SSL failed: {type(e).__name__}")
    
    # Approach 2: Disable SSL verification (NOT for production)
    print("\n[2] Testing with SSL verification disabled...")
    try:
        client = AsyncIOMotorClient(
            mongo_url,
            tls=True,
            tlsAllowInvalidCertificates=True,
            serverSelectionTimeoutMS=5000
        )
        await client.admin.command('ping')
        print("✅ SSL with invalid certs allowed works!")
        
        # Test database access
        db = client.innovate_books_db
        count = await db.organizations.count_documents({})
        print(f"✅ Can access database: {count} organizations")
        
        client.close()
        return True
    except Exception as e:
        print(f"❌ SSL disabled failed: {type(e).__name__}: {str(e)[:100]}")
    
    # Approach 3: Custom SSL context
    print("\n[3] Testing with custom SSL context...")
    try:
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        
        client = AsyncIOMotorClient(
            mongo_url,
            tlsContext=ssl_context,
            serverSelectionTimeoutMS=5000
        )
        await client.admin.command('ping')
        print("✅ Custom SSL context works!")
        client.close()
        return True
    except Exception as e:
        print(f"❌ Custom SSL failed: {type(e).__name__}: {str(e)[:100]}")
    
    return False

if __name__ == "__main__":
    result = asyncio.run(test())
    if not result:
        print("\n❌ All approaches failed - SSL/TLS issue persists")
