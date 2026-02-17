# Duplicate Check System Documentation

## Overview
The IB Commerce Lead Management System has **TWO different duplicate detection mechanisms**:

1. **Basic Fingerprint-Based Check** (Automatic during Validation)
2. **AI-Powered Duplicate Detection** (Manual/On-demand via SOP Stage 5)

---

## 1. Basic Duplicate Check (Automatic)

### When It Runs
- **Automatically** during the **Lead Validation Stage** (Stage 3)
- Runs for every lead as part of the `Lead_Validate_SOP`
- Triggered via: `POST /api/commerce/leads/{lead_id}/validate`

### How It Works
```python
# Location: /app/backend/lead_sop_complete.py (lines 491-502)

# Uses fingerprint matching
fingerprint = lead.get('fingerprint', '')
if fingerprint:
    existing = await db.commerce_leads.find_one({
        "fingerprint": fingerprint,
        "lead_id": {"$ne": lead_id}
    })
    if existing:
        validation_checks["duplicate_check"] = "Warning"
        warnings.append(f"Possible duplicate of {existing.get('lead_id')}")
```

### What It Checks
- **Fingerprint field** - A unique hash/identifier for the lead
- Looks for exact fingerprint matches in existing leads
- Simple and fast

### Result
- **Passed**: No duplicate found
- **Warning**: Possible duplicate detected
- Result stored in `validation_checks.duplicate_check`
- Warning message: "Possible duplicate of LEAD-XXX"

---

## 2. AI-Powered Duplicate Detection (Manual/On-demand)

### When It Runs
- **Manually triggered** via dedicated endpoint
- Part of SOP Stage 5 (separate from auto-validation)
- Endpoint: `POST /api/commerce/leads/sop/duplicate-check/{lead_id}`

### How It Works (2-Step Process)

#### Step 1: Rule-Based Pre-filtering
```python
# Location: /app/backend/lead_sop_routes.py (lines 146-155)

# Check for exact matches on key fields
exact_match_query = {
    "$or": [
        {"primary_email": lead_data.get('primary_email')},
        {"tax_registration_number": lead_data.get('tax_registration_number')},
        {"primary_phone": lead_data.get('primary_phone')},
        {"business_name": lead_data.get('business_name')}
    ]
}

existing_leads = await db.commerce_leads.find(exact_match_query).to_list(length=100)
```

**Checks:**
- Email address match
- Tax ID match
- Phone number match
- Company name match

If no matches found → Returns "No duplicate" immediately

#### Step 2: AI Analysis (OpenAI GPT-5)
```python
# Location: /app/backend/lead_sop_routes.py (lines 168-210)

# Uses GPT-5 via Emergent LLM Key
chat = LlmChat(
    api_key=EMERGENT_LLM_KEY,
    session_id=f"duplicate_check_{uuid.uuid4()}",
    system_message="You are a duplicate detection expert..."
)
chat.with_model("openai", "gpt-5")
```

**AI compares NEW lead against up to 5 EXISTING leads:**
- Company name similarity
- Email pattern matching
- Phone number matching
- Tax ID comparison
- Contact person name similarity

**AI Returns:**
```json
{
    "is_duplicate": true/false,
    "duplicate_lead_ids": ["LEAD-2025-XXX"],
    "similarity_score": 0-100,
    "match_criteria": ["email", "tax_id", "phone", "company_name"],
    "ai_confidence": 0-100,
    "explanation": "Brief reasoning"
}
```

### Fallback Mechanism
If AI fails (JSON parsing error, API error):
- Falls back to **rule-based scoring**
- 30 points per matched field (email, tax_id, phone, company_name)
- Max 100 points
- `checked_by: "Rule_Based"` instead of `"AI_Engine"`

---

## Data Model

### LeadDuplicateCheck Schema
```python
# Location: /app/backend/commerce_models.py (lines 187-196)

class LeadDuplicateCheck(BaseModel):
    check_id: str                    # Unique UUID
    check_date: datetime             # When check was performed
    is_duplicate: bool = False       # True if duplicate found
    duplicate_lead_ids: List[str]    # IDs of matching leads
    similarity_score: float = 0.0    # 0-100 similarity score
    match_criteria: List[str]        # ["email", "phone", "tax_id", "company_name"]
    ai_confidence: float = 0.0       # AI confidence in decision (0-100)
    checked_by: str = "AI_Engine"    # "AI_Engine" or "Rule_Based"
```

### Storage in Lead Document
```python
# After duplicate check, lead document contains:
{
    "duplicate_check_status": "Duplicate_Found" or "Checked",
    "duplicate_check_result": {
        "is_duplicate": true,
        "duplicate_lead_ids": ["LEAD-2025-019"],
        "similarity_score": 95.0,
        "match_criteria": ["email", "company_name"],
        "ai_confidence": 98.5,
        "checked_by": "AI_Engine",
        "explanation": "Same email and company name with 95% similarity"
    },
    "duplicate_check_date": "2025-01-08T12:30:00Z"
}
```

---

## Workflow Integration

### Current Automatic SOP Flow
```
Lead Created
    ↓
Stage 1: Intake → validates required fields
    ↓
Stage 2: Enrich → GPT-5 enrichment (company data, contact details)
    ↓
Stage 3: Validate → ✅ BASIC DUPLICATE CHECK (fingerprint-based)
    ├─ Email validation
    ├─ Phone validation
    ├─ Domain check
    └─ Duplicate check (fingerprint)
    ↓
Stage 4: Qualify/Score → Lead scoring (Fit + Intent + Potential)
    ↓
Stage 5: Assign → Auto-assignment to teams
    ↓
Stage 6-9: Engage, Review, Convert, Audit
```

