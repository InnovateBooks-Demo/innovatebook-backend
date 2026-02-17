#!/usr/bin/env python3
"""
Focused test for INV-1860 current state verification
"""

import requests
import json
import sys
from datetime import datetime, timezone
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Configuration
BASE_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://saas-finint.preview.emergentagent.com')
API_BASE = f"{BASE_URL}/api"

# Test credentials
TEST_EMAIL = "demo@innovatebooks.com"
TEST_PASSWORD = os.getenv("TEST_PASSWORD", "Test1234")   # or demo123 as default


def authenticate():
    """Authenticate and get JWT token"""
    print("🔐 Authenticating...")
    
    session = requests.Session()
    
    try:
        response = session.post(
            f"{API_BASE}/auth/login",
            json={
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD
            },
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            auth_token = data.get('access_token')
            session.headers.update({
                'Authorization': f'Bearer {auth_token}'
            })
            print(f"✅ Logged in as {data.get('user', {}).get('email', 'Unknown')}")
            return session
        else:
            print(f"❌ Authentication failed - Status: {response.status_code}, Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Authentication exception: {str(e)}")
        return None

def test_inv_1860_current_state():
    """Test current state of INV-1860 - SPECIFIC REVIEW REQUEST"""
    print("🔍 VERIFYING INV-1860 CURRENT STATE (Review Request)...")
    
    # Authenticate
    session = authenticate()
    if not session:
        return False
    
    try:
        # Step 1: Get list of invoices to find INV-1860
        print("   Step 1: Searching for invoice INV-1860...")
        response = session.get(f"{API_BASE}/invoices", timeout=30)
        
        if response.status_code != 200:
            print(f"❌ Failed to get invoice list - Status: {response.status_code}, Response: {response.text}")
            return False
        
        invoices = response.json()
        if not isinstance(invoices, list):
            print("❌ Response should be a list")
            return False
        
        # Find INV-1860 specifically
        inv_1860 = None
        for invoice in invoices:
            if invoice.get('invoice_number') == 'INV-1860':
                inv_1860 = invoice
                break
        
        if not inv_1860:
            print("❌ Invoice INV-1860 not found in database")
            return False
        
        print(f"✅ Found invoice INV-1860 with ID: {inv_1860.get('id')}")
        
        # Step 2: Get detailed data for INV-1860 using GET /api/invoices/{id}/details
        print("   Step 2: Getting INV-1860 details via GET /api/invoices/{id}/details...")
        invoice_id = inv_1860.get('id')
        
        response = session.get(f"{API_BASE}/invoices/{invoice_id}/details", timeout=30)
        
        if response.status_code != 200:
            print(f"❌ Failed to get invoice details - Status: {response.status_code}, Response: {response.text}")
            return False
        
        details = response.json()
        invoice_data = details.get('invoice', {})
        
        # Step 3: Check the CURRENT values as requested in review
        print("   Step 3: Checking CURRENT values for INV-1860...")
        
        base_amount = invoice_data.get('base_amount', 0)
        gst_amount = invoice_data.get('gst_amount', 0)
        total_amount = invoice_data.get('total_amount', 0)
        
        print(f"   🔍 CURRENT VALUES FOR INV-1860:")
        print(f"     Base Amount: ₹{base_amount:,.2f}")
        print(f"     GST Amount: ₹{gst_amount:,.2f}")
        print(f"     Total Amount: ₹{total_amount:,.2f}")
        
        # Expected values from review request
        expected_base = 1155000.0    # 11,55,000
        expected_gst = 207900.0      # 2,07,900
        expected_total = 1362900.0   # 13,62,900
        wrong_total = 75000.0        # What user reported as wrong
        
        # Step 4: Verify if fix persisted
        print("   Step 4: Verifying if fix script worked...")
        
        verification_results = []
        
        # Check base amount
        if abs(base_amount - expected_base) < 1:
            verification_results.append(f"✅ Base amount correct: ₹{base_amount:,.2f} (expected ₹{expected_base:,.2f})")
        else:
            verification_results.append(f"❌ Base amount incorrect: ₹{base_amount:,.2f} (expected ₹{expected_base:,.2f})")
        
        # Check GST amount
        if abs(gst_amount - expected_gst) < 1:
            verification_results.append(f"✅ GST amount correct: ₹{gst_amount:,.2f} (expected ₹{expected_gst:,.2f})")
        else:
            verification_results.append(f"❌ GST amount incorrect: ₹{gst_amount:,.2f} (expected ₹{expected_gst:,.2f})")
        
        # Check total amount - THIS IS THE KEY CHECK
        if abs(total_amount - expected_total) < 1:
            verification_results.append(f"✅ Total amount FIXED: ₹{total_amount:,.2f} (expected ₹{expected_total:,.2f})")
            fix_status = "FIXED"
        elif abs(total_amount - wrong_total) < 1:
            verification_results.append(f"❌ Total amount STILL WRONG: ₹{total_amount:,.2f} (should be ₹{expected_total:,.2f})")
            fix_status = "NOT FIXED"
        else:
            verification_results.append(f"❓ Total amount unexpected: ₹{total_amount:,.2f} (expected ₹{expected_total:,.2f}, user reported ₹{wrong_total:,.2f})")
            fix_status = "UNKNOWN STATE"
        
        # Print all verification results
        print("   📊 VERIFICATION RESULTS:")
        for result in verification_results:
            print(f"     {result}")
        
        # Step 5: If wrong, check raw invoice record
        if fix_status != "FIXED":
            print("   Step 5: Issue detected - checking raw invoice record...")
            
            # Additional debugging info
            net_receivable = invoice_data.get('net_receivable', 0)
            amount_received = invoice_data.get('amount_received', 0)
            balance_due = invoice_data.get('balance_due', 0)
            status = invoice_data.get('status', '')
            tds_amount = invoice_data.get('tds_amount', 0)
            
            print(f"     Additional fields:")
            print(f"       TDS Amount: ₹{tds_amount:,.2f}")
            print(f"       Net Receivable: ₹{net_receivable:,.2f}")
            print(f"       Amount Received: ₹{amount_received:,.2f}")
            print(f"       Balance Due: ₹{balance_due:,.2f}")
            print(f"       Status: {status}")
            
            # Check if this is a cache issue or database issue
            expected_net_receivable = expected_total - tds_amount
            if abs(net_receivable - expected_net_receivable) > 1:
                print(f"     🚨 Net receivable also wrong: ₹{net_receivable:,.2f} (should be ₹{expected_net_receivable:,.2f})")
                print(f"     💡 This suggests database was NOT updated by fix script")
            else:
                print(f"     ✅ Net receivable correct: ₹{net_receivable:,.2f}")
                print(f"     💡 This suggests only total_amount field has issue")
        
        # Step 6: Final determination
        if fix_status == "FIXED":
            print(f"✅ CONCLUSION: FIX SUCCESSFUL - Total amount is now correct (₹{total_amount:,.2f})")
            return True
        else:
            error_msg = f"❌ CONCLUSION: FIX FAILED - Total amount still shows ₹{total_amount:,.2f} instead of ₹{expected_total:,.2f}"
            if fix_status == "NOT FIXED":
                error_msg += " - Database was not updated by fix script"
            print(error_msg)
            return False
        
    except Exception as e:
        print(f"❌ Exception during test: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Starting INV-1860 Current State Verification...")
    print(f"📍 Testing against: {API_BASE}")
    print("=" * 60)
    
    success = test_inv_1860_current_state()
    
    print("=" * 60)
    if success:
        print("✅ TEST PASSED: INV-1860 is in correct state")
        sys.exit(0)
    else:
        print("❌ TEST FAILED: INV-1860 has issues")
        sys.exit(1)