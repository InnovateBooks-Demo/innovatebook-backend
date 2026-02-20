"""
GST Reporting Module - GSTR-1 and GSTR-3B Reports
Tax Compliance for India GST Regulations
"""

from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional
from datetime import datetime, timezone
import jwt
import os

router = APIRouter(prefix="/api/ib-finance/gst", tags=["GST Reports"])

JWT_SECRET = os.environ["JWT_SECRET_KEY"]  # must be set in backend/.env

def get_db():
    from app_state import db
    return db

async def get_current_user(authorization: str = Header(None)):
    """Extract current user from JWT token"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return {
            "user_id": payload.get("user_id"),
            "org_id": payload.get("org_id"),
            "role_id": payload.get("role_id")
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ==================== GSTR-1 (Outward Supplies) ====================

@router.get("/gstr1")
async def get_gstr1_report(period: str, current_user: dict = Depends(get_current_user)):
    """
    Generate GSTR-1 Report - Details of outward supplies
    Includes: B2B, B2C Large, B2C Small, Credit/Debit Notes, Exports, NIL Rated
    """
    db = get_db()
    org_id = current_user.get("org_id")
    
    # Get all output tax transactions for the period
    output_taxes = await db.fin_tax_transactions.find({
        "org_id": org_id,
        "period": period,
        "direction": "output",
        "deleted": {"$ne": True}
    }, {"_id": 0}).to_list(length=1000)
    
    # Get billing records for invoice details
    billing_records = await db.fin_billing_records.find({
        "org_id": org_id,
        "status": "issued",
        "deleted": {"$ne": True}
    }, {"_id": 0}).to_list(length=1000)
    
    # Categorize invoices
    b2b_invoices = []  # B2B invoices (GSTIN available)
    b2c_large = []     # B2C Large (> Rs 2.5 lakh, inter-state)
    b2c_small = []     # B2C Small (< Rs 2.5 lakh or intra-state)
    credit_debit_notes = []
    exports = []
    nil_rated = []
    
    for bill in billing_records:
        invoice = {
            "invoice_number": bill.get("invoice_number"),
            "invoice_date": bill.get("issued_at", bill.get("created_at")),
            "party_name": bill.get("party_name"),
            "party_gstin": bill.get("party_gstin"),
            "place_of_supply": bill.get("place_of_supply", "Unknown"),
            "invoice_type": bill.get("billing_type"),
            "taxable_value": bill.get("gross_amount", 0),
            "cgst": 0,
            "sgst": 0,
            "igst": 0,
            "cess": 0,
            "total_tax": bill.get("tax_amount", 0),
            "invoice_value": bill.get("net_amount", 0)
        }
        
        # Find corresponding tax transaction
        matching_tax = next((t for t in output_taxes if t.get("source_reference_id") == bill.get("billing_id")), None)
        if matching_tax:
            tax_amount = matching_tax.get("tax_amount", 0)
            jurisdiction = matching_tax.get("jurisdiction", "")
            
            # Split tax based on jurisdiction (simplified)
            if "IGST" in jurisdiction.upper() or matching_tax.get("tax_type") == "IGST":
                invoice["igst"] = tax_amount
            else:
                # Assume 50-50 split for CGST/SGST
                invoice["cgst"] = tax_amount / 2
                invoice["sgst"] = tax_amount / 2
        
        # Categorize based on GSTIN and value
        if bill.get("billing_type") == "credit_note" or bill.get("billing_type") == "debit_note":
            credit_debit_notes.append(invoice)
        elif bill.get("export") or bill.get("place_of_supply", "").upper() == "EXPORT":
            exports.append(invoice)
        elif bill.get("nil_rated") or bill.get("tax_amount", 0) == 0:
            nil_rated.append(invoice)
        elif bill.get("party_gstin"):
            b2b_invoices.append(invoice)
        elif bill.get("net_amount", 0) > 250000:
            b2c_large.append(invoice)
        else:
            b2c_small.append(invoice)
    
    # Calculate totals
    def sum_invoices(invoices):
        return {
            "count": len(invoices),
            "taxable_value": sum(i.get("taxable_value", 0) for i in invoices),
            "cgst": sum(i.get("cgst", 0) for i in invoices),
            "sgst": sum(i.get("sgst", 0) for i in invoices),
            "igst": sum(i.get("igst", 0) for i in invoices),
            "cess": sum(i.get("cess", 0) for i in invoices),
            "total_tax": sum(i.get("total_tax", 0) for i in invoices),
            "invoice_value": sum(i.get("invoice_value", 0) for i in invoices)
        }
    
    return {
        "success": True,
        "data": {
            "period": period,
            "report_type": "GSTR-1",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "sections": {
                "b2b": {
                    "title": "4A. B2B Invoices",
                    "description": "Taxable outward supplies to registered persons",
                    "invoices": b2b_invoices,
                    "summary": sum_invoices(b2b_invoices)
                },
                "b2c_large": {
                    "title": "5A. B2C Large Invoices",
                    "description": "Taxable outward inter-State supplies (> ₹2.5 lakh)",
                    "invoices": b2c_large,
                    "summary": sum_invoices(b2c_large)
                },
                "b2c_small": {
                    "title": "7. B2C Small Invoices",
                    "description": "Taxable supplies (net of debit notes, credit notes)",
                    "invoices": b2c_small,
                    "summary": sum_invoices(b2c_small)
                },
                "credit_debit_notes": {
                    "title": "9B. Credit/Debit Notes",
                    "description": "Credit/Debit notes for registered recipients",
                    "invoices": credit_debit_notes,
                    "summary": sum_invoices(credit_debit_notes)
                },
                "exports": {
                    "title": "6A. Exports",
                    "description": "Exports with payment of tax or with IGST",
                    "invoices": exports,
                    "summary": sum_invoices(exports)
                },
                "nil_rated": {
                    "title": "8. Nil Rated/Exempted",
                    "description": "Nil rated, exempted and non-GST outward supplies",
                    "invoices": nil_rated,
                    "summary": sum_invoices(nil_rated)
                }
            },
            "grand_total": {
                "total_invoices": len(b2b_invoices) + len(b2c_large) + len(b2c_small) + len(credit_debit_notes) + len(exports) + len(nil_rated),
                "total_taxable_value": sum(sum_invoices(i)["taxable_value"] for i in [b2b_invoices, b2c_large, b2c_small, credit_debit_notes, exports, nil_rated]),
                "total_cgst": sum(sum_invoices(i)["cgst"] for i in [b2b_invoices, b2c_large, b2c_small, credit_debit_notes, exports]),
                "total_sgst": sum(sum_invoices(i)["sgst"] for i in [b2b_invoices, b2c_large, b2c_small, credit_debit_notes, exports]),
                "total_igst": sum(sum_invoices(i)["igst"] for i in [b2b_invoices, b2c_large, b2c_small, credit_debit_notes, exports]),
                "total_cess": sum(sum_invoices(i)["cess"] for i in [b2b_invoices, b2c_large, b2c_small, credit_debit_notes, exports]),
                "total_tax": sum(sum_invoices(i)["total_tax"] for i in [b2b_invoices, b2c_large, b2c_small, credit_debit_notes, exports])
            }
        }
    }


# ==================== GSTR-3B (Summary Return) ====================

@router.get("/gstr3b")
async def get_gstr3b_report(period: str, current_user: dict = Depends(get_current_user)):
    """
    Generate GSTR-3B Report - Monthly Summary Return
    Includes: Outward Supplies, ITC, Tax Payable, Interest/Penalty
    """
    db = get_db()
    org_id = current_user.get("org_id")
    
    # Get all tax transactions for the period
    output_taxes = await db.fin_tax_transactions.find({
        "org_id": org_id,
        "period": period,
        "direction": "output",
        "deleted": {"$ne": True}
    }, {"_id": 0}).to_list(length=1000)
    
    input_taxes = await db.fin_tax_transactions.find({
        "org_id": org_id,
        "period": period,
        "direction": "input",
        "deleted": {"$ne": True}
    }, {"_id": 0}).to_list(length=1000)
    
    # Get billing records for supply classification
    billing_records = await db.fin_billing_records.find({
        "org_id": org_id,
        "status": "issued",
        "deleted": {"$ne": True}
    }, {"_id": 0}).to_list(length=1000)
    
    # Calculate output tax totals
    output_taxable = sum(t.get("taxable_amount", 0) for t in output_taxes)
    output_cgst = sum(t.get("tax_amount", 0) / 2 for t in output_taxes if "IGST" not in t.get("jurisdiction", "").upper())
    output_sgst = sum(t.get("tax_amount", 0) / 2 for t in output_taxes if "IGST" not in t.get("jurisdiction", "").upper())
    output_igst = sum(t.get("tax_amount", 0) for t in output_taxes if "IGST" in t.get("jurisdiction", "").upper())
    output_cess = 0  # Placeholder for cess
    
    # Calculate input tax credit
    itc_cgst = sum(t.get("tax_amount", 0) / 2 for t in input_taxes if "IGST" not in t.get("jurisdiction", "").upper())
    itc_sgst = sum(t.get("tax_amount", 0) / 2 for t in input_taxes if "IGST" not in t.get("jurisdiction", "").upper())
    itc_igst = sum(t.get("tax_amount", 0) for t in input_taxes if "IGST" in t.get("jurisdiction", "").upper())
    itc_cess = 0
    
    # Classify supplies
    interstate_supplies = sum(b.get("net_amount", 0) for b in billing_records if b.get("interstate"))
    intrastate_supplies = sum(b.get("net_amount", 0) for b in billing_records if not b.get("interstate"))
    exempt_supplies = sum(b.get("gross_amount", 0) for b in billing_records if b.get("nil_rated") or b.get("tax_amount", 0) == 0)
    
    # Calculate net tax payable
    net_cgst = max(0, output_cgst - itc_cgst)
    net_sgst = max(0, output_sgst - itc_sgst)
    net_igst = max(0, output_igst - itc_igst)
    net_cess = max(0, output_cess - itc_cess)
    
    return {
        "success": True,
        "data": {
            "period": period,
            "report_type": "GSTR-3B",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "sections": {
                "section_3_1": {
                    "title": "3.1 Details of Outward Supplies",
                    "rows": [
                        {
                            "description": "(a) Outward taxable supplies (other than zero rated, nil rated and exempted)",
                            "taxable_value": output_taxable,
                            "integrated_tax": output_igst,
                            "central_tax": output_cgst,
                            "state_ut_tax": output_sgst,
                            "cess": output_cess
                        },
                        {
                            "description": "(b) Outward taxable supplies (zero rated)",
                            "taxable_value": 0,
                            "integrated_tax": 0,
                            "central_tax": 0,
                            "state_ut_tax": 0,
                            "cess": 0
                        },
                        {
                            "description": "(c) Other outward supplies (nil rated, exempted)",
                            "taxable_value": exempt_supplies,
                            "integrated_tax": 0,
                            "central_tax": 0,
                            "state_ut_tax": 0,
                            "cess": 0
                        },
                        {
                            "description": "(d) Inward supplies (liable to reverse charge)",
                            "taxable_value": 0,
                            "integrated_tax": 0,
                            "central_tax": 0,
                            "state_ut_tax": 0,
                            "cess": 0
                        },
                        {
                            "description": "(e) Non-GST outward supplies",
                            "taxable_value": 0,
                            "integrated_tax": 0,
                            "central_tax": 0,
                            "state_ut_tax": 0,
                            "cess": 0
                        }
                    ]
                },
                "section_3_2": {
                    "title": "3.2 Inter-State Supplies",
                    "rows": [
                        {
                            "description": "Supplies made to unregistered persons",
                            "total_value": intrastate_supplies,
                            "integrated_tax": 0
                        },
                        {
                            "description": "Supplies made to composition dealers",
                            "total_value": 0,
                            "integrated_tax": 0
                        },
                        {
                            "description": "Supplies made to UIN holders",
                            "total_value": 0,
                            "integrated_tax": 0
                        }
                    ]
                },
                "section_4": {
                    "title": "4. Eligible ITC",
                    "rows": [
                        {
                            "description": "(A) ITC Available",
                            "integrated_tax": sum(t.get("tax_amount", 0) for t in input_taxes if "IGST" in t.get("jurisdiction", "").upper()),
                            "central_tax": itc_cgst,
                            "state_ut_tax": itc_sgst,
                            "cess": itc_cess
                        },
                        {
                            "description": "(B) ITC Reversed",
                            "integrated_tax": 0,
                            "central_tax": 0,
                            "state_ut_tax": 0,
                            "cess": 0
                        },
                        {
                            "description": "(C) Net ITC Available",
                            "integrated_tax": itc_igst,
                            "central_tax": itc_cgst,
                            "state_ut_tax": itc_sgst,
                            "cess": itc_cess
                        },
                        {
                            "description": "(D) Ineligible ITC",
                            "integrated_tax": 0,
                            "central_tax": 0,
                            "state_ut_tax": 0,
                            "cess": 0
                        }
                    ]
                },
                "section_5": {
                    "title": "5. Values of exempt, nil rated and non-GST inward supplies",
                    "rows": [
                        {
                            "description": "From registered suppliers",
                            "inter_state": 0,
                            "intra_state": 0
                        },
                        {
                            "description": "From unregistered suppliers",
                            "inter_state": 0,
                            "intra_state": 0
                        }
                    ]
                },
                "section_6": {
                    "title": "6. Payment of Tax",
                    "summary": {
                        "description": "Tax payable",
                        "integrated_tax": output_igst,
                        "central_tax": output_cgst,
                        "state_ut_tax": output_sgst,
                        "cess": output_cess
                    },
                    "itc_utilized": {
                        "description": "ITC utilized",
                        "integrated_tax": min(output_igst, itc_igst),
                        "central_tax": min(output_cgst, itc_cgst),
                        "state_ut_tax": min(output_sgst, itc_sgst),
                        "cess": min(output_cess, itc_cess)
                    },
                    "cash_payable": {
                        "description": "Tax payable in cash",
                        "integrated_tax": net_igst,
                        "central_tax": net_cgst,
                        "state_ut_tax": net_sgst,
                        "cess": net_cess
                    }
                }
            },
            "summary": {
                "total_output_tax": output_cgst + output_sgst + output_igst + output_cess,
                "total_input_tax_credit": itc_cgst + itc_sgst + itc_igst + itc_cess,
                "net_tax_payable": net_cgst + net_sgst + net_igst + net_cess,
                "breakdown": {
                    "cgst_payable": net_cgst,
                    "sgst_payable": net_sgst,
                    "igst_payable": net_igst,
                    "cess_payable": net_cess
                }
            }
        }
    }


# ==================== GST Dashboard Summary ====================

@router.get("/dashboard")
async def get_gst_dashboard(period: str, current_user: dict = Depends(get_current_user)):
    """Get GST Dashboard summary for a period"""
    db = get_db()
    org_id = current_user.get("org_id")
    
    # Get tax transactions for the period
    output_taxes = await db.fin_tax_transactions.find({
        "org_id": org_id,
        "period": period,
        "direction": "output",
        "deleted": {"$ne": True}
    }, {"_id": 0}).to_list(length=1000)
    
    input_taxes = await db.fin_tax_transactions.find({
        "org_id": org_id,
        "period": period,
        "direction": "input",
        "deleted": {"$ne": True}
    }, {"_id": 0}).to_list(length=1000)
    
    output_total = sum(t.get("tax_amount", 0) for t in output_taxes)
    input_total = sum(t.get("tax_amount", 0) for t in input_taxes)
    net_liability = output_total - input_total
    
    # Get filing status (mock - would come from GST portal integration)
    gstr1_status = "pending"
    gstr3b_status = "pending"
    
    return {
        "success": True,
        "data": {
            "period": period,
            "output_tax": output_total,
            "input_tax_credit": input_total,
            "net_liability": net_liability,
            "transaction_count": {
                "output": len(output_taxes),
                "input": len(input_taxes)
            },
            "filing_status": {
                "gstr1": gstr1_status,
                "gstr3b": gstr3b_status
            }
        }
    }
