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
  Activity,
  Download,
  Calendar,
  Loader2,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const CashFlowStatement = () => {
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
        `${backendUrl}/api/reports/cashflow-statement`,
        {
          params: dateRange,
          headers: getAuthHeaders(),
        },
      );
      setData(response.data);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load Cash Flow Statement");
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

  const renderSection = (title, items, total, color = "blue") => {
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
              <span className={`text-sm font-semibold text-${color}-600`}>
                {formatCurrency(item.amount)}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-300 px-4">
          <span className="text-sm font-bold text-gray-900">
            Net Cash from {title}
          </span>
          <span
            className={`text-base font-bold ${total >= 0 ? "text-green-600" : "text-red-600"}`}
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
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1
                    className="text-2xl font-bold text-gray-900"
                    style={{
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: 600,
                    }}
                  >
                    Cash Flow Statement
                  </h1>
                  <p
                    className="text-sm text-gray-500"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Statement of Cash Flows (as per Ind AS 7)
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
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        )}

        {!loading && data && (
          <>
            {/* Period Info */}
            <Card className="p-4 mb-6 bg-purple-50 border border-purple-200">
              <div className="flex items-center justify-between">
                <div
                  className="text-sm text-purple-900"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  <strong>Period:</strong> {data?.period?.from || "N/A"} to{" "}
                  {data?.period?.to || "N/A"}
                </div>
                <div className="text-sm text-purple-700">
                  Generated from Journal Entries
                </div>
              </div>
            </Card>

            {/* Opening Balance */}
            <Card className="p-6 mb-6 bg-gradient-to-r from-blue-50 to-[#EBF3FC] border border-blue-200">
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-blue-900">
                  Opening Cash Balance
                </span>
                <span className="text-2xl font-bold text-blue-700">
                  {formatCurrency(data?.opening_balance || 0)}
                </span>
              </div>
            </Card>

            {/* Main Cash Flow Statement */}
            <Card className="p-8 bg-white border-0 shadow-lg">
              {/* Operating Activities */}
              {data?.operating &&
                renderSection(
                  "Operating Activities",
                  data.operating.items || [],
                  data.operating.total || 0,
                  "green",
                )}

              {/* Investing Activities */}
              {data?.investing &&
                renderSection(
                  "Investing Activities",
                  data.investing.items || [],
                  data.investing.total || 0,
                  "blue",
                )}

              {/* Financing Activities */}
              {data?.financing &&
                renderSection(
                  "Financing Activities",
                  data.financing.items || [],
                  data.financing.total || 0,
                  "orange",
                )}

              {/* Net Change in Cash */}
              <div className="mt-8 p-6 bg-gradient-to-r from-purple-100 to-[#C4D9F4] rounded-xl border-2 border-purple-300">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-full ${(data?.net_change || 0) >= 0 ? "bg-green-600" : "bg-red-600"} flex items-center justify-center`}
                    >
                      {(data?.net_change || 0) >= 0 ? (
                        <TrendingUp className="h-6 w-6 text-white" />
                      ) : (
                        <TrendingDown className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-purple-700 font-medium">
                        Net Change in Cash
                      </p>
                      <p className="text-xs text-purple-600">For the period</p>
                    </div>
                  </div>
                  <span
                    className={`text-3xl font-bold ${(data?.net_change || 0) >= 0 ? "text-green-700" : "text-red-700"}`}
                  >
                    {formatCurrency(data?.net_change || 0)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Closing Balance */}
            <Card className="p-6 mt-6 bg-gradient-to-r from-[#EBF3FC] to-purple-50 border border-[#6B9FE6]">
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-white">
                  Closing Cash Balance
                </span>
                <span className="text-2xl font-bold text-[#3A4E63]">
                  {formatCurrency(data?.closing_balance || 0)}
                </span>
              </div>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4 mt-6">
              <Card className="p-4 bg-white border-0 shadow-md">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Operating</p>
                  <p
                    className={`text-lg font-bold ${(data?.operating?.total || 0) >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {formatCurrency(data?.operating?.total || 0)}
                  </p>
                </div>
              </Card>

              <Card className="p-4 bg-white border-0 shadow-md">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Investing</p>
                  <p
                    className={`text-lg font-bold ${(data?.investing?.total || 0) >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {formatCurrency(data?.investing?.total || 0)}
                  </p>
                </div>
              </Card>

              <Card className="p-4 bg-white border-0 shadow-md">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Financing</p>
                  <p
                    className={`text-lg font-bold ${(data?.financing?.total || 0) >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {formatCurrency(data?.financing?.total || 0)}
                  </p>
                </div>
              </Card>

              <Card className="p-4 bg-white border-0 shadow-md">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Net Change</p>
                  <p
                    className={`text-lg font-bold ${(data?.net_change || 0) >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {formatCurrency(data?.net_change || 0)}
                  </p>
                </div>
              </Card>
            </div>

            {/* Reconciliation Info */}
            <Card className="p-4 mt-6 bg-blue-50 border border-blue-200">
              <div
                className="text-xs text-blue-900"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                <strong>Reconciliation:</strong> Opening Balance (
                {formatCurrency(data?.opening_balance || 0)}) + Net Change (
                {formatCurrency(data?.net_change || 0)}) = Closing Balance (
                {formatCurrency(data?.closing_balance || 0)})
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default CashFlowStatement;
