import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ShoppingCart, ArrowLeft, Edit, Trash2 } from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ProcurementDetail = () => {
  const { pr_id } = useParams();
  const navigate = useNavigate();
  const [pr, setPr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPR();
  }, [pr_id]);

  const fetchPR = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/modules/procurement/requests/${pr_id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      if (data.success) setPr(data.request);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this purchase request?")) return;
    const token = localStorage.getItem("access_token");
    await fetch(
      `${API_URL}/api/commerce/modules/procurement/requests/${pr_id}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
    );
    navigate("/commerce/procure");
  };

  const statusColors = {
    draft: "bg-gray-100 text-gray-700",
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };
  const priorityColors = {
    low: "bg-blue-100 text-blue-700",
    medium: "bg-yellow-100 text-yellow-700",
    high: "bg-orange-100 text-orange-700",
    urgent: "bg-red-100 text-red-700",
  };

  if (loading)
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#033F99] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  if (!pr)
    return (
      <div className="p-6 text-center">
        <p>Not found</p>
        <Link to="/commerce/procure" className="text-[#033F99]">
          Back
        </Link>
      </div>
    );

  return (
    <div className="p-6" data-testid="procurement-detail">
      <div className="mb-6">
        <Link
          to="/commerce/procure"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#033F99]/10 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-[#033F99]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{pr.title}</h1>
              <p className="text-sm text-gray-500 font-mono">{pr.pr_number}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/commerce/procure/${pr_id}/edit`)}
              className="flex items-center gap-2 px-4 py-2.5 border rounded-xl hover:bg-gray-50"
            >
              <Edit className="w-4 h-4" /> Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 rounded-xl hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4">Request Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Requester</p>
              <p className="font-semibold">{pr.requester || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Department</p>
              <p className="font-semibold">{pr.department || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Estimated Value</p>
              <p className="text-2xl font-bold">
                {pr.currency || "₹"}
                {pr.estimated_value?.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Required By</p>
              <p className="font-semibold">{pr.required_by || "-"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-500">Description</p>
              <p className="text-gray-700">{pr.description || "-"}</p>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">Status</h2>
            <span
              className={`px-3 py-1 rounded-lg text-sm font-semibold capitalize ${statusColors[pr.status] || "bg-gray-100"}`}
            >
              {pr.status}
            </span>
          </div>
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">Priority</h2>
            <span
              className={`px-3 py-1 rounded-lg text-sm font-semibold capitalize ${priorityColors[pr.priority] || "bg-gray-100"}`}
            >
              {pr.priority}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcurementDetail;
