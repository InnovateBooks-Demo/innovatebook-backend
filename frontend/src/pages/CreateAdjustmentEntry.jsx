import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import axios from "axios";
import { getAuthHeaders } from "../utils/auth";
import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Calendar,
  FileText,
  AlertCircle,
} from "lucide-react";

const CreateAdjustmentEntry = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({
    entry_date: new Date().toISOString().split("T")[0],
    description: "",
    notes: "",
    line_items: [{ account: "", description: "", debit: 0, credit: 0 }],
  });

  useEffect(() => {
    loadAccounts();
    if (isEditMode) {
      loadExistingEntry();
    }
  }, [id]);

  const loadAccounts = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || "";
      const response = await axios.get(`${backendUrl}/api/categories`, {
        headers: getAuthHeaders(),
      });
      // Extract unique account names from categories
      const uniqueAccounts = [
        ...new Set(response.data.map((cat) => cat.coa_account)),
      ];
      setAccounts(uniqueAccounts.filter(Boolean).sort());
    } catch (error) {
      console.error("Failed to load accounts:", error);
    }
  };

  const loadExistingEntry = async () => {
    try {
      setLoading(true);
      const backendUrl = process.env.REACT_APP_BACKEND_URL || "";
      const response = await axios.get(
        `${backendUrl}/api/adjustment-entries/${id}`,
        {
          headers: getAuthHeaders(),
        },
      );
      const entry = response.data;
      setFormData({
        entry_date: entry.entry_date.split("T")[0],
        description: entry.description,
        notes: entry.notes || "",
        line_items: entry.line_items,
      });
      setLoading(false);
    } catch (error) {
      console.error("Failed to load entry:", error);
      setLoading(false);
    }
  };

  const handleAddLineItem = () => {
    setFormData({
      ...formData,
      line_items: [
        ...formData.line_items,
        { account: "", description: "", debit: 0, credit: 0 },
      ],
    });
  };

  const handleRemoveLineItem = (index) => {
    const newLineItems = formData.line_items.filter((_, i) => i !== index);
    setFormData({ ...formData, line_items: newLineItems });
  };

  const handleLineItemChange = (index, field, value) => {
    const newLineItems = [...formData.line_items];
    newLineItems[index] = {
      ...newLineItems[index],
      [field]:
        field === "debit" || field === "credit"
          ? parseFloat(value) || 0
          : value,
    };
    setFormData({ ...formData, line_items: newLineItems });
  };

  const calculateTotals = () => {
    const totalDebit = formData.line_items.reduce(
      (sum, item) => sum + (parseFloat(item.debit) || 0),
      0,
    );
    const totalCredit = formData.line_items.reduce(
      (sum, item) => sum + (parseFloat(item.credit) || 0),
      0,
    );
    return { totalDebit, totalCredit, difference: totalDebit - totalCredit };
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.entry_date) {
      alert("Please select an entry date");
      return;
    }
    if (!formData.description) {
      alert("Please enter a description");
      return;
    }
    if (formData.line_items.length < 2) {
      alert("Please add at least 2 line items");
      return;
    }

    const { totalDebit, totalCredit, difference } = calculateTotals();
    if (Math.abs(difference) > 0.01) {
      alert(
        `Debits (₹${totalDebit.toFixed(2)}) must equal Credits (₹${totalCredit.toFixed(2)})`,
      );
      return;
    }

    // Check for empty line items
    const hasEmptyFields = formData.line_items.some(
      (item) =>
        !item.account ||
        !item.description ||
        (item.debit === 0 && item.credit === 0),
    );
    if (hasEmptyFields) {
      alert(
        "Please fill all line item fields and ensure each has a debit or credit amount",
      );
      return;
    }

    try {
      setLoading(true);
      const backendUrl = process.env.REACT_APP_BACKEND_URL || "";

      const payload = {
        entry_date: new Date(formData.entry_date).toISOString(),
        description: formData.description,
        notes: formData.notes || null,
        line_items: formData.line_items.map((item) => ({
          account: item.account,
          description: item.description,
          debit: parseFloat(item.debit) || 0,
          credit: parseFloat(item.credit) || 0,
        })),
      };

      if (isEditMode) {
        await axios.put(`${backendUrl}/api/adjustment-entries/${id}`, payload, {
          headers: getAuthHeaders(),
        });
        alert("Adjustment entry updated successfully");
      } else {
        await axios.post(`${backendUrl}/api/adjustment-entries`, payload, {
          headers: getAuthHeaders(),
        });
        alert("Adjustment entry created successfully");
      }

      navigate("/adjustment-entries");
    } catch (error) {
      console.error("Failed to save entry:", error);
      alert(error.response?.data?.detail || "Failed to save adjustment entry");
      setLoading(false);
    }
  };

  const { totalDebit, totalCredit, difference } = calculateTotals();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <Button
          onClick={() => navigate("/adjustment-entries")}
          variant="ghost"
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Adjustment Entries
        </Button>
        <h1
          className="text-3xl font-bold text-gray-900"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          {isEditMode ? "Edit Adjustment Entry" : "Create Adjustment Entry"}
        </h1>
        <p
          className="text-gray-600 mt-1"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {isEditMode
            ? "Update existing adjustment entry"
            : "Create a new manual accounting adjustment"}
        </p>
      </div>

      {/* Form */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Entry Date */}
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Entry Date *
            </label>
            <input
              type="date"
              value={formData.entry_date}
              onChange={(e) =>
                setFormData({ ...formData, entry_date: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#033F99]"
              style={{ fontFamily: "Inter, sans-serif" }}
            />
          </div>

          {/* Description */}
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Description *
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="e.g., Year-end depreciation adjustment"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#033F99]"
              style={{ fontFamily: "Inter, sans-serif" }}
            />
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label
            className="block text-sm font-medium text-gray-700 mb-2"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            placeholder="Additional notes about this adjustment..."
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#033F99]"
            style={{ fontFamily: "Inter, sans-serif" }}
          />
        </div>
      </Card>

      {/* Line Items */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-xl font-semibold text-gray-900"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Journal Line Items
          </h2>
          <Button
            onClick={handleAddLineItem}
            className="bg-[#033F99] hover:bg-[#022b6b] text-white"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Line Item
          </Button>
        </div>

        {/* Line Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th
                  className="text-left py-3 px-4 text-sm font-semibold text-gray-700"
                  style={{ fontFamily: "Inter, sans-serif", width: "25%" }}
                >
                  Account *
                </th>
                <th
                  className="text-left py-3 px-4 text-sm font-semibold text-gray-700"
                  style={{ fontFamily: "Inter, sans-serif", width: "30%" }}
                >
                  Description *
                </th>
                <th
                  className="text-right py-3 px-4 text-sm font-semibold text-gray-700"
                  style={{ fontFamily: "Inter, sans-serif", width: "18%" }}
                >
                  Debit (₹)
                </th>
                <th
                  className="text-right py-3 px-4 text-sm font-semibold text-gray-700"
                  style={{ fontFamily: "Inter, sans-serif", width: "18%" }}
                >
                  Credit (₹)
                </th>
                <th
                  className="text-center py-3 px-4 text-sm font-semibold text-gray-700"
                  style={{ fontFamily: "Inter, sans-serif", width: "9%" }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {formData.line_items.map((item, index) => (
                <tr key={`item-${index}`} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <select
                      value={item.account}
                      onChange={(e) =>
                        handleLineItemChange(index, "account", e.target.value)
                      }
                      className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      <option value="">Select Account</option>
                      {accounts.map((account) => (
                        <option key={account} value={account}>
                          {account}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) =>
                        handleLineItemChange(
                          index,
                          "description",
                          e.target.value,
                        )
                      }
                      placeholder="Line item description"
                      className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      value={item.debit}
                      onChange={(e) =>
                        handleLineItemChange(index, "debit", e.target.value)
                      }
                      step="0.01"
                      min="0"
                      className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      value={item.credit}
                      onChange={(e) =>
                        handleLineItemChange(index, "credit", e.target.value)
                      }
                      step="0.01"
                      min="0"
                      className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    />
                  </td>
                  <td className="py-3 px-4 text-center">
                    {formData.line_items.length > 1 && (
                      <Button
                        onClick={() => handleRemoveLineItem(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-300 bg-gray-50">
                <td
                  colSpan="2"
                  className="py-4 px-4 text-right font-semibold text-gray-900"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Totals:
                </td>
                <td
                  className="py-4 px-4 text-right font-bold text-gray-900"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {formatCurrency(totalDebit)}
                </td>
                <td
                  className="py-4 px-4 text-right font-bold text-gray-900"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {formatCurrency(totalCredit)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Balance Check */}
        {Math.abs(difference) > 0.01 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p
              className="text-sm text-red-800"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <strong>Out of Balance:</strong> Debits and Credits must be equal.
              Current difference: {formatCurrency(Math.abs(difference))}
            </p>
          </div>
        )}
        {Math.abs(difference) <= 0.01 && formData.line_items.length >= 2 && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-green-600" />
            <p
              className="text-sm text-green-800"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <strong>Balanced:</strong> Debits equal Credits. Entry is ready to
              save.
            </p>
          </div>
        )}
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button
          onClick={() => navigate("/adjustment-entries")}
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || Math.abs(difference) > 0.01}
          className="bg-[#033F99] hover:bg-[#022b6b] text-white disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          <Save className="h-4 w-4 mr-2" />
          {loading
            ? "Saving..."
            : isEditMode
              ? "Update Entry"
              : "Save as Draft"}
        </Button>
      </div>
    </div>
  );
};

export default CreateAdjustmentEntry;
