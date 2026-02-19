import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  FileText,
  MessageSquare,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Filter,
  Download,
  Search,
  Paperclip,
  Send,
  Target,
  TrendingUp,
} from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const LeadEngagement = () => {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    engagement_type: "Call",
    engagement_mode: "Outbound",
    subject: "",
    details: "",
    outcome: "",
    next_follow_up_date: "",
    duration: "",
  });

  useEffect(() => {
    fetchLeadData();
    fetchActivities();
  }, [leadId]);

  const fetchLeadData = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/commerce/leads/${leadId}`,
      );
      setLead(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching lead:", error);
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/commerce/leads/${leadId}/engagements`,
      );
      setActivities(response.data || []);
    } catch (error) {
      console.error("Error fetching activities:", error);
      setActivities([]);
    }
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        `${BACKEND_URL}/api/commerce/leads/${leadId}/engagements`,
        formData,
      );

      await fetchActivities();
      await fetchLeadData();

      setFormData({
        engagement_type: "Call",
        engagement_mode: "Outbound",
        subject: "",
        details: "",
        outcome: "",
        next_follow_up_date: "",
        duration: "",
      });
      setShowAddForm(false);

      alert("Engagement logged successfully!");
    } catch (error) {
      console.error("Error adding activity:", error);
      alert("Failed to log engagement. Please try again.");
    }
  };

  const getEngagementIcon = (type) => {
    switch (type) {
      case "Call":
        return Phone;
      case "Email":
        return Mail;
      case "Meeting":
        return Calendar;
      case "Note":
        return FileText;
      case "WhatsApp":
        return MessageSquare;
      default:
        return FileText;
    }
  };

  const getOutcomeColor = (outcome) => {
    switch (outcome) {
      case "Interested":
        return "bg-emerald-100 text-emerald-700 border-emerald-300";
      case "Follow-up Needed":
        return "bg-amber-100 text-amber-700 border-amber-300";
      case "Rejected":
        return "bg-red-100 text-red-700 border-red-300";
      case "Completed":
        return "bg-blue-100 text-blue-700 border-blue-300";
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-[#033F99] border-r-transparent"></div>
          <p className="mt-4 text-[#033F99] font-semibold text-lg">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(`/commerce/lead/${leadId}`)}
            className="flex items-center gap-2 text-[#033F99] hover:text-[#033F99] font-semibold transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Lead Details
          </button>
        </div>

        <div className="bg-gradient-to-r from-[#033F99] to-[#033F99] rounded-3xl p-6 mb-6 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-white">
            <div>
              <p className="text-[#033F99] text-sm font-medium mb-1">Company</p>
              <p className="text-xl font-bold">{lead?.company_name}</p>
            </div>
            <div>
              <p className="text-[#033F99] text-sm font-medium mb-1">Contact</p>
              <p className="text-lg font-semibold">{lead?.contact_name}</p>
            </div>
            <div>
              <p className="text-[#033F99] text-sm font-medium mb-1">Status</p>
              <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-bold">
                {lead?.lead_status || "New"}
              </span>
            </div>
            <div>
              <p className="text-[#033F99] text-sm font-medium mb-1">Score</p>
              <p className="text-3xl font-black">
                {lead?.lead_score || 0}
                <span className="text-lg">/100</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 mb-6 shadow-xl border-2 border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#033F99] to-[#033F99] text-white font-bold rounded-xl hover:shadow-xl transition-all"
            >
              <Plus className="h-5 w-5" />
              Add Activity
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 mb-6 shadow-2xl border-2 border-[#033F99]">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">
              Log New Engagement
            </h3>
            <form onSubmit={handleAddActivity}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Engagement Type *
                  </label>
                  <select
                    value={formData.engagement_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        engagement_type: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-300"
                    required
                  >
                    <option value="Call">Call</option>
                    <option value="Email">Email</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Note">Note</option>
                    <option value="WhatsApp">WhatsApp</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Mode *
                  </label>
                  <select
                    value={formData.engagement_mode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        engagement_mode: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-300"
                    required
                  >
                    <option value="Inbound">Inbound</option>
                    <option value="Outbound">Outbound</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-300"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Details *
                  </label>
                  <textarea
                    value={formData.details}
                    onChange={(e) =>
                      setFormData({ ...formData, details: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-300"
                    rows="4"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Outcome *
                  </label>
                  <select
                    value={formData.outcome}
                    onChange={(e) =>
                      setFormData({ ...formData, outcome: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-300"
                    required
                  >
                    <option value="">Select...</option>
                    <option value="Interested">Interested</option>
                    <option value="Follow-up Needed">Follow-up Needed</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Duration (min)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-300"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-3 bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-[#033F99] to-[#033F99] text-white font-bold rounded-xl"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border-2 border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="h-6 w-6 text-[#033F99]" />
            <h2 className="text-2xl font-bold text-slate-900">
              Activity Timeline
            </h2>
          </div>

          <div className="space-y-4">
            {activities.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-semibold">
                  No activities yet
                </p>
              </div>
            ) : (
              activities.map((activity, index) => {
                const Icon = getEngagementIcon(activity.engagement_type);
                return (
                  <div
                    key={`item-${index}`}
                    className="border-l-4 border-[#033F99] pl-6 pb-6 relative"
                  >
                    <div className="absolute -left-3 top-0 w-6 h-6 bg-[#033F99] rounded-full flex items-center justify-center">
                      <Icon className="h-3 w-3 text-white" />
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-bold text-slate-900">
                            {activity.subject}
                          </h4>
                          <p className="text-sm text-slate-600">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getOutcomeColor(activity.outcome)}`}
                        >
                          {activity.outcome}
                        </span>
                      </div>
                      <p className="text-slate-700">{activity.details}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadEngagement;
