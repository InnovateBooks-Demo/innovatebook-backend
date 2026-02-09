import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Package,
  Users,
  ArrowLeft,
  Search,
  Plus,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { authService } from "../../../utils/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ResourcesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [inventory, setInventory] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(
    location.pathname.includes("/inventory") ? "inventory" : "resources",
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = authService.getToken();
      const [invRes, resRes] = await Promise.all([
        fetch(`${API_URL}/api/operations/inventory`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/operations/resources`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      if (invRes.ok) {
        const invData = await invRes.json();
        setInventory(invData.data || []);
      }
      if (resRes.ok) {
        const resData = await resRes.json();
        setResources(resData.data || []);
      }
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-green-100 text-green-700",
      available: "bg-green-100 text-green-700",
      restricted: "bg-yellow-100 text-yellow-700",
      partially_allocated: "bg-blue-100 text-blue-700",
      unavailable: "bg-red-100 text-red-700",
      fully_allocated: "bg-purple-100 text-purple-700",
    };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="resources-page">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate("/operations")}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-500">
              Operations → Resources
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center">
              <Package className="h-7 w-7 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Resources
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Consumption & capacity control
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-8 flex gap-1 border-t border-gray-100">
          <button
            onClick={() => setActiveTab("inventory")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "inventory"
                ? "border-orange-600 text-orange-600"
                : "border-transparent text-gray-500"
            }`}
          >
            <Package className="h-4 w-4" />
            Inventory
          </button>
          <button
            onClick={() => setActiveTab("resources")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "resources"
                ? "border-orange-600 text-orange-600"
                : "border-transparent text-gray-500"
            }`}
          >
            <Users className="h-4 w-4" />
            Resources
          </button>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Inventory Tab */}
        {activeTab === "inventory" && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Inventory Items
              </h3>
              <span className="text-sm text-gray-500">
                {inventory.length} items
              </span>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                    Available
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                    Reserved
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inventory.map((item) => (
                  <tr key={item.inventory_item_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.inventory_item_id}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded capitalize">
                        {item.inventory_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-gray-900">
                      {item.available_quantity} {item.unit_of_measure}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">
                      {item.reserved_quantity} {item.unit_of_measure}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(item.status)}`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {inventory.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                No inventory items
              </div>
            )}
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === "resources" && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Resources</h3>
              <span className="text-sm text-gray-500">
                {resources.length} resources
              </span>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Resource
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Skills
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                    Availability
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {resources.map((res) => (
                  <tr key={res.resource_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{res.name}</p>
                      <p className="text-xs text-gray-500">{res.resource_id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded capitalize">
                        {res.resource_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {res.skill_tags?.slice(0, 3).map((skill, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-[rgba(3,63,153,0.08)] text-blue-700 text-xs rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${res.availability_percent > 50 ? "bg-green-500" : res.availability_percent > 20 ? "bg-yellow-500" : "bg-red-500"}`}
                            style={{ width: `${res.availability_percent}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {res.availability_percent}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(res.status)}`}
                      >
                        {res.status?.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {resources.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                No resources
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourcesPage;
