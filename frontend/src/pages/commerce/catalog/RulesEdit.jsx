import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Shield, Save, ArrowLeft } from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const RulesEdit = () => {
  const { rule_id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    rule_name: "",
    rule_type: "pricing",
    condition: "",
    action: "",
    priority: 1,
    description: "",
    status: "active",
  });

  useEffect(() => {
    fetchRule();
  }, [rule_id]);

  const fetchRule = async () => {
    const token = localStorage.getItem("access_token");
    const res = await fetch(
      `${API_URL}/api/commerce/modules/catalog/rules/${rule_id}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const data = await res.json();
    if (data.success)
      setFormData({
        rule_name: data.rule.rule_name || "",
        rule_type: data.rule.rule_type || "pricing",
        condition: data.rule.condition || "",
        action: data.rule.action || "",
        priority: data.rule.priority || 1,
        description: data.rule.description || "",
        status: data.rule.status || "active",
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "priority" ? parseInt(value) || 1 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("access_token");
    const res = await fetch(
      `${API_URL}/api/commerce/modules/catalog/rules/${rule_id}`,
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
      navigate(`/commerce/catalog/rules/${rule_id}`);
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto" data-testid="rules-edit">
      <div className="mb-6">
        <Link
          to={`/commerce/catalog/rules/${rule_id}`}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <h1 className="text-2xl font-bold">Edit Rule</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#033F99]" /> Rule Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Rule Name *
              </label>
              <input
                type="text"
                name="rule_name"
                value={formData.rule_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                name="rule_type"
                value={formData.rule_type}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border rounded-xl"
              >
                <option value="pricing">Pricing</option>
                <option value="discount">Discount</option>
                <option value="approval">Approval</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <input
                type="number"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                min="1"
                max="10"
                className="w-full px-4 py-2.5 border rounded-xl"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Condition
              </label>
              <input
                type="text"
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border rounded-xl font-mono"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Action</label>
              <input
                type="text"
                name="action"
                value={formData.action}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border rounded-xl"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(`/commerce/catalog/rules/${rule_id}`)}
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

export default RulesEdit;
