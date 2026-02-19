import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FileText,
  ArrowLeft,
  Save,
  ArrowRight,
  Loader2,
  Building2,
  CreditCard,
  Scale,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const RevenueContractDraft = () => {
  const { contract_id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    payment_terms: "net-30",
    special_terms: "",
    legal_clauses: "",
  });

  useEffect(() => {
    fetchContract();
  }, [contract_id]);

  const fetchContract = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/workflow/revenue/contracts/${contract_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) {
        setContract(data.contract);
        setFormData({
          payment_terms: data.contract.payment_terms || "net-30",
          special_terms: data.contract.special_terms || "",
          legal_clauses: data.contract.legal_clauses || "",
        });
      }
    } catch (error) {
      toast.error("Failed to fetch contract");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/workflow/revenue/contracts/${contract_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ commit_id: contract.commit_id, ...formData }),
        },
      );
      const data = await res.json();
      if (data.success) {
        toast.success("Contract saved");
        fetchContract();
      } else {
        toast.error(data.detail || "Failed to save");
      }
    } catch (error) {
      toast.error("Error saving contract");
    } finally {
      setSaving(false);
    }
  };

  const handleSign = async () => {
    if (!window.confirm("Sign this contract? This action cannot be undone."))
      return;

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/workflow/revenue/contracts/${contract_id}/sign`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) {
        toast.success("Contract signed");
        fetchContract();
      } else {
        toast.error(data.detail || "Failed to sign");
      }
    } catch (error) {
      toast.error("Error signing contract");
    }
  };

  const handleCreateHandoff = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/workflow/revenue/contracts/${contract_id}/handoff`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) {
        toast.success("Handoff created");
        navigate(`/commerce/revenue-workflow/handoffs/${data.handoff_id}`);
      } else {
        toast.error(data.detail || "Failed to create handoff");
      }
    } catch (error) {
      toast.error("Error creating handoff");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "signed":
        return "bg-green-100 text-green-700";
      case "draft":
        return "bg-blue-100 text-blue-700";
      case "review":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#033F99]" />
      </div>
    );
  if (!contract)
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <FileText className="h-12 w-12 text-gray-300 mb-4" />
        <p className="text-gray-500">Contract not found</p>
      </div>
    );

  const isSigned = contract.status === "signed";

  return (
    <div
      className="min-h-screen bg-gray-50"
      data-testid="revenue-contract-draft"
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
              Revenue Workflow → Contract
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center">
                <FileText className="h-7 w-7 text-indigo-600" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold text-gray-900">
                    Contract Draft
                  </h1>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(contract.status)}`}
                  >
                    {contract.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {contract.contract_id}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!isSigned && (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={handleSign}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                  >
                    Sign Contract
                  </button>
                </>
              )}
              {isSigned && (
                <button
                  onClick={handleCreateHandoff}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                >
                  <ArrowRight className="h-4 w-4" />
                  Create Handoff
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Party & Deal Info (Read-Only) */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-gray-500" />
                  <h2 className="text-lg font-medium text-gray-900">
                    Party & Deal Details
                  </h2>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Auto-filled from evaluation - Cannot be modified
                </p>
              </div>
              <div className="p-6 grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Party</p>
                  <p className="font-medium text-gray-900">
                    {contract.party_name || contract.party_id}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Contract Value</p>
                  <p className="text-xl font-bold text-gray-900">
                    ₹{(contract.total_value || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Currency</p>
                  <p className="font-medium text-gray-900">
                    {contract.currency || "INR"}
                  </p>
                </div>
              </div>
            </div>

            {/* Items (Read-Only) */}
            {contract.items && contract.items.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    Contract Items
                  </h2>
                </div>
                <div className="p-6">
                  <table className="w-full">
                    <thead>
                      <tr className="text-xs font-semibold text-gray-500 uppercase">
                        <th className="pb-3 text-left">Item</th>
                        <th className="pb-3 text-center">Qty</th>
                        <th className="pb-3 text-right">Unit Price</th>
                        <th className="pb-3 text-right">Net Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {contract.items.map((item) => (
                        <tr key={item.item_id || item.item_name}>
                          <td className="py-3 text-sm text-gray-900">
                            {item.item_name}
                          </td>
                          <td className="py-3 text-sm text-center text-gray-600">
                            {item.quantity}
                          </td>
                          <td className="py-3 text-sm text-right text-gray-600">
                            ₹{(item.unit_price || 0).toLocaleString()}
                          </td>
                          <td className="py-3 text-sm text-right font-semibold text-gray-900">
                            ₹{(item.net_price || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Payment Terms (Editable) */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-gray-500" />
                  <h2 className="text-lg font-medium text-gray-900">
                    Payment Terms
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <select
                  value={formData.payment_terms}
                  onChange={(e) =>
                    setFormData({ ...formData, payment_terms: e.target.value })
                  }
                  disabled={isSigned}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white disabled:bg-gray-100"
                >
                  <option value="net-15">Net 15</option>
                  <option value="net-30">Net 30</option>
                  <option value="net-45">Net 45</option>
                  <option value="net-60">Net 60</option>
                  <option value="advance">100% Advance</option>
                  <option value="50-50">50% Advance, 50% on Delivery</option>
                </select>
              </div>
            </div>

            {/* Legal Clauses (Editable) */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-gray-500" />
                  <h2 className="text-lg font-medium text-gray-900">
                    Legal Clauses
                  </h2>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Only legal text can be edited
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Terms
                  </label>
                  <textarea
                    value={formData.special_terms}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        special_terms: e.target.value,
                      })
                    }
                    disabled={isSigned}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg disabled:bg-gray-100"
                    placeholder="Any special terms approved during evaluation..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Legal Clauses
                  </label>
                  <textarea
                    value={formData.legal_clauses}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        legal_clauses: e.target.value,
                      })
                    }
                    disabled={isSigned}
                    rows={5}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg disabled:bg-gray-100"
                    placeholder="Standard legal clauses and terms..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Contract Status
                </h2>
              </div>
              <div className="p-6">
                <span
                  className={`inline-flex px-4 py-2 rounded-lg text-sm font-semibold capitalize ${getStatusColor(contract.status)}`}
                >
                  {contract.status}
                </span>
                {isSigned && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                      ✓ Contract signed on{" "}
                      {new Date(contract.signed_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Workflow Progress */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Workflow Progress
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-green-600">
                    <span>✓</span> Lead
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <span>✓</span> Evaluate
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <span>✓</span> Commit
                  </div>
                  <div className="flex items-center gap-2 text-indigo-600 font-semibold">
                    <span>→</span> Contract (Current)
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <span>○</span> Handoff
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

export default RevenueContractDraft;
