import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

async def check_data():
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ.get('DB_NAME', 'innovate_books')]
    
    collections = [
        ('commerce_leads', 'Leads'),
        ('commerce_evaluate', 'Evaluations'),
        ('commerce_commit', 'Commitments'),
        ('commerce_execute', 'Executions'),
        ('commerce_bills', 'Bills'),
        ('commerce_collect', 'Collections'),
        ('commerce_procure', 'Procurements'),
        ('commerce_pay', 'Payments'),
        ('commerce_spend', 'Expenses'),
        ('commerce_tax', 'Tax'),
        ('commerce_reconcile', 'Reconcile'),
        ('commerce_govern', 'Govern')
    ]
    
    print("=" * 70)
    print("✅ COMMERCE SOLUTION - DATA VERIFICATION")
    print("=" * 70)
    
    total_records = 0
    for collection_name, display_name in collections:
        count = await db[collection_name].count_documents({})
        status = "✅" if count > 0 else "❌"
        print(f"{status} {display_name.ljust(15)}: {str(count).rjust(3)} records")
        total_records += count
    
    print("=" * 70)
    print(f"Total Records Across All Modules: {total_records}")
    print("=" * 70)
    client.close()

asyncio.run(check_data())
