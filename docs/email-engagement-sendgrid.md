# SendGrid Email Engagement — Implementation Guide

## Overview

Outbound email engagement for Revenue Leads is now available in the Engagement Modal.
Emails are sent via the **SendGrid REST API** from the backend; a delivery webhook updates
engagement records automatically as events occur (delivered, opened, clicked, bounced, etc.).

---

## Environment Variables (add to backend `.env`)

| Variable | Required | Description |
|---|---|---|
| `SENDGRID_API_KEY` | ✅ | SendGrid API key — starts with `SG.` |
| `SENDGRID_FROM_EMAIL` | ✅ | Verified sender email (must pass Sender Authentication) |
| `SENDGRID_FROM_NAME` | optional | Display name (default: `InnovateBook CRM`) |
| `SENDGRID_WEBHOOK_SIGNING_KEY` | optional | ECDSA public key from SendGrid Event Webhook settings |

---

## API Routes

### Send Email
```
POST /api/commerce/workflow/revenue/leads/{lead_id}/engagements/email
Content-Type: application/json

{
  "to": "lead@company.com",
  "subject": "Following up on our discussion",
  "html": "<p>Hi, just following up…</p>",
  "text": "Hi, just following up…"   // optional plain-text fallback
}
```
**Response (success)**
```json
{
  "success": true,
  "engagement": {
    "engagement_id": "ENG-EMAIL-XXXX",
    "lead_id": "REV-LEAD-...",
    "type": "email",
    "direction": "outbound",
    "to_email": "lead@company.com",
    "from_email": "noreply@yourdomain.com",
    "subject": "Following up on our discussion",
    "body_html": "<p>Hi…</p>",
    "body_text": "",
    "status": "sent",
    "provider": "sendgrid",
    "provider_message_id": "abc123xyz",
    "created_at": "2026-03-04T11:24:00Z",
    "updated_at": "2026-03-04T11:24:01Z"
  }
}
```
**Response (SendGrid not configured)**
```json
{
  "success": false,
  "error": "SENDGRID_API_KEY is not configured. Add it to .env to enable email sending.",
  "engagement": { ...same shape with status: "failed" }
}
```

### Get Engagements
```
GET /api/commerce/workflow/revenue/leads/{lead_id}/engagements
```
Returns array of engagement records (newest first) with full status tracking.

---

## Webhook

### Endpoint
```
POST /api/webhooks/sendgrid
```

### Events handled

| SendGrid event | Engagement status |
|---|---|
| `delivered` | `delivered` |
| `open` | `open` |
| `click` | `click` |
| `bounce` | `bounce` |
| `dropped` | `dropped` |
| `deferred` | `queued` |
| `spamreport` | `failed` |

Status only moves **forward** — past statuses are never regressed.

### SendGrid Dashboard Setup
1. Go to **Settings → Mail Settings → Event Webhook**
2. Set HTTP Post URL: `https://<your-domain>/api/webhooks/sendgrid`
3. Enable events: **Delivered, Open, Click, Bounce, Dropped, Deferred, Spam Report**
4. Enable **Signed Event Webhook** and copy the public key into `SENDGRID_WEBHOOK_SIGNING_KEY`

---

## Database (MongoDB)

### New collection: `revenue_workflow_engagements`

| Field | Type | Description |
|---|---|---|
| `engagement_id` | string | `ENG-EMAIL-XXXXXXXXXX` |
| `lead_id` | string | FK → `revenue_workflow_leads` |
| `type` | `"email"` | engagement type |
| `direction` | `"outbound"` | always outbound for sent emails |
| `to_email` | string | recipient |
| `from_email` | string | sender (from env var) |
| `subject` | string | email subject |
| `body_html` | string | HTML body |
| `body_text` | string | plain text body |
| `status` | string | `queued → sent → delivered → open → click` |
| `provider` | `"sendgrid"` | |
| `provider_message_id` | string/null | SendGrid X-Message-Id |
| `created_by` | string | user id (currently `"system"`) |
| `created_at` | ISO string | creation timestamp |
| `updated_at` | ISO string | last updated by webhook |

> **No migration needed.** MongoDB creates the collection on first document insert.

### Existing collection touched: `revenue_workflow_activities`
A lightweight record is also written here so the existing Engagement History tab shows the email.
Includes extra fields: `engagement_id`, `status` (email badge in UI).

---

## Local Testing (curl examples)

