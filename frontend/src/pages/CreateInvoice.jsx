import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { invoiceAPI, customerAPI, categoryAPI } from "../utils/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Save, Send, Calculator } from "lucide-react";

const CreateInvoice = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    customer_id: "",
    invoice_date: new Date().toISOString().split("T")[0],
    due_date: "",
    payment_terms: "30",
    base_amount: "",
    gst_percent: 18,
    tds_percent: 0,
    category_id: "",
    status: "Draft",
    internal_poc_name: "",
    internal_poc_email: "",
    internal_poc_phone: "",
    external_poc_name: "",
    external_poc_email: "",
    external_poc_phone: "",
    items: [{ description: "", quantity: 1, unit_price: 0, amount: 0 }],
  });

  useEffect(() => {
    loadCustomers();
    loadCategories();
  }, []);

  useEffect(() => {
    if (formData.invoice_date && formData.payment_terms) {
      const invoiceDate = new Date(formData.invoice_date);
      const dueDate = new Date(
        invoiceDate.setDate(
          invoiceDate.getDate() + parseInt(formData.payment_terms),
        ),
      );
      setFormData((prev) => ({
        ...prev,
        due_date: dueDate.toISOString().split("T")[0],
      }));
    }
  }, [formData.invoice_date, formData.payment_terms]);

  const loadCustomers = async () => {
    try {
      const response = await customerAPI.getAll();
      setCustomers(response.data);
    } catch (error) {
      toast.error("Failed to load customers");
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoryAPI.getOperatingInflows();
      setCategories(response.data);
    } catch (error) {
      toast.error("Failed to load categories");
    }
  };

  const handleCategoryChange = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    setSelectedCategory(category);
    setFormData((prev) => ({ ...prev, category_id: categoryId }));
  };

  const addLineItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { description: "", quantity: 1, unit_price: 0, amount: 0 },
      ],
    }));
  };

  const removeLineItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateLineItem = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;

    if (field === "quantity" || field === "unit_price") {
      updatedItems[index].amount =
        updatedItems[index].quantity * updatedItems[index].unit_price;
    }

    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  const calculateTotals = () => {
    const lineItemTotal = formData.items.reduce(
      (sum, item) => sum + item.amount,
      0,
    );
    const baseAmount =
      lineItemTotal > 0 ? lineItemTotal : parseFloat(formData.base_amount || 0);
    const gstAmount = baseAmount * (formData.gst_percent / 100);
    const tdsAmount = baseAmount * (formData.tds_percent / 100);
    const totalAmount = baseAmount + gstAmount;
    const netReceivable = totalAmount - tdsAmount;

    return { baseAmount, gstAmount, tdsAmount, totalAmount, netReceivable };
  };

  const handleSubmit = async (status) => {
    try {
      setLoading(true);

      // Validation
      if (!formData.customer_id) {
        toast.error("Please select a customer");
        return;
      }
      if (!formData.category_id) {
        toast.error("Please select a category");
        return;
      }

      const totals = calculateTotals();

      const invoiceData = {
        customer_id: formData.customer_id,
        invoice_date: new Date(formData.invoice_date).toISOString(),
        due_date: new Date(formData.due_date).toISOString(),
        base_amount: totals.baseAmount,
        gst_percent: formData.gst_percent,
        gst_amount: totals.gstAmount,
        tds_percent: formData.tds_percent,
        tds_amount: totals.tdsAmount,
        total_amount: totals.totalAmount,
        category_id: formData.category_id,
        status: status,
        internal_poc_name: formData.internal_poc_name || null,
        internal_poc_email: formData.internal_poc_email || null,
        internal_poc_phone: formData.internal_poc_phone || null,
        external_poc_name: formData.external_poc_name || null,
        external_poc_email: formData.external_poc_email || null,
        external_poc_phone: formData.external_poc_phone || null,
        items: formData.items,
      };

      await invoiceAPI.create(invoiceData);

      if (status === "Finalized") {
        toast.success("Invoice created and posted to accounting!");
      } else {
        toast.success("Invoice draft saved successfully");
      }

      navigate("/invoices");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();
  const selectedCustomer = customers.find((c) => c.id === formData.customer_id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/invoices")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="h-8 w-px bg-gray-300" />
              <div>
                <h1
                  className="text-2xl font-bold text-gray-900"
                  style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
                >
                  Create New Invoice
                </h1>
                <p
                  className="text-sm text-gray-500"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Fill in the details below to create an invoice
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => handleSubmit("Draft")}
                disabled={loading}
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                <Save className="h-4 w-4 mr-2" />
                Save as Draft
              </Button>
              <Button
                onClick={() => handleSubmit("Finalized")}
                disabled={loading}
                style={{
                  backgroundColor: "#033F99",
                  fontFamily: "Inter, sans-serif",
                }}
                className="text-white hover:opacity-90"
              >
                <Send className="h-4 w-4 mr-2" />
                Finalize & Post
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column - Main Form */}
          <div className="col-span-2 space-y-6">
            {/* Customer & Category Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2
                className="text-lg font-semibold text-gray-900 mb-4"
                style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
              >
                Basic Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Customer *
                  </Label>
                  <Select
                    value={formData.customer_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, customer_id: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedCustomer && (
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedCustomer.email || selectedCustomer.phone || ""}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Revenue Category *
                    <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      Phase 2
                    </span>
                  </Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <div className="flex flex-col">
                            <span>{cat.category_name}</span>
                            <span className="text-xs text-gray-500">
                              {cat.coa_account}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedCategory && (
                    <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                      <p className="text-xs text-blue-900">
                        <strong>COA:</strong> {selectedCategory.coa_account}
                      </p>
                      <p className="text-xs text-blue-700">
                        {selectedCategory.cashflow_activity} →{" "}
                        {selectedCategory.cashflow_flow}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Date & Terms Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2
                className="text-lg font-semibold text-gray-900 mb-4"
                style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
              >
                Invoice Dates & Terms
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Invoice Date *
                  </Label>
                  <Input
                    type="date"
                    value={formData.invoice_date}
                    onChange={(e) =>
                      setFormData({ ...formData, invoice_date: e.target.value })
                    }
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Payment Terms
                  </Label>
                  <Select
                    value={formData.payment_terms}
                    onValueChange={(value) =>
                      setFormData({ ...formData, payment_terms: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Immediate</SelectItem>
                      <SelectItem value="7">Net 7 Days</SelectItem>
                      <SelectItem value="15">Net 15 Days</SelectItem>
                      <SelectItem value="30">Net 30 Days</SelectItem>
                      <SelectItem value="45">Net 45 Days</SelectItem>
                      <SelectItem value="60">Net 60 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Due Date *
                  </Label>
                  <Input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) =>
                      setFormData({ ...formData, due_date: e.target.value })
                    }
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Line Items Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-lg font-semibold text-gray-900"
                  style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
                >
                  Line Items
                </h2>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addLineItem}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <div
                    key={`item-${index}`}
                    className="grid grid-cols-12 gap-3 items-start p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="col-span-5">
                      <Label className="text-xs text-gray-600 mb-1 block">
                        Description
                      </Label>
                      <Input
                        placeholder="Item description"
                        value={item.description}
                        onChange={(e) =>
                          updateLineItem(index, "description", e.target.value)
                        }
                        className="text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs text-gray-600 mb-1 block">
                        Quantity
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateLineItem(
                            index,
                            "quantity",
                            parseFloat(e.target.value) || 1,
                          )
                        }
                        className="text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs text-gray-600 mb-1 block">
                        Unit Price (₹)
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) =>
                          updateLineItem(
                            index,
                            "unit_price",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs text-gray-600 mb-1 block">
                        Amount (₹)
                      </Label>
                      <Input
                        value={item.amount.toFixed(2)}
                        disabled
                        className="text-sm bg-gray-100"
                      />
                    </div>
                    <div className="col-span-1 flex items-end">
                      {formData.items.length > 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeLineItem(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
                <div className="text-sm text-gray-600">
                  Or enter total amount directly:
                </div>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <Label className="text-xs text-gray-600 mb-1 block">
                      Base Amount (₹)
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.base_amount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          base_amount: e.target.value,
                        })
                      }
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tax Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2
                className="text-lg font-semibold text-gray-900 mb-4"
                style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
              >
                Tax Details
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    GST Percentage (%)
                  </Label>
                  <Select
                    value={formData.gst_percent.toString()}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        gst_percent: parseFloat(value),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0%</SelectItem>
                      <SelectItem value="5">5%</SelectItem>
                      <SelectItem value="12">12%</SelectItem>
                      <SelectItem value="18">18%</SelectItem>
                      <SelectItem value="28">28%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    TDS Percentage (%)
                  </Label>
                  <Select
                    value={formData.tds_percent.toString()}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        tds_percent: parseFloat(value),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0%</SelectItem>
                      <SelectItem value="2">2%</SelectItem>
                      <SelectItem value="5">5%</SelectItem>
                      <SelectItem value="10">10%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Point of Contact */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2
                className="text-lg font-semibold text-gray-900 mb-4"
                style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
              >
                Points of Contact (Optional)
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Internal POC (Your Team)
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      placeholder="Name"
                      value={formData.internal_poc_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          internal_poc_name: e.target.value,
                        })
                      }
                    />
                    <Input
                      placeholder="Email"
                      type="email"
                      value={formData.internal_poc_email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          internal_poc_email: e.target.value,
                        })
                      }
                    />
                    <Input
                      placeholder="Phone"
                      value={formData.internal_poc_phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          internal_poc_phone: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    External POC (Customer)
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      placeholder="Name"
                      value={formData.external_poc_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          external_poc_name: e.target.value,
                        })
                      }
                    />
                    <Input
                      placeholder="Email"
                      type="email"
                      value={formData.external_poc_email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          external_poc_email: e.target.value,
                        })
                      }
                    />
                    <Input
                      placeholder="Phone"
                      value={formData.external_poc_phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          external_poc_phone: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Calculation Summary */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calculator className="h-5 w-5 text-blue-600" />
                  <h3
                    className="text-lg font-semibold text-gray-900"
                    style={{
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: 600,
                    }}
                  >
                    Summary
                  </h3>
                </div>

                <div
                  className="space-y-3 text-sm"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  <div className="flex justify-between pb-2 border-b border-gray-200">
                    <span className="text-gray-600">Base Amount</span>
                    <span className="font-semibold text-gray-900">
                      ₹
                      {totals.baseAmount.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>

                  <div className="flex justify-between pb-2 border-b border-gray-200">
                    <span className="text-gray-600">
                      GST ({formData.gst_percent}%)
                    </span>
                    <span className="font-semibold text-gray-900">
                      ₹
                      {totals.gstAmount.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>

                  <div className="flex justify-between pb-2 border-b border-gray-200">
                    <span className="text-gray-900 font-medium">
                      Total Invoice Amount
                    </span>
                    <span className="font-bold text-gray-900">
                      ₹
                      {totals.totalAmount.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>

                  <div className="flex justify-between pb-2 border-b border-gray-200">
                    <span className="text-gray-600">
                      Less: TDS ({formData.tds_percent}%)
                    </span>
                    <span className="font-semibold text-red-600">
                      -₹
                      {totals.tdsAmount.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>

                  <div className="flex justify-between pt-2 bg-blue-50 -mx-6 px-6 py-3 rounded">
                    <span className="text-blue-900 font-bold">
                      Net Receivable
                    </span>
                    <span className="font-bold text-blue-900 text-lg">
                      ₹
                      {totals.netReceivable.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Accounting Info */}
              {selectedCategory && (
                <div className="bg-gradient-to-br from-blue-50 to-[#EBF3FC] rounded-lg shadow-sm border border-blue-200 p-6">
                  <h3
                    className="text-sm font-semibold text-blue-900 mb-3"
                    style={{
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: 600,
                    }}
                  >
                    📊 Accounting Impact
                  </h3>
                  <div
                    className="space-y-2 text-xs"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    <div className="bg-white/60 p-2 rounded">
                      <div className="font-semibold text-blue-900">
                        Revenue Category:
                      </div>
                      <div className="text-blue-700">
                        {selectedCategory.category_name}
                      </div>
                    </div>
                    <div className="bg-white/60 p-2 rounded">
                      <div className="font-semibold text-blue-900">
                        Chart of Accounts:
                      </div>
                      <div className="text-blue-700">
                        {selectedCategory.coa_account}
                      </div>
                    </div>
                    <div className="bg-white/60 p-2 rounded">
                      <div className="font-semibold text-blue-900">
                        Financial Statement:
                      </div>
                      <div className="text-blue-700">
                        {selectedCategory.statement_type}
                      </div>
                    </div>
                    <div className="bg-white/60 p-2 rounded">
                      <div className="font-semibold text-blue-900">
                        Cash Flow:
                      </div>
                      <div className="text-blue-700">
                        {selectedCategory.cashflow_activity} -{" "}
                        {selectedCategory.cashflow_flow}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Warning */}
              <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
                <h4 className="text-sm font-semibold text-amber-900 mb-2">
                  ⚠️ Status Options
                </h4>
                <div
                  className="text-xs text-amber-800 space-y-2"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  <div className="flex items-start gap-2">
                    <span className="font-semibold">Draft:</span>
                    <span>Save for later. No accounting entry created.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-semibold">Finalized:</span>
                    <span>
                      Auto-posts journal entry (DR: AR, CR: Revenue, CR: GST)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoice;
