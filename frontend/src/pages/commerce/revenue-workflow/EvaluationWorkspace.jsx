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
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Shield,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const RevenueEvaluationWorkspace = () => {
  const { evaluation_id } = useParams();
  const navigate = useNavigate();
  const [evaluation, setEvaluation] = useState(null);
  const [partyReadiness, setPartyReadiness] = useState(null);
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchEvaluation();
  }, [evaluation_id]);

  const fetchEvaluation = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/workflow/revenue/evaluations/${evaluation_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) {
        setEvaluation(data.evaluation);
        setPartyReadiness(data.party_readiness);
        setRiskAssessment(data.risk_assessment);
        setItems(data.evaluation.items || []);
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
        item_id: `ITEM-${Date.now()}`,
        item_name: "",
        quantity: 1,
        unit_price: 0,
        discount_percent: 0,
        net_price: 0,
        expected_cost: 0,
        margin_percent: 0,
      },
    ]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    // Recalculate net_price and margin
    const item = newItems[index];
    const unitPrice = parseFloat(item.unit_price) || 0;
    const quantity = parseInt(item.quantity) || 1;
    const discount = parseFloat(item.discount_percent) || 0;
    const expectedCost = parseFloat(item.expected_cost) || 0;

    const grossValue = unitPrice * quantity;
    const netPrice = grossValue * (1 - discount / 100);
    const margin =
      netPrice > 0
        ? ((netPrice - expectedCost * quantity) / netPrice) * 100
        : 0;

    newItems[index].net_price = Math.round(netPrice * 100) / 100;
    newItems[index].margin_percent = Math.round(margin * 100) / 100;

    setItems(newItems);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const totalValue = items.reduce(
      (sum, item) => sum + (item.net_price || 0),
      0,
    );
    const totalCost = items.reduce(
      (sum, item) => sum + (item.expected_cost || 0) * (item.quantity || 1),
      0,
    );
    const grossMargin =
      totalValue > 0 ? ((totalValue - totalCost) / totalValue) * 100 : 0;
    return {
      totalValue,
      totalCost,
      grossMargin: Math.round(grossMargin * 100) / 100,
    };
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("access_token");
      const totals = calculateTotals();

      const payload = {
        lead_id: evaluation.lead_id,
        party_id: evaluation.party_id,
        deal_type: evaluation.deal_type || "one-time",
        currency: evaluation.currency || "INR",
        region: evaluation.region,
        contract_duration_months: evaluation.contract_duration_months || 12,
        items: items,
        total_value: totals.totalValue,
        gross_margin_percent: totals.grossMargin,
      };

      const res = await fetch(
        `${API_URL}/api/commerce/workflow/revenue/evaluations/${evaluation_id}`,
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
        `${API_URL}/api/commerce/workflow/revenue/evaluations/${evaluation_id}/submit`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) {
        toast.success(
          data.requires_approval
            ? "Submitted for approval"
            : "Approved - Proceeding to commit",
        );
        navigate(`/commerce/revenue-workflow/commits/${data.commit_id}`);
      } else {
        toast.error(data.detail || "Failed to submit");
      }
    } catch (error) {
      toast.error("Failed to submit evaluation");
    }
  };

  const { totalValue, totalCost, grossMargin } = calculateTotals();

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

  const getMarginColor = (margin) => {
    if (margin < 15) return "text-red-600";
    if (margin < 25) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div
      className="min-h-screen bg-gray-50"
      data-testid="revenue-evaluation-workspace"
    >
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate("/commerce/revenue-workflow/leads")}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-500">
              Revenue Workflow → Evaluate
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
                    Evaluation Workspace
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
                partyReadiness?.status === "verified" && (
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
          {/* Main Content - 3 columns */}
          <div className="lg:col-span-3 space-y-6">
            {/* Section A: Party Readiness */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-gray-500" />
                    <h2 className="text-lg font-medium text-gray-900">
                      Party Readiness
                    </h2>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${partyReadiness?.status === "verified" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                  >
                    {partyReadiness?.status || "draft"}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-4 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {partyReadiness?.legal_ok ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="text-sm font-medium">Legal Profile</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {partyReadiness?.tax_ok ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="text-sm font-medium">Tax Profile</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {partyReadiness?.compliance_ok ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="text-sm font-medium">Compliance</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Risk Score:</span>
                    <span
                      className={`font-bold ${(partyReadiness?.risk_score || 0) > 50 ? "text-red-600" : "text-green-600"}`}
                    >
                      {partyReadiness?.risk_score || 0}
                    </span>
                  </div>
                </div>
                {partyReadiness?.status !== "verified" && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <AlertTriangle className="h-5 w-5" />
                      <span className="text-sm font-medium">
                        Party must be verified before proceeding to commit
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section B: Deal Structure */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Deal Structure
                </h2>
              </div>
              <div className="p-6 grid grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deal Type
                  </label>
                  <select
                    value={evaluation.deal_type || "one-time"}
                    onChange={(e) =>
                      setEvaluation({
                        ...evaluation,
                        deal_type: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="one-time">One-time</option>
                    <option value="subscription">Subscription</option>
                    <option value="project">Project</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={evaluation.currency || "INR"}
                    onChange={(e) =>
                      setEvaluation({ ...evaluation, currency: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Region
                  </label>
                  <select
                    value={evaluation.region || ""}
                    onChange={(e) =>
                      setEvaluation({ ...evaluation, region: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="">Domestic</option>
                    <option value="international">International</option>
                    <option value="export">Export</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contract Duration (months)
                  </label>
                  <input
                    type="number"
                    value={evaluation.contract_duration_months || 12}
                    onChange={(e) =>
                      setEvaluation({
                        ...evaluation,
                        contract_duration_months:
                          parseInt(e.target.value) || 12,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Section C: Item & Catalog Selection */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-gray-500" />
                    <h2 className="text-lg font-medium text-gray-900">
                      Items & Catalog Selection
                    </h2>
                  </div>
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
                      <th className="pb-3 text-left">Item</th>
                      <th className="pb-3 text-center w-20">Qty</th>
                      <th className="pb-3 text-right w-28">Unit Price</th>
                      <th className="pb-3 text-center w-20">Disc %</th>
                      <th className="pb-3 text-right w-28">Net Price</th>
                      <th className="pb-3 text-right w-28">Expected Cost</th>
                      <th className="pb-3 text-center w-20">Margin %</th>
                      <th className="pb-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.map((item, index) => (
                      <tr key={item.item_id}>
                        <td className="py-3 pr-3">
                          <input
                            type="text"
                            value={item.item_name}
                            onChange={(e) =>
                              updateItem(index, "item_name", e.target.value)
                            }
                            placeholder="Item name"
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
                            value={item.unit_price}
                            onChange={(e) =>
                              updateItem(
                                index,
                                "unit_price",
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            min="0"
                            className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm text-right"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <input
                            type="number"
                            value={item.discount_percent}
                            onChange={(e) =>
                              updateItem(
                                index,
                                "discount_percent",
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            min="0"
                            max="100"
                            className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm text-center"
                          />
                        </td>
                        <td className="py-3 px-2 text-right font-semibold text-gray-900">
                          ₹{(item.net_price || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-2">
                          <input
                            type="number"
                            value={item.expected_cost}
                            onChange={(e) =>
                              updateItem(
                                index,
                                "expected_cost",
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            min="0"
                            className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm text-right"
                          />
                        </td>
                        <td
                          className={`py-3 px-2 text-center font-semibold ${getMarginColor(item.margin_percent)}`}
                        >
                          {item.margin_percent}%
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
                          colSpan={8}
                          className="py-8 text-center text-gray-500"
                        >
                          No items added. Click "Add Item" to start.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Policy Flags */}
            {evaluation.policy_flags && evaluation.policy_flags.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-red-800 mb-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-semibold">Policy Violations</span>
                </div>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                  {evaluation.policy_flags.map((flag, i) => (
                    <li key={i}>{flag}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Pricing & Margin Summary */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-gray-500" />
                  <h2 className="text-lg font-medium text-gray-900">Summary</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{totalValue.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Cost</p>
                  <p className="text-lg font-semibold text-gray-700">
                    ₹{totalCost.toLocaleString()}
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Gross Margin</p>
                  <p
                    className={`text-2xl font-bold ${getMarginColor(grossMargin)}`}
                  >
                    {grossMargin}%
                  </p>
                  <div className="mt-2">
                    {grossMargin < 15 && (
                      <p className="text-xs text-red-600">
                        ⚠ Below hard floor (15%)
                      </p>
                    )}
                    {grossMargin >= 15 && grossMargin < 25 && (
                      <p className="text-xs text-yellow-600">
                        ⚠ Below soft floor (25%)
                      </p>
                    )}
                    {grossMargin >= 25 && (
                      <p className="text-xs text-green-600">
                        ✓ Meets margin policy
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-gray-500" />
                  <h2 className="text-lg font-medium text-gray-900">
                    Risk Assessment
                  </h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    Overall Risk Score
                  </p>
                  <p
                    className={`text-2xl font-bold ${(riskAssessment?.total_score || 0) > 50 ? "text-red-600" : "text-green-600"}`}
                  >
                    {riskAssessment?.total_score || 0}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Deal Size Risk</span>
                    <span
                      className={`font-medium capitalize ${riskAssessment?.deal_size_risk === "high" ? "text-red-600" : "text-green-600"}`}
                    >
                      {riskAssessment?.deal_size_risk || "low"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Geography Risk</span>
                    <span
                      className={`font-medium capitalize ${riskAssessment?.geography_risk === "high" ? "text-red-600" : "text-green-600"}`}
                    >
                      {riskAssessment?.geography_risk || "low"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Concentration Risk</span>
                    <span className="font-medium text-green-600 capitalize">
                      {riskAssessment?.concentration_risk || "low"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Evaluation Result */}
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
                <p className="text-sm text-gray-500 mt-3">
                  {evaluation.status === "blocked" &&
                    "This evaluation cannot proceed due to policy violations."}
                  {evaluation.status === "approval_required" &&
                    "Approval is required before proceeding to commit."}
                  {evaluation.status === "approved" &&
                    "Ready to proceed to commit stage."}
                  {!evaluation.status ||
                    (evaluation.status === "draft" &&
                      "Save the evaluation and submit for commit.")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueEvaluationWorkspace;
