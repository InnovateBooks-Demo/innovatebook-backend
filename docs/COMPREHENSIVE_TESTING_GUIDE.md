# Comprehensive Testing Guide - Lead Management System

## Current Status

✅ **Backend API**: Verified working - returns enriched data and scores
✅ **Frontend Component**: LeadDetailEnriched.jsx rebuilt and working
✅ **Data Flow**: MongoDB → API → Frontend (all connected)

## Issue Explanation

The system is working correctly. Here's why you might see "Pending":

### How the System Works

1. **Lead Created** → Score = 0, Status = "Pending"
2. **Enrichment Runs** → Adds company data (GSTIN, PAN, LinkedIn, etc.)
3. **Validation Runs** → Checks data quality
4. **Scoring Runs** → Calculates score (0-100) and category (Hot/Warm/Cold)

**The frontend is designed to show:**
- "Pending" when score = 0 (lead not scored yet)
- "X/100" when score > 0 (lead has been scored)
- Score breakdown section ONLY appears when score > 0
- Hot/Warm/Cold badge ONLY appears when category is set

## Working Test Leads

These leads have COMPLETE data and scores:

| Lead ID | Company | Score | Category | Has Enrichment? |
|---------|---------|-------|----------|-----------------|
| **LEAD-2025-019** | Tech Mahindra | 100/100 | Hot 🔥 | ✅ Yes |
| LEAD-2025-020 | Aflog | 68/100 | Warm 🌤️ | ✅ Yes |
| LEAD-2025-017 | HCL Technologies | 76/100 | Hot 🔥 | ✅ Yes |
| LEAD-2025-012 | Test Automation | 76/100 | Warm 🌤️ | ✅ Yes |

**Use LEAD-2025-019 for testing** - it has everything!

## Step-by-Step Testing

### STEP 1: Clear Browser Cache (CRITICAL!)

**Why?** Old JavaScript files might be cached.

**How to clear:**
- **Chrome/Edge**: Press `Ctrl + Shift + Delete` → Select "Cached images and files" → Clear
- **Firefox**: Press `Ctrl + Shift + Delete` → Select "Cache" → Clear
- **Hard Reload**: Press `Ctrl + Shift + R` (or `Cmd + Shift + R` on Mac)

### STEP 2: Login

1. Go to: `http://localhost:3000/commerce/login`
2. Email: `demo@innovatebooks.com`
3. Password: `demo123`
4. Click "Sign In"

### STEP 3: Navigate to Lead List

1. Click "**Lead**" in the left sidebar
2. You should see the lead list page

**What you should see in the list:**
- Lead rows with company names
- Score column showing numbers (68, 76, 100, etc.)
- Status badges
- "View" buttons

### STEP 4: Open a SCORED Lead

**Option A: Use LEAD-2025-019 (Best for testing)**
1. Find "Tech Mahindra Limited" in the list
2. Click the "**View**" button for that row
3. URL should be: `http://localhost:3000/commerce/lead/LEAD-2025-019`

**Option B: Direct URL**
- Go directly to: `http://localhost:3000/commerce/lead/LEAD-2025-019`

### STEP 5: Verify Lead Detail Page

**Open browser console (F12)** to see debug logs.

#### ✅ What You SHOULD See:

**In the Console (F12 → Console tab):**
```
Lead data fetched: {...}
Rendering with scores: {scoreValue: 100, fitScore: 40, ...}
```

**In the Page Header (Cyan gradient box):**
- Company name: "Tech Mahindra Limited"
- Industry: "Technology" or similar
- Status badge: "Assigned" (white badge)
- **Score badge: "Score: 100/100"** ← This should NOT say "Pending"
- **Red badge: "Hot Lead"** ← Should be visible
- Assigned badge: "Assigned to: Senior Sales Team"

**Below Header - Score Breakdown Section:**
Should see 4 colorful cards:
- **CYAN card**: "Total Score: 100" / "out of 100"
- **GREEN card**: "Fit Score: 40" / "ICP Match (40%)"
- **AMBER/ORANGE card**: "Intent Score: 30" / "Buying Signals (30%)"
- **PURPLE card**: "Potential Score: 30" / "Revenue Potential (30%)"

**Top Right Corner - Buttons:**
- **White button**: "Edit Lead" (with pencil icon)
- **Cyan button**: "Share" (with share icon)

**Page Content:**
- Basic Information card (company details)
- Location Details card
- Contact Person card
- Online Presence card

### STEP 6: Test Edit Button

1. Click the "**Edit Lead**" button (white button, top right)
2. **Expected**: URL should change to `/commerce/lead/edit/LEAD-2025-019`
3. **Expected**: You should see the edit form

**Console should show:**
```
Edit button clicked - navigating to edit page
```

### STEP 7: Test Share Button

