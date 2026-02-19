import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../utils/auth";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { toast } from "sonner";
import { TrendingUp, CheckCircle } from "lucide-react";

const LandingPage = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(false);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "Finance Manager",
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log("Attempting login with:", loginData.email);
      const result = await authService.login(loginData);
      console.log("Login result:", result);
      setIsAuthenticated(true);
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      toast.error(
        error.response?.data?.detail || error.message || "Login failed",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.register(registerData);
      setIsAuthenticated(true);
      toast.success("Registration successful!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (showAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50 px-4">
        <Card
          className="w-full max-w-md shadow-2xl border-2 border-[#033F99]/50 rounded-3xl"
          data-testid="auth-card"
        >
          <CardHeader>
            <div className="flex flex-col items-center justify-center mb-4">
              <img
                src="/innovate-books-logo.png"
                alt="Innovate Books"
                className="h-20 w-auto object-contain mb-4"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <div className="text-center">
                <h2
                  className="text-3xl font-black bg-gradient-to-r from-[#033F99] via-[#033F99] to-[#033F99] bg-clip-text text-transparent"
                  style={{ fontFamily: "Poppins" }}
                >
                  IB Finance
                </h2>
                <p className="text-sm text-[#033F99] font-bold">
                  Financial Intelligence OS
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-[#033F99] rounded-xl p-1">
                <TabsTrigger
                  value="login"
                  data-testid="login-tab"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#033F99] data-[state=active]:to-[#033F99] data-[state=active]:text-white font-bold rounded-lg"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  data-testid="register-tab"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#033F99] data-[state=active]:to-[#033F99] data-[state=active]:text-white font-bold rounded-lg"
                >
                  Register
                </TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form
                  onSubmit={handleLogin}
                  className="space-y-5"
                  data-testid="login-form"
                >
                  <div>
                    <Label
                      htmlFor="login-email"
                      className="text-[#033F99] font-bold"
                    >
                      Email
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      data-testid="login-email-input"
                      placeholder="you@example.com"
                      value={loginData.email}
                      onChange={(e) =>
                        setLoginData({ ...loginData, email: e.target.value })
                      }
                      required
                      className="border-2 border-[#033F99] focus:border-[#033F99] rounded-xl mt-2"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="login-password"
                      className="text-[#033F99] font-bold"
                    >
                      Password
                    </Label>
                    <Input
                      id="login-password"
                      type="password"
                      data-testid="login-password-input"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData({ ...loginData, password: e.target.value })
                      }
                      required
                      className="border-2 border-[#033F99] focus:border-[#033F99] rounded-xl mt-2"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#033F99] to-[#033F99] hover:from-[#033F99] hover:to-[#033F99] text-white font-black py-6 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105"
                    disabled={loading}
                    data-testid="login-submit-btn"
                  >
                    {loading ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="register">
                <form
                  onSubmit={handleRegister}
                  className="space-y-5"
                  data-testid="register-form"
                >
                  <div>
                    <Label
                      htmlFor="register-name"
                      className="text-[#033F99] font-bold"
                    >
                      Full Name
                    </Label>
                    <Input
                      id="register-name"
                      type="text"
                      data-testid="register-name-input"
                      placeholder="John Doe"
                      value={registerData.full_name}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          full_name: e.target.value,
                        })
                      }
                      required
                      className="border-2 border-[#033F99] focus:border-[#033F99] rounded-xl mt-2"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="register-email"
                      className="text-[#033F99] font-bold"
                    >
                      Email
                    </Label>
                    <Input
                      id="register-email"
                      type="email"
                      data-testid="register-email-input"
                      placeholder="you@example.com"
                      value={registerData.email}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          email: e.target.value,
                        })
                      }
                      required
                      className="border-2 border-[#033F99] focus:border-[#033F99] rounded-xl mt-2"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="register-password"
                      className="text-[#033F99] font-bold"
                    >
                      Password
                    </Label>
                    <Input
                      id="register-password"
                      type="password"
                      data-testid="register-password-input"
                      placeholder="••••••••"
                      value={registerData.password}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          password: e.target.value,
                        })
                      }
                      required
                      className="border-2 border-[#033F99] focus:border-[#033F99] rounded-xl mt-2"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#033F99] to-[#033F99] hover:from-[#033F99] hover:to-[#033F99] text-white font-black py-6 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105"
                    disabled={loading}
                    data-testid="register-submit-btn"
                  >
                    {loading ? "Creating Account..." : "Register"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            <div className="mt-6 text-center">
              <Button
                variant="ghost"
                onClick={() => setShowAuth(false)}
                data-testid="back-to-home-btn"
                className="text-[#033F99] hover:text-[#033F99] font-bold"
              >
                ← Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen landing-hero">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-2 rounded-full mb-8 shadow-sm">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium" style={{ color: "#033F99" }}>
              Trusted by 500+ finance teams
            </span>
          </div>

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img
              src="/innovate-books-logo.png"
              alt="Innovate Books"
              className="h-24 w-auto object-contain"
            />
          </div>

          {/* Main Heading */}
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-semibold mb-6 leading-tight"
            style={{ fontFamily: "Poppins", color: "#033F99" }}
            data-testid="hero-heading"
          >
            A Financial Intelligence OS for the Modern World.
          </h1>

          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-medium mb-8"
            style={{ fontFamily: "Poppins", color: "#1a1a1a" }}
          >
            From Transaction → to Truth → to Action.
          </h2>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed">
            Not just an accounting tool — a complete financial brain. Unify
            every layer of business finance into one living system.
            <br />
            <span className="font-semibold text-gray-900">IB Finance</span> -
            Where data becomes understanding, and understanding becomes
            strategy.
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl"
              style={{ background: "#033F99" }}
              onClick={() => setShowAuth(true)}
              data-testid="get-started-btn"
            >
              Get Started →
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-20">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg card-hover">
              <TrendingUp
                className="h-10 w-10 mb-4"
                style={{ color: "#033F99" }}
              />
              <h3
                className="text-xl font-semibold mb-2"
                style={{ fontFamily: "Inter", color: "#033F99" }}
              >
                Real-time Insights
              </h3>
              <p className="text-gray-600">
                AI-powered analysis for instant financial clarity
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg card-hover">
              <TrendingUp
                className="h-10 w-10 mb-4"
                style={{ color: "#033F99" }}
              />
              <h3
                className="text-xl font-semibold mb-2"
                style={{ fontFamily: "Inter", color: "#033F99" }}
              >
                Smart Automation
              </h3>
              <p className="text-gray-600">
                Automate collections, payments & reconciliation
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg card-hover">
              <TrendingUp
                className="h-10 w-10 mb-4"
                style={{ color: "#033F99" }}
              />
              <h3
                className="text-xl font-semibold mb-2"
                style={{ fontFamily: "Inter", color: "#033F99" }}
              >
                Complete Visibility
              </h3>
              <p className="text-gray-600">
                Unified view of AR, AP, Banking & Cash Flow
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
