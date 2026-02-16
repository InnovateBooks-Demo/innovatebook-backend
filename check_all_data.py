import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

async def check_data():
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ.get('DB_NAME', 'innovate_books')]
    
    collections = [
        'leads', 'evaluations', 'commitments', 'executions',
        'bills', 'collections', 'procurements', 'payments',
        'expenses', 'tax_entries', 'reconciliations', 'governance'
    ]
    
    print("=" * 60)
    print("DATA SEEDING VERIFICATION - All Commerce Modules")
    print("=" * 60)
    
    for collection_name in collections:
        count = await db[collection_name].count_documents({})
        status = "✅" if count > 0 else "❌"
        print(f"{status} {collection_name.ljust(20)}: {count} records")
    
    print("=" * 60)
    client.close()

asyncio.run(check_data())
