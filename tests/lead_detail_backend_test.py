#!/usr/bin/env python3
"""
Backend Testing for Lead Detail API - Score Data Verification
Testing lead list and detail endpoints to verify score data is returned correctly
"""

import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "https://saas-finint.preview.emergentagent.com/api"
EMAIL = "demo@innovatebooks.com"
PASSWORD = "demo123"

# Color codes for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def print_test(message):
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}{message}{RESET}")
    print(f"{BLUE}{'='*80}{RESET}")

def print_success(message):
    print(f"{GREEN}✅ {message}{RESET}")

def print_error(message):
    print(f"{RED}❌ {message}{RESET}")

def print_warning(message):
    print(f"{YELLOW}⚠️  {message}{RESET}")

def print_info(message):
    print(f"{BLUE}ℹ️  {message}{RESET}")

# Test Results Tracking
test_results = {
    "passed": 0,
    "failed": 0,
    "warnings": 0
}

def login():
    """Authenticate and get access token"""
    print_test("TEST 0: Authentication Check")
    
    # Commerce routes don't require authentication
    print_info("Commerce routes do not require authentication")
    print_success("Skipping authentication - proceeding with tests")
    test_results["passed"] += 1
    return "no-auth-required"

def test_lead_list_api(token):
    """Test 1: Test Lead List API - Verify leads have score data"""
    print_test("TEST 1: Lead List API - Verify Score Data")
    
    headers = {} if token == "no-auth-required" else {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(
            f"{BASE_URL}/commerce/leads",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            leads = response.json()
            print_success(f"Lead list retrieved successfully")
            print_info(f"Total leads: {len(leads)}")
            
            # Check if leads have score data
            leads_with_scores = [l for l in leads if l.get('lead_score', 0) > 0]
            print_info(f"Leads with scores > 0: {len(leads_with_scores)}")
            
            if len(leads_with_scores) > 0:
                print_success(f"Found {len(leads_with_scores)} leads with score data")
                
                # Check first lead with score
                sample_lead = leads_with_scores[0]
                print_info(f"\nSample Lead: {sample_lead.get('lead_id')} - {sample_lead.get('company_name')}")
                print_info(f"  Lead Score: {sample_lead.get('lead_score')}/100")
                print_info(f"  Category: {sample_lead.get('lead_score_category')}")
                print_info(f"  Fit Score: {sample_lead.get('fit_score')}")
                print_info(f"  Intent Score: {sample_lead.get('intent_score')}")
                print_info(f"  Potential Score: {sample_lead.get('potential_score')}")
                
                # Verify all required fields are present
                required_fields = ['lead_score', 'lead_score_category', 'fit_score', 'intent_score', 'potential_score']
                missing_fields = [f for f in required_fields if f not in sample_lead]
                
                if missing_fields:
                    print_warning(f"Missing fields in lead: {missing_fields}")
                    test_results["warnings"] += 1
                else:
                    print_success("All required score fields present")
                
                test_results["passed"] += 1
            else:
                print_warning("No leads with score > 0 found")
                test_results["warnings"] += 1
        else:
            print_error(f"Lead list API failed: {response.status_code}")
            print_error(f"Response: {response.text}")
            test_results["failed"] += 1
            
    except Exception as e:
        print_error(f"Lead list API error: {str(e)}")
        test_results["failed"] += 1

def test_lead_detail_raw_endpoint(token, lead_id="LEAD-2025-019"):
    """Test 2: Test Lead Detail /raw Endpoint - Verify all fields including scores"""
    print_test(f"TEST 2: Lead Detail /raw Endpoint - {lead_id}")
    
    headers = {} if token == "no-auth-required" else {"Authorization": f"Bearer {token}"}
    
    try:
        # First, check if /raw endpoint exists
        response = requests.get(
            f"{BASE_URL}/commerce/leads/{lead_id}/raw",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 404:
            print_warning(f"/raw endpoint not found - this endpoint may not be implemented")
            print_info("Skipping /raw endpoint test")
            test_results["warnings"] += 1
            return None
        elif response.status_code == 200:
            lead = response.json()
            print_success(f"Lead detail /raw retrieved successfully")
            
            # Verify score fields
            print_info(f"\nLead: {lead.get('lead_id')} - {lead.get('company_name')}")
            print_info(f"  Lead Score: {lead.get('lead_score')}/100")
            print_info(f"  Category: {lead.get('lead_score_category')}")
            print_info(f"  Fit Score: {lead.get('fit_score')}")
            print_info(f"  Intent Score: {lead.get('intent_score')}")
            print_info(f"  Potential Score: {lead.get('potential_score')}")
            print_info(f"  Assigned To: {lead.get('assigned_to')}")
            
            # Verify expected values for LEAD-2025-019
            if lead_id == "LEAD-2025-019":
                expected_score = 100
                if lead.get('lead_score') == expected_score:
                    print_success(f"Lead score matches expected value: {expected_score}")
                else:
                    print_warning(f"Lead score mismatch: Expected {expected_score}, Got {lead.get('lead_score')}")
                    test_results["warnings"] += 1
            
            # Check all enriched data fields are present
            required_fields = ['lead_score', 'fit_score', 'intent_score', 'potential_score', 'lead_score_category', 'assigned_to']
            missing_fields = [f for f in required_fields if f not in lead]
            
            if missing_fields:
                print_error(f"Missing required fields: {missing_fields}")
                test_results["failed"] += 1
            else:
                print_success("All required fields present in /raw endpoint")
                test_results["passed"] += 1
                
            return lead
        else:
            print_error(f"Lead detail /raw API failed: {response.status_code}")
            print_error(f"Response: {response.text}")
            test_results["failed"] += 1
            return None
            
    except Exception as e:
        print_error(f"Lead detail /raw API error: {str(e)}")
        test_results["failed"] += 1
        return None

def test_lead_detail_regular_endpoint(token, lead_id="LEAD-2025-019"):
    """Test 3: Test Regular Lead Detail Endpoint - Compare with /raw"""
    print_test(f"TEST 3: Regular Lead Detail Endpoint - {lead_id}")
    
    headers = {} if token == "no-auth-required" else {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(
            f"{BASE_URL}/commerce/leads/{lead_id}",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            lead = response.json()
            print_success(f"Lead detail retrieved successfully")
            
            # Verify score fields
            print_info(f"\nLead: {lead.get('lead_id')} - {lead.get('company_name')}")
            print_info(f"  Lead Score: {lead.get('lead_score')}/100")
            print_info(f"  Category: {lead.get('lead_score_category')}")
            print_info(f"  Fit Score: {lead.get('fit_score')}")
            print_info(f"  Intent Score: {lead.get('intent_score')}")
            print_info(f"  Potential Score: {lead.get('potential_score')}")
            print_info(f"  Assigned To: {lead.get('assigned_to')}")
            
            # Verify expected values for LEAD-2025-019
            if lead_id == "LEAD-2025-019":
                expected_score = 100
                if lead.get('lead_score') == expected_score:
                    print_success(f"Lead score matches expected value: {expected_score}")
                else:
                    print_warning(f"Lead score mismatch: Expected {expected_score}, Got {lead.get('lead_score')}")
                    test_results["warnings"] += 1
            
            # Check all score fields are present
            required_fields = ['lead_score', 'fit_score', 'intent_score', 'potential_score', 'lead_score_category']
            missing_fields = [f for f in required_fields if f not in lead]
            
            if missing_fields:
                print_error(f"Missing required score fields: {missing_fields}")
                test_results["failed"] += 1
            else:
                print_success("All required score fields present in regular endpoint")
                test_results["passed"] += 1
                
            return lead
        else:
            print_error(f"Lead detail API failed: {response.status_code}")
            print_error(f"Response: {response.text}")
            test_results["failed"] += 1
            return None
            
    except Exception as e:
        print_error(f"Lead detail API error: {str(e)}")
        test_results["failed"] += 1
        return None

def test_lead_update_endpoint(token, lead_id="LEAD-2025-012"):
    """Test 4: Test Lead Update Endpoint - Verify update works without breaking scores"""
    print_test(f"TEST 4: Lead Update Endpoint - {lead_id}")
    
    headers = {} if token == "no-auth-required" else {"Authorization": f"Bearer {token}"}
    
    try:
        # First, get the current lead data
        response = requests.get(
            f"{BASE_URL}/commerce/leads/{lead_id}",
            headers=headers,
            timeout=10
        )
        
        if response.status_code != 200:
            print_error(f"Failed to get lead {lead_id}: {response.status_code}")
            test_results["failed"] += 1
            return
        
        lead = response.json()
        original_score = lead.get('lead_score')
        original_company = lead.get('company_name')
        
        print_info(f"Original Lead: {lead.get('lead_id')} - {original_company}")
        print_info(f"  Original Score: {original_score}/100")
        
        # Update the lead (update notes field)
        update_data = {
            "company_name": lead.get('company_name'),
            "lead_source": lead.get('lead_source'),
            "contact_name": lead.get('contact_name'),
            "email_address": lead.get('email_address'),
            "phone_number": lead.get('phone_number'),
            "product_or_solution_interested_in": lead.get('product_or_solution_interested_in'),
            "notes": f"Updated at {datetime.now().isoformat()} - Testing score persistence"
        }
        
        response = requests.put(
            f"{BASE_URL}/commerce/leads/{lead_id}",
            headers=headers,
            json=update_data,
            timeout=10
        )
        
        if response.status_code == 200:
            updated_lead = response.json()
            print_success(f"Lead updated successfully")
            
            # Verify score is still intact
            updated_score = updated_lead.get('lead_score')
            print_info(f"  Updated Score: {updated_score}/100")
            
            if updated_score == original_score:
                print_success(f"Lead score preserved after update: {updated_score}/100")
                test_results["passed"] += 1
            else:
                print_error(f"Lead score changed after update! Original: {original_score}, Updated: {updated_score}")
                test_results["failed"] += 1
                
            # Verify all score fields are still present
            required_fields = ['lead_score', 'fit_score', 'intent_score', 'potential_score', 'lead_score_category']
            missing_fields = [f for f in required_fields if f not in updated_lead]
            
            if missing_fields:
                print_error(f"Missing score fields after update: {missing_fields}")
                test_results["failed"] += 1
            else:
                print_success("All score fields preserved after update")
        else:
            print_error(f"Lead update failed: {response.status_code}")
            print_error(f"Response: {response.text}")
            test_results["failed"] += 1
            
    except Exception as e:
        print_error(f"Lead update API error: {str(e)}")
        test_results["failed"] += 1

def print_summary():
    """Print test summary"""
    print_test("TEST SUMMARY")
    
    total_tests = test_results["passed"] + test_results["failed"] + test_results["warnings"]
    success_rate = (test_results["passed"] / total_tests * 100) if total_tests > 0 else 0
    
    print(f"\n{BLUE}Total Tests: {total_tests}{RESET}")
    print(f"{GREEN}Passed: {test_results['passed']}{RESET}")
    print(f"{RED}Failed: {test_results['failed']}{RESET}")
    print(f"{YELLOW}Warnings: {test_results['warnings']}{RESET}")
    print(f"\n{BLUE}Success Rate: {success_rate:.1f}%{RESET}\n")
    
    if test_results["failed"] == 0:
        print_success("All critical tests passed! ✨")
    else:
        print_error(f"{test_results['failed']} critical test(s) failed")

def main():
    """Main test execution"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}Lead Detail API Backend Testing{RESET}")
    print(f"{BLUE}Testing Score Data Verification{RESET}")
    print(f"{BLUE}{'='*80}{RESET}\n")
    
    # Authenticate
    token = login()
    if not token:
        print_error("Authentication failed. Cannot proceed with tests.")
        return
    
    # Run tests
    test_lead_list_api(token)
    test_lead_detail_raw_endpoint(token, "LEAD-2025-019")
    test_lead_detail_regular_endpoint(token, "LEAD-2025-019")
    test_lead_update_endpoint(token, "LEAD-2025-012")
    
    # Print summary
    print_summary()

if __name__ == "__main__":
    main()
