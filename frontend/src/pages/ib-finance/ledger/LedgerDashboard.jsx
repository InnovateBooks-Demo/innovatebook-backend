import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowLeft, Search, Plus, Eye, ChevronRight, FileText, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '../../../utils/auth';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const LedgerDashboard = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [journals, setJournals] = useState([]);
  const [activeTab, setActiveTab] = useState('accounts');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = authService.getToken();
      
      // Fetch accounts
      const accountsRes = await fetch(`${API_URL}/api/ib-finance/ledger/accounts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (accountsRes.ok) {
        const data = await accountsRes.json();
        setAccounts(data.data || []);
      }
      
      // Fetch journals
      const journalsRes = await fetch(`${API_URL}/api/ib-finance/ledger/journals`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (journalsRes.ok) {
        const data = await journalsRes.json();
        setJournals(data.data || []);
      }
    } catch (error) {
      toast.error('Failed to load ledger data');
    } finally {
      setLoading(false);
    }
  };

  const getAccountTypeBadge = (type) => {
    const styles = {
      asset: 'bg-blue-100 text-blue-700',
      liability: 'bg-red-100 text-red-700',
      equity: 'bg-purple-100 text-purple-700',
      income: 'bg-green-100 text-green-700',
      expense: 'bg-amber-100 text-amber-700'
    };
    return styles[type] || 'bg-gray-100 text-gray-700';
  };

  const getStatusBadge = (status) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-700',
      posted: 'bg-green-100 text-green-700',
      reversed: 'bg-red-100 text-red-700'
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const filteredAccounts = accounts.filter(a => 
    a.account_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.account_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredJournals = journals.filter(j => 
    j.journal_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group accounts by type
  const accountsByType = filteredAccounts.reduce((acc, account) => {
    const type = account.account_type || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(account);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50" data-testid="ledger-dashboard">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => navigate('/ib-finance')} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-500">IB Finance → Ledger</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                <BookOpen className="h-7 w-7 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Ledger</h1>
                <p className="text-sm text-gray-500 mt-1">System of record for financial truth</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/ib-finance/ledger/trial-balance')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <BarChart3 className="h-4 w-4" />
                Trial Balance
              </button>
              <button
                onClick={() => navigate('/ib-finance/ledger/journal/create')}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                New Journal
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('accounts')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'accounts' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Chart of Accounts
          </button>
          <button
            onClick={() => setActiveTab('journals')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'journals' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Journal Entries
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={activeTab === 'accounts' ? 'Search accounts...' : 'Search journals...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          {activeTab === 'journals' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="posted">Posted</option>
              <option value="reversed">Reversed</option>
            </select>
          )}
        </div>

        {/* Chart of Accounts */}
        {activeTab === 'accounts' && (
          <div className="space-y-6">
            {['asset', 'liability', 'equity', 'income', 'expense'].map(type => {
              const pluralName = type === 'liability' ? 'Liabilities' : 
                                 type === 'equity' ? 'Equity' : 
                                 `${type.charAt(0).toUpperCase() + type.slice(1)}s`;
              return accountsByType[type]?.length > 0 && (
                <div key={type} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className={`px-6 py-3 ${getAccountTypeBadge(type).replace('text-', 'bg-').replace('100', '50')}`}>
                    <h3 className="font-semibold text-gray-900">{pluralName}</h3>
                  </div>
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Code</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Account Name</th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {accountsByType[type].map(account => (
                        <tr key={account.account_id} className="hover:bg-gray-50">
                          <td className="px-6 py-3">
                            <span className="font-mono font-medium text-gray-900">{account.account_code}</span>
                          </td>
                          <td className="px-6 py-3 text-gray-900">{account.account_name}</td>
                          <td className="px-6 py-3 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${account.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {account.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-right">
                            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                              <Eye className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        )}

        {/* Journal Entries */}
        {activeTab === 'journals' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Journal ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Source</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Debit</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Credit</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredJournals.map(journal => (
                  <tr key={journal.journal_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{journal.journal_id}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{formatDate(journal.journal_date)}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded capitalize">
                        {journal.source_module || 'manual'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700 max-w-xs truncate">{journal.description}</td>
                    <td className="px-6 py-4 text-right text-gray-900">{formatCurrency(journal.total_debit)}</td>
                    <td className="px-6 py-4 text-right text-gray-900">{formatCurrency(journal.total_credit)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(journal.status)}`}>
                        {journal.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/ib-finance/ledger/journal/${journal.journal_id}`)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredJournals.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                {loading ? 'Loading...' : 'No journal entries found'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LedgerDashboard;
