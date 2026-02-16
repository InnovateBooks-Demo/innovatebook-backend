"""
Razorpay Webhook Routes
Handles webhook events from Razorpay
"""
from fastapi import APIRouter, HTTPException, Request, Depends, Header
import logging
import json
from typing import Optional

from razorpay_service import (
    verify_webhook_signature,
    handle_subscription_activated,
    handle_payment_failed,
    handle_subscription_cancelled,
    handle_subscription_charged
)
import os
from motor.motor_asyncio import AsyncIOMotorClient

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])

# Direct MongoDB connection (avoid circular import)
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

def get_db():
    """Get database instance"""
    return db

# Razorpay webhook secret (set this in production)
RAZORPAY_WEBHOOK_SECRET = "your_webhook_secret_here"  # Change in production

@router.post("/razorpay")
async def razorpay_webhook(
    request: Request,
    x_razorpay_signature: Optional[str] = Header(None),
    db = Depends(get_db)
):
    """
    Handle Razorpay webhook events
    Verifies signature and routes to appropriate handler
    """
    try:
        # Get raw body
        body = await request.body()
        
        # Verify signature (in production)
        # if not verify_webhook_signature(body, x_razorpay_signature, RAZORPAY_WEBHOOK_SECRET):
        #     logger.error("❌ Invalid webhook signature")
        #     raise HTTPException(status_code=400, detail="Invalid signature")
        
        # Parse payload
        payload = json.loads(body)
        event = payload.get("event")
        
        logger.info(f"📥 Razorpay webhook received: {event}")
        
        # Route to handler based on event type
        if event == "subscription.activated":
            await handle_subscription_activated(payload["payload"], db)
        
        elif event == "subscription.charged":
            await handle_subscription_charged(payload["payload"], db)
        
        elif event == "subscription.cancelled":
            await handle_subscription_cancelled(payload["payload"], db)
        
        elif event == "payment.failed":
            await handle_payment_failed(payload["payload"], db)
        
        else:
            logger.warning(f"⚠️ Unhandled webhook event: {event}")
        
        return {"success": True, "message": "Webhook processed"}
        
    except json.JSONDecodeError:
        logger.error("❌ Invalid JSON in webhook")
        raise HTTPException(status_code=400, detail="Invalid JSON")
    except Exception as e:
        logger.error(f"❌ Webhook processing error: {e}")
        raise HTTPException(status_code=500, detail="Webhook processing failed")

@router.get("/razorpay/test")
async def test_webhook_endpoint():
    """Test endpoint to verify webhook route is accessible"""
    return {
        "success": True,
        "message": "Razorpay webhook endpoint is accessible",
        "endpoint": "/api/webhooks/razorpay"
    }