### Manual AI Duplicate Check
```
User triggers: POST /api/commerce/leads/sop/duplicate-check/{lead_id}
    ↓
1. Rule-based pre-filter (email/phone/tax_id/company_name)
    ↓
2. AI analysis with GPT-5 (if matches found)
    ↓
3. Result stored in lead document
    ↓
4. Status updated: "Duplicate_Found" or "Checked"
```

---

## Key Differences

| Feature | Basic Fingerprint Check | AI-Powered Check |
|---------|------------------------|------------------|
| **Trigger** | Automatic (Stage 3) | Manual endpoint call |
| **Method** | Fingerprint matching | AI + Rule-based |
| **Fields Checked** | Fingerprint only | Email, Phone, Tax ID, Company Name |
| **Intelligence** | Exact match only | Fuzzy matching, similarity scoring |
| **AI Used** | No | Yes (OpenAI GPT-5) |
| **Result Type** | Pass/Warning | Detailed similarity report |
| **Performance** | Very fast | Slower (AI call) |
| **Accuracy** | Low (depends on fingerprint) | High (AI reasoning) |

---

## API Endpoints

### 1. Automatic Validation (includes basic duplicate check)
```bash
POST /api/commerce/leads/{lead_id}/validate

Response:
{
    "success": true,
    "stage": "Lead_Validate_SOP",
    "validation_status": "Warning",
    "validation_checks": {
        "email_format": "Passed",
        "phone_format": "Passed",
        "duplicate_check": "Warning"  # ← Basic check result
    },
    "warnings": ["Possible duplicate of LEAD-2025-019"]
}
```

### 2. AI-Powered Duplicate Check
```bash
POST /api/commerce/leads/sop/duplicate-check/{lead_id}

Response:
{
    "success": true,
    "message": "Duplicate check completed",
    "lead_id": "LEAD-2025-020",
    "duplicate_result": {
        "is_duplicate": true,
        "duplicate_lead_ids": ["LEAD-2025-019"],
        "similarity_score": 95.0,
        "match_criteria": ["email", "company_name"],
        "ai_confidence": 98.5,
        "checked_by": "AI_Engine",
        "explanation": "High similarity in company name and email domain"
    }
}
```

---

## Frontend Integration

### Where Duplicate Info is Displayed

1. **Lead Detail Page** (`LeadDetailEnriched.jsx`)
   - Shows validation warnings if basic duplicate detected
   - Can display `duplicate_check_result` if AI check was run

2. **Lead Validation Section**
   - Shows validation checks including duplicate status
   - Displays warning message with duplicate lead ID

3. **Audit Trail**
   - Logs duplicate check actions
   - Shows timestamp and checker (AI_Engine/Rule_Based)

---

## Configuration

### Emergent LLM Key
```python
# Location: /app/backend/lead_sop_routes.py (line 170)
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")
```

### AI Model
```python
# Uses OpenAI GPT-5
chat.with_model("openai", "gpt-5")
```

### Limits
- **Pre-filter**: Checks up to 100 existing leads
- **AI Analysis**: Analyzes up to 5 most similar leads
- **Match threshold**: Not explicitly defined (AI decides)

---

## Recommendations for Enhancement

1. **Automatic AI Check**: Integrate AI duplicate check into auto-validation workflow
2. **Merge Functionality**: Add ability to merge duplicate leads
3. **Duplicate Dashboard**: Create UI to review and resolve duplicates
4. **Fingerprint Generation**: Implement automatic fingerprint creation based on email+company_name hash
5. **Similarity Threshold**: Add configurable threshold (e.g., >80% = definite duplicate)
6. **Duplicate Prevention**: Block lead creation if high-confidence duplicate exists

---

## Testing the System

### Test Basic Duplicate Check
```bash
# 1. Create a lead
POST /api/commerce/leads
# Note the lead_id

# 2. Run validation (includes basic duplicate check)
POST /api/commerce/leads/{lead_id}/validate

# 3. Check validation_checks.duplicate_check in response
```

### Test AI Duplicate Check
```bash
# 1. Get an existing lead ID
GET /api/commerce/leads

# 2. Run AI duplicate check
POST /api/commerce/leads/sop/duplicate-check/LEAD-2025-020

# 3. Review duplicate_result in response
```

---

## Error Handling

### AI Check Errors
- **API Failure**: Falls back to rule-based scoring
- **JSON Parse Error**: Falls back to rule-based scoring
- **No matches found**: Returns "No duplicate" immediately
- **System Error**: Returns `checked_by: "Error"` with confidence 0

### Recovery
All errors are caught and logged. The system never crashes - it gracefully falls back to simpler methods.

---

## Summary

✅ **Basic Check**: Fast, fingerprint-based, automatic during validation  
✅ **AI Check**: Intelligent, GPT-5 powered, manual trigger  
✅ **Fallback**: Rule-based scoring if AI fails  
✅ **Storage**: Complete duplicate detection results stored in lead document  
✅ **Audit**: Full trail of duplicate checks with timestamps  

The system provides both **automatic protection** (basic check) and **advanced intelligence** (AI check) for duplicate detection.
