import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Plus,
  Search,
  Eye,
  Edit,
  MoreVertical,
  Users,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { authService } from "../../../utils/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const RolesList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    fetchRoles();
  }, [categoryFilter]);

  const fetchRoles = async () => {
    try {
      const token = authService.getToken();
      let url = `${API_URL}/api/ib-workforce/roles?`;
      if (categoryFilter) url += `category=${categoryFilter}&`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setRoles(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      toast.error("Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "admin":
        return "bg-red-100 text-red-700";
      case "financial":
        return "bg-emerald-100 text-emerald-700";
      case "operational":
        return "bg-blue-100 text-blue-700";
      case "governance":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredRoles = roles.filter((r) =>
    r.role_name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const stats = [
    {
      label: "Total Roles",
      value: roles.length,
      icon: Shield,
      color: "text-purple-600",
    },
    {
      label: "Active",
      value: roles.filter((r) => r.is_active).length,
      icon: CheckCircle,
      color: "text-emerald-600",
    },
    {
      label: "Operational",
      value: roles.filter((r) => r.role_category === "operational").length,
      icon: Users,
      color: "text-[#033F99]",
    },
    {
      label: "Admin",
      value: roles.filter((r) => r.role_category === "admin").length,
      icon: AlertCircle,
      color: "text-red-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50" data-testid="roles-list">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Roles Directory
                </h1>
                <p className="text-sm text-gray-500">
                  Manage authority, responsibility & access
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/ib-workforce/roles/create")}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#3A4E63] text-white rounded-lg hover:bg-[#022B6B] transition-colors"
              data-testid="create-role-btn"
            >
              <Plus className="h-4 w-4" />
              Create Role
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center ${stat.color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
                data-testid="search-input"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
              data-testid="category-filter"
            >
              <option value="">All Categories</option>
              <option value="operational">Operational</option>
              <option value="financial">Financial</option>
              <option value="governance">Governance</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Assigned Users
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#3A4E63]"></div>
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : filteredRoles.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No roles found.{" "}
                    <button
                      onClick={() => navigate("/ib-workforce/roles/create")}
                      className="text-[#3A4E63] hover:underline"
                    >
                      Create your first role
                    </button>
                  </td>
                </tr>
              ) : (
                filteredRoles.map((role) => (
                  <tr
                    key={role.role_id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      navigate(`/ib-workforce/roles/${role.role_id}`)
                    }
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white">
                          <Shield className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {role.role_name}
                          </p>
                          <p className="text-xs text-gray-500 truncate max-w-xs">
                            {role.description || "-"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getCategoryColor(role.role_category)}`}
                      >
                        {role.role_category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {role.assigned_count || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${role.is_active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"}`}
                      >
                        {role.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className="flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() =>
                            navigate(`/ib-workforce/roles/${role.role_id}`)
                          }
                          className="p-1.5 text-gray-400 hover:text-[#3A4E63] hover:bg-gray-100 rounded"
                          data-testid={`view-${role.role_id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/ib-workforce/roles/${role.role_id}/edit`)
                          }
                          className="p-1.5 text-gray-400 hover:text-[#3A4E63] hover:bg-gray-100 rounded"
                          data-testid={`edit-${role.role_id}`}
                        >
                          <Edit className="h-4 w-4" />
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
    </div>
  );
};

export default RolesList;
