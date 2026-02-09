import React, { useState } from "react";
import { Link } from "react-router-dom";
import IBCapitalHub from "../IBCapitalHub";
import {
  VideoWalkthrough,
  CaseStudy,
  TestimonialSection,
} from "../../components/marketing";
import {
  Lightbulb,
  CheckCircle,
  Zap,
  Play,
  TrendingUp,
  AlertCircle,
  Brain,
} from "lucide-react";

const OptimizationPage = () => {
  const [showRecommendations, setShowRecommendations] = useState(true);

  const features = [
    {
      title: "Idle Cash Detection",
      description: "Identify uninvested cash sitting in current accounts.",
      items: [
        "Balance analysis",
        "Opportunity cost calculation",
        "Automatic alerts",
        "Investment recommendations",
      ],
    },
    {
      title: "Investment Suggestions",
      description: "AI-powered recommendations for surplus deployment.",
      items: [
        "Risk-based allocation",
        "Return optimization",
        "Liquidity matching",
        "Tax efficiency",
      ],
    },
    {
      title: "Working Capital Optimization",
      description: "Improve cash conversion cycle efficiency.",
      items: [
        "DSO reduction strategies",
        "DPO optimization",
        "Inventory turnover",
        "CCC improvement",
      ],
    },
    {
      title: "Return Enhancement",
      description: "Maximize returns on treasury investments.",
      items: [
        "Rate comparison",
        "Ladder strategies",
        "Duration matching",
        "Yield optimization",
      ],
    },
  ];

  const benefits = [
    {
      metric: "₹2.4L",
      label: "Extra Returns/Month",
      description: "Idle cash deployed",
    },
    {
      metric: "35%",
      label: "Better Cash Utilization",
      description: "Optimized allocation",
    },
    {
      metric: "8.5%",
      label: "Avg Portfolio Yield",
      description: "vs 4% in current a/c",
    },
  ];

  const cashAnalysis = {
    totalCash: 25000000,
    working: 8000000,
    buffer: 5000000,
    idle: 12000000,
    currentReturn: 4,
    potentialReturn: 7.5,
    lostOpportunity: 350000,
  };

  const recommendations = [
    {
      type: "Fixed Deposit",
      amount: 5000000,
      suggestedReturn: 7.25,
      bank: "HDFC Bank",
      tenure: "1 Year",
    },
    {
      type: "Liquid Fund",
      amount: 4000000,
      suggestedReturn: 7.5,
      fund: "ICICI Liquid Fund",
      exit: "T+1",
    },
    {
      type: "Overnight Fund",
      amount: 3000000,
      suggestedReturn: 6.0,
      fund: "Axis Overnight",
      exit: "Same Day",
    },
  ];

  const testimonials = [
    {
      quote:
        "We had ₹1.2Cr sitting idle in current accounts earning nothing. The optimization tool now auto-deploys to liquid funds. Extra ₹8L/year.",
      author: "Vikram Jain",
      role: "CFO",
      company: "ExportKing Ltd",
      rating: 5,
    },
    {
      quote:
        "The AI suggestions are spot-on. It recommended a sweep arrangement that improved our yields by 3.5% with zero extra effort.",
      author: "Neha Sharma",
      role: "Treasury Manager",
      company: "TechGiant India",
      rating: 5,
    },
    {
      quote:
        "Working capital optimization reduced our cash conversion cycle by 12 days. That freed up ₹3Cr for other uses.",
      author: "Rajesh Nair",
      role: "Finance Director",
      company: "ManufactureFirst",
      rating: 5,
    },
    {
      quote:
        "The ladder strategy for FDs optimized our maturity dates perfectly with our cash needs. Smart system.",
      author: "Pooja Mehta",
      role: "Treasury Analyst",
      company: "ServicesPro India",
      rating: 5,
    },
  ];

  const caseStudy = {
    company: "IdleCash Industries",
    industry: "Textile Manufacturing",
    employees: "680+",
    logo: "IC",
    challenge:
      "IdleCash had ₹4.5Cr in current accounts earning 3.5% while they could earn 7%+ in liquid funds. No visibility into idle cash, manual tracking, and missed investment opportunities were costing them ₹35L+ annually.",
    solution:
      "Implemented IB Capital Optimization with automated idle cash detection, AI investment recommendations, and working capital analytics to identify and deploy surplus efficiently.",
    results: [
      { metric: "₹42L", label: "Extra Returns", detail: "First year" },
      { metric: "7.2%", label: "Portfolio Yield", detail: "vs 3.5% before" },
      {
        metric: "₹2.8Cr",
        label: "Idle Cash Deployed",
        detail: "Within 30 days",
      },
      {
        metric: "15 Days",
        label: "CCC Reduction",
        detail: "Working capital freed",
      },
    ],
    quote:
      "I was skeptical about finding ₹2.8Cr of idle cash in our accounts. The analysis showed it clearly. Now it's earning instead of sitting.",
    quotePerson: "Suresh Agarwal, CFO",
  };

  return (
    <IBCapitalHub>
      <div className="max-w-5xl">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#3A4E63] to-[#3A4E63] rounded-2xl flex items-center justify-center">
              <Lightbulb className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">
                Optimization
              </h1>
              <p className="text-lg text-[#3A4E63] font-semibold">
                Cash Optimization Engine
              </p>
            </div>
          </div>
          <p className="text-xl text-slate-600 leading-relaxed">
            Detect idle cash and get AI recommendations for optimal deployment.
          </p>
        </div>

        <section className="mb-12">
          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-[#3A4E63] to-[#3A4E63] p-6 rounded-2xl text-white text-center"
              >
                <p className="text-4xl font-bold mb-2">{b.metric}</p>
                <p className="text-lg font-semibold mb-1">{b.label}</p>
                <p className="text-sm opacity-80">{b.description}</p>
              </div>
            ))}
          </div>
        </section>

        <VideoWalkthrough
          title="Cash Optimization Demo"
          description="Discover hidden returns in your idle cash"
          duration="4 min"
          moduleName="IB Capital"
          subModule="Optimization Module"
          Icon={Lightbulb}
        />

        {/* Interactive Demo */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Play className="h-6 w-6 text-[#3A4E63]" />
            <h2 className="text-3xl font-bold text-slate-900">
              Interactive Demo
            </h2>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full font-semibold flex items-center gap-1">
              <Brain className="h-4 w-4" />
              AI Optimizer
            </span>
          </div>

          <div className="bg-gradient-to-br from-[#EBF3FC] to-white p-6 rounded-3xl border-2 border-[#C4D9F4]">
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
                <p className="text-sm text-slate-600">Total Cash</p>
                <p className="text-2xl font-bold text-slate-900">
                  ₹{(cashAnalysis.totalCash / 10000000).toFixed(1)} Cr
                </p>
              </div>
              <div className="bg-[rgba(3,63,153,0.08)] p-4 rounded-xl border border-[rgba(3,63,153,0.25)] text-center">
                <p className="text-sm text-slate-600">Working Capital</p>
                <p className="text-2xl font-bold text-[#033F99]">
                  ₹{(cashAnalysis.working / 10000000).toFixed(1)} Cr
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl border border-green-200 text-center">
                <p className="text-sm text-slate-600">Safety Buffer</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{(cashAnalysis.buffer / 10000000).toFixed(1)} Cr
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 text-center">
                <p className="text-sm text-slate-600">Idle Cash</p>
                <p className="text-2xl font-bold text-yellow-600">
                  ₹{(cashAnalysis.idle / 10000000).toFixed(1)} Cr
                </p>
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-xl border border-red-200 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                  <div>
                    <p className="font-semibold text-red-700">
                      Opportunity Cost Alert
                    </p>
                    <p className="text-sm text-red-600">
                      ₹{(cashAnalysis.idle / 10000000).toFixed(1)} Cr earning{" "}
                      {cashAnalysis.currentReturn}% instead of{" "}
                      {cashAnalysis.potentialReturn}%
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-red-600">Lost Returns (Annual)</p>
                  <p className="text-2xl font-bold text-red-700">
                    ₹{(cashAnalysis.lostOpportunity / 100000).toFixed(1)}L
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <h4 className="font-bold text-slate-900">
                    AI Investment Recommendations
                  </h4>
                </div>
                <button
                  onClick={() => setShowRecommendations(!showRecommendations)}
                  className="text-[#3A4E63] text-sm font-semibold hover:underline"
                >
                  {showRecommendations ? "Hide" : "Show"} Recommendations
                </button>
              </div>

              {showRecommendations && (
                <div className="space-y-3">
                  {recommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#3A4E63] rounded-lg flex items-center justify-center text-white font-bold">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {rec.type}
                          </p>
                          <p className="text-sm text-slate-600">
                            {rec.bank || rec.fund} •{" "}
                            {rec.tenure || `Exit: ${rec.exit}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-sm text-slate-600">Amount</p>
                          <p className="font-bold text-slate-900">
                            ₹{(rec.amount / 10000000).toFixed(1)} Cr
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-slate-600">
                            Expected Return
                          </p>
                          <p className="font-bold text-green-600">
                            {rec.suggestedReturn}%
                          </p>
                        </div>
                        <button className="bg-[#3A4E63] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#3A4E63]">
                          Invest
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showRecommendations && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 text-green-700">
                    <TrendingUp className="h-5 w-5" />
                    <span className="font-semibold">
                      Following these recommendations can generate ₹
                      {(cashAnalysis.lostOpportunity / 100000).toFixed(1)}L
                      additional returns annually
                    </span>
                  </div>
                </div>
              )}
            </div>

            <p className="text-center text-sm text-slate-500 mt-4">
              Click on recommendations to see investment details and execute
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
                className="bg-white p-6 rounded-2xl border-2 border-slate-200 hover:border-[#3A4E63] transition-all"
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

        <section className="bg-gradient-to-r from-[#3A4E63] to-[#3A4E63] p-8 rounded-3xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Ready to Optimize Your Cash?
              </h2>
              <p className="opacity-90">Stop leaving money on the table</p>
            </div>
            <Link to="/auth/signup">
              <button className="bg-white text-[#3A4E63] font-bold px-8 py-4 rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Start Free Trial
              </button>
            </Link>
          </div>
        </section>
      </div>
    </IBCapitalHub>
  );
};

export default OptimizationPage;
