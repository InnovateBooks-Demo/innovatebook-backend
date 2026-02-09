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

const CashFlowStatementReport = () => {
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

  const renderActivity = (title, inflows, outflows, net, color) => {
    return (
      <div className="mb-8">
        <h3
          className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2"
          style={{ borderColor: color }}
        >
          {title}
        </h3>

        {/* Inflows */}
        {inflows.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-600 mb-2">
              Cash Inflows:
            </p>
            <div className="space-y-2">
              {inflows.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center py-2 px-4 bg-green-50 rounded"
                >
                  <span className="text-sm text-gray-700">
                    {item.description}
                  </span>
                  <span className="text-sm font-semibold text-green-600">
                    +{formatCurrency(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Outflows */}
        {outflows.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-600 mb-2">
              Cash Outflows:
            </p>
            <div className="space-y-2">
              {outflows.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center py-2 px-4 bg-red-50 rounded"
                >
                  <span className="text-sm text-gray-700">
                    {item.description}
                  </span>
                  <span className="text-sm font-semibold text-red-600">
                    -{formatCurrency(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Net */}
        <div
          className="flex justify-between items-center mt-4 pt-4 border-t-2 px-4"
          style={{ borderColor: color }}
        >
          <span className="text-base font-bold text-gray-900">
            Net Cash from {title}
          </span>
          <span
            className={`text-xl font-bold ${net >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {formatCurrency(net)}
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
                    Direct Method - Companies Act 2013
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
                  <strong>Period:</strong> {data.period.from} to{" "}
                  {data.period.to}
                </div>
                <div className="text-sm text-purple-700">Direct Method</div>
              </div>
            </Card>

            {/* Main Statement */}
            <Card className="p-8 bg-white border-0 shadow-lg">
              {renderActivity(
                "Operating Activities",
                data.operating_activities.inflows,
                data.operating_activities.outflows,
                data.operating_activities.net,
                "#8b5cf6",
              )}

              {renderActivity(
                "Investing Activities",
                data.investing_activities.inflows,
                data.investing_activities.outflows,
                data.investing_activities.net,
                "#06b6d4",
              )}

              {renderActivity(
                "Financing Activities",
                data.financing_activities.inflows,
                data.financing_activities.outflows,
                data.financing_activities.net,
                "#f59e0b",
              )}

              {/* Summary */}
              <div className="mt-8 space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-100 rounded-lg">
                  <span className="text-base font-semibold text-gray-900">
                    Opening Cash Balance
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(data.opening_cash)}
                  </span>
                </div>

                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-base font-semibold text-blue-900">
                    Net Change in Cash
                  </span>
                  <span
                    className={`text-lg font-bold ${data.net_change >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {data.net_change >= 0 ? "+" : ""}
                    {formatCurrency(data.net_change)}
                  </span>
                </div>

                <div className="flex justify-between items-center p-6 bg-gradient-to-r from-purple-100 to-[#C4D9F4] rounded-xl border-2 border-purple-300">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center">
                      {data.closing_cash >= 0 ? (
                        <TrendingUp className="h-6 w-6 text-white" />
                      ) : (
                        <TrendingDown className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <span className="text-lg font-bold text-purple-900">
                      Closing Cash Balance
                    </span>
                  </div>
                  <span className="text-3xl font-bold text-purple-700">
                    {formatCurrency(data.closing_cash)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <Card className="p-4 bg-white border-0 shadow-md">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Operating</p>
                  <p
                    className={`text-xl font-bold ${data.operating_activities.net >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {formatCurrency(data.operating_activities.net)}
                  </p>
                </div>
              </Card>

              <Card className="p-4 bg-white border-0 shadow-md">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Investing</p>
                  <p
                    className={`text-xl font-bold ${data.investing_activities.net >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {formatCurrency(data.investing_activities.net)}
                  </p>
                </div>
              </Card>

              <Card className="p-4 bg-white border-0 shadow-md">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Financing</p>
                  <p
                    className={`text-xl font-bold ${data.financing_activities.net >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {formatCurrency(data.financing_activities.net)}
                  </p>
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CashFlowStatementReport;
