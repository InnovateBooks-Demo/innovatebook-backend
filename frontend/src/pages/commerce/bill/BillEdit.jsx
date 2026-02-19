import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { ArrowLeft, Save, Loader } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const BillEdit = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    customer_name: "",
    invoice_type: "Milestone",
    payment_terms: "Net 30",
    currency: "INR",
  });

  useEffect(() => {
    fetchBillDetails();
  }, [invoiceId]);

  const fetchBillDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BACKEND_URL}/api/commerce/bills/${invoiceId}`,
      );
      const bill = response.data;

      setFormData({
        customer_name: bill.customer_name || "",
        invoice_type: bill.invoice_type || "Milestone",
        payment_terms: bill.payment_terms || "Net 30",
        currency: bill.currency || "INR",
      });

      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch bill details:", error);
      toast.error("Failed to load bill details");
      setLoading(false);
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

    try {
      setSaving(true);
      await axios.put(
        `${BACKEND_URL}/api/commerce/bills/${invoiceId}`,
        formData,
      );
      toast.success("Bill updated successfully");
      navigate(`/commerce/bill/${invoiceId}`);
    } catch (error) {
      console.error("Failed to update bill:", error);
      toast.error(error.response?.data?.detail || "Failed to update bill");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3 text-[#033F99]">
          <Loader className="h-6 w-6 animate-spin" />
          <span className="text-lg font-medium">Loading bill details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={`/commerce/bill/${invoiceId}`}>
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
              Edit Invoice {invoiceId}
            </h2>
            <p className="text-slate-600 mt-1">Update invoice information</p>
          </div>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={saving}
          className="gap-2 bg-gradient-to-r from-[#033F99] to-[#033F99] hover:from-[#033F99] hover:to-[#033F99]"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 bg-white">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Editable Invoice Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Customer Name
              </label>
              <Input
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                placeholder="Customer name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Invoice Type
              </label>
              <select
                name="invoice_type"
                value={formData.invoice_type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
              >
                <option value="Milestone">Milestone</option>
                <option value="Time-based">Time-based</option>
                <option value="Retainer">Retainer</option>
                <option value="Advance">Advance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Payment Terms
              </label>
              <select
                name="payment_terms"
                value={formData.payment_terms}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
              >
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 45">Net 45</option>
                <option value="Net 60">Net 60</option>
                <option value="Due on Receipt">Due on Receipt</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Currency
              </label>
              <Input
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                placeholder="Currency code"
                readOnly
              />
            </div>
          </div>

          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> Only customer name, invoice type, and
              payment terms can be edited. To modify line items or amounts,
              please create a new invoice.
            </p>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default BillEdit;
