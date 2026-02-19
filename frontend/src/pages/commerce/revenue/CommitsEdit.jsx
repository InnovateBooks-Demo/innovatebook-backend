import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Target, Save, ArrowLeft } from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const CommitsEdit = () => {
  const { commit_id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    commit_type: "revenue",
    value: 0,
    quarter: "",
    year: new Date().getFullYear(),
    probability: 50,
    owner: "",
    status: "draft",
  });

  useEffect(() => {
    fetchCommit();
  }, [commit_id]);

  const fetchCommit = async () => {
    const token = localStorage.getItem("access_token");
    const res = await fetch(
      `${API_URL}/api/commerce/modules/revenue/commits/${commit_id}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const data = await res.json();
    if (data.success)
      setFormData({
        name: data.commit.name || "",
        commit_type: data.commit.commit_type || "revenue",
        value: data.commit.value || 0,
        quarter: data.commit.quarter || "",
        year: data.commit.year || new Date().getFullYear(),
        probability: data.commit.probability || 50,
        owner: data.commit.owner || "",
        status: data.commit.status || "draft",
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["value", "probability", "year"].includes(name)
        ? parseFloat(value) || 0
        : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("access_token");
    const res = await fetch(
      `${API_URL}/api/commerce/modules/revenue/commits/${commit_id}`,
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
      navigate(`/commerce/revenue/commits/${commit_id}`);
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto" data-testid="commits-edit">
      <div className="mb-6">
        <Link
          to={`/commerce/revenue/commits/${commit_id}`}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <h1 className="text-2xl font-bold">Edit Commit</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-[#033F99]" /> Commit Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Name *</label>
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
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                name="commit_type"
                value={formData.commit_type}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border rounded-xl"
              >
                <option value="revenue">Revenue</option>
                <option value="booking">Booking</option>
                <option value="pipeline">Pipeline</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Value (₹)
              </label>
              <input
                type="number"
                name="value"
                value={formData.value}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Quarter</label>
              <select
                name="quarter"
                value={formData.quarter}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border rounded-xl"
              >
                <option value="">Select</option>
                <option value="Q1">Q1</option>
                <option value="Q2">Q2</option>
                <option value="Q3">Q3</option>
                <option value="Q4">Q4</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Probability (%)
              </label>
              <input
                type="number"
                name="probability"
                value={formData.probability}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Owner</label>
              <input
                type="text"
                name="owner"
                value={formData.owner}
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
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(`/commerce/revenue/commits/${commit_id}`)}
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

export default CommitsEdit;
