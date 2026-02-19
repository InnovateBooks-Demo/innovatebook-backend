import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Card } from "../../../components/ui/card";
import {
  ArrowLeft,
  Save,
  X,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Shield,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const EvaluateCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState([]);
  const [formData, setFormData] = useState({
    linked_lead_id: "",
    opportunity_name: "",
    opportunity_type: "New",
    expected_deal_value: "",
    proposed_payment_terms: "Net 30",
    expected_close_date: "",
    currency: "INR",
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/commerce/leads?status=Qualified`,
      );
      setLeads(response.data);
    } catch (error) {
      console.error("Failed to fetch leads:", error);
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
        expected_deal_value: formData.expected_deal_value
          ? parseFloat(formData.expected_deal_value)
          : 0,
        expected_close_date:
          formData.expected_close_date ||
          new Date().toISOString().split("T")[0],
      };

      const response = await axios.post(
        `${BACKEND_URL}/api/commerce/evaluate`,
        payload,
      );

      toast.success("Evaluation created successfully!");
      navigate(`/commerce/evaluate/${response.data.evaluation_id}`);
    } catch (error) {
      console.error("Failed to create evaluation:", error);
      toast.error(
        error.response?.data?.detail || "Failed to create evaluation",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/commerce/evaluate">
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
              Create Evaluation
            </h2>
            <p className="text-slate-600 mt-1">
              Assess deal feasibility and financial viability
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Deal Summary */}
        <Card className="p-6 bg-white border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#C4D9F4] rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-[#033F99]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Deal Summary</h3>
              <p className="text-sm text-slate-600">
                Basic opportunity information
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="linked_lead_id">Linked Lead *</Label>
              <select
                id="linked_lead_id"
                name="linked_lead_id"
                value={formData.linked_lead_id}
                onChange={handleChange}
                required
                className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
              >
                <option value="">Select Lead</option>
                {leads.map((lead) => (
                  <option key={lead.id} value={lead.lead_id}>
                    {lead.lead_id} - {lead.business_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="opportunity_name">Opportunity Name *</Label>
              <Input
                id="opportunity_name"
                name="opportunity_name"
                value={formData.opportunity_name}
                onChange={handleChange}
                required
                placeholder="Q1 2025 Enterprise Deal"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="opportunity_type">Opportunity Type *</Label>
              <select
                id="opportunity_type"
                name="opportunity_type"
                value={formData.opportunity_type}
                onChange={handleChange}
                required
                className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
              >
                <option value="New">New</option>
                <option value="Renewal">Renewal</option>
                <option value="Upsell">Upsell</option>
              </select>
            </div>

            <div>
              <Label htmlFor="expected_deal_value">
                Expected Deal Value (₹) *
              </Label>
              <Input
                id="expected_deal_value"
                name="expected_deal_value"
                type="number"
                value={formData.expected_deal_value}
                onChange={handleChange}
                required
                placeholder="10000000"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="proposed_payment_terms">Payment Terms *</Label>
              <select
                id="proposed_payment_terms"
                name="proposed_payment_terms"
                value={formData.proposed_payment_terms}
                onChange={handleChange}
                required
                className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
              >
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 45">Net 45</option>
                <option value="Net 60">Net 60</option>
              </select>
            </div>

            <div>
              <Label htmlFor="expected_close_date">Expected Close Date *</Label>
              <Input
                id="expected_close_date"
                name="expected_close_date"
                type="date"
                value={formData.expected_close_date}
                onChange={handleChange}
                required
                className="mt-2"
              />
            </div>
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link to="/commerce/evaluate">
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
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Create Evaluation
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EvaluateCreate;
