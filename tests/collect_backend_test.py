#!/usr/bin/env python3
"""
IB Commerce Collect Module Backend API Testing
Comprehensive test suite for Collections & Receivables CRUD operations and payment workflow
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

# Test data for collection creation
TEST_COLLECTION_DATA = {
    "invoice_id": "INV-2025-001",
    "customer_id": "CUST-2025-001",
    "amount_due": 100000
}

class CollectModuleAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_collection_id = None
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

    def test_list_collections_without_filter(self):
        """Test GET /api/commerce/collect - List all collections"""
        try:
            print("📋 TESTING LIST COLLECTIONS (NO FILTER)...")
            
            response = self.session.get(
                f"{BACKEND_URL}/commerce/collect",
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if not isinstance(data, list):
                    self.log_result(
                        "List Collections (No Filter)", 
                        False, 
                        "Response should be a list",
                        data
                    )
                    return False
                
                # Verify response contains expected fields
                if len(data) > 0:
                    collection = data[0]
                    required_fields = ["collection_id", "invoice_id", "customer_id", "amount_due", 
                                     "amount_received", "amount_outstanding", "payment_status", "due_date"]
                    missing_fields = [field for field in required_fields if field not in collection]
                    
                    if missing_fields:
                        self.log_result(
                            "List Collections (No Filter)", 
                            False, 
                            f"Missing required fields in response: {missing_fields}",
                            collection
                        )
                        return False
                
                self.log_result(
                    "List Collections (No Filter)", 
                    True, 
                    f"Retrieved {len(data)} collections successfully"
                )
                return True
                
            else:
                self.log_result(
                    "List Collections (No Filter)", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_result("List Collections (No Filter)", False, f"Exception: {str(e)}")
            return False

    def test_list_collections_with_status_filter(self):
        """Test GET /api/commerce/collect with status filters"""
        try:
            print("📋 TESTING LIST COLLECTIONS (WITH STATUS FILTERS)...")
            
            # Test Pending filter
            response_pending = self.session.get(
                f"{BACKEND_URL}/commerce/collect?status=Pending",
                timeout=30
            )
            
            if response_pending.status_code != 200:
                self.log_result(
                    "List Collections (Status Filter)", 
                    False, 
                    f"Pending filter failed with HTTP {response_pending.status_code}",
                    response_pending.text
                )
                return False
            
            # Test Paid filter
            response_paid = self.session.get(
                f"{BACKEND_URL}/commerce/collect?status=Paid",
                timeout=30
            )
            
            if response_paid.status_code != 200:
                self.log_result(
                    "List Collections (Status Filter)", 
                    False, 
                    f"Paid filter failed with HTTP {response_paid.status_code}",
                    response_paid.text
                )
                return False
            
            self.log_result(
                "List Collections (Status Filter)", 
                True, 
                "Status filters (Pending, Paid) working correctly"
            )
            return True
                
        except Exception as e:
            self.log_result("List Collections (Status Filter)", False, f"Exception: {str(e)}")
            return False

    def test_get_collection_details(self):
        """Test GET /api/commerce/collect/{collection_id} - Get collection details"""
        try:
            print("🔍 TESTING GET COLLECTION DETAILS...")
            
            # Test with existing collection ID from seed data
            test_collection_id = "COLL-2025-001"
            
            response = self.session.get(
                f"{BACKEND_URL}/commerce/collect/{test_collection_id}",
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify response structure matches Collect model
                required_fields = [
                    "collection_id", "invoice_id", "customer_id", "payment_status",
                    "amount_due", "amount_received", "amount_outstanding", "due_date",
                    "collection_priority", "dunning_level", "days_overdue"
                ]
                
                missing_fields = [field for field in required_fields if field not in data]
                if missing_fields:
                    self.log_result(
                        "Get Collection Details", 
                        False, 
                        f"Missing required fields: {missing_fields}",
                        data
                    )
                    return False
                
                # Verify collection_id matches
                if data.get("collection_id") != test_collection_id:
                    self.log_result(
                        "Get Collection Details", 
                        False, 
                        f"Collection ID mismatch: expected {test_collection_id}, got {data.get('collection_id')}"
                    )
                    return False
                
                self.log_result(
                    "Get Collection Details", 
                    True, 
                    f"Collection details retrieved successfully for {test_collection_id}"
                )
                return True
                
            else:
                self.log_result(
                    "Get Collection Details", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_result("Get Collection Details", False, f"Exception: {str(e)}")
            return False

    def test_create_collection(self):
        """Test POST /api/commerce/collect - Create new collection"""
        try:
            print("📝 TESTING CREATE COLLECTION...")
            
            response = self.session.post(
                f"{BACKEND_URL}/commerce/collect",
                json=TEST_COLLECTION_DATA,
                timeout=30
            )
            
            if response.status_code in [200, 201]:
                data = response.json()
                
                # Verify response structure
                required_fields = ["id", "collection_id", "payment_status", "amount_due", "amount_outstanding"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_result(
                        "Create Collection", 
                        False, 
                        f"Missing required fields: {missing_fields}",
                        data
                    )
                    return False
                
                # Verify collection_id format (COLL-2025-XXX)
                collection_id = data.get("collection_id", "")
                if not collection_id.startswith("COLL-2025-"):
                    self.log_result(
                        "Create Collection", 
                        False, 
                        f"Invalid collection_id format: {collection_id}. Expected COLL-2025-XXX",
                        data
                    )
                    return False
                
                # Verify initial status
                if data.get("payment_status") != "Pending":
                    self.log_result(
                        "Create Collection", 
                        False, 
                        f"Expected status 'Pending', got '{data.get('payment_status')}'",
                        data
                    )
                    return False
                
                # Verify amount_outstanding equals amount_due initially
                amount_due = data.get("amount_due", 0)
                amount_outstanding = data.get("amount_outstanding", 0)
                if amount_outstanding != amount_due:
                    self.log_result(
                        "Create Collection", 
                        False, 
                        f"Expected amount_outstanding ({amount_outstanding}) to equal amount_due ({amount_due})",
                        data
                    )
                    return False
                
                # Store collection_id for subsequent tests
                self.test_collection_id = collection_id
                
                self.log_result(
                    "Create Collection", 
                    True, 
                    f"Collection created successfully with ID: {collection_id}, Status: {data.get('payment_status')}"
                )
                return True
                
            else:
                self.log_result(
                    "Create Collection", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_result("Create Collection", False, f"Exception: {str(e)}")
            return False

    def test_update_collection(self):
        """Test PUT /api/commerce/collect/{collection_id} - Update collection"""
        try:
            print("✏️ TESTING UPDATE COLLECTION...")
            
            if not self.test_collection_id:
                self.log_result(
                    "Update Collection", 
                    False, 
                    "No test collection ID available"
                )
                return False
            
            # Prepare updated data
            updated_data = TEST_COLLECTION_DATA.copy()
            updated_data["customer_id"] = "CUST-2025-002"
            updated_data["amount_due"] = 150000
            
            response = self.session.put(
                f"{BACKEND_URL}/commerce/collect/{self.test_collection_id}",
                json=updated_data,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify updated_at timestamp changed
                if "updated_at" not in data:
                    self.log_result(
                        "Update Collection", 
                        False, 
                        "updated_at field missing"
                    )
                    return False
                
                self.log_result(
                    "Update Collection", 
                    True, 
                    f"Collection updated successfully for {self.test_collection_id}"
                )
                return True
                
            else:
                self.log_result(
                    "Update Collection", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_result("Update Collection", False, f"Exception: {str(e)}")
            return False

    def test_status_transitions(self):
        """Test PATCH /api/commerce/collect/{collection_id}/status - Update payment status"""
        try:
            print("🔄 TESTING STATUS TRANSITIONS...")
            
            if not self.test_collection_id:
                self.log_result(
                    "Status Transitions", 
                    False, 
                    "No test collection ID available"
                )
                return False
            
            # Test transition: Pending → Partial
            response1 = self.session.patch(
                f"{BACKEND_URL}/commerce/collect/{self.test_collection_id}/status",
                params={"status": "Partial"},
                timeout=30
            )
            
            if response1.status_code != 200:
                self.log_result(
                    "Status Transitions", 
                    False, 
                    f"Pending → Partial transition failed with HTTP {response1.status_code}",
                    response1.text
                )
                return False
            
            data1 = response1.json()
            if data1.get("payment_status") != "Partial":
                self.log_result(
                    "Status Transitions", 
                    False, 
                    f"First transition failed: expected 'Partial', got '{data1.get('payment_status')}'"
                )
                return False
            
            # Test transition: Partial → Paid
            response2 = self.session.patch(
                f"{BACKEND_URL}/commerce/collect/{self.test_collection_id}/status",
                params={"status": "Paid"},
                timeout=30
            )
            
            if response2.status_code != 200:
                self.log_result(
                    "Status Transitions", 
                    False, 
                    f"Partial → Paid transition failed with HTTP {response2.status_code}",
                    response2.text
                )
                return False
            
            data2 = response2.json()
            if data2.get("payment_status") != "Paid":
                self.log_result(
                    "Status Transitions", 
                    False, 
                    f"Second transition failed: expected 'Paid', got '{data2.get('payment_status')}'"
                )
                return False
            
            # Test transition: Paid → Overdue (should work for testing)
            response3 = self.session.patch(
                f"{BACKEND_URL}/commerce/collect/{self.test_collection_id}/status",
                params={"status": "Overdue"},
                timeout=30
            )
            
            if response3.status_code != 200:
                self.log_result(
                    "Status Transitions", 
                    False, 
                    f"Paid → Overdue transition failed with HTTP {response3.status_code}",
                    response3.text
                )
                return False
            
            data3 = response3.json()
            if data3.get("payment_status") != "Overdue":
                self.log_result(
                    "Status Transitions", 
                    False, 
                    f"Third transition failed: expected 'Overdue', got '{data3.get('payment_status')}'"
                )
                return False
            
            self.log_result(
                "Status Transitions", 
                True, 
                "Status transitions successful: Pending → Partial → Paid → Overdue"
            )
            return True
            
        except Exception as e:
            self.log_result("Status Transitions", False, f"Exception: {str(e)}")
            return False

    def test_record_partial_payment(self):
        """Test PATCH /api/commerce/collect/{collection_id}/payment - Record partial payment"""
        try:
            print("💰 TESTING RECORD PARTIAL PAYMENT...")
            
            if not self.test_collection_id:
                self.log_result(
                    "Record Partial Payment", 
                    False, 
                    "No test collection ID available"
                )
                return False
            
            # Record partial payment
            payment_data = {
                "payment_amount": 50000,
                "payment_method": "Bank Transfer",
                "payment_reference": "UTR123456"
            }
            
            response = self.session.patch(
                f"{BACKEND_URL}/commerce/collect/{self.test_collection_id}/payment",
                params=payment_data,
                timeout=30
            )
            
            if response.status_code != 200:
                self.log_result(
                    "Record Partial Payment", 
                    False, 
                    f"Payment recording failed with HTTP {response.status_code}",
                    response.text
                )
                return False
            
            data = response.json()
            
            # Verify amount_received is updated correctly
            expected_received = 50000
            actual_received = data.get("amount_received", 0)
            if actual_received != expected_received:
                self.log_result(
                    "Record Partial Payment", 
                    False, 
                    f"amount_received incorrect: expected {expected_received}, got {actual_received}"
                )
                return False
            
            # Verify amount_outstanding is calculated correctly
            amount_due = data.get("amount_due", 0)
            expected_outstanding = amount_due - expected_received
            actual_outstanding = data.get("amount_outstanding", 0)
            if actual_outstanding != expected_outstanding:
                self.log_result(
                    "Record Partial Payment", 
                    False, 
                    f"amount_outstanding incorrect: expected {expected_outstanding}, got {actual_outstanding}"
                )
                return False
            
            # Verify payment_status changes to "Partial"
            if data.get("payment_status") != "Partial":
                self.log_result(
                    "Record Partial Payment", 
                    False, 
                    f"Expected status 'Partial', got '{data.get('payment_status')}'"
                )
                return False
            
            self.log_result(
                "Record Partial Payment", 
                True, 
                f"Partial payment recorded successfully: ₹{expected_received}, Outstanding: ₹{actual_outstanding}"
            )
            return True
            
        except Exception as e:
            self.log_result("Record Partial Payment", False, f"Exception: {str(e)}")
            return False

    def test_record_full_payment(self):
        """Test recording remaining payment to complete the collection"""
        try:
            print("💰 TESTING RECORD FULL PAYMENT...")
            
            if not self.test_collection_id:
                self.log_result(
                    "Record Full Payment", 
                    False, 
                    "No test collection ID available"
                )
                return False
            
            # Get current collection state
            get_response = self.session.get(
                f"{BACKEND_URL}/commerce/collect/{self.test_collection_id}",
                timeout=30
            )
            
            if get_response.status_code != 200:
                self.log_result(
                    "Record Full Payment", 
                    False, 
                    "Could not get current collection state"
                )
                return False
            
            current_data = get_response.json()
            remaining_amount = current_data.get("amount_outstanding", 0)
            
            # Record remaining payment
            payment_data = {
                "payment_amount": remaining_amount,
                "payment_method": "Bank Transfer",
                "payment_reference": "UTR789012"
            }
            
            response = self.session.patch(
                f"{BACKEND_URL}/commerce/collect/{self.test_collection_id}/payment",
                params=payment_data,
                timeout=30
            )
            
            if response.status_code != 200:
                self.log_result(
                    "Record Full Payment", 
                    False, 
                    f"Full payment recording failed with HTTP {response.status_code}",
                    response.text
                )
                return False
            
            data = response.json()
            
            # Verify payment_status changes to "Paid"
            if data.get("payment_status") != "Paid":
                self.log_result(
                    "Record Full Payment", 
                    False, 
                    f"Expected status 'Paid', got '{data.get('payment_status')}'"
                )
                return False
            
            # Verify payment_received_date is set
            if not data.get("payment_received_date"):
                self.log_result(
                    "Record Full Payment", 
                    False, 
                    "payment_received_date should be set when fully paid"
                )
                return False
            
            self.log_result(
                "Record Full Payment", 
                True, 
                f"Full payment recorded successfully, Status: {data.get('payment_status')}"
            )
            return True
            
        except Exception as e:
            self.log_result("Record Full Payment", False, f"Exception: {str(e)}")
            return False

    def test_delete_collection(self):
        """Test DELETE /api/commerce/collect/{collection_id} - Delete collection"""
        try:
            print("🗑️ TESTING DELETE COLLECTION...")
            
            # Create a new collection for deletion test
            delete_test_data = {
                "invoice_id": "INV-2025-999",
                "customer_id": "CUST-2025-999",
                "amount_due": 50000
            }
            
            create_response = self.session.post(
                f"{BACKEND_URL}/commerce/collect",
                json=delete_test_data,
                timeout=30
            )
            
            if create_response.status_code not in [200, 201]:
                self.log_result(
                    "Delete Collection", 
                    False, 
                    "Could not create test collection for deletion"
                )
                return False
            
            delete_collection_id = create_response.json().get("collection_id")
            
            # Delete the collection
            response = self.session.delete(
                f"{BACKEND_URL}/commerce/collect/{delete_collection_id}",
                timeout=30
            )
            
            if response.status_code != 200:
                self.log_result(
                    "Delete Collection", 
                    False, 
                    f"Delete failed with HTTP {response.status_code}",
                    response.text
                )
                return False
            
            # Verify collection no longer appears in GET list
            list_response = self.session.get(
                f"{BACKEND_URL}/commerce/collect",
                timeout=30
            )
            
            if list_response.status_code == 200:
                collections = list_response.json()
                for collection in collections:
                    if collection.get("collection_id") == delete_collection_id:
                        self.log_result(
                            "Delete Collection", 
                            False, 
                            f"Collection {delete_collection_id} still appears in list after deletion"
                        )
                        return False
                
                self.log_result(
                    "Delete Collection", 
                    True, 
                    f"Collection {delete_collection_id} deleted successfully and no longer appears in list"
                )
                return True
            else:
                self.log_result(
                    "Delete Collection", 
                    False, 
                    f"Could not verify deletion - list request failed with HTTP {list_response.status_code}"
                )
                return False
                
        except Exception as e:
            self.log_result("Delete Collection", False, f"Exception: {str(e)}")
            return False

    def test_error_handling(self):
        """Test error handling for invalid requests"""
        try:
            print("⚠️ TESTING ERROR HANDLING...")
            
            # Test 404 for non-existent collection_id
            response_404 = self.session.get(
                f"{BACKEND_URL}/commerce/collect/COLL-2025-999",
                timeout=30
            )
            
            if response_404.status_code != 404:
                self.log_result(
                    "Error Handling", 
                    False, 
                    f"Expected 404 for non-existent collection, got {response_404.status_code}"
                )
                return False
            
            # Test validation errors for invalid data
            invalid_data = {
                "invoice_id": "",  # Empty required field
                "customer_id": "",  # Empty required field
                "amount_due": -1000  # Negative amount
            }
            
            response_validation = self.session.post(
                f"{BACKEND_URL}/commerce/collect",
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
                "404 for non-existent collection and validation errors working correctly"
            )
            return True
            
        except Exception as e:
            self.log_result("Error Handling", False, f"Exception: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 STARTING IB COMMERCE COLLECT MODULE API TESTING")
        print("=" * 70)
        
        # Authentication is required for all tests
        if not self.authenticate():
            print("❌ Authentication failed. Cannot proceed with tests.")
            return False
        
        # Run all CRUD tests
        tests = [
            self.test_list_collections_without_filter,
            self.test_list_collections_with_status_filter,
            self.test_get_collection_details,
            self.test_create_collection,
            self.test_update_collection,
            self.test_status_transitions,
            self.test_record_partial_payment,
            self.test_record_full_payment,
            self.test_delete_collection,
            self.test_error_handling
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            if test():
                passed += 1
            time.sleep(1)  # Brief pause between tests
        
        # Print summary
        print("=" * 70)
        print("📊 TEST SUMMARY")
        print("=" * 70)
        
        for result in self.results:
            print(f"{result['status']}: {result['test']}")
            if result['details']:
                print(f"   {result['details']}")
        
        print(f"\n🎯 OVERALL RESULT: {passed}/{total} tests passed")
        
        if passed == total:
            print("✅ ALL TESTS PASSED - Collect Module APIs are working correctly!")
            return True
        else:
            print(f"❌ {total - passed} TESTS FAILED - Issues need to be addressed")
            return False

def main():
    """Main function"""
    tester = CollectModuleAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()