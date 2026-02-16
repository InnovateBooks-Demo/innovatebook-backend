#!/usr/bin/env python3
"""
Full Category Master CSV Loader
Loads all 800 categories from the CSV file into MongoDB
"""

import asyncio
import csv
import os
import requests
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from io import StringIO

# MongoDB connection
MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.getenv('DB_NAME', 'innovate_books_db')
CSV_URL = "https://customer-assets.emergentagent.com/job_cashflow-pro-18/artifacts/ilvt0nxe_Category%20Master%20-%20CATEGORY%20MASTER.csv"

async def load_full_category_master():
    """Load all 800 categories from CSV"""
    
    print("📥 Downloading Category Master CSV...")
    response = requests.get(CSV_URL)
    response.raise_for_status()
    
    # Parse CSV
    csv_content = StringIO(response.text)
    reader = csv.DictReader(csv_content)
    
    categories = []
    for row in reader:
        category = {
            'id': row['id'],
            'category_name': row['category_name'],
            'coa_account': row['coa_account'],
            'fs_head': row['fs_head'],
            'statement_type': row['statement_type'],
            'cashflow_activity': row['cashflow_activity'],
            'cashflow_flow': row['cashflow_flow'],
            'cashflow_category': row['cashflow_category'],
            'industry_tags': row['industry_tags'],
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        categories.append(category)
    
    print(f"✅ Parsed {len(categories)} categories from CSV")
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Drop existing collection
    await db.category_master.drop()
    print("🗑️  Dropped existing category_master collection")
    
    # Insert all categories
    if categories:
        result = await db.category_master.insert_many(categories)
        print(f"✅ Inserted {len(result.inserted_ids)} categories into MongoDB")
        
        # Create indexes
        await db.category_master.create_index('id', unique=True)
        await db.category_master.create_index('cashflow_activity')
        await db.category_master.create_index('cashflow_flow')
        await db.category_master.create_index('statement_type')
        await db.category_master.create_index('category_name')  # Non-unique since CSV has duplicates
        print("✅ Created indexes on category_master collection")
        
        # Print summary
        pipeline = [
            {"$group": {
                "_id": "$cashflow_activity",
                "count": {"$sum": 1}
            }},
            {"$sort": {"count": -1}}
        ]
        
        summary = []
        async for doc in db.category_master.aggregate(pipeline):
            summary.append(doc)
        
        print("\n📊 Category Distribution:")
        for item in summary:
            print(f"   {item['_id']}: {item['count']} categories")
    
    client.close()
    print("\n✅ Full Category Master loaded successfully!")

if __name__ == "__main__":
    asyncio.run(load_full_category_master())
