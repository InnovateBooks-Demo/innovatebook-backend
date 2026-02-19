import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Truck, Plus, Search, RefreshCw, Eye, Edit } from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const OrdersList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/modules/procurement/orders`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      if (data.success) setOrders(data.orders || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((item) => {
    const matchSearch =
      !searchTerm ||
      item.po_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = !statusFilter || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statuses = [
    "draft",
    "issued",
    "acknowledged",
    "shipped",
    "received",
    "completed",
    "cancelled",
  ];
  const statusColors = {
    draft: "bg-gray-100 text-gray-700",
    issued: "bg-blue-100 text-blue-700",
    acknowledged: "bg-purple-100 text-purple-700",
    shipped: "bg-yellow-100 text-yellow-700",
    received: "bg-green-100 text-green-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };
  const totalValue = orders.reduce((sum, o) => sum + (o.total_value || 0), 0);

  return (
    <div className="p-6 space-y-6" data-testid="orders-list">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage purchase orders to vendors
          </p>
        </div>
        <Link to="/commerce/procure/orders/create">
          <button
            className="flex items-center gap-2 bg-[#033F99] text-white px-4 py-2.5 rounded-xl hover:bg-[#033F99] font-semibold text-sm"
            data-testid="new-order-btn"
          >
            <Plus className="h-4 w-4" />
            New PO
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold mt-1">{orders.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Value</p>
              <p className="text-2xl font-bold mt-1">
                ₹{(totalValue / 100000).toFixed(1)}L
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <Truck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">In Transit</p>
              <p className="text-2xl font-bold mt-1">
                {orders.filter((o) => o.status === "shipped").length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
              <Truck className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold mt-1">
                {orders.filter((o) => o.status === "completed").length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <Truck className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border rounded-xl"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border rounded-xl min-w-[150px]"
        >
          <option value="">All Status</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
        <button
          onClick={fetchOrders}
          className="p-2.5 border rounded-xl hover:bg-gray-50"
        >
          <RefreshCw className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                PO Number
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                Vendor
              </th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                Value
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                Order Date
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                Delivery Date
              </th>
              <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                Status
              </th>
              <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                  Loading...
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400">
                  <Truck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No orders found</p>
                </td>
              </tr>
            ) : (
              filteredOrders.map((item) => (
                <tr
                  key={item.po_id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() =>
                    navigate(`/commerce/procure/orders/${item.po_id}`)
                  }
                >
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900 font-mono">
                      {item.po_number}
                    </p>
                    <p className="text-xs text-gray-500">{item.po_id}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {item.vendor_name || "-"}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold">
                    ₹{item.total_value?.toLocaleString() || "0"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {item.order_date || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {item.expected_delivery || item.delivery_date || "-"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${statusColors[item.status] || "bg-gray-100"}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td
                    className="px-6 py-4 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() =>
                          navigate(`/commerce/procure/orders/${item.po_id}`)
                        }
                        className="p-1.5 hover:bg-gray-100 rounded-lg"
                      >
                        <Eye className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() =>
                          navigate(
                            `/commerce/procure/orders/${item.po_id}/edit`,
                          )
                        }
                        className="p-1.5 hover:bg-gray-100 rounded-lg"
                      >
                        <Edit className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersList;
