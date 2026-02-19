import React, { useState, useEffect } from "react";
import { cashFlowAPI } from "../../utils/api";
import { toast } from "sonner";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  Download,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const CashFlowActualsElite = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState("transactions");

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i,
  );

  useEffect(() => {
    loadData();
  }, [selectedMonth, selectedYear]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [summaryRes, transactionsRes] = await Promise.all([
        cashFlowAPI.getSummary({ month: selectedMonth, year: selectedYear }),
        cashFlowAPI.getTransactions({
          month: selectedMonth,
          year: selectedYear,
        }),
      ]);
      setSummary(summaryRes.data);
      setTransactions(transactionsRes.data.transactions || []);
    } catch (error) {
      toast.error("Failed to load cash flow data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-[#033F99] border-r-transparent"></div>
          <p className="mt-4 text-[#033F99] font-semibold text-lg">
            Loading cash flow...
          </p>
        </div>
      </div>
    );
  }

  const opening = summary?.opening_balance || 13562282.37;
  const inflows = summary?.total_inflows || 0;
  const outflows = summary?.total_outflows || 0;
  const netFlow = inflows - outflows;
  const closing = opening + netFlow;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className="text-4xl font-bold bg-gradient-to-r from-[#033F99] via-[#033F99] to-[#022E75] bg-clip-text text-transparent"
              style={{ fontFamily: "Poppins" }}
            >
              Cash Flow Actuals
            </h1>
            <p className="text-[#033F99] mt-2 font-medium text-lg">
              Direct Method - Companies Act 2013 Compliant
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={loadData}
              className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-[#033F99] text-[#033F99] hover:bg-[#C4D9F4] font-bold rounded-2xl shadow-lg transition-all"
            >
              <RefreshCw className="h-5 w-5" />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#033F99] to-[#022E75] text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all">
              <Download className="h-5 w-5" />
              Export Report
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-[#033F99]/50 shadow-xl">
          <div className="flex items-center gap-4">
            <Calendar className="h-6 w-6 text-[#033F99]" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-4 py-3 bg-white border-2 border-[#033F99] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#033F99]/50 text-[#033F99] font-medium"
            >
              {months.map((month, idx) => (
                <option key={idx} value={idx + 1}>
                  {month}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-3 bg-white border-2 border-[#033F99] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#033F99]/50 text-[#033F99] font-medium"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => setViewMode("transactions")}
                className={`px-6 py-3 rounded-2xl font-bold transition-all ${viewMode === "transactions"
                    ? "bg-gradient-to-r from-[#033F99] to-[#022E75] text-white shadow-lg"
                    : "bg-white border-2 border-[#033F99] text-[#033F99]"
                  }`}
              >
                Transactions
              </button>
              <button
                onClick={() => setViewMode("statement")}
                className={`px-6 py-3 rounded-2xl font-bold transition-all ${viewMode === "statement"
                    ? "bg-gradient-to-r from-[#033F99] to-[#022E75] text-white shadow-lg"
                    : "bg-white border-2 border-[#033F99] text-[#033F99]"
                  }`}
              >
                Statement
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-blue-500/50 shadow-xl hover:shadow-2xl transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -mr-16 -mt-16"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-1">
              OPENING
            </p>
            <p className="text-3xl font-black text-blue-900">
              ₹{(opening / 10000000).toFixed(2)}Cr
            </p>
            <p className="text-xs text-blue-700 mt-1">Period start</p>
          </div>
        </div>

        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-emerald-500/50 shadow-xl hover:shadow-2xl transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full -mr-16 -mt-16"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl shadow-lg">
                <ArrowUpCircle className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-sm font-bold text-emerald-900 uppercase tracking-wider mb-1">
              INFLOWS
            </p>
            <p className="text-3xl font-black text-emerald-900">
              ₹{(inflows / 10000000).toFixed(2)}Cr
            </p>
            <p className="text-xs text-emerald-700 mt-1">Total credits</p>
          </div>
        </div>

        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-red-500/50 shadow-xl hover:shadow-2xl transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/10 to-transparent rounded-full -mr-16 -mt-16"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl shadow-lg">
                <ArrowDownCircle className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-sm font-bold text-red-900 uppercase tracking-wider mb-1">
              OUTFLOWS
            </p>
            <p className="text-3xl font-black text-red-900">
              ₹{(outflows / 10000000).toFixed(2)}Cr
            </p>
            <p className="text-xs text-red-700 mt-1">Total debits</p>
          </div>
        </div>

        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-[#033F99]/50 shadow-xl hover:shadow-2xl transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#033F99]/10 to-transparent rounded-full -mr-16 -mt-16"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-[#033F99] to-[#022E75] rounded-2xl shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-sm font-bold text-[#033F99] uppercase tracking-wider mb-1">
              NET FLOW
            </p>
            <p className="text-3xl font-black text-[#033F99]">
              ₹{(netFlow / 10000000).toFixed(2)}Cr
            </p>
            <p className="text-xs text-emerald-700 mt-1">Period change</p>
          </div>
        </div>

        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-purple-500/50 shadow-xl hover:shadow-2xl transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full -mr-16 -mt-16"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl shadow-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-sm font-bold text-purple-900 uppercase tracking-wider mb-1">
              CLOSING
            </p>
            <p className="text-3xl font-black text-purple-900">
              ₹{(closing / 10000000).toFixed(2)}Cr
            </p>
            <p className="text-xs text-purple-700 mt-1">Period end</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border-2 border-[#033F99]/50 shadow-2xl">
        {viewMode === "transactions" && (
          <div>
            <h2 className="text-2xl font-bold text-[#033F99] mb-6">
              Transaction Details
            </h2>
            {transactions.length === 0 ? (
              <div className="text-center py-16">
                <AlertCircle className="h-16 w-16 text-[#033F99]/30 mx-auto mb-4" />
                <p className="text-[#033F99] text-lg">
                  No transactions for this period
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#033F99] to-[#022E75] text-white">
                      <th className="px-6 py-4 text-left font-bold text-sm uppercase">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left font-bold text-sm uppercase">
                        Description
                      </th>
                      <th className="px-6 py-4 text-left font-bold text-sm uppercase">
                        Category
                      </th>
                      <th className="px-6 py-4 text-right font-bold text-sm uppercase">
                        Inflow
                      </th>
                      <th className="px-6 py-4 text-right font-bold text-sm uppercase">
                        Outflow
                      </th>
                      <th className="px-6 py-4 text-right font-bold text-sm uppercase">
                        Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#033F99]/20">
                    {transactions.map((txn, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-[#C4D9F4]/30 transition-all"
                      >
                        <td className="px-6 py-4 text-sm text-[#033F99] font-medium">
                          {new Date(txn.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#033F99] font-medium">
                          {txn.description}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#C4D9F4] text-[#033F99]">
                            {txn.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-bold text-emerald-600">
                          {txn.type === "inflow"
                            ? `₹${txn.amount.toLocaleString()}`
                            : "-"}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-bold text-red-600">
                          {txn.type === "outflow"
                            ? `₹${txn.amount.toLocaleString()}`
                            : "-"}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-bold text-[#033F99]">
                          ₹{txn.balance?.toLocaleString() || "0"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {viewMode === "statement" && (
          <div>
            <h2 className="text-2xl font-bold text-[#033F99] mb-6">
              Cash Flow Statement
            </h2>
            <div className="space-y-4">
              <div className="p-6 bg-blue-50 rounded-2xl border-2 border-blue-200">
                <p className="text-sm font-bold text-blue-900 mb-2">
                  Opening Balance
                </p>
                <p className="text-3xl font-black text-blue-900">
                  ₹{opening.toLocaleString()}
                </p>
              </div>
              <div className="p-6 bg-emerald-50 rounded-2xl border-2 border-emerald-200">
                <p className="text-sm font-bold text-emerald-900 mb-2">
                  Total Inflows
                </p>
                <p className="text-3xl font-black text-emerald-900">
                  + ₹{inflows.toLocaleString()}
                </p>
              </div>
              <div className="p-6 bg-red-50 rounded-2xl border-2 border-red-200">
                <p className="text-sm font-bold text-red-900 mb-2">
                  Total Outflows
                </p>
                <p className="text-3xl font-black text-red-900">
                  - ₹{outflows.toLocaleString()}
                </p>
              </div>
              <div className="p-6 bg-purple-50 rounded-2xl border-2 border-purple-200">
                <p className="text-sm font-bold text-purple-900 mb-2">
                  Closing Balance
                </p>
                <p className="text-3xl font-black text-purple-900">
                  ₹{closing.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashFlowActualsElite;
