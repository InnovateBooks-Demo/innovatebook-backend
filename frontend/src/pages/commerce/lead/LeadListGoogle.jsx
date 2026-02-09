import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  RefreshCw,
  MoreVertical,
  CheckSquare,
  Square,
  Star,
  Edit,
  Eye,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const LeadListGoogle = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedLeads, setSelectedLeads] = useState(new Set());
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
      lead.contact_person?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || lead.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const toggleSelectLead = (leadId) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId);
    } else {
      newSelected.add(leadId);
    }
    setSelectedLeads(newSelected);
  };

  const getStatusColor = (status) => {
    const colors = {
      New: "text-blue-700 bg-[rgba(3,63,153,0.08)]",
      Active: "text-green-700 bg-green-50",
      Qualified: "text-purple-700 bg-purple-50",
      Converted: "text-gray-700 bg-gray-100",
    };
    return colors[status] || "text-blue-700 bg-[rgba(3,63,153,0.08)]";
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
    <div className="min-h-screen bg-white">
      {/* Gmail-style Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4 mb-4">
            {/* Search Bar - Gmail style */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search leads"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 hover:bg-gray-200 focus:bg-white border border-transparent focus:border-blue-500 rounded-full focus:outline-none transition-all text-sm"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <button
              onClick={() => fetchLeads()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => navigate("/commerce/lead/create")}
              className="flex items-center gap-2 px-6 py-2.5 text-blue-700 hover:bg-blue-700 text-white rounded-full transition-colors text-sm font-medium shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Compose
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1">
            {["all", "New", "Active", "Qualified", "Converted"].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                    selectedStatus === status
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {status === "all" ? "All" : status}
                </button>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Lead List */}
      <div className="max-w-7xl mx-auto">
        {filteredLeads.map((lead) => {
          const isSelected = selectedLeads.has(lead.id);
          const isHovered = hoveredLead === lead.id;

          return (
            <div
              key={lead.id}
              onMouseEnter={() => setHoveredLead(lead.id)}
              onMouseLeave={() => setHoveredLead(null)}
              className={`border-b border-gray-100 hover:shadow-sm transition-all cursor-pointer ${
                isSelected ? "bg-[rgba(3,63,153,0.08)]" : "hover:bg-gray-50"
              }`}
            >
              <div className="px-6 py-3">
                <div className="flex items-center gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelectLead(lead.id);
                    }}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-[#033F99]" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>

                  {/* Star */}
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="flex-shrink-0"
                  >
                    {lead.lead_score >= 70 ? (
                      <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    ) : (
                      <Star className="w-5 h-5 text-gray-300 hover:text-gray-400" />
                    )}
                  </button>

                  {/* Company Name */}
                  <div
                    onClick={() => navigate(`/commerce/lead/${lead.id}`)}
                    className="min-w-[200px] flex-shrink-0"
                  >
                    <span className="text-sm font-medium text-gray-900">
                      {lead.customer_name}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="flex-shrink-0">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}
                    >
                      {lead.status}
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {lead.contact_person && (
                        <span className="truncate">{lead.contact_person}</span>
                      )}
                      {lead.contact_email && (
                        <span className="text-xs text-gray-500 truncate">
                          {lead.contact_email}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Lead Score */}
                  <div className="flex-shrink-0 text-right min-w-[60px]">
                    <span className="text-sm font-medium text-gray-900">
                      {lead.lead_score || 0}
                    </span>
                    <span className="text-xs text-gray-500">/100</span>
                  </div>

                  {/* Actions */}
                  <div
                    className={`flex items-center gap-1 transition-opacity ${
                      isHovered ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/commerce/lead/${lead.id}`);
                      }}
                      className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/commerce/lead/${lead.id}/edit`);
                      }}
                      className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredLeads.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-gray-400 mb-4">
            <Search className="w-16 h-16" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No leads found
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            {searchTerm
              ? "Try a different search term"
              : "Get started by creating your first lead"}
          </p>
          {!searchTerm && (
            <button
              onClick={() => navigate("/commerce/lead/create")}
              className="flex items-center gap-2 px-6 py-2.5 text-blue-700 hover:bg-blue-700 text-white rounded-full transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Create Lead
            </button>
          )}
        </div>
      )}

      {/* Selection Bar */}
      {selectedLeads.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4">
          <span className="text-sm font-medium">
            {selectedLeads.size} selected
          </span>
          <button className="px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-full text-sm transition-colors">
            Delete
          </button>
          <button className="px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-full text-sm transition-colors">
            Export
          </button>
        </div>
      )}
    </div>
  );
};

export default LeadListGoogle;
