import React, { useState } from "react";
import { Shield, Lock, Mail, AlertCircle, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3000";

const SuperAdminLoginNew = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Use the enterprise auth login endpoint
      const response = await axios.post(
        `${API_URL}/api/enterprise/auth/login`,
        credentials,
      );

      if (response.data.success) {
        const user = response.data.user;

        // Check if user is super admin
        if (user.is_super_admin || user.role === "super_admin") {
          // Store tokens
          localStorage.setItem("super_admin_token", response.data.access_token);
          localStorage.setItem("super_admin_user", JSON.stringify(user));

          // Redirect to dashboard
          navigate("/super-admin/dashboard");
        } else {
          setError("Access denied. Super admin credentials required.");
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Login failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-block relative">
            <div className="absolute inset-0 bg-[#033F99]/30 rounded-3xl blur-xl animate-pulse"></div>
            <div className="relative p-5 bg-gradient-to-br from-[#033F99] to-[#0147CC] rounded-2xl shadow-2xl border border-white/10">
              <Shield className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1
            className="text-3xl font-bold text-white mt-6 mb-2"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Super Admin Portal
          </h1>
          <p className="text-slate-400">InnovateBooks Platform Management</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-slate-700/50">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="email"
                  data-testid="super-admin-email-input"
                  value={credentials.email}
                  onChange={(e) =>
                    setCredentials({ ...credentials, email: e.target.value })
                  }
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#033F99] focus:border-transparent transition-all"
                  placeholder="admin@innovatebooks.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  data-testid="super-admin-password-input"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#033F99] focus:border-transparent transition-all"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              data-testid="super-admin-login-btn"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#033F99] to-[#0147CC] hover:from-[#022a6b] hover:to-[#033F99] text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  <span>Access Portal</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Test Credentials Info */}
        <div className="mt-6 bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
          <p className="text-sm text-slate-400 text-center mb-2">
            Test Credentials
          </p>
          <div className="text-center text-sm">
            <p className="text-slate-300">
              Email:{" "}
              <span className="text-[#4D9FFF] font-mono">
                revanth@innovatebooks.in
              </span>
            </p>
            <p className="text-slate-300">
              Password:{" "}
              <span className="text-[#4D9FFF] font-mono">Pandu@1605</span>
            </p>
          </div>
        </div>

        {/* Back to Main */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/")}
            className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
          >
            Back to Main Platform
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLoginNew;
