#!/usr/bin/env python3
"""
Backend API Testing Script for Review Request
Tests all critical endpoints as specified in the review request
"""

import requests
import json
import sys
from datetime import datetime, timezone
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Configuration - Use external URL from frontend .env
BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://saas-finint.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

# Test credentials as specified in review
TEST_EMAIL = "demo@innovatebooks.com"
TEST_PASSWORD = os.getenv("TEST_PASSWORD", "Test1234")   # or demo123 as default


class ReviewBackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_results = {
            'passed': 0,
            'failed': 0,
            'errors': [],
            'details': []
        }
    
    def log_result(self, test_name, success, message="", response_data=None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        result_line = f"{status}: {test_name}"
        print(result_line)
        
        if message:
            print(f"   {message}")
        if response_data and not success:
            print(f"   Response: {response_data}")
        
        # Store detailed results
        self.test_results['details'].append({
            'test': test_name,
            'status': 'PASS' if success else 'FAIL',
            'message': message,
            'response': response_data if not success else None
        })
        
        if success:
            self.test_results['passed'] += 1
        else:
            self.test_results['failed'] += 1
            self.test_results['errors'].append(f"{test_name}: {message}")
        print()
    
    def authenticate(self):
        """Authenticate with demo@innovatebooks.com / demo123"""
        print("🔐 Authenticating with demo@innovatebooks.com / demo123...")
        
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
                user_email = data.get('user', {}).get('email', 'Unknown')
                self.log_result("Authentication", True, f"JWT token obtained, logged in as {user_email}")
                return True
            else:
                self.log_result("Authentication", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Authentication", False, f"Exception: {str(e)}")
            return False
    
    def test_dashboard_metrics(self):
        """Test Dashboard metrics: GET /api/dashboard"""
        print("📊 Testing Dashboard Metrics...")
        try:
            # Try both possible endpoints
            endpoints = ["/dashboard/metrics", "/dashboard"]
            
            for endpoint in endpoints:
                response = self.session.get(f"{API_BASE}{endpoint}", timeout=30)
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Check for key metrics
                    key_metrics = ['cash_on_hand', 'ar_outstanding', 'ap_outstanding']
                    found_metrics = [metric for metric in key_metrics if metric in data]
                    
                    if len(found_metrics) >= 2:  # At least 2 key metrics should be present
                        cash_on_hand = data.get('cash_on_hand', 0)
                        ar_outstanding = data.get('ar_outstanding', 0)
                        ap_outstanding = data.get('ap_outstanding', 0)
                        
                        self.log_result("GET /api/dashboard", True, f"Cash: ₹{cash_on_hand:,.0f}, AR: ₹{ar_outstanding:,.0f}, AP: ₹{ap_outstanding:,.0f}")
                        return True
                    else:
                        continue  # Try next endpoint
            
            # If we get here, none of the endpoints worked
            self.log_result("GET /api/dashboard", False, "No valid dashboard endpoint found")
            return False
                
        except Exception as e:
            self.log_result("GET /api/dashboard", False, f"Exception: {str(e)}")
            return False
    
    def test_customers_endpoints(self):
        """Test Customers: GET /api/customers, GET /api/customers/{id}/details"""
        print("👥 Testing Customer Endpoints...")
        
        try:
            # Test GET /api/customers
            response = self.session.get(f"{API_BASE}/customers", timeout=30)
            
            if response.status_code != 200:
                self.log_result("GET /api/customers", False, f"Status: {response.status_code}")
                return False
            
            customers = response.json()
            if not isinstance(customers, list):
                self.log_result("GET /api/customers", False, "Response should be a list")
                return False
            
            self.log_result("GET /api/customers", True, f"Retrieved {len(customers)} customers")
            
            if len(customers) == 0:
                self.log_result("GET /api/customers/{id}/details", False, "No customers found for details testing")
                return False
            
            # Test GET /api/customers/{id}/details
            first_customer = customers[0]
            customer_id = first_customer.get('id')
            customer_name = first_customer.get('name', 'Unknown')
            
            response = self.session.get(f"{API_BASE}/customers/{customer_id}/details", timeout=30)
            
            if response.status_code == 200:
                details = response.json()
                
                # Validate structure
                expected_fields = ['customer', 'invoices', 'payments', 'total_invoiced', 'total_paid']
                missing_fields = [field for field in expected_fields if field not in details]
                
                if missing_fields:
                    self.log_result("GET /api/customers/{id}/details", False, f"Missing fields: {missing_fields}")
                    return False
                
                invoices_count = len(details.get('invoices', []))
                total_invoiced = details.get('total_invoiced', 0)
                
                self.log_result("GET /api/customers/{id}/details", True, f"{customer_name}: {invoices_count} invoices, ₹{total_invoiced:,.0f} total")
                return True
            else:
                self.log_result("GET /api/customers/{id}/details", False, f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Customer Endpoints", False, f"Exception: {str(e)}")
            return False
    
    def test_vendors_endpoints(self):
        """Test Vendors: GET /api/vendors, GET /api/vendors/{id}/details"""
        print("🏢 Testing Vendor Endpoints...")
        
        try:
            # Test GET /api/vendors
            response = self.session.get(f"{API_BASE}/vendors", timeout=30)
            
            if response.status_code != 200:
                self.log_result("GET /api/vendors", False, f"Status: {response.status_code}")
                return False
            
            vendors = response.json()
            if not isinstance(vendors, list):
                self.log_result("GET /api/vendors", False, "Response should be a list")
                return False
            
            self.log_result("GET /api/vendors", True, f"Retrieved {len(vendors)} vendors")
            
            if len(vendors) == 0:
                self.log_result("GET /api/vendors/{id}/details", False, "No vendors found for details testing")
                return False
            
            # Test GET /api/vendors/{id}/details
            first_vendor = vendors[0]
            vendor_id = first_vendor.get('id')
            vendor_name = first_vendor.get('name', 'Unknown')
            
            response = self.session.get(f"{API_BASE}/vendors/{vendor_id}/details", timeout=30)
            
            if response.status_code == 200:
                details = response.json()
                
                # Validate structure
                expected_fields = ['vendor', 'bills', 'payments', 'total_billed', 'total_paid']
                missing_fields = [field for field in expected_fields if field not in details]
                
                if missing_fields:
                    self.log_result("GET /api/vendors/{id}/details", False, f"Missing fields: {missing_fields}")
                    return False
                
                bills_count = len(details.get('bills', []))
                total_billed = details.get('total_billed', 0)
                
                self.log_result("GET /api/vendors/{id}/details", True, f"{vendor_name}: {bills_count} bills, ₹{total_billed:,.0f} total")
                return True
            else:
                self.log_result("GET /api/vendors/{id}/details", False, f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Vendor Endpoints", False, f"Exception: {str(e)}")
            return False
    
    def test_invoices_endpoints(self):
        """Test Invoices: GET /api/invoices, GET /api/invoices/{id}/details"""
        print("📄 Testing Invoice Endpoints...")
        
        try:
            # Test GET /api/invoices
            response = self.session.get(f"{API_BASE}/invoices", timeout=30)
            
            if response.status_code != 200:
                self.log_result("GET /api/invoices", False, f"Status: {response.status_code}")
                return False
            
            invoices = response.json()
            if not isinstance(invoices, list):
                self.log_result("GET /api/invoices", False, "Response should be a list")
                return False
            
            self.log_result("GET /api/invoices", True, f"Retrieved {len(invoices)} invoices")
            
            if len(invoices) == 0:
                self.log_result("GET /api/invoices/{id}/details", False, "No invoices found for details testing")
                return False
            
            # Test GET /api/invoices/{id}/details
            first_invoice = invoices[0]
            invoice_id = first_invoice.get('id')
            invoice_number = first_invoice.get('invoice_number', 'Unknown')
            
            response = self.session.get(f"{API_BASE}/invoices/{invoice_id}/details", timeout=30)
            
            if response.status_code == 200:
                details = response.json()
                
                # Validate structure
                expected_fields = ['invoice', 'days_overdue', 'bucket', 'dso']
                missing_fields = [field for field in expected_fields if field not in details]
                
                if missing_fields:
                    self.log_result("GET /api/invoices/{id}/details", False, f"Missing fields: {missing_fields}")
                    return False
                
                invoice_data = details.get('invoice', {})
                total_amount = invoice_data.get('total_amount', 0)
                balance_due = invoice_data.get('balance_due', 0)
                status = invoice_data.get('status', 'Unknown')
                
                self.log_result("GET /api/invoices/{id}/details", True, f"{invoice_number}: ₹{total_amount:,.0f} total, ₹{balance_due:,.0f} due, {status}")
                return True
            else:
                self.log_result("GET /api/invoices/{id}/details", False, f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Invoice Endpoints", False, f"Exception: {str(e)}")
            return False
    
    def test_bills_endpoints(self):
        """Test Bills: GET /api/bills, GET /api/bills/{id}/details"""
        print("💰 Testing Bill Endpoints...")
        
        try:
            # Test GET /api/bills
            response = self.session.get(f"{API_BASE}/bills", timeout=30)
            
            if response.status_code != 200:
                self.log_result("GET /api/bills", False, f"Status: {response.status_code}")
                return False
            
            bills = response.json()
            if not isinstance(bills, list):
                self.log_result("GET /api/bills", False, "Response should be a list")
                return False
            
            self.log_result("GET /api/bills", True, f"Retrieved {len(bills)} bills")
            
            if len(bills) == 0:
                self.log_result("GET /api/bills/{id}/details", False, "No bills found for details testing")
                return False
            
            # Test GET /api/bills/{id}/details
            first_bill = bills[0]
            bill_id = first_bill.get('id')
            bill_number = first_bill.get('bill_number', 'Unknown')
            
            response = self.session.get(f"{API_BASE}/bills/{bill_id}/details", timeout=30)
            
            if response.status_code == 200:
                details = response.json()
                
                # Validate structure
                expected_fields = ['bill', 'days_overdue', 'bucket']
                missing_fields = [field for field in expected_fields if field not in details]
                
                if missing_fields:
                    self.log_result("GET /api/bills/{id}/details", False, f"Missing fields: {missing_fields}")
                    return False
                
                bill_data = details.get('bill', {})
                total_amount = bill_data.get('total_amount', 0)
                status = bill_data.get('status', 'Unknown')
                
                self.log_result("GET /api/bills/{id}/details", True, f"{bill_number}: ₹{total_amount:,.0f} total, {status}")
                return True
            else:
                self.log_result("GET /api/bills/{id}/details", False, f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Bill Endpoints", False, f"Exception: {str(e)}")
            return False
    
    def test_aging_endpoints(self):
        """Test Aging endpoints: GET /api/invoices/aging, GET /api/bills/aging"""
        print("📅 Testing Aging Endpoints...")
        
        try:
            # Test GET /api/invoices/aging
            response = self.session.get(f"{API_BASE}/invoices/aging", timeout=30)
            
            if response.status_code == 200:
                aging_data = response.json()
                
                # Validate aging buckets
                expected_buckets = ['0-30', '31-60', '61-90', '90+']
                missing_buckets = [bucket for bucket in expected_buckets if bucket not in aging_data]
                
                if missing_buckets:
                    self.log_result("GET /api/invoices/aging", False, f"Missing buckets: {missing_buckets}")
                    return False
                
                total_amount = sum(aging_data[bucket].get('amount', 0) for bucket in expected_buckets)
                total_count = sum(aging_data[bucket].get('count', 0) for bucket in expected_buckets)
                
                self.log_result("GET /api/invoices/aging", True, f"Total outstanding: ₹{total_amount:,.0f} across {total_count} invoices")
            else:
                self.log_result("GET /api/invoices/aging", False, f"Status: {response.status_code}")
                return False
            
            # Test GET /api/bills/aging
            response = self.session.get(f"{API_BASE}/bills/aging", timeout=30)
            
            if response.status_code == 200:
                aging_data = response.json()
                
                # Validate aging buckets
                expected_buckets = ['0-30', '31-60', '61-90', '90+']
                missing_buckets = [bucket for bucket in expected_buckets if bucket not in aging_data]
                
                if missing_buckets:
                    self.log_result("GET /api/bills/aging", False, f"Missing buckets: {missing_buckets}")
                    return False
                
                total_amount = sum(aging_data[bucket].get('amount', 0) for bucket in expected_buckets)
                total_count = sum(aging_data[bucket].get('count', 0) for bucket in expected_buckets)
                
                self.log_result("GET /api/bills/aging", True, f"Total outstanding: ₹{total_amount:,.0f} across {total_count} bills")
                return True
            else:
                self.log_result("GET /api/bills/aging", False, f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Aging Endpoints", False, f"Exception: {str(e)}")
            return False
    
    def test_banking_endpoints(self):
        """Test Banking: GET /api/bank-accounts, GET /api/transactions"""
        print("🏦 Testing Banking Endpoints...")
        
        try:
            # Test GET /api/bank-accounts
            response = self.session.get(f"{API_BASE}/bank-accounts", timeout=30)
            
            if response.status_code != 200:
                self.log_result("GET /api/bank-accounts", False, f"Status: {response.status_code}")
                return False
            
            accounts = response.json()
            if not isinstance(accounts, list):
                self.log_result("GET /api/bank-accounts", False, "Response should be a list")
                return False
            
            total_balance = sum(acc.get('current_balance', 0) for acc in accounts)
            self.log_result("GET /api/bank-accounts", True, f"Retrieved {len(accounts)} accounts, Total balance: ₹{total_balance:,.0f}")
            
            # Test GET /api/transactions
            response = self.session.get(f"{API_BASE}/transactions", timeout=30)
            
            if response.status_code == 200:
                transactions = response.json()
                if not isinstance(transactions, list):
                    self.log_result("GET /api/transactions", False, "Response should be a list")
                    return False
                
                # Validate transaction structure
                if transactions:
                    first_txn = transactions[0]
                    required_fields = ['transaction_type', 'amount', 'description']
                    missing_fields = [field for field in required_fields if field not in first_txn]
                    
                    if missing_fields:
                        self.log_result("GET /api/transactions", False, f"Missing fields: {missing_fields}")
                        return False
                
                credit_count = len([t for t in transactions if t.get('transaction_type') == 'Credit'])
                debit_count = len([t for t in transactions if t.get('transaction_type') == 'Debit'])
                
                self.log_result("GET /api/transactions", True, f"Retrieved {len(transactions)} transactions ({credit_count} Credits, {debit_count} Debits)")
                return True
            else:
                self.log_result("GET /api/transactions", False, f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Banking Endpoints", False, f"Exception: {str(e)}")
            return False
    
    def test_financial_reporting_endpoints(self):
        """Test Financial Reporting endpoints"""
        print("📈 Testing Financial Reporting Endpoints...")
        
        endpoints = [
            ("/reports/profit-loss", "Profit & Loss"),
            ("/reports/balance-sheet", "Balance Sheet"),
            ("/reports/cashflow-statement", "Cash Flow"),
            ("/reports/trial-balance", "Trial Balance"),
            ("/reports/general-ledger", "General Ledger")
        ]
        
        all_passed = True
        
        for endpoint, name in endpoints:
            try:
                response = self.session.get(f"{API_BASE}{endpoint}", timeout=30)
                
                if response.status_code == 200:
                    data = response.json()
                    self.log_result(f"GET /api{endpoint}", True, f"{name} report generated successfully")
                else:
                    self.log_result(f"GET /api{endpoint}", False, f"Status: {response.status_code}")
                    all_passed = False
                    
            except Exception as e:
                self.log_result(f"GET /api{endpoint}", False, f"Exception: {str(e)}")
                all_passed = False
        
        return all_passed
    
    def test_category_master(self):
        """Test Category Master: GET /api/categories (verify 805 categories exist)"""
        print("📋 Testing Category Master...")
        
        try:
            response = self.session.get(f"{API_BASE}/categories", timeout=30)
            
            if response.status_code == 200:
                categories = response.json()
                
                if not isinstance(categories, list):
                    self.log_result("GET /api/categories", False, "Response should be a list")
                    return False
                
                category_count = len(categories)
                
                # Check if we have the expected 805 categories
                if category_count == 805:
                    self.log_result("GET /api/categories", True, f"✅ Verified exactly 805 categories exist")
                else:
                    self.log_result("GET /api/categories", False, f"Expected 805 categories, found {category_count}")
                    return False
                
                # Validate category structure
                if categories:
                    first_category = categories[0]
                    required_fields = ['id', 'category_name', 'coa_account', 'statement_type', 'cashflow_activity']
                    missing_fields = [field for field in required_fields if field not in first_category]
                    
                    if missing_fields:
                        self.log_result("Category Structure", False, f"Missing fields: {missing_fields}")
                        return False
                    
                    self.log_result("Category Structure", True, "All required fields present in categories")
                
                return True
            else:
                self.log_result("GET /api/categories", False, f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Category Master", False, f"Exception: {str(e)}")
            return False
    
    def test_journal_entries(self):
        """Test Journal Entries: GET /api/journal-entries"""
        print("📚 Testing Journal Entries...")
        
        try:
            response = self.session.get(f"{API_BASE}/journal-entries", timeout=30)
            
            if response.status_code == 200:
                entries = response.json()
                
                if not isinstance(entries, list):
                    self.log_result("GET /api/journal-entries", False, "Response should be a list")
                    return False
                
                self.log_result("GET /api/journal-entries", True, f"Retrieved {len(entries)} journal entries")
                
                # Validate journal entry structure if entries exist
                if entries:
                    first_entry = entries[0]
                    required_fields = ['id', 'transaction_type', 'entry_date', 'line_items', 'total_debit', 'total_credit']
                    missing_fields = [field for field in required_fields if field not in first_entry]
                    
                    if missing_fields:
                        self.log_result("Journal Entry Structure", False, f"Missing fields: {missing_fields}")
                        return False
                    
                    # Validate balanced entries
                    total_debit = first_entry.get('total_debit', 0)
                    total_credit = first_entry.get('total_credit', 0)
                    
                    if abs(total_debit - total_credit) > 0.01:  # Allow small rounding differences
                        self.log_result("Journal Entry Balance", False, f"Entry not balanced: Debit={total_debit}, Credit={total_credit}")
                        return False
                    
                    self.log_result("Journal Entry Structure", True, "Journal entries are properly structured and balanced")
                
                return True
            else:
                self.log_result("GET /api/journal-entries", False, f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Journal Entries", False, f"Exception: {str(e)}")
            return False
    
    def test_collections_and_payments(self):
        """Test Collections and Payments via transactions endpoint"""
        print("💸 Testing Collections and Payments...")
        
        try:
            # Get all transactions
            response = self.session.get(f"{API_BASE}/transactions", timeout=30)
            
            if response.status_code != 200:
                self.log_result("Collections & Payments", False, f"Status: {response.status_code}")
                return False
            
            transactions = response.json()
            
            # Filter for Collections (Credit transactions)
            collections = [t for t in transactions if t.get('transaction_type') == 'Credit']
            collection_amount = sum(t.get('amount', 0) for t in collections)
            
            self.log_result("Collections (Credit Transactions)", True, f"Found {len(collections)} collections totaling ₹{collection_amount:,.0f}")
            
            # Filter for Payments (Debit transactions)
            payments = [t for t in transactions if t.get('transaction_type') == 'Debit']
            payment_amount = sum(t.get('amount', 0) for t in payments)
            
            self.log_result("Payments (Debit Transactions)", True, f"Found {len(payments)} payments totaling ₹{payment_amount:,.0f}")
            
            return True
            
        except Exception as e:
            self.log_result("Collections & Payments", False, f"Exception: {str(e)}")
            return False
    
    def run_comprehensive_test(self):
        """Run all comprehensive backend tests as requested in review"""
        print("🚀 Starting Comprehensive Backend API Testing...")
        print("=" * 60)
        
        # Step 1: Authentication
        if not self.authenticate():
            print("❌ Authentication failed. Cannot proceed with tests.")
            return False
        
        # Step 2: Run all endpoint tests as specified in review
        test_methods = [
            self.test_dashboard_metrics,
            self.test_customers_endpoints,
            self.test_vendors_endpoints,
            self.test_invoices_endpoints,
            self.test_bills_endpoints,
            self.test_aging_endpoints,
            self.test_collections_and_payments,
            self.test_banking_endpoints,
            self.test_financial_reporting_endpoints,
            self.test_category_master,
            self.test_journal_entries
        ]
        
        for test_method in test_methods:
            try:
                test_method()
            except Exception as e:
                print(f"❌ Test method {test_method.__name__} failed with exception: {str(e)}")
                self.test_results['failed'] += 1
                self.test_results['errors'].append(f"{test_method.__name__}: {str(e)}")
        
        # Step 3: Print summary
        self.print_summary()
        
        return self.test_results['failed'] == 0
    
    def print_summary(self):
        """Print comprehensive test summary"""
        print("=" * 60)
        print("📋 COMPREHENSIVE TEST SUMMARY")
        print("=" * 60)
        
        total_tests = self.test_results['passed'] + self.test_results['failed']
        success_rate = (self.test_results['passed'] / total_tests * 100) if total_tests > 0 else 0
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {self.test_results['passed']}")
        print(f"❌ Failed: {self.test_results['failed']}")
        print(f"📊 Success Rate: {success_rate:.1f}%")
        
        if self.test_results['failed'] > 0:
            print("\n🚨 FAILED TESTS:")
            for error in self.test_results['errors']:
                print(f"   • {error}")
        
        print("\n📝 DETAILED RESULTS:")
        for detail in self.test_results['details']:
            status_icon = "✅" if detail['status'] == 'PASS' else "❌"
            print(f"   {status_icon} {detail['test']}")
            if detail['message']:
                print(f"      {detail['message']}")
        
        print("=" * 60)

def main():
    """Main function to run comprehensive backend tests"""
    tester = ReviewBackendTester()
    
    try:
        success = tester.run_comprehensive_test()
        
        if success:
            print("🎉 All tests passed successfully!")
            sys.exit(0)
        else:
            print("💥 Some tests failed. Check the summary above.")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n⏹️  Testing interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"💥 Unexpected error during testing: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()