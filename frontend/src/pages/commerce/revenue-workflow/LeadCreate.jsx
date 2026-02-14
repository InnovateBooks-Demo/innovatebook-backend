import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  X,
  Building2,
  User,
  MapPin,
  Briefcase,
  BadgeDollarSign,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  UserCircle2,
  Copy,
  Plus,
  Trash2,
  Crown,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

// -------- helpers --------
const pad2 = (n) => String(n).padStart(2, "0");

// REV-LEAD-YYYYMMDDHHmmss
const generateLeadId = () => {
  const d = new Date();
  const y = d.getFullYear();
  const mo = pad2(d.getMonth() + 1);
  const da = pad2(d.getDate());
  const hh = pad2(d.getHours());
  const mm = pad2(d.getMinutes());
  const ss = pad2(d.getSeconds());
  return `REV-LEAD-${y}${mo}${da}${hh}${mm}${ss}`;
};

const toNum = (v) => {
  const n = Number(String(v ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const formatINR = (num) => {
  const n = Number(num);
  if (!Number.isFinite(n) || n <= 0) return "₹0";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `₹${Math.round(n)}`;
  }
};

// tries to infer a "current user" label from localStorage safely
const getCurrentUserLabel = () => {
  const candidates = [
    "user",
    "current_user",
    "profile",
    "me",
    "auth_user",
    "account",
  ];
  for (const key of candidates) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const obj = JSON.parse(raw);
      const label =
        obj?.name ||
        obj?.full_name ||
        obj?.username ||
        obj?.email ||
        obj?.display_name;
      if (label) return label;
    } catch {
      if (raw.includes("@") || raw.length >= 3) return raw;
    }
  }
  return "Current User";
};

const emptyContact = (isPrimary = false) => ({
  full_name: "",
  email: "",
  phone: "",
  role: "",
  is_primary: isPrimary,
});

const RevenueLeadCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Current user banner
  const [currentUserLabel, setCurrentUserLabel] = useState("Current User");

  // Lead form
  const [formData, setFormData] = useState({
    lead_id: "",
    lead_name: "", // optional (UI only)
    company_name: "",
    website: "",
    description: "", // UI only
    expected_deal_value: "",
    lead_status: "new", // UI only (workflow backend sets stage itself)

    // ✅ multi contacts (UI only - we map primary to flat fields)
    contacts: [emptyContact(true)],

    address: { country: "", street: "", city: "", state: "", postal_code: "" },

    business: {
      industry: "",
      employees: "", // UI only
      annual_revenue: "", // UI only
      lead_source: "inbound",
      assigned_to: "", // UI only (we map to owner_id)
    },

    // qualification fields (backend supports these)
    problem_identified: false,
    budget_mentioned: "unknown",
    authority_known: false,
    need_timeline: false,

    // backend supports this
    expected_timeline: "3-6 months",
    notes: "",
  });

  // init lead id and user label
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      lead_id: prev.lead_id || generateLeadId(),
    }));
    setCurrentUserLabel(getCurrentUserLabel());
  }, []);

  const statusOptions = useMemo(
    () => [
      { value: "imported", label: "Imported" },
      { value: "new", label: "New" },
      { value: "contacted", label: "Contacted" },
      { value: "qualified", label: "Qualified" },
      { value: "proposal_sent", label: "Proposal Sent" },
      { value: "won", label: "Won" },
      { value: "lost", label: "Lost" },
    ],
    [],
  );

  const dealValueNum = useMemo(
    () => toNum(formData.expected_deal_value),
    [formData.expected_deal_value],
  );

  // handlers
  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    if (name === "lead_id") return;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({
      ...p,
      address: { ...p.address, [name]: value },
    }));
  };

  const handleBusinessChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({
      ...p,
      business: { ...p.business, [name]: value },
    }));
  };

  const handleContactChange = (index, field, value) => {
    setFormData((p) => {
      const next = [...p.contacts];
      next[index] = { ...next[index], [field]: value };
      return { ...p, contacts: next };
    });
  };

  const setPrimaryContact = (index) => {
    setFormData((p) => {
      const next = p.contacts.map((c, i) => ({
        ...c,
        is_primary: i === index,
      }));
      return { ...p, contacts: next };
    });
  };

  const addContact = () => {
    setFormData((p) => ({
      ...p,
      contacts: [...p.contacts, emptyContact(false)],
    }));
  };

  const removeContact = (index) => {
    setFormData((p) => {
      const next = [...p.contacts];
      const wasPrimary = !!next[index]?.is_primary;
      next.splice(index, 1);

      // keep at least 1 contact
      if (next.length === 0) next.push(emptyContact(true));

      // if removed primary, make first one primary
      if (wasPrimary) {
        next[0] = { ...next[0], is_primary: true };
        for (let i = 1; i < next.length; i++) {
          next[i] = { ...next[i], is_primary: false };
        }
      }

      // also ensure exactly one primary
      const primaryCount = next.filter((c) => c.is_primary).length;
      if (primaryCount === 0) next[0] = { ...next[0], is_primary: true };
      if (primaryCount > 1) {
        let found = false;
        for (let i = 0; i < next.length; i++) {
          if (next[i].is_primary) {
            if (!found) found = true;
            else next[i] = { ...next[i], is_primary: false };
          }
        }
      }

      return { ...p, contacts: next };
    });
  };

  const validate = () => {
    const company = String(formData.company_name || "").trim();
    const assignedTo = String(formData.business.assigned_to || "").trim();
    if (!company) return "Company Name is required";
    if (!assignedTo) return "Assigned To (Owner) is required";

    // lead_id is UI-only; backend generates REV-LEAD-* itself,
    // but keeping this validation is fine if you want it.
    const id = String(formData.lead_id || "").trim();
    if (!id.startsWith("REV-LEAD-")) return "Lead ID must start with REV-LEAD-";

    const primary =
      formData.contacts.find((c) => c.is_primary) || formData.contacts[0];
    if (!primary) return "At least one contact is required";
    if (!String(primary.full_name || "").trim())
      return "Primary contact full name is required";
    if (!String(primary.email || "").trim())
      return "Primary contact email is required";

    // backend requires country in model
    const country = String(formData.address.country || "").trim();
    if (!country) return "Country is required";

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return toast.error(err);

    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return toast.error("No token found. Please login again.");

      const primary =
        formData.contacts.find((c) => c.is_primary) ||
        formData.contacts[0] ||
        {};

      // ✅ IMPORTANT: workflow backend expects FLAT RevenueLeadCreate fields only
      const payload = {
        company_name: String(formData.company_name || "").trim(),
        website: String(formData.website || "").trim() || null,

        country: String(formData.address.country || "").trim(),
        industry: String(formData.business.industry || "").trim() || null,

        contact_name: String(primary.full_name || "").trim(),
        contact_email: String(primary.email || "").trim(),
        contact_phone: String(primary.phone || "").trim() || null,

        lead_source: String(formData.business.lead_source || "inbound").trim(),
        estimated_deal_value: toNum(formData.expected_deal_value),
        expected_timeline: String(
          formData.expected_timeline || "3-6 months",
        ).trim(),

        owner_id: String(formData.business.assigned_to || "").trim() || null,

        problem_identified: !!formData.problem_identified,
        budget_mentioned: formData.budget_mentioned || "unknown",
        authority_known: !!formData.authority_known,
        need_timeline: !!formData.need_timeline,

        notes: String(formData.notes || "").trim() || "",
      };

      const res = await fetch(
        `${API_URL}/api/commerce/workflow/revenue/leads`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();

      if (res.ok && data?.success) {
        toast.success("Lead created successfully");
        window.dispatchEvent(new Event("revenueLeadChanged"));
        navigate("/commerce/revenue-workflow/leads");
      } else {
        const msg =
          data?.detail?.message ||
          data?.detail ||
          data?.message ||
          `Failed to create lead (${res.status})`;
        toast.error(typeof msg === "string" ? msg : "Failed to create lead");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error creating lead");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#f4f6f8]"
      data-testid="revenue-lead-create"
    >
      {/* Finance header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-10 py-7">
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={() => navigate("/commerce/revenue-workflow/leads")}
              className="mt-1 p-2 rounded-xl hover:bg-gray-100 text-gray-700 transition"
              title="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="flex-1">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-xs font-semibold">
                      <ShieldCheck className="h-4 w-4" />
                      Finance Revenue Workflow
                    </div>
                    <h1 className="mt-3 text-3xl font-semibold text-gray-900">
                      Create New Lead
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                      Track opportunities with clean IDs, owners and contacts.
                    </p>
                  </div>

                  {/* KPI */}
                  {/* <div className="hidden lg:flex items-stretch gap-3">
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm px-4 py-3 min-w-[190px]">
                      <div className="flex items-center gap-2 text-gray-600 text-xs font-semibold">
                        <TrendingUp className="h-4 w-4" />
                        Expected Value
                      </div>
                      <div className="mt-1 text-lg font-bold text-gray-900">
                        {formatINR(dealValueNum)}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm px-4 py-3 min-w-[190px]">
                      <div className="flex items-center gap-2 text-gray-600 text-xs font-semibold">
                        <Sparkles className="h-4 w-4" />
                        Status
                      </div>
                      <div className="mt-1 text-sm font-bold text-gray-900">
                        {statusOptions.find(
                          (s) => s.value === formData.lead_status,
                        )?.label || "New"}
                      </div>
                    </div>
                  </div> */}
                </div>

                {/* Current user label is still kept (not sent to backend) */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-10 py-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Top two cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Basic Information */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm h-full">
              <div className="px-8 py-5 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-gray-700" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Basic Information
                  </h2>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Lead ID is generated internally and is immutable.
                </p>
              </div>

              <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Lead ID - UI only */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Lead ID
                  </label>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="lead_id"
                      value={formData.lead_id}
                      readOnly
                      title={formData.lead_id}
                      className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 font-semibold tracking-wide focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                      style={{ fontVariantLigatures: "none" }}
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(
                            String(formData.lead_id || ""),
                          );
                          toast.success("Lead ID copied");
                        } catch {
                          toast.error("Unable to copy");
                        }
                      }}
                      className="h-11 px-4 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 font-semibold inline-flex items-center gap-2"
                      title="Copy Lead ID"
                    >
                      <Copy className="h-4 w-4" />
                      Copy
                    </button>
                  </div>
                </div>

                {/* Lead Status (UI only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Lead Status
                  </label>
                  <select
                    name="lead_status"
                    value={formData.lead_status}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        lead_status: e.target.value,
                      }))
                    }
                    className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                  >
                    {statusOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Lead Name optional (UI only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Lead Name <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    name="lead_name"
                    value={formData.lead_name}
                    onChange={handleBasicChange}
                    className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                    placeholder="e.g., Q2 Renewal - ABC"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleBasicChange}
                    required
                    className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                    placeholder="Registered/Trading name"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Website <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleBasicChange}
                    className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                    placeholder="https://"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Description{" "}
                    <span className="text-gray-400">(optional)</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleBasicChange}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                    placeholder="Notes for finance review / underwriting / deal details…"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Expected Deal Value (₹){" "}
                    <span className="text-gray-400">(optional)</span>
                  </label>
                  <div className="relative">
                    <BadgeDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      name="expected_deal_value"
                      value={formData.expected_deal_value}
                      onChange={handleBasicChange}
                      min="0"
                      className="w-full h-11 pl-11 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                      placeholder="0"
                    />
                  </div>

                  {dealValueNum > 0 && (
                    <div className="mt-2 text-xs text-gray-600">
                      Preview:{" "}
                      <span className="font-semibold text-gray-900">
                        {formatINR(dealValueNum)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contacts (multiple) */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col h-full">
              {/* Header */}
              <div className="px-8 py-5 border-b border-gray-200 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-700" />
                    <h2 className="text-lg font-semibold text-gray-900">
                      Contacts
                    </h2>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Add multiple contacts and mark one as Primary.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addContact}
                  className="h-11 px-5 rounded-xl bg-[#3A4E63] text-white font-semibold hover:bg-[#022d6e] transition inline-flex items-center gap-2 shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  Add Contact
                </button>
              </div>

              {/* Body */}
              <div className="px-8 py-8 flex-1 flex flex-col gap-6">
                {formData.contacts.map((c, idx) => {
                  const isPrimary = !!c.is_primary;

                  return (
                    <div
                      key={idx}
                      className={`rounded-2xl border overflow-hidden ${
                        isPrimary
                          ? "border-blue-200 bg-blue-50/30"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      {/* Card header row */}
                      <div
                        className={`px-6 py-4 flex items-center justify-between gap-4 ${
                          isPrimary
                            ? "border-b border-blue-200/70"
                            : "border-b border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isPrimary ? (
                            <span className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
                              <Crown className="h-4 w-4" />
                              Primary Contact
                            </span>
                          ) : (
                            <span className="text-sm font-semibold text-gray-700">
                              Contact {idx + 1}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          {!isPrimary && (
                            <button
                              type="button"
                              onClick={() => setPrimaryContact(idx)}
                              className="h-10 px-4 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-900 text-sm font-semibold transition"
                            >
                              Make Primary
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => removeContact(idx)}
                            className="h-10 px-4 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-900 text-sm font-semibold transition inline-flex items-center gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Fields */}
                      <div className="px-6 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                          <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                              Full Name{" "}
                              {isPrimary ? (
                                <span className="text-red-500">*</span>
                              ) : null}
                            </label>
                            <input
                              type="text"
                              value={c.full_name}
                              onChange={(e) =>
                                handleContactChange(
                                  idx,
                                  "full_name",
                                  e.target.value,
                                )
                              }
                              className="w-full h-11 px-4 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                              Role{" "}
                              <span className="text-gray-400 font-medium">
                                (optional)
                              </span>
                            </label>
                            <input
                              type="text"
                              value={c.role}
                              onChange={(e) =>
                                handleContactChange(idx, "role", e.target.value)
                              }
                              className="w-full h-11 px-4 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                              Email{" "}
                              {isPrimary ? (
                                <span className="text-red-500">*</span>
                              ) : null}
                            </label>
                            <input
                              type="email"
                              value={c.email}
                              onChange={(e) =>
                                handleContactChange(
                                  idx,
                                  "email",
                                  e.target.value,
                                )
                              }
                              className="w-full h-11 px-4 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                              Phone{" "}
                              <span className="text-gray-400 font-medium">
                                (optional)
                              </span>
                            </label>
                            <input
                              type="tel"
                              value={c.phone}
                              onChange={(e) =>
                                handleContactChange(
                                  idx,
                                  "phone",
                                  e.target.value,
                                )
                              }
                              className="w-full h-11 px-4 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-blue-700 mt-0.5" />
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">Only the Primary</span>{" "}
                    contact is mandatory. Others are optional but useful for
                    finance comms.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Address + Business Profile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-8 py-5 border-b border-gray-200 flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-700" />
                <h2 className="text-lg font-semibold text-gray-900">Address</h2>
              </div>

              <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  name="country"
                  value={formData.address.country}
                  onChange={handleAddressChange}
                  placeholder="Country"
                  className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                />
                <input
                  name="state"
                  value={formData.address.state}
                  onChange={handleAddressChange}
                  placeholder="State/Province"
                  className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                />
                <input
                  name="street"
                  value={formData.address.street}
                  onChange={handleAddressChange}
                  placeholder="Street"
                  className="md:col-span-2 w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                />
                <input
                  name="city"
                  value={formData.address.city}
                  onChange={handleAddressChange}
                  placeholder="City"
                  className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                />
                <input
                  name="postal_code"
                  value={formData.address.postal_code}
                  onChange={handleAddressChange}
                  placeholder="Zip/Postal Code"
                  className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-8 py-5 border-b border-gray-200 flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-gray-700" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Business Profile
                </h2>
              </div>

              <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  name="industry"
                  value={formData.business.industry}
                  onChange={handleBusinessChange}
                  placeholder="Industry"
                  className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                />
                <input
                  name="employees"
                  value={formData.business.employees}
                  onChange={handleBusinessChange}
                  placeholder="Employees"
                  className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                />
                <input
                  name="annual_revenue"
                  value={formData.business.annual_revenue}
                  onChange={handleBusinessChange}
                  placeholder="Annual revenue"
                  className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                />
                <select
                  name="lead_source"
                  value={formData.business.lead_source}
                  onChange={handleBusinessChange}
                  className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                >
                  <option value="inbound">Inbound</option>
                  <option value="outbound">Outbound</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="referral">Referral</option>
                  <option value="website">Website</option>
                  <option value="trade_show">Trade Show</option>
                  <option value="partner">Partner</option>
                  <option value="other">Other</option>
                </select>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Assigned To (Owner) <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="assigned_to"
                    value={formData.business.assigned_to}
                    onChange={handleBusinessChange}
                    placeholder="Assigned to"
                    className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/commerce/revenue-workflow/leads")}
              className="h-11 px-6 rounded-lg border border-gray-300 bg-white text-gray-800 font-medium hover:bg-gray-50 transition"
            >
              <X className="h-4 w-4 inline mr-2" />
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="h-11 px-7 rounded-lg bg-[#3A4E63] text-white font-semibold hover:bg-[#022d6e] transition disabled:opacity-50"
            >
              <Save className="h-4 w-4 inline mr-2" />
              {loading ? "Creating..." : "Create Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RevenueLeadCreate;
