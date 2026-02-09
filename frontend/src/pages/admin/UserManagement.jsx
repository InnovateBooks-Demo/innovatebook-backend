import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Plus,
  ArrowLeft,
  Search,
  MoreVertical,
  Mail,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { authService } from "../../utils/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = authService.getToken();

      // Fetch users
      const usersRes = await fetch(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      }

      // Fetch pending invites
      const invitesRes = await fetch(`${API_URL}/api/admin/invites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (invitesRes.ok) {
        const data = await invitesRes.json();
        setInvites(data.invites || []);
      }

      // Fetch roles
      const rolesRes = await fetch(`${API_URL}/api/admin/roles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (rolesRes.ok) {
        const data = await rolesRes.json();
        setRoles(data.roles || []);
      }
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async (email, roleId) => {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/admin/invites`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, role_id: roleId }),
      });

      if (response.ok) {
        toast.success("Invite sent successfully");
        setShowInviteModal(false);
        fetchData();
      } else {
        toast.error("Failed to send invite");
      }
    } catch (error) {
      toast.error("Failed to send invite");
    }
  };

  const handleDeactivateUser = async (userId) => {
    if (!window.confirm("Are you sure you want to deactivate this user?"))
      return;

    try {
      const token = authService.getToken();
      const response = await fetch(
        `${API_URL}/api/admin/users/${userId}/deactivate`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        toast.success("User deactivated");
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to deactivate user");
    }
  };

  const handleResendInvite = async (inviteId) => {
    try {
      const token = authService.getToken();
      const response = await fetch(
        `${API_URL}/api/admin/invites/${inviteId}/resend`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        toast.success("Invite resent");
      }
    } catch (error) {
      toast.error("Failed to resend invite");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#3A4E63]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="user-management">
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
              Admin → User Management
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="h-7 w-7 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  User Management
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Manage users, invites, and access permissions
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#3A4E63] rounded-lg hover:bg-[#022d6e]"
            >
              <Plus className="h-4 w-4" />
              Invite User
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-8 flex gap-1 border-t border-gray-100">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "users"
                ? "border-[#3A4E63] text-[#3A4E63]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Active Users ({users.filter((u) => u.is_active).length})
          </button>
          <button
            onClick={() => setActiveTab("invites")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "invites"
                ? "border-[#3A4E63] text-[#3A4E63]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Pending Invites ({invites.length})
          </button>
          <button
            onClick={() => setActiveTab("deactivated")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "deactivated"
                ? "border-[#3A4E63] text-[#3A4E63]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Deactivated ({users.filter((u) => !u.is_active).length})
          </button>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
            />
          </div>
        </div>

        {/* Users Table */}
        {activeTab === "users" && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Last Active
                  </th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers
                  .filter((u) => u.is_active !== false)
                  .map((user) => (
                    <tr key={user.user_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#3A4E63] rounded-full flex items-center justify-center text-white font-medium">
                            {user.full_name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.full_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                          <Shield className="h-3 w-3" />
                          {user.role_id || "Member"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                          <CheckCircle className="h-4 w-4" />
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.last_login || "Never"}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDeactivateUser(user.user_id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pending Invites */}
        {activeTab === "invites" && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {invites.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                      Invited
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                      Expires
                    </th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invites.map((invite) => (
                    <tr key={invite.invite_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <Mail className="h-5 w-5 text-gray-400" />
                          </div>
                          <p className="font-medium text-gray-900">
                            {invite.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {invite.role_id}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {invite.created_at}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-yellow-600 text-sm">
                          <Clock className="h-4 w-4" />
                          {invite.expires_at}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleResendInvite(invite.invite_id)}
                          className="text-sm text-[#3A4E63] hover:underline"
                        >
                          Resend
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-6 py-12 text-center text-gray-500">
                <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p>No pending invites</p>
              </div>
            )}
          </div>
        )}

        {/* Deactivated Users */}
        {activeTab === "deactivated" && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {users.filter((u) => u.is_active === false).length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                      Deactivated
                    </th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users
                    .filter((u) => u.is_active === false)
                    .map((user) => (
                      <tr key={user.user_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-medium">
                              {user.full_name?.charAt(0) || "U"}
                            </div>
                            <div>
                              <p className="font-medium text-gray-500">
                                {user.full_name}
                              </p>
                              <p className="text-sm text-gray-400">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {user.role_id}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {user.deactivated_at || "-"}
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-sm text-[#3A4E63] hover:underline">
                            Reactivate
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            ) : (
              <div className="px-6 py-12 text-center text-gray-500">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p>No deactivated users</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteUserModal
          roles={roles}
          onClose={() => setShowInviteModal(false)}
          onInvite={handleInviteUser}
        />
      )}
    </div>
  );
};

const InviteUserModal = ({ roles, onClose, onInvite }) => {
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && roleId) {
      onInvite(email, roleId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Invite User
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@company.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
                required
              >
                <option value="">Select a role</option>
                {roles.map((role) => (
                  <option key={role.role_id} value={role.role_id}>
                    {role.role_name}
                  </option>
                ))}
              </select>
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
              Send Invite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserManagement;
