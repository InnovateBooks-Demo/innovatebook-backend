import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Filter,
  TrendingUp,
  Zap,
  Star,
  Eye,
  Edit2,
  Mail,
  Phone,
  Calendar,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Target,
  Award,
  ChevronRight,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const LeadListStunning = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [hoveredLead, setHoveredLead] = useState(null);

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
      lead.rfq_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contact_email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || lead.status === selectedStatus;
    const matchesPriority =
      selectedPriority === "all" || lead.priority === selectedPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusConfig = (status) => {
    const configs = {
      New: {
        gradient: "from-blue-400 via-cyan-400 to-teal-400",
        bg: "bg-gradient-to-r from-blue-500/10 to-cyan-500/10",
        text: "text-[#033F99]",
        icon: Sparkles,
        glow: "shadow-blue-500/20",
      },
      Active: {
        gradient: "from-purple-400 via-pink-400 to-rose-400",
        bg: "bg-gradient-to-r from-purple-500/10 to-pink-500/10",
        text: "text-purple-600",
        icon: Zap,
        glow: "shadow-purple-500/20",
      },
      Qualified: {
        gradient: "from-emerald-400 via-green-400 to-teal-400",
        bg: "bg-gradient-to-r from-emerald-500/10 to-green-500/10",
        text: "text-emerald-600",
        icon: Award,
        glow: "shadow-emerald-500/20",
      },
      Converted: {
        gradient: "from-amber-400 via-orange-400 to-rose-400",
        bg: "bg-gradient-to-r from-amber-500/10 to-orange-500/10",
        text: "text-amber-600",
        icon: Target,
        glow: "shadow-amber-500/20",
      },
    };
    return configs[status] || configs["New"];
  };

  const getPriorityConfig = (priority) => {
    const configs = {
      High: {
        color: "from-red-500 to-pink-500",
        text: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-200",
      },
      Medium: {
        color: "from-amber-500 to-orange-500",
        text: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-200",
      },
      Low: {
        color: "from-blue-500 to-cyan-500",
        text: "text-[#033F99]",
        bg: "bg-[rgba(3,63,153,0.08)]",
        border: "border-[rgba(3,63,153,0.25)]",
      },
    };
    return configs[priority] || configs["Medium"];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute w-24 h-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-xl opacity-60 animate-pulse"></div>
            <div className="relative w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          </div>
          <p className="text-white/90 font-semibold text-lg">
            Loading your pipeline...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      <div className="relative z-10">
        {/* Glass Header */}
        <div className="sticky top-0 z-50 backdrop-blur-2xl bg-white/60 border-b border-white/20 shadow-xl shadow-purple-500/5">
          <div className="max-w-[1600px] mx-auto px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                    <TrendingUp className="w-8 h-8 text-white relative z-10" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-purple-800 to-pink-600 bg-clip-text text-transparent">
                    Lead Pipeline
                  </h1>
                  <p className="text-sm text-slate-600 font-medium">
                    {filteredLeads.length} opportunities • Close more deals
                    faster
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate("/commerce/lead/create")}
                className="group relative px-6 py-3.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold rounded-xl overflow-hidden shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  <span>New Lead</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-lg">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search leads by name, email, or RFQ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/80 backdrop-blur-xl border-2 border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-lg shadow-slate-200/50 transition-all text-sm font-medium placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-3.5 bg-white/80 backdrop-blur-xl border-2 border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-lg shadow-slate-200/50 text-sm font-semibold text-slate-700 cursor-pointer hover:border-purple-300 transition-all"
                >
                  <option value="all">All Status</option>
                  <option value="New">🌟 New</option>
                  <option value="Active">⚡ Active</option>
                  <option value="Qualified">🏆 Qualified</option>
                  <option value="Converted">🎯 Converted</option>
                </select>

                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="px-4 py-3.5 bg-white/80 backdrop-blur-xl border-2 border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-lg shadow-slate-200/50 text-sm font-semibold text-slate-700 cursor-pointer hover:border-purple-300 transition-all"
                >
                  <option value="all">All Priority</option>
                  <option value="High">🔥 High</option>
                  <option value="Medium">💫 Medium</option>
                  <option value="Low">💧 Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Lead Cards Grid */}
        <div className="max-w-[1600px] mx-auto px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredLeads.map((lead, index) => {
              const statusConfig = getStatusConfig(lead.status);
              const priorityConfig = getPriorityConfig(lead.priority);
              const StatusIcon = statusConfig.icon;
              const isHovered = hoveredLead === lead.id;

              return (
                <div
                  key={lead.id}
                  onMouseEnter={() => setHoveredLead(lead.id)}
                  onMouseLeave={() => setHoveredLead(null)}
                  onClick={() => navigate(`/commerce/lead/${lead.id}`)}
                  className="group relative bg-white/70 backdrop-blur-2xl rounded-2xl border-2 border-white/50 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden hover:scale-[1.02] hover:-translate-y-1"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Gradient Border Effect */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${statusConfig.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-2xl`}
                  ></div>

                  {/* Priority Ribbon */}
                  <div
                    className={`absolute top-4 -right-10 w-32 py-1 bg-gradient-to-r ${priorityConfig.color} text-white text-xs font-bold text-center transform rotate-45 shadow-lg`}
                  >
                    {lead.priority}
                  </div>

                  <div className="relative p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-14 h-14 rounded-xl bg-gradient-to-br ${statusConfig.gradient} flex items-center justify-center shadow-lg ${statusConfig.glow} group-hover:shadow-xl transition-shadow`}
                        >
                          <span className="text-white font-bold text-xl">
                            {lead.customer_name?.charAt(0)?.toUpperCase() ||
                              "?"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-purple-600 transition-colors">
                            {lead.customer_name}
                          </h3>
                          <p className="text-xs text-slate-500 font-mono">
                            {lead.rfq_number || "No RFQ"}
                          </p>
                        </div>
                      </div>

                      {lead.lead_score >= 70 && (
                        <div className="flex-shrink-0">
                          <Star className="w-6 h-6 text-amber-400 fill-amber-400 animate-pulse" />
                        </div>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${statusConfig.bg} mb-4 shadow-md`}
                    >
                      <StatusIcon className={`w-4 h-4 ${statusConfig.text}`} />
                      <span
                        className={`text-sm font-bold ${statusConfig.text}`}
                      >
                        {lead.status}
                      </span>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 mb-4">
                      {lead.contact_person && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                            <Mail className="w-3.5 h-3.5 text-slate-600" />
                          </div>
                          <span className="font-medium truncate">
                            {lead.contact_person}
                          </span>
                        </div>
                      )}
                      {lead.contact_email && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                            <Phone className="w-3.5 h-3.5 text-slate-600" />
                          </div>
                          <span className="truncate">{lead.contact_email}</span>
                        </div>
                      )}
                    </div>

                    {/* Lead Score */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                          Lead Score
                        </span>
                        <span className="text-lg font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          {lead.lead_score || 0}%
                        </span>
                      </div>
                      <div className="relative h-3 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full overflow-hidden shadow-inner">
                        <div
                          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${statusConfig.gradient} rounded-full shadow-lg transition-all duration-1000 ease-out`}
                          style={{ width: `${lead.lead_score || 0}%` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent"></div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div
                      className={`flex items-center gap-2 transition-all duration-300 ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/commerce/lead/${lead.id}`);
                        }}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-bold rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/commerce/lead/${lead.id}/edit`);
                        }}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-slate-600 to-slate-700 text-white text-sm font-bold rounded-lg hover:from-slate-700 hover:to-slate-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredLeads.length === 0 && (
            <div className="text-center py-20">
              <div className="relative inline-flex items-center justify-center mb-6">
                <div className="absolute w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-2xl opacity-30"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Search className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                No leads found
              </h3>
              <p className="text-slate-600 mb-8 text-lg">
                {searchTerm ||
                selectedStatus !== "all" ||
                selectedPriority !== "all"
                  ? "Try adjusting your filters to see more results"
                  : "Start building your pipeline by creating your first lead"}
              </p>
              {!searchTerm &&
                selectedStatus === "all" &&
                selectedPriority === "all" && (
                  <button
                    onClick={() => navigate("/commerce/lead/create")}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-105 inline-flex items-center gap-3"
                  >
                    <Plus className="w-5 h-5" />
                    Create Your First Lead
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 6s ease-in-out infinite 3s;
        }
      `}</style>
    </div>
  );
};

export default LeadListStunning;
