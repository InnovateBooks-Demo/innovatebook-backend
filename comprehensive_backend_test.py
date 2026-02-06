#!/usr/bin/env python3
"""
COMPREHENSIVE BACKEND TESTING FOR ALL 3 PHASES
Tests all financial reporting endpoints, invoice/bill creation with categories, and data validation
"""

import requests
import json
import sys
from datetime import datetime, timezone, timedelta
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Configuration - Use external URL as specified in review
BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://saas-finint.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

# Test credentials as specified in review
TEST_EMAIL = "demo@innovatebooks.com"
TEST_PASSWORD = os.getenv("TEST_PASSWORD", "Test1234")   # or demo123 as default


class ComprehensiveBackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_results = {
            'passed': 0,
            'failed': 0,
            'errors': [],
            'phase_results': {
                'phase1': {'passed': 0, 'failed': 0, 'tests': []},
                'phase2': {'passed': 0, 'failed': 0, 'tests': []},
                'phase3': {'passed': 0, 'failed': 0, 'tests': []}
            }
        }
        self.created_invoices = []
        self.created_bills = []
    
    def log_result(self, test_name, success, message="", phase="general"):
        """Log test result with phase tracking"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if message:
            print(f"   {message}")
        
        if success:
            self.test_results['passed'] += 1
            if phase in self.test_results['phase_results']:
                self.test_results['phase_results'][phase]['passed'] += 1
                self.test_results['phase_results'][phase]['tests'].append(f"✅ {test_name}")
        else:
            self.test_results['failed'] += 1
            self.test_results['errors'].append(f"{test_name}: {message}")
            if phase in self.test_results['phase_results']:
                self.test_results['phase_results'][phase]['failed'] += 1
                self.test_results['phase_results'][phase]['tests'].append(f"❌ {test_name}: {message}")
        print()
    
    def authenticate(self):
        """Authenticate with demo credentials"""
        print("🔐 Authenticating with demo credentials...")
        
        try:
            response = self.session.post(
                f"{API_BASE}/auth/login",
                json={
                    "email": TEST_EMAIL,
                    "password": TEST_PASSWORD
                },
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data.get('access_token')
                self.session.headers.update({
                    'Authorization': f'Bearer {self.auth_token}'
                })
                user_info = data.get('user', {})
                self.log_result("Authentication", True, f"Logged in as {user_info.get('email', 'Unknown')} - {user_info.get('role', 'Unknown Role')}")
                return True
            else:
                self.log_result("Authentication", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Authentication", False, f"Exception: {str(e)}")
            return False

    # ==================== PHASE 1: FINANCIAL REPORTING ENDPOINTS ====================
    
    def test_profit_loss_report(self):
        """Test GET /api/reports/profit-loss"""
        print("📊 Testing Profit & Loss Report...")
        try:
            # Test with date range parameters
            end_date = datetime.now().strftime('%Y-%m-%d')
            start_date = (datetime.now() - timedelta(days=90)).strftime('%Y-%m-%d')
            
            response = self.session.get(
                f"{API_BASE}/reports/profit-loss?start_date={start_date}&end_date={end_date}",
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify response structure
                required_sections = ['revenue', 'cogs', 'gross_profit', 'operating_expenses', 'operating_profit', 'other_income', 'other_expenses', 'net_profit']
                missing_sections = [section for section in required_sections if section not in data]
                
                if missing_sections:
                    self.log_result("Profit & Loss Report - Structure", False, f"Missing sections: {missing_sections}", "phase1")
                    return False
                
                # Verify each section has items and totals
                for section in ['revenue', 'operating_expenses']:
                    section_data = data.get(section, {})
                    if 'items' not in section_data or 'total' not in section_data:
                        self.log_result("Profit & Loss Report - Section Structure", False, f"{section} missing items or total", "phase1")
                        return False
                
                # Verify calculations
                revenue_total = data.get('revenue', {}).get('total', 0)
                cogs_total = data.get('cogs', {}).get('total', 0)
                gross_profit = data.get('gross_profit', 0)
                
                if abs(gross_profit - (revenue_total - cogs_total)) > 0.01:
                    self.log_result("Profit & Loss Report - Calculations", False, f"Gross profit calculation error: {gross_profit} != {revenue_total} - {cogs_total}", "phase1")
                    return False
                
                self.log_result("Profit & Loss Report", True, f"Revenue: ₹{revenue_total:,.2f}, Gross Profit: ₹{gross_profit:,.2f}, Net Profit: ₹{data.get('net_profit', 0):,.2f}", "phase1")
                return True
                
            else:
                self.log_result("Profit & Loss Report", False, f"Status: {response.status_code}, Response: {response.text}", "phase1")
                return False
                
        except Exception as e:
            self.log_result("Profit & Loss Report", False, f"Exception: {str(e)}", "phase1")
            return False
    
    def test_balance_sheet_report(self):
        """Test GET /api/reports/balance-sheet"""
        print("📊 Testing Balance Sheet Report...")
        try:
            # Test with as_of_date parameter
            as_of_date = datetime.now().strftime('%Y-%m-%d')
            
            response = self.session.get(
                f"{API_BASE}/reports/balance-sheet?as_of_date={as_of_date}",
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify response structure
                required_sections = ['assets', 'liabilities', 'equity']
                missing_sections = [section for section in required_sections if section not in data]
                
                if missing_sections:
                    self.log_result("Balance Sheet Report - Structure", False, f"Missing sections: {missing_sections}", "phase1")
                    return False
                
                # Verify assets structure
                assets = data.get('assets', {})
                if 'current_assets' not in assets or 'non_current_assets' not in assets:
                    self.log_result("Balance Sheet Report - Assets Structure", False, "Missing current_assets or non_current_assets", "phase1")
                    return False
                
                # Verify liabilities structure
                liabilities = data.get('liabilities', {})
                if 'current_liabilities' not in liabilities or 'non_current_liabilities' not in liabilities:
                    self.log_result("Balance Sheet Report - Liabilities Structure", False, "Missing current_liabilities or non_current_liabilities", "phase1")
                    return False
                
                # Verify balance sheet equation: Assets = Liabilities + Equity
                total_assets = assets.get('total', 0)
                total_liabilities = liabilities.get('total', 0)
                total_equity = data.get('equity', {}).get('total', 0)
                
                if abs(total_assets - (total_liabilities + total_equity)) > 0.01:
                    self.log_result("Balance Sheet Report - Balance Check", False, f"Balance sheet not balanced: Assets {total_assets} != Liabilities {total_liabilities} + Equity {total_equity}", "phase1")
                    return False
                
                self.log_result("Balance Sheet Report", True, f"Assets: ₹{total_assets:,.2f}, Liabilities: ₹{total_liabilities:,.2f}, Equity: ₹{total_equity:,.2f} (Balanced)", "phase1")
                return True
                
            else:
                self.log_result("Balance Sheet Report", False, f"Status: {response.status_code}, Response: {response.text}", "phase1")
                return False
                
        except Exception as e:
            self.log_result("Balance Sheet Report", False, f"Exception: {str(e)}", "phase1")
            return False
    
    def test_cash_flow_report(self):
        """Test GET /api/reports/cashflow-statement"""
        print("📊 Testing Cash Flow Report...")
        try:
            # Test with date range parameters
            end_date = datetime.now().strftime('%Y-%m-%d')
            start_date = (datetime.now() - timedelta(days=90)).strftime('%Y-%m-%d')
            
            response = self.session.get(
                f"{API_BASE}/reports/cashflow-statement?start_date={start_date}&end_date={end_date}",
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify response structure
                required_sections = ['opening_cash', 'operating_activities', 'investing_activities', 'financing_activities', 'net_change', 'closing_cash']
                missing_sections = [section for section in required_sections if section not in data]
                
                if missing_sections:
                    self.log_result("Cash Flow Report - Structure", False, f"Missing sections: {missing_sections}", "phase1")
                    return False
                
                # Verify each activity section has proper structure
                for activity in ['operating_activities', 'investing_activities', 'financing_activities']:
                    activity_data = data.get(activity, {})
                    if 'net' not in activity_data:
                        self.log_result("Cash Flow Report - Activity Structure", False, f"{activity} missing net field", "phase1")
                        return False
                
                # Verify cash flow reconciliation: opening_cash + net_change = closing_cash
                opening_balance = data.get('opening_cash', 0)
                net_change = data.get('net_change', 0)
                closing_balance = data.get('closing_cash', 0)
                
                if abs(closing_balance - (opening_balance + net_change)) > 0.01:
                    self.log_result("Cash Flow Report - Reconciliation", False, f"Cash flow not reconciled: {closing_balance} != {opening_balance} + {net_change}", "phase1")
                    return False
                
                operating_total = data.get('operating_activities', {}).get('net', 0)
                investing_total = data.get('investing_activities', {}).get('net', 0)
                financing_total = data.get('financing_activities', {}).get('net', 0)
                
                self.log_result("Cash Flow Report", True, f"Opening: ₹{opening_balance:,.2f}, Operating: ₹{operating_total:,.2f}, Net Change: ₹{net_change:,.2f}, Closing: ₹{closing_balance:,.2f}", "phase1")
                return True
                
            else:
                self.log_result("Cash Flow Report", False, f"Status: {response.status_code}, Response: {response.text}", "phase1")
                return False
                
        except Exception as e:
            self.log_result("Cash Flow Report", False, f"Exception: {str(e)}", "phase1")
            return False
    
    def test_trial_balance_report(self):
        """Test GET /api/reports/trial-balance"""
        print("📊 Testing Trial Balance Report...")
        try:
            # Test with date range parameters
            end_date = datetime.now().strftime('%Y-%m-%d')
            start_date = (datetime.now() - timedelta(days=90)).strftime('%Y-%m-%d')
            
            response = self.session.get(
                f"{API_BASE}/reports/trial-balance?start_date={start_date}&end_date={end_date}",
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify response structure
                if 'accounts' not in data or 'totals' not in data:
                    self.log_result("Trial Balance Report - Structure", False, "Missing accounts or totals", "phase1")
                    return False
                
                accounts = data.get('accounts', [])
                totals = data.get('totals', {})
                
                # Verify accounts structure
                if accounts and len(accounts) > 0:
                    first_account = accounts[0]
                    required_fields = ['account', 'debit', 'credit', 'balance']
                    missing_fields = [field for field in required_fields if field not in first_account]
                    
                    if missing_fields:
                        self.log_result("Trial Balance Report - Account Structure", False, f"Missing fields in accounts: {missing_fields}", "phase1")
                        return False
                
                # Verify totals structure
                if 'debit' not in totals or 'credit' not in totals:
                    self.log_result("Trial Balance Report - Totals Structure", False, "Missing debit or credit in totals", "phase1")
                    return False
                
                # Verify trial balance is balanced (total debits = total credits)
                total_debits = totals.get('debit', 0)
                total_credits = totals.get('credit', 0)
                difference = totals.get('difference', abs(total_debits - total_credits))
                
                if abs(difference) > 0.01:
                    self.log_result("Trial Balance Report - Balance Check", False, f"Trial balance not balanced: Debits {total_debits} != Credits {total_credits}, Difference: {difference}", "phase1")
                    return False
                
                self.log_result("Trial Balance Report", True, f"Accounts: {len(accounts)}, Total Debits: ₹{total_debits:,.2f}, Total Credits: ₹{total_credits:,.2f} (Balanced)", "phase1")
                return True
                
            else:
                self.log_result("Trial Balance Report", False, f"Status: {response.status_code}, Response: {response.text}", "phase1")
                return False
                
        except Exception as e:
            self.log_result("Trial Balance Report", False, f"Exception: {str(e)}", "phase1")
            return False
    
    def test_general_ledger_report(self):
        """Test GET /api/reports/general-ledger"""
        print("📊 Testing General Ledger Report...")
        try:
            # Test with date range parameters
            end_date = datetime.now().strftime('%Y-%m-%d')
            start_date = (datetime.now() - timedelta(days=90)).strftime('%Y-%m-%d')
            
            # Test without account filter (returns all accounts)
            response = self.session.get(
                f"{API_BASE}/reports/general-ledger?start_date={start_date}&end_date={end_date}",
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify response structure
                if 'ledger' not in data or 'period' not in data:
                    self.log_result("General Ledger Report - Structure", False, "Missing ledger or period", "phase1")
                    return False
                
                ledger = data.get('ledger', {})
                period = data.get('period', {})
                
                # Verify ledger is a dictionary of accounts with transactions
                if not isinstance(ledger, dict):
                    self.log_result("General Ledger Report - Ledger Structure", False, "Ledger should be a dictionary", "phase1")
                    return False
                
                account_count = len(ledger.keys())
                
                # Test with specific account filter if accounts exist
                if account_count > 0:
                    first_account = list(ledger.keys())[0]
                    
                    response_filtered = self.session.get(
                        f"{API_BASE}/reports/general-ledger?start_date={start_date}&end_date={end_date}&account={first_account}",
                        timeout=30
                    )
                    
                    if response_filtered.status_code == 200:
                        filtered_data = response_filtered.json()
                        filtered_ledger = filtered_data.get('ledger', {})
                        
                        # Should only contain the filtered account
                        if len(filtered_ledger) > 1:
                            self.log_result("General Ledger Report - Account Filter", False, f"Account filter not working: expected 1 account, got {len(filtered_ledger)}", "phase1")
                            return False
                        
                        self.log_result("General Ledger Report", True, f"All accounts: {account_count}, Filtered account: {first_account}, Period: {period}", "phase1")
                    else:
                        self.log_result("General Ledger Report - Account Filter", False, f"Filtered request failed: {response_filtered.status_code}", "phase1")
                        return False
                else:
                    self.log_result("General Ledger Report", True, f"No accounts found in ledger for the period: {period}", "phase1")
                
                return True
                
            else:
                self.log_result("General Ledger Report", False, f"Status: {response.status_code}, Response: {response.text}", "phase1")
                return False
                
        except Exception as e:
            self.log_result("General Ledger Report", False, f"Exception: {str(e)}", "phase1")
            return False

    # ==================== PHASE 2: INVOICE/BILL CREATION WITH CATEGORIES ====================
    
    def test_categories_operating_inflow(self):
        """Test GET /api/categories?cashflow_activity=Operating&cashflow_flow=Inflow"""
        print("📋 Testing Categories - Operating Inflows...")
        try:
            response = self.session.get(
                f"{API_BASE}/categories?cashflow_activity=Operating&cashflow_flow=Inflow",
                timeout=30
            )
            
            if response.status_code == 200:
                categories = response.json()
                
                if not isinstance(categories, list):
                    self.log_result("Categories Operating Inflow - Structure", False, "Response should be a list", "phase2")
                    return False
                
                if len(categories) == 0:
                    self.log_result("Categories Operating Inflow - Data", False, "No Operating Inflow categories found", "phase2")
                    return False
                
                # Verify category structure
                first_category = categories[0]
                required_fields = ['category_name', 'coa_account', 'cashflow_activity', 'statement_type']
                missing_fields = [field for field in required_fields if field not in first_category]
                
                if missing_fields:
                    self.log_result("Categories Operating Inflow - Fields", False, f"Missing fields: {missing_fields}", "phase2")
                    return False
                
                # Verify all categories are Operating Inflows
                non_operating_inflow = [cat for cat in categories if cat.get('cashflow_activity') != 'Operating' or cat.get('cashflow_flow') != 'Inflow']
                
                if non_operating_inflow:
                    self.log_result("Categories Operating Inflow - Filter", False, f"Found {len(non_operating_inflow)} non-Operating Inflow categories", "phase2")
                    return False
                
                self.log_result("Categories Operating Inflow", True, f"Found {len(categories)} Operating Inflow categories", "phase2")
                return categories
                
            else:
                self.log_result("Categories Operating Inflow", False, f"Status: {response.status_code}, Response: {response.text}", "phase2")
                return False
                
        except Exception as e:
            self.log_result("Categories Operating Inflow", False, f"Exception: {str(e)}", "phase2")
            return False
    
    def test_categories_operating_outflow(self):
        """Test GET /api/categories?cashflow_activity=Operating&cashflow_flow=Outflow"""
        print("📋 Testing Categories - Operating Outflows...")
        try:
            response = self.session.get(
                f"{API_BASE}/categories?cashflow_activity=Operating&cashflow_flow=Outflow",
                timeout=30
            )
            
            if response.status_code == 200:
                categories = response.json()
                
                if not isinstance(categories, list):
                    self.log_result("Categories Operating Outflow - Structure", False, "Response should be a list", "phase2")
                    return False
                
                if len(categories) == 0:
                    self.log_result("Categories Operating Outflow - Data", False, "No Operating Outflow categories found", "phase2")
                    return False
                
                # Verify all categories are Operating Outflows
                non_operating_outflow = [cat for cat in categories if cat.get('cashflow_activity') != 'Operating' or cat.get('cashflow_flow') != 'Outflow']
                
                if non_operating_outflow:
                    self.log_result("Categories Operating Outflow - Filter", False, f"Found {len(non_operating_outflow)} non-Operating Outflow categories", "phase2")
                    return False
                
                self.log_result("Categories Operating Outflow", True, f"Found {len(categories)} Operating Outflow categories", "phase2")
                return categories
                
            else:
                self.log_result("Categories Operating Outflow", False, f"Status: {response.status_code}, Response: {response.text}", "phase2")
                return False
                
        except Exception as e:
            self.log_result("Categories Operating Outflow", False, f"Exception: {str(e)}", "phase2")
            return False
    
    def test_invoice_draft_creation(self):
        """Test POST /api/invoices (Draft Status) - No auto-posting"""
        print("📄 Testing Invoice Creation - Draft Status...")
        try:
            # Get operating inflow categories
            inflow_categories = self.test_categories_operating_inflow()
            if not inflow_categories:
                return False
            
            # Get customers
            customers_response = self.session.get(f"{API_BASE}/customers", timeout=30)
            if customers_response.status_code != 200:
                self.log_result("Invoice Draft - Get Customers", False, f"Status: {customers_response.status_code}", "phase2")
                return False
            
            customers = customers_response.json()
            if not customers:
                self.log_result("Invoice Draft - No Customers", False, "No customers found", "phase2")
                return False
            
            # Create draft invoice
            invoice_data = {
                "customer_id": customers[0]['id'],
                "invoice_date": datetime.now(timezone.utc).isoformat(),
                "due_date": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat(),
                "base_amount": 100000.0,
                "gst_percent": 18.0,
                "gst_amount": 18000.0,
                "tds_percent": 2.0,
                "tds_amount": 2000.0,
                "total_amount": 118000.0,
                "category_id": inflow_categories[0]['id'],
                "status": "Draft",
                "items": [{"description": "Test Service", "quantity": 1, "rate": 100000.0, "amount": 100000.0}]
            }
            
            response = self.session.post(f"{API_BASE}/invoices", json=invoice_data, timeout=30)
            
            if response.status_code == 200:
                invoice = response.json()
                self.created_invoices.append(invoice['id'])
                
                # Verify no journal entry is auto-posted for Draft status
                if invoice.get('journal_entry_id'):
                    self.log_result("Invoice Draft - No Auto-posting", False, "Draft invoice should not have journal_entry_id", "phase2")
                    return False
                
                self.log_result("Invoice Draft Creation", True, f"Created draft invoice {invoice.get('invoice_number')} with category {inflow_categories[0]['category_name']}", "phase2")
                return invoice
                
            else:
                self.log_result("Invoice Draft Creation", False, f"Status: {response.status_code}, Response: {response.text}", "phase2")
                return False
                
        except Exception as e:
            self.log_result("Invoice Draft Creation", False, f"Exception: {str(e)}", "phase2")
            return False
    
    def test_invoice_finalized_creation(self):
        """Test POST /api/invoices (Finalized Status) - Auto-posting"""
        print("📄 Testing Invoice Creation - Finalized Status...")
        try:
            # Get operating inflow categories
            inflow_categories = self.test_categories_operating_inflow()
            if not inflow_categories:
                return False
            
            # Get customers
            customers_response = self.session.get(f"{API_BASE}/customers", timeout=30)
            if customers_response.status_code != 200:
                return False
            
            customers = customers_response.json()
            if not customers:
                return False
            
            # Create finalized invoice
            invoice_data = {
                "customer_id": customers[0]['id'],
                "invoice_date": datetime.now(timezone.utc).isoformat(),
                "due_date": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat(),
                "base_amount": 150000.0,
                "gst_percent": 18.0,
                "gst_amount": 27000.0,
                "tds_percent": 2.0,
                "tds_amount": 3000.0,
                "total_amount": 177000.0,
                "category_id": inflow_categories[0]['id'],
                "status": "Finalized",
                "items": [{"description": "Test Finalized Service", "quantity": 1, "rate": 150000.0, "amount": 150000.0}]
            }
            
            response = self.session.post(f"{API_BASE}/invoices", json=invoice_data, timeout=30)
            
            if response.status_code == 200:
                invoice = response.json()
                self.created_invoices.append(invoice['id'])
                
                # Verify journal entry IS auto-posted for Finalized status
                if not invoice.get('journal_entry_id'):
                    self.log_result("Invoice Finalized - Auto-posting", False, "Finalized invoice should have journal_entry_id", "phase2")
                    return False
                
                self.log_result("Invoice Finalized Creation", True, f"Created finalized invoice {invoice.get('invoice_number')} with journal entry {invoice.get('journal_entry_id')}", "phase2")
                return invoice
                
            else:
                self.log_result("Invoice Finalized Creation", False, f"Status: {response.status_code}, Response: {response.text}", "phase2")
                return False
                
        except Exception as e:
            self.log_result("Invoice Finalized Creation", False, f"Exception: {str(e)}", "phase2")
            return False
    
    def test_invoice_journal_retrieval(self):
        """Test GET /api/invoices/{invoice_id}/journals"""
        print("📄 Testing Invoice Journal Entry Retrieval...")
        try:
            # Create a finalized invoice first
            finalized_invoice = self.test_invoice_finalized_creation()
            if not finalized_invoice:
                return False
            
            invoice_id = finalized_invoice['id']
            
            # Get journal entries for the invoice
            response = self.session.get(f"{API_BASE}/invoices/{invoice_id}/journal", timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                journal_entry = data.get('journal_entry')
                
                if not journal_entry:
                    self.log_result("Invoice Journal Retrieval - No Entry", False, "No journal entry found for finalized invoice", "phase2")
                    return False
                
                # Verify journal entry structure
                if 'line_items' not in journal_entry:
                    self.log_result("Invoice Journal Retrieval - Structure", False, "Journal entry missing line_items", "phase2")
                    return False
                
                line_items = journal_entry['line_items']
                
                # Verify 3 line items (Debit: AR, Credit: Revenue, Credit: GST)
                if len(line_items) != 3:
                    self.log_result("Invoice Journal Retrieval - Line Items Count", False, f"Expected 3 line items, got {len(line_items)}", "phase2")
                    return False
                
                # Verify debits = credits (balanced)
                total_debits = sum(item.get('debit', 0) for item in line_items)
                total_credits = sum(item.get('credit', 0) for item in line_items)
                
                if abs(total_debits - total_credits) > 0.01:
                    self.log_result("Invoice Journal Retrieval - Balance", False, f"Journal not balanced: Debits {total_debits} != Credits {total_credits}", "phase2")
                    return False
                
                self.log_result("Invoice Journal Retrieval", True, f"Retrieved journal with 3 line items, Debits: ₹{total_debits:,.2f}, Credits: ₹{total_credits:,.2f} (Balanced)", "phase2")
                return True
                
            else:
                self.log_result("Invoice Journal Retrieval", False, f"Status: {response.status_code}, Response: {response.text}", "phase2")
                return False
                
        except Exception as e:
            self.log_result("Invoice Journal Retrieval", False, f"Exception: {str(e)}", "phase2")
            return False
    
    def test_bill_draft_creation(self):
        """Test POST /api/bills (Draft Status) - No auto-posting"""
        print("📄 Testing Bill Creation - Draft Status...")
        try:
            # Get operating outflow categories
            outflow_categories = self.test_categories_operating_outflow()
            if not outflow_categories:
                return False
            
            # Get vendors
            vendors_response = self.session.get(f"{API_BASE}/vendors", timeout=30)
            if vendors_response.status_code != 200:
                self.log_result("Bill Draft - Get Vendors", False, f"Status: {vendors_response.status_code}", "phase2")
                return False
            
            vendors = vendors_response.json()
            if not vendors:
                self.log_result("Bill Draft - No Vendors", False, "No vendors found", "phase2")
                return False
            
            # Create draft bill
            bill_data = {
                "vendor_id": vendors[0]['id'],
                "bill_date": datetime.now(timezone.utc).isoformat(),
                "due_date": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat(),
                "base_amount": 50000.0,
                "gst_percent": 18.0,
                "gst_amount": 9000.0,
                "tds_percent": 1.0,
                "tds_amount": 500.0,
                "total_amount": 59000.0,
                "category_id": outflow_categories[0]['id'],
                "status": "Draft",
                "expense_category": "Office Supplies",
                "items": [{"description": "Test Supplies", "quantity": 1, "rate": 50000.0, "amount": 50000.0}]
            }
            
            response = self.session.post(f"{API_BASE}/bills", json=bill_data, timeout=30)
            
            if response.status_code == 200:
                bill = response.json()
                self.created_bills.append(bill['id'])
                
                # Verify no journal entry is auto-posted for Draft status
                if bill.get('journal_entry_id'):
                    self.log_result("Bill Draft - No Auto-posting", False, "Draft bill should not have journal_entry_id", "phase2")
                    return False
                
                self.log_result("Bill Draft Creation", True, f"Created draft bill {bill.get('bill_number')} with category {outflow_categories[0]['category_name']}", "phase2")
                return bill
                
            else:
                self.log_result("Bill Draft Creation", False, f"Status: {response.status_code}, Response: {response.text}", "phase2")
                return False
                
        except Exception as e:
            self.log_result("Bill Draft Creation", False, f"Exception: {str(e)}", "phase2")
            return False
    
    def test_bill_approved_creation(self):
        """Test POST /api/bills (Approved Status) - Auto-posting"""
        print("📄 Testing Bill Creation - Approved Status...")
        try:
            # Get operating outflow categories
            outflow_categories = self.test_categories_operating_outflow()
            if not outflow_categories:
                return False
            
            # Get vendors
            vendors_response = self.session.get(f"{API_BASE}/vendors", timeout=30)
            if vendors_response.status_code != 200:
                return False
            
            vendors = vendors_response.json()
            if not vendors:
                return False
            
            # Create approved bill
            bill_data = {
                "vendor_id": vendors[0]['id'],
                "bill_date": datetime.now(timezone.utc).isoformat(),
                "due_date": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat(),
                "base_amount": 75000.0,
                "gst_percent": 18.0,
                "gst_amount": 13500.0,
                "tds_percent": 1.0,
                "tds_amount": 750.0,
                "total_amount": 88500.0,
                "category_id": outflow_categories[0]['id'],
                "status": "Approved",
                "expense_category": "Professional Services",
                "items": [{"description": "Test Approved Service", "quantity": 1, "rate": 75000.0, "amount": 75000.0}]
            }
            
            response = self.session.post(f"{API_BASE}/bills", json=bill_data, timeout=30)
            
            if response.status_code == 200:
                bill = response.json()
                self.created_bills.append(bill['id'])
                
                # Verify journal entry IS auto-posted for Approved status
                if not bill.get('journal_entry_id'):
                    self.log_result("Bill Approved - Auto-posting", False, "Approved bill should have journal_entry_id", "phase2")
                    return False
                
                self.log_result("Bill Approved Creation", True, f"Created approved bill {bill.get('bill_number')} with journal entry {bill.get('journal_entry_id')}", "phase2")
                return bill
                
            else:
                self.log_result("Bill Approved Creation", False, f"Status: {response.status_code}, Response: {response.text}", "phase2")
                return False
                
        except Exception as e:
            self.log_result("Bill Approved Creation", False, f"Exception: {str(e)}", "phase2")
            return False
    
    def test_bill_journal_retrieval(self):
        """Test GET /api/bills/{bill_id}/journals"""
        print("📄 Testing Bill Journal Entry Retrieval...")
        try:
            # Create an approved bill first
            approved_bill = self.test_bill_approved_creation()
            if not approved_bill:
                return False
            
            bill_id = approved_bill['id']
            
            # Get journal entries for the bill
            response = self.session.get(f"{API_BASE}/bills/{bill_id}/journal", timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                journal_entry = data.get('journal_entry')
                
                if not journal_entry:
                    self.log_result("Bill Journal Retrieval - No Entry", False, "No journal entry found for approved bill", "phase2")
                    return False
                
                # Verify journal entry structure
                if 'line_items' not in journal_entry:
                    self.log_result("Bill Journal Retrieval - Structure", False, "Journal entry missing line_items", "phase2")
                    return False
                
                line_items = journal_entry['line_items']
                
                # Verify 3 line items (Debit: Expense, Debit: GST, Credit: AP)
                if len(line_items) != 3:
                    self.log_result("Bill Journal Retrieval - Line Items Count", False, f"Expected 3 line items, got {len(line_items)}", "phase2")
                    return False
                
                # Verify debits = credits (balanced)
                total_debits = sum(item.get('debit', 0) for item in line_items)
                total_credits = sum(item.get('credit', 0) for item in line_items)
                
                if abs(total_debits - total_credits) > 0.01:
                    self.log_result("Bill Journal Retrieval - Balance", False, f"Journal not balanced: Debits {total_debits} != Credits {total_credits}", "phase2")
                    return False
                
                self.log_result("Bill Journal Retrieval", True, f"Retrieved journal with 3 line items, Debits: ₹{total_debits:,.2f}, Credits: ₹{total_credits:,.2f} (Balanced)", "phase2")
                return True
                
            else:
                self.log_result("Bill Journal Retrieval", False, f"Status: {response.status_code}, Response: {response.text}", "phase2")
                return False
                
        except Exception as e:
            self.log_result("Bill Journal Retrieval", False, f"Exception: {str(e)}", "phase2")
            return False

    # ==================== PHASE 3: DATA VALIDATION ====================
    
    def test_expected_data_validation(self):
        """Test expected data validation"""
        print("🔍 Testing Expected Data Validation...")
        try:
            # Test 1: Verify 805 categories are loaded
            response = self.session.get(f"{API_BASE}/categories", timeout=30)
            if response.status_code == 200:
                all_categories = response.json()
                if len(all_categories) != 805:
                    self.log_result("Expected Data - Categories Count", False, f"Expected 805 categories, found {len(all_categories)}", "phase3")
                else:
                    self.log_result("Expected Data - Categories Count", True, f"Verified 805 categories loaded", "phase3")
            else:
                self.log_result("Expected Data - Categories Count", False, f"Could not retrieve categories: {response.status_code}", "phase3")
                return False
            
            # Test 2: Verify minimal seeded data exists
            # Check customers
            customers_response = self.session.get(f"{API_BASE}/customers", timeout=30)
            if customers_response.status_code == 200:
                customers = customers_response.json()
                if len(customers) >= 5:
                    self.log_result("Expected Data - Customers", True, f"Found {len(customers)} customers (≥5 expected)", "phase3")
                else:
                    self.log_result("Expected Data - Customers", False, f"Expected ≥5 customers, found {len(customers)}", "phase3")
            
            # Check vendors
            vendors_response = self.session.get(f"{API_BASE}/vendors", timeout=30)
            if vendors_response.status_code == 200:
                vendors = vendors_response.json()
                if len(vendors) >= 5:
                    self.log_result("Expected Data - Vendors", True, f"Found {len(vendors)} vendors (≥5 expected)", "phase3")
                else:
                    self.log_result("Expected Data - Vendors", False, f"Expected ≥5 vendors, found {len(vendors)}", "phase3")
            
            # Check invoices
            invoices_response = self.session.get(f"{API_BASE}/invoices", timeout=30)
            if invoices_response.status_code == 200:
                invoices = invoices_response.json()
                if len(invoices) >= 5:
                    self.log_result("Expected Data - Invoices", True, f"Found {len(invoices)} invoices (≥5 expected)", "phase3")
                else:
                    self.log_result("Expected Data - Invoices", False, f"Expected ≥5 invoices, found {len(invoices)}", "phase3")
            
            # Check bills
            bills_response = self.session.get(f"{API_BASE}/bills", timeout=30)
            if bills_response.status_code == 200:
                bills = bills_response.json()
                if len(bills) >= 5:
                    self.log_result("Expected Data - Bills", True, f"Found {len(bills)} bills (≥5 expected)", "phase3")
                else:
                    self.log_result("Expected Data - Bills", False, f"Expected ≥5 bills, found {len(bills)}", "phase3")
            
            # Test 3: Verify journal entries are balanced
            journal_response = self.session.get(f"{API_BASE}/journal-entries", timeout=30)
            if journal_response.status_code == 200:
                journals = journal_response.json()
                unbalanced_journals = []
                
                for journal in journals:
                    total_debit = journal.get('total_debit', 0)
                    total_credit = journal.get('total_credit', 0)
                    if abs(total_debit - total_credit) > 0.01:
                        unbalanced_journals.append(journal.get('id', 'Unknown'))
                
                if unbalanced_journals:
                    self.log_result("Expected Data - Journal Balance", False, f"Found {len(unbalanced_journals)} unbalanced journal entries", "phase3")
                else:
                    self.log_result("Expected Data - Journal Balance", True, f"All {len(journals)} journal entries are balanced", "phase3")
            
            return True
            
        except Exception as e:
            self.log_result("Expected Data Validation", False, f"Exception: {str(e)}", "phase3")
            return False
    
    def cleanup_test_data(self):
        """Clean up created test data"""
        print("🧹 Cleaning up test data...")
        
        # Delete created invoices
        for invoice_id in self.created_invoices:
            try:
                self.session.delete(f"{API_BASE}/invoices/{invoice_id}", timeout=30)
            except:
                pass
        
        # Delete created bills
        for bill_id in self.created_bills:
            try:
                self.session.delete(f"{API_BASE}/bills/{bill_id}", timeout=30)
            except:
                pass
    
    def run_all_tests(self):
        """Run all comprehensive tests"""
        print("🚀 STARTING COMPREHENSIVE BACKEND TESTING FOR ALL 3 PHASES")
        print("=" * 80)
        
        # Authenticate first
        if not self.authenticate():
            return False
        
        print("\n" + "=" * 80)
        print("PHASE 1: FINANCIAL REPORTING ENDPOINTS (CRITICAL PRIORITY)")
        print("=" * 80)
        
        # Phase 1 Tests
        self.test_profit_loss_report()
        self.test_balance_sheet_report()
        self.test_cash_flow_report()
        self.test_trial_balance_report()
        self.test_general_ledger_report()
        
        print("\n" + "=" * 80)
        print("PHASE 2: INVOICE/BILL CREATION WITH CATEGORIES")
        print("=" * 80)
        
        # Phase 2 Tests
        self.test_categories_operating_inflow()
        self.test_categories_operating_outflow()
        self.test_invoice_draft_creation()
        self.test_invoice_finalized_creation()
        self.test_invoice_journal_retrieval()
        self.test_bill_draft_creation()
        self.test_bill_approved_creation()
        self.test_bill_journal_retrieval()
        
        print("\n" + "=" * 80)
        print("PHASE 3: EXPECTED DATA VALIDATION")
        print("=" * 80)
        
        # Phase 3 Tests
        self.test_expected_data_validation()
        
        # Cleanup
        self.cleanup_test_data()
        
        # Print final results
        self.print_final_results()
        
        return self.test_results['failed'] == 0
    
    def print_final_results(self):
        """Print comprehensive test results"""
        print("\n" + "=" * 80)
        print("COMPREHENSIVE TEST RESULTS SUMMARY")
        print("=" * 80)
        
        total_tests = self.test_results['passed'] + self.test_results['failed']
        success_rate = (self.test_results['passed'] / total_tests * 100) if total_tests > 0 else 0
        
        print(f"OVERALL RESULTS:")
        print(f"✅ Passed: {self.test_results['passed']}")
        print(f"❌ Failed: {self.test_results['failed']}")
        print(f"📊 Success Rate: {success_rate:.1f}%")
        
        # Phase-wise results
        for phase, results in self.test_results['phase_results'].items():
            phase_total = results['passed'] + results['failed']
            phase_success = (results['passed'] / phase_total * 100) if phase_total > 0 else 0
            
            phase_name = {
                'phase1': 'PHASE 1: Financial Reporting',
                'phase2': 'PHASE 2: Invoice/Bill Creation',
                'phase3': 'PHASE 3: Data Validation'
            }.get(phase, phase.upper())
            
            print(f"\n{phase_name}:")
            print(f"  ✅ Passed: {results['passed']}")
            print(f"  ❌ Failed: {results['failed']}")
            print(f"  📊 Success Rate: {phase_success:.1f}%")
        
        # Print failed tests
        if self.test_results['errors']:
            print(f"\n❌ FAILED TESTS:")
            for error in self.test_results['errors']:
                print(f"  • {error}")
        
        print("\n" + "=" * 80)

def main():
    """Main function to run comprehensive tests"""
    tester = ComprehensiveBackendTester()
    success = tester.run_all_tests()
    
    if success:
        print("🎉 ALL TESTS PASSED!")
        sys.exit(0)
    else:
        print("💥 SOME TESTS FAILED!")
        sys.exit(1)

if __name__ == "__main__":
    main()