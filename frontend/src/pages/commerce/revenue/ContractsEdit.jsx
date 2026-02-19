import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FileText, Save, ArrowLeft } from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ContractsEdit = () => {
  const { contract_id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    customer_name: "",
    customer_id: "",
    contract_type: "service",
    value: 0,
    start_date: "",
    end_date: "",
    payment_terms: "",
    auto_renew: false,
    status: "draft",
  });

  useEffect(() => {
    fetchContract();
  }, [contract_id]);

  const fetchContract = async () => {
    const token = localStorage.getItem("access_token");
    const res = await fetch(
      `${API_URL}/api/commerce/modules/revenue/contracts/${contract_id}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const data = await res.json();
    if (data.success)
      setFormData({
        name: data.contract.name || "",
        customer_name: data.contract.customer_name || "",
        customer_id: data.contract.customer_id || "",
        contract_type: data.contract.contract_type || "service",
        value: data.contract.value || 0,
        start_date: data.contract.start_date || "",
        end_date: data.contract.end_date || "",
        payment_terms: data.contract.payment_terms || "",
        auto_renew: data.contract.auto_renew || false,
        status: data.contract.status || "draft",
      });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "value"
            ? parseFloat(value) || 0
            : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("access_token");
    const res = await fetch(
      `${API_URL}/api/commerce/modules/revenue/contracts/${contract_id}`,
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
      navigate(`/commerce/revenue/contracts/${contract_id}`);
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto" data-testid="contracts-edit">
      <div className="mb-6">
        <Link
          to={`/commerce/revenue/contracts/${contract_id}`}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <h1 className="text-2xl font-bold">Edit Contract</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#033F99]" /> Contract Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Contract Name *
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
                Customer Name
              </label>
              <input
                type="text"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                name="contract_type"
                value={formData.contract_type}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border rounded-xl"
              >
                <option value="service">Service</option>
                <option value="subscription">Subscription</option>
                <option value="license">License</option>
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
              <label className="block text-sm font-medium mb-1">
                Payment Terms
              </label>
              <input
                type="text"
                name="payment_terms"
                value={formData.payment_terms}
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
                <option value="expired">Expired</option>
                <option value="pending_renewal">Pending Renewal</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="auto_renew"
                checked={formData.auto_renew}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <label className="text-sm font-medium">Auto Renew</label>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() =>
              navigate(`/commerce/revenue/contracts/${contract_id}`)
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

export default ContractsEdit;
