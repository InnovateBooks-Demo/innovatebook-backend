import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShoppingCart, Save, ArrowLeft } from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ProcurementCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    pr_number: "",
    title: "",
    description: "",
    requester: "",
    department: "",
    priority: "medium",
    estimated_value: 0,
    currency: "INR",
    required_by: "",
    status: "draft",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "estimated_value" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/modules/procurement/requests`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        },
      );
      if ((await res.json()).success) navigate("/commerce/procure");
    } catch (error) {
      alert("Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto" data-testid="procurement-create">
      <div className="mb-6">
        <Link
          to="/commerce/procure"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <h1 className="text-2xl font-bold">Create Purchase Request</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#033F99]" /> Request
            Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                PR Number *
              </label>
              <input
                type="text"
                name="pr_number"
                value={formData.pr_number}
                onChange={handleChange}
                required
                placeholder="PR-2024-001"
                className="w-full px-4 py-2.5 border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
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
              <label className="block text-sm font-medium mb-1">
                Requester
              </label>
              <input
                type="text"
                name="requester"
                value={formData.requester}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Department
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border rounded-xl"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Estimated Value
              </label>
              <input
                type="number"
                name="estimated_value"
                value={formData.estimated_value}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2.5 border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Required By
              </label>
              <input
                type="date"
                name="required_by"
                value={formData.required_by}
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
            onClick={() => navigate("/commerce/procure")}
            className="px-6 py-2.5 border rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#033F99] text-white rounded-xl font-semibold disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProcurementCreate;
