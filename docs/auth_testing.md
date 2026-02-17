# Auth Testing Playbook for IB Commerce Solution

## Overview
This playbook contains comprehensive testing procedures for the newly implemented authentication system including Login and Signup flows.

## Testing Protocol

### 1. Master Data Endpoints Testing
Test all master data endpoints to ensure they return correct data:

```bash
# Test user roles
curl http://localhost:8001/api/auth/masters/user-roles

# Test industries
curl http://localhost:8001/api/auth/masters/industries

# Test company sizes
curl http://localhost:8001/api/auth/masters/company-sizes

# Test business types
curl http://localhost:8001/api/auth/masters/business-types

# Test countries
curl http://localhost:8001/api/auth/masters/countries

# Test languages
curl http://localhost:8001/api/auth/masters/languages

# Test timezones
curl http://localhost:8001/api/auth/masters/timezones

# Test solutions
curl http://localhost:8001/api/auth/masters/solutions

# Test insights
curl http://localhost:8001/api/auth/masters/insights
```

### 2. Signup Flow Testing

#### Step 1: Account Details
```bash
curl -X POST http://localhost:8001/api/auth/signup/step1 \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "email": "john.doe@example.com",
    "password": "SecurePass123",
    "mobile": "9876543210",
    "mobile_country_code": "+91",
    "role": "cfo",
    "company_name": "Acme Corp",
    "industry": "saas_it",
    "company_size": "51_200",
    "referral_code": null,
    "agree_terms": true,
    "agree_privacy": true,
    "marketing_opt_in": false
  }'
```

#### Step 2: Company Details
```bash
curl -X POST http://localhost:8001/api/auth/signup/step2 \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "country": "IN",
    "business_type": "private_limited",
    "website": "https://acmecorp.com",
    "registered_address": "123 Main St, Mumbai",
    "operating_address": null,
    "address_same_as_registered": true,
    "timezone": "Asia/Kolkata",
    "language": "en"
  }'
```

#### Step 3: Solutions Selection
```bash
curl -X POST http://localhost:8001/api/auth/signup/step3 \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "solutions": {
      "commerce": true,
      "workforce": false,
      "capital": true,
      "operations": false,
      "finance": true
    },
    "insights_enabled": true
  }'
```

**Expected Output**: Check terminal for Email Verification Code and SMS OTP

#### Step 4: Verify Email
```bash
curl -X POST http://localhost:8001/api/auth/signup/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "verification_code": "XXXXXX"
  }'
```

#### Step 5: Verify Mobile
```bash
curl -X POST http://localhost:8001/api/auth/signup/verify-mobile \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "otp_code": "XXXXXX"
  }'
```

**Expected Output**: User and Tenant created, access_token returned

### 3. Login Flow Testing

#### Standard Login
```bash
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123",
    "remember_me": true
  }'
```

**Expected Output**: access_token and user information

#### Login with Wrong Password
```bash
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "WrongPassword",
    "remember_me": false
  }'
```

**Expected Output**: 401 error with "Incorrect email or password"

#### Login with Non-existent Email
```bash
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "SomePassword",
    "remember_me": false
  }'
```

**Expected Output**: 401 error with "Incorrect email or password"

### 4. Protected Route Testing

#### Get Current User Info
```bash
curl -X GET http://localhost:8001/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Output**: User and tenant information

#### Get Current User Info (Without Token)
```bash
curl -X GET http://localhost:8001/api/auth/me
```

**Expected Output**: 403 error "Not authenticated"

### 5. Password Reset Testing

#### Forgot Password
```bash
curl -X POST http://localhost:8001/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com"
  }'
```

**Expected Output**: Check terminal for reset code

#### Reset Password
```bash
curl -X POST http://localhost:8001/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "reset_code": "XXXXXXXX",
    "new_password": "NewSecurePass456"
  }'
```

**Expected Output**: Success message, all sessions invalidated

### 6. Logout Testing
```bash
curl -X POST http://localhost:8001/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Output**: Success message, session deleted

### 7. Edge Cases to Test

#### Account Lockout (5 Failed Attempts)
```bash
# Try 5 times with wrong password
for i in {1..5}; do
  curl -X POST http://localhost:8001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "john.doe@example.com",
      "password": "WrongPassword",
      "remember_me": false
    }'
done
```

**Expected Output**: After 5 attempts, account should be locked for 15 minutes

#### Expired Verification Code
Wait 10 minutes after receiving email verification code, then try to verify.

**Expected Output**: Error "Verification code expired"

#### Expired OTP
Wait 5 minutes after receiving SMS OTP, then try to verify.

**Expected Output**: Error "OTP expired"

#### Duplicate Email Registration
Try to signup with an already registered email.

**Expected Output**: Error "Email already registered"

## Database Verification

### Check Created Collections
```bash
mongosh --eval "use test_database; db.getCollectionNames()"
```

**Expected Collections**:
- users
- tenants
- user_tenant_mappings
- user_sessions
- email_verifications
- mobile_verifications
- password_resets

### Verify User Document
```bash
mongosh --eval "use test_database; db.users.findOne({email: 'john.doe@example.com'})"
```

**Expected Fields**:
- _id
- email
- mobile
- mobile_country_code
- full_name
- password_hash (bcrypt)
- role
- status: "active"
- email_verified: true
- mobile_verified: true
- email_verified_at
- mobile_verified_at
- created_at
- updated_at

### Verify Tenant Document
```bash
mongosh --eval "use test_database; db.tenants.findOne()"
```

**Expected Fields**:
- _id
- company_name
- business_type
- industry
- company_size
- country
- timezone
- language
- solutions_enabled (object)
- insights_enabled (boolean)
- status: "active"
- created_at
- updated_at

### Verify User-Tenant Mapping
```bash
mongosh --eval "use test_database; db.user_tenant_mappings.findOne()"
```

**Expected Fields**:
- _id
- user_id
- tenant_id
- role: "owner"
- permissions: ["*"]
- is_primary: true
- status: "active"
- created_at

## Success Criteria

✅ **Signup Flow**:
- All 3 steps complete successfully
- Email and mobile verification work
- User, Tenant, and Mapping created in database
- Access token returned

✅ **Login Flow**:
- Successful login with correct credentials
- Failed login with wrong password
- Account lockout after 5 failed attempts
- Remember me creates longer-lived token

✅ **Security**:
- Passwords are hashed (bcrypt)
- JWT tokens are properly signed
- Email verification required before login
- Account lockout mechanism works
- Password reset flow works

✅ **Multi-tenancy**:
- User-tenant mapping created correctly
- Role set to "owner" for signup
- Primary tenant marked

✅ **Master Data**:
- All master endpoints return data
- Data is properly formatted

## Notes for Testing Agent

1. **Verification Codes**: Look for codes in backend logs/console output (mock implementation)
2. **Token Storage**: Save access_token from signup/login response for subsequent requests
3. **Database State**: Clean database before each full test run for consistency
4. **Timing**: Some tests require waiting (expired codes, account unlock)
5. **Email Format**: Use valid email format for all tests
6. **Password**: Must be 8+ characters with letters and numbers

## Clean Up After Testing

```bash
# Delete test user
mongosh --eval "use test_database; db.users.deleteOne({email: 'john.doe@example.com'})"

# Delete all test data
mongosh --eval "
use test_database;
db.users.deleteMany({});
db.tenants.deleteMany({});
db.user_tenant_mappings.deleteMany({});
db.user_sessions.deleteMany({});
db.email_verifications.deleteMany({});
db.mobile_verifications.deleteMany({});
db.password_resets.deleteMany({});
"
```
