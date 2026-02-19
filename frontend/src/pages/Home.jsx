import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  TrendingUp,
  CheckCircle,
  Brain,
  Zap,
  Shield,
  Network,
  Heart,
  ArrowRight,
  BarChart3,
  Users,
  Building2,
  Landmark,
  FileText,
  ShoppingCart,
  Sparkles,
  Target,
  Globe,
  LogIn,
  UserPlus,
} from "lucide-react";

const Home = () => {
  const solutions = [
    {
      name: "Commerce",
      color: "from-[#033F99] to-[#033F99]",
      icon: ShoppingCart,
      description: "Customer, revenue, vendor intelligence",
      path: "/solutions/commerce",
    },
    {
      name: "Workforce",
      color: "from-[#033F99] to-[#033F99]",
      icon: Users,
      description: "Human ROI, payroll, cost mapping",
      path: "/solutions/workforce",
    },
    {
      name: "Capital",
      color: "from-purple-600 to-purple-700",
      icon: Landmark,
      description: "Cash, credit, and treasury optimization",
      path: "/solutions/capital",
    },
    {
      name: "Operations",
      color: "from-amber-600 to-amber-700",
      icon: Building2,
      description: "Assets, projects, and operational tracking",
      path: "/solutions/operations",
    },
    {
      name: "Finance",
      color: "from-[#033F99] to-[#033F99]",
      icon: FileText,
      description: "FP&A, accounting, budgeting, and forecasting",
      path: "/solutions/finance",
    },
  ];

  const features = [
    {
      title: "Transaction Genome Engine",
      description:
        "Every transaction carries financial DNA - understand the story behind the numbers",
      icon: Brain,
    },
    {
      title: "Human Capital Ledger",
      description: "Transform workforce data into measurable financial ROI",
      icon: Users,
    },
    {
      title: "Capital Autopilot",
      description: "AI-powered liquidity management that thinks ahead",
      icon: Zap,
    },
    {
      title: "Operations Digital Twin",
      description:
        "Simulate financial outcomes of operational decisions in real-time",
      icon: Building2,
    },
    {
      title: "Adaptive Finance Engine",
      description:
        "Self-healing ledgers with AI-powered account classification",
      icon: Landmark,
    },
    {
      title: "CFO Copilot",
      description:
        "Conversational AI that answers complex financial questions instantly",
      icon: FileText,
    },
  ];

  const moatStructure = [
    {
      type: "Architecture",
      description: "Two-layer OS design",
      longevity: "Structural",
    },
    {
      type: "Intelligence",
      description: "Learns from usage",
      longevity: "Compounding",
    },
    { type: "Compliance", description: "Auto-adaptive", longevity: "Global" },
    {
      type: "Ecosystem",
      description: "Plug-in micro-AIs",
      longevity: "Network",
    },
    {
      type: "Experience",
      description: "Decision-first UX",
      longevity: "Emotional",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50">
      {/* Navigation - Matching Lead Module Design */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-xl z-50 border-b-2 border-[#033F99]/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/innovate-books-logo-new.png"
                alt="Innovate Books"
                className="h-12 w-auto"
              />
              <div className="hidden sm:block">
                <span
                  className="font-bold text-2xl bg-gradient-to-r from-[#033F99] via-[#033F99] to-[#033F99] bg-clip-text text-transparent"
                  style={{ fontFamily: "Poppins" }}
                >
                  Innovate Books
                </span>
              </div>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link
                to="/solutions"
                className="text-[#033F99] hover:text-[#033F99] font-semibold transition-colors text-lg"
              >
                Solutions
              </Link>
              <Link
                to="/insights"
                className="text-[#033F99] hover:text-[#033F99] font-semibold transition-colors text-lg"
              >
                Insights
              </Link>
              <Link
                to="/intelligence"
                className="text-[#033F99] hover:text-[#033F99] font-semibold transition-colors text-lg"
              >
                Intelligence
              </Link>
              <Link
                to="/about"
                className="text-[#033F99] hover:text-[#033F99] font-semibold transition-colors text-lg"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="text-[#033F99] hover:text-[#033F99] font-semibold transition-colors text-lg"
              >
                Contact
              </Link>
              <Link to="/auth/login">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#033F99] to-[#033F99] hover:from-[#033F99] hover:to-[#033F99] text-white font-bold rounded-2xl shadow-xl shadow-[#033F99]/50 hover:shadow-[#033F99]/60 transition-all duration-300 transform hover:scale-105 px-6 py-3 flex items-center gap-2"
                >
                  <LogIn className="h-5 w-5" />
                  Login
                </Button>
              </Link>
              <Link to="/auth/signup">
                <Button
                  size="lg"
                  className="bg-white text-[#033F99] border-2 border-[#033F99] hover:bg-[#C4D9F4] font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-6 py-3 flex items-center gap-2"
                >
                  <UserPlus className="h-5 w-5" />
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Matching Lead Module Design */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50 relative overflow-hidden">
        {/* Background decoration - Cyan theme */}
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 bg-[#033F99] rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-40 w-48 h-48 bg-[#033F99] rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1
              className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight bg-gradient-to-r from-[#033F99] via-[#033F99] to-[#033F99] bg-clip-text text-transparent"
              style={{ fontFamily: "Poppins" }}
            >
              Financial Intelligence OS <br />
              <span className="bg-gradient-to-r from-[#033F99] via-[#033F99] to-[#033F99] bg-clip-text text-transparent">
                for the Modern Enterprise
              </span>
            </h1>

            <p
              className="text-xl text-[#033F99] mb-12 max-w-3xl mx-auto leading-relaxed font-medium"
              style={{ fontFamily: "Inter" }}
            >
              Transform financial data into strategic decisions. Automate
              accounting, forecast with AI, and gain real-time insights across
              your entire business.
            </p>

            <div className="flex justify-center items-center gap-6 mb-16 flex-wrap">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#033F99] to-[#033F99] hover:from-[#033F99] hover:to-[#033F99] text-white font-black shadow-2xl shadow-[#033F99]/50 hover:shadow-[#033F99]/60 transition-all duration-300 transform hover:scale-105 px-12 py-7 text-xl rounded-2xl"
                asChild
              >
                <Link to="/auth/signup" className="flex items-center gap-3">
                  <Sparkles className="h-6 w-6" />
                  Try Innovate Books Free
                </Link>
              </Button>
              <Button
                size="lg"
                className="bg-white text-[#033F99] border-3 border-[#033F99] hover:bg-[#C4D9F4] font-black shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-12 py-7 text-xl rounded-2xl"
                asChild
              >
                <Link to="/contact">Schedule Demo</Link>
              </Button>
            </div>

            {/* Powered by AI - Enhanced Design with Cyan theme */}
            <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border-2 border-[#033F99]/50 hover:border-[#033F99] transition-all">
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-[#033F99] to-[#033F99] px-10 py-4 rounded-full shadow-2xl">
                  <span className="text-white text-base font-black flex items-center gap-3">
                    <Brain className="h-6 w-6" />
                    Powered by Advanced Financial AI
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-6">
                <div className="text-center group">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-12 w-12 text-white" />
                  </div>
                  <p className="text-lg font-black text-[#033F99]">
                    Real-Time Intelligence
                  </p>
                  <p className="text-sm text-[#033F99] mt-2 font-semibold">
                    Live data processing every second
                  </p>
                </div>
                <div className="text-center group">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-purple-700 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl group-hover:scale-110 transition-transform">
                    <Brain className="h-12 w-12 text-white" />
                  </div>
                  <p className="text-lg font-black text-[#033F99]">
                    Predictive Analytics
                  </p>
                  <p className="text-sm text-[#033F99] mt-2 font-semibold">
                    AI-powered forecasting engine
                  </p>
                </div>
                <div className="text-center group">
                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-600 to-[#033F99] rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl group-hover:scale-110 transition-transform">
                    <Zap className="h-12 w-12 text-white" />
                  </div>
                  <p className="text-lg font-black text-[#033F99]">
                    Automated Decisions
                  </p>
                  <p className="text-sm text-[#033F99] mt-2 font-semibold">
                    Smart recommendations 24/7
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section - Cyan Theme */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-5xl font-black mb-6 bg-gradient-to-r from-[#033F99] via-[#033F99] to-[#033F99] bg-clip-text text-transparent"
              style={{ fontFamily: "Poppins" }}
            >
              The Challenge with Traditional Finance Systems
            </h2>
            <p className="text-[#033F99] text-xl max-w-3xl mx-auto font-semibold">
              Finance teams waste 60% of their time on manual data assembly
              instead of strategic analysis. Fragmented tools create blind
              spots.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                icon: FileText,
                label: "Legacy ERP",
                description:
                  "Records transactions without context or intelligence",
              },
              {
                icon: BarChart3,
                label: "BI Tools",
                description:
                  "Creates static reports, misses real-time insights",
              },
              {
                icon: FileText,
                label: "Spreadsheets",
                description: "Manual, error-prone, impossible to scale",
              },
              {
                icon: Brain,
                label: "Disconnected Data",
                description: "Siloed systems prevent unified decision-making",
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={`item-${index}`}
                  className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl border-2 border-[#033F99]/50 hover:border-[#033F99] hover:shadow-2xl transition-all duration-300 text-center group"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-black text-xl mb-3 text-[#033F99]">
                    {item.label}
                  </h3>
                  <p className="text-[#033F99] text-sm leading-relaxed font-semibold">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trusted By Section - Cyan Theme */}
      <section className="py-16 px-4 bg-gradient-to-r from-[#C4D9F4] to-white border-y-2 border-[#033F99]">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-[#033F99] text-sm uppercase tracking-wider mb-8 font-black">
            Trusted by Finance Teams at Leading Companies
          </p>
          <div className="flex justify-center items-center gap-12 flex-wrap">
            {[
              "TechCorp",
              "FinServe",
              "GrowthHub",
              "ScaleUp",
              "VentureX",
              "InnovateLabs",
            ].map((company, i) => (
              <div
                key={`item-${i}`}
                className="text-2xl font-black text-[#033F99]/40 hover:text-[#033F99] transition-colors"
              >
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision Section - Cyan Theme */}
      <section className="py-24 px-4 bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50">
        <div className="max-w-6xl mx-auto text-center">
          <h2
            className="text-5xl font-black mb-8 bg-gradient-to-r from-[#033F99] via-[#033F99] to-[#033F99] bg-clip-text text-transparent"
            style={{ fontFamily: "Poppins" }}
          >
            From Transaction → to Truth → to Action
          </h2>
          <p className="text-2xl text-[#033F99] mb-16 max-w-3xl mx-auto font-semibold">
            Innovate Books unifies every layer of business finance into one
            intelligent, living system that learns and adapts.
          </p>

          <div className="flex items-center justify-center gap-6 flex-wrap mb-16">
            {["Transaction", "Context", "Insight", "Action"].map(
              (step, index) => (
                <React.Fragment key={`item-${index}`}>
                  <div className="bg-gradient-to-r from-[#033F99] to-[#033F99] text-white px-12 py-6 rounded-2xl font-black text-xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105">
                    {step}
                  </div>
                  {index < 3 && (
                    <ArrowRight className="h-8 w-8 text-[#033F99]" />
                  )}
                </React.Fragment>
              ),
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {[
              {
                title: "Real-Time Intelligence",
                desc: "Live financial data updated every second",
                icon: Zap,
              },
              {
                title: "AI-Powered Insights",
                desc: "Predictive analytics and smart recommendations",
                icon: Brain,
              },
              {
                title: "Unified Platform",
                desc: "One source of truth for all financial data",
                icon: Network,
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={`item-${i}`}
                  className="text-center p-8 rounded-3xl bg-white/70 backdrop-blur-xl border-2 border-[#033F99]/50 hover:border-[#033F99] hover:shadow-2xl transition-all"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <Icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="font-black text-xl mb-3 text-[#033F99]">
                    {item.title}
                  </h3>
                  <p className="text-[#033F99] font-semibold">{item.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-12">
            <Button
              size="lg"
              className="bg-gradient-to-r from-[#033F99] to-[#033F99] hover:from-[#033F99] hover:to-[#033F99] text-white font-black shadow-2xl hover:shadow-3xl px-12 py-6 text-xl rounded-2xl transition-all duration-300 transform hover:scale-105"
              asChild
            >
              <Link to="/solutions">Explore All Solutions →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section id="architecture" className="py-24 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-4xl font-bold text-center mb-6 text-slate-900"
            style={{ fontFamily: "Poppins" }}
          >
            The Two-Layer Financial Intelligence Architecture
          </h2>
          <p className="text-center text-slate-600 mb-16 text-lg max-w-3xl mx-auto">
            Solutions Layer + Insights Layer = Complete Financial Intelligence.
            Every module is interconnected in real-time.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Solutions Layer */}
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h3
                  className="text-2xl font-bold text-blue-600"
                  style={{ fontFamily: "Poppins" }}
                >
                  Solutions Layer
                </h3>
              </div>
              <p className="text-slate-600 mb-6">
                Operational modules where financial data originates
              </p>
              <div className="space-y-3">
                {solutions.map((solution, index) => {
                  const Icon = solution.icon;
                  return (
                    <div
                      key={`item-${index}`}
                      className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-slate-100 group"
                    >
                      <div
                        className={`w-12 h-12 bg-gradient-to-br ${solution.color} rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">
                          {solution.name}
                        </div>
                        <div className="text-sm text-slate-600">
                          {solution.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Insights Layer */}
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <h3
                  className="text-2xl font-bold text-violet-600"
                  style={{ fontFamily: "Poppins" }}
                >
                  Insights Layer
                </h3>
              </div>
              <p className="text-slate-600 mb-6">
                Intelligence engine where strategic decisions are powered
              </p>
              <div className="space-y-3">
                {[
                  "Cashflow Intelligence",
                  "Profitability Analysis",
                  "Performance Metrics",
                  "Scenario Planning",
                  "Collaborative Workspace",
                  "Automated Reports",
                ].map((insight, index) => (
                  <div
                    key={`item-${index}`}
                    className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-slate-100"
                  >
                    <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-violet-600" />
                    </div>
                    <div className="font-semibold text-slate-900">
                      {insight}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features - Cyan Theme */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-5xl font-black text-center mb-6 bg-gradient-to-r from-[#033F99] via-[#033F99] to-[#033F99] bg-clip-text text-transparent"
            style={{ fontFamily: "Poppins" }}
          >
            Enterprise-Grade Financial Intelligence
          </h2>
          <p className="text-center text-[#033F99] mb-16 text-xl max-w-3xl mx-auto font-semibold">
            Powered by proprietary AI engines and advanced automation that
            transform how finance teams operate
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={`item-${index}`}
                  className="p-10 rounded-3xl bg-white/70 backdrop-blur-xl border-2 border-[#033F99]/50 hover:border-[#033F99] hover:shadow-2xl transition-all duration-300 group"
                >
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#033F99] to-[#033F99] flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 transition-transform">
                    <Icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-black mb-4 text-[#033F99]">
                    {feature.title}
                  </h3>
                  <p className="text-[#033F99] leading-relaxed font-semibold">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Global Moat Structure */}
      <section className="py-24 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-4xl font-bold text-center mb-4 text-slate-900"
            style={{ fontFamily: "Poppins" }}
          >
            Built for Sustainable Competitive Advantage
          </h2>
          <p className="text-center text-slate-600 mb-16 text-lg max-w-3xl mx-auto">
            Five strategic moats that strengthen over time, creating an
            increasingly defensible market position
          </p>

          <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-slate-200">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                <tr>
                  <th className="px-8 py-5 text-left font-semibold text-base">
                    Moat Type
                  </th>
                  <th className="px-8 py-5 text-left font-semibold text-base">
                    Description
                  </th>
                  <th className="px-8 py-5 text-left font-semibold text-base">
                    Advantage
                  </th>
                </tr>
              </thead>
              <tbody>
                {moatStructure.map((moat, index) => (
                  <tr
                    key={`item-${index}`}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-8 py-5 font-semibold text-blue-600">
                      {moat.type}
                    </td>
                    <td className="px-8 py-5 text-slate-600">
                      {moat.description}
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                        {moat.longevity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-4xl font-bold text-center mb-4 text-slate-900"
            style={{ fontFamily: "Poppins" }}
          >
            Trusted by Leading Finance Teams
          </h2>
          <p className="text-center text-slate-600 mb-16 text-lg max-w-2xl mx-auto">
            CFOs and finance leaders rely on Innovate Books to transform their
            financial operations
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "Innovate Books cut our month-end close time from 12 days to 3 days. The AI-powered reconciliation is a game-changer.",
                author: "Rajesh Kumar",
                role: "CFO, TechVentures India",
                company: "₹450Cr ARR SaaS Company",
              },
              {
                quote:
                  "Real-time P&L visibility has transformed how we make decisions. We can now forecast with 95% accuracy.",
                author: "Priya Sharma",
                role: "VP Finance, GrowthCo",
                company: "Series B Startup",
              },
              {
                quote:
                  "The Human Capital Ledger helped us optimize our workforce allocation and improve per-employee revenue by 23%.",
                author: "Amit Patel",
                role: "Head of Finance, ScaleUp Ltd",
                company: "₹200Cr Revenue",
              },
            ].map((testimonial, index) => (
              <div
                key={`item-${index}`}
                className="bg-slate-50 p-8 rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all"
              >
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-yellow-400 text-xl">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-slate-700 mb-6 leading-relaxed italic">
                  "{testimonial.quote}"
                </p>
                <div className="border-t border-slate-200 pt-4">
                  <p className="font-semibold text-slate-900">
                    {testimonial.author}
                  </p>
                  <p className="text-sm text-slate-600">{testimonial.role}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {testimonial.company}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section - Cyan Theme */}
      <section className="py-20 px-4 bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { value: "500+", label: "Finance Teams" },
              { value: "₹10,000Cr+", label: "Transactions Processed" },
              { value: "75%", label: "Faster Month-End Close" },
              { value: "95%", label: "Forecast Accuracy" },
            ].map((stat, index) => (
              <div
                key={`item-${index}`}
                className="bg-white/70 backdrop-blur-xl p-10 rounded-3xl border-2 border-[#033F99]/50 hover:border-[#033F99] hover:shadow-2xl transition-all duration-300"
              >
                <p className="text-6xl font-black bg-gradient-to-r from-[#033F99] to-[#033F99] bg-clip-text text-transparent mb-4">
                  {stat.value}
                </p>
                <p className="text-[#033F99] font-bold text-lg">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Banner - Cyan Theme */}
      <section className="py-24 px-4 bg-gradient-to-br from-[#033F99] via-[#033F99] to-[#033F99] relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#033F99] rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-lg px-8 py-4 rounded-full mb-8 border-2 border-white/30">
            <Sparkles className="h-6 w-6 text-white" />
            <span className="text-white text-base font-black">
              Join 500+ Leading Finance Teams
            </span>
          </div>

          <h2
            className="text-6xl font-black text-white mb-8"
            style={{ fontFamily: "Poppins" }}
          >
            Transform Your Financial Operations Today
          </h2>
          <p className="text-2xl text-[#C4D9F4] mb-12 max-w-2xl mx-auto leading-relaxed font-semibold">
            Experience the power of a complete Financial Intelligence OS.
            Automate workflows, gain real-time insights, and make strategic
            decisions with confidence.
          </p>

          <div className="flex justify-center gap-6 flex-wrap">
            <Button
              size="lg"
              className="bg-white text-[#033F99] hover:bg-[#C4D9F4] font-black shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 px-12 py-7 text-xl rounded-2xl"
              asChild
            >
              <Link to="/auth/signup" className="flex items-center gap-3">
                <Sparkles className="h-6 w-6" />
                Start Free 30-Day Trial
              </Link>
            </Button>
            <Button
              size="lg"
              className="text-white border-3 border-white hover:bg-white/10 font-black shadow-xl hover:shadow-2xl backdrop-blur-lg transition-all duration-300 transform hover:scale-105 px-12 py-7 text-xl rounded-2xl"
              asChild
            >
              <Link to="/contact">Schedule a Demo</Link>
            </Button>
          </div>

          <div className="mt-10 flex items-center justify-center gap-8 text-base text-[#C4D9F4] flex-wrap">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6" />
              <span className="font-semibold">No credit card required</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6" />
              <span className="font-semibold">Full platform access</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6" />
              <span className="font-semibold">Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Cyan Theme */}
      <footer className="bg-gradient-to-br from-[#033F99] via-[#033F99] to-slate-900 text-white py-16 px-4 border-t-4 border-[#033F99]">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <img
                  src="/innovate-books-logo-new.png"
                  alt="Innovate Books"
                  className="h-10 w-auto"
                />
                <span
                  className="font-black text-xl bg-gradient-to-r from-[#033F99] to-[#033F99] bg-clip-text text-transparent"
                  style={{ fontFamily: "Poppins" }}
                >
                  Innovate Books
                </span>
              </div>
              <p className="text-[#033F99] text-sm font-semibold">
                Financial Intelligence OS for the Modern Enterprise
              </p>
            </div>
            <div>
              <h4
                className="font-black mb-4 text-base text-[#033F99]"
                style={{ fontFamily: "Poppins" }}
              >
                Product
              </h4>
              <div className="space-y-3">
                <Link
                  to="/solutions"
                  className="block text-[#033F99] hover:text-white transition-colors text-sm font-semibold"
                >
                  All Solutions
                </Link>
                <Link
                  to="/insights"
                  className="block text-[#033F99] hover:text-white transition-colors text-sm font-semibold"
                >
                  Insights
                </Link>
                <Link
                  to="/intelligence"
                  className="block text-[#033F99] hover:text-white transition-colors text-sm font-semibold"
                >
                  Intelligence
                </Link>
                <a
                  href="#"
                  className="block text-[#033F99] hover:text-white transition-colors text-sm font-semibold"
                >
                  Pricing
                </a>
              </div>
            </div>
            <div>
              <h4
                className="font-black mb-4 text-base text-[#033F99]"
                style={{ fontFamily: "Poppins" }}
              >
                Company
              </h4>
              <div className="space-y-3">
                <Link
                  to="/about"
                  className="block text-[#033F99] hover:text-white transition-colors text-sm font-semibold"
                >
                  About Us
                </Link>
                <a
                  href="#"
                  className="block text-[#033F99] hover:text-white transition-colors text-sm font-semibold"
                >
                  Careers
                </a>
                <a
                  href="#"
                  className="block text-[#033F99] hover:text-white transition-colors text-sm font-semibold"
                >
                  Blog
                </a>
                <a
                  href="#"
                  className="block text-[#033F99] hover:text-white transition-colors text-sm font-semibold"
                >
                  Newsroom
                </a>
              </div>
            </div>
            <div>
              <h4
                className="font-black mb-4 text-base text-[#033F99]"
                style={{ fontFamily: "Poppins" }}
              >
                Contact
              </h4>
              <div className="space-y-3 text-[#033F99] text-sm font-semibold">
                <p>contact@innovatebooks.in</p>
                <p>+91 XXX XXX XXXX</p>
                <Link
                  to="/contact"
                  className="block text-[#033F99] hover:text-[#033F99] transition-colors font-bold"
                >
                  Get in Touch →
                </Link>
                <div className="mt-6 flex gap-4">
                  <Link to="/auth/login">
                    <button className="bg-gradient-to-r from-[#033F99] to-[#033F99] hover:from-[#033F99] hover:to-[#033F99] text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2">
                      <LogIn className="h-5 w-5" />
                      Login
                    </button>
                  </Link>
                  <Link to="/auth/signup">
                    <button className="bg-white text-[#033F99] border-2 border-[#033F99] hover:bg-[#C4D9F4] font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2">
                      <UserPlus className="h-5 w-5" />
                      Sign Up
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t-2 border-[#033F99] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[#033F99] text-sm font-semibold">
              &copy; 2025 Innovate Books. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-[#033F99] font-semibold">
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Security
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
