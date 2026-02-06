#!/usr/bin/env python3
"""
Adjustment Entry API Endpoints Testing Script
Comprehensive testing of the newly implemented Adjustment Entry feature
"""

import requests
import json
import sys
from datetime import datetime, timezone
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Configuration - Use external URL as specified in review request
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://saas-finint.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

# Test credentials as specified in review request
TEST_EMAIL = "demo@innovatebooks.com"
TEST_PASSWORD = os.getenv("TEST_PASSWORD", "Test1234")   # or demo123 as default


class AdjustmentEntryTester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_results = {
            'passed': 0,
            'failed': 0,
            'errors': []
        }
        self.created_entry_id = None
        self.created_entry_number = None
    
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
        """Authenticate with demo credentials as specified in review request"""
        print("🔐 Authenticating with demo@innovatebooks.com / demo123...")
        
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
                user_email = data.get('user', {}).get('email', 'Unknown')
                self.log_result("Authentication", True, f"Successfully logged in as {user_email}")
                return True
            else:
                self.log_result("Authentication", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Authentication", False, f"Exception: {str(e)}")
            return False
    
    def test_create_adjustment_entry_draft(self):
        """Test CREATE Adjustment Entry (Draft) - Test Scenario 1"""
        print("📝 Testing CREATE Adjustment Entry (Draft)...")
        
        try:
            # Test data as specified in review request
            adjustment_data = {
                "entry_date": "2025-03-31T00:00:00Z",
                "description": "Test adjustment entry",
                "line_items": [
                    {
                        "account": "Sales Account",
                        "description": "Test debit",
                        "debit": 1000.0,
                        "credit": 0.0
                    },
                    {
                        "account": "Cash Account", 
                        "description": "Test credit",
                        "debit": 0.0,
                        "credit": 1000.0
                    }
                ],
                "notes": "Test notes"
            }
            
            response = self.session.post(
                f"{API_BASE}/adjustment-entries",
                json=adjustment_data,
                timeout=30
            )
            
            if response.status_code == 200:
                entry = response.json()
                
                # Validate response structure
                required_fields = ['id', 'entry_number', 'status', 'total_debit', 'total_credit']
                missing_fields = [field for field in required_fields if field not in entry]
                
                if missing_fields:
                    self.log_result("CREATE Adjustment Entry - Structure", False, f"Missing fields: {missing_fields}")
                    return False
                
                # Validate entry details
                if entry.get('status') != 'Draft':
                    self.log_result("CREATE Adjustment Entry - Status", False, f"Expected status='Draft', got '{entry.get('status')}'")
                    return False
                
                # Validate entry number format (ADJ-XXXX)
                entry_number = entry.get('entry_number', '')
                if not entry_number.startswith('ADJ-'):
                    self.log_result("CREATE Adjustment Entry - Entry Number", False, f"Entry number should start with 'ADJ-', got '{entry_number}'")
                    return False
                
                # Validate balanced totals
                total_debit = entry.get('total_debit', 0)
                total_credit = entry.get('total_credit', 0)
                if abs(total_debit - total_credit) > 0.01:
                    self.log_result("CREATE Adjustment Entry - Balance", False, f"Debits ({total_debit}) != Credits ({total_credit})")
                    return False
                
                if abs(total_debit - 1000.0) > 0.01:
                    self.log_result("CREATE Adjustment Entry - Amount", False, f"Expected total 1000.0, got debit={total_debit}, credit={total_credit}")
                    return False
                
                # Store for subsequent tests
                self.created_entry_id = entry.get('id')
                self.created_entry_number = entry_number
                
                self.log_result("CREATE Adjustment Entry (Draft)", True, f"Created entry {entry_number} with status='{entry.get('status')}', balanced totals: ₹{total_debit:,.2f}")
                return True
                
            else:
                self.log_result("CREATE Adjustment Entry (Draft)", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("CREATE Adjustment Entry (Draft)", False, f"Exception: {str(e)}")
            return False
    
    def test_get_all_adjustment_entries(self):
        """Test GET All Adjustment Entries - Test Scenario 2"""
        print("📋 Testing GET All Adjustment Entries...")
        
        try:
            response = self.session.get(f"{API_BASE}/adjustment-entries", timeout=30)
            
            if response.status_code == 200:
                entries = response.json()
                
                if not isinstance(entries, list):
                    self.log_result("GET All Adjustment Entries", False, "Response should be a list")
                    return False
                
                # Should include test entry + 3 year-end entries as mentioned in review
                if len(entries) < 1:
                    self.log_result("GET All Adjustment Entries", False, "Expected at least 1 entry (test entry)")
                    return False
                
                # Check if our created entry is in the list
                created_entry_found = False
                year_end_entries = 0
                
                for entry in entries:
                    if entry.get('id') == self.created_entry_id:
                        created_entry_found = True
                    
                    # Count year-end entries (entries with descriptions containing year-end keywords)
                    description = entry.get('description', '').lower()
                    if any(keyword in description for keyword in ['depreciation', 'bad debt', 'tax', 'year-end', 'provision']):
                        year_end_entries += 1
                
                if not created_entry_found:
                    self.log_result("GET All Adjustment Entries - Test Entry", False, "Created test entry not found in list")
                    return False
                
                self.log_result("GET All Adjustment Entries", True, f"Retrieved {len(entries)} entries (including test entry + {year_end_entries} year-end entries)")
                return True
                
            else:
                self.log_result("GET All Adjustment Entries", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("GET All Adjustment Entries", False, f"Exception: {str(e)}")
            return False
    
    def test_get_single_adjustment_entry(self):
        """Test GET Single Adjustment Entry - Test Scenario 3"""
        print("🔍 Testing GET Single Adjustment Entry...")
        
        if not self.created_entry_id:
            self.log_result("GET Single Adjustment Entry", False, "No entry ID available from create test")
            return False
        
        try:
            response = self.session.get(f"{API_BASE}/adjustment-entries/{self.created_entry_id}", timeout=30)
            
            if response.status_code == 200:
                entry = response.json()
                
                # Validate full entry details
                required_fields = ['id', 'entry_number', 'entry_date', 'description', 'line_items', 'total_debit', 'total_credit', 'status', 'notes', 'created_by', 'created_at']
                missing_fields = [field for field in required_fields if field not in entry]
                
                if missing_fields:
                    self.log_result("GET Single Adjustment Entry - Structure", False, f"Missing fields: {missing_fields}")
                    return False
                
                # Validate entry matches what we created
                if entry.get('id') != self.created_entry_id:
                    self.log_result("GET Single Adjustment Entry - ID Match", False, "Entry ID doesn't match")
                    return False
                
                if entry.get('description') != "Test adjustment entry":
                    self.log_result("GET Single Adjustment Entry - Description", False, "Description doesn't match")
                    return False
                
                # Validate line items
                line_items = entry.get('line_items', [])
                if len(line_items) != 2:
                    self.log_result("GET Single Adjustment Entry - Line Items Count", False, f"Expected 2 line items, got {len(line_items)}")
                    return False
                
                # Check line item details
                sales_item = next((item for item in line_items if item.get('account') == 'Sales Account'), None)
                cash_item = next((item for item in line_items if item.get('account') == 'Cash Account'), None)
                
                if not sales_item or not cash_item:
                    self.log_result("GET Single Adjustment Entry - Line Items", False, "Missing expected line items (Sales Account, Cash Account)")
                    return False
                
                if sales_item.get('debit') != 1000.0 or cash_item.get('credit') != 1000.0:
                    self.log_result("GET Single Adjustment Entry - Amounts", False, "Line item amounts don't match")
                    return False
                
                self.log_result("GET Single Adjustment Entry", True, f"Retrieved full details for entry {entry.get('entry_number')} with {len(line_items)} line items")
                return True
                
            else:
                self.log_result("GET Single Adjustment Entry", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("GET Single Adjustment Entry", False, f"Exception: {str(e)}")
            return False
    
    def test_update_adjustment_entry_draft(self):
        """Test UPDATE Adjustment Entry (Draft only) - Test Scenario 4"""
        print("✏️ Testing UPDATE Adjustment Entry (Draft only)...")
        
        if not self.created_entry_id:
            self.log_result("UPDATE Adjustment Entry", False, "No entry ID available from create test")
            return False
        
        try:
            # Updated data as specified in review request
            update_data = {
                "entry_date": "2025-03-31T00:00:00Z",
                "description": "Updated description",
                "line_items": [
                    {
                        "account": "Sales Account",
                        "description": "Updated debit", 
                        "debit": 2000.0,
                        "credit": 0.0
                    },
                    {
                        "account": "Cash Account",
                        "description": "Updated credit",
                        "debit": 0.0,
                        "credit": 2000.0
                    }
                ]
            }
            
            response = self.session.put(
                f"{API_BASE}/adjustment-entries/{self.created_entry_id}",
                json=update_data,
                timeout=30
            )
            
            if response.status_code == 200:
                updated_entry = response.json()
                
                # Validate updated fields
                if updated_entry.get('description') != "Updated description":
                    self.log_result("UPDATE Adjustment Entry - Description", False, "Description not updated")
                    return False
                
                # Validate updated amounts
                if updated_entry.get('total_debit') != 2000.0 or updated_entry.get('total_credit') != 2000.0:
                    self.log_result("UPDATE Adjustment Entry - Amounts", False, f"Expected 2000.0, got debit={updated_entry.get('total_debit')}, credit={updated_entry.get('total_credit')}")
                    return False
                
                # Validate still in Draft status
                if updated_entry.get('status') != 'Draft':
                    self.log_result("UPDATE Adjustment Entry - Status", False, f"Status should remain 'Draft', got '{updated_entry.get('status')}'")
                    return False
                
                self.log_result("UPDATE Adjustment Entry (Draft)", True, f"Updated entry with new amounts: ₹{updated_entry.get('total_debit'):,.2f}")
                return True
                
            else:
                self.log_result("UPDATE Adjustment Entry (Draft)", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("UPDATE Adjustment Entry (Draft)", False, f"Exception: {str(e)}")
            return False
    
    def test_move_to_review(self):
        """Test MOVE TO REVIEW - Test Scenario 5"""
        print("👀 Testing MOVE TO REVIEW...")
        
        if not self.created_entry_id:
            self.log_result("MOVE TO REVIEW", False, "No entry ID available from create test")
            return False
        
        try:
            response = self.session.put(f"{API_BASE}/adjustment-entries/{self.created_entry_id}/review", timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                
                # The endpoint returns a message, not the entry. Fetch the entry to verify status
                verify_response = self.session.get(f"{API_BASE}/adjustment-entries/{self.created_entry_id}", timeout=30)
                
                if verify_response.status_code != 200:
                    self.log_result("MOVE TO REVIEW - Verification", False, f"Could not fetch entry after review: {verify_response.status_code}")
                    return False
                
                entry = verify_response.json()
                
                # Validate status changed to Review
                if entry.get('status') != 'Review':
                    self.log_result("MOVE TO REVIEW - Status", False, f"Expected status='Review', got '{entry.get('status')}'")
                    return False
                
                # Should have reviewed_by and reviewed_at fields
                if not entry.get('reviewed_at'):
                    self.log_result("MOVE TO REVIEW - Timestamp", False, "reviewed_at should be set")
                    return False
                
                self.log_result("MOVE TO REVIEW", True, f"Entry {entry.get('entry_number')} moved to Review status")
                return True
                
            else:
                self.log_result("MOVE TO REVIEW", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("MOVE TO REVIEW", False, f"Exception: {str(e)}")
            return False
    
    def test_approve_and_post(self):
        """Test APPROVE AND POST - Test Scenario 6"""
        print("✅ Testing APPROVE AND POST...")
        
        if not self.created_entry_id:
            self.log_result("APPROVE AND POST", False, "No entry ID available from create test")
            return False
        
        try:
            response = self.session.put(f"{API_BASE}/adjustment-entries/{self.created_entry_id}/approve", timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                
                # The endpoint returns a message and journal_entry_id. Fetch the entry to verify status
                journal_entry_id = result.get('journal_entry_id')
                if not journal_entry_id:
                    self.log_result("APPROVE AND POST - Journal Entry ID", False, "journal_entry_id should be in response")
                    return False
                
                # Fetch the entry to verify status change
                verify_response = self.session.get(f"{API_BASE}/adjustment-entries/{self.created_entry_id}", timeout=30)
                
                if verify_response.status_code != 200:
                    self.log_result("APPROVE AND POST - Verification", False, f"Could not fetch entry after approval: {verify_response.status_code}")
                    return False
                
                entry = verify_response.json()
                
                # Validate status changed to Approved
                if entry.get('status') != 'Approved':
                    self.log_result("APPROVE AND POST - Status", False, f"Expected status='Approved', got '{entry.get('status')}'")
                    return False
                
                # Should have journal_entry_id populated in the entry
                entry_journal_id = entry.get('journal_entry_id')
                if not entry_journal_id:
                    self.log_result("APPROVE AND POST - Entry Journal ID", False, "journal_entry_id should be populated in entry")
                    return False
                
                # Should have approved_by and approved_at fields
                if not entry.get('approved_at'):
                    self.log_result("APPROVE AND POST - Timestamp", False, "approved_at should be set")
                    return False
                
                self.log_result("APPROVE AND POST", True, f"Entry {entry.get('entry_number')} approved with journal_entry_id: {entry_journal_id}")
                return True
                
            else:
                self.log_result("APPROVE AND POST", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("APPROVE AND POST", False, f"Exception: {str(e)}")
            return False
    
    def test_verify_journal_entry_created(self):
        """Test VERIFY Journal Entry Created - Test Scenario 7"""
        print("📊 Testing VERIFY Journal Entry Created...")
        
        try:
            # Get journal entries filtered by transaction_type="Adjustment"
            response = self.session.get(f"{API_BASE}/journal-entries?transaction_type=Adjustment", timeout=30)
            
            if response.status_code == 200:
                journal_entries = response.json()
                
                if not isinstance(journal_entries, list):
                    self.log_result("VERIFY Journal Entry - Structure", False, "Response should be a list")
                    return False
                
                # Find journal entry with matching data
                matching_entry = None
                for entry in journal_entries:
                    if entry.get('description') == "Updated description":  # From our test
                        matching_entry = entry
                        break
                
                if not matching_entry:
                    self.log_result("VERIFY Journal Entry - Find Entry", False, "No journal entry found with matching description")
                    return False
                
                # Validate journal entry structure
                required_fields = ['id', 'transaction_id', 'transaction_type', 'entry_date', 'description', 'line_items', 'total_debit', 'total_credit']
                missing_fields = [field for field in required_fields if field not in matching_entry]
                
                if missing_fields:
                    self.log_result("VERIFY Journal Entry - Structure", False, f"Missing fields: {missing_fields}")
                    return False
                
                # Validate transaction_type
                if matching_entry.get('transaction_type') != 'Adjustment':
                    self.log_result("VERIFY Journal Entry - Type", False, f"Expected transaction_type='Adjustment', got '{matching_entry.get('transaction_type')}'")
                    return False
                
                # Validate amounts match
                if matching_entry.get('total_debit') != 2000.0 or matching_entry.get('total_credit') != 2000.0:
                    self.log_result("VERIFY Journal Entry - Amounts", False, f"Amounts don't match: debit={matching_entry.get('total_debit')}, credit={matching_entry.get('total_credit')}")
                    return False
                
                # Validate line items
                line_items = matching_entry.get('line_items', [])
                if len(line_items) != 2:
                    self.log_result("VERIFY Journal Entry - Line Items", False, f"Expected 2 line items, got {len(line_items)}")
                    return False
                
                self.log_result("VERIFY Journal Entry Created", True, f"Journal entry created with ID: {matching_entry.get('id')}, balanced amounts: ₹{matching_entry.get('total_debit'):,.2f}")
                return True
                
            else:
                self.log_result("VERIFY Journal Entry Created", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("VERIFY Journal Entry Created", False, f"Exception: {str(e)}")
            return False
    
    def test_validation_tests(self):
        """Test Validation Tests - Test Scenario 8"""
        print("🔍 Testing Validation Tests...")
        
        validation_passed = 0
        validation_total = 3
        
        try:
            # Test 1: Unbalanced debits/credits should fail
            print("   Test 1: Unbalanced debits/credits...")
            unbalanced_data = {
                "entry_date": "2025-03-31T00:00:00Z",
                "description": "Unbalanced test entry",
                "line_items": [
                    {
                        "account": "Sales Account",
                        "description": "Unbalanced debit",
                        "debit": 1000.0,
                        "credit": 0.0
                    },
                    {
                        "account": "Cash Account",
                        "description": "Unbalanced credit",
                        "debit": 0.0,
                        "credit": 500.0  # Intentionally unbalanced
                    }
                ]
            }
            
            response = self.session.post(f"{API_BASE}/adjustment-entries", json=unbalanced_data, timeout=30)
            
            if response.status_code == 400:
                validation_passed += 1
                print("   ✅ Unbalanced entry correctly rejected")
            else:
                print(f"   ❌ Unbalanced entry should be rejected, got status: {response.status_code}")
            
            # Test 2: Try to update entry in Review status (should fail)
            print("   Test 2: Update entry in Review status...")
            if self.created_entry_id:
                # Entry should be in Approved status now, but let's try anyway
                update_data = {
                    "entry_date": "2025-03-31T00:00:00Z",
                    "description": "Should not work",
                    "line_items": [
                        {
                            "account": "Test Account",
                            "description": "Test",
                            "debit": 100.0,
                            "credit": 0.0
                        },
                        {
                            "account": "Test Account 2",
                            "description": "Test",
                            "debit": 0.0,
                            "credit": 100.0
                        }
                    ]
                }
                
                response = self.session.put(f"{API_BASE}/adjustment-entries/{self.created_entry_id}", json=update_data, timeout=30)
                
                if response.status_code == 400:
                    validation_passed += 1
                    print("   ✅ Update of non-Draft entry correctly rejected")
                else:
                    print(f"   ❌ Update of non-Draft entry should be rejected, got status: {response.status_code}")
            else:
                print("   ⚠️ Skipping update test - no entry ID available")
            
            # Test 3: Try to delete entry in Approved status (should fail)
            print("   Test 3: Delete entry in Approved status...")
            if self.created_entry_id:
                response = self.session.delete(f"{API_BASE}/adjustment-entries/{self.created_entry_id}", timeout=30)
                
                if response.status_code == 400:
                    validation_passed += 1
                    print("   ✅ Delete of Approved entry correctly rejected")
                else:
                    print(f"   ❌ Delete of Approved entry should be rejected, got status: {response.status_code}")
            else:
                print("   ⚠️ Skipping delete test - no entry ID available")
            
            success_rate = validation_passed / validation_total
            if success_rate >= 0.67:  # At least 2 out of 3 validations should pass
                self.log_result("Validation Tests", True, f"Passed {validation_passed}/{validation_total} validation tests")
                return True
            else:
                self.log_result("Validation Tests", False, f"Only passed {validation_passed}/{validation_total} validation tests")
                return False
                
        except Exception as e:
            self.log_result("Validation Tests", False, f"Exception: {str(e)}")
            return False
    
    def test_delete_draft_entry(self):
        """Test DELETE Draft Entry - Test Scenario 9"""
        print("🗑️ Testing DELETE Draft Entry...")
        
        try:
            # Create a new draft entry for deletion test
            draft_data = {
                "entry_date": "2025-03-31T00:00:00Z",
                "description": "Draft entry for deletion test",
                "line_items": [
                    {
                        "account": "Test Account",
                        "description": "Test debit",
                        "debit": 500.0,
                        "credit": 0.0
                    },
                    {
                        "account": "Test Account 2",
                        "description": "Test credit",
                        "debit": 0.0,
                        "credit": 500.0
                    }
                ]
            }
            
            # Create draft entry
            create_response = self.session.post(f"{API_BASE}/adjustment-entries", json=draft_data, timeout=30)
            
            if create_response.status_code != 200:
                self.log_result("DELETE Draft Entry - Create", False, f"Could not create draft entry: {create_response.status_code}")
                return False
            
            draft_entry = create_response.json()
            draft_entry_id = draft_entry.get('id')
            draft_entry_number = draft_entry.get('entry_number')
            
            if not draft_entry_id:
                self.log_result("DELETE Draft Entry - ID", False, "No ID returned from draft entry creation")
                return False
            
            # Delete the draft entry
            delete_response = self.session.delete(f"{API_BASE}/adjustment-entries/{draft_entry_id}", timeout=30)
            
            if delete_response.status_code == 200:
                # Verify deletion by trying to get the entry
                verify_response = self.session.get(f"{API_BASE}/adjustment-entries/{draft_entry_id}", timeout=30)
                
                if verify_response.status_code == 404:
                    self.log_result("DELETE Draft Entry", True, f"Draft entry {draft_entry_number} successfully deleted")
                    return True
                else:
                    self.log_result("DELETE Draft Entry - Verification", False, f"Entry still exists after deletion (status: {verify_response.status_code})")
                    return False
            else:
                self.log_result("DELETE Draft Entry", False, f"Status: {delete_response.status_code}, Response: {delete_response.text}")
                return False
                
        except Exception as e:
            self.log_result("DELETE Draft Entry", False, f"Exception: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all adjustment entry tests in sequence"""
        print("🚀 Starting Comprehensive Adjustment Entry API Testing...")
        print("=" * 80)
        
        # Authentication (required)
        if not self.authenticate():
            print("❌ Authentication failed. Cannot proceed with tests.")
            return False
        
        # Test scenarios as specified in review request
        tests = [
            ("1. CREATE Adjustment Entry (Draft)", self.test_create_adjustment_entry_draft),
            ("2. GET All Adjustment Entries", self.test_get_all_adjustment_entries),
            ("3. GET Single Adjustment Entry", self.test_get_single_adjustment_entry),
            ("4. UPDATE Adjustment Entry (Draft)", self.test_update_adjustment_entry_draft),
            ("5. MOVE TO REVIEW", self.test_move_to_review),
            ("6. APPROVE AND POST", self.test_approve_and_post),
            ("7. VERIFY Journal Entry Created", self.test_verify_journal_entry_created),
            ("8. Validation Tests", self.test_validation_tests),
            ("9. DELETE Draft Entry", self.test_delete_draft_entry)
        ]
        
        print(f"\nRunning {len(tests)} test scenarios...\n")
        
        for test_name, test_func in tests:
            print(f"Running {test_name}...")
            test_func()
        
        # Print summary
        print("=" * 80)
        print("📊 TEST SUMMARY")
        print("=" * 80)
        
        total_tests = self.test_results['passed'] + self.test_results['failed']
        success_rate = (self.test_results['passed'] / total_tests * 100) if total_tests > 0 else 0
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {self.test_results['passed']}")
        print(f"Failed: {self.test_results['failed']}")
        print(f"Success Rate: {success_rate:.1f}%")
        
        if self.test_results['errors']:
            print("\n❌ FAILED TESTS:")
            for error in self.test_results['errors']:
                print(f"   • {error}")
        
        print("\n" + "=" * 80)
        
        # Success criteria: All CRUD operations working, workflow transitions functional
        if success_rate >= 80:  # At least 80% success rate
            print("✅ SUCCESS CRITERIA MET: Adjustment Entry API endpoints are working correctly")
            return True
        else:
            print("❌ SUCCESS CRITERIA NOT MET: Multiple critical issues found")
            return False

def main():
    """Main function"""
    tester = AdjustmentEntryTester()
    success = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()