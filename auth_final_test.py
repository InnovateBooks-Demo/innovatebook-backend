#!/usr/bin/env python3
"""
Final Comprehensive Authentication System Test
Tests the complete authentication system with a fresh user
"""

import requests
import json
import time
import subprocess
import re
import random

# Configuration
BACKEND_URL = "https://saas-finint.preview.emergentagent.com/api"

# Generate unique test data
RANDOM_ID = random.randint(1000, 9999)
TEST_USER_DATA = {
    "full_name": "Test User",
    "email": f"testuser{RANDOM_ID}@example.com",
    TEST_PASSWORD = os.getenv("TEST_PASSWORD", "Test1234")   # or demo123 as default
,
    "mobile": f"987654{RANDOM_ID}",
    "mobile_country_code": "+91",
    "role": "cfo",
    "company_name": f"Test Company {RANDOM_ID}",
    "industry": "saas_it",
    "company_size": "51_200"
}

def log_test(test_name, success, details=""):
    """Log test result"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status}: {test_name}")
    if details:
        print(f"   {details}")
    print()

def get_verification_codes_from_logs(email):
    """Extract verification codes from backend logs"""
    try:
        result = subprocess.run(
            ["tail", "-n", "100", "/var/log/supervisor/backend.err.log"],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        log_content = result.stdout
        
        # Extract email verification code (most recent for this email)
        email_pattern = f"📧 Email Verification Code for {re.escape(email)}: (\\d{{6}})"
        email_matches = re.findall(email_pattern, log_content)
        email_code = email_matches[-1] if email_matches else None
        
        # Extract SMS OTP code (most recent for this mobile)
        mobile = TEST_USER_DATA["mobile"]
        sms_pattern = f"📱 SMS OTP for \\+91{re.escape(mobile)}: (\\d{{6}})"
        sms_matches = re.findall(sms_pattern, log_content)
        sms_code = sms_matches[-1] if sms_matches else None
        
        # Extract password reset code (most recent for this email)
        reset_pattern = f"🔐 Password Reset Code for {re.escape(email)}: (\\d{{8}})"
        reset_matches = re.findall(reset_pattern, log_content)
        reset_code = reset_matches[-1] if reset_matches else None
        
        return email_code, sms_code, reset_code
        
    except Exception as e:
        print(f"   ❌ Error reading logs: {str(e)}")
        return None, None, None

def test_complete_authentication_flow():
    """Test the complete authentication flow"""
    print("🚀 TESTING COMPLETE AUTHENTICATION FLOW")
    print("=" * 60)
    print(f"Using test email: {TEST_USER_DATA['email']}")
    print("=" * 60)
    
    session = requests.Session()
    
    # Test 1: Master Data Endpoints
    print("📋 1. TESTING MASTER DATA ENDPOINTS...")
    
    endpoints = ["user-roles", "industries", "countries"]
    master_success = True
    
    for endpoint in endpoints:
        try:
            response = session.get(f"{BACKEND_URL}/auth/masters/{endpoint}", timeout=30)
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("data"):
                    print(f"   ✅ {endpoint}: {len(data['data'])} items")
                else:
                    print(f"   ❌ {endpoint}: Invalid response")
                    master_success = False
            else:
                print(f"   ❌ {endpoint}: HTTP {response.status_code}")
                master_success = False
        except Exception as e:
            print(f"   ❌ {endpoint}: {str(e)}")
            master_success = False
    
    log_test("Master Data Endpoints", master_success)
    
    # Test 2: Complete Signup Flow
    print("📝 2. TESTING COMPLETE SIGNUP FLOW...")
    
    # Step 1: Account Details
    step1_data = {
        "full_name": TEST_USER_DATA["full_name"],
        "email": TEST_USER_DATA["email"],
        "password": TEST_USER_DATA["password"],
        "mobile": TEST_USER_DATA["mobile"],
        "mobile_country_code": TEST_USER_DATA["mobile_country_code"],
        "role": TEST_USER_DATA["role"],
        "company_name": TEST_USER_DATA["company_name"],
        "industry": TEST_USER_DATA["industry"],
        "company_size": TEST_USER_DATA["company_size"],
        "referral_code": None,
        "agree_terms": True,
        "agree_privacy": True,
        "marketing_opt_in": False
    }
    
    response1 = session.post(f"{BACKEND_URL}/auth/signup/step1", json=step1_data, timeout=30)
    if response1.status_code not in [200, 201] or not response1.json().get("success"):
        log_test("Signup Flow", False, f"Step 1 failed: {response1.status_code} - {response1.text}")
        return False
    
    print("   ✅ Step 1: Account Details")
    
    # Step 2: Company Details
    step2_data = {
        "email": TEST_USER_DATA["email"],
        "country": "IN",
        "business_type": "private_limited",
        "website": "https://testcompany.com",
        "registered_address": "123 Test Street, Mumbai",
        "operating_address": None,
        "address_same_as_registered": True,
        "timezone": "Asia/Kolkata",
        "language": "en"
    }
    
    response2 = session.post(f"{BACKEND_URL}/auth/signup/step2", json=step2_data, timeout=30)
    if response2.status_code not in [200, 201] or not response2.json().get("success"):
        log_test("Signup Flow", False, f"Step 2 failed: {response2.status_code} - {response2.text}")
        return False
    
    print("   ✅ Step 2: Company Details")
    
    # Step 3: Solutions Selection
    step3_data = {
        "email": TEST_USER_DATA["email"],
        "solutions": {
            "commerce": True,
            "workforce": False,
            "capital": True,
            "operations": False,
            "finance": True
        },
        "insights_enabled": True
    }
    
    response3 = session.post(f"{BACKEND_URL}/auth/signup/step3", json=step3_data, timeout=30)
    if response3.status_code not in [200, 201] or not response3.json().get("success"):
        log_test("Signup Flow", False, f"Step 3 failed: {response3.status_code} - {response3.text}")
        return False
    
    print("   ✅ Step 3: Solutions Selection - Verification codes sent")
    
    # Extract verification codes
    time.sleep(2)  # Wait for logs
    email_code, sms_code, _ = get_verification_codes_from_logs(TEST_USER_DATA["email"])
    
    if not email_code or not sms_code:
        log_test("Signup Flow", False, "Could not extract verification codes from logs")
        return False
    
    print(f"   📧 Email Code: {email_code}")
    print(f"   📱 SMS Code: {sms_code}")
    
    # Step 4: Email Verification
    verify_email_data = {
        "email": TEST_USER_DATA["email"],
        "verification_code": email_code
    }
    
    response4 = session.post(f"{BACKEND_URL}/auth/signup/verify-email", json=verify_email_data, timeout=30)
    if response4.status_code not in [200, 201] or not response4.json().get("success"):
        log_test("Signup Flow", False, f"Email verification failed: {response4.status_code} - {response4.text}")
        return False
    
    print("   ✅ Step 4: Email Verification")
    
    # Step 5: Mobile Verification (completes signup)
    verify_mobile_data = {
        "email": TEST_USER_DATA["email"],
        "otp_code": sms_code
    }
    
    response5 = session.post(f"{BACKEND_URL}/auth/signup/verify-mobile", json=verify_mobile_data, timeout=30)
    if response5.status_code not in [200, 201]:
        log_test("Signup Flow", False, f"Mobile verification failed: {response5.status_code} - {response5.text}")
        return False
    
    data5 = response5.json()
    if not (data5.get("success") and data5.get("step") == "complete"):
        log_test("Signup Flow", False, f"Signup not completed: {data5}")
        return False
    
    # Extract access token
    signup_token = data5.get("data", {}).get("access_token")
    if not signup_token:
        log_test("Signup Flow", False, "No access token returned from signup")
        return False
    
    print("   ✅ Step 5: Mobile Verification - Signup completed!")
    log_test("Complete Signup Flow", True, "All 5 steps completed successfully")
    
    # Test 3: Login Flow
    print("🔐 3. TESTING LOGIN FLOW...")
    
    # Test successful login
    login_data = {
        "email": TEST_USER_DATA["email"],
        "password": TEST_USER_DATA["password"],
        "remember_me": True
    }
    
    response = session.post(f"{BACKEND_URL}/auth/login", json=login_data, timeout=30)
    if response.status_code != 200:
        log_test("Login Flow", False, f"Login failed: {response.status_code} - {response.text}")
        return False
    
    data = response.json()
    # Handle both auth_routes.py format (with "success") and server.py format (direct Token)
    if data.get("success"):
        access_token = data.get("access_token")
    elif data.get("access_token"):
        access_token = data.get("access_token")
    else:
        log_test("Login Flow", False, f"No access token in response: {data}")
        return False
    print("   ✅ Successful login")
    
    # Test wrong password
    wrong_login_data = {
        "email": TEST_USER_DATA["email"],
        "password": "WrongPassword123",
        "remember_me": False
    }
    
    response = session.post(f"{BACKEND_URL}/auth/login", json=wrong_login_data, timeout=30)
    if response.status_code != 401:
        log_test("Login Flow", False, f"Wrong password should return 401, got {response.status_code}")
        return False
    
    print("   ✅ Wrong password correctly rejected")
    log_test("Login Flow", True, "Both success and failure scenarios working")
    
    # Test 4: Protected Routes
    print("🔒 4. TESTING PROTECTED ROUTES...")
    
    # Test with valid token
    headers = {"Authorization": f"Bearer {access_token}"}
    response = session.get(f"{BACKEND_URL}/auth/me", headers=headers, timeout=30)
    
    if response.status_code != 200:
        log_test("Protected Routes", False, f"Protected route with token failed: {response.status_code} - {response.text}")
        return False
    
    data = response.json()
    user_data = data.get("user") if "user" in data else data
    
    if user_data.get("email") != TEST_USER_DATA["email"]:
        log_test("Protected Routes", False, f"User data mismatch: {user_data}")
        return False
    
    print("   ✅ Valid token accepted")
    
    # Test without token
    response = session.get(f"{BACKEND_URL}/auth/me", timeout=30)
    if response.status_code not in [401, 403]:
        log_test("Protected Routes", False, f"Request without token should return 401/403, got {response.status_code}")
        return False
    
    print("   ✅ Request without token correctly rejected")
    log_test("Protected Routes", True, "Both authenticated and unauthenticated scenarios working")
    
    # Test 5: Password Reset
    print("🔑 5. TESTING PASSWORD RESET...")
    
    # Test forgot password
    forgot_data = {"email": TEST_USER_DATA["email"]}
    response = session.post(f"{BACKEND_URL}/auth/forgot-password", json=forgot_data, timeout=30)
    
    if response.status_code != 200 or not response.json().get("success"):
        log_test("Password Reset", False, f"Forgot password failed: {response.status_code} - {response.text}")
        return False
    
    print("   ✅ Forgot password request sent")
    
    # Extract reset code
    time.sleep(2)  # Wait for logs
    _, _, reset_code = get_verification_codes_from_logs(TEST_USER_DATA["email"])
    
    if not reset_code:
        log_test("Password Reset", False, "Could not extract reset code from logs")
        return False
    
    print(f"   🔐 Reset Code: {reset_code}")
    
    # Test reset password
    reset_data = {
        "email": TEST_USER_DATA["email"],
        "reset_code": reset_code,
        "new_password": "NewTest1234"
    }
    
    response = session.post(f"{BACKEND_URL}/auth/reset-password", json=reset_data, timeout=30)
    if response.status_code != 200 or not response.json().get("success"):
        log_test("Password Reset", False, f"Reset password failed: {response.status_code} - {response.text}")
        return False
    
    print("   ✅ Password reset successful")
    log_test("Password Reset", True, "Both forgot and reset operations working")
    
    # Final Summary
    print("=" * 60)
    print("🎉 AUTHENTICATION SYSTEM TEST COMPLETE")
    print("=" * 60)
    print("✅ ALL TESTS PASSED - Authentication System is fully functional!")
    print("\n📋 SUCCESS CRITERIA MET:")
    print("   ✅ Master data endpoints working")
    print("   ✅ Complete signup flow (5 steps) working")
    print("   ✅ Login with correct/incorrect credentials working")
    print("   ✅ Protected routes with/without token working")
    print("   ✅ Password reset flow working")
    print("   ✅ Access token and user data returned correctly")
    print("   ✅ Verification codes generated and logged correctly")
    
    return True

def main():
    """Main function"""
    success = test_complete_authentication_flow()
    return 0 if success else 1

if __name__ == "__main__":
    exit(main())