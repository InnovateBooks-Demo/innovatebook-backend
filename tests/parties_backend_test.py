#!/usr/bin/env python3
"""
IB Commerce Parties Module Backend API Testing
Comprehensive test suite for Parties CRUD operations (Customers, Vendors, Partners, Channels, Profiles)
"""

import requests
import json
import sys
from datetime import datetime, timezone, date
import time

# Configuration
BACKEND_URL = "https://saas-finint.preview.emergentagent.com/api"
TEST_CREDENTIALS = {
    "email": "demo@innovatebooks.com",
    "password": "Demo1234"
}

# Test data for customer creation (new schema)
TEST_CUSTOMER_DATA = {
    "display_name": "Test Customer New",
    "legal_name": "Test Customer Legal Name Ltd",
    "party_category": "customer",
    "country_of_registration": "India",
    "operating_countries": ["India", "USA"],
    "industry_classification": "Technology",
    "status": "active",
    "primary_role": "Customer",
    "commercial_owner": "demo@innovatebooks.com",
    "risk_level": "low",
    "customer_type": "B2B",
    "segment": "Enterprise",
    "contacts": [{
        "name": "John Doe",
        "email": "john@test.com",
        "phone": "+919876543210",
        "is_primary": True
    }],
    "locations": [{
        "address_type": "registered",
        "address_line1": "123 Test Street",
        "city": "Mumbai",
        "state": "Maharashtra",
        "country": "India",
        "postal_code": "400001"
    }]
}

# Test data for vendor creation
TEST_VENDOR_DATA = {
    "display_name": "Test Vendor",
    "legal_name": "Test Vendor Pvt Ltd",
    "party_category": "vendor",
    "country_of_registration": "India",
    "status": "active",
    "primary_role": "Vendor",
    "risk_level": "low",
    "vendor_type": "Service"
}

# Test data for partner creation
TEST_PARTNER_DATA = {
    "display_name": "Test Partner",
    "legal_name": "Test Partner Corp",
    "party_category": "partner",
    "country_of_registration": "India",
    "status": "active",
    "primary_role": "Partner",
    "risk_level": "low",
    "partner_type": "Reseller"
}

# Test data for channel creation
TEST_CHANNEL_DATA = {
    "channel_name": "Test Channel",
    "channel_type": "Direct Sales",
    "geography": ["India"],
    "status": "active"
}

# Test data for profile creation
TEST_PROFILE_DATA = {
    "profile_name": "Test Profile",
    "profile_type": "Customer",
    "applicable_regions": ["India"],
    "status": "active"
}

class PartiesModuleAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_customer_id = None
        self.test_vendor_id = None
        self.test_partner_id = None
        self.test_channel_id = None
        self.test_profile_id = None
        self.results = []
        
    def log_result(self, test_name, success, details="", response_data=None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = {
            "test": test_name,
            "status": status,
            "success": success,
            "details": details,
            "response_data": response_data
        }
        self.results.append(result)
        print(f"{status} {test_name}")
        if details:
            print(f"    Details: {details}")
        if not success and response_data:
            print(f"    Response: {response_data}")
        print()

    def authenticate(self):
        """Authenticate and get access token"""
        try:
            print("🔐 AUTHENTICATING...")
            
            # Try enterprise auth first
            auth_url = f"{BACKEND_URL}/enterprise/auth/login"
            response = self.session.post(auth_url, json=TEST_CREDENTIALS)
            
            if response.status_code != 200:
                # Fallback to regular auth
                auth_url = f"{BACKEND_URL}/auth/login"
                response = self.session.post(auth_url, json=TEST_CREDENTIALS)
            
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data.get('access_token')
                self.session.headers.update({
                    'Authorization': f'Bearer {self.auth_token}',
                    'Content-Type': 'application/json'
                })
                self.log_result("Authentication", True, f"Successfully logged in with {TEST_CREDENTIALS['email']}")
                return True
            else:
                self.log_result("Authentication", False, f"Login failed: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Authentication", False, f"Authentication error: {str(e)}")
            return False

    def test_customers_endpoints(self):
        """Test all customer endpoints"""
        print("🧑‍💼 TESTING CUSTOMERS ENDPOINTS...")
        
        # TC1: List existing customers
        try:
            response = self.session.get(f"{BACKEND_URL}/commerce/parties/customers")
            if response.status_code == 200:
                data = response.json()
                customers = data.get('customers', [])
                customer_count = len(customers)
                
                # Check for legacy customers with "name" field
                legacy_customers = [c for c in customers if 'name' in c]
                
                self.log_result(
                    "TC1: List Existing Customers", 
                    True, 
                    f"Retrieved {customer_count} customers, {len(legacy_customers)} legacy customers with 'name' field"
                )
            else:
                self.log_result("TC1: List Existing Customers", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_result("TC1: List Existing Customers", False, f"Error: {str(e)}")

        # TC2: Create new customer (new schema)
        try:
            response = self.session.post(f"{BACKEND_URL}/commerce/parties/customers", json=TEST_CUSTOMER_DATA)
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    customer = data.get('customer', {})
                    self.test_customer_id = customer.get('customer_id')
                    party_id = customer.get('party_id')
                    
                    # Verify customer_id format
                    customer_id_valid = self.test_customer_id and self.test_customer_id.startswith('CUST-')
                    
                    self.log_result(
                        "TC2: Create New Customer (New Schema)", 
                        True, 
                        f"Customer created: {self.test_customer_id}, Party ID: {party_id}, ID format valid: {customer_id_valid}"
                    )
                else:
                    self.log_result("TC2: Create New Customer (New Schema)", False, "Success flag is False", data)
            else:
                self.log_result("TC2: Create New Customer (New Schema)", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_result("TC2: Create New Customer (New Schema)", False, f"Error: {str(e)}")

        # TC3: Get specific customer
        if self.test_customer_id:
            try:
                response = self.session.get(f"{BACKEND_URL}/commerce/parties/customers/{self.test_customer_id}")
                if response.status_code == 200:
                    data = response.json()
                    if data.get('success'):
                        customer = data.get('customer', {})
                        has_org_id = 'org_id' in customer
                        has_created_at = 'created_at' in customer
                        
                        self.log_result(
                            "TC3: Get Specific Customer", 
                            True, 
                            f"Retrieved customer {self.test_customer_id}, has org_id: {has_org_id}, has created_at: {has_created_at}"
                        )
                    else:
                        self.log_result("TC3: Get Specific Customer", False, "Success flag is False", data)
                else:
                    self.log_result("TC3: Get Specific Customer", False, f"Status: {response.status_code}", response.text)
            except Exception as e:
                self.log_result("TC3: Get Specific Customer", False, f"Error: {str(e)}")

        # TC4: Update customer
        if self.test_customer_id:
            try:
                update_data = TEST_CUSTOMER_DATA.copy()
                update_data['display_name'] = "Updated Test Customer"
                
                response = self.session.put(f"{BACKEND_URL}/commerce/parties/customers/{self.test_customer_id}", json=update_data)
                if response.status_code == 200:
                    data = response.json()
                    success = data.get('success', False)
                    self.log_result("TC4: Update Customer", success, f"Update response: {data.get('message', 'No message')}")
                else:
                    self.log_result("TC4: Update Customer", False, f"Status: {response.status_code}", response.text)
            except Exception as e:
                self.log_result("TC4: Update Customer", False, f"Error: {str(e)}")

        # TC5: Search and filter customers
        try:
            # Test search by name
            response = self.session.get(f"{BACKEND_URL}/commerce/parties/customers?search=Test")
            if response.status_code == 200:
                data = response.json()
                customers = data.get('customers', [])
                search_results = len(customers)
                
                # Test filter by customer_type
                response2 = self.session.get(f"{BACKEND_URL}/commerce/parties/customers?customer_type=B2B")
                if response2.status_code == 200:
                    data2 = response2.json()
                    b2b_customers = len(data2.get('customers', []))
                    
                    # Test filter by status
                    response3 = self.session.get(f"{BACKEND_URL}/commerce/parties/customers?status=active")
                    if response3.status_code == 200:
                        data3 = response3.json()
                        active_customers = len(data3.get('customers', []))
                        
                        self.log_result(
                            "TC5: Search & Filter Customers", 
                            True, 
                            f"Search 'Test': {search_results}, B2B filter: {b2b_customers}, Active filter: {active_customers}"
                        )
                    else:
                        self.log_result("TC5: Search & Filter Customers", False, "Status filter failed", response3.text)
                else:
                    self.log_result("TC5: Search & Filter Customers", False, "Customer type filter failed", response2.text)
            else:
                self.log_result("TC5: Search & Filter Customers", False, f"Search failed: {response.status_code}", response.text)
        except Exception as e:
            self.log_result("TC5: Search & Filter Customers", False, f"Error: {str(e)}")

        # TC6: Delete customer (cleanup)
        if self.test_customer_id:
            try:
                response = self.session.delete(f"{BACKEND_URL}/commerce/parties/customers/{self.test_customer_id}")
                if response.status_code == 200:
                    data = response.json()
                    success = data.get('success', False)
                    self.log_result("TC6: Delete Customer", success, f"Delete response: {data.get('message', 'No message')}")
                else:
                    self.log_result("TC6: Delete Customer", False, f"Status: {response.status_code}", response.text)
            except Exception as e:
                self.log_result("TC6: Delete Customer", False, f"Error: {str(e)}")

    def test_vendors_endpoints(self):
        """Test vendor endpoints"""
        print("🏭 TESTING VENDORS ENDPOINTS...")
        
        # List vendors
        try:
            response = self.session.get(f"{BACKEND_URL}/commerce/parties/vendors")
            if response.status_code == 200:
                data = response.json()
                vendors = data.get('vendors', [])
                self.log_result("List Vendors", True, f"Retrieved {len(vendors)} vendors")
            else:
                self.log_result("List Vendors", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_result("List Vendors", False, f"Error: {str(e)}")

        # Create vendor
        try:
            response = self.session.post(f"{BACKEND_URL}/commerce/parties/vendors", json=TEST_VENDOR_DATA)
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    vendor = data.get('vendor', {})
                    self.test_vendor_id = vendor.get('vendor_id')
                    self.log_result("Create Vendor", True, f"Vendor created: {self.test_vendor_id}")
                else:
                    self.log_result("Create Vendor", False, "Success flag is False", data)
            else:
                self.log_result("Create Vendor", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_result("Create Vendor", False, f"Error: {str(e)}")

    def test_partners_endpoints(self):
        """Test partner endpoints"""
        print("🤝 TESTING PARTNERS ENDPOINTS...")
        
        # List partners
        try:
            response = self.session.get(f"{BACKEND_URL}/commerce/parties/partners")
            if response.status_code == 200:
                data = response.json()
                partners = data.get('partners', [])
                self.log_result("List Partners", True, f"Retrieved {len(partners)} partners")
            else:
                self.log_result("List Partners", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_result("List Partners", False, f"Error: {str(e)}")

        # Create partner
        try:
            response = self.session.post(f"{BACKEND_URL}/commerce/parties/partners", json=TEST_PARTNER_DATA)
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    partner = data.get('partner', {})
                    self.test_partner_id = partner.get('partner_id')
                    self.log_result("Create Partner", True, f"Partner created: {self.test_partner_id}")
                else:
                    self.log_result("Create Partner", False, "Success flag is False", data)
            else:
                self.log_result("Create Partner", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_result("Create Partner", False, f"Error: {str(e)}")

    def test_channels_endpoints(self):
        """Test channel endpoints"""
        print("📺 TESTING CHANNELS ENDPOINTS...")
        
        # List channels
        try:
            response = self.session.get(f"{BACKEND_URL}/commerce/parties/channels")
            if response.status_code == 200:
                data = response.json()
                channels = data.get('channels', [])
                self.log_result("List Channels", True, f"Retrieved {len(channels)} channels")
            else:
                self.log_result("List Channels", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_result("List Channels", False, f"Error: {str(e)}")

        # Create channel
        try:
            response = self.session.post(f"{BACKEND_URL}/commerce/parties/channels", json=TEST_CHANNEL_DATA)
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    channel = data.get('channel', {})
                    self.test_channel_id = channel.get('channel_id')
                    self.log_result("Create Channel", True, f"Channel created: {self.test_channel_id}")
                else:
                    self.log_result("Create Channel", False, "Success flag is False", data)
            else:
                self.log_result("Create Channel", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_result("Create Channel", False, f"Error: {str(e)}")

    def test_profiles_endpoints(self):
        """Test profile endpoints"""
        print("👤 TESTING PROFILES ENDPOINTS...")
        
        # List profiles
        try:
            response = self.session.get(f"{BACKEND_URL}/commerce/parties/profiles")
            if response.status_code == 200:
                data = response.json()
                profiles = data.get('profiles', [])
                self.log_result("List Profiles", True, f"Retrieved {len(profiles)} profiles")
            else:
                self.log_result("List Profiles", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_result("List Profiles", False, f"Error: {str(e)}")

        # Create profile
        try:
            response = self.session.post(f"{BACKEND_URL}/commerce/parties/profiles", json=TEST_PROFILE_DATA)
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    profile = data.get('profile', {})
                    self.test_profile_id = profile.get('profile_id')
                    self.log_result("Create Profile", True, f"Profile created: {self.test_profile_id}")
                else:
                    self.log_result("Create Profile", False, "Success flag is False", data)
            else:
                self.log_result("Create Profile", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_result("Create Profile", False, f"Error: {str(e)}")

    def test_multi_tenancy_verification(self):
        """Test multi-tenancy and data isolation"""
        print("🏢 TESTING MULTI-TENANCY VERIFICATION...")
        
        try:
            # Get all customers and verify org_id presence
            response = self.session.get(f"{BACKEND_URL}/commerce/parties/customers")
            if response.status_code == 200:
                data = response.json()
                customers = data.get('customers', [])
                
                customers_with_org_id = [c for c in customers if 'org_id' in c and c['org_id']]
                org_ids = set(c.get('org_id') for c in customers_with_org_id if c.get('org_id'))
                
                self.log_result(
                    "Multi-tenancy Verification", 
                    len(customers_with_org_id) > 0, 
                    f"Total customers: {len(customers)}, With org_id: {len(customers_with_org_id)}, Unique org_ids: {len(org_ids)}"
                )
            else:
                self.log_result("Multi-tenancy Verification", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_result("Multi-tenancy Verification", False, f"Error: {str(e)}")

    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 STARTING IB COMMERCE PARTIES MODULE BACKEND API TESTING")
        print("=" * 80)
        
        # Authenticate first
        if not self.authenticate():
            print("❌ Authentication failed. Cannot proceed with tests.")
            return False
        
        # Run all test suites
        self.test_customers_endpoints()
        self.test_vendors_endpoints()
        self.test_partners_endpoints()
        self.test_channels_endpoints()
        self.test_profiles_endpoints()
        self.test_multi_tenancy_verification()
        
        # Print summary
        self.print_summary()
        
        return True

    def print_summary(self):
        """Print test results summary"""
        print("=" * 80)
        print("📊 TEST RESULTS SUMMARY")
        print("=" * 80)
        
        total_tests = len(self.results)
        passed_tests = len([r for r in self.results if r['success']])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['details']}")
        
        print("\n" + "=" * 80)

def main():
    """Main function"""
    tester = PartiesModuleAPITester()
    success = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()