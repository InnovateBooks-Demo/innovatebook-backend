import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  ArrowLeft,
  Save,
  X,
  Users,
  Handshake,
  Share2,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PartyEngineCreate = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    legal_name: "",
    country: "India",
    party_roles: [],
    registration_number: "",
    created_source: "manual",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleRole = (role) => {
    setFormData((prev) => ({
      ...prev,
      party_roles: prev.party_roles.includes(role)
        ? prev.party_roles.filter((r) => r !== role)
        : [...prev.party_roles, role],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.legal_name ||
      !formData.country ||
      formData.party_roles.length === 0
    ) {
      toast.error("Please fill required fields and select at least one role");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/parties-engine/parties`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        },
      );
      const data = await res.json();
      if (data.success) {
        toast.success("Party created successfully");
        navigate(`/commerce/parties-engine/${data.party_id}`);
      } else {
        toast.error(data.detail || "Failed to create party");
      }
    } catch (error) {
      toast.error("Error creating party");
    } finally {
      setSaving(false);
    }
  };

  const roles = [
    {
      id: "customer",
      label: "Customer",
      icon: Users,
      description: "Buying from us",
      color: "blue",
    },
    {
      id: "vendor",
      label: "Vendor",
      icon: Building2,
      description: "Supplying to us",
      color: "purple",
    },
    {
      id: "partner",
      label: "Partner",
      icon: Handshake,
      description: "JV / Service partner",
      color: "green",
    },
    {
      id: "channel",
      label: "Channel / Reseller",
      icon: Share2,
      description: "Selling on our behalf",
      color: "orange",
    },
  ];

  const countries = [
    "India",
    "USA",
    "UK",
    "Germany",
    "Singapore",
    "Australia",
    "Canada",
    "UAE",
    "Japan",
    "Other",
  ];

  return (
    <div className="min-h-screen bg-gray-50" data-testid="party-engine-create">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/commerce/parties-engine")}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Add New Party
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Create a new commercial identity
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Party Roles Selection */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Party Role(s) *
              </h2>
              <p className="text-sm text-gray-500">
                Select one or more roles for this party
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {roles.map((role) => {
                  const isSelected = formData.party_roles.includes(role.id);
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => toggleRole(role.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? `border-${role.color}-500 bg-${role.color}-50 ring-2 ring-${role.color}-500`
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isSelected ? `bg-${role.color}-100` : "bg-gray-100"
                          }`}
                        >
                          <role.icon
                            className={`h-5 w-5 ${isSelected ? `text-${role.color}-600` : "text-gray-500"}`}
                          />
                        </div>
                        <div>
                          <p
                            className={`font-semibold ${isSelected ? `text-${role.color}-700` : "text-gray-900"}`}
                          >
                            {role.label}
                          </p>
                          <p className="text-xs text-gray-500">
                            {role.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Basic Information
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Legal Name *
                </label>
                <input
                  type="text"
                  name="legal_name"
                  value={formData.legal_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                  placeholder="Enter registered legal name"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                  >
                    {countries.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    name="registration_number"
                    value={formData.registration_number}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                    placeholder="CIN / EIN / Registration #"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> After creating the party, you'll need to
              complete the Identity, Legal, Tax, Risk, and Compliance profiles
              to reach "Fully Verified" status. Only verified parties can sign
              contracts.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/commerce/parties-engine")}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-[#3A4E63] rounded-lg hover:bg-[#022d6e] disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Creating..." : "Create Party"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PartyEngineCreate;
