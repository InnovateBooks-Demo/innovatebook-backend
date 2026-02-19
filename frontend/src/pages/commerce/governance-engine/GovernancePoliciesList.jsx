import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  Plus,
  ArrowLeft,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const GovernancePoliciesList = () => {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [scopeFilter, setScopeFilter] = useState("");

  useEffect(() => {
    fetchPolicies();
  }, [scopeFilter]);

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      let url = `${API_URL}/api/commerce/governance-engine/policies?`;
      if (scopeFilter) url += `scope=${scopeFilter}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPolicies(data.policies || []);
        setStats(data.stats || {});
      }
    } catch (error) {
      toast.error("Failed to fetch policies");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#033F99]" />
      </div>
    );

  return (
    <div
      className="min-h-screen bg-gray-50"
      data-testid="governance-policies-list"
    >
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate("/commerce/governance-engine")}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-500">
              Governance Engine → Policies
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="h-7 w-7 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Policies
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Rules that must never be violated
                </p>
              </div>
            </div>
            <Link
              to="/commerce/governance-engine/policies/create"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#033F99] rounded-lg hover:bg-[#022d6e]"
            >
              <Plus className="h-4 w-4" />
              Add Policy
            </Link>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Total",
              value: stats.total || 0,
              color: "bg-gray-100 text-gray-700",
            },
            {
              label: "Active",
              value: stats.active || 0,
              color: "bg-green-100 text-green-700",
            },
            {
              label: "Hard Enforcement",
              value: stats.hard || 0,
              color: "bg-red-100 text-red-700",
            },
            {
              label: "Soft Enforcement",
              value: stats.soft || 0,
              color: "bg-yellow-100 text-yellow-700",
            },
          ].map((stat, i) => (
            <div key={i} className={`${stat.color} rounded-xl p-4`}>
              <p className="text-xs font-medium uppercase">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            <select
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="">All Scopes</option>
              <option value="revenue">Revenue</option>
              <option value="procurement">Procurement</option>
              <option value="both">Both</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Policy
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Scope
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Enforcement
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Threshold
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {policies.map((policy) => (
                <tr
                  key={policy.policy_id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() =>
                    navigate(
                      `/commerce/governance-engine/policies/${policy.policy_id}`,
                    )
                  }
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {policy.policy_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {policy.policy_id}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 capitalize">
                      {policy.policy_type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 capitalize">
                      {policy.scope}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${policy.enforcement_type === "HARD" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}
                    >
                      {policy.enforcement_type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {policy.threshold_value
                        ? `${policy.threshold_value}${policy.policy_type === "margin" || policy.policy_type === "discount" ? "%" : ""}`
                        : "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {policy.active ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-300 mx-auto" />
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GovernancePoliciesList;
