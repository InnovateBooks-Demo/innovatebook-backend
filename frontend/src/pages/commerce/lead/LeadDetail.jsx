import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Building2,
  Globe,
  User,
  Activity,
  Clock,
  Plus,
  Linkedin,
  Twitter,
  Briefcase,
  DollarSign,
  FileText,
  PhoneCall,
  Video,
  Send,
  BarChart3,
  RefreshCw,
  Tag,
  ExternalLink,
  TrendingUp,
  Award,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const LeadDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [activities, setActivities] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showDealModal, setShowDealModal] = useState(false);
  const [newActivity, setNewActivity] = useState({
    activity_type: "Call",
    subject: "",
    description: "",
    due_date: "",
  });
  const [newDeal, setNewDeal] = useState({
    deal_name: "",
    amount: "",
    stage: "Qualification",
    probability: 20,
    expected_close_date: "",
  });

  useEffect(() => {
    if (id) {
      fetchLead();
      fetchActivities();
      fetchDeals();
    }
  }, [id]);

  const fetchLead = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/modules/revenue/leads/${id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      if (data.success) setLead(data.lead);
    } catch (error) {
      toast.error("Failed to load lead");
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/modules/revenue/leads/${id}/activities`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      if (data.success) setActivities(data.activities || []);
    } catch (error) {
      console.error("Failed to fetch activities");
    }
  };

  const fetchDeals = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/modules/revenue/leads/${id}/deals`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      if (data.success) setDeals(data.deals || []);
    } catch (error) {
      console.error("Failed to fetch deals");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this lead?")) return;
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/modules/revenue/leads/${id}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.ok) {
        toast.success("Lead deleted");
        navigate("/commerce/lead");
      }
    } catch (error) {
      toast.error("Failed to delete lead");
    }
  };

  const handleCreateActivity = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/modules/revenue/leads/activities`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ lead_id: id, ...newActivity }),
        },
      );
      if (res.ok) {
        toast.success("Activity created");
        setShowActivityModal(false);
        fetchActivities();
        setNewActivity({
          activity_type: "Call",
          subject: "",
          description: "",
          due_date: "",
        });
      }
    } catch (error) {
      toast.error("Failed to create activity");
    }
  };

  const handleCreateDeal = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/modules/revenue/leads/deals`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            lead_id: id,
            ...newDeal,
            amount: parseFloat(newDeal.amount),
            probability: parseInt(newDeal.probability),
          }),
        },
      );
      if (res.ok) {
        toast.success("Deal created");
        setShowDealModal(false);
        fetchDeals();
        setNewDeal({
          deal_name: "",
          amount: "",
          stage: "Qualification",
          probability: 20,
          expected_close_date: "",
        });
      }
    } catch (error) {
      toast.error("Failed to create deal");
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "-";
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString()}`;
  };

  const getStatusStyle = (status) => {
    const styles = {
      New: "bg-blue-100 text-blue-700",
      Contacted: "bg-cyan-100 text-cyan-700",
      Qualified: "bg-emerald-100 text-emerald-700",
      Converted: "bg-green-100 text-green-700",
      Lost: "bg-red-100 text-red-700",
    };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  const getScoreGrade = (score) => {
    if (score >= 80)
      return {
        grade: "A",
        color: "text-green-600",
        bg: "bg-green-500",
        label: "Excellent",
      };
    if (score >= 60)
      return {
        grade: "B",
        color: "text-[#033F99]",
        bg: "bg-[rgba(3,63,153,0.08)]0",
        label: "Good",
      };
    if (score >= 40)
      return {
        grade: "C",
        color: "text-amber-600",
        bg: "bg-amber-500",
        label: "Average",
      };
    return {
      grade: "D",
      color: "text-red-600",
      bg: "bg-red-500",
      label: "Needs Work",
    };
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-[#3A4E63]" />
      </div>
    );
  if (!lead)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600">Lead not found</p>
      </div>
    );

  const scoreInfo = getScoreGrade(lead.lead_score || 0);
  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    {
      id: "activities",
      label: "Activities",
      icon: Activity,
      count: activities.length,
    },
    { id: "deals", label: "Deals", icon: Briefcase, count: deals.length },
    { id: "engagement", label: "Engagement", icon: BarChart3 },
  ];

  return (
    <div className="p-8" data-testid="lead-detail">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate("/commerce/lead")}
          className="flex items-center gap-2 text-slate-600 hover:text-[#3A4E63] mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back to Leads</span>
        </button>

        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#3A4E63] rounded-xl flex items-center justify-center text-white font-bold text-xl">
              {lead.first_name?.charAt(0)}
              {lead.last_name?.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {lead.salutation} {lead.first_name} {lead.last_name}
              </h1>
              <p className="text-slate-600">
                {lead.title} at {lead.company}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusStyle(lead.lead_status)}`}
                >
                  {lead.lead_status}
                </span>
                {lead.rating === "Hot" && <span>🔥 Hot</span>}
                {lead.rating === "Warm" && <span>🌡️ Warm</span>}
                {lead.rating === "Cold" && <span>❄️ Cold</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/commerce/lead/${id}/edit`)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              <Edit2 className="h-4 w-4 inline mr-2" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-slate-200 rounded-lg hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 inline mr-2" />
              Delete
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-slate-200 mb-6">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab.id
                    ? "border-[#3A4E63] text-[#3A4E63]"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {tab.count !== undefined && (
                  <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Lead Score Card - Improved Design */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                Lead Score
              </h2>
              <div className="grid grid-cols-4 gap-6">
                {/* Score Circle */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative">
                    <svg className="w-28 h-28 transform -rotate-90">
                      <circle
                        cx="56"
                        cy="56"
                        r="48"
                        stroke="#e2e8f0"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="56"
                        cy="56"
                        r="48"
                        stroke={scoreInfo.bg.replace("bg-", "")}
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${(lead.lead_score || 0) * 3.01} 301`}
                        className={scoreInfo.bg.replace("bg-", "stroke-")}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-3xl font-bold ${scoreInfo.color}`}>
                        {lead.lead_score || 0}
                      </span>
                      <span className="text-xs text-slate-500">/ 100</span>
                    </div>
                  </div>
                  <div
                    className={`mt-3 px-3 py-1 rounded-full text-xs font-semibold text-white ${scoreInfo.bg}`}
                  >
                    {scoreInfo.label}
                  </div>
                </div>

                {/* Score Breakdown */}
                <div className="col-span-3 grid grid-cols-3 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <TrendingUp className="h-5 w-5 text-[#033F99]" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">
                      {lead.lifecycle_stage || "Lead"}
                    </p>
                    <p className="text-xs text-slate-500">Lifecycle Stage</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Zap className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">
                      {lead.email_opens || 0}
                    </p>
                    <p className="text-xs text-slate-500">Engagement</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Award className="h-5 w-5 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">
                      {lead.deal_probability || 0}%
                    </p>
                    <p className="text-xs text-slate-500">Win Probability</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  Lead Information
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Lead Owner</span>
                    <span className="text-slate-900 font-medium">
                      {lead.lead_owner || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Lead Source</span>
                    <span className="text-slate-900 font-medium">
                      {lead.lead_source || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Rating</span>
                    <span className="text-slate-900 font-medium">
                      {lead.rating || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Email</span>
                    <span className="text-slate-900 font-medium">
                      {lead.email || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Phone</span>
                    <span className="text-slate-900 font-medium">
                      {lead.phone || "-"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  Company Information
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Company</span>
                    <span className="text-slate-900 font-medium">
                      {lead.company || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Industry</span>
                    <span className="text-slate-900 font-medium">
                      {lead.industry || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Employees</span>
                    <span className="text-slate-900 font-medium">
                      {lead.no_of_employees || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Annual Revenue</span>
                    <span className="text-slate-900 font-medium">
                      {formatCurrency(lead.annual_revenue)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Website</span>
                    <span className="text-slate-900 font-medium">
                      {lead.website || "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Deal Info */}
            {lead.deal_value && (
              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  Deal / Opportunity
                </h2>
                <div className="grid grid-cols-4 gap-6">
                  <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-slate-900">
                      {formatCurrency(lead.deal_value)}
                    </p>
                    <p className="text-sm text-slate-500">Deal Value</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-slate-900">
                      {lead.deal_stage || "-"}
                    </p>
                    <p className="text-sm text-slate-500">Stage</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-slate-900">
                      {lead.deal_probability || 0}%
                    </p>
                    <p className="text-sm text-slate-500">Probability</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-slate-900">
                      {lead.expected_close_date || "-"}
                    </p>
                    <p className="text-sm text-slate-500">Expected Close</p>
                  </div>
                </div>
              </div>
            )}

            {/* Social & Tags */}
            <div className="grid grid-cols-2 gap-6">
              {(lead.linkedin_url || lead.twitter_handle) && (
                <div className="bg-white rounded-xl p-6 border border-slate-200">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">
                    Social Profiles
                  </h2>
                  <div className="space-y-3">
                    {lead.linkedin_url && (
                      <a
                        href={lead.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-[#033F99] hover:underline"
                      >
                        <Linkedin className="h-4 w-4" />
                        LinkedIn Profile
                      </a>
                    )}
                    {lead.twitter_handle && (
                      <a
                        href={`https://twitter.com/${lead.twitter_handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-sky-500 hover:underline"
                      >
                        <Twitter className="h-4 w-4" />
                        {lead.twitter_handle}
                      </a>
                    )}
                  </div>
                </div>
              )}
              {lead.tags && lead.tags.length > 0 && (
                <div className="bg-white rounded-xl p-6 border border-slate-200">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">
                    Tags
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {lead.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm"
                      >
                        <Tag className="h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Activities Tab */}
        {activeTab === "activities" && (
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Activities</h2>
              <button
                onClick={() => setShowActivityModal(true)}
                className="px-4 py-2 bg-[#3A4E63] text-white rounded-lg font-medium hover:bg-[#3A4E63]"
              >
                + Add Activity
              </button>
            </div>
            {activities.length === 0 ? (
              <p className="text-center text-slate-500 py-8">
                No activities yet. Click "Add Activity" to create one.
              </p>
            ) : (
              <div className="space-y-4">
                {activities.map((act, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-4 hover:bg-slate-50 rounded-lg"
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${act.activity_type === "Call" ? "bg-green-100" : act.activity_type === "Email" ? "bg-blue-100" : "bg-purple-100"}`}
                    >
                      {act.activity_type === "Call" ? (
                        <PhoneCall className="h-5 w-5 text-green-600" />
                      ) : act.activity_type === "Email" ? (
                        <Mail className="h-5 w-5 text-[#033F99]" />
                      ) : (
                        <Video className="h-5 w-5 text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">
                        {act.subject}
                      </p>
                      <p className="text-sm text-slate-500">
                        {act.description}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {act.due_date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Deals Tab */}
        {activeTab === "deals" && (
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Deals</h2>
              <button
                onClick={() => setShowDealModal(true)}
                className="px-4 py-2 bg-[#3A4E63] text-white rounded-lg font-medium hover:bg-[#3A4E63]"
              >
                + Add Deal
              </button>
            </div>
            {deals.length === 0 ? (
              <p className="text-center text-slate-500 py-8">
                No deals yet. Click "Add Deal" to create one.
              </p>
            ) : (
              <div className="space-y-4">
                {deals.map((deal, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-lg border border-slate-100"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {deal.deal_name}
                      </p>
                      <p className="text-sm text-slate-500">
                        {deal.stage} • {deal.probability}% probability
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-slate-900">
                        {formatCurrency(deal.amount)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {deal.expected_close_date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Engagement Tab */}
        {activeTab === "engagement" && (
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              Engagement Metrics
            </h2>
            <div className="grid grid-cols-5 gap-4">
              <div className="bg-slate-50 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Mail className="h-6 w-6 text-[#033F99]" />
                </div>
                <p className="text-3xl font-bold text-slate-900">
                  {lead.email_opens || 0}
                </p>
                <p className="text-sm text-slate-500">Email Opens</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <ExternalLink className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-slate-900">
                  {lead.email_clicks || 0}
                </p>
                <p className="text-sm text-slate-500">Email Clicks</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Globe className="h-6 w-6 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-slate-900">
                  {lead.website_visits || 0}
                </p>
                <p className="text-sm text-slate-500">Website Visits</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FileText className="h-6 w-6 text-amber-600" />
                </div>
                <p className="text-3xl font-bold text-slate-900">
                  {lead.page_views || 0}
                </p>
                <p className="text-sm text-slate-500">Page Views</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Send className="h-6 w-6 text-cyan-600" />
                </div>
                <p className="text-3xl font-bold text-slate-900">
                  {lead.form_submissions || 0}
                </p>
                <p className="text-sm text-slate-500">Form Submissions</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Activity Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              Create Activity
            </h3>
            <form onSubmit={handleCreateActivity} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Type
                </label>
                <select
                  value={newActivity.activity_type}
                  onChange={(e) =>
                    setNewActivity({
                      ...newActivity,
                      activity_type: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg"
                >
                  <option value="Call">Call</option>
                  <option value="Email">Email</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Task">Task</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={newActivity.subject}
                  onChange={(e) =>
                    setNewActivity({ ...newActivity, subject: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newActivity.description}
                  onChange={(e) =>
                    setNewActivity({
                      ...newActivity,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={newActivity.due_date}
                  onChange={(e) =>
                    setNewActivity({ ...newActivity, due_date: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowActivityModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#3A4E63] text-white rounded-lg"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deal Modal */}
      {showDealModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              Create Deal
            </h3>
            <form onSubmit={handleCreateDeal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Deal Name
                </label>
                <input
                  type="text"
                  value={newDeal.deal_name}
                  onChange={(e) =>
                    setNewDeal({ ...newDeal, deal_name: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={newDeal.amount}
                  onChange={(e) =>
                    setNewDeal({ ...newDeal, amount: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Stage
                </label>
                <select
                  value={newDeal.stage}
                  onChange={(e) =>
                    setNewDeal({ ...newDeal, stage: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg"
                >
                  <option value="Qualification">Qualification</option>
                  <option value="Proposal">Proposal</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Closed Won">Closed Won</option>
                  <option value="Closed Lost">Closed Lost</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Probability (%)
                </label>
                <input
                  type="number"
                  value={newDeal.probability}
                  onChange={(e) =>
                    setNewDeal({ ...newDeal, probability: e.target.value })
                  }
                  min="0"
                  max="100"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Expected Close Date
                </label>
                <input
                  type="date"
                  value={newDeal.expected_close_date}
                  onChange={(e) =>
                    setNewDeal({
                      ...newDeal,
                      expected_close_date: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDealModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#3A4E63] text-white rounded-lg"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadDetail;
