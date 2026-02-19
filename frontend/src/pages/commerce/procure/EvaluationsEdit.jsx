import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ClipboardCheck, Save, ArrowLeft } from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ProcureEvaluationsEdit = () => {
  const { evaluation_id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    pr_id: "",
    vendor_id: "",
    evaluation_type: "vendor",
    evaluation_criteria: "",
    score: 0,
    evaluator: "",
    status: "pending",
  });

  useEffect(() => {
    fetchEvaluation();
  }, [evaluation_id]);

  const fetchEvaluation = async () => {
    const token = localStorage.getItem("access_token");
    const res = await fetch(
      `${API_URL}/api/commerce/modules/procurement/evaluations/${evaluation_id}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const data = await res.json();
    if (data.success)
      setFormData({
        name: data.evaluation.name || "",
        pr_id: data.evaluation.pr_id || "",
        vendor_id: data.evaluation.vendor_id || "",
        evaluation_type: data.evaluation.evaluation_type || "vendor",
        evaluation_criteria: data.evaluation.evaluation_criteria || "",
        score: data.evaluation.score || 0,
        evaluator: data.evaluation.evaluator || "",
        status: data.evaluation.status || "pending",
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "score" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("access_token");
    const res = await fetch(
      `${API_URL}/api/commerce/modules/procurement/evaluations/${evaluation_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      },
    );
    if ((await res.json()).success)
      navigate(`/commerce/procure/evaluate/${evaluation_id}`);
    setLoading(false);
  };

  return (
    <div
      className="p-6 max-w-4xl mx-auto"
      data-testid="procure-evaluations-edit"
    >
      <div className="mb-6">
        <Link
          to={`/commerce/procure/evaluate/${evaluation_id}`}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <h1 className="text-2xl font-bold">Edit Vendor Evaluation</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-[#033F99]" /> Evaluation
            Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Evaluation Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                PR Reference
              </label>
              <input
                type="text"
                name="pr_id"
                value={formData.pr_id}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Vendor ID
              </label>
              <input
                type="text"
                name="vendor_id"
                value={formData.vendor_id}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Evaluation Type
              </label>
              <select
                name="evaluation_type"
                value={formData.evaluation_type}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border rounded-xl"
              >
                <option value="vendor">Vendor Assessment</option>
                <option value="technical">Technical Review</option>
                <option value="commercial">Commercial Review</option>
                <option value="compliance">Compliance Check</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Score (0-100)
              </label>
              <input
                type="number"
                name="score"
                value={formData.score}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full px-4 py-2.5 border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Evaluator
              </label>
              <input
                type="text"
                name="evaluator"
                value={formData.evaluator}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border rounded-xl"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Evaluation Criteria
              </label>
              <textarea
                name="evaluation_criteria"
                value={formData.evaluation_criteria}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 border rounded-xl"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() =>
              navigate(`/commerce/procure/evaluate/${evaluation_id}`)
            }
            className="px-6 py-2.5 border rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#033F99] text-white rounded-xl font-semibold disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProcureEvaluationsEdit;
