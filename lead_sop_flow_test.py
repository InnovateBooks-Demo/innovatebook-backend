"""
Backend Testing: Lead Module SOP Flow
Testing all 9 SOP stages for Lead Management System
"""

import requests
import json
from datetime import datetime

# Backend URL from environment
BACKEND_URL = "https://saas-finint.preview.emergentagent.com/api"

# Test credentials (demo user)
TEST_EMAIL = "demo@innovatebooks.com"
TEST_PASSWORD = os.getenv("TEST_PASSWORD", "Test1234")   # or demo123 as default


# Global token storage
auth_token = None
created_lead_id = None


def print_section(title):
    """Print formatted section header"""
    print(f"\n{'='*80}")
    print(f"  {title}")
    print(f"{'='*80}\n")


def print_result(test_name, success, details=""):
    """Print test result"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status} - {test_name}")
    if details:
        print(f"   Details: {details}")


def login():
    """Authenticate and get token"""
    global auth_token
    print_section("AUTHENTICATION")
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            auth_token = data.get("access_token")
            print_result("Login", True, f"Token obtained for {TEST_EMAIL}")
            return True
        else:
            print_result("Login", False, f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print_result("Login", False, str(e))
        return False


def get_headers():
    """Get authorization headers"""
    return {
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json"
    }


def test_lead_creation():
    """Test 1: Lead Creation (Intake SOP)"""
    global created_lead_id
    print_section("TEST 1: Lead Creation (Lead_Intake_SOP)")
    
    lead_data = {
        "company_name": "Test Automation Corp",
        "industry_type": "Technology",
        "company_size": "Medium (51-500)",
        "country": "India",
        "state": "Karnataka",
        "city": "Bangalore",
        "website_url": "https://www.testautomation.com",
        "contact_name": "John Smith",
        "email_address": "john.smith@testautomation.com",
        "phone_number": "+91 9876543210",
        "designation": "CTO",
        "department": "Technology",
        "lead_source": "Website",
        "product_or_solution_interested_in": "Cloud Infrastructure Solutions",
        "estimated_deal_value": 5000000,
        "decision_timeline": "3-6 months",
        "lead_campaign_name": "Q4 2025 Campaign",
        "tags": ["enterprise", "high-priority"],
        "notes": "Interested in full cloud migration"
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/commerce/leads",
            headers=get_headers(),
            json=lead_data,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            created_lead_id = data.get("lead_id")
            print_result("Lead Creation", True, f"Lead ID: {created_lead_id}, Status: {data.get('lead_status')}")
            print(f"   Company: {data.get('company_name')}")
            print(f"   Contact: {data.get('contact_name')} ({data.get('email_address')})")
            print(f"   Deal Value: ₹{data.get('estimated_deal_value'):,.0f}")
            return True
        else:
            print_result("Lead Creation", False, f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print_result("Lead Creation", False, str(e))
        return False


def test_lead_enrichment():
    """Test 2: Lead Enrichment (Lead_Enrich_SOP)"""
    print_section("TEST 2: Lead Enrichment (Lead_Enrich_SOP)")
    
    if not created_lead_id:
        print_result("Lead Enrichment", False, "No lead_id available")
        return False
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/commerce/leads/{created_lead_id}/enrich",
            headers=get_headers(),
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            enrichment_data = data.get("enrichment_data", {})
            print_result("Lead Enrichment", True, f"Stage: {data.get('stage')}")
            print(f"   Confidence Score: {enrichment_data.get('confidence_score')}%")
            print(f"   Enrichment Source: {enrichment_data.get('enrichment_source')}")
            print(f"   Company Size Verified: {enrichment_data.get('company_size_verified')}")
            return True
        else:
            print_result("Lead Enrichment", False, f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print_result("Lead Enrichment", False, str(e))
        return False


def test_lead_validation():
    """Test 3: Lead Validation (Lead_Validate_SOP)"""
    print_section("TEST 3: Lead Validation (Lead_Validate_SOP)")
    
    if not created_lead_id:
        print_result("Lead Validation", False, "No lead_id available")
        return False
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/commerce/leads/{created_lead_id}/validate",
            headers=get_headers(),
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            validation_checks = data.get("validation_checks", {})
            warnings = data.get("warnings", [])
            print_result("Lead Validation", True, f"Status: {data.get('validation_status')}")
            print(f"   Email Format: {validation_checks.get('email_format')}")
            print(f"   Email Domain MX: {validation_checks.get('email_domain_mx')}")
            print(f"   Phone Format: {validation_checks.get('phone_format')}")
            print(f"   Duplicate Check: {validation_checks.get('duplicate_check')}")
            print(f"   Blacklist Check: {validation_checks.get('blacklist_check')}")
            if warnings:
                print(f"   Warnings: {len(warnings)}")
            return True
        else:
            print_result("Lead Validation", False, f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print_result("Lead Validation", False, str(e))
        return False


def test_lead_qualification():
    """Test 4: Lead Qualification & Scoring (Lead_Qualify_SOP)"""
    print_section("TEST 4: Lead Qualification & Scoring (Lead_Qualify_SOP)")
    
    if not created_lead_id:
        print_result("Lead Qualification", False, "No lead_id available")
        return False
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/commerce/leads/{created_lead_id}/qualify",
            headers=get_headers(),
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            breakdown = data.get("breakdown", {})
            print_result("Lead Qualification", True, f"Score: {data.get('lead_score')}/100, Category: {data.get('category')}")
            print(f"   Fit Score: {breakdown.get('fit_score')}/40")
            print(f"   Intent Score: {breakdown.get('intent_score')}/30")
            print(f"   Potential Score: {breakdown.get('potential_score')}/30")
            print(f"   Reasoning: {data.get('reasoning')}")
            return True
        else:
            print_result("Lead Qualification", False, f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print_result("Lead Qualification", False, str(e))
        return False


def test_lead_assignment():
    """Test 5: Lead Assignment (Lead_Assign_SOP)"""
    print_section("TEST 5: Lead Assignment (Lead_Assign_SOP)")
    
    if not created_lead_id:
        print_result("Lead Assignment", False, "No lead_id available")
        return False
    
    try:
        # Test with manual assignment
        response = requests.post(
            f"{BACKEND_URL}/commerce/leads/{created_lead_id}/assign",
            headers=get_headers(),
            json={"assigned_to": "Sales Rep 1"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print_result("Lead Assignment", True, f"Assigned to: {data.get('assigned_to')}")
            print(f"   Assignment Method: {data.get('assignment_method')}")
            print(f"   Follow-up Due: {data.get('follow_up_due')}")
            return True
        else:
            print_result("Lead Assignment", False, f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print_result("Lead Assignment", False, str(e))
        return False


def test_lead_engagement():
    """Test 6: Lead Engagement (Lead_Engage_SOP)"""
    print_section("TEST 6: Lead Engagement (Lead_Engage_SOP)")
    
    if not created_lead_id:
        print_result("Lead Engagement", False, "No lead_id available")
        return False
    
    try:
        # Log an engagement activity
        response = requests.post(
            f"{BACKEND_URL}/commerce/leads/{created_lead_id}/engage",
            headers=get_headers(),
            params={
                "activity_type": "Call",
                "notes": "Initial discovery call completed",
                "outcome": "Positive - interested in demo"
            },
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            activity = data.get("activity", {})
            print_result("Lead Engagement", True, f"Activity: {activity.get('activity_type')}")
            print(f"   Notes: {activity.get('notes')}")
            print(f"   Outcome: {activity.get('outcome')}")
            print(f"   Updated Intent Score: {data.get('updated_intent_score')}")
            return True
        else:
            print_result("Lead Engagement", False, f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print_result("Lead Engagement", False, str(e))
        return False


def test_get_all_leads():
    """Test 7: Get All Leads"""
    print_section("TEST 7: Get All Leads")
    
    try:
        response = requests.get(
            f"{BACKEND_URL}/commerce/leads",
            headers=get_headers(),
            timeout=10
        )
        
        if response.status_code == 200:
            leads = response.json()
            print_result("Get All Leads", True, f"Retrieved {len(leads)} leads")
            if leads:
                print(f"   Sample Lead: {leads[0].get('lead_id')} - {leads[0].get('company_name')}")
            return True
        else:
            print_result("Get All Leads", False, f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print_result("Get All Leads", False, str(e))
        return False


def test_get_single_lead():
    """Test 8: Get Single Lead Details"""
    print_section("TEST 8: Get Single Lead Details")
    
    if not created_lead_id:
        print_result("Get Single Lead", False, "No lead_id available")
        return False
    
    try:
        response = requests.get(
            f"{BACKEND_URL}/commerce/leads/{created_lead_id}",
            headers=get_headers(),
            timeout=10
        )
        
        if response.status_code == 200:
            lead = response.json()
            sop_status = lead.get("sop_completion_status", {})
            print_result("Get Single Lead", True, f"Lead ID: {lead.get('lead_id')}")
            print(f"   Company: {lead.get('company_name')}")
            print(f"   Status: {lead.get('lead_status')}")
            print(f"   Score: {lead.get('lead_score')}/100 ({lead.get('lead_score_category')})")
            print(f"   Assigned To: {lead.get('assigned_to')}")
            print(f"\n   SOP Completion Status:")
            for sop, completed in sop_status.items():
                status_icon = "✅" if completed else "⏳"
                print(f"      {status_icon} {sop}: {completed}")
            return True
        else:
            print_result("Get Single Lead", False, f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print_result("Get Single Lead", False, str(e))
        return False


def test_audit_trail():
    """Test 9: Get Audit Trail (Lead_Audit_SOP)"""
    print_section("TEST 9: Get Audit Trail (Lead_Audit_SOP)")
    
    if not created_lead_id:
        print_result("Get Audit Trail", False, "No lead_id available")
        return False
    
    try:
        response = requests.get(
            f"{BACKEND_URL}/commerce/leads/{created_lead_id}/audit",
            headers=get_headers(),
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            sop_history = data.get("sop_stage_history", [])
            audit_trail = data.get("audit_trail", [])
            engagement_activities = data.get("engagement_activities", [])
            
            print_result("Get Audit Trail", True, f"Lead ID: {data.get('lead_id')}")
            print(f"   Current SOP Stage: {data.get('current_sop_stage')}")
            print(f"   SOP Stage History: {len(sop_history)} entries")
            print(f"   Audit Trail: {len(audit_trail)} entries")
            print(f"   Engagement Activities: {len(engagement_activities)} entries")
            
            if sop_history:
                print(f"\n   Recent SOP Stages:")
                for entry in sop_history[-3:]:
                    print(f"      - {entry.get('stage')}: {entry.get('status')} ({entry.get('notes')})")
            
            return True
        else:
            print_result("Get Audit Trail", False, f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print_result("Get Audit Trail", False, str(e))
        return False


def run_all_tests():
    """Run all tests in sequence"""
    print("\n" + "="*80)
    print("  LEAD MODULE SOP FLOW - BACKEND TESTING")
    print("  Testing 9-Stage SOP Workflow")
    print("="*80)
    
    results = {
        "total": 0,
        "passed": 0,
        "failed": 0
    }
    
    # Authentication
    if not login():
        print("\n❌ CRITICAL: Authentication failed. Cannot proceed with tests.")
        return results
    
    # Run all tests
    tests = [
        ("Lead Creation (Intake SOP)", test_lead_creation),
        ("Lead Enrichment (Enrich SOP)", test_lead_enrichment),
        ("Lead Validation (Validate SOP)", test_lead_validation),
        ("Lead Qualification (Qualify SOP)", test_lead_qualification),
        ("Lead Assignment (Assign SOP)", test_lead_assignment),
        ("Lead Engagement (Engage SOP)", test_lead_engagement),
        ("Get All Leads", test_get_all_leads),
        ("Get Single Lead", test_get_single_lead),
        ("Audit Trail (Audit SOP)", test_audit_trail)
    ]
    
    for test_name, test_func in tests:
        results["total"] += 1
        if test_func():
            results["passed"] += 1
        else:
            results["failed"] += 1
    
    # Print summary
    print_section("TEST SUMMARY")
    print(f"Total Tests: {results['total']}")
    print(f"✅ Passed: {results['passed']}")
    print(f"❌ Failed: {results['failed']}")
    print(f"Success Rate: {(results['passed']/results['total']*100):.1f}%")
    
    if results['failed'] == 0:
        print("\n🎉 ALL TESTS PASSED! Lead Module SOP Flow is working correctly.")
    else:
        print(f"\n⚠️  {results['failed']} test(s) failed. Please review the errors above.")
    
    return results


if __name__ == "__main__":
    run_all_tests()
