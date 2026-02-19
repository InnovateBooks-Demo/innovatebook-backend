import React, { useState } from "react";
import { Link } from "react-router-dom";
import IBFinanceHub from "../IBFinanceHub";
import {
  VideoWalkthrough,
  CaseStudy,
  TestimonialSection,
} from "../../components/marketing";
import {
  RefreshCw,
  CheckCircle,
  Zap,
  Play,
  Brain,
  Clock,
  AlertCircle,
  Check,
} from "lucide-react";

const ReconciliationPage = () => {
  const [showMatched, setShowMatched] = useState(true);

  const features = [
    {
      title: "ML Auto-Matching",
      description: "AI-powered transaction matching that learns.",
      items: [
        "Pattern recognition",
        "Fuzzy matching",
        "Amount tolerance",
        "Reference parsing",
      ],
    },
    {
      title: "Multi-Source Reconciliation",
      description: "Reconcile across banks, ERP, and sub-ledgers.",
      items: [
        "Bank to books",
        "AR/AP reconciliation",
        "Inter-company",
        "Inventory to GL",
      ],
    },
    {
      title: "Exception Handling",
      description: "Efficient workflow for unmatched items.",
      items: [
        "Exception queues",
        "Approval workflows",
        "Write-off management",
        "Audit documentation",
      ],
    },
    {
      title: "Continuous Reconciliation",
      description: "Move from monthly to daily reconciliation.",
      items: [
        "Real-time matching",
        "Auto-close periods",
        "Rolling reconciliation",
        "Zero-day close",
      ],
    },
  ];

  const benefits = [
    { metric: "95%", label: "Auto-Match Rate", description: "ML powered" },
    {
      metric: "5 Hours",
      label: "vs 5 Days",
      description: "Reconciliation time",
    },
    { metric: "99.9%", label: "Accuracy", description: "Verified matches" },
  ];

  const reconciliationData = {
    summary: { total: 847, matched: 805, pending: 42, matchRate: 95.0 },
    matched: [
      {
        bankRef: "HDFC-2026-45678",
        bookRef: "INV-2026-1234",
        bankAmt: 125000,
        bookAmt: 125000,
        confidence: 100,
      },
      {
        bankRef: "HDFC-2026-45679",
        bookRef: "INV-2026-1235",
        bankAmt: 87500,
        bookAmt: 87500,
        confidence: 100,
      },
      {
        bankRef: "HDFC-2026-45680",
        bookRef: "INV-2026-1238",
        bankAmt: 45200,
        bookAmt: 45000,
        confidence: 95,
      },
    ],
    pending: [
      {
        bankRef: "HDFC-2026-45681",
        bankAmt: 250000,
        reason: "No matching invoice found",
        age: 3,
      },
      {
        bankRef: "HDFC-2026-45682",
        bankAmt: 18500,
        reason: "Multiple possible matches",
        age: 2,
      },
    ],
  };

  const testimonials = [
    {
      quote:
        "Bank reconciliation went from a 5-day nightmare to 2 hours. The ML matching is incredibly accurate - 96% auto-matched in month one.",
      author: "Arvind Krishnan",
      role: "Finance Manager",
      company: "ExportGiant India",
      rating: 5,
    },
    {
      quote:
        "We moved to daily reconciliation. Month-end is now just a formality. Auditors love the trail and documentation.",
      author: "Meera Patel",
      role: "Financial Controller",
      company: "TradeCorp",
      rating: 5,
    },
    {
      quote:
        "The ML learns our patterns. Vendor codes, reference formats - it figured them out automatically. Match rate went from 70% to 96%.",
      author: "Suresh Nair",
      role: "Accounts Head",
      company: "ManufacturePro India",
      rating: 5,
    },
    {
      quote:
        "Inter-company reconciliation across 8 entities was a month-end horror. Now it's automated and real-time. Game changer.",
      author: "Priya Sharma",
      role: "Group Controller",
      company: "ConglomerateFirst",
      rating: 5,
    },
  ];

  const caseStudy = {
    company: "ReconcilePro Industries",
    industry: "Trading & Distribution",
    employees: "620+",
    logo: "RP",
    challenge:
      "ReconcilePro processed 15,000+ bank transactions monthly across 6 accounts. Manual reconciliation took 5 days, with 400+ items always pending. Month-end was a firefight, and errors slipped through.",
    solution:
      "Implemented IB Finance Reconciliation with ML-powered auto-matching, continuous daily reconciliation, intelligent exception queues, and automated audit documentation.",
    results: [
      { metric: "96%", label: "Auto-Match Rate", detail: "From 65% manual" },
      {
        metric: "4 Hours",
        label: "Monthly Reconciliation",
        detail: "vs 5 days before",
      },
      {
        metric: "98%",
        label: "Reduction in Pending",
        detail: "From 400 to 8 items",
      },
      {
        metric: "Zero",
        label: "Errors in 18 Months",
        detail: "Complete accuracy",
      },
    ],
    quote:
      "5 days to 4 hours. 400 pending items to 8. We didn't believe it was possible until we saw it. The ML just keeps getting better.",
    quotePerson: "Rajesh Kumar, CFO",
  };

  return (
    <IBFinanceHub>
      <div className="max-w-5xl">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-2xl flex items-center justify-center">
              <RefreshCw className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">
                Reconciliation
              </h1>
              <p className="text-lg text-[#033F99] font-semibold">
                ML-Powered Matching
              </p>
            </div>
          </div>
          <p className="text-xl text-slate-600 leading-relaxed">
            AI-powered bank reconciliation with 95% auto-match rate and
            continuous reconciliation.
          </p>
        </div>

        <section className="mb-12">
          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-[#033F99] to-[#033F99] p-6 rounded-2xl text-white text-center"
              >
                <p className="text-4xl font-bold mb-2">{b.metric}</p>
                <p className="text-lg font-semibold mb-1">{b.label}</p>
                <p className="text-sm opacity-80">{b.description}</p>
              </div>
            ))}
          </div>
        </section>

        <VideoWalkthrough
          title="ML Reconciliation Demo"
          description="Watch AI match transactions with 95%+ accuracy"
          duration="4 min"
          moduleName="IB Finance"
          subModule="Reconciliation Module"
          Icon={RefreshCw}
        />

        {/* Interactive Demo */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Play className="h-6 w-6 text-[#033F99]" />
            <h2 className="text-3xl font-bold text-slate-900">
              Interactive Demo
            </h2>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full font-semibold flex items-center gap-1">
              <Brain className="h-4 w-4" />
              ML Matcher
            </span>
          </div>

          <div className="bg-gradient-to-br from-[#EBF3FC] to-white p-6 rounded-3xl border-2 border-[#C4D9F4]">
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
                <p className="text-sm text-slate-600">Total Transactions</p>
                <p className="text-2xl font-bold text-slate-900">
                  {reconciliationData.summary.total}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl border border-green-200 text-center">
                <p className="text-sm text-slate-600">Auto-Matched</p>
                <p className="text-2xl font-bold text-green-600">
                  {reconciliationData.summary.matched}
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 text-center">
                <p className="text-sm text-slate-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {reconciliationData.summary.pending}
                </p>
              </div>
              <div className="bg-[#EBF3FC] p-4 rounded-xl border border-[#C4D9F4] text-center">
                <p className="text-sm text-slate-600">Match Rate</p>
                <p className="text-2xl font-bold text-[#033F99]">
                  {reconciliationData.summary.matchRate}%
                </p>
              </div>
            </div>

            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setShowMatched(true)}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${showMatched ? "bg-[#033F99] text-white" : "bg-white text-slate-700 border border-slate-300 hover:border-[#033F99]"}`}
              >
                <Check className="h-4 w-4" />
                Matched ({reconciliationData.summary.matched})
              </button>
              <button
                onClick={() => setShowMatched(false)}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${!showMatched ? "bg-[#033F99] text-white" : "bg-white text-slate-700 border border-slate-300 hover:border-[#033F99]"}`}
              >
                <Clock className="h-4 w-4" />
                Pending ({reconciliationData.summary.pending})
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {showMatched ? (
                <div>
                  <div className="p-4 bg-green-50 border-b flex items-center gap-2 text-green-700">
                    <Check className="h-5 w-5" />
                    <span className="font-semibold">
                      Auto-Matched Transactions
                    </span>
                  </div>
                  <div className="divide-y">
                    {reconciliationData.matched.map((item, i) => (
                      <div
                        key={i}
                        className="p-4 hover:bg-slate-50 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-6">
                          <div>
                            <p className="text-sm text-slate-600">Bank</p>
                            <p className="font-mono text-sm font-semibold text-slate-900">
                              {item.bankRef}
                            </p>
                            <p className="font-bold text-slate-900">
                              ₹{item.bankAmt.toLocaleString()}
                            </p>
                          </div>
                          <div className="text-2xl text-green-500">↔</div>
                          <div>
                            <p className="text-sm text-slate-600">Books</p>
                            <p className="font-mono text-sm font-semibold text-slate-900">
                              {item.bookRef}
                            </p>
                            <p className="font-bold text-slate-900">
                              ₹{item.bookAmt.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <Brain className="h-4 w-4 text-purple-600" />
                            <span className="text-sm text-slate-600">
                              Confidence
                            </span>
                          </div>
                          <p
                            className={`text-xl font-bold ${item.confidence === 100 ? "text-green-600" : "text-yellow-600"}`}
                          >
                            {item.confidence}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="p-4 bg-yellow-50 border-b flex items-center gap-2 text-yellow-700">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-semibold">
                      Pending Review - Manual Action Required
                    </span>
                  </div>
                  <div className="divide-y">
                    {reconciliationData.pending.map((item, i) => (
                      <div
                        key={i}
                        className="p-4 hover:bg-slate-50 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-mono text-sm font-semibold text-slate-900">
                            {item.bankRef}
                          </p>
                          <p className="font-bold text-slate-900">
                            ₹{item.bankAmt.toLocaleString()}
                          </p>
                          <p className="text-sm text-red-600 mt-1">
                            {item.reason}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-slate-500">
                            {item.age} days old
                          </span>
                          <button className="bg-[#033F99] text-white px-3 py-1 rounded-lg text-sm font-medium">
                            Match Manually
                          </button>
                          <button className="border border-slate-300 text-slate-700 px-3 py-1 rounded-lg text-sm font-medium">
                            Write Off
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
              <div className="flex items-center gap-2 text-purple-700">
                <Brain className="h-5 w-5" />
                <span className="font-semibold">ML Learning:</span>
                <span>
                  Match patterns improved by 3% this month. 12 new reference
                  patterns learned.
                </span>
              </div>
            </div>

            <p className="text-center text-sm text-slate-500 mt-4">
              Toggle between Matched and Pending transactions to explore the
              reconciliation workflow
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            Key Features
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-2xl border-2 border-slate-200 hover:border-[#033F99] transition-all"
              >
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {f.title}
                </h3>
                <p className="text-slate-600 mb-4">{f.description}</p>
                <div className="space-y-2">
                  {f.items.map((item, j) => (
                    <div
                      key={j}
                      className="flex items-center gap-2 text-sm text-slate-700"
                    >
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <CaseStudy data={caseStudy} />
        <TestimonialSection testimonials={testimonials} />

        <section className="bg-gradient-to-r from-[#033F99] to-[#033F99] p-8 rounded-3xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Ready for AI-Powered Reconciliation?
              </h2>
              <p className="opacity-90">From 5 days to 5 hours</p>
            </div>
            <Link to="/auth/signup">
              <button className="bg-white text-[#033F99] font-bold px-8 py-4 rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Start Free Trial
              </button>
            </Link>
          </div>
        </section>
      </div>
    </IBFinanceHub>
  );
};

export default ReconciliationPage;
