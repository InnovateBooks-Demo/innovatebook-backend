#!/usr/bin/env python3
"""
Simple test for fix invoice totals
"""

import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Configuration
BASE_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://saas-finint.preview.emergentagent.com')
API_BASE = f"{BASE_URL}/api"

def test_fix_invoice_totals():
    """Test the fix invoice totals endpoint"""
    print("🔧 Testing Fix Invoice Totals...")
    
    # Authenticate
    session = requests.Session()
    
    try:
        # Login
        response = session.post(
            f"{API_BASE}/auth/login",
            json={"email": "demo@innovatebooks.com", "password": "demo123"},
            timeout=10
        )
        
        if response.status_code != 200:
            print(f"❌ Login failed: {response.status_code}")
            return False
        
        token = response.json().get('access_token')
        session.headers.update({'Authorization': f'Bearer {token}'})
        print("✅ Authenticated successfully")
        
        # Call fix invoice totals
        print("   Calling fix invoice totals endpoint...")
        response = session.post(f"{API_BASE}/admin/fix-invoice-totals", timeout=30)
        
        if response.status_code != 200:
            print(f"❌ Fix invoice totals failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        result = response.json()
        print(f"✅ Fix invoice totals successful!")
        print(f"   Total invoices: {result.get('total_invoices', 0)}")
        print(f"   Fixed count: {result.get('fixed_count', 0)}")
        print(f"   Success: {result.get('success', False)}")
        
        # Show some fixes
        fixes = result.get('fixes', [])
        if fixes:
            print(f"   Sample fixes:")
            for i, fix in enumerate(fixes[:3]):
                print(f"     {i+1}. {fix.get('invoice_number')}: ₹{fix.get('old_total', 0):,.2f} → ₹{fix.get('new_total', 0):,.2f}")
        else:
            print("   No fixes needed - all invoices already correct")
        
        return True
        
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_fix_invoice_totals()
    print("=" * 50)
    if success:
        print("✅ TEST PASSED")
    else:
        print("❌ TEST FAILED")