#!/usr/bin/env python3
"""
Test script specifically for the fix invoice totals functionality
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

def test_fix_invoice_totals():
    """Test POST /api/admin/fix-invoice-totals endpoint"""
    print("🔧 Testing Fix Invoice Totals Endpoint...")
    
    session = authenticate()
    if not session:
        return False
    
    try:
        # Step 1: Get current state of INV-1860 before fix
        print("   Step 1: Getting current state of INV-1860 before fix...")
        response = session.get(f"{API_BASE}/invoices", timeout=30)
        
        if response.status_code != 200:
            print(f"❌ Failed to get invoices - Status: {response.status_code}")
            return False
        
        invoices_before = response.json()
        inv_1860_before = None
        
        for invoice in invoices_before:
            if invoice.get('invoice_number') == 'INV-1860':
                inv_1860_before = invoice
                break
        
        if not inv_1860_before:
            print("❌ Invoice INV-1860 not found before fix")
            return False
        
        print(f"   INV-1860 BEFORE FIX:")
        print(f"     Base Amount: ₹{inv_1860_before.get('base_amount', 0):,.2f}")
        print(f"     GST Amount: ₹{inv_1860_before.get('gst_amount', 0):,.2f}")
        print(f"     Total Amount: ₹{inv_1860_before.get('total_amount', 0):,.2f}")
        
        # Step 2: Call POST /api/admin/fix-invoice-totals endpoint
        print("   Step 2: Calling POST /api/admin/fix-invoice-totals endpoint...")
        response = session.post(f"{API_BASE}/admin/fix-invoice-totals", timeout=60)
        
        if response.status_code != 200:
            print(f"❌ Fix invoice totals failed - Status: {response.status_code}, Response: {response.text}")
            return False
        
        fix_result = response.json()
        
        # Step 3: Review the fixes made
        print("   Step 3: Reviewing fixes made...")
        
        success = fix_result.get('success', False)
        total_invoices = fix_result.get('total_invoices', 0)
        fixed_count = fix_result.get('fixed_count', 0)
        fixes = fix_result.get('fixes', [])
        
        if not success:
            print("❌ API returned success=false")
            return False
        
        print(f"✅ Fixed {fixed_count} out of {total_invoices} invoices")
        
        # Step 4: Check if INV-1860 was in the fixes
        print("   Step 4: Checking if INV-1860 was fixed...")
        
        inv_1860_fix = None
        for fix in fixes:
            if fix.get('invoice_number') == 'INV-1860':
                inv_1860_fix = fix
                break
        
        if inv_1860_fix:
            print(f"   INV-1860 FIX DETAILS:")
            print(f"     Old Total: ₹{inv_1860_fix.get('old_total', 0):,.2f}")
            print(f"     New Total: ₹{inv_1860_fix.get('new_total', 0):,.2f}")
            print(f"     Base: ₹{inv_1860_fix.get('base', 0):,.2f}")
            print(f"     GST: ₹{inv_1860_fix.get('gst', 0):,.2f}")
            
            # Verify the calculation
            expected_total = inv_1860_fix.get('base', 0) + inv_1860_fix.get('gst', 0)
            actual_new_total = inv_1860_fix.get('new_total', 0)
            
            if abs(actual_new_total - expected_total) < 0.01:
                print(f"✅ INV-1860 total correctly calculated: ₹{actual_new_total:,.2f}")
            else:
                print(f"❌ INV-1860 calculation error: Expected ₹{expected_total:,.2f}, got ₹{actual_new_total:,.2f}")
                return False
        else:
            # INV-1860 might not need fixing if it's already correct
            print("   INV-1860 was not in the fixes list - checking if it was already correct...")
            
            base_amount = inv_1860_before.get('base_amount', 0)
            gst_amount = inv_1860_before.get('gst_amount', 0)
            total_amount = inv_1860_before.get('total_amount', 0)
            expected_total = base_amount + gst_amount
            
            if abs(total_amount - expected_total) < 0.01:
                print(f"✅ INV-1860 was already correct: ₹{total_amount:,.2f}")
            else:
                print(f"❌ INV-1860 still has incorrect total: ₹{total_amount:,.2f}, expected: ₹{expected_total:,.2f}")
                return False
        
        # Step 5: Verify INV-1860 current state after fix
        print("   Step 5: Verifying INV-1860 current state after fix...")
        response = session.get(f"{API_BASE}/invoices", timeout=30)
        
        if response.status_code != 200:
            print(f"❌ Failed to get invoices after fix - Status: {response.status_code}")
            return False
        
        invoices_after = response.json()
        inv_1860_after = None
        
        for invoice in invoices_after:
            if invoice.get('invoice_number') == 'INV-1860':
                inv_1860_after = invoice
                break
        
        if not inv_1860_after:
            print("❌ Invoice INV-1860 not found after fix")
            return False
        
        print(f"   INV-1860 AFTER FIX:")
        print(f"     Base Amount: ₹{inv_1860_after.get('base_amount', 0):,.2f}")
        print(f"     GST Amount: ₹{inv_1860_after.get('gst_amount', 0):,.2f}")
        print(f"     Total Amount: ₹{inv_1860_after.get('total_amount', 0):,.2f}")
        
        # Verify the total is now correct
        base_after = inv_1860_after.get('base_amount', 0)
        gst_after = inv_1860_after.get('gst_amount', 0)
        total_after = inv_1860_after.get('total_amount', 0)
        expected_total_after = base_after + gst_after
        
        if abs(total_after - expected_total_after) < 0.01:
            print(f"✅ INV-1860 total is now correct: ₹{total_after:,.2f}")
        else:
            print(f"❌ INV-1860 total still incorrect after fix: ₹{total_after:,.2f}, expected: ₹{expected_total_after:,.2f}")
            return False
        
        # Step 6: Summary of all fixes
        print("   Step 6: Summary of all fixes applied...")
        
        if fixes:
            print(f"   SUMMARY OF FIXES APPLIED:")
            for i, fix in enumerate(fixes[:5]):  # Show first 5 fixes
                print(f"     {i+1}. {fix.get('invoice_number')}: ₹{fix.get('old_total', 0):,.2f} → ₹{fix.get('new_total', 0):,.2f}")
            
            if len(fixes) > 5:
                print(f"     ... and {len(fixes) - 5} more fixes")
        else:
            print("   No fixes were needed - all invoices already had correct totals")
        
        print(f"✅ Successfully fixed {fixed_count} invoice totals. INV-1860 verified correct.")
        
        return True
        
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Testing Fix Invoice Totals Functionality")
    print("=" * 50)
    
    success = test_fix_invoice_totals()
    
    print("=" * 50)
    if success:
        print("✅ TEST PASSED: Fix Invoice Totals functionality working correctly")
    else:
        print("❌ TEST FAILED: Fix Invoice Totals functionality has issues")
    
    sys.exit(0 if success else 1)