"""
SendGrid Email Service
Handles outbound email delivery via SendGrid REST API.
Reads env vars at call time so placeholders work at import.
"""
import os
import logging
import httpx
from typing import Optional

logger = logging.getLogger(__name__)

SENDGRID_API_URL = "https://api.sendgrid.com/v3/mail/send"

SENDGRID_STATUS_MAP = {
    "delivered":  "delivered",
    "open":       "open",
    "click":      "click",
    "bounce":     "bounce",
    "dropped":    "dropped",
    "deferred":   "queued",
    "spamreport": "failed",
    "unsubscribe":"failed",
}

# Status precedence — higher index wins; don't allow regressions
STATUS_RANK = ["queued", "sent", "delivered", "open", "click", "bounce", "dropped", "failed"]


def _rank(status: str) -> int:
    try:
        return STATUS_RANK.index(status)
    except ValueError:
        return -1


def should_update_status(current: str, incoming: str) -> bool:
    """Return True if incoming status is an advancement (no regression)."""
    return _rank(incoming) >= _rank(current)


async def send_email(
    *,
    to_email: str,
    subject: str,
    html: str,
    text: Optional[str] = None,
    engagement_id: str,
    lead_id: str,
) -> dict:
    """
    Send an email via SendGrid REST API.

    Returns a dict with keys:
      success   : bool
      message_id: str | None   (SendGrid X-Message-Id header)
      error     : str | None
    """
    api_key = os.environ.get("SENDGRID_API_KEY", "")
    from_email = os.environ.get("SENDGRID_FROM_EMAIL", "")
    from_name = os.environ.get("SENDGRID_FROM_NAME", "InnovateBook CRM")

    if not api_key or api_key.startswith("SG.placeholder"):
        logger.warning("[SendGrid] API key not configured — email NOT sent.")
        return {
            "success": False,
            "message_id": None,
            "error": "SENDGRID_API_KEY is not configured. Add it to .env to enable email sending.",
        }

    if not from_email:
        logger.warning("[SendGrid] SENDGRID_FROM_EMAIL not configured — email NOT sent.")
        return {
            "success": False,
            "message_id": None,
            "error": "SENDGRID_FROM_EMAIL is not configured. Add it to .env to enable email sending.",
        }

    content = [{"type": "text/html", "value": html}]
    if text:
        content.insert(0, {"type": "text/plain", "value": text})

    payload = {
        "personalizations": [
            {
                "to": [{"email": to_email}],
                "custom_args": {
                    "engagement_id": engagement_id,
                    "lead_id": lead_id,
                },
            }
        ],
        "from": {"email": from_email, "name": from_name},
        "subject": subject,
        "content": content,
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(SENDGRID_API_URL, json=payload, headers=headers)

        if resp.status_code in (200, 202):
            msg_id = resp.headers.get("X-Message-Id") or resp.headers.get("x-message-id")
            logger.info(f"[SendGrid] Email sent OK → message_id={msg_id}")
            return {"success": True, "message_id": msg_id, "error": None}
        else:
            err_text = resp.text[:500]
            logger.error(f"[SendGrid] Send failed: status={resp.status_code} body={err_text}")
            return {
                "success": False,
                "message_id": None,
                "error": f"SendGrid API error {resp.status_code}: {err_text}",
            }
    except httpx.TimeoutException:
        logger.error("[SendGrid] Request timed out.")
        return {"success": False, "message_id": None, "error": "SendGrid request timed out."}
    except Exception as exc:
        logger.exception("[SendGrid] Unexpected error during send.")
        return {"success": False, "message_id": None, "error": str(exc)}
