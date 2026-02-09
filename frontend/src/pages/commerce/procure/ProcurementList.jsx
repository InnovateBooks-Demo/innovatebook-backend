import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  RefreshCw,
  ShoppingCart,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ProcurementList = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/modules/procurement/requests`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) setRequests(data.requests || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter((req) => {
    const matchSearch =
      !search ||
      req.title?.toLowerCase().includes(search.toLowerCase()) ||
      req.pr_number?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || req.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalValue = requests.reduce((sum, r) => sum + (r.total_value || 0), 0);
  const statuses = ["draft", "pending", "approved", "rejected", "completed"];

  const statusColors = {
    draft: "bg-gray-100 text-gray-700",
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    completed: "bg-blue-100 text-blue-700",
  };

  const priorityColors = {
    high: "bg-red-100 text-red-700",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-green-100 text-green-700",
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Purchase Requests
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage procurement requests and approvals
          </p>
        </div>
        <button
          onClick={() => navigate("/commerce/procure/new")}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#3A4E63] text-white rounded-xl font-semibold text-sm hover:bg-[#022B6B]"
        >
          <Plus className="w-4 h-4" />
          Create PR
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total PRs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {requests.length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-[#033F99]" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ₹{(totalValue / 100000).toFixed(1)}L
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {requests.filter((r) => r.status === "pending").length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Approved</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {requests.filter((r) => r.status === "approved").length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search PRs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3A4E63]/20 focus:border-[#3A4E63] outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3A4E63]/20 focus:border-[#3A4E63] outline-none"
        >
          <option value="">All Status</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
        <button
          onClick={fetchRequests}
          className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50"
        >
          <RefreshCw className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                PR Number
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                Title
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                Requested By
              </th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                Value
              </th>
              <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                Priority
              </th>
              <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  No requests found
                </td>
              </tr>
            ) : (
              filteredRequests.map((req) => (
                <tr
                  key={req.pr_id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/commerce/procure/${req.pr_id}`)}
                >
                  <td className="px-6 py-4 font-mono text-sm text-[#3A4E63] font-semibold">
                    {req.pr_number}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">{req.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Due: {req.required_date || "Not set"}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {req.requested_by}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-900">
                    ₹{req.total_value?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${priorityColors[req.priority] || "bg-gray-100 text-gray-700"}`}
                    >
                      {req.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${statusColors[req.status] || "bg-gray-100 text-gray-700"}`}
                    >
                      {req.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProcurementList;
