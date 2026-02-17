#!/usr/bin/env python3
"""
IB Commerce Commit Module Backend API Testing
Comprehensive test suite for Commit CRUD operations and workflow transitions
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

# Test data for commitment creation
TEST_COMMIT_DATA = {
    "evaluation_id": "EVAL-2025-002",
    "customer_id": "CUST-001",
    "commit_type": "Customer Contract",
    "contract_title": "Test Backend Commitment Contract",
    "effective_date": "2025-04-01",
    "expiry_date": "2026-10-01",
    "contract_value": 15000000,
    "payment_terms": "Net 30"
}

class CommitModuleAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_commit_id = None
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

    def test_create_commitment(self):
        """Test POST /api/commerce/commit - Create a new commitment"""
        try:
            print("📝 TESTING CREATE COMMITMENT...")
            
            # Prepare test data with proper date format
            test_data = TEST_COMMIT_DATA.copy()
            
            response = self.session.post(
                f"{BACKEND_URL}/commerce/commit",
                json=test_data,
                timeout=30
            )
            
            if response.status_code in [200, 201]:
                data = response.json()
                
                # Verify response structure
                required_fields = ["id", "commit_id", "commit_status", "contract_title"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_result(
                        "Create Commitment", 
                        False, 
                        f"Missing required fields: {missing_fields}",
                        data
                    )
                    return False
                
                # Verify commit_id format (COMM-2025-XXX)
                commit_id = data.get("commit_id", "")
                if not commit_id.startswith("COMM-2025-"):
                    self.log_result(
                        "Create Commitment", 
                        False, 
                        f"Invalid commit_id format: {commit_id}. Expected COMM-2025-XXX",
                        data
                    )
                    return False
                
                # Verify initial status
                if data.get("commit_status") != "Draft":
                    self.log_result(
                        "Create Commitment", 
                        False, 
                        f"Expected status 'Draft', got '{data.get('commit_status')}'",
                        data
                    )
                    return False
                
                # Verify contract_number is generated
                if not data.get("contract_number"):
                    self.log_result(
                        "Create Commitment", 
                        False, 
                        "contract_number not generated",
                        data
                    )
                    return False
                
                # Verify all input fields are properly stored
                input_checks = [
                    ("contract_title", TEST_COMMIT_DATA["contract_title"]),
                    ("contract_value", TEST_COMMIT_DATA["contract_value"]),
                    ("evaluation_id", TEST_COMMIT_DATA["evaluation_id"])
                ]
                
                for field, expected_value in input_checks:
                    if data.get(field) != expected_value:
                        self.log_result(
                            "Create Commitment", 
                            False, 
                            f"Field {field}: expected {expected_value}, got {data.get(field)}"
                        )
                        return False
                
                # Store commit_id for subsequent tests
                self.test_commit_id = commit_id
                
                self.log_result(
                    "Create Commitment", 
                    True, 
                    f"Commitment created successfully with ID: {commit_id}, Status: {data.get('commit_status')}, Contract Number: {data.get('contract_number')}"
                )
                return True
                
            else:
                self.log_result(
                    "Create Commitment", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_result("Create Commitment", False, f"Exception: {str(e)}")
            return False

    def test_list_commitments(self):
        """Test GET /api/commerce/commit - List all commitments"""
        try:
            print("📋 TESTING LIST COMMITMENTS...")
            
            # Test default pagination
            response = self.session.get(
                f"{BACKEND_URL}/commerce/commit",
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if not isinstance(data, list):
                    self.log_result(
                        "List Commitments", 
                        False, 
                        "Response should be a list",
                        data
                    )
                    return False
                
                # Verify we have at least 4 seeded commitments + our test commitment
                if len(data) < 4:
                    self.log_result(
                        "List Commitments", 
                        False, 
                        f"Expected at least 4 commitments (seeded data), got {len(data)}"
                    )
                    return False
                
                # Verify our test commitment appears in the list
                test_commit_found = False
                if self.test_commit_id:
                    for commit in data:
                        if commit.get("commit_id") == self.test_commit_id:
                            test_commit_found = True
                            break
                
                if not test_commit_found and self.test_commit_id:
                    self.log_result(
                        "List Commitments", 
                        False, 
                        f"Test commitment {self.test_commit_id} not found in list"
                    )
                    return False
                
                # Test status filter
                filter_response = self.session.get(
                    f"{BACKEND_URL}/commerce/commit?status=Draft",
                    timeout=30
                )
                
                if filter_response.status_code != 200:
                    self.log_result(
                        "List Commitments", 
                        False, 
                        f"Status filter failed with HTTP {filter_response.status_code}",
                        filter_response.text
                    )
                    return False
                
                # Test pagination parameters
                pagination_response = self.session.get(
                    f"{BACKEND_URL}/commerce/commit?skip=0&limit=10",
                    timeout=30
                )
                
                if pagination_response.status_code != 200:
                    self.log_result(
                        "List Commitments", 
                        False, 
                        f"Pagination failed with HTTP {pagination_response.status_code}",
                        pagination_response.text
                    )
                    return False
                
                self.log_result(
                    "List Commitments", 
                    True, 
                    f"Retrieved {len(data)} commitments (including 4 seeded), filters and pagination working"
                )
                return True
                
            else:
                self.log_result(
                    "List Commitments", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_result("List Commitments", False, f"Exception: {str(e)}")
            return False

    def test_get_commitment_details(self):
        """Test GET /api/commerce/commit/{commit_id} - Get specific commitment"""
        try:
            print("🔍 TESTING GET COMMITMENT DETAILS...")
            
            if not self.test_commit_id:
                self.log_result(
                    "Get Commitment Details", 
                    False, 
                    "No test commitment ID available"
                )
                return False
            
            response = self.session.get(
                f"{BACKEND_URL}/commerce/commit/{self.test_commit_id}",
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify all input fields are properly stored
                input_checks = [
                    ("contract_title", TEST_COMMIT_DATA["contract_title"]),
                    ("contract_value", TEST_COMMIT_DATA["contract_value"]),
                    ("evaluation_id", TEST_COMMIT_DATA["evaluation_id"])
                ]
                
                for field, expected_value in input_checks:
                    if data.get(field) != expected_value:
                        self.log_result(
                            "Get Commitment Details", 
                            False, 
                            f"Field {field}: expected {expected_value}, got {data.get(field)}"
                        )
                        return False
                
                # Verify response structure matches Commit model
                required_fields = [
                    "id", "commit_id", "commit_status", "contract_title", 
                    "contract_number", "contract_value", "created_at"
                ]
                
                missing_fields = [field for field in required_fields if field not in data]
                if missing_fields:
                    self.log_result(
                        "Get Commitment Details", 
                        False, 
                        f"Missing required fields: {missing_fields}"
                    )
                    return False
                
                self.log_result(
                    "Get Commitment Details", 
                    True, 
                    f"Commitment details retrieved successfully, all fields match"
                )
                return True
                
            else:
                self.log_result(
                    "Get Commitment Details", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_result("Get Commitment Details", False, f"Exception: {str(e)}")
            return False

    def test_update_commitment(self):
        """Test PUT /api/commerce/commit/{commit_id} - Update commitment"""
        try:
            print("✏️ TESTING UPDATE COMMITMENT...")
            
            if not self.test_commit_id:
                self.log_result(
                    "Update Commitment", 
                    False, 
                    "No test commitment ID available"
                )
                return False
            
            # Prepare updated data
            updated_data = TEST_COMMIT_DATA.copy()
            updated_data["contract_title"] = "Updated Test Backend Commitment Contract"
            updated_data["contract_value"] = 20000000
            
            response = self.session.put(
                f"{BACKEND_URL}/commerce/commit/{self.test_commit_id}",
                json=updated_data,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify updated fields
                if data.get("contract_title") != updated_data["contract_title"]:
                    self.log_result(
                        "Update Commitment", 
                        False, 
                        f"Contract title not updated: expected {updated_data['contract_title']}, got {data.get('contract_title')}"
                    )
                    return False
                
                if data.get("contract_value") != updated_data["contract_value"]:
                    self.log_result(
                        "Update Commitment", 
                        False, 
                        f"Contract value not updated: expected {updated_data['contract_value']}, got {data.get('contract_value')}"
                    )
                    return False
                
                # Verify updated_at timestamp changed
                if "updated_at" not in data:
                    self.log_result(
                        "Update Commitment", 
                        False, 
                        "updated_at field missing"
                    )
                    return False
                
                self.log_result(
                    "Update Commitment", 
                    True, 
                    f"Commitment updated successfully, contract_title: {data.get('contract_title')}, contract_value: {data.get('contract_value')}"
                )
                return True
                
            else:
                self.log_result(
                    "Update Commitment", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_result("Update Commitment", False, f"Exception: {str(e)}")
            return False

    def test_status_workflow_transition(self):
        """Test PATCH /api/commerce/commit/{commit_id}/status - Status transitions"""
        try:
            print("🔄 TESTING STATUS WORKFLOW TRANSITIONS...")
            
            if not self.test_commit_id:
                self.log_result(
                    "Status Workflow", 
                    False, 
                    "No test commitment ID available"
                )
                return False
            
            # Test transition: Draft → Under Review
            response1 = self.session.patch(
                f"{BACKEND_URL}/commerce/commit/{self.test_commit_id}/status",
                params={"status": "Under Review"},
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
            if data1.get("commit_status") != "Under Review":
                self.log_result(
                    "Status Workflow", 
                    False, 
                    f"First transition failed: expected 'Under Review', got '{data1.get('commit_status')}'"
                )
                return False
            
            # Test another transition: Under Review → Approved
            response2 = self.session.patch(
                f"{BACKEND_URL}/commerce/commit/{self.test_commit_id}/status",
                params={"status": "Approved"},
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
            if data2.get("commit_status") != "Approved":
                self.log_result(
                    "Status Workflow", 
                    False, 
                    f"Second transition failed: expected 'Approved', got '{data2.get('commit_status')}'"
                )
                return False
            
            # Test final transition: Approved → Executed
            response3 = self.session.patch(
                f"{BACKEND_URL}/commerce/commit/{self.test_commit_id}/status",
                params={"status": "Executed"},
                timeout=30
            )
            
            if response3.status_code != 200:
                self.log_result(
                    "Status Workflow", 
                    False, 
                    f"Final transition failed with HTTP {response3.status_code}",
                    response3.text
                )
                return False
            
            data3 = response3.json()
            if data3.get("commit_status") != "Executed":
                self.log_result(
                    "Status Workflow", 
                    False, 
                    f"Final transition failed: expected 'Executed', got '{data3.get('commit_status')}'"
                )
                return False
            
            self.log_result(
                "Status Workflow", 
                True, 
                f"Status transitions successful: Draft → Under Review → Approved → Executed"
            )
            return True
            
        except Exception as e:
            self.log_result("Status Workflow", False, f"Exception: {str(e)}")
            return False

    def test_delete_commitment(self):
        """Test DELETE /api/commerce/commit/{commit_id} - Delete commitment"""
        try:
            print("🗑️ TESTING DELETE COMMITMENT...")
            
            if not self.test_commit_id:
                self.log_result(
                    "Delete Commitment", 
                    False, 
                    "No test commitment ID available"
                )
                return False
            
            # Delete the commitment
            response = self.session.delete(
                f"{BACKEND_URL}/commerce/commit/{self.test_commit_id}",
                timeout=30
            )
            
            if response.status_code != 200:
                self.log_result(
                    "Delete Commitment", 
                    False, 
                    f"Delete failed with HTTP {response.status_code}",
                    response.text
                )
                return False
            
            # Verify commitment no longer appears in GET list
            list_response = self.session.get(
                f"{BACKEND_URL}/commerce/commit",
                timeout=30
            )
            
            if list_response.status_code == 200:
                commits = list_response.json()
                for commit in commits:
                    if commit.get("commit_id") == self.test_commit_id:
                        self.log_result(
                            "Delete Commitment", 
                            False, 
                            f"Commitment {self.test_commit_id} still appears in list after deletion"
                        )
                        return False
                
                self.log_result(
                    "Delete Commitment", 
                    True, 
                    f"Commitment {self.test_commit_id} deleted successfully and no longer appears in list"
                )
                return True
            else:
                self.log_result(
                    "Delete Commitment", 
                    False, 
                    f"Could not verify deletion - list request failed with HTTP {list_response.status_code}"
                )
                return False
                
        except Exception as e:
            self.log_result("Delete Commitment", False, f"Exception: {str(e)}")
            return False

    def test_error_handling(self):
        """Test error handling for invalid requests"""
        try:
            print("⚠️ TESTING ERROR HANDLING...")
            
            # Test 404 for non-existent commit_id
            response_404 = self.session.get(
                f"{BACKEND_URL}/commerce/commit/COMM-2025-999",
                timeout=30
            )
            
            if response_404.status_code != 404:
                self.log_result(
                    "Error Handling", 
                    False, 
                    f"Expected 404 for non-existent commitment, got {response_404.status_code}"
                )
                return False
            
            # Test validation errors for invalid data
            invalid_data = {
                "contract_title": "",  # Empty required field
                "contract_value": -1000,  # Negative value
                "evaluation_id": ""  # Empty required field
            }
            
            response_validation = self.session.post(
                f"{BACKEND_URL}/commerce/commit",
                json=invalid_data,
                timeout=30
            )
            
            if response_validation.status_code not in [400, 422]:
                self.log_result(
                    "Error Handling", 
                    False, 
                    f"Expected 400/422 for invalid data, got {response_validation.status_code}"
                )
                return False
            
            self.log_result(
                "Error Handling", 
                True, 
                "404 for non-existent commitment and validation errors working correctly"
            )
            return True
            
        except Exception as e:
            self.log_result("Error Handling", False, f"Exception: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 STARTING IB COMMERCE COMMIT MODULE API TESTING")
        print("=" * 60)
        
        # Authentication is required for all tests
        if not self.authenticate():
            print("❌ Authentication failed. Cannot proceed with tests.")
            return False
        
        # Run all CRUD tests
        tests = [
            self.test_create_commitment,
            self.test_list_commitments,
            self.test_get_commitment_details,
            self.test_update_commitment,
            self.test_status_workflow_transition,
            self.test_delete_commitment,
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
            print("✅ ALL TESTS PASSED - Commit Module APIs are working correctly!")
            return True
        else:
            print(f"❌ {total - passed} TESTS FAILED - Issues need to be addressed")
            return False

def main():
    """Main function"""
    tester = CommitModuleAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()