import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  SlidersHorizontal,
  Eye,
  Edit2,
  Mail,
  Phone,
  Building2,
  Calendar,
  TrendingUp,
  ChevronRight,
  CheckCircle2,
  Clock,
  Star,
  MoreVertical,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const LeadListProfessional = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [hoveredRow, setHoveredRow] = useState(null);

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

  const getStatusStyle = (status) => {
    const styles = {
      New: {
        bg: "bg-amber-50/80",
        text: "text-amber-800",
        border: "border-amber-200/60",
        dot: "bg-amber-600",
      },
      Active: {
        bg: "bg-[rgba(3,63,153,0.08)]/80",
        text: "text-blue-800",
        border: "border-[rgba(3,63,153,0.25)]/60",
        dot: "text-blue-700",
      },
      Qualified: {
        bg: "bg-emerald-50/80",
        text: "text-emerald-800",
        border: "border-emerald-200/60",
        dot: "bg-emerald-600",
      },
      Converted: {
        bg: "bg-slate-50/80",
        text: "text-slate-700",
        border: "border-slate-200/60",
        dot: "bg-slate-600",
      },
    };
    return styles[status] || styles["New"];
  };

  const getPriorityStyle = (priority) => {
    const styles = {
      High: {
        bg: "bg-rose-50/80",
        text: "text-rose-800",
        border: "border-rose-200/60",
        accent: "bg-rose-600",
      },
      Medium: {
        bg: "bg-orange-50/80",
        text: "text-orange-800",
        border: "border-orange-200/60",
        accent: "bg-orange-600",
      },
      Low: {
        bg: "bg-stone-50/80",
        text: "text-stone-700",
        border: "border-stone-200/60",
        accent: "bg-stone-600",
      },
    };
    return styles[priority] || styles["Medium"];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-cream-50 to-stone-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-amber-200 border-t-amber-600 rounded-full animate-spin mb-4"></div>
          <p className="text-stone-600 font-medium">Loading your pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-cream-50 to-stone-50/30">
      {/* Professional Header */}
      <div className="border-b border-stone-200/60 bg-white/80 backdrop-blur-sm">
        <div className="max-w-[1400px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-stone-900 mb-1">
                Lead Pipeline
              </h1>
              <p className="text-sm text-stone-600">
                {filteredLeads.length}{" "}
                {filteredLeads.length === 1 ? "opportunity" : "opportunities"}{" "}
                in your pipeline
              </p>
            </div>

            <button
              onClick={() => navigate("/commerce/lead/create")}
              className="group flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span className="font-medium">New Lead</span>
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-2 group-hover:ml-0 transition-all" />
            </button>
          </div>

          {/* Search and Filters Bar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search by company, contact, or RFQ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200/60 rounded-lg text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-300 transition-all"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2.5 bg-white border border-stone-200/60 rounded-lg text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-300 transition-all cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="New">New</option>
              <option value="Active">Active</option>
              <option value="Qualified">Qualified</option>
              <option value="Converted">Converted</option>
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-4 py-2.5 bg-white border border-stone-200/60 rounded-lg text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-300 transition-all cursor-pointer"
            >
              <option value="all">All Priority</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Elegant Table */}
      <div className="max-w-[1400px] mx-auto px-8 py-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-stone-200/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-200/60 bg-gradient-to-r from-stone-50/50 to-amber-50/30">
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
                      Company
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
                      Contact
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
                      Status
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
                      Priority
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
                      Lead Score
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
                      RFQ Number
                    </span>
                  </th>
                  <th className="px-6 py-4 text-right">
                    <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
                      Actions
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100/60">
                {filteredLeads.map((lead) => {
                  const statusStyle = getStatusStyle(lead.status);
                  const priorityStyle = getPriorityStyle(lead.priority);
                  const isHovered = hoveredRow === lead.id;

                  return (
                    <tr
                      key={lead.id}
                      onMouseEnter={() => setHoveredRow(lead.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      onClick={() => navigate(`/commerce/lead/${lead.id}`)}
                      className="group cursor-pointer transition-all duration-200 hover:bg-amber-50/40"
                    >
                      {/* Company */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-100 to-stone-100 flex items-center justify-center border border-stone-200/40">
                            <span className="text-sm font-semibold text-stone-700">
                              {lead.customer_name?.charAt(0)?.toUpperCase() ||
                                "?"}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-stone-900 truncate group-hover:text-amber-900 transition-colors">
                              {lead.customer_name}
                            </div>
                            {lead.lead_score >= 70 && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <Star className="w-3 h-3 text-amber-600 fill-amber-600" />
                                <span className="text-xs text-amber-700 font-medium">
                                  High Value
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-stone-800">
                            {lead.contact_person || "—"}
                          </div>
                          {lead.contact_email && (
                            <div className="text-xs text-stone-500 mt-0.5 truncate max-w-xs">
                              {lead.contact_email}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${statusStyle.bg} ${statusStyle.border}`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}
                          ></div>
                          <span
                            className={`text-xs font-semibold ${statusStyle.text}`}
                          >
                            {lead.status}
                          </span>
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="px-6 py-4">
                        {lead.priority ? (
                          <div
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${priorityStyle.bg} ${priorityStyle.border}`}
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${priorityStyle.accent}`}
                            ></div>
                            <span
                              className={`text-xs font-semibold ${priorityStyle.text}`}
                            >
                              {lead.priority}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-stone-400">—</span>
                        )}
                      </td>

                      {/* Lead Score */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 max-w-[120px]">
                            <div className="h-2 bg-stone-100 rounded-full overflow-hidden border border-stone-200/40">
                              <div
                                className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-500 rounded-full"
                                style={{ width: `${lead.lead_score || 0}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-stone-900 min-w-[3ch] text-right">
                            {lead.lead_score || 0}
                          </span>
                        </div>
                      </td>

                      {/* RFQ */}
                      <td className="px-6 py-4">
                        <span className="text-sm text-stone-600 font-mono">
                          {lead.rfq_number || "—"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div
                          className={`flex items-center justify-end gap-2 transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"}`}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/commerce/lead/${lead.id}`);
                            }}
                            className="p-2 hover:bg-amber-50 rounded-lg transition-colors"
                            title="View Lead"
                          >
                            <Eye className="w-4 h-4 text-stone-600" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/commerce/lead/${lead.id}/edit`);
                            }}
                            className="p-2 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Edit Lead"
                          >
                            <Edit2 className="w-4 h-4 text-stone-600" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            className="p-2 hover:bg-amber-50 rounded-lg transition-colors"
                            title="More Options"
                          >
                            <MoreVertical className="w-4 h-4 text-stone-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Elegant Empty State */}
        {filteredLeads.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-amber-100 to-stone-100 flex items-center justify-center border border-stone-200/60">
              <Search className="w-8 h-8 text-stone-400" />
            </div>
            <h3 className="text-lg font-semibold text-stone-900 mb-2">
              No leads found
            </h3>
            <p className="text-sm text-stone-600 mb-6">
              {searchTerm ||
              selectedStatus !== "all" ||
              selectedPriority !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by creating your first lead"}
            </p>
            {!searchTerm &&
              selectedStatus === "all" &&
              selectedPriority === "all" && (
                <button
                  onClick={() => navigate("/commerce/lead/create")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg transition-all shadow-sm hover:shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span className="font-medium">Create Your First Lead</span>
                </button>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadListProfessional;
