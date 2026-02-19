import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ClipboardCheck,
  ArrowLeft,
  Save,
  ArrowRight,
  Plus,
  Trash2,
  Building2,
  DollarSign,
  AlertTriangle,
  Shield,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ProcureEvaluationWorkspace = () => {
  const { evaluation_id } = useParams();
  const navigate = useNavigate();
  const [evaluation, setEvaluation] = useState(null);
  const [request, setRequest] = useState(null);
  const [budgetValidation, setBudgetValidation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState([]);
  const [vendorData, setVendorData] = useState({
    vendor_id: "",
    vendor_status: "verified",
    vendor_legal_ok: true,
    vendor_tax_ok: true,
    vendor_compliance_ok: true,
    vendor_risk_score: 25,
  });

  useEffect(() => {
    fetchEvaluation();
  }, [evaluation_id]);

  const fetchEvaluation = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/workflow/procure/evaluations/${evaluation_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) {
        setEvaluation(data.evaluation);
        setRequest(data.request);
        setBudgetValidation(data.budget_validation);
        setItems(data.evaluation.items || []);
        setVendorData({
          vendor_id: data.evaluation.vendor_id || "",
          vendor_status: data.evaluation.vendor_status || "verified",
          vendor_legal_ok: data.evaluation.vendor_legal_ok ?? true,
          vendor_tax_ok: data.evaluation.vendor_tax_ok ?? true,
          vendor_compliance_ok: data.evaluation.vendor_compliance_ok ?? true,
          vendor_risk_score: data.evaluation.vendor_risk_score || 25,
        });
      }
    } catch (error) {
      toast.error("Failed to fetch evaluation");
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        description: "",
        quantity: 1,
        unit_cost: 0,
        total_cost: 0,
        expected_delivery: "",
      },
    ]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    if (field === "quantity" || field === "unit_cost") {
      newItems[index].total_cost =
        (newItems[index].quantity || 1) * (newItems[index].unit_cost || 0);
    }
    setItems(newItems);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () =>
    items.reduce((sum, item) => sum + (item.total_cost || 0), 0);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("access_token");
      const totalCost = calculateTotal();
      const payload = {
        request_id: evaluation.request_id,
        ...vendorData,
        items,
        total_cost: totalCost,
        budget_available: budgetValidation?.budget_available || 0,
        budget_variance: (budgetValidation?.budget_available || 0) - totalCost,
      };

      const res = await fetch(
        `${API_URL}/api/commerce/workflow/procure/evaluations/${evaluation_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (data.success) {
        toast.success("Evaluation saved");
        fetchEvaluation();
      } else {
        toast.error(data.detail || "Failed to save");
      }
    } catch (error) {
      toast.error("Error saving evaluation");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForCommit = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/workflow/procure/evaluations/${evaluation_id}/submit`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) {
        toast.success(
          data.requires_approval ? "Submitted for approval" : "Approved",
        );
        navigate(`/commerce/procure-workflow/commits/${data.commit_id}`);
      } else {
        toast.error(data.detail || "Failed to submit");
      }
    } catch (error) {
      toast.error("Failed to submit");
    }
  };

  const totalCost = calculateTotal();
  const budgetVariance = (budgetValidation?.budget_available || 0) - totalCost;

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#033F99]" />
      </div>
    );
  if (!evaluation)
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <ClipboardCheck className="h-12 w-12 text-gray-300 mb-4" />
        <p className="text-gray-500">Evaluation not found</p>
      </div>
    );

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";
      case "approval_required":
        return "bg-yellow-100 text-yellow-700";
      case "blocked":
        return "bg-red-100 text-red-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-50"
      data-testid="procure-evaluation-workspace"
    >
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate("/commerce/procure-workflow/requests")}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-500">
              Procurement Workflow → Evaluate
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                <ClipboardCheck className="h-7 w-7 text-purple-600" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold text-gray-900">
                    Procurement Evaluation
                  </h1>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(evaluation.status)}`}
                  >
                    {evaluation.status?.replace("_", " ")}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {evaluation.evaluation_id}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save"}
              </button>
              {evaluation.status !== "blocked" &&
                vendorData.vendor_status === "verified" && (
                  <button
                    onClick={handleSubmitForCommit}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                  >
                    <ArrowRight className="h-4 w-4" />
                    Submit for Commit
                  </button>
                )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            {/* Vendor Selection */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-gray-500" />
                    <h2 className="text-lg font-medium text-gray-900">
                      Vendor Selection & Readiness
                    </h2>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${vendorData.vendor_status === "verified" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                  >
                    {vendorData.vendor_status}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-6 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vendor ID
                    </label>
                    <input
                      type="text"
                      value={vendorData.vendor_id}
                      onChange={(e) =>
                        setVendorData({
                          ...vendorData,
                          vendor_id: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                      placeholder="Enter vendor ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vendor Status
                    </label>
                    <select
                      value={vendorData.vendor_status}
                      onChange={(e) =>
                        setVendorData({
                          ...vendorData,
                          vendor_status: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white"
                    >
                      <option value="draft">Draft</option>
                      <option value="verified">Verified</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {vendorData.vendor_legal_ok ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="text-sm font-medium">Legal</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {vendorData.vendor_tax_ok ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="text-sm font-medium">Tax</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {vendorData.vendor_compliance_ok ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="text-sm font-medium">Compliance</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Risk:</span>
                    <span
                      className={`font-bold ${vendorData.vendor_risk_score > 50 ? "text-red-600" : "text-green-600"}`}
                    >
                      {vendorData.vendor_risk_score}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items/Scope */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">
                    Scope / Items
                  </h2>
                  <button
                    onClick={addItem}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#033F99] bg-blue-50 rounded-lg hover:bg-blue-100"
                  >
                    <Plus className="h-4 w-4" />
                    Add Item
                  </button>
                </div>
              </div>
              <div className="p-6">
                <table className="w-full">
                  <thead>
                    <tr className="text-xs font-semibold text-gray-500 uppercase">
                      <th className="pb-3 text-left">Description</th>
                      <th className="pb-3 text-center w-20">Qty</th>
                      <th className="pb-3 text-right w-28">Unit Cost</th>
                      <th className="pb-3 text-right w-28">Total Cost</th>
                      <th className="pb-3 text-center w-32">Delivery</th>
                      <th className="pb-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.map((item, index) => (
                      <tr key={item.id || `item-${index}`}>
                        <td className="py-3 pr-3">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) =>
                              updateItem(index, "description", e.target.value)
                            }
                            placeholder="Item description"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(
                                index,
                                "quantity",
                                parseInt(e.target.value) || 1,
                              )
                            }
                            min="1"
                            className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm text-center"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <input
                            type="number"
                            value={item.unit_cost}
                            onChange={(e) =>
                              updateItem(
                                index,
                                "unit_cost",
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            min="0"
                            className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm text-right"
                          />
                        </td>
                        <td className="py-3 px-2 text-right font-semibold text-gray-900">
                          ₹{(item.total_cost || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-2">
                          <input
                            type="date"
                            value={item.expected_delivery}
                            onChange={(e) =>
                              updateItem(
                                index,
                                "expected_delivery",
                                e.target.value,
                              )
                            }
                            className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </td>
                        <td className="py-3 pl-2">
                          <button
                            onClick={() => removeItem(index)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {items.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-8 text-center text-gray-500"
                        >
                          No items added
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {evaluation.policy_flags && evaluation.policy_flags.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-red-800 mb-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-semibold">Policy Violations</span>
                </div>
                <ul className="list-disc list-inside text-sm text-red-700">
                  {evaluation.policy_flags.map((flag, i) => (
                    <li key={i}>{flag}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-gray-500" />
                  <h2 className="text-lg font-medium text-gray-900">
                    Cost & Budget
                  </h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Cost</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{totalCost.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Budget Available</p>
                  <p className="text-lg font-semibold text-gray-700">
                    ₹
                    {(budgetValidation?.budget_available || 0).toLocaleString()}
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Budget Variance</p>
                  <p
                    className={`text-xl font-bold ${budgetVariance >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {budgetVariance >= 0 ? "+" : ""}₹
                    {budgetVariance.toLocaleString()}
                  </p>
                  <p className="text-xs mt-2 text-gray-500">
                    {budgetVariance >= 0
                      ? "✓ Within budget"
                      : "⚠ Budget exceeded - Approval required"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-gray-500" />
                  <h2 className="text-lg font-medium text-gray-900">
                    Risk Assessment
                  </h2>
                </div>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Vendor Risk</span>
                  <span
                    className={`font-medium ${vendorData.vendor_risk_score > 50 ? "text-red-600" : "text-green-600"}`}
                  >
                    {vendorData.vendor_risk_score}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Dependency Risk</span>
                  <span className="font-medium text-green-600">Low</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Geography Risk</span>
                  <span className="font-medium text-green-600">Low</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Evaluation Result
                </h2>
              </div>
              <div className="p-6">
                <span
                  className={`inline-flex px-4 py-2 rounded-lg text-sm font-semibold capitalize ${getStatusColor(evaluation.status)}`}
                >
                  {evaluation.status?.replace("_", " ") || "Draft"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcureEvaluationWorkspace;
