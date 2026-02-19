import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const BillCreate = () => {
  const navigate = useNavigate();
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    linked_execution_id: "",
    contract_id: "",
    customer_id: "",
    customer_name: "",
    invoice_type: "Milestone",
    payment_terms: "Net 30",
    currency: "INR",
    items: [
      {
        item_id: "",
        item_description: "",
        quantity: 1,
        rate: 0,
        line_amount: 0,
        tax_code: "GST18",
        hsn_sac_code: "",
      },
    ],
  });

  useEffect(() => {
    fetchExecutions();
  }, []);

  const fetchExecutions = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/commerce/execute`);
      setExecutions(response.data || []);
    } catch (error) {
      console.error("Failed to fetch executions:", error);
      toast.error("Failed to load executions");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;

    // Calculate line_amount for quantity and rate changes
    if (field === "quantity" || field === "rate") {
      const quantity =
        field === "quantity"
          ? parseFloat(value) || 0
          : updatedItems[index].quantity;
      const rate =
        field === "rate" ? parseFloat(value) || 0 : updatedItems[index].rate;
      updatedItems[index].line_amount = quantity * rate;
    }

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          item_id: `ITEM-${prev.items.length + 1}`,
          item_description: "",
          quantity: 1,
          rate: 0,
          line_amount: 0,
          tax_code: "GST18",
          hsn_sac_code: "",
        },
      ],
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.linked_execution_id ||
      !formData.customer_id ||
      !formData.contract_id
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (
      formData.items.some((item) => !item.item_description || item.rate <= 0)
    ) {
      toast.error("Please fill in all item details");
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${BACKEND_URL}/api/commerce/bills`, formData);
      toast.success("Bill created successfully");
      navigate("/commerce/bill");
    } catch (error) {
      console.error("Failed to create bill:", error);
      toast.error(error.response?.data?.detail || "Failed to create bill");
      setLoading(false);
    }
  };

  const totalAmount = formData.items.reduce(
    (sum, item) => sum + item.line_amount,
    0,
  );
  const taxAmount = totalAmount * 0.18;
  const netAmount = totalAmount + taxAmount;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/commerce/bill">
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
              Create Invoice
            </h2>
            <p className="text-slate-600 mt-1">Generate new bill/invoice</p>
          </div>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="gap-2 bg-gradient-to-r from-[#033F99] to-[#033F99] hover:from-[#033F99] hover:to-[#033F99]"
        >
          <Save className="h-4 w-4" />
          {loading ? "Creating..." : "Create Invoice"}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Details */}
        <Card className="p-6 bg-white">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Invoice Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Execution ID <span className="text-red-500">*</span>
              </label>
              <select
                name="linked_execution_id"
                value={formData.linked_execution_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                required
              >
                <option value="">Select Execution</option>
                {executions.map((exec) => (
                  <option key={exec.execution_id} value={exec.execution_id}>
                    {exec.execution_id} - {exec.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Contract ID <span className="text-red-500">*</span>
              </label>
              <Input
                name="contract_id"
                value={formData.contract_id}
                onChange={handleChange}
                placeholder="e.g., CONT-2025-001"
                required
              />
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
          </div>
        </Card>

        {/* Line Items */}
        <Card className="p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Line Items</h3>
            <Button
              type="button"
              onClick={addItem}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>

          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <div
                key={item.id || `item-${index}`}
                className="p-4 border border-slate-200 rounded-lg"
              >
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Description
                    </label>
                    <Input
                      value={item.item_description}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "item_description",
                          e.target.value,
                        )
                      }
                      placeholder="Item description"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Quantity
                    </label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(index, "quantity", e.target.value)
                      }
                      min="0.01"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Rate (₹)
                    </label>
                    <Input
                      type="number"
                      value={item.rate}
                      onChange={(e) =>
                        handleItemChange(index, "rate", e.target.value)
                      }
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      HSN/SAC
                    </label>
                    <Input
                      value={item.hsn_sac_code}
                      onChange={(e) =>
                        handleItemChange(index, "hsn_sac_code", e.target.value)
                      }
                      placeholder="HSN/SAC"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(index)}
                      disabled={formData.items.length === 1}
                      className="w-full text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-2 text-right">
                  <span className="text-sm font-medium text-slate-700">
                    Amount:{" "}
                  </span>
                  <span className="text-base font-bold text-slate-900">
                    ₹{item.line_amount.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="font-medium text-slate-900">
                    ₹{totalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tax (18%):</span>
                  <span className="font-medium text-slate-900">
                    ₹{taxAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-slate-200 pt-2">
                  <span className="text-slate-900">Total:</span>
                  <span className="text-[#033F99]">
                    ₹{netAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default BillCreate;
