import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Send,
  ArrowLeft,
  Loader2,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ProcureHandoffsList = () => {
  const navigate = useNavigate();
  const [handoffs, setHandoffs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHandoffs();
  }, []);

  const fetchHandoffs = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/workflow/procure/handoffs`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) setHandoffs(data.handoffs || []);
    } catch (error) {
      toast.error("Failed to fetch handoffs");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-700",
      completed: "bg-green-100 text-green-700",
    };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#033F99]" />
      </div>
    );

  return (
    <div
      className="min-h-screen bg-gray-50"
      data-testid="procure-handoffs-list"
    >
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate("/commerce/procure-workflow/contracts")}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-500">
              Procurement Workflow → Handoff
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center">
              <Send className="h-7 w-7 text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Procurement Handoffs
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Stage 5 of Procurement Workflow - Handoff to Finance (Pay &
                Spend)
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="px-8 py-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-100 text-gray-700 rounded-xl p-4">
            <p className="text-xs font-medium uppercase">Total</p>
            <p className="text-2xl font-bold mt-1">{handoffs.length}</p>
          </div>
          <div className="bg-yellow-100 text-yellow-700 rounded-xl p-4">
            <p className="text-xs font-medium uppercase">Pending</p>
            <p className="text-2xl font-bold mt-1">
              {handoffs.filter((h) => h.status === "pending").length}
            </p>
          </div>
          <div className="bg-green-100 text-green-700 rounded-xl p-4">
            <p className="text-xs font-medium uppercase">Completed</p>
            <p className="text-2xl font-bold mt-1">
              {handoffs.filter((h) => h.status === "completed").length}
            </p>
          </div>
        </div>
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-teal-600" />
            <div>
              <p className="font-semibold text-teal-800">
                Procurement Workflow Complete
              </p>
              <p className="text-sm text-teal-600">
                Completed handoffs are sent to IB Finance for Payment & Spend
                tracking
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Handoff ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Contract
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Vendor
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">
                  Value
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {handoffs.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No handoffs yet.
                  </td>
                </tr>
              ) : (
                handoffs.map((handoff) => (
                  <tr
                    key={handoff.handoff_id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      navigate(
                        `/commerce/procure-workflow/handoffs/${handoff.handoff_id}`,
                      )
                    }
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-[#033F99]">
                        {handoff.handoff_id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {handoff.contract_id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">
                        {handoff.vendor_id || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-gray-900">
                        ₹{(handoff.total_value || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(handoff.status)}`}
                      >
                        {handoff.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProcureHandoffsList;
