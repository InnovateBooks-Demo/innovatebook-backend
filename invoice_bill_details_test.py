#!/usr/bin/env python3
"""
Invoice and Bill Details Endpoint Testing Script
Specific test for review request: Test invoice and bill details endpoints
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

# Test credentials
TEST_EMAIL = "demo@innovatebooks.com"
TEST_PASSWORD = os.getenv("TEST_PASSWORD", "Test1234")   # or demo123 as default


class InvoiceBillDetailsTester:
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
        print("🔐 Step 1: Authenticating with demo@innovatebooks.com / demo123...")
        
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
                self.log_result("Authentication", True, f"Successfully logged in as {data.get('user', {}).get('email', 'Unknown')}")
                return True
            else:
                self.log_result("Authentication", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Authentication", False, f"Exception: {str(e)}")
            return False
    
    def test_invoice_details_endpoints(self):
        """Test invoice details endpoints as per review request"""
        print("📄 Step 2: Testing Invoice Details Endpoints...")
        
        try:
            # Step 2a: GET /api/invoices - get first invoice ID
            print("   Step 2a: GET /api/invoices - getting first invoice ID...")
            response = self.session.get(f"{API_BASE}/invoices", timeout=30)
            
            if response.status_code != 200:
                self.log_result("GET /api/invoices", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
            
            invoices = response.json()
            if not isinstance(invoices, list):
                self.log_result("GET /api/invoices", False, "Response should be a list")
                return False
            
            if len(invoices) == 0:
                self.log_result("GET /api/invoices", False, "No invoices found")
                return False
            
            first_invoice = invoices[0]
            invoice_id = first_invoice.get('id')
            invoice_number = first_invoice.get('invoice_number', 'Unknown')
            
            self.log_result("GET /api/invoices", True, f"Retrieved {len(invoices)} invoices. First invoice: {invoice_number} (ID: {invoice_id})")
            
            # Step 2b: GET /api/invoices/{id}/details - test invoice details
            print(f"   Step 2b: GET /api/invoices/{invoice_id}/details - testing invoice details...")
            response = self.session.get(f"{API_BASE}/invoices/{invoice_id}/details", timeout=30)
            
            if response.status_code != 200:
                self.log_result("GET /api/invoices/{id}/details", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
            
            invoice_details = response.json()
            
            # Print exact response structure
            print("\n" + "="*80)
            print("📋 INVOICE DETAILS RESPONSE STRUCTURE:")
            print("="*80)
            print(json.dumps(invoice_details, indent=2, default=str))
            print("="*80)
            
            # Analyze structure
            print("\n🔍 INVOICE DETAILS STRUCTURE ANALYSIS:")
            print(f"   Root level fields: {list(invoice_details.keys())}")
            
            if 'invoice' in invoice_details:
                invoice_data = invoice_details['invoice']
                print(f"   Fields inside 'invoice': {list(invoice_data.keys())}")
                
                # Key financial fields
                print(f"\n💰 KEY FINANCIAL DATA:")
                print(f"   Invoice Number: {invoice_data.get('invoice_number', 'N/A')}")
                print(f"   Customer Name: {invoice_data.get('customer_name', 'N/A')}")
                print(f"   Total Amount: ₹{invoice_data.get('total_amount', 0):,.2f}")
                print(f"   Amount Received: ₹{invoice_data.get('amount_received', 0):,.2f}")
                print(f"   Net Receivable: ₹{invoice_data.get('net_receivable', 0):,.2f}")
                print(f"   Balance Due: ₹{invoice_data.get('balance_due', 0):,.2f}")
                print(f"   Status: {invoice_data.get('status', 'N/A')}")
                print(f"   Invoice Date: {invoice_data.get('invoice_date', 'N/A')}")
                print(f"   Due Date: {invoice_data.get('due_date', 'N/A')}")
                print(f"   Payment Date: {invoice_data.get('payment_date', 'N/A')}")
            
            # Additional fields
            print(f"\n📊 ADDITIONAL FIELDS:")
            print(f"   Days Overdue: {invoice_details.get('days_overdue', 'N/A')}")
            print(f"   Bucket: {invoice_details.get('bucket', 'N/A')}")
            print(f"   DSO: {invoice_details.get('dso', 'N/A')}")
            print(f"   Activities Count: {len(invoice_details.get('activities', []))}")
            
            self.log_result("GET /api/invoices/{id}/details", True, f"Invoice details retrieved successfully for {invoice_number}")
            return True
            
        except Exception as e:
            self.log_result("Invoice Details Test", False, f"Exception: {str(e)}")
            return False
    
    def test_bill_details_endpoints(self):
        """Test bill details endpoints as per review request"""
        print("📄 Step 3: Testing Bill Details Endpoints...")
        
        try:
            # Step 3a: GET /api/bills - get first bill ID
            print("   Step 3a: GET /api/bills - getting first bill ID...")
            response = self.session.get(f"{API_BASE}/bills", timeout=30)
            
            if response.status_code != 200:
                self.log_result("GET /api/bills", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
            
            bills = response.json()
            if not isinstance(bills, list):
                self.log_result("GET /api/bills", False, "Response should be a list")
                return False
            
            if len(bills) == 0:
                self.log_result("GET /api/bills", False, "No bills found")
                return False
            
            first_bill = bills[0]
            bill_id = first_bill.get('id')
            bill_number = first_bill.get('bill_number', 'Unknown')
            
            self.log_result("GET /api/bills", True, f"Retrieved {len(bills)} bills. First bill: {bill_number} (ID: {bill_id})")
            
            # Step 3b: GET /api/bills/{id}/details - test bill details
            print(f"   Step 3b: GET /api/bills/{bill_id}/details - testing bill details...")
            response = self.session.get(f"{API_BASE}/bills/{bill_id}/details", timeout=30)
            
            if response.status_code != 200:
                self.log_result("GET /api/bills/{id}/details", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
            
            bill_details = response.json()
            
            # Print exact response structure
            print("\n" + "="*80)
            print("📋 BILL DETAILS RESPONSE STRUCTURE:")
            print("="*80)
            print(json.dumps(bill_details, indent=2, default=str))
            print("="*80)
            
            # Analyze structure
            print("\n🔍 BILL DETAILS STRUCTURE ANALYSIS:")
            print(f"   Root level fields: {list(bill_details.keys())}")
            
            if 'bill' in bill_details:
                bill_data = bill_details['bill']
                print(f"   Fields inside 'bill': {list(bill_data.keys())}")
                
                # Key financial fields
                print(f"\n💰 KEY FINANCIAL DATA:")
                print(f"   Bill Number: {bill_data.get('bill_number', 'N/A')}")
                print(f"   Vendor Name: {bill_data.get('vendor_name', 'N/A')}")
                print(f"   Total Amount: ₹{bill_data.get('total_amount', 0):,.2f}")
                print(f"   Amount Paid: ₹{bill_data.get('amount_paid', 0):,.2f}")
                print(f"   Amount Outstanding: ₹{bill_data.get('amount_outstanding', 0):,.2f}")
                print(f"   Status: {bill_data.get('status', 'N/A')}")
                print(f"   Bill Date: {bill_data.get('bill_date', 'N/A')}")
                print(f"   Due Date: {bill_data.get('due_date', 'N/A')}")
                print(f"   Expense Category: {bill_data.get('expense_category', 'N/A')}")
            
            # Additional fields
            print(f"\n📊 ADDITIONAL FIELDS:")
            print(f"   Days Overdue: {bill_details.get('days_overdue', 'N/A')}")
            print(f"   Bucket: {bill_details.get('bucket', 'N/A')}")
            
            self.log_result("GET /api/bills/{id}/details", True, f"Bill details retrieved successfully for {bill_number}")
            return True
            
        except Exception as e:
            self.log_result("Bill Details Test", False, f"Exception: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all tests as per review request"""
        print("🚀 Starting Invoice and Bill Details Endpoint Testing")
        print("="*80)
        print("GOAL: Verify what data the backend is returning so we can fix the frontend")
        print("="*80)
        
        # Step 1: Login with demo credentials
        if not self.authenticate():
            return False
        
        # Step 2: Test invoice endpoints
        if not self.test_invoice_details_endpoints():
            return False
        
        # Step 3: Test bill endpoints  
        if not self.test_bill_details_endpoints():
            return False
        
        # Summary
        print("\n" + "="*80)
        print("📊 TEST SUMMARY")
        print("="*80)
        print(f"✅ Passed: {self.test_results['passed']}")
        print(f"❌ Failed: {self.test_results['failed']}")
        
        if self.test_results['errors']:
            print("\n🚨 ERRORS:")
            for error in self.test_results['errors']:
                print(f"   - {error}")
        
        success_rate = (self.test_results['passed'] / (self.test_results['passed'] + self.test_results['failed'])) * 100
        print(f"\n📈 Success Rate: {success_rate:.1f}%")
        
        if self.test_results['failed'] == 0:
            print("\n🎉 ALL TESTS PASSED! Backend endpoints are working correctly.")
            print("   The exact response structures have been printed above for frontend integration.")
        else:
            print(f"\n⚠️  {self.test_results['failed']} test(s) failed. Check the errors above.")
        
        return self.test_results['failed'] == 0

def main():
    """Main function"""
    tester = InvoiceBillDetailsTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n✅ Invoice and Bill Details Testing COMPLETED SUCCESSFULLY")
        sys.exit(0)
    else:
        print("\n❌ Invoice and Bill Details Testing FAILED")
        sys.exit(1)

if __name__ == "__main__":
    main()