import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getAuthHeaders } from "../utils/auth";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { toast } from "sonner";
import {
  ArrowLeft,
  BookOpen,
  Download,
  Calendar,
  Loader2,
  Filter,
} from "lucide-react";

const GeneralLedger = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [filters, setFilters] = useState({
    account: "",
    start_date: new Date(new Date().getFullYear(), 0, 1)
      .toISOString()
      .split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    loadAccounts();
    loadReport();
  }, []);

  const loadAccounts = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || "";
      const response = await axios.get(
        `${backendUrl}/api/reports/trial-balance`,
        {
          headers: getAuthHeaders(),
        },
      );
      const accountList = response.data.accounts.map((acc) => acc.account);
      setAccounts(accountList);
    } catch (error) {
      console.error("Failed to load accounts");
    }
  };

  const loadReport = async () => {
    try {
      setLoading(true);
      const backendUrl = process.env.REACT_APP_BACKEND_URL || "";
      const params = {
        start_date: filters.start_date,
        end_date: filters.end_date,
      };
      if (filters.account) {
        params.account = filters.account;
      }

      const response = await axios.get(
        `${backendUrl}/api/reports/general-ledger`,
        {
          params,
          headers: getAuthHeaders(),
        },
      );
      setData(response.data);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load General Ledger");
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

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-IN");
  };

  const renderLedger = (accountName, ledgerData) => {
    return (
      <Card
        key={accountName}
        className="mb-6 bg-white border-0 shadow-lg overflow-hidden"
      >
        <div className="bg-gradient-to-r from-pink-500 to-rose-600 p-4">
          <h3
            className="text-lg font-bold text-white"
            style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
          >
            {accountName}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Date
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Description
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Entry ID
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-semibold text-gray-700"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Debit (₹)
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-semibold text-gray-700"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Credit (₹)
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-semibold text-gray-700"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Balance (₹)
                </th>
              </tr>
            </thead>
            <tbody>
              {ledgerData.transactions.map((txn, idx) => (
                <tr
                  key={idx}
                  className={`border-b ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-pink-50 transition-colors`}
                >
                  <td className="px-4 py-3 text-xs text-gray-700">
                    {formatDate(txn.date)}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-900">
                    {txn.description}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                    {txn.entry_id?.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3 text-xs text-right font-semibold text-[#033F99]">
                    {txn.debit > 0 ? formatCurrency(txn.debit) : "-"}
                  </td>
                  <td className="px-4 py-3 text-xs text-right font-semibold text-green-600">
                    {txn.credit > 0 ? formatCurrency(txn.credit) : "-"}
                  </td>
                  <td
                    className={`px-4 py-3 text-xs text-right font-bold ${txn.balance >= 0 ? "text-blue-700" : "text-red-700"}`}
                  >
                    {formatCurrency(txn.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gradient-to-r from-pink-50 to-rose-50 border-t-2 border-pink-300">
              <tr>
                <td
                  colSpan="5"
                  className="px-4 py-3 text-sm font-bold text-gray-900"
                >
                  Closing Balance
                </td>
                <td
                  className={`px-4 py-3 text-base text-right font-bold ${ledgerData.closing_balance >= 0 ? "text-blue-700" : "text-red-700"}`}
                >
                  {formatCurrency(ledgerData.closing_balance)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
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
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1
                    className="text-2xl font-bold text-gray-900"
                    style={{
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: 600,
                    }}
                  >
                    General Ledger
                  </h1>
                  <p
                    className="text-sm text-gray-500"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Detailed transaction view for all accounts
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
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Filters */}
        <Card className="p-6 mb-6 bg-white border-0 shadow-md">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Account (Optional)
              </Label>
              <Select
                value={filters.account || "all"}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    account: value === "all" ? "" : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Accounts" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="all">All Accounts</SelectItem>
                  {accounts.map((acc) => (
                    <SelectItem key={acc} value={acc}>
                      {acc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                From Date
              </Label>
              <Input
                type="date"
                value={filters.start_date}
                onChange={(e) =>
                  setFilters({ ...filters, start_date: e.target.value })
                }
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                To Date
              </Label>
              <Input
                type="date"
                value={filters.end_date}
                onChange={(e) =>
                  setFilters({ ...filters, end_date: e.target.value })
                }
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={loadReport}
                disabled={loading}
                style={{ backgroundColor: "#3A4E63" }}
                className="text-white w-full"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Filter className="h-4 w-4 mr-2" />
                )}
                Apply Filters
              </Button>
            </div>
          </div>
        </Card>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
          </div>
        )}

        {!loading && data && (
          <>
            {/* Period Info */}
            <Card className="p-4 mb-6 bg-pink-50 border border-pink-200">
              <div className="flex items-center justify-between">
                <div
                  className="text-sm text-pink-900"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  <strong>Period:</strong> {data.period.from} to{" "}
                  {data.period.to}
                </div>
                <div className="text-sm text-pink-700">
                  {filters.account
                    ? `Account: ${filters.account}`
                    : `All Accounts (${Object.keys(data.ledger || {}).length})`}
                </div>
              </div>
            </Card>

            {/* Ledgers */}
            {filters.account && data.account
              ? renderLedger(data.account, data)
              : Object.entries(data.ledger || {}).map(
                  ([accountName, ledgerData]) =>
                    renderLedger(accountName, ledgerData),
                )}

            {(!data.ledger || Object.keys(data.ledger).length === 0) &&
              !filters.account && (
                <Card className="p-12 bg-white border-0 shadow-md text-center">
                  <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg text-gray-600">
                    No transactions found for the selected period
                  </p>
                </Card>
              )}
          </>
        )}
      </div>
    </div>
  );
};

export default GeneralLedger;
