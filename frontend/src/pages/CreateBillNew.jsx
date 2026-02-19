import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import { billAPI, vendorAPI, categoryAPI } from "../utils/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { toast } from "sonner";
import { GST_RATES, calculateGSTBreakdown } from "../utils/gstUtils";
import { TDS_SECTIONS, calculateTDS } from "../utils/tdsUtils";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Send,
  Calculator,
  Receipt,
  Loader2,
} from "lucide-react";

const CreateBillNew = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get ID if editing
  const isEditMode = !!id;

  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedGSTRate, setSelectedGSTRate] = useState({
    value: 18,
    label: "18% - Standard Services",
  });
  const [selectedTDSSection, setSelectedTDSSection] = useState({
    value: "None",
    label: "No TDS",
    rate: 0,
  });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    vendor_id: "",
    bill_date: new Date().toISOString().split("T")[0],
    due_date: "",
    payment_terms: "30",
    base_amount: 0,
    gst_percent: 18,
    gst_amount: 0,
    tds_percent: 0,
    tds_amount: 0,
    tds_section: "None",
    total_amount: 0,
    net_payable: 0,
    category_id: "",
    status: "Draft",
    items: [
      { description: "", quantity: 1, unit_price: 0, amount: 0, hsn_code: "" },
    ],
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (isEditMode && id) {
      loadExistingBill();
    }
  }, [id, vendors, categories]);

  const loadExistingBill = async () => {
    try {
      const response = await billAPI.getDetails(id);
      const billData = response.data.bill || response.data;

      setFormData({
        vendor_id: billData.vendor_id,
        bill_date: billData.bill_date,
        due_date: billData.due_date,
        payment_terms: billData.payment_terms || "30",
        base_amount: billData.base_amount || 0,
        gst_percent: billData.gst_percent || 18,
        gst_amount: billData.gst_amount || 0,
        tds_percent: billData.tds_percent || 0,
        tds_amount: billData.tds_amount || 0,
        tds_section: billData.tds_section || "None",
        total_amount: billData.total_amount || 0,
        net_payable: billData.net_payable || 0,
        category_id: billData.category_id,
        status: billData.status || "Draft",
        items: billData.items || [
          {
            description: "",
            quantity: 1,
            unit_price: 0,
            amount: 0,
            hsn_code: "",
          },
        ],
      });

      if (vendors.length > 0 && billData.vendor_id) {
        const vendor = vendors.find((v) => v.id === billData.vendor_id);
        if (vendor) {
          setSelectedVendor({
            value: vendor.id,
            label: vendor.name,
            gstin: vendor.gstin,
            ...vendor,
          });
        }
      }

      if (categories.length > 0 && billData.category_id) {
        const category = categories.find((c) => c.id === billData.category_id);
        if (category) {
          setSelectedCategory({
            value: category.id,
            label: `${category.category_name} - ${category.coa_account}`,
            ...category,
          });
        }
      }

      const gstRate = GST_RATES.find((r) => r.value === billData.gst_percent);
      if (gstRate) {
        setSelectedGSTRate({ value: gstRate.value, label: gstRate.label });
      }

      const tdsSection = TDS_SECTIONS.find(
        (s) => s.value === billData.tds_section,
      );
      if (tdsSection) {
        setSelectedTDSSection({
          value: tdsSection.value,
          label: tdsSection.label,
          rate: tdsSection.rate,
          description: tdsSection.description,
        });
      }

      toast.success("Bill loaded for editing");
    } catch (error) {
      console.error("Error loading bill:", error);
      toast.error("Failed to load bill for editing");
    }
  };

  useEffect(() => {
    calculatePaymentDueDate();
  }, [formData.bill_date, formData.payment_terms]);

  useEffect(() => {
    calculateTotals();
  }, [formData.items, selectedGSTRate, selectedTDSSection]);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      const [vendorsRes, categoriesRes] = await Promise.all([
        vendorAPI.getAll(),
        categoryAPI.getAll(),
      ]);

      setVendors(vendorsRes.data || []);
      const outflowCategories = (categoriesRes.data || []).filter(
        (cat) => cat.cashflow_flow === "Outflow",
      );
      console.log("Loaded categories:", categoriesRes.data);
      console.log("Filtered Outflow categories:", outflowCategories);
      setCategories(outflowCategories);
      setLoadingData(false);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
      setLoadingData(false);
    }
  };

  const calculatePaymentDueDate = () => {
    if (formData.bill_date && formData.payment_terms) {
      const billDate = new Date(formData.bill_date);
      const dueDate = new Date(billDate);
      dueDate.setDate(dueDate.getDate() + parseInt(formData.payment_terms));
      setFormData((prev) => ({
        ...prev,
        due_date: dueDate.toISOString().split("T")[0],
      }));
    }
  };

  const calculateTotals = () => {
    const baseAmount = formData.items.reduce(
      (sum, item) => sum + (item.amount || 0),
      0,
    );
    const gstPercent = selectedGSTRate.value;
    const gstAmount = (baseAmount * gstPercent) / 100;
    const totalAmount = baseAmount + gstAmount;
    const tdsPercent = selectedTDSSection.rate || 0;
    const tdsAmount = (totalAmount * tdsPercent) / 100;
    const netPayable = totalAmount - tdsAmount;

    setFormData((prev) => ({
      ...prev,
      base_amount: baseAmount,
      gst_percent: gstPercent,
      gst_amount: gstAmount,
      tds_percent: tdsPercent,
      tds_amount: tdsAmount,
      tds_section: selectedTDSSection.value,
      total_amount: totalAmount,
      net_payable: netPayable,
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;

    if (field === "quantity" || field === "unit_price") {
      newItems[index].amount =
        (newItems[index].quantity || 0) * (newItems[index].unit_price || 0);
    }

    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          description: "",
          quantity: 1,
          unit_price: 0,
          amount: 0,
          hsn_code: "",
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

  const handleSubmit = async (status) => {
    try {
      if (!selectedVendor) {
        toast.error("Please select a vendor");
        return;
      }
      if (!selectedCategory) {
        toast.error("Please select a category");
        return;
      }
      if (
        formData.items.some((item) => !item.description || item.amount <= 0)
      ) {
        toast.error("Please fill all item details");
        return;
      }

      setLoading(true);

      const billData = {
        ...formData,
        vendor_id: selectedVendor.value,
        category_id: selectedCategory.value,
        status: status,
        vendor_name: selectedVendor.label,
        vendor_gstin: selectedVendor.gstin,
      };

      if (isEditMode) {
        await billAPI.update(id, billData);
        toast.success(`Bill updated successfully!`);
      } else {
        await billAPI.create(billData);
        toast.success(
          `Bill ${status === "Draft" ? "saved as draft" : "created"}!`,
        );
      }

      navigate("/bills");
    } catch (error) {
      console.error("Error saving bill:", error);
      toast.error(
        isEditMode ? "Failed to update bill" : "Failed to create bill",
      );
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const vendorOptions = vendors.map((v) => ({
    value: v.id,
    label: v.name,
    gstin: v.gstin,
    ...v,
  }));

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: `${c.category_name} - ${c.coa_account}`,
    ...c,
  }));

  const gstOptions = GST_RATES.map((rate) => ({
    value: rate.value,
    label: rate.label,
  }));

  const tdsOptions = TDS_SECTIONS.map((section) => ({
    value: section.value,
    label: section.label,
    rate: section.rate,
    description: section.description,
  }));

  const selectStyles = {
    control: (base) => ({
      ...base,
      minHeight: "42px",
      borderColor: "#e5e7eb",
      "&:hover": { borderColor: "#033F99" },
    }),
    menu: (base) => ({ ...base, zIndex: 9999 }),
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/bills")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="h-8 w-px bg-gray-300" />
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                  <Receipt className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1
                    className="text-3xl font-bold text-gray-900"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    {isEditMode ? "Edit Bill" : "Create Bill"}
                  </h1>
                  <p
                    className="text-sm text-gray-500"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {isEditMode
                      ? "Update existing purchase bill"
                      : "Record purchase bill with auto-accounting"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => handleSubmit("Draft")}
                disabled={loading}
              >
                <Save className="h-4 w-4 mr-2" />
                {isEditMode ? "Update as Draft" : "Save as Draft"}
              </Button>
              <Button
                onClick={() => handleSubmit("Approved")}
                disabled={loading}
              >
                <Send className="h-4 w-4 mr-2" />
                {isEditMode ? "Update Bill" : "Approve Bill"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vendor & Category */}
            <Card className="p-6 bg-white border-0 shadow-lg">
              <h3
                className="text-lg font-semibold text-gray-900 mb-6"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Vendor & Category
              </h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Vendor *
                  </Label>
                  <Select
                    options={vendorOptions}
                    value={selectedVendor}
                    onChange={setSelectedVendor}
                    placeholder="Search and select vendor..."
                    styles={selectStyles}
                    isClearable
                    isSearchable
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Expense Category *
                  </Label>
                  <Select
                    options={categoryOptions}
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                    placeholder="Search and select category..."
                    styles={selectStyles}
                    isClearable
                    isSearchable
                  />
                  {selectedCategory && (
                    <p className="text-xs text-blue-600 mt-1">
                      COA: {selectedCategory.coa_account}
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* Bill Details */}
            <Card className="p-6 bg-white border-0 shadow-lg">
              <h3
                className="text-lg font-semibold text-gray-900 mb-6"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Bill Details
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Bill Date
                  </Label>
                  <Input
                    type="date"
                    value={formData.bill_date}
                    onChange={(e) =>
                      setFormData({ ...formData, bill_date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Payment Terms (Days)
                  </Label>
                  <Input
                    type="number"
                    value={formData.payment_terms}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payment_terms: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Due Date
                  </Label>
                  <Input
                    type="date"
                    value={formData.due_date}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </Card>

            {/* Line Items */}
            <Card className="p-6 bg-white border-0 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3
                  className="text-lg font-semibold text-gray-900"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Line Items
                </h3>
                <Button onClick={addItem} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div
                    key={item.id || `item-${index}`}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-5">
                        <Label className="text-xs text-gray-600">
                          Description *
                        </Label>
                        <Input
                          value={item.description}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "description",
                              e.target.value,
                            )
                          }
                          placeholder="Item description"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs text-gray-600">HSN/SAC</Label>
                        <Input
                          value={item.hsn_code}
                          onChange={(e) =>
                            handleItemChange(index, "hsn_code", e.target.value)
                          }
                          placeholder="Code"
                        />
                      </div>
                      <div className="col-span-1">
                        <Label className="text-xs text-gray-600">Qty *</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "quantity",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs text-gray-600">Rate *</Label>
                        <Input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "unit_price",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs text-gray-600">Amount</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="text"
                            value={formatCurrency(item.amount)}
                            readOnly
                            className="bg-gray-50"
                          />
                          {formData.items.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Tax Configuration */}
            <Card className="p-6 bg-white border-0 shadow-lg">
              <h3
                className="text-lg font-semibold text-gray-900 mb-6"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Tax Configuration
              </h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                    GST Rate *
                  </Label>
                  <Select
                    options={gstOptions}
                    value={selectedGSTRate}
                    onChange={setSelectedGSTRate}
                    placeholder="Select GST rate..."
                    styles={selectStyles}
                    isSearchable
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    GST will be auto-split as IGST or CGST+SGST based on vendor
                    state
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                    TDS Section
                  </Label>
                  <Select
                    options={tdsOptions}
                    value={selectedTDSSection}
                    onChange={setSelectedTDSSection}
                    placeholder="Select TDS section..."
                    styles={selectStyles}
                    isSearchable
                    formatOptionLabel={(option) => (
                      <div>
                        <div className="font-semibold">{option.label}</div>
                        {option.description && (
                          <div className="text-xs text-gray-500">
                            {option.description}
                          </div>
                        )}
                      </div>
                    )}
                  />
                  {selectedTDSSection && selectedTDSSection.rate > 0 && (
                    <p className="text-xs text-orange-600 mt-1">
                      TDS @ {selectedTDSSection.rate}% will be deducted from
                      payment
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 shadow-lg sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <Calculator className="h-5 w-5 text-red-600" />
                <h3
                  className="text-lg font-semibold text-gray-900"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Amount Summary
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-700">Base Amount</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(formData.base_amount)}
                  </span>
                </div>

                {/* GST Breakdown */}
                {selectedVendor &&
                  formData.base_amount > 0 &&
                  (() => {
                    const gstBreakdown = calculateGSTBreakdown(
                      formData.base_amount,
                      formData.gst_percent,
                      selectedVendor.gstin || "29ZZZZZ1234Z1Z5",
                      "29ABCDE1234F1Z5",
                    );

                    return (
                      <div className="bg-red-100 rounded-lg p-3 space-y-2">
                        <div className="text-xs font-semibold text-red-900 mb-2">
                          {gstBreakdown.type}
                        </div>
                        {gstBreakdown.breakdown.map((item, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span className="text-xs text-gray-700">
                              {item.label}
                            </span>
                            <span className="text-xs font-semibold text-gray-900">
                              {formatCurrency(item.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                <div className="flex justify-between py-2 border-t border-red-200">
                  <span className="text-sm font-semibold text-gray-900">
                    Total Amount
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {formatCurrency(formData.total_amount)}
                  </span>
                </div>

                {formData.tds_percent > 0 && (
                  <div className="bg-orange-100 rounded-lg p-3">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-700">
                        TDS Deduction
                      </span>
                      <span className="text-xs font-semibold text-green-600">
                        -{formatCurrency(formData.tds_amount)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {selectedTDSSection.label}
                    </p>
                  </div>
                )}

                <div className="flex justify-between py-3 border-t-2 border-red-300 mt-2">
                  <span className="font-bold text-gray-900">Net Payable</span>
                  <span className="text-xl font-bold text-red-700">
                    {formatCurrency(formData.net_payable)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Accounting Preview */}
            {selectedCategory && formData.net_payable > 0 && (
              <Card className="p-6 bg-purple-50 border-2 border-purple-200">
                <h3 className="text-sm font-semibold text-purple-900 mb-4">
                  Accounting Impact Preview
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-700">
                      Debit: {selectedCategory.coa_account}
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(formData.base_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Debit: GST Input</span>
                    <span className="font-semibold">
                      {formatCurrency(formData.gst_amount)}
                    </span>
                  </div>
                  {formData.tds_amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">Credit: TDS Payable</span>
                      <span className="font-semibold">
                        {formatCurrency(formData.tds_amount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-700">
                      Credit: Accounts Payable
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(formData.net_payable)}
                    </span>
                  </div>
                  <p className="text-xs text-purple-700 mt-3 italic">
                    Journal entry will be auto-posted when bill is approved
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBillNew;
