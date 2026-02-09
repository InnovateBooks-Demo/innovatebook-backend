import React, { useState } from "react";
import { Shield, Lock, Mail, AlertCircle, TrendingUp } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3000";

const SuperAdminLogin = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/enterprise/auth/login`,
        credentials,
      );

      if (response.data.success) {
        // Check if user is super admin
        if (response.data.user.is_super_admin) {
          // Store token
          localStorage.setItem("access_token", response.data.access_token);
          localStorage.setItem("refresh_token", response.data.refresh_token);
          localStorage.setItem("user", JSON.stringify(response.data.user));

          // Redirect to organizations dashboard
          navigate("/super-admin/organizations");
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
    <div className="min-h-screen bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-block relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#3A4E63]/20 to-transparent rounded-3xl blur-xl"></div>
            <div className="relative p-6 bg-gradient-to-br from-[#3A4E63] to-[#0147CC] rounded-3xl mb-4 shadow-2xl">
              <Shield className="w-16 h-16 text-white" />
            </div>
          </div>
          <h1
            className="text-4xl font-bold bg-gradient-to-r from-[#3A4E63] via-[#3A4E63] to-[#3A4E63] bg-clip-text text-transparent mb-2"
            style={{ fontFamily: "Poppins" }}
          >
            Super Admin Portal
          </h1>
          <p className="text-[#3A4E63] font-semibold text-lg">
            Platform Management Dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border-2 border-[#3A4E63]/30">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#3A4E63]/10 to-transparent rounded-full -mr-20 -mt-20"></div>

          <form onSubmit={handleLogin} className="relative space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-[#3A4E63] mb-2 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#3A4E63] w-5 h-5" />
                <input
                  type="email"
                  value={credentials.email}
                  onChange={(e) =>
                    setCredentials({ ...credentials, email: e.target.value })
                  }
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent transition-all"
                  placeholder="admin@innovatebooks.in"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-[#3A4E63] mb-2 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#3A4E63] w-5 h-5" />
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#3A4E63] to-[#0147CC] hover:from-[#3A4E63] hover:to-[#3A4E63] text-white font-bold rounded-xl transition-all shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  <span>Access Admin Portal</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600 font-medium">
              Restricted to authorized super administrators only
            </p>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-[rgba(3,63,153,0.08)] border-2 border-[rgba(3,63,153,0.25)] rounded-xl p-4">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-[#033F99] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-900 font-semibold mb-1">
                Test Credentials
              </p>
              <p className="text-xs text-blue-700">
                Email: revanth@innovatebooks.in
              </p>
              <p className="text-xs text-blue-700">Password: Pandu@1605</p>
            </div>
          </div>
        </div>

        {/* Back to Platform Link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/")}
            className="text-[#3A4E63] hover:text-[#0147CC] text-sm font-semibold transition-colors"
          >
            ← Back to Main Platform
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogin;
