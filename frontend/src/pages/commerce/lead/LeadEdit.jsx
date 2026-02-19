import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Card } from "../../../components/ui/card";
import {
  ArrowLeft,
  Save,
  X,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const LeadEdit = () => {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [formData, setFormData] = useState({
    business_name: "",
    trade_name: "",
    industry_type: "",
    business_size: "SME",
    business_model: "B2B",
    annual_revenue: "",
    tax_registration_number: "",
    business_registration_id: "",
    website_url: "",
    primary_contact_name: "",
    primary_email: "",
    primary_phone: "",
    designation: "",
    office_address: "",
    city: "",
    state: "",
    country: "India",
    postal_code: "",
    lead_source: "Website",
    capture_channel: "",
    expected_deal_value: "",
    potential_product_line: "",
    timeline_to_close: "",
  });

  useEffect(() => {
    fetchLeadData();
  }, [leadId]);

  const fetchLeadData = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/commerce/leads/${leadId}`,
      );
      const lead = response.data;

      setFormData({
        business_name: lead.business_name || "",
        trade_name: lead.trade_name || "",
        industry_type: lead.industry_type || "",
        business_size: lead.business_size || "SME",
        business_model: lead.business_model || "B2B",
        annual_revenue: lead.annual_revenue || "",
        tax_registration_number: lead.tax_registration_number || "",
        business_registration_id: lead.business_registration_id || "",
        website_url: lead.website_url || "",
        primary_contact_name: lead.primary_contact_name || "",
        primary_email: lead.primary_email || "",
        primary_phone: lead.primary_phone || "",
        designation: lead.designation || "",
        office_address: lead.office_address || "",
        city: lead.city || "",
        state: lead.state || "",
        country: lead.country || "India",
        postal_code: lead.postal_code || "",
        lead_source: lead.lead_source || "Website",
        capture_channel: lead.capture_channel || "",
        expected_deal_value: lead.expected_deal_value || "",
        potential_product_line: lead.potential_product_line || "",
        timeline_to_close: lead.timeline_to_close || "",
      });

      setFetchingData(false);
    } catch (error) {
      console.error("Failed to fetch lead:", error);
      toast.error("Failed to load lead data");
      setFetchingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        annual_revenue: formData.annual_revenue
          ? parseFloat(formData.annual_revenue)
          : null,
        expected_deal_value: formData.expected_deal_value
          ? parseFloat(formData.expected_deal_value)
          : null,
        timeline_to_close: formData.timeline_to_close
          ? parseInt(formData.timeline_to_close)
          : null,
      };

      await axios.put(`${BACKEND_URL}/api/commerce/leads/${leadId}`, payload);

      toast.success("Lead updated successfully!");
      navigate(`/commerce/lead/${leadId}`);
    } catch (error) {
      console.error("Failed to update lead:", error);
      toast.error(error.response?.data?.detail || "Failed to update lead");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3 text-slate-600">
          <div className="w-6 h-6 border-2 border-[#033F99] border-t-transparent rounded-full animate-spin"></div>
          Loading lead data...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={`/commerce/lead/${leadId}`}>
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h2
              className="text-2xl font-bold text-slate-900"
              style={{ fontFamily: "Poppins" }}
            >
              Edit Lead
            </h2>
            <p className="text-slate-600 mt-1">
              Update lead information and details
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Information */}
        <Card className="p-6 bg-white border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#C4D9F4] rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 text-[#033F99]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Business Information
              </h3>
              <p className="text-sm text-slate-600">
                Basic details about the company
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="business_name">Business Name *</Label>
              <Input
                id="business_name"
                name="business_name"
                value={formData.business_name}
                onChange={handleChange}
                required
                placeholder="Acme Corporation"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="trade_name">Trade Name</Label>
              <Input
                id="trade_name"
                name="trade_name"
                value={formData.trade_name}
                onChange={handleChange}
                placeholder="Acme"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="industry_type">Industry Type *</Label>
              <select
                id="industry_type"
                name="industry_type"
                value={formData.industry_type}
                onChange={handleChange}
                required
                className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
              >
                <option value="">Select Industry</option>
                <option value="Technology">Technology</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Retail">Retail</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Education">Education</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Consulting">Consulting</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <Label htmlFor="business_model">Business Model *</Label>
              <select
                id="business_model"
                name="business_model"
                value={formData.business_model}
                onChange={handleChange}
                required
                className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
              >
                <option value="B2B">B2B</option>
                <option value="B2C">B2C</option>
                <option value="D2C">D2C</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <Label htmlFor="business_size">Business Size</Label>
              <select
                id="business_size"
                name="business_size"
                value={formData.business_size}
                onChange={handleChange}
                className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
              >
                <option value="SME">SME</option>
                <option value="Mid">Mid-Market</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>

            <div>
              <Label htmlFor="annual_revenue">Annual Revenue (₹)</Label>
              <Input
                id="annual_revenue"
                name="annual_revenue"
                type="number"
                value={formData.annual_revenue}
                onChange={handleChange}
                placeholder="50000000"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="tax_registration_number">
                Tax Registration Number (GSTIN) *
              </Label>
              <Input
                id="tax_registration_number"
                name="tax_registration_number"
                value={formData.tax_registration_number}
                onChange={handleChange}
                required
                placeholder="29XXXXXXXXXXXXX"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="website_url">Website URL</Label>
              <div className="relative mt-2">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="website_url"
                  name="website_url"
                  type="url"
                  value={formData.website_url}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="p-6 bg-white border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="h-5 w-5 text-[#0147CC]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Contact Information
              </h3>
              <p className="text-sm text-slate-600">
                Primary contact person details
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="primary_contact_name">Contact Name *</Label>
              <div className="relative mt-2">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="primary_contact_name"
                  name="primary_contact_name"
                  value={formData.primary_contact_name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="designation">Designation</Label>
              <Input
                id="designation"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                placeholder="CEO"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="primary_email">Email Address *</Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="primary_email"
                  name="primary_email"
                  type="email"
                  value={formData.primary_email}
                  onChange={handleChange}
                  required
                  placeholder="john@example.com"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="primary_phone">Phone Number *</Label>
              <div className="relative mt-2">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="primary_phone"
                  name="primary_phone"
                  value={formData.primary_phone}
                  onChange={handleChange}
                  required
                  placeholder="+91 XXXXX XXXXX"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="office_address">Office Address *</Label>
              <div className="relative mt-2">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <textarea
                  id="office_address"
                  name="office_address"
                  value={formData.office_address}
                  onChange={handleChange}
                  required
                  rows="2"
                  placeholder="123 Business Street"
                  className="w-full pl-10 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                placeholder="Mumbai"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                placeholder="Maharashtra"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="postal_code">Postal Code *</Label>
              <Input
                id="postal_code"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                required
                placeholder="400001"
                className="mt-2"
              />
            </div>
          </div>
        </Card>

        {/* Lead Details */}
        <Card className="p-6 bg-white border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Lead Details</h3>
              <p className="text-sm text-slate-600">
                Opportunity information and source
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="lead_source">Lead Source *</Label>
              <select
                id="lead_source"
                name="lead_source"
                value={formData.lead_source}
                onChange={handleChange}
                required
                className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
              >
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Email">Email</option>
                <option value="Trade Show">Trade Show</option>
                <option value="CRM">CRM</option>
                <option value="Manual">Manual</option>
              </select>
            </div>

            <div>
              <Label htmlFor="capture_channel">Capture Channel</Label>
              <Input
                id="capture_channel"
                name="capture_channel"
                value={formData.capture_channel}
                onChange={handleChange}
                placeholder="Google Ads, Partner, etc."
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="expected_deal_value">
                Expected Deal Value (₹)
              </Label>
              <Input
                id="expected_deal_value"
                name="expected_deal_value"
                type="number"
                value={formData.expected_deal_value}
                onChange={handleChange}
                placeholder="5000000"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="timeline_to_close">
                Timeline to Close (days)
              </Label>
              <Input
                id="timeline_to_close"
                name="timeline_to_close"
                type="number"
                value={formData.timeline_to_close}
                onChange={handleChange}
                placeholder="30"
                className="mt-2"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="potential_product_line">
                Potential Product/Service Interest
              </Label>
              <Input
                id="potential_product_line"
                name="potential_product_line"
                value={formData.potential_product_line}
                onChange={handleChange}
                placeholder="Enterprise Software, Consulting, etc."
                className="mt-2"
              />
            </div>
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link to={`/commerce/lead/${leadId}`}>
            <Button type="button" variant="outline" className="gap-2">
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={loading}
            className="gap-2 bg-gradient-to-r from-[#033F99] to-[#033F99] hover:from-[#033F99] hover:to-[#033F99]"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LeadEdit;
