#!/usr/bin/env python3
"""
Quick Backend Verification Script
Focus on authentication and invoice endpoints as requested in review
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

# Test credentials
TEST_EMAIL = "demo@innovatebooks.com"
TEST_PASSWORD = os.getenv("TEST_PASSWORD", "Test1234")   # or demo123 as default


def test_authentication():
    """Test POST /api/auth/login with demo credentials"""
    print("🔐 Testing Authentication Endpoint...")
    
    try:
        response = requests.post(
            f"{API_BASE}/auth/login",
            json={
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD
            },
            timeout=30
        )
        
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            access_token = data.get('access_token')
            user_email = data.get('user', {}).get('email', 'Unknown')
            
            print(f"   ✅ SUCCESS: Login successful")
            print(f"   User: {user_email}")
            print(f"   Token received: {'Yes' if access_token else 'No'}")
            
            return access_token
        else:
            print(f"   ❌ FAILED: {response.text}")
            return None
            
    except Exception as e:
        print(f"   ❌ EXCEPTION: {str(e)}")
        return None

def test_invoice_list(auth_token):
    """Test GET /api/invoices with valid auth token"""
    print("\n📄 Testing Invoice List Endpoint...")
    
    if not auth_token:
        print("   ❌ SKIPPED: No auth token available")
        return None
    
    try:
        headers = {'Authorization': f'Bearer {auth_token}'}
        response = requests.get(f"{API_BASE}/invoices", headers=headers, timeout=30)
        
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            invoices = response.json()
            
            if isinstance(invoices, list):
                print(f"   ✅ SUCCESS: Retrieved {len(invoices)} invoices")
                
                if len(invoices) > 0:
                    sample_invoice = invoices[0]
                    print(f"   Sample Invoice: {sample_invoice.get('invoice_number', 'Unknown')} - ₹{sample_invoice.get('total_amount', 0):,.2f}")
                    return invoices
                else:
                    print("   ⚠️  WARNING: No invoices found in database")
                    return []
            else:
                print(f"   ❌ FAILED: Response is not a list: {type(invoices)}")
                return None
        else:
            print(f"   ❌ FAILED: {response.text}")
            return None
            
    except Exception as e:
        print(f"   ❌ EXCEPTION: {str(e)}")
        return None

def test_invoice_details(auth_token, invoices):
    """Test GET /api/invoices/{id}/details endpoint"""
    print("\n📋 Testing Invoice Details Endpoint...")
    
    if not auth_token:
        print("   ❌ SKIPPED: No auth token available")
        return False
    
    if not invoices or len(invoices) == 0:
        print("   ❌ SKIPPED: No invoices available for testing")
        return False
    
    try:
        headers = {'Authorization': f'Bearer {auth_token}'}
        test_invoice = invoices[0]
        invoice_id = test_invoice.get('id')
        
        if not invoice_id:
            print("   ❌ FAILED: No invoice ID found")
            return False
        
        response = requests.get(f"{API_BASE}/invoices/{invoice_id}/details", headers=headers, timeout=30)
        
        print(f"   Status Code: {response.status_code}")
        print(f"   Testing Invoice ID: {invoice_id}")
        
        if response.status_code == 200:
            details = response.json()
            
            if 'invoice' in details:
                invoice_data = details['invoice']
                print(f"   ✅ SUCCESS: Retrieved details for {invoice_data.get('invoice_number', 'Unknown')}")
                print(f"   Amount: ₹{invoice_data.get('total_amount', 0):,.2f}")
                print(f"   Customer: {invoice_data.get('customer_name', 'Unknown')}")
                print(f"   Status: {invoice_data.get('status', 'Unknown')}")
                return True
            else:
                print(f"   ❌ FAILED: Missing 'invoice' field in response")
                return False
        else:
            print(f"   ❌ FAILED: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ EXCEPTION: {str(e)}")
        return False

def main():
    """Run quick backend verification"""
    print("🚀 QUICK BACKEND VERIFICATION")
    print("=" * 50)
    print("Testing authentication and invoice endpoints as requested")
    print()
    
    # Test 1: Authentication
    auth_token = test_authentication()
    
    # Test 2: Invoice List
    invoices = test_invoice_list(auth_token)
    
    # Test 3: Invoice Details
    details_success = test_invoice_details(auth_token, invoices)
    
    # Summary
    print("\n" + "=" * 50)
    print("📋 VERIFICATION SUMMARY")
    
    auth_status = "✅ PASS" if auth_token else "❌ FAIL"
    list_status = "✅ PASS" if invoices is not None else "❌ FAIL"
    details_status = "✅ PASS" if details_success else "❌ FAIL"
    
    print(f"Authentication (POST /api/auth/login): {auth_status}")
    print(f"Invoice List (GET /api/invoices): {list_status}")
    print(f"Invoice Details (GET /api/invoices/{{id}}/details): {details_status}")
    
    if auth_token and invoices is not None and details_success:
        print("\n🎉 BACKEND VERIFICATION: ALL TESTS PASSED")
        print("Backend is fully functional - authentication works and invoice data is accessible")
        if invoices and len(invoices) > 0:
            print(f"Database contains {len(invoices)} invoices as expected")
        return True
    else:
        print("\n⚠️  BACKEND VERIFICATION: SOME ISSUES FOUND")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)