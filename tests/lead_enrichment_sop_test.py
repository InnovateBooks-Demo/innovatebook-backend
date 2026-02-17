"""
URGENT: Lead Creation & Enrichment Flow Testing
Tests immediate status change and SOP workflow progression
"""

import asyncio
import aiohttp
import json
from datetime import datetime
import time

# Backend URL from environment
BACKEND_URL = "https://saas-finint.preview.emergentagent.com/api"

# Test credentials
TEST_EMAIL = "demo@innovatebooks.com"
TEST_PASSWORD = os.getenv("TEST_PASSWORD", "Test1234")   # or demo123 as default


# Global token storage
auth_token = None


async def login():
    """Login and get auth token"""
    global auth_token
    
    url = f"{BACKEND_URL}/auth/login"
    payload = {
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    }
    
    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=payload) as response:
            if response.status == 200:
                data = await response.json()
                auth_token = data.get('access_token')
                print(f"✅ Login successful")
                return True
            else:
                print(f"❌ Login failed: {response.status}")
                return False


async def create_lead_and_check_immediate_status():
    """
    TEST 1: Create Lead and Verify IMMEDIATE Status Change
    """
    print("\n" + "="*80)
    print("TEST 1: CREATE LEAD AND VERIFY IMMEDIATE STATUS CHANGE")
    print("="*80)
    
    url = f"{BACKEND_URL}/commerce/leads"
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Lead payload as specified in review request
    payload = {
        "company_name": "HCL Technologies",
        "industry_type": "Technology",
        "company_size": "Enterprise (500+)",
        "country": "India",
        "state": "Uttar Pradesh",
        "city": "Noida",
        "website_url": "https://www.hcltech.com",
        "contact_name": "Test Contact",
        "email_address": "contact@hcltech.com",
        "phone_number": "+91 9999999999",
        "designation": "Manager",
        "department": "Sales",
        "lead_source": "Website",
        "product_or_solution_interested_in": "Cloud Solutions",
        "estimated_deal_value": 5000000,
        "decision_timeline": "0-3 months"
    }
    
    print(f"\n📤 Creating lead for: {payload['company_name']}")
    print(f"   Deal Value: ₹{payload['estimated_deal_value']:,}")
    print(f"   Timeline: {payload['decision_timeline']}")
    
    async with aiohttp.ClientSession() as session:
        # Create lead
        start_time = time.time()
        async with session.post(url, json=payload, headers=headers) as response:
            create_time = time.time() - start_time
            
            if response.status != 200:
                print(f"❌ Lead creation failed: {response.status}")
                text = await response.text()
                print(f"   Error: {text}")
                return None
            
            lead_data = await response.json()
            lead_id = lead_data.get('lead_id')
            
            print(f"\n✅ Lead created: {lead_id}")
            print(f"   Response time: {create_time:.2f}s")
            print(f"\n📊 IMMEDIATE RESPONSE CHECK:")
            print(f"   lead_status: {lead_data.get('lead_status')}")
            print(f"   enrichment_status: {lead_data.get('enrichment_status')}")
            print(f"   current_sop_stage: {lead_data.get('current_sop_stage')}")
            
            # Check if status is immediately "Enriching"
            if lead_data.get('lead_status') == 'Enriching':
                print(f"   ✅ PASS: Status is 'Enriching' IMMEDIATELY")
            else:
                print(f"   ❌ FAIL: Status is '{lead_data.get('lead_status')}' (expected 'Enriching')")
            
            if lead_data.get('enrichment_status') == 'In Progress':
                print(f"   ✅ PASS: Enrichment status is 'In Progress' IMMEDIATELY")
            else:
                print(f"   ❌ FAIL: Enrichment status is '{lead_data.get('enrichment_status')}' (expected 'In Progress')")
            
            # Wait 2 seconds and check again
            print(f"\n⏳ Waiting 2 seconds...")
            await asyncio.sleep(2)
            
            async with session.get(f"{url}/{lead_id}", headers=headers) as response2:
                if response2.status == 200:
                    lead_data_2s = await response2.json()
                    print(f"\n📊 STATUS AFTER 2 SECONDS:")
                    print(f"   lead_status: {lead_data_2s.get('lead_status')}")
                    print(f"   enrichment_status: {lead_data_2s.get('enrichment_status')}")
                    
                    if lead_data_2s.get('lead_status') == 'Enriching':
                        print(f"   ✅ Status still 'Enriching' (expected)")
                    else:
                        print(f"   ⚠️ Status changed to '{lead_data_2s.get('lead_status')}'")
            
            # Wait 8 more seconds (total 10 seconds) and check enrichment completion
            print(f"\n⏳ Waiting 8 more seconds (total 10s)...")
            await asyncio.sleep(8)
            
            async with session.get(f"{url}/{lead_id}", headers=headers) as response3:
                if response3.status == 200:
                    lead_data_10s = await response3.json()
                    print(f"\n📊 STATUS AFTER 10 SECONDS:")
                    print(f"   lead_status: {lead_data_10s.get('lead_status')}")
                    print(f"   enrichment_status: {lead_data_10s.get('enrichment_status')}")
                    print(f"   current_sop_stage: {lead_data_10s.get('current_sop_stage')}")
                    
                    enrichment_data = lead_data_10s.get('enrichment_data')
                    if enrichment_data:
                        print(f"\n   ✅ Enrichment data populated:")
                        print(f"      Status: {enrichment_data.get('status')}")
                        print(f"      Confidence: {enrichment_data.get('confidence_score')}%")
                        print(f"      Data sources: {enrichment_data.get('data_sources')}")
                    else:
                        print(f"   ❌ Enrichment data NOT populated")
                    
                    sop_status = lead_data_10s.get('sop_completion_status', {})
                    print(f"\n   📋 SOP Completion Status:")
                    print(f"      Lead_Enrich_SOP: {sop_status.get('Lead_Enrich_SOP', False)}")
                    
                    if sop_status.get('Lead_Enrich_SOP'):
                        print(f"      ✅ Lead_Enrich_SOP marked as complete")
                    else:
                        print(f"      ❌ Lead_Enrich_SOP NOT marked as complete")
            
            return lead_id


