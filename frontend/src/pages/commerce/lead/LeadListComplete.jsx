import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  TrendingUp,
  Users,
  Zap,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Timer,
} from "lucide-react";
import axios from "axios";
import {
  PageWrapper,
  PageHeader,
  PrimaryButton,
  OutlineButton,
  StatusBadge,
  LoadingSpinner,
  InfoBox,
} from "../CommerceDesignSystem";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const LeadListComplete = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  // KPIs
  const [kpis, setKpis] = useState({
    total: 0,
    hot: 0,
    warm: 0,
    cold: 0,
    converted: 0,
  });

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

      // Calculate KPIs
      const total = response.data.length;
      const hot = response.data.filter(
        (l) => l.lead_score_category === "Hot",
      ).length;
      const warm = response.data.filter(
        (l) => l.lead_score_category === "Warm",
      ).length;
      const cold = response.data.filter(
        (l) => l.lead_score_category === "Cold",
      ).length;
      const converted = response.data.filter(
        (l) => l.lead_status === "Converted",
      ).length;

      setKpis({ total, hot, warm, cold, converted });
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

  const getScoreBadgeColor = (category) => {
    if (category === "Hot")
      return "bg-gradient-to-r from-[#033F99] to-[#033F99] text-white shadow-lg shadow-[#033F99]/50";
    if (category === "Warm")
      return "bg-gradient-to-r from-[#033F99] to-[#033F99] text-white shadow-md shadow-[#044AB3]/40";
    return "bg-gradient-to-r from-slate-300 to-slate-400 text-slate-700 shadow-sm";
  };

  const getStatusColor = (status) => {
    const colors = {
      New: "bg-[#EBF3FC] text-[#033F99] border border-[#6B9FE6]",
      Enriching: "bg-[#C4D9F4] text-white border border-[#0558CC]",
      Validated: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      Qualified: "bg-[#C4D9F4] text-white border border-[#0558CC]",
      Assigned: "bg-[#EBF3FC] text-[#033F99] border border-[#6B9FE6]",
      Engaged: "bg-[#C4D9F4] text-white border border-[#0558CC]",
      Dormant: "bg-amber-50 text-amber-700 border border-amber-200",
      Converted: "bg-emerald-100 text-emerald-800 border border-emerald-300",
      Closed: "bg-slate-50 text-slate-600 border border-slate-200",
    };
    return (
      colors[status] || "bg-slate-50 text-slate-600 border border-slate-200"
    );
  };

  const getValidationIcon = (status) => {
    if (status === "Verified")
      return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    if (status === "Warning")
      return <AlertCircle className="w-4 h-4 text-amber-600" />;
    if (status === "Failed")
      return <XCircle className="w-4 h-4 text-rose-600" />;
    return <Timer className="w-4 h-4 text-slate-400" />;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <PageWrapper>
      <PageHeader
        title="Lead Management"
        subtitle="Comprehensive lead tracking across 9 SOP stages"
        action={
          <PrimaryButton
            icon={Plus}
            onClick={() => navigate("/commerce/lead/new")}
          >
            Add Lead
          </PrimaryButton>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg border-2 border-[#6B9FE6] p-4 hover:shadow-lg hover:border-[#0558CC] transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-[#033F99]">
              Total Leads
            </span>
            <div className="p-2 bg-[#C4D9F4] rounded-lg">
              <Users className="w-5 h-5 text-[#033F99]" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{kpis.total}</p>
        </div>

        <div className="bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-lg p-4 text-white shadow-lg shadow-[#033F99]/50 hover:shadow-xl hover:shadow-[#033F99]/60 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-[#C4D9F4]">
              🔥 Hot Leads
            </span>
            <div className="p-2 bg-white/20 rounded-lg">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold">{kpis.hot}</p>
          <p className="text-xs text-[#6B9FE6] mt-1">High Priority</p>
        </div>

        <div className="bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-lg p-4 text-white shadow-md shadow-[#044AB3]/40 hover:shadow-lg hover:shadow-[#044AB3]/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-[#C4D9F4]">
              ⚡ Warm Leads
            </span>
            <div className="p-2 bg-white/20 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold">{kpis.warm}</p>
          <p className="text-xs text-[#6B9FE6] mt-1">Good Potential</p>
        </div>

        <div className="bg-white rounded-lg border-2 border-slate-200 p-4 hover:shadow-md hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-700">
              ❄️ Cold Leads
            </span>
            <div className="p-2 bg-slate-100 rounded-lg">
              <Users className="w-5 h-5 text-slate-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{kpis.cold}</p>
          <p className="text-xs text-slate-500 mt-1">Nurture Pipeline</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg p-4 text-white shadow-md shadow-emerald-400/40 hover:shadow-lg hover:shadow-emerald-400/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-emerald-100">
              ✅ Converted
            </span>
            <div className="p-2 bg-white/20 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold">{kpis.converted}</p>
          <p className="text-xs text-emerald-200 mt-1">Success Rate</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border-2 border-[#6B9FE6] p-4 mb-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#044AB3] w-5 h-5" />
            <input
              type="text"
              placeholder="Search by company, contact name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-[#6B9FE6] rounded-xl focus:ring-4 focus:ring-[#C4D9F4] focus:border-[#033F99] transition-all font-medium text-slate-700 placeholder:text-slate-400"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border-2 border-[#6B9FE6] rounded-xl focus:ring-4 focus:ring-[#C4D9F4] focus:border-[#033F99] transition-all font-semibold text-slate-700 bg-white"
          >
            <option value="">All Status</option>
            <option value="New">New</option>
            <option value="Enriching">Enriching</option>
            <option value="Validated">Validated</option>
            <option value="Qualified">Qualified</option>
            <option value="Assigned">Assigned</option>
            <option value="Engaged">Engaged</option>
            <option value="Dormant">Dormant</option>
            <option value="Converted">Converted</option>
            <option value="Closed">Closed</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-3 border-2 border-[#6B9FE6] rounded-xl focus:ring-4 focus:ring-[#C4D9F4] focus:border-[#033F99] transition-all font-semibold text-slate-700 bg-white"
          >
            <option value="">All Scores</option>
            <option value="Hot">🔥 Hot (76-100)</option>
            <option value="Warm">⚡ Warm (51-75)</option>
            <option value="Cold">❄️ Cold (0-50)</option>
          </select>

          <OutlineButton icon={Filter} onClick={fetchLeads}>
            Refresh
          </OutlineButton>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg border-2 border-[#6B9FE6] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#EBF3FC] to-[#C4D9F4] border-b-2 border-[#6B9FE6]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Lead ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Validation
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Deal Value
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C4D9F4]">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <InfoBox type="info">
                      No leads found. Create your first lead to get started!
                    </InfoBox>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr
                    key={lead.lead_id}
                    onClick={() => navigate(`/commerce/lead/${lead.lead_id}`)}
                    className="hover:bg-[#EBF3FC] transition-all cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-[#033F99] font-bold group-hover:text-[#033F99] transition-colors">
                        {lead.lead_id}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-[#033F99] transition-colors">
                          {lead.company_name}
                        </p>
                        <p className="text-sm text-slate-600">
                          {lead.industry_type || "N/A"}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {lead.contact_name}
                        </p>
                        <p className="text-xs text-slate-600">
                          {lead.email_address}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`
                          px-3 py-1.5 rounded-full text-sm font-bold
                          ${getScoreBadgeColor(lead.lead_score_category)}
                        `}
                        >
                          {Math.round(lead.lead_score || 0)}
                        </div>
                        <span className="text-xs font-semibold text-slate-600">
                          {lead.lead_score_category || "N/A"}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`
                        inline-block px-3 py-1.5 rounded-full text-xs font-bold
                        ${getStatusColor(lead.lead_status)}
                      `}
                      >
                        {lead.lead_status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getValidationIcon(lead.validation_status)}
                        <span className="text-sm font-medium text-slate-700">
                          {lead.validation_status || "Pending"}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {lead.assigned_to ? (
                        <span className="text-sm font-medium text-slate-900 px-2 py-1 bg-[#EBF3FC] rounded">
                          {lead.assigned_to}
                        </span>
                      ) : (
                        <span className="text-sm text-slate-400 italic">
                          Unassigned
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {lead.estimated_deal_value ? (
                        <span className="text-sm font-bold text-[#033F99]">
                          ₹{lead.estimated_deal_value.toLocaleString("en-IN")}
                        </span>
                      ) : (
                        <span className="text-sm text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
        <p>
          Showing {filteredLeads.length} of {leads.length} leads
        </p>
        <p>Last updated: {new Date().toLocaleTimeString()}</p>
      </div>
    </PageWrapper>
  );
};

export default LeadListComplete;