### Send email (replace token and lead_id)
```bash
curl -X POST http://localhost:8000/api/commerce/workflow/revenue/leads/REV-LEAD-20260304123456/engagements/email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt>" \
  -d '{
    "to": "test@example.com",
    "subject": "Hello from InnovateBook",
    "html": "<p>This is a test email.</p>"
  }'
```

### Simulate SendGrid webhook event locally
```bash
curl -X POST http://localhost:8000/api/webhooks/sendgrid \
  -H "Content-Type: application/json" \
  -d '[{
    "event": "delivered",
    "email": "test@example.com",
    "custom_args": {
      "engagement_id": "ENG-EMAIL-ABCDE12345",
      "lead_id": "REV-LEAD-20260304123456"
    }
  }]'
```

### Get all engagements for a lead
```bash
curl http://localhost:8000/api/commerce/workflow/revenue/leads/REV-LEAD-20260304123456/engagements \
  -H "Authorization: Bearer <your_jwt>"
```

---

## Error Handling

| Scenario | Behavior |
|---|---|
| `SENDGRID_API_KEY` missing or placeholder | Returns `success: false` with a clear message; engagement stored with `status: failed` |
| `SENDGRID_FROM_EMAIL` missing | Same as above |
| Lead not found | HTTP 404 |
| Invalid email format | HTTP 422 with details |
| SendGrid API 4xx/5xx | Engagement stored as `failed`; error text from SendGrid returned |
| Webhook: no matching engagement | Logged as warning; webhook returns 200 (prevents SendGrid retry storms) |
| Webhook: status would regress | Update skipped silently |
| Webhook: invalid signature | HTTP 403 (only when `SENDGRID_WEBHOOK_SIGNING_KEY` is set) |

---

## Files Changed / Added

| File | Action | Description |
|---|---|---|
| `services/sendgrid_service.py` | **NEW** | SendGrid REST API wrapper |
| `routes/integrations/sendgrid_webhook_routes.py` | **NEW** | Webhook receiver with signature verification |
| `routes/commerce/workflow_routes.py` | **MODIFIED** | Added `POST …/engagements/email` and `GET …/engagements` |
| `main.py` | **MODIFIED** | Registers `sendgrid_webhook_router` at `/api/webhooks/sendgrid` |
| `.env` | **MODIFIED** | Adds SendGrid placeholder env vars |
| `src/pages/commerce/revenue-workflow/EngagementModal.jsx` | **MODIFIED** | Adds "Send Email" tab with compose form |

---

## UI Components & Email Flow

### Location
**Engage button → Engagement History modal → "Send Email" tab**

### Email Compose Tab
| Element | Description |
|---|---|
| Templates dropdown | Pre-built message templates (Initial outreach, Demo invite, Follow-up, Proposal). Fills Subject + Body with one click. |
| To field | Pre-filled with `lead.contact_email`. Editable. |
| Subject field | Free-text subject line. Required. |
| Message textarea | Plain text body (converted to HTML on send). Required. |
| Send button | Disabled until To/Subject/Body are non-empty. Shows spinner during send. |
| Cancel button | Switches back to Log Activity tab. |
| Clear form link | Clears Subject and Body. |
| Success banner | Green — "Email sent — it now appears in the activity log." |
| Error banner | Red — shows exact error from backend (e.g. API key not configured). |

### Activity History — Email Entries
Email activities display richer information than log entries:

| Field | Display |
|---|---|
| Icon | Blue mail icon (vs gray for other types) |
| Type label | "email" |
| Status pill | Colour-coded: `sent` (blue) · `delivered` (green) · `open` (purple) · `click` (amber) · `bounce/failed` (red) |
| Subject line | Parsed from activity summary — shown in bold |
| Body preview | First ~2 lines of message summary |
| Timestamp | Date + time (e.g. "4 Mar, 11:24") |

### API Call (frontend → backend)
```
POST /api/commerce/workflow/revenue/leads/{lead_id}/engagements/email
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "to":   "lead@example.com",
  "subject": "Following up on our discussion",
  "html": "Plain text with <br/> newlines",
  "text": "Plain text original"
}
```
After a successful send, `fetchActivities()` is called automatically to refresh the list.

### Props added to EngagementModal
| Prop | Type | Description |
|---|---|---|
| `fetchActivities` | `function` | Passed from `RevenueLeadDetail`; called after successful email send to refresh the activity list. |

