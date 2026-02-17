#!/bin/bash
# Test Subscription Gating - Verify Trial Users Can't Write

BASE_URL="http://localhost:8001"

echo "🧪 TESTING SUBSCRIPTION GATING"
echo "========================================"
echo ""

# Get trial user email from DB
TRIAL_EMAIL=$(cd /app/backend && python3 -c "
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

async def get_trial_user():
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ['DB_NAME']]
    
    # Find a trial org
    trial_org = await db.organizations.find_one({'subscription_status': 'trial'}, {'_id': 0})
    if not trial_org:
        print('NO_TRIAL_ORG')
        return
    
    # Find user in that org
    user = await db.enterprise_users.find_one({'org_id': trial_org['org_id']}, {'_id': 0})
    if user:
        print(user['email'])
    else:
        print('NO_USER')
    
    client.close()

asyncio.run(get_trial_user())
")

if [ "$TRIAL_EMAIL" = "NO_TRIAL_ORG" ] || [ "$TRIAL_EMAIL" = "NO_USER" ] || [ -z "$TRIAL_EMAIL" ]; then
    echo "❌ No trial user found. Run test_subscription_gating.py first"
    exit 1
fi

echo "1️⃣ Testing Trial User Login..."
echo "   Email: $TRIAL_EMAIL"

TRIAL_LOGIN=$(curl -s -X POST "$BASE_URL/api/enterprise/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TRIAL_EMAIL\",\"password\":\"Trial1234\"}")

TRIAL_SUCCESS=$(echo $TRIAL_LOGIN | python3 -c "import sys,json; print(json.load(sys.stdin).get('success', False))")

if [ "$TRIAL_SUCCESS" = "True" ]; then
    echo "✅ Trial user login successful!"
    TRIAL_TOKEN=$(echo $TRIAL_LOGIN | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token', ''))")
    
    TRIAL_ORG=$(echo $TRIAL_LOGIN | python3 -c "import sys,json; r=json.load(sys.stdin); print(r.get('organization', {}).get('subscription_status', 'N/A'))")
    echo "   Subscription Status: $TRIAL_ORG"
else
    echo "❌ Trial user login failed"
    exit 1
fi

echo ""

# Test 2: Try to READ customers (should work)
echo "2️⃣ Testing READ operation (GET /finance/customers)..."
READ_RESPONSE=$(curl -s -X GET "$BASE_URL/api/finance/customers" \
  -H "AUTH_HEADER $TRIAL_TOKEN")

READ_SUCCESS=$(echo $READ_RESPONSE | python3 -c "import sys,json; r=json.load(sys.stdin); print(r.get('success', False))")

if [ "$READ_SUCCESS" = "True" ]; then
    echo "✅ READ operation allowed (correct!)"
else
    echo "❌ READ operation blocked (incorrect!)"
fi

echo ""

# Test 3: Try to CREATE customer (should be blocked)
echo "3️⃣ Testing WRITE operation (POST /finance/customers)..."
WRITE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/finance/customers" \
  -H "AUTH_HEADER $TRIAL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Customer","email":"test@test.com","phone":"1234567890","credit_limit":10000,"payment_terms":"Net 30","contact_person":"Test"}')

WRITE_STATUS=$(echo $WRITE_RESPONSE | python3 -c "import sys,json; r=json.load(sys.stdin); print(r.get('detail', {}).get('error', 'NO_ERROR') if isinstance(r.get('detail'), dict) else r.get('detail', 'SUCCESS'))")

if [ "$WRITE_STATUS" = "UPGRADE_REQUIRED" ]; then
    echo "✅ WRITE operation BLOCKED (correct!)"
    echo "   Error: UPGRADE_REQUIRED"
else
    echo "❌ WRITE operation ALLOWED (incorrect! Should be blocked)"
    echo "   Response: $WRITE_STATUS"
fi

echo ""

# Test 4: Active org can write
echo "4️⃣ Testing ACTIVE org can write (demo@innovatebooks.com)..."
ACTIVE_LOGIN=$(curl -s -X POST "$BASE_URL/api/enterprise/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@innovatebooks.com","password":"Demo1234"}')

ACTIVE_TOKEN=$(echo $ACTIVE_LOGIN | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token', ''))")

ACTIVE_WRITE=$(curl -s -X POST "$BASE_URL/api/finance/customers" \
  -H "AUTH_HEADER $ACTIVE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Active Test Customer","email":"activetest@test.com","phone":"1234567890","credit_limit":10000,"payment_terms":"Net 30","contact_person":"Active Test"}')

ACTIVE_WRITE_SUCCESS=$(echo $ACTIVE_WRITE | python3 -c "import sys,json; print(json.load(sys.stdin).get('success', False))")

if [ "$ACTIVE_WRITE_SUCCESS" = "True" ]; then
    echo "✅ ACTIVE org can write (correct!)"
else
    echo "❌ ACTIVE org cannot write (incorrect!)"
fi

echo ""
echo "========================================"
echo "🎉 SUBSCRIPTION GATING TESTS COMPLETE!"
echo "========================================"
