import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Building2,
  User,
  Globe,
  Target,
  Tag,
  X,
} from "lucide-react";
import axios from "axios";
import {
  PageWrapper,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  FormInput,
  FormTextarea,
  FormSelect,
} from "../CommerceDesignSystem";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const LeadCreateComplete = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // 1. Lead Identification
    company_name: "",
    lead_source: "Website",

    // 2. Contact Person
    contact_name: "",
    email_address: "",
    phone_number: "",
    designation: "",
    department: "",

    // 3. Company Information
    country: "India",
    state: "",
    city: "",
    website_url: "",
    industry_type: "",
    company_size: "",

    // 4. Business Interest
    product_or_solution_interested_in: "",
    estimated_deal_value: "",
    decision_timeline: "",
    notes: "",

    // 5. Internal Tagging
    lead_campaign_name: "",
    tags: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      // Prepare data
      const submitData = {
        ...formData,
        estimated_deal_value: formData.estimated_deal_value
          ? parseFloat(formData.estimated_deal_value)
          : null,
        tags: formData.tags
          ? formData.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
          : [],
      };

      const response = await axios.post(
        `${BACKEND_URL}/api/commerce/leads`,
        submitData,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        alert(`✅ ${response.data.message}\nLead ID: ${response.data.lead_id}`);
        navigate(`/commerce/lead/${response.data.lead_id}`);
      }
    } catch (error) {
      console.error("Failed to create lead:", error);
      alert(
        `❌ Failed to create lead: ${error.response?.data?.detail || error.message}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <PageHeader
        title="Add New Lead"
        subtitle="Capture potential customer information across all stages"
        action={
          <SecondaryButton
            icon={ArrowLeft}
            onClick={() => navigate("/commerce/lead")}
          >
            Back to List
          </SecondaryButton>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Lead Identification */}
        <div className="bg-white rounded-lg border-2 border-[#6B9FE6] p-6 shadow-sm hover:shadow-md hover:border-[#0558CC] transition-all">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-[#6B9FE6]">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#033F99] to-[#033F99] flex items-center justify-center shadow-lg shadow-[#033F99]/50">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                1. Lead Identification
              </h3>
              <p className="text-sm text-[#033F99]">
                Basic company and source information
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <FormInput
              label="Company Name"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              required
              placeholder="e.g., Acme Robotics Pvt Ltd"
            />

            <FormSelect
              label="Lead Source"
              name="lead_source"
              value={formData.lead_source}
              onChange={handleChange}
              required
              options={[
                { value: "Website", label: "Website" },
                { value: "Referral", label: "Referral" },
                { value: "Partner", label: "Partner" },
                { value: "Event", label: "Event / Trade Show" },
                { value: "Campaign", label: "Marketing Campaign" },
                { value: "Email", label: "Email" },
                { value: "LinkedIn", label: "LinkedIn" },
                { value: "Manual", label: "Manual Entry" },
              ]}
            />
          </div>
        </div>

        {/* Section 2: Contact Person */}
        <div className="bg-white rounded-lg border-2 border-[#6B9FE6] p-6 shadow-sm hover:shadow-md hover:border-[#0558CC] transition-all">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-[#6B9FE6]">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#033F99] to-[#033F99] flex items-center justify-center shadow-lg shadow-[#033F99]/50">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                2. Contact Person
              </h3>
              <p className="text-sm text-[#033F99]">
                Primary point of contact details
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <FormInput
              label="Contact Name"
              name="contact_name"
              value={formData.contact_name}
              onChange={handleChange}
              required
              placeholder="e.g., Priya Nair"
            />

            <FormInput
              label="Email Address"
              name="email_address"
              type="email"
              value={formData.email_address}
              onChange={handleChange}
              required
              placeholder="e.g., priya.nair@acmerobo.com"
            />

            <FormInput
              label="Phone Number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="e.g., +91 9812345678"
            />

            <FormInput
              label="Designation"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              placeholder="e.g., Procurement Manager"
            />

            <FormInput
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="e.g., Finance, Operations"
            />
          </div>
        </div>

        {/* Section 3: Company Information */}
        <div className="bg-white rounded-lg border-2 border-[#6B9FE6] p-6 shadow-sm hover:shadow-md hover:border-[#0558CC] transition-all">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-[#6B9FE6]">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#033F99] to-[#033F99] flex items-center justify-center shadow-lg shadow-[#033F99]/50">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                3. Company Information
              </h3>
              <p className="text-sm text-[#033F99]">
                Location and business details
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <FormSelect
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              options={[
                { value: "India", label: "India" },
                { value: "USA", label: "United States" },
                { value: "UK", label: "United Kingdom" },
                { value: "UAE", label: "UAE" },
                { value: "Singapore", label: "Singapore" },
              ]}
            />

            <FormInput
              label="State / Province"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="e.g., Maharashtra, California"
            />

            <FormInput
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="e.g., Mumbai, Bangalore"
            />

            <FormInput
              label="Website URL"
              name="website_url"
              value={formData.website_url}
              onChange={handleChange}
              placeholder="e.g., https://www.acmerobo.com"
            />

            <FormSelect
              label="Industry Type"
              name="industry_type"
              value={formData.industry_type}
              onChange={handleChange}
              options={[
                { value: "", label: "Select Industry" },
                { value: "Manufacturing", label: "Manufacturing" },
                { value: "SaaS", label: "SaaS / Technology" },
                { value: "Construction", label: "Construction" },
                { value: "Finance", label: "Financial Services" },
                { value: "Healthcare", label: "Healthcare" },
                { value: "Retail", label: "Retail / E-commerce" },
                { value: "Education", label: "Education" },
                { value: "Logistics", label: "Logistics / Supply Chain" },
                { value: "Other", label: "Other" },
              ]}
            />

            <FormSelect
              label="Company Size"
              name="company_size"
              value={formData.company_size}
              onChange={handleChange}
              options={[
                { value: "", label: "Select Size" },
                { value: "Small", label: "Small (1-50 employees)" },
                { value: "Medium", label: "Medium (51-500 employees)" },
                { value: "Enterprise", label: "Enterprise (500+ employees)" },
              ]}
            />
          </div>
        </div>

        {/* Section 4: Business Interest */}
        <div className="bg-white rounded-lg border-2 border-[#6B9FE6] p-6 shadow-sm hover:shadow-md hover:border-[#0558CC] transition-all">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-[#6B9FE6]">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#033F99] to-[#033F99] flex items-center justify-center shadow-lg shadow-[#033F99]/50">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                4. Business Interest
              </h3>
              <p className="text-sm text-[#033F99]">
                What they're looking for and deal potential
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <FormInput
              label="Product or Solution Interested In"
              name="product_or_solution_interested_in"
              value={formData.product_or_solution_interested_in}
              onChange={handleChange}
              required
              placeholder="e.g., Accounting Software, ERP System"
            />

            <FormInput
              label="Estimated Deal Value (₹)"
              name="estimated_deal_value"
              type="number"
              value={formData.estimated_deal_value}
              onChange={handleChange}
              placeholder="e.g., 500000"
            />

            <FormSelect
              label="Decision Timeline"
              name="decision_timeline"
              value={formData.decision_timeline}
              onChange={handleChange}
              options={[
                { value: "", label: "Select Timeline" },
                { value: "0-3 months", label: "0-3 months (Urgent)" },
                { value: "3-6 months", label: "3-6 months" },
                { value: "6+ months", label: "6+ months" },
              ]}
            />

            <div className="col-span-2">
              <FormTextarea
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Any additional information about the lead..."
              />
            </div>
          </div>
        </div>

        {/* Section 5: Internal Tagging */}
        <div className="bg-white rounded-lg border-2 border-[#6B9FE6] p-6 shadow-sm hover:shadow-md hover:border-[#0558CC] transition-all">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-[#6B9FE6]">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#033F99] to-[#033F99] flex items-center justify-center shadow-lg shadow-[#033F99]/50">
              <Tag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                5. Internal Tagging
              </h3>
              <p className="text-sm text-[#033F99]">
                Optional campaign and tag information
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <FormInput
              label="Lead Campaign Name"
              name="lead_campaign_name"
              value={formData.lead_campaign_name}
              onChange={handleChange}
              placeholder="e.g., Summer 2025 Campaign"
            />

            <FormInput
              label="Tags (comma-separated)"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., enterprise, high-priority, tech"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4">
          <SecondaryButton
            type="button"
            icon={X}
            onClick={() => navigate("/commerce/lead")}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" icon={Save} disabled={loading}>
            {loading ? "Saving..." : "Save Lead"}
          </PrimaryButton>
        </div>
      </form>
    </PageWrapper>
  );
};

export default LeadCreateComplete;
