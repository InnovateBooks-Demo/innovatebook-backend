import React, { useState, useEffect } from "react";
import {
  Users,
  Building2,
  TrendingUp,
  DollarSign,
  Activity,
  Search,
  Filter,
  Eye,
  Settings,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  ArrowLeft,
  Plus,
  RefreshCw,
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3000";

const SuperAdminOrganizations = () => {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState([]);
  const [platformStats, setPlatformStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [showOrgDetails, setShowOrgDetails] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [newOrgData, setNewOrgData] = useState({
    org_name: "",
    admin_email: "",
    admin_full_name: "",
    admin_password: "",
  });
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    fetchOrganizationsData();

    // Auto-refresh every 10 seconds for real-time updates
    const interval = setInterval(() => {
      fetchOrganizationsData();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchOrganizationsData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        `${API_URL}/api/super-admin/analytics/organizations/overview`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.success) {
        setOrganizations(response.data.organizations);
        setPlatformStats(response.data.platform_stats);
        setLastUpdated(new Date());
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch organizations:", error);
      setLoading(false);
    }
  };

  const handleCreateOrganization = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateError("");

    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.post(
        `${API_URL}/api/enterprise/super-admin/organizations/create`,
        newOrgData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.success) {
        // Reset form
        setNewOrgData({
          org_name: "",
          admin_email: "",
          admin_full_name: "",
          admin_password: "",
        });
        setShowCreateModal(false);

        // Refresh data immediately
        await fetchOrganizationsData();

        // Show success message
        alert("Organization created successfully!");
      }
    } catch (error) {
      setCreateError(
        error.response?.data?.detail || "Failed to create organization",
      );
    } finally {
      setCreating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "#10b981";
      case "trial":
        return "#3b82f6";
      case "expired":
        return "#ef4444";
      case "cancelled":
        return "#6b7280";
      default:
        return "#9ca3af";
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-emerald-100 text-emerald-700 border-emerald-200",
      trial: "bg-blue-100 text-blue-700 border-blue-200",
      expired: "bg-red-100 text-red-700 border-red-200",
      cancelled: "bg-slate-100 text-slate-700 border-slate-200",
    };
    return styles[status] || styles["trial"];
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4" />;
      case "trial":
        return <Clock className="w-4 h-4" />;
      case "expired":
        return <XCircle className="w-4 h-4" />;
      case "cancelled":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getHealthScoreColor = (score) => {
    if (score >= 80) return "#10b981";
    if (score >= 60) return "#3b82f6";
    if (score >= 40) return "#f59e0b";
    return "#ef4444";
  };

  const filteredOrgs = organizations.filter((org) => {
    const matchesSearch =
      org.org_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.org_slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || org.subscription_status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-[#3A4E63] border-r-transparent"></div>
          <p className="mt-4 text-[#3A4E63] font-bold text-lg">
            Loading platform data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50 p-8">
      {/* Premium Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-[#3A4E63] to-[#0147CC] rounded-2xl shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1
                className="text-4xl font-bold bg-gradient-to-r from-[#3A4E63] via-[#3A4E63] to-[#3A4E63] bg-clip-text text-transparent"
                style={{ fontFamily: "Poppins" }}
              >
                Platform Organizations
              </h1>
            </div>
            <div className="flex items-center gap-4 ml-16">
              <p className="text-[#3A4E63] font-semibold text-lg">
                Monitor all organizations using InnovateBooks
              </p>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 border-2 border-emerald-200 rounded-lg">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-emerald-700">LIVE</span>
              </div>
              <span className="text-xs text-slate-600 font-medium">
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold rounded-xl shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Add Organization
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-[#3A4E63] text-[#3A4E63] font-bold rounded-xl hover:bg-[#C4D9F4] hover:border-[#3A4E63] transition-all duration-200 shadow-lg"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Platform
            </button>
          </div>
        </div>
      </div>

      {/* Platform Stats Cards - Premium Style */}
      {platformStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Organizations */}
          <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-[#3A4E63]/50 shadow-xl hover:shadow-2xl hover:border-[#3A4E63] transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#3A4E63]/10 to-transparent rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-[#3A4E63] to-[#0147CC] rounded-2xl shadow-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm font-bold text-[#3A4E63] uppercase tracking-wider mb-1">
                Total Organizations
              </p>
              <p className="text-4xl font-black text-[#3A4E63]">
                {platformStats.total_organizations}
              </p>
              <p className="text-xs text-slate-600 mt-2 font-medium">
                {platformStats.active_organizations} active ·{" "}
                {platformStats.trial_organizations} trial
              </p>
            </div>
          </div>

          {/* Total Users */}
          <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-purple-200/50 shadow-xl hover:shadow-2xl hover:border-purple-200 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm font-bold text-purple-700 uppercase tracking-wider mb-1">
                Platform Users
              </p>
              <p className="text-4xl font-black text-purple-900">
                {platformStats.total_platform_users}
              </p>
              <p className="text-xs text-slate-600 mt-2 font-medium">
                Across all organizations
              </p>
            </div>
          </div>

          {/* MRR */}
          <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-emerald-200/50 shadow-xl hover:shadow-2xl hover:border-emerald-200 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl shadow-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-1">
                Monthly Revenue
              </p>
              <p className="text-4xl font-black text-emerald-900">
                ₹{platformStats.total_mrr.toLocaleString()}
              </p>
              <p className="text-xs text-slate-600 mt-2 font-medium">
                ARR: ₹{platformStats.arr.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Activation Rate */}
          <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-blue-200/50 shadow-xl hover:shadow-2xl hover:border-blue-200 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-[#0147CC] to-blue-700 rounded-2xl shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-1">
                Activation Rate
              </p>
              <p className="text-4xl font-black text-blue-900">
                {(
                  (platformStats.active_organizations /
                    platformStats.total_organizations) *
                  100
                ).toFixed(1)}
                %
              </p>
              <p className="text-xs text-slate-600 mt-2 font-medium">
                {platformStats.expired_organizations} expired/cancelled
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters - Premium Style */}
      <div className="mb-6">
        <h2
          className="text-2xl font-bold text-[#3A4E63] mb-4"
          style={{ fontFamily: "Poppins" }}
        >
          Manage Organizations
        </h2>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search organizations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent transition-all text-slate-900 font-medium"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-6 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent cursor-pointer font-semibold text-slate-900"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="trial">Trial</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button
            onClick={fetchOrganizationsData}
            className="px-6 py-3 bg-gradient-to-r from-[#3A4E63] to-[#0147CC] hover:from-[#3A4E63] hover:to-[#3A4E63] text-white font-bold rounded-xl transition-all shadow-lg flex items-center gap-2"
          >
            <Activity className="w-5 h-5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Organizations List - Premium Card Style */}
      <div className="space-y-3">
        {filteredOrgs.map((org) => (
          <div
            key={org.org_id}
            className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-2xl p-6 border-2 border-slate-200 shadow-lg hover:shadow-xl hover:border-[#3A4E63]/50 transition-all duration-300 cursor-pointer"
            onClick={() => {
              setSelectedOrg(org);
              setShowOrgDetails(true);
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Organization Info */}
              <div className="md:col-span-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-[#3A4E63] to-[#0147CC] rounded-xl shadow-md">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">
                      {org.org_name}
                    </h3>
                    <p className="text-sm text-slate-600 font-medium">
                      {org.org_slug}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="md:col-span-2">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusBadge(org.subscription_status)}`}
                >
                  {getStatusIcon(org.subscription_status)}
                  {org.subscription_status.toUpperCase()}
                </span>
                {org.subscription_status === "trial" &&
                  org.metrics.days_until_trial_end !== null && (
                    <p className="text-xs text-amber-600 font-semibold mt-1">
                      {org.metrics.days_until_trial_end}d left
                    </p>
                  )}
              </div>

              {/* Users */}
              <div className="md:col-span-2">
                <div className="text-sm">
                  <p className="font-bold text-slate-900">
                    {org.users.total} Total Users
                  </p>
                  <p className="text-emerald-600 font-semibold">
                    {org.users.active} active
                  </p>
                </div>
              </div>

              {/* Data Metrics */}
              <div className="md:col-span-2">
                <div className="text-sm space-y-0.5">
                  <p className="text-slate-700 font-medium">
                    {org.metrics.customers} customers
                  </p>
                  <p className="text-slate-700 font-medium">
                    {org.metrics.invoices} invoices
                  </p>
                </div>
              </div>

              {/* Health Score */}
              <div className="md:col-span-2">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600 uppercase">
                      Health
                    </span>
                    <span
                      className="text-sm font-black"
                      style={{ color: getHealthScoreColor(org.health_score) }}
                    >
                      {org.health_score}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${org.health_score}%`,
                        backgroundColor: getHealthScoreColor(org.health_score),
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="md:col-span-1 flex justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedOrg(org);
                    setShowOrgDetails(true);
                  }}
                  className="p-2 bg-[#3A4E63] hover:bg-[#0147CC] text-white rounded-lg transition-all shadow-md"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredOrgs.length === 0 && (
          <div className="text-center py-12 bg-white/70 backdrop-blur-xl rounded-2xl border-2 border-slate-200">
            <Building2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 font-semibold text-lg">
              No organizations found
            </p>
          </div>
        )}
      </div>

      {/* Create Organization Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-[#3A4E63] to-[#0147CC] rounded-2xl shadow-lg">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <h2
                  className="text-3xl font-bold text-[#3A4E63]"
                  style={{ fontFamily: "Poppins" }}
                >
                  Create New Organization
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateError("");
                }}
                className="text-slate-600 hover:text-red-600 transition-colors"
              >
                <XCircle className="w-8 h-8" />
              </button>
            </div>

            <form onSubmit={handleCreateOrganization} className="space-y-6">
              {/* Organization Name */}
              <div>
                <label className="block text-sm font-bold text-[#3A4E63] mb-2 uppercase tracking-wider">
                  Organization Name
                </label>
                <input
                  type="text"
                  value={newOrgData.org_name}
                  onChange={(e) =>
                    setNewOrgData({ ...newOrgData, org_name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent transition-all"
                  placeholder="e.g., Acme Corporation"
                  required
                />
              </div>

              {/* Admin Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-[#3A4E63] mb-2 uppercase tracking-wider">
                    Admin Full Name
                  </label>
                  <input
                    type="text"
                    value={newOrgData.admin_full_name}
                    onChange={(e) =>
                      setNewOrgData({
                        ...newOrgData,
                        admin_full_name: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent transition-all"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#3A4E63] mb-2 uppercase tracking-wider">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    value={newOrgData.admin_email}
                    onChange={(e) =>
                      setNewOrgData({
                        ...newOrgData,
                        admin_email: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent transition-all"
                    placeholder="admin@acme.com"
                    required
                  />
                </div>
              </div>

              {/* Admin Password */}
              <div>
                <label className="block text-sm font-bold text-[#3A4E63] mb-2 uppercase tracking-wider">
                  Admin Password
                </label>
                <input
                  type="password"
                  value={newOrgData.admin_password}
                  onChange={(e) =>
                    setNewOrgData({
                      ...newOrgData,
                      admin_password: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
                <p className="text-xs text-slate-600 mt-1 font-medium">
                  Minimum 8 characters
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-900 font-semibold mb-1">
                      What happens next?
                    </p>
                    <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                      <li>Organization created with 14-day trial</li>
                      <li>Admin user created with provided credentials</li>
                      <li>Demo data automatically added</li>
                      <li>Admin can login and start using the platform</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {createError && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm font-medium">
                    {createError}
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateError("");
                  }}
                  className="flex-1 px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#3A4E63] to-[#0147CC] hover:from-[#3A4E63] hover:to-[#3A4E63] text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Create Organization
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Organization Details Modal */}
      {showOrgDetails && selectedOrg && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-[#3A4E63] to-[#0147CC] rounded-2xl shadow-lg">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2
                    className="text-3xl font-bold text-[#3A4E63]"
                    style={{ fontFamily: "Poppins" }}
                  >
                    {selectedOrg.org_name}
                  </h2>
                  <p className="text-slate-600 font-medium">
                    {selectedOrg.org_slug}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowOrgDetails(false)}
                className="text-slate-600 hover:text-red-600 transition-colors"
              >
                <XCircle className="w-8 h-8" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Organization Info */}
              <div className="bg-slate-50 rounded-2xl p-6 border-2 border-slate-200">
                <h3 className="text-xl font-bold text-[#3A4E63] mb-4">
                  Organization Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-semibold">
                      Org ID:
                    </span>
                    <span className="text-slate-900 font-medium">
                      {selectedOrg.org_id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-semibold">
                      Status:
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusBadge(selectedOrg.subscription_status)}`}
                    >
                      {selectedOrg.subscription_status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-semibold">
                      Created:
                    </span>
                    <span className="text-slate-900 font-medium">
                      {new Date(selectedOrg.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-semibold">
                      Days Active:
                    </span>
                    <span className="text-slate-900 font-medium">
                      {selectedOrg.metrics.days_active} days
                    </span>
                  </div>
                </div>
              </div>

              {/* Users Info */}
              <div className="bg-purple-50 rounded-2xl p-6 border-2 border-purple-200">
                <h3 className="text-xl font-bold text-purple-700 mb-4">
                  Users
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-semibold">Total:</span>
                    <span className="text-slate-900 font-bold">
                      {selectedOrg.users.total}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-600 font-semibold">
                      Active:
                    </span>
                    <span className="text-emerald-700 font-bold">
                      {selectedOrg.users.active}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-600 font-semibold">
                      Inactive:
                    </span>
                    <span className="text-red-700 font-bold">
                      {selectedOrg.users.inactive}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-semibold">
                      Engagement:
                    </span>
                    <span className="text-slate-900 font-bold">
                      {(
                        (selectedOrg.users.active / selectedOrg.users.total) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200 md:col-span-2">
                <h3 className="text-xl font-bold text-blue-700 mb-4">
                  Platform Usage
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-black text-blue-600">
                      {selectedOrg.metrics.customers}
                    </div>
                    <div className="text-sm text-slate-600 font-semibold mt-1">
                      Customers
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-purple-600">
                      {selectedOrg.metrics.invoices}
                    </div>
                    <div className="text-sm text-slate-600 font-semibold mt-1">
                      Invoices
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-emerald-600">
                      {selectedOrg.metrics.leads}
                    </div>
                    <div className="text-sm text-slate-600 font-semibold mt-1">
                      Leads
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminOrganizations;
