import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FileCheck, ArrowLeft, Edit, Trash2 } from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ProcureCommitsDetail = () => {
  const { commit_id } = useParams();
  const navigate = useNavigate();
  const [commit, setCommit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommit();
  }, [commit_id]);

  const fetchCommit = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/modules/procurement/commits/${commit_id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      if (data.success) setCommit(data.commit);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this commitment?")) return;
    const token = localStorage.getItem("access_token");
    await fetch(
      `${API_URL}/api/commerce/modules/procurement/commits/${commit_id}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
    );
    navigate("/commerce/procure/commit");
  };

  const statusColors = {
    draft: "bg-gray-100 text-gray-700",
    pending: "bg-yellow-100 text-yellow-700",
    active: "bg-green-100 text-green-700",
    negotiating: "bg-blue-100 text-blue-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  if (loading)
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#033F99] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  if (!commit)
    return (
      <div className="p-6 text-center">
        <p>Not found</p>
        <Link to="/commerce/procure/commit" className="text-[#033F99]">
          Back
        </Link>
      </div>
    );

  return (
    <div className="p-6" data-testid="procure-commits-detail">
      <div className="mb-6">
        <Link
          to="/commerce/procure/commit"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#033F99]/10 rounded-xl flex items-center justify-center">
              <FileCheck className="w-6 h-6 text-[#033F99]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{commit.name}</h1>
              <p className="text-sm text-gray-500">{commit.commit_id}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() =>
                navigate(`/commerce/procure/commit/${commit_id}/edit`)
              }
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
          <h2 className="text-lg font-semibold mb-4">Commitment Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">PR Reference</p>
              <p className="font-mono">{commit.pr_id || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Type</p>
              <p className="font-semibold capitalize">
                {commit.commit_type?.replace("_", " ") || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Validity Period</p>
              <p className="font-semibold">{commit.validity_days || 0} days</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p className="text-sm">
                {commit.created_at
                  ? new Date(commit.created_at).toLocaleDateString()
                  : "-"}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-500">Terms & Conditions</p>
              <p className="text-gray-700">{commit.terms || "-"}</p>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">Value</h2>
            <p className="text-3xl font-bold text-[#033F99]">
              ₹{commit.value?.toLocaleString() || "0"}
            </p>
          </div>
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">Status</h2>
            <span
              className={`px-3 py-1 rounded-lg text-sm font-semibold capitalize ${statusColors[commit.status] || "bg-gray-100"}`}
            >
              {commit.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcureCommitsDetail;
