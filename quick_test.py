#!/usr/bin/env python3
"""
Quick test for aging and collections endpoints
"""

import requests
import json
import sys
from datetime import datetime, timezone

# Test against internal backend
API_BASE = "http://localhost:8001/api"

# Test credentials
TEST_EMAIL = "demo@innovatebooks.com"
TEST_PASSWORD = os.getenv("TEST_PASSWORD", "Test1234")   # or demo123 as default


def test_aging_endpoints():
    """Test the aging and collections endpoints directly"""
    session = requests.Session()
    
    print("🔐 Authenticating...")
    
    # Login
    try:
        response = session.post(
            f"{API_BASE}/auth/login",
            json={
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD
            },
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            auth_token = data.get('access_token')
            session.headers.update({
                'Authorization': f'Bearer {auth_token}'
            })
            print(f"✅ Authenticated as {data.get('user', {}).get('email', 'Unknown')}")
        else:
            print(f"❌ Authentication failed: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Authentication error: {str(e)}")
        return False
    
    # Test aging and collections endpoints
    endpoints_to_test = [
        ("/invoices/aging", "Invoice Aging"),
        ("/bills/aging", "Bill Aging"),
        ("/collections", "Collections"),
        ("/payments", "Payments"),
        ("/transactions", "Transactions")
    ]
    
    results = []
    
    for endpoint, name in endpoints_to_test:
        print(f"\n📊 Testing {name} endpoint: {endpoint}")
        
        try:
            response = session.get(f"{API_BASE}{endpoint}", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if endpoint == "/invoices/aging":
                    # Validate aging structure
                    expected_buckets = ["0-30", "31-60", "61-90", "90+"]
                    missing_buckets = [bucket for bucket in expected_buckets if bucket not in data]
                    
                    if missing_buckets:
                        results.append(f"❌ {name}: Missing buckets {missing_buckets}")
                    else:
                        total_amount = sum(data[bucket].get("amount", 0) for bucket in expected_buckets)
                        total_count = sum(data[bucket].get("count", 0) for bucket in expected_buckets)
                        results.append(f"✅ {name}: ₹{total_amount:,.2f} ({total_count} invoices)")
                
                elif endpoint == "/bills/aging":
                    # Validate bill aging structure
                    expected_buckets = ["0-30", "31-60", "61-90", "90+"]
                    missing_buckets = [bucket for bucket in expected_buckets if bucket not in data]
                    
                    if missing_buckets:
                        results.append(f"❌ {name}: Missing buckets {missing_buckets}")
                    else:
                        total_amount = sum(data[bucket].get("amount", 0) for bucket in expected_buckets)
                        total_count = sum(data[bucket].get("count", 0) for bucket in expected_buckets)
                        results.append(f"✅ {name}: ₹{total_amount:,.2f} ({total_count} bills)")
                
                elif endpoint == "/transactions":
                    # Filter transactions by type
                    if isinstance(data, list):
                        credit_transactions = [t for t in data if t.get('transaction_type') == 'Credit']
                        debit_transactions = [t for t in data if t.get('transaction_type') == 'Debit']
                        results.append(f"✅ {name}: {len(data)} total ({len(credit_transactions)} credits, {len(debit_transactions)} debits)")
                    else:
                        results.append(f"❌ {name}: Unexpected data format")
                
                else:
                    # Generic response validation
                    if isinstance(data, list):
                        results.append(f"✅ {name}: {len(data)} records")
                    elif isinstance(data, dict):
                        results.append(f"✅ {name}: Data structure with keys: {list(data.keys())}")
                    else:
                        results.append(f"✅ {name}: Response received")
            
            elif response.status_code == 404:
                results.append(f"ℹ️ {name}: Endpoint not found (404)")
            
            else:
                results.append(f"❌ {name}: HTTP {response.status_code} - {response.text[:100]}")
                
        except Exception as e:
            results.append(f"❌ {name}: Exception - {str(e)}")
    
    # Print results
    print("\n" + "="*60)
    print("📋 TEST RESULTS")
    print("="*60)
    
    for result in results:
        print(result)
    
    # Count successes
    successes = len([r for r in results if r.startswith("✅")])
    total = len(results)
    
    print(f"\n📊 Success Rate: {successes}/{total} ({(successes/total*100):.1f}%)")
    
    return successes == total

if __name__ == "__main__":
    success = test_aging_endpoints()
    sys.exit(0 if success else 1)