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
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ProcureHandoff = () => {
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
        `${API_URL}/api/commerce/workflow/procure/handoffs/${handoff_id}`,
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
        `${API_URL}/api/commerce/workflow/procure/handoffs/${handoff_id}/complete`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) {
        toast.success("Handoff completed - Procurement workflow finished!");
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
    <div className="min-h-screen bg-gray-50" data-testid="procure-handoff">
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
              Procurement Workflow → Handoff
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
                  Procurement Workflow Completed!
                </h3>
                <p className="text-sm text-green-600">
                  This procurement has been successfully handed off to
                  Operations and Finance for execution.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Operations Handoff */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-gray-500" />
                  <h2 className="text-lg font-medium text-gray-900">
                    Operations Handoff
                  </h2>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Data for receiving, inventory, and logistics teams
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Delivery Terms</p>
                    <p className="text-gray-900">
                      {handoff.operations_data?.delivery_terms ||
                        "Standard delivery"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">
                      Scope / Items to Receive
                    </p>
                    {handoff.operations_data?.scope &&
                      handoff.operations_data.scope.length > 0 ? (
                      <ul className="space-y-2">
                        {handoff.operations_data.scope.map((item, i) => (
                          <li
                            key={i}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <span className="text-gray-900">
                              {item.description || `Item ${i + 1}`}
                            </span>
                            <span className="text-gray-600">
                              Qty: {item.quantity || 1}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 italic">No items specified</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Finance Handoff */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-gray-500" />
                  <h2 className="text-lg font-medium text-gray-900">
                    Finance Handoff
                  </h2>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Data for accounts payable and budget tracking
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Value</p>
                    <p className="text-xl font-bold text-gray-900">
                      ₹
                      {(
                        handoff.finance_data?.total_value ||
                        handoff.total_value ||
                        0
                      ).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Payment Terms</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {handoff.finance_data?.payment_terms || "Net 30"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Items */}
            {handoff.items && handoff.items.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Items</h2>
                </div>
                <div className="p-6">
                  <table className="w-full">
                    <thead>
                      <tr className="text-xs font-semibold text-gray-500 uppercase">
                        <th className="pb-3 text-left">Description</th>
                        <th className="pb-3 text-center">Qty</th>
                        <th className="pb-3 text-right">Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {handoff.items.map((item, index) => (
                        <tr
                          key={item.id || item.description || `item-${index}`}
                        >
                          <td className="py-3 text-sm text-gray-900">
                            {item.description || `Item ${index + 1}`}
                          </td>
                          <td className="py-3 text-sm text-center text-gray-600">
                            {item.quantity || 1}
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
            {/* Summary */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-gray-500" />
                  <h2 className="text-lg font-medium text-gray-900">Summary</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{(handoff.total_value || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Vendor ID</p>
                  <p className="font-medium text-gray-900">
                    {handoff.vendor_id || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Contract ID</p>
                  <p className="font-medium text-[#033F99]">
                    {handoff.contract_id}
                  </p>
                </div>
                {handoff.completed_at && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Completed On</p>
                    <p className="font-medium text-green-600">
                      {new Date(handoff.completed_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Workflow Complete */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Workflow Progress
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {[
                    "1. Procure Request",
                    "2. Evaluation",
                    "3. Commit",
                    "4. Contract",
                  ].map((step, i) => (
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
                  ))}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center ${isCompleted ? "bg-green-500" : "bg-yellow-500"}`}
                    >
                      {isCompleted ? (
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
                      className={`text-sm font-medium ${isCompleted ? "text-green-600" : "text-yellow-600"}`}
                    >
                      5. Handoff {isCompleted ? "(Complete)" : "(Current)"}
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

export default ProcureHandoff;
