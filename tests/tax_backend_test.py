"""
Backend Testing Script for IB Commerce Tax Module
Tests all Tax module endpoints with authentication
"""

import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "https://saas-finint.preview.emergentagent.com/api"
DEMO_EMAIL = "demo@innovatebooks.com"
DEMO_PASSWORD = "demo123"

# Color codes for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def print_test(test_name):
    print(f"\n{BLUE}{'='*70}{RESET}")
    print(f"{BLUE}TEST: {test_name}{RESET}")
    print(f"{BLUE}{'='*70}{RESET}")

def print_success(message):
    print(f"{GREEN}✅ {message}{RESET}")

def print_error(message):
    print(f"{RED}❌ {message}{RESET}")

def print_info(message):
    print(f"{YELLOW}ℹ️  {message}{RESET}")

def print_data(label, data):
    print(f"{YELLOW}{label}:{RESET}")
    print(json.dumps(data, indent=2, default=str))


class TaxModuleTester:
    def __init__(self):
        self.token = None
        self.headers = {}
        self.test_results = {
            "passed": 0,
            "failed": 0,
            "total": 0
        }
    
    def login(self):
        """Authenticate and get token"""
        print_test("Authentication - Login")
        
        try:
            response = requests.post(
                f"{BASE_URL}/auth/login",
                json={"email": DEMO_EMAIL, "password": DEMO_PASSWORD}
            )
            
            if response.status_code == 200:
                data = response.json()
                self.token = data.get('access_token')
                self.headers = {
                    "Authorization": f"Bearer {self.token}",
                    "Content-Type": "application/json"
                }
                print_success(f"Login successful for {DEMO_EMAIL}")
                print_info(f"Token: {self.token[:50]}...")
                return True
            else:
                print_error(f"Login failed: {response.status_code}")
                print_data("Response", response.json())
                return False
                
        except Exception as e:
            print_error(f"Login error: {str(e)}")
            return False
    
    def test_list_all_taxes(self):
        """Test GET /api/commerce/tax - List all tax records"""
        print_test("GET /api/commerce/tax - List All Tax Records")
        self.test_results["total"] += 1
        
        try:
            response = requests.get(
                f"{BASE_URL}/commerce/tax",
                headers=self.headers
            )
            
            print_info(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                taxes = response.json()
                print_success(f"Retrieved {len(taxes)} tax records")
                
                # Verify we have 5 seeded records
                if len(taxes) == 5:
                    print_success("✓ Expected 5 tax records found")
                else:
                    print_error(f"✗ Expected 5 tax records, found {len(taxes)}")
                
                # Display summary
                print_info("Tax Records Summary:")
                for tax in taxes:
                    print(f"  - {tax.get('tax_id')}: {tax.get('tax_type')} | Status: {tax.get('tax_status')} | Period: {tax.get('tax_period')}")
                
                # Verify expected tax IDs
                expected_ids = ["TAX-2025-001", "TAX-2025-002", "TAX-2025-003", "TAX-2025-004", "TAX-2025-005"]
                found_ids = [tax.get('tax_id') for tax in taxes]
                
                for expected_id in expected_ids:
                    if expected_id in found_ids:
                        print_success(f"✓ Found {expected_id}")
                    else:
                        print_error(f"✗ Missing {expected_id}")
                
                self.test_results["passed"] += 1
                return taxes
            else:
                print_error(f"Failed to retrieve tax records: {response.status_code}")
                print_data("Response", response.json())
                self.test_results["failed"] += 1
                return None
                
        except Exception as e:
            print_error(f"Error: {str(e)}")
            self.test_results["failed"] += 1
            return None
    
    def test_filter_by_status(self):
        """Test GET /api/commerce/tax?status=Filed - Filter by status"""
        print_test("GET /api/commerce/tax?status=Filed - Filter by Status")
        self.test_results["total"] += 1
        
        statuses_to_test = ["Filed", "Calculated", "Draft", "Paid"]
        
        for status in statuses_to_test:
            try:
                print_info(f"\nTesting filter: status={status}")
                response = requests.get(
                    f"{BASE_URL}/commerce/tax?status={status}",
                    headers=self.headers
                )
                
                if response.status_code == 200:
                    taxes = response.json()
                    print_success(f"Retrieved {len(taxes)} tax records with status '{status}'")
                    
                    # Verify all returned records have the correct status
                    all_correct = all(tax.get('tax_status') == status for tax in taxes)
                    if all_correct:
                        print_success(f"✓ All records have status '{status}'")
                        for tax in taxes:
                            print(f"  - {tax.get('tax_id')}: {tax.get('tax_type')} | Period: {tax.get('tax_period')}")
                    else:
                        print_error(f"✗ Some records have incorrect status")
                else:
                    print_error(f"Failed to filter by status '{status}': {response.status_code}")
                    
            except Exception as e:
                print_error(f"Error filtering by status '{status}': {str(e)}")
        
        self.test_results["passed"] += 1
    
    def test_get_tax_details(self):
        """Test GET /api/commerce/tax/{tax_id} - Get tax details"""
        print_test("GET /api/commerce/tax/{tax_id} - Get Tax Details")
        self.test_results["total"] += 1
        
        tax_id = "TAX-2025-001"
        
        try:
            print_info(f"Fetching details for {tax_id}")
            response = requests.get(
                f"{BASE_URL}/commerce/tax/{tax_id}",
                headers=self.headers
            )
            
            print_info(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                tax = response.json()
                print_success(f"Retrieved tax details for {tax_id}")
                
                # Verify required fields
                required_fields = [
                    'tax_id', 'tax_period', 'tax_type', 'tax_status',
                    'taxable_amount', 'tax_rate', 'tax_computed',
                    'tax_collected', 'tax_paid', 'tax_liability',
                    'input_tax_credit', 'net_tax_payable',
                    'filing_due_date', 'return_type'
                ]
                
                print_info("Verifying required fields:")
                all_present = True
                for field in required_fields:
                    if field in tax:
                        print_success(f"✓ {field}: {tax.get(field)}")
                    else:
                        print_error(f"✗ Missing field: {field}")
                        all_present = False
                
                # Verify specific values for TAX-2025-001
                print_info("\nVerifying TAX-2025-001 specific data:")
                checks = [
                    ("tax_type", "GST", tax.get('tax_type')),
                    ("tax_status", "Filed", tax.get('tax_status')),
                    ("tax_period", "2025-01", tax.get('tax_period')),
                    ("taxable_amount", 5000000.0, tax.get('taxable_amount')),
                    ("tax_rate", 18.0, tax.get('tax_rate')),
                    ("tax_computed", 900000.0, tax.get('tax_computed')),
                    ("net_tax_payable", 750000.0, tax.get('net_tax_payable')),
                ]
                
                for field_name, expected, actual in checks:
                    if actual == expected:
                        print_success(f"✓ {field_name}: {actual} (expected: {expected})")
                    else:
                        print_error(f"✗ {field_name}: {actual} (expected: {expected})")
                
                if all_present:
                    self.test_results["passed"] += 1
                else:
                    self.test_results["failed"] += 1
                
                return tax
            else:
                print_error(f"Failed to retrieve tax details: {response.status_code}")
                print_data("Response", response.json())
                self.test_results["failed"] += 1
                return None
                
        except Exception as e:
            print_error(f"Error: {str(e)}")
            self.test_results["failed"] += 1
            return None
    
    def test_status_workflow(self):
        """Test PATCH /api/commerce/tax/{tax_id}/status - Status workflow"""
        print_test("PATCH /api/commerce/tax/{tax_id}/status - Status Workflow")
        self.test_results["total"] += 1
        
        # Use TAX-2025-003 which is in Draft status
        tax_id = "TAX-2025-003"
        
        # Test workflow: Draft → Calculated → Filed → Paid
        workflow_transitions = [
            ("Draft", "Calculated"),
            ("Calculated", "Filed"),
            ("Filed", "Paid")
        ]
        
        try:
            # First, verify current status
            print_info(f"Verifying current status of {tax_id}")
            response = requests.get(
                f"{BASE_URL}/commerce/tax/{tax_id}",
                headers=self.headers
            )
            
            if response.status_code == 200:
                current_tax = response.json()
                current_status = current_tax.get('tax_status')
                print_info(f"Current status: {current_status}")
            
            # Test each transition
            all_passed = True
            for from_status, to_status in workflow_transitions:
                print_info(f"\nTesting transition: {from_status} → {to_status}")
                
                response = requests.patch(
                    f"{BASE_URL}/commerce/tax/{tax_id}/status?status={to_status}",
                    headers=self.headers
                )
                
                if response.status_code == 200:
                    updated_tax = response.json()
                    new_status = updated_tax.get('tax_status')
                    
                    if new_status == to_status:
                        print_success(f"✓ Status updated to '{to_status}'")
                        
                        # Special check for Filed status - should set filing_date
                        if to_status == "Filed":
                            filing_date = updated_tax.get('filing_date')
                            if filing_date:
                                print_success(f"✓ Filing date set: {filing_date}")
                            else:
                                print_error("✗ Filing date not set")
                                all_passed = False
                    else:
                        print_error(f"✗ Status is '{new_status}', expected '{to_status}'")
                        all_passed = False
                else:
                    print_error(f"Failed to update status: {response.status_code}")
                    print_data("Response", response.json())
                    all_passed = False
            
            # Test invalid status
            print_info("\nTesting invalid status (should fail)")
            response = requests.patch(
                f"{BASE_URL}/commerce/tax/{tax_id}/status?status=InvalidStatus",
                headers=self.headers
            )
            
            if response.status_code == 400:
                print_success("✓ Invalid status correctly rejected with 400 error")
            else:
                print_error(f"✗ Expected 400 error, got {response.status_code}")
                all_passed = False
            
            if all_passed:
                self.test_results["passed"] += 1
            else:
                self.test_results["failed"] += 1
                
        except Exception as e:
            print_error(f"Error: {str(e)}")
            self.test_results["failed"] += 1
    
    def test_404_error(self):
        """Test 404 error for non-existent tax record"""
        print_test("GET /api/commerce/tax/{tax_id} - 404 Error Handling")
        self.test_results["total"] += 1
        
        non_existent_id = "TAX-2025-999"
        
        try:
            print_info(f"Attempting to fetch non-existent tax record: {non_existent_id}")
            response = requests.get(
                f"{BASE_URL}/commerce/tax/{non_existent_id}",
                headers=self.headers
            )
            
            if response.status_code == 404:
                print_success("✓ Correctly returned 404 for non-existent tax record")
                self.test_results["passed"] += 1
            else:
                print_error(f"✗ Expected 404, got {response.status_code}")
                self.test_results["failed"] += 1
                
        except Exception as e:
            print_error(f"Error: {str(e)}")
            self.test_results["failed"] += 1
    
    def print_summary(self):
        """Print test summary"""
        print(f"\n{BLUE}{'='*70}{RESET}")
        print(f"{BLUE}TEST SUMMARY{RESET}")
        print(f"{BLUE}{'='*70}{RESET}")
        
        print(f"\nTotal Tests: {self.test_results['total']}")
        print(f"{GREEN}Passed: {self.test_results['passed']}{RESET}")
        print(f"{RED}Failed: {self.test_results['failed']}{RESET}")
        
        success_rate = (self.test_results['passed'] / self.test_results['total'] * 100) if self.test_results['total'] > 0 else 0
        print(f"\nSuccess Rate: {success_rate:.1f}%")
        
        if self.test_results['failed'] == 0:
            print(f"\n{GREEN}{'='*70}")
            print("🎉 ALL TESTS PASSED! Tax Module is working correctly!")
            print(f"{'='*70}{RESET}")
        else:
            print(f"\n{RED}{'='*70}")
            print(f"⚠️  {self.test_results['failed']} test(s) failed. Please review the errors above.")
            print(f"{'='*70}{RESET}")


def main():
    """Main test execution"""
    print(f"\n{BLUE}{'='*70}")
    print("IB COMMERCE TAX MODULE - BACKEND API TESTING")
    print(f"{'='*70}{RESET}\n")
    
    tester = TaxModuleTester()
    
    # Step 1: Login
    if not tester.login():
        print_error("Authentication failed. Cannot proceed with tests.")
        return
    
    # Step 2: Test all endpoints
    tester.test_list_all_taxes()
    tester.test_filter_by_status()
    tester.test_get_tax_details()
    tester.test_status_workflow()
    tester.test_404_error()
    
    # Step 3: Print summary
    tester.print_summary()


if __name__ == "__main__":
    main()
