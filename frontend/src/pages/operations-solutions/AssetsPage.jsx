import React, { useState } from "react";
import { Link } from "react-router-dom";
import IBOperationsHub from "../IBOperationsHub";
import {
  VideoWalkthrough,
  CaseStudy,
  TestimonialSection,
} from "../../components/marketing";
import {
  Cog,
  CheckCircle,
  Zap,
  Play,
  Calendar,
  AlertTriangle,
  Wrench,
  TrendingDown,
} from "lucide-react";

const AssetsPage = () => {
  const [selectedAsset, setSelectedAsset] = useState(0);

  const features = [
    {
      title: "Asset Register",
      description: "Complete asset tracking from purchase to disposal.",
      items: [
        "Asset categorization",
        "Serial/barcode tracking",
        "Location management",
        "Custodian assignment",
      ],
    },
    {
      title: "Depreciation Management",
      description: "Automated depreciation calculations with multiple methods.",
      items: [
        "Straight-line method",
        "WDV method",
        "Custom schedules",
        "Book vs tax depreciation",
      ],
    },
    {
      title: "Maintenance Tracking",
      description: "Schedule and track preventive and corrective maintenance.",
      items: [
        "Maintenance schedules",
        "Service history",
        "Cost tracking",
        "Vendor management",
      ],
    },
    {
      title: "Asset Lifecycle",
      description: "Track complete lifecycle from acquisition to disposal.",
      items: ["Purchase tracking", "Transfers", "Impairment", "Disposal/sale"],
    },
  ];

  const benefits = [
    { metric: "Zero", label: "Ghost Assets", description: "Full tracking" },
    {
      metric: "100%",
      label: "Depreciation Accuracy",
      description: "Automated",
    },
    {
      metric: "40%",
      label: "Maintenance Savings",
      description: "Preventive care",
    },
  ];

  const assets = [
    {
      name: "Dell PowerEdge Server R750",
      category: "IT Equipment",
      purchaseValue: 850000,
      currentValue: 595000,
      depreciation: 255000,
      location: "Data Center - Rack A12",
      nextMaintenance: "15 Jan 2026",
      status: "Active",
    },
    {
      name: "Toyota Innova Crysta",
      category: "Vehicles",
      purchaseValue: 2200000,
      currentValue: 1650000,
      depreciation: 550000,
      location: "Head Office - Parking",
      nextMaintenance: "28 Jan 2026",
      status: "Active",
    },
    {
      name: "CNC Milling Machine",
      category: "Machinery",
      purchaseValue: 4500000,
      currentValue: 3150000,
      depreciation: 1350000,
      location: "Manufacturing Unit 2",
      nextMaintenance: "Overdue",
      status: "Maintenance Due",
    },
  ];

  const testimonials = [
    {
      quote:
        "We discovered ₹45L worth of 'ghost assets' that were still on books but physically missing. The audit trail is now airtight.",
      author: "Rajan Pillai",
      role: "Asset Manager",
      company: "ManufacturePro Ltd",
      rating: 5,
    },
    {
      quote:
        "Preventive maintenance scheduling reduced our equipment downtime by 60%. The ROI was visible in month one.",
      author: "Geeta Nair",
      role: "Operations Head",
      company: "IndustryFirst",
      rating: 5,
    },
    {
      quote:
        "Depreciation schedules across 3 methods are now automated. What took our team 2 days now takes 5 minutes.",
      author: "Amit Sharma",
      role: "Finance Controller",
      company: "ConstructionGiant",
      rating: 5,
    },
    {
      quote:
        "Asset transfers between locations are now tracked in real-time. No more spreadsheet reconciliation nightmares.",
      author: "Priya Menon",
      role: "Admin Head",
      company: "MultiLocation Corp",
      rating: 5,
    },
  ];

  const caseStudyData = {
    company: "ManufacturePro Ltd",
    industry: "Manufacturing",
    employees: "3,500+",
    logo: "MP",
    challenge:
      "₹45L in 'ghost assets' on books with no physical verification. Depreciation calculations manual and error-prone. Maintenance reactive, not preventive.",
    solution:
      "Deployed IB Operations Assets with barcode-based tracking, automated depreciation, and preventive maintenance scheduling.",
    results: [
      { metric: "₹45L", label: "Ghost Assets Found", detail: "Cleaned books" },
      {
        metric: "60%",
        label: "Downtime Reduction",
        detail: "Preventive maintenance",
      },
      {
        metric: "100%",
        label: "Depreciation Accuracy",
        detail: "Automated calculations",
      },
      { metric: "₹18L", label: "Annual Savings", detail: "Reduced repairs" },
    ],
    quote:
      "Our books are finally clean and our equipment uptime is at an all-time high. The transformation was remarkable.",
    quotePerson: "Rajan Pillai",
    quoteRole: "Asset Manager",
  };

  const selected = assets[selectedAsset];
  const depreciationPercent = (
    (selected.depreciation / selected.purchaseValue) *
    100
  ).toFixed(1);

  return (
    <IBOperationsHub>
      <div className="max-w-5xl">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-2xl flex items-center justify-center">
              <Cog className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Assets</h1>
              <p className="text-lg text-[#033F99] font-semibold">
                Fixed Asset Management
              </p>
            </div>
          </div>
          <p className="text-xl text-slate-600 leading-relaxed">
            Complete asset lifecycle management with automated depreciation and
            maintenance tracking.
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
          title="Asset Management Demo"
          description="Track, depreciate, and maintain all your assets"
          duration="4 min"
          moduleName="IB Operations"
          subModule="Assets Module"
          Icon={Cog}
          category="business"
        />

        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Play className="h-6 w-6 text-[#033F99]" />
            <h2 className="text-3xl font-bold text-slate-900">
              Interactive Demo
            </h2>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-semibold">
              Asset Tracker
            </span>
          </div>
          <div className="bg-gradient-to-br from-[#EBF3FC] to-white p-6 rounded-3xl border-2 border-[#C4D9F4]">
            <div className="flex gap-3 mb-6 flex-wrap">
              {assets.map((a, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedAsset(i)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedAsset === i ? "bg-[#033F99] text-white" : "bg-white text-slate-700 border border-slate-300 hover:border-[#033F99]"}`}
                >
                  {a.category}
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
                    {selected.category} • {selected.location}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${selected.status === "Active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                >
                  {selected.status === "Maintenance Due" && (
                    <Wrench className="h-4 w-4 inline mr-1" />
                  )}
                  {selected.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Purchase Value</p>
                  <p className="text-xl font-bold text-slate-900">
                    ₹{(selected.purchaseValue / 100000).toFixed(1)}L
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center gap-1 text-red-600 mb-1">
                    <TrendingDown className="h-4 w-4" />
                    <p className="text-sm">Depreciation</p>
                  </div>
                  <p className="text-xl font-bold text-red-600">
                    ₹{(selected.depreciation / 100000).toFixed(1)}L
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Current Value</p>
                  <p className="text-xl font-bold text-green-600">
                    ₹{(selected.currentValue / 100000).toFixed(1)}L
                  </p>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Depreciation Progress</span>
                  <span className="font-semibold text-slate-900">
                    {depreciationPercent}%
                  </span>
                </div>
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full"
                    style={{ width: `${depreciationPercent}%` }}
                  ></div>
                </div>
              </div>
              <div
                className={`p-4 rounded-lg border ${selected.nextMaintenance === "Overdue" ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-slate-600" />
                    <span className="text-slate-700">Next Maintenance</span>
                  </div>
                  <span
                    className={`font-semibold ${selected.nextMaintenance === "Overdue" ? "text-red-600" : "text-slate-900"}`}
                  >
                    {selected.nextMaintenance === "Overdue" && (
                      <AlertTriangle className="h-4 w-4 inline mr-1" />
                    )}
                    {selected.nextMaintenance}
                  </span>
                </div>
              </div>
            </div>
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
                Ready to Track Every Asset?
              </h2>
              <p className="opacity-90">
                Never lose track of fixed assets again
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
    </IBOperationsHub>
  );
};

export default AssetsPage;
