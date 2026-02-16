"""
GPT-5 Lead Enrichment Service
Uses OpenAI GPT-5 to enrich company information
"""

import os
import json
from datetime import datetime
from typing import Dict, Any, Optional
from dotenv import load_dotenv
# from emergentintegrations.llm.chat import LlmChat, UserMessage


try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
except ImportError:
    LlmChat = None
    UserMessage = None


# Load environment variables
load_dotenv()


# async def enrich_lead_with_gpt(
#     company_name: str,
#     industry: Optional[str] = None,
#     city: Optional[str] = None,
#     country: Optional[str] = None,
#     website: Optional[str] = None,
#     contact_name: Optional[str] = None,
#     email: Optional[str] = None
# ) -> Dict[str, Any]:
#     """
#     Use GPT-5 to enrich lead information
    
#     Returns enriched data in structured format
#     """
    
#     # Build context for GPT
#     context_parts = [f"Company Name: {company_name}"]
#     if industry:
#         context_parts.append(f"Industry: {industry}")
#     if city:
#         context_parts.append(f"City: {city}")
#     if country:
#         context_parts.append(f"Country: {country}")
#     if website:
#         context_parts.append(f"Website: {website}")
#     if contact_name:
#         context_parts.append(f"Contact Person: {contact_name}")
#     if email:
#         context_parts.append(f"Email: {email}")
    
#     context = "\n".join(context_parts)
    
#     # Prepare the enrichment prompt
#     system_prompt = """You are a Lead Flow Automation Engine specializing in B2B company data enrichment.

# Your task is to enrich company and contact information with comprehensive, accurate, realistic data. Based on the provided details, infer and provide:

# 🏢 COMPANY ENRICHMENT:

# 1. Basic Information:
#    - Company Name (official)
#    - Legal Entity Name (registered)
#    - Industry (specific sector/vertical)
#    - Year Established
#    - Company Size (employee count)
#    - Annual Turnover (estimated revenue in USD)
#    - Business Model (B2B/B2C/Hybrid/D2C)
#    - Company Description (detailed overview)

# 2. Registration & Compliance:
#    - GSTIN (Indian GST number format: 22AAAAA0000A1Z5)
#    - PAN (format: AAAAA0000A)
#    - CIN (format: U74999KA2012PTC123456)
#    - Registered Name
#    - Verification Status (verified/partial/missing)

# 3. Location Details:
#    - Headquarters (full address)
#    - City, State, Country
#    - Pincode
#    - Branch Locations (list major offices)

# 4. Online & Digital Presence:
#    - Official Website
#    - LinkedIn Page
#    - Other Social Links (Twitter, Facebook, Instagram)
#    - Domain Emails (info@, sales@, careers@)
#    - Technology Stack (CMS, CRM, tech platforms)

# 5. Financial & Organizational Profile:
#    - Estimated Revenue
#    - Funding Stage (Bootstrapped/Seed/Series A/B/C)
#    - Investors (if applicable)
#    - Ownership Type (Private/Public/Government/Subsidiary)

# 6. Operational Overview:
#    - Main Products/Services
#    - Key Markets
#    - Office Count
#    - Certifications (ISO, MSME, etc.)

# 👥 CONTACT ENRICHMENT:
#    - Contact Name
#    - Designation
#    - Department
#    - Email ID
#    - Phone Number
#    - LinkedIn Profile
#    - Seniority Level
#    - Decision Maker Flag
#    - Last Verified Date
#    - Contact Source

