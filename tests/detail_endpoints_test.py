#!/usr/bin/env python3
"""
Detail Page API Endpoints Testing Script
Tests the detail page API endpoints as requested in the review:
1. GET /api/customers/{id}/details
2. GET /api/vendors/{id}/details  
3. GET /api/invoices/{id}/details
4. GET /api/bills/{id}/details

Authentication: demo@innovatebooks.com / demo123
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

# Test credentials as specified in review request
TEST_EMAIL = "demo@innovatebooks.com"
TEST_PASSWORD = os.getenv("TEST_PASSWORD", "Test1234")   # or demo123 as default


class DetailEndpointsTester:
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
        """Authenticate with demo credentials"""
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
                user_info = data.get('user', {})
                self.log_result("Authentication", True, f"Logged in as {user_info.get('full_name', 'Unknown')} ({user_info.get('email', 'Unknown')})")
                return True
            else:
                self.log_result("Authentication", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Authentication", False, f"Exception: {str(e)}")
            return False
    
    def test_customer_details_endpoint(self):
        """Test GET /api/customers/{id}/details endpoint"""
        print("👥 Testing Customer Details Endpoint...")
        
        try:
            # Step 1: Get list of customers to get valid IDs
            print("   Step 1: Getting list of customers...")
            response = self.session.get(f"{API_BASE}/customers", timeout=30)
            
            if response.status_code != 200:
                self.log_result("Customer Details - Get List", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
            
            customers = response.json()
            if not isinstance(customers, list) or len(customers) == 0:
                self.log_result("Customer Details - Get List", False, "No customers found")
                return False
            
            self.log_result("Customer Details - Get List", True, f"Found {len(customers)} customers")
            
            # Step 2: Test details endpoint with first customer
            test_customer = customers[0]
            customer_id = test_customer.get('id')
            customer_name = test_customer.get('name', 'Unknown')
            
            print(f"   Step 2: Testing details for customer: {customer_name}")
            response = self.session.get(f"{API_BASE}/customers/{customer_id}/details", timeout=30)
            
            if response.status_code != 200:
                self.log_result("Customer Details - API Call", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
            
            details = response.json()
            
            # Step 3: Verify response structure matches expected format
            print("   Step 3: Verifying response structure...")
            expected_fields = ['customer', 'invoices', 'total_invoiced', 'total_paid']
            missing_fields = [field for field in expected_fields if field not in details]
            
            if missing_fields:
                self.log_result("Customer Details - Structure", False, f"Missing required fields: {missing_fields}")
                return False
            
            # Step 4: Check data is properly populated
            customer_obj = details.get('customer', {})
            invoices_array = details.get('invoices', [])
            total_invoiced = details.get('total_invoiced', 0)
            total_paid = details.get('total_paid', 0)
            
            # Verify customer object has ID matching request
            if customer_obj.get('id') != customer_id:
                self.log_result("Customer Details - Data Integrity", False, "Customer ID mismatch")
                return False
            
            # Verify invoices is an array
            if not isinstance(invoices_array, list):
                self.log_result("Customer Details - Invoices Array", False, "Invoices should be an array")
                return False
            
            # Verify totals are numeric
            if not isinstance(total_invoiced, (int, float)) or not isinstance(total_paid, (int, float)):
                self.log_result("Customer Details - Totals Type", False, "Totals should be numeric")
                return False
            
            self.log_result("Customer Details - Complete Test", True, 
                          f"Customer: {customer_name}, Invoices: {len(invoices_array)}, Total Invoiced: ₹{total_invoiced:,.2f}, Total Paid: ₹{total_paid:,.2f}")
            return True
            
        except Exception as e:
            self.log_result("Customer Details", False, f"Exception: {str(e)}")
            return False
    
    def test_vendor_details_endpoint(self):
        """Test GET /api/vendors/{id}/details endpoint"""
        print("🏢 Testing Vendor Details Endpoint...")
        
        try:
            # Step 1: Get list of vendors to get valid IDs
            print("   Step 1: Getting list of vendors...")
            response = self.session.get(f"{API_BASE}/vendors", timeout=30)
            
            if response.status_code != 200:
                self.log_result("Vendor Details - Get List", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
            
            vendors = response.json()
            if not isinstance(vendors, list) or len(vendors) == 0:
                self.log_result("Vendor Details - Get List", False, "No vendors found")
                return False
            
            self.log_result("Vendor Details - Get List", True, f"Found {len(vendors)} vendors")
            
            # Step 2: Test details endpoint with first vendor
            test_vendor = vendors[0]
            vendor_id = test_vendor.get('id')
            vendor_name = test_vendor.get('name', 'Unknown')
            
            print(f"   Step 2: Testing details for vendor: {vendor_name}")
            response = self.session.get(f"{API_BASE}/vendors/{vendor_id}/details", timeout=30)
            
            if response.status_code != 200:
                self.log_result("Vendor Details - API Call", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
            
            details = response.json()
            
            # Step 3: Verify response structure matches expected format
            print("   Step 3: Verifying response structure...")
            expected_fields = ['vendor', 'bills', 'total_billed', 'total_paid']
            missing_fields = [field for field in expected_fields if field not in details]
            
            if missing_fields:
                self.log_result("Vendor Details - Structure", False, f"Missing required fields: {missing_fields}")
                return False
            
            # Step 4: Check data is properly populated
            vendor_obj = details.get('vendor', {})
            bills_array = details.get('bills', [])
            total_billed = details.get('total_billed', 0)
            total_paid = details.get('total_paid', 0)
            
            # Verify vendor object has ID matching request
            if vendor_obj.get('id') != vendor_id:
                self.log_result("Vendor Details - Data Integrity", False, "Vendor ID mismatch")
                return False
            
            # Verify bills is an array
            if not isinstance(bills_array, list):
                self.log_result("Vendor Details - Bills Array", False, "Bills should be an array")
                return False
            
            # Verify totals are numeric
            if not isinstance(total_billed, (int, float)) or not isinstance(total_paid, (int, float)):
                self.log_result("Vendor Details - Totals Type", False, "Totals should be numeric")
                return False
            
            self.log_result("Vendor Details - Complete Test", True, 
                          f"Vendor: {vendor_name}, Bills: {len(bills_array)}, Total Billed: ₹{total_billed:,.2f}, Total Paid: ₹{total_paid:,.2f}")
            return True
            
        except Exception as e:
            self.log_result("Vendor Details", False, f"Exception: {str(e)}")
            return False
    
    def test_invoice_details_endpoint(self):
        """Test GET /api/invoices/{id}/details endpoint"""
        print("📄 Testing Invoice Details Endpoint...")
        
        try:
            # Step 1: Get list of invoices to get valid IDs
            print("   Step 1: Getting list of invoices...")
            response = self.session.get(f"{API_BASE}/invoices", timeout=30)
            
            if response.status_code != 200:
                self.log_result("Invoice Details - Get List", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
            
            invoices = response.json()
            if not isinstance(invoices, list) or len(invoices) == 0:
                self.log_result("Invoice Details - Get List", False, "No invoices found")
                return False
            
            self.log_result("Invoice Details - Get List", True, f"Found {len(invoices)} invoices")
            
            # Step 2: Test details endpoint with first invoice
            test_invoice = invoices[0]
            invoice_id = test_invoice.get('id')
            invoice_number = test_invoice.get('invoice_number', 'Unknown')
            
            print(f"   Step 2: Testing details for invoice: {invoice_number}")
            response = self.session.get(f"{API_BASE}/invoices/{invoice_id}/details", timeout=30)
            
            if response.status_code != 200:
                self.log_result("Invoice Details - API Call", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
            
            details = response.json()
            
            # Step 3: Verify response structure matches expected format
            print("   Step 3: Verifying response structure...")
            expected_fields = ['invoice', 'days_overdue', 'bucket', 'dso', 'activities']
            missing_fields = [field for field in expected_fields if field not in details]
            
            if missing_fields:
                self.log_result("Invoice Details - Structure", False, f"Missing required fields: {missing_fields}")
                return False
            
            # Step 4: Check additional calculated fields are present
            invoice_obj = details.get('invoice', {})
            days_overdue = details.get('days_overdue')
            bucket = details.get('bucket')
            dso = details.get('dso')
            activities = details.get('activities', [])
            
            # Verify invoice object has ID matching request
            if invoice_obj.get('id') != invoice_id:
                self.log_result("Invoice Details - Data Integrity", False, "Invoice ID mismatch")
                return False
            
            # Verify additional fields are properly calculated
            if not isinstance(days_overdue, (int, float)):
                self.log_result("Invoice Details - Days Overdue", False, "days_overdue should be numeric")
                return False
            
            if not isinstance(dso, (int, float)):
                self.log_result("Invoice Details - DSO", False, "dso should be numeric")
                return False
            
            # Verify activities is an array
            if not isinstance(activities, list):
                self.log_result("Invoice Details - Activities", False, "activities should be an array")
                return False
            
            # Check bucket logic (can be null for paid invoices)
            status = invoice_obj.get('status', '')
            if status == 'Paid' and bucket is not None:
                self.log_result("Invoice Details - Bucket Logic", False, "Paid invoices should have bucket=null")
                return False
            
            self.log_result("Invoice Details - Complete Test", True, 
                          f"Invoice: {invoice_number}, Status: {status}, Days Overdue: {days_overdue}, DSO: {dso}, Bucket: {bucket}, Activities: {len(activities)}")
            return True
            
        except Exception as e:
            self.log_result("Invoice Details", False, f"Exception: {str(e)}")
            return False
    
    def test_bill_details_endpoint(self):
        """Test GET /api/bills/{id}/details endpoint"""
        print("🧾 Testing Bill Details Endpoint...")
        
        try:
            # Step 1: Get list of bills to get valid IDs
            print("   Step 1: Getting list of bills...")
            response = self.session.get(f"{API_BASE}/bills", timeout=30)
            
            if response.status_code != 200:
                self.log_result("Bill Details - Get List", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
            
            bills = response.json()
            if not isinstance(bills, list) or len(bills) == 0:
                self.log_result("Bill Details - Get List", False, "No bills found")
                return False
            
            self.log_result("Bill Details - Get List", True, f"Found {len(bills)} bills")
            
            # Step 2: Test details endpoint with first bill
            test_bill = bills[0]
            bill_id = test_bill.get('id')
            bill_number = test_bill.get('bill_number', 'Unknown')
            
            print(f"   Step 2: Testing details for bill: {bill_number}")
            response = self.session.get(f"{API_BASE}/bills/{bill_id}/details", timeout=30)
            
            if response.status_code != 200:
                self.log_result("Bill Details - API Call", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
            
            details = response.json()
            
            # Step 3: Verify response structure matches expected format
            print("   Step 3: Verifying response structure...")
            expected_fields = ['bill', 'days_overdue', 'bucket']
            missing_fields = [field for field in expected_fields if field not in details]
            
            if missing_fields:
                self.log_result("Bill Details - Structure", False, f"Missing required fields: {missing_fields}")
                return False
            
            # Step 4: Check additional calculated fields are present
            bill_obj = details.get('bill', {})
            days_overdue = details.get('days_overdue')
            bucket = details.get('bucket')
            
            # Verify bill object has ID matching request
            if bill_obj.get('id') != bill_id:
                self.log_result("Bill Details - Data Integrity", False, "Bill ID mismatch")
                return False
            
            # Verify additional fields are properly calculated
            if not isinstance(days_overdue, (int, float)):
                self.log_result("Bill Details - Days Overdue", False, "days_overdue should be numeric")
                return False
            
            # Verify bucket is a string (aging bucket)
            if bucket is not None and not isinstance(bucket, str):
                self.log_result("Bill Details - Bucket Type", False, "bucket should be a string or null")
                return False
            
            self.log_result("Bill Details - Complete Test", True, 
                          f"Bill: {bill_number}, Days Overdue: {days_overdue}, Bucket: {bucket}")
            return True
            
        except Exception as e:
            self.log_result("Bill Details", False, f"Exception: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all detail endpoint tests"""
        print("🚀 Starting Detail Page API Endpoints Testing...")
        print(f"Backend URL: {BACKEND_URL}")
        print(f"API Base: {API_BASE}")
        print()
        
        # Authenticate first
        if not self.authenticate():
            print("❌ Authentication failed. Cannot proceed with tests.")
            return False
        
        # Run all tests
        tests = [
            self.test_customer_details_endpoint,
            self.test_vendor_details_endpoint,
            self.test_invoice_details_endpoint,
            self.test_bill_details_endpoint
        ]
        
        all_passed = True
        for test in tests:
            try:
                result = test()
                if not result:
                    all_passed = False
            except Exception as e:
                print(f"❌ Test {test.__name__} failed with exception: {str(e)}")
                all_passed = False
        
        # Print summary
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
        
        print()
        if all_passed:
            print("🎉 ALL DETAIL ENDPOINT TESTS PASSED!")
            print("✅ All endpoints return 200 OK")
            print("✅ Response structures match expected format")
            print("✅ Data is properly populated with relationships")
        else:
            print("⚠️  SOME TESTS FAILED - See details above")
        
        return all_passed

if __name__ == "__main__":
    tester = DetailEndpointsTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)