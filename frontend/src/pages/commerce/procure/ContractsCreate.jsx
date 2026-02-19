import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FileText, Save, ArrowLeft } from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ProcureContractsCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    contract_name: "",
    vendor_id: "",
    contract_type: "service",
    value: 0,
    start_date: "",
    end_date: "",
    terms: "",
    status: "draft",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "value" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("access_token");
    const res = await fetch(
      `${API_URL}/api/commerce/modules/procurement/contracts`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      },
    );
    if ((await res.json()).success) navigate("/commerce/procure/contract");
    setLoading(false);
  };

  return (
    <div
      className="p-6 max-w-4xl mx-auto"
      data-testid="procure-contracts-create"
    >
      <div className="mb-6">
        <Link
          to="/commerce/procure/contract"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <h1 className="text-2xl font-bold">New Vendor Contract</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#033F99]" /> Contract Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Contract Name *
              </label>
              <input
                type="text"
                name="contract_name"
                value={formData.contract_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border rounded-xl"
                placeholder="AWS Enterprise Agreement"
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
                placeholder="VEND-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Contract Type
              </label>
              <select
                name="contract_type"
                value={formData.contract_type}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border rounded-xl"
              >
                <option value="service">Service</option>
                <option value="supply">Supply</option>
                <option value="license">License</option>
                <option value="maintenance">Maintenance</option>
                <option value="consulting">Consulting</option>
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
              <label className="block text-sm font-medium mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
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
                <option value="active">Active</option>
                <option value="pending_renewal">Pending Renewal</option>
                <option value="expired">Expired</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Terms & Conditions
              </label>
              <textarea
                name="terms"
                value={formData.terms}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 border rounded-xl"
                placeholder="Volume pricing with SLA guarantees..."
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/commerce/procure/contract")}
            className="px-6 py-2.5 border rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#033F99] text-white rounded-xl font-semibold disabled:opacity-50"
          >
            <Save className="w-4 h-4" />{" "}
            {loading ? "Creating..." : "Create Contract"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProcureContractsCreate;
