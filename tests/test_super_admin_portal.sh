#!/bin/bash
# Test Super Admin Portal

BASE_URL="http://localhost:8001"

echo "🔐 TESTING SUPER ADMIN PORTAL"
echo "========================================"
echo ""

# Test 1: Login as Revanth (Super Admin)
echo "1️⃣ Testing Super Admin Login (revanth@innovatebooks.in)..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/enterprise/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"revanth@innovatebooks.in","password":"Pandu@1605"}')

SUCCESS=$(echo $LOGIN_RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin).get('success', False))")

if [ "$SUCCESS" = "True" ]; then
    echo "✅ Super Admin login successful!"
    TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token', ''))")
    IS_SUPER_ADMIN=$(echo $LOGIN_RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin).get('user', {}).get('is_super_admin', False))")
    
    echo "   Token: ${TOKEN:0:60}..."
    echo "   Is Super Admin: $IS_SUPER_ADMIN"
else
    echo "❌ Login failed"
    echo $LOGIN_RESPONSE
    exit 1
fi

echo ""

# Test 2: Get Organizations Overview
echo "2️⃣ Testing Organizations Overview API..."
ORG_RESPONSE=$(curl -s -X GET "$BASE_URL/api/super-admin/analytics/organizations/overview" \
  -H "AUTH_HEADER $TOKEN")

ORG_SUCCESS=$(echo $ORG_RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin).get('success', False))")

if [ "$ORG_SUCCESS" = "True" ]; then
    echo "✅ Organizations data retrieved!"
    
    TOTAL_ORGS=$(echo $ORG_RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin).get('platform_stats', {}).get('total_organizations', 0))")
    TOTAL_USERS=$(echo $ORG_RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin).get('platform_stats', {}).get('total_platform_users', 0))")
    TOTAL_MRR=$(echo $ORG_RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin).get('platform_stats', {}).get('total_mrr', 0))")
    
    echo "   Total Organizations: $TOTAL_ORGS"
    echo "   Total Platform Users: $TOTAL_USERS"
    echo "   Total MRR: ₹$TOTAL_MRR"
else
    echo "❌ Failed to get organizations data"
    echo $ORG_RESPONSE
fi

echo ""
echo "========================================"
echo "✅ SUPER ADMIN PORTAL TESTS COMPLETE!"
echo "========================================"
echo ""
echo "📋 Access the portal:"
echo "   URL: http://localhost:3000/super-admin/login"
echo "   Email: revanth@innovatebooks.in"
echo "   Password: Pandu@1605"
echo ""
echo "After login, you will see:"
echo "   ✅ Platform statistics (total orgs, users, MRR)"
echo "   ✅ List of all organizations"
echo "   ✅ User counts (active/inactive)"
echo "   ✅ Health scores"
echo "   ✅ Subscription status"
echo "   ✅ Data metrics"
echo "========================================"
