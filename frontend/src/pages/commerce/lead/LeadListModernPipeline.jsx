import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Filter,
  SlidersHorizontal,
  LayoutGrid,
  List,
  TrendingUp,
  Star,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Eye,
  Edit2,
  ChevronDown,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const LeadListModernPipeline = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("kanban"); // 'kanban' or 'list'
  const [selectedFilter, setSelectedFilter] = useState("all");

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
      lead.contact_person?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      selectedFilter === "all" || lead.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getLeadsByStatus = (status) => {
    return filteredLeads.filter((lead) => lead.status === status);
  };

  const statuses = ["New", "Active", "Qualified", "Converted"];

  const getStatusColor = (status) => {
    const colors = {
      New: {
        bg: "bg-[rgba(3,63,153,0.08)]0",
        light: "bg-[rgba(3,63,153,0.08)]",
        border: "border-blue-300",
        text: "text-blue-700",
      },
      Active: {
        bg: "bg-green-500",
        light: "bg-green-50",
        border: "border-green-300",
        text: "text-green-700",
      },
      Qualified: {
        bg: "bg-purple-500",
        light: "bg-purple-50",
        border: "border-purple-300",
        text: "text-purple-700",
      },
      Converted: {
        bg: "bg-gray-500",
        light: "bg-gray-50",
        border: "border-gray-300",
        text: "text-gray-700",
      },
    };
    return colors[status] || colors["New"];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-3 text-gray-600 font-medium">Loading pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Modern Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Sales Pipeline
                </h1>
                <p className="text-sm text-gray-600">
                  {filteredLeads.length} active opportunities • $
                  {filteredLeads.reduce(
                    (sum, l) => sum + (l.lead_score || 0),
                    0,
                  )}{" "}
                  total score
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/commerce/lead/create")}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Lead
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-80 pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors text-sm">
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>
            </div>

            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("kanban")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === "kanban"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                Kanban
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === "list"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <List className="w-4 h-4" />
                List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {viewMode === "kanban" ? (
          /* Kanban View */
          <div className="flex gap-4 overflow-x-auto pb-4">
            {statuses.map((status) => {
              const statusLeads = getLeadsByStatus(status);
              const statusColor = getStatusColor(status);

              return (
                <div key={status} className="flex-shrink-0 w-80">
                  {/* Column Header */}
                  <div
                    className={`${statusColor.light} ${statusColor.border} border-2 rounded-t-xl p-4`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${statusColor.bg}`}
                        ></div>
                        <h3 className={`font-bold text-sm ${statusColor.text}`}>
                          {status}
                        </h3>
                      </div>
                      <span
                        className={`px-2 py-1 ${statusColor.bg} text-white text-xs font-bold rounded-full`}
                      >
                        {statusLeads.length}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Total Score:{" "}
                      {statusLeads.reduce(
                        (sum, l) => sum + (l.lead_score || 0),
                        0,
                      )}
                    </p>
                  </div>

                  {/* Cards */}
                  <div className="bg-gray-100 rounded-b-xl p-3 space-y-3 min-h-[600px]">
                    {statusLeads.map((lead) => (
                      <div
                        key={lead.id}
                        onClick={() => navigate(`/commerce/lead/${lead.id}`)}
                        className="group bg-white rounded-xl p-4 shadow-sm hover:shadow-lg border border-gray-200 hover:border-blue-300 cursor-pointer transition-all duration-200"
                      >
                        {/* Card Header */}
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-gray-900 text-sm leading-tight flex-1 pr-2 group-hover:text-[#033F99] transition-colors">
                            {lead.customer_name}
                          </h4>
                          {lead.lead_score >= 70 && (
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                          )}
                        </div>

                        {/* Score */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>Lead Score</span>
                            <span className="font-bold text-gray-900">
                              {lead.lead_score || 0}
                            </span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${statusColor.bg} transition-all`}
                              style={{ width: `${lead.lead_score || 0}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Contact */}
                        <div className="space-y-2 mb-3">
                          {lead.contact_person && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <Mail className="w-3.5 h-3.5" />
                              <span className="truncate">
                                {lead.contact_person}
                              </span>
                            </div>
                          )}
                          {lead.contact_phone && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <Phone className="w-3.5 h-3.5" />
                              <span>{lead.contact_phone}</span>
                            </div>
                          )}
                        </div>

                        {/* Priority Badge */}
                        {lead.priority && (
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                lead.priority === "High"
                                  ? "bg-red-100 text-red-700"
                                  : lead.priority === "Medium"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {lead.priority}
                            </span>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/commerce/lead/${lead.id}`);
                            }}
                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-[rgba(3,63,153,0.08)] hover:bg-blue-100 text-blue-700 text-xs font-medium rounded transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/commerce/lead/${lead.id}/edit`);
                            }}
                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-medium rounded transition-colors"
                          >
                            <Edit2 className="w-3 h-3" />
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                    Company
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                    Priority
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                    Score
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLeads.map((lead) => {
                  const statusColor = getStatusColor(lead.status);

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => navigate(`/commerce/lead/${lead.id}`)}
                      className="hover:bg-gray-50 cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg ${statusColor.bg} flex items-center justify-center`}
                          >
                            <span className="text-sm font-bold text-white">
                              {lead.customer_name?.charAt(0)?.toUpperCase() ||
                                "?"}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-sm group-hover:text-[#033F99]">
                              {lead.customer_name}
                            </div>
                            {lead.lead_score >= 70 && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                <span className="text-xs text-amber-600">
                                  High Value
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {lead.contact_person || "—"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {lead.contact_email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusColor.light} ${statusColor.text} border ${statusColor.border}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${statusColor.bg}`}
                          ></span>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {lead.priority && (
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              lead.priority === "High"
                                ? "bg-red-100 text-red-700"
                                : lead.priority === "Medium"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {lead.priority}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${statusColor.bg}`}
                              style={{ width: `${lead.lead_score || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {lead.lead_score || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/commerce/lead/${lead.id}`);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/commerce/lead/${lead.id}/edit`);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                          >
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
      </div>
    </div>
  );
};

export default LeadListModernPipeline;
