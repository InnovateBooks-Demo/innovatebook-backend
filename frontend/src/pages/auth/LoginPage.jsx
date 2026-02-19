import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  LogIn,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Shield,
  FileCheck,
  CheckCircle,
  ArrowRight,
  Building2,
  Brain,
  Sparkles,
} from "lucide-react";
import axios from "axios";

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
        email: formData.email,
        password: formData.password,
        remember_me: rememberMe,
      });

      if (response.data.success) {
        localStorage.setItem("access_token", response.data.access_token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        navigate("/workspace");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8FAFC]">
      {/* Left Side: Form */}
      {/* <div className="w-full lg:w-[55%] flex flex-col justify-center px-4 sm:px-6 md:px-8 py-12 relative overflow-hidden"> */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center items-center px-4 sm:px-6 md:px-8 py-12 relative overflow-hidden">
        {/* <div className="w-full max-w-md min-w-0"> */}
        <div className="w-full max-w-md min-w-0 mx-auto">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-6">
            <img
              src="/innovate-books-logo-new.png"
              alt="Innovate Books"
              className="h-8 w-auto"
              onError={(e) => (e.target.style.display = "none")}
            />
            <span className="text-lg font-bold text-slate-900">
              Innovate Books
            </span>
          </Link>

          <h1 className="text-3xl font-bold text-slate-900 mb-1">
            Welcome Back
          </h1>
          <p className="text-slate-600 mb-6">
            Access your business operating system.
          </p>

          {/* Login Card */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 break-words"> {/* RESPONSIVE CHANGE */}
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@company.com"
                    required
                    data-testid="login-email-input"
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:border-[#033F99] focus:ring-2 focus:ring-[#033F99]/20 outline-none text-slate-900 placeholder-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 break-words"> {/* RESPONSIVE CHANGE */}
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    data-testid="login-password-input"
                    className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-xl focus:border-[#033F99] focus:ring-2 focus:ring-[#033F99]/20 outline-none text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"> {/* RESPONSIVE CHANGE */}
                <div className="flex items-center min-w-0"> {/* RESPONSIVE CHANGE */}
                  <input
                    type="checkbox"
                    id="remember-me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-[#033F99] border-slate-300 rounded focus:ring-[#033F99] shrink-0"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-slate-600 break-words"
                  >
                    Remember me
                  </label>
                </div>
                <Link
                  to="/auth/forgot-password"
                  className="text-sm font-semibold text-[#033F99] hover:text-[#022D6E] transition-colors shrink-0"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                data-testid="login-submit-btn"
                className="w-full bg-[#033F99] hover:bg-[#033F99] text-white font-bold py-3 rounded-xl shadow-lg shadow-[#033F99]/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    Log in to Innovate Books <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center mt-4 text-slate-600 text-sm">
              First time here?{" "}
              <Link
                to="/auth/signup"
                className="text-[#033F99] font-semibold hover:text-[#033F99]"
              >
                Create your organization
              </Link>
            </p>
          </div>

          {/* Security Badges */}
          <div className="mt-4 flex justify-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Lock className="h-3 w-3 text-[#033F99]" />
              <span>Encrypted</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-[#033F99]" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-1">
              <FileCheck className="h-3 w-3 text-[#033F99]" />
              <span>Audited</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Info Panel */}
      <div className="hidden lg:flex w-[45%] bg-gradient-to-br from-[#033F99] to-[#033F99] p-8 items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl" />

        <div className="max-w-md relative z-10">
          <span className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-white/80 text-xs font-medium mb-4">
            <Sparkles className="h-3 w-3" /> Business Operating System
          </span>

          <h2 className="text-2xl font-bold text-white mb-3">
            Your business as one connected system
          </h2>
          <p className="text-white/70 text-sm leading-relaxed mb-6">
            Innovate Books is where your commercial decisions, operations,
            finance, workforce, and capital come together — governed, auditable,
            and intelligent.
          </p>

          {/* What Happens After Login */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 mb-4">
            <h3 className="text-white font-bold mb-3 text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4" /> What Happens After Login
            </h3>
            <div className="space-y-2">
              {[
                "View what needs your attention today",
                "Respond to approvals and tasks",
                "Monitor risks and insights",
                "Navigate into any solution",
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-white/80 text-xs"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              { title: "Role-aware", desc: "See only what you need" },
              { title: "Contextual", desc: "Everything connected" },
              { title: "Governed", desc: "Rules enforced" },
              { title: "Auditable", desc: "Full trail of actions" },
            ].map((f, i) => (
              <div
                key={i}
                className="bg-white/5 rounded-lg p-2.5 border border-white/10"
              >
                <p className="text-white font-semibold text-xs">{f.title}</p>
                <p className="text-white/50 text-xs">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Trust */}
          <div className="flex gap-4 text-white/50 text-xs">
            {[
              "Enterprise-grade security",
              "Full audit trails",
              "Privacy by design",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
