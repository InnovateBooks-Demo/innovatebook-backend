import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FileText,
  ArrowLeft,
  Download,
  Printer,
  TrendingUp,
  TrendingDown,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { authService } from "../../../utils/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const FinancialStatements = () => {
  const navigate = useNavigate();
  const { period } = useParams();
  const [activeTab, setActiveTab] = useState("pnl");
  const [pnlData, setPnlData] = useState(null);
  const [balanceSheet, setBalanceSheet] = useState(null);
  const [cashFlow, setCashFlow] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentPeriod = period || new Date().toISOString().slice(0, 7);

  useEffect(() => {
    fetchAllStatements();
  }, [currentPeriod]);

  const fetchAllStatements = async () => {
    setLoading(true);
    try {
      const token = authService.getToken();
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all three statements in parallel
      const [pnlRes, bsRes, cfRes] = await Promise.all([
        fetch(
          `${API_URL}/api/ib-finance/statements/profit-loss?period=${currentPeriod}`,
          { headers },
        ),
        fetch(
          `${API_URL}/api/ib-finance/statements/balance-sheet?period=${currentPeriod}`,
          { headers },
        ),
        fetch(
          `${API_URL}/api/ib-finance/statements/cash-flow?period=${currentPeriod}`,
          { headers },
        ),
      ]);

      if (pnlRes.ok) {
        const data = await pnlRes.json();
        setPnlData(data.data);
      }
      if (bsRes.ok) {
        const data = await bsRes.json();
        setBalanceSheet(data.data);
      }
      if (cfRes.ok) {
        const data = await cfRes.json();
        setCashFlow(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch financial statements");
      toast.error("Failed to load financial statements");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatPeriodDisplay = (p) => {
    if (!p) return "Current Period";
    const [year, month] = p.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const tabs = [
    { id: "pnl", label: "Profit & Loss", icon: TrendingUp },
    { id: "balance", label: "Balance Sheet", icon: BarChart3 },
    { id: "cashflow", label: "Cash Flow", icon: TrendingDown },
  ];

  const handleExportPDF = async () => {
    const token = authService.getToken();
    let endpoint = "";
    let filename = "";

    switch (activeTab) {
      case "pnl":
        endpoint = `/api/ib-finance/export/profit-loss/${currentPeriod}`;
        filename = `ProfitLoss_${currentPeriod}.html`;
        break;
      case "balance":
        endpoint = `/api/ib-finance/export/balance-sheet/${currentPeriod}`;
        filename = `BalanceSheet_${currentPeriod}.html`;
        break;
      case "cashflow":
        endpoint = `/api/ib-finance/export/cash-flow/${currentPeriod}`;
        filename = `CashFlow_${currentPeriod}.html`;
        break;
      default:
        return;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Report downloaded successfully");
      } else {
        toast.error("Failed to export report");
      }
    } catch (error) {
      toast.error("Failed to export report");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div
        className="min-h-screen bg-gray-50 flex items-center justify-center"
        data-testid="financial-statements-loading"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading financial statements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="financial-statements">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate("/ib-finance/close")}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-500">
              IB Finance → Close → Financial Statements
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center">
                <FileText className="h-7 w-7 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Financial Statements
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Period: {formatPeriodDisplay(currentPeriod)}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchAllStatements}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4" /> Refresh
              </button>
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Download className="h-4 w-4" /> Export PDF
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <Printer className="h-4 w-4" /> Print
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              data-testid={`tab-${tab.id}`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profit & Loss */}
        {activeTab === "pnl" && pnlData && (
          <div
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            data-testid="pnl-statement"
          >
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 text-white">
              <h2 className="text-lg font-semibold">Profit & Loss Statement</h2>
              <p className="text-sm text-white/80">
                For the period ending {formatPeriodDisplay(currentPeriod)}
              </p>
            </div>
            <div className="p-6">
              {/* Revenue */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Revenue
                </h3>
                <div className="space-y-2">
                  {pnlData.revenue?.length > 0 ? (
                    pnlData.revenue.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between py-2 border-b border-gray-100"
                      >
                        <span className="text-gray-700">{item.name}</span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic py-2">
                      No revenue recorded for this period
                    </p>
                  )}
                  <div className="flex justify-between py-2 bg-green-50 px-3 rounded-lg">
                    <span className="font-semibold text-green-700">
                      Total Revenue
                    </span>
                    <span className="font-bold text-green-700">
                      {formatCurrency(pnlData.total_revenue)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Expenses */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Expenses
                </h3>
                <div className="space-y-2">
                  {pnlData.expenses?.length > 0 ? (
                    pnlData.expenses.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between py-2 border-b border-gray-100"
                      >
                        <span className="text-gray-700">{item.name}</span>
                        <span className="font-medium text-red-600">
                          ({formatCurrency(item.amount)})
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic py-2">
                      No expenses recorded for this period
                    </p>
                  )}
                  <div className="flex justify-between py-2 bg-red-50 px-3 rounded-lg">
                    <span className="font-semibold text-red-700">
                      Total Expenses
                    </span>
                    <span className="font-bold text-red-700">
                      ({formatCurrency(pnlData.total_expenses)})
                    </span>
                  </div>
                </div>
              </div>

              {/* Net Income */}
              <div
                className={`flex justify-between py-4 px-4 rounded-xl ${pnlData.net_income >= 0 ? "bg-green-100" : "bg-red-100"}`}
              >
                <span
                  className={`text-lg font-bold ${pnlData.net_income >= 0 ? "text-green-800" : "text-red-800"}`}
                >
                  Net Income
                </span>
                <span
                  className={`text-2xl font-bold ${pnlData.net_income >= 0 ? "text-green-800" : "text-red-800"}`}
                >
                  {formatCurrency(pnlData.net_income)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Balance Sheet */}
        {activeTab === "balance" && balanceSheet && (
          <div className="grid grid-cols-2 gap-6" data-testid="balance-sheet">
            {/* Assets */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-600 px-6 py-4 text-white">
                <h2 className="text-lg font-semibold">Assets</h2>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Current Assets
                  </h3>
                  <div className="space-y-2">
                    {balanceSheet.assets?.current?.length > 0 ? (
                      balanceSheet.assets.current.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between py-2 border-b border-gray-100"
                        >
                          <span className="text-gray-700">{item.name}</span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(item.amount)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 italic py-2">
                        No current assets
                      </p>
                    )}
                    <div className="flex justify-between py-2 bg-[rgba(3,63,153,0.08)] px-3 rounded-lg">
                      <span className="font-semibold text-blue-700">
                        Total Current Assets
                      </span>
                      <span className="font-bold text-blue-700">
                        {formatCurrency(balanceSheet.assets?.total_current)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Non-Current Assets
                  </h3>
                  <div className="space-y-2">
                    {balanceSheet.assets?.non_current?.length > 0 ? (
                      balanceSheet.assets.non_current.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between py-2 border-b border-gray-100"
                        >
                          <span className="text-gray-700">{item.name}</span>
                          <span
                            className={`font-medium ${item.amount < 0 ? "text-red-600" : "text-gray-900"}`}
                          >
                            {item.amount < 0
                              ? `(${formatCurrency(Math.abs(item.amount))})`
                              : formatCurrency(item.amount)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 italic py-2">
                        No non-current assets
                      </p>
                    )}
                    <div className="flex justify-between py-2 bg-[rgba(3,63,153,0.08)] px-3 rounded-lg">
                      <span className="font-semibold text-blue-700">
                        Total Non-Current Assets
                      </span>
                      <span className="font-bold text-blue-700">
                        {formatCurrency(balanceSheet.assets?.total_non_current)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between py-4 px-4 rounded-xl bg-blue-100">
                  <span className="text-lg font-bold text-blue-800">
                    Total Assets
                  </span>
                  <span className="text-2xl font-bold text-blue-800">
                    {formatCurrency(balanceSheet.assets?.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Liabilities & Equity */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-4 text-white">
                <h2 className="text-lg font-semibold">Liabilities & Equity</h2>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Current Liabilities
                  </h3>
                  <div className="space-y-2">
                    {balanceSheet.liabilities?.current?.length > 0 ? (
                      balanceSheet.liabilities.current.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between py-2 border-b border-gray-100"
                        >
                          <span className="text-gray-700">{item.name}</span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(item.amount)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 italic py-2">
                        No current liabilities
                      </p>
                    )}
                    <div className="flex justify-between py-2 bg-purple-50 px-3 rounded-lg">
                      <span className="font-semibold text-purple-700">
                        Total Liabilities
                      </span>
                      <span className="font-bold text-purple-700">
                        {formatCurrency(balanceSheet.liabilities?.total)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Equity
                  </h3>
                  <div className="space-y-2">
                    {balanceSheet.equity?.length > 0 ? (
                      balanceSheet.equity.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between py-2 border-b border-gray-100"
                        >
                          <span className="text-gray-700">{item.name}</span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(item.amount)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 italic py-2">
                        No equity recorded
                      </p>
                    )}
                    <div className="flex justify-between py-2 bg-purple-50 px-3 rounded-lg">
                      <span className="font-semibold text-purple-700">
                        Total Equity
                      </span>
                      <span className="font-bold text-purple-700">
                        {formatCurrency(balanceSheet.total_equity)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between py-4 px-4 rounded-xl bg-purple-100">
                  <span className="text-lg font-bold text-purple-800">
                    Total Liab. & Equity
                  </span>
                  <span className="text-2xl font-bold text-purple-800">
                    {formatCurrency(balanceSheet.total_liabilities_equity)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cash Flow */}
        {activeTab === "cashflow" && cashFlow && (
          <div
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            data-testid="cash-flow-statement"
          >
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4 text-white">
              <h2 className="text-lg font-semibold">Cash Flow Statement</h2>
              <p className="text-sm text-white/80">
                For the period ending {formatPeriodDisplay(currentPeriod)}
              </p>
            </div>
            <div className="p-6">
              {/* Operating Activities */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Operating Activities
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-700">Net Income</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(cashFlow.operating?.net_income)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-700">Add: Depreciation</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(cashFlow.operating?.depreciation)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-700">Change in Receivables</span>
                    <span
                      className={`font-medium ${cashFlow.operating?.receivables_change < 0 ? "text-red-600" : "text-gray-900"}`}
                    >
                      {cashFlow.operating?.receivables_change < 0
                        ? `(${formatCurrency(Math.abs(cashFlow.operating?.receivables_change))})`
                        : formatCurrency(
                            cashFlow.operating?.receivables_change,
                          )}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-700">Change in Payables</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(cashFlow.operating?.payables_change)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 bg-emerald-50 px-3 rounded-lg">
                    <span className="font-semibold text-emerald-700">
                      Net Cash from Operations
                    </span>
                    <span
                      className={`font-bold ${cashFlow.operating?.total >= 0 ? "text-emerald-700" : "text-red-600"}`}
                    >
                      {formatCurrency(cashFlow.operating?.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Investing Activities */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Investing Activities
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-700">
                      Purchase of Fixed Assets
                    </span>
                    <span className="font-medium text-red-600">
                      (
                      {formatCurrency(
                        Math.abs(cashFlow.investing?.asset_purchases || 0),
                      )}
                      )
                    </span>
                  </div>
                  <div className="flex justify-between py-2 bg-emerald-50 px-3 rounded-lg">
                    <span className="font-semibold text-emerald-700">
                      Net Cash from Investing
                    </span>
                    <span
                      className={`font-bold ${cashFlow.investing?.total >= 0 ? "text-emerald-700" : "text-red-600"}`}
                    >
                      {cashFlow.investing?.total < 0
                        ? `(${formatCurrency(Math.abs(cashFlow.investing?.total))})`
                        : formatCurrency(cashFlow.investing?.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Financing Activities */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Financing Activities
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-700">
                      Capital Contributions / (Distributions)
                    </span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(cashFlow.financing?.total)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 bg-emerald-50 px-3 rounded-lg">
                    <span className="font-semibold text-emerald-700">
                      Net Cash from Financing
                    </span>
                    <span className="font-bold text-emerald-700">
                      {formatCurrency(cashFlow.financing?.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div
                className={`flex justify-between py-4 px-4 rounded-xl ${cashFlow.net_change >= 0 ? "bg-emerald-100" : "bg-red-100"}`}
              >
                <span
                  className={`text-lg font-bold ${cashFlow.net_change >= 0 ? "text-emerald-800" : "text-red-800"}`}
                >
                  Net Change in Cash
                </span>
                <span
                  className={`text-2xl font-bold ${cashFlow.net_change >= 0 ? "text-emerald-800" : "text-red-800"}`}
                >
                  {formatCurrency(cashFlow.net_change)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialStatements;
