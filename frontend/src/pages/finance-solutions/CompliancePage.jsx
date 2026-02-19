import React, { useState } from "react";
import { Link } from "react-router-dom";
import IBFinanceHub from "../IBFinanceHub";
import {
  VideoWalkthrough,
  CaseStudy,
  TestimonialSection,
} from "../../components/marketing";
import {
  Shield,
  CheckCircle,
  Zap,
  Play,
  Calendar,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

const CompliancePage = () => {
  const [selectedTab, setSelectedTab] = useState("gst");

  const features = [
    {
      title: "GST Compliance",
      description: "Complete GST filing and reconciliation.",
      items: [
        "GSTR-1 preparation",
        "GSTR-3B filing",
        "2A/2B reconciliation",
        "ITC optimization",
      ],
    },
    {
      title: "TDS Management",
      description: "Automated TDS calculation and filing.",
      items: [
        "Section-wise TDS",
        "Auto-calculation",
        "Form 26Q/27Q",
        "TDS certificates",
      ],
    },
    {
      title: "Statutory Reports",
      description: "Generate all statutory reports instantly.",
      items: [
        "PF/ESI reports",
        "Professional tax",
        "Advance tax",
        "Labour law reports",
      ],
    },
    {
      title: "Audit Support",
      description: "Complete documentation for audits.",
      items: [
        "Audit trail",
        "Document management",
        "Query management",
        "Historical data",
      ],
    },
  ];

  const benefits = [
    { metric: "100%", label: "Filing Accuracy", description: "Auto-validated" },
    { metric: "Zero", label: "Penalties", description: "Timely filings" },
    { metric: "80%", label: "Time Saved", description: "Automated compliance" },
  ];

  const complianceData = {
    gst: {
      filings: [
        {
          return: "GSTR-1",
          period: "December 2025",
          dueDate: "11 Jan 2026",
          status: "Filed",
          amount: 1245000,
        },
        {
          return: "GSTR-3B",
          period: "December 2025",
          dueDate: "20 Jan 2026",
          status: "Pending",
          amount: 1245000,
        },
        {
          return: "GSTR-1",
          period: "January 2026",
          dueDate: "11 Feb 2026",
          status: "Draft",
          amount: 1380000,
        },
      ],
      itcSummary: { claimed: 8500000, eligible: 8200000, variance: 300000 },
    },
    tds: {
      filings: [
        {
          form: "26Q",
          period: "Q3 FY25-26",
          dueDate: "31 Jan 2026",
          status: "Pending",
          amount: 425000,
        },
        {
          form: "27Q",
          period: "Q3 FY25-26",
          dueDate: "31 Jan 2026",
          status: "Pending",
          amount: 85000,
        },
        {
          form: "26Q",
          period: "Q2 FY25-26",
          dueDate: "31 Oct 2025",
          status: "Filed",
          amount: 398000,
        },
      ],
    },
  };

  const testimonials = [
    {
      quote:
        "GST reconciliation that used to take 3 days now takes 30 minutes. ITC mismatch detection saved us ₹12L in blocked credits.",
      author: "Rajesh Kumar",
      role: "Tax Head",
      company: "ManufactureCorp",
      rating: 5,
    },
    {
      quote:
        "Zero penalties in 2 years of using the system. Automated reminders and pre-validated returns made compliance effortless.",
      author: "Priya Venkatesh",
      role: "Finance Director",
      company: "ServiceFirst India",
      rating: 5,
    },
    {
      quote:
        "TDS compliance was a headache with 200+ vendors. Now it's automated - correct deductions, timely payments, accurate returns.",
      author: "Amit Joshi",
      role: "Accounts Head",
      company: "TradeCorp Global",
      rating: 5,
    },
    {
      quote:
        "Audit support is fantastic. Every query, every document, complete history - all at fingertips. Auditors finish faster.",
      author: "Sunita Reddy",
      role: "CFO",
      company: "TechScale Industries",
      rating: 5,
    },
  ];

  const caseStudy = {
    company: "CompliantFirst Ltd",
    industry: "Manufacturing & Export",
    employees: "780+",
    logo: "CF",
    challenge:
      "CompliantFirst faced ₹18L in GST penalties in FY23 due to filing delays and ITC mismatches. TDS compliance across 300 vendors was error-prone. Audit preparations took weeks.",
    solution:
      "Implemented IB Finance Compliance with automated GST reconciliation, real-time ITC tracking, TDS auto-calculation and filing, and comprehensive audit documentation system.",
    results: [
      { metric: "Zero", label: "Penalties", detail: "FY24 onwards" },
      { metric: "₹15L", label: "ITC Recovered", detail: "Mismatch detection" },
      { metric: "30 Min", label: "vs 3 Days", detail: "GST reconciliation" },
      { metric: "3 Days", label: "Audit Prep", detail: "vs 3 weeks" },
    ],
    quote:
      "₹18L in penalties last year to zero this year. The ITC reconciliation alone found ₹15L of blocked credits we'd given up on.",
    quotePerson: "Venkatesh Iyer, Group CFO",
  };

  const data = complianceData[selectedTab];

  return (
    <IBFinanceHub>
      <div className="max-w-5xl">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-2xl flex items-center justify-center">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Compliance</h1>
              <p className="text-lg text-[#033F99] font-semibold">
                Tax & Statutory Compliance
              </p>
            </div>
          </div>
          <p className="text-xl text-slate-600 leading-relaxed">
            Automated GST filing, TDS management, and statutory compliance with
            audit support.
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
          title="Compliance Management Demo"
          description="See GST, TDS, and statutory compliance automation"
          duration="5 min"
          moduleName="IB Finance"
          subModule="Compliance Module"
          Icon={Shield}
        />

        {/* Interactive Demo */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Play className="h-6 w-6 text-[#033F99]" />
            <h2 className="text-3xl font-bold text-slate-900">
              Interactive Demo
            </h2>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-semibold">
              Compliance Tracker
            </span>
          </div>

          <div className="bg-gradient-to-br from-[#EBF3FC] to-white p-6 rounded-3xl border-2 border-[#C4D9F4]">
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setSelectedTab("gst")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedTab === "gst" ? "bg-[#033F99] text-white" : "bg-white text-slate-700 border border-slate-300 hover:border-[#033F99]"}`}
              >
                GST Compliance
              </button>
              <button
                onClick={() => setSelectedTab("tds")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedTab === "tds" ? "bg-[#033F99] text-white" : "bg-white text-slate-700 border border-slate-300 hover:border-[#033F99]"}`}
              >
                TDS Compliance
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {selectedTab === "gst" && (
                <div>
                  <div className="p-4 bg-slate-50 border-b">
                    <h4 className="font-semibold text-slate-900">
                      GST Filing Status
                    </h4>
                  </div>
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left p-4 text-sm font-semibold text-slate-700">
                          Return
                        </th>
                        <th className="text-left p-4 text-sm font-semibold text-slate-700">
                          Period
                        </th>
                        <th className="text-left p-4 text-sm font-semibold text-slate-700">
                          Due Date
                        </th>
                        <th className="text-right p-4 text-sm font-semibold text-slate-700">
                          Tax Liability
                        </th>
                        <th className="text-center p-4 text-sm font-semibold text-slate-700">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.filings.map((filing, i) => (
                        <tr
                          key={i}
                          className="border-t border-slate-100 hover:bg-slate-50"
                        >
                          <td className="p-4 font-semibold text-slate-900">
                            {filing.return}
                          </td>
                          <td className="p-4 text-slate-600">
                            {filing.period}
                          </td>
                          <td className="p-4 text-slate-600 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {filing.dueDate}
                          </td>
                          <td className="p-4 text-right font-semibold text-slate-900">
                            ₹{(filing.amount / 100000).toFixed(1)}L
                          </td>
                          <td className="p-4 text-center">
                            <span
                              className={`px-2 py-1 text-xs rounded-full font-semibold ${filing.status === "Filed" ? "bg-green-100 text-green-700" : filing.status === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-slate-100 text-slate-600"}`}
                            >
                              {filing.status === "Filed" && (
                                <CheckCircle2 className="h-3 w-3 inline mr-1" />
                              )}
                              {filing.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="p-4 border-t">
                    <h5 className="font-semibold text-slate-900 mb-3">
                      ITC Reconciliation Summary
                    </h5>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm text-slate-600">ITC Claimed</p>
                        <p className="text-xl font-bold text-green-600">
                          ₹{(data.itcSummary.claimed / 100000).toFixed(1)}L
                        </p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-slate-600">
                          Eligible as per 2B
                        </p>
                        <p className="text-xl font-bold text-blue-600">
                          ₹{(data.itcSummary.eligible / 100000).toFixed(1)}L
                        </p>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <p className="text-sm text-slate-600">Variance</p>
                        <p className="text-xl font-bold text-yellow-600">
                          ₹{(data.itcSummary.variance / 100000).toFixed(1)}L
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === "tds" && (
                <div>
                  <div className="p-4 bg-slate-50 border-b">
                    <h4 className="font-semibold text-slate-900">
                      TDS Filing Status
                    </h4>
                  </div>
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left p-4 text-sm font-semibold text-slate-700">
                          Form
                        </th>
                        <th className="text-left p-4 text-sm font-semibold text-slate-700">
                          Period
                        </th>
                        <th className="text-left p-4 text-sm font-semibold text-slate-700">
                          Due Date
                        </th>
                        <th className="text-right p-4 text-sm font-semibold text-slate-700">
                          TDS Amount
                        </th>
                        <th className="text-center p-4 text-sm font-semibold text-slate-700">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.filings.map((filing, i) => (
                        <tr
                          key={i}
                          className="border-t border-slate-100 hover:bg-slate-50"
                        >
                          <td className="p-4 font-semibold text-slate-900">
                            {filing.form}
                          </td>
                          <td className="p-4 text-slate-600">
                            {filing.period}
                          </td>
                          <td className="p-4 text-slate-600 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {filing.dueDate}
                          </td>
                          <td className="p-4 text-right font-semibold text-slate-900">
                            ₹{(filing.amount / 100000).toFixed(1)}L
                          </td>
                          <td className="p-4 text-center">
                            <span
                              className={`px-2 py-1 text-xs rounded-full font-semibold ${filing.status === "Filed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                            >
                              {filing.status === "Filed" && (
                                <CheckCircle2 className="h-3 w-3 inline mr-1" />
                              )}
                              {filing.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span className="text-yellow-700">
                <strong>Upcoming:</strong> GSTR-3B for December 2025 due on 20
                Jan 2026. Tax liability: ₹12.45L
              </span>
            </div>

            <p className="text-center text-sm text-slate-500 mt-4">
              Switch between GST and TDS to see compliance status for each
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
                Ready for Effortless Compliance?
              </h2>
              <p className="opacity-90">Zero penalties, zero stress</p>
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

export default CompliancePage;
