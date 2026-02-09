import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, ArrowLeft, Search, Plus, Eye, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '../../../utils/auth';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ReceivablesDashboard = () => {
  const navigate = useNavigate();
  const [receivables, setReceivables] = useState([]);
  const [dashboard, setDashboard] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    try {
      const token = authService.getToken();
      
      // Fetch dashboard
      const dashRes = await fetch(`${API_URL}/api/ib-finance/receivables/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (dashRes.ok) {
        const dashData = await dashRes.json();
        setDashboard(dashData.data || {});
      }
      
      // Fetch receivables
      const url = statusFilter === 'all' 
        ? `${API_URL}/api/ib-finance/receivables`
        : `${API_URL}/api/ib-finance/receivables?status=${statusFilter}`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setReceivables(data.data || []);
      }
    } catch (error) {
      toast.error('Failed to load receivables');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      open: 'bg-blue-100 text-blue-700',
      partially_paid: 'bg-amber-100 text-amber-700',
      paid: 'bg-green-100 text-green-700',
      overdue: 'bg-red-100 text-red-700',
      written_off: 'bg-gray-100 text-gray-700'
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  const getAgingBadge = (bucket) => {
    const styles = {
      '0-30': 'bg-green-100 text-green-700',
      '31-60': 'bg-yellow-100 text-yellow-700',
      '61-90': 'bg-orange-100 text-orange-700',
      '90+': 'bg-red-100 text-red-700'
    };
    return styles[bucket] || 'bg-gray-100 text-gray-700';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const filteredRecords = receivables.filter(record => 
    record.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.receivable_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const agingData = dashboard.aging || {};

  return (
    <div className="min-h-screen bg-gray-50" data-testid="receivables-dashboard">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => navigate('/ib-finance')} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-500">IB Finance → Receivables</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Wallet className="h-7 w-7 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Receivables</h1>
                <p className="text-sm text-gray-500 mt-1">Customer dues, collections & cash application</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/ib-finance/receivables/payment')}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Record Payment
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Wallet className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-500">Total Outstanding</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboard.total_outstanding || 0)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <p className="text-sm font-medium text-gray-500">Overdue Amount</p>
            </div>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(dashboard.total_overdue || 0)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-500">Collected MTD</p>
            </div>
            <p className="text-2xl font-bold text-green-600">₹0</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-sm font-medium text-gray-500">DSO</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">32 days</p>
          </div>
        </div>

        {/* Aging Buckets */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Aging Analysis</h3>
          <div className="grid grid-cols-4 gap-4">
            {['0-30', '31-60', '61-90', '90+'].map(bucket => (
              <div key={bucket} className={`p-4 rounded-lg ${getAgingBadge(bucket).replace('text-', 'bg-').replace('100', '50')}`}>
                <p className="text-sm font-medium text-gray-600">{bucket} Days</p>
                <p className="text-xl font-bold mt-1">{formatCurrency(agingData[bucket]?.amount || 0)}</p>
                <p className="text-xs text-gray-500 mt-1">{agingData[bucket]?.count || 0} invoices</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search receivables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="overdue">Overdue</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        {/* Receivables Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Invoice</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Invoice Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Due Date</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Outstanding</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Aging</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRecords.map(record => (
                <tr key={record.receivable_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{record.invoice_number}</p>
                    <p className="text-xs text-gray-500">{record.receivable_id}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900">{record.customer_name}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(record.invoice_date)}</td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(record.due_date)}</td>
                  <td className="px-6 py-4 text-right text-gray-900">{formatCurrency(record.invoice_amount)}</td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">{formatCurrency(record.outstanding_amount)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAgingBadge(record.aging_bucket)}`}>
                      {record.aging_bucket}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(record.status)}`}>
                      {record.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/ib-finance/receivables/${record.receivable_id}`)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {record.status !== 'paid' && (
                        <button
                          onClick={() => navigate(`/ib-finance/receivables/apply?id=${record.receivable_id}`)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                          title="Apply Cash"
                        >
                          <DollarSign className="h-4 w-4" />
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
              {loading ? 'Loading...' : 'No receivables found'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceivablesDashboard;
