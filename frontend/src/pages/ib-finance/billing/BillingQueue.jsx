import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt, ArrowLeft, Search, Plus, Eye, Check, X, Send, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '../../../utils/auth';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const BillingQueue = () => {
  const navigate = useNavigate();
  const [billingRecords, setBillingRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchBillingRecords();
  }, [statusFilter]);

  const fetchBillingRecords = async () => {
    try {
      const token = authService.getToken();
      const url = statusFilter === 'all' 
        ? `${API_URL}/api/ib-finance/billing`
        : `${API_URL}/api/ib-finance/billing?status=${statusFilter}`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setBillingRecords(data.data || []);
      }
    } catch (error) {
      toast.error('Failed to load billing records');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (billingId) => {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/ib-finance/billing/${billingId}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        toast.success('Billing record approved');
        fetchBillingRecords();
      } else {
        toast.error('Failed to approve');
      }
    } catch (error) {
      toast.error('Failed to approve billing record');
    }
  };

  const handleIssue = async (billingId) => {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/ib-finance/billing/${billingId}/issue`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        toast.success('Invoice issued successfully');
        fetchBillingRecords();
      } else {
        toast.error('Failed to issue invoice');
      }
    } catch (error) {
      toast.error('Failed to issue invoice');
    }
  };

  const handleCancel = async (billingId) => {
    const reason = prompt('Enter cancellation reason:');
    if (!reason) return;
    
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/ib-finance/billing/${billingId}/cancel`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (response.ok) {
        toast.success('Billing record cancelled');
        fetchBillingRecords();
      }
    } catch (error) {
      toast.error('Failed to cancel billing record');
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

  const getBillingTypeBadge = (type) => {
    const styles = {
      milestone: 'bg-purple-100 text-purple-700',
      usage: 'bg-cyan-100 text-cyan-700',
      subscription: 'bg-indigo-100 text-indigo-700',
      adjustment: 'bg-amber-100 text-amber-700'
    };
    return styles[type] || 'bg-gray-100 text-gray-700';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const filteredRecords = billingRecords.filter(record => 
    record.party_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.billing_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50" data-testid="billing-queue">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => navigate('/ib-finance')} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-500">IB Finance → Billing</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                <Receipt className="h-7 w-7 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Billing Queue</h1>
                <p className="text-sm text-gray-500 mt-1">Invoice & charge generation from confirmed execution</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/ib-finance/billing/create')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Billing
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search billing records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="approved">Approved</option>
            <option value="issued">Issued</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Billing Records Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Billing ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Party</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Period</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Gross</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Tax</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Net</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRecords.map(record => (
                <tr key={record.billing_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{record.billing_id}</p>
                    {record.invoice_number && (
                      <p className="text-xs text-green-600">{record.invoice_number}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900">{record.party_name}</p>
                    <p className="text-xs text-gray-500">{record.contract_id}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getBillingTypeBadge(record.billing_type)}`}>
                      {record.billing_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{record.billing_period}</td>
                  <td className="px-6 py-4 text-right text-gray-900">{formatCurrency(record.gross_amount)}</td>
                  <td className="px-6 py-4 text-right text-gray-500">{formatCurrency(record.tax_amount)}</td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">{formatCurrency(record.net_amount)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/ib-finance/billing/${record.billing_id}`)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {record.status === 'draft' && (
                        <>
                          <button
                            onClick={() => handleApprove(record.billing_id)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                            title="Approve"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleCancel(record.billing_id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            title="Cancel"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {record.status === 'approved' && (
                        <button
                          onClick={() => handleIssue(record.billing_id)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Issue Invoice"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredRecords.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              {loading ? 'Loading...' : 'No billing records found'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillingQueue;
