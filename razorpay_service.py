"""
Razorpay Integration Service
Handles subscriptions, webhooks, payment verification
"""
import razorpay
import os
import hmac
import hashlib
import logging
from typing import Dict, Any, Optional
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

RAZORPAY_KEY_ID = os.environ.get('RAZORPAY_KEY_ID')
RAZORPAY_KEY_SECRET = os.environ.get('RAZORPAY_KEY_SECRET')

# Initialize Razorpay client
import os
import razorpay

RAZORPAY_KEY_ID = os.environ.get("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.environ.get("RAZORPAY_KEY_SECRET")

razorpay_client = None
if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET:
    razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))


# Plan IDs (Create these in Razorpay Dashboard)
RAZORPAY_PLANS = {
    "basic_monthly": {
        "plan_id": "plan_basic_monthly",  # Replace with actual Razorpay plan ID
        "name": "Basic Plan - Monthly",
        "amount": 999,  # In paise (₹9.99)
        "currency": "INR",
        "period": "monthly"
    },
    "pro_monthly": {
        "plan_id": "plan_pro_monthly",
        "name": "Pro Plan - Monthly",
        "amount": 2999,  # In paise (₹29.99)
        "currency": "INR",
        "period": "monthly"
    },
    "enterprise_monthly": {
        "plan_id": "plan_enterprise_monthly",
        "name": "Enterprise Plan - Monthly",
        "amount": 9999,  # In paise (₹99.99)
        "currency": "INR",
        "period": "monthly"
    }
}

async def create_razorpay_customer(org: Dict[str, Any]) -> str:
    """
    Create a customer in Razorpay
    Returns: Razorpay customer ID
    """
    try:
        customer_data = {
            "name": org["org_name"],
            "email": f"billing@{org['org_slug']}.com",  # Use org admin email in production
            "contact": "9999999999",  # Get from org admin
            "fail_existing": "0",  # Don't fail if customer exists
            "notes": {
                "org_id": org["org_id"],
                "org_slug": org["org_slug"]
            }
        }
        
        customer = razorpay_client.customer.create(customer_data)
        logger.info(f"✅ Razorpay customer created: {customer['id']}")
        return customer['id']
        
    except Exception as e:
        logger.error(f"❌ Razorpay customer creation failed: {e}")
        raise

async def create_subscription(
    org_id: str,
    plan_key: str,
    razorpay_customer_id: str,
    db
) -> Dict[str, Any]:
    """
    Create a subscription in Razorpay
    Returns: Subscription details
    """
    try:
        plan = RAZORPAY_PLANS.get(plan_key)
        if not plan:
            raise ValueError(f"Invalid plan: {plan_key}")
        
        subscription_data = {
            "plan_id": plan["plan_id"],
            "customer_id": razorpay_customer_id,
            "quantity": 1,
            "total_count": 12,  # 12 billing cycles
            "customer_notify": 1,
            "notes": {
                "org_id": org_id
            }
        }
        
        subscription = razorpay_client.subscription.create(subscription_data)
        logger.info(f"✅ Razorpay subscription created: {subscription['id']}")
        
        # Store subscription in database
        subscription_doc = {
            "subscription_id": subscription['id'],
            "org_id": org_id,
            "razorpay_subscription_id": subscription['id'],
            "plan_id": plan_key,
            "status": subscription['status'],  # created/authenticated/active
            "current_start": None,
            "current_end": None,
            "next_billing_at": None,
            "created_at": datetime.now(timezone.utc)
        }
        await db.subscriptions.insert_one(subscription_doc)
        
        return subscription
        
    except Exception as e:
        logger.error(f"❌ Razorpay subscription creation failed: {e}")
        raise

