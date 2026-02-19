import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Truck, ArrowLeft, Edit, Trash2 } from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const OrdersDetail = () => {
  const { po_id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [po_id]);

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/modules/procurement/orders/${po_id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      if (data.success) setOrder(data.order);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this order?")) return;
    const token = localStorage.getItem("access_token");
    await fetch(`${API_URL}/api/commerce/modules/procurement/orders/${po_id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    navigate("/commerce/procure/orders");
  };

  const statusColors = {
    draft: "bg-gray-100 text-gray-700",
    issued: "bg-blue-100 text-blue-700",
    acknowledged: "bg-purple-100 text-purple-700",
    shipped: "bg-yellow-100 text-yellow-700",
    received: "bg-green-100 text-green-700",
    completed: "bg-green-100 text-green-700",
  };

  if (loading)
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#033F99] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  if (!order)
    return (
      <div className="p-6 text-center">
        <p>Not found</p>
        <Link to="/commerce/procure/orders" className="text-[#033F99]">
          Back
        </Link>
      </div>
    );

  return (
    <div className="p-6" data-testid="orders-detail">
      <div className="mb-6">
        <Link
          to="/commerce/procure/orders"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#033F99]/10 rounded-xl flex items-center justify-center">
              <Truck className="w-6 h-6 text-[#033F99]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-mono">
                {order.po_number}
              </h1>
              <p className="text-sm text-gray-500">{order.po_id}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/commerce/procure/orders/${po_id}/edit`)}
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
          <h2 className="text-lg font-semibold mb-4">Order Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Vendor</p>
              <p className="font-semibold">{order.vendor_name || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Value</p>
              <p className="text-2xl font-bold text-[#033F99]">
                ₹{order.total_value?.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Order Date</p>
              <p className="font-semibold">{order.order_date || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Expected Delivery</p>
              <p className="font-semibold">{order.expected_delivery || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Payment Terms</p>
              <p className="font-semibold">{order.payment_terms || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">PR Reference</p>
              <p className="font-mono text-sm">{order.pr_id || "-"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-500">Shipping Address</p>
              <p className="text-gray-700">{order.shipping_address || "-"}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4">Status</h2>
          <span
            className={`px-3 py-1 rounded-lg text-sm font-semibold capitalize ${statusColors[order.status] || "bg-gray-100"}`}
          >
            {order.status}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrdersDetail;
