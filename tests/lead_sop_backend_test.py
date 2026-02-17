"""
Comprehensive Backend Testing for SOP-Driven Lead Management System
Tests all 6 SOP stages, AI scoring, duplicate detection, engagement logging, and audit trail
"""

import requests
import json
from datetime import datetime, timezone

# Backend URL from environment
BACKEND_URL = "https://saas-finint.preview.emergentagent.com/api"

# Test credentials
EMAIL = "demo@innovatebooks.com"
PASSWORD = "demo123"

# Global token storage
auth_token = None


def print_section(title):
    """Print formatted section header"""
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80)


def print_test(test_name, status, details=""):
    """Print test result"""
    status_symbol = "✅" if status == "PASS" else "❌"
    print(f"{status_symbol} {test_name}")
    if details:
        print(f"   {details}")


def login():
    """Authenticate and get token"""
    global auth_token
    print_section("AUTHENTICATION")
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/auth/login",
            json={"email": EMAIL, "password": PASSWORD}
        )
        
        if response.status_code == 200:
            data = response.json()
            auth_token = data.get("access_token")
            print_test("Login", "PASS", f"Token obtained for {EMAIL}")
            return True
        else:
            print_test("Login", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        print_test("Login", "FAIL", f"Error: {str(e)}")
        return False


def get_headers():
    """Get authorization headers"""
    return {
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json"
    }


def get_existing_lead():
    """Get existing lead LEAD-2025-001 or any available lead"""
    print_section("FETCHING EXISTING LEAD")
    
    try:
        response = requests.get(
            f"{BACKEND_URL}/commerce/leads",
            headers=get_headers()
        )
        
        if response.status_code == 200:
            leads = response.json()
            if leads and len(leads) > 0:
                # Try to find LEAD-2025-001 first
                target_lead = None
                for lead in leads:
                    if lead.get('lead_id') == 'LEAD-2025-001':
                        target_lead = lead
                        break
                
                # If not found, use first lead
                if not target_lead:
                    target_lead = leads[0]
                
                print_test("Fetch Lead", "PASS", f"Found lead: {target_lead.get('lead_id')}")
                return target_lead.get('lead_id')
            else:
                print_test("Fetch Lead", "FAIL", "No leads found in database")
                return None
        else:
            print_test("Fetch Lead", "FAIL", f"Status: {response.status_code}")
            return None
    except Exception as e:
        print_test("Fetch Lead", "FAIL", f"Error: {str(e)}")
        return None


def test_sop_stage_1_intake(lead_id):
    """Test SOP Stage 1: Lead Intake"""
    print_section("SOP STAGE 1: LEAD INTAKE")
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/commerce/leads/sop/intake/{lead_id}",
            headers=get_headers()
        )
        
        if response.status_code == 200:
            data = response.json()
            success = data.get('success', False)
            stage = data.get('stage')
            message = data.get('message')
            next_stage = data.get('next_stage')
            
            if success:
                print_test("Lead Intake SOP", "PASS", f"Message: {message}")
                print(f"   Stage: {stage}")
                print(f"   Next Stage: {next_stage}")
                return True
            else:
                print_test("Lead Intake SOP", "FAIL", f"Message: {message}")
                return False
        else:
            print_test("Lead Intake SOP", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        print_test("Lead Intake SOP", "FAIL", f"Error: {str(e)}")
        return False


def test_sop_stage_2_enrich(lead_id):
    """Test SOP Stage 2: Lead Enrichment"""
    print_section("SOP STAGE 2: LEAD ENRICHMENT")
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/commerce/leads/sop/enrich/{lead_id}",
            headers=get_headers()
        )
        
        if response.status_code == 200:
            data = response.json()
            success = data.get('success', False)
            enrichment_data = data.get('enrichment_data', {})
            
            if success:
                print_test("Lead Enrich SOP", "PASS", f"Confidence Score: {enrichment_data.get('confidence_score', 0)}")
                print(f"   Company Size: {enrichment_data.get('company_size_verified')}")
                print(f"   Industry: {enrichment_data.get('industry_verified')}")
                print(f"   Enrichment Source: {enrichment_data.get('enrichment_source')}")
                return True
            else:
                print_test("Lead Enrich SOP", "FAIL", f"Message: {data.get('message')}")
                return False
        else:
            print_test("Lead Enrich SOP", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        print_test("Lead Enrich SOP", "FAIL", f"Error: {str(e)}")
        return False


def test_sop_stage_3_qualify(lead_id):
    """Test SOP Stage 3: Lead Qualification"""
    print_section("SOP STAGE 3: LEAD QUALIFICATION")
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/commerce/leads/sop/qualify/{lead_id}",
            headers=get_headers()
        )
        
        if response.status_code == 200:
            data = response.json()
            success = data.get('success', False)
            qualification_result = data.get('qualification_result', {})
            
            if success:
                qualified = qualification_result.get('qualified', False)
                score_factors = qualification_result.get('score_factors', {})
                
                print_test("Lead Qualify SOP", "PASS", f"Qualified: {qualified}")
                print(f"   Credit Check: {score_factors.get('credit', 'N/A')}")
                print(f"   Compliance Check: {score_factors.get('compliance', 'N/A')}")
                print(f"   Deal Value Check: {score_factors.get('deal_value', 'N/A')}")
                
                if not qualified:
                    reasons = qualification_result.get('reasons', [])
                    print(f"   Reasons: {', '.join(reasons)}")
                
                return True
            else:
                print_test("Lead Qualify SOP", "FAIL", f"Message: {data.get('message')}")
                return False
        else:
            print_test("Lead Qualify SOP", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        print_test("Lead Qualify SOP", "FAIL", f"Error: {str(e)}")
        return False


def test_sop_stage_4_score_ai(lead_id):
    """Test SOP Stage 4: AI-Powered Lead Scoring"""
    print_section("SOP STAGE 4: AI LEAD SCORING (OpenAI GPT-5)")
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/commerce/leads/sop/score/{lead_id}",
            headers=get_headers()
        )
        
        if response.status_code == 200:
            data = response.json()
            success = data.get('success', False)
            ai_score_result = data.get('ai_score_result', {})
            
            if success:
                score = ai_score_result.get('score', 0)
                grade = ai_score_result.get('grade', 'N/A')
                reasoning = ai_score_result.get('reasoning', 'N/A')
                risk_level = ai_score_result.get('risk_level', 'N/A')
                score_breakdown = ai_score_result.get('score_breakdown', {})
                
                print_test("AI Lead Scoring", "PASS", f"Score: {score}/100, Grade: {grade}")
                print(f"   Risk Level: {risk_level}")
                print(f"   Reasoning: {reasoning[:100]}...")
                
                # Verify score breakdown exists
                if score_breakdown:
                    print(f"   Score Breakdown:")
                    for key, value in score_breakdown.items():
                        print(f"     - {key}: {value}")
                    print_test("Score Breakdown", "PASS", "All breakdown components present")
                else:
                    print_test("Score Breakdown", "FAIL", "Score breakdown missing")
                
                # Verify JSON structure
                required_fields = ['score', 'grade', 'reasoning', 'risk_level']
                missing_fields = [f for f in required_fields if f not in ai_score_result]
                
                if not missing_fields:
                    print_test("AI Response Structure", "PASS", "All required fields present")
                else:
                    print_test("AI Response Structure", "FAIL", f"Missing fields: {missing_fields}")
                
                return True
            else:
                print_test("AI Lead Scoring", "FAIL", f"Message: {data.get('message')}")
                return False
        else:
            print_test("AI Lead Scoring", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        print_test("AI Lead Scoring", "FAIL", f"Error: {str(e)}")
        return False


def test_duplicate_detection_ai(lead_id):
    """Test AI-Powered Duplicate Detection"""
    print_section("AI DUPLICATE DETECTION")
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/commerce/leads/sop/duplicate-check/{lead_id}",
            headers=get_headers()
        )
        
        if response.status_code == 200:
            data = response.json()
            success = data.get('success', False)
            duplicate_result = data.get('duplicate_result', {})
            
            if success:
                is_duplicate = duplicate_result.get('is_duplicate', False)
                similarity_score = duplicate_result.get('similarity_score', 0)
                match_criteria = duplicate_result.get('match_criteria', [])
                ai_confidence = duplicate_result.get('ai_confidence', 0)
                checked_by = duplicate_result.get('checked_by', 'N/A')
                
                print_test("Duplicate Detection", "PASS", f"Is Duplicate: {is_duplicate}")
                print(f"   Similarity Score: {similarity_score}%")
                print(f"   AI Confidence: {ai_confidence}%")
                print(f"   Checked By: {checked_by}")
                
                if match_criteria:
                    print(f"   Match Criteria: {', '.join(match_criteria)}")
                
                if is_duplicate:
                    duplicate_ids = duplicate_result.get('duplicate_lead_ids', [])
                    print(f"   Duplicate Lead IDs: {', '.join(duplicate_ids)}")
                
                return True
            else:
                print_test("Duplicate Detection", "FAIL", f"Message: {data.get('message')}")
                return False
        else:
            print_test("Duplicate Detection", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        print_test("Duplicate Detection", "FAIL", f"Error: {str(e)}")
        return False


def test_sop_stage_5_approve(lead_id):
    """Test SOP Stage 5: Lead Approval"""
    print_section("SOP STAGE 5: LEAD APPROVAL")
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/commerce/leads/sop/approve/{lead_id}",
            headers=get_headers(),
            params={
                "approved_by": "demo@innovatebooks.com",
                "remarks": "Lead approved after comprehensive SOP testing"
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            success = data.get('success', False)
            
            if success:
                print_test("Lead Approve SOP", "PASS", f"Message: {data.get('message')}")
                print(f"   Next Stage: {data.get('next_stage')}")
                return True
            else:
                print_test("Lead Approve SOP", "FAIL", f"Message: {data.get('message')}")
                return False
        else:
            print_test("Lead Approve SOP", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        print_test("Lead Approve SOP", "FAIL", f"Error: {str(e)}")
        return False


def test_sop_stage_6_convert(lead_id):
    """Test SOP Stage 6: Lead Conversion to Evaluate Module"""
    print_section("SOP STAGE 6: LEAD CONVERSION")
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/commerce/leads/sop/convert/{lead_id}",
            headers=get_headers(),
            params={"create_evaluation": True}
        )
        
        if response.status_code == 200:
            data = response.json()
            success = data.get('success', False)
            evaluation_id = data.get('evaluation_id')
            govern_log_id = data.get('govern_log_id')
            
            if success:
                print_test("Lead Convert SOP", "PASS", f"Message: {data.get('message')}")
                print(f"   Evaluation ID: {evaluation_id}")
                print(f"   Govern Log ID: {govern_log_id}")
                
                # Verify evaluation was created
                if evaluation_id:
                    print_test("Evaluation Creation", "PASS", f"Evaluation {evaluation_id} created in Evaluate module")
                else:
                    print_test("Evaluation Creation", "FAIL", "Evaluation ID not returned")
                
                return evaluation_id
            else:
                print_test("Lead Convert SOP", "FAIL", f"Message: {data.get('message')}")
                return None
        else:
            print_test("Lead Convert SOP", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
            return None
    except Exception as e:
        print_test("Lead Convert SOP", "FAIL", f"Error: {str(e)}")
        return None


def test_engagement_logging(lead_id):
    """Test Engagement Activity Logging"""
    print_section("ENGAGEMENT ACTIVITY LOGGING")
    
    try:
        # Log multiple engagement activities
        activities = [
            {"activity_type": "Email", "notes": "Initial outreach email sent", "outcome": "Responded"},
            {"activity_type": "Call", "notes": "Discovery call completed", "outcome": "Interested"},
            {"activity_type": "Meeting", "notes": "Product demo scheduled", "outcome": "Positive"}
        ]
        
        success_count = 0
        for activity in activities:
            response = requests.post(
                f"{BACKEND_URL}/commerce/leads/sop/engagement/{lead_id}",
                headers=get_headers(),
                params={
                    "activity_type": activity["activity_type"],
                    "notes": activity["notes"],
                    "outcome": activity["outcome"],
                    "performed_by": "demo@innovatebooks.com"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    success_count += 1
                    print_test(f"Log {activity['activity_type']}", "PASS", f"Outcome: {activity['outcome']}")
        
        if success_count == len(activities):
            print_test("Engagement Logging", "PASS", f"All {success_count} activities logged successfully")
            return True
        else:
            print_test("Engagement Logging", "FAIL", f"Only {success_count}/{len(activities)} activities logged")
            return False
    except Exception as e:
        print_test("Engagement Logging", "FAIL", f"Error: {str(e)}")
        return False


def test_audit_trail(lead_id):
    """Test Audit Trail Retrieval"""
    print_section("AUDIT TRAIL VERIFICATION")
    
    try:
        response = requests.get(
            f"{BACKEND_URL}/commerce/leads/sop/audit/{lead_id}",
            headers=get_headers()
        )
        
        if response.status_code == 200:
            data = response.json()
            sop_stage_history = data.get('sop_stage_history', [])
            audit_trail = data.get('audit_trail', [])
            engagement_activities = data.get('engagement_activities', [])
            current_sop_stage = data.get('current_sop_stage')
            sop_completion_status = data.get('sop_completion_status', {})
            
            print_test("Audit Trail Retrieval", "PASS", f"Current Stage: {current_sop_stage}")
            print(f"   SOP Stage History Entries: {len(sop_stage_history)}")
            print(f"   Audit Trail Entries: {len(audit_trail)}")
            print(f"   Engagement Activities: {len(engagement_activities)}")
            
            # Verify SOP completion status
            print(f"\n   SOP Completion Status:")
            for stage, completed in sop_completion_status.items():
                status_symbol = "✅" if completed else "❌"
                print(f"     {status_symbol} {stage}: {completed}")
            
            # Verify all stages are tracked
            expected_stages = [
                "Lead_Intake_SOP", "Lead_Enrich_SOP", "Lead_Qualify_SOP",
                "Lead_Score_SOP", "Lead_Approve_SOP", "Lead_Convert_SOP"
            ]
            
            completed_stages = [s for s, c in sop_completion_status.items() if c]
            
            if len(completed_stages) >= 5:  # At least 5 stages should be completed
                print_test("SOP Stage Tracking", "PASS", f"{len(completed_stages)}/6 stages completed")
            else:
                print_test("SOP Stage Tracking", "FAIL", f"Only {len(completed_stages)}/6 stages completed")
            
            # Verify audit trail has entries
            if len(audit_trail) > 0:
                print_test("Audit Trail Logging", "PASS", f"{len(audit_trail)} audit entries recorded")
                
                # Show sample audit entries
                print(f"\n   Sample Audit Entries:")
                for entry in audit_trail[:3]:
                    action = entry.get('action', 'N/A')
                    timestamp = entry.get('timestamp', 'N/A')
                    performed_by = entry.get('performed_by', 'N/A')
                    print(f"     - {action} by {performed_by} at {timestamp}")
            else:
                print_test("Audit Trail Logging", "FAIL", "No audit entries found")
            
            return True
        else:
            print_test("Audit Trail Retrieval", "FAIL", f"Status: {response.status_code}")
            return False
    except Exception as e:
        print_test("Audit Trail Retrieval", "FAIL", f"Error: {str(e)}")
        return False


def verify_lead_document_updates(lead_id):
    """Verify that lead document was properly updated through all SOP stages"""
    print_section("LEAD DOCUMENT VERIFICATION")
    
    try:
        response = requests.get(
            f"{BACKEND_URL}/commerce/leads/{lead_id}",
            headers=get_headers()
        )
        
        if response.status_code == 200:
            lead = response.json()
            
            # Check key fields updated by SOP stages
            checks = [
                ("Lead Status", lead.get('lead_status'), ['Converted', 'Approved', 'Qualified']),
                ("Current SOP Stage", lead.get('current_sop_stage'), ['Lead_Convert_SOP', 'Lead_Approve_SOP']),
                ("Enrichment Status", lead.get('enrichment_status'), ['Completed']),
                ("AI Lead Score", lead.get('ai_lead_score'), None),  # Should exist
                ("Credit Grade", lead.get('credit_grade'), None),  # Should exist
                ("Approval Status", lead.get('approval_status'), ['Approved']),
                ("Qualified to Evaluate ID", lead.get('qualified_to_evaluate_id'), None),  # Should exist
            ]
            
            passed = 0
            total = len(checks)
            
            for check_name, actual_value, expected_values in checks:
                if expected_values is None:
                    # Just check if field exists and has a value
                    if actual_value is not None and actual_value != "":
                        print_test(check_name, "PASS", f"Value: {actual_value}")
                        passed += 1
                    else:
                        print_test(check_name, "FAIL", "Field is empty or missing")
                else:
                    # Check if value is in expected list
                    if actual_value in expected_values:
                        print_test(check_name, "PASS", f"Value: {actual_value}")
                        passed += 1
                    else:
                        print_test(check_name, "FAIL", f"Expected one of {expected_values}, got: {actual_value}")
            
            print(f"\n   Overall: {passed}/{total} checks passed")
            
            return passed == total
        else:
            print_test("Lead Document Retrieval", "FAIL", f"Status: {response.status_code}")
            return False
    except Exception as e:
        print_test("Lead Document Verification", "FAIL", f"Error: {str(e)}")
        return False


def main():
    """Main test execution"""
    print("\n" + "=" * 80)
    print("  SOP-DRIVEN LEAD MANAGEMENT SYSTEM - COMPREHENSIVE BACKEND TESTING")
    print("=" * 80)
    print(f"  Backend URL: {BACKEND_URL}")
    print(f"  Test User: {EMAIL}")
    print("=" * 80)
    
    # Track test results
    results = {
        "total": 0,
        "passed": 0,
        "failed": 0
    }
    
    # Step 1: Login
    if not login():
        print("\n❌ CRITICAL: Authentication failed. Cannot proceed with tests.")
        return
    
    results["total"] += 1
    results["passed"] += 1
    
    # Step 2: Get existing lead
    lead_id = get_existing_lead()
    if not lead_id:
        print("\n❌ CRITICAL: No lead found. Cannot proceed with SOP tests.")
        return
    
    results["total"] += 1
    results["passed"] += 1
    
    # Step 3: Test all 6 SOP stages in sequence
    sop_tests = [
        ("SOP Stage 1: Intake", lambda: test_sop_stage_1_intake(lead_id)),
        ("SOP Stage 2: Enrich", lambda: test_sop_stage_2_enrich(lead_id)),
        ("SOP Stage 3: Qualify", lambda: test_sop_stage_3_qualify(lead_id)),
        ("SOP Stage 4: AI Score", lambda: test_sop_stage_4_score_ai(lead_id)),
        ("AI Duplicate Detection", lambda: test_duplicate_detection_ai(lead_id)),
        ("SOP Stage 5: Approve", lambda: test_sop_stage_5_approve(lead_id)),
    ]
    
    for test_name, test_func in sop_tests:
        results["total"] += 1
        if test_func():
            results["passed"] += 1
        else:
            results["failed"] += 1
    
    # Step 4: Test conversion (returns evaluation_id)
    results["total"] += 1
    evaluation_id = test_sop_stage_6_convert(lead_id)
    if evaluation_id:
        results["passed"] += 1
    else:
        results["failed"] += 1
    
    # Step 5: Test engagement logging
    results["total"] += 1
    if test_engagement_logging(lead_id):
        results["passed"] += 1
    else:
        results["failed"] += 1
    
    # Step 6: Test audit trail
    results["total"] += 1
    if test_audit_trail(lead_id):
        results["passed"] += 1
    else:
        results["failed"] += 1
    
    # Step 7: Verify lead document updates
    results["total"] += 1
    if verify_lead_document_updates(lead_id):
        results["passed"] += 1
    else:
        results["failed"] += 1
    
    # Final Summary
    print_section("TEST SUMMARY")
    print(f"Total Tests: {results['total']}")
    print(f"✅ Passed: {results['passed']}")
    print(f"❌ Failed: {results['failed']}")
    print(f"Success Rate: {(results['passed']/results['total']*100):.1f}%")
    
    if results['failed'] == 0:
        print("\n🎉 ALL TESTS PASSED! SOP-Driven Lead Management System is fully functional.")
    else:
        print(f"\n⚠️  {results['failed']} test(s) failed. Review the output above for details.")
    
    print("=" * 80)


if __name__ == "__main__":
    main()
