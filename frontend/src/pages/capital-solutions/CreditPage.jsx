import React, { useState } from "react";
import { Link } from "react-router-dom";
import IBCapitalHub from "../IBCapitalHub";
import {
  VideoWalkthrough,
  CaseStudy,
  TestimonialSection,
} from "../../components/marketing";
import {
  CreditCard,
  CheckCircle,
  Zap,
  Play,
  AlertTriangle,
  Calendar,
} from "lucide-react";

const CreditPage = () => {
  const [selectedFacility, setSelectedFacility] = useState(0);

  const features = [
    {
      title: "Loan Management",
      description: "Track all term loans with EMI schedules.",
      items: [
        "Loan tracking",
        "EMI schedules",
        "Interest calculation",
        "Prepayment planning",
      ],
    },
    {
      title: "Credit Lines",
      description: "Monitor working capital and credit facilities.",
      items: [
        "Facility utilization",
        "Drawing power",
        "Limit tracking",
        "Renewal management",
      ],
    },
    {
      title: "Covenant Compliance",
      description: "Never miss a bank covenant again.",
      items: [
        "Covenant tracking",
        "Auto-calculation",
        "Breach alerts",
        "Compliance reports",
      ],
    },
    {
      title: "Interest Analysis",
      description: "Optimize borrowing costs across facilities.",
      items: [
        "Interest comparison",
        "Rate benchmarking",
        "Refinancing analysis",
        "Cost optimization",
      ],
    },
  ];

  const benefits = [
    {
      metric: "₹8.5L",
      label: "Interest Saved/Year",
      description: "Optimal utilization",
    },
    {
      metric: "100%",
      label: "Covenant Compliance",
      description: "Auto-monitoring",
    },
    {
      metric: "Real-Time",
      label: "Debt Position",
      description: "All facilities view",
    },
  ];

  const creditFacilities = [
    {
      name: "Term Loan - HDFC",
      type: "Term Loan",
      sanctioned: 50000000,
      outstanding: 32500000,
      emi: 1250000,
      rate: 10.5,
      nextEmi: "15 Jan 2026",
      covenantStatus: "Compliant",
    },
    {
      name: "CC Limit - ICICI",
      type: "Cash Credit",
      sanctioned: 20000000,
      outstanding: 15000000,
      dp: 18000000,
      rate: 11.25,
      renewal: "31 Mar 2026",
      covenantStatus: "Compliant",
    },
    {
      name: "OD Facility - Axis",
      type: "Overdraft",
      sanctioned: 10000000,
      outstanding: 8500000,
      rate: 12.0,
      renewal: "30 Jun 2026",
      covenantStatus: "At Risk",
    },
  ];

  const testimonials = [
    {
      quote:
        "We caught a covenant breach 45 days before it happened. Saved us from a ₹50L penalty and potential loan recall.",
      author: "Suresh Iyer",
      role: "CFO",
      company: "ManufacturingPro",
      rating: 5,
    },
    {
      quote:
        "The interest rate comparison helped us refinance at 1.5% lower rate. Annual savings: ₹22L.",
      author: "Kavitha Raman",
      role: "Treasury Head",
      company: "TradeCorp India",
      rating: 5,
    },
    {
      quote:
        "Managing 8 credit facilities across 5 banks was chaos. Now everything is in one dashboard with automatic alerts.",
      author: "Amit Patel",
      role: "Finance Director",
      company: "InfraGiant Ltd",
      rating: 5,
    },
    {
      quote:
        "The EMI scheduler and prepayment analyzer helped us optimize our loan repayment strategy. Saved 18 months of interest.",
      author: "Nisha Verma",
      role: "Treasury Manager",
      company: "ExportFirst India",
      rating: 5,
    },
  ];

  const caseStudy = {
    company: "GrowthScale Industries",
    industry: "Manufacturing",
    employees: "1200+",
    logo: "GS",
    challenge:
      "GrowthScale had ₹45Cr in debt across 6 facilities with 4 banks. Covenant tracking was manual in spreadsheets, leading to a near-miss breach. Interest optimization was impossible without consolidated view.",
    solution:
      "Implemented IB Capital Credit Lines module with automated covenant calculations, real-time debt dashboard, and interest rate benchmarking across all facilities.",
    results: [
      { metric: "₹32L", label: "Interest Saved", detail: "Year 1 refinancing" },
      {
        metric: "100%",
        label: "Covenant Compliance",
        detail: "Zero near-misses",
      },
      { metric: "45 Days", label: "Early Warning", detail: "Covenant alerts" },
      { metric: "2 Hours", label: "vs 2 Days", detail: "Bank reporting" },
    ],
    quote:
      "The covenant early warning system alone paid for the entire platform in the first quarter. We sleep better now.",
    quotePerson: "Rajesh Menon, Group CFO",
  };

  const selected = creditFacilities[selectedFacility];
  const utilization = (
    (selected.outstanding / selected.sanctioned) *
    100
  ).toFixed(0);

  return (
    <IBCapitalHub>
      <div className="max-w-5xl">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-2xl flex items-center justify-center">
              <CreditCard className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">
                Credit Lines
              </h1>
              <p className="text-lg text-[#033F99] font-semibold">
                Debt Management
              </p>
            </div>
          </div>
          <p className="text-xl text-slate-600 leading-relaxed">
            Manage all loans, credit facilities, and covenant compliance in one
            place.
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
          title="Credit Lines Management Demo"
          description="Master your debt portfolio and covenant compliance"
          duration="5 min"
          moduleName="IB Capital"
          subModule="Credit Lines Module"
          Icon={CreditCard}
        />

        {/* Interactive Demo */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Play className="h-6 w-6 text-[#033F99]" />
            <h2 className="text-3xl font-bold text-slate-900">
              Interactive Demo
            </h2>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-semibold">
              Debt Dashboard
            </span>
          </div>

          <div className="bg-gradient-to-br from-[#EBF3FC] to-white p-6 rounded-3xl border-2 border-[#C4D9F4]">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
                <p className="text-sm text-slate-600">Total Sanctioned</p>
                <p className="text-2xl font-bold text-slate-900">₹8.0 Cr</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
                <p className="text-sm text-slate-600">Total Outstanding</p>
                <p className="text-2xl font-bold text-red-600">₹5.6 Cr</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
                <p className="text-sm text-slate-600">Available Limit</p>
                <p className="text-2xl font-bold text-green-600">₹2.4 Cr</p>
              </div>
            </div>

            <div className="flex gap-3 mb-6 flex-wrap">
              {creditFacilities.map((facility, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedFacility(index)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedFacility === index ? "bg-[#033F99] text-white" : "bg-white text-slate-700 border border-slate-300 hover:border-[#033F99]"}`}
                >
                  {facility.type}
                </button>
              ))}
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h4 className="text-xl font-bold text-slate-900">
                    {selected.name}
                  </h4>
                  <p className="text-slate-600">
                    {selected.type} @ {selected.rate}% p.a.
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${selected.covenantStatus === "Compliant" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                >
                  {selected.covenantStatus === "At Risk" && (
                    <AlertTriangle className="h-4 w-4 inline mr-1" />
                  )}
                  {selected.covenantStatus}
                </span>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Facility Utilization</span>
                  <span className="font-semibold text-slate-900">
                    {utilization}%
                  </span>
                </div>
                <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${parseInt(utilization) > 80 ? "bg-red-500" : parseInt(utilization) > 60 ? "bg-yellow-500" : "bg-green-500"}`}
                    style={{ width: `${utilization}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Sanctioned</p>
                  <p className="text-xl font-bold text-slate-900">
                    ₹{(selected.sanctioned / 10000000).toFixed(1)} Cr
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Outstanding</p>
                  <p className="text-xl font-bold text-red-600">
                    ₹{(selected.outstanding / 10000000).toFixed(2)} Cr
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Available</p>
                  <p className="text-xl font-bold text-green-600">
                    ₹
                    {(
                      (selected.sanctioned - selected.outstanding) /
                      10000000
                    ).toFixed(2)}{" "}
                    Cr
                  </p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-[#EBF3FC] rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#033F99]" />
                  <span className="text-slate-700">
                    {selected.emi
                      ? `Next EMI: ${selected.nextEmi}`
                      : `Renewal Due: ${selected.renewal}`}
                  </span>
                </div>
                {selected.emi && (
                  <span className="font-bold text-[#033F99]">
                    ₹{(selected.emi / 100000).toFixed(1)}L
                  </span>
                )}
              </div>
            </div>

            <p className="text-center text-sm text-slate-500 mt-4">
              Click on different facility types to see their details
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
                Ready to Optimize Your Debt?
              </h2>
              <p className="opacity-90">Stay compliant, save on interest</p>
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

export default CreditPage;
