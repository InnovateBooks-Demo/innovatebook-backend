import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Receipt, ArrowLeft, Check, X, Send, Download, Mail, Printer, FileText, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '../../../utils/auth';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const BillingDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBillingDetail();
  }, [id]);

  const fetchBillingDetail = async () => {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/ib-finance/billing/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setBilling(data.data);
      }
    } catch (error) {
      toast.error('Failed to load billing details');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/ib-finance/billing/${id}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        toast.success('Billing approved');
        fetchBillingDetail();
      }
    } catch (error) {
      toast.error('Failed to approve');
    }
  };

  const handleIssue = async () => {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/ib-finance/billing/${id}/issue`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        toast.success('Invoice issued');
        fetchBillingDetail();
      }
    } catch (error) {
      toast.error('Failed to issue');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-700',
      approved: 'bg-blue-100 text-blue-700',
      issued: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  if (!billing) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Billing not found</div>;

  return (
    <div className="min-h-screen bg-gray-50" data-testid="billing-detail">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => navigate('/ib-finance/billing')} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-500">IB Finance → Billing → {billing.billing_id}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                <Receipt className="h-7 w-7 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold text-gray-900">{billing.billing_id}</h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${getStatusBadge(billing.status)}`}>
                    {billing.status}
                  </span>
                </div>
                {billing.invoice_number && (
                  <p className="text-sm text-green-600 mt-1">Invoice: {billing.invoice_number}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {billing.status === 'draft' && (
                <>
                  <button onClick={() => navigate(`/ib-finance/billing/${id}/edit`)} className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50">
                    <Edit className="h-4 w-4" /> Edit
                  </button>
                  <button onClick={handleApprove} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    <Check className="h-4 w-4" /> Approve
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50">
                    <X className="h-4 w-4" /> Cancel
                  </button>
                </>
              )}
              {billing.status === 'approved' && (
                <button onClick={handleIssue} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Send className="h-4 w-4" /> Issue Invoice
                </button>
              )}
              {billing.status === 'issued' && (
                <>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50">
                    <Download className="h-4 w-4" /> Download
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50">
                    <Mail className="h-4 w-4" /> Email
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50">
                    <Printer className="h-4 w-4" /> Print
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Billing Summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Billing Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Billing Type</p>
                  <p className="font-medium text-gray-900 capitalize">{billing.billing_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Billing Period</p>
                  <p className="font-medium text-gray-900">{billing.billing_period}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contract ID</p>
                  <p className="font-medium text-gray-900">{billing.contract_id || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Source Event</p>
                  <p className="font-medium text-gray-900">{billing.source_event_id || '-'}</p>
                </div>
              </div>
              {billing.description && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-gray-900 mt-1">{billing.description}</p>
                </div>
              )}
            </div>

            {/* Party Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Party Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Party Name</p>
                  <p className="font-medium text-gray-900">{billing.party_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Party ID</p>
                  <p className="font-medium text-gray-900">{billing.party_id}</p>
                </div>
              </div>
            </div>

            {/* Line Items */}
            {billing.line_items?.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Line Items</h3>
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Description</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500">Qty</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500">Rate</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {billing.line_items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 text-gray-900">{item.description}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(item.rate)}</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">{formatCurrency(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Audit Trail */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Audit Trail</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="text-sm text-gray-900">{formatDate(billing.created_at)} by {billing.created_by}</span>
                </div>
                {billing.approved_at && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Approved</span>
                    <span className="text-sm text-gray-900">{formatDate(billing.approved_at)} by {billing.approved_by}</span>
                  </div>
                )}
                {billing.issued_at && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Issued</span>
                    <span className="text-sm text-gray-900">{formatDate(billing.issued_at)} by {billing.issued_by}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Side Panel - Amounts */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Amount Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Gross Amount</span>
                  <span className="font-medium text-gray-900">{formatCurrency(billing.gross_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax ({billing.tax_code})</span>
                  <span className="font-medium text-gray-900">{formatCurrency(billing.tax_amount)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="font-semibold text-gray-900">Net Amount</span>
                  <span className="font-bold text-xl text-blue-600">{formatCurrency(billing.net_amount)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Currency</h3>
              <p className="text-2xl font-bold text-gray-900">{billing.currency || 'INR'}</p>
            </div>

            {billing.status === 'issued' && (
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
                <FileText className="h-8 w-8 mb-3" />
                <h3 className="font-semibold mb-2">Invoice Issued</h3>
                <p className="text-sm text-white/80">This invoice has been issued and a receivable has been created.</p>
                <button 
                  onClick={() => navigate('/ib-finance/receivables')}
                  className="mt-4 w-full py-2 bg-white/20 rounded-lg text-sm hover:bg-white/30 transition-colors"
                >
                  View Receivables →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingDetail;
