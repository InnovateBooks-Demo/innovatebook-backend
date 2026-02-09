import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FileText,
  ArrowLeft,
  Save,
  ArrowRight,
  Loader2,
  CreditCard,
  Scale,
  Truck,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ProcureContractDraft = () => {
  const { contract_id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    payment_terms: "net-30",
    delivery_terms: "",
    sla_terms: "",
    penalty_clauses: "",
  });

  useEffect(() => {
    fetchContract();
  }, [contract_id]);

  const fetchContract = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/workflow/procure/contracts/${contract_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) {
        setContract(data.contract);
        setFormData({
          payment_terms: data.contract.payment_terms || "net-30",
          delivery_terms: data.contract.delivery_terms || "",
          sla_terms: data.contract.sla_terms || "",
          penalty_clauses: data.contract.penalty_clauses || "",
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
        `${API_URL}/api/commerce/workflow/procure/contracts/${contract_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
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
        `${API_URL}/api/commerce/workflow/procure/contracts/${contract_id}/sign`,
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
        `${API_URL}/api/commerce/workflow/procure/contracts/${contract_id}/handoff`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) {
        toast.success("Handoff created");
        navigate(`/commerce/procure-workflow/handoffs/${data.handoff_id}`);
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
      case "pending_acceptance":
        return "bg-purple-100 text-purple-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#3A4E63]" />
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
  const canSign = contract.status === "draft" || contract.status === "review";

  return (
    <div
      className="min-h-screen bg-gray-50"
      data-testid="procure-contract-draft"
    >
      {/* Header */}
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
              Procurement Workflow → Contract
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center ${isSigned ? "bg-green-100" : "bg-blue-100"}`}
              >
                <FileText
                  className={`h-7 w-7 ${isSigned ? "text-green-600" : "text-[#033F99]"}`}
                />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold text-gray-900">
                    Procurement Contract
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
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save"}
                </button>
              )}
              {canSign && (
                <button
                  onClick={handleSign}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#3A4E63] rounded-lg hover:bg-[#022d6e]"
                >
                  <Scale className="h-4 w-4" />
                  Sign Contract
                </button>
              )}
              {isSigned && !contract.handoff_id && (
                <button
                  onClick={handleCreateHandoff}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                >
                  <ArrowRight className="h-4 w-4" />
                  Create Handoff
                </button>
              )}
              {isSigned && contract.handoff_id && (
                <button
                  onClick={() =>
                    navigate(
                      `/commerce/procure-workflow/handoffs/${contract.handoff_id}`,
                    )
                  }
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                >
                  <ArrowRight className="h-4 w-4" />
                  View Handoff
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
            {/* Payment Terms */}
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
                  <option value="advance">100% Advance</option>
                  <option value="50-50">50% Advance, 50% on Delivery</option>
                  <option value="net-15">Net 15 Days</option>
                  <option value="net-30">Net 30 Days</option>
                  <option value="net-45">Net 45 Days</option>
                  <option value="net-60">Net 60 Days</option>
                </select>
              </div>
            </div>

            {/* Delivery Terms */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-gray-500" />
                  <h2 className="text-lg font-medium text-gray-900">
                    Delivery Terms
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <textarea
                  value={formData.delivery_terms}
                  onChange={(e) =>
                    setFormData({ ...formData, delivery_terms: e.target.value })
                  }
                  disabled={isSigned}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg disabled:bg-gray-100"
                  placeholder="Specify delivery schedule, location, acceptance criteria..."
                />
              </div>
            </div>

            {/* SLA Terms */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Service Level Agreement (SLA)
                </h2>
              </div>
              <div className="p-6">
                <textarea
                  value={formData.sla_terms}
                  onChange={(e) =>
                    setFormData({ ...formData, sla_terms: e.target.value })
                  }
                  disabled={isSigned}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg disabled:bg-gray-100"
                  placeholder="Specify service levels, response times, availability guarantees..."
                />
              </div>
            </div>

            {/* Penalty Clauses */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-gray-500" />
                  <h2 className="text-lg font-medium text-gray-900">
                    Penalty Clauses
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <textarea
                  value={formData.penalty_clauses}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      penalty_clauses: e.target.value,
                    })
                  }
                  disabled={isSigned}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg disabled:bg-gray-100"
                  placeholder="Specify penalties for delays, quality issues, SLA breaches..."
                />
              </div>
            </div>

            {/* Items */}
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
                        <th className="pb-3 text-left">Description</th>
                        <th className="pb-3 text-center">Qty</th>
                        <th className="pb-3 text-right">Unit Cost</th>
                        <th className="pb-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {contract.items.map((item) => (
                        <tr key={item.id || item.description}>
                          <td className="py-3 text-sm text-gray-900">
                            {item.description}
                          </td>
                          <td className="py-3 text-sm text-center text-gray-600">
                            {item.quantity}
                          </td>
                          <td className="py-3 text-sm text-right text-gray-600">
                            ₹{(item.unit_cost || 0).toLocaleString()}
                          </td>
                          <td className="py-3 text-sm text-right font-semibold text-gray-900">
                            ₹{(item.total_cost || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contract Summary */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Summary</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Contract Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{(contract.total_value || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Vendor ID</p>
                  <p className="font-medium text-gray-900">
                    {contract.vendor_id || "Not assigned"}
                  </p>
                </div>
                {contract.signed_at && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Signed On</p>
                    <p className="font-medium text-green-600">
                      {new Date(contract.signed_at).toLocaleString()}
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
                <div className="space-y-3">
                  {["1. Procure Request", "2. Evaluation", "3. Commit"].map(
                    (step, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-600">{step}</span>
                      </div>
                    ),
                  )}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center ${isSigned ? "bg-green-500" : "bg-yellow-500"}`}
                    >
                      {isSigned ? (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium ${isSigned ? "text-green-600" : "text-yellow-600"}`}
                    >
                      4. Contract (Current)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-gray-200" />
                    <span className="text-sm text-gray-400">5. Handoff</span>
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

export default ProcureContractDraft;
