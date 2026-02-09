import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, ArrowLeft, Search, FileText, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '../../../utils/auth';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const TaxDashboard = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [directionFilter, setDirectionFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('2025-01');

  useEffect(() => {
    fetchData();
  }, [periodFilter, directionFilter]);

  const fetchData = async () => {
    try {
      const token = authService.getToken();
      
      // Fetch dashboard
      const dashRes = await fetch(`${API_URL}/api/ib-finance/tax/dashboard?period=${periodFilter}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (dashRes.ok) {
        const data = await dashRes.json();
        setDashboard(data.data || {});
      }
      
      // Fetch transactions
      let url = `${API_URL}/api/ib-finance/tax/transactions?period=${periodFilter}`;
      if (directionFilter !== 'all') url += `&direction=${directionFilter}`;
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.data || []);
      }
    } catch (error) {
      toast.error('Failed to load tax data');
    } finally {
      setLoading(false);
    }
  };

  const getDirectionBadge = (direction) => {
    const styles = {
      output: 'bg-red-100 text-red-700',
      input: 'bg-green-100 text-green-700'
    };
    return styles[direction] || 'bg-gray-100 text-gray-700';
  };

  const getTaxTypeBadge = (type) => {
    const styles = {
      GST: 'bg-blue-100 text-blue-700',
      VAT: 'bg-purple-100 text-purple-700',
      WHT: 'bg-amber-100 text-amber-700',
      SALES: 'bg-cyan-100 text-cyan-700'
    };
    return styles[type] || 'bg-gray-100 text-gray-700';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const filteredTransactions = transactions.filter(txn => 
    txn.tax_txn_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    txn.source_reference_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const outputTax = dashboard.output_tax || 0;
  const inputTax = dashboard.input_tax || 0;
  const netPayable = dashboard.net_payable || 0;

  return (
    <div className="min-h-screen bg-gray-50" data-testid="tax-dashboard">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => navigate('/ib-finance')} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-500">IB Finance → Tax</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-rose-100 rounded-xl flex items-center justify-center">
                <Calculator className="h-7 w-7 text-rose-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Tax</h1>
                <p className="text-sm text-gray-500 mt-1">Tax determination, calculation & compliance</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/ib-finance/tax/gst')}
                className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
              >
                <FileText className="h-4 w-4" />
                GST Reports
              </button>
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="2025-01">January 2025</option>
                <option value="2024-12">December 2024</option>
                <option value="2024-11">November 2024</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-red-600" />
              </div>
              <p className="text-sm font-medium text-gray-500">Output Tax</p>
            </div>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(outputTax)}</p>
            <p className="text-xs text-gray-500 mt-1">Tax collected on sales</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-500">Input Tax Credit</p>
            </div>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(inputTax)}</p>
            <p className="text-xs text-gray-500 mt-1">Tax paid on purchases</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <p className="text-sm font-medium text-gray-500">Net Payable</p>
            </div>
            <p className={`text-2xl font-bold ${netPayable >= 0 ? 'text-amber-600' : 'text-green-600'}`}>
              {formatCurrency(Math.abs(netPayable))}
            </p>
            <p className="text-xs text-gray-500 mt-1">{netPayable >= 0 ? 'To be paid' : 'Refund due'}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-500">Transactions</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
            <p className="text-xs text-gray-500 mt-1">This period</p>
          </div>
        </div>

        {/* Tax Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Tax Breakdown by Type</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-red-600 mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Output Tax (Liability)
              </h4>
              <div className="space-y-2">
                {Object.entries(dashboard.by_type?.output || {}).map(([type, amount]) => (
                  <div key={type} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTaxTypeBadge(type)}`}>{type}</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(amount)}</span>
                  </div>
                ))}
                {Object.keys(dashboard.by_type?.output || {}).length === 0 && (
                  <p className="text-sm text-gray-500">No output tax transactions</p>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-green-600 mb-3 flex items-center gap-2">
                <TrendingDown className="h-4 w-4" /> Input Tax (Credit)
              </h4>
              <div className="space-y-2">
                {Object.entries(dashboard.by_type?.input || {}).map(([type, amount]) => (
                  <div key={type} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTaxTypeBadge(type)}`}>{type}</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(amount)}</span>
                  </div>
                ))}
                {Object.keys(dashboard.by_type?.input || {}).length === 0 && (
                  <p className="text-sm text-gray-500">No input tax transactions</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tax transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <select
            value={directionFilter}
            onChange={(e) => setDirectionFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="all">All Directions</option>
            <option value="output">Output (Sales)</option>
            <option value="input">Input (Purchases)</option>
          </select>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Transaction ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Source</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tax Type</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Direction</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Taxable Amt</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Rate</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Tax Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Jurisdiction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.map(txn => (
                <tr key={txn.tax_txn_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{txn.tax_txn_id}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-700">{txn.source_module}</p>
                    <p className="text-xs text-gray-500">{txn.source_reference_id}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTaxTypeBadge(txn.tax_type)}`}>
                      {txn.tax_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getDirectionBadge(txn.direction)}`}>
                      {txn.direction}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-900">{formatCurrency(txn.taxable_amount)}</td>
                  <td className="px-6 py-4 text-center text-gray-600">{txn.tax_rate}%</td>
                  <td className="px-6 py-4 text-right font-medium">
                    <span className={txn.direction === 'output' ? 'text-red-600' : 'text-green-600'}>
                      {formatCurrency(txn.tax_amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{txn.jurisdiction}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTransactions.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              {loading ? 'Loading...' : 'No tax transactions found'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaxDashboard;
