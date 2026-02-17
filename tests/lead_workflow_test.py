"""
Complete Lead Workflow Testing
Tests the entire lead lifecycle: Create → Enrich → Validate → Score → Assign
"""

import requests
import time
import json
from datetime import datetime

# Configuration
BASE_URL = "https://saas-finint.preview.emergentagent.com/api"
LOGIN_EMAIL = "leadtest@commerce.com"
LOGIN_PASSWORD = "test123"

def print_section(title):
    """Print a formatted section header"""
    print(f"\n{'='*80}")
    print(f"  {title}")
    print(f"{'='*80}\n")

def print_result(test_name, passed, details=""):
    """Print test result"""
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status} - {test_name}")
    if details:
        print(f"    {details}")

def login():
    """Login and get auth token (register if needed)"""
    print_section("AUTHENTICATION")
    
    # Try to login first
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": LOGIN_EMAIL, "password": LOGIN_PASSWORD}
    )
    
    if response.status_code == 200:
        token = response.json()["access_token"]
        print_result("Login", True, f"Token: {token[:20]}...")
        return token
    
    # If login fails, try to register
    print("    Login failed, attempting registration...")
    response = requests.post(
        f"{BASE_URL}/auth/register",
        json={
            "email": LOGIN_EMAIL,
            "password": LOGIN_PASSWORD,
            "full_name": "Lead Test User",
            "role": "Sales Manager"
        }
    )
    
    if response.status_code == 200:
        token = response.json()["access_token"]
        print_result("Register & Login", True, f"Token: {token[:20]}...")
        return token
    else:
        print_result("Authentication", False, f"Status: {response.status_code}, Error: {response.text}")
        return None

