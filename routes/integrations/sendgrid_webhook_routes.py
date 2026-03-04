"""
SendGrid Inbound Webhook
Receives delivery-event arrays from SendGrid and updates engagement status.
Register in SendGrid Dashboard → Settings → Mail Settings → Event Webhook.
Webhook URL: https://<your-domain>/api/webhooks/sendgrid
"""
import os
import hashlib
import hmac
import base64
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Request

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhooks/sendgrid", tags=["SendGrid Webhook"])

# Status precedence — no regressions
_STATUS_RANK = ["queued", "sent", "delivered", "open", "click", "bounce", "dropped", "failed"]


def _rank(s: str) -> int:
    try:
        return _STATUS_RANK.index(s)
    except ValueError:
        return -1


_SG_EVENT_MAP = {
    "delivered":   "delivered",
    "open":        "open",
    "click":       "click",
    "bounce":      "bounce",
    "dropped":     "dropped",
    "deferred":    "queued",
    "spamreport":  "failed",
    "unsubscribe": "failed",
    "group_unsubscribe": "failed",
}


def _verify_signature(payload_bytes: bytes, sg_signature: str, sg_timestamp: str) -> bool:
    """
    Verify SendGrid ECDSA webhook signature.
    If SENDGRID_WEBHOOK_SIGNING_KEY is not set, skip verification with a warning.
    Docs: https://docs.sendgrid.com/for-developers/tracking-events/getting-started-event-webhook-security-features
    """
    signing_key = os.environ.get("SENDGRID_WEBHOOK_SIGNING_KEY", "")
    if not signing_key:
        logger.warning("[SendGrid Webhook] SENDGRID_WEBHOOK_SIGNING_KEY not set — skipping signature verification (INSECURE).")
        return True

    try:
        # SendGrid uses ECDSA-SHA256; verify using python-ecdsa if available.
        from ecdsa import VerifyingKey, NIST256p, BadSignatureError  # type: ignore
        vk = VerifyingKey.from_pem(signing_key)
        sig_bytes = base64.b64decode(sg_signature)
        msg = (sg_timestamp + payload_bytes.decode("utf-8")).encode("utf-8")
        return vk.verify(sig_bytes, msg, hashfunc=hashlib.sha256)
    except ImportError:
        logger.warning("[SendGrid Webhook] 'ecdsa' library not installed — falling back to HMAC-SHA256 (legacy key mode).")
        sig = hmac.new(signing_key.encode(), payload_bytes, hashlib.sha256).hexdigest()
        return hmac.compare_digest(sig, sg_signature)
    except Exception as exc:
        logger.error(f"[SendGrid Webhook] Signature verification failed: {exc}")
        return False


@router.post("")
async def handle_sendgrid_events(request: Request):
    """
    Receive an array of SendGrid events and update engagement status.
    SendGrid sends a JSON array even for a single event.
    """
    # ── 1. Signature verification ───────────────────────────────────────────
    payload_bytes = await request.body()
    sg_sig = request.headers.get("X-Twilio-Email-Event-Webhook-Signature", "")
    sg_ts  = request.headers.get("X-Twilio-Email-Event-Webhook-Timestamp", "")

    if sg_sig and not _verify_signature(payload_bytes, sg_sig, sg_ts):
        raise HTTPException(status_code=403, detail="Invalid webhook signature")

    # ── 2. Parse events ──────────────────────────────────────────────────────
    try:
        import json
        events = json.loads(payload_bytes)
        if not isinstance(events, list):
            events = [events]
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    # ── 3. Get DB ────────────────────────────────────────────────────────────
    try:
        from main import db
    except Exception:
        logger.error("[SendGrid Webhook] Could not import db from main")
        return {"received": len(events), "processed": 0}

    processed = 0
    now_iso = datetime.now(timezone.utc).isoformat()

    for event in events:
        sg_event = event.get("event", "")
        new_status = _SG_EVENT_MAP.get(sg_event)
        if not new_status:
            continue  # Ignore unrecognised events (e.g. 'processed')

        # ── Identify engagement ─────────────────────────────────────────────
        engagement_id = (
            (event.get("custom_args") or {}).get("engagement_id")
            or event.get("engagement_id")
        )
        message_id = event.get("sg_message_id", "").split(".")[0]  # strip suffix

        if not engagement_id and not message_id:
            logger.warning(f"[SendGrid Webhook] Event has no engagement_id or message_id: {event}")
            continue

        # ── Load current engagement ─────────────────────────────────────────
        query = {}
        if engagement_id:
            query["engagement_id"] = engagement_id
        elif message_id:
            query["provider_message_id"] = message_id

        eng = await db.revenue_workflow_engagements.find_one(query, {"_id": 0, "status": 1, "engagement_id": 1})
        if not eng:
            logger.warning(f"[SendGrid Webhook] Engagement not found: {query}")
            continue

        cur_status = eng.get("status", "queued")
        if _rank(new_status) < _rank(cur_status):
            # Don't regress status
            logger.debug(f"[SendGrid Webhook] Skipping regression {cur_status} → {new_status}")
            continue

        # ── Update ──────────────────────────────────────────────────────────
        update_fields = {
            "status": new_status,
            "updated_at": now_iso,
        }
        if message_id and not eng.get("provider_message_id"):
            update_fields["provider_message_id"] = message_id

        await db.revenue_workflow_engagements.update_one(
            {"engagement_id": eng["engagement_id"]},
            {"$set": update_fields},
        )

        logger.info(f"[SendGrid Webhook] engagement_id={eng['engagement_id']} {cur_status} → {new_status}")
        processed += 1

    return {"received": len(events), "processed": processed}
