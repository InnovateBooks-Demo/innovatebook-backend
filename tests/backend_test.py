#!/usr/bin/env python3
"""
IB Commerce Bill Module Backend API Testing
Comprehensive test suite for Bill CRUD operations and workflow transitions
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
    "password": "demo123"
}

# Test data for bill creation
TEST_BILL_DATA = {
    "linked_execution_id": "EXEC-2025-001",
    "contract_id": "CONT-2025-006", 
    "customer_id": "CUST-2025-001",
    "invoice_type": "Milestone",
    "items": [
        {
            "item_id": "ITEM-TEST-001",
            "item_description": "Test Service",
            "quantity": 1,
            "rate": 100000,
            "line_amount": 100000,
            "tax_code": "GST18",
            "hsn_sac_code": "998312"
        }
    ]
}

class BillModuleAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_bill_id = None
        self.results = []
        
    def log_result(self, test_name, success, details="", response_data=None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = {
            "test": test_name,
            "status": status,
            "details": details,
            "response_data": response_data
        }
        self.results.append(result)
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        if not success and response_data:
            print(f"   Response: {response_data}")
        print()

    def authenticate(self):
        """Authenticate and get JWT token"""
        try:
            print("🔐 AUTHENTICATING...")
            response = self.session.post(
                f"{BACKEND_URL}/auth/login",
                json=TEST_CREDENTIALS,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data.get("access_token")
                self.session.headers.update({
                    "Authorization": f"Bearer {self.auth_token}"
                })
                self.log_result(
                    "Authentication", 
                    True, 
                    f"Successfully logged in as {TEST_CREDENTIALS['email']}"
                )
                return True
            else:
                self.log_result(
                    "Authentication", 
                    False, 
                    f"Login failed with status {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_result("Authentication", False, f"Exception: {str(e)}")
            return False

    def test_create_bill(self):
        """Test POST /api/commerce/bills - Create a new bill"""
        try:
            print("📝 TESTING CREATE BILL...")
            response = self.session.post(
                f"{BACKEND_URL}/commerce/bills",
                json=TEST_BILL_DATA,
                timeout=30
            )
            
            if response.status_code in [200, 201]:
                data = response.json()
                
                # Verify response structure
                required_fields = ["id", "invoice_id", "invoice_status", "customer_id"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_result(
                        "Create Bill", 
                        False, 
                        f"Missing required fields: {missing_fields}",
                        data
                    )
                    return False
                
                # Verify invoice_id format (INV-2025-XXX)
                invoice_id = data.get("invoice_id", "")
                if not invoice_id.startswith("INV-2025-"):
                    self.log_result(
                        "Create Bill", 
                        False, 
                        f"Invalid invoice_id format: {invoice_id}. Expected INV-2025-XXX",
                        data
                    )
                    return False
                
                # Verify initial status
                if data.get("invoice_status") != "Draft":
                    self.log_result(
                        "Create Bill", 
                        False, 
                        f"Expected status 'Draft', got '{data.get('invoice_status')}'",
                        data
                    )
                    return False
                
                # Store invoice_id for subsequent tests
                self.test_bill_id = invoice_id
                
                self.log_result(
                    "Create Bill", 
                    True, 
                    f"Bill created successfully with ID: {invoice_id}, Status: {data.get('invoice_status')}"
                )
                return True
                
            else:
                self.log_result(
                    "Create Bill", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_result("Create Bill", False, f"Exception: {str(e)}")
            return False

    def test_list_bills(self):
        """Test GET /api/commerce/bills - List all bills"""
        try:
            print("📋 TESTING LIST BILLS...")
            
            # Test default list
            response = self.session.get(
                f"{BACKEND_URL}/commerce/bills",
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if not isinstance(data, list):
                    self.log_result(
                        "List Bills", 
                        False, 
                        "Response should be a list",
                        data
                    )
                    return False
                
                # Verify our test bill appears in the list
                test_bill_found = False
                if self.test_bill_id:
                    for bill in data:
                        if bill.get("invoice_id") == self.test_bill_id:
                            test_bill_found = True
                            break
                
                if not test_bill_found and self.test_bill_id:
                    self.log_result(
                        "List Bills", 
                        False, 
                        f"Test bill {self.test_bill_id} not found in list"
                    )
                    return False
                
                # Test status filter - Draft
                filter_response = self.session.get(
                    f"{BACKEND_URL}/commerce/bills?status=Draft",
                    timeout=30
                )
                
                if filter_response.status_code != 200:
                    self.log_result(
                        "List Bills", 
                        False, 
                        f"Status filter (Draft) failed with HTTP {filter_response.status_code}",
                        filter_response.text
                    )
                    return False
                
                # Test status filter - Paid
                paid_response = self.session.get(
                    f"{BACKEND_URL}/commerce/bills?status=Paid",
                    timeout=30
                )
                
                if paid_response.status_code != 200:
                    self.log_result(
                        "List Bills", 
                        False, 
                        f"Status filter (Paid) failed with HTTP {paid_response.status_code}",
                        paid_response.text
                    )
                    return False
                
                self.log_result(
                    "List Bills", 
                    True, 
                    f"Retrieved {len(data)} bills, status filters working"
                )
                return True
                
            else:
                self.log_result(
                    "List Bills", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_result("List Bills", False, f"Exception: {str(e)}")
            return False

    def test_get_bill_details(self):
        """Test GET /api/commerce/bills/{invoice_id} - Get specific bill"""
        try:
            print("🔍 TESTING GET BILL DETAILS...")
            
            # Test with existing bill ID from seed data
            test_invoice_id = "INV-2025-001"
            
            response = self.session.get(
                f"{BACKEND_URL}/commerce/bills/{test_invoice_id}",
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify response structure matches Bill model
                required_fields = [
                    "id", "invoice_id", "customer_name", "customer_id",
                    "invoice_date", "due_date", "invoice_amount", "tax_amount", 
                    "net_amount", "invoice_status", "payment_terms", "execution_id"
                ]
                
                missing_fields = [field for field in required_fields if field not in data]
                if missing_fields:
                    self.log_result(
                        "Get Bill Details", 
                        False, 
                        f"Missing required fields: {missing_fields}"
                    )
                    return False
                
                # Verify invoice_id matches
                if data.get("invoice_id") != test_invoice_id:
                    self.log_result(
                        "Get Bill Details", 
                        False, 
                        f"Invoice ID mismatch: expected {test_invoice_id}, got {data.get('invoice_id')}"
                    )
                    return False
                
                self.log_result(
                    "Get Bill Details", 
                    True, 
                    f"Bill details retrieved successfully for {test_invoice_id}"
                )
                return True
                
            else:
                self.log_result(
                    "Get Bill Details", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_result("Get Bill Details", False, f"Exception: {str(e)}")
            return False

    def test_update_bill(self):
        """Test PUT /api/commerce/bills/{invoice_id} - Update bill"""
        try:
            print("✏️ TESTING UPDATE BILL...")
            
            if not self.test_bill_id:
                self.log_result(
                    "Update Bill", 
                    False, 
                    "No test bill ID available"
                )
                return False
            
            # Prepare updated data
            updated_data = TEST_BILL_DATA.copy()
            updated_data["customer_name"] = "Updated Test Customer"
            updated_data["payment_terms"] = "Net 45"
            
            response = self.session.put(
                f"{BACKEND_URL}/commerce/bills/{self.test_bill_id}",
                json=updated_data,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify updated_at timestamp changed
                if "updated_at" not in data:
                    self.log_result(
                        "Update Bill", 
                        False, 
                        "updated_at field missing"
                    )
                    return False
                
                self.log_result(
                    "Update Bill", 
                    True, 
                    f"Bill updated successfully for {self.test_bill_id}"
                )
                return True
                
            else:
                self.log_result(
                    "Update Bill", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_result("Update Bill", False, f"Exception: {str(e)}")
            return False

    def test_status_workflow_transition(self):
        """Test PATCH /api/commerce/bills/{invoice_id}/status - Status transitions"""
        try:
            print("🔄 TESTING STATUS WORKFLOW TRANSITIONS...")
            
            if not self.test_bill_id:
                self.log_result(
                    "Status Workflow", 
                    False, 
                    "No test bill ID available"
                )
                return False
            
            # Test transition: Draft → Approved
            response1 = self.session.patch(
                f"{BACKEND_URL}/commerce/bills/{self.test_bill_id}/status",
                params={"status": "Approved"},
                timeout=30
            )
            
            if response1.status_code != 200:
                self.log_result(
                    "Status Workflow", 
                    False, 
                    f"First transition failed with HTTP {response1.status_code}",
                    response1.text
                )
                return False
            
            data1 = response1.json()
            if data1.get("invoice_status") != "Approved":
                self.log_result(
                    "Status Workflow", 
                    False, 
                    f"First transition failed: expected 'Approved', got '{data1.get('invoice_status')}'"
                )
                return False
            
            # Test another transition: Approved → Issued
            response2 = self.session.patch(
                f"{BACKEND_URL}/commerce/bills/{self.test_bill_id}/status",
                params={"status": "Issued"},
                timeout=30
            )
            
            if response2.status_code != 200:
                self.log_result(
                    "Status Workflow", 
                    False, 
                    f"Second transition failed with HTTP {response2.status_code}",
                    response2.text
                )
                return False
            
            data2 = response2.json()
            if data2.get("invoice_status") != "Issued":
                self.log_result(
                    "Status Workflow", 
                    False, 
                    f"Second transition failed: expected 'Issued', got '{data2.get('invoice_status')}'"
                )
                return False
            
            # Test final transition: Issued → Paid
            response3 = self.session.patch(
                f"{BACKEND_URL}/commerce/bills/{self.test_bill_id}/status",
                params={"status": "Paid"},
                timeout=30
            )
            
            if response3.status_code != 200:
                self.log_result(
                    "Status Workflow", 
                    False, 
                    f"Third transition failed with HTTP {response3.status_code}",
                    response3.text
                )
                return False
            
            data3 = response3.json()
            if data3.get("invoice_status") != "Paid":
                self.log_result(
                    "Status Workflow", 
                    False, 
                    f"Third transition failed: expected 'Paid', got '{data3.get('invoice_status')}'"
                )
                return False
            
            self.log_result(
                "Status Workflow", 
                True, 
                f"Status transitions successful: Draft → Approved → Issued → Paid"
            )
            return True
            
        except Exception as e:
            self.log_result("Status Workflow", False, f"Exception: {str(e)}")
            return False

    def test_delete_bill(self):
        """Test DELETE /api/commerce/bills/{invoice_id} - Delete bill"""
        try:
            print("🗑️ TESTING DELETE BILL...")
            
            if not self.test_bill_id:
                self.log_result(
                    "Delete Bill", 
                    False, 
                    "No test bill ID available"
                )
                return False
            
            # Delete the bill
            response = self.session.delete(
                f"{BACKEND_URL}/commerce/bills/{self.test_bill_id}",
                timeout=30
            )
            
            if response.status_code != 200:
                self.log_result(
                    "Delete Bill", 
                    False, 
                    f"Delete failed with HTTP {response.status_code}",
                    response.text
                )
                return False
            
            # Verify bill no longer appears in GET list
            list_response = self.session.get(
                f"{BACKEND_URL}/commerce/bills",
                timeout=30
            )
            
            if list_response.status_code == 200:
                bills = list_response.json()
                for bill in bills:
                    if bill.get("invoice_id") == self.test_bill_id:
                        self.log_result(
                            "Delete Bill", 
                            False, 
                            f"Bill {self.test_bill_id} still appears in list after deletion"
                        )
                        return False
                
                self.log_result(
                    "Delete Bill", 
                    True, 
                    f"Bill {self.test_bill_id} deleted successfully and no longer appears in list"
                )
                return True
            else:
                self.log_result(
                    "Delete Bill", 
                    False, 
                    f"Could not verify deletion - list request failed with HTTP {list_response.status_code}"
                )
                return False
                
        except Exception as e:
            self.log_result("Delete Bill", False, f"Exception: {str(e)}")
            return False

    def test_error_handling(self):
        """Test error handling for invalid requests"""
        try:
            print("⚠️ TESTING ERROR HANDLING...")
            
            # Test 404 for non-existent invoice_id
            response_404 = self.session.get(
                f"{BACKEND_URL}/commerce/bills/INV-2025-999",
                timeout=30
            )
            
            if response_404.status_code != 404:
                self.log_result(
                    "Error Handling", 
                    False, 
                    f"Expected 404 for non-existent bill, got {response_404.status_code}"
                )
                return False
            
            # Test validation errors for invalid data
            invalid_data = {
                "linked_execution_id": "",  # Empty required field
                "customer_id": "",  # Empty required field
                "items": []  # Empty items array
            }
            
            response_validation = self.session.post(
                f"{BACKEND_URL}/commerce/bills",
                json=invalid_data,
                timeout=30
            )
            
            if response_validation.status_code not in [400, 422, 500]:
                self.log_result(
                    "Error Handling", 
                    False, 
                    f"Expected 400/422/500 for invalid data, got {response_validation.status_code}"
                )
                return False
            
            self.log_result(
                "Error Handling", 
                True, 
                "404 for non-existent bill and validation errors working correctly"
            )
            return True
            
        except Exception as e:
            self.log_result("Error Handling", False, f"Exception: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 STARTING IB COMMERCE BILL MODULE API TESTING")
        print("=" * 60)
        
        # Authentication is required for all tests
        if not self.authenticate():
            print("❌ Authentication failed. Cannot proceed with tests.")
            return False
        
        # Run all CRUD tests
        tests = [
            self.test_list_bills,
            self.test_get_bill_details,
            self.test_create_bill,
            self.test_update_bill,
            self.test_status_workflow_transition,
            self.test_delete_bill,
            self.test_error_handling
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            if test():
                passed += 1
            time.sleep(1)  # Brief pause between tests
        
        # Print summary
        print("=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        for result in self.results:
            print(f"{result['status']}: {result['test']}")
            if result['details']:
                print(f"   {result['details']}")
        
        print(f"\n🎯 OVERALL RESULT: {passed}/{total} tests passed")
        
        if passed == total:
            print("✅ ALL TESTS PASSED - Bill Module APIs are working correctly!")
            return True
        else:
            print(f"❌ {total - passed} TESTS FAILED - Issues need to be addressed")
            return False

def main():
    """Main function"""
    tester = BillModuleAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()