async def verify_webhook_signature(payload: bytes, signature: str, webhook_secret: str) -> bool:
    """
    Verify Razorpay webhook signature
    Returns: True if valid, False otherwise
    """
    try:
        expected_signature = hmac.new(
            webhook_secret.encode(),
            payload,
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(signature, expected_signature)
        
    except Exception as e:
        logger.error(f"❌ Webhook signature verification failed: {e}")
        return False

async def handle_subscription_activated(payload: Dict[str, Any], db):
    """
    Handle subscription.activated webhook
    - Update subscription status to 'active'
    - Disable demo mode
    - Remove demo data
    """
    try:
        subscription = payload['subscription']
        org_id = subscription['notes'].get('org_id')
        
        if not org_id:
            logger.error("❌ No org_id in subscription notes")
            return
        
        logger.info(f"🎉 Subscription activated for org: {org_id}")
        
        # Update subscription in database
        await db.subscriptions.update_one(
            {"org_id": org_id},
            {
                "$set": {
                    "status": "active",
                    "current_start": datetime.fromtimestamp(subscription['current_start'], tz=timezone.utc),
                    "current_end": datetime.fromtimestamp(subscription['current_end'], tz=timezone.utc),
                    "next_billing_at": datetime.fromtimestamp(subscription.get('charge_at', subscription['current_end']), tz=timezone.utc),
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        
        # Update organization
        await db.organizations.update_one(
            {"org_id": org_id},
            {
                "$set": {
                    "subscription_status": "active",
                    "is_demo": False,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        
        # Remove demo data (import demo service)
        from demo_mode_service import remove_demo_data
        await remove_demo_data(org_id, db)
        
        logger.info(f"✅ Org {org_id} upgraded to active subscription")
        
    except Exception as e:
        logger.error(f"❌ Subscription activation handler failed: {e}")

async def handle_payment_failed(payload: Dict[str, Any], db):
    """
    Handle payment.failed webhook
    - Log the failure
    - Notify org admin (future)
    """
    try:
        payment = payload['payment']
        subscription_id = payment.get('subscription_id')
        
        logger.warning(f"⚠️ Payment failed for subscription: {subscription_id}")
        
        # Future: Send email notification to org admin
        
    except Exception as e:
        logger.error(f"❌ Payment failed handler error: {e}")

async def handle_subscription_cancelled(payload: Dict[str, Any], db):
    """
    Handle subscription.cancelled webhook
    - Update subscription status to 'cancelled'
    - Set org to read-only mode
    """
    try:
        subscription = payload['subscription']
        org_id = subscription['notes'].get('org_id')
        
        if not org_id:
            logger.error("❌ No org_id in subscription notes")
            return
        
        logger.warning(f"⚠️ Subscription cancelled for org: {org_id}")
        
        # Update subscription
        await db.subscriptions.update_one(
            {"org_id": org_id},
            {
                "$set": {
                    "status": "cancelled",
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        
        # Update organization
        await db.organizations.update_one(
            {"org_id": org_id},
            {
                "$set": {
                    "subscription_status": "cancelled",
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        
        logger.info(f"✅ Org {org_id} marked as cancelled")
        
    except Exception as e:
        logger.error(f"❌ Subscription cancellation handler failed: {e}")

async def handle_subscription_charged(payload: Dict[str, Any], db):
    """
    Handle subscription.charged webhook
    - Update billing dates
    """
    try:
        subscription = payload['subscription']
        org_id = subscription['notes'].get('org_id')
        
        if not org_id:
            return
        
        logger.info(f"💰 Subscription charged for org: {org_id}")
        
        # Update subscription billing info
        await db.subscriptions.update_one(
            {"org_id": org_id},
            {
                "$set": {
                    "current_start": datetime.fromtimestamp(subscription['current_start'], tz=timezone.utc),
                    "current_end": datetime.fromtimestamp(subscription['current_end'], tz=timezone.utc),
                    "next_billing_at": datetime.fromtimestamp(subscription.get('charge_at', subscription['current_end']), tz=timezone.utc),
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        
    except Exception as e:
        logger.error(f"❌ Subscription charged handler error: {e}")
