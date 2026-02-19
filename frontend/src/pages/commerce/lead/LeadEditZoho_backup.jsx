import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  FileText,
  Save,
  ArrowLeft,
  X,
  Briefcase,
  DollarSign,
  Users,
  Star,
  Info,
  Linkedin,
  Twitter,
  Facebook,
  Target,
  Activity,
  Zap,
  Tag,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const LeadCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const [formData, setFormData] = useState({
    // Lead Information
    lead_owner: "",
    salutation: "",
    first_name: "",
    last_name: "",
    title: "",

    // Company Information
    company: "",
    company_type: "",
    industry: "",
    annual_revenue: "",
    no_of_employees: "",

    // Lead Classification
    lead_source: "",
    lead_status: "New",
    rating: "",
    lifecycle_stage: "Lead",
    lead_priority: "Medium",

    // Contact Information
    phone: "",
    mobile: "",
    fax: "",
    email: "",
    secondary_email: "",
    skype_id: "",
    website: "",

    // Social Profiles
    linkedin_url: "",
    twitter_handle: "",
    facebook_url: "",

    // Address Information
    street: "",
    city: "",
    state: "",
    zip_code: "",
    country: "India",

    // Campaign Information
    campaign_source: "",
    campaign_name: "",
    campaign_medium: "",

    // Deal Information
    deal_value: "",
    deal_stage: "",
    deal_probability: "",
    expected_close_date: "",

    // Additional Information
    description: "",
    email_opt_out: false,
    do_not_call: false,
    current_vendor: "",
    tags: "",
  });

  const salutations = ["Mr.", "Mrs.", "Ms.", "Dr.", "Prof."];
  const companyTypes = ["SMB", "Mid-Market", "Enterprise"];
  const leadSources = [
    "Advertisement",
    "Cold Call",
    "Employee Referral",
    "External Referral",
    "Online Store",
    "Partner",
    "Public Relations",
    "Sales Email Alias",
    "Seminar Partner",
    "Internal Seminar",
    "Trade Show",
    "Web Download",
    "Web Research",
    "Chat",
    "Twitter",
    "Facebook",
    "LinkedIn",
    "Website",
    "Google Ads",
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
    "Agriculture",
    "Apparel",
    "Banking",
    "Biotechnology",
    "Chemicals",
    "Communications",
    "Construction",
    "Consulting",
    "Education",
    "Electronics",
    "Energy",
    "Engineering",
    "Entertainment",
    "Environmental",
    "Finance",
    "Food & Beverage",
    "Government",
    "Healthcare",
    "Hospitality",
    "Insurance",
    "Legal",
    "Machinery",
    "Manufacturing",
    "Media",
    "Not For Profit",
    "Other",
    "Recreation",
    "Retail",
    "Shipping",
    "Technology",
    "Telecommunications",
    "Transportation",
    "Utilities",
  ];
  const ratings = ["Hot", "Warm", "Cold"];
  const priorities = ["High", "Medium", "Low"];
  const campaignMediums = [
    "Email",
    "Social",
    "PPC",
    "Organic",
    "Event",
    "Referral",
    "Phone",
    "Partnership",
  ];

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

      const res = await fetch(`${API_URL}/api/commerce/modules/revenue/leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Lead created successfully");
        navigate("/commerce/lead");
      } else {
        toast.error(data.detail || "Failed to create lead");
      }
    } catch (error) {
      toast.error("Error creating lead");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "basic", label: "Lead Info", icon: User, platform: "Zoho" },
    { id: "company", label: "Company", icon: Building2 },
    { id: "contact", label: "Contact", icon: Phone },
    { id: "social", label: "Social", icon: Linkedin, platform: "HubSpot" },
    { id: "campaign", label: "Campaign", icon: Target, platform: "Salesforce" },
    { id: "deal", label: "Deal", icon: Briefcase, platform: "Salesforce" },
    { id: "additional", label: "Additional", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-white" data-testid="lead-create">
      {/* Workspace Header */}
      <div className="border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/commerce/lead")}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#033F99] rounded-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Create New Lead
                  </h1>
                  <p className="text-xs text-gray-500 mt-0.5">
                    <span className="text-orange-600 font-medium">Zoho</span> +{" "}
                    <span className="text-orange-500 font-medium">HubSpot</span>{" "}
                    +{" "}
                    <span className="text-blue-600 font-medium">
                      Salesforce
                    </span>{" "}
                    Fields
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 flex gap-1 overflow-x-auto border-t border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                  ? "border-[#033F99] text-[#033F99]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.platform && (
                <span
                  className={`ml-1 text-[9px] px-1 py-0.5 rounded ${tab.platform === "HubSpot"
                      ? "bg-orange-100 text-orange-600"
                      : tab.platform === "Salesforce"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-orange-100 text-orange-700"
                    }`}
                >
                  {tab.platform}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="px-6 py-4 max-w-4xl">
          {/* Lead Information Tab - Zoho */}
          {activeTab === "basic" && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center gap-2">
                  <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-0.5 rounded">
                    Zoho
                  </span>
                  <h2 className="text-sm font-semibold text-gray-900">
                    Lead Information
                  </h2>
                </div>
                <div className="p-4 grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Lead Owner
                    </label>
                    <input
                      type="text"
                      name="lead_owner"
                      value={formData.lead_owner}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99] focus:border-transparent"
                      placeholder="Assign lead owner"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Salutation
                    </label>
                    <select
                      name="salutation"
                      value={formData.salutation}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99] bg-white"
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
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                      placeholder="Last name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Job Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                      placeholder="e.g. CEO, Manager"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center gap-2">
                  <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-0.5 rounded">
                    Zoho
                  </span>
                  <h2 className="text-sm font-semibold text-gray-900">
                    Lead Classification
                  </h2>
                  <span className="text-[9px] text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded ml-2">
                    + HubSpot Lifecycle
                  </span>
                </div>
                <div className="p-4 grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Lead Source
                    </label>
                    <select
                      name="lead_source"
                      value={formData.lead_source}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99] bg-white"
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
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Lead Status
                    </label>
                    <select
                      name="lead_status"
                      value={formData.lead_status}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99] bg-white"
                    >
                      {leadStatuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Rating
                    </label>
                    <select
                      name="rating"
                      value={formData.rating}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99] bg-white"
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
                    <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                      Lifecycle Stage
                      <span className="text-[8px] text-orange-500 bg-orange-50 px-1 rounded">
                        HubSpot
                      </span>
                    </label>
                    <select
                      name="lifecycle_stage"
                      value={formData.lifecycle_stage}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99] bg-white"
                    >
                      {lifecycleStages.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      name="lead_priority"
                      value={formData.lead_priority}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99] bg-white"
                    >
                      {priorities.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Company Tab */}
          {activeTab === "company" && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-500" />
                <h2 className="text-sm font-semibold text-gray-900">
                  Company Information
                </h2>
              </div>
              <div className="p-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Company <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                    placeholder="Company name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Company Type
                  </label>
                  <select
                    name="company_type"
                    value={formData.company_type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99] bg-white"
                  >
                    <option value="">Select Type</option>
                    {companyTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Industry
                  </label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99] bg-white"
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
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Annual Revenue (₹)
                  </label>
                  <input
                    type="number"
                    name="annual_revenue"
                    value={formData.annual_revenue}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                    placeholder="e.g. 10000000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    No. of Employees
                  </label>
                  <input
                    type="number"
                    name="no_of_employees"
                    value={formData.no_of_employees}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                    placeholder="e.g. 50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Current Vendor
                  </label>
                  <input
                    type="text"
                    name="current_vendor"
                    value={formData.current_vendor}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                    placeholder="e.g. Zoho CRM, Salesforce"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === "contact" && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <h2 className="text-sm font-semibold text-gray-900">
                    Contact Information
                  </h2>
                </div>
                <div className="p-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Mobile
                    </label>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Secondary Email
                    </label>
                    <input
                      type="email"
                      name="secondary_email"
                      value={formData.secondary_email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                      placeholder="secondary@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Fax
                    </label>
                    <input
                      type="tel"
                      name="fax"
                      value={formData.fax}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                      placeholder="Fax number"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Skype ID
                    </label>
                    <input
                      type="text"
                      name="skype_id"
                      value={formData.skype_id}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                      placeholder="Skype username"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                      placeholder="https://www.example.com"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <h2 className="text-sm font-semibold text-gray-900">
                    Address
                  </h2>
                </div>
                <div className="p-4 grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Street
                    </label>
                    <textarea
                      name="street"
                      value={formData.street}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                      placeholder="Street address"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Zip Code
                    </label>
                    <input
                      type="text"
                      name="zip_code"
                      value={formData.zip_code}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                      placeholder="Postal code"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                      placeholder="Country"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Social Tab - HubSpot */}
          {activeTab === "social" && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center gap-2">
                <span className="text-xs font-semibold text-orange-500 bg-orange-100 px-2 py-0.5 rounded">
                  HubSpot
                </span>
                <h2 className="text-sm font-semibold text-gray-900">
                  Social Profiles
                </h2>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Linkedin className="h-4 w-4 text-blue-600" />
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    name="linkedin_url"
                    value={formData.linkedin_url}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Twitter className="h-4 w-4 text-sky-500" />
                    Twitter Handle
                  </label>
                  <input
                    type="text"
                    name="twitter_handle"
                    value={formData.twitter_handle}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                    placeholder="@username"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Facebook className="h-4 w-4 text-blue-700" />
                    Facebook URL
                  </label>
                  <input
                    type="url"
                    name="facebook_url"
                    value={formData.facebook_url}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                    placeholder="https://facebook.com/page"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Campaign Tab - Salesforce */}
          {activeTab === "campaign" && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center gap-2">
                <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                  Salesforce
                </span>
                <h2 className="text-sm font-semibold text-gray-900">
                  Campaign Information
                </h2>
              </div>
              <div className="p-4 grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Campaign Source
                  </label>
                  <input
                    type="text"
                    name="campaign_source"
                    value={formData.campaign_source}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                    placeholder="e.g. Google, Facebook"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    name="campaign_name"
                    value={formData.campaign_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                    placeholder="e.g. Q1 Lead Gen"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Campaign Medium
                  </label>
                  <select
                    name="campaign_medium"
                    value={formData.campaign_medium}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99] bg-white"
                  >
                    <option value="">Select Medium</option>
                    {campaignMediums.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Deal Tab - Salesforce */}
          {activeTab === "deal" && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center gap-2">
                <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                  Salesforce
                </span>
                <h2 className="text-sm font-semibold text-gray-900">
                  Deal / Opportunity
                </h2>
              </div>
              <div className="p-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Deal Value (₹)
                  </label>
                  <input
                    type="number"
                    name="deal_value"
                    value={formData.deal_value}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                    placeholder="e.g. 1000000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Deal Stage
                  </label>
                  <select
                    name="deal_stage"
                    value={formData.deal_stage}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99] bg-white"
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
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Probability (%)
                  </label>
                  <input
                    type="number"
                    name="deal_probability"
                    value={formData.deal_probability}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                    placeholder="0-100"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Expected Close Date
                  </label>
                  <input
                    type="date"
                    name="expected_close_date"
                    value={formData.expected_close_date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Additional Tab */}
          {activeTab === "additional" && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <h2 className="text-sm font-semibold text-gray-900">
                  Additional Information
                </h2>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                    placeholder="Add notes about this lead..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Tag className="h-3.5 w-3.5" />
                    Tags (comma separated)
                    <span className="text-[8px] text-orange-500 bg-orange-50 px-1 rounded ml-1">
                      HubSpot
                    </span>
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                    placeholder="e.g. enterprise, high-value, tech"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="email_opt_out"
                      checked={formData.email_opt_out}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-300 text-[#033F99] focus:ring-[#033F99]"
                    />
                    <label className="text-xs text-gray-700">
                      Email Opt Out - Do not send marketing emails
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="do_not_call"
                      checked={formData.do_not_call}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-300 text-[#033F99] focus:ring-[#033F99]"
                    />
                    <label className="text-xs text-gray-700">
                      Do Not Call - Exclude from phone campaigns
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="mt-4 flex items-center justify-between bg-gray-50 rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Info className="h-4 w-4" />
              <span>
                Fields marked with <span className="text-red-500">*</span> are
                required
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate("/commerce/lead")}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-medium text-white bg-[#033F99] rounded-lg hover:bg-[#022d6e] disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {loading ? "Creating..." : "Create Lead"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LeadCreate;
