"""
Comprehensive Backend Testing for IB Commerce Pay and Spend Modules
Tests all CRUD operations, status workflows, and data validation
"""

import requests
import json
from datetime import datetime, date, timedelta
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Configuration
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://saas-finint.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

# Test credentials
TEST_EMAIL = "demo@innovatebooks.com"
TEST_PASSWORD = os.getenv("TEST_PASSWORD", "Test1234")   # or demo123 as default


# Global token storage
auth_token = None


def print_section(title):
    """Print formatted section header"""
    print(f"\n{'='*80}")
    print(f"  {title}")
    print(f"{'='*80}\n")


def print_test(test_name, passed, details=""):
    """Print test result"""
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status}: {test_name}")
    if details:
        print(f"   Details: {details}")


def authenticate():
    """Authenticate and get JWT token"""
    global auth_token
    
    print_section("AUTHENTICATION")
    
    try:
        response = requests.post(
            f"{API_BASE}/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            auth_token = data.get('access_token')
            print_test("Login with demo credentials", True, f"Token received: {auth_token[:20]}...")
            return True
        else:
            print_test("Login with demo credentials", False, f"Status: {response.status_code}, Response: {response.text}")
            return False
            
    except Exception as e:
        print_test("Login with demo credentials", False, f"Exception: {str(e)}")
        return False


def get_headers():
    """Get authorization headers"""
    return {
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json"
    }


# ==================== PAY MODULE TESTS ====================

def test_pay_list_all():
    """Test GET /api/commerce/pay - List all payments"""
    print_section("PAY MODULE - Test 1: List All Payments")
    
    try:
        response = requests.get(
            f"{API_BASE}/commerce/pay",
            headers=get_headers(),
            timeout=10
        )
        
        if response.status_code == 200:
            payments = response.json()
            print_test("GET /api/commerce/pay", True, f"Retrieved {len(payments)} payments")
            
            # Check for seeded data
            payment_ids = [p.get('payment_id') for p in payments]
            expected_ids = [f"PAY-2025-{str(i).zfill(3)}" for i in range(1, 6)]
            
            found_seeded = [pid for pid in expected_ids if pid in payment_ids]
            print(f"   Seeded payments found: {found_seeded}")
            
            if len(payments) >= 5:
                print_test("Seeded data verification", True, f"Found {len(found_seeded)}/5 expected payments")
            else:
                print_test("Seeded data verification", False, f"Expected at least 5 payments, found {len(payments)}")
            
            # Display sample payment
            if payments:
                sample = payments[0]
                print(f"\n   Sample Payment:")
                print(f"   - Payment ID: {sample.get('payment_id')}")
                print(f"   - Vendor ID: {sample.get('vendor_id')}")
                print(f"   - Invoice Number: {sample.get('invoice_number')}")
                print(f"   - Amount: ₹{sample.get('invoice_amount', 0):,.2f}")
                print(f"   - Status: {sample.get('payment_status')}")
                print(f"   - Payment Method: {sample.get('payment_method')}")
            
            return True, payments
        else:
            print_test("GET /api/commerce/pay", False, f"Status: {response.status_code}, Response: {response.text[:200]}")
            return False, []
            
    except Exception as e:
        print_test("GET /api/commerce/pay", False, f"Exception: {str(e)}")
        return False, []


def test_pay_filter_by_status():
    """Test GET /api/commerce/pay?status=Draft - Filter by status"""
    print_section("PAY MODULE - Test 2: Filter Payments by Status")
    
    statuses_to_test = ["Draft", "Pending", "Approved", "Paid"]
    
    for status in statuses_to_test:
        try:
            response = requests.get(
                f"{API_BASE}/commerce/pay?status={status}",
                headers=get_headers(),
                timeout=10
            )
            
            if response.status_code == 200:
                payments = response.json()
                print_test(f"Filter by status={status}", True, f"Retrieved {len(payments)} payments")
                
                # Verify all payments have the correct status
                if payments:
                    all_correct = all(p.get('payment_status') == status for p in payments)
                    if all_correct:
                        print(f"   ✓ All payments have status '{status}'")
                    else:
                        print(f"   ✗ Some payments have incorrect status")
            else:
                print_test(f"Filter by status={status}", False, f"Status: {response.status_code}")
                
        except Exception as e:
            print_test(f"Filter by status={status}", False, f"Exception: {str(e)}")


def test_pay_get_details():
    """Test GET /api/commerce/pay/{payment_id} - Get payment details"""
    print_section("PAY MODULE - Test 3: Get Payment Details")
    
    # First get a payment ID
    try:
        response = requests.get(
            f"{API_BASE}/commerce/pay",
            headers=get_headers(),
            timeout=10
        )
        
        if response.status_code == 200 and response.json():
            payments = response.json()
            payment_id = payments[0].get('payment_id')
            
            # Get details
            detail_response = requests.get(
                f"{API_BASE}/commerce/pay/{payment_id}",
                headers=get_headers(),
                timeout=10
            )
            
            if detail_response.status_code == 200:
                payment = detail_response.json()
                print_test(f"GET /api/commerce/pay/{payment_id}", True, "Payment details retrieved")
                
                # Verify required fields
                required_fields = ['payment_id', 'vendor_id', 'invoice_number', 'invoice_amount', 
                                 'payment_status', 'payment_method', 'due_date']
                
                missing_fields = [field for field in required_fields if field not in payment]
                
                if not missing_fields:
                    print_test("Required fields verification", True, "All required fields present")
                    print(f"\n   Payment Details:")
                    print(f"   - Payment ID: {payment.get('payment_id')}")
                    print(f"   - Vendor ID: {payment.get('vendor_id')}")
                    print(f"   - Invoice Number: {payment.get('invoice_number')}")
                    print(f"   - Invoice Amount: ₹{payment.get('invoice_amount', 0):,.2f}")
                    print(f"   - Net Payable: ₹{payment.get('net_payable', 0):,.2f}")
                    print(f"   - Payment Status: {payment.get('payment_status')}")
                    print(f"   - Payment Method: {payment.get('payment_method')}")
                    print(f"   - Due Date: {payment.get('due_date')}")
                else:
                    print_test("Required fields verification", False, f"Missing fields: {missing_fields}")
                
                return True, payment_id
            else:
                print_test(f"GET /api/commerce/pay/{payment_id}", False, f"Status: {detail_response.status_code}")
                return False, None
        else:
            print_test("Get payment list for details test", False, "No payments available")
            return False, None
            
    except Exception as e:
        print_test("GET payment details", False, f"Exception: {str(e)}")
        return False, None


def test_pay_create():
    """Test POST /api/commerce/pay - Create new payment"""
    print_section("PAY MODULE - Test 4: Create New Payment")
    
    try:
        # Create test payment data
        test_payment = {
            "vendor_id": "VEND-2025-001",
            "invoice_id": "INV-TEST-001",
            "po_id": "PO-2025-001",
            "invoice_number": "VINV-TEST-001",
            "invoice_amount": 50000.00,
            "due_date": (date.today() + timedelta(days=30)).isoformat()
        }
        
        response = requests.post(
            f"{API_BASE}/commerce/pay",
            headers=get_headers(),
            json=test_payment,
            timeout=10
        )
        
        if response.status_code == 200:
            payment = response.json()
            print_test("POST /api/commerce/pay", True, f"Created payment: {payment.get('payment_id')}")
            
            # Verify payment was created with correct data
            if payment.get('invoice_amount') == test_payment['invoice_amount']:
                print_test("Payment amount verification", True, f"Amount: ₹{payment.get('invoice_amount'):,.2f}")
            else:
                print_test("Payment amount verification", False, f"Expected {test_payment['invoice_amount']}, got {payment.get('invoice_amount')}")
            
            if payment.get('payment_status') == 'Draft':
                print_test("Default status verification", True, "Status: Draft")
            else:
                print_test("Default status verification", False, f"Expected 'Draft', got {payment.get('payment_status')}")
            
            # Verify auto-generated payment_id format
            payment_id = payment.get('payment_id')
            if payment_id and payment_id.startswith('PAY-2025-'):
                print_test("Payment ID format", True, f"ID: {payment_id}")
            else:
                print_test("Payment ID format", False, f"Invalid format: {payment_id}")
            
            return True, payment_id
        else:
            print_test("POST /api/commerce/pay", False, f"Status: {response.status_code}, Response: {response.text[:200]}")
            return False, None
            
    except Exception as e:
        print_test("POST /api/commerce/pay", False, f"Exception: {str(e)}")
        return False, None


def test_pay_update(payment_id):
    """Test PUT /api/commerce/pay/{payment_id} - Update payment"""
    print_section("PAY MODULE - Test 5: Update Payment")
    
    if not payment_id:
        print_test("Update payment", False, "No payment ID provided")
        return False
    
    try:
        # Update payment data
        update_data = {
            "vendor_id": "VEND-2025-001",
            "invoice_id": "INV-TEST-001",
            "po_id": "PO-2025-001",
            "invoice_number": "VINV-TEST-001-UPDATED",
            "invoice_amount": 75000.00,
            "due_date": (date.today() + timedelta(days=45)).isoformat()
        }
        
        response = requests.put(
            f"{API_BASE}/commerce/pay/{payment_id}",
            headers=get_headers(),
            json=update_data,
            timeout=10
        )
        
        if response.status_code == 200:
            payment = response.json()
            print_test(f"PUT /api/commerce/pay/{payment_id}", True, "Payment updated")
            
            # Verify updates
            if payment.get('invoice_amount') == update_data['invoice_amount']:
                print_test("Amount update verification", True, f"New amount: ₹{payment.get('invoice_amount'):,.2f}")
            else:
                print_test("Amount update verification", False, f"Expected {update_data['invoice_amount']}, got {payment.get('invoice_amount')}")
            
            if payment.get('invoice_number') == update_data['invoice_number']:
                print_test("Invoice number update verification", True, f"New invoice: {payment.get('invoice_number')}")
            else:
                print_test("Invoice number update verification", False, f"Update not reflected")
            
            return True
        else:
            print_test(f"PUT /api/commerce/pay/{payment_id}", False, f"Status: {response.status_code}, Response: {response.text[:200]}")
            return False
            
    except Exception as e:
        print_test("PUT payment", False, f"Exception: {str(e)}")
        return False


def test_pay_status_workflow(payment_id):
    """Test PATCH /api/commerce/pay/{payment_id}/status - Status workflow"""
    print_section("PAY MODULE - Test 6: Payment Status Workflow")
    
    if not payment_id:
        print_test("Status workflow", False, "No payment ID provided")
        return False
    
    # Test status transitions: Draft → Pending → Approved → Paid → Reconciled
    statuses = ["Pending", "Approved", "Paid", "Reconciled"]
    
    for status in statuses:
        try:
            response = requests.patch(
                f"{API_BASE}/commerce/pay/{payment_id}/status?status={status}",
                headers=get_headers(),
                timeout=10
            )
            
            if response.status_code == 200:
                payment = response.json()
                current_status = payment.get('payment_status')
                
                if current_status == status:
                    print_test(f"Status transition to '{status}'", True, f"Current status: {current_status}")
                else:
                    print_test(f"Status transition to '{status}'", False, f"Expected '{status}', got '{current_status}'")
            else:
                print_test(f"Status transition to '{status}'", False, f"Status: {response.status_code}")
                
        except Exception as e:
            print_test(f"Status transition to '{status}'", False, f"Exception: {str(e)}")
    
    return True


def test_pay_delete(payment_id):
    """Test DELETE /api/commerce/pay/{payment_id} - Delete payment"""
    print_section("PAY MODULE - Test 7: Delete Payment")
    
    if not payment_id:
        print_test("Delete payment", False, "No payment ID provided")
        return False
    
    try:
        response = requests.delete(
            f"{API_BASE}/commerce/pay/{payment_id}",
            headers=get_headers(),
            timeout=10
        )
        
        if response.status_code == 200:
            print_test(f"DELETE /api/commerce/pay/{payment_id}", True, "Payment deleted")
            
            # Verify deletion
            verify_response = requests.get(
                f"{API_BASE}/commerce/pay/{payment_id}",
                headers=get_headers(),
                timeout=10
            )
            
            if verify_response.status_code == 404:
                print_test("Deletion verification", True, "Payment no longer exists (404)")
            else:
                print_test("Deletion verification", False, f"Payment still exists (Status: {verify_response.status_code})")
            
            return True
        else:
            print_test(f"DELETE /api/commerce/pay/{payment_id}", False, f"Status: {response.status_code}, Response: {response.text[:200]}")
            return False
            
    except Exception as e:
        print_test("DELETE payment", False, f"Exception: {str(e)}")
        return False


def test_pay_error_handling():
    """Test error handling for Pay module"""
    print_section("PAY MODULE - Test 8: Error Handling")
    
    # Test 404 for non-existent payment
    try:
        response = requests.get(
            f"{API_BASE}/commerce/pay/PAY-9999-999",
            headers=get_headers(),
            timeout=10
        )
        
        if response.status_code == 404:
            print_test("404 for non-existent payment", True, "Correct error response")
        else:
            print_test("404 for non-existent payment", False, f"Expected 404, got {response.status_code}")
            
    except Exception as e:
        print_test("404 error handling", False, f"Exception: {str(e)}")
    
    # Test validation error for invalid status
    try:
        # Get a valid payment first
        list_response = requests.get(f"{API_BASE}/commerce/pay", headers=get_headers(), timeout=10)
        if list_response.status_code == 200 and list_response.json():
            payment_id = list_response.json()[0].get('payment_id')
            
            response = requests.patch(
                f"{API_BASE}/commerce/pay/{payment_id}/status?status=InvalidStatus",
                headers=get_headers(),
                timeout=10
            )
            
            if response.status_code in [400, 422]:
                print_test("Validation error for invalid status", True, f"Status: {response.status_code}")
            else:
                print_test("Validation error for invalid status", False, f"Expected 400/422, got {response.status_code}")
                
    except Exception as e:
        print_test("Validation error handling", False, f"Exception: {str(e)}")


# ==================== SPEND MODULE TESTS ====================

def test_spend_list_all():
    """Test GET /api/commerce/spend - List all expenses"""
    print_section("SPEND MODULE - Test 1: List All Expenses")
    
    try:
        response = requests.get(
            f"{API_BASE}/commerce/spend",
            headers=get_headers(),
            timeout=10
        )
        
        if response.status_code == 200:
            spends = response.json()
            print_test("GET /api/commerce/spend", True, f"Retrieved {len(spends)} expenses")
            
            # Check for seeded data
            expense_ids = [s.get('expense_id') for s in spends]
            expected_ids = [f"EXP-2025-{str(i).zfill(3)}" for i in range(1, 6)]
            
            found_seeded = [eid for eid in expected_ids if eid in expense_ids]
            print(f"   Seeded expenses found: {found_seeded}")
            
            if len(spends) >= 5:
                print_test("Seeded data verification", True, f"Found {len(found_seeded)}/5 expected expenses")
            else:
                print_test("Seeded data verification", False, f"Expected at least 5 expenses, found {len(spends)}")
            
            # Display sample expense
            if spends:
                sample = spends[0]
                print(f"\n   Sample Expense:")
                print(f"   - Expense ID: {sample.get('expense_id')}")
                print(f"   - Expense Type: {sample.get('expense_type')}")
                print(f"   - Amount: ₹{sample.get('expense_amount', 0):,.2f}")
                print(f"   - Status: {sample.get('expense_status')}")
                print(f"   - Category Code: {sample.get('category_code')}")
                print(f"   - Cost Center: {sample.get('cost_center')}")
            
            return True, spends
        else:
            print_test("GET /api/commerce/spend", False, f"Status: {response.status_code}, Response: {response.text[:200]}")
            return False, []
            
    except Exception as e:
        print_test("GET /api/commerce/spend", False, f"Exception: {str(e)}")
        return False, []


def test_spend_filter_by_status():
    """Test GET /api/commerce/spend?status=Approved - Filter by status"""
    print_section("SPEND MODULE - Test 2: Filter Expenses by Status")
    
    statuses_to_test = ["Draft", "Submitted", "Approved", "Paid"]
    
    for status in statuses_to_test:
        try:
            response = requests.get(
                f"{API_BASE}/commerce/spend?status={status}",
                headers=get_headers(),
                timeout=10
            )
            
            if response.status_code == 200:
                spends = response.json()
                print_test(f"Filter by status={status}", True, f"Retrieved {len(spends)} expenses")
                
                # Verify all expenses have the correct status
                if spends:
                    all_correct = all(s.get('expense_status') == status for s in spends)
                    if all_correct:
                        print(f"   ✓ All expenses have status '{status}'")
                    else:
                        print(f"   ✗ Some expenses have incorrect status")
            else:
                print_test(f"Filter by status={status}", False, f"Status: {response.status_code}")
                
        except Exception as e:
            print_test(f"Filter by status={status}", False, f"Exception: {str(e)}")


def test_spend_get_details():
    """Test GET /api/commerce/spend/{expense_id} - Get expense details"""
    print_section("SPEND MODULE - Test 3: Get Expense Details")
    
    # First get an expense ID
    try:
        response = requests.get(
            f"{API_BASE}/commerce/spend",
            headers=get_headers(),
            timeout=10
        )
        
        if response.status_code == 200 and response.json():
            spends = response.json()
            expense_id = spends[0].get('expense_id')
            
            # Get details
            detail_response = requests.get(
                f"{API_BASE}/commerce/spend/{expense_id}",
                headers=get_headers(),
                timeout=10
            )
            
            if detail_response.status_code == 200:
                expense = detail_response.json()
                print_test(f"GET /api/commerce/spend/{expense_id}", True, "Expense details retrieved")
                
                # Verify required fields
                required_fields = ['expense_id', 'expense_type', 'expense_amount', 
                                 'expense_status', 'category_code', 'cost_center']
                
                missing_fields = [field for field in required_fields if field not in expense]
                
                if not missing_fields:
                    print_test("Required fields verification", True, "All required fields present")
                    print(f"\n   Expense Details:")
                    print(f"   - Expense ID: {expense.get('expense_id')}")
                    print(f"   - Expense Type: {expense.get('expense_type')}")
                    print(f"   - Amount: ₹{expense.get('expense_amount', 0):,.2f}")
                    print(f"   - Status: {expense.get('expense_status')}")
                    print(f"   - Category Code: {expense.get('category_code')}")
                    print(f"   - Cost Center: {expense.get('cost_center')}")
                else:
                    print_test("Required fields verification", False, f"Missing fields: {missing_fields}")
                
                return True, expense_id
            else:
                print_test(f"GET /api/commerce/spend/{expense_id}", False, f"Status: {detail_response.status_code}")
                return False, None
        else:
            print_test("Get expense list for details test", False, "No expenses available")
            return False, None
            
    except Exception as e:
        print_test("GET expense details", False, f"Exception: {str(e)}")
        return False, None


def test_spend_create():
    """Test POST /api/commerce/spend - Create new expense"""
    print_section("SPEND MODULE - Test 4: Create New Expense")
    
    try:
        # Create test expense data
        test_expense = {
            "expense_type": "Travel",
            "expense_amount": 5000.00,
            "category_code": "TRAVEL-001",
            "cost_center": "CC-SALES",
            "description": "Client meeting travel expense"
        }
        
        response = requests.post(
            f"{API_BASE}/commerce/spend",
            headers=get_headers(),
            json=test_expense,
            timeout=10
        )
        
        if response.status_code == 200:
            expense = response.json()
            print_test("POST /api/commerce/spend", True, f"Created expense: {expense.get('expense_id')}")
            
            # Verify expense was created with correct data
            if expense.get('expense_amount') == test_expense['expense_amount']:
                print_test("Expense amount verification", True, f"Amount: ₹{expense.get('expense_amount'):,.2f}")
            else:
                print_test("Expense amount verification", False, f"Expected {test_expense['expense_amount']}, got {expense.get('expense_amount')}")
            
            if expense.get('expense_type') == test_expense['expense_type']:
                print_test("Expense type verification", True, f"Type: {expense.get('expense_type')}")
            else:
                print_test("Expense type verification", False, f"Expected {test_expense['expense_type']}, got {expense.get('expense_type')}")
            
            # Verify auto-generated expense_id format
            expense_id = expense.get('expense_id')
            if expense_id and expense_id.startswith('EXP-2025-'):
                print_test("Expense ID format", True, f"ID: {expense_id}")
            else:
                print_test("Expense ID format", False, f"Invalid format: {expense_id}")
            
            return True, expense_id
        else:
            print_test("POST /api/commerce/spend", False, f"Status: {response.status_code}, Response: {response.text[:200]}")
            return False, None
            
    except Exception as e:
        print_test("POST /api/commerce/spend", False, f"Exception: {str(e)}")
        return False, None


def test_spend_update(expense_id):
    """Test PUT /api/commerce/spend/{expense_id} - Update expense"""
    print_section("SPEND MODULE - Test 5: Update Expense")
    
    if not expense_id:
        print_test("Update expense", False, "No expense ID provided")
        return False
    
    try:
        # Update expense data
        update_data = {
            "expense_type": "Travel",
            "expense_amount": 7500.00,
            "category_code": "TRAVEL-001",
            "cost_center": "CC-SALES",
            "description": "Client meeting travel expense - UPDATED"
        }
        
        response = requests.put(
            f"{API_BASE}/commerce/spend/{expense_id}",
            headers=get_headers(),
            json=update_data,
            timeout=10
        )
        
        if response.status_code == 200:
            expense = response.json()
            print_test(f"PUT /api/commerce/spend/{expense_id}", True, "Expense updated")
            
            # Verify updates
            if expense.get('expense_amount') == update_data['expense_amount']:
                print_test("Amount update verification", True, f"New amount: ₹{expense.get('expense_amount'):,.2f}")
            else:
                print_test("Amount update verification", False, f"Expected {update_data['expense_amount']}, got {expense.get('expense_amount')}")
            
            return True
        else:
            print_test(f"PUT /api/commerce/spend/{expense_id}", False, f"Status: {response.status_code}, Response: {response.text[:200]}")
            return False
            
    except Exception as e:
        print_test("PUT expense", False, f"Exception: {str(e)}")
        return False


def test_spend_status_workflow(expense_id):
    """Test PATCH /api/commerce/spend/{expense_id}/status - Status workflow"""
    print_section("SPEND MODULE - Test 6: Expense Status Workflow")
    
    if not expense_id:
        print_test("Status workflow", False, "No expense ID provided")
        return False
    
    # Test status transitions: Draft → Submitted → Approved → Paid
    statuses = ["Submitted", "Approved", "Paid"]
    
    for status in statuses:
        try:
            response = requests.patch(
                f"{API_BASE}/commerce/spend/{expense_id}/status?status={status}",
                headers=get_headers(),
                timeout=10
            )
            
            if response.status_code == 200:
                expense = response.json()
                current_status = expense.get('expense_status')
                
                if current_status == status:
                    print_test(f"Status transition to '{status}'", True, f"Current status: {current_status}")
                else:
                    print_test(f"Status transition to '{status}'", False, f"Expected '{status}', got '{current_status}'")
            else:
                print_test(f"Status transition to '{status}'", False, f"Status: {response.status_code}")
                
        except Exception as e:
            print_test(f"Status transition to '{status}'", False, f"Exception: {str(e)}")
    
    return True


def test_spend_delete(expense_id):
    """Test DELETE /api/commerce/spend/{expense_id} - Delete expense"""
    print_section("SPEND MODULE - Test 7: Delete Expense")
    
    if not expense_id:
        print_test("Delete expense", False, "No expense ID provided")
        return False
    
    try:
        response = requests.delete(
            f"{API_BASE}/commerce/spend/{expense_id}",
            headers=get_headers(),
            timeout=10
        )
        
        if response.status_code == 200:
            print_test(f"DELETE /api/commerce/spend/{expense_id}", True, "Expense deleted")
            
            # Verify deletion
            verify_response = requests.get(
                f"{API_BASE}/commerce/spend/{expense_id}",
                headers=get_headers(),
                timeout=10
            )
            
            if verify_response.status_code == 404:
                print_test("Deletion verification", True, "Expense no longer exists (404)")
            else:
                print_test("Deletion verification", False, f"Expense still exists (Status: {verify_response.status_code})")
            
            return True
        else:
            print_test(f"DELETE /api/commerce/spend/{expense_id}", False, f"Status: {response.status_code}, Response: {response.text[:200]}")
            return False
            
    except Exception as e:
        print_test("DELETE expense", False, f"Exception: {str(e)}")
        return False


def test_spend_error_handling():
    """Test error handling for Spend module"""
    print_section("SPEND MODULE - Test 8: Error Handling")
    
    # Test 404 for non-existent expense
    try:
        response = requests.get(
            f"{API_BASE}/commerce/spend/EXP-9999-999",
            headers=get_headers(),
            timeout=10
        )
        
        if response.status_code == 404:
            print_test("404 for non-existent expense", True, "Correct error response")
        else:
            print_test("404 for non-existent expense", False, f"Expected 404, got {response.status_code}")
            
    except Exception as e:
        print_test("404 error handling", False, f"Exception: {str(e)}")
    
    # Test validation error for invalid status
    try:
        # Get a valid expense first
        list_response = requests.get(f"{API_BASE}/commerce/spend", headers=get_headers(), timeout=10)
        if list_response.status_code == 200 and list_response.json():
            expense_id = list_response.json()[0].get('expense_id')
            
            response = requests.patch(
                f"{API_BASE}/commerce/spend/{expense_id}/status?status=InvalidStatus",
                headers=get_headers(),
                timeout=10
            )
            
            if response.status_code in [400, 422]:
                print_test("Validation error for invalid status", True, f"Status: {response.status_code}")
            else:
                print_test("Validation error for invalid status", False, f"Expected 400/422, got {response.status_code}")
                
    except Exception as e:
        print_test("Validation error handling", False, f"Exception: {str(e)}")


# ==================== MAIN TEST EXECUTION ====================

def main():
    """Main test execution"""
    print("\n" + "="*80)
    print("  IB COMMERCE PAY AND SPEND MODULES - COMPREHENSIVE BACKEND TESTING")
    print("="*80)
    print(f"\n  Backend URL: {BACKEND_URL}")
    print(f"  Test User: {TEST_EMAIL}")
    print(f"  Test Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Authenticate
    if not authenticate():
        print("\n❌ AUTHENTICATION FAILED - Cannot proceed with tests")
        return
    
    # ==================== PAY MODULE TESTS ====================
    
    # Test 1: List all payments
    success, payments = test_pay_list_all()
    
    # Test 2: Filter by status
    test_pay_filter_by_status()
    
    # Test 3: Get payment details
    success, payment_id = test_pay_get_details()
    
    # Test 4: Create new payment
    success, new_payment_id = test_pay_create()
    
    # Test 5: Update payment
    if new_payment_id:
        test_pay_update(new_payment_id)
    
    # Test 6: Status workflow
    if new_payment_id:
        test_pay_status_workflow(new_payment_id)
    
    # Test 7: Delete payment
    if new_payment_id:
        test_pay_delete(new_payment_id)
    
    # Test 8: Error handling
    test_pay_error_handling()
    
    # ==================== SPEND MODULE TESTS ====================
    
    # Test 1: List all expenses
    success, spends = test_spend_list_all()
    
    # Test 2: Filter by status
    test_spend_filter_by_status()
    
    # Test 3: Get expense details
    success, expense_id = test_spend_get_details()
    
    # Test 4: Create new expense
    success, new_expense_id = test_spend_create()
    
    # Test 5: Update expense
    if new_expense_id:
        test_spend_update(new_expense_id)
    
    # Test 6: Status workflow
    if new_expense_id:
        test_spend_status_workflow(new_expense_id)
    
    # Test 7: Delete expense
    if new_expense_id:
        test_spend_delete(new_expense_id)
    
    # Test 8: Error handling
    test_spend_error_handling()
    
    # ==================== FINAL SUMMARY ====================
    
    print_section("TESTING COMPLETE")
    print("✅ All Pay and Spend module tests executed")
    print("\nRefer to the detailed output above for individual test results.")


if __name__ == "__main__":
    main()
