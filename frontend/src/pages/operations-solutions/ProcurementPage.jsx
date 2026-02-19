import React, { useState } from "react";
import { Link } from "react-router-dom";
import IBOperationsHub from "../IBOperationsHub";
import {
  VideoWalkthrough,
  CaseStudy,
  TestimonialSection,
} from "../../components/marketing";
import { FileCheck, CheckCircle, Zap, Play, Users } from "lucide-react";

const ProcurementPage = () => {
  const [selectedView, setSelectedView] = useState("requests");

  const features = [
    {
      title: "Purchase Requisitions",
      description: "Streamlined requisition to PO workflow.",
      items: [
        "Requisition creation",
        "Approval workflows",
        "Budget validation",
        "Auto PO generation",
      ],
    },
    {
      title: "Vendor Management",
      description: "Track vendor performance and relationships.",
      items: [
        "Vendor registry",
        "Performance scoring",
        "Price comparison",
        "Contract management",
      ],
    },
    {
      title: "Spend Analytics",
      description: "Insights into procurement spending patterns.",
      items: [
        "Category-wise spend",
        "Vendor concentration",
        "Savings tracking",
        "Maverick spend detection",
      ],
    },
    {
      title: "GRN & Invoice Matching",
      description: "3-way matching for payment processing.",
      items: [
        "PO matching",
        "GRN verification",
        "Invoice reconciliation",
        "Exception handling",
      ],
    },
  ];

  const benefits = [
    {
      metric: "15%",
      label: "Cost Savings",
      description: "Better negotiations",
    },
    {
      metric: "50%",
      label: "Faster Procurement",
      description: "Streamlined flow",
    },
    { metric: "100%", label: "Compliance", description: "Audit trail" },
  ];

  const procurementData = {
    requests: [
      {
        id: "PR-2026-001",
        item: "Dell Laptops (50 units)",
        requester: "IT Dept",
        amount: 3500000,
        status: "Pending Approval",
        date: "15 Jan 2026",
      },
      {
        id: "PR-2026-002",
        item: "Office Furniture",
        requester: "Admin",
        amount: 850000,
        status: "Approved",
        date: "12 Jan 2026",
      },
      {
        id: "PR-2026-003",
        item: "Raw Materials Q1",
        requester: "Production",
        amount: 12500000,
        status: "PO Created",
        date: "10 Jan 2026",
      },
    ],
    vendors: [
      {
        name: "TechSupply India",
        category: "IT Equipment",
        rating: 4.8,
        spend: 45000000,
        onTime: "98%",
      },
      {
        name: "OfficePro Ltd",
        category: "Furniture",
        rating: 4.5,
        spend: 12000000,
        onTime: "94%",
      },
      {
        name: "RawMat Suppliers",
        category: "Raw Materials",
        rating: 4.2,
        spend: 85000000,
        onTime: "91%",
      },
    ],
    savings: {
      total: 2850000,
      categories: [
        { name: "IT Equipment", saved: 1200000 },
        { name: "Office Supplies", saved: 450000 },
        { name: "Raw Materials", saved: 1200000 },
      ],
    },
  };

  const testimonials = [
    {
      quote:
        "We identified ₹28L in savings opportunities just by consolidating vendors. The spend analytics were eye-opening.",
      author: "Rajesh Gupta",
      role: "Procurement Head",
      company: "ManufacturePro",
      rating: 5,
    },
    {
      quote:
        "3-way matching automation eliminated invoice disputes. We went from 200 exceptions/month to under 10.",
      author: "Meena Sharma",
      role: "AP Manager",
      company: "RetailGiant India",
      rating: 5,
    },
    {
      quote:
        "Vendor performance scoring helped us identify and replace underperforming suppliers. On-time delivery improved by 35%.",
      author: "Amit Verma",
      role: "Supply Chain Director",
      company: "DistributionFirst",
      rating: 5,
    },
    {
      quote:
        "The approval workflow automation reduced procurement cycle time from 2 weeks to 3 days. Operations team loves it.",
      author: "Priya Nair",
      role: "Operations VP",
      company: "ServiceCorp",
      rating: 5,
    },
  ];

  const caseStudyData = {
    company: "ManufacturePro",
    industry: "Manufacturing",
    employees: "4,200+",
    logo: "MP",
    challenge:
      "Fragmented procurement across 50+ vendors with no spend visibility. Invoice disputes averaging ₹8L monthly. No vendor performance tracking.",
    solution:
      "Deployed IB Operations Procurement with centralized requisitions, vendor scoring, 3-way matching, and comprehensive spend analytics.",
    results: [
      {
        metric: "₹28L",
        label: "Annual Savings",
        detail: "Vendor consolidation",
      },
      { metric: "95%", label: "Exception Reduction", detail: "200→10/month" },
      {
        metric: "35%",
        label: "On-Time Improvement",
        detail: "Vendor tracking",
      },
      {
        metric: "70%",
        label: "Faster Procurement",
        detail: "Automated workflows",
      },
    ],
    quote:
      "Procurement transformed from a cost center to a strategic function. The visibility and control we have now is remarkable.",
    quotePerson: "Rajesh Gupta",
    quoteRole: "Procurement Head",
  };

  return (
    <IBOperationsHub>
      <div className="max-w-5xl">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-2xl flex items-center justify-center">
              <FileCheck className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Procurement</h1>
              <p className="text-lg text-[#033F99] font-semibold">
                Purchase Intelligence
              </p>
            </div>
          </div>
          <p className="text-xl text-slate-600 leading-relaxed">
            Streamlined procurement with vendor comparison, approval workflows,
            and spend analytics.
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
          title="Procurement Management Demo"
          description="From requisition to payment in one system"
          duration="5 min"
          moduleName="IB Operations"
          subModule="Procurement Module"
          Icon={FileCheck}
          category="business"
        />

        {/* Interactive Demo */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Play className="h-6 w-6 text-[#033F99]" />
            <h2 className="text-3xl font-bold text-slate-900">
              Interactive Demo
            </h2>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-semibold">
              Procurement Hub
            </span>
          </div>
          <div className="bg-gradient-to-br from-[#EBF3FC] to-white p-6 rounded-3xl border-2 border-[#C4D9F4]">
            <div className="flex gap-3 mb-6">
              {["requests", "vendors", "savings"].map((view) => (
                <button
                  key={view}
                  onClick={() => setSelectedView(view)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${selectedView === view ? "bg-[#033F99] text-white" : "bg-white text-slate-700 border border-slate-300 hover:border-[#033F99]"}`}
                >
                  {view === "requests"
                    ? "Purchase Requests"
                    : view === "vendors"
                      ? "Top Vendors"
                      : "Savings"}
                </button>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {selectedView === "requests" && (
                <div>
                  <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
                    <h4 className="font-semibold text-slate-900">
                      Recent Purchase Requests
                    </h4>
                    <button className="bg-[#033F99] text-white px-3 py-1 rounded-lg text-sm font-medium">
                      + New Request
                    </button>
                  </div>
                  <div className="divide-y">
                    {procurementData.requests.map((req, i) => (
                      <div
                        key={i}
                        className="p-4 hover:bg-slate-50 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">
                            {req.item}
                          </p>
                          <p className="text-sm text-slate-600">
                            {req.id} • {req.requester} • {req.date}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900">
                            ₹{(req.amount / 100000).toFixed(1)}L
                          </p>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${req.status === "Pending Approval" ? "bg-yellow-100 text-yellow-700" : req.status === "Approved" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}
                          >
                            {req.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedView === "vendors" && (
                <div>
                  <div className="p-4 bg-slate-50 border-b">
                    <h4 className="font-semibold text-slate-900">
                      Top Vendors by Spend
                    </h4>
                  </div>
                  <div className="divide-y">
                    {procurementData.vendors.map((v, i) => (
                      <div
                        key={i}
                        className="p-4 hover:bg-slate-50 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#EBF3FC] rounded-lg flex items-center justify-center">
                            <Users className="h-5 w-5 text-[#033F99]" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {v.name}
                            </p>
                            <p className="text-sm text-slate-600">
                              {v.category}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-sm text-slate-600">Rating</p>
                            <p className="font-bold text-yellow-600">
                              ★ {v.rating}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-slate-600">On-Time</p>
                            <p className="font-bold text-green-600">
                              {v.onTime}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-slate-600">
                              Total Spend
                            </p>
                            <p className="font-bold text-slate-900">
                              ₹{(v.spend / 10000000).toFixed(1)}Cr
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedView === "savings" && (
                <div className="p-6">
                  <div className="text-center mb-6">
                    <p className="text-slate-600">Total Savings YTD</p>
                    <p className="text-4xl font-bold text-green-600">
                      ₹{(procurementData.savings.total / 100000).toFixed(1)}L
                    </p>
                  </div>
                  <div className="space-y-4">
                    {procurementData.savings.categories.map((cat, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between"
                      >
                        <span className="text-slate-700">{cat.name}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{
                                width: `${(cat.saved / procurementData.savings.total) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span className="font-semibold text-green-600 w-16 text-right">
                            ₹{(cat.saved / 100000).toFixed(1)}L
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <p className="text-center text-sm text-slate-500 mt-4">
              Click tabs to explore different views
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
                className="bg-white p-6 rounded-2xl border-2 border-slate-200 hover:border-[#033F99] transition-all hover:shadow-lg"
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

        <CaseStudy data={caseStudyData} />
        <TestimonialSection testimonials={testimonials} />

        <section className="bg-gradient-to-r from-[#033F99] to-[#033F99] p-8 rounded-3xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Ready to Optimize Procurement?
              </h2>
              <p className="opacity-90">Save costs with smarter purchasing</p>
            </div>
            <Link to="/auth/signup">
              <button className="bg-white text-[#033F99] font-bold px-8 py-4 rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
                <Zap className="h-5 w-5" /> Start Free Trial
              </button>
            </Link>
          </div>
        </section>
      </div>
    </IBOperationsHub>
  );
};

export default ProcurementPage;
