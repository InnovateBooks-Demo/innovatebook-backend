import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  TrendingUp,
  Star,
  Mail,
  Phone,
  Eye,
  Edit2,
  ChevronRight,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const LeadListCommerce = () => {
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

  const getStatusStyle = (status) => {
    const styles = {
      New: {
        bg: "bg-blue-500",
        badge: "bg-blue-100 text-blue-700 border-blue-200",
      },
      Active: {
        bg: "bg-green-500",
        badge: "bg-green-100 text-green-700 border-green-200",
      },
      Qualified: {
        bg: "bg-purple-500",
        badge: "bg-purple-100 text-purple-700 border-purple-200",
      },
      Converted: {
        bg: "bg-[#033F99]",
        badge: "bg-[#C4D9F4] text-[#033F99] border-[#033F99]",
      },
    };
    return styles[status] || styles["New"];
  };

  const getPriorityStyle = (priority) => {
    const styles = {
      High: "bg-rose-100 text-rose-700 border-rose-200",
      Medium: "bg-amber-100 text-amber-700 border-amber-200",
      Low: "bg-slate-100 text-slate-600 border-slate-200",
    };
    return styles[priority] || styles["Medium"];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-[#033F99] border-r-transparent"></div>
          <p className="mt-4 text-[#033F99] font-semibold text-lg">
            Loading leads...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50 p-8">
      {/* Premium Header - Same as Dashboard */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className="text-4xl font-bold bg-gradient-to-r from-[#033F99] via-[#033F99] to-[#033F99] bg-clip-text text-transparent"
              style={{ fontFamily: "Poppins" }}
            >
              Lead Pipeline
            </h1>
            <p className="text-[#033F99] mt-2 font-medium text-lg">
              {filteredLeads.length} active opportunities in your pipeline
            </p>
          </div>
          <button
            onClick={() => navigate("/commerce/lead/create")}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#033F99] to-[#033F99] hover:from-[#0147CC] hover:to-[#0147CC] text-white font-bold rounded-xl shadow-xl transition-all duration-200"
          >
            <Plus className="h-5 w-5" />
            <span>New Lead</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#033F99] focus:border-transparent transition-all text-slate-900 font-medium"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#033F99] focus:border-transparent cursor-pointer font-semibold text-slate-900"
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
            className="px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#033F99] focus:border-transparent cursor-pointer font-semibold text-slate-900"
          >
            <option value="all">All Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Lead Cards - Same style as Dashboard cards */}
      <div className="space-y-4">
        {filteredLeads.map((lead) => {
          const statusStyle = getStatusStyle(lead.status);
          const priorityStyle = getPriorityStyle(lead.priority);

          return (
            <div
              key={lead.id}
              onClick={() => navigate(`/commerce/lead/${lead.id}`)}
              className="group relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl p-6 border-2 border-slate-200 hover:border-[#033F99] shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                {/* Left Section */}
                <div className="flex items-center gap-5 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#033F99] to-[#0147CC] flex items-center justify-center shadow-lg">
                      <span className="text-2xl font-bold text-white">
                        {lead.customer_name?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-slate-900 truncate group-hover:text-[#033F99] transition-colors">
                        {lead.customer_name}
                      </h3>
                      {lead.lead_score >= 70 && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-100 to-amber-50 rounded-lg border-2 border-amber-200">
                          <Star className="w-4 h-4 text-amber-600 fill-amber-600" />
                          <span className="text-xs font-bold text-amber-700">
                            High Value
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-6 text-sm text-slate-600">
                      {lead.contact_person && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <span className="font-medium">
                            {lead.contact_person}
                          </span>
                        </div>
                      )}
                      {lead.contact_email && (
                        <span className="font-medium">
                          {lead.contact_email}
                        </span>
                      )}
                      {lead.rfq_number && (
                        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                          {lead.rfq_number}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-6 flex-shrink-0">
                  {/* Status */}
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">
                      Status
                    </p>
                    <span
                      className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold border-2 ${statusStyle.badge}`}
                    >
                      {lead.status}
                    </span>
                  </div>

                  {/* Priority */}
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">
                      Priority
                    </p>
                    {lead.priority ? (
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold border-2 ${priorityStyle}`}
                      >
                        {lead.priority}
                      </span>
                    ) : (
                      <span className="text-sm text-slate-400">—</span>
                    )}
                  </div>

                  {/* Lead Score */}
                  <div className="text-center min-w-[120px]">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">
                      Lead Score
                    </p>
                    <div className="space-y-1">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-3xl font-black text-slate-900">
                          {lead.lead_score || 0}
                        </span>
                        <span className="text-lg font-bold text-slate-400">
                          /100
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${statusStyle.bg} transition-all duration-500`}
                          style={{ width: `${lead.lead_score || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/commerce/lead/${lead.id}`);
                      }}
                      className="p-2.5 bg-[#033F99] text-white rounded-xl hover:bg-[#0147CC] transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/commerce/lead/${lead.id}/edit`);
                      }}
                      className="p-2.5 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-colors"
                      title="Edit Lead"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                  </div>

                  <ChevronRight className="h-7 w-7 text-slate-400 group-hover:text-[#033F99] group-hover:translate-x-2 transition-all duration-300" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredLeads.length === 0 && (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-16 border-2 border-slate-200 shadow-xl text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#033F99] to-[#0147CC] rounded-3xl flex items-center justify-center shadow-lg">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">
            No leads found
          </h3>
          <p className="text-slate-600 font-medium mb-6">
            {searchTerm ||
              selectedStatus !== "all" ||
              selectedPriority !== "all"
              ? "Try adjusting your filters to see more results"
              : "Get started by creating your first lead"}
          </p>
          {!searchTerm &&
            selectedStatus === "all" &&
            selectedPriority === "all" && (
              <button
                onClick={() => navigate("/commerce/lead/create")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#033F99] to-[#0147CC] text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all"
              >
                <Plus className="w-5 h-5" />
                Create Your First Lead
              </button>
            )}
        </div>
      )}
    </div>
  );
};

export default LeadListCommerce;
