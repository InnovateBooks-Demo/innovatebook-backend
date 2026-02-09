import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Plus, ArrowUpDown, Check, AlertCircle, RefreshCw, Upload, 
  Search, X, Link, FileText, Download, Filter, ChevronDown, ChevronRight,
  Sparkles, Brain, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '../../../utils/auth';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const BankReconciliation = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [statements, setStatements] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [reconciliations, setReconciliations] = useState([]);
  const [mlSuggestions, setMlSuggestions] = useState(null);
  const [mlLoading, setMlLoading] = useState(false);
  const [showMlModal, setShowMlModal] = useState(false);

  useEffect(() => {
    fetchAccounts();
    fetchUnmatchedTransactions();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      fetchStatements(selectedAccount);
      fetchReconciliations(selectedAccount);
    }
  }, [selectedAccount, filter]);

  const fetchAccounts = async () => {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/ib-finance/bank/accounts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAccounts(data.data || []);
        if (data.data?.length > 0 && !selectedAccount) {
          setSelectedAccount(data.data[0].account_id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch bank accounts');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatements = async (accountId) => {
    try {
      const token = authService.getToken();
      let url = `${API_URL}/api/ib-finance/bank/statements?account_id=${accountId}`;
      if (filter !== 'all') {
        url += `&status=${filter}`;
      }
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStatements(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch statements');
    }
  };

  const fetchUnmatchedTransactions = async () => {
    try {
      const token = authService.getToken();
      // Fetch receivable payments and payable payments for matching
      const [rcvRes, payRes] = await Promise.all([
        fetch(`${API_URL}/api/ib-finance/receivables`, { headers: { 'Authorization': `Bearer ${token}` }}),
        fetch(`${API_URL}/api/ib-finance/payables`, { headers: { 'Authorization': `Bearer ${token}` }})
      ]);
      
      const receivables = rcvRes.ok ? (await rcvRes.json()).data || [] : [];
      const payables = payRes.ok ? (await payRes.json()).data || [] : [];
      
      setTransactions([
        ...receivables.filter(r => !r.reconciled).map(r => ({ ...r, type: 'receivable', amount: r.paid_amount || 0 })),
        ...payables.filter(p => !p.reconciled && p.status === 'paid').map(p => ({ ...p, type: 'payable', amount: p.bill_amount || 0 }))
      ]);
    } catch (error) {
      console.error('Failed to fetch transactions');
    }
  };

  const fetchReconciliations = async (accountId) => {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/ib-finance/bank/reconciliations?account_id=${accountId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setReconciliations(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch reconciliations');
    }
  };

  const handleAutoMatch = async () => {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/ib-finance/bank/reconcile/auto-match`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ account_id: selectedAccount })
      });
      if (response.ok) {
        const data = await response.json();
        toast.success(`Auto-matched ${data.matched_count} transactions`);
        fetchStatements(selectedAccount);
        fetchUnmatchedTransactions();
      }
    } catch (error) {
      toast.error('Auto-match failed');
    }
  };

  // ML-powered auto-match using Gemini 3 Flash
  const handleMLAutoMatch = async () => {
    setMlLoading(true);
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/ib-finance/ml-reconcile/auto-match`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        toast.success(`ML Analysis complete! Auto-matched ${data.auto_matched} of ${data.total_analyzed} transactions`);
        setMlSuggestions(data.all_matches || []);
        if (data.pending_review > 0) {
          setShowMlModal(true);
        }
        fetchStatements(selectedAccount);
        fetchUnmatchedTransactions();
      } else {
        toast.error('ML auto-match failed');
      }
    } catch (error) {
      toast.error('ML auto-match failed');
    } finally {
      setMlLoading(false);
    }
  };

  // Get ML suggestions for a single entry
  const handleGetMLSuggestions = async (entryId) => {
    setMlLoading(true);
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/ib-finance/ml-reconcile/suggestions/${entryId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMlSuggestions(data.suggestions);
        setShowMlModal(true);
      }
    } catch (error) {
      toast.error('Failed to get ML suggestions');
    } finally {
      setMlLoading(false);
    }
  };

  // Confirm an ML-suggested match
  const handleConfirmMLMatch = async (bankEntryId, accountingRecordId) => {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/ib-finance/ml-reconcile/confirm-match`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bank_entry_id: bankEntryId, accounting_record_id: accountingRecordId })
      });
      if (response.ok) {
        toast.success('Match confirmed!');
        fetchStatements(selectedAccount);
        fetchUnmatchedTransactions();
        setShowMlModal(false);
      }
    } catch (error) {
      toast.error('Failed to confirm match');
    }
  };

  const handleManualMatch = async (transactionType, transactionId) => {
    if (!selectedEntry) return;
    
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/ib-finance/bank/reconcile/manual-match`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          entry_id: selectedEntry.entry_id,
          transaction_type: transactionType,
          transaction_id: transactionId
        })
      });
      if (response.ok) {
        toast.success('Transaction matched successfully');
        setShowMatchModal(false);
        setSelectedEntry(null);
        fetchStatements(selectedAccount);
        fetchUnmatchedTransactions();
      }
    } catch (error) {
      toast.error('Failed to match transaction');
    }
  };

  const handleCompleteReconciliation = async () => {
    const period = prompt('Enter period to reconcile (e.g., 2025-01):');
    const balance = prompt('Enter closing bank balance:');
    
    if (!period || !balance) return;
    
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/ib-finance/bank/reconcile/complete`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          account_id: selectedAccount,
          period,
          closing_balance: parseFloat(balance)
        })
      });
      if (response.ok) {
        toast.success('Reconciliation completed!');
        fetchStatements(selectedAccount);
        fetchReconciliations(selectedAccount);
      }
    } catch (error) {
      toast.error('Failed to complete reconciliation');
    }
  };

  const handleCreateAccount = async (formData) => {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/ib-finance/bank/accounts`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        toast.success('Bank account created');
        setShowAddAccount(false);
        fetchAccounts();
      }
    } catch (error) {
      toast.error('Failed to create account');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    const styles = {
      unmatched: 'bg-red-100 text-red-700',
      matched: 'bg-amber-100 text-amber-700',
      reconciled: 'bg-green-100 text-green-700'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const unmatchedCount = statements.filter(s => s.status === 'unmatched').length;
  const matchedCount = statements.filter(s => s.status === 'matched').length;
  const reconciledCount = statements.filter(s => s.status === 'reconciled').length;

  return (
    <div className="min-h-screen bg-gray-50" data-testid="bank-reconciliation">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                <Building2 className="h-7 w-7 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Bank Reconciliation</h1>
                <p className="text-sm text-gray-500 mt-1">Match bank statements with transactions</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                data-testid="import-statement-btn"
              >
                <Upload className="h-4 w-4" /> Import Statement
              </button>
              <button 
                onClick={handleAutoMatch}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                data-testid="auto-match-btn"
              >
                <ArrowUpDown className="h-4 w-4" /> Auto Match
              </button>
              <button 
                onClick={handleMLAutoMatch}
                disabled={mlLoading}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                data-testid="ml-auto-match-btn"
              >
                {mlLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Brain className="h-4 w-4" />
                )}
                AI Match
              </button>
              <button 
                onClick={handleCompleteReconciliation}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                data-testid="complete-recon-btn"
              >
                <Check className="h-4 w-4" /> Complete Recon
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <FileText className="h-5 w-5" />
              <span className="font-medium">Total Entries</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{statements.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Unmatched</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{unmatchedCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-amber-600 mb-2">
              <ArrowUpDown className="h-5 w-5" />
              <span className="font-medium">Matched</span>
            </div>
            <p className="text-2xl font-bold text-amber-600">{matchedCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <Check className="h-5 w-5" />
              <span className="font-medium">Reconciled</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{reconciledCount}</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {/* Bank Accounts Sidebar */}
          <div className="col-span-1 space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Bank Accounts</h3>
                <button 
                  onClick={() => setShowAddAccount(true)}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2">
                {accounts.map(account => (
                  <button
                    key={account.account_id}
                    onClick={() => setSelectedAccount(account.account_id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedAccount === account.account_id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <p className="font-medium text-gray-900">{account.account_name}</p>
                    <p className="text-xs text-gray-500">{account.bank_name}</p>
                    <p className="text-sm font-semibold text-blue-600 mt-1">
                      {formatCurrency(account.current_balance)}
                    </p>
                  </button>
                ))}
                {accounts.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">No bank accounts</p>
                    <button 
                      onClick={() => setShowAddAccount(true)}
                      className="text-blue-600 text-sm mt-2 hover:underline"
                    >
                      Add your first account
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Reconciliations */}
            {reconciliations.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Recent Reconciliations</h3>
                <div className="space-y-2">
                  {reconciliations.slice(0, 5).map(recon => (
                    <div key={recon.recon_id} className="p-2 bg-gray-50 rounded-lg text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">{recon.period}</span>
                        <span className="text-green-600">✓</span>
                      </div>
                      <p className="text-xs text-gray-500">{recon.reconciled_entries} entries</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Statements */}
          <div className="col-span-3">
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Bank Statement Entries</h3>
                <div className="flex gap-2">
                  <select 
                    value={filter} 
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                  >
                    <option value="all">All Entries</option>
                    <option value="unmatched">Unmatched</option>
                    <option value="matched">Matched</option>
                    <option value="reconciled">Reconciled</option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Description</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Debit</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Credit</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Balance</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {statements.map((entry) => (
                      <tr key={entry.entry_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {entry.transaction_date ? new Date(entry.transaction_date).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-700">{entry.description}</p>
                          {entry.reference && (
                            <p className="text-xs text-gray-400">Ref: {entry.reference}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-red-600">
                          {entry.debit_amount > 0 ? formatCurrency(entry.debit_amount) : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-green-600">
                          {entry.credit_amount > 0 ? formatCurrency(entry.credit_amount) : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium">
                          {formatCurrency(entry.running_balance)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {getStatusBadge(entry.status)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {entry.status === 'unmatched' && (
                            <button
                              onClick={() => {
                                setSelectedEntry(entry);
                                setShowMatchModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              <Link className="h-4 w-4 inline" /> Match
                            </button>
                          )}
                          {entry.status === 'matched' && entry.matched_transactions?.length > 0 && (
                            <span className="text-xs text-gray-500">
                              → {entry.matched_transactions[0].type}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {statements.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center">
                          <Upload className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 mb-2">No statement entries found</p>
                          <button
                            onClick={() => setShowUploadModal(true)}
                            className="text-blue-600 hover:underline text-sm"
                          >
                            Import a bank statement to get started
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadStatementModal
          accountId={selectedAccount}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            fetchStatements(selectedAccount);
          }}
        />
      )}

      {/* Manual Match Modal */}
      {showMatchModal && selectedEntry && (
        <ManualMatchModal
          entry={selectedEntry}
          transactions={transactions}
          onClose={() => {
            setShowMatchModal(false);
            setSelectedEntry(null);
          }}
          onMatch={handleManualMatch}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Add Account Modal */}
      {showAddAccount && (
        <AddAccountModal
          onClose={() => setShowAddAccount(false)}
          onSubmit={handleCreateAccount}
        />
      )}

      {/* ML Suggestions Modal */}
      {showMlModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowMlModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Brain className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">AI Match Suggestions</h2>
                    <p className="text-sm text-gray-600">Powered by Gemini 3 Flash</p>
                  </div>
                </div>
                <button onClick={() => setShowMlModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {mlSuggestions && Array.isArray(mlSuggestions) && mlSuggestions.length > 0 ? (
                <div className="space-y-4">
                  {mlSuggestions.map((suggestion, idx) => (
                    <div key={suggestion.bank_entry_id || idx} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-gray-900">Bank Entry: {suggestion.bank_entry_id}</span>
                        <span className="text-sm text-gray-500">{suggestion.reasoning}</span>
                      </div>
                      
                      {suggestion.matches && suggestion.matches.length > 0 ? (
                        <div className="space-y-2">
                          {suggestion.matches.map((match, mIdx) => (
                            <div key={match.accounting_id || mIdx} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{match.accounting_id}</span>
                                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                    match.confidence >= 0.8 ? 'bg-green-100 text-green-700' :
                                    match.confidence >= 0.6 ? 'bg-amber-100 text-amber-700' :
                                    'bg-gray-100 text-gray-600'
                                  }`}>
                                    {(match.confidence * 100).toFixed(0)}% confidence
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {match.match_reasons?.map((reason, rIdx) => (
                                    <span key={rIdx} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                                      {reason}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <button
                                onClick={() => handleConfirmMLMatch(suggestion.bank_entry_id, match.accounting_id)}
                                className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1 text-sm"
                                data-testid={`confirm-match-${idx}-${mIdx}`}
                              >
                                <Check className="h-4 w-4" />
                                Confirm
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No matching records found</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Sparkles className="h-12 w-12 mx-auto mb-3 text-purple-400" />
                  <p>No suggestions available. Try importing some bank statements first.</p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowMlModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Upload Statement Modal Component
const UploadStatementModal = ({ accountId, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [parsedEntries, setParsedEntries] = useState([]);
  const [importing, setImporting] = useState(false);
  const [columnMapping, setColumnMapping] = useState({});
  const [headers, setHeaders] = useState([]);
  const [showMapping, setShowMapping] = useState(false);
  const [parseErrors, setParseErrors] = useState([]);

  // Bank-specific column mappings
  const BANK_PRESETS = {
    hdfc: { date: 'date', description: 'narration', debit: 'withdrawal amt', credit: 'deposit amt', balance: 'closing balance' },
    icici: { date: 'transaction date', description: 'transaction remarks', debit: 'withdrawal amount', credit: 'deposit amount', balance: 'balance' },
    sbi: { date: 'txn date', description: 'description', debit: 'debit', credit: 'credit', balance: 'balance' },
    axis: { date: 'trans date', description: 'particulars', debit: 'debit', credit: 'credit', balance: 'balance' },
    kotak: { date: 'date', description: 'description', debit: 'dr amount', credit: 'cr amount', balance: 'balance' },
    default: { date: 'date', description: 'description', debit: 'debit', credit: 'credit', balance: 'balance' }
  };

  const REQUIRED_FIELDS = ['date', 'description'];
  const OPTIONAL_FIELDS = ['debit', 'credit', 'balance', 'reference'];

  // Parse CSV with better handling
  const parseCSV = (text, mapping = null) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    if (lines.length < 2) return { entries: [], errors: ['File must have at least a header row and one data row'] };

    // Parse headers - handle quoted values
    const rawHeaders = parseCSVLine(lines[0]);
    const normalizedHeaders = rawHeaders.map(h => h.toLowerCase().trim());
    setHeaders(normalizedHeaders);

    // Auto-detect bank format if no mapping provided
    if (!mapping) {
      mapping = detectBankFormat(normalizedHeaders);
      setColumnMapping(mapping);
    }

    const entries = [];
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length < 3) continue;

      try {
        const entry = {};
        normalizedHeaders.forEach((header, idx) => {
          entry[header] = values[idx]?.trim() || '';
        });

        // Map fields using column mapping
        const mappedEntry = {
          date: parseDate(entry[mapping.date]),
          description: entry[mapping.description] || entry[mapping.narration] || '',
          reference: entry[mapping.reference] || entry[mapping.ref] || entry[mapping.cheque] || '',
          debit: parseAmount(entry[mapping.debit] || entry[mapping.withdrawal] || 0),
          credit: parseAmount(entry[mapping.credit] || entry[mapping.deposit] || 0),
          balance: parseAmount(entry[mapping.balance] || 0)
        };

        // Validate required fields
        if (!mappedEntry.date) {
          errors.push(`Row ${i + 1}: Invalid or missing date`);
          continue;
        }
        if (!mappedEntry.description) {
          errors.push(`Row ${i + 1}: Missing description`);
          continue;
        }

        // Validate amounts
        if (mappedEntry.debit < 0 || mappedEntry.credit < 0) {
          errors.push(`Row ${i + 1}: Negative amounts are not allowed`);
          continue;
        }

        entries.push(mappedEntry);
      } catch (err) {
        errors.push(`Row ${i + 1}: ${err.message}`);
      }
    }

    return { entries, errors };
  };

  // Parse a single CSV line handling quoted values
  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.replace(/^"|"$/g, '').trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.replace(/^"|"$/g, '').trim());
    return result;
  };

  // Parse date in various formats
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    
    // Try different date formats
    const formats = [
      /(\d{4})-(\d{2})-(\d{2})/,          // YYYY-MM-DD
      /(\d{2})\/(\d{2})\/(\d{4})/,          // DD/MM/YYYY
      /(\d{2})-(\d{2})-(\d{4})/,            // DD-MM-YYYY
      /(\d{2})\/(\d{2})\/(\d{2})/,          // DD/MM/YY
      /(\d{1,2})-([A-Za-z]{3})-(\d{4})/,   // D-MMM-YYYY
    ];

    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        let year, month, day;
        
        if (format === formats[0]) {
          [, year, month, day] = match;
        } else if (format === formats[4]) {
          [, day, month, year] = match;
          const months = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };
          month = months[month.toLowerCase()] || '01';
        } else {
          [, day, month, year] = match;
          if (year.length === 2) year = `20${year}`;
        }
        
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
    return null;
  };

  // Parse amount handling various formats
  const parseAmount = (amountStr) => {
    if (!amountStr || amountStr === '-' || amountStr === '') return 0;
    
    // Remove currency symbols, commas, spaces
    let cleaned = String(amountStr)
      .replace(/[₹$€£¥]/g, '')
      .replace(/,/g, '')
      .replace(/\s/g, '')
      .trim();
    
    // Handle Dr/Cr suffixes
    if (cleaned.toLowerCase().endsWith('dr')) {
      cleaned = cleaned.slice(0, -2);
    } else if (cleaned.toLowerCase().endsWith('cr')) {
      cleaned = cleaned.slice(0, -2);
    }
    
    const amount = parseFloat(cleaned);
    return isNaN(amount) ? 0 : Math.abs(amount);
  };

  // Detect bank format from headers
  const detectBankFormat = (normalizedHeaders) => {
    const headersStr = normalizedHeaders.join(' ');
    
    if (headersStr.includes('narration') && headersStr.includes('withdrawal amt')) {
      return BANK_PRESETS.hdfc;
    }
    if (headersStr.includes('transaction remarks') && headersStr.includes('withdrawal amount')) {
      return BANK_PRESETS.icici;
    }
    if (headersStr.includes('txn date') || headersStr.includes('txn_date')) {
      return BANK_PRESETS.sbi;
    }
    if (headersStr.includes('trans date') && headersStr.includes('particulars')) {
      return BANK_PRESETS.axis;
    }
    if (headersStr.includes('dr amount') && headersStr.includes('cr amount')) {
      return BANK_PRESETS.kotak;
    }
    
    // Auto-map from available headers
    const autoMapping = {};
    for (const header of normalizedHeaders) {
      if (header.includes('date') && !autoMapping.date) autoMapping.date = header;
      if ((header.includes('desc') || header.includes('narration') || header.includes('particulars') || header.includes('remarks')) && !autoMapping.description) autoMapping.description = header;
      if ((header.includes('debit') || header.includes('withdrawal') || header.includes('dr')) && !autoMapping.debit) autoMapping.debit = header;
      if ((header.includes('credit') || header.includes('deposit') || header.includes('cr')) && !autoMapping.credit) autoMapping.credit = header;
      if (header.includes('balance') && !autoMapping.balance) autoMapping.balance = header;
      if ((header.includes('ref') || header.includes('cheque') || header.includes('check')) && !autoMapping.reference) autoMapping.reference = header;
    }
    
    return { ...BANK_PRESETS.default, ...autoMapping };
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setParsing(true);
    setParseErrors([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const { entries, errors } = parseCSV(text);
      setParsedEntries(entries);
      setParseErrors(errors);
      setParsing(false);
      
      if (errors.length > 0 && entries.length > 0) {
        toast.warning(`Parsed ${entries.length} entries with ${errors.length} warnings`);
      }
    };
    reader.onerror = () => {
      setParsing(false);
      toast.error('Failed to read file');
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    if (parsedEntries.length === 0) return;

    setImporting(true);
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/ib-finance/bank/statements/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          account_id: accountId,
          entries: parsedEntries
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Imported ${data.count} statement entries`);
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to import statement');
      }
    } catch (error) {
      toast.error('Import failed');
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `Date,Description,Reference,Debit,Credit,Balance
2024-12-01,Opening Balance,,,0,100000
2024-12-02,Payment from Customer ABC,CHQ123,,50000,150000
2024-12-03,Vendor Payment - Office Supplies,NEFT456,5000,,145000
2024-12-05,Salary Transfer,SAL-DEC,80000,,65000
2024-12-10,Client Invoice Payment,INV-2024-001,,120000,185000`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bank_statement_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const reParseWithMapping = () => {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const { entries, errors } = parseCSV(event.target.result, columnMapping);
      setParsedEntries(entries);
      setParseErrors(errors);
    };
    reader.readAsText(file);
    setShowMapping(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[80vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Import Bank Statement</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {!file ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Upload CSV bank statement</p>
              <p className="text-sm text-gray-400 mb-4">
                Supports: HDFC, ICICI, SBI, Axis, Kotak and standard CSV formats
              </p>
              <div className="flex items-center justify-center gap-4">
                <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
                  Select File
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={downloadTemplate}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Template
                </button>
              </div>
            </div>
          ) : parsing ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Parsing statement...</p>
            </div>
          ) : showMapping ? (
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Column Mapping</h4>
              <p className="text-sm text-gray-500 mb-4">Map your CSV columns to the required fields:</p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[...REQUIRED_FIELDS, ...OPTIONAL_FIELDS].map(field => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                      {field} {REQUIRED_FIELDS.includes(field) && <span className="text-red-500">*</span>}
                    </label>
                    <select
                      value={columnMapping[field] || ''}
                      onChange={(e) => setColumnMapping({...columnMapping, [field]: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">-- Select Column --</option>
                      {headers.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowMapping(false)} className="px-4 py-2 border border-gray-200 rounded-lg">
                  Cancel
                </button>
                <button onClick={reParseWithMapping} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                  Apply Mapping
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  <FileText className="h-4 w-4 inline mr-1" />
                  {file.name} - {parsedEntries.length} entries found
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowMapping(true)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Edit Mapping
                  </button>
                  <button
                    onClick={() => {
                      setFile(null);
                      setParsedEntries([]);
                      setParseErrors([]);
                    }}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {parseErrors.length > 0 && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800 mb-1">
                    <AlertCircle className="h-4 w-4 inline mr-1" />
                    {parseErrors.length} parsing warning{parseErrors.length > 1 ? 's' : ''}
                  </p>
                  <ul className="text-xs text-yellow-700 max-h-20 overflow-y-auto">
                    {parseErrors.slice(0, 5).map((err, i) => (
                      <li key={i}>• {err}</li>
                    ))}
                    {parseErrors.length > 5 && <li>... and {parseErrors.length - 5} more</li>}
                  </ul>
                </div>
              )}

              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Date</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Description</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500">Debit</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500">Credit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {parsedEntries.slice(0, 10).map((entry, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 text-gray-900">{entry.date}</td>
                        <td className="px-3 py-2 text-gray-700 truncate max-w-xs">{entry.description}</td>
                        <td className="px-3 py-2 text-right text-red-600">{entry.debit > 0 ? `₹${entry.debit.toLocaleString()}` : '-'}</td>
                        <td className="px-3 py-2 text-right text-green-600">{entry.credit > 0 ? `₹${entry.credit.toLocaleString()}` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedEntries.length > 10 && (
                  <div className="px-3 py-2 bg-gray-50 text-center text-sm text-gray-500">
                    ... and {parsedEntries.length - 10} more entries
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={parsedEntries.length === 0 || importing || showMapping}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {importing ? 'Importing...' : `Import ${parsedEntries.length} Entries`}
          </button>
        </div>
      </div>
    </div>
  );
};

// Manual Match Modal Component
const ManualMatchModal = ({ entry, transactions, onClose, onMatch, formatCurrency }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const entryAmount = (entry.credit_amount || 0) - (entry.debit_amount || 0);
  const isCredit = entryAmount > 0;

  const filteredTransactions = transactions.filter(txn => {
    // Filter by type based on entry direction
    if (isCredit && txn.type !== 'receivable') return false;
    if (!isCredit && txn.type !== 'payable') return false;

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        (txn.customer_name || txn.vendor_name || '').toLowerCase().includes(search) ||
        (txn.receivable_id || txn.payable_id || '').toLowerCase().includes(search)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Match Transaction</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Bank Entry Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Bank Statement Entry</p>
            <p className="font-medium text-gray-900">{entry.description}</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-sm text-gray-500">
                {entry.transaction_date ? new Date(entry.transaction_date).toLocaleDateString() : '-'}
              </span>
              <span className={`font-semibold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(entryAmount))} {isCredit ? '(Credit)' : '(Debit)'}
              </span>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Matching Transactions */}
          <div className="max-h-64 overflow-y-auto space-y-2">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No matching transactions found
              </div>
            ) : (
              filteredTransactions.map(txn => (
                <div
                  key={txn.receivable_id || txn.payable_id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => onMatch(
                    txn.type === 'receivable' ? 'receivable_payment' : 'payable_payment',
                    txn.receivable_id || txn.payable_id
                  )}
                >
                  <div>
                    <p className="font-medium text-gray-900">{txn.customer_name || txn.vendor_name}</p>
                    <p className="text-sm text-gray-500">
                      {txn.receivable_id || txn.payable_id} • {txn.type === 'receivable' ? 'Receipt' : 'Payment'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${txn.type === 'receivable' ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(txn.amount)}
                    </p>
                    {Math.abs(txn.amount - Math.abs(entryAmount)) < 1 && (
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">Exact Match</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Add Account Modal Component
const AddAccountModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    account_name: '',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    account_type: 'current',
    opening_balance: 0
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Add Bank Account</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
            <input
              type="text"
              value={formData.account_name}
              onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., HDFC Current Account"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
            <input
              type="text"
              value={formData.bank_name}
              onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., HDFC Bank"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
              <input
                type="text"
                value={formData.account_number}
                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="xxxx xxxx xxxx"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
              <input
                type="text"
                value={formData.ifsc_code}
                onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="HDFC0001234"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
              <select
                value={formData.account_type}
                onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="current">Current</option>
                <option value="savings">Savings</option>
                <option value="overdraft">Overdraft</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Opening Balance</label>
              <input
                type="number"
                value={formData.opening_balance}
                onChange={(e) => setFormData({ ...formData, opening_balance: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BankReconciliation;
