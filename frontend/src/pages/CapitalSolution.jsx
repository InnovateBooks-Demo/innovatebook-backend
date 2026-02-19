import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Landmark,
  Building2,
  CreditCard,
  TrendingUp,
  AlertCircle,
  Wallet,
  PiggyBank,
  CheckCircle,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  ChartLine,
  LineChart,
  Shield,
  ChevronRight,
} from "lucide-react";
import SharedNavigation from "../components/SharedNavigation";

const CapitalSolution = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const problems = [
    {
      icon: Wallet,
      title: "Cash Blindness",
      problem: "No real-time visibility across multiple bank accounts",
      solution:
        "BANKS module aggregates all accounts with live balance tracking",
    },
    {
      icon: TrendingUp,
      title: "Idle Cash Waste",
      problem: "Money sitting in low-yield accounts while better options exist",
      solution:
        "AI RECOMMENDATIONS optimize fund placement for maximum returns",
    },
    {
      icon: AlertCircle,
      title: "Cash Crunch Surprises",
      problem: "Payroll or payment deadlines catch you off guard",
      solution: "FORECASTING predicts cash needs 90 days ahead with alerts",
    },
  ];

  const modules = [
    {
      id: "banks",
      name: "Banks",
      icon: Building2,
      tagline: "Multi-Bank Aggregation",
      description:
        "Connect all your bank accounts and get real-time consolidated cash position across entities.",
      features: [
        "Multi-bank account integration",
        "Real-time balance tracking",
        "Transaction categorization",
        "Bank statement reconciliation",
        "Inter-bank transfer management",
        "Account-wise cash flow analysis",
      ],
    },
    {
      id: "treasury",
      name: "Treasury",
      icon: PiggyBank,
      tagline: "Investment Management",
      description:
        "Manage fixed deposits, mutual funds, and other treasury instruments with maturity tracking.",
      features: [
        "Fixed deposit management",
        "Mutual fund tracking",
        "Maturity alerts & renewals",
        "Interest accrual tracking",
        "Investment performance analytics",
        "Reinvestment optimization",
      ],
    },
    {
      id: "credit",
      name: "Credit Lines",
      icon: CreditCard,
      tagline: "Debt Management",
      description:
        "Track loans, credit lines, and overdrafts with interest calculations and repayment schedules.",
      features: [
        "Loan & OD tracking",
        "Interest calculation",
        "EMI schedule management",
        "Credit limit monitoring",
        "Covenant compliance tracking",
        "Refinancing analysis",
      ],
    },
    {
      id: "forecasting",
      name: "Cash Forecasting",
      icon: LineChart,
      tagline: "AI-Powered Predictions",
      description:
        "Machine learning models predict cash inflows and outflows up to 90 days in advance.",
      features: [
        "90-day cash flow forecast",
        "AR collection predictions",
        "AP payment scheduling",
        "Seasonal pattern detection",
        "Scenario modeling",
        "Variance analysis",
      ],
    },
    {
      id: "optimization",
      name: "Capital Optimization",
      icon: Zap,
      tagline: "Smart Recommendations",
      description:
        "AI analyzes your cash position and recommends optimal fund movements for better returns.",
      features: [
        "Idle cash identification",
        "Investment recommendations",
        "Fund movement suggestions",
        "Working capital optimization",
        "Return maximization",
        "Risk-adjusted allocation",
      ],
    },
  ];

  const stats = [
    { metric: "25%", label: "Idle Cash Reduction" },
    { metric: "90 Days", label: "Forecast Accuracy" },
    { metric: "₹12.4K", label: "Extra Interest Earned" },
    { metric: "Zero", label: "Cash Surprises" },
  ];

  const benefits = [
    {
      icon: TrendingUp,
      title: "Reduce Idle Cash",
      description:
        "AI identifies funds earning low returns and suggests better placements",
      metric: "25% reduction",
    },
    {
      icon: ChartLine,
      title: "Accurate Forecasting",
      description:
        "ML models predict cash needs with 90-day visibility and 95% accuracy",
      metric: "90-day visibility",
    },
    {
      icon: Shield,
      title: "Zero Surprises",
      description:
        "Early warning alerts for cash shortfalls well before they become critical",
      metric: "4 week advance",
    },
    {
      icon: Zap,
      title: "Maximize Returns",
      description:
        "Automated recommendations to optimize treasury returns and minimize borrowing",
      metric: "₹12.4K/quarter",
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
              <Landmark className="h-6 w-6 text-[#033F99]" />
              <span className="text-[#033F99] font-bold text-lg">
                IB Capital
              </span>
            </div>

            <h1
              className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            >
              <span className="bg-gradient-to-r from-[#033F99] via-[#033F99] to-[#033F99] bg-clip-text text-transparent">
                Intelligent Treasury
              </span>
              <br />
              <span className="text-slate-900">& Cash Management</span>
            </h1>

            <p className="text-xl sm:text-2xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
              AI-powered liquidity management that predicts cash needs,
              optimizes fund placement, and prevents capital gaps before they
              occur.
            </p>

            <div className="flex justify-center items-center gap-6 mb-12 flex-wrap">
              <Link to="/auth/signup">
                <button className="bg-gradient-to-r from-[#033F99] to-[#033F99] hover:from-[#033F99] hover:to-[#011B4E] text-white font-bold px-10 py-5 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Start Free Trial
                </button>
              </Link>
              <Link to="/solutions/capital/overview">
                <button className="bg-white border-2 border-[#033F99] text-[#033F99] hover:bg-[#033F99] hover:text-white font-bold px-10 py-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-lg flex items-center gap-2">
                  <Landmark className="h-5 w-5" />
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

      {/* Why IB Capital */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-slate-900">
              Why IB Capital?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Cash is the lifeblood of your business. IB Capital ensures it
              flows where it's needed most.
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
            IB Capital is <span className="underline font-bold">NOT</span> just
            a bank dashboard. It's about
            <span className="font-bold"> CAPITAL INTELLIGENCE</span> - knowing
            exactly where your cash is, where it should be, and what it should
            be doing to maximize returns.
          </p>
        </div>
      </section>

      {/* Capital Modules */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-slate-900">
              5 Integrated Capital Modules
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Complete treasury management with AI-powered optimization
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

      {/* Capital Autopilot Demo */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-slate-900">
              Capital Autopilot
            </h2>
            <p className="text-xl text-slate-600">
              AI learns your cash patterns and proactively recommends optimal
              fund movements
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#EBF3FC] to-[#C4D9F4]/50 p-8 rounded-3xl border-2 border-[#C4D9F4]">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-xl flex items-center justify-center flex-shrink-0">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-lg font-semibold text-[#033F99] mb-3">
                  💡 Smart Recommendation
                </p>
                <p className="text-slate-700 leading-relaxed">
                  "Moving{" "}
                  <span className="font-semibold text-[#033F99]">₹25L</span>{" "}
                  from HDFC Current to Axis FD extends runway by{" "}
                  <span className="font-semibold text-[#033F99]">4.8 days</span>
                  and earns{" "}
                  <span className="font-semibold text-[#033F99]">
                    ₹12,400
                  </span>{" "}
                  additional interest over 90 days."
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl mb-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">
                    Current Position
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">
                        HDFC Current Account
                      </span>
                      <span className="font-bold text-slate-900">₹42.5L</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">
                        Axis FD (7.2% p.a.)
                      </span>
                      <span className="font-bold text-slate-900">₹15.0L</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">ICICI Savings</span>
                      <span className="font-bold text-slate-900">₹8.3L</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">
                    After Optimization
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">
                        HDFC Current Account
                      </span>
                      <span className="font-bold text-[#033F99] flex items-center gap-1">
                        <ArrowDownRight className="h-4 w-4" />
                        ₹17.5L
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">
                        Axis FD (7.2% p.a.)
                      </span>
                      <span className="font-bold text-green-600 flex items-center gap-1">
                        <ArrowUpRight className="h-4 w-4" />
                        ₹40.0L
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">ICICI Savings</span>
                      <span className="font-bold text-slate-900">₹8.3L</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="bg-gradient-to-r from-[#033F99] to-[#033F99] text-white px-6 py-2 rounded-lg font-semibold hover:from-[#033F99] hover:to-[#011B4E] transition-all">
                Execute Move
              </button>
              <button className="border border-[#033F99] text-[#033F99] px-6 py-2 rounded-lg font-semibold hover:bg-[#EBF3FC] transition-all">
                See Alternatives
              </button>
              <button className="border border-slate-300 text-slate-600 px-6 py-2 rounded-lg font-semibold hover:bg-slate-50 transition-all">
                Customize Amount
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
              Never run out of cash. Always optimize returns.
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

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-[#033F99] via-[#033F99] to-[#033F99]">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Never Run Out of Cash Again
          </h2>
          <p className="text-xl mb-10 opacity-90">
            Predictive liquidity management powered by AI. Know your cash
            position 90 days ahead.
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

export default CapitalSolution;
