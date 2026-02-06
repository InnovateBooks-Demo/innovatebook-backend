"""
Backend Testing for IB Commerce Govern Module
Tests all Govern module endpoints with authentication
"""

import requests
import json
from datetime import datetime

# Backend URL from environment
BACKEND_URL = "https://saas-finint.preview.emergentagent.com/api"

# Test credentials
TEST_EMAIL = "demo@innovatebooks.com"
TEST_PASSWORD = os.getenv("TEST_PASSWORD", "Test1234")   # or demo123 as default


# Global token storage
auth_token = None

def print_section(title):
    """Print a formatted section header"""
    print("\n" + "="*80)
    print(f"  {title}")
    print("="*80)

def print_test(test_name, passed, details=""):
    """Print test result"""
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status}: {test_name}")
    if details:
        print(f"     {details}")

def login():
    """Login and get authentication token"""
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
            print_test("Login", True, f"Token obtained for {TEST_EMAIL}")
            return True
        else:
            print_test("Login", False, f"Status: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        print_test("Login", False, f"Exception: {str(e)}")
        return False

def get_headers():
    """Get headers with authentication token"""
    return {
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json"
    }

def test_list_all_governance():
    """Test GET /api/commerce/govern - List all governance records"""
    print_section("TEST 1: List All Governance Records")
    
    try:
        response = requests.get(
            f"{BACKEND_URL}/commerce/govern",
            headers=get_headers(),
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print_test("GET /api/commerce/govern", True, f"Retrieved {len(data)} governance records")
            
            # Verify we have 5 seeded records
            if len(data) == 5:
                print_test("Seeded Data Count", True, "Found 5 governance records as expected")
            else:
                print_test("Seeded Data Count", False, f"Expected 5 records, found {len(data)}")
            
            # Verify record IDs
            expected_ids = ["GOV-2025-001", "GOV-2025-002", "GOV-2025-003", "GOV-2025-004", "GOV-2025-005"]
            found_ids = [record.get("govern_id") for record in data]
            
            all_ids_present = all(expected_id in found_ids for expected_id in expected_ids)
            if all_ids_present:
                print_test("Governance IDs", True, f"All expected IDs present: {', '.join(expected_ids)}")
            else:
                print_test("Governance IDs", False, f"Missing IDs. Found: {', '.join(found_ids)}")
            
            # Verify types
            types = [record.get("sop_type") for record in data]
            expected_types = ["Process", "Policy", "Control"]
            types_valid = all(t in expected_types for t in types)
            if types_valid:
                print_test("Governance Types", True, f"Valid types found: {set(types)}")
            else:
                print_test("Governance Types", False, f"Invalid types: {set(types)}")
            
            # Verify statuses
            statuses = [record.get("sop_status") for record in data]
            expected_statuses = ["Draft", "Active", "Under Review", "Archived"]
            statuses_valid = all(s in expected_statuses for s in statuses)
            if statuses_valid:
                print_test("Governance Statuses", True, f"Valid statuses found: {set(statuses)}")
            else:
                print_test("Governance Statuses", False, f"Invalid statuses: {set(statuses)}")
            
            # Verify required fields
            print("\n  Sample Record (GOV-2025-001):")
            sample = next((r for r in data if r.get("govern_id") == "GOV-2025-001"), None)
            if sample:
                print(f"    SOP Name: {sample.get('sop_name')}")
                print(f"    Type: {sample.get('sop_type')}")
                print(f"    Status: {sample.get('sop_status')}")
                print(f"    Owner: {sample.get('sop_owner')}")
                print(f"    Control Objectives: {len(sample.get('control_objectives', []))} items")
                print(f"    Compliance Frameworks: {sample.get('compliance_framework', [])}")
                print(f"    SLA Compliance: {sample.get('sla_compliance_percent')}%")
            
            return True
        else:
            print_test("GET /api/commerce/govern", False, f"Status: {response.status_code}, Response: {response.text[:200]}")
            return False
    except Exception as e:
        print_test("GET /api/commerce/govern", False, f"Exception: {str(e)}")
        return False

def test_filter_by_status():
    """Test GET /api/commerce/govern?status=Active - Filter by status"""
    print_section("TEST 2: Filter Governance by Status")
    
    statuses_to_test = ["Active", "Draft", "Under Review"]
    all_passed = True
    
    for status in statuses_to_test:
        try:
            response = requests.get(
                f"{BACKEND_URL}/commerce/govern?status={status}",
                headers=get_headers(),
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify all records have the requested status
                all_match = all(record.get("sop_status") == status for record in data)
                
                if all_match:
                    print_test(f"Filter by status='{status}'", True, f"Found {len(data)} records with status '{status}'")
                else:
                    print_test(f"Filter by status='{status}'", False, "Some records don't match the filter")
                    all_passed = False
            else:
                print_test(f"Filter by status='{status}'", False, f"Status: {response.status_code}")
                all_passed = False
        except Exception as e:
            print_test(f"Filter by status='{status}'", False, f"Exception: {str(e)}")
            all_passed = False
    
    return all_passed

def test_get_governance_details():
    """Test GET /api/commerce/govern/{govern_id} - Get governance details"""
    print_section("TEST 3: Get Governance Details for GOV-2025-001")
    
    try:
        response = requests.get(
            f"{BACKEND_URL}/commerce/govern/GOV-2025-001",
            headers=get_headers(),
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print_test("GET /api/commerce/govern/GOV-2025-001", True, "Retrieved governance details")
            
            # Verify required fields
            required_fields = [
                "govern_id", "sop_name", "sop_type", "sop_status", "sop_owner",
                "control_objectives", "compliance_framework", "sla_compliance_percent"
            ]
            
            missing_fields = [field for field in required_fields if field not in data]
            
            if not missing_fields:
                print_test("Required Fields Present", True, f"All {len(required_fields)} required fields present")
            else:
                print_test("Required Fields Present", False, f"Missing fields: {missing_fields}")
            
            # Display detailed information
            print("\n  Governance Record Details:")
            print(f"    ID: {data.get('govern_id')}")
            print(f"    Name: {data.get('sop_name')}")
            print(f"    Type: {data.get('sop_type')}")
            print(f"    Status: {data.get('sop_status')}")
            print(f"    Version: {data.get('sop_version')}")
            print(f"    Owner: {data.get('sop_owner')}")
            print(f"    Department: {data.get('department')}")
            print(f"    Effective Date: {data.get('effective_date')}")
            
            print(f"\n  Control Objectives ({len(data.get('control_objectives', []))}):")
            for obj in data.get('control_objectives', []):
                print(f"    - {obj}")
            
            print(f"\n  Compliance Frameworks: {', '.join(data.get('compliance_framework', []))}")
            
            print(f"\n  Performance Metrics:")
            print(f"    SLA Defined: {data.get('sla_defined')}")
            print(f"    SLA Compliance: {data.get('sla_compliance_percent')}%")
            print(f"    Breach Count: {data.get('breach_count')}")
            print(f"    Total Runs: {data.get('total_runs')}")
            print(f"    Successful Runs: {data.get('successful_runs')}")
            print(f"    Failed Runs: {data.get('failed_runs')}")
            
            # Verify control objectives are present
            if len(data.get('control_objectives', [])) > 0:
                print_test("Control Objectives", True, f"Found {len(data.get('control_objectives', []))} control objectives")
            else:
                print_test("Control Objectives", False, "No control objectives found")
            
            # Verify compliance frameworks are present
            if len(data.get('compliance_framework', [])) > 0:
                print_test("Compliance Frameworks", True, f"Found {len(data.get('compliance_framework', []))} frameworks")
            else:
                print_test("Compliance Frameworks", False, "No compliance frameworks found")
            
            # Verify SLA compliance metrics
            if data.get('sla_compliance_percent') is not None:
                print_test("SLA Compliance Metrics", True, f"SLA Compliance: {data.get('sla_compliance_percent')}%")
            else:
                print_test("SLA Compliance Metrics", False, "SLA compliance metrics missing")
            
            return True
        else:
            print_test("GET /api/commerce/govern/GOV-2025-001", False, f"Status: {response.status_code}, Response: {response.text[:200]}")
            return False
    except Exception as e:
        print_test("GET /api/commerce/govern/GOV-2025-001", False, f"Exception: {str(e)}")
        return False

def test_status_workflow():
    """Test PATCH /api/commerce/govern/{govern_id}/status - Test status workflow"""
    print_section("TEST 4: Status Workflow Transitions")
    
    # We'll test with GOV-2025-005 which is in Draft status
    govern_id = "GOV-2025-005"
    
    # Test workflow: Draft → Active → Under Review → Archived
    workflow_transitions = [
        ("Active", "Draft → Active"),
        ("Under Review", "Active → Under Review"),
        ("Archived", "Under Review → Archived")
    ]
    
    all_passed = True
    
    for new_status, transition_name in workflow_transitions:
        try:
            response = requests.patch(
                f"{BACKEND_URL}/commerce/govern/{govern_id}/status?status={new_status}",
                headers=get_headers(),
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get("sop_status") == new_status:
                    print_test(f"Status Transition: {transition_name}", True, f"Status updated to '{new_status}'")
                else:
                    print_test(f"Status Transition: {transition_name}", False, f"Expected '{new_status}', got '{data.get('sop_status')}'")
                    all_passed = False
            else:
                print_test(f"Status Transition: {transition_name}", False, f"Status: {response.status_code}, Response: {response.text[:200]}")
                all_passed = False
        except Exception as e:
            print_test(f"Status Transition: {transition_name}", False, f"Exception: {str(e)}")
            all_passed = False
    
    # Test invalid status
    try:
        response = requests.patch(
            f"{BACKEND_URL}/commerce/govern/{govern_id}/status?status=InvalidStatus",
            headers=get_headers(),
            timeout=10
        )
        
        if response.status_code == 400:
            print_test("Invalid Status Rejection", True, "Invalid status correctly rejected with 400 error")
        else:
            print_test("Invalid Status Rejection", False, f"Expected 400, got {response.status_code}")
            all_passed = False
    except Exception as e:
        print_test("Invalid Status Rejection", False, f"Exception: {str(e)}")
        all_passed = False
    
    return all_passed

def test_update_governance():
    """Test PUT /api/commerce/govern/{govern_id} - Update governance record"""
    print_section("TEST 5: Update Governance Record")
    
    govern_id = "GOV-2025-002"
    
    # First, get the current record
    try:
        response = requests.get(
            f"{BACKEND_URL}/commerce/govern/{govern_id}",
            headers=get_headers(),
            timeout=10
        )
        
        if response.status_code != 200:
            print_test("Get Current Record", False, f"Failed to retrieve record: {response.status_code}")
            return False
        
        current_data = response.json()
        print_test("Get Current Record", True, f"Retrieved {govern_id}")
        
        # Update the record
        update_payload = {
            "sop_name": "Vendor Payment Authorization - Updated",
            "sop_type": current_data.get("sop_type"),
            "sop_owner": "Updated AP Manager",
            "effective_date": current_data.get("effective_date")
        }
        
        response = requests.put(
            f"{BACKEND_URL}/commerce/govern/{govern_id}",
            headers=get_headers(),
            json=update_payload,
            timeout=10
        )
        
        if response.status_code == 200:
            updated_data = response.json()
            
            # Verify the update
            if updated_data.get("sop_name") == "Vendor Payment Authorization - Updated":
                print_test("Update SOP Name", True, "SOP name updated successfully")
            else:
                print_test("Update SOP Name", False, f"Expected updated name, got '{updated_data.get('sop_name')}'")
            
            if updated_data.get("sop_owner") == "Updated AP Manager":
                print_test("Update SOP Owner", True, "SOP owner updated successfully")
            else:
                print_test("Update SOP Owner", False, f"Expected updated owner, got '{updated_data.get('sop_owner')}'")
            
            # Verify updated_at timestamp changed
            if updated_data.get("updated_at") != current_data.get("updated_at"):
                print_test("Updated Timestamp", True, "updated_at timestamp changed")
            else:
                print_test("Updated Timestamp", False, "updated_at timestamp did not change")
            
            print(f"\n  Updated Record:")
            print(f"    SOP Name: {updated_data.get('sop_name')}")
            print(f"    SOP Owner: {updated_data.get('sop_owner')}")
            print(f"    Updated At: {updated_data.get('updated_at')}")
            
            return True
        else:
            print_test("PUT /api/commerce/govern/{govern_id}", False, f"Status: {response.status_code}, Response: {response.text[:200]}")
            return False
    except Exception as e:
        print_test("PUT /api/commerce/govern/{govern_id}", False, f"Exception: {str(e)}")
        return False

def test_404_handling():
    """Test 404 handling for non-existent governance ID"""
    print_section("TEST 6: Error Handling - 404 for Non-Existent ID")
    
    try:
        response = requests.get(
            f"{BACKEND_URL}/commerce/govern/GOV-9999-999",
            headers=get_headers(),
            timeout=10
        )
        
        if response.status_code == 404:
            print_test("404 for Non-Existent ID", True, "Correctly returns 404 for non-existent governance ID")
            return True
        else:
            print_test("404 for Non-Existent ID", False, f"Expected 404, got {response.status_code}")
            return False
    except Exception as e:
        print_test("404 for Non-Existent ID", False, f"Exception: {str(e)}")
        return False

def run_all_tests():
    """Run all Govern module tests"""
    print("\n" + "="*80)
    print("  IB COMMERCE GOVERN MODULE - BACKEND API TESTING")
    print("="*80)
    print(f"  Backend URL: {BACKEND_URL}")
    print(f"  Test User: {TEST_EMAIL}")
    print("="*80)
    
    # Login first
    if not login():
        print("\n❌ AUTHENTICATION FAILED - Cannot proceed with tests")
        return
    
    # Run all tests
    test_results = []
    
    test_results.append(("List All Governance Records", test_list_all_governance()))
    test_results.append(("Filter by Status", test_filter_by_status()))
    test_results.append(("Get Governance Details", test_get_governance_details()))
    test_results.append(("Status Workflow", test_status_workflow()))
    test_results.append(("Update Governance", test_update_governance()))
    test_results.append(("404 Error Handling", test_404_handling()))
    
    # Print summary
    print_section("TEST SUMMARY")
    
    passed = sum(1 for _, result in test_results if result)
    total = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print("\n" + "="*80)
    print(f"  OVERALL RESULT: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
    print("="*80)
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED! Govern module backend is fully functional.")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Please review the failures above.")

if __name__ == "__main__":
    run_all_tests()
