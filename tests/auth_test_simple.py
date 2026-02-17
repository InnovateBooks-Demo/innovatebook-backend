#!/usr/bin/env python3
"""
Simple Authentication Test with Real Verification Codes
"""

import requests
import json

# Configuration
BACKEND_URL = "https://saas-finint.preview.emergentagent.com/api"

# Test data
TEST_USER_DATA = {
    "full_name": "Test User",
    "email": "test@example.com",
    TEST_PASSWORD = os.getenv("TEST_PASSWORD", "Test1234")   # or demo123 as default
,
    "mobile": "9876543210",
    "mobile_country_code": "+91",
    "role": "cfo",
    "company_name": "Test Company",
    "industry": "saas_it",
    "company_size": "51_200"
}

# Verification codes from logs
EMAIL_CODE = "858401"
SMS_OTP = "902904"

def test_email_verification():
    """Test email verification with real code"""
    print("📧 Testing Email Verification...")
    
    verify_data = {
        "email": TEST_USER_DATA["email"],
        "verification_code": EMAIL_CODE
    }
    
    response = requests.post(
        f"{BACKEND_URL}/auth/signup/verify-email",
        json=verify_data,
        timeout=30
    )
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 200

def test_mobile_verification():
    """Test mobile verification with real code"""
    print("\n📱 Testing Mobile Verification...")
    
    verify_data = {
        "email": TEST_USER_DATA["email"],
        "otp_code": SMS_OTP
    }
    
    response = requests.post(
        f"{BACKEND_URL}/auth/signup/verify-mobile",
        json=verify_data,
        timeout=30
    )
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 200:
        data = response.json()
        if data.get("success") and data.get("data", {}).get("access_token"):
            return data["data"]["access_token"]
    
    return None

def test_login():
    """Test login with created user"""
    print("\n🔐 Testing Login...")
    
    login_data = {
        "email": TEST_USER_DATA["email"],
        "password": TEST_USER_DATA["password"],
        "remember_me": True
    }
    
    response = requests.post(
        f"{BACKEND_URL}/auth/login",
        json=login_data,
        timeout=30
    )
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 200:
        data = response.json()
        if data.get("success") and data.get("access_token"):
            return data["access_token"]
    
    return None

def test_protected_route(token):
    """Test protected route with token"""
    print("\n🔒 Testing Protected Route...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(
        f"{BACKEND_URL}/auth/me",
        headers=headers,
        timeout=30
    )
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 200

def main():
    print("🚀 SIMPLE AUTHENTICATION TEST")
    print("=" * 50)
    
    # Test email verification
    email_success = test_email_verification()
    
    # Test mobile verification (should complete signup)
    access_token = test_mobile_verification()
    
    # Test login
    if not access_token:
        access_token = test_login()
    
    # Test protected route
    if access_token:
        protected_success = test_protected_route(access_token)
        
        print("\n📊 SUMMARY:")
        print(f"Email Verification: {'✅' if email_success else '❌'}")
        print(f"Mobile Verification: {'✅' if access_token else '❌'}")
        print(f"Protected Route: {'✅' if protected_success else '❌'}")
    else:
        print("\n❌ Could not get access token")

if __name__ == "__main__":
    main()