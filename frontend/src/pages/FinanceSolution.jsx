import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Calculator,
  Brain,
  TrendingUp,
  BarChart3,
  Clock,
  CheckCircle,
  Sparkles,
  BookOpen,
  Scale,
  FileCheck,
  PieChart,
  Activity,
  Shield,
  Target,
  ChevronRight,
} from "lucide-react";
import SharedNavigation from "../components/SharedNavigation";

const FinanceSolution = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const problems = [
    {
      icon: Clock,
      title: "Month-End Chaos",
      problem:
        "Close takes weeks with manual journal entries and reconciliations",
      solution:
        "ACCOUNTING ENGINE automates entries and closes books in days, not weeks",
    },
    {
      icon: BarChart3,
      title: "Stale Reports",
      problem: "Financial statements are outdated by the time they're ready",
      solution: "REAL-TIME REPORTING gives you P&L and balance sheet as of now",
    },
    {
      icon: Target,
      title: "Budget Surprises",
      problem: "Variance analysis happens too late to take corrective action",
      solution:
        "CONTINUOUS FP&A catches budget deviations early with AI insights",
    },
  ];

  const modules = [
    {
      id: "accounting",
      name: "Accounting Engine",
      icon: BookOpen,
      tagline: "Automated Double-Entry",
      description:
        "Complete accounting system with automated journal entries, multi-entity support, and real-time books.",
      features: [
        "Automated journal entries",
        "Multi-entity consolidation",
        "Multi-currency support",
        "Chart of accounts management",
        "Period close automation",
        "Audit trail & compliance",
      ],
    },
    {
      id: "reporting",
      name: "Financial Reporting",
      icon: BarChart3,
      tagline: "Real-Time Statements",
      description:
        "Generate P&L, Balance Sheet, and Cash Flow statements instantly with drill-down capabilities.",
      features: [
        "Real-time P&L statement",
        "Balance sheet generation",
        "Cash flow statement",
        "Segment-wise reporting",
        "Custom report builder",
        "Export to Excel/PDF",
      ],
    },
    {
      id: "budgeting",
      name: "Budgeting & FP&A",
      icon: PieChart,
      tagline: "Continuous Planning",
      description:
        "Rolling forecasts, budget variance analysis, and scenario modeling for agile financial planning.",
      features: [
        "Annual budget creation",
        "Rolling 12-month forecasts",
        "Variance analysis",
        "Scenario modeling",
        "Driver-based planning",
        "Department collaboration",
      ],
    },
    {
      id: "reconciliation",
      name: "Reconciliation",
      icon: Scale,
      tagline: "ML-Powered Matching",
      description:
        "AI-assisted bank reconciliation with pattern learning and automatic matching suggestions.",
      features: [
        "Bank statement import",
        "ML-powered auto-matching",
        "Exception handling",
        "Reconciliation reports",
        "Historical pattern learning",
        "Audit-ready documentation",
      ],
    },
    {
      id: "compliance",
      name: "Compliance",
      icon: Shield,
      tagline: "Regulatory Automation",
      description:
        "Automated compliance for GST, TDS, and statutory reports with filing assistance.",
      features: [
        "GST computation & filing",
        "TDS calculations",
        "Statutory reports",
        "Audit schedules",
        "Document management",
        "Filing reminders",
      ],
    },
  ];

  const stats = [
    { metric: "75%", label: "Faster Month Close" },
    { metric: "Real-Time", label: "Financial Visibility" },
    { metric: "99.9%", label: "Reconciliation Accuracy" },
    { metric: "100%", label: "Compliance Coverage" },
  ];

  const benefits = [
    {
      icon: Clock,
      title: "Close in Days, Not Weeks",
      description:
        "Automated journal entries and reconciliation cut close time by 75%",
      metric: "3-day close",
    },
    {
      icon: Activity,
      title: "Real-Time Financials",
      description:
        "P&L, balance sheet, and cash flow updated continuously, not monthly",
      metric: "Live reporting",
    },
    {
      icon: Brain,
      title: "Self-Healing Ledgers",
      description:
        "AI detects anomalies, suggests corrections, and maintains data integrity",
      metric: "99.9% accuracy",
    },
    {
      icon: Shield,
      title: "Always Audit-Ready",
      description:
        "Complete audit trail with automated compliance and statutory reporting",
      metric: "100% compliant",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#EBF3FC]/30">
      <SharedNavigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-[#033F99] rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <Link
            to="/solutions"
            className="inline-flex items-center gap-2 text-[#033F99] hover:text-[#033F99] font-semibold mb-8 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Solutions
          </Link>

          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-3 bg-[#EBF3FC] px-6 py-3 rounded-full mb-6">
              <FileText className="h-6 w-6 text-[#033F99]" />
              <span className="text-[#033F99] font-bold text-lg">
                IB Finance
              </span>
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                FLAGSHIP
              </span>
            </div>

            <h1
              className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            >
              <span className="bg-gradient-to-r from-[#033F99] via-[#033F99] to-[#033F99] bg-clip-text text-transparent">
                Adaptive Financial
              </span>
              <br />
              <span className="text-slate-900">Planning & Analysis</span>
            </h1>

            <p className="text-xl sm:text-2xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
              Plan, account, and adapt in real-time. AI-powered FP&A that
              automates accounting, continuously forecasts, and self-heals
              ledgers.
            </p>

            <div className="flex justify-center items-center gap-6 mb-12 flex-wrap">
              <Link to="/auth/signup">
                <button className="bg-gradient-to-r from-[#033F99] to-[#033F99] hover:from-[#033F99] hover:to-[#011B4E] text-white font-bold px-10 py-5 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Start Free Trial
                </button>
              </Link>
              <Link to="/solutions/finance/overview">
                <button className="bg-white border-2 border-[#033F99] text-[#033F99] hover:bg-[#033F99] hover:text-white font-bold px-10 py-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Explore Modules
                  <ChevronRight className="h-5 w-5" />
                </button>
              </Link>
              <Link to="/contact">
                <button className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-bold px-10 py-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-lg">
                  Book a Demo
                </button>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-[#C4D9F4]"
                >
                  <p className="text-3xl font-bold text-[#033F99] mb-1">
                    {stat.metric}
                  </p>
                  <p className="text-sm text-slate-600 font-medium">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why IB Finance */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-slate-900">
              Why IB Finance?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Traditional accounting is reactive. IB Finance makes your finance
              function proactive.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {problems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-slate-50 to-white p-8 rounded-3xl border-2 border-slate-200 hover:border-[#033F99] hover:shadow-xl transition-all"
                >
                  <div className="w-14 h-14 bg-[#EBF3FC] rounded-2xl flex items-center justify-center mb-6">
                    <Icon className="h-7 w-7 text-[#033F99]" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">
                    {item.title}
                  </h3>
                  <p className="text-red-600 font-medium mb-3 flex items-start gap-2">
                    <span className="text-red-500">✗</span> {item.problem}
                  </p>
                  <p className="text-green-600 font-medium flex items-start gap-2">
                    <span className="text-green-500">✓</span> {item.solution}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Principle */}
      <section className="py-16 px-4 bg-gradient-to-r from-[#033F99] to-[#033F99]">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            The Core Principle
          </h2>
          <p className="text-xl leading-relaxed">
            IB Finance is <span className="underline font-bold">NOT</span> just
            accounting software. It's about
            <span className="font-bold"> ADAPTIVE INTELLIGENCE</span> - a
            finance function that learns, predicts, and automatically optimizes
            your financial operations while maintaining perfect compliance.
          </p>
        </div>
      </section>

      {/* Finance Modules */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-slate-900">
              5 Integrated Finance Modules
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Complete financial management with AI-powered automation
            </p>
          </div>

          <div className="space-y-6">
            {modules.map((module, index) => {
              const Icon = module.icon;
              return (
                <div
                  key={module.id}
                  className="bg-white rounded-3xl border-2 border-slate-200 hover:border-[#033F99] transition-all overflow-hidden"
                >
                  <div className="p-8">
                    <div className="flex items-start gap-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-slate-900">
                            {module.name}
                          </h3>
                          <span className="text-[#033F99] font-semibold">
                            {module.tagline}
                          </span>
                        </div>
                        <p className="text-slate-600 mb-4">
                          {module.description}
                        </p>
                        <div className="grid md:grid-cols-3 gap-3">
                          {module.features.map((feature, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-2 text-sm text-slate-700"
                            >
                              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Adaptive Finance Demo */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-slate-900">
              Adaptive Finance Engine
            </h2>
            <p className="text-xl text-slate-600">
              AI automatically optimizes your chart of accounts and suggests
              intelligent improvements
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#EBF3FC] to-[#C4D9F4]/50 p-8 rounded-3xl border-2 border-[#C4D9F4]">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-xl flex items-center justify-center flex-shrink-0">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-lg font-semibold text-[#033F99] mb-3">
                  💡 Smart Ledger Suggestion
                </p>
                <p className="text-slate-700 leading-relaxed mb-4">
                  "Detected{" "}
                  <span className="font-semibold text-[#033F99]">₹8.4L</span> in
                  'Software Subscriptions' account. Recommend splitting by
                  department for better cost visibility:"
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl mb-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">
                    Current Structure
                  </p>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-slate-900 font-medium">
                      5200 - Software Subscriptions
                    </p>
                    <p className="text-2xl font-bold text-slate-700 mt-2">
                      ₹8.4L
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">
                    Recommended Structure
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center bg-[#EBF3FC] p-3 rounded-lg">
                      <span className="text-slate-700">
                        5201 - Engineering Tools
                      </span>
                      <span className="font-bold text-[#033F99]">₹4.2L</span>
                    </div>
                    <div className="flex justify-between items-center bg-[#EBF3FC] p-3 rounded-lg">
                      <span className="text-slate-700">
                        5202 - Sales & Marketing
                      </span>
                      <span className="font-bold text-[#033F99]">₹2.8L</span>
                    </div>
                    <div className="flex justify-between items-center bg-[#EBF3FC] p-3 rounded-lg">
                      <span className="text-slate-700">
                        5203 - Operations & Support
                      </span>
                      <span className="font-bold text-[#033F99]">₹1.4L</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="bg-gradient-to-r from-[#033F99] to-[#033F99] text-white px-6 py-2 rounded-lg font-semibold hover:from-[#033F99] hover:to-[#011B4E] transition-all">
                Apply Changes
              </button>
              <button className="border border-[#033F99] text-[#033F99] px-6 py-2 rounded-lg font-semibold hover:bg-[#EBF3FC] transition-all">
                Customize Split
              </button>
              <button className="border border-slate-300 text-slate-600 px-6 py-2 rounded-lg font-semibold hover:bg-slate-50 transition-all">
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-slate-900">
              Business Impact
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Transform your finance function from reactive to proactive
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const BenIcon = benefit.icon;
              return (
                <div
                  key={index}
                  className="bg-white p-6 rounded-2xl border-2 border-slate-200 hover:border-[#033F99] hover:shadow-lg transition-all"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-2xl flex items-center justify-center mb-6">
                    <BenIcon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-slate-600 mb-4">{benefit.description}</p>
                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-2xl font-bold text-[#033F99]">
                      {benefit.metric}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Production Badge */}
      <section className="py-12 px-4 bg-gradient-to-r from-green-500 to-emerald-500">
        <div className="max-w-4xl mx-auto text-center text-white">
          <div className="flex items-center justify-center gap-3 mb-4">
            <CheckCircle className="h-8 w-8" />
            <h2 className="text-3xl font-bold">Currently in Production</h2>
          </div>
          <p className="text-lg opacity-90">
            IB Finance is our flagship solution - fully operational with
            complete financial reporting live for 500+ finance teams
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-[#033F99] via-[#033F99] to-[#033F99]">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Your Finance Team Deserves Better Tools
          </h2>
          <p className="text-xl mb-10 opacity-90">
            Join 500+ finance teams using IB Finance for real-time, AI-powered
            financial management
          </p>
          <div className="flex justify-center items-center gap-6 flex-wrap">
            <Link to="/auth/signup">
              <button className="bg-white text-[#033F99] font-bold px-10 py-5 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Start Free Trial
              </button>
            </Link>
            <Link to="/contact">
              <button className="border-2 border-white text-white hover:bg-white/10 font-bold px-10 py-5 rounded-xl transition-all duration-300 text-lg">
                Schedule Demo
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FinanceSolution;
