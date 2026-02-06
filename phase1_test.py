#!/usr/bin/env python3
"""
Phase 1 Backend API Testing Script - Category Master + Journal Entry APIs
Focused testing for the 13 specific test cases in the review request
"""

import requests
import json
import sys
from datetime import datetime, timezone

# Configuration
API_BASE = "http://localhost:8001/api"
TEST_EMAIL = "demo@innovatebooks.com"
TEST_PASSWORD = os.getenv("TEST_PASSWORD", "Test1234")   # or demo123 as default


class Phase1Tester:
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
                self.log_result("Authentication", True, f"Logged in as {data.get('user', {}).get('email', 'Unknown')}")
                return True
            else:
                self.log_result("Authentication", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Authentication", False, f"Exception: {str(e)}")
            return False
    
    def test_categories_all(self):
        """Test 1: GET /api/categories (No filters) - Should return all 805 categories"""
        print("Test 1: GET /api/categories (No filters)")
        try:
            response = self.session.get(f"{API_BASE}/categories", timeout=10)
            
            if response.status_code != 200:
                self.log_result("Test 1 - Get All Categories", False, f"Status: {response.status_code}")
                return False
            
            categories = response.json()
            if not isinstance(categories, list):
                self.log_result("Test 1 - Response Type", False, "Response should be a list")
                return False
            
            # Check count is approximately 805
            if len(categories) < 800 or len(categories) > 810:
                self.log_result("Test 1 - Category Count", False, f"Expected ~805 categories, got {len(categories)}")
                return False
            
            # Check structure
            if categories:
                sample = categories[0]
                required_fields = ['id', 'category_name', 'coa_account', 'fs_head', 'statement_type', 
                                 'cashflow_activity', 'cashflow_flow', 'cashflow_category', 'industry_tags']
                missing = [f for f in required_fields if f not in sample]
                if missing:
                    self.log_result("Test 1 - Structure", False, f"Missing fields: {missing}")
                    return False
            
            self.log_result("Test 1 - Get All Categories", True, f"Retrieved {len(categories)} categories with correct structure")
            return categories
            
        except Exception as e:
            self.log_result("Test 1 - Get All Categories", False, f"Exception: {str(e)}")
            return False
    
    def test_categories_operating(self):
        """Test 2: GET /api/categories?cashflow_activity=Operating - Should return ~270 categories"""
        print("Test 2: GET /api/categories?cashflow_activity=Operating")
        try:
            response = self.session.get(f"{API_BASE}/categories?cashflow_activity=Operating", timeout=10)
            
            if response.status_code != 200:
                self.log_result("Test 2 - Filter Operating", False, f"Status: {response.status_code}")
                return False
            
            categories = response.json()
            if not isinstance(categories, list):
                self.log_result("Test 2 - Response Type", False, "Response should be a list")
                return False
            
            # Check all are Operating
            non_operating = [c for c in categories if c.get('cashflow_activity') != 'Operating']
            if non_operating:
                self.log_result("Test 2 - Filter Validation", False, f"Found {len(non_operating)} non-Operating categories")
                return False
            
            # Check count is approximately 270
            if len(categories) < 250 or len(categories) > 290:
                self.log_result("Test 2 - Operating Count", False, f"Expected ~270 Operating categories, got {len(categories)}")
                return False
            
            self.log_result("Test 2 - Filter Operating", True, f"Retrieved {len(categories)} Operating categories")
            return True
            
        except Exception as e:
            self.log_result("Test 2 - Filter Operating", False, f"Exception: {str(e)}")
            return False
    
    def test_categories_inflow(self):
        """Test 3: GET /api/categories?cashflow_flow=Inflow - Filter by Inflow transactions"""
        print("Test 3: GET /api/categories?cashflow_flow=Inflow")
        try:
            response = self.session.get(f"{API_BASE}/categories?cashflow_flow=Inflow", timeout=10)
            
            if response.status_code != 200:
                self.log_result("Test 3 - Filter Inflow", False, f"Status: {response.status_code}")
                return False
            
            categories = response.json()
            if not isinstance(categories, list):
                self.log_result("Test 3 - Response Type", False, "Response should be a list")
                return False
            
            # Check all are Inflow
            non_inflow = [c for c in categories if c.get('cashflow_flow') != 'Inflow']
            if non_inflow:
                self.log_result("Test 3 - Filter Validation", False, f"Found {len(non_inflow)} non-Inflow categories")
                return False
            
            self.log_result("Test 3 - Filter Inflow", True, f"Retrieved {len(categories)} Inflow categories")
            return True
            
        except Exception as e:
            self.log_result("Test 3 - Filter Inflow", False, f"Exception: {str(e)}")
            return False
    
    def test_categories_pl(self):
        """Test 4: GET /api/categories?statement_type=Profit & Loss - Filter P&L categories"""
        print("Test 4: GET /api/categories?statement_type=Profit & Loss")
        try:
            response = self.session.get(f"{API_BASE}/categories?statement_type=Profit & Loss", timeout=10)
            
            if response.status_code != 200:
                self.log_result("Test 4 - Filter P&L", False, f"Status: {response.status_code}")
                return False
            
            categories = response.json()
            if not isinstance(categories, list):
                self.log_result("Test 4 - Response Type", False, "Response should be a list")
                return False
            
            # Check all are P&L
            non_pl = [c for c in categories if c.get('statement_type') != 'Profit & Loss']
            if non_pl:
                self.log_result("Test 4 - Filter Validation", False, f"Found {len(non_pl)} non-P&L categories")
                return False
            
            self.log_result("Test 4 - Filter P&L", True, f"Retrieved {len(categories)} P&L categories")
            return True
            
        except Exception as e:
            self.log_result("Test 4 - Filter P&L", False, f"Exception: {str(e)}")
            return False
    
    def test_categories_search(self):
        """Test 5: GET /api/categories?search=Sales - Search in category names"""
        print("Test 5: GET /api/categories?search=Sales")
        try:
            response = self.session.get(f"{API_BASE}/categories?search=Sales", timeout=10)
            
            if response.status_code != 200:
                self.log_result("Test 5 - Search Sales", False, f"Status: {response.status_code}")
                return False
            
            categories = response.json()
            if not isinstance(categories, list):
                self.log_result("Test 5 - Response Type", False, "Response should be a list")
                return False
            
            # Check search results contain "Sales" (case-insensitive)
            non_sales = [c for c in categories if 'sales' not in c.get('category_name', '').lower()]
            if len(non_sales) > len(categories) * 0.2:  # Allow up to 20% false positives
                self.log_result("Test 5 - Search Validation", False, f"Too many non-Sales results: {len(non_sales)}/{len(categories)}")
                return False
            
            self.log_result("Test 5 - Search Sales", True, f"Retrieved {len(categories)} categories matching 'Sales'")
            return True
            
        except Exception as e:
            self.log_result("Test 5 - Search Sales", False, f"Exception: {str(e)}")
            return False
    
    def test_categories_specific(self, all_categories):
        """Test 6: GET /api/categories/{id} - Get specific category by ID"""
        print("Test 6: GET /api/categories/{id}")
        try:
            if not all_categories:
                self.log_result("Test 6 - Get Specific Category", False, "No categories available for test")
                return False
            
            test_category = all_categories[0]
            category_id = test_category.get('id')
            category_name = test_category.get('category_name')
            
            response = self.session.get(f"{API_BASE}/categories/{category_id}", timeout=10)
            
            if response.status_code != 200:
                self.log_result("Test 6 - Get Specific Category", False, f"Status: {response.status_code}")
                return False
            
            category = response.json()
            if not isinstance(category, dict):
                self.log_result("Test 6 - Response Type", False, "Response should be a single category object")
                return False
            
            # Verify correct category
            if category.get('id') != category_id:
                self.log_result("Test 6 - ID Validation", False, f"ID mismatch: expected {category_id}, got {category.get('id')}")
                return False
            
            self.log_result("Test 6 - Get Specific Category", True, f"Retrieved category '{category_name}' correctly")
            return True
            
        except Exception as e:
            self.log_result("Test 6 - Get Specific Category", False, f"Exception: {str(e)}")
            return False
    
    def test_categories_stats(self):
        """Test 7: GET /api/categories/summary/stats - Get category distribution statistics"""
        print("Test 7: GET /api/categories/summary/stats")
        try:
            response = self.session.get(f"{API_BASE}/categories/summary/stats", timeout=10)
            
            if response.status_code != 200:
                self.log_result("Test 7 - Summary Stats", False, f"Status: {response.status_code}")
                return False
            
            stats = response.json()
            if not isinstance(stats, dict):
                self.log_result("Test 7 - Response Type", False, "Response should be a statistics object")
                return False
            
            # Check required fields
            required_fields = ['total_categories', 'by_activity']
            missing = [f for f in required_fields if f not in stats]
            if missing:
                self.log_result("Test 7 - Structure", False, f"Missing fields: {missing}")
                return False
            
            total = stats.get('total_categories', 0)
            by_activity = stats.get('by_activity', {})
            
            # Verify total is approximately 805
            if total < 800 or total > 810:
                self.log_result("Test 7 - Total Count", False, f"Expected ~805 total, got {total}")
                return False
            
            # Check Operating count is approximately 270
            operating_count = by_activity.get('Operating', 0)
            if operating_count < 250 or operating_count > 290:
                self.log_result("Test 7 - Operating Count", False, f"Expected ~270 Operating, got {operating_count}")
                return False
            
            breakdown = ", ".join([f"{k}: {v}" for k, v in by_activity.items()])
            self.log_result("Test 7 - Summary Stats", True, f"Total: {total}, Breakdown: {breakdown}")
            return True
            
        except Exception as e:
            self.log_result("Test 7 - Summary Stats", False, f"Exception: {str(e)}")
            return False
    
    def test_journal_create(self):
        """Test 8: POST /api/journal-entries - Create a new journal entry"""
        print("Test 8: POST /api/journal-entries")
        try:
            journal_entry = {
                "transaction_id": "test-inv-001",
                "transaction_type": "Invoice",
                "entry_date": "2025-01-15T10:00:00Z",
                "description": "Test invoice journal entry",
                "line_items": [
                    {
                        "account": "Accounts Receivable",
                        "description": "Invoice INV-001",
                        "debit": 11800.00,
                        "credit": 0.00
                    },
                    {
                        "account": "Sales Revenue",
                        "description": "Revenue from INV-001",
                        "debit": 0.00,
                        "credit": 10000.00
                    },
                    {
                        "account": "Output GST",
                        "description": "GST on INV-001",
                        "debit": 0.00,
                        "credit": 1800.00
                    }
                ],
                "total_debit": 11800.00,
                "total_credit": 11800.00
            }
            
            response = self.session.post(f"{API_BASE}/journal-entries", json=journal_entry, timeout=10)
            
            if response.status_code != 200:
                self.log_result("Test 8 - Create Journal Entry", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
            
            created = response.json()
            if not isinstance(created, dict):
                self.log_result("Test 8 - Response Type", False, "Response should be a journal entry object")
                return False
            
            # Check required fields
            required_fields = ['id', 'transaction_id', 'status', 'posted_by']
            missing = [f for f in required_fields if f not in created]
            if missing:
                self.log_result("Test 8 - Structure", False, f"Missing fields: {missing}")
                return False
            
            # Check status is "Posted"
            if created.get('status') != 'Posted':
                self.log_result("Test 8 - Status", False, f"Expected 'Posted', got '{created.get('status')}'")
                return False
            
            entry_id = created.get('id')
            self.log_result("Test 8 - Create Journal Entry", True, f"Created entry ID: {entry_id}, Status: {created.get('status')}")
            return entry_id
            
        except Exception as e:
            self.log_result("Test 8 - Create Journal Entry", False, f"Exception: {str(e)}")
            return False
    
    def test_journal_validation(self):
        """Test 9: POST /api/journal-entries (Invalid - Unbalanced) - Test validation"""
        print("Test 9: POST /api/journal-entries (Invalid - Unbalanced)")
        try:
            invalid_entry = {
                "transaction_id": "test-inv-002",
                "transaction_type": "Invoice",
                "entry_date": "2025-01-15T10:00:00Z",
                "description": "Test unbalanced journal entry",
                "line_items": [
                    {
                        "account": "Accounts Receivable",
                        "description": "Invoice INV-002",
                        "debit": 11800.00,
                        "credit": 0.00
                    },
                    {
                        "account": "Sales Revenue",
                        "description": "Revenue from INV-002",
                        "debit": 0.00,
                        "credit": 10000.00
                    }
                ],
                "total_debit": 11800.00,
                "total_credit": 10000.00  # Unbalanced!
            }
            
            response = self.session.post(f"{API_BASE}/journal-entries", json=invalid_entry, timeout=10)
            
            if response.status_code == 200:
                self.log_result("Test 9 - Validation", False, "Should have rejected unbalanced entry")
                return False
            elif response.status_code == 400:
                error_msg = response.text
                if 'debit' in error_msg.lower() and 'credit' in error_msg.lower():
                    self.log_result("Test 9 - Validation", True, "Correctly rejected unbalanced entry")
                    return True
                else:
                    self.log_result("Test 9 - Error Message", False, f"Error should mention debit/credit: {error_msg}")
                    return False
            else:
                self.log_result("Test 9 - Validation", False, f"Expected 400, got {response.status_code}")
                return False
            
        except Exception as e:
            self.log_result("Test 9 - Validation", False, f"Exception: {str(e)}")
            return False
    
    def test_journal_list(self, created_entry_id):
        """Test 10: GET /api/journal-entries - List all journal entries"""
        print("Test 10: GET /api/journal-entries")
        try:
            response = self.session.get(f"{API_BASE}/journal-entries", timeout=10)
            
            if response.status_code != 200:
                self.log_result("Test 10 - List Entries", False, f"Status: {response.status_code}")
                return False
            
            entries = response.json()
            if not isinstance(entries, list):
                self.log_result("Test 10 - Response Type", False, "Response should be a list")
                return False
            
            # Check if our created entry is in the list
            if created_entry_id:
                found = any(e.get('id') == created_entry_id for e in entries)
                if not found:
                    self.log_result("Test 10 - Contains Created", False, "Created entry not found in list")
                    return False
            
            self.log_result("Test 10 - List Entries", True, f"Retrieved {len(entries)} journal entries")
            return True
            
        except Exception as e:
            self.log_result("Test 10 - List Entries", False, f"Exception: {str(e)}")
            return False
    
    def test_journal_filter(self, created_entry_id):
        """Test 11: GET /api/journal-entries?transaction_id=test-inv-001 - Filter by transaction ID"""
        print("Test 11: GET /api/journal-entries?transaction_id=test-inv-001")
        try:
            response = self.session.get(f"{API_BASE}/journal-entries?transaction_id=test-inv-001", timeout=10)
            
            if response.status_code != 200:
                self.log_result("Test 11 - Filter by Transaction ID", False, f"Status: {response.status_code}")
                return False
            
            entries = response.json()
            if not isinstance(entries, list):
                self.log_result("Test 11 - Response Type", False, "Response should be a list")
                return False
            
            # Check all entries have correct transaction_id
            wrong_id = [e for e in entries if e.get('transaction_id') != 'test-inv-001']
            if wrong_id:
                self.log_result("Test 11 - Filter Validation", False, f"Found {len(wrong_id)} entries with wrong transaction_id")
                return False
            
            # Check if our created entry is in filtered results
            if created_entry_id:
                found = any(e.get('id') == created_entry_id for e in entries)
                if not found:
                    self.log_result("Test 11 - Contains Created", False, "Created entry not found in filtered results")
                    return False
            
            self.log_result("Test 11 - Filter by Transaction ID", True, f"Retrieved {len(entries)} entries for 'test-inv-001'")
            return True
            
        except Exception as e:
            self.log_result("Test 11 - Filter by Transaction ID", False, f"Exception: {str(e)}")
            return False
    
    def test_journal_get_single(self, created_entry_id):
        """Test 12: GET /api/journal-entries/{entry_id} - Get single journal entry by ID"""
        print("Test 12: GET /api/journal-entries/{entry_id}")
        try:
            if not created_entry_id:
                self.log_result("Test 12 - Get Single Entry", False, "No entry ID available for test")
                return False
            
            response = self.session.get(f"{API_BASE}/journal-entries/{created_entry_id}", timeout=10)
            
            if response.status_code != 200:
                self.log_result("Test 12 - Get Single Entry", False, f"Status: {response.status_code}")
                return False
            
            entry = response.json()
            if not isinstance(entry, dict):
                self.log_result("Test 12 - Response Type", False, "Response should be a single entry object")
                return False
            
            # Verify correct entry
            if entry.get('id') != created_entry_id:
                self.log_result("Test 12 - ID Validation", False, f"ID mismatch: expected {created_entry_id}, got {entry.get('id')}")
                return False
            
            # Check line items
            line_items = entry.get('line_items', [])
            if len(line_items) != 3:
                self.log_result("Test 12 - Line Items", False, f"Expected 3 line items, got {len(line_items)}")
                return False
            
            # Check totals
            total_debit = entry.get('total_debit', 0)
            total_credit = entry.get('total_credit', 0)
            if total_debit != 11800.00 or total_credit != 11800.00:
                self.log_result("Test 12 - Totals", False, f"Expected debit=11800, credit=11800, got debit={total_debit}, credit={total_credit}")
                return False
            
            self.log_result("Test 12 - Get Single Entry", True, f"Retrieved complete entry with {len(line_items)} line items")
            return True
            
        except Exception as e:
            self.log_result("Test 12 - Get Single Entry", False, f"Exception: {str(e)}")
            return False
    
    def test_journal_delete(self, created_entry_id):
        """Test 13: DELETE /api/journal-entries/{entry_id} - Delete journal entry"""
        print("Test 13: DELETE /api/journal-entries/{entry_id}")
        try:
            if not created_entry_id:
                self.log_result("Test 13 - Delete Entry", False, "No entry ID available for test")
                return False
            
            response = self.session.delete(f"{API_BASE}/journal-entries/{created_entry_id}", timeout=10)
            
            if response.status_code != 200:
                self.log_result("Test 13 - Delete Entry", False, f"Status: {response.status_code}")
                return False
            
            self.log_result("Test 13 - Delete Entry", True, "Entry deleted successfully")
            
            # Verify deletion
            verify_response = self.session.get(f"{API_BASE}/journal-entries/{created_entry_id}", timeout=10)
            
            if verify_response.status_code == 404:
                self.log_result("Test 13 - Delete Verification", True, "Entry properly deleted (404 response)")
                return True
            elif verify_response.status_code == 200:
                self.log_result("Test 13 - Delete Verification", False, "Entry still exists after deletion")
                return False
            else:
                self.log_result("Test 13 - Delete Verification", False, f"Unexpected status: {verify_response.status_code}")
                return False
            
        except Exception as e:
            self.log_result("Test 13 - Delete Entry", False, f"Exception: {str(e)}")
            return False
    
    def run_phase1_tests(self):
        """Run all Phase 1 tests (13 test cases)"""
        print("🚀 PHASE 1 TESTING: Category Master + Journal Entry APIs")
        print("=" * 70)
        
        # Authenticate first
        if not self.authenticate():
            print("❌ Authentication failed. Cannot proceed with tests.")
            return False
        
        print("=" * 70)
        print("📂 CATEGORY MASTER API TESTS (Tests 1-7)")
        print("-" * 40)
        
        # Category Master Tests (1-7)
        all_categories = self.test_categories_all()  # Test 1
        self.test_categories_operating()  # Test 2
        self.test_categories_inflow()  # Test 3
        self.test_categories_pl()  # Test 4
        self.test_categories_search()  # Test 5
        self.test_categories_specific(all_categories)  # Test 6
        self.test_categories_stats()  # Test 7
        
        print("=" * 70)
        print("📝 JOURNAL ENTRY API TESTS (Tests 8-13)")
        print("-" * 40)
        
        # Journal Entry Tests (8-13)
        created_entry_id = self.test_journal_create()  # Test 8
        self.test_journal_validation()  # Test 9
        self.test_journal_list(created_entry_id)  # Test 10
        self.test_journal_filter(created_entry_id)  # Test 11
        self.test_journal_get_single(created_entry_id)  # Test 12
        self.test_journal_delete(created_entry_id)  # Test 13
        
        # Print summary
        print("=" * 70)
        print("🏁 PHASE 1 TESTING COMPLETE")
        print(f"✅ Passed: {self.test_results['passed']}")
        print(f"❌ Failed: {self.test_results['failed']}")
        
        if self.test_results['errors']:
            print("\n🚨 FAILED TESTS:")
            for error in self.test_results['errors']:
                print(f"   • {error}")
        
        success_rate = (self.test_results['passed'] / (self.test_results['passed'] + self.test_results['failed'])) * 100
        print(f"\n📊 Success Rate: {success_rate:.1f}%")
        
        return self.test_results['failed'] == 0

if __name__ == "__main__":
    tester = Phase1Tester()
    success = tester.run_phase1_tests()
    sys.exit(0 if success else 1)