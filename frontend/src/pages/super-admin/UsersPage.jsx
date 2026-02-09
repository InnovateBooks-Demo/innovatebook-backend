import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Plus,
  CheckCircle,
  XCircle,
  RefreshCw,
  ArrowLeft,
  Mail,
  Shield,
  Building2,
  Key,
  UserX,
  UserCheck,
} from "lucide-react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3000";

const UsersPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOrg, setFilterOrg] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "user",
    org_id: "",
  });
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("super_admin_token");
    if (!token) {
      navigate("/super-admin/login");
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("super_admin_token");
      const [usersRes, orgsRes] = await Promise.all([
        axios.get(`${API_URL}/api/super-admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/api/super-admin/organizations`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setUsers(usersRes.data.users || []);
      setOrganizations(orgsRes.data.organizations || []);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate("/super-admin/login");
      }
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError("");

    try {
      const token = localStorage.getItem("super_admin_token");
      await axios.post(`${API_URL}/api/super-admin/users`, newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowCreateModal(false);
      setNewUser({
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        role: "user",
        org_id: "",
      });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  const handleDeactivateUser = async (userId) => {
    if (!window.confirm("Are you sure you want to deactivate this user?")) {
      return;
    }

    try {
      const token = localStorage.getItem("super_admin_token");
      await axios.delete(`${API_URL}/api/super-admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to deactivate user");
    }
  };

  const handleResetPassword = async (userId) => {
    if (!newPassword) {
      alert("Please enter a new password");
      return;
    }

    try {
      const token = localStorage.getItem("super_admin_token");
      await axios.post(
        `${API_URL}/api/super-admin/users/${userId}/reset-password?new_password=${encodeURIComponent(newPassword)}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setShowResetPasswordModal(null);
      setNewPassword("");
      alert("Password reset successfully");
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to reset password");
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (user.first_name?.toLowerCase() || "").includes(
        searchTerm.toLowerCase(),
      ) ||
      (user.last_name?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesOrg = filterOrg === "all" || user.org_id === filterOrg;
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesOrg && matchesRole;
  });

  const getRoleColor = (role) => {
    switch (role) {
      case "super_admin":
        return "bg-purple-100 text-purple-700";
      case "org_admin":
        return "bg-blue-100 text-blue-700";
      case "manager":
        return "bg-green-100 text-green-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <RefreshCw className="w-10 h-10 text-[#3A4E63] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              to="/super-admin/dashboard"
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                User Management
              </h1>
              <p className="text-sm text-slate-500">
                Manage all platform users
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500">Total Users</p>
            <p className="text-2xl font-bold text-slate-900">{users.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500">Active Users</p>
            <p className="text-2xl font-bold text-green-600">
              {users.filter((u) => u.is_active).length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500">Super Admins</p>
            <p className="text-2xl font-bold text-purple-600">
              {users.filter((u) => u.role === "super_admin").length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500">Org Admins</p>
            <p className="text-2xl font-bold text-[#033F99]">
              {users.filter((u) => u.role === "org_admin").length}
            </p>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 flex-1 w-full md:w-auto flex-wrap">
              <div className="relative flex-1 md:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                />
              </div>

              <select
                value={filterOrg}
                onChange={(e) => setFilterOrg(e.target.value)}
                className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
              >
                <option value="all">All Organizations</option>
                {organizations.map((org) => (
                  <option key={org.org_id} value={org.org_id}>
                    {org.display_name || org.name}
                  </option>
                ))}
              </select>

              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
              >
                <option value="all">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="org_admin">Org Admin</option>
                <option value="manager">Manager</option>
                <option value="user">User</option>
              </select>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              data-testid="create-user-btn"
              className="flex items-center gap-2 px-4 py-2.5 bg-[#3A4E63] hover:bg-[#022a6b] text-white rounded-lg transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Create User
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                  User
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                  Organization
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                  Role
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                  Created
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => {
                const org = organizations.find((o) => o.org_id === user.org_id);
                return (
                  <tr
                    key={user.user_id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#3A4E63] to-[#0147CC] rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {user.first_name?.[0]}
                          {user.last_name?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-sm text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-700">
                          {org?.display_name || user.org_id}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}
                      >
                        <Shield className="w-3.5 h-3.5" />
                        {user.role?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          user.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {user.is_active ? (
                          <CheckCircle className="w-3.5 h-3.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            setShowResetPasswordModal(user.user_id)
                          }
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Reset Password"
                        >
                          <Key className="w-4 h-4 text-slate-500" />
                        </button>
                        {user.role !== "super_admin" && (
                          <button
                            onClick={() => handleDeactivateUser(user.user_id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title={
                              user.is_active ? "Deactivate" : "Already Inactive"
                            }
                            disabled={!user.is_active}
                          >
                            <UserX
                              className={`w-4 h-4 ${user.is_active ? "text-red-500" : "text-slate-300"}`}
                            />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Create User</h2>
              <p className="text-sm text-slate-500 mt-1">
                Add a new user to an organization
              </p>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    data-testid="user-first-name-input"
                    value={newUser.first_name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, first_name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    data-testid="user-last-name-input"
                    value={newUser.last_name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, last_name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  data-testid="user-email-input"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  data-testid="user-password-input"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Organization *
                  </label>
                  <select
                    value={newUser.org_id}
                    onChange={(e) =>
                      setNewUser({ ...newUser, org_id: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                    required
                  >
                    <option value="">Select Organization</option>
                    {organizations
                      .filter((o) => o.is_active)
                      .map((org) => (
                        <option key={org.org_id} value={org.org_id}>
                          {org.display_name || org.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Role *
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({ ...newUser, role: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                  >
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="org_admin">Org Admin</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  data-testid="create-user-submit-btn"
                  disabled={creating}
                  className="flex-1 px-4 py-2.5 bg-[#3A4E63] text-white rounded-lg hover:bg-[#022a6b] transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create User"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">
                Reset Password
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Enter a new password for this user
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  New Password *
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                  placeholder="Enter new password"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetPasswordModal(null);
                    setNewPassword("");
                  }}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleResetPassword(showResetPasswordModal)}
                  className="flex-1 px-4 py-2.5 bg-[#3A4E63] text-white rounded-lg hover:bg-[#022a6b] transition-colors font-medium"
                >
                  Reset Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