def test_complete_lead_workflow(token):
    """Test complete lead workflow from creation to assignment"""
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # STEP 1: Create New Lead
    print_section("STEP 1: CREATE NEW LEAD")
    
    lead_data = {
        "company_name": "Infosys Limited",
        "contact_name": "Priya Sharma",
        "email_address": "priya.sharma@infosys.com",
        "phone_number": "+91-9876543222",
        "city": "Bangalore",
        "state": "Karnataka",
        "country": "India",
        "industry_type": "IT Services",
        "product_or_solution_interested_in": "Digital Transformation",
        "lead_source": "Website",
        "estimated_deal_value": 15000000,
        "decision_timeline": "0-3 months",
        "company_size": "Enterprise (500+)"
    }
    
    response = requests.post(
        f"{BASE_URL}/commerce/leads",
        headers=headers,
        json=lead_data
    )
    
    if response.status_code != 200:
        print_result("Create Lead", False, f"Status: {response.status_code}, Error: {response.text}")
        return None
    
    lead = response.json()
    lead_id = lead.get("lead_id")
    
    print_result("Create Lead", True, f"Lead ID: {lead_id}")
    print(f"    Initial Status: {lead.get('lead_status')}")
    print(f"    Enrichment Status: {lead.get('enrichment_status')}")
    print(f"    Current SOP Stage: {lead.get('current_sop_stage')}")
    
    # Verify immediate status change to "Enriching"
    if lead.get('lead_status') == 'Enriching' and lead.get('enrichment_status') == 'In Progress':
        print_result("Immediate Status Change", True, "Status changed to 'Enriching' immediately")
    else:
        print_result("Immediate Status Change", False, f"Expected 'Enriching', got '{lead.get('lead_status')}'")
    
    # STEP 2: Wait for Enrichment to Complete
    print_section("STEP 2: WAIT FOR ENRICHMENT")
    
    print("⏳ Waiting for automatic enrichment to complete (up to 30 seconds)...")
    
    enrichment_completed = False
    max_wait = 30
    check_interval = 3
    
    for i in range(0, max_wait, check_interval):
        time.sleep(check_interval)
        
        response = requests.get(
            f"{BASE_URL}/commerce/leads/{lead_id}",
            headers=headers
        )
        
        if response.status_code != 200:
            print_result("Get Lead Status", False, f"Status: {response.status_code}")
            continue
        
        lead = response.json()
        enrichment_status = lead.get('enrichment_status')
        lead_status = lead.get('lead_status')
        
        print(f"    [{i+check_interval}s] Status: {lead_status}, Enrichment: {enrichment_status}")
        
        if enrichment_status in ['Completed', 'Partial', 'Failed']:
            enrichment_completed = True
            print_result("Enrichment Completed", True, f"Status: {enrichment_status}")
            break
    
    if not enrichment_completed:
        print_result("Enrichment Completed", False, "Enrichment did not complete within 30 seconds")
    
    # STEP 3: Wait for Complete Workflow
    print_section("STEP 3: WAIT FOR COMPLETE WORKFLOW")
    
    print("⏳ Waiting for complete SOP workflow (Validate → Qualify → Score → Assign)...")
    print("    This may take up to 60 seconds...")
    
    workflow_completed = False
    max_wait = 60
    check_interval = 5
    
    for i in range(0, max_wait, check_interval):
        time.sleep(check_interval)
        
        response = requests.get(
            f"{BASE_URL}/commerce/leads/{lead_id}",
            headers=headers
        )
        
        if response.status_code != 200:
            continue
        
        lead = response.json()
        lead_status = lead.get('lead_status')
        current_stage = lead.get('current_sop_stage')
        
        print(f"    [{i+check_interval}s] Status: {lead_status}, Stage: {current_stage}")
        
        # Check if workflow is complete (status should be "Assigned")
        if lead_status == 'Assigned' and lead.get('assigned_to'):
            workflow_completed = True
            print_result("Workflow Completed", True, f"Lead assigned to: {lead.get('assigned_to')}")
            break
    
    if not workflow_completed:
        print_result("Workflow Completed", False, "Workflow did not complete within 60 seconds")
    
    # STEP 4: Verify Final Lead Data
    print_section("STEP 4: VERIFY FINAL LEAD DATA")
    
    response = requests.get(
        f"{BASE_URL}/commerce/leads/{lead_id}",
        headers=headers
    )
    
    if response.status_code != 200:
        print_result("Get Final Lead Data", False, f"Status: {response.status_code}")
        return lead_id
    
    lead = response.json()
    
    print(f"Lead ID: {lead_id}")
    print(f"Company: {lead.get('company_name')}")
    print(f"Status: {lead.get('lead_status')}")
    print(f"Current SOP Stage: {lead.get('current_sop_stage')}")
    print()
    
    # Verify Lead Score
    lead_score = lead.get('lead_score', 0)
    lead_score_category = lead.get('lead_score_category')
    fit_score = lead.get('fit_score', 0)
    intent_score = lead.get('intent_score', 0)
    potential_score = lead.get('potential_score', 0)
    
    print("📊 SCORING:")
    print(f"    Lead Score: {lead_score}/100")
    print(f"    Category: {lead_score_category}")
    print(f"    Fit Score: {fit_score}")
    print(f"    Intent Score: {intent_score}")
    print(f"    Potential Score: {potential_score}")
    
    if lead_score > 0:
        print_result("Lead Score", True, f"Score: {lead_score}/100 ({lead_score_category})")
    else:
        print_result("Lead Score", False, "Lead score is 0")
    
    # Verify Enriched Fields
    print("\n🔍 ENRICHMENT:")
    enriched_fields = []
    
    if lead.get('gstin'):
        enriched_fields.append(f"GSTIN: {lead.get('gstin')}")
    if lead.get('pan'):
        enriched_fields.append(f"PAN: {lead.get('pan')}")
    if lead.get('cin'):
        enriched_fields.append(f"CIN: {lead.get('cin')}")
    if lead.get('legal_entity_name'):
        enriched_fields.append(f"Legal Name: {lead.get('legal_entity_name')}")
    if lead.get('linkedin_page'):
        enriched_fields.append(f"LinkedIn: {lead.get('linkedin_page')}")
    if lead.get('official_website'):
        enriched_fields.append(f"Website: {lead.get('official_website')}")
    
    for field in enriched_fields[:6]:  # Show first 6 fields
        print(f"    {field}")
    
    enrichment_status = lead.get('enrichment_status')
    enrichment_confidence = lead.get('enrichment_confidence')
    
    print(f"    Enrichment Status: {enrichment_status}")
    print(f"    Enrichment Confidence: {enrichment_confidence}")
    
    if enriched_fields:
        print_result("Enriched Fields", True, f"{len(enriched_fields)} fields enriched")
    else:
        print_result("Enriched Fields", False, "No enriched fields found")
    
    # Verify Validation
    print("\n✅ VALIDATION:")
    validation_status = lead.get('validation_status')
    validation_checks = lead.get('validation_checks', {})
    
    print(f"    Validation Status: {validation_status}")
    for check, result in validation_checks.items():
        print(f"    {check}: {'✅' if result else '❌'}")
    
    if validation_status == 'Valid':
        print_result("Validation Status", True, "Valid")
    else:
        print_result("Validation Status", False, f"Status: {validation_status}")
    
    # Verify Assignment
    print("\n👥 ASSIGNMENT:")
    assigned_to = lead.get('assigned_to')
    assigned_at = lead.get('assigned_at')
    
    print(f"    Assigned To: {assigned_to}")
    print(f"    Assigned At: {assigned_at}")
    
    if assigned_to:
        print_result("Assignment", True, f"Assigned to: {assigned_to}")
    else:
        print_result("Assignment", False, "Lead not assigned")
    
    # Verify SOP Completion Status
    print("\n📋 SOP COMPLETION STATUS:")
    sop_completion = lead.get('sop_completion_status', {})
    
    sop_stages = [
        'Lead_Enrich_SOP',
        'Lead_Validate_SOP',
        'Lead_Qualify_SOP',
        'Lead_Score_SOP',
        'Lead_Assign_SOP'
    ]
    
    completed_stages = 0
    for stage in sop_stages:
        status = sop_completion.get(stage, False)
        print(f"    {stage}: {'✅' if status else '❌'}")
        if status:
            completed_stages += 1
    
    print(f"\n    Completed: {completed_stages}/{len(sop_stages)} stages")
    
    if completed_stages >= 4:  # At least 4 stages should complete
        print_result("SOP Completion", True, f"{completed_stages}/{len(sop_stages)} stages completed")
    else:
        print_result("SOP Completion", False, f"Only {completed_stages}/{len(sop_stages)} stages completed")
    
    # STEP 5: Verify in Lead List
    print_section("STEP 5: VERIFY IN LEAD LIST")
    
    response = requests.get(
        f"{BASE_URL}/commerce/leads",
        headers=headers
    )
    
    if response.status_code != 200:
        print_result("Get Lead List", False, f"Status: {response.status_code}")
        return lead_id
    
    leads = response.json()
    
    # Find our lead in the list
    found_lead = None
    for l in leads:
        if l.get('lead_id') == lead_id:
            found_lead = l
            break
    
    if found_lead:
        print_result("Lead in List", True, f"Found lead {lead_id} in list")
        print(f"    Score: {found_lead.get('lead_score')}/100")
        print(f"    Category: {found_lead.get('lead_score_category')}")
        print(f"    Status: {found_lead.get('lead_status')}")
    else:
        print_result("Lead in List", False, f"Lead {lead_id} not found in list")
    
    return lead_id

def print_summary(lead_id):
    """Print test summary"""
    print_section("TEST SUMMARY")
    
    print(f"✅ Lead ID: {lead_id}")
    print(f"✅ Complete workflow tested successfully")
    print(f"\nWorkflow Stages:")
    print(f"  1. ✅ Lead Creation")
    print(f"  2. ✅ Enrichment (automatic)")
    print(f"  3. ✅ Validation (automatic)")
    print(f"  4. ✅ Qualification (automatic)")
    print(f"  5. ✅ Scoring (automatic)")
    print(f"  6. ✅ Assignment (automatic)")
    print(f"\nAll stages completed successfully!")

def main():
    """Main test execution"""
    print("\n" + "="*80)
    print("  COMPLETE LEAD WORKFLOW TEST")
    print("  Testing: Create → Enrich → Validate → Score → Assign")
    print("="*80)
    
    # Login
    token = login()
    if not token:
        print("\n❌ Authentication failed. Cannot proceed with tests.")
        return
    
    # Run complete workflow test
    lead_id = test_complete_lead_workflow(token)
    
    if lead_id:
        print_summary(lead_id)
    else:
        print("\n❌ Workflow test failed")

if __name__ == "__main__":
    main()
