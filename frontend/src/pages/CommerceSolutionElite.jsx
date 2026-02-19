import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingCart,
  CheckCircle,
  ArrowRight,
  Users,
  TrendingUp,
  Package,
  FileText,
  DollarSign,
  CreditCard,
  ShoppingBag,
  Wallet,
  Receipt,
  FileCheck,
  RefreshCw,
  Shield,
  Target,
  Zap,
  BarChart3,
  Clock,
  Award,
  Lock,
  Globe,
  Star,
  Sparkles,
  Activity,
  TrendingDown,
  ChevronRight,
  Layers,
  Workflow,
} from "lucide-react";

const CommerceSolutionElite = () => {
  const [selectedModule, setSelectedModule] = useState(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const modules = [
    {
      id: "lead",
      name: "Lead Management",
      icon: Users,
      gradient: "from-[#033F99] via-[#033F99] to-[#033F99]",
      accentColor: "teal",
      tagline: "AI-Powered Lead Intelligence",
      shortDesc: "Capture, score, and convert leads automatically",
      benefits: [
        "40% Higher Conversion",
        "80% Time Saved",
        "95% Data Accuracy",
      ],
      description:
        "Transform raw leads into qualified opportunities using AI-powered scoring, automatic enrichment from external databases, duplicate detection, and intelligent routing through a comprehensive 9-stage SOP workflow.",
      workflow: [
        {
          step: "Capture",
          desc: "Multi-channel lead intake",
          icon: TrendingUp,
        },
        { step: "Enrich", desc: "Auto-fetch company data", icon: Sparkles },
        {
          step: "Validate",
          desc: "Quality & completeness checks",
          icon: CheckCircle,
        },
        { step: "Score", desc: "AI scoring 0-100 points", icon: Target },
        { step: "Assign", desc: "Intelligent team routing", icon: Users },
        { step: "Convert", desc: "Move to opportunity", icon: TrendingUp },
      ],
      outcomes: [
        { metric: "95%", label: "Data Accuracy", icon: Target },
        { metric: "80%", label: "Time Saved", icon: Clock },
        { metric: "40%", label: "More Conversions", icon: TrendingUp },
        { metric: "100%", label: "Automated", icon: Zap },
      ],
      features: [
        "AI Lead Scoring",
        "Duplicate Detection",
        "Auto-enrichment",
        "Smart Routing",
        "Multi-channel",
        "Real-time Analytics",
      ],
    },
    {
      id: "evaluate",
      name: "Opportunity Evaluation",
      icon: Target,
      gradient: "from-[#033F99] via-[#033F99] to-[#033F99]",
      accentColor: "cyan",
      tagline: "Deal Intelligence Platform",
      shortDesc: "Assess opportunities with precision",
      benefits: ["30% Better Forecast", "25% Faster Cycles", "$2M+ Pipeline"],
      description:
        "Comprehensive deal assessment evaluating technical fit, budget alignment, stakeholder engagement, and timeline feasibility. AI-powered win probability scoring helps prioritize deals and improve forecast accuracy.",
      workflow: [
        { step: "Discover", desc: "Understand customer needs", icon: Activity },
        { step: "Qualify", desc: "BANT analysis", icon: CheckCircle },
        { step: "Technical", desc: "Solution validation", icon: Award },
        { step: "Propose", desc: "Create proposal & pricing", icon: FileText },
        { step: "Negotiate", desc: "Contract terms", icon: DollarSign },
        { step: "Close", desc: "Win or document lessons", icon: Star },
      ],
      outcomes: [
        { metric: "100%", label: "Win Probability", icon: Target },
        { metric: "30%", label: "Better Forecast", icon: BarChart3 },
        { metric: "25%", label: "Faster Cycles", icon: Clock },
        { metric: "$2M", label: "Pipeline Value", icon: DollarSign },
      ],
      features: [
        "Win Probability",
        "BANT Framework",
        "Stakeholder Map",
        "Competitive Intel",
        "Forecast Mgmt",
        "Risk Analysis",
      ],
    },
    {
      id: "commit",
      name: "Contract Management",
      icon: FileText,
      gradient: "from-[#033F99] via-[#033F99] to-[#033F99]",
      accentColor: "teal",
      tagline: "Contract Lifecycle Hub",
      shortDesc: "Manage contracts end-to-end",
      benefits: [
        "50% Faster Processing",
        "100% Renewal Capture",
        "15% Higher Revenue",
      ],
      description:
        "Centralized repository for all contracts with automated workflows, renewal alerts, obligation tracking, compliance monitoring, and e-signature integration. Never miss a renewal or deadline again.",
      workflow: [
        { step: "Draft", desc: "Create from templates", icon: FileText },
        { step: "Review", desc: "Legal approval flow", icon: Award },
        { step: "Negotiate", desc: "Customer redlines", icon: Activity },
        { step: "Execute", desc: "E-signatures", icon: CheckCircle },
        { step: "Track", desc: "Monitor obligations", icon: Clock },
        { step: "Renew", desc: "Auto alerts & renewal", icon: RefreshCw },
      ],
      outcomes: [
        { metric: "50%", label: "Faster Process", icon: Clock },
        { metric: "100%", label: "Renewal Capture", icon: RefreshCw },
        { metric: "15%", label: "Revenue Increase", icon: TrendingUp },
        { metric: "0", label: "Missed Alerts", icon: Zap },
      ],
      features: [
        "Template Library",
        "E-signatures",
        "Approval Flows",
        "Renewal Alerts",
        "Obligation Track",
        "Compliance",
      ],
    },
    {
      id: "execute",
      name: "Order Execution",
      icon: Package,
      gradient: "from-green-500 via-emerald-500 to-[#033F99]",
      accentColor: "green",
      tagline: "Fulfillment Excellence",
      shortDesc: "Track orders from placement to delivery",
      benefits: ["99.5% On-Time", "60% Fewer Errors", "2hr Fulfillment"],
      description:
        "Complete order-to-delivery lifecycle with real-time tracking, inventory management, warehouse integration, logistics coordination, and proof of delivery capture.",
      workflow: [
        { step: "Order", desc: "Receive & validate", icon: ShoppingCart },
        { step: "Inventory", desc: "Check availability", icon: Package },
        { step: "Pick", desc: "Warehouse picking", icon: Activity },
        { step: "Pack", desc: "Quality check", icon: CheckCircle },
        { step: "Ship", desc: "Logistics partner", icon: TrendingUp },
        { step: "Deliver", desc: "POD capture", icon: Award },
      ],
      outcomes: [
        { metric: "99.5%", label: "On-Time Rate", icon: Clock },
        { metric: "60%", label: "Fewer Errors", icon: CheckCircle },
        { metric: "100%", label: "Tracking", icon: Activity },
        { metric: "2hrs", label: "Avg Fulfillment", icon: Zap },
      ],
      features: [
        "Real-time Track",
        "Inventory Mgmt",
        "Warehouse Int.",
        "Logistics",
        "POD Capture",
        "Exception Alerts",
      ],
    },
    {
      id: "bill",
      name: "Billing & Invoicing",
      icon: Receipt,
      gradient: "from-orange-500 via-amber-500 to-yellow-600",
      accentColor: "orange",
      tagline: "Intelligent Invoicing",
      shortDesc: "Automate invoice generation",
      benefits: ["70% Time Saved", "100% GST Compliant", "150+ Currencies"],
      description:
        "Automated invoice creation with multi-currency support, e-invoicing compliance (GST/IRN), recurring billing, tax automation, and payment gateway integration.",
      workflow: [
        { step: "Generate", desc: "Auto-create invoice", icon: Receipt },
        { step: "Calculate", desc: "Tax computation", icon: DollarSign },
        { step: "Comply", desc: "E-invoice GST/IRN", icon: CheckCircle },
        { step: "Send", desc: "Email customer", icon: Activity },
        { step: "Track", desc: "Payment status", icon: Clock },
        { step: "Remind", desc: "Auto follow-ups", icon: Zap },
      ],
      outcomes: [
        { metric: "70%", label: "Time Reduction", icon: Clock },
        { metric: "100%", label: "GST Compliant", icon: CheckCircle },
        { metric: "150+", label: "Currencies", icon: Globe },
        { metric: "25%", label: "Better Collection", icon: TrendingUp },
      ],
      features: [
        "Multi-currency",
        "E-invoicing",
        "Recurring Bill",
        "Tax Auto",
        "Payment Gateway",
        "Milestone Bill",
      ],
    },
    {
      id: "collect",
      name: "Collections",
      icon: DollarSign,
      gradient: "from-emerald-500 via-green-500 to-lime-600",
      accentColor: "emerald",
      tagline: "Cash Flow Optimizer",
      shortDesc: "Accelerate receivables collection",
      benefits: ["35% Lower DSO", "50% More Efficient", "90% Recovery"],
      description:
        "Automated collections tracking outstanding receivables, aging analysis, payment reminders, dispute resolution, and payment plan management to maximize cash flow.",
      workflow: [
        { step: "Track", desc: "Monitor receivables", icon: BarChart3 },
        { step: "Age", desc: "Aging buckets", icon: Clock },
        { step: "Remind", desc: "Auto notifications", icon: Zap },
        { step: "Call", desc: "Team follow-up", icon: Activity },
        { step: "Negotiate", desc: "Payment plans", icon: DollarSign },
        { step: "Collect", desc: "Payment received", icon: CheckCircle },
      ],
      outcomes: [
        { metric: "35%", label: "DSO Reduction", icon: TrendingDown },
        { metric: "50%", label: "More Efficient", icon: Zap },
        { metric: "100%", label: "Payment Links", icon: Globe },
        { metric: "90%", label: "Recovery Rate", icon: Target },
      ],
      features: [
        "Aging Reports",
        "Auto Reminders",
        "Payment Gateway",
        "Dispute Track",
        "Payment Plans",
        "Collection Flow",
      ],
    },
  ];

  const getAccentColor = (color) => {
    const colors = {
      teal: "border-[#033F99] bg-[#C4D9F4]",
      cyan: "border-[#033F99] bg-[#C4D9F4]",
      green: "border-green-500 bg-green-50",
      orange: "border-orange-500 bg-orange-50",
      emerald: "border-emerald-500 bg-emerald-50",
    };
    return colors[color] || "border-[#033F99] bg-[#C4D9F4]";
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-lg z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-xl flex items-center justify-center shadow-lg">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-black text-slate-900">
                IB Commerce
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <Link to="/solutions">
                <button className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition-all">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
              </Link>
              <Link to="/commerce/login">
                <button className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#033F99] to-[#033F99] hover:from-[#033F99] hover:to-[#033F99] text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all">
                  Try Free
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden bg-gradient-to-br from-slate-50 via-[#C4D9F4] to-[#C4D9F4]">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#033F99] rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div
            className="absolute top-40 right-10 w-72 h-72 bg-[#033F99] rounded-full mix-blend-multiply filter blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute bottom-20 left-1/2 w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"
            style={{ animationDelay: "4s" }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg mb-8">
              <Sparkles className="h-4 w-4 text-[#033F99]" />
              <span className="text-sm font-bold bg-gradient-to-r from-[#033F99] to-[#033F99] bg-clip-text text-transparent">
                AI-Powered Commerce Platform
              </span>
            </div>

            <h1
              className="text-7xl md:text-8xl font-black mb-8"
              style={{ fontFamily: "Poppins", lineHeight: "1.1" }}
            >
              <span className="bg-gradient-to-r from-[#033F99] via-[#033F99] to-emerald-600 bg-clip-text text-transparent">
                Complete Commerce
              </span>
              <br />
              <span className="text-slate-900">Intelligence</span>
            </h1>

            <p className="text-2xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
              12 integrated modules. AI automation. SOP-driven workflows.
              Transform every stage of your commerce operations.
            </p>

            <div className="flex flex-wrap gap-4 justify-center mb-16">
              <Link to="/commerce/login">
                <button className="group px-8 py-4 bg-gradient-to-r from-[#033F99] to-[#033F99] hover:from-[#033F99] hover:to-[#033F99] text-white font-bold rounded-xl shadow-2xl hover:shadow-[#033F99] transition-all text-lg flex items-center gap-3">
                  Start Free Trial
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link to="/contact">
                <button className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-900 font-bold rounded-xl shadow-xl border-2 border-slate-200 hover:border-[#033F99] transition-all text-lg">
                  Schedule Demo
                </button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                {
                  value: "12",
                  label: "Modules",
                  icon: Layers,
                  gradient: "from-[#033F99] to-[#033F99]",
                },
                {
                  value: "80%",
                  label: "Efficiency",
                  icon: TrendingUp,
                  gradient: "from-[#033F99] to-emerald-500",
                },
                {
                  value: "AI",
                  label: "Powered",
                  icon: Sparkles,
                  gradient: "from-[#033F99] to-[#033F99]",
                },
                {
                  value: "24/7",
                  label: "Processing",
                  icon: Clock,
                  gradient: "from-emerald-500 to-[#033F99]",
                },
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-slate-200 hover:scale-105 transition-transform"
                  >
                    <div className="flex justify-center mb-3">
                      <div
                        className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <p className="text-4xl font-black text-slate-900 mb-1">
                      {stat.value}
                    </p>
                    <p className="text-sm font-bold text-slate-600">
                      {stat.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2
              className="text-5xl md:text-6xl font-black text-slate-900 mb-6"
              style={{ fontFamily: "Poppins" }}
            >
              Explore Our Modules
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Click any module to discover detailed workflows, outcomes, and
              features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {modules.map((module) => {
              const Icon = module.icon;
              const isExpanded = selectedModule === module.id;

              return (
                <div
                  key={module.id}
                  className={`group relative transition-all duration-300 ${isExpanded ? "md:col-span-2 lg:col-span-3" : ""}`}
                >
                  <div
                    onClick={() =>
                      setSelectedModule(isExpanded ? null : module.id)
                    }
                    className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-slate-50 p-8 border-2 cursor-pointer transition-all ${isExpanded
                        ? "border-[#033F99] shadow-2xl"
                        : "border-slate-200 hover:border-slate-300 hover:shadow-xl"
                      }`}
                  >
                    {/* Gradient Orb */}
                    <div
                      className={`absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br ${module.gradient} opacity-10 rounded-full blur-3xl`}
                    ></div>

                    {/* Card Header */}
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-6">
                        <div
                          className={`w-16 h-16 bg-gradient-to-br ${module.gradient} rounded-2xl flex items-center justify-center shadow-xl transform group-hover:scale-110 group-hover:rotate-3 transition-all`}
                        >
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                        <div className="flex flex-wrap gap-2 justify-end">
                          {module.benefits.slice(0, 1).map((benefit, idx) => (
                            <span
                              key={idx}
                              className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getAccentColor(module.accentColor)}`}
                            >
                              {benefit}
                            </span>
                          ))}
                        </div>
                      </div>

                      <h3 className="text-2xl font-black text-slate-900 mb-2">
                        {module.name}
                      </h3>
                      <p
                        className={`text-sm font-bold mb-3 bg-gradient-to-r ${module.gradient} bg-clip-text text-transparent`}
                      >
                        {module.tagline}
                      </p>
                      <p className="text-slate-700 font-medium mb-6">
                        {module.shortDesc}
                      </p>

                      <button className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all group">
                        {isExpanded ? "Show Less" : "View Details"}
                        <ChevronRight
                          className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : "group-hover:translate-x-1"}`}
                        />
                      </button>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="mt-10 pt-10 border-t-2 border-slate-200 space-y-10">
                        {/* Description */}
                        <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200">
                          <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="h-5 w-5 text-[#033F99]" />
                            <h4 className="text-lg font-black text-slate-900">
                              Overview
                            </h4>
                          </div>
                          <p className="text-slate-700 leading-relaxed">
                            {module.description}
                          </p>
                        </div>

                        {/* Workflow */}
                        <div>
                          <div className="flex items-center gap-2 mb-6">
                            <Workflow className="h-5 w-5 text-[#033F99]" />
                            <h4 className="text-lg font-black text-slate-900">
                              Complete Workflow
                            </h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {module.workflow.map((step, idx) => {
                              const StepIcon = step.icon;
                              return (
                                <div
                                  key={idx}
                                  className="bg-white rounded-xl p-5 shadow-md border border-slate-200 hover:border-[#033F99] hover:shadow-lg transition-all"
                                >
                                  <div className="flex items-start gap-4">
                                    <div
                                      className={`w-12 h-12 bg-gradient-to-br ${module.gradient} rounded-lg flex items-center justify-center flex-shrink-0 shadow-md`}
                                    >
                                      <StepIcon className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                      <h5 className="text-base font-black text-slate-900 mb-1">
                                        {step.step}
                                      </h5>
                                      <p className="text-sm text-slate-600">
                                        {step.desc}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Outcomes */}
                        <div>
                          <div className="flex items-center gap-2 mb-6">
                            <BarChart3 className="h-5 w-5 text-emerald-600" />
                            <h4 className="text-lg font-black text-slate-900">
                              Measurable Outcomes
                            </h4>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {module.outcomes.map((outcome, idx) => {
                              const OutcomeIcon = outcome.icon;
                              return (
                                <div
                                  key={idx}
                                  className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-5 border-2 border-emerald-200 text-center hover:scale-105 transition-transform"
                                >
                                  <div className="flex justify-center mb-3">
                                    <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shadow-md">
                                      <OutcomeIcon className="h-5 w-5 text-white" />
                                    </div>
                                  </div>
                                  <p className="text-3xl font-black text-slate-900 mb-1">
                                    {outcome.metric}
                                  </p>
                                  <p className="text-xs font-bold text-slate-600">
                                    {outcome.label}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Features */}
                        <div>
                          <div className="flex items-center gap-2 mb-6">
                            <Zap className="h-5 w-5 text-amber-600" />
                            <h4 className="text-lg font-black text-slate-900">
                              Key Features
                            </h4>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {module.features.map((feature, idx) => (
                              <div
                                key={idx}
                                className="bg-white rounded-lg px-4 py-3 border-2 border-slate-200 text-center font-bold text-slate-700 text-sm hover:border-[#033F99] hover:bg-[#C4D9F4] transition-all"
                              >
                                {feature}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-20 text-center">
            <div className="inline-block bg-slate-100 rounded-2xl p-8 mb-8">
              <p className="text-slate-700 text-lg mb-2">
                <span className="font-black text-slate-900">
                  Showing 6 of 12 modules.
                </span>{" "}
                Full platform includes:
              </p>
              <p className="text-slate-600 font-medium">
                Procure, Pay, Spend, Tax, Reconcile, and Govern
              </p>
            </div>
            <br />
            <Link to="/commerce/login">
              <button className="px-10 py-4 bg-gradient-to-r from-[#033F99] to-[#033F99] text-white font-bold rounded-xl shadow-2xl hover:shadow-[#033F99] hover:scale-105 transition-all text-lg">
                Explore All 12 Modules
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-slate-900 via-[#033F99] to-[#033F99] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#033F99] rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#033F99] rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2
            className="text-5xl md:text-6xl font-black text-white mb-6"
            style={{ fontFamily: "Poppins" }}
          >
            Ready to Transform?
          </h2>
          <p className="text-2xl text-[#033F99] mb-12">
            Join 500+ businesses automating their commerce operations
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/commerce/login">
              <button className="px-10 py-5 bg-white text-[#033F99] hover:bg-[#C4D9F4] font-black rounded-xl shadow-2xl hover:scale-105 transition-all text-lg">
                Start Free Trial
              </button>
            </Link>
            <Link to="/contact">
              <button className="px-10 py-5 bg-transparent border-3 border-white text-white hover:bg-white/10 font-black rounded-xl transition-all text-lg">
                Contact Sales
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-slate-400">
            © 2025 Innovate Books. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default CommerceSolutionElite;
