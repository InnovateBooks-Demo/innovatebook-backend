import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Shield,
  Users,
  Handshake,
  Share2,
  Loader2,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PartyEngineList = () => {
  const navigate = useNavigate();
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  useEffect(() => {
    fetchParties();
  }, [statusFilter, roleFilter]);

  const fetchParties = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      let url = `${API_URL}/api/commerce/parties-engine/parties?`;
      if (statusFilter) url += `status=${statusFilter}&`;
      if (roleFilter) url += `role=${roleFilter}&`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setParties(data.parties || []);
        setStats(data.stats || {});
      }
    } catch (error) {
      toast.error("Failed to fetch parties");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      draft: "bg-gray-100 text-gray-700 border-gray-300",
      minimum_ready: "bg-yellow-100 text-yellow-700 border-yellow-300",
      verified: "bg-green-100 text-green-700 border-green-300",
      restricted: "bg-orange-100 text-orange-700 border-orange-300",
      blocked: "bg-red-100 text-red-700 border-red-300",
    };
    return styles[status] || styles.draft;
  };

  const getStatusIcon = (status) => {
    const icons = {
      draft: <Clock className="h-4 w-4" />,
      minimum_ready: <AlertTriangle className="h-4 w-4" />,
      verified: <CheckCircle2 className="h-4 w-4" />,
      restricted: <Shield className="h-4 w-4" />,
      blocked: <XCircle className="h-4 w-4" />,
    };
    return icons[status] || icons.draft;
  };

  const getReadinessIndicator = (readiness) => {
    if (!readiness) return null;
    const { status, can_evaluate, can_commit, can_contract } = readiness;

    return (
      <div className="flex items-center gap-1">
        <div
          className={`w-2 h-2 rounded-full ${can_evaluate ? "bg-green-500" : "bg-red-500"}`}
          title="Can Evaluate"
        />
        <div
          className={`w-2 h-2 rounded-full ${can_commit ? "bg-green-500" : "bg-red-500"}`}
          title="Can Commit"
        />
        <div
          className={`w-2 h-2 rounded-full ${can_contract ? "bg-green-500" : "bg-red-500"}`}
          title="Can Contract"
        />
      </div>
    );
  };

  const getRoleIcon = (role) => {
    const icons = {
      customer: <Users className="h-4 w-4 text-blue-500" />,
      vendor: <Building2 className="h-4 w-4 text-purple-500" />,
      partner: <Handshake className="h-4 w-4 text-green-500" />,
      channel: <Share2 className="h-4 w-4 text-orange-500" />,
    };
    return icons[role] || null;
  };

  const filteredParties = parties.filter(
    (p) =>
      !search ||
      p.legal_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.party_id?.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#3A4E63]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="party-engine-list">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#3A4E63] to-[#0558CC] rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Parties Engine
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Commercial Identity & Readiness Management
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchParties}
                className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
              <Link
                to="/commerce/parties-engine/create"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#3A4E63] rounded-lg hover:bg-[#022d6e] transition-colors shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Add Party
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {[
            {
              label: "Total",
              value: stats.total || 0,
              color: "bg-gray-100 text-gray-700",
              icon: Building2,
            },
            {
              label: "Draft",
              value: stats.draft || 0,
              color: "bg-gray-100 text-gray-600",
              icon: Clock,
            },
            {
              label: "Minimum Ready",
              value: stats.minimum_ready || 0,
              color: "bg-yellow-100 text-yellow-700",
              icon: AlertTriangle,
            },
            {
              label: "Verified",
              value: stats.verified || 0,
              color: "bg-green-100 text-green-700",
              icon: CheckCircle2,
            },
            {
              label: "Restricted",
              value: stats.restricted || 0,
              color: "bg-orange-100 text-orange-700",
              icon: Shield,
            },
            {
              label: "Blocked",
              value: stats.blocked || 0,
              color: "bg-red-100 text-red-700",
              icon: XCircle,
            },
          ].map((stat, i) => (
            <div
              key={i}
              className={`${stat.color} rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow`}
              onClick={() =>
                setStatusFilter(stat.label.toLowerCase().replace(" ", "_"))
              }
            >
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className="h-4 w-4" />
                <span className="text-xs font-medium uppercase">
                  {stat.label}
                </span>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search parties..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="minimum_ready">Minimum Ready</option>
              <option value="verified">Verified</option>
              <option value="restricted">Restricted</option>
              <option value="blocked">Blocked</option>
            </select>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
            >
              <option value="">All Roles</option>
              <option value="customer">Customer</option>
              <option value="vendor">Vendor</option>
              <option value="partner">Partner</option>
              <option value="channel">Channel</option>
            </select>
            {(statusFilter || roleFilter) && (
              <button
                onClick={() => {
                  setStatusFilter("");
                  setRoleFilter("");
                }}
                className="text-sm text-[#3A4E63] hover:underline"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Readiness Legend */}
        <div className="bg-[rgba(3,63,153,0.08)] border border-[rgba(3,63,153,0.25)] rounded-xl p-4 mb-6">
          <div className="flex items-center gap-6 text-sm">
            <span className="font-medium text-blue-800">
              Readiness Indicators:
            </span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-blue-700">Can Evaluate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-blue-700">Can Commit</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-blue-700">Can Contract</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-blue-700">= Blocked</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Party ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Legal Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Country
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Roles
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">
                  Readiness
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Source
                </th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredParties.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No parties found
                  </td>
                </tr>
              ) : (
                filteredParties.map((party) => (
                  <tr
                    key={party.party_id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      navigate(`/commerce/parties-engine/${party.party_id}`)
                    }
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-[#3A4E63]">
                        {party.party_id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {party.legal_name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {party.country}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {(party.party_roles || []).map((role, i) => (
                          <span
                            key={i}
                            title={role}
                            className="p-1 bg-gray-100 rounded"
                          >
                            {getRoleIcon(role)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(party.status)}`}
                      >
                        {getStatusIcon(party.status)}
                        {party.status?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getReadinessIndicator(party.readiness)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-500 capitalize">
                        {party.created_source}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <ChevronRight className="h-5 w-5 text-gray-400" />
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

export default PartyEngineList;
