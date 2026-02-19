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
  BarChart3,
  Download,
  Calendar,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const TrialBalance = () => {
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
        `${backendUrl}/api/reports/trial-balance`,
        {
          params: dateRange,
          headers: getAuthHeaders(),
        },
      );
      setData(response.data);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load Trial Balance");
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

  const isBalanced = data && Math.abs(data.totals.difference) < 0.01;

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
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1
                    className="text-2xl font-bold text-gray-900"
                    style={{
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: 600,
                    }}
                  >
                    Trial Balance
                  </h1>
                  <p
                    className="text-sm text-gray-500"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    All accounts with debit and credit balances
                  </p>
                </div>
              </div>
            </div>
            <Button variant="outline" className="gap-2" disabled={!data}>
              <Download className="h-4 w-4" />
              Export Excel
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
            <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
          </div>
        )}

        {!loading && data && (
          <>
            {/* Period Info */}
            <Card className="p-4 mb-6 bg-orange-50 border border-orange-200">
              <div className="flex items-center justify-between">
                <div
                  className="text-sm text-orange-900"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  <strong>Period:</strong> {data.period.from} to{" "}
                  {data.period.to}
                </div>
                <div className="flex items-center gap-2">
                  {isBalanced ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-700 font-semibold">
                        Balanced
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-700 font-semibold">
                        Not Balanced
                      </span>
                    </>
                  )}
                </div>
              </div>
            </Card>

            {/* Trial Balance Table */}
            <Card className="bg-white border-0 shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        Account Name
                      </th>
                      <th
                        className="px-6 py-4 text-right text-sm font-semibold"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        Debit (₹)
                      </th>
                      <th
                        className="px-6 py-4 text-right text-sm font-semibold"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        Credit (₹)
                      </th>
                      <th
                        className="px-6 py-4 text-right text-sm font-semibold"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        Balance (₹)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.accounts.map((account, idx) => (
                      <tr
                        key={idx}
                        className={`border-b ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-orange-50 transition-colors`}
                      >
                        <td className="px-6 py-3 text-sm text-gray-900 font-medium">
                          {account.account}
                        </td>
                        <td className="px-6 py-3 text-sm text-right text-blue-600 font-semibold">
                          {account.debit > 0
                            ? formatCurrency(account.debit)
                            : "-"}
                        </td>
                        <td className="px-6 py-3 text-sm text-right text-green-600 font-semibold">
                          {account.credit > 0
                            ? formatCurrency(account.credit)
                            : "-"}
                        </td>
                        <td
                          className={`px-6 py-3 text-sm text-right font-bold ${account.balance >= 0 ? "text-blue-700" : "text-red-700"}`}
                        >
                          {formatCurrency(account.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gradient-to-r from-gray-100 to-gray-200">
                    <tr className="border-t-2 border-gray-400">
                      <td className="px-6 py-4 text-base font-bold text-gray-900">
                        TOTALS
                      </td>
                      <td className="px-6 py-4 text-base text-right font-bold text-blue-700">
                        {formatCurrency(data.totals.debit)}
                      </td>
                      <td className="px-6 py-4 text-base text-right font-bold text-green-700">
                        {formatCurrency(data.totals.credit)}
                      </td>
                      <td
                        className={`px-6 py-4 text-base text-right font-bold ${isBalanced ? "text-green-700" : "text-red-700"}`}
                      >
                        {formatCurrency(data.totals.difference)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Card>

            {/* Verification Card */}
            <Card
              className={`p-6 mt-6 ${isBalanced ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"} border-2`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full ${isBalanced ? "bg-green-600" : "bg-red-600"} flex items-center justify-center`}
                  >
                    {isBalanced ? (
                      <CheckCircle className="h-6 w-6 text-white" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-lg font-bold ${isBalanced ? "text-green-900" : "text-red-900"}`}
                    >
                      {isBalanced
                        ? "Trial Balance is Balanced"
                        : "Trial Balance is Not Balanced"}
                    </p>
                    <p
                      className={`text-sm ${isBalanced ? "text-green-700" : "text-red-700"}`}
                    >
                      Total Debits {isBalanced ? "=" : "≠"} Total Credits
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Difference:</p>
                  <p
                    className={`text-2xl font-bold ${isBalanced ? "text-green-700" : "text-red-700"}`}
                  >
                    {formatCurrency(Math.abs(data.totals.difference))}
                  </p>
                </div>
              </div>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <Card className="p-4 bg-white border-0 shadow-md">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Total Accounts</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {data.accounts.length}
                  </p>
                </div>
              </Card>

              <Card className="p-4 bg-white border-0 shadow-md">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Total Debits</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(data.totals.debit)}
                  </p>
                </div>
              </Card>

              <Card className="p-4 bg-white border-0 shadow-md">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Total Credits</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(data.totals.credit)}
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

export default TrialBalance;
