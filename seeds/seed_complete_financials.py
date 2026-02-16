"""
Complete Financial Data Seeding Script - Companies Act 2013 Compliant
Includes all line items for P&L, Balance Sheet, Cash Flow, Trial Balance, General Ledger
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
import os
from uuid import uuid4

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client['innovate_books']

async def seed_chart_of_accounts():
    """Create comprehensive Chart of Accounts as per Companies Act 2013"""
    print("🔄 Creating Chart of Accounts (Companies Act 2013 compliant)...")
    
    await db.chart_of_accounts.delete_many({})
    
    accounts = [
        # ASSETS - Non-Current Assets
        {"id": str(uuid4()), "account_code": "1000", "account_name": "Non-Current Assets", "account_type": "Asset", "category": "Non-Current Assets", "parent": None, "level": 1},
        {"id": str(uuid4()), "account_code": "1100", "account_name": "Property, Plant and Equipment", "account_type": "Asset", "category": "Fixed Assets", "parent": "1000", "level": 2},
        {"id": str(uuid4()), "account_code": "1101", "account_name": "Land", "account_type": "Asset", "category": "Fixed Assets", "parent": "1100", "level": 3, "balance": 5000000},
        {"id": str(uuid4()), "account_code": "1102", "account_name": "Buildings", "account_type": "Asset", "category": "Fixed Assets", "parent": "1100", "level": 3, "balance": 8000000},
        {"id": str(uuid4()), "account_code": "1103", "account_name": "Plant and Machinery", "account_type": "Asset", "category": "Fixed Assets", "parent": "1100", "level": 3, "balance": 12000000},
        {"id": str(uuid4()), "account_code": "1104", "account_name": "Furniture and Fixtures", "account_type": "Asset", "category": "Fixed Assets", "parent": "1100", "level": 3, "balance": 500000},
        {"id": str(uuid4()), "account_code": "1105", "account_name": "Vehicles", "account_type": "Asset", "category": "Fixed Assets", "parent": "1100", "level": 3, "balance": 2000000},
        {"id": str(uuid4()), "account_code": "1106", "account_name": "Office Equipment", "account_type": "Asset", "category": "Fixed Assets", "parent": "1100", "level": 3, "balance": 300000},
        {"id": str(uuid4()), "account_code": "1107", "account_name": "Computers", "account_type": "Asset", "category": "Fixed Assets", "parent": "1100", "level": 3, "balance": 800000},
        
        {"id": str(uuid4()), "account_code": "1150", "account_name": "Accumulated Depreciation", "account_type": "Asset", "category": "Contra Asset", "parent": "1100", "level": 2},
        {"id": str(uuid4()), "account_code": "1151", "account_name": "Accumulated Depreciation - Buildings", "account_type": "Asset", "category": "Contra Asset", "parent": "1150", "level": 3, "balance": -1600000},
        {"id": str(uuid4()), "account_code": "1152", "account_name": "Accumulated Depreciation - Plant & Machinery", "account_type": "Asset", "category": "Contra Asset", "parent": "1150", "level": 3, "balance": -3600000},
        {"id": str(uuid4()), "account_code": "1153", "account_name": "Accumulated Depreciation - Furniture", "account_type": "Asset", "category": "Contra Asset", "parent": "1150", "level": 3, "balance": -150000},
        {"id": str(uuid4()), "account_code": "1154", "account_name": "Accumulated Depreciation - Vehicles", "account_type": "Asset", "category": "Contra Asset", "parent": "1150", "level": 3, "balance": -600000},
        
        {"id": str(uuid4()), "account_code": "1200", "account_name": "Capital Work in Progress", "account_type": "Asset", "category": "Fixed Assets", "parent": "1000", "level": 2, "balance": 1500000},
        
        {"id": str(uuid4()), "account_code": "1300", "account_name": "Intangible Assets", "account_type": "Asset", "category": "Intangible Assets", "parent": "1000", "level": 2},
        {"id": str(uuid4()), "account_code": "1301", "account_name": "Goodwill", "account_type": "Asset", "category": "Intangible Assets", "parent": "1300", "level": 3, "balance": 2000000},
        {"id": str(uuid4()), "account_code": "1302", "account_name": "Patents", "account_type": "Asset", "category": "Intangible Assets", "parent": "1300", "level": 3, "balance": 500000},
        {"id": str(uuid4()), "account_code": "1303", "account_name": "Trademarks", "account_type": "Asset", "category": "Intangible Assets", "parent": "1300", "level": 3, "balance": 300000},
        {"id": str(uuid4()), "account_code": "1304", "account_name": "Computer Software", "account_type": "Asset", "category": "Intangible Assets", "parent": "1300", "level": 3, "balance": 400000},
        
        {"id": str(uuid4()), "account_code": "1400", "account_name": "Non-Current Investments", "account_type": "Asset", "category": "Investments", "parent": "1000", "level": 2, "balance": 3000000},
        {"id": str(uuid4()), "account_code": "1500", "account_name": "Deferred Tax Assets", "account_type": "Asset", "category": "Deferred Tax", "parent": "1000", "level": 2, "balance": 450000},
        {"id": str(uuid4()), "account_code": "1600", "account_name": "Long Term Loans and Advances", "account_type": "Asset", "category": "Loans & Advances", "parent": "1000", "level": 2, "balance": 800000},
        {"id": str(uuid4()), "account_code": "1700", "account_name": "Other Non-Current Assets", "account_type": "Asset", "category": "Other Assets", "parent": "1000", "level": 2, "balance": 200000},
        
        # ASSETS - Current Assets
        {"id": str(uuid4()), "account_code": "2000", "account_name": "Current Assets", "account_type": "Asset", "category": "Current Assets", "parent": None, "level": 1},
        {"id": str(uuid4()), "account_code": "2100", "account_name": "Inventories", "account_type": "Asset", "category": "Current Assets", "parent": "2000", "level": 2},
        {"id": str(uuid4()), "account_code": "2101", "account_name": "Raw Materials", "account_type": "Asset", "category": "Inventory", "parent": "2100", "level": 3, "balance": 3500000},
        {"id": str(uuid4()), "account_code": "2102", "account_name": "Work in Progress", "account_type": "Asset", "category": "Inventory", "parent": "2100", "level": 3, "balance": 1200000},
        {"id": str(uuid4()), "account_code": "2103", "account_name": "Finished Goods", "account_type": "Asset", "category": "Inventory", "parent": "2100", "level": 3, "balance": 4500000},
        {"id": str(uuid4()), "account_code": "2104", "account_name": "Stores and Spares", "account_type": "Asset", "category": "Inventory", "parent": "2100", "level": 3, "balance": 600000},
        {"id": str(uuid4()), "account_code": "2105", "account_name": "Packing Materials", "account_type": "Asset", "category": "Inventory", "parent": "2100", "level": 3, "balance": 300000},
        
        {"id": str(uuid4()), "account_code": "2200", "account_name": "Trade Receivables", "account_type": "Asset", "category": "Current Assets", "parent": "2000", "level": 2, "balance": 8500000},
        {"id": str(uuid4()), "account_code": "2300", "account_name": "Cash and Cash Equivalents", "account_type": "Asset", "category": "Current Assets", "parent": "2000", "level": 2},
        {"id": str(uuid4()), "account_code": "2301", "account_name": "Cash on Hand", "account_type": "Asset", "category": "Cash", "parent": "2300", "level": 3, "balance": 150000},
        {"id": str(uuid4()), "account_code": "2302", "account_name": "Bank - Current Account", "account_type": "Asset", "category": "Bank", "parent": "2300", "level": 3, "balance": 2500000},
        {"id": str(uuid4()), "account_code": "2303", "account_name": "Bank - Savings Account", "account_type": "Asset", "category": "Bank", "parent": "2300", "level": 3, "balance": 500000},
        {"id": str(uuid4()), "account_code": "2304", "account_name": "Fixed Deposits (Less than 3 months)", "account_type": "Asset", "category": "Bank", "parent": "2300", "level": 3, "balance": 1000000},
        
        {"id": str(uuid4()), "account_code": "2400", "account_name": "Short Term Loans and Advances", "account_type": "Asset", "category": "Current Assets", "parent": "2000", "level": 2, "balance": 400000},
        {"id": str(uuid4()), "account_code": "2500", "account_name": "Other Current Assets", "account_type": "Asset", "category": "Current Assets", "parent": "2000", "level": 2},
        {"id": str(uuid4()), "account_code": "2501", "account_name": "Prepaid Expenses", "account_type": "Asset", "category": "Prepaid", "parent": "2500", "level": 3, "balance": 200000},
        {"id": str(uuid4()), "account_code": "2502", "account_name": "Advance to Suppliers", "account_type": "Asset", "category": "Advances", "parent": "2500", "level": 3, "balance": 500000},
        {"id": str(uuid4()), "account_code": "2503", "account_name": "GST Input Credit", "account_type": "Asset", "category": "Tax", "parent": "2500", "level": 3, "balance": 350000},
        {"id": str(uuid4()), "account_code": "2504", "account_name": "TDS Receivable", "account_type": "Asset", "category": "Tax", "parent": "2500", "level": 3, "balance": 150000},
        
        # EQUITY AND LIABILITIES - Shareholders' Funds
        {"id": str(uuid4()), "account_code": "3000", "account_name": "Shareholders' Funds", "account_type": "Equity", "category": "Equity", "parent": None, "level": 1},
        {"id": str(uuid4()), "account_code": "3100", "account_name": "Share Capital", "account_type": "Equity", "category": "Share Capital", "parent": "3000", "level": 2},
        {"id": str(uuid4()), "account_code": "3101", "account_name": "Equity Share Capital", "account_type": "Equity", "category": "Share Capital", "parent": "3100", "level": 3, "balance": 10000000},
        {"id": str(uuid4()), "account_code": "3102", "account_name": "Preference Share Capital", "account_type": "Equity", "category": "Share Capital", "parent": "3100", "level": 3, "balance": 2000000},
        
        {"id": str(uuid4()), "account_code": "3200", "account_name": "Reserves and Surplus", "account_type": "Equity", "category": "Reserves", "parent": "3000", "level": 2},
        {"id": str(uuid4()), "account_code": "3201", "account_name": "Securities Premium", "account_type": "Equity", "category": "Reserves", "parent": "3200", "level": 3, "balance": 3000000},
        {"id": str(uuid4()), "account_code": "3202", "account_name": "General Reserve", "account_type": "Equity", "category": "Reserves", "parent": "3200", "level": 3, "balance": 5000000},
        {"id": str(uuid4()), "account_code": "3203", "account_name": "Retained Earnings", "account_type": "Equity", "category": "Reserves", "parent": "3200", "level": 3, "balance": 8500000},
        {"id": str(uuid4()), "account_code": "3204", "account_name": "Revaluation Reserve", "account_type": "Equity", "category": "Reserves", "parent": "3200", "level": 3, "balance": 1500000},
        
        # Non-Current Liabilities
        {"id": str(uuid4()), "account_code": "4000", "account_name": "Non-Current Liabilities", "account_type": "Liability", "category": "Non-Current Liabilities", "parent": None, "level": 1},
        {"id": str(uuid4()), "account_code": "4100", "account_name": "Long Term Borrowings", "account_type": "Liability", "category": "Borrowings", "parent": "4000", "level": 2},
        {"id": str(uuid4()), "account_code": "4101", "account_name": "Term Loans from Banks", "account_type": "Liability", "category": "Borrowings", "parent": "4100", "level": 3, "balance": 15000000},
        {"id": str(uuid4()), "account_code": "4102", "account_name": "Debentures", "account_type": "Liability", "category": "Borrowings", "parent": "4100", "level": 3, "balance": 5000000},
        {"id": str(uuid4()), "account_code": "4103", "account_name": "Loans from Directors", "account_type": "Liability", "category": "Borrowings", "parent": "4100", "level": 3, "balance": 2000000},
        
        {"id": str(uuid4()), "account_code": "4200", "account_name": "Deferred Tax Liabilities", "account_type": "Liability", "category": "Deferred Tax", "parent": "4000", "level": 2, "balance": 600000},
        {"id": str(uuid4()), "account_code": "4300", "account_name": "Long Term Provisions", "account_type": "Liability", "category": "Provisions", "parent": "4000", "level": 2},
        {"id": str(uuid4()), "account_code": "4301", "account_name": "Provision for Employee Benefits", "account_type": "Liability", "category": "Provisions", "parent": "4300", "level": 3, "balance": 800000},
        {"id": str(uuid4()), "account_code": "4302", "account_name": "Provision for Gratuity", "account_type": "Liability", "category": "Provisions", "parent": "4300", "level": 3, "balance": 1200000},
        
        # Current Liabilities
        {"id": str(uuid4()), "account_code": "5000", "account_name": "Current Liabilities", "account_type": "Liability", "category": "Current Liabilities", "parent": None, "level": 1},
        {"id": str(uuid4()), "account_code": "5100", "account_name": "Short Term Borrowings", "account_type": "Liability", "category": "Borrowings", "parent": "5000", "level": 2},
        {"id": str(uuid4()), "account_code": "5101", "account_name": "Working Capital Loan", "account_type": "Liability", "category": "Borrowings", "parent": "5100", "level": 3, "balance": 3000000},
        {"id": str(uuid4()), "account_code": "5102", "account_name": "Cash Credit", "account_type": "Liability", "category": "Borrowings", "parent": "5100", "level": 3, "balance": 2000000},
        
        {"id": str(uuid4()), "account_code": "5200", "account_name": "Trade Payables", "account_type": "Liability", "category": "Current Liabilities", "parent": "5000", "level": 2},
        {"id": str(uuid4()), "account_code": "5201", "account_name": "Sundry Creditors", "account_type": "Liability", "category": "Payables", "parent": "5200", "level": 3, "balance": 6500000},
        {"id": str(uuid4()), "account_code": "5202", "account_name": "Bills Payable", "account_type": "Liability", "category": "Payables", "parent": "5200", "level": 3, "balance": 1500000},
        
        {"id": str(uuid4()), "account_code": "5300", "account_name": "Other Current Liabilities", "account_type": "Liability", "category": "Current Liabilities", "parent": "5000", "level": 2},
        {"id": str(uuid4()), "account_code": "5301", "account_name": "Advance from Customers", "account_type": "Liability", "category": "Advances", "parent": "5300", "level": 3, "balance": 800000},
        {"id": str(uuid4()), "account_code": "5302", "account_name": "GST Payable", "account_type": "Liability", "category": "Tax", "parent": "5300", "level": 3, "balance": 450000},
        {"id": str(uuid4()), "account_code": "5303", "account_name": "TDS Payable", "account_type": "Liability", "category": "Tax", "parent": "5300", "level": 3, "balance": 200000},
        {"id": str(uuid4()), "account_code": "5304", "account_name": "Income Tax Payable", "account_type": "Liability", "category": "Tax", "parent": "5300", "level": 3, "balance": 1500000},
        {"id": str(uuid4()), "account_code": "5305", "account_name": "Salary Payable", "account_type": "Liability", "category": "Payables", "parent": "5300", "level": 3, "balance": 600000},
        {"id": str(uuid4()), "account_code": "5306", "account_name": "Statutory Dues Payable", "account_type": "Liability", "category": "Payables", "parent": "5300", "level": 3, "balance": 300000},
        
        {"id": str(uuid4()), "account_code": "5400", "account_name": "Short Term Provisions", "account_type": "Liability", "category": "Provisions", "parent": "5000", "level": 2},
        {"id": str(uuid4()), "account_code": "5401", "account_name": "Provision for Income Tax", "account_type": "Liability", "category": "Provisions", "parent": "5400", "level": 3, "balance": 1200000},
        {"id": str(uuid4()), "account_code": "5402", "account_name": "Provision for Leave Encashment", "account_type": "Liability", "category": "Provisions", "parent": "5400", "level": 3, "balance": 400000},
        
        # INCOME - Revenue from Operations
        {"id": str(uuid4()), "account_code": "6000", "account_name": "Revenue from Operations", "account_type": "Income", "category": "Revenue", "parent": None, "level": 1},
        {"id": str(uuid4()), "account_code": "6100", "account_name": "Sale of Products", "account_type": "Income", "category": "Revenue", "parent": "6000", "level": 2, "balance": 95000000},
        {"id": str(uuid4()), "account_code": "6200", "account_name": "Sale of Services", "account_type": "Income", "category": "Revenue", "parent": "6000", "level": 2, "balance": 15000000},
        {"id": str(uuid4()), "account_code": "6300", "account_name": "Other Operating Revenue", "account_type": "Income", "category": "Revenue", "parent": "6000", "level": 2, "balance": 2000000},
        
        # Other Income
        {"id": str(uuid4()), "account_code": "6500", "account_name": "Other Income", "account_type": "Income", "category": "Other Income", "parent": None, "level": 1},
        {"id": str(uuid4()), "account_code": "6501", "account_name": "Interest Income", "account_type": "Income", "category": "Other Income", "parent": "6500", "level": 2, "balance": 300000},
        {"id": str(uuid4()), "account_code": "6502", "account_name": "Dividend Income", "account_type": "Income", "category": "Other Income", "parent": "6500", "level": 2, "balance": 150000},
        {"id": str(uuid4()), "account_code": "6503", "account_name": "Profit on Sale of Fixed Assets", "account_type": "Income", "category": "Other Income", "parent": "6500", "level": 2, "balance": 100000},
        {"id": str(uuid4()), "account_code": "6504", "account_name": "Foreign Exchange Gain", "account_type": "Income", "category": "Other Income", "parent": "6500", "level": 2, "balance": 80000},
        {"id": str(uuid4()), "account_code": "6505", "account_name": "Miscellaneous Income", "account_type": "Income", "category": "Other Income", "parent": "6500", "level": 2, "balance": 120000},
        
        # EXPENSES - Cost of Revenue
        {"id": str(uuid4()), "account_code": "7000", "account_name": "Cost of Materials Consumed", "account_type": "Expense", "category": "Cost of Goods Sold", "parent": None, "level": 1, "balance": 48000000},
        {"id": str(uuid4()), "account_code": "7100", "account_name": "Purchases of Stock-in-Trade", "account_type": "Expense", "category": "Cost of Goods Sold", "parent": None, "level": 1, "balance": 8000000},
        {"id": str(uuid4()), "account_code": "7200", "account_name": "Changes in Inventories", "account_type": "Expense", "category": "Cost of Goods Sold", "parent": None, "level": 1, "balance": -500000},
        
        # Employee Benefits Expense
        {"id": str(uuid4()), "account_code": "7300", "account_name": "Employee Benefits Expense", "account_type": "Expense", "category": "Operating Expenses", "parent": None, "level": 1},
        {"id": str(uuid4()), "account_code": "7301", "account_name": "Salaries and Wages", "account_type": "Expense", "category": "Employee Cost", "parent": "7300", "level": 2, "balance": 12000000},
        {"id": str(uuid4()), "account_code": "7302", "account_name": "Contribution to PF and Other Funds", "account_type": "Expense", "category": "Employee Cost", "parent": "7300", "level": 2, "balance": 1200000},
        {"id": str(uuid4()), "account_code": "7303", "account_name": "Staff Welfare Expenses", "account_type": "Expense", "category": "Employee Cost", "parent": "7300", "level": 2, "balance": 500000},
        {"id": str(uuid4()), "account_code": "7304", "account_name": "Gratuity Expense", "account_type": "Expense", "category": "Employee Cost", "parent": "7300", "level": 2, "balance": 400000},
        
        # Finance Costs
        {"id": str(uuid4()), "account_code": "7400", "account_name": "Finance Costs", "account_type": "Expense", "category": "Finance Costs", "parent": None, "level": 1},
        {"id": str(uuid4()), "account_code": "7401", "account_name": "Interest on Term Loans", "account_type": "Expense", "category": "Interest", "parent": "7400", "level": 2, "balance": 1800000},
        {"id": str(uuid4()), "account_code": "7402", "account_name": "Interest on Working Capital", "account_type": "Expense", "category": "Interest", "parent": "7400", "level": 2, "balance": 400000},
        {"id": str(uuid4()), "account_code": "7403", "account_name": "Bank Charges", "account_type": "Expense", "category": "Bank Charges", "parent": "7400", "level": 2, "balance": 150000},
        
        # Depreciation and Amortization
        {"id": str(uuid4()), "account_code": "7500", "account_name": "Depreciation and Amortization Expense", "account_type": "Expense", "category": "Depreciation", "parent": None, "level": 1, "balance": 2800000},
        
        # Other Expenses
        {"id": str(uuid4()), "account_code": "7600", "account_name": "Other Expenses", "account_type": "Expense", "category": "Operating Expenses", "parent": None, "level": 1},
        {"id": str(uuid4()), "account_code": "7601", "account_name": "Power and Fuel", "account_type": "Expense", "category": "Utilities", "parent": "7600", "level": 2, "balance": 3500000},
        {"id": str(uuid4()), "account_code": "7602", "account_name": "Rent", "account_type": "Expense", "category": "Rent", "parent": "7600", "level": 2, "balance": 1200000},
        {"id": str(uuid4()), "account_code": "7603", "account_name": "Repairs and Maintenance - Plant", "account_type": "Expense", "category": "Repairs", "parent": "7600", "level": 2, "balance": 800000},
        {"id": str(uuid4()), "account_code": "7604", "account_name": "Repairs and Maintenance - Buildings", "account_type": "Expense", "category": "Repairs", "parent": "7600", "level": 2, "balance": 400000},
        {"id": str(uuid4()), "account_code": "7605", "account_name": "Insurance", "account_type": "Expense", "category": "Insurance", "parent": "7600", "level": 2, "balance": 500000},
        {"id": str(uuid4()), "account_code": "7606", "account_name": "Rates and Taxes", "account_type": "Expense", "category": "Taxes", "parent": "7600", "level": 2, "balance": 300000},
        {"id": str(uuid4()), "account_code": "7607", "account_name": "Legal and Professional Fees", "account_type": "Expense", "category": "Professional Fees", "parent": "7600", "level": 2, "balance": 800000},
        {"id": str(uuid4()), "account_code": "7608", "account_name": "Auditor's Remuneration", "account_type": "Expense", "category": "Professional Fees", "parent": "7600", "level": 2, "balance": 200000},
        {"id": str(uuid4()), "account_code": "7609", "account_name": "Advertisement and Publicity", "account_type": "Expense", "category": "Marketing", "parent": "7600", "level": 2, "balance": 2000000},
        {"id": str(uuid4()), "account_code": "7610", "account_name": "Freight and Forwarding", "account_type": "Expense", "category": "Logistics", "parent": "7600", "level": 2, "balance": 1500000},
        {"id": str(uuid4()), "account_code": "7611", "account_name": "Commission on Sales", "account_type": "Expense", "category": "Sales Expense", "parent": "7600", "level": 2, "balance": 1200000},
        {"id": str(uuid4()), "account_code": "7612", "account_name": "Travelling and Conveyance", "account_type": "Expense", "category": "Travel", "parent": "7600", "level": 2, "balance": 900000},
        {"id": str(uuid4()), "account_code": "7613", "account_name": "Printing and Stationery", "account_type": "Expense", "category": "Office Expense", "parent": "7600", "level": 2, "balance": 150000},
        {"id": str(uuid4()), "account_code": "7614", "account_name": "Telephone and Internet", "account_type": "Expense", "category": "Communication", "parent": "7600", "level": 2, "balance": 200000},
        {"id": str(uuid4()), "account_code": "7615", "account_name": "Loss on Sale of Fixed Assets", "account_type": "Expense", "category": "Other", "parent": "7600", "level": 2, "balance": 50000},
        {"id": str(uuid4()), "account_code": "7616", "account_name": "Bad Debts Written Off", "account_type": "Expense", "category": "Bad Debts", "parent": "7600", "level": 2, "balance": 250000},
        {"id": str(uuid4()), "account_code": "7617", "account_name": "Provision for Doubtful Debts", "account_type": "Expense", "category": "Provisions", "parent": "7600", "level": 2, "balance": 300000},
        {"id": str(uuid4()), "account_code": "7618", "account_name": "Miscellaneous Expenses", "account_type": "Expense", "category": "Other", "parent": "7600", "level": 2, "balance": 400000},
        
        # Tax Expense
        {"id": str(uuid4()), "account_code": "7700", "account_name": "Tax Expense", "account_type": "Expense", "category": "Tax", "parent": None, "level": 1},
        {"id": str(uuid4()), "account_code": "7701", "account_name": "Current Tax", "account_type": "Expense", "category": "Tax", "parent": "7700", "level": 2, "balance": 3500000},
        {"id": str(uuid4()), "account_code": "7702", "account_name": "Deferred Tax", "account_type": "Expense", "category": "Tax", "parent": "7700", "level": 2, "balance": 150000},
    ]
    
    await db.chart_of_accounts.insert_many(accounts)
    print(f"✅ Created {len(accounts)} accounts in Chart of Accounts")
    return accounts

async def seed_journal_entries():
    """Create sample journal entries for the financial year"""
    print("🔄 Creating Journal Entries...")
    
    await db.journal_entries.delete_many({})
    
    # Sample journal entries for the year
    entries = []
    base_date = datetime(2024, 4, 1)  # FY 2024-25
    
    # Opening entry
    entries.append({
        "id": str(uuid4()),
        "journal_number": "JV-2024-0001",
        "date": base_date.isoformat(),
        "description": "Opening Entry for FY 2024-25",
        "type": "Opening",
        "posted": True,
        "entries": [
            {"account_code": "2302", "account_name": "Bank - Current Account", "debit": 2500000, "credit": 0},
            {"account_code": "2101", "account_name": "Raw Materials", "debit": 3500000, "credit": 0},
            {"account_code": "1101", "account_name": "Land", "debit": 5000000, "credit": 0},
            {"account_code": "1102", "account_name": "Buildings", "debit": 8000000, "credit": 0},
            {"account_code": "3101", "account_name": "Equity Share Capital", "debit": 0, "credit": 10000000},
            {"account_code": "3203", "account_name": "Retained Earnings", "debit": 0, "credit": 9000000},
        ],
        "created_at": datetime.utcnow()
    })
    
    # Purchase entries
    for i in range(1, 25):
        date = base_date + timedelta(days=i*10)
        entries.append({
            "id": str(uuid4()),
            "journal_number": f"JV-2024-{1000+i}",
            "date": date.isoformat(),
            "description": f"Purchase of Raw Materials - Invoice #{1000+i}",
            "type": "Purchase",
            "posted": True,
            "entries": [
                {"account_code": "2101", "account_name": "Raw Materials", "debit": 200000, "credit": 0},
                {"account_code": "2503", "account_name": "GST Input Credit", "debit": 36000, "credit": 0},
                {"account_code": "5201", "account_name": "Sundry Creditors", "debit": 0, "credit": 236000},
            ],
            "created_at": datetime.utcnow()
        })
    
    # Sales entries
    for i in range(1, 30):
        date = base_date + timedelta(days=i*8)
        entries.append({
            "id": str(uuid4()),
            "journal_number": f"JV-2024-{2000+i}",
            "date": date.isoformat(),
            "description": f"Sales Invoice #{2000+i}",
            "type": "Sales",
            "posted": True,
            "entries": [
                {"account_code": "2200", "account_name": "Trade Receivables", "debit": 354000, "credit": 0},
                {"account_code": "6100", "account_name": "Sale of Products", "debit": 0, "credit": 300000},
                {"account_code": "5302", "account_name": "GST Payable", "debit": 0, "credit": 54000},
            ],
            "created_at": datetime.utcnow()
        })
    
    # Salary payments
    for month in range(1, 13):
        date = base_date + timedelta(days=month*30)
        entries.append({
            "id": str(uuid4()),
            "journal_number": f"JV-2024-{3000+month}",
            "date": date.isoformat(),
            "description": f"Salary Payment for {date.strftime('%B %Y')}",
            "type": "Payment",
            "posted": True,
            "entries": [
                {"account_code": "7301", "account_name": "Salaries and Wages", "debit": 1000000, "credit": 0},
                {"account_code": "7302", "account_name": "Contribution to PF", "debit": 100000, "credit": 0},
                {"account_code": "2302", "account_name": "Bank - Current Account", "debit": 0, "credit": 900000},
                {"account_code": "5303", "account_name": "TDS Payable", "debit": 0, "credit": 50000},
                {"account_code": "5306", "account_name": "Statutory Dues Payable", "debit": 0, "credit": 150000},
            ],
            "created_at": datetime.utcnow()
        })
    
    await db.journal_entries.insert_many(entries)
    print(f"✅ Created {len(entries)} journal entries")

async def seed_adjustment_entries():
    """Create year-end adjustment entries"""
    print("🔄 Creating Adjustment Entries...")
    
    await db.adjustment_entries.delete_many({})
    
    year_end = datetime(2025, 3, 31)
    
    adjustments = [
        {
            "id": str(uuid4()),
            "entry_number": "ADJ-2025-001",
            "date": year_end.isoformat(),
            "description": "Depreciation on Buildings @ 10% p.a.",
            "type": "Depreciation",
            "posted": True,
            "entries": [
                {"account_code": "7500", "account_name": "Depreciation Expense", "debit": 800000, "credit": 0},
                {"account_code": "1151", "account_name": "Accumulated Depreciation - Buildings", "debit": 0, "credit": 800000},
            ],
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid4()),
            "entry_number": "ADJ-2025-002",
            "date": year_end.isoformat(),
            "description": "Depreciation on Plant & Machinery @ 15% p.a.",
            "type": "Depreciation",
            "posted": True,
            "entries": [
                {"account_code": "7500", "account_name": "Depreciation Expense", "debit": 1800000, "credit": 0},
                {"account_code": "1152", "account_name": "Accumulated Depreciation - Plant", "debit": 0, "credit": 1800000},
            ],
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid4()),
            "entry_number": "ADJ-2025-003",
            "date": year_end.isoformat(),
            "description": "Provision for Doubtful Debts @ 3.5%",
            "type": "Provision",
            "posted": True,
            "entries": [
                {"account_code": "7617", "account_name": "Provision for Doubtful Debts", "debit": 300000, "credit": 0},
                {"account_code": "2200", "account_name": "Trade Receivables", "debit": 0, "credit": 300000},
            ],
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid4()),
            "entry_number": "ADJ-2025-004",
            "date": year_end.isoformat(),
            "description": "Outstanding Salary for March 2025",
            "type": "Accrual",
            "posted": True,
            "entries": [
                {"account_code": "7301", "account_name": "Salaries and Wages", "debit": 600000, "credit": 0},
                {"account_code": "5305", "account_name": "Salary Payable", "debit": 0, "credit": 600000},
            ],
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid4()),
            "entry_number": "ADJ-2025-005",
            "date": year_end.isoformat(),
            "description": "Prepaid Insurance adjustment",
            "type": "Prepayment",
            "posted": True,
            "entries": [
                {"account_code": "2501", "account_name": "Prepaid Expenses", "debit": 200000, "credit": 0},
                {"account_code": "7605", "account_name": "Insurance", "debit": 0, "credit": 200000},
            ],
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid4()),
            "entry_number": "ADJ-2025-006",
            "date": year_end.isoformat(),
            "description": "Provision for Income Tax",
            "type": "Tax",
            "posted": True,
            "entries": [
                {"account_code": "7701", "account_name": "Current Tax", "debit": 3500000, "credit": 0},
                {"account_code": "5401", "account_name": "Provision for Income Tax", "debit": 0, "credit": 3500000},
            ],
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid4()),
            "entry_number": "ADJ-2025-007",
            "date": year_end.isoformat(),
            "description": "Closing Stock adjustment",
            "type": "Inventory",
            "posted": True,
            "entries": [
                {"account_code": "2103", "account_name": "Finished Goods", "debit": 500000, "credit": 0},
                {"account_code": "7200", "account_name": "Changes in Inventories", "debit": 0, "credit": 500000},
            ],
            "created_at": datetime.utcnow()
        },
    ]
    
    await db.adjustment_entries.insert_many(adjustments)
    print(f"✅ Created {len(adjustments)} adjustment entries")

async def main():
    print("🚀 Starting Comprehensive Financial Data Seeding - Companies Act 2013 Compliant")
    print("="*80)
    
    await seed_chart_of_accounts()
    print("-"*80)
    await seed_journal_entries()
    print("-"*80)
    await seed_adjustment_entries()
    
    print("="*80)
    print("✅ All financial data seeded successfully!")
    print("📊 Ready to generate:")
    print("  - Profit & Loss Statement (as per Schedule III)")
    print("  - Balance Sheet (as per Schedule III)")
    print("  - Cash Flow Statement (Indirect Method)")
    print("  - Trial Balance")
    print("  - General Ledger")
    print("  - Adjustment Entries Register")
    
    # Close connection
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
