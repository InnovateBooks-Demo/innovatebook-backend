import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Send,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Building2,
  Truck,
  Receipt,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const RevenueHandoff = () => {
  const { handoff_id } = useParams();
  const navigate = useNavigate();
  const [handoff, setHandoff] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHandoff();
  }, [handoff_id]);

  const fetchHandoff = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/workflow/revenue/handoffs/${handoff_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) setHandoff(data.handoff);
    } catch (error) {
      toast.error("Failed to fetch handoff");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/workflow/revenue/handoffs/${handoff_id}/complete`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) {
        toast.success("Handoff completed - Revenue workflow finished!");
        fetchHandoff();
      } else {
        toast.error(data.detail || "Failed to complete");
      }
    } catch (error) {
      toast.error("Error completing handoff");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#033F99]" />
      </div>
    );
  if (!handoff)
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Send className="h-12 w-12 text-gray-300 mb-4" />
        <p className="text-gray-500">Handoff not found</p>
      </div>
    );

  const isCompleted = handoff.status === "completed";

  return (
    <div className="min-h-screen bg-gray-50" data-testid="revenue-handoff">
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
              Revenue Workflow → Handoff
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center ${isCompleted ? "bg-green-100" : "bg-teal-100"}`}
              >
                <Send
                  className={`h-7 w-7 ${isCompleted ? "text-green-600" : "text-teal-600"}`}
                />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold text-gray-900">
                    Handoff to Execution
                  </h1>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${isCompleted ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                  >
                    {handoff.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {handoff.handoff_id}
                </p>
              </div>
            </div>
            {!isCompleted && (
              <button
                onClick={handleComplete}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
              >
                <CheckCircle2 className="h-4 w-4" />
                Mark as Completed
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {isCompleted && (
          <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="text-lg font-semibold text-green-800">
                  Revenue Workflow Completed!
                </h3>
                <p className="text-sm text-green-600">
                  This deal has been successfully handed off to Operations and
                  Finance for execution.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Operations Handoff */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-medium text-blue-900">
                  To IB Operations
                </h2>
              </div>
              <p className="text-xs text-blue-600 mt-1">Scope, SLA, Delivery</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Contract ID</p>
                <p className="font-medium text-gray-900">
                  {handoff.contract_id}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Party</p>
                <p className="font-medium text-gray-900">
                  {handoff.party_name || handoff.party_id}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Scope / Items</p>
                <div className="bg-gray-50 rounded-lg p-3">
                  {handoff.operations_data?.scope &&
                    handoff.operations_data.scope.length > 0 ? (
                    <ul className="space-y-2">
                      {handoff.operations_data.scope.map((item, i) => (
                        <li key={i} className="text-sm text-gray-700">
                          • {item.item_name} (Qty: {item.quantity})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No items specified</p>
                  )}
                </div>
              </div>
              {handoff.operations_data?.sla && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">SLA</p>
                  <p className="font-medium text-gray-900">
                    {handoff.operations_data.sla}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Finance Handoff */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-purple-50 border-b border-purple-200">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-purple-600" />
                <h2 className="text-lg font-medium text-purple-900">
                  To IB Finance
                </h2>
              </div>
              <p className="text-xs text-purple-600 mt-1">
                Pricing, Tax, Payment
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹
                  {(
                    handoff.finance_data?.total_value ||
                    handoff.total_value ||
                    0
                  ).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Currency</p>
                <p className="font-medium text-gray-900">
                  {handoff.finance_data?.currency || "INR"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Payment Terms</p>
                <p className="font-medium text-gray-900">
                  {handoff.finance_data?.payment_terms ||
                    handoff.payment_terms ||
                    "Net 30"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Summary */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Revenue Workflow Summary
            </h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium text-gray-900">Lead</p>
                  <p className="text-xs text-gray-500">Interest captured</p>
                </div>
              </div>
              <div className="h-px flex-1 bg-green-300 mx-4"></div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium text-gray-900">Evaluate</p>
                  <p className="text-xs text-gray-500">Viability checked</p>
                </div>
              </div>
              <div className="h-px flex-1 bg-green-300 mx-4"></div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium text-gray-900">Commit</p>
                  <p className="text-xs text-gray-500">Authority approved</p>
                </div>
              </div>
              <div className="h-px flex-1 bg-green-300 mx-4"></div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold">
                  4
                </div>
                <div>
                  <p className="font-medium text-gray-900">Contract</p>
                  <p className="text-xs text-gray-500">Legal frozen</p>
                </div>
              </div>
              <div className="h-px flex-1 bg-green-300 mx-4"></div>
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${isCompleted ? "bg-green-500" : "bg-teal-500"}`}
                >
                  5
                </div>
                <div>
                  <p className="font-medium text-gray-900">Handoff</p>
                  <p className="text-xs text-gray-500">
                    {isCompleted ? "Completed" : "In progress"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueHandoff;
