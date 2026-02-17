#!/bin/bash

# Get backend URL from .env
BACKEND_URL=$(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d '=' -f2)
echo "Testing backend at: $BACKEND_URL"
echo "================================"

# Test 1: Login
echo -e "\n1. Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST "${BACKEND_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@innovatebooks.com","password":"demo123"}')
echo "Login Response: $LOGIN_RESPONSE"

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Token extracted: ${TOKEN:0:50}..."

# Test 2: Get leads list
echo -e "\n2. Getting leads list..."
LEADS_RESPONSE=$(curl -s -X GET "${BACKEND_URL}/api/commerce/leads" \
  -H "AUTH_HEADER $TOKEN")
echo "Leads Response (first 500 chars): ${LEADS_RESPONSE:0:500}"

# Extract first lead_id
LEAD_ID=$(echo $LEADS_RESPONSE | grep -o '"lead_id":"LEAD-[^"]*' | head -1 | cut -d'"' -f4)
echo "First Lead ID: $LEAD_ID"

# Test 3: Get lead details with /raw endpoint
echo -e "\n3. Getting lead details via /raw endpoint..."
LEAD_DETAIL=$(curl -s -X GET "${BACKEND_URL}/api/commerce/leads/${LEAD_ID}/raw" \
  -H "AUTH_HEADER $TOKEN")
echo "Lead Detail (checking for score fields):"
echo "$LEAD_DETAIL" | grep -E "(lead_score|fit_score|intent_score|potential_score|lead_score_category)" | head -20

echo -e "\n================================"
echo "Test Complete"
