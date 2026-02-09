import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { billAPI } from "../utils/api";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import {
  TrendingDown,
  Search,
  Download,
  Calendar,
  DollarSign,
  Clock,
  Loader2,
} from "lucide-react";

const AgingDPORedesigned = () => {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [bucketFilter, setBucketFilter] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [bills, searchTerm, bucketFilter]);

  const loadData = async () => {
    try {
      const response = await billAPI.getAll();
      setBills(response.data || []);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load aging data");
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...bills];

    if (bucketFilter !== "all") {
      filtered = filtered.filter((bill) => {
        const daysOverdue = bill.days_overdue || 0;
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
        (bill) =>
          bill.bill_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bill.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredBills(filtered);
  };

  const calculateMetrics = () => {
    const totalPayable = filteredBills.reduce(
      (sum, bill) => sum + (bill.balance_due || 0),
      0,
    );
    const totalBills = filteredBills.length;
    const overdue = filteredBills.filter(
      (bill) => (bill.days_overdue || 0) > 0,
    );
    const avgDPO =
      filteredBills.reduce((sum, bill) => {
        const dpo = bill.dpo || (bill.days_overdue || 0) + 30;
        return sum + dpo;
      }, 0) / (totalBills || 1);

    const buckets = {
      current: filteredBills
        .filter((bill) => (bill.days_overdue || 0) <= 0)
        .reduce((sum, bill) => sum + (bill.balance_due || 0), 0),
      "1-30": filteredBills
        .filter(
          (bill) =>
            (bill.days_overdue || 0) > 0 && (bill.days_overdue || 0) <= 30,
        )
        .reduce((sum, bill) => sum + (bill.balance_due || 0), 0),
      "31-60": filteredBills
        .filter(
          (bill) =>
            (bill.days_overdue || 0) > 30 && (bill.days_overdue || 0) <= 60,
        )
        .reduce((sum, bill) => sum + (bill.balance_due || 0), 0),
      "61-90": filteredBills
        .filter(
          (bill) =>
            (bill.days_overdue || 0) > 60 && (bill.days_overdue || 0) <= 90,
        )
        .reduce((sum, bill) => sum + (bill.balance_due || 0), 0),
      "90+": filteredBills
        .filter((bill) => (bill.days_overdue || 0) > 90)
        .reduce((sum, bill) => sum + (bill.balance_due || 0), 0),
    };

    return {
      totalPayable,
      totalBills,
      overdue: overdue.length,
      avgDPO,
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#033F99]" />
      </div>
    );
  }

  const metrics = calculateMetrics();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-3xl font-bold text-gray-900"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Aging Analysis & DPO
              </h1>
              <p
                className="text-gray-600 mt-1"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Track payables aging and days payable outstanding
              </p>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-orange-600 to-orange-700 text-white border-0 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm mb-2">Total Payable</p>
                <p className="text-3xl font-bold">
                  {formatCurrency(metrics.totalPayable)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border-0 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-2">Avg DPO (Days)</p>
                <p className="text-3xl font-bold text-gray-900">
                  {Math.round(metrics.avgDPO)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border-0 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-2">Total Bills</p>
                <p className="text-3xl font-bold text-gray-900">
                  {metrics.totalBills}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-[#033F99]" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border-0 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-2">Overdue Bills</p>
                <p className="text-3xl font-bold text-red-600">
                  {metrics.overdue}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 bg-white border-0 shadow-md mb-8">
          <h3
            className="text-lg font-semibold text-gray-900 mb-4"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Aging Buckets
          </h3>
          <div className="grid grid-cols-5 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Current</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(metrics.buckets.current)}
              </p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">1-30 Days</p>
              <p className="text-xl font-bold text-yellow-600">
                {formatCurrency(metrics.buckets["1-30"])}
              </p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">31-60 Days</p>
              <p className="text-xl font-bold text-orange-600">
                {formatCurrency(metrics.buckets["31-60"])}
              </p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">61-90 Days</p>
              <p className="text-xl font-bold text-red-600">
                {formatCurrency(metrics.buckets["61-90"])}
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">90+ Days</p>
              <p className="text-xl font-bold text-purple-600">
                {formatCurrency(metrics.buckets["90+"])}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white border-0 shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search bills or vendors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Aging Bucket
              </label>
              <select
                value={bucketFilter}
                onChange={(e) => setBucketFilter(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="all">All Buckets</option>
                <option value="current">Current</option>
                <option value="1-30">1-30 Days</option>
                <option value="31-60">31-60 Days</option>
                <option value="61-90">61-90 Days</option>
                <option value="90+">90+ Days</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSearchTerm("");
                  setBucketFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </Card>

        <Card className="bg-white border-0 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                    Bill #
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                    Vendor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                    Bill Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                    Due Date
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase">
                    Balance Due
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase">
                    Days Overdue
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase">
                    Bucket
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBills.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No bills found
                    </td>
                  </tr>
                ) : (
                  filteredBills.map((bill) => (
                    <tr
                      key={bill.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/bills/${bill.id}`)}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-[#033F99]">
                        {bill.bill_number}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {bill.vendor_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(bill.bill_date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(bill.due_date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right font-semibold">
                        {formatCurrency(bill.total_amount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-orange-600 text-right font-semibold">
                        {formatCurrency(bill.balance_due)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            (bill.days_overdue || 0) <= 0
                              ? "bg-green-100 text-green-700"
                              : (bill.days_overdue || 0) <= 30
                                ? "bg-yellow-100 text-yellow-700"
                                : (bill.days_overdue || 0) <= 60
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-red-100 text-red-700"
                          }`}
                        >
                          {bill.days_overdue || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            bill.bucket === "Current"
                              ? "bg-green-100 text-green-700"
                              : bill.bucket === "1-30 Days"
                                ? "bg-yellow-100 text-yellow-700"
                                : bill.bucket === "31-60 Days"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-red-100 text-red-700"
                          }`}
                        >
                          {bill.bucket || "N/A"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AgingDPORedesigned;
