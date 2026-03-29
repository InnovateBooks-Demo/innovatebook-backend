from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import os

async def main():
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'innovate_books_db')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print(f"Connecting to {db_name}...")
    await db.revenue_workflow_onboarding.create_index("contract_id", unique=True)
    print("SUCCESS: Index on revenue_workflow_onboarding.contract_id created.")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