async def test_sop_workflow(lead_id):
    """
    TEST 2: Verify SOP Workflow Actions
    """
    print("\n" + "="*80)
    print("TEST 2: VERIFY SOP WORKFLOW ACTIONS")
    print("="*80)
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    async with aiohttp.ClientSession() as session:
        # Test 1: Validate SOP
        print(f"\n🔍 TEST 2.1: VALIDATE SOP")
        url = f"{BACKEND_URL}/commerce/leads/{lead_id}/validate"
        async with session.post(url, headers=headers) as response:
            if response.status == 200:
                data = await response.json()
                print(f"   ✅ Validate SOP successful")
                print(f"      Validation status: {data.get('validation_status')}")
                print(f"      Checks: {data.get('validation_checks')}")
                
                # Get lead to verify status change
                async with session.get(f"{BACKEND_URL}/commerce/leads/{lead_id}", headers=headers) as resp:
                    if resp.status == 200:
                        lead = await resp.json()
                        print(f"      Lead status: {lead.get('lead_status')}")
                        print(f"      SOP stage: {lead.get('current_sop_stage')}")
                        
                        if lead.get('lead_status') == 'Validated':
                            print(f"      ✅ Lead status changed to 'Validated'")
                        else:
                            print(f"      ❌ Lead status is '{lead.get('lead_status')}' (expected 'Validated')")
                        
                        sop_status = lead.get('sop_completion_status', {})
                        if sop_status.get('Lead_Validate_SOP'):
                            print(f"      ✅ Lead_Validate_SOP marked as complete")
                        else:
                            print(f"      ❌ Lead_Validate_SOP NOT marked as complete")
            else:
                print(f"   ❌ Validate SOP failed: {response.status}")
                text = await response.text()
                print(f"      Error: {text}")
        
        # Test 2: Qualify SOP
        print(f"\n🎯 TEST 2.2: QUALIFY SOP")
        url = f"{BACKEND_URL}/commerce/leads/{lead_id}/qualify"
        async with session.post(url, headers=headers) as response:
            if response.status == 200:
                data = await response.json()
                print(f"   ✅ Qualify SOP successful")
                print(f"      Lead score: {data.get('lead_score')}/100")
                print(f"      Category: {data.get('category')}")
                breakdown = data.get('breakdown', {})
                print(f"      Breakdown:")
                print(f"         Fit: {breakdown.get('fit_score')}/40")
                print(f"         Intent: {breakdown.get('intent_score')}/30")
                print(f"         Potential: {breakdown.get('potential_score')}/30")
                
                # Get lead to verify status change
                async with session.get(f"{BACKEND_URL}/commerce/leads/{lead_id}", headers=headers) as resp:
                    if resp.status == 200:
                        lead = await resp.json()
                        print(f"      Lead status: {lead.get('lead_status')}")
                        
                        if lead.get('lead_status') == 'Qualified':
                            print(f"      ✅ Lead status changed to 'Qualified'")
                        else:
                            print(f"      ❌ Lead status is '{lead.get('lead_status')}' (expected 'Qualified')")
                        
                        sop_status = lead.get('sop_completion_status', {})
                        if sop_status.get('Lead_Qualify_SOP'):
                            print(f"      ✅ Lead_Qualify_SOP marked as complete")
                        else:
                            print(f"      ❌ Lead_Qualify_SOP NOT marked as complete")
            else:
                print(f"   ❌ Qualify SOP failed: {response.status}")
                text = await response.text()
                print(f"      Error: {text}")
        
        # Test 3: Assign SOP
        print(f"\n👤 TEST 2.3: ASSIGN SOP")
        url = f"{BACKEND_URL}/commerce/leads/{lead_id}/assign"
        payload = {"assigned_to": "Sales Rep 1"}
        async with session.post(url, json=payload, headers=headers) as response:
            if response.status == 200:
                data = await response.json()
                print(f"   ✅ Assign SOP successful")
                print(f"      Assigned to: {data.get('assigned_to')}")
                print(f"      Assignment method: {data.get('assignment_method')}")
                print(f"      Follow-up due: {data.get('follow_up_due')}")
                
                # Get lead to verify status change
                async with session.get(f"{BACKEND_URL}/commerce/leads/{lead_id}", headers=headers) as resp:
                    if resp.status == 200:
                        lead = await resp.json()
                        print(f"      Lead status: {lead.get('lead_status')}")
                        print(f"      Assigned to: {lead.get('assigned_to')}")
                        
                        if lead.get('lead_status') == 'Assigned':
                            print(f"      ✅ Lead status changed to 'Assigned'")
                        else:
                            print(f"      ❌ Lead status is '{lead.get('lead_status')}' (expected 'Assigned')")
                        
                        if lead.get('assigned_to'):
                            print(f"      ✅ assigned_to field updated")
                        else:
                            print(f"      ❌ assigned_to field NOT updated")
                        
                        sop_status = lead.get('sop_completion_status', {})
                        if sop_status.get('Lead_Assign_SOP'):
                            print(f"      ✅ Lead_Assign_SOP marked as complete")
                        else:
                            print(f"      ❌ Lead_Assign_SOP NOT marked as complete")
            else:
                print(f"   ❌ Assign SOP failed: {response.status}")
                text = await response.text()
                print(f"      Error: {text}")


