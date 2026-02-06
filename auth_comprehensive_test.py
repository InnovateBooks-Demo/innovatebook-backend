#!/usr/bin/env python3
"""
Comprehensive Authentication System Test
Tests the complete signup and login flow as specified in the review request
"""

import requests
import json
import time
import subprocess
import re

# Configuration
BACKEND_URL = "https://saas-finint.preview.emergentagent.com/api"

# Test data as specified in the review request
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

class ComprehensiveAuthTester:
    def __init__(self):
        self.session = requests.Session()
        self.access_token = None
        self.email_verification_code = None
        self.mobile_otp_code = None
        self.password_reset_code = None
        
    def log_test(self, test_name, success, details=""):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if details:
            print(f"   {details}")
        print()

    def get_verification_codes_from_logs(self):
        """Extract verification codes from backend logs"""
        try:
            result = subprocess.run(
                ["tail", "-n", "50", "/var/log/supervisor/backend.err.log"],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            log_content = result.stdout
            
            # Extract email verification code (most recent)
            email_matches = re.findall(r"📧 Email Verification Code for test@example\.com: (\d{6})", log_content)
            if email_matches:
                self.email_verification_code = email_matches[-1]  # Get the latest
                print(f"   📧 Found Email Code: {self.email_verification_code}")
            
            # Extract SMS OTP code (most recent)
            sms_matches = re.findall(r"📱 SMS OTP for \+919876543210: (\d{6})", log_content)
            if sms_matches:
                self.mobile_otp_code = sms_matches[-1]  # Get the latest
                print(f"   📱 Found SMS OTP: {self.mobile_otp_code}")
            
            # Extract password reset code (most recent)
            reset_matches = re.findall(r"🔐 Password Reset Code for test@example\.com: (\d{8})", log_content)
            if reset_matches:
                self.password_reset_code = reset_matches[-1]  # Get the latest
                print(f"   🔐 Found Reset Code: {self.password_reset_code}")
                
            return bool(self.email_verification_code and self.mobile_otp_code)
            
        except Exception as e:
            print(f"   ❌ Error reading logs: {str(e)}")
            return False

    def test_master_data_endpoints(self):
        """Test 1: Master Data Endpoints (Quick test)"""
        print("📋 TESTING MASTER DATA ENDPOINTS...")
        
        endpoints = ["user-roles", "industries", "countries"]
        all_passed = True
        
        for endpoint in endpoints:
            try:
                response = self.session.get(f"{BACKEND_URL}/auth/masters/{endpoint}", timeout=30)
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success") and data.get("data"):
                        print(f"   ✅ {endpoint}: {len(data['data'])} items")
                    else:
                        print(f"   ❌ {endpoint}: Invalid response")
                        all_passed = False
                else:
                    print(f"   ❌ {endpoint}: HTTP {response.status_code}")
                    all_passed = False
            except Exception as e:
                print(f"   ❌ {endpoint}: {str(e)}")
                all_passed = False
        
        self.log_test("Master Data Endpoints", all_passed, f"Tested {len(endpoints)} endpoints")
        return all_passed

    def test_complete_signup_flow(self):
        """Test 2: Complete Signup Flow (Main test)"""
        print("📝 TESTING COMPLETE SIGNUP FLOW...")
        
        # Step 1: Account Details
        print("   Step 1: Account Details...")
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
        
        response1 = self.session.post(f"{BACKEND_URL}/auth/signup/step1", json=step1_data, timeout=30)
        if response1.status_code not in [200, 201]:
            self.log_test("Signup Flow - Step 1", False, f"HTTP {response1.status_code}: {response1.text}")
            return False
        
        data1 = response1.json()
        if not (data1.get("success") and data1.get("step") == "step1_complete"):
            self.log_test("Signup Flow - Step 1", False, f"Invalid response: {data1}")
            return False
        
        print("   ✅ Step 1 completed")
        
        # Step 2: Company Details
        print("   Step 2: Company Details...")
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
        
        response2 = self.session.post(f"{BACKEND_URL}/auth/signup/step2", json=step2_data, timeout=30)
        if response2.status_code not in [200, 201]:
            self.log_test("Signup Flow - Step 2", False, f"HTTP {response2.status_code}: {response2.text}")
            return False
        
        data2 = response2.json()
        if not (data2.get("success") and data2.get("step") == "step2_complete"):
            self.log_test("Signup Flow - Step 2", False, f"Invalid response: {data2}")
            return False
        
        print("   ✅ Step 2 completed")
        
        # Step 3: Solutions Selection (triggers verification codes)
        print("   Step 3: Solutions Selection...")
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
        
        response3 = self.session.post(f"{BACKEND_URL}/auth/signup/step3", json=step3_data, timeout=30)
        if response3.status_code not in [200, 201]:
            self.log_test("Signup Flow - Step 3", False, f"HTTP {response3.status_code}: {response3.text}")
            return False
        
        data3 = response3.json()
        if not (data3.get("success") and data3.get("step") == "verification_pending"):
            self.log_test("Signup Flow - Step 3", False, f"Invalid response: {data3}")
            return False
        
        print("   ✅ Step 3 completed - Verification codes sent")
        
        # Extract verification codes from logs
        print("   Extracting verification codes from backend logs...")
        time.sleep(2)  # Wait for logs to be written
        
        if not self.get_verification_codes_from_logs():
            self.log_test("Signup Flow - Code Extraction", False, "Could not extract verification codes from logs")
            return False
        
        # Step 4: Verify Email
        print("   Step 4: Email Verification...")
        verify_email_data = {
            "email": TEST_USER_DATA["email"],
            "verification_code": self.email_verification_code
        }
        
        response4 = self.session.post(f"{BACKEND_URL}/auth/signup/verify-email", json=verify_email_data, timeout=30)
        if response4.status_code not in [200, 201]:
            self.log_test("Signup Flow - Email Verification", False, f"HTTP {response4.status_code}: {response4.text}")
            return False
        
        data4 = response4.json()
        if not data4.get("success"):
            self.log_test("Signup Flow - Email Verification", False, f"Invalid response: {data4}")
            return False
        
        print("   ✅ Email verified")
        
        # Step 5: Verify Mobile (completes signup)
        print("   Step 5: Mobile Verification...")
        verify_mobile_data = {
            "email": TEST_USER_DATA["email"],
            "otp_code": self.mobile_otp_code
        }
        
        response5 = self.session.post(f"{BACKEND_URL}/auth/signup/verify-mobile", json=verify_mobile_data, timeout=30)
        if response5.status_code not in [200, 201]:
            self.log_test("Signup Flow - Mobile Verification", False, f"HTTP {response5.status_code}: {response5.text}")
            return False
        
        data5 = response5.json()
        if not (data5.get("success") and data5.get("step") == "complete"):
            self.log_test("Signup Flow - Mobile Verification", False, f"Invalid response: {data5}")
            return False
        
        # Extract access token
        response_data = data5.get("data", {})
        self.access_token = response_data.get("access_token")
        user_data = response_data.get("user", {})
        
        if not self.access_token or user_data.get("email") != TEST_USER_DATA["email"]:
            self.log_test("Signup Flow - Token Extraction", False, "Missing access token or user data")
            return False
        
        print("   ✅ Mobile verified - Signup completed!")
        print(f"   📋 User ID: {user_data.get('id')}")
        print(f"   🔑 Access Token: {self.access_token[:20]}...")
        
        self.log_test("Complete Signup Flow", True, "All 5 steps completed successfully with access token")
        return True

    def test_login_flow(self):
        """Test 3: Login Flow"""
        print("🔐 TESTING LOGIN FLOW...")
        
        # Test successful login
        print("   Testing successful login...")
        login_data = {
            "email": TEST_USER_DATA["email"],
            "password": TEST_USER_DATA["password"],
            "remember_me": True
        }
        
        response = self.session.post(f"{BACKEND_URL}/auth/login", json=login_data, timeout=30)
        if response.status_code != 200:
            self.log_test("Login Flow - Success", False, f"HTTP {response.status_code}: {response.text}")
            return False
        
        data = response.json()
        if not (data.get("success") and data.get("access_token")):
            self.log_test("Login Flow - Success", False, f"Invalid response: {data}")
            return False
        
        # Update access token
        self.access_token = data.get("access_token")
        print("   ✅ Login successful")
        
        # Test wrong password
        print("   Testing wrong password...")
        wrong_login_data = {
            "email": TEST_USER_DATA["email"],
            "password": "WrongPassword123",
            "remember_me": False
        }
        
        response = self.session.post(f"{BACKEND_URL}/auth/login", json=wrong_login_data, timeout=30)
        if response.status_code != 401:
            self.log_test("Login Flow - Wrong Password", False, f"Expected 401, got {response.status_code}")
            return False
        
        print("   ✅ Wrong password correctly rejected")
        
        self.log_test("Login Flow", True, "Both success and failure scenarios working")
        return True

    def test_protected_routes(self):
        """Test 4: Protected Routes"""
        print("🔒 TESTING PROTECTED ROUTES...")
        
        if not self.access_token:
            self.log_test("Protected Routes", False, "No access token available")
            return False
        
        # Test with valid token
        print("   Testing with valid token...")
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        response = self.session.get(f"{BACKEND_URL}/auth/me", headers=headers, timeout=30)
        if response.status_code != 200:
            self.log_test("Protected Routes - With Token", False, f"HTTP {response.status_code}: {response.text}")
            return False
        
        data = response.json()
        if not (data.get("success") and data.get("user")):
            self.log_test("Protected Routes - With Token", False, f"Invalid response: {data}")
            return False
        
        user_data = data.get("user", {})
        if user_data.get("email") != TEST_USER_DATA["email"]:
            self.log_test("Protected Routes - With Token", False, "User data mismatch")
            return False
        
        print("   ✅ Valid token accepted")
        
        # Test without token
        print("   Testing without token...")
        response = self.session.get(f"{BACKEND_URL}/auth/me", timeout=30)
        if response.status_code not in [401, 403]:
            self.log_test("Protected Routes - Without Token", False, f"Expected 401/403, got {response.status_code}")
            return False
        
        print("   ✅ Request without token correctly rejected")
        
        self.log_test("Protected Routes", True, "Both authenticated and unauthenticated scenarios working")
        return True

    def test_password_reset(self):
        """Test 5: Password Reset"""
        print("🔑 TESTING PASSWORD RESET...")
        
        # Test forgot password
        print("   Testing forgot password...")
        forgot_data = {"email": TEST_USER_DATA["email"]}
        
        response = self.session.post(f"{BACKEND_URL}/auth/forgot-password", json=forgot_data, timeout=30)
        if response.status_code != 200:
            self.log_test("Password Reset - Forgot", False, f"HTTP {response.status_code}: {response.text}")
            return False
        
        data = response.json()
        if not data.get("success"):
            self.log_test("Password Reset - Forgot", False, f"Invalid response: {data}")
            return False
        
        print("   ✅ Forgot password request sent")
        
        # Extract reset code from logs
        print("   Extracting reset code from logs...")
        time.sleep(2)  # Wait for logs
        
        if not self.get_verification_codes_from_logs():
            # Try to get just the reset code
            try:
                result = subprocess.run(
                    ["tail", "-n", "20", "/var/log/supervisor/backend.err.log"],
                    capture_output=True,
                    text=True,
                    timeout=10
                )
                
                reset_matches = re.findall(r"🔐 Password Reset Code for test@example\.com: (\d{8})", result.stdout)
                if reset_matches:
                    self.password_reset_code = reset_matches[-1]
                    print(f"   🔐 Found Reset Code: {self.password_reset_code}")
                else:
                    self.log_test("Password Reset - Code Extraction", False, "Could not find reset code in logs")
                    return False
            except Exception as e:
                self.log_test("Password Reset - Code Extraction", False, f"Error reading logs: {str(e)}")
                return False
        
        # Test reset password
        print("   Testing reset password...")
        reset_data = {
            "email": TEST_USER_DATA["email"],
            "reset_code": self.password_reset_code,
            "new_password": "NewTest1234"
        }
        
        response = self.session.post(f"{BACKEND_URL}/auth/reset-password", json=reset_data, timeout=30)
        if response.status_code != 200:
            self.log_test("Password Reset - Reset", False, f"HTTP {response.status_code}: {response.text}")
            return False
        
        data = response.json()
        if not data.get("success"):
            self.log_test("Password Reset - Reset", False, f"Invalid response: {data}")
            return False
        
        print("   ✅ Password reset successful")
        
        self.log_test("Password Reset", True, "Both forgot and reset operations working")
        return True

    def run_all_tests(self):
        """Run all tests as specified in the review request"""
        print("🚀 COMPREHENSIVE AUTHENTICATION SYSTEM TESTING")
        print("=" * 60)
        print("Testing as specified in the review request:")
        print("1. Master Data Endpoints (Quick test)")
        print("2. Complete Signup Flow (Main test)")
        print("3. Login Flow")
        print("4. Protected Routes")
        print("5. Password Reset")
        print("=" * 60)
        
        tests = [
            ("Master Data Endpoints", self.test_master_data_endpoints),
            ("Complete Signup Flow", self.test_complete_signup_flow),
            ("Login Flow", self.test_login_flow),
            ("Protected Routes", self.test_protected_routes),
            ("Password Reset", self.test_password_reset)
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            try:
                if test_func():
                    passed += 1
                time.sleep(2)  # Pause between tests
            except Exception as e:
                self.log_test(test_name, False, f"Unexpected error: {str(e)}")
        
        # Final summary
        print("=" * 60)
        print("📊 FINAL TEST SUMMARY")
        print("=" * 60)
        print(f"🎯 OVERALL RESULT: {passed}/{total} tests passed")
        
        if passed == total:
            print("✅ ALL TESTS PASSED - Authentication System is fully functional!")
            print("\n🎉 SUCCESS CRITERIA MET:")
            print("   ✅ Master data endpoints working")
            print("   ✅ Complete signup flow (5 steps) working")
            print("   ✅ Login with correct/incorrect credentials working")
            print("   ✅ Protected routes with/without token working")
            print("   ✅ Password reset flow working")
            return True
        else:
            print(f"❌ {total - passed} TESTS FAILED - Issues need to be addressed")
            return False

def main():
    """Main function"""
    tester = ComprehensiveAuthTester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    exit(main())