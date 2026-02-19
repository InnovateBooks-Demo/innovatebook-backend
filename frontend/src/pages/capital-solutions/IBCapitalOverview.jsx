import React from "react";
import { Link } from "react-router-dom";
import IBCapitalHub from "../IBCapitalHub";
import { InteractiveDashboard } from "../../components/marketing";
import {
  Landmark,
  Building2,
  PiggyBank,
  CreditCard,
  LineChart,
  Zap,
  CheckCircle,
  DollarSign,
  Target,
  ArrowRight,
  AlertTriangle,
  TrendingUp,
  Shield,
  BarChart3,
} from "lucide-react";

const IBCapitalOverview = () => {
  const keyPrinciples = [
    {
      title: "Cash Visibility",
      description: "Know exactly where every rupee is",
      icon: DollarSign,
      examples: [
        "Multi-bank aggregation",
        "Real-time balance tracking",
        "Consolidated cash position",
      ],
    },
    {
      title: "Predictive Liquidity",
      description: "See cash needs 90 days ahead",
      icon: LineChart,
      examples: [
        "AI-powered forecasting",
        "AR collection predictions",
        "AP payment scheduling",
      ],
    },
    {
      title: "Capital Optimization",
      description: "Make idle cash work harder",
      icon: Zap,
      examples: [
        "Investment recommendations",
        "Fund movement suggestions",
        "Return maximization",
      ],
    },
  ];

  const capitalFailures = [
    {
      problem: "Cash Blindness",
      cost: "Missed opportunities",
      example:
        'CFO asks "How much cash do we have?" Answer takes 2 hours. By then, treasury window closed. Missed overnight yield of ₹15K.',
      howPrevented:
        "BANKS module shows consolidated position instantly. ₹65.8L across 4 accounts. One click. Real-time.",
      module: "Banks",
      icon: Building2,
    },
    {
      problem: "Idle Cash Waste",
      cost: "₹12K+ lost per quarter",
      example:
        "₹25L sits in current account at 0% while FD rates are 7.2%. Treasury forgets to move. Opportunity cost compounds.",
      howPrevented:
        'OPTIMIZATION module alerts: "Move ₹25L to Axis FD. Earn ₹12,400 over 90 days." One-click execution.',
      module: "Optimization",
      icon: Zap,
    },
    {
      problem: "Cash Crunch Surprise",
      cost: "Emergency borrowing",
      example:
        "Payroll date arrives. Account shows ₹18L. Payroll needs ₹25L. Emergency OD drawn at 14% interest. Panic mode.",
      howPrevented:
        'FORECASTING module predicted shortfall 4 weeks ago. "Payroll date: ₹7L deficit expected." Fund arranged in advance.',
      module: "Forecasting",
      icon: LineChart,
    },
    {
      problem: "Debt Mismanagement",
      cost: "Higher interest burden",
      example:
        "Company has ₹50L surplus and ₹30L loan at 12%. No one connects the dots. Interest paid unnecessarily.",
      howPrevented:
        'CREDIT module suggests: "Prepay ₹30L loan. Save ₹3.6L annual interest. Net gain vs FD: ₹2.4L."',
      module: "Credit Lines",
      icon: CreditCard,
    },
  ];

  const stats = [
    {
      metric: "25%",
      label: "Idle Cash Reduction",
      sublabel: "Money put to work",
    },
    {
      metric: "90 Days",
      label: "Forecast Visibility",
      sublabel: "AI-powered predictions",
    },
    {
      metric: "₹12.4K",
      label: "Extra Interest/Qtr",
      sublabel: "Optimized placements",
    },
    {
      metric: "Zero",
      label: "Cash Surprises",
      sublabel: "Early warning system",
    },
    {
      metric: "4 Weeks",
      label: "Advance Notice",
      sublabel: "Shortfall predictions",
    },
    {
      metric: "95%",
      label: "Forecast Accuracy",
      sublabel: "ML-powered models",
    },
  ];

  return (
    <IBCapitalHub>
      <div className="max-w-5xl">
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            IB Capital Overview
          </h1>
          <p className="text-2xl text-slate-600 leading-relaxed">
            Intelligent Treasury That{" "}
            <span className="text-[#033F99] font-semibold">Never Runs Dry</span>
          </p>
        </div>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            What is IB Capital?
          </h2>
          <div className="bg-gradient-to-r from-[#033F99] to-[#033F99] p-8 rounded-3xl text-white mb-6">
            <p className="text-xl leading-relaxed">
              IB Capital is <span className="font-bold underline">NOT</span>{" "}
              just a bank dashboard. It's{" "}
              <span className="font-bold underline">NOT</span> accounting
              software. It's{" "}
              <span className="font-bold">a capital intelligence platform</span>{" "}
              that ensures:
            </p>
            <ul className="mt-4 space-y-2 text-lg">
              <li className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 flex-shrink-0" />
                <span>
                  <strong>VISIBILITY</strong> into every account, every balance
                </span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 flex-shrink-0" />
                <span>
                  <strong>PREDICTIONS</strong> of cash needs 90 days ahead
                </span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 flex-shrink-0" />
                <span>
                  <strong>OPTIMIZATION</strong> of returns on idle cash
                </span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 flex-shrink-0" />
                <span>
                  <strong>ZERO SURPRISES</strong> on cash crunches
                </span>
              </li>
            </ul>
          </div>
          <p className="text-lg text-slate-700 leading-relaxed">
            Think of it as{" "}
            <span className="font-semibold">your treasury on autopilot</span> -
            AI that watches your cash 24/7, predicts future needs, and
            recommends optimal fund movements.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            Core Principles
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {keyPrinciples.map((principle, index) => {
              const Icon = principle.icon;
              return (
                <div
                  key={index}
                  className="bg-white p-6 rounded-3xl border-2 border-slate-200 hover:border-[#033F99] hover:shadow-xl transition-all"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-2xl flex items-center justify-center mb-4">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {principle.title}
                  </h3>
                  <p className="text-slate-600 mb-4">{principle.description}</p>
                  <div className="space-y-2">
                    {principle.examples.map((example, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-sm text-slate-700"
                      >
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{example}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            Real Capital Failures IB Capital Prevents
          </h2>
          <div className="space-y-6">
            {capitalFailures.map((failure, index) => {
              const Icon = failure.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden"
                >
                  <div className="flex items-start gap-6 p-6">
                    <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold text-slate-900">
                          {failure.problem}
                        </h3>
                        <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded-full">
                          {failure.cost}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6 mt-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-500 mb-2">
                            ❌ WHAT HAPPENS WITHOUT IB CAPITAL:
                          </p>
                          <p className="text-slate-700 bg-red-50 p-3 rounded-lg">
                            {failure.example}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-500 mb-2">
                            ✅ HOW IB CAPITAL PREVENTS IT:
                          </p>
                          <p className="text-slate-700 bg-green-50 p-3 rounded-lg">
                            {failure.howPrevented}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-2">
                        <Icon className="h-5 w-5 text-[#033F99]" />
                        <span className="text-sm font-semibold text-[#033F99]">
                          Powered by {failure.module} Module
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            Measurable Business Impact
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-[#033F99] to-[#033F99] p-6 rounded-3xl text-white text-center"
              >
                <p className="text-5xl font-bold mb-2">{stat.metric}</p>
                <p className="text-xl font-semibold mb-1">{stat.label}</p>
                <p className="text-sm opacity-80">{stat.sublabel}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive Dashboard Preview */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            See It In Action
          </h2>
          <InteractiveDashboard
            type="capital"
            title="IB Capital Dashboard Preview"
          />
        </section>

        <section className="bg-gradient-to-r from-slate-50 to-white p-8 rounded-3xl border-2 border-slate-200">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Explore IB Capital Modules
          </h2>
          <p className="text-lg text-slate-600 mb-6">
            Click on any module in the left sidebar to see detailed features and
            how it transforms your treasury.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <Link
              to="/solutions/capital/banks"
              className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-[#033F99] hover:shadow-lg transition-all group"
            >
              <div className="flex items-center gap-3">
                <Building2 className="h-6 w-6 text-[#033F99]" />
                <div>
                  <p className="font-bold text-slate-900">Start with Banks</p>
                  <p className="text-sm text-slate-600">
                    Multi-bank cash visibility
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-[#033F99] group-hover:translate-x-2 transition-transform" />
            </Link>
            <Link
              to="/auth/signup"
              className="flex items-center justify-between p-4 bg-gradient-to-r from-[#033F99] to-[#033F99] text-white rounded-xl hover:shadow-lg transition-all group"
            >
              <div className="flex items-center gap-3">
                <Zap className="h-6 w-6" />
                <div>
                  <p className="font-bold">Try IB Capital</p>
                  <p className="text-sm opacity-90">
                    Start your free trial today
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </section>
      </div>
    </IBCapitalHub>
  );
};

export default IBCapitalOverview;
