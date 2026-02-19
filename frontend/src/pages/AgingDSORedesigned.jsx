import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { invoiceAPI } from "../utils/api";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import {
  TrendingUp,
  Search,
  Download,
  Calendar,
  DollarSign,
  Clock,
  Loader2,
} from "lucide-react";

const AgingDSORedesigned = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [bucketFilter, setBucketFilter] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [invoices, searchTerm, bucketFilter]);

  const loadData = async () => {
    try {
      const response = await invoiceAPI.getAll();
      setInvoices(response.data || []);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load aging data");
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...invoices];

    if (bucketFilter !== "all") {
      filtered = filtered.filter((inv) => {
        const daysOverdue = inv.days_overdue || 0;
        switch (bucketFilter) {
          case "current":
            return daysOverdue <= 0;
          case "1-30":
            return daysOverdue > 0 && daysOverdue <= 30;
          case "31-60":
            return daysOverdue > 30 && daysOverdue <= 60;
          case "61-90":
            return daysOverdue > 60 && daysOverdue <= 90;
          case "90+":
            return daysOverdue > 90;
          default:
            return true;
        }
      });
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (inv) =>
          inv.invoice_number
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          inv.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredInvoices(filtered);
  };

  const calculateMetrics = () => {
    const totalOutstanding = filteredInvoices.reduce(
      (sum, inv) => sum + (inv.balance_due || 0),
      0,
    );
    const totalInvoices = filteredInvoices.length;
    const overdue = filteredInvoices.filter(
      (inv) => (inv.days_overdue || 0) > 0,
    );
    const avgDSO =
      filteredInvoices.reduce((sum, inv) => sum + (inv.dso || 0), 0) /
      (totalInvoices || 1);

    const buckets = {
      current: filteredInvoices
        .filter((inv) => (inv.days_overdue || 0) <= 0)
        .reduce((sum, inv) => sum + (inv.balance_due || 0), 0),
      "1-30": filteredInvoices
        .filter(
          (inv) => (inv.days_overdue || 0) > 0 && (inv.days_overdue || 0) <= 30,
        )
        .reduce((sum, inv) => sum + (inv.balance_due || 0), 0),
      "31-60": filteredInvoices
        .filter(
          (inv) =>
            (inv.days_overdue || 0) > 30 && (inv.days_overdue || 0) <= 60,
        )
        .reduce((sum, inv) => sum + (inv.balance_due || 0), 0),
      "61-90": filteredInvoices
        .filter(
          (inv) =>
            (inv.days_overdue || 0) > 60 && (inv.days_overdue || 0) <= 90,
        )
        .reduce((sum, inv) => sum + (inv.balance_due || 0), 0),
      "90+": filteredInvoices
        .filter((inv) => (inv.days_overdue || 0) > 90)
        .reduce((sum, inv) => sum + (inv.balance_due || 0), 0),
    };

    return {
      totalOutstanding,
      totalInvoices,
      overdue: overdue.length,
      avgDSO,
      buckets,
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-[#033F99] border-r-transparent"></div>
          <p className="mt-4 text-[#033F99] font-semibold text-lg">
            Loading aging data...
          </p>
        </div>
      </div>
    );
  }

  const metrics = calculateMetrics();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50 p-8">
      {/* Premium Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1
              className="text-4xl font-bold bg-gradient-to-r from-[#033F99] via-[#033F99] to-[#033F99] bg-clip-text text-transparent"
              style={{ fontFamily: "Poppins" }}
            >
              Aging Analysis & DSO
            </h1>
            <p className="text-[#033F99] mt-2 font-medium text-lg">
              Track receivables aging and days sales outstanding
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-[#033F99] text-[#033F99] font-semibold rounded-xl hover:bg-[#C4D9F4] hover:border-[#033F99] transition-all duration-200">
              <Calendar className="h-5 w-5" />
              <span>This Month</span>
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#033F99] to-[#033F99] hover:from-[#033F99] hover:to-[#033F99] text-white font-bold rounded-xl shadow-xl transition-all duration-200">
              <Download className="h-5 w-5" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards - Premium Style */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-[#033F99]/50 shadow-xl hover:shadow-2xl hover:border-[#033F99] transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#033F99]/10 to-transparent rounded-full -mr-16 -mt-16"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-2xl shadow-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-sm font-bold text-[#033F99] uppercase tracking-wider mb-1">
              Total Outstanding
            </p>
            <p className="text-4xl font-black text-[#033F99]">
              {formatCurrency(metrics.totalOutstanding)}
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-purple-200/50 shadow-xl hover:shadow-2xl hover:border-purple-200 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full -mr-16 -mt-16"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl shadow-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-sm font-bold text-purple-700 uppercase tracking-wider mb-1">
              Avg DSO (Days)
            </p>
            <p className="text-4xl font-black text-purple-900">
              {Math.round(metrics.avgDSO)}
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-emerald-200/50 shadow-xl hover:shadow-2xl hover:border-emerald-200 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full -mr-16 -mt-16"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-1">
              Total Invoices
            </p>
            <p className="text-4xl font-black text-emerald-900">
              {metrics.totalInvoices}
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-red-200/50 shadow-xl hover:shadow-2xl hover:border-red-200 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/10 to-transparent rounded-full -mr-16 -mt-16"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl shadow-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-sm font-bold text-red-700 uppercase tracking-wider mb-1">
              Overdue Invoices
            </p>
            <p className="text-4xl font-black text-red-900">
              {metrics.overdue}
            </p>
          </div>
        </div>
      </div>

      {/* Aging Buckets - Premium Style */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border-2 border-[#033F99]/50 shadow-xl mb-8">
        <h2
          className="text-2xl font-bold text-[#033F99] mb-6"
          style={{ fontFamily: "Poppins" }}
        >
          Aging Buckets
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl border-2 border-emerald-200">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">
              Current
            </p>
            <p className="text-xl font-black text-emerald-700">
              {formatCurrency(metrics.buckets.current)}
            </p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-2xl border-2 border-yellow-200">
            <p className="text-xs font-bold text-yellow-600 uppercase tracking-wider mb-2">
              1-30 Days
            </p>
            <p className="text-xl font-black text-yellow-700">
              {formatCurrency(metrics.buckets["1-30"])}
            </p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl border-2 border-orange-200">
            <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-2">
              31-60 Days
            </p>
            <p className="text-xl font-black text-orange-700">
              {formatCurrency(metrics.buckets["31-60"])}
            </p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100/50 rounded-2xl border-2 border-red-200">
            <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2">
              61-90 Days
            </p>
            <p className="text-xl font-black text-red-700">
              {formatCurrency(metrics.buckets["61-90"])}
            </p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl border-2 border-purple-200">
            <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2">
              90+ Days
            </p>
            <p className="text-xl font-black text-purple-700">
              {formatCurrency(metrics.buckets["90+"])}
            </p>
          </div>
        </div>
      </div>

      {/* Filters - Premium Style */}
      <div className="mb-6">
        <h2
          className="text-2xl font-bold text-[#033F99] mb-4"
          style={{ fontFamily: "Poppins" }}
        >
          Filter & Search
        </h2>
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search invoices or customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#033F99] focus:border-transparent transition-all text-slate-900 font-medium"
            />
          </div>

          <select
            value={bucketFilter}
            onChange={(e) => setBucketFilter(e.target.value)}
            className="px-6 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#033F99] focus:border-transparent cursor-pointer font-semibold text-slate-900"
          >
            <option value="all">All Buckets</option>
            <option value="current">Current</option>
            <option value="1-30">1-30 Days</option>
            <option value="31-60">31-60 Days</option>
            <option value="61-90">61-90 Days</option>
            <option value="90+">90+ Days</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm("");
              setBucketFilter("all");
            }}
            className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all duration-200"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Invoices Table - Premium Style */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border-2 border-[#033F99]/50 shadow-2xl overflow-hidden">
        <h2
          className="text-2xl font-bold text-[#033F99] mb-6"
          style={{ fontFamily: "Poppins" }}
        >
          Invoice Details
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-[#033F99] to-[#033F99] text-white">
                <th className="px-6 py-4 text-left font-bold text-sm uppercase">
                  Invoice #
                </th>
                <th className="px-6 py-4 text-left font-bold text-sm uppercase">
                  Customer
                </th>
                <th className="px-6 py-4 text-left font-bold text-sm uppercase">
                  Invoice Date
                </th>
                <th className="px-6 py-4 text-left font-bold text-sm uppercase">
                  Due Date
                </th>
                <th className="px-6 py-4 text-right font-bold text-sm uppercase">
                  Amount
                </th>
                <th className="px-6 py-4 text-right font-bold text-sm uppercase">
                  Balance Due
                </th>
                <th className="px-6 py-4 text-center font-bold text-sm uppercase">
                  Days Overdue
                </th>
                <th className="px-6 py-4 text-center font-bold text-sm uppercase">
                  DSO
                </th>
                <th className="px-6 py-4 text-center font-bold text-sm uppercase">
                  Bucket
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#033F99]/20">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="px-6 py-12 text-center text-[#033F99]"
                  >
                    No invoices found
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="hover:bg-[#C4D9F4]/30 cursor-pointer transition-all"
                    onClick={() => navigate(`/finance/invoices/${invoice.id}`)}
                  >
                    <td className="px-6 py-4 text-sm font-bold text-[#033F99]">
                      {invoice.invoice_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#033F99] font-medium">
                      {invoice.customer_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#033F99]">
                      {formatDate(invoice.invoice_date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#033F99]">
                      {formatDate(invoice.due_date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#033F99] text-right font-bold">
                      {formatCurrency(invoice.total_amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-red-600 text-right font-bold">
                      {formatCurrency(invoice.balance_due)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-bold border-2 ${(invoice.days_overdue || 0) <= 0
                            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                            : (invoice.days_overdue || 0) <= 30
                              ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                              : (invoice.days_overdue || 0) <= 60
                                ? "bg-orange-100 text-orange-700 border-orange-200"
                                : "bg-red-100 text-red-700 border-red-200"
                          }`}
                      >
                        {invoice.days_overdue || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#033F99] text-center font-bold">
                      {invoice.dso || 0}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-bold border-2 ${invoice.bucket === "Current"
                            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                            : invoice.bucket === "1-30 Days"
                              ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                              : invoice.bucket === "31-60 Days"
                                ? "bg-orange-100 text-orange-700 border-orange-200"
                                : "bg-red-100 text-red-700 border-red-200"
                          }`}
                      >
                        {invoice.bucket || "N/A"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AgingDSORedesigned;
