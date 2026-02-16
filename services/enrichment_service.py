"""
Lead Enrichment Service
Uses free APIs and public data sources to enrich company information
"""

import asyncio
import re
from datetime import datetime, timezone
from typing import Optional, Dict, Any
import aiohttp
from urllib.parse import quote

# Free API endpoints (no keys required)
OPENCORPORATES_BASE = "https://api.opencorporates.com/v0.4"
WHOIS_LOOKUP_BASE = "https://www.whois.com/whois"


async def extract_domain_from_input(text: str) -> Optional[str]:
    """Extract domain from email, website URL, or company name"""
    if not text:
        return None
    
    # Extract from email
    email_match = re.search(r'[\w\.-]+@([\w\.-]+\.\w+)', text)
    if email_match:
        return email_match.group(1)
    
    # Extract from URL
    url_match = re.search(r'(?:https?://)?(?:www\.)?([\w\.-]+\.\w+)', text)
    if url_match:
        return url_match.group(1)
    
    return None


async def search_opencorporates(company_name: str, country: str = "in") -> Dict[str, Any]:
    """
    Search OpenCorporates for company information (FREE - no API key needed)
    """
    try:
        # Construct search URL
        search_query = quote(company_name)
        url = f"{OPENCORPORATES_BASE}/companies/search"
        params = {
            "q": company_name,
            "jurisdiction_code": country.lower(),
            "order": "score"
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params, timeout=10) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Extract first result
                    if data.get("results") and data["results"].get("companies"):
                        companies = data["results"]["companies"]
                        if companies:
                            company = companies[0]["company"]
                            return {
                                "found": True,
                                "company_number": company.get("company_number"),
                                "company_type": company.get("company_type"),
                                "registered_address": company.get("registered_address_in_full"),
                                "incorporation_date": company.get("incorporation_date"),
                                "jurisdiction": company.get("jurisdiction_code"),
                                "status": company.get("current_status"),
                                "source": "OpenCorporates"
                            }
        
        return {"found": False, "source": "OpenCorporates"}
        
    except Exception as e:
        print(f"OpenCorporates search error: {e}")
        return {"found": False, "error": str(e), "source": "OpenCorporates"}


async def get_domain_info(domain: str) -> Dict[str, Any]:
    """
    Get basic domain information using DNS and public WHOIS
    """
    try:
        domain_data = {
            "domain": domain,
            "domain_age_estimate": "Unknown",
            "hosting_country": "Unknown"
        }
        
        # Try to determine if domain is active
        try:
            async with aiohttp.ClientSession() as session:
                test_url = f"https://{domain}"
                async with session.head(test_url, timeout=5, allow_redirects=True) as response:
                    if response.status < 500:
                        domain_data["domain_active"] = True
                        domain_data["http_status"] = response.status
                    else:
                        domain_data["domain_active"] = False
        except:
            domain_data["domain_active"] = False
        
        return domain_data
        
    except Exception as e:
        print(f"Domain info error: {e}")
        return {"domain": domain, "error": str(e)}


def generate_linkedin_url(company_name: str, website: str = None) -> str:
    """
    Generate probable LinkedIn company page URL
    """
    # Clean company name
    clean_name = re.sub(r'(?i)(pvt\.?|ltd\.?|limited|private|inc\.?|corporation|corp\.?)', '', company_name)
    clean_name = re.sub(r'[^\w\s-]', '', clean_name).strip().lower()
    clean_name = re.sub(r'\s+', '-', clean_name)
    
    # If website exists, use domain name
    if website:
        domain_match = re.search(r'(?:https?://)?(?:www\.)?([\w-]+)', website)
        if domain_match:
            clean_name = domain_match.group(1)
    
    return f"https://linkedin.com/company/{clean_name}"


def estimate_employee_band(company_size: str) -> str:
    """
    Map company size to employee band
    """
    size_map = {
        "Small (1-50)": "1-50",
        "Medium (51-500)": "51-500",
        "Enterprise (500+)": "500+"
    }
    return size_map.get(company_size, "Unknown")


