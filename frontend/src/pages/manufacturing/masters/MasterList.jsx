import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaPlus, FaEdit, FaTrash, FaArrowLeft } from "react-icons/fa";

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Master metadata for display
const MASTER_METADATA = {
  "customer-groups": { title: "Customer Groups", icon: "🏢" },
  "customer-categories": { title: "Customer Categories", icon: "📊" },
  vendors: { title: "Vendors", icon: "🛒" },
  tooling: { title: "Tooling & Molds", icon: "🔧" },
  "work-centers": { title: "Work Centers", icon: "⚙️" },
  "surface-finishes": { title: "Surface Finishes", icon: "✨" },
  "heat-treatments": { title: "Heat Treatments", icon: "🔥" },
  shifts: { title: "Shifts", icon: "🕐" },
  "scrap-codes": { title: "Scrap Codes", icon: "♻️" },
  transporters: { title: "Transporters", icon: "🚚" },
  "loss-reasons": { title: "Loss Reasons", icon: "📉" },
  "risk-codes": { title: "Risk Codes", icon: "⚠️" },
};

const MasterList = () => {
  const { masterType } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const metadata = MASTER_METADATA[masterType] || {
    title: masterType,
    icon: "📋",
  };

  useEffect(() => {
    fetchMasters();
  }, [masterType]);

  const fetchMasters = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/manufacturing/phase2/masters/${masterType}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error("Error fetching masters:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderValue = (value) => {
    if (typeof value === "boolean") return value ? "✓" : "✗";
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "object" && value !== null)
      return JSON.stringify(value);
    if (value === null || value === undefined) return "-";
    return String(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F5FF] via-white to-[#F0F5FF]/50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/commerce/manufacturing/masters")}
            className="text-[#033F99] hover:text-[#0147CC] flex items-center gap-2 mb-4 font-semibold"
          >
            <FaArrowLeft /> Back to Masters
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#033F99] flex items-center gap-3">
                <span className="text-4xl">{metadata.icon}</span>
                {metadata.title}
              </h1>
              <p className="text-slate-600 mt-1">Total: {total} items</p>
            </div>
            <button
              onClick={() =>
                navigate(`/commerce/manufacturing/masters/${masterType}/create`)
              }
              className="bg-gradient-to-r from-[#033F99] to-[#0147CC] text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2 font-semibold"
            >
              <FaPlus /> Add New
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border-2 border-[#033F99]/20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#033F99] mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border-2 border-[#033F99]/20">
            <p className="text-slate-500 text-lg">
              No items found. Click "Add New" to create one.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-[#033F99]/20">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-gradient-to-r from-[#033F99] to-[#0147CC]">
                  <tr>
                    {items.length > 0 &&
                      Object.keys(items[0])
                        .filter(
                          (key) =>
                            !["_id", "id", "created_at", "updated_at"].includes(
                              key,
                            ),
                        )
                        .map((key) => (
                          <th
                            key={key}
                            className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider"
                          >
                            {key.replace(/_/g, " ")}
                          </th>
                        ))}
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {items.map((item, index) => (
                    <tr
                      key={item.id || index}
                      className="hover:bg-[#F0F5FF] transition-colors"
                    >
                      {Object.entries(item)
                        .filter(
                          ([key]) =>
                            !["_id", "id", "created_at", "updated_at"].includes(
                              key,
                            ),
                        )
                        .map(([key, value]) => (
                          <td
                            key={key}
                            className="px-6 py-4 whitespace-nowrap text-sm text-slate-700"
                          >
                            {renderValue(value)}
                          </td>
                        ))}
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              navigate(
                                `/commerce/manufacturing/masters/${masterType}/${item.id}/edit`,
                              )
                            }
                            className="text-[#033F99] hover:text-[#0147CC] font-semibold"
                          >
                            <FaEdit />
                          </button>
                          <button className="text-red-600 hover:text-red-800 font-semibold">
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MasterList;
