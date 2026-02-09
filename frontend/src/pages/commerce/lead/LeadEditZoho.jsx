import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  User,
  Building2,
  Phone,
  MapPin,
  FileText,
  Save,
  ArrowLeft,
  X,
  Briefcase,
  Linkedin,
  Twitter,
  Facebook,
  Target,
  Tag,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const LeadEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState("basic");

  const [formData, setFormData] = useState({
    lead_owner: "",
    salutation: "",
    first_name: "",
    last_name: "",
    title: "",
    company: "",
    company_type: "",
    industry: "",
    annual_revenue: "",
    no_of_employees: "",
    lead_source: "",
    lead_status: "New",
    rating: "",
    lifecycle_stage: "Lead",
    lead_priority: "Medium",
    phone: "",
    mobile: "",
    email: "",
    secondary_email: "",
    website: "",
    linkedin_url: "",
    twitter_handle: "",
    facebook_url: "",
    street: "",
    city: "",
    state: "",
    zip_code: "",
    country: "India",
    campaign_source: "",
    campaign_name: "",
    campaign_medium: "",
    deal_value: "",
    deal_stage: "",
    deal_probability: "",
    expected_close_date: "",
    description: "",
    email_opt_out: false,
    do_not_call: false,
    tags: "",
  });

  const salutations = ["Mr.", "Mrs.", "Ms.", "Dr.", "Prof."];
  const leadSources = [
    "Advertisement",
    "Cold Call",
    "Employee Referral",
    "External Referral",
    "Online Store",
    "Partner",
    "Trade Show",
    "Web Download",
    "Website",
    "Google Ads",
    "LinkedIn",
    "Organic",
  ];
  const leadStatuses = [
    "New",
    "Contacted",
    "Qualified",
    "Proposal Sent",
    "Negotiation",
    "Converted",
    "Lost",
  ];
  const lifecycleStages = [
    "Subscriber",
    "Lead",
    "MQL",
    "SQL",
    "Opportunity",
    "Customer",
  ];
  const dealStages = [
    "Qualification",
    "Proposal",
    "Negotiation",
    "Closed Won",
    "Closed Lost",
  ];
  const industries = [
    "Banking",
    "Consulting",
    "Education",
    "Energy",
    "Finance",
    "Healthcare",
    "Insurance",
    "Manufacturing",
    "Media",
    "Retail",
    "Technology",
    "Telecommunications",
    "Other",
  ];
  const ratings = ["Hot", "Warm", "Cold"];

  useEffect(() => {
    fetchLead();
  }, [id]);

  const fetchLead = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/modules/revenue/leads/${id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      if (data.lead || data) {
        const lead = data.lead || data;
        setFormData({
          lead_owner: lead.lead_owner || "",
          salutation: lead.salutation || "",
          first_name: lead.first_name || "",
          last_name: lead.last_name || "",
          title: lead.title || "",
          company: lead.company || "",
          company_type: lead.company_type || "",
          industry: lead.industry || "",
          annual_revenue: lead.annual_revenue || "",
          no_of_employees: lead.no_of_employees || "",
          lead_source: lead.lead_source || "",
          lead_status: lead.lead_status || "New",
          rating: lead.rating || "",
          lifecycle_stage: lead.lifecycle_stage || "Lead",
          lead_priority: lead.lead_priority || "Medium",
          phone: lead.phone || "",
          mobile: lead.mobile || "",
          email: lead.email || "",
          secondary_email: lead.secondary_email || "",
          website: lead.website || "",
          linkedin_url: lead.linkedin_url || "",
          twitter_handle: lead.twitter_handle || "",
          facebook_url: lead.facebook_url || "",
          street: lead.street || "",
          city: lead.city || "",
          state: lead.state || "",
          zip_code: lead.zip_code || "",
          country: lead.country || "India",
          campaign_source: lead.campaign_source || "",
          campaign_name: lead.campaign_name || "",
          campaign_medium: lead.campaign_medium || "",
          deal_value: lead.deal_value || "",
          deal_stage: lead.deal_stage || "",
          deal_probability: lead.deal_probability || "",
          expected_close_date: lead.expected_close_date?.split("T")[0] || "",
          description: lead.description || "",
          email_opt_out: lead.email_opt_out || false,
          do_not_call: lead.do_not_call || false,
          tags: Array.isArray(lead.tags)
            ? lead.tags.join(", ")
            : lead.tags || "",
        });
      }
    } catch (error) {
      toast.error("Failed to load lead");
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.last_name) {
      toast.error("Last Name is required");
      return;
    }
    if (!formData.company) {
      toast.error("Company is required");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const submitData = {
        ...formData,
        annual_revenue: formData.annual_revenue
          ? parseFloat(formData.annual_revenue)
          : null,
        no_of_employees: formData.no_of_employees
          ? parseInt(formData.no_of_employees)
          : null,
        deal_value: formData.deal_value
          ? parseFloat(formData.deal_value)
          : null,
        deal_probability: formData.deal_probability
          ? parseInt(formData.deal_probability)
          : null,
        tags: formData.tags
          ? formData.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      };

      const res = await fetch(
        `${API_URL}/api/commerce/modules/revenue/leads/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(submitData),
        },
      );
      if (res.ok) {
        toast.success("Lead updated successfully");
        navigate(`/commerce/lead/${id}`);
      } else {
        const data = await res.json();
        toast.error(data.detail || "Failed to update lead");
      }
    } catch (error) {
      toast.error("Error updating lead");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "basic", label: "Lead Info", icon: User },
    { id: "company", label: "Company", icon: Building2 },
    { id: "contact", label: "Contact", icon: Phone },
    { id: "social", label: "Social", icon: Linkedin },
    { id: "campaign", label: "Campaign", icon: Target },
    { id: "deal", label: "Deal", icon: Briefcase },
    { id: "additional", label: "Additional", icon: FileText },
  ];

  const inputClass =
    "w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3A4E63] bg-white";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

  if (fetching)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-[#3A4E63]" />
      </div>
    );

  return (
    <div className="p-8" data-testid="lead-edit">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate(`/commerce/lead/${id}`)}
          className="flex items-center gap-2 text-slate-600 hover:text-[#3A4E63] mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back to Lead</span>
        </button>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Edit Lead</h1>
        <p className="text-slate-600 mb-8">
          {formData.first_name} {formData.last_name} • {formData.company}
        </p>

        {/* Tabs - Workspace Style */}
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
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Lead Info Tab */}
          {activeTab === "basic" && (
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                Lead Information
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className={labelClass}>Lead Owner</label>
                  <input
                    type="text"
                    name="lead_owner"
                    value={formData.lead_owner}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Lead owner"
                  />
                </div>
                <div>
                  <label className={labelClass}>Salutation</label>
                  <select
                    name="salutation"
                    value={formData.salutation}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">Select</option>
                    {salutations.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    className={inputClass}
                    placeholder="Last name"
                  />
                </div>
                <div>
                  <label className={labelClass}>Job Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Job title"
                  />
                </div>
                <div>
                  <label className={labelClass}>Lead Source</label>
                  <select
                    name="lead_source"
                    value={formData.lead_source}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">Select Source</option>
                    {leadSources.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Lead Status</label>
                  <select
                    name="lead_status"
                    value={formData.lead_status}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    {leadStatuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Rating</label>
                  <select
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">Select Rating</option>
                    {ratings.map((r) => (
                      <option key={r} value={r}>
                        {r === "Hot"
                          ? "🔥 Hot"
                          : r === "Warm"
                            ? "🌡️ Warm"
                            : "❄️ Cold"}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Lifecycle Stage</label>
                  <select
                    name="lifecycle_stage"
                    value={formData.lifecycle_stage}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    {lifecycleStages.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Company Tab */}
          {activeTab === "company" && (
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                Company Information
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>
                    Company <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    required
                    className={inputClass}
                    placeholder="Company name"
                  />
                </div>
                <div>
                  <label className={labelClass}>Industry</label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">Select Industry</option>
                    {industries.map((i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Annual Revenue (₹)</label>
                  <input
                    type="number"
                    name="annual_revenue"
                    value={formData.annual_revenue}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g. 10000000"
                  />
                </div>
                <div>
                  <label className={labelClass}>No. of Employees</label>
                  <input
                    type="number"
                    name="no_of_employees"
                    value={formData.no_of_employees}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g. 50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === "contact" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-6">
                  Contact Information
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Mobile</label>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Website</label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="https://www.example.com"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-6">
                  Address
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className={labelClass}>Street</label>
                    <textarea
                      name="street"
                      value={formData.street}
                      onChange={handleChange}
                      rows={2}
                      className={inputClass}
                      placeholder="Street address"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Zip Code</label>
                    <input
                      type="text"
                      name="zip_code"
                      value={formData.zip_code}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Postal code"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Country"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Social Tab */}
          {activeTab === "social" && (
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                Social Profiles
              </h2>
              <div className="space-y-6">
                <div>
                  <label className={labelClass}>
                    <Linkedin className="inline h-4 w-4 text-[#033F99] mr-2" />
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    name="linkedin_url"
                    value={formData.linkedin_url}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    <Twitter className="inline h-4 w-4 text-sky-500 mr-2" />
                    Twitter Handle
                  </label>
                  <input
                    type="text"
                    name="twitter_handle"
                    value={formData.twitter_handle}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="@username"
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    <Facebook className="inline h-4 w-4 text-blue-700 mr-2" />
                    Facebook URL
                  </label>
                  <input
                    type="url"
                    name="facebook_url"
                    value={formData.facebook_url}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="https://facebook.com/username"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Campaign Tab */}
          {activeTab === "campaign" && (
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                Campaign Information
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Campaign Source</label>
                  <input
                    type="text"
                    name="campaign_source"
                    value={formData.campaign_source}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g. Google, Facebook"
                  />
                </div>
                <div>
                  <label className={labelClass}>Campaign Name</label>
                  <input
                    type="text"
                    name="campaign_name"
                    value={formData.campaign_name}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Campaign name"
                  />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Campaign Medium</label>
                  <input
                    type="text"
                    name="campaign_medium"
                    value={formData.campaign_medium}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g. Email, Social, PPC"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Deal Tab */}
          {activeTab === "deal" && (
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                Deal / Opportunity
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Deal Value (₹)</label>
                  <input
                    type="number"
                    name="deal_value"
                    value={formData.deal_value}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g. 500000"
                  />
                </div>
                <div>
                  <label className={labelClass}>Deal Stage</label>
                  <select
                    name="deal_stage"
                    value={formData.deal_stage}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">Select Stage</option>
                    {dealStages.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Probability (%)</label>
                  <input
                    type="number"
                    name="deal_probability"
                    value={formData.deal_probability}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    className={inputClass}
                    placeholder="0-100"
                  />
                </div>
                <div>
                  <label className={labelClass}>Expected Close Date</label>
                  <input
                    type="date"
                    name="expected_close_date"
                    value={formData.expected_close_date}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Additional Tab */}
          {activeTab === "additional" && (
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                Additional Information
              </h2>
              <div className="space-y-6">
                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className={inputClass}
                    placeholder="Notes..."
                  />
                </div>
                <div>
                  <label className={labelClass}>Tags (comma-separated)</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g. enterprise, hot-lead"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="email_opt_out"
                      checked={formData.email_opt_out}
                      onChange={handleChange}
                      className="rounded border-slate-300"
                    />
                    <span className="text-sm text-slate-700">
                      Email Opt Out
                    </span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="do_not_call"
                      checked={formData.do_not_call}
                      onChange={handleChange}
                      className="rounded border-slate-300"
                    />
                    <span className="text-sm text-slate-700">Do Not Call</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(`/commerce/lead/${id}`)}
              className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-medium text-white bg-[#3A4E63] rounded-lg hover:bg-[#3A4E63] disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadEdit;
