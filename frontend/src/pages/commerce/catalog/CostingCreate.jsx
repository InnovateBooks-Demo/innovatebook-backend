import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Calculator, Save, ArrowLeft } from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const CostingCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    costing_method: "standard",
    material_cost: 0,
    labor_cost: 0,
    overhead_cost: 0,
    total_cost: 0,
    status: "active",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numFields = ["material_cost", "labor_cost", "overhead_cost"];
    const newData = {
      ...formData,
      [name]: numFields.includes(name) ? parseFloat(value) || 0 : value,
    };
    if (numFields.includes(name))
      newData.total_cost =
        newData.material_cost + newData.labor_cost + newData.overhead_cost;
    setFormData(newData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/modules/catalog/costing`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        },
      );
      const data = await res.json();
      if (data.success) navigate("/commerce/catalog/costing");
    } catch (error) {
      alert("Failed to create");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto" data-testid="costing-create">
      <div className="mb-6">
        <Link
          to="/commerce/catalog/costing"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create Cost Record</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#033F99]" /> Cost Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Costing Method
              </label>
              <select
                name="costing_method"
                value={formData.costing_method}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
              >
                <option value="standard">Standard</option>
                <option value="actual">Actual</option>
                <option value="average">Average</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Material Cost (₹)
              </label>
              <input
                type="number"
                name="material_cost"
                value={formData.material_cost}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Labor Cost (₹)
              </label>
              <input
                type="number"
                name="labor_cost"
                value={formData.labor_cost}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Overhead Cost (₹)
              </label>
              <input
                type="number"
                name="overhead_cost"
                value={formData.overhead_cost}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Cost (₹)
              </label>
              <input
                type="number"
                value={formData.total_cost}
                readOnly
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/commerce/catalog/costing")}
            className="px-6 py-2.5 border border-gray-200 rounded-xl"
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

export default CostingCreate;
