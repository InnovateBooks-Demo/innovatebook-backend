#!/usr/bin/env python3
"""
Focused Invoice CRUD Testing Script
Tests the Invoice CRUD operations as requested in the review
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


class InvoiceTester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_results = []
    
    def log_result(self, test_name, success, message=""):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if message:
            print(f"   {message}")
        
        self.test_results.append({
            'test': test_name,
            'success': success,
            'message': message
        })
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
    
    def test_invoice_operations(self):
        """Test all invoice CRUD operations as requested"""
        print("📄 Testing Invoice CRUD Operations...")
        
        try:
            # 1. GET /api/invoices - List all invoices
            print("1. Testing GET /api/invoices - List all invoices")
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
                self.log_result("Invoice CRUD Test", False, "No invoices available for testing")
                return False
            
            # Pick first invoice for testing
            test_invoice = invoices[0]
            invoice_id = test_invoice.get('id')
            invoice_number = test_invoice.get('invoice_number')
            
            # 2. GET /api/invoices/{id} - Get invoice details
            print(f"2. Testing GET /api/invoices/{invoice_id} - Get invoice details")
            response = self.session.get(f"{API_BASE}/invoices/{invoice_id}/details", timeout=30)
            
            if response.status_code == 200:
                invoice_details = response.json()
                if 'invoice' in invoice_details:
                    self.log_result("GET /api/invoices/{id}", True, f"Retrieved details for {invoice_number}")
                else:
                    self.log_result("GET /api/invoices/{id}", False, "Missing 'invoice' field in response")
                    return False
            else:
                self.log_result("GET /api/invoices/{id}", False, f"Status: {response.status_code}")
                return False
            
            # 3. PUT /api/invoices/{id} - Update invoice (CRITICAL)
            print(f"3. Testing PUT /api/invoices/{invoice_id} - Update invoice (CRITICAL)")
            
            # Prepare update data
            update_data = {
                "customer_id": test_invoice.get('customer_id'),
                "invoice_date": test_invoice.get('invoice_date'),
                "due_date": test_invoice.get('due_date'),
                "base_amount": 60000.0,  # Updated amount
                "gst_percent": 18.0,
                "gst_amount": 10800.0,   # Updated GST
                "tds_percent": 0.0,
                "tds_amount": 0.0,
                "total_amount": 70800.0,  # Updated total
                "internal_poc_name": "Updated Test POC",
                "internal_poc_email": "updated.test@company.com",
                "internal_poc_phone": "+91-9999999999",
                "external_poc_name": test_invoice.get('external_poc_name', ""),
                "external_poc_email": test_invoice.get('external_poc_email', ""),
                "external_poc_phone": test_invoice.get('external_poc_phone', ""),
                "items": test_invoice.get('items', [])
            }
            
            response = self.session.put(f"{API_BASE}/invoices/{invoice_id}", json=update_data, timeout=30)
            
            if response.status_code == 200:
                self.log_result("PUT /api/invoices/{id}", True, f"Updated invoice {invoice_number} - New total: ₹{update_data['total_amount']:,.2f}")
                
                # Verify the update
                verify_response = self.session.get(f"{API_BASE}/invoices/{invoice_id}/details", timeout=30)
                if verify_response.status_code == 200:
                    updated_invoice = verify_response.json().get('invoice', {})
                    if updated_invoice.get('internal_poc_name') == "Updated Test POC":
                        self.log_result("UPDATE Verification", True, "Update successfully applied")
                    else:
                        self.log_result("UPDATE Verification", False, "Update not reflected in database")
                        return False
                else:
                    self.log_result("UPDATE Verification", False, "Could not verify update")
                    return False
            else:
                self.log_result("PUT /api/invoices/{id}", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
            
            # 4. Create a test invoice for deletion
            print("4. Creating test invoice for deletion test")
            test_invoice_data = {
                "customer_id": test_invoice.get('customer_id'),
                "invoice_date": datetime.now(timezone.utc).isoformat(),
                "due_date": datetime.now(timezone.utc).isoformat(),
                "base_amount": 25000.0,
                "gst_percent": 18.0,
                "gst_amount": 4500.0,
                "tds_percent": 0.0,
                "tds_amount": 0.0,
                "total_amount": 29500.0,
                "internal_poc_name": "Delete Test POC",
                "internal_poc_email": "delete.test@company.com",
                "internal_poc_phone": "+91-8888888888",
                "items": []
            }
            
            create_response = self.session.post(f"{API_BASE}/invoices", json=test_invoice_data, timeout=30)
            if create_response.status_code != 200:
                self.log_result("Create Test Invoice", False, f"Could not create test invoice: {create_response.status_code}")
                return False
            
            delete_invoice = create_response.json()
            delete_invoice_id = delete_invoice.get('id')
            delete_invoice_number = delete_invoice.get('invoice_number')
            
            self.log_result("Create Test Invoice", True, f"Created {delete_invoice_number} for deletion test")
            
            # 5. DELETE /api/invoices/{id} - Delete invoice (CRITICAL)
            print(f"5. Testing DELETE /api/invoices/{delete_invoice_id} - Delete invoice (CRITICAL)")
            
            response = self.session.delete(f"{API_BASE}/invoices/{delete_invoice_id}", timeout=30)
            
            if response.status_code == 200:
                self.log_result("DELETE /api/invoices/{id}", True, f"Deleted invoice {delete_invoice_number}")
                
                # Verify deletion
                verify_response = self.session.get(f"{API_BASE}/invoices/{delete_invoice_id}/details", timeout=30)
                if verify_response.status_code == 404:
                    self.log_result("DELETE Verification", True, "Invoice properly deleted (404 response)")
                else:
                    self.log_result("DELETE Verification", False, f"Invoice still exists after deletion (status: {verify_response.status_code})")
                    return False
            else:
                self.log_result("DELETE /api/invoices/{id}", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
            
            return True
            
        except Exception as e:
            self.log_result("Invoice CRUD Operations", False, f"Exception: {str(e)}")
            return False
    
    def run_test(self):
        """Run the focused invoice test"""
        print("🚀 Starting Focused Invoice CRUD Tests")
        print("=" * 60)
        
        # Authentication is required
        if not self.authenticate():
            print("❌ Authentication failed. Cannot proceed with tests.")
            return False
        
        # Run invoice operations test
        success = self.test_invoice_operations()
        
        # Print summary
        print("=" * 60)
        print("📋 TEST SUMMARY")
        
        passed = sum(1 for result in self.test_results if result['success'])
        failed = len(self.test_results) - passed
        
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        
        if failed > 0:
            print("\n🚨 FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"   • {result['test']}: {result['message']}")
        
        success_rate = (passed / len(self.test_results)) * 100 if self.test_results else 0
        print(f"\n📊 Success Rate: {success_rate:.1f}%")
        
        return success

if __name__ == "__main__":
    tester = InvoiceTester()
    success = tester.run_test()
    sys.exit(0 if success else 1)