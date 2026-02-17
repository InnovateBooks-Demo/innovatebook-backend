# Lead Detail Page - Testing Guide

## Critical Information

I've added extensive console logging to help debug the issues. Here's what to do:

## Step-by-Step Testing Instructions

### Step 1: Login to IB Commerce
1. Open your browser
2. Go to: `http://localhost:3000/commerce/login`
3. Enter credentials:
   - Email: `demo@innovatebooks.com`
   - Password: `demo123`
4. Click "Sign In"

### Step 2: Navigate to Lead Module
1. After login, click on "Lead" in the left sidebar
2. You should see the Lead List page

### Step 3: Open a Scored Lead
1. Look for a lead with a score (e.g., LEAD-2025-019 with score 100)
2. Click the "View" button for that lead
3. **IMPORTANT**: Open browser console (F12 or Right-click → Inspect → Console tab)

### Step 4: Check Console Logs

You should see the following console messages:

```
🎯 LeadDetailEnriched component loaded for leadId: LEAD-2025-019
🔄 Fetching lead details for: LEAD-2025-019
🔍 Lead data received: {...}
📊 Lead Score: 100
📊 Fit Score: 40
📊 Intent Score: 30
📊 Potential Score: 30
🏷️ Category: Hot
```

### Step 5: Verify Score Display

**What You Should See:**
- In the cyan header card, you should see:
  - Status badge: "Assigned" (or similar)
  - **Score badge: "Score: 100/100"** ← This should NOT say "Pending"
  - **Hot Lead badge** (red background) ← This should appear for Hot leads
  - Assigned to badge (if assigned)

- Below the header, you should see:
  - **"Lead Score Breakdown" section** with 4 colorful cards:
    - Total Score: 100 (cyan card)
    - Fit Score: 40 (green card) - ICP Match (40%)
    - Intent Score: 30 (amber card) - Buying Signals (30%)
    - Potential Score: 30 (purple card) - Revenue Potential (30%)

### Step 6: Test Edit Button

1. Click the **"Edit Lead"** button (white button with pencil icon)
2. **Check console** - you should see:
   ```
   ✏️ Edit button clicked, navigating to: /commerce/lead/edit/LEAD-2025-019
   ```
3. **Expected Result**: You should be navigated to the edit page

### Step 7: Test Share Button

1. Click the **"Share"** button (cyan gradient button with share icon)
2. **Check console** - you should see:
   ```
   📤 Share button clicked, opening dialog
   ```
3. **Expected Result**: A modal dialog should appear with:
   - Title: "Share Lead"
   - Company name displayed
   - Shareable URL
   - "Copy Link" button
   - "Cancel" button

4. Click **"Copy Link"** button
5. **Check console** - you should see:
   ```
   📋 Copying link: http://localhost:3000/commerce/lead/LEAD-2025-019
   ```
6. **Expected Result**: Alert message "Share link copied to clipboard!"

## Troubleshooting

### If Score Still Shows "Pending":

**Check Console Logs:**
1. Look for the console log: `📊 Lead Score: X`
2. If it shows `📊 Lead Score: 0` or `📊 Lead Score: undefined`:
   - The backend is returning 0 or no score
   - Try a different lead (LEAD-2025-017, LEAD-2025-012, LEAD-2025-020)

3. If the console log shows `📊 Lead Score: 100` but UI still says "Pending":
   - This is a React state/rendering issue
   - **Clear your browser cache** (Ctrl+Shift+Delete)
   - **Hard reload** the page (Ctrl+Shift+R or Cmd+Shift+R on Mac)

### If Edit/Share Buttons Don't Work:

**Check Console Logs:**
1. Click the button and watch the console
2. If you see the log message (✏️ or 📤), the handler is being called
3. If nothing happens:
   - **Check if buttons exist**: Look for "Edit Lead" and "Share" buttons
   - **Try clicking again**
   - **Refresh the page** (Ctrl+R)

### If Buttons Are Not Visible:

1. **Scroll to the top** of the page
2. The Edit and Share buttons are in the **top-right corner** next to "Back to Leads"
3. If still not visible:
   - **Check console** for JavaScript errors
   - **Take a screenshot** and share it

## Backend Verification

To verify the backend is returning correct data, run this command:

```bash
curl "$(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d '=' -f2)/api/commerce/leads/LEAD-2025-019" | python3 -c "
import json, sys
lead = json.load(sys.stdin)
print(f'Lead Score: {lead.get(\"lead_score\")}')
print(f'Category: {lead.get(\"lead_score_category\")}')
"
```

**Expected Output:**
```
Lead Score: 100.0
Category: Hot
```

## Files Modified

- `/app/frontend/src/pages/commerce/lead/LeadDetailEnriched.jsx`
  - Added extensive console logging
  - Score display: Line 124
  - Edit handler: Line 36-39
  - Share handler: Line 41-44
  - Score Breakdown section: Lines 146-190

## Test Leads with Scores

| Lead ID | Company | Score | Category |
|---------|---------|-------|----------|
| LEAD-2025-019 | Tech Mahindra | 100 | Hot |
| LEAD-2025-017 | HCL Technologies | 76 | Hot |
| LEAD-2025-020 | Aflog | 68 | Warm |
| LEAD-2025-012 | Test Automation Corp | 76 | Warm |

## What To Share If Still Not Working

1. **Screenshots** of:
   - The lead detail page (showing the header with score)
   - The browser console (showing the log messages)
   - The full page (including Edit/Share buttons)

2. **Console Output**:
   - Copy all console messages starting with 🎯, 🔄, 🔍, 📊, 🏷️, ✏️, 📤, 📋
   - Paste them in your response

3. **Browser Information**:
   - Which browser are you using? (Chrome, Firefox, Safari)
   - Have you tried clearing cache and hard refresh?

## Expected Final State

✅ Score shows as "100/100" (not "Pending")
✅ Hot/Warm/Cold badge visible with color
✅ Score Breakdown section with 4 KPI cards
✅ Edit button navigates to edit page
✅ Share button opens modal with copyable link
✅ Console shows all debug messages

---

**Frontend Status**: ✅ Restarted and compiled successfully
**Backend Status**: ✅ Verified returning correct score data
**Code Changes**: ✅ All applied with console logging