# Return ONLY a valid JSON object with this EXACT structure:
# {
#   "company_name": "Full Company Name",
#   "legal_entity_name": "Legal Registered Name",
#   "industry": "Specific Industry/Sector",
#   "year_established": 2010,
#   "company_size": "Small/Medium/Large",
#   "employees_count": 100,
#   "annual_turnover": 5000000,
#   "business_model": "B2B/B2C/Hybrid/D2C",
#   "company_description": "Detailed company overview...",
#   "gstin": "22AAAAA0000A1Z5",
#   "pan": "AAAAA0000A",
#   "cin": "U74999KA2012PTC123456",
#   "registered_name": "Legal Registry Name",
#   "verification_status": "verified/partial/missing",
#   "headquarters": "Complete HQ Address",
#   "city": "City",
#   "state": "State",
#   "country": "Country",
#   "pincode": "123456",
#   "branch_locations": ["Branch 1", "Branch 2"],
#   "official_website": "www.company.com",
#   "linkedin_page": "linkedin.com/company/...",
#   "twitter_url": "twitter.com/company",
#   "facebook_url": "facebook.com/company",
#   "instagram_url": "instagram.com/company",
#   "domain_emails": ["info@company.com", "sales@company.com"],
#   "technology_stack": ["Tech 1", "Tech 2"],
#   "estimated_revenue": 5000000,
#   "funding_stage": "Seed/Series A/Bootstrapped",
#   "investors": ["Investor 1", "Investor 2"],
#   "ownership_type": "Private/Public/Government",
#   "main_products_services": ["Product 1", "Service 1"],
#   "key_markets": ["Market 1", "Market 2"],
#   "office_count": 3,
#   "certifications": ["ISO 9001", "MSME"],
#   "contact_name": "Contact Person Name",
#   "designation": "Job Title",
#   "department": "Sales/Marketing/Tech",
#   "contact_email": "contact@company.com",
#   "contact_phone": "+91-XXX-XXX-XXXX",
#   "contact_linkedin": "linkedin.com/in/...",
#   "seniority_level": "Executive/Manager/Staff",
#   "decision_maker_flag": true,
#   "last_verified_date": "2025-01-07",
#   "contact_source": "LinkedIn/Website/Directory",
#   "enrichment_confidence": "High/Medium/Low",
#   "data_sources": ["LinkedIn", "Company Website", "Public Records"]
# }

# Important: 
# - If you don't have real data, provide realistic estimates based on industry norms
# - Be consistent with the industry and company size
# - Mark confidence level accurately
# - Return ONLY the JSON, no additional text
# """

#     user_prompt = f"""Enrich the following lead information:

# {context}

# Provide comprehensive enriched data in the JSON format specified."""

#     try:
#         # Initialize chat with Emergent LLM Key
#         api_key = os.environ.get('EMERGENT_LLM_KEY') or os.environ.get('OPENAI_API_KEY')
        
#         chat = LlmChat(
#             api_key=api_key,
#             session_id=f"enrich_{company_name}_{datetime.now().timestamp()}",
#             system_message=system_prompt
#         ).with_model("openai", "gpt-4o")
        
#         # Create user message
#         user_message = UserMessage(text=user_prompt)
        
#         # Send message and get response
#         response_text = await chat.send_message(user_message)
#         response_text = response_text.strip()
        
#         # Remove markdown code blocks if present
#         if response_text.startswith("```json"):
#             response_text = response_text[7:]
#         if response_text.startswith("```"):
#             response_text = response_text[3:]
#         if response_text.endswith("```"):
#             response_text = response_text[:-3]
        
#         response_text = response_text.strip()
        
#         # Parse JSON
#         enriched_data = json.loads(response_text)
        
#         # Add metadata
#         enriched_data['enrichment_method'] = 'GPT-5'
#         enriched_data['enrichment_timestamp'] = datetime.utcnow().isoformat()
        
#         return {
#             'success': True,
#             'enriched_data': enriched_data,
#             'confidence': enriched_data.get('enrichment_confidence', 'Medium')
#         }
        
#     except json.JSONDecodeError as e:
#         return {
#             'success': False,
#             'error': 'Failed to parse GPT response',
#             'raw_response': response_text,
#             'details': str(e)
#         }
#     except Exception as e:
#         return {
#             'success': False,
#             'error': 'GPT enrichment failed',
#             'details': str(e)
#         }

