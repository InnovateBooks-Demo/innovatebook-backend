#!/usr/bin/env python3
"""
Focused Invoice Logic Testing Script
Tests only the invoice logic fixes as requested in the review
"""

import requests
import json
import sys
from datetime import datetime, timezone
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Configuration
BASE_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://saas-finint.preview.emergentagent.com')
API_BASE = f"{BASE_URL}/api"

# Test credentials
TEST_EMAIL = "demo@innovatebooks.com"
TEST_PASSWORD = os.getenv("TEST_PASSWORD", "Test1234")   # or demo123 as default


class InvoiceLogicTester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_results = {
            'passed': 0,
            'failed': 0,
            'errors': []
        }
    
    def log_result(self, test_name, success, message=""):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if message:
            print(f"   {message}")
        
        if success:
            self.test_results['passed'] += 1
        else:
            self.test_results['failed'] += 1
            self.test_results['errors'].append(f"{test_name}: {message}")
        print()
    
    def authenticate(self):
        """Authenticate and get JWT token"""
        print("🔐 Authenticating...")
        
        try:
            response = self.session.post(
                f"{API_BASE}/auth/login",
                json={
                    "email": TEST_EMAIL,
                    "password": TEST_PASSWORD
                },
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data.get('access_token')
                self.session.headers.update({
                    'Authorization': f'Bearer {self.auth_token}'
                })
                self.log_result("Authentication", True, f"Logged in as {data.get('user', {}).get('email', 'Unknown')}")
                return True
            else:
                self.log_result("Authentication", False, f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Authentication", False, f"Exception: {str(e)}")
            return False
    
    def test_invoice_list_logic(self):
        """Test GET /api/invoices for net_receivable, balance_due, and status logic"""
        print("📄 Testing Invoice List Logic Fixes...")
        
        try:
            response = self.session.get(f"{API_BASE}/invoices", timeout=15)
            
            if response.status_code != 200:
                self.log_result("Invoice List API", False, f"Status: {response.status_code}")
                return False
            
            invoices = response.json()
            if not isinstance(invoices, list) or len(invoices) == 0:
                self.log_result("Invoice List Data", False, "No invoices found")
                return False
            
            print(f"   Analyzing {len(invoices)} invoices...")
            
            # Test calculations and status logic
            calculation_errors = 0
            status_errors = 0
            sample_results = []
            
            for i, invoice in enumerate(invoices):
                total_amount = invoice.get('total_amount', 0)
                tds_amount = invoice.get('tds_amount', 0)
                amount_received = invoice.get('amount_received', 0)
                net_receivable = invoice.get('net_receivable', 0)
                balance_due = invoice.get('balance_due', 0)
                status = invoice.get('status', '')
                
                # Check net_receivable calculation
                expected_net_receivable = total_amount - tds_amount
                if abs(net_receivable - expected_net_receivable) > 0.01:
                    calculation_errors += 1
                
                # Check balance_due calculation
                expected_balance_due = max(0, expected_net_receivable - amount_received)
                if abs(balance_due - expected_balance_due) > 0.01:
                    calculation_errors += 1
                
                # Check status logic
                if amount_received == 0:
                    expected_status = "Unpaid"
                elif amount_received >= expected_net_receivable:
                    expected_status = "Paid"
                else:
                    expected_status = "Partially Paid"
                
                if status != expected_status:
                    status_errors += 1
                
                # Collect sample results for first 3 invoices
                if i < 3:
                    sample_results.append(f"Invoice {invoice.get('invoice_number')}: net_receivable={net_receivable}, balance_due={balance_due}, status='{status}'")
            
            # Show sample results
            print("   Sample results:")
            for result in sample_results:
                print(f"     {result}")
            
            # Report results
            if calculation_errors == 0:
                self.log_result("Net Receivable & Balance Due Calculations", True, f"All {len(invoices)} invoices have correct calculations")
            else:
                self.log_result("Net Receivable & Balance Due Calculations", False, f"{calculation_errors} calculation errors found")
            
            if status_errors == 0:
                self.log_result("Invoice Status Logic", True, f"All {len(invoices)} invoices have correct status")
            else:
                self.log_result("Invoice Status Logic", False, f"{status_errors} status errors found")
            
            return calculation_errors == 0 and status_errors == 0
            
        except Exception as e:
            self.log_result("Invoice List Logic", False, f"Exception: {str(e)}")
            return False
    
    def test_invoice_details_logic(self):
        """Test GET /api/invoices/{id}/details for balance_due, bucket, and DSO logic"""
        print("📄 Testing Invoice Details Logic Fixes...")
        
        try:
            # First get some invoices
            response = self.session.get(f"{API_BASE}/invoices", timeout=15)
            if response.status_code != 200:
                self.log_result("Invoice Details Setup", False, "Could not get invoices list")
                return False
            
            invoices = response.json()
            if len(invoices) == 0:
                self.log_result("Invoice Details Setup", False, "No invoices available")
                return False
            
            # Test details for first 3 invoices
            test_invoices = invoices[:3]
            details_errors = 0
            bucket_errors = 0
            dso_errors = 0
            sample_results = []
            
            for invoice in test_invoices:
                invoice_id = invoice.get('id')
                invoice_number = invoice.get('invoice_number')
                if not invoice_id:
                    continue
                
                response = self.session.get(f"{API_BASE}/invoices/{invoice_id}/details", timeout=15)
                if response.status_code != 200:
                    details_errors += 1
                    continue
                
                details = response.json()
                invoice_data = details.get('invoice', {})
                
                # Check balance_due calculation
                total_amount = invoice_data.get('total_amount', 0)
                tds_amount = invoice_data.get('tds_amount', 0)
                amount_received = invoice_data.get('amount_received', 0)
                balance_due = invoice_data.get('balance_due', 0)
                
                expected_net_receivable = total_amount - tds_amount
                expected_balance_due = max(0, expected_net_receivable - amount_received)
                
                if abs(balance_due - expected_balance_due) > 0.01:
                    details_errors += 1
                
                # Check bucket logic for paid invoices
                status = invoice_data.get('status', '')
                bucket = details.get('bucket')
                dso = details.get('dso', 0)
                
                if status == "Paid" and bucket is not None:
                    bucket_errors += 1
                
                # Check DSO is reasonable (not negative, not too large)
                if dso < 0 or dso > 1000:  # Reasonable bounds
                    dso_errors += 1
                
                # Collect sample results
                sample_results.append(f"Invoice {invoice_number}: balance_due={balance_due}, bucket={bucket}, dso={dso}, status='{status}'")
            
            # Show sample results
            print("   Sample results:")
            for result in sample_results:
                print(f"     {result}")
            
            # Report results
            if details_errors == 0:
                self.log_result("Invoice Details Balance Due", True, f"All {len(test_invoices)} invoice details have correct balance_due")
            else:
                self.log_result("Invoice Details Balance Due", False, f"{details_errors} balance_due errors found")
            
            if bucket_errors == 0:
                self.log_result("Invoice Details Bucket Logic", True, "Paid invoices correctly have bucket=null")
            else:
                self.log_result("Invoice Details Bucket Logic", False, f"{bucket_errors} bucket logic errors found")
            
            if dso_errors == 0:
                self.log_result("Invoice Details DSO Logic", True, "All DSO calculations are reasonable")
            else:
                self.log_result("Invoice Details DSO Logic", False, f"{dso_errors} DSO calculation errors found")
            
            return details_errors == 0 and bucket_errors == 0 and dso_errors == 0
            
        except Exception as e:
            self.log_result("Invoice Details Logic", False, f"Exception: {str(e)}")
            return False
    
    def run_tests(self):
        """Run focused invoice logic tests"""
        print("🚀 Starting Invoice Logic Tests")
        print("=" * 50)
        
        if not self.authenticate():
            print("❌ Authentication failed. Cannot proceed with tests.")
            return False
        
        # Run tests
        test1_result = self.test_invoice_list_logic()
        test2_result = self.test_invoice_details_logic()
        
        # Print summary
        print("=" * 50)
        print("📋 TEST SUMMARY")
        print(f"✅ Passed: {self.test_results['passed']}")
        print(f"❌ Failed: {self.test_results['failed']}")
        
        if self.test_results['errors']:
            print("\n🚨 FAILED TESTS:")
            for error in self.test_results['errors']:
                print(f"   • {error}")
        
        success_rate = (self.test_results['passed'] / (self.test_results['passed'] + self.test_results['failed'])) * 100 if (self.test_results['passed'] + self.test_results['failed']) > 0 else 0
        print(f"\n📊 Success Rate: {success_rate:.1f}%")
        
        return self.test_results['failed'] == 0

if __name__ == "__main__":
    tester = InvoiceLogicTester()
    success = tester.run_tests()
    sys.exit(0 if success else 1)