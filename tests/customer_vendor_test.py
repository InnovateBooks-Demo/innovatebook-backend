#!/usr/bin/env python3
"""
Customer and Vendor Details Endpoints Test
Tests the specific endpoints requested in the review
"""

import requests
import json
import sys

# Configuration - Use local backend
API_BASE = "http://localhost:8001/api"

# Test credentials
TEST_EMAIL = "demo@innovatebooks.com"
TEST_PASSWORD = os.getenv("TEST_PASSWORD", "Test1234")   # or demo123 as default


class CustomerVendorTester:
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
        print("🔐 Authenticating with demo credentials...")
        
        try:
            response = self.session.post(
                f"{API_BASE}/auth/login",
                json={
                    "email": TEST_EMAIL,
                    "password": TEST_PASSWORD
                },
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data.get('access_token')
                self.session.headers.update({
                    'Authorization': f'Bearer {self.auth_token}'
                })
                user_email = data.get('user', {}).get('email', 'Unknown')
                self.log_result("Authentication", True, f"Logged in as {user_email}")
                return True
            else:
                self.log_result("Authentication", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Authentication", False, f"Exception: {str(e)}")
            return False
    
    def test_customer_details_endpoints(self):
        """Test customer details endpoints as per review request"""
        print("👥 Testing Customer Details Endpoints...")
        
        try:
            # Step 1: Get list of customers (GET /api/customers)
            print("   Step 1: GET /api/customers")
            response = self.session.get(f"{API_BASE}/customers", timeout=10)
            
            if response.status_code != 200:
                self.log_result("GET /api/customers", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
            
            customers = response.json()
            if not isinstance(customers, list):
                self.log_result("GET /api/customers", False, "Response should be a list")
                return False
            
            self.log_result("GET /api/customers", True, f"Retrieved {len(customers)} customers")
            
            if len(customers) == 0:
                self.log_result("Customer Details Test", False, "No customers found for testing")
                return False
            
            # Step 2: Pick first customer ID
            first_customer = customers[0]
            customer_id = first_customer.get('id')
            customer_name = first_customer.get('name', 'Unknown')
            
            if not customer_id:
                self.log_result("Customer ID Selection", False, "First customer has no ID")
                return False
            
            print(f"   Step 2: Selected customer - {customer_name} (ID: {customer_id})")
            
            # Step 3: Test customer details endpoint (GET /api/customers/{id})
            print(f"   Step 3: GET /api/customers/{customer_id}/details")
            response = self.session.get(f"{API_BASE}/customers/{customer_id}/details", timeout=10)
            
            if response.status_code != 200:
                self.log_result("GET /api/customers/{id}/details", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
            
            customer_details = response.json()
            
            # Validate response structure
            expected_fields = ['customer', 'invoices', 'payments', 'total_invoiced', 'total_paid', 'documents', 'notes']
            missing_fields = [field for field in expected_fields if field not in customer_details]
            
            if missing_fields:
                self.log_result("Customer Details Structure", False, f"Missing fields: {missing_fields}")
                return False
            
            # Validate data integrity
            customer_data = customer_details.get('customer', {})
            if customer_data.get('id') != customer_id:
                self.log_result("Customer Details Data", False, "Customer ID mismatch in details")
                return False
            
            invoices_count = len(customer_details.get('invoices', []))
            payments_count = len(customer_details.get('payments', []))
            total_invoiced = customer_details.get('total_invoiced', 0)
            total_paid = customer_details.get('total_paid', 0)
            
            self.log_result("GET /api/customers/{id}/details", True, 
                          f"Customer: {customer_name}, Invoices: {invoices_count}, Payments: {payments_count}, Total Invoiced: ₹{total_invoiced:,.2f}, Total Paid: ₹{total_paid:,.2f}")
            
            return True
            
        except Exception as e:
            self.log_result("Customer Details Test", False, f"Exception: {str(e)}")
            return False
    
    def test_vendor_details_endpoints(self):
        """Test vendor details endpoints as per review request"""
        print("🏢 Testing Vendor Details Endpoints...")
        
        try:
            # Step 1: Get list of vendors (GET /api/vendors)
            print("   Step 1: GET /api/vendors")
            response = self.session.get(f"{API_BASE}/vendors", timeout=10)
            
            if response.status_code != 200:
                self.log_result("GET /api/vendors", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
            
            vendors = response.json()
            if not isinstance(vendors, list):
                self.log_result("GET /api/vendors", False, "Response should be a list")
                return False
            
            self.log_result("GET /api/vendors", True, f"Retrieved {len(vendors)} vendors")
            
            if len(vendors) == 0:
                self.log_result("Vendor Details Test", False, "No vendors found for testing")
                return False
            
            # Step 2: Pick first vendor ID
            first_vendor = vendors[0]
            vendor_id = first_vendor.get('id')
            vendor_name = first_vendor.get('name', 'Unknown')
            
            if not vendor_id:
                self.log_result("Vendor ID Selection", False, "First vendor has no ID")
                return False
            
            print(f"   Step 2: Selected vendor - {vendor_name} (ID: {vendor_id})")
            
            # Step 3: Test vendor details endpoint (GET /api/vendors/{id})
            print(f"   Step 3: GET /api/vendors/{vendor_id}/details")
            response = self.session.get(f"{API_BASE}/vendors/{vendor_id}/details", timeout=10)
            
            if response.status_code != 200:
                self.log_result("GET /api/vendors/{id}/details", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
            
            vendor_details = response.json()
            
            # Validate response structure
            expected_fields = ['vendor', 'bills', 'payments', 'total_billed', 'total_paid', 'documents', 'notes']
            missing_fields = [field for field in expected_fields if field not in vendor_details]
            
            if missing_fields:
                self.log_result("Vendor Details Structure", False, f"Missing fields: {missing_fields}")
                return False
            
            # Validate data integrity
            vendor_data = vendor_details.get('vendor', {})
            if vendor_data.get('id') != vendor_id:
                self.log_result("Vendor Details Data", False, "Vendor ID mismatch in details")
                return False
            
            bills_count = len(vendor_details.get('bills', []))
            payments_count = len(vendor_details.get('payments', []))
            total_billed = vendor_details.get('total_billed', 0)
            total_paid = vendor_details.get('total_paid', 0)
            
            self.log_result("GET /api/vendors/{id}/details", True, 
                          f"Vendor: {vendor_name}, Bills: {bills_count}, Payments: {payments_count}, Total Billed: ₹{total_billed:,.2f}, Total Paid: ₹{total_paid:,.2f}")
            
            return True
            
        except Exception as e:
            self.log_result("Vendor Details Test", False, f"Exception: {str(e)}")
            return False
    
    def run_tests(self):
        """Run all customer and vendor details tests"""
        print("🚀 Starting Customer and Vendor Details Endpoint Tests")
        print("=" * 60)
        
        # Authentication is required
        if not self.authenticate():
            print("❌ Authentication failed. Cannot proceed with tests.")
            return False
        
        # Run the specific tests requested in the review
        tests = [
            self.test_customer_details_endpoints,
            self.test_vendor_details_endpoints
        ]
        
        for test in tests:
            try:
                test()
            except Exception as e:
                print(f"❌ Test {test.__name__} crashed: {str(e)}")
                self.test_results['failed'] += 1
                self.test_results['errors'].append(f"{test.__name__}: Crashed with {str(e)}")
        
        # Print summary
        print("=" * 60)
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
    tester = CustomerVendorTester()
    success = tester.run_tests()
    sys.exit(0 if success else 1)