# 🧪 COMPLETE PLATFORM TESTING GUIDE
**InnovateBooks Enterprise Platform**

---

## 📋 TABLE OF CONTENTS
1. [Test Credentials](#test-credentials)
2. [Getting Started](#getting-started)
3. [Module-by-Module Testing](#module-by-module-testing)
4. [API Testing Commands](#api-testing-commands)
5. [Known Issues & Workarounds](#known-issues--workarounds)
6. [Feature Checklist](#feature-checklist)

---

## 🔐 TEST CREDENTIALS

### Default Test Account
```
Email: demo@innovatebooks.com
Password: Demo1234
```

### API Base URL
```
Backend: Use REACT_APP_BACKEND_URL from frontend/.env
Endpoints: All APIs are prefixed with /api
```

---

## 🚀 GETTING STARTED

### Step 1: Access the Application
```
1. Open your browser
2. Navigate to the application URL
3. You'll land on the home page (/)
```

### Step 2: Login
```
1. Click "Login" or navigate to /auth/login
2. Enter credentials:
   - Email: demo@innovatebooks.com
   - Password: Demo1234
3. Click "Sign In"
4. You should be redirected to /workspace
```

### Step 3: Verify Authentication
```
✅ Check if you're redirected to /workspace
✅ Verify user menu shows your name
✅ Try accessing /dashboard (should work)
✅ Try logging out and back in
```

---

## 🧪 MODULE-BY-MODULE TESTING

---

## 1️⃣ PUBLIC WEBSITE TESTING

### Pages to Test
| Page | URL | What to Check |
|------|-----|---------------|
| Home | `/` | Hero section, features, footer |
| Solutions Index | `/solutions` | All solution cards visible |
| Commerce Solution | `/solutions/commerce` | Content loads properly |
| Workforce Solution | `/solutions/workforce` | Content loads properly |
| Capital Solution | `/solutions/capital` | Content loads properly |
| Operations Solution | `/solutions/operations` | Content loads properly |
| Finance Solution | `/solutions/finance` | Content loads properly |
| Insights | `/insights` | Insights content |
| Intelligence | `/intelligence` | AI capabilities |
| About | `/about` | Company info |
| Contact | `/contact` | Contact form |

### Test Checklist
- [ ] All pages load without errors
- [ ] Navigation menu works
- [ ] Footer links work
- [ ] Images load properly
- [ ] Responsive on mobile
- [ ] "Get Started" CTAs work

---

## 2️⃣ AUTHENTICATION TESTING

### Login Flow
```
Test Case 1: Valid Login
1. Go to /auth/login
2. Enter: demo@innovatebooks.com / Demo1234
3. Click "Sign In"
Expected: Redirect to /workspace

Test Case 2: Invalid Login
1. Go to /auth/login
2. Enter wrong password
3. Click "Sign In"
Expected: Error message shown

Test Case 3: Logout
1. Click user menu (top-right)
2. Click "Logout"
Expected: Redirect to / (home page)
```

### Test Checklist
- [ ] Login with valid credentials works
- [ ] Login with invalid credentials shows error
- [ ] Logout works properly
- [ ] Protected routes redirect to login when not authenticated
- [ ] Token persists on page refresh

---

## 3️⃣ WORKSPACE MODULE TESTING

### Workspace Dashboard
```
URL: /workspace
Expected: Dashboard with workspace overview
```

### IB Chat - Chat View
```
URL: /workspace/chat

Test Steps:
1. Navigate to /workspace/chat
2. Select a user from the list
3. Type a message
4. Click send
5. Verify message appears

Expected:
✅ User list loads
✅ Chat history loads
✅ Messages can be sent
✅ Real-time updates (if WebRTC is working)
```

### IB Chat - Channels View
```
URL: /workspace/channels

Test Steps:
1. Navigate to /workspace/channels
2. Select a channel
3. Send a message
4. Create a new channel

Expected:
✅ Channel list loads
✅ Channel messages load
✅ Can send messages
✅ Can create channels
```

### Test Checklist
- [ ] Workspace dashboard loads
- [ ] Chat view loads
- [ ] Can see list of users
- [ ] Can send messages
- [ ] Channels view loads
- [ ] Can see channels
- [ ] Can switch between chat and channels
- [ ] Settings page loads

---

## 4️⃣ FINANCE MODULE TESTING

### Dashboard
```
URL: /dashboard

Test:
✅ KPI cards display
✅ Charts render
✅ Recent activity shows
✅ No console errors
```

### Cash Flow Management
```
Test Each Page:
1. /cashflow/actuals - Actual cash flow data
2. /cashflow/budgeting - Budget planning
3. /cashflow/forecasting - Forecasts
4. /cashflow/variance - Variance analysis

For Each Page Check:
✅ Page loads without error
✅ Data displays in tables/charts
✅ Filters work (if present)
✅ Export buttons work (if present)
```

### Customer Management
```
Test Flow:

1. View Customers (/customers)
   ✅ Customer list loads
   ✅ Search works
   ✅ Filters work

2. Add Customer (/customers/add)
   ✅ Form loads
   ✅ Can fill all fields
   ✅ Validation works
   ✅ Can submit

3. View Customer Detail (/customers/:id)
   ✅ Customer info displays
   ✅ Related invoices show
   ✅ Outstanding balance correct

4. Edit Customer (/customers/:id/edit)
   ✅ Form pre-fills with data
   ✅ Can update fields
   ✅ Can save changes
```

### Invoice Management
```
Test Flow:

1. View Invoices (/invoices)
   ✅ Invoice list loads
   ✅ Status badges show
   ✅ Amounts display correctly

2. Create Invoice (/invoices/create)
   ✅ Form loads
   ✅ Can select customer
   ✅ Can add line items
   ✅ Tax calculates automatically
   ✅ Total calculates correctly
   ✅ Can save invoice

3. View Invoice Detail (/invoices/:id)
   ✅ Invoice header shows
   ✅ Line items display
   ✅ Totals are correct
   ✅ Can download PDF (if implemented)

4. Edit Invoice (/invoices/:id/edit)
   ✅ Can modify line items
   ✅ Calculations update
   ✅ Can save changes
```

### Vendor & Bill Management
```
Similar to Customer/Invoice flow:

1. /vendors - Vendor list
2. /vendors/add - Add vendor
3. /vendors/:id - Vendor detail
4. /vendors/:id/edit - Edit vendor
5. /bills - Bill list
6. /bills/create - Create bill
7. /bills/:id - Bill detail
8. /bills/:id/edit - Edit bill

Test all CRUD operations for each.
```

### Aging Reports
```
1. Aging DSO (/aging-dso)
   ✅ Customer aging buckets display
   ✅ Overdue amounts highlighted
   ✅ Drill-down works

2. Aging DPO (/aging-dpo)
   ✅ Vendor aging buckets display
   ✅ Payment due dates shown
```

### Banking
```
Test Flow:

1. Accounts (/banking/accounts)
   ✅ Bank account list loads
   ✅ Balances display

2. Transactions (/banking/transactions)
   ✅ Transaction list loads
   ✅ Can filter by account
   ✅ Can filter by date

3. Matching (/banking/matching)
   ✅ Unmatched transactions show
   ✅ Can match transactions
   ✅ Can create adjustment

4. Manage Banks (/banking/manage)
   ✅ Can add bank account
   ✅ Can edit bank details
```

### Financial Reporting
```
Test Each Report:

1. Financial Reporting Index (/financial-reporting)
   ✅ Report menu displays
   ✅ All report links work

2. Profit & Loss (/financial-reporting/profit-loss)
   ✅ Revenue section displays
   ✅ Expense section displays
   ✅ Net profit calculates
   ✅ Can filter by date range

3. Balance Sheet (/financial-reporting/balance-sheet)
   ✅ Assets section displays
   ✅ Liabilities section displays
   ✅ Equity section displays
   ✅ Balance equation correct

4. Cash Flow Statement (/financial-reporting/cashflow)
   ✅ Operating activities
   ✅ Investing activities
   ✅ Financing activities
   ✅ Net cash flow

5. Trial Balance (/financial-reporting/trial-balance)
   ✅ All accounts listed
   ✅ Debit/Credit columns
   ✅ Totals match

6. General Ledger (/financial-reporting/general-ledger)
   ✅ Transaction details
   ✅ Running balances
   ✅ Can filter by account
```

### Adjustment Entries
```
Test Flow:

1. View List (/adjustment-entries)
   ✅ Entry list loads
   ✅ Can search/filter

2. Create Entry (/adjustment-entries/create)
   ✅ Form loads
   ✅ Can add debit/credit lines
   ✅ Balance check works
   ✅ Can save

3. View Detail (/adjustment-entries/:id)
   ✅ Entry details display
   ✅ Line items show

4. Edit Entry (/adjustment-entries/edit/:id)
   ✅ Can modify lines
   ✅ Can save changes
```

---

## 5️⃣ IB COMMERCE MODULE TESTING

### Commerce Dashboard
```
URL: /commerce

Expected:
✅ Dashboard loads with summary
✅ Module cards/links visible
✅ Stats display correctly
```

---

### MODULE 1: LEAD (Manufacturing Leads)

#### Lead List
```
URL: /commerce/lead

Test Steps:
1. Navigate to /commerce/lead
2. Verify lead list displays

Expected:
✅ Table shows 15 manufacturing leads
✅ Columns: Lead Number, Customer, Contact, Product, Plant, Qty, Status, Priority, Source
✅ Data loads from /api/manufacturing/leads

⚠️ KNOWN ISSUE: Clicking a row does NOT navigate to detail page yet
```

#### Lead Create
```
URL: /commerce/lead/create

Test Steps:
1. Navigate to /commerce/lead/create
2. Check all form sections

Expected:
✅ Form displays with all sections:
   - Customer Information
   - Contact Details
   - Product Details
   - Commercial Information
   - Manufacturing Details
   - Attachments
✅ All input fields visible
✅ "New Customer" button visible

⚠️ KNOWN ISSUE: Form submission is NOT implemented yet
⚠️ KNOWN ISSUE: "New Customer" popup does NOT open yet
```

#### Lead Detail
```
URL: /commerce/lead/:leadId
Example: /commerce/lead/MFGL-2025-0001

Test Steps:
1. Manually navigate to /commerce/lead/MFGL-2025-0001
2. Verify page structure

Expected:
✅ Header displays with lead info
✅ Action buttons visible (Convert, Edit, etc.)
✅ 10 tabs present:
   1. Overview
   2. Customer & Contact
   3. Product Details
   4. Commercial
   5. Manufacturing
   6. Timeline
   7. Communications
   8. Documents
   9. Tasks
   10. History

⚠️ KNOWN ISSUE: Tabs are visual only, content may be placeholder
⚠️ KNOWN ISSUE: Action buttons are NOT functional yet
```

#### Lead Edit
```
URL: /commerce/lead/:leadId/edit
Example: /commerce/lead/MFGL-2025-0001/edit

Expected:
✅ Edit form loads
✅ Fields pre-populated with lead data
```

#### Test Checklist - Lead Module
- [ ] Lead list displays 15 leads
- [ ] Can manually navigate to lead detail
- [ ] Lead create form displays all sections
- [ ] Lead detail shows header and 10 tabs
- [ ] Lead edit form loads
- [ ] ❌ Row click navigation (NOT WORKING)
- [ ] ❌ Form submission (NOT WORKING)
- [ ] ❌ Action buttons (NOT WORKING)

---

### MODULE 2-12: Other Commerce Modules

For each module, test the same pattern:

#### Evaluate Module
- [ ] /commerce/evaluate - List page loads
- [ ] /commerce/evaluate/create - Create form loads
- [ ] /commerce/evaluate/:evaluationId - Detail page loads
- [ ] /commerce/evaluate/:evaluationId/edit - Edit form loads

#### Commit Module
- [ ] /commerce/commit - List page loads
- [ ] /commerce/commit/create - Create form loads
- [ ] /commerce/commit/:commitId - Detail page loads
- [ ] /commerce/commit/:commitId/edit - Edit form loads

#### Execute Module
- [ ] /commerce/execute - List page loads
- [ ] /commerce/execute/create - Create form loads
- [ ] /commerce/execute/:executionId - Detail page loads
- [ ] /commerce/execute/:executionId/edit - Edit form loads

#### Bill Module
- [ ] /commerce/bill - List page loads
- [ ] /commerce/bill/create - Create form loads
- [ ] /commerce/bill/:invoiceId - Detail page loads
- [ ] /commerce/bill/:invoiceId/edit - Edit form loads

#### Collect Module
- [ ] /commerce/collect - List page loads
- [ ] /commerce/collect/create - Create form loads
- [ ] /commerce/collect/:collectionId - Detail page loads
- [ ] /commerce/collect/:collectionId/edit - Edit form loads

#### Procure Module
- [ ] /commerce/procure - List page loads
- [ ] /commerce/procure/create - Create form loads
- [ ] /commerce/procure/:procurementId - Detail page loads
- [ ] /commerce/procure/:procurementId/edit - Edit form loads

#### Pay Module
- [ ] /commerce/pay - List page loads
- [ ] /commerce/pay/create - Create form loads
- [ ] /commerce/pay/:paymentId - Detail page loads
- [ ] /commerce/pay/:paymentId/edit - Edit form loads

#### Spend Module
- [ ] /commerce/spend - List page loads
- [ ] /commerce/spend/create - Create form loads
- [ ] /commerce/spend/:spendId - Detail page loads
- [ ] /commerce/spend/:spendId/edit - Edit form loads

#### Tax Module
- [ ] /commerce/tax - List page loads
- [ ] /commerce/tax/create - Create form loads
- [ ] /commerce/tax/:taxId - Detail page loads
- [ ] /commerce/tax/:taxId/edit - Edit form loads

#### Reconcile Module
- [ ] /commerce/reconcile - List page loads
- [ ] /commerce/reconcile/create - Create form loads
- [ ] /commerce/reconcile/:reconciliationId - Detail page loads
- [ ] /commerce/reconcile/:reconciliationId/edit - Edit form loads

#### Govern Module
- [ ] /commerce/govern - List page loads
- [ ] /commerce/govern/create - Create form loads
- [ ] /commerce/govern/:governanceId - Detail page loads
- [ ] /commerce/govern/:governanceId/edit - Edit form loads

---

## 6️⃣ MANUFACTURING MODULE TESTING

### Master Data View
```
URL: /commerce/masters

Expected:
✅ Master data view displays
✅ Shows available masters
```

### Master Dashboard
```
URL: /commerce/manufacturing/masters

Expected:
✅ Master data dashboard loads
✅ Master type cards visible
```

### Master Lists
```
Test Each Master Type:

1. /commerce/manufacturing/masters/customers
   ✅ Customer master list

2. /commerce/manufacturing/masters/skus
   ✅ SKU master list

3. /commerce/manufacturing/masters/plants
   ✅ Plant master list
```

### Analytics Dashboard
```
URL: /commerce/manufacturing/analytics

Expected:
✅ Analytics dashboard loads
✅ Charts and metrics display
✅ Lead conversion analytics
✅ Production metrics
```

---

## 🔧 API TESTING COMMANDS

### Authentication APIs

#### Register New User
```bash
curl -X POST $REACT_APP_BACKEND_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "full_name": "Test User",
    "role": "Sales Manager"
  }'
```

#### Login
```bash
curl -X POST $REACT_APP_BACKEND_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@innovatebooks.com",
    "password": "Demo1234"
  }'

# Save the token from response for subsequent requests
```

### Manufacturing Lead APIs

#### Get All Leads
```bash
curl -X GET $REACT_APP_BACKEND_URL/api/manufacturing/leads
```

#### Get Lead by ID
```bash
curl -X GET $REACT_APP_BACKEND_URL/api/manufacturing/leads/MFGL-2025-0001
```

#### Create Lead (Full Example)
```bash
curl -X POST $REACT_APP_BACKEND_URL/api/manufacturing/leads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "customer_id": "CUST-001",
    "customer_name": "ABC Manufacturing Ltd",
    "contact_person": "John Doe",
    "contact_email": "john@abc.com",
    "contact_phone": "+91-9876543210",
    "sku_id": "SKU-001",
    "product_name": "Widget A",
    "quantity": 1000,
    "plant_id": "PLANT-001",
    "plant_name": "Delhi Plant",
    "estimated_value": 500000,
    "currency": "INR",
    "status": "New",
    "priority": "High",
    "source": "Website"
  }'
```

#### Update Lead
```bash
curl -X PUT $REACT_APP_BACKEND_URL/api/manufacturing/leads/MFGL-2025-0001 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "status": "Qualified",
    "priority": "High"
  }'
```

#### Delete Lead
```bash
curl -X DELETE $REACT_APP_BACKEND_URL/api/manufacturing/leads/MFGL-2025-0001 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Commerce Module APIs

#### Get Evaluations
```bash
curl -X GET $REACT_APP_BACKEND_URL/api/commerce/evaluations
```

#### Get Commitments
```bash
curl -X GET $REACT_APP_BACKEND_URL/api/commerce/commitments
```

#### Get Executions
```bash
curl -X GET $REACT_APP_BACKEND_URL/api/commerce/executions
```

*(Similar pattern for all 12 commerce modules)*

### Master Data APIs

#### Get Customers Master
```bash
curl -X GET $REACT_APP_BACKEND_URL/api/manufacturing/masters/customers
```

#### Get SKUs Master
```bash
curl -X GET $REACT_APP_BACKEND_URL/api/manufacturing/masters/skus
```

#### Get Plants Master
```bash
curl -X GET $REACT_APP_BACKEND_URL/api/manufacturing/masters/plants
```

### Finance APIs

#### Get All Customers
```bash
curl -X GET $REACT_APP_BACKEND_URL/api/customers \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Get All Invoices
```bash
curl -X GET $REACT_APP_BACKEND_URL/api/invoices \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## ⚠️ KNOWN ISSUES & WORKAROUNDS

### Issue 1: Lead List Navigation Not Working
**Problem:** Clicking a lead row in the list doesn't navigate to detail page

**Workaround:** Manually type the URL
```
Example: /commerce/lead/MFGL-2025-0001
```

**Status:** FIX PENDING

---

### Issue 2: Lead Create Form Submission Not Working
**Problem:** Clicking submit on Lead Create form doesn't save the lead

**Workaround:** Use API to create leads (see API commands above)

**Status:** FIX PENDING

---

### Issue 3: "New Customer" Button Doesn't Open Modal
**Problem:** Clicking "New Customer" on Lead Create page doesn't open popup

**Workaround:** Create customer master separately via API or master data page

**Status:** FIX PENDING

---

### Issue 4: "Masters" Link Not in Sidebar
**Problem:** No easy navigation to master data from main menu

**Workaround:** Manually navigate to /commerce/masters

**Status:** FIX PENDING

---

### Issue 5: Action Buttons Not Functional
**Problem:** "Convert to Evaluate", "Edit", etc. buttons on Lead Detail don't work

**Workaround:** Use API endpoints or wait for fix

**Status:** FIX PENDING

---

## ✅ FEATURE CHECKLIST

### Public Website
- [ ] Home page loads
- [ ] All solution pages load
- [ ] Navigation works
- [ ] Footer links work
- [ ] Responsive design

### Authentication
- [ ] Can login successfully
- [ ] Can logout successfully
- [ ] Protected routes redirect properly
- [ ] Token persists on refresh
- [ ] Invalid credentials show error

### Workspace
- [ ] Dashboard loads
- [ ] Chat view loads
- [ ] Can send messages
- [ ] Channels view loads
- [ ] Settings loads

### Finance Module
- [ ] Dashboard displays KPIs
- [ ] Cash flow pages load
- [ ] Customer CRUD works
- [ ] Invoice CRUD works
- [ ] Vendor CRUD works
- [ ] Bill CRUD works
- [ ] Banking pages load
- [ ] Financial reports load
- [ ] Adjustment entries work

### Commerce Module (Visual Testing)
- [ ] Commerce dashboard loads
- [ ] Lead list displays data
- [ ] Lead create form displays
- [ ] Lead detail displays (manual navigation)
- [ ] All 12 module list pages load
- [ ] All 12 module create forms load

### Manufacturing
- [ ] Master data view loads
- [ ] Master dashboard loads
- [ ] Master lists load
- [ ] Analytics dashboard loads

### Known Broken Features
- [ ] ❌ Lead list row click navigation
- [ ] ❌ Lead create form submission
- [ ] ❌ New Customer popup
- [ ] ❌ Masters link in sidebar
- [ ] ❌ Lead detail action buttons
- [ ] ❌ Tab content interactivity

---

## 🎯 TESTING PRIORITY

### Priority 1: Critical (Must Work)
1. ✅ Authentication (Login/Logout)
2. ✅ Finance module CRUD operations
3. ✅ Workspace dashboard access
4. ⚠️ Lead list data display
5. ⚠️ API endpoints responding

### Priority 2: Important (Should Work)
1. ✅ All list pages loading
2. ✅ All create forms displaying
3. ⚠️ Navigation between pages
4. ⚠️ Form submissions
5. ✅ Data seeding complete

### Priority 3: Nice to Have (Can Wait)
1. Master data pop-ups
2. Advanced analytics
3. Action button workflows
4. Tab content interactivity
5. Real-time chat features

---

## 📊 TESTING PROGRESS TRACKER

Use this to track your testing:

```
Date Tested: __________
Tester Name: __________

Module Status:
[ ] Public Website - Pass/Fail/Partial
[ ] Authentication - Pass/Fail/Partial
[ ] Workspace - Pass/Fail/Partial
[ ] Finance - Pass/Fail/Partial
[ ] Commerce - Pass/Fail/Partial
[ ] Manufacturing - Pass/Fail/Partial

Critical Issues Found:
1. ___________________________
2. ___________________________
3. ___________________________

Minor Issues Found:
1. ___________________________
2. ___________________________
3. ___________________________

Overall Platform Status:
[ ] Ready for Production
[ ] Needs Minor Fixes
[ ] Needs Major Fixes
[ ] Not Ready

Notes:
_________________________________
_________________________________
_________________________________
```

---

## 📞 NEED HELP?

If you encounter issues not listed here:

1. **Check Console Logs**
   - Open browser DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed API calls

2. **Check Backend Logs**
   ```bash
   tail -n 100 /var/log/supervisor/backend.err.log
   tail -n 100 /var/log/supervisor/backend.out.log
   ```

3. **Check Service Status**
   ```bash
   sudo supervisorctl status
   ```

4. **Test API Directly**
   - Use curl commands provided above
   - Use Postman or similar tool
   - Check if backend is responding

---

## 🎉 TESTING COMPLETE!

Once you've completed testing:
1. Fill out the progress tracker
2. Document all issues found
3. Prioritize fixes needed
4. Share feedback with development team

---

**Document Version:** 1.0
**Last Updated:** Current Session
**Platform:** InnovateBooks Enterprise
**Tech Stack:** React + FastAPI + MongoDB

---

## 📥 SAMPLE TEST DATA

### Test Lead IDs (Pre-seeded)
```
MFGL-2025-0001
MFGL-2025-0002
MFGL-2025-0003
...through...
MFGL-2025-0015
```

### Test Customers
```
TechCorp India Ltd
AutoParts Manufacturing Co
Industrial Solutions Pvt Ltd
Global Machinery Inc
Precision Tools Ltd
```

### Test Products/SKUs
```
SKU-001: Automotive Components
SKU-002: Industrial Valves
SKU-003: Precision Bearings
SKU-004: Custom Machinery Parts
SKU-005: Electronic Assemblies
```

---

**Happy Testing! 🚀**
