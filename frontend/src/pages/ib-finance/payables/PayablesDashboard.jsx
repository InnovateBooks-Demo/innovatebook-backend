import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  ArrowLeft,
  Search,
  Plus,
  Eye,
  Check,
  AlertTriangle,
  Wallet,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { authService } from "../../../utils/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PayablesDashboard = () => {
  const navigate = useNavigate();
  const [payables, setPayables] = useState([]);
  const [dashboard, setDashboard] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    try {
      const token = authService.getToken();

      // Fetch dashboard
      const dashRes = await fetch(
        `${API_URL}/api/ib-finance/payables/dashboard`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (dashRes.ok) {
        const dashData = await dashRes.json();
        setDashboard(dashData.data || {});
      }

      // Fetch payables
      const url =
        statusFilter === "all"
          ? `${API_URL}/api/ib-finance/payables`
          : `${API_URL}/api/ib-finance/payables?status=${statusFilter}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setPayables(data.data || []);
      }
    } catch (error) {
      toast.error("Failed to load payables");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (payableId) => {
    try {
      const token = authService.getToken();
      const response = await fetch(
        `${API_URL}/api/ib-finance/payables/${payableId}/approve`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        toast.success("Payable approved for payment");
        fetchData();
      } else {
        const err = await response.json();
        toast.error(err.detail || "Failed to approve");
      }
    } catch (error) {
      toast.error("Failed to approve payable");
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      open: "bg-blue-100 text-blue-700",
      partially_paid: "bg-amber-100 text-amber-700",
      paid: "bg-green-100 text-green-700",
      overdue: "bg-red-100 text-red-700",
      disputed: "bg-purple-100 text-purple-700",
      written_off: "bg-gray-100 text-gray-700",
    };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  const getMatchBadge = (status) => {
    const styles = {
      matched: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      mismatch: "bg-red-100 text-red-700",
    };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  const getAgingBadge = (bucket) => {
    const styles = {
      "0-30": "bg-green-100 text-green-700",
      "31-60": "bg-yellow-100 text-yellow-700",
      "61-90": "bg-orange-100 text-orange-700",
      "90+": "bg-red-100 text-red-700",
    };
    return styles[bucket] || "bg-gray-100 text-gray-700";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filteredRecords = payables.filter(
    (record) =>
      record.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.payable_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.bill_number?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const agingData = dashboard.aging || {};

  return (
    <div className="min-h-screen bg-gray-50" data-testid="payables-dashboard">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate("/ib-finance")}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-500">IB Finance → Payables</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center">
                <CreditCard className="h-7 w-7 text-amber-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Payables
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Vendor bills, obligations & settlement tracking
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/ib-finance/payables/create")}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Bill
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-amber-600" />
              </div>
              <p className="text-sm font-medium text-gray-500">
                Total Outstanding
              </p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(dashboard.total_outstanding || 0)}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <p className="text-sm font-medium text-gray-500">
                Overdue Amount
              </p>
            </div>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(dashboard.total_overdue || 0)}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Wallet className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-500">Paid MTD</p>
            </div>
            <p className="text-2xl font-bold text-green-600">₹0</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-sm font-medium text-gray-500">DPO</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">28 days</p>
          </div>
        </div>

        {/* Aging Buckets */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Aging Analysis</h3>
          <div className="grid grid-cols-4 gap-4">
            {["0-30", "31-60", "61-90", "90+"].map((bucket) => (
              <div
                key={bucket}
                className={`p-4 rounded-lg ${getAgingBadge(bucket).replace("text-", "bg-").replace("100", "50")}`}
              >
                <p className="text-sm font-medium text-gray-600">
                  {bucket} Days
                </p>
                <p className="text-xl font-bold mt-1">
                  {formatCurrency(agingData[bucket]?.amount || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {agingData[bucket]?.count || 0} bills
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search payables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="overdue">Overdue</option>
            <option value="disputed">Disputed</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        {/* Payables Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Bill #
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Bill Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Due Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                  Outstanding
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                  Match
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRecords.map((record) => (
                <tr key={record.payable_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">
                      {record.bill_number}
                    </p>
                    <p className="text-xs text-gray-500">{record.payable_id}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900">{record.vendor_name}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {formatDate(record.bill_date)}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {formatDate(record.due_date)}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-900">
                    {formatCurrency(record.bill_amount)}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">
                    {formatCurrency(record.outstanding_amount)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getMatchBadge(record.match_status)}`}
                    >
                      {record.match_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(record.status)}`}
                    >
                      {record.status?.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() =>
                          navigate(`/ib-finance/payables/${record.payable_id}`)
                        }
                        className="p-2 text-gray-400 hover:text-[#033F99] hover:bg-[rgba(3,63,153,0.08)] rounded-lg"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {record.match_status === "matched" &&
                        !record.approved_for_payment && (
                          <button
                            onClick={() => handleApprove(record.payable_id)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                            title="Approve for Payment"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                      {record.approved_for_payment &&
                        record.status !== "paid" && (
                          <button
                            onClick={() =>
                              navigate(
                                `/ib-finance/payables/${record.payable_id}/pay`,
                              )
                            }
                            className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                            title="Record Payment"
                          >
                            <Wallet className="h-4 w-4" />
                          </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredRecords.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              {loading ? "Loading..." : "No payables found"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayablesDashboard;
