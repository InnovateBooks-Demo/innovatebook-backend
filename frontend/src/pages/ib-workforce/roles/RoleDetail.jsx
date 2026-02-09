import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Shield,
  ArrowLeft,
  Edit,
  Users,
  Lock,
  Key,
  CheckCircle,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { authService } from "../../../utils/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const RoleDetail = () => {
  const { role_id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchRole();
  }, [role_id]);

  const fetchRole = async () => {
    try {
      const token = authService.getToken();
      const response = await fetch(
        `${API_URL}/api/ib-workforce/roles/${role_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setRole(data.data);
      } else {
        toast.error("Role not found");
        navigate("/ib-workforce/roles");
      }
    } catch (error) {
      console.error("Failed to fetch role:", error);
      toast.error("Failed to load role details");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3A4E63]"></div>
      </div>
    );
  }

  if (!role) return null;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "permissions", label: "Permissions" },
    { id: "assignments", label: "Assignments" },
    { id: "audit", label: "Audit" },
  ];

  return (
    <div className="min-h-screen bg-gray-50" data-testid="role-detail">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <button
            onClick={() => navigate("/ib-workforce/roles")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Roles
          </button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {role.role_name}
                  </h1>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getCategoryColor(role.role_category)}`}
                  >
                    {role.role_category}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${role.is_active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"}`}
                  >
                    {role.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {role.description || "No description"}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate(`/ib-workforce/roles/${role_id}/edit`)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              data-testid="edit-btn"
            >
              <Edit className="h-4 w-4" />
              Edit Role
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 mt-6 border-b border-gray-200 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-[#3A4E63] text-[#3A4E63]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {activeTab === "overview" && (
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              {/* Role Info */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Role Information
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-500">Role Name</p>
                    <p className="text-sm font-medium text-gray-900">
                      {role.role_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Category</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {role.role_category}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Description</p>
                    <p className="text-sm font-medium text-gray-900">
                      {role.description || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-[#033F99]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {role.assignments?.length || 0}
                      </p>
                      <p className="text-xs text-gray-500">Assigned Users</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Key className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {role.permissions?.length || 0}
                      </p>
                      <p className="text-xs text-gray-500">Permissions</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg ${role.is_active ? "bg-emerald-100" : "bg-gray-100"} flex items-center justify-center`}
                    >
                      <CheckCircle
                        className={`h-5 w-5 ${role.is_active ? "text-emerald-600" : "text-gray-600"}`}
                      />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {role.is_active ? "Active" : "Inactive"}
                      </p>
                      <p className="text-xs text-gray-500">Status</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Created
                </h3>
                <p className="text-sm text-gray-600">
                  {role.created_at?.split("T")[0] || "-"}
                </p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Last Updated
                </h3>
                <p className="text-sm text-gray-600">
                  {role.updated_at?.split("T")[0] || "-"}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "permissions" && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Permissions
              </h3>
              <button className="text-sm text-[#3A4E63] hover:underline flex items-center gap-1">
                <Plus className="h-4 w-4" /> Add Permission
              </button>
            </div>
            {role.permissions?.length > 0 ? (
              <div className="space-y-3">
                {role.permissions.map((perm, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Key className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {perm.module} - {perm.action}
                        </p>
                        <p className="text-xs text-gray-500">
                          Resource: {perm.resource}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No permissions configured for this role
              </p>
            )}
          </div>
        )}

        {activeTab === "assignments" && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Role Assignments
              </h3>
              <button className="text-sm text-[#3A4E63] hover:underline flex items-center gap-1">
                <Plus className="h-4 w-4" /> Assign to Person
              </button>
            </div>
            {role.assignments?.length > 0 ? (
              <div className="space-y-3">
                {role.assignments.map((assignment, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[rgba(3,63,153,0.08)]0 flex items-center justify-center text-white text-sm font-medium">
                        U
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {assignment.person_id}
                        </p>
                        <p className="text-xs text-gray-500">
                          Since {assignment.effective_from?.split("T")[0]}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        assignment.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {assignment.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No users assigned to this role
              </p>
            )}
          </div>
        )}

        {activeTab === "audit" && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Audit Trail
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                <div className="w-2 h-2 mt-2 rounded-full bg-emerald-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Role Created
                  </p>
                  <p className="text-xs text-gray-500">{role.created_at}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleDetail;
