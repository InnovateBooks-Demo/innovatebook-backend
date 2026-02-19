import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card } from "../../components/ui/card";
import { Activity, Mail, Lock, ArrowRight, CheckCircle } from "lucide-react";
import { authService } from "../../utils/auth";
import { toast } from "sonner";

const CommerceLogin = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    role: "Commerce Manager",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const response = await authService.login({
          email: formData.email,
          password: formData.password,
        });

        if (response.access_token) {
          setIsAuthenticated(true);
          toast.success("Welcome to IB Commerce!");
          navigate("/commerce");
        }
      } else {
        // Register
        const response = await authService.register({
          email: formData.email,
          password: formData.password,
          full_name: formData.fullName,
          role: formData.role,
        });

        if (response.access_token) {
          setIsAuthenticated(true);
          toast.success("Account created! Welcome to IB Commerce!");
          navigate("/commerce");
        }
      }
    } catch (error) {
      console.error("Authentication error:", error);
      toast.error(
        error.response?.data?.detail ||
        "Authentication failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#033F99] via-[#033F99] to-[#033F99] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#033F99] rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 px-6 py-6">
        <Link
          to="/"
          className="flex items-center gap-3 text-white hover:opacity-80 transition-opacity"
        >
          <img
            src="/innovate-books-logo.png"
            alt="Innovate Books"
            className="h-12 w-auto"
          />
          <div>
            <div
              className="font-bold text-xl"
              style={{ fontFamily: "Poppins" }}
            >
              Innovate Books
            </div>
            <div className="text-xs text-[#033F99]">IB Commerce Platform</div>
          </div>
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-6xl grid md:grid-cols-2 gap-12 items-center">
          {/* Left Side - Branding */}
          <div className="text-white space-y-8 hidden md:block">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                <Activity className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1
                  className="text-4xl font-bold mb-2"
                  style={{ fontFamily: "Poppins" }}
                >
                  IB Commerce
                </h1>
                <p className="text-[#033F99]">
                  SOP-Driven Commercial Lifecycle
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <h2
                className="text-3xl font-bold leading-tight"
                style={{ fontFamily: "Poppins" }}
              >
                Transform Every Transaction Into Strategic Intelligence
              </h2>
              <p className="text-lg text-[#033F99] leading-relaxed">
                Complete financial flow from lead capture to payment
                reconciliation — structured, verified, and SOP-governed across
                12 intelligent modules.
              </p>

              <div className="space-y-4 pt-6">
                {[
                  "Lead → Evaluate → Commit → Execute → Bill → Collect",
                  "Procure → Pay with 3-way matching",
                  "Spend, Tax, Reconcile & Govern layers",
                  "Real-time financial intelligence & AI insights",
                ].map((feature, index) => (
                  <div
                    key={`item-${index}`}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-[#033F99]">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-white/20">
              <p className="text-sm text-[#033F99]">
                Trusted by 500+ finance teams worldwide • Processing ₹10,000Cr+
                transactions
              </p>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <Card className="p-8 md:p-10 bg-white/95 backdrop-blur-lg border-0 shadow-2xl">
            <div className="mb-8 text-center md:text-left">
              <h2
                className="text-3xl font-bold text-slate-900 mb-2"
                style={{ fontFamily: "Poppins" }}
              >
                {isLogin ? "Welcome Back" : "Get Started"}
              </h2>
              <p className="text-slate-600">
                {isLogin
                  ? "Sign in to access IB Commerce"
                  : "Create your IB Commerce account"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div>
                  <Label
                    htmlFor="fullName"
                    className="text-slate-700 font-medium"
                  >
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="mt-2 h-12"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="email" className="text-slate-700 font-medium">
                  Email Address
                </Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="password"
                  className="text-slate-700 font-medium"
                >
                  Password
                </Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              {isLogin && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300"
                    />
                    <span className="text-slate-600">Remember me</span>
                  </label>
                  <a
                    href="#"
                    className="text-[#033F99] hover:text-[#033F99] font-medium"
                  >
                    Forgot password?
                  </a>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-base bg-gradient-to-r from-[#033F99] to-[#033F99] hover:from-[#033F99] hover:to-[#033F99] text-white font-semibold shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    {isLogin ? "Sign In to IB Commerce" : "Create Account"}
                    <ArrowRight className="h-5 w-5" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-600">
                {isLogin
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-[#033F99] hover:text-[#033F99] font-semibold"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-[#C4D9F4] rounded-xl border border-[#033F99]">
              <p className="text-sm font-semibold text-[#033F99] mb-2">
                Demo Account:
              </p>
              <p className="text-xs text-[#033F99]">
                Email: demo@innovatebooks.com
              </p>
              <p className="text-xs text-[#033F99]">Password: demo123</p>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200 text-center text-xs text-slate-500">
              By signing in, you agree to our Terms of Service and Privacy
              Policy
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CommerceLogin;
