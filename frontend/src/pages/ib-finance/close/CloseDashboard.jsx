import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, ArrowLeft, CheckCircle, XCircle, AlertTriangle, Play, FileText, Clock,
  RefreshCw, ChevronRight, Calculator, CreditCard, Building2, Receipt, BookOpen,
  DollarSign, Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '../../../utils/auth';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const CloseDashboard = () => {
  const navigate = useNavigate();
  const [periods, setPeriods] = useState([]);
  const [checklist, setChecklist] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoCloseResult, setAutoCloseResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchPeriods();
  }, []);

  useEffect(() => {
    if (selectedPeriod) {
      fetchChecklist(selectedPeriod.period);
    }
  }, [selectedPeriod]);

  const fetchPeriods = async () => {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/ib-finance/close/periods`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const periodsData = data.data || [];
        setPeriods(periodsData);
        const openPeriod = periodsData.find(p => p.status === 'open') || periodsData[0];
        if (openPeriod) setSelectedPeriod(openPeriod);
      }
    } catch (error) {
      toast.error('Failed to load periods');
    } finally {
      setLoading(false);
    }
  };

  const fetchChecklist = async (period) => {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/ib-finance/close/checklist?period=${period}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setChecklist(data.data);
      }
    } catch (error) {
      console.error('Failed to load checklist:', error);
    }
  };

  const handleStartClose = async () => {
    if (!selectedPeriod) return;
    
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/ib-finance/close/periods/${selectedPeriod.period_id}/start-close`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        toast.success('Period close process started');
        fetchPeriods();
      } else {
        const err = await response.json();
        toast.error(err.detail || 'Failed to start close');
      }
    } catch (error) {
      toast.error('Failed to start period close');
    }
  };

  const handleAutoClose = async () => {
    if (!selectedPeriod) return;
    
    setIsProcessing(true);
    setAutoCloseResult(null);
    
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/ib-finance/close/auto-close`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ period: selectedPeriod.period })
      });
      
      if (response.ok) {
        const data = await response.json();
        setAutoCloseResult(data.data);
        
        if (data.data.can_close) {
          toast.success('Period closed successfully!');
          fetchPeriods();
        } else {
          toast.warning(`Period close blocked - ${data.data.errors.length} issues found`);
        }
        
        fetchChecklist(selectedPeriod.period);
      } else {
        const err = await response.json();
        toast.error(err.detail || 'Auto-close failed');
      }
    } catch (error) {
      toast.error('Auto-close process failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteClose = async () => {
    if (!selectedPeriod || !checklist?.ready_to_close) return;
    
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/ib-finance/close/periods/${selectedPeriod.period_id}/complete-close`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        toast.success('Period closed successfully');
        fetchPeriods();
      } else {
        const err = await response.json();
        toast.error(err.detail || 'Failed to close period');
      }
    } catch (error) {
      toast.error('Failed to complete period close');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      open: 'bg-green-100 text-green-700',
      closing: 'bg-amber-100 text-amber-700',
      closed: 'bg-gray-100 text-gray-500'
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'open': return <Clock className="h-5 w-5 text-green-600" />;
      case 'closing': return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      case 'closed': return <Lock className="h-5 w-5 text-gray-500" />;
      default: return null;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const checklistModules = checklist?.checklist || {};
  const allPassed = checklist?.ready_to_close || false;

  // Auto-close checklist items with icons
  const autoCloseItems = [
    { key: 'receivables_reviewed', name: 'Receivables Review', icon: Receipt, description: 'All billing records approved' },
    { key: 'payables_reviewed', name: 'Payables Review', icon: CreditCard, description: 'All payables 3-way matched' },
    { key: 'depreciation_run', name: 'Depreciation Run', icon: Building2, description: 'Asset depreciation calculated' },
    { key: 'tax_calculated', name: 'Tax Calculation', icon: Calculator, description: 'Output/Input tax computed' },
    { key: 'bank_reconciled', name: 'Bank Reconciliation', icon: Building2, description: 'All accounts reconciled' },
    { key: 'journals_posted', name: 'Journals Posted', icon: BookOpen, description: 'All draft journals posted' },
    { key: 'trial_balance_reviewed', name: 'Trial Balance', icon: DollarSign, description: 'Debits = Credits verified' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="close-dashboard">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => navigate('/ib-finance')} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-500">IB Finance → Close</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Lock className="h-7 w-7 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Period Close</h1>
                <p className="text-sm text-gray-500 mt-1">Automated period control & financial finalization</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/ib-finance/close/statements')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <FileText className="h-4 w-4" /> Financial Statements
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Periods List */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Accounting Periods</h3>
            </div>
            <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
              {periods.map(period => (
                <div
                  key={period.period_id}
                  onClick={() => setSelectedPeriod(period)}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedPeriod?.period_id === period.period_id ? 'bg-indigo-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(period.status)}
                      <div>
                        <p className="font-medium text-gray-900">{period.period}</p>
                        <p className="text-xs text-gray-500">{formatDate(period.start_date)} - {formatDate(period.end_date)}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(period.status)}`}>
                      {period.status}
                    </span>
                  </div>
                </div>
              ))}
              {periods.length === 0 && (
                <div className="py-8 text-center text-gray-500">
                  No periods found
                </div>
              )}
            </div>
          </div>

          {/* Close Checklist */}
          <div className="lg:col-span-2">
            {selectedPeriod ? (
              <div className="space-y-6">
                {/* Period Info & Actions */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Period: {selectedPeriod.period}</h3>
                      <p className="text-sm text-gray-500">{formatDate(selectedPeriod.start_date)} - {formatDate(selectedPeriod.end_date)}</p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-sm font-semibold capitalize ${getStatusBadge(selectedPeriod.status)}`}>
                      {selectedPeriod.status}
                    </span>
                  </div>
                  
                  <div className="flex gap-3">
                    {selectedPeriod.status === 'open' && (
                      <>
                        <button
                          onClick={handleAutoClose}
                          disabled={isProcessing}
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Zap className="h-4 w-4" />
                          )}
                          {isProcessing ? 'Processing...' : 'Auto-Close Period'}
                        </button>
                        <button
                          onClick={handleStartClose}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                          <Play className="h-4 w-4" />
                          Manual Close
                        </button>
                      </>
                    )}
                    
                    {selectedPeriod.status === 'closing' && (
                      <>
                        <button
                          onClick={handleAutoClose}
                          disabled={isProcessing}
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Zap className="h-4 w-4" />
                          )}
                          Re-run Auto-Close
                        </button>
                        <button
                          onClick={handleCompleteClose}
                          disabled={!allPassed}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                            allPassed 
                              ? 'bg-green-600 text-white hover:bg-green-700' 
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <Lock className="h-4 w-4" />
                          Lock Books
                        </button>
                      </>
                    )}
                    
                    {selectedPeriod.status === 'closed' && (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Lock className="h-5 w-5" />
                        <span>Period closed on {formatDate(selectedPeriod.closed_at)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Auto-Close Result */}
                {autoCloseResult && (
                  <div className={`bg-white rounded-xl border ${autoCloseResult.can_close ? 'border-green-200' : 'border-amber-200'} overflow-hidden`}>
                    <div className={`px-5 py-4 ${autoCloseResult.can_close ? 'bg-green-50' : 'bg-amber-50'} border-b ${autoCloseResult.can_close ? 'border-green-200' : 'border-amber-200'}`}>
                      <div className="flex items-center gap-2">
                        {autoCloseResult.can_close ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-amber-600" />
                        )}
                        <h3 className="font-semibold text-gray-900">
                          {autoCloseResult.can_close ? 'Period Closed Successfully' : 'Period Close Blocked'}
                        </h3>
                      </div>
                    </div>

                    <div className="p-5">
                      {/* Checklist Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {autoCloseItems.map(item => {
                          const passed = autoCloseResult.checklist?.[item.key];
                          const Icon = item.icon;
                          return (
                            <div
                              key={item.key}
                              className={`flex items-center gap-3 p-3 rounded-lg border ${
                                passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                              }`}
                            >
                              <div className={`p-2 rounded-lg ${passed ? 'bg-green-100' : 'bg-red-100'}`}>
                                <Icon className={`h-4 w-4 ${passed ? 'text-green-600' : 'text-red-600'}`} />
                              </div>
                              <div>
                                <p className={`font-medium text-sm ${passed ? 'text-green-800' : 'text-red-800'}`}>
                                  {item.name}
                                </p>
                                <p className="text-xs text-gray-500">{item.description}</p>
                              </div>
                              {passed ? (
                                <CheckCircle className="h-5 w-5 text-green-600 ml-auto" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-600 ml-auto" />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Errors */}
                      {autoCloseResult.errors?.length > 0 && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                          <h4 className="font-medium text-red-800 mb-2">Blocking Issues:</h4>
                          <ul className="space-y-1">
                            {autoCloseResult.errors.map((error, idx) => (
                              <li key={idx} className="text-sm text-red-700 flex items-start gap-2">
                                <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                {error}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Manual Checklist (when in closing state) */}
                {(selectedPeriod.status === 'closing' || selectedPeriod.status === 'open') && !autoCloseResult && (
                  <div className="bg-white rounded-xl border border-gray-200">
                    <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Close Checklist</h3>
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                        allPassed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {allPassed ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                        {allPassed ? 'Ready to Close' : 'Pending Items'}
                      </div>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {Object.entries(checklistModules).map(([moduleKey, module]) => (
                        <div key={moduleKey} className="p-5">
                          <h4 className="font-medium text-gray-900 mb-3">{module.name}</h4>
                          <div className="space-y-2">
                            {module.checks?.map((check, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  {check.passed ? (
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                  ) : (
                                    <XCircle className="h-5 w-5 text-red-600" />
                                  )}
                                  <span className="text-sm text-gray-700">{check.name}</span>
                                </div>
                                {check.count !== undefined && check.count > 0 && (
                                  <span className="text-sm text-red-600 font-medium">{check.count} pending</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      {Object.keys(checklistModules).length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                          <RefreshCw className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p>Run Auto-Close to generate checklist</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Financial Statements Preview */}
                {selectedPeriod.status === 'closed' && (
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Financial Statements</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <button 
                        onClick={() => navigate(`/ib-finance/close/statements/${selectedPeriod.period}`)}
                        className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <FileText className="h-6 w-6 text-indigo-600" />
                        <div className="text-left">
                          <p className="font-medium text-gray-900">Profit & Loss</p>
                          <p className="text-xs text-gray-500">Income Statement</p>
                        </div>
                      </button>
                      <button 
                        onClick={() => navigate(`/ib-finance/close/statements/${selectedPeriod.period}`)}
                        className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <FileText className="h-6 w-6 text-emerald-600" />
                        <div className="text-left">
                          <p className="font-medium text-gray-900">Balance Sheet</p>
                          <p className="text-xs text-gray-500">Financial Position</p>
                        </div>
                      </button>
                      <button 
                        onClick={() => navigate(`/ib-finance/close/statements/${selectedPeriod.period}`)}
                        className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <FileText className="h-6 w-6 text-blue-600" />
                        <div className="text-left">
                          <p className="font-medium text-gray-900">Cash Flow</p>
                          <p className="text-xs text-gray-500">Statement</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
                Select a period to view close checklist
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloseDashboard;
