import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getAuthHeaders } from "../utils/auth";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import {
  ArrowLeft,
  TrendingUp,
  Download,
  Calendar,
  Loader2,
  TrendingDown,
  DollarSign,
  Activity,
} from "lucide-react";

const ProfitLoss = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().getFullYear(), 0, 1)
      .toISOString()
      .split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      setLoading(true);
      const backendUrl = process.env.REACT_APP_BACKEND_URL || "";
      const response = await axios.get(
        `${backendUrl}/api/reports/profit-loss`,
        {
          params: dateRange,
          headers: getAuthHeaders(),
        },
      );
      setData(response.data);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load P&L statement");
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const renderSection = (title, items, total, isExpense = false) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 pb-2 border-b border-gray-300">
          {title}
        </h3>
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center py-2 px-4 bg-gray-50 rounded"
            >
              <span className="text-sm text-gray-700">{item.account}</span>
              <span
                className={`text-sm font-semibold ${isExpense ? "text-red-600" : "text-green-600"}`}
              >
                {formatCurrency(item.amount)}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-300 px-4">
          <span className="text-sm font-bold text-gray-900">Total {title}</span>
          <span
            className={`text-base font-bold ${isExpense ? "text-red-600" : "text-green-600"}`}
          >
            {formatCurrency(total)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/financial-reporting")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="h-8 w-px bg-gray-300" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-[#3A4E63] flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1
                    className="text-2xl font-bold text-gray-900"
                    style={{
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: 600,
                    }}
                  >
                    Profit & Loss Statement
                  </h1>
                  <p
                    className="text-sm text-gray-500"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Income Statement for the period
                  </p>
                </div>
              </div>
            </div>
            <Button variant="outline" className="gap-2" disabled={!data}>
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-8 py-8">
        {/* Filters */}
        <Card className="p-6 mb-6 bg-white border-0 shadow-md">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                From Date
              </Label>
              <Input
                type="date"
                value={dateRange.start_date}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start_date: e.target.value })
                }
              />
            </div>
            <div className="flex-1">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                To Date
              </Label>
              <Input
                type="date"
                value={dateRange.end_date}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end_date: e.target.value })
                }
              />
            </div>
            <Button
              onClick={loadReport}
              disabled={loading}
              style={{ backgroundColor: "#3A4E63" }}
              className="text-white"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Calendar className="h-4 w-4 mr-2" />
              )}
              Generate Report
            </Button>
          </div>
        </Card>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#033F99]" />
          </div>
        )}

        {!loading && data && (
          <>
            {/* Period Info */}
            <Card className="p-4 mb-6 bg-[rgba(3,63,153,0.08)] border border-[rgba(3,63,153,0.25)]">
              <div className="flex items-center justify-between">
                <div
                  className="text-sm text-blue-900"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  <strong>Period:</strong> {data.period.from} to{" "}
                  {data.period.to}
                </div>
                <div className="text-sm text-blue-700">
                  Generated from Journal Entries
                </div>
              </div>
            </Card>

            {/* Main P&L */}
            <Card className="p-8 bg-white border-0 shadow-lg">
              {/* Revenue Section */}
              {renderSection("Revenue", data.revenue.items, data.revenue.total)}

              {/* COGS Section */}
              {renderSection(
                "Cost of Goods Sold",
                data.cogs.items,
                data.cogs.total,
                true,
              )}

              {/* Gross Profit */}
              <div className="my-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-green-900">
                    Gross Profit
                  </span>
                  <span className="text-xl font-bold text-green-700">
                    {formatCurrency(data.gross_profit)}
                  </span>
                </div>
              </div>

              {/* Operating Expenses */}
              {renderSection(
                "Operating Expenses",
                data.operating_expenses.items,
                data.operating_expenses.total,
                true,
              )}

              {/* Operating Profit */}
              <div className="my-6 p-4 bg-gradient-to-r from-blue-50 to-[#EBF3FC] rounded-lg border border-[rgba(3,63,153,0.25)]">
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-blue-900">
                    Operating Profit (EBIT)
                  </span>
                  <span className="text-xl font-bold text-blue-700">
                    {formatCurrency(data.operating_profit)}
                  </span>
                </div>
              </div>

              {/* Other Income/Expenses */}
              {renderSection(
                "Other Income",
                data.other_income.items,
                data.other_income.total,
              )}
              {renderSection(
                "Other Expenses",
                data.other_expenses.items,
                data.other_expenses.total,
                true,
              )}

              {/* Net Profit */}
              <div className="mt-8 p-6 bg-gradient-to-r from-purple-100 to-[#C4D9F4] rounded-xl border-2 border-purple-300">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center">
                      {data.net_profit >= 0 ? (
                        <TrendingUp className="h-6 w-6 text-white" />
                      ) : (
                        <TrendingDown className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-purple-700 font-medium">
                        Net Profit (After Tax)
                      </p>
                      <p className="text-xs text-purple-600">Bottom Line</p>
                    </div>
                  </div>
                  <span
                    className={`text-3xl font-bold ${data.net_profit >= 0 ? "text-green-700" : "text-red-700"}`}
                  >
                    {formatCurrency(data.net_profit)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <Card className="p-4 bg-white border-0 shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total Revenue</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(data.revenue.total)}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-green-600" />
                </div>
              </Card>

              <Card className="p-4 bg-white border-0 shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total Expenses</p>
                    <p className="text-lg font-bold text-red-600">
                      {formatCurrency(
                        data.cogs.total +
                          data.operating_expenses.total +
                          data.other_expenses.total,
                      )}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-red-600" />
                </div>
              </Card>

              <Card className="p-4 bg-white border-0 shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Net Margin</p>
                    <p className="text-lg font-bold text-purple-600">
                      {data.revenue.total > 0
                        ? (
                            (data.net_profit / data.revenue.total) *
                            100
                          ).toFixed(2)
                        : 0}
                      %
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-600" />
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfitLoss;
