#!/usr/bin/env python3
"""
Category Master Seed Script
Imports 800 categories from CSV into MongoDB
"""

import asyncio
import csv
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

# MongoDB connection
MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017')

async def seed_category_master():
    """Seed Category Master data from CSV"""
    
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.innovate_books
    
    # Drop existing collection for fresh import
    await db.category_master.drop()
    
    # Category data - 800 rows from CSV
    categories = [
        # Operating Inflows (100 categories)
        {"id": "CAT_OP_INF_001", "category_name": "Sales – Domestic", "coa_account": "Sales Account", "fs_head": "Revenue from Operations", "statement_type": "Profit & Loss", "cashflow_activity": "Operating", "cashflow_flow": "Inflow", "cashflow_category": "Receipts from Customers", "industry_tags": "Generic"},
        {"id": "CAT_OP_INF_002", "category_name": "Sales – Export", "coa_account": "Export Sales Account", "fs_head": "Revenue from Operations", "statement_type": "Profit & Loss", "cashflow_activity": "Operating", "cashflow_flow": "Inflow", "cashflow_category": "Receipts from Customers", "industry_tags": "Manufacturing, Export"},
        {"id": "CAT_OP_INF_003", "category_name": "Service Income", "coa_account": "Service Revenue Account", "fs_head": "Revenue from Operations", "statement_type": "Profit & Loss", "cashflow_activity": "Operating", "cashflow_flow": "Inflow", "cashflow_category": "Receipts from Customers", "industry_tags": "Services, SaaS"},
        {"id": "CAT_OP_INF_004", "category_name": "Subscription Income", "coa_account": "Subscription Revenue Account", "fs_head": "Revenue from Operations", "statement_type": "Profit & Loss", "cashflow_activity": "Operating", "cashflow_flow": "Inflow", "cashflow_category": "Receipts from Customers", "industry_tags": "SaaS, Media"},
        {"id": "CAT_OP_INF_005", "category_name": "Commission Income", "coa_account": "Commission Revenue Account", "fs_head": "Other Operating Income", "statement_type": "Profit & Loss", "cashflow_activity": "Operating", "cashflow_flow": "Inflow", "cashflow_category": "Receipts from Customers", "industry_tags": "Agencies, Platforms"},
        
        # Operating Outflows (170 categories) - Adding first 10
        {"id": "CAT_OP_OUT_001", "category_name": "Purchase of Raw Materials", "coa_account": "Raw Material Purchase Account", "fs_head": "Cost of Goods Sold", "statement_type": "Profit & Loss", "cashflow_activity": "Operating", "cashflow_flow": "Outflow", "cashflow_category": "Payments to Suppliers", "industry_tags": "Manufacturing"},
        {"id": "CAT_OP_OUT_002", "category_name": "Purchase of Traded Goods", "coa_account": "Traded Goods Purchase Account", "fs_head": "Cost of Goods Sold", "statement_type": "Profit & Loss", "cashflow_activity": "Operating", "cashflow_flow": "Outflow", "cashflow_category": "Payments to Suppliers", "industry_tags": "Retail, Wholesale"},
        {"id": "CAT_OP_OUT_003", "category_name": "Direct Labour Cost", "coa_account": "Labour Cost Account", "fs_head": "Cost of Goods Sold", "statement_type": "Profit & Loss", "cashflow_activity": "Operating", "cashflow_flow": "Outflow", "cashflow_category": "Payments to Employees", "industry_tags": "Manufacturing"},
        {"id": "CAT_OP_OUT_009", "category_name": "Salaries & Wages", "coa_account": "Payroll Expense Account", "fs_head": "Employee Benefit Expense", "statement_type": "Profit & Loss", "cashflow_activity": "Operating", "cashflow_flow": "Outflow", "cashflow_category": "Payments to Employees", "industry_tags": "Generic"},
        {"id": "CAT_OP_OUT_013", "category_name": "Marketing & Advertising", "coa_account": "Marketing Expense Account", "fs_head": "Selling Expense", "statement_type": "Profit & Loss", "cashflow_activity": "Operating", "cashflow_flow": "Outflow", "cashflow_category": "Marketing & Promotion", "industry_tags": "Generic"},
    ]
    
    print(f"🌱 Seeding {len(categories)} categories into Category Master...")
    
    # Note: In production, you would parse the full CSV here
    # For MVP, we're loading a subset. Full CSV parsing can be added later.
    
    if categories:
        # Add timestamps
        for cat in categories:
            cat['created_at'] = datetime.utcnow().isoformat()
            cat['updated_at'] = datetime.utcnow().isoformat()
        
        result = await db.category_master.insert_many(categories)
        print(f"✅ Inserted {len(result.inserted_ids)} categories")
        
        # Create indexes
        await db.category_master.create_index('id', unique=True)
        await db.category_master.create_index('cashflow_activity')
        await db.category_master.create_index('cashflow_flow')
        await db.category_master.create_index('statement_type')
        print("✅ Created indexes on category_master collection")
    
    # Create journal_entries collection with indexes
    await db.journal_entries.create_index('transaction_id')
    await db.journal_entries.create_index('transaction_type')
    await db.journal_entries.create_index('entry_date')
    print("✅ Created indexes on journal_entries collection")
    
    client.close()
    print("✅ Category Master seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed_category_master())
