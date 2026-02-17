#!/usr/bin/env python3
"""
Response Structure Testing Script - SPECIFIC REVIEW REQUEST
Tests the exact response structure from GET /api/customers/{id}/details and GET /api/vendors/{id}/details endpoints
"""

import requests
import json
import sys
from datetime import datetime, timezone
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Configuration - Use external URL as specified in frontend .env
BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://saas-finint.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

# Test credentials
TEST_EMAIL = "demo@innovatebooks.com"
TEST_PASSWORD = os.getenv("TEST_PASSWORD", "Test1234")   # or demo123 as default


class ResponseStructureTester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
    
    def log_message(self, message, level="INFO"):
        """Log message with timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
    
    def authenticate(self):
        """Authenticate and get JWT token"""
        self.log_message("🔐 Authenticating with demo@innovatebooks.com / demo123...")
        
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
                self.log_message(f"✅ Successfully logged in as {data.get('user', {}).get('email', 'Unknown')}")
                return True
            else:
                self.log_message(f"❌ Login failed - Status: {response.status_code}, Response: {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log_message(f"❌ Authentication exception: {str(e)}", "ERROR")
            return False
    
    def test_customer_details_response_structure(self):
        """Test GET /api/customers/{id}/details endpoint response structure"""
        self.log_message("👥 Testing Customer Details Response Structure...")
        
        try:
            # Step 1: Get first customer ID from GET /api/customers
            self.log_message("Step 1: Getting customer list from GET /api/customers")
            response = self.session.get(f"{API_BASE}/customers", timeout=30)
            
            if response.status_code != 200:
                self.log_message(f"❌ Failed to get customers - Status: {response.status_code}", "ERROR")
                return False
            
            customers = response.json()
            if not customers or len(customers) == 0:
                self.log_message("❌ No customers found", "ERROR")
                return False
            
            first_customer = customers[0]
            customer_id = first_customer.get('id')
            customer_name = first_customer.get('name', 'Unknown')
            
            self.log_message(f"✅ Found {len(customers)} customers. Using first customer: {customer_name} (ID: {customer_id})")
            
            # Step 2: Call GET /api/customers/{id}/details
            self.log_message(f"Step 2: Calling GET /api/customers/{customer_id}/details")
            response = self.session.get(f"{API_BASE}/customers/{customer_id}/details", timeout=30)
            
            if response.status_code != 200:
                self.log_message(f"❌ Failed to get customer details - Status: {response.status_code}", "ERROR")
                return False
            
            # Step 3: Print the EXACT JSON response structure
            self.log_message("Step 3: Analyzing EXACT JSON response structure")
            details_response = response.json()
            
            print("\n" + "="*80)
            print("CUSTOMER DETAILS RESPONSE STRUCTURE ANALYSIS")
            print("="*80)
            
            # Print the complete JSON response (formatted)
            print("\n📋 COMPLETE JSON RESPONSE:")
            print(json.dumps(details_response, indent=2, default=str))
            
            # Step 4: Check specific fields as requested
            print("\n🔍 SPECIFIC FIELD ANALYSIS:")
            
            # Check if "customer" field is present
            has_customer_field = "customer" in details_response
            print(f"• Is 'customer' field present? {has_customer_field}")
            
            # What fields are at root level?
            root_level_fields = list(details_response.keys())
            print(f"• Root level fields: {root_level_fields}")
            
            # What fields are nested inside "customer"?
            if has_customer_field:
                customer_nested_fields = list(details_response["customer"].keys()) if isinstance(details_response["customer"], dict) else []
                print(f"• Fields nested inside 'customer': {customer_nested_fields}")
            else:
                print("• Fields nested inside 'customer': N/A (customer field not present)")
            
            # Print a sample of the actual response
            print(f"\n📄 SAMPLE OF ACTUAL RESPONSE:")
            print(f"• Response type: {type(details_response)}")
            print(f"• Number of root fields: {len(root_level_fields)}")
            
            if has_customer_field:
                customer_data = details_response["customer"]
                print(f"• Customer field type: {type(customer_data)}")
                if isinstance(customer_data, dict):
                    print(f"• Customer field sample keys: {list(customer_data.keys())[:5]}...")  # First 5 keys
                    print(f"• Customer name from nested data: {customer_data.get('name', 'N/A')}")
                    print(f"• Customer ID from nested data: {customer_data.get('id', 'N/A')}")
            
            # Check other important fields
            other_fields_info = {}
            for field in ['invoices', 'payments', 'total_invoiced', 'total_paid', 'documents', 'notes']:
                if field in details_response:
                    field_value = details_response[field]
                    field_type = type(field_value).__name__
                    if isinstance(field_value, list):
                        field_info = f"{field_type} with {len(field_value)} items"
                    elif isinstance(field_value, (int, float)):
                        field_info = f"{field_type} = {field_value}"
                    else:
                        field_info = f"{field_type}"
                    other_fields_info[field] = field_info
                else:
                    other_fields_info[field] = "NOT PRESENT"
            
            print(f"\n📊 OTHER FIELD ANALYSIS:")
            for field, info in other_fields_info.items():
                print(f"• {field}: {info}")
            
            print("\n" + "="*80)
            
            self.log_message("✅ Customer details response structure analysis completed")
            return True
            
        except Exception as e:
            self.log_message(f"❌ Exception during customer details test: {str(e)}", "ERROR")
            return False
    
    def test_vendor_details_response_structure(self):
        """Test GET /api/vendors/{id}/details endpoint response structure"""
        self.log_message("🏢 Testing Vendor Details Response Structure...")
        
        try:
            # Step 1: Get first vendor ID from GET /api/vendors
            self.log_message("Step 1: Getting vendor list from GET /api/vendors")
            response = self.session.get(f"{API_BASE}/vendors", timeout=30)
            
            if response.status_code != 200:
                self.log_message(f"❌ Failed to get vendors - Status: {response.status_code}", "ERROR")
                return False
            
            vendors = response.json()
            if not vendors or len(vendors) == 0:
                self.log_message("❌ No vendors found", "ERROR")
                return False
            
            first_vendor = vendors[0]
            vendor_id = first_vendor.get('id')
            vendor_name = first_vendor.get('name', 'Unknown')
            
            self.log_message(f"✅ Found {len(vendors)} vendors. Using first vendor: {vendor_name} (ID: {vendor_id})")
            
            # Step 2: Call GET /api/vendors/{id}/details
            self.log_message(f"Step 2: Calling GET /api/vendors/{vendor_id}/details")
            response = self.session.get(f"{API_BASE}/vendors/{vendor_id}/details", timeout=30)
            
            if response.status_code != 200:
                self.log_message(f"❌ Failed to get vendor details - Status: {response.status_code}", "ERROR")
                return False
            
            # Step 3: Print the EXACT JSON response structure
            self.log_message("Step 3: Analyzing EXACT JSON response structure")
            details_response = response.json()
            
            print("\n" + "="*80)
            print("VENDOR DETAILS RESPONSE STRUCTURE ANALYSIS")
            print("="*80)
            
            # Print the complete JSON response (formatted)
            print("\n📋 COMPLETE JSON RESPONSE:")
            print(json.dumps(details_response, indent=2, default=str))
            
            # Step 4: Check specific fields as requested
            print("\n🔍 SPECIFIC FIELD ANALYSIS:")
            
            # Check if "vendor" field is present
            has_vendor_field = "vendor" in details_response
            print(f"• Is 'vendor' field present? {has_vendor_field}")
            
            # What fields are at root level?
            root_level_fields = list(details_response.keys())
            print(f"• Root level fields: {root_level_fields}")
            
            # What fields are nested inside "vendor"?
            if has_vendor_field:
                vendor_nested_fields = list(details_response["vendor"].keys()) if isinstance(details_response["vendor"], dict) else []
                print(f"• Fields nested inside 'vendor': {vendor_nested_fields}")
            else:
                print("• Fields nested inside 'vendor': N/A (vendor field not present)")
            
            # Print a sample of the actual response
            print(f"\n📄 SAMPLE OF ACTUAL RESPONSE:")
            print(f"• Response type: {type(details_response)}")
            print(f"• Number of root fields: {len(root_level_fields)}")
            
            if has_vendor_field:
                vendor_data = details_response["vendor"]
                print(f"• Vendor field type: {type(vendor_data)}")
                if isinstance(vendor_data, dict):
                    print(f"• Vendor field sample keys: {list(vendor_data.keys())[:5]}...")  # First 5 keys
                    print(f"• Vendor name from nested data: {vendor_data.get('name', 'N/A')}")
                    print(f"• Vendor ID from nested data: {vendor_data.get('id', 'N/A')}")
            
            # Check other important fields
            other_fields_info = {}
            for field in ['bills', 'payments', 'total_billed', 'total_paid', 'documents', 'notes']:
                if field in details_response:
                    field_value = details_response[field]
                    field_type = type(field_value).__name__
                    if isinstance(field_value, list):
                        field_info = f"{field_type} with {len(field_value)} items"
                    elif isinstance(field_value, (int, float)):
                        field_info = f"{field_type} = {field_value}"
                    else:
                        field_info = f"{field_type}"
                    other_fields_info[field] = field_info
                else:
                    other_fields_info[field] = "NOT PRESENT"
            
            print(f"\n📊 OTHER FIELD ANALYSIS:")
            for field, info in other_fields_info.items():
                print(f"• {field}: {info}")
            
            print("\n" + "="*80)
            
            self.log_message("✅ Vendor details response structure analysis completed")
            return True
            
        except Exception as e:
            self.log_message(f"❌ Exception during vendor details test: {str(e)}", "ERROR")
            return False
    
    def run_tests(self):
        """Run all response structure tests"""
        print("🚀 Starting Response Structure Testing")
        print(f"Backend URL: {BACKEND_URL}")
        print(f"API Base: {API_BASE}")
        print("-" * 80)
        
        # Step 1: Authenticate
        if not self.authenticate():
            print("❌ Authentication failed. Cannot proceed with tests.")
            return False
        
        print("-" * 80)
        
        # Step 2: Test customer details response structure
        customer_success = self.test_customer_details_response_structure()
        
        print("-" * 80)
        
        # Step 3: Test vendor details response structure  
        vendor_success = self.test_vendor_details_response_structure()
        
        print("-" * 80)
        
        # Summary
        print("📊 TESTING SUMMARY:")
        print(f"• Customer details endpoint: {'✅ PASSED' if customer_success else '❌ FAILED'}")
        print(f"• Vendor details endpoint: {'✅ PASSED' if vendor_success else '❌ FAILED'}")
        
        overall_success = customer_success and vendor_success
        print(f"• Overall result: {'✅ ALL TESTS PASSED' if overall_success else '❌ SOME TESTS FAILED'}")
        
        return overall_success

def main():
    """Main function"""
    tester = ResponseStructureTester()
    success = tester.run_tests()
    
    if success:
        print("\n🎉 Response structure testing completed successfully!")
        sys.exit(0)
    else:
        print("\n💥 Response structure testing failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()