async def check_backend_logs():
    """
    TEST 3: Check Backend Logs
    """
    print("\n" + "="*80)
    print("TEST 3: CHECK BACKEND LOGS")
    print("="*80)
    print("\n📋 Expected log messages:")
    print("   • '🚀 Lead {lead_id} created with status 'Enriching''")
    print("   • '🚀 Background enrichment started for Lead: {lead_id}'")
    print("   • '🔍 Starting enrichment for: {company_name}'")
    print("   • '✅ Lead {lead_id} enrichment completed'")
    print("\n⚠️ Note: Log checking requires server access. Please check manually:")
    print("   Command: tail -n 100 /var/log/supervisor/backend.*.log")


async def main():
    """Main test execution"""
    print("\n" + "="*80)
    print("URGENT: LEAD CREATION & ENRICHMENT FLOW TESTING")
    print("="*80)
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Test User: {TEST_EMAIL}")
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Login
    if not await login():
        print("\n❌ Login failed. Cannot proceed with tests.")
        return
    
    # Test 1: Create lead and check immediate status
    lead_id = await create_lead_and_check_immediate_status()
    
    if not lead_id:
        print("\n❌ Lead creation failed. Cannot proceed with SOP tests.")
        return
    
    # Test 2: Verify SOP workflow
    await test_sop_workflow(lead_id)
    
    # Test 3: Backend logs
    await check_backend_logs()
    
    # Final summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    print("\n✅ Tests completed. Please review results above.")
    print("\n📝 Key Points to Verify:")
    print("   1. Lead status should be 'Enriching' IMMEDIATELY after creation")
    print("   2. Enrichment should complete within 10 seconds")
    print("   3. All SOP actions should update status correctly")
    print("   4. sop_completion_status should track progress")
    print("\n⚠️ If any tests failed, check backend logs for errors.")


if __name__ == "__main__":
    asyncio.run(main())
