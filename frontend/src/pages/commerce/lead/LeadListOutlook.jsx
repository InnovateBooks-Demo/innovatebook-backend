import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  RefreshCw,
  Archive,
  Trash2,
  Tag,
  Flag,
  Star,
  ChevronRight,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  X,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const LeadListOutlook = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedLead, setSelectedLead] = useState(null);
  const [showReadingPane, setShowReadingPane] = useState(true);

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
      if (response.data.leads?.length > 0) {
        setSelectedLead(response.data.leads[0]);
      }
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
    const matchesStatus =
      selectedStatus === "all" || lead.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    const colors = {
      New: "text-[#033F99] bg-[rgba(3,63,153,0.08)] border-[rgba(3,63,153,0.25)]",
      Active: "text-green-600 bg-green-50 border-green-200",
      Qualified: "text-purple-600 bg-purple-50 border-purple-200",
      Converted: "text-gray-600 bg-gray-50 border-gray-200",
    };
    return (
      colors[status] ||
      "text-[#033F99] bg-[rgba(3,63,153,0.08)] border-[rgba(3,63,153,0.25)]"
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Top Toolbar - Outlook style */}
      <div className="border-b border-gray-200 bg-white">
        <div className="px-4 py-2">
          <div className="flex items-center justify-between">
            {/* Left: Action buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigate("/commerce/lead/create")}
                className="flex items-center gap-2 px-4 py-1.5 text-blue-700 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Lead
              </button>
              <div className="w-px h-6 bg-gray-300 mx-2"></div>
              <button
                onClick={() => fetchLeads()}
                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4 text-gray-600" />
              </button>
              <button
                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                title="Archive"
              >
                <Archive className="w-4 h-4 text-gray-600" />
              </button>
              <button
                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4 text-gray-600" />
              </button>
              <button
                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                title="Flag"
              >
                <Flag className="w-4 h-4 text-gray-600" />
              </button>
              <button
                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                title="Categorize"
              >
                <Tag className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Right: Search */}
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search leads"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Three-pane layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane - Folders */}
        <div className="w-48 border-r border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="p-2">
            <div className="text-xs font-semibold text-gray-500 uppercase px-3 py-2">
              Folders
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => setSelectedStatus("all")}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded transition-colors ${
                  selectedStatus === "all"
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>All Leads</span>
                <span className="ml-auto text-xs">{leads.length}</span>
              </button>
              <button
                onClick={() => setSelectedStatus("New")}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded transition-colors ${
                  selectedStatus === "New"
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>New</span>
                <span className="ml-auto text-xs">
                  {leads.filter((l) => l.status === "New").length}
                </span>
              </button>
              <button
                onClick={() => setSelectedStatus("Active")}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded transition-colors ${
                  selectedStatus === "Active"
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Flag className="w-4 h-4" />
                <span>Active</span>
                <span className="ml-auto text-xs">
                  {leads.filter((l) => l.status === "Active").length}
                </span>
              </button>
              <button
                onClick={() => setSelectedStatus("Qualified")}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded transition-colors ${
                  selectedStatus === "Qualified"
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Star className="w-4 h-4" />
                <span>Qualified</span>
                <span className="ml-auto text-xs">
                  {leads.filter((l) => l.status === "Qualified").length}
                </span>
              </button>
              <button
                onClick={() => setSelectedStatus("Converted")}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded transition-colors ${
                  selectedStatus === "Converted"
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Archive className="w-4 h-4" />
                <span>Converted</span>
                <span className="ml-auto text-xs">
                  {leads.filter((l) => l.status === "Converted").length}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Middle Pane - Lead List */}
        <div className="flex-1 flex flex-col border-r border-gray-200 bg-white">
          {/* List Header */}
          <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">
                Leads ({filteredLeads.length})
              </span>
              <button
                onClick={() => setShowReadingPane(!showReadingPane)}
                className="text-xs text-[#033F99] hover:underline"
              >
                {showReadingPane ? "Hide" : "Show"} Reading Pane
              </button>
            </div>
          </div>

          {/* Lead Items */}
          <div className="flex-1 overflow-y-auto">
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                onClick={() => setSelectedLead(lead)}
                className={`px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors ${
                  selectedLead?.id === lead.id
                    ? "bg-[rgba(3,63,153,0.08)] border-l-4 border-l-blue-600"
                    : "hover:bg-gray-50 border-l-4 border-l-transparent"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Star/Flag */}
                  <button onClick={(e) => e.stopPropagation()} className="mt-1">
                    {lead.lead_score >= 70 ? (
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    ) : (
                      <Star className="w-4 h-4 text-gray-300" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-gray-900 truncate">
                        {lead.customer_name}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        {lead.rfq_number || "No RFQ"}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mb-1">
                      {lead.contact_person || "No contact"}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(lead.status)}`}
                      >
                        {lead.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        Score: {lead.lead_score || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Pane - Reading Pane */}
        {showReadingPane && selectedLead && (
          <div className="w-96 flex-shrink-0 bg-white flex flex-col">
            {/* Reading Pane Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">
                    {selectedLead.customer_name}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium border ${getStatusColor(selectedLead.status)}`}
                    >
                      {selectedLead.status}
                    </span>
                    {selectedLead.priority && (
                      <span className="text-xs text-gray-500">
                        Priority: {selectedLead.priority}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowReadingPane(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/commerce/lead/${selectedLead.id}`)}
                  className="flex-1 px-3 py-2 text-blue-700 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
                >
                  View Full Details
                </button>
                <button
                  onClick={() =>
                    navigate(`/commerce/lead/${selectedLead.id}/edit`)
                  }
                  className="px-3 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded transition-colors"
                >
                  Edit
                </button>
              </div>
            </div>

            {/* Reading Pane Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* Lead Score */}
              <div className="mb-6">
                <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Lead Score
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full text-blue-700 transition-all"
                      style={{ width: `${selectedLead.lead_score || 0}%` }}
                    ></div>
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    {selectedLead.lead_score || 0}
                  </span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mb-6">
                <div className="text-xs font-semibold text-gray-500 uppercase mb-3">
                  Contact Information
                </div>
                <div className="space-y-3">
                  {selectedLead.contact_person && (
                    <div className="flex items-start gap-3">
                      <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <div className="text-xs text-gray-500">
                          Contact Person
                        </div>
                        <div className="text-sm text-gray-900">
                          {selectedLead.contact_person}
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedLead.contact_email && (
                    <div className="flex items-start gap-3">
                      <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <div className="text-xs text-gray-500">Email</div>
                        <div className="text-sm text-[#033F99]">
                          {selectedLead.contact_email}
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedLead.contact_phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <div className="text-xs text-gray-500">Phone</div>
                        <div className="text-sm text-gray-900">
                          {selectedLead.contact_phone}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Details */}
              <div className="mb-6">
                <div className="text-xs font-semibold text-gray-500 uppercase mb-3">
                  Details
                </div>
                <div className="space-y-2">
                  {selectedLead.rfq_number && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">RFQ Number:</span>
                      <span className="font-medium text-gray-900 font-mono">
                        {selectedLead.rfq_number}
                      </span>
                    </div>
                  )}
                  {selectedLead.priority && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Priority:</span>
                      <span className="font-medium text-gray-900">
                        {selectedLead.priority}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Status:</span>
                    <span className="font-medium text-gray-900">
                      {selectedLead.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadListOutlook;
