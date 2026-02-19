import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  CheckCircle,
  Brain,
  Zap,
  Shield,
  ArrowRight,
  BarChart3,
  Users,
  Building2,
  Sparkles,
  Target,
  Clock,
  CreditCard,
  FileText,
  PieChart,
  Calculator,
  Globe,
  Lock,
  Play,
  ChevronRight,
  Star,
  Award,
  Briefcase,
  Layers,
} from "lucide-react";
import SharedNavigation from "../components/SharedNavigation";
import {
  AnimatedCounter,
  TrustMarquee,
  TestimonialCarousel,
  FAQAccordion,
  SecurityBadges,
  StickyCTA,
} from "../components/interactive";

const HomeNew = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isVisible, setIsVisible] = useState({});

  // Intersection observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 },
    );

    document.querySelectorAll("[data-animate]").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const solutions = [
    {
      id: "commerce",
      label: "Commerce",
      icon: CreditCard,
      title: "IB Commerce",
      subtitle: "Commercial Governance",
      description:
        "End-to-end commercial operations from leads to collections with complete audit trails.",
      features: [
        "Pipeline Management",
        "Contract Lifecycle",
        "Revenue Recognition",
        "Collections Automation",
      ],
      link: "/solutions/commerce",
      color: "#033F99",
    },
    {
      id: "finance",
      label: "Finance",
      icon: Calculator,
      title: "IB Finance",
      subtitle: "Financial System of Record",
      description:
        "Complete financial operations with real-time reporting and automated reconciliation.",
      features: [
        "Multi-Entity Accounting",
        "Bank Reconciliation",
        "Financial Statements",
        "Tax Compliance",
      ],
      link: "/solutions/finance",
      color: "#033F99",
    },
    {
      id: "operations",
      label: "Operations",
      icon: Layers,
      title: "IB Operations",
      subtitle: "Execution & Delivery Control",
      description:
        "Project and service delivery with resource planning and real-time tracking.",
      features: [
        "Project Management",
        "Resource Planning",
        "Time Tracking",
        "Delivery Milestones",
      ],
      link: "/solutions/operations",
      color: "#033F99",
    },
    {
      id: "workforce",
      label: "Workforce",
      icon: Users,
      title: "IB Workforce",
      subtitle: "People & Payroll",
      description:
        "Employee lifecycle, payroll processing, and compliance all in one place.",
      features: [
        "Employee Management",
        "Payroll Processing",
        "Leave & Attendance",
        "Compliance Reports",
      ],
      link: "/solutions/workforce",
      color: "#033F99",
    },
    {
      id: "capital",
      label: "Capital",
      icon: TrendingUp,
      title: "IB Capital",
      subtitle: "Ownership & Treasury",
      description:
        "Cap table management, funding rounds, and treasury operations for growing companies.",
      features: [
        "Cap Table",
        "Funding Rounds",
        "Investor Relations",
        "Treasury Management",
      ],
      link: "/solutions/capital",
      color: "#033F99",
    },
  ];

  const stats = [
    { value: 500, suffix: "+", label: "Enterprise Clients", icon: Building2 },
    {
      value: 10000,
      prefix: "₹",
      suffix: "Cr+",
      label: "Transactions Processed",
      icon: TrendingUp,
    },
    { value: 75, suffix: "%", label: "Faster Month-End", icon: Clock },
    { value: 99.9, suffix: "%", label: "Uptime SLA", icon: Shield },
  ];

  const problems = [
    {
      icon: BarChart3,
      title: "Spreadsheet Chaos",
      description:
        "Hours lost in manual data entry, version conflicts, and error-prone reconciliations.",
      stat: "60%",
      statLabel: "time wasted",
    },
    {
      icon: Clock,
      title: "Slow Month-End Close",
      description:
        "Week-long processes that drain resources and delay critical business decisions.",
      stat: "7 days",
      statLabel: "average close time",
    },
    {
      icon: Target,
      title: "Blind Spot Decisions",
      description:
        "No real-time visibility into cash flow, making planning feel like guesswork.",
      stat: "40%",
      statLabel: "forecast errors",
    },
    {
      icon: Users,
      title: "Disconnected Systems",
      description:
        "Data scattered across CRM, ERP, and spreadsheets that never quite sync.",
      stat: "5+",
      statLabel: "separate tools",
    },
  ];

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Insights",
      description:
        "Predictive analytics that identify risks and opportunities before they happen",
    },
    {
      icon: Zap,
      title: "Real-Time Dashboards",
      description:
        "Live visibility into every aspect of your financial operations",
    },
    {
      icon: Shield,
      title: "Bank-Level Security",
      description:
        "256-bit encryption, SOC 2 compliance, and complete audit trails",
    },
    {
      icon: Globe,
      title: "Multi-Entity Ready",
      description:
        "Manage multiple companies, currencies, and jurisdictions effortlessly",
    },
    {
      icon: FileText,
      title: "Instant Reports",
      description: "Generate P&L, Balance Sheet, and custom reports in seconds",
    },
    {
      icon: Lock,
      title: "Compliance Built-In",
      description: "Stay GST, TDS, and regulatory compliant automatically",
    },
  ];

  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "CFO",
      company: "TechVentures India",
      content:
        "Innovate Books cut our month-end close from 7 days to just 4 hours. The AI-powered reconciliation alone saved us 40 hours per month.",
      rating: 5,
    },
    {
      name: "Priya Sharma",
      role: "Finance Director",
      company: "RetailMax",
      content:
        "Finally, a platform that actually connects sales, operations, and finance. We can make decisions in real-time now instead of waiting for reports.",
      rating: 5,
    },
    {
      name: "Arun Mehta",
      role: "CEO",
      company: "ManufacturePro",
      content:
        "The intelligence module predicted a cash crunch 3 weeks before it would have hit us. That single insight paid for 5 years of subscription.",
      rating: 5,
    },
  ];

  const faqs = [
    {
      question:
        "What makes Innovate Books different from traditional accounting software?",
      answer:
        "Innovate Books is not just accounting software—it's a Business Operating System. While traditional tools handle transactions, we connect your entire business lifecycle: from lead to contract to delivery to billing to payroll. Everything is context-aware, governed, and intelligent.",
    },
    {
      question: "How long does implementation take?",
      answer:
        "Most companies are live within 2-4 weeks. Our implementation team handles data migration, system configuration, and team training. We don't just hand you software—we ensure you succeed with it.",
    },
    {
      question: "Can I migrate from my existing accounting software?",
      answer:
        "Yes! We support migration from Tally, Zoho, QuickBooks, SAP, and most other accounting systems. Our team handles the heavy lifting, ensuring your historical data is preserved and mapped correctly.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Absolutely. We use 256-bit AES encryption, are SOC 2 Type II compliant, and maintain complete audit trails. Your data is stored in enterprise-grade data centers with 99.99% uptime SLA.",
    },
    {
      question: "Do you offer a free trial?",
      answer:
        "Yes! Start with a 14-day free trial—no credit card required. You'll get full access to all features so you can experience the complete platform before committing.",
    },
  ];

  const trustedLogos = [
    { name: "TechFlow", color: "#033F99" },
    { name: "CloudPeak", color: "#033F99" },
    { name: "DataStream", color: "#033F99" },
    { name: "Nexus Labs", color: "#033F99" },
    { name: "Quantum Tech", color: "#033F99" },
    { name: "BlueShift", color: "#033F99" },
    { name: "Vertex Inc", color: "#033F99" },
    { name: "CoreLogic", color: "#033F99" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SharedNavigation />

      {/* Hero Section - Full Color */}
      <section className="pt-28 pb-16 sm:pt-32 sm:pb-24 px-4 relative overflow-hidden bg-[#033F99]">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute top-20 left-10 w-96 h-96 bg-white rounded-full blur-3xl lg:block hidden" />
          <div className="absolute bottom-10 right-20 w-80 h-80 bg-white rounded-full blur-3xl lg:block hidden" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-white font-semibold text-xs sm:text-sm mb-6 sm:mb-8">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 w-4" />
              <span>Trusted by 500+ Finance Teams</span>
              <ChevronRight className="h-3.5 w-3.5 sm:h-4 w-4" />
            </div>

            {/* Headline */}
            <h1 className="text-3xl xs:text-4xl sm:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight tracking-tight text-white px-2"> // RESPONSIVE CHANGE
              Financial Intelligence
              <br className="hidden sm:block" /> // RESPONSIVE CHANGE
              <span className="font-light italic ml-2 sm:ml-0">That Works for You.</span>
            </h1>

            <p className="text-lg sm:text-2xl text-white/90 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
              The Business Operating System that connects commerce, execution,
              finance, workforce, and capital in one intelligent platform.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 mb-12 sm:mb-16 px-4"> // RESPONSIVE CHANGE
              <Link
                to="/auth/signup"
                className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 bg-white text-[#033F99] px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1" // RESPONSIVE CHANGE
              >
                <Sparkles className="h-5 w-5" />
                Sign Up Free
                <ArrowRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/contact"
                className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all"
              >
                <Play className="h-5 w-5" />
                Request a Demo
              </Link>
            </div>

            {/* Stats Row - On Dark Background */}
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto px-4"> // RESPONSIVE CHANGE
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={`stat-${stat.label}-${index}`}
                    className="bg-white/10 backdrop-blur-sm p-5 sm:p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition-all group"
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Icon className="h-4 w-4 sm:h-5 w-5 text-white/70 group-hover:text-white transition-colors" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-white">
                      <AnimatedCounter
                        end={stat.value}
                        prefix={stat.prefix || ""}
                        suffix={stat.suffix || ""}
                        decimals={stat.value === 99.9 ? 1 : 0}
                      />
                    </p>
                    <p className="text-xs sm:text-sm text-white/80 font-medium">
                      {stat.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Marquee */}
      <TrustMarquee
        logos={trustedLogos}
        title="Powering Finance Teams at Leading Enterprises"
        speed="normal"
      />

      {/* Problem Section */}
      <section id="problems" data-animate className="py-16 sm:py-24 px-4 bg-white">
        <div
          className={`max-w-7xl mx-auto transition-all duration-1000 ${isVisible["problems"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <div className="text-center mb-12 sm:mb-16 px-4">
            <span className="inline-block px-4 py-1.5 bg-red-100 text-red-700 text-xs sm:text-sm font-semibold rounded-full mb-4">
              The Problem
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold mb-4 text-slate-900 tracking-tight">
              Sound Familiar?
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Your business runs on disconnected systems. Each decision is made
              without full context.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 sm:px-0"> // RESPONSIVE CHANGE
            {problems.map((problem, index) => {
              const Icon = problem.icon;
              return (
                <div
                  key={`problem-${problem.title}-${index}`}
                  className="group bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200 hover:border-red-200 hover:bg-red-50/30 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-100 group-hover:bg-red-200 rounded-2xl flex items-center justify-center mb-6 transition-all">
                    <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-red-600" />
                  </div>
                  <h3 className="font-bold text-xl mb-3 text-slate-900">
                    {problem.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">
                    {problem.description}
                  </p>
                  <div className="pt-4 border-t border-slate-200 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-red-600">
                      {problem.stat}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {problem.statLabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Solution Section - Tab Based */}
      <section
        id="solutions"
        data-animate
        className="py-16 sm:py-24 px-4 bg-gradient-to-br from-[#033F99] to-[#012a6a] relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl lg:block hidden" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl lg:block hidden" />
        </div>

        <div
          className={`max-w-7xl mx-auto relative z-10 transition-all duration-1000 ${isVisible["solutions"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <div className="text-center mb-10 sm:mb-12 px-4">
            <span className="inline-block px-4 py-1.5 bg-white/20 text-white text-xs sm:text-sm font-semibold rounded-full mb-4">
              The Solution
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold mb-4 text-white tracking-tight">
              One Platform. Complete Control.
            </h2>
            <p className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              From lead to contract to delivery to billing to payroll to
              capital—everything connected.
            </p>
          </div>

          {/* Solution Tabs - Horizontal scroll on mobile */}
          <div className="flex overflow-x-auto sm:flex-wrap justify-start sm:justify-center gap-2 mb-8 sm:mb-12 px-4 sm:px-0 pb-4 sm:pb-0 no-scrollbar"> // RESPONSIVE CHANGE
            {solutions.map((solution, index) => {
              const Icon = solution.icon;
              return (
                <button
                  key={`tab-${solution.id}`}
                  onClick={() => setActiveTab(index)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 whitespace-nowrap shrink-0 ${activeTab === index
                    ? "bg-white text-[#033F99] shadow-xl scale-105"
                    : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                >
                  <Icon className="h-4 w-4 sm:h-5 w-5" />
                  <span className="text-sm sm:text-base">{solution.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Solution Content */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 sm:p-12 border border-white/20 shadow-2xl">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              <div className="order-2 lg:order-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    {React.createElement(solutions[activeTab].icon, {
                      className: "h-6 w-6 sm:h-8 w-8 text-white",
                    })}
                  </div>
                  <span className="text-white/60 text-xs sm:text-sm font-bold uppercase tracking-widest">
                    {solutions[activeTab].subtitle}
                  </span>
                </div>
                <h3 className="text-2xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">
                  {solutions[activeTab].title}
                </h3>
                <p className="text-base sm:text-lg text-white/90 mb-8 leading-relaxed">
                  {solutions[activeTab].description}
                </p>

                <ul className="space-y-4 mb-10">
                  {solutions[activeTab].features.map((feature, i) => (
                    <li
                      key={`feature-${i}`}
                      className="flex items-center gap-3 text-white/90 group"
                    >
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-[#033F99] transition-all">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                      <span className="text-sm sm:text-base font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={solutions[activeTab].link}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-[#033F99] px-8 py-4 rounded-xl font-bold hover:bg-white/90 transition-all transform hover:scale-105 shadow-xl"
                >
                  Explore {solutions[activeTab].label}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>

              {/* Live Interactive Dashboard Preview */}
              <div className="order-1 lg:order-2 bg-white rounded-2xl overflow-hidden shadow-2xl transform lg:rotate-2 hover:rotate-0 transition-transform duration-500 max-w-full"> // RESPONSIVE CHANGE
                {/* Dashboard Header */}
                <div className="bg-slate-900 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    </div>
                    <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest ml-2">
                      {solutions[activeTab].title} Preview
                    </span>
                  </div>
                  <div className="h-4 w-24 bg-white/10 rounded-full" />
                </div>

                {/* Dashboard Content */}
                <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 to-white">
                  {/* Metrics Row */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 hover:border-[#033F99] transition-all cursor-pointer shadow-sm hover:shadow-md">
                      <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase mb-1">
                        Total Revenue
                      </p>
                      <p className="text-lg sm:text-2xl font-black text-slate-900">₹24.5L</p>
                      <p className="text-[10px] sm:text-xs font-bold text-green-600 flex items-center gap-1">+12.5% <TrendingUp className="h-3 w-3" /></p>
                    </div>
                    <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 hover:border-[#033F99] transition-all cursor-pointer shadow-sm hover:shadow-md">
                      <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase mb-1">
                        Active Items
                      </p>
                      <p className="text-lg sm:text-2xl font-black text-slate-900">156</p>
                      <p className="text-[10px] sm:text-xs font-bold text-[#033F99]">+8 this week</p>
                    </div>
                  </div>

                  {/* Mini Chart */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 mb-4 sm:mb-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase">
                        Performance Trend
                      </p>
                      <div className="flex gap-2">
                        <div className="h-2 w-8 bg-slate-100 rounded-full" />
                        <div className="h-2 w-8 bg-[#033F99]/20 rounded-full" />
                      </div>
                    </div>
                    <div className="flex items-end gap-1 sm:gap-2 h-20 sm:h-24 px-1">
                      {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map(
                        (h, i) => (
                          <div
                            key={`bar-${i}`}
                            className={`flex-1 rounded-t-sm transition-all duration-700 hover:bg-[#033F99] ${i % 2 === 0 ? 'bg-[#033F99]' : 'bg-[#033F99]/40'}`}
                            style={{ height: `${h}%`, animationDelay: `${i * 50}ms` }}
                          />
                        ),
                      )}
                    </div>
                  </div>

                  {/* Activity List */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-[#033F99]/5 rounded-xl border border-[#033F99]/10">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#033F99] flex items-center justify-center shrink-0">
                        {React.createElement(solutions[activeTab].icon, {
                          className: "h-4 w-4 sm:h-5 w-5 text-white",
                        })}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          New item processed
                        </p>
                        <p className="text-[10px] font-medium text-slate-500">Just now</p>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-[#033F99] animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Solutions Grid */}
          <div className="grid md:grid-cols-5 gap-4 mt-8">
            {solutions.map((solution, index) => {
              const Icon = solution.icon;
              return (
                <Link
                  key={`card-${solution.id}`}
                  to={solution.link}
                  className={`group p-6 rounded-2xl border transition-all duration-300 ${activeTab === index
                    ? "bg-white text-[#033F99] border-white shadow-lg"
                    : "bg-white/5 text-white border-white/10 hover:bg-white/10 hover:border-white/20"
                    }`}
                  onMouseEnter={() => setActiveTab(index)}
                >
                  <Icon
                    className={`h-8 w-8 mb-3 ${activeTab === index ? "text-[#033F99]" : "text-white"}`}
                  />
                  <h4 className="font-bold mb-1">{solution.title}</h4>
                  <p
                    className={`text-sm ${activeTab === index ? "text-slate-600" : "text-white/60"}`}
                  >
                    {solution.subtitle}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Intelligence Section */}
      <section id="intelligence" data-animate className="py-20 px-4 bg-white">
        <div
          className={`max-w-7xl mx-auto transition-all duration-1000 ${isVisible["intelligence"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 bg-[#033F99]/10 text-[#033F99] text-sm font-semibold rounded-full mb-4">
                Intelligence Layer
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-slate-900">
                The Brain Behind <br />
                Your Business
              </h2>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Our AI doesn't just report what happened—it predicts what will
                happen and recommends what you should do about it.
              </p>

              <div className="space-y-6">
                {[
                  {
                    icon: Brain,
                    title: "Predictive Analytics",
                    description:
                      "See cash flow issues 3-4 weeks before they happen",
                  },
                  {
                    icon: Target,
                    title: "Anomaly Detection",
                    description:
                      "Automatically flag unusual transactions and patterns",
                  },
                  {
                    icon: Zap,
                    title: "Smart Recommendations",
                    description: "Get actionable insights, not just data dumps",
                  },
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={`intelligence-${item.title}-${index}`}
                      className="flex gap-4 group"
                    >
                      <div className="w-14 h-14 bg-[#033F99]/10 group-hover:bg-[#033F99] rounded-xl flex items-center justify-center flex-shrink-0 transition-all">
                        <Icon className="h-7 w-7 text-[#033F99] group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-1">
                          {item.title}
                        </h3>
                        <p className="text-slate-600">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Link
                to="/solutions/intelligence"
                className="inline-flex items-center gap-2 text-[#033F99] font-bold mt-8 hover:gap-3 transition-all"
              >
                Explore Intelligence
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            <div className="relative">
              {/* Interactive Intelligence Preview */}
              <div className="bg-gradient-to-br from-[#033F99]/10 to-[#033F99]/5 rounded-3xl p-6 border border-[#033F99]/20">
                {/* Mini Dashboard Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#033F99] flex items-center justify-center">
                      <Brain className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-bold text-slate-900">
                      AI Insights
                    </span>
                  </div>
                  <span className="px-3 py-1 bg-[#033F99]/10 text-[#033F99] text-xs rounded-full font-semibold animate-pulse">
                    Live
                  </span>
                </div>

                {/* Insight Cards Grid with Tooltips */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="group relative bg-white p-4 rounded-xl border border-slate-200 hover:border-[#033F99] hover:shadow-lg transition-all cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-[#033F99]" />
                      <span className="text-xs text-slate-500">
                        Cash Forecast
                      </span>
                    </div>
                    <p className="text-lg font-bold text-slate-900">₹24.5L</p>
                    <p className="text-xs text-[#033F99]">+12% vs last month</p>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-10">
                      Predicted cash balance for next 3 weeks based on AR/AP
                      patterns
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                    </div>
                  </div>
                  <div className="group relative bg-white p-4 rounded-xl border border-slate-200 hover:border-[#033F99] hover:shadow-lg transition-all cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-[#033F99]" />
                      <span className="text-xs text-slate-500">Risk Score</span>
                    </div>
                    <p className="text-lg font-bold text-slate-900">Low</p>
                    <p className="text-xs text-[#033F99]">3 items flagged</p>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-10">
                      Overall business risk score based on cash, compliance &
                      operations
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                    </div>
                  </div>
                  <div className="group relative bg-white p-4 rounded-xl border border-slate-200 hover:border-[#033F99] hover:shadow-lg transition-all cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-[#033F99]" />
                      <span className="text-xs text-slate-500">Pending</span>
                    </div>
                    <p className="text-lg font-bold text-slate-900">12</p>
                    <p className="text-xs text-[#033F99]">Approvals waiting</p>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-10">
                      Invoices, expenses & purchase orders awaiting your
                      approval
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                    </div>
                  </div>
                  <div className="group relative bg-white p-4 rounded-xl border border-slate-200 hover:border-[#033F99] hover:shadow-lg transition-all cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-[#033F99]" />
                      <span className="text-xs text-slate-500">Efficiency</span>
                    </div>
                    <p className="text-lg font-bold text-slate-900">94%</p>
                    <p className="text-xs text-[#033F99]">Process automation</p>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-10">
                      Percentage of workflows running on automation vs manual
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                    </div>
                  </div>
                </div>

                {/* AI Recommendation */}
                <div className="bg-[#033F99] p-4 rounded-xl text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4" />
                    <span className="text-xs font-semibold opacity-80">
                      AI RECOMMENDATION
                    </span>
                  </div>
                  <p className="text-sm">
                    "Move ₹15L to fixed deposit. Expected yield:
                    ₹12,400/quarter."
                  </p>
                </div>
              </div>

              {/* Floating Stats */}
              <div
                className="absolute -left-4 top-1/4 bg-white p-3 rounded-xl shadow-lg border border-slate-100 animate-bounce"
                style={{ animationDuration: "3s" }}
              >
                <p className="text-xl font-bold text-[#033F99]">+23%</p>
                <p className="text-xs text-slate-500">Revenue Growth</p>
              </div>
              <div
                className="absolute -right-4 bottom-1/4 bg-white p-3 rounded-xl shadow-lg border border-slate-100 animate-bounce"
                style={{ animationDuration: "4s" }}
              >
                <p className="text-xl font-bold text-[#033F99]">4 hrs</p>
                <p className="text-xs text-slate-500">Month-End Close</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" data-animate className="py-20 px-4 bg-slate-50">
        <div
          className={`max-w-7xl mx-auto transition-all duration-1000 ${isVisible["features"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-[#033F99]/10 text-[#033F99] text-sm font-semibold rounded-full mb-4">
              Enterprise Features
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-slate-900">
              Built for Serious Business
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Every tool you need to run finance operations with confidence
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={`feature-${feature.title}-${index}`}
                  className="group bg-white p-8 rounded-2xl border border-slate-100 hover:border-[#033F99]/30 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-[#033F99]/10 to-[#033F99]/5 group-hover:from-[#033F99] group-hover:to-[#033F99] rounded-xl flex items-center justify-center mb-6 transition-all">
                    <Icon className="h-7 w-7 text-[#033F99] group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" data-animate className="py-20 px-4 bg-white">
        <div
          className={`max-w-7xl mx-auto transition-all duration-1000 ${isVisible["testimonials"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-[#033F99]/10 text-[#033F99] text-sm font-semibold rounded-full mb-4">
              Customer Stories
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-slate-900">
              Loved by Finance Teams
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              See why 500+ companies trust Innovate Books for their financial
              operations
            </p>
          </div>

          <TestimonialCarousel testimonials={testimonials} />
        </div>
      </section>

      {/* Security Section */}
      <section id="security" data-animate className="py-20 px-4 bg-slate-900">
        <div
          className={`max-w-7xl mx-auto transition-all duration-1000 ${isVisible["security"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Enterprise-Grade Security
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Your financial data deserves the highest level of protection
            </p>
          </div>
          <SecurityBadges variant="dark" />
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" data-animate className="py-20 px-4 bg-white">
        <div
          className={`max-w-4xl mx-auto transition-all duration-1000 ${isVisible["faq"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-[#033F99]/10 text-[#033F99] text-sm font-semibold rounded-full mb-4">
              FAQ
            </span>
            <h2 className="text-4xl font-bold mb-4 text-slate-900">
              Common Questions
            </h2>
            <p className="text-xl text-slate-600">
              Everything you need to know to get started
            </p>
          </div>

          <FAQAccordion faqs={faqs} variant="bordered" />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 bg-gradient-to-r from-[#033F99] via-[#033F99] to-[#033F99] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join 500+ companies already running on Innovate Books. 14-day free
            trial. No credit card required.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-10">
            <Link
              to="/auth/signup"
              className="inline-flex items-center gap-2 bg-white text-[#033F99] px-10 py-5 rounded-xl font-bold hover:bg-slate-100 transition-all transform hover:scale-105 shadow-xl"
            >
              <Sparkles className="h-5 w-5" />
              Start Free Trial
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 border-2 border-white/30 text-white px-10 py-5 rounded-xl font-semibold hover:bg-white/10 transition-all backdrop-blur-sm"
            >
              Talk to Sales
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-white/70">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>Setup in minutes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <img
                  src="/innovate-books-logo-blue.png"
                  alt="Innovate Books"
                  className="h-10 w-auto"
                />
                <span className="font-bold text-xl">Innovate Books</span>
              </div>
              <p className="text-slate-400 mb-6 leading-relaxed">
                The Business Operating System for modern enterprises. Connect
                commerce, execution, finance, workforce, and capital in one
                intelligent platform.
              </p>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="w-10 h-10 bg-slate-800 hover:bg-[#033F99] rounded-lg flex items-center justify-center transition-colors"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-slate-800 hover:bg-[#033F99] rounded-lg flex items-center justify-center transition-colors"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-base">Solutions</h4>
              <div className="space-y-3">
                <Link
                  to="/solutions/commerce"
                  className="block text-slate-400 hover:text-white transition-colors text-sm"
                >
                  IB Commerce
                </Link>
                <Link
                  to="/solutions/finance"
                  className="block text-slate-400 hover:text-white transition-colors text-sm"
                >
                  IB Finance
                </Link>
                <Link
                  to="/solutions/operations"
                  className="block text-slate-400 hover:text-white transition-colors text-sm"
                >
                  IB Operations
                </Link>
                <Link
                  to="/solutions/workforce"
                  className="block text-slate-400 hover:text-white transition-colors text-sm"
                >
                  IB Workforce
                </Link>
                <Link
                  to="/solutions/capital"
                  className="block text-slate-400 hover:text-white transition-colors text-sm"
                >
                  IB Capital
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-base">Company</h4>
              <div className="space-y-3">
                <Link
                  to="/about"
                  className="block text-slate-400 hover:text-white transition-colors text-sm"
                >
                  About Us
                </Link>
                <Link
                  to="/contact"
                  className="block text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Contact
                </Link>
                <Link
                  to="/pricing"
                  className="block text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Pricing
                </Link>
                <Link
                  to="/insights"
                  className="block text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Insights
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-base">Get Started</h4>
              <div className="space-y-3">
                <Link
                  to="/auth/signup"
                  className="block text-[#033F99] hover:text-white transition-colors text-sm font-semibold"
                >
                  Start Free Trial →
                </Link>
                <Link
                  to="/auth/login"
                  className="block text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Login
                </Link>
                <Link
                  to="/contact"
                  className="block text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Book Demo
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">
              &copy; 2025 Innovate Books. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-slate-400">
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Sticky CTA for Mobile */}
      <StickyCTA variant="full" />
    </div>
  );
};

export default HomeNew;
