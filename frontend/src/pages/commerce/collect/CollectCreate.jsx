import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { ArrowLeft, Save } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CollectCreate = () => {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    invoice_id: "",
    customer_id: "",
    amount_due: 0,
  });

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/commerce/bills`);
      setBills(response.data || []);
    } catch (error) {
      console.error("Failed to fetch bills:", error);
      toast.error("Failed to load bills");
    }
  };

  const handleBillSelect = (e) => {
    const billId = e.target.value;
    const selectedBill = bills.find((b) => b.invoice_id === billId);

    if (selectedBill) {
      setFormData({
        invoice_id: billId,
        customer_id: selectedBill.customer_id || "",
        amount_due: selectedBill.net_amount || selectedBill.invoice_amount || 0,
      });
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

    if (!formData.invoice_id || !formData.customer_id) {
      toast.error("Please select a bill and enter customer ID");
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${BACKEND_URL}/api/commerce/collect`, formData);
      toast.success("Collection created successfully");
      navigate("/commerce/collect");
    } catch (error) {
      console.error("Failed to create collection:", error);
      toast.error(
        error.response?.data?.detail || "Failed to create collection",
      );
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/commerce/collect">
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
              Create Collection
            </h2>
            <p className="text-slate-600 mt-1">
              Set up new receivable tracking
            </p>
          </div>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="gap-2 bg-gradient-to-r from-[#033F99] to-[#033F99] hover:from-[#033F99] hover:to-[#033F99]"
        >
          <Save className="h-4 w-4" />
          {loading ? "Creating..." : "Create Collection"}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 bg-white">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Collection Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Bill/Invoice <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.invoice_id}
                onChange={handleBillSelect}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                required
              >
                <option value="">Select a bill...</option>
                {bills.map((bill) => (
                  <option key={bill.invoice_id} value={bill.invoice_id}>
                    {bill.invoice_id} - {bill.customer_name || bill.customer_id}{" "}
                    - ₹{(bill.invoice_amount / 100000).toFixed(1)}L
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Customer ID <span className="text-red-500">*</span>
              </label>
              <Input
                name="customer_id"
                value={formData.customer_id}
                onChange={handleChange}
                placeholder="e.g., CUST-2025-001"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Amount Due (₹)
              </label>
              <Input
                type="number"
                name="amount_due"
                value={formData.amount_due}
                onChange={handleChange}
                placeholder="Amount due"
                min="0"
                step="0.01"
                readOnly
              />
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Collection will be created with 'Pending'
              status. You can record payments and update status from the
              collection detail page.
            </p>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default CollectCreate;