async def enrich_lead_with_gpt(
    company_name: str,
    industry: Optional[str] = None,
    city: Optional[str] = None,
    country: Optional[str] = None,
    website: Optional[str] = None,
    contact_name: Optional[str] = None,
    email: Optional[str] = None
) -> Dict[str, Any]:
    """
    Use GPT-5 to enrich lead information
    Returns enriched data in structured format
    """

    # 🔹 LOCAL FALLBACK: Emergent LLM not available
    if LlmChat is None or UserMessage is None:
        return {
            "success": False,
            "error": "GPT enrichment disabled in local development mode",
            "details": "Emergent LLM integrations are not available locally"
        }

    # Build context for GPT
    context_parts = [f"Company Name: {company_name}"]
    if industry:
        context_parts.append(f"Industry: {industry}")
    if city:
        context_parts.append(f"City: {city}")
    if country:
        context_parts.append(f"Country: {country}")
    if website:
        context_parts.append(f"Website: {website}")
    if contact_name:
        context_parts.append(f"Contact Person: {contact_name}")
    if email:
        context_parts.append(f"Email: {email}")

    context = "\n".join(context_parts)

    user_prompt = f"""Enrich the following lead information:

{context}

Provide comprehensive enriched data in the JSON format specified.
"""

    try:
        api_key = (
            os.environ.get("EMERGENT_LLM_KEY")
            or os.environ.get("OPENAI_API_KEY")
        )

        chat = (
            LlmChat(
                api_key=api_key,
                session_id=f"enrich_{company_name}_{datetime.utcnow().timestamp()}",
                system_message=system_prompt
            )
            .with_model("openai", "gpt-4o")
        )

        user_message = UserMessage(text=user_prompt)
        response_text = (await chat.send_message(user_message)).strip()

        # Remove markdown fences if present
        if response_text.startswith("```"):
            response_text = response_text.strip("`")
            response_text = response_text.replace("json", "", 1).strip()

        enriched_data = json.loads(response_text)

        enriched_data["enrichment_method"] = "GPT-5"
        enriched_data["enrichment_timestamp"] = datetime.utcnow().isoformat()

        return {
            "success": True,
            "enriched_data": enriched_data,
            "confidence": enriched_data.get("enrichment_confidence", "Medium")
        }

    except json.JSONDecodeError as e:
        return {
            "success": False,
            "error": "Failed to parse GPT response",
            "raw_response": response_text,
            "details": str(e)
        }

    except Exception as e:
        return {
            "success": False,
            "error": "GPT enrichment failed",
            "details": str(e)
        }




async def get_enrichment_summary(enriched_data: Dict[str, Any]) -> str:
    """Generate a human-readable summary of enrichment results"""
    
    if not enriched_data.get('success'):
        return f"Enrichment failed: {enriched_data.get('error', 'Unknown error')}"
    
    data = enriched_data['enriched_data']
    
    summary_parts = [
        f"✅ Enriched: {data.get('company_name', 'N/A')}",
        f"📊 Industry: {data.get('industry', 'N/A')}",
        f"👥 Size: {data.get('company_size', 'N/A')} ({data.get('employees_count', 'N/A')} employees)",
        f"💰 Revenue: ${data.get('annual_revenue', 0):,.0f}",
        f"📍 Location: {data.get('city', '')}, {data.get('country', '')}",
        f"🎯 Confidence: {data.get('enrichment_confidence', 'N/A')}"
    ]
    
    return "\n".join(summary_parts)


# Example usage function for testing
async def test_enrichment():
    """Test the enrichment service"""
    result = await enrich_lead_with_gpt(
        company_name="Acme Technologies Pvt Ltd",
        industry="Software Development",
        city="Bangalore",
        country="India",
        website="www.acmetech.com"
    )
    
    if result['success']:
        print("Enrichment Successful!")
        print(json.dumps(result['enriched_data'], indent=2))
        print("\nSummary:")
        print(await get_enrichment_summary(result))
    else:
        print(f"Enrichment Failed: {result.get('error')}")


if __name__ == "__main__":
    import asyncio
    asyncio.run(test_enrichment())
