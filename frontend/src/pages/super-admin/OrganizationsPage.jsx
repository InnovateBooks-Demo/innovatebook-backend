import React, { useState, useEffect } from "react";
import {
  Building2,
  Users,
  Search,
  Plus,
  MoreVertical,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  Eye,
  RefreshCw,
  ArrowLeft,
  Filter,
  Download,
  ChevronDown,
} from "lucide-react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3000";

const OrganizationsPage = () => {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [newOrg, setNewOrg] = useState({
    name: "",
    display_name: "",
    industry: "",
    size: "small",
    subscription_plan: "trial",
    max_users: 5,
  });

  useEffect(() => {
    const token = localStorage.getItem("super_admin_token");
    if (!token) {
      navigate("/super-admin/login");
      return;
    }
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const token = localStorage.getItem("super_admin_token");
      const response = await axios.get(
        `${API_URL}/api/super-admin/organizations`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setOrganizations(response.data.organizations || []);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch organizations:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate("/super-admin/login");
      }
      setLoading(false);
    }
  };

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError("");

    try {
      const token = localStorage.getItem("super_admin_token");
      await axios.post(`${API_URL}/api/super-admin/organizations`, newOrg, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowCreateModal(false);
      setNewOrg({
        name: "",
        display_name: "",
        industry: "",
        size: "small",
        subscription_plan: "trial",
        max_users: 5,
      });
      fetchOrganizations();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create organization");
    } finally {
      setCreating(false);
    }
  };

  const handleDeactivateOrg = async (orgId) => {
    if (
      !window.confirm(
        "Are you sure you want to deactivate this organization? All users will be deactivated.",
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("super_admin_token");
      await axios.delete(`${API_URL}/api/super-admin/organizations/${orgId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchOrganizations();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to deactivate organization");
    }
  };

  const filteredOrgs = organizations.filter((org) => {
    const matchesSearch =
      (org.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (org.display_name?.toLowerCase() || "").includes(
        searchTerm.toLowerCase(),
      );
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && org.is_active) ||
      (filterStatus === "inactive" && !org.is_active);
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <RefreshCw className="w-10 h-10 text-[#033F99] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              to="/super-admin/dashboard"
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Organizations
              </h1>
              <p className="text-sm text-slate-500">
                Manage all platform organizations
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500">Total Organizations</p>
            <p className="text-2xl font-bold text-slate-900">
              {organizations.length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500">Active</p>
            <p className="text-2xl font-bold text-green-600">
              {organizations.filter((o) => o.is_active).length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500">Inactive</p>
            <p className="text-2xl font-bold text-red-600">
              {organizations.filter((o) => !o.is_active).length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500">Total Users</p>
            <p className="text-2xl font-bold text-[#033F99]">
              {organizations.reduce((sum, o) => sum + (o.user_count || 0), 0)}
            </p>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 flex-1 w-full md:w-auto">
              {/* Search */}
              <div className="relative flex-1 md:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search organizations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99] focus:border-transparent"
                />
              </div>

              {/* Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99] text-slate-700"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              data-testid="create-org-btn"
              className="flex items-center gap-2 px-4 py-2.5 bg-[#033F99] hover:bg-[#022a6b] text-white rounded-lg transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Create Organization
            </button>
          </div>
        </div>

        {/* Organizations Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                  Organization
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                  Plan
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                  Users
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                  Created
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrgs.map((org) => (
                <tr
                  key={org.org_id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Building2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {org.display_name || org.name}
                        </p>
                        <p className="text-sm text-slate-500">{org.org_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${org.subscription_plan === "enterprise"
                          ? "bg-purple-100 text-purple-700"
                          : org.subscription_plan === "professional"
                            ? "bg-blue-100 text-blue-700"
                            : org.subscription_plan === "basic"
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-700"
                        }`}
                    >
                      {org.subscription_plan || "trial"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700">
                        {org.user_count || 0} / {org.max_users || 5}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${org.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                        }`}
                    >
                      {org.is_active ? (
                        <CheckCircle className="w-3.5 h-3.5" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5" />
                      )}
                      {org.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {org.created_at
                      ? new Date(org.created_at).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/super-admin/organizations/${org.org_id}`}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-slate-500" />
                      </Link>
                      <button
                        onClick={() => handleDeactivateOrg(org.org_id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Deactivate"
                        disabled={!org.is_active}
                      >
                        <Trash2
                          className={`w-4 h-4 ${org.is_active ? "text-red-500" : "text-slate-300"}`}
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOrgs.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    No organizations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Organization Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">
                Create Organization
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Add a new organization to the platform
              </p>
            </div>

            <form onSubmit={handleCreateOrg} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Organization Name *
                </label>
                <input
                  type="text"
                  data-testid="org-name-input"
                  value={newOrg.name}
                  onChange={(e) =>
                    setNewOrg({ ...newOrg, name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                  placeholder="e.g., acme-corp"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Display Name *
                </label>
                <input
                  type="text"
                  data-testid="org-display-name-input"
                  value={newOrg.display_name}
                  onChange={(e) =>
                    setNewOrg({ ...newOrg, display_name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                  placeholder="e.g., Acme Corporation"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={newOrg.industry}
                    onChange={(e) =>
                      setNewOrg({ ...newOrg, industry: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                    placeholder="e.g., Technology"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Size
                  </label>
                  <select
                    value={newOrg.size}
                    onChange={(e) =>
                      setNewOrg({ ...newOrg, size: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                  >
                    <option value="small">Small (1-50)</option>
                    <option value="medium">Medium (51-200)</option>
                    <option value="large">Large (201-1000)</option>
                    <option value="enterprise">Enterprise (1000+)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Subscription Plan
                  </label>
                  <select
                    value={newOrg.subscription_plan}
                    onChange={(e) =>
                      setNewOrg({
                        ...newOrg,
                        subscription_plan: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                  >
                    <option value="trial">Trial</option>
                    <option value="basic">Basic</option>
                    <option value="professional">Professional</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Max Users
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newOrg.max_users}
                    onChange={(e) =>
                      setNewOrg({
                        ...newOrg,
                        max_users: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  data-testid="create-org-submit-btn"
                  disabled={creating}
                  className="flex-1 px-4 py-2.5 bg-[#033F99] text-white rounded-lg hover:bg-[#022a6b] transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Organization"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationsPage;
