import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  TrendingUp,
  Users,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  ArrowRight,
  Star,
} from "lucide-react";
import axios from "axios";
import {
  PageWrapper,
  PageHeader,
  PrimaryButton,
} from "../CommerceDesignSystem";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const LeadListPro = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid or list

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

  const getScoreColor = (score) => {
    if (score >= 76) return "from-[#3A4E63] to-purple-600";
    if (score >= 51) return "from-[#3A4E63] to-[#3A4E63]";
    return "from-slate-400 to-slate-500";
  };

  const getStatusBadge = (status) => {
    const styles = {
      New: "bg-blue-50 text-blue-700",
      Validated: "bg-emerald-50 text-emerald-700",
      Qualified: "bg-[#EBF3FC] text-[#3A4E63]",
      Converted: "bg-green-50 text-green-700",
    };
    return styles[status] || "bg-gray-50 text-gray-700";
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#3A4E63] border-t-transparent"></div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Lead Management
            </h1>
            <p className="text-gray-600">
              Track and manage your sales pipeline
            </p>
          </div>
          <PrimaryButton
            icon={Plus}
            onClick={() => navigate("/commerce/lead/new")}
          >
            New Lead
          </PrimaryButton>
        </div>

        {/* KPI Stats */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-[#EBF3FC] rounded-lg">
                <Users className="w-6 h-6 text-[#3A4E63]" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {kpis.total}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-600">Total Leads</p>
          </div>

          <div className="bg-gradient-to-br from-[#3A4E63] to-purple-600 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white/20 rounded-lg">
                <TrendingUp className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold">{kpis.hot}</span>
            </div>
            <p className="text-sm font-medium text-[#C4D9F4]">Hot Leads</p>
            <p className="text-xs text-[#6B9FE6] mt-1">High priority</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-[#6B9FE6]">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-[#EBF3FC] rounded-lg">
                <Star className="w-6 h-6 text-[#3A4E63]" />
              </div>
              <span className="text-2xl font-bold text-[#3A4E63]">
                {kpis.warm}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-600">Warm Leads</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <Clock className="w-6 h-6 text-gray-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {kpis.cold}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-600">Cold Leads</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white/20 rounded-lg">
                <CheckCircle className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold">{kpis.converted}</span>
            </div>
            <p className="text-sm font-medium text-emerald-100">Converted</p>
            <p className="text-xs text-emerald-200 mt-1">Success rate</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent text-gray-900"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63] text-gray-900 bg-white"
          >
            <option value="">All Status</option>
            <option value="New">New</option>
            <option value="Validated">Validated</option>
            <option value="Qualified">Qualified</option>
            <option value="Converted">Converted</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63] text-gray-900 bg-white"
          >
            <option value="">All Scores</option>
            <option value="Hot">Hot Leads</option>
            <option value="Warm">Warm Leads</option>
            <option value="Cold">Cold Leads</option>
          </select>
        </div>
      </div>

      {/* Lead Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredLeads.map((lead) => (
          <div
            key={lead.lead_id}
            onClick={() => navigate(`/commerce/lead/${lead.lead_id}`)}
            className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-100 hover:border-[#6B9FE6] group overflow-hidden"
          >
            {/* Card Header with Score */}
            <div
              className={`h-2 bg-gradient-to-r ${getScoreColor(lead.lead_score)}`}
            ></div>

            <div className="p-6">
              {/* Company Info */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-[#EBF3FC] rounded-lg">
                      <Building2 className="w-4 h-4 text-[#3A4E63]" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#3A4E63] transition-colors">
                      {lead.company_name}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-500 ml-10">
                    {lead.industry_type}
                  </p>
                </div>

                {/* Score Badge */}
                <div
                  className={`flex flex-col items-center px-3 py-2 rounded-lg bg-gradient-to-br ${getScoreColor(lead.lead_score)} text-white shadow-md`}
                >
                  <span className="text-2xl font-bold">
                    {Math.round(lead.lead_score || 0)}
                  </span>
                  <span className="text-xs font-medium opacity-90">
                    {lead.lead_score_category}
                  </span>
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{lead.contact_name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{lead.email_address}</span>
                </div>
                {lead.city && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>
                      {lead.city}, {lead.country}
                    </span>
                  </div>
                )}
              </div>

              {/* Deal Value and Status */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-bold text-gray-900">
                    {lead.estimated_deal_value
                      ? `₹${(lead.estimated_deal_value / 100000).toFixed(1)}L`
                      : "-"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(lead.lead_status)}`}
                  >
                    {lead.lead_status}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#3A4E63] transition-colors" />
                </div>
              </div>

              {/* Assigned To */}
              {lead.assigned_to && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#C4D9F4] flex items-center justify-center">
                      <span className="text-xs font-bold text-[#3A4E63]">
                        {lead.assigned_to.charAt(0)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-600">
                      Assigned to {lead.assigned_to}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredLeads.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No leads found
          </h3>
          <p className="text-gray-600 mb-6">
            Get started by creating your first lead
          </p>
          <PrimaryButton
            icon={Plus}
            onClick={() => navigate("/commerce/lead/new")}
          >
            Create Lead
          </PrimaryButton>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
        <span>{filteredLeads.length} leads shown</span>
        <span>Last updated: {new Date().toLocaleTimeString()}</span>
      </div>
    </PageWrapper>
  );
};

export default LeadListPro;
