import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Users,
  Target,
  RefreshCw,
  CheckCircle,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const LeadList = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 10;

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_URL}/api/commerce/modules/revenue/leads`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success !== false) setLeads(data.leads || data || []);
    } catch (error) {
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        lead.first_name?.toLowerCase().includes(searchLower) ||
        lead.last_name?.toLowerCase().includes(searchLower) ||
        lead.company?.toLowerCase().includes(searchLower) ||
        lead.email?.toLowerCase().includes(searchLower);
      const matchesStatus =
        selectedStatus === "all" || lead.lead_status === selectedStatus;
      const matchesRating =
        selectedRating === "all" || lead.rating === selectedRating;
      return matchesSearch && matchesStatus && matchesRating;
    });
  }, [leads, searchTerm, selectedStatus, selectedRating]);

  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * leadsPerPage;
    return filteredLeads.slice(start, start + leadsPerPage);
  }, [filteredLeads, currentPage]);

  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);
  const uniqueStatuses = [
    ...new Set(leads.map((l) => l.lead_status).filter(Boolean)),
  ];

  const getStatusStyle = (status) => {
    const styles = {
      New: "bg-blue-100 text-blue-700",
      Contacted: "bg-cyan-100 text-cyan-700",
      Qualified: "bg-emerald-100 text-emerald-700",
      "Proposal Sent": "bg-violet-100 text-violet-700",
      Negotiation: "bg-amber-100 text-amber-700",
      Converted: "bg-green-100 text-green-700",
      Lost: "bg-red-100 text-red-700",
    };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-amber-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const formatCurrency = (amount) => {
    if (!amount) return "-";
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-[#3A4E63]" />
      </div>
    );
  }

  return (
    <div className="p-8" data-testid="lead-list">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Lead Management
        </h1>
        <p className="text-slate-600 mb-8">
          Powered by <span className="text-orange-600 font-semibold">Zoho</span>{" "}
          + <span className="text-orange-500 font-semibold">HubSpot</span> +{" "}
          <span className="text-blue-600 font-semibold">Salesforce</span>
        </p>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#3A4E63] rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {leads.length}
                </p>
                <p className="text-sm text-slate-600">Total Leads</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {leads.filter((l) => l.rating === "Hot").length}
                </p>
                <p className="text-sm text-slate-600">Hot Leads</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(
                    leads.reduce((sum, l) => sum + (l.deal_value || 0), 0),
                  )}
                </p>
                <p className="text-sm text-slate-600">Pipeline Value</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {leads.filter((l) => l.lead_status === "Converted").length}
                </p>
                <p className="text-sm text-slate-600">Converted</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">All Leads</h2>
            <button
              onClick={() => navigate("/commerce/lead/create")}
              className="px-4 py-2 bg-[#3A4E63] text-white rounded-lg font-medium hover:bg-[#3A4E63] transition-all"
              data-testid="create-lead-btn"
            >
              + New Lead
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                />
              </div>
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
            >
              <option value="all">All Status</option>
              {uniqueStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
            >
              <option value="all">All Ratings</option>
              <option value="Hot">🔥 Hot</option>
              <option value="Warm">🌡️ Warm</option>
              <option value="Cold">❄️ Cold</option>
            </select>
          </div>

          {/* Leads Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Lead Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Company
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Value
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedLeads.map((lead) => (
                  <tr
                    key={lead.lead_id}
                    onClick={() => navigate(`/commerce/lead/${lead.lead_id}`)}
                    className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#3A4E63] rounded-lg flex items-center justify-center text-white text-xs font-bold">
                          {lead.first_name?.charAt(0)}
                          {lead.last_name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {lead.salutation} {lead.first_name} {lead.last_name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {lead.title || "No title"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-slate-900">{lead.company}</p>
                      <p className="text-xs text-slate-500">
                        {lead.industry || "-"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-slate-900">
                        {lead.email || "-"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {lead.phone || "-"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-slate-900">
                        {formatCurrency(lead.deal_value)}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusStyle(lead.lead_status)}`}
                      >
                        {lead.lead_status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`text-lg font-bold ${getScoreColor(lead.lead_score || 0)}`}
                      >
                        {lead.lead_score || 0}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
              <p className="text-sm text-slate-600">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadList;
