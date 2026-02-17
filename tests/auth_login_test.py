#!/usr/bin/env python3
"""
Test Login and Protected Routes
"""

import requests
import json

# Configuration
BACKEND_URL = "https://saas-finint.preview.emergentagent.com/api"

# Test data - using the user we created in previous test
TEST_USER_DATA = {
    "email": "test@example.com",
    "password": "NewTest1234"  # Password was changed during reset test
}

def test_login():
    """Test login functionality"""
    print("🔐 Testing Login...")
    
    login_data = {
        "email": TEST_USER_DATA["email"],
        "password": TEST_USER_DATA["password"],
        "remember_me": True
    }
    
    response = requests.post(
        f"{BACKEND_URL}/auth/login",
        json=login_data,
        timeout=30
    )
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 200:
        data = response.json()
        return data.get("access_token")
    
    return None

def test_protected_route(token):
    """Test protected route with token"""
    print("\n🔒 Testing Protected Route...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(
        f"{BACKEND_URL}/auth/me",
        headers=headers,
        timeout=30
    )
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    return response.status_code == 200

def main():
    print("🚀 LOGIN AND PROTECTED ROUTE TEST")
    print("=" * 40)
    
    # Test login
    access_token = test_login()
    
    if access_token:
        print(f"\n✅ Login successful! Token: {access_token[:20]}...")
        
        # Test protected route
        if test_protected_route(access_token):
            print("\n✅ Protected route working!")
        else:
            print("\n❌ Protected route failed!")
    else:
        print("\n❌ Login failed!")

if __name__ == "__main__":
    main()