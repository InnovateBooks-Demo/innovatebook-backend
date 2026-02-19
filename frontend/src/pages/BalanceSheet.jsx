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
  Scale,
  Download,
  Calendar,
  Loader2,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

const BalanceSheet = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [asOfDate, setAsOfDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      setLoading(true);
      const backendUrl = process.env.REACT_APP_BACKEND_URL || "";
      const response = await axios.get(
        `${backendUrl}/api/reports/balance-sheet`,
        {
          params: { as_of_date: asOfDate },
          headers: getAuthHeaders(),
        },
      );
      setData(response.data);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load Balance Sheet");
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
          <span className="text-sm font-bold text-gray-900">Total {title}</span>
          <span className={`text-base font-bold text-${color}-600`}>
            {formatCurrency(total)}
          </span>
        </div>
      </div>
    );
  };

  const isBalanced =
    data && Math.abs(data.assets.total - data.total_liabilities_equity) < 0.01;

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
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <Scale className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1
                    className="text-2xl font-bold text-gray-900"
                    style={{
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: 600,
                    }}
                  >
                    Balance Sheet
                  </h1>
                  <p
                    className="text-sm text-gray-500"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Statement of Financial Position
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
      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Filters */}
        <Card className="p-6 mb-6 bg-white border-0 shadow-md">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                As of Date
              </Label>
              <Input
                type="date"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
              />
            </div>
            <Button
              onClick={loadReport}
              disabled={loading}
              style={{ backgroundColor: "#033F99" }}
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
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          </div>
        )}

        {!loading && data && (
          <>
            {/* Period Info */}
            <Card className="p-4 mb-6 bg-green-50 border border-green-200">
              <div className="flex items-center justify-between">
                <div
                  className="text-sm text-green-900"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  <strong>As of Date:</strong> {data.as_of_date}
                </div>
                <div className="text-sm text-green-700">
                  Generated from Journal Entries
                </div>
              </div>
            </Card>

            {/* Balance Verification */}
            {!isBalanced && (
              <Card className="p-4 mb-6 bg-red-50 border border-red-200">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    Balance Sheet does not balance! Assets ≠ Liabilities +
                    Equity
                  </span>
                </div>
              </Card>
            )}

            <div className="grid grid-cols-2 gap-8">
              {/* Left Column - Assets */}
              <Card className="p-8 bg-white border-0 shadow-lg">
                <div className="mb-6">
                  <h2
                    className="text-2xl font-bold text-gray-900"
                    style={{
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: 600,
                    }}
                  >
                    Assets
                  </h2>
                </div>

                {renderSection(
                  "Current Assets",
                  data.assets.current_assets.items,
                  data.assets.current_assets.total,
                  "green",
                )}
                {renderSection(
                  "Non-Current Assets",
                  data.assets.non_current_assets.items,
                  data.assets.non_current_assets.total,
                  "green",
                )}

                <div className="mt-8 p-6 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl border-2 border-green-300">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-green-900">
                      Total Assets
                    </span>
                    <span className="text-3xl font-bold text-green-700">
                      {formatCurrency(data.assets.total)}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Right Column - Liabilities & Equity */}
              <Card className="p-8 bg-white border-0 shadow-lg">
                <div className="mb-6">
                  <h2
                    className="text-2xl font-bold text-gray-900"
                    style={{
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: 600,
                    }}
                  >
                    Liabilities & Equity
                  </h2>
                </div>

                {renderSection(
                  "Current Liabilities",
                  data.liabilities.current_liabilities.items,
                  data.liabilities.current_liabilities.total,
                  "red",
                )}
                {renderSection(
                  "Non-Current Liabilities",
                  data.liabilities.non_current_liabilities.items,
                  data.liabilities.non_current_liabilities.total,
                  "red",
                )}

                <div className="my-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-lg border border-red-200">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-red-900">
                      Total Liabilities
                    </span>
                    <span className="text-xl font-bold text-red-700">
                      {formatCurrency(data.liabilities.total)}
                    </span>
                  </div>
                </div>

                {renderSection(
                  "Equity",
                  data.equity.items,
                  data.equity.total,
                  "purple",
                )}

                <div className="mt-8 p-6 bg-gradient-to-r from-purple-100 to-[#C4D9F4] rounded-xl border-2 border-purple-300">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-purple-900">
                      Total Liabilities + Equity
                    </span>
                    <span className="text-3xl font-bold text-purple-700">
                      {formatCurrency(data.total_liabilities_equity)}
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Balance Indicator */}
            <Card
              className={`p-6 mt-8 ${isBalanced ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"} border-2`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full ${isBalanced ? "bg-green-600" : "bg-red-600"} flex items-center justify-center`}
                  >
                    {isBalanced ? (
                      <TrendingUp className="h-6 w-6 text-white" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-lg font-bold ${isBalanced ? "text-green-900" : "text-red-900"}`}
                    >
                      {isBalanced
                        ? "Balance Sheet is Balanced"
                        : "Balance Sheet is Not Balanced"}
                    </p>
                    <p
                      className={`text-sm ${isBalanced ? "text-green-700" : "text-red-700"}`}
                    >
                      Assets {isBalanced ? "=" : "≠"} Liabilities + Equity
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Difference:</p>
                  <p
                    className={`text-2xl font-bold ${isBalanced ? "text-green-700" : "text-red-700"}`}
                  >
                    {formatCurrency(
                      Math.abs(
                        data.assets.total - data.total_liabilities_equity,
                      ),
                    )}
                  </p>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default BalanceSheet;
