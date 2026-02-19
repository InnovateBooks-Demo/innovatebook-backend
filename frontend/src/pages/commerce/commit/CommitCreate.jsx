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
  FileText,
  DollarSign,
  Calendar,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CommitCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [evaluations, setEvaluations] = useState([]);
  const [formData, setFormData] = useState({
    evaluation_id: "",
    customer_id: "",
    commit_type: "Customer Contract",
    contract_title: "",
    effective_date: "",
    contract_duration_months: "12",
    contract_value: "",
    payment_terms: "Net 30",
  });

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/commerce/evaluate?status=Approved`,
      );
      setEvaluations(response.data);
    } catch (error) {
      console.error("Failed to fetch evaluations:", error);
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
      // Calculate expiry_date from effective_date and duration
      const effectiveDate = new Date(formData.effective_date);
      const expiryDate = new Date(effectiveDate);
      expiryDate.setMonth(
        expiryDate.getMonth() + parseInt(formData.contract_duration_months),
      );

      const payload = {
        evaluation_id: formData.evaluation_id,
        customer_id: formData.customer_id,
        commit_type: formData.commit_type,
        contract_title: formData.contract_title,
        effective_date: formData.effective_date,
        expiry_date: expiryDate.toISOString().split("T")[0],
        contract_value: parseFloat(formData.contract_value),
        payment_terms: formData.payment_terms,
      };

      const response = await axios.post(
        `${BACKEND_URL}/api/commerce/commit`,
        payload,
      );

      toast.success("Commitment created successfully!");
      navigate(`/commerce/commit/${response.data.commit_id}`);
    } catch (error) {
      console.error("Failed to create commitment:", error);
      toast.error(
        error.response?.data?.detail || "Failed to create commitment",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/commerce/commit">
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
              Create Commitment
            </h2>
            <p className="text-slate-600 mt-1">
              Finalize contract and commitment details
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 bg-white border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#C4D9F4] rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-[#033F99]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Contract Details
              </h3>
              <p className="text-sm text-slate-600">
                Basic contract information
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="evaluation_id">Linked Evaluation *</Label>
              <select
                id="evaluation_id"
                name="evaluation_id"
                value={formData.evaluation_id}
                onChange={handleChange}
                required
                className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
              >
                <option value="">Select Evaluation</option>
                {evaluations.map((evaluation) => (
                  <option key={evaluation.id} value={evaluation.evaluation_id}>
                    {evaluation.evaluation_id} - {evaluation.opportunity_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="customer_id">Customer ID *</Label>
              <Input
                id="customer_id"
                name="customer_id"
                value={formData.customer_id}
                onChange={handleChange}
                required
                placeholder="CUST-001"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="commit_type">Commitment Type *</Label>
              <select
                id="commit_type"
                name="commit_type"
                value={formData.commit_type}
                onChange={handleChange}
                required
                className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
              >
                <option value="Customer Contract">Customer Contract</option>
                <option value="Vendor PO">Vendor PO</option>
                <option value="Framework Agreement">Framework Agreement</option>
              </select>
            </div>

            <div>
              <Label htmlFor="contract_title">Contract Title *</Label>
              <Input
                id="contract_title"
                name="contract_title"
                value={formData.contract_title}
                onChange={handleChange}
                required
                placeholder="Enterprise Software License Agreement"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="contract_value">Contract Value (₹) *</Label>
              <Input
                id="contract_value"
                name="contract_value"
                type="number"
                value={formData.contract_value}
                onChange={handleChange}
                required
                placeholder="10000000"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="contract_duration_months">
                Duration (Months) *
              </Label>
              <Input
                id="contract_duration_months"
                name="contract_duration_months"
                type="number"
                value={formData.contract_duration_months}
                onChange={handleChange}
                required
                placeholder="12"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="effective_date">Effective Date *</Label>
              <Input
                id="effective_date"
                name="effective_date"
                type="date"
                value={formData.effective_date}
                onChange={handleChange}
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="payment_terms">Payment Terms *</Label>
              <select
                id="payment_terms"
                name="payment_terms"
                value={formData.payment_terms}
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
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Link to="/commerce/commit">
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
                Create Commitment
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CommitCreate;
