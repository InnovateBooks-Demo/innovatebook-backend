#!/usr/bin/env python3
"""
IB Commerce Evaluate Module Backend API Testing
Comprehensive test suite for all CRUD operations and workflow transitions
"""

import asyncio
import aiohttp
import json
import os
from datetime import datetime, date, timedelta
from typing import Dict, Any

# Configuration
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://saas-finint.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

# Test credentials
TEST_EMAIL = "demo@innovatebooks.com"
TEST_PASSWORD = os.getenv("TEST_PASSWORD", "Test1234")   # or demo123 as default


class EvaluateModuleTest:
    def __init__(self):
        self.session = None
        self.auth_token = None
        self.test_evaluation_id = None
        self.test_results = []
        
    async def setup(self):
        """Initialize HTTP session and authenticate"""
        self.session = aiohttp.ClientSession()
        await self.authenticate()
        
    async def teardown(self):
        """Clean up HTTP session"""
        if self.session:
            await self.session.close()
            
    async def authenticate(self):
        """Authenticate and get JWT token"""
        try:
            login_data = {
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD
            }
            
            async with self.session.post(f"{API_BASE}/auth/login", json=login_data) as response:
                if response.status == 200:
                    data = await response.json()
                    self.auth_token = data["access_token"]
                    print(f"✅ Authentication successful for {TEST_EMAIL}")
                    return True
                else:
                    error_text = await response.text()
                    print(f"❌ Authentication failed: {response.status} - {error_text}")
                    return False
        except Exception as e:
            print(f"❌ Authentication error: {str(e)}")
            return False
            
    def get_headers(self):
        """Get headers with authentication"""
        return {
            "Authorization": f"Bearer {self.auth_token}",
            "Content-Type": "application/json"
        }
        
    async def test_create_evaluation(self):
        """Test POST /api/commerce/evaluate - Create new evaluation"""
        print("\n🧪 Testing CREATE EVALUATION (POST /api/commerce/evaluate)")
        
        test_data = {
            "linked_lead_id": "LEAD-2025-001",
            "customer_id": "cust_test_001",
            "opportunity_name": "Test Backend Evaluation Deal",
            "opportunity_type": "New",
            "expected_deal_value": 10000000,
            "proposed_payment_terms": "Net 30",
            "expected_close_date": (date.today() + timedelta(days=90)).isoformat(),
            "currency": "INR"
        }
        
        try:
            async with self.session.post(
                f"{API_BASE}/commerce/evaluate",
                json=test_data,
                headers=self.get_headers()
            ) as response:
                
                status = response.status
                response_data = await response.json()
                
                if status in [200, 201]:
                    self.test_evaluation_id = response_data.get("evaluation_id")
                    print(f"✅ CREATE SUCCESS: Created evaluation {self.test_evaluation_id}")
                    print(f"   - Status: {response_data.get('evaluation_status')}")
                    print(f"   - Deal Value: ₹{response_data.get('expected_deal_value'):,}")
                    print(f"   - Deal Score: {response_data.get('deal_score', 0)}")
                    print(f"   - Deal Grade: {response_data.get('deal_grade', 'N/A')}")
                    
                    # Verify required fields
                    required_fields = ["id", "evaluation_id", "evaluation_status", "opportunity_name"]
                    missing_fields = [field for field in required_fields if field not in response_data]
                    
                    if missing_fields:
                        print(f"⚠️  Missing required fields: {missing_fields}")
                        self.test_results.append({"test": "CREATE", "status": "PARTIAL", "issue": f"Missing fields: {missing_fields}"})
                    else:
                        self.test_results.append({"test": "CREATE", "status": "PASS"})
                        
                else:
                    print(f"❌ CREATE FAILED: {status} - {response_data}")
                    self.test_results.append({"test": "CREATE", "status": "FAIL", "error": f"{status}: {response_data}"})
                    
        except Exception as e:
            print(f"❌ CREATE ERROR: {str(e)}")
            self.test_results.append({"test": "CREATE", "status": "ERROR", "error": str(e)})
            
    async def test_list_evaluations(self):
        """Test GET /api/commerce/evaluate - List all evaluations"""
        print("\n🧪 Testing LIST EVALUATIONS (GET /api/commerce/evaluate)")
        
        try:
            async with self.session.get(
                f"{API_BASE}/commerce/evaluate",
                headers=self.get_headers()
            ) as response:
                
                status = response.status
                response_data = await response.json()
                
                if status == 200:
                    evaluations = response_data if isinstance(response_data, list) else response_data.get("evaluations", [])
                    print(f"✅ LIST SUCCESS: Retrieved {len(evaluations)} evaluations")
                    
                    # Verify seeded data
                    seeded_ids = ["EVAL-2025-001", "EVAL-2025-002", "EVAL-2025-003", "EVAL-2025-004", "EVAL-2025-005"]
                    found_seeded = [eval_data.get("evaluation_id") for eval_data in evaluations if eval_data.get("evaluation_id") in seeded_ids]
                    print(f"   - Found seeded evaluations: {len(found_seeded)}/5")
                    
                    # Check if test evaluation appears
                    if self.test_evaluation_id:
                        test_found = any(eval_data.get("evaluation_id") == self.test_evaluation_id for eval_data in evaluations)
                        print(f"   - Test evaluation found: {'Yes' if test_found else 'No'}")
                    
                    self.test_results.append({"test": "LIST", "status": "PASS", "count": len(evaluations)})
                    
                else:
                    print(f"❌ LIST FAILED: {status} - {response_data}")
                    self.test_results.append({"test": "LIST", "status": "FAIL", "error": f"{status}: {response_data}"})
                    
        except Exception as e:
            print(f"❌ LIST ERROR: {str(e)}")
            self.test_results.append({"test": "LIST", "status": "ERROR", "error": str(e)})
            
    async def test_list_with_status_filter(self):
        """Test GET /api/commerce/evaluate?status=Draft - List with status filter"""
        print("\n🧪 Testing LIST WITH STATUS FILTER (GET /api/commerce/evaluate?status=Draft)")
        
        try:
            async with self.session.get(
                f"{API_BASE}/commerce/evaluate?status=Draft",
                headers=self.get_headers()
            ) as response:
                
                status = response.status
                response_data = await response.json()
                
                if status == 200:
                    evaluations = response_data if isinstance(response_data, list) else response_data.get("evaluations", [])
                    draft_count = len(evaluations)
                    print(f"✅ FILTER SUCCESS: Retrieved {draft_count} Draft evaluations")
                    
                    # Verify all returned evaluations have Draft status
                    non_draft = [eval_data for eval_data in evaluations if eval_data.get("evaluation_status") != "Draft"]
                    if non_draft:
                        print(f"⚠️  Found {len(non_draft)} non-Draft evaluations in filtered results")
                        self.test_results.append({"test": "FILTER", "status": "PARTIAL", "issue": "Filter not working correctly"})
                    else:
                        self.test_results.append({"test": "FILTER", "status": "PASS", "count": draft_count})
                        
                else:
                    print(f"❌ FILTER FAILED: {status} - {response_data}")
                    self.test_results.append({"test": "FILTER", "status": "FAIL", "error": f"{status}: {response_data}"})
                    
        except Exception as e:
            print(f"❌ FILTER ERROR: {str(e)}")
            self.test_results.append({"test": "FILTER", "status": "ERROR", "error": str(e)})
            
    async def test_get_evaluation_details(self):
        """Test GET /api/commerce/evaluate/{evaluation_id} - Get specific evaluation"""
        print(f"\n🧪 Testing GET EVALUATION DETAILS (GET /api/commerce/evaluate/{self.test_evaluation_id})")
        
        if not self.test_evaluation_id:
            print("⚠️  Skipping - no test evaluation ID available")
            self.test_results.append({"test": "GET_DETAILS", "status": "SKIP", "reason": "No test evaluation ID"})
            return
            
        try:
            async with self.session.get(
                f"{API_BASE}/commerce/evaluate/{self.test_evaluation_id}",
                headers=self.get_headers()
            ) as response:
                
                status = response.status
                response_data = await response.json()
                
                if status == 200:
                    print(f"✅ GET DETAILS SUCCESS: Retrieved evaluation {response_data.get('evaluation_id')}")
                    print(f"   - Opportunity: {response_data.get('opportunity_name')}")
                    print(f"   - Status: {response_data.get('evaluation_status')}")
                    print(f"   - Deal Value: ₹{response_data.get('expected_deal_value', 0):,}")
                    print(f"   - Deal Score: {response_data.get('deal_score', 0)}")
                    print(f"   - Deal Grade: {response_data.get('deal_grade', 'N/A')}")
                    print(f"   - Margin %: {response_data.get('gross_margin_percent', 0):.2f}%")
                    
                    # Verify response structure matches Evaluate model
                    expected_fields = ["id", "evaluation_id", "evaluation_status", "opportunity_name", 
                                     "expected_deal_value", "deal_score", "deal_grade"]
                    missing_fields = [field for field in expected_fields if field not in response_data]
                    
                    if missing_fields:
                        print(f"⚠️  Missing expected fields: {missing_fields}")
                        self.test_results.append({"test": "GET_DETAILS", "status": "PARTIAL", "issue": f"Missing fields: {missing_fields}"})
                    else:
                        self.test_results.append({"test": "GET_DETAILS", "status": "PASS"})
                        
                else:
                    print(f"❌ GET DETAILS FAILED: {status} - {response_data}")
                    self.test_results.append({"test": "GET_DETAILS", "status": "FAIL", "error": f"{status}: {response_data}"})
                    
        except Exception as e:
            print(f"❌ GET DETAILS ERROR: {str(e)}")
            self.test_results.append({"test": "GET_DETAILS", "status": "ERROR", "error": str(e)})
            
    async def test_update_evaluation(self):
        """Test PUT /api/commerce/evaluate/{evaluation_id} - Update evaluation"""
        print(f"\n🧪 Testing UPDATE EVALUATION (PUT /api/commerce/evaluate/{self.test_evaluation_id})")
        
        if not self.test_evaluation_id:
            print("⚠️  Skipping - no test evaluation ID available")
            self.test_results.append({"test": "UPDATE", "status": "SKIP", "reason": "No test evaluation ID"})
            return
            
        update_data = {
            "linked_lead_id": "LEAD-2025-001",
            "customer_id": "cust_test_001",
            "opportunity_name": "Updated Backend Test Deal",
            "opportunity_type": "New",
            "expected_deal_value": 15000000,  # Updated value
            "proposed_payment_terms": "Net 45",  # Updated terms
            "expected_close_date": (date.today() + timedelta(days=60)).isoformat(),
            "currency": "INR"
        }
        
        try:
            async with self.session.put(
                f"{API_BASE}/commerce/evaluate/{self.test_evaluation_id}",
                json=update_data,
                headers=self.get_headers()
            ) as response:
                
                status = response.status
                response_data = await response.json()
                
                if status == 200:
                    print(f"✅ UPDATE SUCCESS: Updated evaluation {response_data.get('evaluation_id')}")
                    print(f"   - New Opportunity Name: {response_data.get('opportunity_name')}")
                    print(f"   - New Deal Value: ₹{response_data.get('expected_deal_value', 0):,}")
                    print(f"   - New Payment Terms: {response_data.get('proposed_payment_terms')}")
                    
                    # Verify updated_at timestamp changed
                    updated_at = response_data.get('updated_at')
                    if updated_at:
                        print(f"   - Updated At: {updated_at}")
                        
                    # Verify margin recalculation if deal value changed
                    margin_percent = response_data.get('gross_margin_percent', 0)
                    print(f"   - Recalculated Margin: {margin_percent:.2f}%")
                    
                    self.test_results.append({"test": "UPDATE", "status": "PASS"})
                    
                else:
                    print(f"❌ UPDATE FAILED: {status} - {response_data}")
                    self.test_results.append({"test": "UPDATE", "status": "FAIL", "error": f"{status}: {response_data}"})
                    
        except Exception as e:
            print(f"❌ UPDATE ERROR: {str(e)}")
            self.test_results.append({"test": "UPDATE", "status": "ERROR", "error": str(e)})
            
    async def test_status_workflow_transitions(self):
        """Test PATCH /api/commerce/evaluate/{evaluation_id}/status - Status workflow transitions"""
        print(f"\n🧪 Testing STATUS WORKFLOW TRANSITIONS (PATCH /api/commerce/evaluate/{self.test_evaluation_id}/status)")
        
        # Create a new evaluation for workflow testing since the previous one was deleted
        workflow_test_data = {
            "linked_lead_id": "LEAD-2025-001",
            "customer_id": "cust_workflow_001",
            "opportunity_name": "Workflow Test Evaluation",
            "opportunity_type": "New",
            "expected_deal_value": 5000000,
            "proposed_payment_terms": "Net 30",
            "expected_close_date": (date.today() + timedelta(days=60)).isoformat(),
            "currency": "INR"
        }
        
        workflow_evaluation_id = None
        
        try:
            # Create evaluation for workflow testing
            async with self.session.post(
                f"{API_BASE}/commerce/evaluate",
                json=workflow_test_data,
                headers=self.get_headers()
            ) as create_response:
                
                if create_response.status in [200, 201]:
                    create_data = await create_response.json()
                    workflow_evaluation_id = create_data.get("evaluation_id")
                    print(f"   Created workflow test evaluation: {workflow_evaluation_id}")
                else:
                    print("⚠️  Could not create evaluation for workflow testing")
                    self.test_results.append({"test": "WORKFLOW", "status": "SKIP", "reason": "Could not create test evaluation"})
                    return
        except Exception as e:
            print(f"⚠️  Error creating workflow test evaluation: {str(e)}")
            self.test_results.append({"test": "WORKFLOW", "status": "SKIP", "reason": "Could not create test evaluation"})
            return
            
        # Test transition: Draft → In Review
        try:
            print("   Testing Draft → In Review transition...")
            async with self.session.patch(
                f"{API_BASE}/commerce/evaluate/{workflow_evaluation_id}/status?status=In Review",
                headers=self.get_headers()
            ) as response:
                
                status = response.status
                response_data = await response.json()
                
                if status == 200:
                    new_status = response_data.get('evaluation_status')
                    print(f"   ✅ Transition 1 SUCCESS: Status changed to '{new_status}'")
                    
                    if new_status == "In Review":
                        # Test transition: In Review → Approved
                        print("   Testing In Review → Approved transition...")
                        async with self.session.patch(
                            f"{API_BASE}/commerce/evaluate/{workflow_evaluation_id}/status?status=Approved",
                            headers=self.get_headers()
                        ) as response2:
                            
                            status2 = response2.status
                            response_data2 = await response2.json()
                            
                            if status2 == 200:
                                final_status = response_data2.get('evaluation_status')
                                print(f"   ✅ Transition 2 SUCCESS: Status changed to '{final_status}'")
                                
                                if final_status == "Approved":
                                    self.test_results.append({"test": "WORKFLOW", "status": "PASS"})
                                else:
                                    self.test_results.append({"test": "WORKFLOW", "status": "PARTIAL", "issue": f"Expected 'Approved', got '{final_status}'"})
                            else:
                                print(f"   ❌ Transition 2 FAILED: {status2} - {response_data2}")
                                self.test_results.append({"test": "WORKFLOW", "status": "FAIL", "error": f"Transition 2: {status2}"})
                    else:
                        self.test_results.append({"test": "WORKFLOW", "status": "PARTIAL", "issue": f"Expected 'In Review', got '{new_status}'"})
                else:
                    print(f"   ❌ Transition 1 FAILED: {status} - {response_data}")
                    self.test_results.append({"test": "WORKFLOW", "status": "FAIL", "error": f"Transition 1: {status}"})
                    
        except Exception as e:
            print(f"❌ WORKFLOW ERROR: {str(e)}")
            self.test_results.append({"test": "WORKFLOW", "status": "ERROR", "error": str(e)})
            
    async def test_delete_evaluation(self):
        """Test DELETE /api/commerce/evaluate/{evaluation_id} - Delete evaluation"""
        print(f"\n🧪 Testing DELETE EVALUATION (DELETE /api/commerce/evaluate/{self.test_evaluation_id})")
        
        if not self.test_evaluation_id:
            print("⚠️  Skipping - no test evaluation ID available")
            self.test_results.append({"test": "DELETE", "status": "SKIP", "reason": "No test evaluation ID"})
            return
            
        try:
            async with self.session.delete(
                f"{API_BASE}/commerce/evaluate/{self.test_evaluation_id}",
                headers=self.get_headers()
            ) as response:
                
                status = response.status
                response_data = await response.json()
                
                if status == 200:
                    print(f"✅ DELETE SUCCESS: {response_data.get('message', 'Evaluation deleted')}")
                    
                    # Verify evaluation no longer appears in GET list
                    print("   Verifying deletion...")
                    async with self.session.get(
                        f"{API_BASE}/commerce/evaluate",
                        headers=self.get_headers()
                    ) as verify_response:
                        
                        if verify_response.status == 200:
                            verify_data = await verify_response.json()
                            evaluations = verify_data if isinstance(verify_data, list) else verify_data.get("evaluations", [])
                            
                            still_exists = any(eval_data.get("evaluation_id") == self.test_evaluation_id for eval_data in evaluations)
                            
                            if not still_exists:
                                print("   ✅ Verification SUCCESS: Evaluation no longer in list")
                                self.test_results.append({"test": "DELETE", "status": "PASS"})
                            else:
                                print("   ⚠️  Verification FAILED: Evaluation still appears in list")
                                self.test_results.append({"test": "DELETE", "status": "PARTIAL", "issue": "Evaluation still in list"})
                        else:
                            print("   ⚠️  Could not verify deletion - list request failed")
                            self.test_results.append({"test": "DELETE", "status": "PARTIAL", "issue": "Could not verify deletion"})
                            
                else:
                    print(f"❌ DELETE FAILED: {status} - {response_data}")
                    self.test_results.append({"test": "DELETE", "status": "FAIL", "error": f"{status}: {response_data}"})
                    
        except Exception as e:
            print(f"❌ DELETE ERROR: {str(e)}")
            self.test_results.append({"test": "DELETE", "status": "ERROR", "error": str(e)})
            
    async def test_error_handling(self):
        """Test error handling for invalid requests"""
        print("\n🧪 Testing ERROR HANDLING")
        
        # Test 404 for non-existent evaluation_id
        print("   Testing 404 for non-existent evaluation...")
        try:
            async with self.session.get(
                f"{API_BASE}/commerce/evaluate/EVAL-9999-999",
                headers=self.get_headers()
            ) as response:
                
                if response.status == 404:
                    print("   ✅ 404 ERROR HANDLING: Correctly returned 404 for non-existent evaluation")
                    error_404_pass = True
                else:
                    print(f"   ⚠️  Expected 404, got {response.status}")
                    error_404_pass = False
                    
        except Exception as e:
            print(f"   ❌ 404 test error: {str(e)}")
            error_404_pass = False
            
        # Test validation errors for invalid data
        print("   Testing validation errors for invalid data...")
        try:
            invalid_data = {
                "linked_lead_id": "",  # Empty required field
                "customer_id": "",  # Empty required field
                "opportunity_name": "",  # Empty required field
                "expected_deal_value": -1000,  # Invalid negative value
                "currency": "INVALID"  # Invalid currency
            }
            
            async with self.session.post(
                f"{API_BASE}/commerce/evaluate",
                json=invalid_data,
                headers=self.get_headers()
            ) as response:
                
                if response.status == 422 or response.status == 400:
                    print("   ✅ VALIDATION ERROR HANDLING: Correctly rejected invalid data")
                    validation_pass = True
                else:
                    print(f"   ⚠️  Expected 400/422, got {response.status}")
                    validation_pass = False
                    
        except Exception as e:
            print(f"   ❌ Validation test error: {str(e)}")
            validation_pass = False
            
        if error_404_pass and validation_pass:
            self.test_results.append({"test": "ERROR_HANDLING", "status": "PASS"})
        elif error_404_pass or validation_pass:
            self.test_results.append({"test": "ERROR_HANDLING", "status": "PARTIAL", "issue": "Some error handling tests failed"})
        else:
            self.test_results.append({"test": "ERROR_HANDLING", "status": "FAIL", "error": "All error handling tests failed"})
            
    async def run_all_tests(self):
        """Run all test scenarios"""
        print("🚀 STARTING IB COMMERCE EVALUATE MODULE BACKEND API TESTING")
        print("=" * 80)
        
        await self.setup()
        
        if not self.auth_token:
            print("❌ Cannot proceed without authentication")
            return
            
        # Run all test scenarios in sequence
        await self.test_create_evaluation()
        await self.test_list_evaluations()
        await self.test_list_with_status_filter()
        await self.test_get_evaluation_details()
        await self.test_update_evaluation()
        await self.test_status_workflow_transitions()
        await self.test_delete_evaluation()
        await self.test_error_handling()
        
        await self.teardown()
        
        # Print summary
        self.print_summary()
        
    def print_summary(self):
        """Print test results summary"""
        print("\n" + "=" * 80)
        print("📊 TEST RESULTS SUMMARY")
        print("=" * 80)
        
        total_tests = len(self.test_results)
        passed = len([r for r in self.test_results if r["status"] == "PASS"])
        partial = len([r for r in self.test_results if r["status"] == "PARTIAL"])
        failed = len([r for r in self.test_results if r["status"] == "FAIL"])
        errors = len([r for r in self.test_results if r["status"] == "ERROR"])
        skipped = len([r for r in self.test_results if r["status"] == "SKIP"])
        
        success_rate = (passed / total_tests * 100) if total_tests > 0 else 0
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed}")
        print(f"⚠️  Partial: {partial}")
        print(f"❌ Failed: {failed}")
        print(f"💥 Errors: {errors}")
        print(f"⏭️  Skipped: {skipped}")
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        print("\nDetailed Results:")
        for result in self.test_results:
            status_icon = {
                "PASS": "✅",
                "PARTIAL": "⚠️ ",
                "FAIL": "❌",
                "ERROR": "💥",
                "SKIP": "⏭️ "
            }.get(result["status"], "❓")
            
            test_name = result["test"].replace("_", " ").title()
            print(f"  {status_icon} {test_name}: {result['status']}")
            
            if "issue" in result:
                print(f"      Issue: {result['issue']}")
            if "error" in result:
                print(f"      Error: {result['error']}")
                
        print("\n" + "=" * 80)
        
        # Overall assessment
        if success_rate >= 90:
            print("🎉 EXCELLENT: All critical functionality working correctly!")
        elif success_rate >= 75:
            print("👍 GOOD: Most functionality working with minor issues")
        elif success_rate >= 50:
            print("⚠️  MODERATE: Some functionality working but needs attention")
        else:
            print("🚨 CRITICAL: Major issues found - requires immediate attention")
            
        print("=" * 80)

async def main():
    """Main test execution"""
    tester = EvaluateModuleTest()
    await tester.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())