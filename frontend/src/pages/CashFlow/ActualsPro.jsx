import React, { useState, useEffect } from "react";
import { cashFlowAPI } from "../../utils/api";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  Filter,
  Download,
  FileText,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const CashFlowActualsPro = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [statement, setStatement] = useState(null);
  const [charts, setCharts] = useState(null);

  // Filters
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState("transactions"); // 'transactions' or 'statement'

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
      const [summaryRes, transactionsRes, statementRes, chartsRes] =
        await Promise.all([
          cashFlowAPI.getSummary({ month: selectedMonth, year: selectedYear }),
          cashFlowAPI.getTransactions({
            month: selectedMonth,
            year: selectedYear,
          }),
          cashFlowAPI.getStatement({
            month: selectedMonth,
            year: selectedYear,
          }),
          cashFlowAPI.getCharts({ month: selectedMonth, year: selectedYear }),
        ]);

      setSummary(summaryRes.data);
      setTransactions(transactionsRes.data.transactions || []);
      setStatement(statementRes.data);
      setCharts(chartsRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load cash flow data:", error);
      toast.error("Failed to load cash flow data");
      setLoading(false);
    }
  };

  const formatCurrency = (amount) =>
    `₹${Math.abs(amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });

  const COLORS = ["#16a34a", "#dc2626", "#2563eb", "#f59e0b"];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p
            className="text-gray-600 text-sm font-medium"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Loading cash flow data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1
                className="text-3xl font-bold text-gray-900"
                style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
              >
                Cash Flow Actuals
              </h1>
              <p
                className="text-gray-600 mt-1"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Direct Method - Companies Act 2013 Compliant
              </p>
            </div>
            <Button
              variant="outline"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {months.map((month, index) => (
                  <option key={`item-${index}`} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="ml-auto flex gap-2">
              <Button
                variant={viewMode === "transactions" ? "default" : "outline"}
                onClick={() => setViewMode("transactions")}
                style={{
                  backgroundColor:
                    viewMode === "transactions" ? "#3A4E63" : "transparent",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                Transactions
              </Button>
              <Button
                variant={viewMode === "statement" ? "default" : "outline"}
                onClick={() => setViewMode("statement")}
                style={{
                  backgroundColor:
                    viewMode === "statement" ? "#3A4E63" : "transparent",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                <PieChartIcon className="h-4 w-4 mr-2" />
                Statement
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="p-6 bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <span
                className="text-xs font-semibold text-gray-500 uppercase tracking-wider"
                style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
              >
                Opening
              </span>
            </div>
            <p
              className="text-2xl font-bold text-gray-900"
              style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
            >
              {formatCurrency(summary?.opening_balance)}
            </p>
            <p
              className="text-sm text-gray-500 mt-1"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Period start
            </p>
          </Card>

          <Card className="p-6 bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600">
                <ArrowUpCircle className="h-6 w-6 text-white" />
              </div>
              <span
                className="text-xs font-semibold text-gray-500 uppercase tracking-wider"
                style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
              >
                Inflows
              </span>
            </div>
            <p
              className="text-2xl font-bold text-green-600"
              style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
            >
              {formatCurrency(summary?.inflows)}
            </p>
            <p
              className="text-sm text-gray-500 mt-1"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Total credits
            </p>
          </Card>

          <Card className="p-6 bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600">
                <ArrowDownCircle className="h-6 w-6 text-white" />
              </div>
              <span
                className="text-xs font-semibold text-gray-500 uppercase tracking-wider"
                style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
              >
                Outflows
              </span>
            </div>
            <p
              className="text-2xl font-bold text-red-600"
              style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
            >
              {formatCurrency(summary?.outflows)}
            </p>
            <p
              className="text-sm text-gray-500 mt-1"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Total debits
            </p>
          </Card>

          <Card className="p-6 bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div
                className={`p-3 rounded-xl bg-gradient-to-br ${(summary?.net_cash_flow || 0) >= 0 ? "from-green-500 to-green-600" : "from-red-500 to-red-600"}`}
              >
                {(summary?.net_cash_flow || 0) >= 0 ? (
                  <TrendingUp className="h-6 w-6 text-white" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-white" />
                )}
              </div>
              <span
                className="text-xs font-semibold text-gray-500 uppercase tracking-wider"
                style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
              >
                Net Flow
              </span>
            </div>
            <p
              className={`text-2xl font-bold ${(summary?.net_cash_flow || 0) >= 0 ? "text-green-600" : "text-red-600"}`}
              style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
            >
              {formatCurrency(summary?.net_cash_flow)}
            </p>
            <p
              className="text-sm text-gray-500 mt-1"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Period change
            </p>
          </Card>

          <Card className="p-6 bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <span
                className="text-xs font-semibold text-gray-500 uppercase tracking-wider"
                style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
              >
                Closing
              </span>
            </div>
            <p
              className="text-2xl font-bold text-gray-900"
              style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
            >
              {formatCurrency(summary?.closing_balance)}
            </p>
            <p
              className="text-sm text-gray-500 mt-1"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Period end
            </p>
          </Card>
        </div>

        {/* Charts Section */}
        {charts && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="p-6 bg-white border-0 shadow-md">
              <h2
                className="text-lg font-bold text-gray-900 mb-4"
                style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
              >
                Inflow vs Outflow Trend
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={charts.line_chart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontFamily: "Inter, sans-serif", fontSize: 12 }}
                  />
                  <YAxis
                    tick={{ fontFamily: "Inter, sans-serif", fontSize: 12 }}
                  />
                  <Tooltip contentStyle={{ fontFamily: "Inter, sans-serif" }} />
                  <Legend wrapperStyle={{ fontFamily: "Inter, sans-serif" }} />
                  <Line
                    type="monotone"
                    dataKey="inflow"
                    stroke="#16a34a"
                    strokeWidth={2}
                    name="Inflow"
                  />
                  <Line
                    type="monotone"
                    dataKey="outflow"
                    stroke="#dc2626"
                    strokeWidth={2}
                    name="Outflow"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6 bg-white border-0 shadow-md">
              <h2
                className="text-lg font-bold text-gray-900 mb-4"
                style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
              >
                Cash Flow by Category
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={charts.pie_chart}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {charts.pie_chart.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontFamily: "Inter, sans-serif" }} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}

        {/* Transactions Table or Statement */}
        {viewMode === "transactions" ? (
          <Card className="bg-white shadow-lg border-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <tr>
                    <th
                      className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider"
                      style={{
                        fontFamily: "Poppins, sans-serif",
                        fontWeight: 600,
                      }}
                    >
                      Date
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider"
                      style={{
                        fontFamily: "Poppins, sans-serif",
                        fontWeight: 600,
                      }}
                    >
                      Type
                    </th>
                    <th
                      className="px-6 py-4 text-right text-sm font-semibold uppercase tracking-wider"
                      style={{
                        fontFamily: "Poppins, sans-serif",
                        fontWeight: 600,
                      }}
                    >
                      Amount
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider"
                      style={{
                        fontFamily: "Poppins, sans-serif",
                        fontWeight: 600,
                      }}
                    >
                      Category
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider"
                      style={{
                        fontFamily: "Poppins, sans-serif",
                        fontWeight: 600,
                      }}
                    >
                      Subcategory
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider"
                      style={{
                        fontFamily: "Poppins, sans-serif",
                        fontWeight: 600,
                      }}
                    >
                      Counterparty
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider"
                      style={{
                        fontFamily: "Poppins, sans-serif",
                        fontWeight: 600,
                      }}
                    >
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn, index) => (
                    <tr
                      key={`item-${index}`}
                      className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                    >
                      <td className="px-6 py-4">
                        <span
                          className="text-sm text-gray-900 font-semibold"
                          style={{ fontFamily: "Inter, sans-serif" }}
                        >
                          {formatDate(txn.date)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${txn.type === "Inflow" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                          style={{ fontFamily: "Inter, sans-serif" }}
                        >
                          {txn.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`font-bold text-lg ${txn.type === "Inflow" ? "text-green-600" : "text-red-600"}`}
                          style={{ fontFamily: "Inter, sans-serif" }}
                        >
                          {formatCurrency(txn.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="text-sm text-gray-900"
                          style={{ fontFamily: "Inter, sans-serif" }}
                        >
                          {txn.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="text-sm text-gray-600"
                          style={{ fontFamily: "Inter, sans-serif" }}
                        >
                          {txn.subcategory}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="text-sm text-gray-900"
                          style={{ fontFamily: "Inter, sans-serif" }}
                        >
                          {txn.counterparty}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="text-sm text-gray-600"
                          style={{ fontFamily: "Inter, sans-serif" }}
                        >
                          {txn.description}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <Card className="p-8 bg-white border-0 shadow-lg">
            <h2
              className="text-2xl font-bold text-gray-900 mb-6"
              style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
            >
              Cash Flow Statement
            </h2>
            <p
              className="text-sm text-gray-600 mb-6"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              For the period: {months[selectedMonth - 1]} {selectedYear}
            </p>

            {statement && (
              <div className="space-y-8">
                {/* Operating Activities */}
                <div>
                  <h3
                    className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600"
                    style={{
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: 600,
                    }}
                  >
                    Operating Activities
                  </h3>
                  <div className="space-y-2 ml-4">
                    {Object.entries(
                      statement.statement?.["Operating Activities"] || {},
                    ).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between items-center py-2"
                      >
                        <span
                          className="text-gray-700"
                          style={{ fontFamily: "Inter, sans-serif" }}
                        >
                          {key}
                        </span>
                        <span
                          className={`font-bold ${value >= 0 ? "text-green-600" : "text-red-600"}`}
                          style={{ fontFamily: "Inter, sans-serif" }}
                        >
                          {value >= 0 ? "" : "-"}
                          {formatCurrency(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center py-3 mt-3 bg-blue-50 px-4 rounded">
                    <span
                      className="font-bold text-gray-900"
                      style={{
                        fontFamily: "Poppins, sans-serif",
                        fontWeight: 600,
                      }}
                    >
                      Net Cash from Operating Activities
                    </span>
                    <span
                      className={`font-bold text-xl ${(statement.summary?.operating_net || 0) >= 0 ? "text-green-600" : "text-red-600"}`}
                      style={{
                        fontFamily: "Poppins, sans-serif",
                        fontWeight: 600,
                      }}
                    >
                      {formatCurrency(statement.summary?.operating_net)}
                    </span>
                  </div>
                </div>

                {/* Investing Activities */}
                <div>
                  <h3
                    className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-purple-600"
                    style={{
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: 600,
                    }}
                  >
                    Investing Activities
                  </h3>
                  <div className="space-y-2 ml-4">
                    {Object.entries(
                      statement.statement?.["Investing Activities"] || {},
                    ).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between items-center py-2"
                      >
                        <span
                          className="text-gray-700"
                          style={{ fontFamily: "Inter, sans-serif" }}
                        >
                          {key}
                        </span>
                        <span
                          className={`font-bold ${value >= 0 ? "text-green-600" : "text-red-600"}`}
                          style={{ fontFamily: "Inter, sans-serif" }}
                        >
                          {value >= 0 ? "" : "-"}
                          {formatCurrency(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center py-3 mt-3 bg-purple-50 px-4 rounded">
                    <span
                      className="font-bold text-gray-900"
                      style={{
                        fontFamily: "Poppins, sans-serif",
                        fontWeight: 600,
                      }}
                    >
                      Net Cash from Investing Activities
                    </span>
                    <span
                      className={`font-bold text-xl ${(statement.summary?.investing_net || 0) >= 0 ? "text-green-600" : "text-red-600"}`}
                      style={{
                        fontFamily: "Poppins, sans-serif",
                        fontWeight: 600,
                      }}
                    >
                      {formatCurrency(statement.summary?.investing_net)}
                    </span>
                  </div>
                </div>

                {/* Financing Activities */}
                <div>
                  <h3
                    className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-[#3A4E63]"
                    style={{
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: 600,
                    }}
                  >
                    Financing Activities
                  </h3>
                  <div className="space-y-2 ml-4">
                    {Object.entries(
                      statement.statement?.["Financing Activities"] || {},
                    ).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between items-center py-2"
                      >
                        <span
                          className="text-gray-700"
                          style={{ fontFamily: "Inter, sans-serif" }}
                        >
                          {key}
                        </span>
                        <span
                          className={`font-bold ${value >= 0 ? "text-green-600" : "text-red-600"}`}
                          style={{ fontFamily: "Inter, sans-serif" }}
                        >
                          {value >= 0 ? "" : "-"}
                          {formatCurrency(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center py-3 mt-3 bg-[#EBF3FC] px-4 rounded">
                    <span
                      className="font-bold text-gray-900"
                      style={{
                        fontFamily: "Poppins, sans-serif",
                        fontWeight: 600,
                      }}
                    >
                      Net Cash from Financing Activities
                    </span>
                    <span
                      className={`font-bold text-xl ${(statement.summary?.financing_net || 0) >= 0 ? "text-green-600" : "text-red-600"}`}
                      style={{
                        fontFamily: "Poppins, sans-serif",
                        fontWeight: 600,
                      }}
                    >
                      {formatCurrency(statement.summary?.financing_net)}
                    </span>
                  </div>
                </div>

                {/* Net Increase */}
                <div className="pt-6 mt-6 border-t-2 border-gray-300">
                  <div className="flex justify-between items-center py-4 bg-gradient-to-r from-blue-50 to-[#EBF3FC] px-6 rounded-lg">
                    <span
                      className="text-xl font-bold text-gray-900"
                      style={{
                        fontFamily: "Poppins, sans-serif",
                        fontWeight: 600,
                      }}
                    >
                      Net Increase in Cash
                    </span>
                    <span
                      className={`text-3xl font-bold ${(statement.summary?.net_increase || 0) >= 0 ? "text-green-600" : "text-red-600"}`}
                      style={{
                        fontFamily: "Poppins, sans-serif",
                        fontWeight: 600,
                      }}
                    >
                      {formatCurrency(statement.summary?.net_increase)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default CashFlowActualsPro;
