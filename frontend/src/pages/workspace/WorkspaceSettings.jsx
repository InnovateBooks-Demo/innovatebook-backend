import React, { useState, useEffect } from "react";
import {
  User,
  Users,
  Bell,
  Lock,
  Palette,
  Globe,
  Shield,
  Mail,
  Phone,
  Building,
  Save,
} from "lucide-react";
import { authService } from "../../utils/auth";
import { toast } from "sonner";

const WorkspaceSettings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    department: "",
    title: "",
  });
  const [users, setUsers] = useState([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    email: "",
    full_name: "",
    password: "",
    role: "",
    status: "active",
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);

  useEffect(() => {
    const userData = authService.getUser();
    setUser(userData);
    setFormData({
      full_name: userData?.full_name || "",
      email: userData?.email || "",
      phone: userData?.phone || "",
      department: userData?.department || "",
      title: userData?.role || "",
    });
    loadUsers();
  }, []);

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB");
      return;
    }

    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL || "http://localhost:8001"}/api/users/upload-photo`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      if (response.ok) {
        const data = await response.json();
        const BACKEND_URL =
          process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";
        const fullPhotoUrl = `${BACKEND_URL}${data.photo_url}`;
        setProfilePhoto(fullPhotoUrl);
        toast.success("Profile photo updated successfully!");
        // Update user data in localStorage
        const updatedUser = { ...user, profile_photo: data.photo_url };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);

        // Force re-render
        window.location.reload();
      } else {
        toast.error("Failed to upload photo");
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast.error("Error uploading photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL || "http://localhost:8001"}/api/users/list`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const handleCreateUser = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL || "http://localhost:8001"}/api/users/create`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newUser),
        },
      );

      if (response.ok) {
        toast.success("User created successfully");
        setShowAddUserModal(false);
        setNewUser({
          email: "",
          full_name: "",
          password: "",
          role: "",
          status: "active",
        });
        loadUsers();
      } else {
        const error = await response.json();
        toast.error(error.detail || "Failed to create user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Failed to create user");
    }
  };

  const handleUpdateUser = async (userId, updates) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL || "http://localhost:8001"}/api/users/${userId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        },
      );

      if (response.ok) {
        toast.success("User updated successfully");
        loadUsers();
      } else {
        toast.error("Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL || "http://localhost:8001"}/api/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        toast.success("User deleted successfully");
        loadUsers();
      } else {
        const error = await response.json();
        toast.error(error.detail || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveProfile = () => {
    // Update localStorage
    const updatedUser = { ...user, ...formData };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    toast.success("Profile updated successfully");
  };

  const tabs = [
    { id: "profile", name: "Profile", icon: User },
    { id: "users", name: "Users", icon: Users },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "security", name: "Security", icon: Lock },
    { id: "appearance", name: "Appearance", icon: Palette },
    { id: "privacy", name: "Privacy", icon: Shield },
  ];

  return (
    <div
      className="h-full bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50 p-8"
      style={{ fontFamily: "Poppins" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-[#033F99] to-[#033F99] bg-clip-text text-transparent mb-2">
            Settings
          </h1>
          <p className="text-slate-600 font-medium">
            Manage your workspace preferences and account settings
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-[#033F99]/20">
          <div className="flex">
            {/* Sidebar */}
            <div className="w-64 bg-[#033F99]/5 border-r-2 border-[#033F99]/20 p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === tab.id
                          ? "bg-gradient-to-r from-[#033F99] to-[#033F99] text-white shadow-xl"
                          : "text-slate-700 hover:bg-white hover:shadow-lg"
                        }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8">
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-6">
                      Profile Information
                    </h2>

                    {/* Avatar */}
                    <div className="flex items-center gap-6 mb-8">
                      <div className="w-24 h-24 bg-gradient-to-br from-[#033F99] to-[#0147CC] rounded-full flex items-center justify-center text-white font-black text-3xl shadow-2xl overflow-hidden">
                        {user?.profile_photo || profilePhoto ? (
                          <img
                            src={`${process.env.REACT_APP_BACKEND_URL || "http://localhost:8001"}${profilePhoto || user?.profile_photo}`}
                            alt={user?.full_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error("Image load error");
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          user?.full_name?.charAt(0) || "U"
                        )}
                      </div>
                      <div>
                        <input
                          type="file"
                          id="photo-upload"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                        <label
                          htmlFor="photo-upload"
                          className={`inline-block px-6 py-2.5 bg-gradient-to-r from-[#033F99] to-[#0147CC] text-white font-bold rounded-xl hover:shadow-xl transition-all shadow-lg cursor-pointer ${uploadingPhoto ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {uploadingPhoto ? "Uploading..." : "Change Photo"}
                        </label>
                        <p className="text-sm text-[#033F99]/60 mt-2 font-medium">
                          JPG, PNG or GIF. Max size 2MB.
                        </p>
                      </div>
                    </div>

                    {/* Form */}
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                          <input
                            type="text"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#033F99] focus:outline-none font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">
                          Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#033F99] focus:outline-none font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">
                          Phone
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="+1 (555) 000-0000"
                            className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#033F99] focus:outline-none font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">
                          Job Title
                        </label>
                        <div className="relative">
                          <Building className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                          <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#033F99] focus:outline-none font-medium"
                          />
                        </div>
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-bold text-slate-900 mb-2">
                          Department
                        </label>
                        <input
                          type="text"
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          placeholder="Engineering, Marketing, Sales, etc."
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#033F99] focus:outline-none font-medium"
                        />
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end mt-8">
                      <button
                        onClick={handleSaveProfile}
                        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#033F99] to-[#033F99] text-white font-bold rounded-xl shadow-2xl hover:shadow-[#033F99]/50 transition-all"
                      >
                        <Save className="h-5 w-5" />
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "users" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-black text-[#033F99]">
                        User Management
                      </h2>
                      <p className="text-[#033F99]/60 mt-1 font-semibold">
                        {users.length} total users
                      </p>
                    </div>
                    {user?.role === "Admin" && (
                      <button
                        onClick={() => setShowAddUserModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#033F99] to-[#0147CC] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                      >
                        <User className="h-5 w-5" strokeWidth={2.5} />
                        Add User
                      </button>
                    )}
                  </div>

                  <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-[#033F99]/10">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-black text-slate-900">
                            Name
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-black text-slate-900">
                            Email
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-black text-slate-900">
                            Role
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-black text-slate-900">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-black text-slate-900">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {users.map((u) => (
                          <tr
                            key={u.id}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-full flex items-center justify-center text-white font-bold">
                                  {u.full_name?.charAt(0) || "U"}
                                </div>
                                <span className="font-bold text-slate-900">
                                  {u.full_name}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-slate-600">
                              {u.email}
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 bg-[#033F99]/10 text-[#033F99] rounded-full text-sm font-bold">
                                {u.role}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-bold ${u.status === "active"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                  }`}
                              >
                                {u.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setEditingUser(u)}
                                  className="p-2 hover:bg-[#033F99]/10 rounded-lg text-[#033F99] transition-colors"
                                  title="Edit"
                                >
                                  <Mail className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
                                  title="Delete"
                                >
                                  <Lock className="h-4 w-4" />
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

              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-black text-slate-900 mb-6">
                    Notification Preferences
                  </h2>

                  <div className="space-y-4">
                    {[
                      {
                        title: "Email Notifications",
                        desc: "Receive email updates about your activity",
                      },
                      {
                        title: "Push Notifications",
                        desc: "Receive push notifications on your devices",
                      },
                      {
                        title: "Direct Messages",
                        desc: "Get notified when someone sends you a DM",
                      },
                      {
                        title: "Mentions",
                        desc: "Get notified when someone mentions you",
                      },
                      {
                        title: "Channel Messages",
                        desc: "Get notified for all channel messages",
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border-2 border-slate-200"
                      >
                        <div>
                          <p className="font-bold text-slate-900">
                            {item.title}
                          </p>
                          <p className="text-sm text-slate-600">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            defaultChecked
                          />
                          <div className="w-14 h-8 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#033F99]"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-black text-slate-900 mb-6">
                    Security Settings
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-bold text-slate-900 mb-4">
                        Change Password
                      </h3>
                      <div className="space-y-4">
                        <input
                          type="password"
                          placeholder="Current Password"
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#033F99] focus:outline-none"
                        />
                        <input
                          type="password"
                          placeholder="New Password"
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#033F99] focus:outline-none"
                        />
                        <input
                          type="password"
                          placeholder="Confirm New Password"
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#033F99] focus:outline-none"
                        />
                        <button className="px-6 py-3 bg-[#033F99] text-white font-bold rounded-xl hover:bg-[#033F99] transition-all">
                          Update Password
                        </button>
                      </div>
                    </div>

                    <div className="border-t-2 border-slate-200 pt-6">
                      <h3 className="font-bold text-slate-900 mb-4">
                        Two-Factor Authentication
                      </h3>
                      <p className="text-slate-600 mb-4">
                        Add an extra layer of security to your account
                      </p>
                      <button className="px-6 py-3 bg-slate-100 text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-all">
                        Enable 2FA
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "appearance" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-black text-slate-900 mb-6">
                    Appearance
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-bold text-slate-900 mb-4">Theme</h3>
                      <div className="grid grid-cols-3 gap-4">
                        {["Light", "Dark", "Auto"].map((theme) => (
                          <button
                            key={theme}
                            className="p-6 border-2 border-[#033F99] rounded-xl hover:bg-[#033F99]/5 transition-all"
                          >
                            <div
                              className={`w-full h-24 rounded-lg mb-3 ${theme === "Light"
                                  ? "bg-white border-2 border-slate-200"
                                  : theme === "Dark"
                                    ? "bg-slate-900"
                                    : "bg-gradient-to-br from-white to-slate-900"
                                }`}
                            ></div>
                            <p className="font-bold text-slate-900">{theme}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 mb-4">
                        Font Size
                      </h3>
                      <select className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#033F99] focus:outline-none font-medium">
                        <option>Small</option>
                        <option selected>Medium</option>
                        <option>Large</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "privacy" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-black text-slate-900 mb-6">
                    Privacy Settings
                  </h2>

                  <div className="space-y-4">
                    {[
                      {
                        title: "Profile Visibility",
                        desc: "Who can see your profile",
                      },
                      {
                        title: "Activity Status",
                        desc: "Show when you're active",
                      },
                      {
                        title: "Read Receipts",
                        desc: "Show when you've read messages",
                      },
                      {
                        title: "Last Seen",
                        desc: "Show when you were last active",
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border-2 border-slate-200"
                      >
                        <div>
                          <p className="font-bold text-slate-900">
                            {item.title}
                          </p>
                          <p className="text-sm text-slate-600">{item.desc}</p>
                        </div>
                        <select className="px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-[#033F99] focus:outline-none font-medium">
                          <option>Everyone</option>
                          <option>My Contacts</option>
                          <option>Nobody</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black bg-gradient-to-r from-[#033F99] to-[#033F99] bg-clip-text text-transparent">
                Add New User
              </h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newUser.full_name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, full_name: e.target.value })
                  }
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#033F99] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  placeholder="john.doe@innovatebooks.com"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#033F99] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  placeholder="Enter password"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#033F99] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Role
                </label>
                <input
                  type="text"
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                  placeholder="e.g., Developer, Manager, Designer"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#033F99] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Status
                </label>
                <select
                  value={newUser.status}
                  onChange={(e) =>
                    setNewUser({ ...newUser, status: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#033F99] focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <button
                onClick={handleCreateUser}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#033F99] to-[#033F99] text-white font-bold rounded-xl shadow-2xl hover:shadow-[#033F99]/50 transition-all"
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceSettings;
