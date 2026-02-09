import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Plus,
  ArrowLeft,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { authService } from "../../utils/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PERMISSION_GROUPS = {
  commerce: {
    label: "Commerce",
    permissions: [
      "commerce.read",
      "commerce.write",
      "commerce.delete",
      "commerce.approve",
    ],
  },
  operations: {
    label: "Operations",
    permissions: [
      "operations.read",
      "operations.write",
      "operations.delete",
      "operations.approve",
    ],
  },
  finance: {
    label: "Finance",
    permissions: [
      "finance.read",
      "finance.write",
      "finance.delete",
      "finance.approve",
    ],
  },
  intelligence: {
    label: "Intelligence",
    permissions: [
      "intelligence.read",
      "intelligence.write",
      "intelligence.delete",
    ],
  },
  admin: {
    label: "Administration",
    permissions: [
      "admin.users",
      "admin.roles",
      "admin.settings",
      "admin.billing",
    ],
  },
};

const RolesPermissions = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/admin/roles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setRoles(data.roles || []);
      }
    } catch (error) {
      toast.error("Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async (roleData) => {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/admin/roles`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roleData),
      });

      if (response.ok) {
        toast.success("Role created successfully");
        setShowCreateModal(false);
        fetchRoles();
      }
    } catch (error) {
      toast.error("Failed to create role");
    }
  };

  const handleUpdatePermissions = async (roleId, permissions) => {
    try {
      const token = authService.getToken();
      const response = await fetch(
        `${API_URL}/api/admin/roles/${roleId}/permissions`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ permissions }),
        },
      );

      if (response.ok) {
        toast.success("Permissions updated");
        fetchRoles();
      }
    } catch (error) {
      toast.error("Failed to update permissions");
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;

    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/admin/roles/${roleId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success("Role deleted");
        setSelectedRole(null);
        fetchRoles();
      }
    } catch (error) {
      toast.error("Failed to delete role");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#3A4E63]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="roles-permissions">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate("/admin")}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-500">
              Admin → Roles & Permissions
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                <Shield className="h-7 w-7 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Roles & Permissions
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Configure access control for your organization
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#3A4E63] rounded-lg hover:bg-[#022d6e]"
            >
              <Plus className="h-4 w-4" />
              Create Role
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Roles List */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Roles</h3>
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
              {roles.map((role) => (
                <div
                  key={role.role_id}
                  onClick={() => setSelectedRole(role)}
                  className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${
                    selectedRole?.role_id === role.role_id
                      ? "bg-blue-50 border-l-2 border-l-[#3A4E63]"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {role.role_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {role.user_count || 0} users
                      </p>
                    </div>
                    {role.is_system && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                        System
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Permissions Editor */}
          <div className="col-span-2">
            {selectedRole ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedRole.role_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedRole.description}
                    </p>
                  </div>
                  {!selectedRole.is_system && (
                    <button
                      onClick={() => handleDeleteRole(selectedRole.role_id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {Object.entries(PERMISSION_GROUPS).map(
                    ([groupKey, group]) => (
                      <div
                        key={groupKey}
                        className="border-b border-gray-100 last:border-0"
                      >
                        <div className="px-4 py-3 bg-gray-50">
                          <h4 className="font-medium text-gray-900">
                            {group.label}
                          </h4>
                        </div>
                        <div className="px-4 py-3">
                          <div className="grid grid-cols-2 gap-3">
                            {group.permissions.map((permission) => {
                              const isEnabled =
                                selectedRole.permissions?.includes(permission);
                              return (
                                <label
                                  key={permission}
                                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isEnabled}
                                    onChange={() => {
                                      const newPermissions = isEnabled
                                        ? selectedRole.permissions.filter(
                                            (p) => p !== permission,
                                          )
                                        : [
                                            ...(selectedRole.permissions || []),
                                            permission,
                                          ];
                                      handleUpdatePermissions(
                                        selectedRole.role_id,
                                        newPermissions,
                                      );
                                    }}
                                    disabled={selectedRole.is_system}
                                    className="w-4 h-4 rounded border-gray-300 text-[#3A4E63] focus:ring-[#3A4E63]"
                                  />
                                  <span className="text-sm text-gray-700 capitalize">
                                    {permission.split(".")[1]}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  Select a role to view and edit permissions
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Role Modal */}
      {showCreateModal && (
        <CreateRoleModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateRole}
        />
      )}
    </div>
  );
};

const CreateRoleModal = ({ onClose, onCreate }) => {
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (roleName) {
      onCreate({ role_name: roleName, description, permissions: [] });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Create Role
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role Name
              </label>
              <input
                type="text"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="e.g., Project Manager"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe this role..."
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 text-sm font-medium text-white bg-[#3A4E63] rounded-lg hover:bg-[#022d6e]"
            >
              Create Role
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RolesPermissions;
