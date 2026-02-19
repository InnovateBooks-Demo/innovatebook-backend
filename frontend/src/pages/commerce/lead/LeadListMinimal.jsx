import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, ChevronRight } from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const LeadListMinimal = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  useEffect(() => {
    fetchLeads();
  }, [filterStatus, filterCategory]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (filterStatus) params.append("status", filterStatus);
      if (filterCategory) params.append("score_category", filterCategory);

      const response = await axios.get(
        `${BACKEND_URL}/api/commerce/leads?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setLeads(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch leads:", error);
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(
    (lead) =>
      lead.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email_address?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const stats = {
    total: leads.length,
    hot: leads.filter((l) => l.lead_score_category === "Hot").length,
    warm: leads.filter((l) => l.lead_score_category === "Warm").length,
    cold: leads.filter((l) => l.lead_score_category === "Cold").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#033F99] border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Leads</h1>
              <p className="text-sm text-gray-500 mt-1">
                {stats.total} total leads
              </p>
            </div>
            <button
              onClick={() => navigate("/commerce/lead/new")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#033F99] text-white text-sm font-medium rounded-lg hover:bg-[#033F99] transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Lead
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#033F99]"></div>
              <span className="text-sm text-gray-600">{stats.hot} Hot</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#044AB3]"></div>
              <span className="text-sm text-gray-600">{stats.warm} Warm</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-300"></div>
              <span className="text-sm text-gray-600">{stats.cold} Cold</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99] focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
          >
            <option value="">All Status</option>
            <option value="New">New</option>
            <option value="Validated">Validated</option>
            <option value="Qualified">Qualified</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
          >
            <option value="">All Scores</option>
            <option value="Hot">Hot</option>
            <option value="Warm">Warm</option>
            <option value="Cold">Cold</option>
          </select>
        </div>
      </div>

      {/* Lead List */}
      <div className="max-w-7xl mx-auto px-8 pb-8">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deal Value
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned
                </th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center">
                    <p className="text-sm text-gray-500">No leads found</p>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr
                    key={lead.lead_id}
                    onClick={() => navigate(`/commerce/lead/${lead.lead_id}`)}
                    className="hover:bg-gray-50 cursor-pointer group transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-1 h-8 rounded-full ${lead.lead_score >= 76
                              ? "bg-[#033F99]"
                              : lead.lead_score >= 51
                                ? "bg-[#044AB3]"
                                : "bg-gray-300"
                            }`}
                        ></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 group-hover:text-[#033F99] transition-colors">
                            {lead.company_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {lead.industry_type}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {lead.contact_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {lead.email_address}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {Math.round(lead.lead_score || 0)}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${lead.lead_score_category === "Hot"
                              ? "bg-[#EBF3FC] text-[#033F99]"
                              : lead.lead_score_category === "Warm"
                                ? "bg-[#EBF3FC] text-[#033F99]"
                                : "bg-gray-100 text-gray-600"
                            }`}
                        >
                          {lead.lead_score_category || "Cold"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                        {lead.lead_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">
                        {lead.estimated_deal_value
                          ? `₹${(lead.estimated_deal_value / 100000).toFixed(1)}L`
                          : "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {lead.assigned_to ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#C4D9F4] flex items-center justify-center">
                            <span className="text-xs font-medium text-[#033F99]">
                              {lead.assigned_to.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-xs text-gray-600">
                            {lead.assigned_to.split(" ")[0]}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#033F99] transition-colors" />
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

export default LeadListMinimal;
