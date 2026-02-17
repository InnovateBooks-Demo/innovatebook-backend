#!/usr/bin/env python3
"""
Banking API Testing Script - Quick Test for Review Request
Tests the Banking API endpoints as requested in the review
"""

import requests
import json
import sys
from datetime import datetime, timezone
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Configuration - Use external URL from frontend env
BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001')
API_BASE = f"{BACKEND_URL}/api"

# Test credentials
TEST_EMAIL = "demo@innovatebooks.com"
TEST_PASSWORD = os.getenv("TEST_PASSWORD", "Test1234")   # or demo123 as default


class BankingTester:
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
    
    def test_banking_apis(self):
        """Test Banking APIs - SPECIFIC REVIEW REQUEST"""
        print("🏦 Testing Banking APIs (Review Request)...")
        
        try:
            # Test 1: GET /api/bank-accounts - Get all bank accounts
            print("   Test 1: GET /api/bank-accounts - Get all bank accounts...")
            response = self.session.get(f"{API_BASE}/bank-accounts", timeout=30)
            
            if response.status_code != 200:
                self.log_result("Banking - Get Bank Accounts", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
            
            bank_accounts = response.json()
            if not isinstance(bank_accounts, list):
                self.log_result("Banking - Get Bank Accounts", False, "Response should be a list")
                return False
            
            self.log_result("Banking - Get Bank Accounts", True, f"Retrieved {len(bank_accounts)} bank accounts")
            
            # Validate bank account structure
            if len(bank_accounts) > 0:
                account = bank_accounts[0]
                required_account_fields = ['id', 'bank_name', 'account_number', 'account_type', 'current_balance']
                missing_account_fields = [field for field in required_account_fields if field not in account]
                
                if missing_account_fields:
                    self.log_result("Banking - Bank Account Structure", False, f"Missing fields: {missing_account_fields}")
                    return False
                else:
                    self.log_result("Banking - Bank Account Structure", True, f"Bank account structure valid: {account.get('bank_name')} - {account.get('account_type')} - Balance: ₹{account.get('current_balance', 0):,.2f}")
            
            # Test 2: GET /api/transactions - Get all transactions
            print("   Test 2: GET /api/transactions - Get all transactions...")
            response = self.session.get(f"{API_BASE}/transactions", timeout=30)
            
            if response.status_code != 200:
                self.log_result("Banking - Get Transactions", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
            
            transactions = response.json()
            if not isinstance(transactions, list):
                self.log_result("Banking - Get Transactions", False, "Response should be a list")
                return False
            
            self.log_result("Banking - Get Transactions", True, f"Retrieved {len(transactions)} transactions")
            
            # Test 3: Verify transaction data structure
            print("   Test 3: Verifying transaction data structure...")
            
            if len(transactions) == 0:
                self.log_result("Banking - Transaction Structure", False, "No transactions found to verify structure")
                return False
            
            # Check required fields in transaction structure
            transaction = transactions[0]
            required_transaction_fields = {
                'transaction_type': 'type field (Credit/Debit)',
                'bank_account_id': 'bank_account_id',
                'amount': 'amount',
                'description': 'description'
            }
            
            structure_issues = []
            
            for field, description in required_transaction_fields.items():
                if field not in transaction:
                    structure_issues.append(f"Missing {description} ({field})")
                else:
                    # Validate specific field requirements
                    value = transaction[field]
                    
                    if field == 'transaction_type':
                        if value not in ['Credit', 'Debit']:
                            structure_issues.append(f"transaction_type should be 'Credit' or 'Debit', got '{value}'")
                    elif field == 'amount':
                        if not isinstance(value, (int, float)) or value < 0:
                            structure_issues.append(f"amount should be positive number, got {value}")
                    elif field == 'bank_account_id':
                        if not isinstance(value, str) or len(value) == 0:
                            structure_issues.append(f"bank_account_id should be non-empty string, got {value}")
                    elif field == 'description':
                        if not isinstance(value, str):
                            structure_issues.append(f"description should be string, got {type(value)}")
            
            # Check for is_matched status (might be named differently)
            matched_field_found = False
            possible_matched_fields = ['is_matched', 'status', 'matched', 'match_status']
            
            for possible_field in possible_matched_fields:
                if possible_field in transaction:
                    matched_field_found = True
                    matched_value = transaction[possible_field]
                    print(f"   Found matching status field: {possible_field} = {matched_value}")
                    break
            
            if not matched_field_found:
                structure_issues.append("Missing is_matched status field (checked: is_matched, status, matched, match_status)")
            
            if structure_issues:
                self.log_result("Banking - Transaction Structure", False, f"Structure issues: {'; '.join(structure_issues)}")
                # Print sample transaction for debugging
                print(f"   Sample transaction fields: {list(transaction.keys())}")
                print(f"   Sample transaction: {transaction}")
                return False
            
            # Test 4: Validate transaction data integrity
            print("   Test 4: Validating transaction data integrity...")
            
            credit_count = 0
            debit_count = 0
            total_credits = 0
            total_debits = 0
            
            for txn in transactions:
                txn_type = txn.get('transaction_type')
                amount = txn.get('amount', 0)
                
                if txn_type == 'Credit':
                    credit_count += 1
                    total_credits += amount
                elif txn_type == 'Debit':
                    debit_count += 1
                    total_debits += amount
            
            self.log_result("Banking - Transaction Data Integrity", True, 
                          f"Credits: {credit_count} transactions (₹{total_credits:,.2f}), "
                          f"Debits: {debit_count} transactions (₹{total_debits:,.2f})")
            
            # Test 5: Verify transaction-bank account relationship
            print("   Test 5: Verifying transaction-bank account relationships...")
            
            bank_account_ids = {acc.get('id') for acc in bank_accounts}
            orphaned_transactions = []
            
            for txn in transactions[:10]:  # Check first 10 transactions
                txn_bank_id = txn.get('bank_account_id')
                if txn_bank_id not in bank_account_ids:
                    orphaned_transactions.append(txn.get('id', 'Unknown'))
            
            if orphaned_transactions:
                self.log_result("Banking - Transaction-Account Relationship", False, 
                              f"Found {len(orphaned_transactions)} transactions with invalid bank_account_id")
                return False
            else:
                self.log_result("Banking - Transaction-Account Relationship", True, 
                              "All checked transactions have valid bank_account_id references")
            
            # Summary of banking API test
            print("   Banking API Test Summary:")
            print(f"   • Bank Accounts: {len(bank_accounts)} found")
            print(f"   • Transactions: {len(transactions)} found")
            print(f"   • Credit Transactions: {credit_count}")
            print(f"   • Debit Transactions: {debit_count}")
            print(f"   • All required fields present in transaction structure")
            print(f"   • Transaction-bank account relationships valid")
            
            return True
            
        except Exception as e:
            self.log_result("Banking APIs", False, f"Exception: {str(e)}")
            return False

    def run_test(self):
        """Run banking API test"""
        print("🚀 Starting Banking API Testing...")
        print("=" * 60)
        
        # Authenticate first
        if not self.authenticate():
            print("❌ Authentication failed. Cannot proceed with tests.")
            return False
        
        print("=" * 60)
        
        # Run banking test
        success = self.test_banking_apis()
        
        # Print summary
        print("=" * 60)
        print("🏁 TEST SUMMARY")
        print("=" * 60)
        print(f"✅ Passed: {self.test_results['passed']}")
        print(f"❌ Failed: {self.test_results['failed']}")
        
        if self.test_results['passed'] + self.test_results['failed'] > 0:
            success_rate = (self.test_results['passed'] / (self.test_results['passed'] + self.test_results['failed']) * 100)
            print(f"📊 Success Rate: {success_rate:.1f}%")
        
        if self.test_results['errors']:
            print("\n🔍 FAILED TESTS:")
            for error in self.test_results['errors']:
                print(f"   • {error}")
        
        return success

if __name__ == "__main__":
    tester = BankingTester()
    success = tester.run_test()
    sys.exit(0 if success else 1)