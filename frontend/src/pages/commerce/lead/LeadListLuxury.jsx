import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Users,
  Mail,
  Phone,
  Building2,
  ArrowUpRight,
  Star,
  TrendingUp,
  Zap,
  Target,
  Award,
  Eye,
  Edit2,
  Sparkles,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const LeadListLuxury = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [hoveredCard, setHoveredCard] = useState(null);

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
      setLeads(response.data.leads || []);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load leads");
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.rfq_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "high" && lead.priority === "High") ||
      (selectedFilter === "medium" && lead.priority === "Medium") ||
      (selectedFilter === "active" &&
        (lead.status === "Active" || lead.status === "New"));
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: leads.length,
    highPriority: leads.filter((l) => l.priority === "High").length,
    mediumPriority: leads.filter((l) => l.priority === "Medium").length,
    active: leads.filter((l) => l.status === "Active" || l.status === "New")
      .length,
    avgScore:
      leads.length > 0
        ? (
            leads.reduce((sum, l) => sum + (l.lead_score || 0), 0) /
            leads.length
          ).toFixed(0)
        : 0,
  };

  const getPriorityGradient = (priority) => {
    switch (priority) {
      case "High":
        return "from-red-500 via-rose-500 to-pink-500";
      case "Medium":
        return "from-amber-500 via-orange-500 to-yellow-500";
      case "Low":
        return "from-blue-500 via-cyan-500 to-teal-500";
      default:
        return "from-gray-400 via-gray-500 to-gray-600";
    }
  };

  const getPriorityGlow = (priority) => {
    switch (priority) {
      case "High":
        return "shadow-red-500/50";
      case "Medium":
        return "shadow-amber-500/50";
      case "Low":
        return "shadow-blue-500/50";
      default:
        return "shadow-gray-500/50";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="inline-block h-20 w-20 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent shadow-2xl shadow-purple-500/50"></div>
            <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-xl animate-pulse"></div>
          </div>
          <p className="mt-6 text-white font-semibold text-lg">
            Loading your pipeline...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[rgba(3,63,153,0.08)]0/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 p-8">
        {/* Premium Header with Glassmorphism */}
        <div className="mb-8">
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 flex items-center justify-center shadow-2xl shadow-purple-500/50">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 blur-lg opacity-50 animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
                    <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                      Sales Pipeline
                    </span>
                  </h1>
                  <p className="text-purple-200 font-medium">
                    Transform prospects into revenue
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate("/commerce/lead/create")}
                className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white font-bold rounded-2xl shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/80 transition-all duration-300 hover:scale-105 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-3">
                  <Plus className="h-6 w-6" />
                  <span className="text-lg">Create New Lead</span>
                </div>
              </button>
            </div>

            {/* Premium Stats Cards */}
            <div className="grid grid-cols-4 gap-6">
              <div className="group relative backdrop-blur-xl bg-gradient-to-br from-white/20 to-white/10 rounded-2xl p-6 border border-white/30 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/50">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                  </div>
                  <p className="text-purple-200 text-sm font-semibold mb-2 uppercase tracking-wider">
                    Total Leads
                  </p>
                  <p className="text-5xl font-black text-white mb-1">
                    {stats.total}
                  </p>
                  <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      style={{ width: "75%" }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="group relative backdrop-blur-xl bg-gradient-to-br from-white/20 to-white/10 rounded-2xl p-6 border border-white/30 hover:border-rose-400/50 transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center shadow-lg shadow-rose-500/50">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></div>
                      <span className="text-xs text-rose-300 font-bold">
                        HOT
                      </span>
                    </div>
                  </div>
                  <p className="text-purple-200 text-sm font-semibold mb-2 uppercase tracking-wider">
                    High Priority
                  </p>
                  <p className="text-5xl font-black text-white mb-1">
                    {stats.highPriority}
                  </p>
                  <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 to-red-500 rounded-full"
                      style={{
                        width: `${(stats.highPriority / stats.total) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="group relative backdrop-blur-xl bg-gradient-to-br from-white/20 to-white/10 rounded-2xl p-6 border border-white/30 hover:border-amber-400/50 transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/50">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
                      <span className="text-xs text-amber-300 font-bold">
                        WARM
                      </span>
                    </div>
                  </div>
                  <p className="text-purple-200 text-sm font-semibold mb-2 uppercase tracking-wider">
                    Medium Priority
                  </p>
                  <p className="text-5xl font-black text-white mb-1">
                    {stats.mediumPriority}
                  </p>
                  <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                      style={{
                        width: `${(stats.mediumPriority / stats.total) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="group relative backdrop-blur-xl bg-gradient-to-br from-white/20 to-white/10 rounded-2xl p-6 border border-white/30 hover:border-emerald-400/50 transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/50">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                  </div>
                  <p className="text-purple-200 text-sm font-semibold mb-2 uppercase tracking-wider">
                    Avg Score
                  </p>
                  <p className="text-5xl font-black text-white mb-1">
                    {stats.avgScore}
                    <span className="text-2xl text-purple-300">/100</span>
                  </p>
                  <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                      style={{ width: `${stats.avgScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters - Glassmorphism */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 shadow-xl mb-8">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-300 group-hover:text-purple-200 transition-colors" />
              <input
                type="text"
                placeholder="Search leads by company, contact, or RFQ number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-2xl text-white placeholder-purple-300 focus:outline-none focus:border-purple-400 focus:bg-white/20 transition-all text-lg font-medium shadow-inner"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedFilter("all")}
                className={`px-6 py-4 rounded-xl font-bold transition-all duration-300 ${
                  selectedFilter === "all"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50"
                    : "bg-white/10 text-purple-200 hover:bg-white/20"
                }`}
              >
                All Leads
              </button>
              <button
                onClick={() => setSelectedFilter("high")}
                className={`px-6 py-4 rounded-xl font-bold transition-all duration-300 ${
                  selectedFilter === "high"
                    ? "bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-500/50"
                    : "bg-white/10 text-purple-200 hover:bg-white/20"
                }`}
              >
                🔥 High Priority
              </button>
              <button
                onClick={() => setSelectedFilter("medium")}
                className={`px-6 py-4 rounded-xl font-bold transition-all duration-300 ${
                  selectedFilter === "medium"
                    ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/50"
                    : "bg-white/10 text-purple-200 hover:bg-white/20"
                }`}
              >
                ⚡ Medium
              </button>
              <button
                onClick={() => setSelectedFilter("active")}
                className={`px-6 py-4 rounded-xl font-bold transition-all duration-300 ${
                  selectedFilter === "active"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/50"
                    : "bg-white/10 text-purple-200 hover:bg-white/20"
                }`}
              >
                ✨ Active
              </button>
            </div>
          </div>
        </div>

        {/* Premium Lead Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeads.map((lead, index) => (
            <div
              key={lead.id}
              onMouseEnter={() => setHoveredCard(lead.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => navigate(`/commerce/lead/${lead.id}`)}
              className="group relative backdrop-blur-xl bg-gradient-to-br from-white/20 to-white/5 rounded-3xl p-6 border border-white/30 hover:border-purple-400/50 shadow-xl hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-500 cursor-pointer transform hover:scale-105 hover:-translate-y-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient border on hover */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl"></div>

              {/* Priority indicator bar */}
              <div
                className={`absolute top-0 left-0 right-0 h-2 rounded-t-3xl bg-gradient-to-r ${getPriorityGradient(lead.priority)} shadow-lg ${getPriorityGlow(lead.priority)}`}
              ></div>

              <div className="relative">
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-black text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-200 group-hover:to-pink-200 group-hover:bg-clip-text transition-all">
                        {lead.customer_name}
                      </h3>
                      {lead.lead_score >= 70 && (
                        <div className="relative">
                          <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                          <div className="absolute inset-0 blur-md bg-amber-400/50"></div>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-purple-300 font-mono font-semibold">
                      {lead.rfq_number}
                    </p>
                  </div>
                  <div
                    className={`opacity-0 group-hover:opacity-100 transition-all duration-300 ${hoveredCard === lead.id ? "scale-100" : "scale-0"}`}
                  >
                    <button className="p-2 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all">
                      <Eye className="h-5 w-5 text-white" />
                    </button>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-3 mb-5">
                  {lead.contact_person && (
                    <div className="flex items-center gap-3 text-purple-100">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                        <Users className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">
                        {lead.contact_person}
                      </span>
                    </div>
                  )}
                  {lead.contact_email && (
                    <div className="flex items-center gap-3 text-purple-100">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                        <Mail className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium truncate">
                        {lead.contact_email}
                      </span>
                    </div>
                  )}
                  {lead.customer_industry && (
                    <div className="flex items-center gap-3 text-purple-100">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">
                        {lead.customer_industry}
                      </span>
                    </div>
                  )}
                </div>

                {/* Status and Priority Badges */}
                <div className="flex items-center gap-3 mb-5">
                  <span className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500/30 to-teal-500/30 backdrop-blur-sm border border-emerald-400/50 text-emerald-200 text-xs font-bold uppercase shadow-lg shadow-emerald-500/20">
                    {lead.status}
                  </span>
                  {lead.priority && (
                    <span
                      className={`px-4 py-2 rounded-xl bg-gradient-to-r ${getPriorityGradient(lead.priority)}/30 backdrop-blur-sm border border-white/50 text-white text-xs font-bold uppercase shadow-lg ${getPriorityGlow(lead.priority)}`}
                    >
                      {lead.priority}
                    </span>
                  )}
                </div>

                {/* Score Progress Bar */}
                <div className="pt-4 border-t border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-purple-200 uppercase tracking-wider">
                      Lead Score
                    </span>
                    <span className="text-lg font-black text-white">
                      {lead.lead_score || 0}
                      <span className="text-sm text-purple-300">/100</span>
                    </span>
                  </div>
                  <div className="relative h-3 bg-white/10 rounded-full overflow-hidden shadow-inner">
                    <div
                      className={`absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-full shadow-lg ${getPriorityGlow(lead.priority)} transition-all duration-1000`}
                      style={{ width: `${lead.lead_score || 0}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Hover Action Button */}
                <div
                  className={`absolute bottom-6 right-6 transition-all duration-300 ${hoveredCard === lead.id ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                >
                  <button className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/80 hover:scale-110 transition-all duration-300">
                    <ArrowUpRight className="h-6 w-6 text-white" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Premium Empty State */}
        {filteredLeads.length === 0 && (
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-16 border border-white/20 shadow-2xl text-center">
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/50">
                <Users className="h-12 w-12 text-white" />
              </div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 blur-2xl opacity-50 animate-pulse"></div>
            </div>
            <h3 className="text-3xl font-black text-white mb-3">
              No leads found
            </h3>
            <p className="text-purple-200 text-lg mb-8">
              Start building your pipeline by creating your first lead
            </p>
            <button
              onClick={() => navigate("/commerce/lead/create")}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white font-bold rounded-2xl shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/80 transition-all duration-300 hover:scale-105"
            >
              <Plus className="h-6 w-6 inline-block mr-2" />
              Create Your First Lead
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadListLuxury;
