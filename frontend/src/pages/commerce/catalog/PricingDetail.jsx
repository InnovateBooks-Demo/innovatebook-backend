import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { DollarSign, ArrowLeft, Edit, Trash2 } from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PricingDetail = () => {
  const { pricing_id } = useParams();
  const navigate = useNavigate();
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPricing();
  }, [pricing_id]);

  const fetchPricing = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/modules/catalog/pricing/${pricing_id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      if (data.success) setPricing(data.pricing);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this pricing rule?")) return;
    try {
      const token = localStorage.getItem("access_token");
      await fetch(
        `${API_URL}/api/commerce/modules/catalog/pricing/${pricing_id}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
      );
      navigate("/commerce/catalog/pricing");
    } catch (error) {
      alert("Failed to delete");
    }
  };

  if (loading)
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#033F99] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  if (!pricing)
    return (
      <div className="p-6 text-center">
        <p>Pricing not found</p>
        <Link to="/commerce/catalog/pricing" className="text-[#033F99]">
          Back
        </Link>
      </div>
    );

  return (
    <div className="p-6" data-testid="pricing-detail">
      <div className="mb-6">
        <Link
          to="/commerce/catalog/pricing"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#033F99]/10 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-[#033F99]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {pricing.name}
              </h1>
              <p className="text-sm text-gray-500">{pricing.pricing_id}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() =>
                navigate(`/commerce/catalog/pricing/${pricing_id}/edit`)
              }
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50"
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
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Pricing Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Type</p>
              <p className="font-semibold capitalize">
                {pricing.price_list_type}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Currency</p>
              <p className="font-semibold">{pricing.currency}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Base Price</p>
              <p className="text-2xl font-bold">
                ₹{pricing.base_price?.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Discount</p>
              <p className="text-2xl font-bold text-green-600">
                {pricing.discount_percent}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Valid From</p>
              <p className="font-semibold">{pricing.valid_from || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Valid To</p>
              <p className="font-semibold">{pricing.valid_to || "-"}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Status</h2>
          <span
            className={`px-3 py-1 rounded-lg text-sm font-semibold capitalize ${pricing.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
          >
            {pricing.status}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PricingDetail;
