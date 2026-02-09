import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Users,
  Mail,
  Building2,
  ArrowUpRight,
  MoreVertical,
  Star,
  LayoutGrid,
  List,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const LeadListPremium = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
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
      lead.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.rfq_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "high" && lead.priority === "High") ||
      (selectedFilter === "active" &&
        (lead.status === "Active" || lead.status === "New"));
    return matchesSearch && matchesFilter;
  });

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

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case "High":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "Medium":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Low":
        return "bg-sky-50 text-sky-700 border-sky-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case "Active":
      case "New":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Converted":
        return "bg-[rgba(3,63,153,0.08)] text-blue-700 border-[rgba(3,63,153,0.25)]";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-solid border-violet-600 border-r-transparent mb-4"></div>
          <p className="text-sm text-gray-500 font-medium">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Ultra-clean header - Linear inspired */}
      <div className="flex-none border-b border-gray-200 bg-white">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
                Leads
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your sales pipeline and opportunities
              </p>
            </div>
            <button
              onClick={() => navigate("/commerce/lead/create")}
              className="group inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-all duration-150 shadow-sm hover:shadow"
            >
              <Plus className="h-4 w-4" />
              <span>New lead</span>
            </button>
          </div>

          {/* Stats bar - Notion inspired */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gray-400"></div>
              <span className="text-sm text-gray-600">All leads</span>
              <span className="text-sm font-semibold text-gray-900">
                {stats.total}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-rose-500"></div>
              <span className="text-sm text-gray-600">High priority</span>
              <span className="text-sm font-semibold text-gray-900">
                {stats.highPriority}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              <span className="text-sm text-gray-600">Active</span>
              <span className="text-sm font-semibold text-gray-900">
                {stats.active}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              <span className="text-sm text-gray-600">Avg score</span>
              <span className="text-sm font-semibold text-gray-900">
                {stats.avgScore}/100
              </span>
            </div>
          </div>
        </div>

        {/* Toolbar - Attio inspired */}
        <div className="px-8 py-3 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 transition-all w-80"
                />
              </div>

              {/* Quick filters */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedFilter("all")}
                  className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                    selectedFilter === "all"
                      ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                      : "text-gray-600 hover:bg-white hover:text-gray-900"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedFilter("high")}
                  className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                    selectedFilter === "high"
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : "text-gray-600 hover:bg-rose-50 hover:text-rose-700"
                  }`}
                >
                  High priority
                </button>
                <button
                  onClick={() => setSelectedFilter("active")}
                  className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                    selectedFilter === "active"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
                >
                  Active
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:bg-white hover:text-gray-900"
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:bg-white hover:text-gray-900"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content area with perfect spacing */}
      <div className="flex-1 overflow-auto px-8 py-6">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                onClick={() => navigate(`/commerce/lead/${lead.id}`)}
                className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-violet-300 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-200 cursor-pointer"
              >
                {/* Card header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-gray-900 truncate group-hover:text-violet-600 transition-colors">
                        {lead.customer_name}
                      </h3>
                      {lead.lead_score >= 70 && (
                        <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 font-mono">
                      {lead.rfq_number}
                    </p>
                  </div>
                  <button className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-100 rounded transition-all">
                    <MoreVertical className="h-4 w-4 text-gray-400" />
                  </button>
                </div>

                {/* Contact details */}
                <div className="space-y-2 mb-4">
                  {lead.contact_person && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{lead.contact_person}</span>
                    </div>
                  )}
                  {lead.contact_email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{lead.contact_email}</span>
                    </div>
                  )}
                  {lead.customer_industry && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building2 className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{lead.customer_industry}</span>
                    </div>
                  )}
                </div>

                {/* Status badges */}
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getStatusStyles(lead.status)}`}
                  >
                    {lead.status}
                  </span>
                  {lead.priority && (
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getPriorityStyles(lead.priority)}`}
                    >
                      {lead.priority}
                    </span>
                  )}
                </div>

                {/* Footer with score */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1">
                      <div className="h-1 w-16 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                          style={{ width: `${lead.lead_score || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        {lead.lead_score || 0}
                      </span>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-violet-600 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List view */
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Industry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => navigate(`/commerce/lead/${lead.id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {lead.customer_name}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            {lead.rfq_number}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {lead.contact_person}
                      </div>
                      <div className="text-xs text-gray-500">
                        {lead.contact_email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {lead.customer_industry}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 rounded-md text-xs font-medium border ${getStatusStyles(lead.status)}`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {lead.priority && (
                        <span
                          className={`inline-flex px-2 py-1 rounded-md text-xs font-medium border ${getPriorityStyles(lead.priority)}`}
                        >
                          {lead.priority}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                            style={{ width: `${lead.lead_score || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium text-gray-600">
                          {lead.lead_score || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ArrowUpRight className="h-4 w-4 text-gray-400 hover:text-violet-600 inline-block" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty state */}
        {filteredLeads.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No leads found
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Get started by creating your first lead
            </p>
            <button
              onClick={() => navigate("/commerce/lead/create")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Create lead</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadListPremium;
