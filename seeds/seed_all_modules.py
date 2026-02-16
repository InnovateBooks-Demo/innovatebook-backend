"""
Comprehensive Data Seeding Script for Workforce, Operations, and Capital Modules
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
import os
from uuid import uuid4
import random

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client['innovate_books']

# Sample data
DEPARTMENTS = ["Engineering", "Sales", "Marketing", "Finance", "Operations", "HR"]
DESIGNATIONS = ["Manager", "Senior Engineer", "Engineer", "Associate", "Executive", "Director"]
EMPLOYEE_NAMES = ["Raj Sharma", "Priya Patel", "Amit Kumar", "Sneha Reddy", "Vikram Singh", "Anjali Mehta", "Rohit Gupta", "Pooja Iyer"]
MATERIAL_TYPES = ["Raw Material", "Finished Goods", "Semi-Finished", "Packing Material"]
ASSET_TYPES = ["Machinery", "Equipment", "Vehicle", "Computer", "Furniture"]

async def seed_workforce():
    """Seed workforce data"""
    print("🔄 Seeding Workforce data...")
    
    # Clear existing data
    await db.employees.delete_many({})
    await db.attendance.delete_many({})
    await db.leaves.delete_many({})
    await db.payroll.delete_many({})
    await db.performance.delete_many({})
    await db.goals.delete_many({})
    
    # Employees
    employees = []
    for i in range(20):
        employee = {
            "id": str(uuid4()),
            "employee_code": f"EMP-{1001 + i}",
            "name": random.choice(EMPLOYEE_NAMES),
            "email": f"employee{i+1}@innovatebooks.com",
            "phone": f"+91-{''.join([str(random.randint(0,9)) for _ in range(10)])}",
            "department": random.choice(DEPARTMENTS),
            "designation": random.choice(DESIGNATIONS),
            "date_of_joining": (datetime.utcnow() - timedelta(days=random.randint(30, 1000))).isoformat(),
            "status": "Active",
            "salary": random.randint(30000, 150000),
            "created_at": datetime.utcnow()
        }
        employees.append(employee)
    await db.employees.insert_many(employees)
    print(f"✅ Created {len(employees)} employees")
    
    # Attendance (last 30 days)
    attendance_records = []
    for employee in employees[:10]:
        for day in range(30):
            date = datetime.utcnow() - timedelta(days=day)
            if date.weekday() < 5:  # Weekdays only
                attendance = {
                    "id": str(uuid4()),
                    "employee_id": employee["id"],
                    "employee_name": employee["name"],
                    "date": date.isoformat(),
                    "clock_in": (date.replace(hour=9, minute=random.randint(0,30))).isoformat(),
                    "clock_out": (date.replace(hour=18, minute=random.randint(0,30))).isoformat(),
                    "status": random.choice(["Present", "Present", "Present", "Present", "Late"]),
                    "working_hours": random.uniform(8, 9.5),
                    "marked_at": datetime.utcnow()
                }
                attendance_records.append(attendance)
    await db.attendance.insert_many(attendance_records)
    print(f"✅ Created {len(attendance_records)} attendance records")
    
    # Leaves
    leaves = []
    for i in range(15):
        leave = {
            "id": str(uuid4()),
            "leave_code": f"LV-{2001 + i}",
            "employee_id": random.choice(employees)["id"],
            "employee_name": random.choice(EMPLOYEE_NAMES),
            "leave_type": random.choice(["Casual", "Sick", "Earned"]),
            "from_date": (datetime.utcnow() + timedelta(days=random.randint(1, 30))).isoformat(),
            "to_date": (datetime.utcnow() + timedelta(days=random.randint(31, 35))).isoformat(),
            "days": random.randint(1, 5),
            "reason": "Personal work",
            "status": random.choice(["Pending", "Approved", "Rejected"]),
            "created_at": datetime.utcnow()
        }
        leaves.append(leave)
    await db.leaves.insert_many(leaves)
    print(f"✅ Created {len(leaves)} leave requests")
    
    # Payroll
    payroll_records = []
    for employee in employees:
        for month in range(3):
            payroll = {
                "id": str(uuid4()),
                "employee_id": employee["id"],
                "employee_name": employee["name"],
                "month": (datetime.utcnow() - timedelta(days=month*30)).strftime("%B %Y"),
                "basic_salary": employee["salary"],
                "allowances": employee["salary"] * 0.2,
                "deductions": employee["salary"] * 0.1,
                "net_salary": employee["salary"] * 1.1,
                "status": "Processed",
                "created_at": datetime.utcnow()
            }
            payroll_records.append(payroll)
    await db.payroll.insert_many(payroll_records)
    print(f"✅ Created {len(payroll_records)} payroll records")

async def seed_operations():
    """Seed operations data"""
    print("🔄 Seeding Operations data...")
    
    # Clear existing data
    await db.work_orders.delete_many({})
    await db.inventory.delete_many({})
    await db.materials.delete_many({})
    await db.quality_inspections.delete_many({})
    await db.operation_assets.delete_many({})
    
    # Work Orders
    work_orders = []
    for i in range(25):
        wo = {
            "id": str(uuid4()),
            "wo_number": f"WO-{5001 + i}",
            "product_name": f"Product {chr(65 + i % 10)}",
            "quantity": random.randint(100, 1000),
            "status": random.choice(["Draft", "Released", "In Progress", "Completed"]),
            "priority": random.choice(["Low", "Medium", "High"]),
            "start_date": (datetime.utcnow() - timedelta(days=random.randint(1, 10))).isoformat(),
            "end_date": (datetime.utcnow() + timedelta(days=random.randint(5, 20))).isoformat(),
            "created_at": datetime.utcnow()
        }
        work_orders.append(wo)
    await db.work_orders.insert_many(work_orders)
    print(f"✅ Created {len(work_orders)} work orders")
    
    # Inventory
    inventory_items = []
    for i in range(30):
        item = {
            "id": str(uuid4()),
            "item_code": f"ITM-{1001 + i}",
            "item_name": f"Item {chr(65 + i % 26)}",
            "category": random.choice(MATERIAL_TYPES),
            "quantity_in_stock": random.randint(100, 5000),
            "reorder_level": random.randint(50, 200),
            "unit_price": random.uniform(10, 1000),
            "location": f"Warehouse-{random.randint(1, 3)}",
            "status": random.choice(["In Stock", "Low Stock", "Out of Stock"]),
            "created_at": datetime.utcnow()
        }
        inventory_items.append(item)
    await db.inventory.insert_many(inventory_items)
    print(f"✅ Created {len(inventory_items)} inventory items")
    
    # Materials
    materials = []
    for i in range(20):
        material = {
            "id": str(uuid4()),
            "material_code": f"MAT-{1001 + i}",
            "material_name": f"Material {i+1}",
            "material_type": random.choice(MATERIAL_TYPES),
            "unit_of_measure": random.choice(["KG", "PCS", "LITRE", "METER"]),
            "standard_cost": random.uniform(50, 500),
            "supplier": f"Supplier {chr(65 + i % 5)}",
            "created_at": datetime.utcnow()
        }
        materials.append(material)
    await db.materials.insert_many(materials)
    print(f"✅ Created {len(materials)} materials")
    
    # Quality Inspections
    inspections = []
    for i in range(15):
        inspection = {
            "id": str(uuid4()),
            "inspection_number": f"QI-{1001 + i}",
            "inspection_type": random.choice(["Incoming", "In-Process", "Final"]),
            "work_order": f"WO-{5001 + random.randint(0, 24)}",
            "inspection_date": (datetime.utcnow() - timedelta(days=random.randint(0, 10))).isoformat(),
            "result": random.choice(["Pass", "Fail", "Conditional"]),
            "inspector": random.choice(EMPLOYEE_NAMES),
            "remarks": "Quality check completed",
            "created_at": datetime.utcnow()
        }
        inspections.append(inspection)
    await db.quality_inspections.insert_many(inspections)
    print(f"✅ Created {len(inspections)} quality inspections")
    
    # Assets
    assets = []
    for i in range(15):
        asset = {
            "id": str(uuid4()),
            "asset_code": f"AST-{1001 + i}",
            "asset_name": f"Asset {i+1}",
            "asset_type": random.choice(ASSET_TYPES),
            "purchase_date": (datetime.utcnow() - timedelta(days=random.randint(100, 1000))).isoformat(),
            "purchase_cost": random.uniform(50000, 500000),
            "location": f"Floor-{random.randint(1, 3)}",
            "status": random.choice(["Active", "Under Maintenance", "Idle"]),
            "created_at": datetime.utcnow()
        }
        assets.append(asset)
    await db.operation_assets.insert_many(assets)
    print(f"✅ Created {len(assets)} operation assets")

async def seed_capital():
    """Seed capital data"""
    print("🔄 Seeding Capital data...")
    
    # Clear existing data
    await db.portfolio.delete_many({})
    await db.fixed_assets.delete_many({})
    await db.budgets.delete_many({})
    await db.loans.delete_many({})
    await db.investments.delete_many({})
    
    # Portfolio
    portfolio_items = []
    asset_classes = ["Equity", "Bonds", "Mutual Funds", "Real Estate"]
    for i in range(15):
        item = {
            "id": str(uuid4()),
            "security_name": f"Security {chr(65 + i % 26)}",
            "asset_class": random.choice(asset_classes),
            "quantity": random.randint(10, 1000),
            "purchase_price": random.uniform(100, 5000),
            "current_price": random.uniform(100, 5000),
            "purchase_date": (datetime.utcnow() - timedelta(days=random.randint(30, 365))).isoformat(),
            "current_value": random.uniform(10000, 500000),
            "gain_loss": random.uniform(-50000, 100000),
            "created_at": datetime.utcnow()
        }
        portfolio_items.append(item)
    await db.portfolio.insert_many(portfolio_items)
    print(f"✅ Created {len(portfolio_items)} portfolio items")
    
    # Fixed Assets
    fixed_assets = []
    for i in range(20):
        asset = {
            "id": str(uuid4()),
            "asset_code": f"FA-{1001 + i}",
            "asset_name": f"Fixed Asset {i+1}",
            "asset_category": random.choice(["Land", "Building", "Machinery", "Vehicles", "Furniture"]),
            "purchase_date": (datetime.utcnow() - timedelta(days=random.randint(365, 1825))).isoformat(),
            "purchase_cost": random.uniform(100000, 10000000),
            "accumulated_depreciation": random.uniform(10000, 500000),
            "book_value": random.uniform(50000, 9000000),
            "depreciation_method": random.choice(["SLM", "WDV"]),
            "useful_life": random.randint(5, 20),
            "status": "Active",
            "created_at": datetime.utcnow()
        }
        fixed_assets.append(asset)
    await db.fixed_assets.insert_many(fixed_assets)
    print(f"✅ Created {len(fixed_assets)} fixed assets")
    
    # Budgets
    budgets = []
    for year in [2024, 2025]:
        for dept in DEPARTMENTS:
            budget = {
                "id": str(uuid4()),
                "budget_code": f"BDG-{year}-{dept[:3].upper()}",
                "fiscal_year": str(year),
                "department": dept,
                "total_budget": random.uniform(1000000, 10000000),
                "spent_amount": random.uniform(100000, 8000000),
                "remaining_amount": random.uniform(100000, 2000000),
                "status": "Active",
                "created_at": datetime.utcnow()
            }
            budgets.append(budget)
    await db.budgets.insert_many(budgets)
    print(f"✅ Created {len(budgets)} budgets")
    
    # Loans
    loans = []
    for i in range(8):
        loan = {
            "id": str(uuid4()),
            "loan_number": f"LN-{1001 + i}",
            "loan_type": random.choice(["Term Loan", "Working Capital", "Vehicle Loan"]),
            "lender": f"Bank {chr(65 + i % 5)}",
            "loan_amount": random.uniform(1000000, 50000000),
            "interest_rate": random.uniform(8.5, 12.5),
            "tenure_months": random.randint(12, 60),
            "disbursement_date": (datetime.utcnow() - timedelta(days=random.randint(30, 365))).isoformat(),
            "outstanding_amount": random.uniform(500000, 45000000),
            "emi_amount": random.uniform(50000, 500000),
            "status": "Active",
            "created_at": datetime.utcnow()
        }
        loans.append(loan)
    await db.loans.insert_many(loans)
    print(f"✅ Created {len(loans)} loans")
    
    # Investments
    investments = []
    for i in range(12):
        investment = {
            "id": str(uuid4()),
            "investment_code": f"INV-{1001 + i}",
            "investment_type": random.choice(["Fixed Deposit", "Bonds", "Equity", "Mutual Funds"]),
            "investment_amount": random.uniform(100000, 5000000),
            "investment_date": (datetime.utcnow() - timedelta(days=random.randint(30, 365))).isoformat(),
            "maturity_date": (datetime.utcnow() + timedelta(days=random.randint(365, 1825))).isoformat(),
            "expected_return": random.uniform(8, 15),
            "current_value": random.uniform(100000, 5500000),
            "status": "Active",
            "created_at": datetime.utcnow()
        }
        investments.append(investment)
    await db.investments.insert_many(investments)
    print(f"✅ Created {len(investments)} investments")

async def main():
    print("🚀 Starting comprehensive data seeding...")
    print("="*60)
    
    await seed_workforce()
    print("-"*60)
    await seed_operations()
    print("-"*60)
    await seed_capital()
    
    print("="*60)
    print("✅ All data seeded successfully!")
    
    # Close connection
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
