import React, { useState } from "react";
import { Link } from "react-router-dom";
import IBCapitalHub from "../IBCapitalHub";
import {
  VideoWalkthrough,
  CaseStudy,
  TestimonialSection,
} from "../../components/marketing";
import {
  TrendingUp,
  CheckCircle,
  Zap,
  Play,
  ArrowUp,
  ArrowDown,
  Brain,
} from "lucide-react";

const ForecastingPage = () => {
  const [forecastRange, setForecastRange] = useState("90");

  const features = [
    {
      title: "90-Day Cash Forecast",
      description: "AI-powered predictions based on historical patterns.",
      items: [
        "Pattern recognition",
        "Seasonal adjustments",
        "Trend analysis",
        "Confidence intervals",
      ],
    },
    {
      title: "AR Collection Prediction",
      description: "Predict when invoices will actually be paid.",
      items: [
        "Customer payment patterns",
        "Invoice aging analysis",
        "Collection probability",
        "DSO forecasting",
      ],
    },
    {
      title: "AP Payment Scheduling",
      description: "Optimize outflow timing for cash efficiency.",
      items: [
        "Due date analysis",
        "Early payment discounts",
        "Cash buffer planning",
        "Vendor prioritization",
      ],
    },
    {
      title: "Scenario Modeling",
      description: "Test different scenarios on cash position.",
      items: [
        "What-if analysis",
        "Best/worst case",
        "Sensitivity testing",
        "Decision support",
      ],
    },
  ];

  const benefits = [
    {
      metric: "92%",
      label: "Forecast Accuracy",
      description: "AI predictions",
    },
    {
      metric: "15 Days",
      label: "Earlier Warning",
      description: "Cash shortfall alerts",
    },
    { metric: "₹18L", label: "Interest Saved", description: "Better planning" },
  ];

  const forecastData = {
    30: [
      { week: "Week 1", opening: 45, inflows: 28, outflows: 22, closing: 51 },
      { week: "Week 2", opening: 51, inflows: 35, outflows: 30, closing: 56 },
      { week: "Week 3", opening: 56, inflows: 22, outflows: 38, closing: 40 },
      { week: "Week 4", opening: 40, inflows: 42, outflows: 25, closing: 57 },
    ],
    60: [
      {
        week: "Month 1",
        opening: 45,
        inflows: 127,
        outflows: 115,
        closing: 57,
      },
      {
        week: "Month 2",
        opening: 57,
        inflows: 135,
        outflows: 142,
        closing: 50,
      },
    ],
    90: [
      {
        week: "Jan 2026",
        opening: 45,
        inflows: 127,
        outflows: 115,
        closing: 57,
      },
      {
        week: "Feb 2026",
        opening: 57,
        inflows: 135,
        outflows: 142,
        closing: 50,
      },
      {
        week: "Mar 2026",
        opening: 50,
        inflows: 152,
        outflows: 138,
        closing: 64,
      },
    ],
  };

  const testimonials = [
    {
      quote:
        "The 90-day forecast caught a ₹45L shortfall 6 weeks before it would have hit. We arranged a credit line calmly instead of panic mode.",
      author: "Rahul Verma",
      role: "CFO",
      company: "TechScale Solutions",
      rating: 5,
    },
    {
      quote:
        "AR collection predictions are 90% accurate. We now know which invoices will pay late and can follow up proactively.",
      author: "Anita Desai",
      role: "Credit Controller",
      company: "DistributionFirst",
      rating: 5,
    },
    {
      quote:
        "Scenario modeling helped us prepare for the slowdown. We tested 3 revenue scenarios and had contingency plans ready.",
      author: "Vikram Singh",
      role: "Treasury Director",
      company: "GlobalTrade Corp",
      rating: 5,
    },
    {
      quote:
        "The AI learns our business patterns. After 3 months, forecast accuracy went from 85% to 94%. Impressive.",
      author: "Priya Nair",
      role: "FP&A Manager",
      company: "StartupScale India",
      rating: 5,
    },
  ];

  const caseStudy = {
    company: "SeasonalGoods Ltd",
    industry: "FMCG Distribution",
    employees: "320+",
    logo: "SG",
    challenge:
      "SeasonalGoods had highly variable cash flows due to festive season spikes. They faced a ₹2Cr cash crunch during Diwali 2024 due to poor planning, forcing expensive bridge financing.",
    solution:
      "Implemented IB Capital Forecasting with 90-day AI predictions, seasonal pattern recognition, and AR collection probability modeling tailored to their business cycles.",
    results: [
      {
        metric: "94%",
        label: "Forecast Accuracy",
        detail: "Across all seasons",
      },
      { metric: "₹1.8Cr", label: "Bridge Loan Avoided", detail: "Diwali 2025" },
      {
        metric: "45 Days",
        label: "Advance Planning",
        detail: "For cash needs",
      },
      { metric: "₹28L", label: "Interest Saved", detail: "First year" },
    ],
    quote:
      "Last Diwali was a disaster. This Diwali we knew exactly what was coming and had funds arranged 6 weeks in advance. Night and day difference.",
    quotePerson: "Sandeep Agarwal, Managing Director",
  };

  const data = forecastData[forecastRange];

  return (
    <IBCapitalHub>
      <div className="max-w-5xl">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-2xl flex items-center justify-center">
              <TrendingUp className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Forecasting</h1>
              <p className="text-lg text-[#033F99] font-semibold">
                AI Cash Flow Predictions
              </p>
            </div>
          </div>
          <p className="text-xl text-slate-600 leading-relaxed">
            90-day AI-powered cash flow forecasting with AR/AP predictions.
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
          title="AI Cash Forecasting Demo"
          description="See how AI predicts your cash position 90 days ahead"
          duration="5 min"
          moduleName="IB Capital"
          subModule="Forecasting Module"
          Icon={TrendingUp}
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
              AI Powered
            </span>
          </div>

          <div className="bg-gradient-to-br from-[#EBF3FC] to-white p-6 rounded-3xl border-2 border-[#C4D9F4]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                Cash Flow Forecast
              </h3>
              <div className="flex gap-2">
                {[
                  { value: "30", label: "30 Days" },
                  { value: "60", label: "60 Days" },
                  { value: "90", label: "90 Days" },
                ].map((range) => (
                  <button
                    key={range.value}
                    onClick={() => setForecastRange(range.value)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${forecastRange === range.value ? "bg-[#033F99] text-white" : "bg-white text-slate-700 border border-slate-300 hover:border-[#033F99]"}`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-4">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-slate-700">
                      Period
                    </th>
                    <th className="text-right p-4 text-sm font-semibold text-slate-700">
                      Opening (₹L)
                    </th>
                    <th className="text-right p-4 text-sm font-semibold text-slate-700">
                      <span className="flex items-center justify-end gap-1 text-green-600">
                        <ArrowUp className="h-4 w-4" /> Inflows
                      </span>
                    </th>
                    <th className="text-right p-4 text-sm font-semibold text-slate-700">
                      <span className="flex items-center justify-end gap-1 text-red-600">
                        <ArrowDown className="h-4 w-4" /> Outflows
                      </span>
                    </th>
                    <th className="text-right p-4 text-sm font-semibold text-slate-700">
                      Closing (₹L)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, i) => (
                    <tr
                      key={i}
                      className="border-t border-slate-100 hover:bg-slate-50"
                    >
                      <td className="p-4 font-medium text-slate-900">
                        {row.week}
                      </td>
                      <td className="p-4 text-right text-slate-600">
                        ₹{row.opening}L
                      </td>
                      <td className="p-4 text-right text-green-600 font-semibold">
                        +₹{row.inflows}L
                      </td>
                      <td className="p-4 text-right text-red-600 font-semibold">
                        -₹{row.outflows}L
                      </td>
                      <td
                        className={`p-4 text-right font-bold ${row.closing < 35 ? "text-red-600" : "text-slate-900"}`}
                      >
                        ₹{row.closing}L
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <p className="text-sm text-slate-600 mb-3">
                Closing Balance Trend
              </p>
              <div className="flex items-end gap-4 h-24">
                {data.map((row, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div
                      className={`w-full rounded-t-lg transition-all ${row.closing < 35 ? "bg-red-400" : "bg-[#033F99]"}`}
                      style={{ height: `${(row.closing / 70) * 100}%` }}
                    ></div>
                    <p className="text-xs text-slate-600 mt-2">
                      {row.week.split(" ")[0]}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-2 mt-3 text-xs text-slate-500">
                <span className="w-3 h-3 bg-[#033F99] rounded"></span> Healthy
                <span className="w-3 h-3 bg-red-400 rounded ml-3"></span> Below
                Threshold (₹35L)
              </div>
            </div>

            <div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
              <div className="flex items-center gap-2 text-purple-700">
                <Brain className="h-5 w-5" />
                <span className="font-semibold">AI Insight:</span>
                <span>
                  {forecastRange === "90"
                    ? "Cash position improves in March. Consider FD investment in Week 2 of March."
                    : forecastRange === "60"
                      ? "Slight dip in Month 2 due to Q1 tax payments. Maintain ₹40L buffer."
                      : "Week 3 shows temporary dip. AR collections expected to recover in Week 4."}
                </span>
              </div>
            </div>

            <p className="text-center text-sm text-slate-500 mt-4">
              Switch between forecast ranges to see different time horizons
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
                Ready for AI-Powered Forecasting?
              </h2>
              <p className="opacity-90">
                See your cash future with 92% accuracy
              </p>
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
    </IBCapitalHub>
  );
};

export default ForecastingPage;
