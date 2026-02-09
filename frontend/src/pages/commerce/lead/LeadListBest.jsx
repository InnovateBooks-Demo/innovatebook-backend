import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Filter,
  Eye,
  Edit2,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  Star,
  BarChart3,
  Users,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const LeadListBest = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");

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
    const matchesStatus =
      selectedStatus === "all" || lead.status === selectedStatus;
    const matchesPriority =
      selectedPriority === "all" || lead.priority === selectedPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status) => {
    const colors = {
      New: "bg-[rgba(3,63,153,0.08)]0",
      Active: "bg-green-500",
      Qualified: "bg-purple-500",
      Converted: "bg-gray-500",
    };
    return colors[status] || "bg-[rgba(3,63,153,0.08)]0";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      High: "bg-red-500",
      Medium: "bg-amber-500",
      Low: "bg-gray-400",
    };
    return colors[priority] || "bg-gray-400";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-3 text-gray-600 font-medium">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg text-blue-700 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
                <p className="text-sm text-gray-500">
                  {filteredLeads.length} total
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/commerce/lead/create")}
              className="flex items-center gap-2 px-4 py-2 text-blue-700 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Lead
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm cursor-pointer"
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
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm cursor-pointer"
          >
            <option value="all">All Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Leads Grid */}
        <div className="space-y-3">
          {filteredLeads.map((lead) => (
            <div
              key={lead.id}
              onClick={() => navigate(`/commerce/lead/${lead.id}`)}
              className="group bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="p-5">
                <div className="flex items-center justify-between">
                  {/* Left: Company Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-white">
                        {lead.customer_name?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 group-hover:text-[#033F99] transition-colors truncate">
                        {lead.customer_name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        {lead.contact_person && (
                          <span className="text-sm text-gray-600">
                            {lead.contact_person}
                          </span>
                        )}
                        {lead.contact_email && (
                          <span className="text-xs text-gray-500">
                            {lead.contact_email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Center: Badges */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 font-medium">
                        Status:
                      </span>
                      <span
                        className={`px-3 py-1 ${getStatusColor(lead.status)} text-white text-xs font-medium rounded-full`}
                      >
                        {lead.status}
                      </span>
                    </div>
                    {lead.priority && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 font-medium">
                          Priority:
                        </span>
                        <span
                          className={`px-3 py-1 ${getPriorityColor(lead.priority)} text-white text-xs font-medium rounded-full`}
                        >
                          {lead.priority}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right: Score & Actions */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs text-gray-500 font-medium mb-1">
                        Score
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {lead.lead_score || 0}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/commerce/lead/${lead.id}`);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/commerce/lead/${lead.id}/edit`);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredLeads.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No leads found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ||
              selectedStatus !== "all" ||
              selectedPriority !== "all"
                ? "Try adjusting your filters"
                : "Get started by creating your first lead"}
            </p>
            {!searchTerm &&
              selectedStatus === "all" &&
              selectedPriority === "all" && (
                <button
                  onClick={() => navigate("/commerce/lead/create")}
                  className="inline-flex items-center gap-2 px-4 py-2 text-blue-700 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Lead
                </button>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadListBest;