1. Go back to lead detail page
2. Click the "**Share**" button (cyan button, top right)
3. **Expected**: A modal dialog should appear with:
   - Title: "Share Lead"
   - Company name: "Tech Mahindra Limited"
   - Shareable URL
   - "Copy Link" button (cyan)
   - "Cancel" button (gray)

**Console should show:**
```
Share button clicked
```

4. Click "**Copy Link**"
5. **Expected**: Alert message "Share link copied to clipboard!"

**Console should show:**
```
Copying link: http://localhost:3000/commerce/lead/LEAD-2025-019
```

## Troubleshooting

### If Score Still Shows "Pending"

**Check in Console:**
1. Open F12 → Console tab
2. Look for: `Rendering with scores: {...}`
3. Check the `scoreValue` - what number is it?

**If scoreValue is 0:**
- The lead hasn't been scored yet
- This is correct behavior - frontend should show "Pending"
- Solution: Use LEAD-2025-019 which has score 100

**If scoreValue is 100 but UI shows "Pending":**
- This is a rendering bug
- Take a screenshot of console logs
- Share with developer

### If Edit/Share Buttons Don't Work

**Check in Console:**
1. Click the button
2. Look for log messages:
   - "Edit button clicked..." or
   - "Share button clicked..."

**If you see the log:**
- Handler is working, navigation might be the issue
- Check if route `/commerce/lead/edit/:id` exists in App.js

**If you don't see the log:**
- Button event not attached
- Take screenshot of page HTML (F12 → Elements tab)

### If Enriched Data Not Showing

**Check which lead you're viewing:**
- LEAD-2025-028 (Microsoft India) - Has enrichment, NO score yet
- LEAD-2025-027 (PlanetSpark) - Has enrichment, NO score yet  
- **LEAD-2025-019** (Tech Mahindra) - Has BOTH enrichment AND score ✅

**Verify API Response:**
```bash
# Run this command to check if API returns data:
curl "http://localhost:8001/api/commerce/leads/LEAD-2025-019" | grep "lead_score"

# Should show: "lead_score":100.0
```

### If Nothing Works

**Complete Reset:**
1. Close all browser tabs
2. Clear ALL browser data (not just cache)
3. Close and reopen browser
4. Hard reload (Ctrl+Shift+R) multiple times
5. Try a different browser (Chrome, Firefox, Edge)
6. Try incognito/private window

## API Verification Commands

Test backend directly to verify data:

```bash
# Get lead with enrichment
curl "http://localhost:8001/api/commerce/leads/LEAD-2025-027" | jq '.gstin, .pan, .linkedin_page'

# Get lead with scores
curl "http://localhost:8001/api/commerce/leads/LEAD-2025-019" | jq '.lead_score, .lead_score_category, .fit_score'

# List all leads
curl "http://localhost:8001/api/commerce/leads" | jq '.[].lead_id, .[].lead_score'
```

## What to Share If Still Not Working

Please provide:

1. **Screenshots:**
   - Full lead detail page
   - Browser console (F12 → Console tab)
   - Network tab showing API request/response

2. **Information:**
   - Which lead ID you're testing with
   - Which browser (Chrome, Firefox, Edge)?
   - Did you clear cache?
   - Did you hard reload (Ctrl+Shift+R)?

3. **Console Output:**
   - Copy ALL console messages
   - Paste them in your message

4. **Test This Specific URL:**
   ```
   http://localhost:3000/commerce/lead/LEAD-2025-019
   ```
   Tell me exactly what you see on this page.

## Expected vs Actual

### Expected (Correct Behavior):

**For LEAD-2025-019:**
- ✅ Score shows "100/100" (NOT "Pending")
- ✅ Red "Hot Lead" badge visible
- ✅ 4 score cards with numbers (100, 40, 30, 30)
- ✅ Edit button navigates to edit page
- ✅ Share button shows modal

**For LEAD-2025-027 or LEAD-2025-028:**
- ✅ Score shows "Pending" (correct - no score yet)
- ✅ NO Hot/Warm/Cold badge (correct - no category yet)
- ✅ NO score breakdown section (correct - hidden when score = 0)
- ✅ Enriched data DOES show (GSTIN, PAN, LinkedIn, etc.)
- ✅ Edit/Share buttons still work

### Incorrect Behavior (Report This):

**For LEAD-2025-019:**
- ❌ Score shows "Pending" (should be "100/100")
- ❌ No Hot badge (should have red "Hot Lead" badge)
- ❌ No score cards (should show 4 cards)
- ❌ Edit button does nothing
- ❌ Share button does nothing

## Summary

The system IS working correctly. The key points:

1. **Use LEAD-2025-019 for testing** - it has complete data
2. **"Pending" is correct** for leads without scores (like new leads)
3. **Clear browser cache** before testing
4. **Check console logs** to see what data is received
5. **Enriched data shows** even for unscored leads
6. **Score breakdown only appears** when score > 0

If you test with LEAD-2025-019 after clearing cache and still see "Pending", please share:
- Screenshot of the page
- Screenshot of console
- Browser name and version
