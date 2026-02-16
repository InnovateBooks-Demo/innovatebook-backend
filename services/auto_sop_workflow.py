"""
Automatic SOP Workflow
Chains all SOP stages together to run automatically after lead creation
"""

import asyncio
from datetime import datetime, timezone
from gpt_enrichment_service import enrich_lead_with_gpt
import aiohttp
import random


async def auto_validate_lead(lead_id: str, lead_data: dict, db) -> bool:
    """Auto-validate lead after enrichment"""
    try:
        print(f"  🔍 Auto-validating lead {lead_id}...")
        
        # Simple validation checks
        validation_checks = {
            "email_valid": bool(lead_data.get("email_address") and "@" in lead_data.get("email_address")),
            "phone_valid": bool(lead_data.get("phone_number")),
            "company_valid": bool(lead_data.get("company_name")),
            "contact_valid": bool(lead_data.get("contact_name"))
        }
        
        all_valid = all(validation_checks.values())
        
        # Update lead
        await db.commerce_leads.update_one(
            {"lead_id": lead_id},
            {
                "$set": {
                    "validation_status": "Valid" if all_valid else "Invalid",
                    "validation_checks": validation_checks,
                    "lead_status": "Validated" if all_valid else "Enriching",
                    "current_sop_stage": "Lead_Qualify_SOP" if all_valid else "Lead_Validate_SOP",
                    "sop_completion_status.Lead_Validate_SOP": all_valid,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        
        print(f"  ✅ Validation: {'Valid' if all_valid else 'Invalid'}")
        return all_valid
        
    except Exception as e:
        print(f"  ❌ Auto-validation error: {e}")
        return False


async def auto_qualify_lead(lead_id: str, lead_data: dict, db) -> bool:
    """Auto-qualify lead after validation"""
    try:
        print(f"  🎯 Auto-qualifying lead {lead_id}...")
        
        # Calculate qualification score
        qualification_score = 0
        
        # Check company size (max 30 points)
        if lead_data.get("company_size") == "Enterprise (500+)":
            qualification_score += 30
        elif lead_data.get("company_size") == "Medium (51-500)":
            qualification_score += 20
        else:
            qualification_score += 10
        
        # Check deal value (max 30 points)
        deal_value = lead_data.get("estimated_deal_value", 0)
        if deal_value >= 10000000:
            qualification_score += 30
        elif deal_value >= 5000000:
            qualification_score += 20
        elif deal_value >= 1000000:
            qualification_score += 10
        
        # Check timeline (max 20 points)
        timeline = lead_data.get("decision_timeline", "")
        if "0-3" in timeline:
            qualification_score += 20
        elif "3-6" in timeline:
            qualification_score += 15
        else:
            qualification_score += 5
        
        # Check industry (max 20 points)
        if lead_data.get("industry_type") in ["Technology", "Finance"]:
            qualification_score += 20
        else:
            qualification_score += 10
        
        is_qualified = qualification_score >= 50
        
        # Update lead
        await db.commerce_leads.update_one(
            {"lead_id": lead_id},
            {
                "$set": {
                    "qualification_status": "Qualified" if is_qualified else "Disqualified",
                    "qualification_score": qualification_score,
                    "lead_status": "Qualified" if is_qualified else "Validated",
                    "current_sop_stage": "Lead_Score_SOP" if is_qualified else "Lead_Qualify_SOP",
                    "sop_completion_status.Lead_Qualify_SOP": is_qualified,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        
        print(f"  ✅ Qualification: {'Qualified' if is_qualified else 'Disqualified'} (Score: {qualification_score}/100)")
        return is_qualified
        
    except Exception as e:
        print(f"  ❌ Auto-qualification error: {e}")
        return False


async def auto_score_lead(lead_id: str, lead_data: dict, db) -> bool:
    """Auto-score lead after qualification"""
    try:
        print(f"  ⭐ Auto-scoring lead {lead_id}...")
        
        # Calculate AI-powered lead score (45% of total, 55% from engagement)
        fit_score = 0
        intent_score = 0
        potential_score = 0
        engagement_score = 0  # Will be calculated based on activities
        
        # Fit Score (0-15 points = 15% of 100) - How well lead fits ICP
        if lead_data.get("company_size") == "Enterprise (500+)":
            fit_score += 6
        elif lead_data.get("company_size") == "Medium (51-500)":
            fit_score += 4
        else:
            fit_score += 2
        
        if lead_data.get("industry_type") in ["Technology", "Finance"]:
            fit_score += 6
        else:
            fit_score += 3
        
        if lead_data.get("country") == "India":
            fit_score += 3
        else:
            fit_score += 2
        
        # Intent Score (0-15 points = 15% of 100) - Buying signals
        timeline = lead_data.get("decision_timeline", "")
        if "0-3" in timeline:
            intent_score += 7
        elif "3-6" in timeline:
            intent_score += 5
        else:
            intent_score += 3
        
        if lead_data.get("product_or_solution_interested_in"):
            intent_score += 5
        
        if lead_data.get("lead_source") in ["Website", "LinkedIn"]:
            intent_score += 3
        
        # Potential Score (0-15 points = 15% of 100) - Revenue potential
        deal_value = lead_data.get("estimated_deal_value", 0)
        if deal_value >= 10000000:
            potential_score += 10
        elif deal_value >= 5000000:
            potential_score += 7
        elif deal_value >= 1000000:
            potential_score += 5
        else:
            potential_score += 2
        
        if lead_data.get("company_size") == "Enterprise (500+)":
            potential_score += 5
        else:
            potential_score += 3
        
        # Total score (max 45 from automation, 55 from engagement)
        # Initially engagement_score is 0, will increase with activities
        lead_score = fit_score + intent_score + potential_score + engagement_score
        
        # Determine category based on total score
        if lead_score >= 76:
            lead_score_category = "Hot"
        elif lead_score >= 51:
            lead_score_category = "Warm"
        else:
            lead_score_category = "Cold"
        
        # Update lead
        await db.commerce_leads.update_one(
            {"lead_id": lead_id},
            {
                "$set": {
                    "lead_score": lead_score,
                    "fit_score": fit_score,
                    "intent_score": intent_score,
                    "potential_score": potential_score,
                    "engagement_score": engagement_score,  # New field
                    "lead_score_category": lead_score_category,
                    "lead_status": "Scored",
                    "current_sop_stage": "Lead_Assign_SOP",
                    "sop_completion_status.Lead_Score_SOP": True,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        
        print(f"  ✅ Scoring: {lead_score}/100 ({lead_score_category}) - Fit:{fit_score} Intent:{intent_score} Potential:{potential_score}")
        return True
        
    except Exception as e:
        print(f"  ❌ Auto-scoring error: {e}")
        return False


async def auto_assign_lead(lead_id: str, lead_data: dict, db) -> bool:
    """Auto-assign lead after scoring"""
    try:
        print(f"  👥 Auto-assigning lead {lead_id}...")
        
        # Get lead score to determine assignment
        lead_doc = await db.commerce_leads.find_one({"lead_id": lead_id})
        lead_score = lead_doc.get("lead_score", 0)
        
        # Assignment logic based on score
        if lead_score >= 76:
            assigned_to = "Senior Sales Team"
        elif lead_score >= 51:
            assigned_to = "Sales Team"
        else:
            assigned_to = "Junior Sales Team"
        
        # Update lead
        await db.commerce_leads.update_one(
            {"lead_id": lead_id},
            {
                "$set": {
                    "assigned_to": assigned_to,
                    "assigned_at": datetime.now(timezone.utc),
                    "lead_status": "Assigned",
                    "current_sop_stage": "Lead_Engage_SOP",
                    "sop_completion_status.Lead_Assign_SOP": True,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        
        print(f"  ✅ Assignment: {assigned_to}")
        return True
        
    except Exception as e:
        print(f"  ❌ Auto-assignment error: {e}")
        return False


async def run_complete_sop_workflow(lead_id: str, lead_data: dict, db):
    """
    Run complete SOP workflow automatically
    Called as background task after lead creation
    """
    try:
        print(f"\n🚀 ===== AUTOMATIC SOP WORKFLOW STARTED FOR {lead_id} =====\n")
        
        # Wait 4 seconds before starting
        await asyncio.sleep(4)
        
        # STAGE 1: ENRICH (4-10 seconds)
        print("📊 STAGE 1: ENRICHMENT")
        print(f"🚀 Using GPT-5 enrichment for {lead_data.get('company_name')}")
        
        gpt_result = await enrich_lead_with_gpt(
            company_name=lead_data.get("company_name"),
            industry=lead_data.get("industry_type"),
            city=lead_data.get("city"),
            country=lead_data.get("country", "India"),
            website=lead_data.get("website_url"),
            contact_name=lead_data.get("contact_name"),
            email=lead_data.get("email_address")
        )
        
        # Determine enrichment result
        is_enriched = gpt_result.get("success", False)
        
        # Prepare update fields
        update_fields = {}
        if gpt_result['success']:
            enriched = gpt_result['enriched_data']
            # Add all enriched fields (same as in lead_sop_complete.py)
            update_fields = {
                "legal_entity_name": enriched.get('legal_entity_name'),
                "year_established": enriched.get('year_established'),
                "company_size": enriched.get('company_size'),
                "employees_count": enriched.get('employees_count'),
                "annual_turnover": enriched.get('annual_turnover'),
                "business_model": enriched.get('business_model'),
                "company_description": enriched.get('company_description'),
                "gstin": enriched.get('gstin'),
                "pan": enriched.get('pan'),
                "cin": enriched.get('cin'),
                "registered_name": enriched.get('registered_name'),
                "verification_status": enriched.get('verification_status'),
                "headquarters": enriched.get('headquarters'),
                "state": enriched.get('state'),
                "pincode": enriched.get('pincode'),
                "branch_locations": enriched.get('branch_locations', []),
                "official_website": enriched.get('official_website'),
                "linkedin_page": enriched.get('linkedin_page'),
                "twitter_url": enriched.get('twitter_url'),
                "facebook_url": enriched.get('facebook_url'),
                "instagram_url": enriched.get('instagram_url'),
                "domain_emails": enriched.get('domain_emails', []),
                "technology_stack": enriched.get('technology_stack', []),
                "estimated_revenue": enriched.get('estimated_revenue'),
                "funding_stage": enriched.get('funding_stage'),
                "investors": enriched.get('investors', []),
                "ownership_type": enriched.get('ownership_type'),
                "main_products_services": enriched.get('main_products_services', []),
                "key_markets": enriched.get('key_markets', []),
                "office_count": enriched.get('office_count'),
                "certifications": enriched.get('certifications', []),
                "contact_designation": enriched.get('designation'),
                "contact_department": enriched.get('department'),
                "contact_phone": enriched.get('contact_phone'),
                "contact_linkedin": enriched.get('contact_linkedin'),
                "seniority_level": enriched.get('seniority_level'),
                "decision_maker_flag": enriched.get('decision_maker_flag'),
                "last_verified_date": enriched.get('last_verified_date'),
                "contact_source": enriched.get('contact_source'),
                "enrichment_confidence": gpt_result['confidence'],
                "enrichment_status": "Completed"
            }
            print(f"✅ GPT enrichment successful - {len(update_fields)} fields")
        else:
            update_fields = {
                "enrichment_status": "Failed"
            }
            print(f"❌ GPT enrichment failed: {gpt_result.get('error')}")
        
        # Update with enrichment data
        update_fields["enrichment_last_updated"] = datetime.now(timezone.utc)
        update_fields["sop_completion_status.Lead_Enrich_SOP"] = is_enriched
        update_fields["updated_at"] = datetime.now(timezone.utc)
        
        await db.commerce_leads.update_one(
            {"lead_id": lead_id},
            {"$set": update_fields}
        )
        
        print(f"✅ Enrichment completed: {'Success' if is_enriched else 'Failed'}\n")
        
        # Small delay between stages
        await asyncio.sleep(1)
        
        # STAGE 2: VALIDATE
        print("📊 STAGE 2: VALIDATION")
        validated = await auto_validate_lead(lead_id, lead_data, db)
        if not validated:
            print("⚠️ Validation failed, stopping workflow\n")
            return
        print("")
        
        await asyncio.sleep(1)
        
        # STAGE 3: QUALIFY
        print("📊 STAGE 3: QUALIFICATION")
        qualified = await auto_qualify_lead(lead_id, lead_data, db)
        if not qualified:
            print("⚠️ Lead disqualified, stopping workflow\n")
            return
        print("")
        
        await asyncio.sleep(1)
        
        # STAGE 4: SCORE
        print("📊 STAGE 4: SCORING")
        scored = await auto_score_lead(lead_id, lead_data, db)
        if not scored:
            print("⚠️ Scoring failed, stopping workflow\n")
            return
        print("")
        
        await asyncio.sleep(1)
        
        # STAGE 5: ASSIGN
        print("📊 STAGE 5: ASSIGNMENT")
        assigned = await auto_assign_lead(lead_id, lead_data, db)
        print("")
        
        print(f"🎉 ===== AUTOMATIC SOP WORKFLOW COMPLETED FOR {lead_id} =====\n")
        print("✅ Final Status: Assigned")
        print("✅ All stages completed: Enrich → Validate → Qualify → Score → Assign\n")
        
    except Exception as e:
        print(f"❌ Automatic SOP workflow error for {lead_id}: {e}")
