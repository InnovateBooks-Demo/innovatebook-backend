"""
Test Helper Routes - Development Only
Provides endpoints to retrieve verification codes for testing
"""
from fastapi import APIRouter, Depends
from datetime import datetime, timezone

router = APIRouter(prefix="/test-helpers", tags=["Test Helpers - Dev Only"])

def get_db():
    """Get database instance"""
    from main import db
    return db

@router.get("/get-email-code/{email}")
async def get_email_verification_code(email: str, db = Depends(get_db)):
    """
    Get the latest email verification code for an email address
    FOR TESTING ONLY - Remove in production
    """
    verification = await db.email_verifications.find_one(
        {"email": email},
        sort=[("created_at", -1)]
    )
    
    if not verification:
        return {"success": False, "message": "No verification code found"}
    
    return {
        "success": True,
        "email": email,
        "code": verification["verification_code"],
        "expires_at": verification["expires_at"].isoformat(),
        "verified": verification.get("verified", False)
    }

@router.get("/get-mobile-otp/{mobile}")
async def get_mobile_otp_code(mobile: str, db = Depends(get_db)):
    """
    Get the latest mobile OTP for a phone number
    FOR TESTING ONLY - Remove in production
    """
    verification = await db.mobile_verifications.find_one(
        {"mobile": mobile},
        sort=[("created_at", -1)]
    )
    
    if not verification:
        return {"success": False, "message": "No OTP found"}
    
    return {
        "success": True,
        "mobile": f"{verification['mobile_country_code']}{verification['mobile']}",
        "otp": verification["otp_code"],
        "expires_at": verification["expires_at"].isoformat(),
        "verified": verification.get("verified", False)
    }

@router.get("/get-codes-by-email/{email}")
async def get_all_codes_by_email(email: str, db = Depends(get_db)):
    """
    Get both email and mobile verification codes for a user by email
    FOR TESTING ONLY - Remove in production
    """
    # Find the signup session to get mobile number
    from auth_routes import signup_sessions
    
    mobile = None
    for session in signup_sessions.values():
        if session.get("email") == email:
            mobile = session.get("mobile")
            break
    
    # Get email code
    email_verification = await db.email_verifications.find_one(
        {"email": email},
        sort=[("created_at", -1)]
    )
    
    # Get mobile OTP
    mobile_verification = None
    if mobile:
        mobile_verification = await db.mobile_verifications.find_one(
            {"mobile": mobile},
            sort=[("created_at", -1)]
        )
    
    return {
        "success": True,
        "email": email,
        "email_code": email_verification["verification_code"] if email_verification else None,
        "mobile": mobile,
        "mobile_otp": mobile_verification["otp_code"] if mobile_verification else None,
        "message": "Use these codes to complete verification"
    }

@router.get("/get-password-reset-code/{email}")
async def get_password_reset_code(email: str, db = Depends(get_db)):
    """
    Get the latest password reset code for an email
    FOR TESTING ONLY - Remove in production
    """
    reset = await db.password_resets.find_one(
        {"email": email, "used": False},
        sort=[("created_at", -1)]
    )
    
    if not reset:
        return {"success": False, "message": "No reset code found"}
    
    return {
        "success": True,
        "email": email,
        "reset_code": reset["reset_code"],
        "expires_at": reset["expires_at"].isoformat(),
        "used": reset.get("used", False)
    }
