import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Building2,
  User,
  Users,
  Shield,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Target,
  Brain,
  Zap,
} from "lucide-react";
import axios from "axios";

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";

const SignupPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    company_name: "",
    industry: "",
    company_size: "",
    use_case: "",
  });

  const industries = [
    "Technology",
    "Manufacturing",
    "Services",
    "Retail",
    "Healthcare",
    "Finance",
    "Other",
  ];
  const companySizes = ["1-10", "11-50", "51-200", "201-500", "500+"];
  const useCases = [
    { id: "commerce", label: "Commerce", icon: Target },
    { id: "operations", label: "Operations", icon: Zap },
    { id: "finance", label: "Finance", icon: Building2 },
    { id: "all", label: "All", icon: Brain },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 2) {
      setStep(2);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/register`, {
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        company_name: formData.company_name || "My Company",
        role: "admin",
      });
      if (response.data.success) {
        localStorage.setItem("access_token", response.data.access_token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        navigate("/workspace");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8FAFC]">
      {/* Left Side - Info Panel */}
      <div className="w-full lg:w-[45%] bg-gradient-to-br from-[#033F99] to-[#033F99] p-8 flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl" />

        <div className="max-w-md relative z-10">
          <span className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-white/80 text-xs font-medium mb-4">
            <Sparkles className="h-3 w-3" /> Create Your Organization
          </span>

          <h2 className="text-2xl font-bold text-white mb-3">
            Start running your business as one connected system
          </h2>
          <p className="text-white/70 text-sm leading-relaxed mb-5">
            Control before chaos. Governance before execution. Intelligence
            before surprises.
          </p>

          {/* Who Should Sign Up */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 mb-4">
            <h3 className="text-white font-bold mb-2 text-sm flex items-center gap-2">
              <Users className="h-4 w-4" /> Who Should Sign Up?
            </h3>
            <div className="space-y-1.5">
              {[
                "Founders setting up their business",
                "Business owners seeking control",
                "CFOs / Finance heads",
                "Operators building governance",
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-white/80 text-xs"
                >
                  <CheckCircle className="h-3 w-3 text-white/60" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* What You're Creating */}
          <div className="bg-white/5 rounded-lg p-3 border border-white/10 mb-4">
            <p className="text-white/80 text-xs mb-2">
              You are not just creating a login. You are:
            </p>
            <div className="space-y-1">
              {[
                "Creating your company workspace",
                "Becoming the system administrator",
                "Defining governance foundation",
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-white/70 text-xs"
                >
                  <div className="w-4 h-4 rounded-full bg-[#033F99] flex items-center justify-center text-[10px] text-white font-bold">
                    {i + 1}
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trust */}
          <div className="grid grid-cols-2 gap-2 text-white/50 text-xs">
            {[
              "Your data is yours",
              "No selling or sharing",
              "Export-ready",
              "Audit-ready",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-[55%] flex items-center justify-center px-4 sm:px-6 md:px-8 py-12 lg:py-0">
        <div className="w-full max-w-md min-w-0">
          <Link to="/" className="flex items-center gap-2 mb-4">
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

          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            Create Your Organization
          </h1>
          <p className="text-slate-600 text-sm mb-4">
            Start running your business as one connected system.
          </p>

          {/* Step Indicator */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`flex items-center gap-1.5 ${step >= 1 ? "text-[#033F99]" : "text-slate-400"}`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${step >= 1 ? "bg-[#033F99] text-white" : "bg-slate-200"}`}
              >
                1
              </div>
              <span className="font-semibold text-xs">About You</span>
            </div>
            <div className="flex-1 h-0.5 bg-slate-200">
              <div
                className={`h-full bg-[#033F99] transition-all ${step >= 2 ? "w-full" : "w-0"}`}
              />
            </div>
            <div
              className={`flex items-center gap-1.5 ${step >= 2 ? "text-[#033F99]" : "text-slate-400"}`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${step >= 2 ? "bg-[#033F99] text-white" : "bg-slate-200"}`}
              >
                2
              </div>
              <span className="font-semibold text-xs">Company</span>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200">
            {error && (
              <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-xs">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {step === 1 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2 break-words">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        required
                        value={formData.first_name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-[#033F99] transition-colors"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2 break-words">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        required
                        value={formData.last_name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-[#033F99] transition-colors"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 break-words">
                      Work Email *
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
                        data-testid="signup-email-input"
                        className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:border-[#033F99] focus:ring-2 focus:ring-[#033F99]/20 outline-none text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 break-words">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Min. 8 characters"
                        required
                        minLength={8}
                        data-testid="signup-password-input"
                        className="w-full pl-9 pr-9 py-2.5 border border-slate-300 rounded-lg focus:border-[#033F99] focus:ring-2 focus:ring-[#033F99]/20 outline-none text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 break-words">
                      Official Company Name *
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleChange}
                        placeholder="Acme Inc"
                        required
                        data-testid="signup-company-input"
                        className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:border-[#033F99] focus:ring-2 focus:ring-[#033F99]/20 outline-none text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-3 break-words">
                        Industry *
                      </label>
                      <select
                        name="industry"
                        value={formData.industry}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:border-[#033F99] outline-none text-sm bg-white"
                      >
                        <option value="">Select</option>
                        {industries.map((ind) => (
                          <option key={ind} value={ind}>
                            {ind}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-3 break-words">
                        Company Size *
                      </label>
                      <select
                        name="company_size"
                        value={formData.company_size}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:border-[#033F99] outline-none text-sm bg-white"
                      >
                        <option value="">Select</option>
                        {companySizes.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-4 break-words">
                      Primary Use Case *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {useCases.map((uc) => {
                        const Icon = uc.icon;
                        return (
                          <button
                            key={uc.id}
                            type="button"
                            onClick={() =>
                              setFormData({ ...formData, use_case: uc.id })
                            }
                            className={`p-2 rounded-lg border text-center transition-all ${formData.use_case === uc.id ? "border-[#033F99] bg-[#033F99]/5" : "border-slate-200 hover:border-slate-300"}`}
                          >
                            <Icon
                              className={`h-4 w-4 mx-auto mb-0.5 ${formData.use_case === uc.id ? "text-[#033F99]" : "text-slate-400"}`}
                            />
                            <p className="font-semibold text-[10px] text-slate-900">
                              {uc.label}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-1">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2.5 border border-slate-300 rounded-lg font-semibold text-slate-700 text-sm hover:bg-slate-50"
                  >
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  data-testid="signup-submit-btn"
                  className="flex-1 bg-[#033F99] hover:bg-[#033F99] text-white font-bold py-2.5 rounded-lg shadow-lg shadow-[#033F99]/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : step < 2 ? (
                    <>
                      Continue <ArrowRight className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Create Organization <Sparkles className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
              <p className="text-center text-[10px] text-slate-500">
                No credit card required
              </p>
            </form>

            <p className="text-center mt-3 text-slate-600 text-xs">
              Already have an account?{" "}
              <Link to="/auth/login" className="text-[#033F99] font-semibold">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
