import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Users,
  Mail,
  Phone,
  Building2,
  ArrowRight,
  Star,
  TrendingUp,
  Zap,
  Target,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  DollarSign,
  Activity,
  Sparkles,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const LeadListWorldClass = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [viewMode, setViewMode] = useState("kanban"); // kanban or list
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

  const groupedLeads = {
    New: filteredLeads.filter((l) => l.status === "New"),
    Active: filteredLeads.filter((l) => l.status === "Active"),
    Qualified: filteredLeads.filter((l) => l.status === "Qualified"),
    Converted: filteredLeads.filter((l) => l.status === "Converted"),
  };

  const stats = {
    total: leads.length,
    highPriority: leads.filter((l) => l.priority === "High").length,
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return {
          gradient: "from-rose-500 to-pink-500",
          bg: "bg-rose-50",
          text: "text-rose-700",
          border: "border-rose-200",
          ring: "ring-rose-500/20",
        };
      case "Medium":
        return {
          gradient: "from-amber-500 to-orange-500",
          bg: "bg-amber-50",
          text: "text-amber-700",
          border: "border-amber-200",
          ring: "ring-amber-500/20",
        };
      case "Low":
        return {
          gradient: "from-blue-500 to-cyan-500",
          bg: "bg-[rgba(3,63,153,0.08)]",
          text: "text-blue-700",
          border: "border-[rgba(3,63,153,0.25)]",
          ring: "ring-blue-500/20",
        };
      default:
        return {
          gradient: "from-gray-400 to-gray-500",
          bg: "bg-gray-50",
          text: "text-gray-600",
          border: "border-gray-200",
          ring: "ring-gray-500/20",
        };
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "New":
        return {
          bg: "bg-blue-100",
          text: "text-blue-700",
          dot: "bg-[rgba(3,63,153,0.08)]0",
        };
      case "Active":
        return {
          bg: "bg-purple-100",
          text: "text-purple-700",
          dot: "bg-purple-500",
        };
      case "Qualified":
        return {
          bg: "bg-emerald-100",
          text: "text-emerald-700",
          dot: "bg-emerald-500",
        };
      case "Converted":
        return { bg: "bg-teal-100", text: "text-teal-700", dot: "bg-teal-500" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center mb-4">
            <div className="w-16 h-16 border-4 border-[rgba(3,63,153,0.25)] border-t-blue-600 rounded-full animate-spin"></div>
            <Sparkles className="absolute w-8 h-8 text-[#033F99] animate-pulse" />
          </div>
          <p className="text-gray-600 font-semibold">
            Loading your pipeline...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      {/* Floating Header with Glass Effect */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-200/50 shadow-sm">
        <div className="max-w-[1800px] mx-auto px-8 py-5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-blue-500/30 animate-gradient">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800">
                  Sales Pipeline
                </h1>
                <p className="text-sm text-gray-600 font-medium">
                  Manage your opportunities & close more deals
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("/commerce/lead/create")}
              className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-2">
                <Plus className="w-5 h-5" />
                <span>New Lead</span>
              </div>
            </button>
          </div>

          {/* Animated Stats Cards */}
          <div className="grid grid-cols-4 gap-4">
            {[
              {
                label: "Total Leads",
                value: stats.total,
                icon: Users,
                gradient: "from-blue-500 to-cyan-500",
                bgColor: "bg-[rgba(3,63,153,0.08)]",
              },
              {
                label: "Hot Leads",
                value: stats.highPriority,
                icon: Zap,
                gradient: "from-rose-500 to-pink-500",
                bgColor: "bg-rose-50",
              },
              {
                label: "Active",
                value: stats.active,
                icon: Activity,
                gradient: "from-purple-500 to-pink-500",
                bgColor: "bg-purple-50",
              },
              {
                label: "Avg Score",
                value: stats.avgScore + "/100",
                icon: Target,
                gradient: "from-emerald-500 to-teal-500",
                bgColor: "bg-emerald-50",
              },
            ].map((stat, index) => (
              <div
                key={`item-${index}`}
                className="group relative bg-white rounded-2xl p-5 border border-gray-200/50 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-100/50 to-transparent rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-black text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-8 py-6">
        {/* Toolbar */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-sm border border-gray-200/50 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all text-sm font-medium"
                />
              </div>

              <div className="flex items-center gap-2">
                {[
                  {
                    id: "all",
                    label: "All",
                    gradient: "from-gray-600 to-gray-700",
                  },
                  {
                    id: "high",
                    label: "Hot 🔥",
                    gradient: "from-rose-500 to-pink-500",
                  },
                  {
                    id: "medium",
                    label: "Warm ⚡",
                    gradient: "from-amber-500 to-orange-500",
                  },
                  {
                    id: "active",
                    label: "Active ✨",
                    gradient: "from-purple-500 to-pink-500",
                  },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                      selectedFilter === filter.id
                        ? `bg-gradient-to-r ${filter.gradient} text-white shadow-lg`
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => setViewMode("kanban")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  viewMode === "kanban"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Kanban
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  viewMode === "list"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Kanban View */}
        {viewMode === "kanban" ? (
          <div className="grid grid-cols-4 gap-5">
            {Object.entries(groupedLeads).map(([status, statusLeads]) => {
              const statusColors = getStatusColor(status);
              return (
                <div key={status} className="flex flex-col h-full">
                  <div
                    className={`flex items-center justify-between p-4 ${statusColors.bg} rounded-t-2xl border-2 border-b-0 ${statusColors.bg.replace("100", "200")}`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${statusColors.dot} animate-pulse`}
                      ></div>
                      <h3
                        className={`text-sm font-black uppercase tracking-wide ${statusColors.text}`}
                      >
                        {status}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusColors.bg} ${statusColors.text}`}
                      >
                        {statusLeads.length}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 bg-white/50 backdrop-blur-sm rounded-b-2xl border-2 border-t-0 border-gray-200/50 p-3 space-y-3 min-h-[600px]">
                    {statusLeads.map((lead) => {
                      const priorityColors = getPriorityColor(lead.priority);
                      return (
                        <div
                          key={lead.id}
                          onMouseEnter={() => setHoveredCard(lead.id)}
                          onMouseLeave={() => setHoveredCard(null)}
                          onClick={() => navigate(`/commerce/lead/${lead.id}`)}
                          className="group relative bg-white rounded-xl p-4 border-2 border-gray-200/50 hover:border-blue-300 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
                        >
                          {/* Priority Indicator */}
                          <div
                            className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${priorityColors.gradient} rounded-t-xl`}
                          ></div>

                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-gray-900 truncate group-hover:text-[#033F99] transition-colors">
                                  {lead.customer_name}
                                </h4>
                                {lead.lead_score >= 70 && (
                                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-gray-500 font-mono">
                                {lead.rfq_number}
                              </p>
                            </div>

                            <div
                              className={`opacity-0 group-hover:opacity-100 transition-all duration-200 ${hoveredCard === lead.id ? "scale-100" : "scale-0"}`}
                            >
                              <button
                                onClick={(e) => e.stopPropagation()}
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <MoreVertical className="w-4 h-4 text-gray-400" />
                              </button>
                            </div>
                          </div>

                          {/* Contact Info */}
                          <div className="space-y-2 mb-3">
                            {lead.contact_person && (
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <Users className="w-3.5 h-3.5 text-gray-400" />
                                <span className="truncate">
                                  {lead.contact_person}
                                </span>
                              </div>
                            )}
                            {lead.contact_email && (
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <Mail className="w-3.5 h-3.5 text-gray-400" />
                                <span className="truncate">
                                  {lead.contact_email}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Priority Badge */}
                          {lead.priority && (
                            <div className="mb-3">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${priorityColors.bg} ${priorityColors.text} border ${priorityColors.border}`}
                              >
                                <div
                                  className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${priorityColors.gradient}`}
                                ></div>
                                {lead.priority}
                              </span>
                            </div>
                          )}

                          {/* Score Bar */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600 font-medium">
                                Score
                              </span>
                              <span className="font-bold text-gray-900">
                                {lead.lead_score || 0}%
                              </span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000"
                                style={{ width: `${lead.lead_score || 0}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Hover Action */}
                          <div
                            className={`absolute bottom-3 right-3 transition-all duration-200 ${hoveredCard === lead.id ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
                          >
                            <div className="flex items-center gap-1">
                              <button className="p-1.5 text-blue-700 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg">
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button className="p-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-lg">
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-black text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLeads.map((lead) => {
                  const priorityColors = getPriorityColor(lead.priority);
                  const statusColors = getStatusColor(lead.status);
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => navigate(`/commerce/lead/${lead.id}`)}
                      className="hover:bg-[rgba(3,63,153,0.08)]/30 cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg bg-gradient-to-br ${priorityColors.gradient} flex items-center justify-center shadow-md`}
                          >
                            <span className="text-white font-bold text-sm">
                              {lead.customer_name?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 group-hover:text-[#033F99] transition-colors">
                              {lead.customer_name}
                            </div>
                            <div className="text-xs text-gray-500 font-mono">
                              {lead.rfq_number}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 font-medium">
                          {lead.contact_person}
                        </div>
                        <div className="text-xs text-gray-500">
                          {lead.contact_email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusColors.bg} ${statusColors.text}`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${statusColors.dot}`}
                          ></div>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {lead.priority && (
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold ${priorityColors.bg} ${priorityColors.text} border ${priorityColors.border}`}
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${priorityColors.gradient}`}
                            ></div>
                            {lead.priority}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden max-w-[100px]">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
                              style={{ width: `${lead.lead_score || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold text-gray-900 w-12 text-right">
                            {lead.lead_score || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 hover:bg-blue-100 rounded-lg transition-colors">
                            <Eye className="w-4 h-4 text-[#033F99]" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Edit2 className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {filteredLeads.length === 0 && (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-200">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No leads found
            </h3>
            <p className="text-gray-600 mb-6">
              Start building your pipeline by creating your first lead
            </p>
            <button
              onClick={() => navigate("/commerce/lead/create")}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5 inline-block mr-2" />
              Create Your First Lead
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes gradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default LeadListWorldClass;
