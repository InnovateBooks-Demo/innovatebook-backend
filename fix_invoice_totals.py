"""
Fix invoice total_amount calculation for all invoices in the database
This script recalculates total_amount = base_amount + gst_amount
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime, timezone

async def fix_invoice_totals():
    # Connect to MongoDB
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(mongo_url)
    db = client.innovate_books
    
    print("Starting invoice total_amount fix...")
    print("=" * 60)
    
    # Get all invoices
    invoices = await db.invoices.find({}, {"_id": 0}).to_list(None)
    
    fixed_count = 0
    error_count = 0
    
    for invoice in invoices:
        try:
            invoice_number = invoice.get('invoice_number')
            base_amount = float(invoice.get('base_amount', 0))
            gst_amount = float(invoice.get('gst_amount', 0))
            current_total = float(invoice.get('total_amount', 0))
            
            # Calculate correct total
            correct_total = base_amount + gst_amount
            
            # Check if needs fixing
            if abs(correct_total - current_total) > 0.01:  # Allow for small float differences
                print(f"\n{invoice_number}:")
                print(f"  Base: ₹{base_amount:,.2f}")
                print(f"  GST: ₹{gst_amount:,.2f}")
                print(f"  Current Total: ₹{current_total:,.2f} ❌")
                print(f"  Correct Total: ₹{correct_total:,.2f} ✅")
                
                # Also recalculate amount_receivable
                tds_amount = float(invoice.get('tds_amount', 0))
                correct_receivable = correct_total - tds_amount
                
                # Update the invoice
                await db.invoices.update_one(
                    {"id": invoice['id']},
                    {
                        "$set": {
                            "total_amount": correct_total,
                            # Only update amount_outstanding if invoice is not paid
                            **({"amount_outstanding": correct_receivable} if invoice.get('status') != 'Paid' else {})
                        }
                    }
                )
                
                fixed_count += 1
                print(f"  ✅ FIXED!")
                
        except Exception as e:
            error_count += 1
            print(f"\n❌ Error fixing {invoice.get('invoice_number', 'Unknown')}: {str(e)}")
    
    print("\n" + "=" * 60)
    print(f"Summary:")
    print(f"  Total invoices checked: {len(invoices)}")
    print(f"  Invoices fixed: {fixed_count}")
    print(f"  Errors: {error_count}")
    print(f"  No fix needed: {len(invoices) - fixed_count - error_count}")
    print("=" * 60)
    
    client.close()

if __name__ == "__main__":
    asyncio.run(fix_invoice_totals())
