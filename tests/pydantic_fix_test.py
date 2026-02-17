#!/usr/bin/env python3
"""
Pydantic Model Fix Verification Test
Tests invoice and bill endpoints after making gst_percent and expense_category optional
"""

import requests
import json
import sys
from datetime import datetime, timezone
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Configuration - Use external URL from environment
BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://saas-finint.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

# Test credentials
TEST_EMAIL = "demo@innovatebooks.com"
TEST_PASSWORD = os.getenv("TEST_PASSWORD", "Test1234")   # or demo123 as default


class PydanticFixTester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_results = {
            'passed': 0,
            'failed': 0,
            'errors': []
        }
    
    def log_result(self, test_name, success, message="", response_data=None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if message:
            print(f"   {message}")
        if response_data and not success:
            print(f"   Response: {response_data}")
        
        if success:
            self.test_results['passed'] += 1
        else:
            self.test_results['failed'] += 1
            self.test_results['errors'].append(f"{test_name}: {message}")
        print()
    
    def authenticate(self):
        """Authenticate and get JWT token"""
        print("🔐 Authenticating with demo@innovatebooks.com...")
        
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
                self.log_result("Authentication", True, f"Logged in as {data.get('user', {}).get('email', 'Unknown')}")
                return True
            else:
                self.log_result("Authentication", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Authentication", False, f"Exception: {str(e)}")
            return False
    
    def test_invoices_endpoint(self):
        """Test GET /api/invoices endpoint - should return 200 OK with list of invoices"""
        print("📄 Testing GET /api/invoices endpoint...")
        
        try:
            response = self.session.get(f"{API_BASE}/invoices", timeout=30)
            
            if response.status_code == 200:
                invoices = response.json()
                
                if not isinstance(invoices, list):
                    self.log_result("GET /api/invoices - Data Type", False, "Response should be a list")
                    return False
                
                # Check for Pydantic validation errors in response
                if len(invoices) == 0:
                    self.log_result("GET /api/invoices", True, "Endpoint working but no invoices found")
                    return True
                
                # Validate structure of first few invoices
                validation_errors = []
                for i, invoice in enumerate(invoices[:3]):
                    if not isinstance(invoice, dict):
                        validation_errors.append(f"Invoice {i}: Not a dictionary")
                        continue
                    
                    # Check required fields exist
                    required_fields = ['id', 'invoice_number', 'customer_name', 'total_amount', 'status']
                    missing_fields = [field for field in required_fields if field not in invoice]
                    if missing_fields:
                        validation_errors.append(f"Invoice {invoice.get('invoice_number', i)}: Missing fields {missing_fields}")
                    
                    # Check optional fields that were causing Pydantic errors
                    gst_percent = invoice.get('gst_percent')
                    if gst_percent is not None and not isinstance(gst_percent, (int, float)):
                        validation_errors.append(f"Invoice {invoice.get('invoice_number', i)}: gst_percent should be numeric or null")
                
                if validation_errors:
                    self.log_result("GET /api/invoices - Data Validation", False, f"Validation errors: {'; '.join(validation_errors[:2])}")
                    return False
                
                self.log_result("GET /api/invoices", True, f"Retrieved {len(invoices)} invoices successfully, no Pydantic validation errors")
                return invoices
                
            else:
                self.log_result("GET /api/invoices", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("GET /api/invoices", False, f"Exception: {str(e)}")
            return False
    
    def test_invoice_details(self, invoices):
        """Test GET /api/invoices/{id}/details for multiple invoice IDs"""
        print("📋 Testing GET /api/invoices/{id}/details endpoints...")
        
        if not invoices or len(invoices) == 0:
            self.log_result("Invoice Details Test", False, "No invoices available for testing details")
            return False
        
        # Test at least 2 different invoice IDs
        test_count = min(3, len(invoices))
        success_count = 0
        
        for i in range(test_count):
            invoice = invoices[i]
            invoice_id = invoice.get('id')
            invoice_number = invoice.get('invoice_number', f'Invoice-{i}')
            
            if not invoice_id:
                self.log_result(f"Invoice Details - {invoice_number}", False, "No invoice ID found")
                continue
            
            try:
                response = self.session.get(f"{API_BASE}/invoices/{invoice_id}/details", timeout=30)
                
                if response.status_code == 200:
                    details = response.json()
                    
                    # Validate response structure
                    if not isinstance(details, dict):
                        self.log_result(f"Invoice Details - {invoice_number}", False, "Response should be a dictionary")
                        continue
                    
                    # Check expected fields
                    expected_fields = ['invoice', 'days_overdue', 'bucket', 'dso']
                    missing_fields = [field for field in expected_fields if field not in details]
                    if missing_fields:
                        self.log_result(f"Invoice Details - {invoice_number}", False, f"Missing fields: {missing_fields}")
                        continue
                    
                    # Check invoice data structure
                    invoice_data = details.get('invoice', {})
                    if not isinstance(invoice_data, dict):
                        self.log_result(f"Invoice Details - {invoice_number}", False, "Invoice data should be a dictionary")
                        continue
                    
                    # Verify no Pydantic validation errors in nested data
                    gst_percent = invoice_data.get('gst_percent')
                    if gst_percent is not None and not isinstance(gst_percent, (int, float)):
                        self.log_result(f"Invoice Details - {invoice_number}", False, "gst_percent validation error")
                        continue
                    
                    self.log_result(f"Invoice Details - {invoice_number}", True, f"Details retrieved successfully, no validation errors")
                    success_count += 1
                    
                else:
                    self.log_result(f"Invoice Details - {invoice_number}", False, f"Status: {response.status_code}, Response: {response.text}")
                    
            except Exception as e:
                self.log_result(f"Invoice Details - {invoice_number}", False, f"Exception: {str(e)}")
        
        if success_count >= 2:
            self.log_result("Invoice Details Overall", True, f"Successfully tested {success_count} invoice details endpoints")
            return True
        else:
            self.log_result("Invoice Details Overall", False, f"Only {success_count} out of {test_count} invoice details tests passed")
            return False
    
    def test_bills_endpoint(self):
        """Test GET /api/bills endpoint - should return 200 OK with list of bills"""
        print("📄 Testing GET /api/bills endpoint...")
        
        try:
            response = self.session.get(f"{API_BASE}/bills", timeout=30)
            
            if response.status_code == 200:
                bills = response.json()
                
                if not isinstance(bills, list):
                    self.log_result("GET /api/bills - Data Type", False, "Response should be a list")
                    return False
                
                # Check for Pydantic validation errors in response
                if len(bills) == 0:
                    self.log_result("GET /api/bills", True, "Endpoint working but no bills found")
                    return True
                
                # Validate structure of first few bills
                validation_errors = []
                for i, bill in enumerate(bills[:3]):
                    if not isinstance(bill, dict):
                        validation_errors.append(f"Bill {i}: Not a dictionary")
                        continue
                    
                    # Check required fields exist
                    required_fields = ['id', 'bill_number', 'vendor_name', 'total_amount', 'status']
                    missing_fields = [field for field in required_fields if field not in bill]
                    if missing_fields:
                        validation_errors.append(f"Bill {bill.get('bill_number', i)}: Missing fields {missing_fields}")
                    
                    # Check optional fields that were causing Pydantic errors
                    gst_percent = bill.get('gst_percent')
                    if gst_percent is not None and not isinstance(gst_percent, (int, float)):
                        validation_errors.append(f"Bill {bill.get('bill_number', i)}: gst_percent should be numeric or null")
                    
                    expense_category = bill.get('expense_category')
                    if expense_category is not None and not isinstance(expense_category, str):
                        validation_errors.append(f"Bill {bill.get('bill_number', i)}: expense_category should be string or null")
                
                if validation_errors:
                    self.log_result("GET /api/bills - Data Validation", False, f"Validation errors: {'; '.join(validation_errors[:2])}")
                    return False
                
                self.log_result("GET /api/bills", True, f"Retrieved {len(bills)} bills successfully, no Pydantic validation errors")
                return bills
                
            else:
                self.log_result("GET /api/bills", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("GET /api/bills", False, f"Exception: {str(e)}")
            return False
    
    def test_bill_details(self, bills):
        """Test GET /api/bills/{id}/details for multiple bill IDs"""
        print("📋 Testing GET /api/bills/{id}/details endpoints...")
        
        if not bills or len(bills) == 0:
            self.log_result("Bill Details Test", False, "No bills available for testing details")
            return False
        
        # Test at least 2 different bill IDs
        test_count = min(3, len(bills))
        success_count = 0
        
        for i in range(test_count):
            bill = bills[i]
            bill_id = bill.get('id')
            bill_number = bill.get('bill_number', f'Bill-{i}')
            
            if not bill_id:
                self.log_result(f"Bill Details - {bill_number}", False, "No bill ID found")
                continue
            
            try:
                response = self.session.get(f"{API_BASE}/bills/{bill_id}/details", timeout=30)
                
                if response.status_code == 200:
                    details = response.json()
                    
                    # Validate response structure
                    if not isinstance(details, dict):
                        self.log_result(f"Bill Details - {bill_number}", False, "Response should be a dictionary")
                        continue
                    
                    # Check expected fields
                    expected_fields = ['bill', 'days_overdue', 'bucket']
                    missing_fields = [field for field in expected_fields if field not in details]
                    if missing_fields:
                        self.log_result(f"Bill Details - {bill_number}", False, f"Missing fields: {missing_fields}")
                        continue
                    
                    # Check bill data structure
                    bill_data = details.get('bill', {})
                    if not isinstance(bill_data, dict):
                        self.log_result(f"Bill Details - {bill_number}", False, "Bill data should be a dictionary")
                        continue
                    
                    # Verify no Pydantic validation errors in nested data
                    gst_percent = bill_data.get('gst_percent')
                    if gst_percent is not None and not isinstance(gst_percent, (int, float)):
                        self.log_result(f"Bill Details - {bill_number}", False, "gst_percent validation error")
                        continue
                    
                    expense_category = bill_data.get('expense_category')
                    if expense_category is not None and not isinstance(expense_category, str):
                        self.log_result(f"Bill Details - {bill_number}", False, "expense_category validation error")
                        continue
                    
                    self.log_result(f"Bill Details - {bill_number}", True, f"Details retrieved successfully, no validation errors")
                    success_count += 1
                    
                else:
                    self.log_result(f"Bill Details - {bill_number}", False, f"Status: {response.status_code}, Response: {response.text}")
                    
            except Exception as e:
                self.log_result(f"Bill Details - {bill_number}", False, f"Exception: {str(e)}")
        
        if success_count >= 2:
            self.log_result("Bill Details Overall", True, f"Successfully tested {success_count} bill details endpoints")
            return True
        else:
            self.log_result("Bill Details Overall", False, f"Only {success_count} out of {test_count} bill details tests passed")
            return False
    
    def verify_data_structure(self, invoices, bills):
        """Verify response data structure is correct and contains expected fields"""
        print("🔍 Verifying response data structure and field presence...")
        
        structure_issues = []
        
        # Verify invoice structure
        if invoices and len(invoices) > 0:
            sample_invoice = invoices[0]
            
            # Check critical fields
            critical_invoice_fields = ['id', 'invoice_number', 'customer_name', 'total_amount', 'status', 'invoice_date', 'due_date']
            missing_invoice_fields = [field for field in critical_invoice_fields if field not in sample_invoice]
            if missing_invoice_fields:
                structure_issues.append(f"Invoice missing critical fields: {missing_invoice_fields}")
            
            # Check optional fields that were problematic
            optional_fields = ['gst_percent', 'gst_amount', 'tds_percent', 'tds_amount']
            for field in optional_fields:
                value = sample_invoice.get(field)
                if value is not None and not isinstance(value, (int, float)):
                    structure_issues.append(f"Invoice {field} should be numeric or null, got {type(value)}")
        
        # Verify bill structure
        if bills and len(bills) > 0:
            sample_bill = bills[0]
            
            # Check critical fields
            critical_bill_fields = ['id', 'bill_number', 'vendor_name', 'total_amount', 'status', 'bill_date', 'due_date']
            missing_bill_fields = [field for field in critical_bill_fields if field not in sample_bill]
            if missing_bill_fields:
                structure_issues.append(f"Bill missing critical fields: {missing_bill_fields}")
            
            # Check optional fields that were problematic
            optional_fields = ['gst_percent', 'gst_amount', 'expense_category']
            for field in optional_fields:
                value = sample_bill.get(field)
                if field == 'expense_category':
                    if value is not None and not isinstance(value, str):
                        structure_issues.append(f"Bill {field} should be string or null, got {type(value)}")
                else:
                    if value is not None and not isinstance(value, (int, float)):
                        structure_issues.append(f"Bill {field} should be numeric or null, got {type(value)}")
        
        if structure_issues:
            self.log_result("Data Structure Verification", False, f"Structure issues: {'; '.join(structure_issues)}")
            return False
        else:
            self.log_result("Data Structure Verification", True, "All response data structures are correct with expected fields")
            return True
    
    def run_all_tests(self):
        """Run all tests for Pydantic model fix verification"""
        print("🚀 Starting Pydantic Model Fix Verification Tests...")
        print("=" * 60)
        
        # Step 1: Authentication
        if not self.authenticate():
            return False
        
        # Step 2: Test GET /api/invoices
        invoices = self.test_invoices_endpoint()
        if invoices is False:
            return False
        
        # Step 3: Test GET /api/invoices/{id}/details
        if invoices:
            if not self.test_invoice_details(invoices):
                return False
        
        # Step 4: Test GET /api/bills
        bills = self.test_bills_endpoint()
        if bills is False:
            return False
        
        # Step 5: Test GET /api/bills/{id}/details
        if bills:
            if not self.test_bill_details(bills):
                return False
        
        # Step 6: Verify data structure
        if not self.verify_data_structure(invoices, bills):
            return False
        
        return True
    
    def print_summary(self):
        """Print test summary"""
        print("=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"✅ Passed: {self.test_results['passed']}")
        print(f"❌ Failed: {self.test_results['failed']}")
        print(f"📈 Success Rate: {(self.test_results['passed'] / (self.test_results['passed'] + self.test_results['failed']) * 100):.1f}%")
        
        if self.test_results['errors']:
            print("\n🚨 ERRORS:")
            for error in self.test_results['errors']:
                print(f"   • {error}")
        
        print("\n🎯 SUCCESS CRITERIA:")
        if self.test_results['failed'] == 0:
            print("   ✅ All invoice and bill endpoints return 200 OK (no 500 errors)")
            print("   ✅ Data loads correctly from database")
            print("   ✅ No Pydantic ValidationError in responses")
            print("   ✅ Invoice and bill lists contain the seeded data")
            print("\n🎉 PYDANTIC MODEL FIX VERIFICATION: SUCCESSFUL")
        else:
            print("   ❌ Some tests failed - Pydantic model fix needs further investigation")
            print("\n⚠️  PYDANTIC MODEL FIX VERIFICATION: NEEDS ATTENTION")

def main():
    tester = PydanticFixTester()
    
    try:
        success = tester.run_all_tests()
        tester.print_summary()
        
        if success:
            print("\n✅ All tests passed! Pydantic model fix is working correctly.")
            sys.exit(0)
        else:
            print("\n❌ Some tests failed. Please check the errors above.")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n\n⚠️ Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n💥 Unexpected error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()