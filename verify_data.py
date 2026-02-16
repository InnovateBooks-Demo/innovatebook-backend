import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

async def check_data():
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ.get('DB_NAME', 'innovate_books')]
    
    collections = [
        ('commerce_leads', 'Leads'),
        ('commerce_evaluations', 'Evaluations'),
        ('commerce_commitments', 'Commitments'),
        ('commerce_executions', 'Executions'),
        ('commerce_bills', 'Bills'),
        ('commerce_collections', 'Collections'),
        ('commerce_procurements', 'Procurements'),
        ('commerce_payments', 'Payments'),
        ('commerce_expenses', 'Expenses'),
        ('commerce_tax_entries', 'Tax'),
        ('commerce_reconciliations', 'Reconcile'),
        ('commerce_governance', 'Govern')
    ]
    
    print("=" * 70)
    print("DATA VERIFICATION - All Commerce Modules")
    print("=" * 70)
    
    total_records = 0
    for collection_name, display_name in collections:
        count = await db[collection_name].count_documents({})
        status = "✅" if count > 0 else "❌"
        print(f"{status} {display_name.ljust(15)}: {str(count).rjust(3)} records")
        total_records += count
    
    print("=" * 70)
    print(f"Total Records: {total_records}")
    print("=" * 70)
    client.close()

asyncio.run(check_data())