async def enrich_company_data(
    company_name: str,
    email: str = None,
    website: str = None,
    country: str = "India",
    company_size: str = None,
    industry: str = None
) -> Dict[str, Any]:
    """
    Main enrichment function - coordinates all data sources
    """
    print(f"\n🔍 Starting enrichment for: {company_name}")
    
    enrichment_result = {
        "status": "Partial",
        "confidence_score": 40.0,
        "data_sources": [],
        "enrichment_timestamp": datetime.now(timezone.utc).isoformat(),
        "enrichment_source": "Auto-Enrichment (Free APIs)"
    }
    
    # Track what data we have
    data_fields = {
        "company_name": bool(company_name),
        "company_type": False,
        "registered_address": False,
        "website": bool(website),
        "linkedin_url": False,
        "industry": bool(industry),
        "employee_band": bool(company_size),
        "domain_active": False
    }
    
    try:
        # 1. Search OpenCorporates for official company data
        print("  📊 Querying OpenCorporates...")
        opencorp_data = await search_opencorporates(company_name, country[:2])
        
        if opencorp_data.get("found"):
            enrichment_result["company_number"] = opencorp_data.get("company_number")
            enrichment_result["company_type"] = opencorp_data.get("company_type")
            enrichment_result["registered_address"] = opencorp_data.get("registered_address")
            enrichment_result["incorporation_date"] = opencorp_data.get("incorporation_date")
            enrichment_result["jurisdiction"] = opencorp_data.get("jurisdiction")
            enrichment_result["legal_status"] = opencorp_data.get("status")
            enrichment_result["data_sources"].append("OpenCorporates")
            
            data_fields["company_type"] = True
            data_fields["registered_address"] = True
            enrichment_result["confidence_score"] += 20.0
            print(f"  ✅ OpenCorporates: Found company data")
        else:
            print(f"  ⚠️ OpenCorporates: No data found")
        
        # 2. Get domain information
        domain = await extract_domain_from_input(website or email or "")
        if domain:
            print(f"  🌐 Checking domain: {domain}")
            domain_info = await get_domain_info(domain)
            
            enrichment_result["domain_verified"] = domain
            enrichment_result["domain_active"] = domain_info.get("domain_active", False)
            enrichment_result["http_status"] = domain_info.get("http_status")
            enrichment_result["data_sources"].append("Domain Check")
            
            if domain_info.get("domain_active"):
                data_fields["domain_active"] = True
                enrichment_result["confidence_score"] += 15.0
                print(f"  ✅ Domain: Active (status {domain_info.get('http_status')})")
            else:
                print(f"  ⚠️ Domain: Inactive or unreachable")
        
        # 3. Generate LinkedIn URL
        linkedin_url = generate_linkedin_url(company_name, website)
        enrichment_result["linkedin_url"] = linkedin_url
        enrichment_result["data_sources"].append("LinkedIn (Generated)")
        data_fields["linkedin_url"] = True
        enrichment_result["confidence_score"] += 10.0
        print(f"  🔗 LinkedIn: {linkedin_url}")
        
        # 4. Map existing data
        if website:
            enrichment_result["website_verified"] = website
        
        if industry:
            enrichment_result["industry_classification"] = industry
        
        if company_size:
            enrichment_result["company_size_verified"] = company_size
            enrichment_result["employee_band"] = estimate_employee_band(company_size)
        
        # 5. Calculate final completeness
        completeness = sum(data_fields.values()) / len(data_fields)
        enrichment_result["data_completeness"] = round(completeness * 100, 1)
        
        if completeness >= 0.8:
            enrichment_result["status"] = "✅ Completed"
            enrichment_result["confidence_score"] = min(95.0, enrichment_result["confidence_score"])
        elif completeness >= 0.5:
            enrichment_result["status"] = "⚠️ Partial"
            enrichment_result["confidence_score"] = min(75.0, enrichment_result["confidence_score"])
        else:
            enrichment_result["status"] = "❌ Limited"
            enrichment_result["confidence_score"] = min(50.0, enrichment_result["confidence_score"])
        
        print(f"  🎯 Enrichment complete: {enrichment_result['status']} ({enrichment_result['confidence_score']}%)")
        print(f"  📦 Data sources: {', '.join(enrichment_result['data_sources'])}\n")
        
        return enrichment_result
        
    except Exception as e:
        print(f"  ❌ Enrichment error: {e}")
        enrichment_result["status"] = "❌ Error"
        enrichment_result["error"] = str(e)
        return enrichment_result


async def enrich_lead_background(lead_id: str, lead_data: Dict[str, Any], db):
    """
    Background task to enrich lead data (triggered 4 seconds after creation)
    """
    try:
        # Wait 4 seconds before starting enrichment
        await asyncio.sleep(4)
        
        print(f"\n🚀 Background enrichment started for Lead: {lead_id}")
        
        # Perform enrichment
        enrichment_data = await enrich_company_data(
            company_name=lead_data.get("company_name"),
            email=lead_data.get("email_address"),
            website=lead_data.get("website_url"),
            country=lead_data.get("country", "India"),
            company_size=lead_data.get("company_size"),
            industry=lead_data.get("industry_type")
        )
        
        # Determine final status based on enrichment result
        enrichment_status = enrichment_data.get("status", "")
        is_completed = "Completed" in enrichment_status or "✅" in enrichment_status
        is_partial = "Partial" in enrichment_status or "⚠️" in enrichment_status
        
        # Set appropriate lead status
        if is_completed:
            final_lead_status = "Enriched"
            current_stage = "Lead_Validate_SOP"
            sop_complete = True
        elif is_partial:
            final_lead_status = "Enriching"  # Keep as Enriching for partial data
            current_stage = "Lead_Enrich_SOP"
            sop_complete = False
        else:
            final_lead_status = "New"  # Enrichment failed
            current_stage = "Lead_Enrich_SOP"
            sop_complete = False
        
        # Update lead in database
        await db.commerce_leads.update_one(
            {"lead_id": lead_id},
            {
                "$set": {
                    "enrichment_status": enrichment_data.get("status"),
                    "enrichment_data": enrichment_data,
                    "enrichment_last_updated": datetime.now(timezone.utc),
                    "lead_status": final_lead_status,
                    "current_sop_stage": current_stage,
                    "sop_completion_status.Lead_Enrich_SOP": sop_complete,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        
        print(f"✅ Lead {lead_id} enrichment completed and saved to database\n")
        
    except Exception as e:
        print(f"❌ Background enrichment failed for {lead_id}: {e}")
