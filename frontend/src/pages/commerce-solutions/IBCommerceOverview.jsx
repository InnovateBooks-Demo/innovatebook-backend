import React from "react";
import { Link } from "react-router-dom";
import IBCommerceHub from "../IBCommerceHub";
import { InteractiveDashboard } from "../../components/marketing";
import {
  Users,
  Package,
  TrendingUp,
  ShoppingCart,
  Shield,
  CheckCircle,
  DollarSign,
  Target,
  Zap,
  ArrowRight,
  AlertTriangle,
  Lock,
  Activity,
  GitBranch,
  FileText,
} from "lucide-react";

const IBCommerceOverview = () => {
  const keyPrinciples = [
    {
      title: "Prevention Over Correction",
      description: "Stop bad deals before they happen, not after",
      icon: Shield,
      examples: [
        "Block deals with customers exceeding credit limits",
        "Prevent selling at margins below policy",
        "Stop procurement from non-compliant vendors",
      ],
    },
    {
      title: "Permission, Not Accounting",
      description:
        "IB Commerce is about WHO, WHAT, and UNDER WHAT TERMS - not tracking money",
      icon: Lock,
      examples: [
        "Who can you transact with?",
        "What products/services can be sold?",
        "At what price and margin?",
        "Under whose authority?",
      ],
    },
    {
      title: "Progressive Intelligence",
      description: "Counterparty relationships evolve based on history",
      icon: Activity,
      examples: [
        "Credit limits increase with clean payment history",
        "Risk ratings improve over time",
        "Approval requirements decrease for trusted parties",
      ],
    },
  ];

  const commercialFailures = [
    {
      problem: "Wrong Customer",
      cost: "$500K+ in bad debt",
      example:
        "Company extends $200K credit to customer already at limit. Customer defaults. All sales efforts wasted.",
      howPrevented:
        "PARTIES module flags customer at credit limit. Deal blocked at contract stage. CFO approval required for exception.",
      module: "Parties",
      icon: Users,
    },
    {
      problem: "Margin Erosion",
      cost: "15-25% profit loss",
      example:
        "Sales gives 30% discount to win deal. After delivery, company realizes margin is only 5%. Project becomes unprofitable.",
      howPrevented:
        "CATALOG enforces 20% maximum discount policy. System blocks quote. Director approval required for exception.",
      module: "Catalog",
      icon: Package,
    },
    {
      problem: "Unauthorized Commitment",
      cost: "$1M+ liability",
      example:
        "Manager signs $500K deal without authority. Terms are unfavorable. Company bound by contract. Reversal is costly.",
      howPrevented:
        "GOVERNANCE routes deals above $150K to CFO. Manager cannot execute contract. Authority matrix enforced.",
      module: "Governance",
      icon: Shield,
    },
    {
      problem: "Risky Vendor",
      cost: "Project delays, quality issues",
      example:
        "Procurement team engages vendor without compliance check. Mid-project, vendor fails audit. Must find replacement urgently.",
      howPrevented:
        "PROCUREMENT requires vendor risk assessment. Non-compliant vendors flagged. Approval escalated automatically.",
      module: "Procurement",
      icon: ShoppingCart,
    },
  ];

  const stats = [
    {
      metric: "100%",
      label: "Deal Compliance",
      sublabel: "Every deal follows policy",
    },
    {
      metric: "$2M+",
      label: "Exposure Prevented",
      sublabel: "Bad debts stopped before contract",
    },
    {
      metric: "0",
      label: "Unauthorized Deals",
      sublabel: "Authority matrix enforced",
    },
    {
      metric: "30%",
      label: "Better Margins",
      sublabel: "Pricing rules enforced",
    },
    { metric: "60%", label: "Faster Approvals", sublabel: "Automated routing" },
    {
      metric: "100%",
      label: "Audit Trail",
      sublabel: "Every decision tracked",
    },
  ];

  return (
    <IBCommerceHub>
      <div className="max-w-5xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            IB Commerce Overview
          </h1>
          <p className="text-2xl text-slate-600 leading-relaxed">
            Commercial Intelligence That{" "}
            <span className="text-[#033F99] font-semibold">
              Prevents Failures
            </span>{" "}
            Before They Happen
          </p>
        </div>

        {/* What is IB Commerce */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            What is IB Commerce?
          </h2>
          <div className="bg-gradient-to-r from-[#033F99] to-[#033F99] p-8 rounded-3xl text-white mb-6">
            <p className="text-xl leading-relaxed">
              IB Commerce is <span className="font-bold underline">NOT</span> a
              CRM. It's <span className="font-bold underline">NOT</span>{" "}
              accounting software. It's{" "}
              <span className="font-bold">a commercial operating system</span>{" "}
              that enforces rules about:
            </p>
            <ul className="mt-4 space-y-2 text-lg">
              <li className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 flex-shrink-0" />
                <span>
                  <strong>WHO</strong> you can do business with
                </span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 flex-shrink-0" />
                <span>
                  <strong>WHAT</strong> you can sell or buy
                </span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 flex-shrink-0" />
                <span>
                  <strong>AT WHAT PRICE</strong> and margin
                </span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 flex-shrink-0" />
                <span>
                  <strong>UNDER WHOSE AUTHORITY</strong>
                </span>
              </li>
            </ul>
          </div>
          <p className="text-lg text-slate-700 leading-relaxed">
            It sits <span className="font-semibold">BEFORE</span> finance and
            operations execute. Think of it as the{" "}
            <span className="font-semibold">bouncer at the door</span> -
            checking eligibility, enforcing rules, and routing approvals before
            any commitment is made.
          </p>
        </section>

        {/* Key Principles */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            Core Principles
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {keyPrinciples.map((principle, index) => {
              const Icon = principle.icon;
              return (
                <div
                  key={`item-${index}`}
                  className="bg-white p-6 rounded-3xl border-2 border-slate-200 hover:border-[#0558CC] hover:shadow-xl transition-all"
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
                        key={`item-${i}`}
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

        {/* Commercial Failures Prevented */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            Real Commercial Failures IB Commerce Prevents
          </h2>
          <div className="space-y-6">
            {commercialFailures.map((failure, index) => {
              const Icon = failure.icon;
              return (
                <div
                  key={`item-${index}`}
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
                            ❌ WHAT HAPPENS WITHOUT IB COMMERCE:
                          </p>
                          <p className="text-slate-700 bg-red-50 p-3 rounded-lg">
                            {failure.example}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-500 mb-2">
                            ✅ HOW IB COMMERCE PREVENTS IT:
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
                        <Link
                          to={`/solutions/commerce/${failure.module.toLowerCase()}`}
                          className="ml-auto flex items-center gap-1 text-[#033F99] hover:text-[#033F99] font-semibold text-sm"
                        >
                          Learn More <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Statistics */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            Measurable Business Impact
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <div
                key={`item-${index}`}
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
            type="commerce"
            title="IB Commerce Dashboard Preview"
          />
        </section>

        {/* Next Steps */}
        <section className="bg-gradient-to-r from-slate-50 to-white p-8 rounded-3xl border-2 border-slate-200">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Explore IB Commerce Modules
          </h2>
          <p className="text-lg text-slate-600 mb-6">
            Click on any module in the left sidebar to see detailed features,
            examples, and how it prevents specific commercial failures.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <Link
              to="/solutions/commerce/parties"
              className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-[#033F99] hover:shadow-lg transition-all group"
            >
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-[#033F99]" />
                <div>
                  <p className="font-bold text-slate-900">Start with Parties</p>
                  <p className="text-sm text-slate-600">
                    The foundation of all commercial activity
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
                  <p className="font-bold">Try IB Commerce</p>
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
    </IBCommerceHub>
  );
};

export default IBCommerceOverview;
