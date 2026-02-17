#!/usr/bin/env python3
"""
Manufacturing Lead Module - Approval Workflow Fix Verification
Testing the 4 previously failing tests to verify the fixes
"""

import requests
import json
import sys
from datetime import datetime, timezone
import time

# Configuration
BACKEND_URL = "https://saas-finint.preview.emergentagent.com/api"
TEST_CREDENTIALS = {
    "email": "demo@innovatebooks.com",
    "password": "Demo1234"
}

class ManufacturingApprovalTester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.results = []
        
    def log_result(self, test_name, success, details="", response_data=None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = {
            "test": test_name,
            "status": status,
            "details": details,
            "response_data": response_data
        }
        self.results.append(result)
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        if not success and response_data:
            print(f"   Response: {response_data}")
        print()

    def authenticate(self):
        """Authenticate and get JWT token"""
        try:
            print("🔐 AUTHENTICATING...")
            response = self.session.post(
                f"{BACKEND_URL}/auth/login",
                json=TEST_CREDENTIALS,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data.get("access_token")
                self.session.headers.update({
                    "Authorization": f"Bearer {self.auth_token}"
                })
                self.log_result(
                    "Authentication", 
                    True, 
                    f"Successfully logged in as {TEST_CREDENTIALS['email']}"
                )
                return True
            else:
                self.log_result(
                    "Authentication", 
                    False, 
                    f"Login failed with status {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_result("Authentication", False, f"Exception: {str(e)}")
            return False

    def test_stage_transition(self):
        """Test PATCH /api/manufacturing/leads/MFGL-2025-0001/stage - Stage transition with relaxed validation"""
        try:
            print("🔄 TESTING STAGE TRANSITION...")
            
            lead_id = "MFGL-2025-0001"
            transition_data = {
                "to_stage": "Feasibility",
                "notes": "Moving to feasibility check"
            }
            
            response = self.session.patch(
                f"{BACKEND_URL}/manufacturing/leads/{lead_id}/stage",
                json=transition_data,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify response structure
                if not data.get("success"):
                    self.log_result(
                        "Stage Transition", 
                        False, 
                        "Response success field is False",
                        data
                    )
                    return False
                
                # Verify stage was updated
                lead_data = data.get("lead", {})
                if lead_data.get("current_stage") != "Feasibility":
                    self.log_result(
                        "Stage Transition", 
                        False, 
                        f"Expected stage 'Feasibility', got '{lead_data.get('current_stage')}'",
                        data
                    )
                    return False
                
                self.log_result(
                    "Stage Transition", 
                    True, 
                    f"Stage successfully transitioned to Feasibility with relaxed validation"
                )
                return True
                
            else:
                self.log_result(
                    "Stage Transition", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_result("Stage Transition", False, f"Exception: {str(e)}")
            return False

    def test_approval_submission(self):
        """Test POST /api/manufacturing/leads/MFGL-2025-0001/approvals/submit - Submit for approvals"""
        try:
            print("📝 TESTING APPROVAL SUBMISSION...")
            
            lead_id = "MFGL-2025-0001"
            approval_data = {
                "approval_types": ["Technical", "Pricing"]
            }
            
            response = self.session.post(
                f"{BACKEND_URL}/manufacturing/leads/{lead_id}/approvals/submit",
                json=approval_data,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify response structure
                if not data.get("success"):
                    self.log_result(
                        "Approval Submission", 
                        False, 
                        "Response success field is False",
                        data
                    )
                    return False
                
                # Verify approvals were created
                lead_data = data.get("lead", {})
                approvals = lead_data.get("approvals", [])
                
                if len(approvals) < 2:
                    self.log_result(
                        "Approval Submission", 
                        False, 
                        f"Expected at least 2 approval records, got {len(approvals)}",
                        data
                    )
                    return False
                
                # Check for Technical and Pricing approvals
                approval_types = [a.get("approval_type") for a in approvals]
                if "Technical" not in approval_types or "Pricing" not in approval_types:
                    self.log_result(
                        "Approval Submission", 
                        False, 
                        f"Missing required approval types. Found: {approval_types}",
                        data
                    )
                    return False
                
                self.log_result(
                    "Approval Submission", 
                    True, 
                    f"Successfully created {len(approvals)} approval records: {approval_types}"
                )
                return True
                
            else:
                self.log_result(
                    "Approval Submission", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_result("Approval Submission", False, f"Exception: {str(e)}")
            return False

    def test_approval_response(self):
        """Test POST /api/manufacturing/leads/MFGL-2025-0001/approvals/Technical/respond - Respond to approval"""
        try:
            print("✅ TESTING APPROVAL RESPONSE...")
            
            lead_id = "MFGL-2025-0001"
            approval_type = "Technical"
            response_data = {
                "approved": True,
                "comments": "Technical review passed - all specs meet requirements"
            }
            
            response = self.session.post(
                f"{BACKEND_URL}/manufacturing/leads/{lead_id}/approvals/{approval_type}/respond",
                json=response_data,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify response structure
                if not data.get("success"):
                    self.log_result(
                        "Approval Response", 
                        False, 
                        "Response success field is False",
                        data
                    )
                    return False
                
                # Verify approval was updated
                lead_data = data.get("lead", {})
                approvals = lead_data.get("approvals", [])
                
                # Find the Technical approval
                technical_approval = next((a for a in approvals if a.get("approval_type") == "Technical"), None)
                if not technical_approval:
                    self.log_result(
                        "Approval Response", 
                        False, 
                        "Technical approval record not found",
                        data
                    )
                    return False
                
                # Verify approval status is Approved
                if technical_approval.get("status") != "Approved":
                    self.log_result(
                        "Approval Response", 
                        False, 
                        f"Expected status 'Approved', got '{technical_approval.get('status')}'",
                        data
                    )
                    return False
                
                # Verify comments were saved
                if technical_approval.get("comments") != response_data["comments"]:
                    self.log_result(
                        "Approval Response", 
                        False, 
                        f"Comments not saved correctly",
                        data
                    )
                    return False
                
                self.log_result(
                    "Approval Response", 
                    True, 
                    f"Technical approval successfully updated to Approved status"
                )
                return True
                
            else:
                self.log_result(
                    "Approval Response", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_result("Approval Response", False, f"Exception: {str(e)}")
            return False

    def test_verify_final_state(self):
        """Test GET /api/manufacturing/leads/MFGL-2025-0001 - Verify final state"""
        try:
            print("🔍 TESTING FINAL STATE VERIFICATION...")
            
            lead_id = "MFGL-2025-0001"
            
            response = self.session.get(
                f"{BACKEND_URL}/manufacturing/leads/{lead_id}",
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify response structure
                if not data.get("success"):
                    self.log_result(
                        "Final State Verification", 
                        False, 
                        "Response success field is False",
                        data
                    )
                    return False
                
                lead_data = data.get("lead", {})
                
                # Check stage is "Feasibility"
                if lead_data.get("current_stage") != "Feasibility":
                    self.log_result(
                        "Final State Verification", 
                        False, 
                        f"Expected stage 'Feasibility', got '{lead_data.get('current_stage')}'",
                        data
                    )
                    return False
                
                # Check approvals array has entries
                approvals = lead_data.get("approvals", [])
                if len(approvals) < 2:
                    self.log_result(
                        "Final State Verification", 
                        False, 
                        f"Expected at least 2 approval entries, got {len(approvals)}",
                        data
                    )
                    return False
                
                # Check Technical approval status is "Approved"
                technical_approval = next((a for a in approvals if a.get("approval_type") == "Technical"), None)
                if not technical_approval or technical_approval.get("status") != "Approved":
                    self.log_result(
                        "Final State Verification", 
                        False, 
                        f"Technical approval not found or not approved. Status: {technical_approval.get('status') if technical_approval else 'Not found'}",
                        data
                    )
                    return False
                
                self.log_result(
                    "Final State Verification", 
                    True, 
                    f"Final state verified: Stage=Feasibility, Approvals={len(approvals)}, Technical=Approved"
                )
                return True
                
            else:
                self.log_result(
                    "Final State Verification", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_result("Final State Verification", False, f"Exception: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 STARTING MANUFACTURING LEAD APPROVAL WORKFLOW FIX VERIFICATION")
        print("=" * 70)
        
        # Authentication is required for all tests
        if not self.authenticate():
            print("❌ Authentication failed. Cannot proceed with tests.")
            return False
        
        # Run the 4 previously failing tests
        tests = [
            self.test_stage_transition,
            self.test_approval_submission,
            self.test_approval_response,
            self.test_verify_final_state
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            if test():
                passed += 1
            time.sleep(1)  # Brief pause between tests
        
        # Print summary
        print("=" * 70)
        print("📊 TEST SUMMARY")
        print("=" * 70)
        
        for result in self.results:
            print(f"{result['status']}: {result['test']}")
            if result['details']:
                print(f"   {result['details']}")
        
        print(f"\n🎯 OVERALL RESULT: {passed}/{total} tests passed")
        
        if passed == total:
            print("✅ ALL TESTS PASSED - Manufacturing Approval Workflow fixes are working correctly!")
            return True
        else:
            print(f"❌ {total - passed} TESTS FAILED - Issues still need to be addressed")
            return False

def main():
    """Main function"""
    tester = ManufacturingApprovalTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()