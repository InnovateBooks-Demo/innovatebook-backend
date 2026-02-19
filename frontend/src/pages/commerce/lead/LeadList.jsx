import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Users,
  TrendingUp,
  Clock,
  AlertCircle,
  List,
  BarChart3,
  RefreshCw,
  Package,
  Database,
} from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const LeadList = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    stage: "all",
  });
  const [kpis, setKpis] = useState({
    total: 0,
    active: 0,
    feasibility: 0,
    converted: 0,
    avgRiskScore: 0,
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BACKEND_URL}/api/manufacturing/leads`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = response.data.leads || [];
      setLeads(data);
      calculateKPIs(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching leads:", error);
      setLoading(false);
    }
  };

  const calculateKPIs = (data) => {
    const total = data.length;
    const active = data.filter((l) => l.status === "Active").length;
    const feasibility = data.filter(
      (l) => l.current_stage === "Feasibility",
    ).length;
    const converted = data.filter((l) => l.status === "Converted").length;
    const avgRisk =
      total > 0
        ? data.reduce((sum, l) => sum + (l.risk_score || 0), 0) / total
        : 0;
    setKpis({
      total,
      active,
      feasibility,
      converted,
      avgRiskScore: avgRisk.toFixed(0),
    });
  };

  const filteredLeads = leads.filter((lead) => {
    const matchSearch =
      searchTerm === "" ||
      lead.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.lead_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.product_description
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchStatus =
      filters.status === "all" || lead.status === filters.status;
    const matchStage =
      filters.stage === "all" || lead.current_stage === filters.stage;
    return matchSearch && matchStatus && matchStage;
  });

  const getStatusBadge = (status) => {
    const styles = {
      Active: "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white",
      New: "bg-gradient-to-r from-[#033F99] to-[#033F99] text-white",
      Converted: "bg-gradient-to-r from-purple-500 to-purple-600 text-white",
      Lost: "bg-gradient-to-r from-red-500 to-red-600 text-white",
      "On Hold": "bg-gradient-to-r from-amber-500 to-amber-600 text-white",
    };
    return (
      styles[status] || "bg-gradient-to-r from-gray-400 to-gray-500 text-white"
    );
  };

  const getStageBadge = (stage) => {
    const styles = {
      Intake: "bg-[#C4D9F4] text-[#033F99] border-[#033F99]",
      Feasibility: "bg-amber-100 text-amber-900 border-amber-300",
      Costing: "bg-purple-100 text-purple-900 border-purple-300",
      Approval: "bg-orange-100 text-orange-900 border-orange-300",
      Convert: "bg-emerald-100 text-emerald-900 border-emerald-300",
    };
    return styles[stage] || "bg-gray-100 text-gray-900 border-gray-300";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-[#033F99] border-r-transparent"></div>
          <p className="mt-4 text-[#033F99] font-semibold text-lg">
            Loading leads...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50 p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className="text-4xl font-bold bg-gradient-to-r from-[#033F99] via-[#033F99] to-[#033F99] bg-clip-text text-transparent"
              style={{ fontFamily: "Poppins" }}
            >
              Lead Management
            </h1>
            <p className="text-[#033F99] mt-2 font-medium text-lg">
              Manufacturing leads and opportunities
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/commerce/manufacturing/masters")}
              className="flex items-center gap-3 px-6 py-4 bg-white border-2 border-[#033F99] text-[#033F99] hover:bg-[#C4D9F4] font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Database className="h-5 w-5" />
              <span className="text-base">Masters</span>
            </button>
            <button
              onClick={() => navigate("/commerce/lead/create")}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#033F99] to-[#033F99] hover:from-[#022E75] hover:to-[#022E75] text-white font-bold rounded-2xl shadow-2xl shadow-[#033F99]/50 hover:shadow-[#033F99]/60 transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="h-6 w-6" />
              <span className="text-lg">Create Lead</span>
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-[#033F99]/50 shadow-xl hover:shadow-2xl hover:border-[#033F99] transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#033F99]/10 to-transparent rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-2xl shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-sm font-bold text-[#033F99] uppercase tracking-wider mb-1">
                Total Leads
              </p>
              <p className="text-4xl font-black text-[#033F99]">{kpis.total}</p>
            </div>
          </div>

          <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-emerald-200/50 shadow-xl hover:shadow-2xl hover:border-emerald-300 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-1">
                Active
              </p>
              <p className="text-4xl font-black text-emerald-900">
                {kpis.active}
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-amber-200/50 shadow-xl hover:shadow-2xl hover:border-amber-300 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-amber-600 to-amber-700 rounded-2xl shadow-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-sm font-bold text-amber-700 uppercase tracking-wider mb-1">
                Feasibility
              </p>
              <p className="text-4xl font-black text-amber-900">
                {kpis.feasibility}
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-purple-200/50 shadow-xl hover:shadow-2xl hover:border-purple-300 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl shadow-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-sm font-bold text-purple-700 uppercase tracking-wider mb-1">
                Converted
              </p>
              <p className="text-4xl font-black text-purple-900">
                {kpis.converted}
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-red-200/50 shadow-xl hover:shadow-2xl hover:border-red-300 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/10 to-transparent rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl shadow-lg">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-sm font-bold text-red-700 uppercase tracking-wider mb-1">
                Avg Risk
              </p>
              <p className="text-4xl font-black text-red-900">
                {kpis.avgRiskScore}
              </p>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-[#033F99]/50 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-5">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#033F99]" />
                <input
                  type="text"
                  placeholder="Search leads by customer, ID, or product..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-[#C4D9F4]/50 border-2 border-[#033F99] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#033F99]/50 focus:border-[#033F99] transition-all text-[#033F99] placeholder-[#033F99]/60 font-medium"
                />
              </div>
            </div>
            <div className="lg:col-span-3">
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="w-full px-4 py-3.5 bg-[#C4D9F4]/50 border-2 border-[#033F99] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#033F99]/50 focus:border-[#033F99] transition-all text-[#033F99] font-medium cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="Active">Active</option>
                <option value="New">New</option>
                <option value="Converted">Converted</option>
                <option value="Lost">Lost</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>
            <div className="lg:col-span-3">
              <select
                value={filters.stage}
                onChange={(e) =>
                  setFilters({ ...filters, stage: e.target.value })
                }
                className="w-full px-4 py-3.5 bg-[#C4D9F4]/50 border-2 border-[#033F99] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#033F99]/50 focus:border-[#033F99] transition-all text-[#033F99] font-medium cursor-pointer"
              >
                <option value="all">All Stages</option>
                <option value="Intake">Intake</option>
                <option value="Feasibility">Feasibility</option>
                <option value="Costing">Costing</option>
                <option value="Approval">Approval</option>
                <option value="Convert">Convert</option>
              </select>
            </div>
            <div className="lg:col-span-1 flex gap-2">
              <button
                onClick={() => {
                  setFilters({ status: "all", stage: "all" });
                  fetchLeads();
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-[#033F99] to-[#033F99] hover:from-[#022E75] hover:to-[#022E75] text-white rounded-2xl font-semibold shadow-lg transition-all"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl border-2 border-[#033F99]/50 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-[#033F99] to-[#033F99] text-white">
                <th className="px-6 py-5 text-left font-bold text-sm uppercase tracking-wider">
                  Lead ID
                </th>
                <th className="px-6 py-5 text-left font-bold text-sm uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-5 text-left font-bold text-sm uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-5 text-left font-bold text-sm uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-5 text-left font-bold text-sm uppercase tracking-wider">
                  Stage
                </th>
                <th className="px-6 py-5 text-left font-bold text-sm uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-5 text-left font-bold text-sm uppercase tracking-wider">
                  Assigned To
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#033F99]/20">
              {filteredLeads.map((lead) => (
                <tr
                  key={lead.lead_id}
                  className="hover:bg-[#C4D9F4]/50 transition-all duration-200 cursor-pointer group"
                  onClick={() => navigate(`/commerce/lead/${lead.lead_id}`)}
                >
                  <td className="px-6 py-5">
                    <p className="font-bold text-[#033F99] text-base">
                      {lead.lead_id}
                    </p>
                    <p className="text-sm text-[#033F99]/70 font-medium">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-6 py-5">
                    <p className="font-bold text-[#033F99] text-base">
                      {lead.customer_name}
                    </p>
                    <p className="text-sm text-[#033F99]/70 font-medium">
                      {lead.customer_industry || "N/A"}
                    </p>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-[#033F99] font-medium text-sm max-w-xs truncate">
                      {lead.product_description}
                    </p>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-[#033F99] font-bold">
                      {lead.quantity?.toLocaleString()} {lead.uom}
                    </p>
                  </td>
                  <td className="px-6 py-5">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold border-2 ${getStageBadge(lead.current_stage)}`}
                    >
                      {lead.current_stage}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span
                      className={`inline-flex px-4 py-2 rounded-xl text-sm font-bold shadow-md ${getStatusBadge(lead.status)}`}
                    >
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-[#033F99] font-medium">
                      {lead.assigned_to_name || "Unassigned"}
                    </p>
                    <p className="text-xs text-[#033F99]/70">
                      {lead.assigned_to_role || ""}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredLeads.length === 0 && (
          <div className="p-16 text-center">
            <div className="inline-flex p-6 bg-[#C4D9F4] rounded-full mb-4">
              <Users className="h-12 w-12 text-[#033F99]" />
            </div>
            <h3 className="text-2xl font-bold text-[#033F99] mb-2">
              No leads found
            </h3>
            <p className="text-[#033F99] mb-6">
              Create your first manufacturing lead to get started
            </p>
            <button
              onClick={() => navigate("/commerce/lead/create")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#033F99] to-[#033F99] hover:from-[#022E75] hover:to-[#022E75] text-white font-bold rounded-xl shadow-lg transition-all"
            >
              <Plus className="h-5 w-5" />
              Create Lead
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadList;
