import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { billAPI, journalAPI } from '../utils/api';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { generateBillPDF } from '../utils/pdfGenerator';
import { calculateGSTBreakdown } from '../utils/gstUtils';
import { calculateTDS, getTDSSection } from '../utils/tdsUtils';
import { 
  ArrowLeft, Receipt, Building2, Calendar, DollarSign, 
  Download, Edit, Trash2, CheckCircle, Clock, BookOpen, Loader2
} from 'lucide-react';

const BillDetailRedesigned = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBillDetails();
  }, [id]);

  const loadBillDetails = async () => {
    try {
      setLoading(true);
      console.log('Loading bill details for ID:', id);
      const billRes = await billAPI.getDetails(id);
      console.log('Bill details response:', billRes.data);
      
      // Backend returns nested structure: { bill: {...}, days_overdue, bucket }
      const responseData = billRes.data;
      const billData = responseData.bill || responseData; // Handle both nested and flat structure
      setBill(billData);
      
      // Try to fetch journal entries if bill has journal_entry_id
      if (billData.journal_entry_id) {
        try {
          const journalRes = await journalAPI.getBillJournal(id);
          console.log('Journal response:', journalRes.data);
          const journalEntry = journalRes.data?.journal_entry;
          setJournals(journalEntry ? [journalEntry] : []);
        } catch (error) {
          console.log('No journal entries found:', error);
          setJournals([]);
        }
      } else {
        setJournals([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading bill details:', error);
      toast.error(`Failed to load bill details: ${error.message}`);
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      console.log('Starting PDF generation for bill...');
      console.log('Bill data:', bill);
      
      if (!bill) {
        toast.error('Bill data not loaded');
        return;
      }
      
      toast.info('Generating PDF...');
      
      // Fetch vendor details to get full address
      let vendorDetails = null;
      if (bill.vendor_id) {
        try {
          const vendResponse = await vendorAPI.getById(bill.vendor_id);
          vendorDetails = vendResponse.data;
          console.log('Vendor details fetched:', vendorDetails);
        } catch (err) {
          console.log('Could not fetch vendor details:', err);
        }
      }
      
      // Merge bill with vendor details
      const enrichedBill = {
        ...bill,
        vendor_address: vendorDetails?.address || bill.vendor_address || '',
        vendor_phone: vendorDetails?.phone || bill.vendor_phone || '',
        vendor_email: vendorDetails?.email || bill.vendor_email || ''
      };
      
      const companyDetails = {
        name: 'Innovate Books',
        address: 'Plot No. 123, Tech Park, Bangalore - 560001, Karnataka, India',
        gstin: '29ABCDE1234F1Z5',
        pan: 'ABCDE1234F',
        email: 'accounts@innovatebooks.com',
        phone: '+91 80 1234 5678',
        bankName: 'HDFC Bank',
        accountNumber: '50200012345678',
        ifscCode: 'HDFC0001234',
        branch: 'Bangalore Main Branch'
      };
      
      // Generate PDF
      const pdf = generateBillPDF(enrichedBill, companyDetails);
      
      // Download
      const filename = `Bill_${bill.bill_number || bill.id || 'draft'}.pdf`;
      console.log('Saving PDF as:', filename);
      pdf.save(filename);
      
      toast.success('Bill PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF Generation Error:', error);
      toast.error(`Failed to generate PDF: ${error.message}`);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (!bill) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/bills')} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="h-8 w-px bg-gray-300" />
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                  <Receipt className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {bill.bill_number}
                  </h1>
                  <p className="text-sm text-gray-500">{bill.vendor_name}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => navigate(`/bills/${id}/edit`)}>
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 bg-white border-0 shadow-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>Bill Details</h3>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  bill.status === 'Paid' ? 'bg-green-100 text-green-700' :
                  bill.status === 'Approved' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {bill.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Bill Date</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900 font-medium">{formatDate(bill.bill_date)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Due Date</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900 font-medium">{formatDate(bill.due_date)}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Line Items</h4>
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Description</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">Qty</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">Rate</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(bill.items || []).map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(item.unit_price)}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">{formatCurrency(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Accounting Impact - Journal Entries - ALWAYS SHOW */}
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-purple-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Accounting Impact (Journal Entries)
                </h3>
              </div>
              
              {journals.length > 0 ? (
                journals.map((journal, idx) => (
                  <div key={idx} className="mb-6 last:mb-0">
                    <div className="bg-purple-50 p-4 rounded-lg mb-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm font-semibold text-purple-900">{journal.entry_number}</span>
                        <span className="text-sm text-purple-700">{formatDate(journal.entry_date)}</span>
                      </div>
                    </div>
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Account</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">Debit</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">Credit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(journal.line_items || []).map((line, lineIdx) => (
                          <tr key={lineIdx} className="border-b border-gray-100">
                            <td className="px-4 py-2 text-sm text-gray-900">{line.account}</td>
                            <td className="px-4 py-2 text-sm text-gray-900 text-right">
                              {line.debit > 0 ? formatCurrency(line.debit) : '-'}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 text-right">
                              {line.credit > 0 ? formatCurrency(line.credit) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-purple-900 font-medium mb-2">
                    No Journal Entries Posted Yet
                  </p>
                  <p className="text-sm text-purple-700">
                    {bill.status === 'Draft' 
                      ? 'Journal entries will be automatically created when bill is approved' 
                      : 'Journal entries will appear here once the bill is processed'}
                  </p>
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 bg-white border-0 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Amount Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Base Amount</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(bill.base_amount || 0)}</span>
                </div>
                
                {/* GST Breakdown - IGST or CGST/SGST */}
                {(() => {
                  const gstBreakdown = calculateGSTBreakdown(
                    bill.base_amount || 0,
                    bill.gst_percent || 18,
                    bill.vendor_gstin || '29ZZZZZ1234Z1Z5',
                    '29ABCDE1234F1Z5' // Company GSTIN
                  );
                  
                  return (
                    <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                      <div className="text-xs font-semibold text-blue-900 mb-2">
                        {gstBreakdown.type} (Inter-state: {gstBreakdown.isInterState ? 'Yes' : 'No'})
                      </div>
                      {gstBreakdown.breakdown.map((item, idx) => (
                        <div key={idx} className="flex justify-between py-1">
                          <span className="text-sm text-gray-700">{item.label}</span>
                          <span className="text-sm font-semibold text-gray-900">{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between py-2 border-t border-blue-200 mt-2">
                        <span className="text-sm font-semibold text-blue-900">Total GST</span>
                        <span className="text-sm font-bold text-blue-900">{formatCurrency(gstBreakdown.totalGST)}</span>
                      </div>
                    </div>
                  );
                })()}
                
                <div className="flex justify-between py-2 border-t">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(bill.total_amount || 0)}</span>
                </div>
                
                {/* TDS Details */}
                {bill.tds_percent > 0 && (
                  <div className="bg-orange-50 rounded-lg p-3">
                    <div className="text-xs font-semibold text-orange-900 mb-2">
                      TDS Deduction
                    </div>
                    {(() => {
                      const tdsSection = getTDSSection(bill.tds_section || '194C');
                      return (
                        <>
                          <div className="flex justify-between py-1">
                            <span className="text-sm text-gray-700">{tdsSection?.label || 'TDS'}</span>
                            <span className="text-sm text-gray-700">{bill.tds_percent}%</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-sm text-gray-700">TDS Amount</span>
                            <span className="text-sm font-semibold text-green-600">-{formatCurrency(bill.tds_amount || 0)}</span>
                          </div>
                          {tdsSection?.description && (
                            <p className="text-xs text-gray-600 mt-2">{tdsSection.description}</p>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
                
                <div className="flex justify-between py-3 border-t-2 border-red-600">
                  <span className="font-bold text-gray-900">Net Payable</span>
                  <span className="text-xl font-bold text-red-600">{formatCurrency(bill.net_payable || 0)}</span>
                </div>
                <div className="flex justify-between py-2 bg-blue-50 rounded-lg px-3">
                  <span className="text-gray-900 font-medium">Amount Paid</span>
                  <span className="font-bold text-blue-600">{formatCurrency(bill.amount_paid || 0)}</span>
                </div>
                <div className="flex justify-between py-2 bg-red-50 rounded-lg px-3">
                  <span className="text-gray-900 font-medium">Balance Due</span>
                  <span className="font-bold text-red-600">{formatCurrency(bill.balance_due || 0)}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white border-0 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Vendor Details</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{bill.vendor_name}</p>
                  <p className="text-sm text-gray-500">Vendor</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate(`/vendors/${bill.vendor_id}`)}
              >
                View Vendor Profile
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillDetailRedesigned;