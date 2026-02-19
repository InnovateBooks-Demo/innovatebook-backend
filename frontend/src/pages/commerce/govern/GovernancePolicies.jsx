import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  RefreshCw,
  Shield,
  AlertTriangle,
  Users,
  FileCheck,
} from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const GovernancePolicies = () => {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/modules/governance/policies`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) setPolicies(data.policies || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPolicies = policies.filter((policy) => {
    const matchSearch =
      !search ||
      policy.policy_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || policy.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statuses = ["draft", "active", "under_review", "deprecated"];
  const policyTypes = [
    ...new Set(policies.map((p) => p.policy_type).filter(Boolean)),
  ];

  const statusColors = {
    draft: "bg-gray-100 text-gray-700",
    active: "bg-green-100 text-green-700",
    under_review: "bg-yellow-100 text-yellow-700",
    deprecated: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Policies</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage organizational policies and guidelines
          </p>
        </div>
        <button
          onClick={() => navigate("/commerce/govern/policies/new")}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#033F99] text-white rounded-xl font-semibold text-sm hover:bg-[#022B6B]"
        >
          <Plus className="w-4 h-4" />
          New Policy
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Policies</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {policies.length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {policies.filter((p) => p.status === "active").length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <FileCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Under Review</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {policies.filter((p) => p.status === "under_review").length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Policy Types</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {policyTypes.length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search policies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#033F99]/20 focus:border-[#033F99] outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#033F99]/20 focus:border-[#033F99] outline-none"
        >
          <option value="">All Status</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ").charAt(0).toUpperCase() +
                s.replace("_", " ").slice(1)}
            </option>
          ))}
        </select>
        <button
          onClick={fetchPolicies}
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
                Policy Name
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                Type
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                Owner
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                Effective Date
              </th>
              <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : filteredPolicies.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-400">
                  No policies found
                </td>
              </tr>
            ) : (
              filteredPolicies.map((policy) => (
                <tr
                  key={policy.policy_id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() =>
                    navigate(`/commerce/govern/policies/${policy.policy_id}`)
                  }
                >
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">
                      {policy.policy_name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                      {policy.description}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium capitalize">
                      {policy.policy_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {policy.owner}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {policy.effective_date || "Not set"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${statusColors[policy.status] || "bg-gray-100 text-gray-700"}`}
                    >
                      {policy.status?.replace("_", " ")}
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

export default GovernancePolicies;
