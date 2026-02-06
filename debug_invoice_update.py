#!/usr/bin/env python3
"""
Debug Invoice Update Issue
"""

import requests
import json
import os
from dotenv import load_dotenv
from datetime import datetime, timezone

# Load environment variables
load_dotenv('/app/frontend/.env')

# Configuration
BASE_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://saas-finint.preview.emergentagent.com')
API_BASE = f"{BASE_URL}/api"

# Test credentials
TEST_EMAIL = "demo@innovatebooks.com"
TEST_PASSWORD = os.getenv("TEST_PASSWORD", "Test1234")   # or demo123 as default


def get_auth_token():
    """Get authentication token"""
    response = requests.post(
        f"{API_BASE}/auth/login",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
        timeout=30
    )
    
    if response.status_code == 200:
        return response.json().get('access_token')
    return None

def debug_invoice_update():
    """Debug the invoice update issue"""
    print("🔍 Debugging Invoice Update Issue...")
    
    # Get auth token
    auth_token = get_auth_token()
    if not auth_token:
        print("❌ Failed to get auth token")
        return
    
    headers = {'Authorization': f'Bearer {auth_token}'}
    
    # Get list of invoices
    response = requests.get(f"{API_BASE}/invoices", headers=headers, timeout=30)
    if response.status_code != 200:
        print("❌ Failed to get invoices")
        return
    
    invoices = response.json()
    if not invoices:
        print("❌ No invoices found")
        return
    
    # Pick first invoice
    test_invoice = invoices[0]
    invoice_id = test_invoice.get('id')
    
    print(f"Testing with Invoice ID: {invoice_id}")
    print(f"Invoice Number: {test_invoice.get('invoice_number')}")
    print(f"Customer ID: {test_invoice.get('customer_id')}")
    
    # Get invoice details first
    details_response = requests.get(f"{API_BASE}/invoices/{invoice_id}/details", headers=headers, timeout=30)
    if details_response.status_code == 200:
        print("✅ Invoice details endpoint works")
        invoice_details = details_response.json().get('invoice', {})
    else:
        print(f"❌ Invoice details failed: {details_response.status_code}")
        return
    
    # Prepare minimal update data
    update_data = {
        "customer_id": test_invoice.get('customer_id'),
        "invoice_date": test_invoice.get('invoice_date'),
        "due_date": test_invoice.get('due_date'),
        "base_amount": float(test_invoice.get('base_amount', 50000.0)),
        "gst_percent": float(test_invoice.get('gst_percent', 18.0)),
        "gst_amount": float(test_invoice.get('gst_amount', 9000.0)),
        "tds_percent": float(test_invoice.get('tds_percent', 0.0)),
        "tds_amount": float(test_invoice.get('tds_amount', 0.0)),
        "total_amount": float(test_invoice.get('total_amount', 59000.0)),
        "items": test_invoice.get('items', [])
    }
    
    # Convert datetime strings if needed
    for date_field in ['invoice_date', 'due_date']:
        if isinstance(update_data[date_field], str):
            # Keep as string - backend should handle ISO format
            pass
        elif hasattr(update_data[date_field], 'isoformat'):
            update_data[date_field] = update_data[date_field].isoformat()
    
    print(f"Update data prepared:")
    print(f"  Customer ID: {update_data['customer_id']}")
    print(f"  Total Amount: {update_data['total_amount']}")
    
    # Try the update
    print(f"\nAttempting PUT /api/invoices/{invoice_id}")
    update_response = requests.put(
        f"{API_BASE}/invoices/{invoice_id}", 
        json=update_data, 
        headers=headers, 
        timeout=30
    )
    
    print(f"Update Response Status: {update_response.status_code}")
    print(f"Update Response Body: {update_response.text}")
    
    if update_response.status_code == 200:
        print("✅ Invoice update successful!")
    else:
        print("❌ Invoice update failed")
        
        # Let's check if the invoice still exists
        check_response = requests.get(f"{API_BASE}/invoices/{invoice_id}/details", headers=headers, timeout=30)
        print(f"Invoice still exists check: {check_response.status_code}")
        
        # Try to get the invoice from the list again
        list_response = requests.get(f"{API_BASE}/invoices", headers=headers, timeout=30)
        if list_response.status_code == 200:
            current_invoices = list_response.json()
            invoice_exists = any(inv.get('id') == invoice_id for inv in current_invoices)
            print(f"Invoice exists in list: {invoice_exists}")

if __name__ == "__main__":
    debug_invoice_update()