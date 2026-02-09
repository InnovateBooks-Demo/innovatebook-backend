import React, { useState } from "react";
import { Link } from "react-router-dom";
import IBOperationsHub from "../IBOperationsHub";
import {
  VideoWalkthrough,
  CaseStudy,
  TestimonialSection,
} from "../../components/marketing";
import {
  Activity,
  CheckCircle,
  Zap,
  Play,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

const ProductionPage = () => {
  const [selectedOrder, setSelectedOrder] = useState(0);

  const features = [
    {
      title: "Bill of Materials",
      description: "Define product structures and component requirements.",
      items: [
        "Multi-level BOM",
        "Substitute items",
        "Phantom assemblies",
        "Version control",
      ],
    },
    {
      title: "Production Orders",
      description: "Plan and track manufacturing operations.",
      items: [
        "Work order creation",
        "Scheduling",
        "Resource allocation",
        "Progress tracking",
      ],
    },
    {
      title: "Cost Tracking",
      description: "Track actual manufacturing costs vs standards.",
      items: [
        "Material costs",
        "Labor costs",
        "Overhead allocation",
        "Variance analysis",
      ],
    },
    {
      title: "Quality Control",
      description: "Integrate quality checks into production flow.",
      items: [
        "Inspection points",
        "Quality parameters",
        "Rejection tracking",
        "NCR management",
      ],
    },
  ];

  const benefits = [
    {
      metric: "20%",
      label: "Cost Variance Reduction",
      description: "Better control",
    },
    {
      metric: "35%",
      label: "Faster Production",
      description: "Optimized scheduling",
    },
    { metric: "98%", label: "Quality Rate", description: "Built-in QC" },
  ];

  const productionOrders = [
    {
      id: "WO-2026-001",
      product: "Electric Motor Assembly",
      qty: 500,
      completed: 385,
      standardCost: 1250000,
      actualCost: 1195000,
      status: "In Progress",
      quality: 98.5,
      dueDate: "25 Jan 2026",
    },
    {
      id: "WO-2026-002",
      product: "Control Panel Unit",
      qty: 200,
      completed: 200,
      standardCost: 850000,
      actualCost: 920000,
      status: "Completed",
      quality: 97.2,
      dueDate: "15 Jan 2026",
    },
    {
      id: "WO-2026-003",
      product: "Gear Box Assembly",
      qty: 150,
      completed: 45,
      standardCost: 675000,
      actualCost: 202500,
      status: "In Progress",
      quality: 99.1,
      dueDate: "30 Jan 2026",
    },
  ];

  const testimonials = [
    {
      quote:
        "Standard cost variance dropped from 15% to under 3%. The real-time cost tracking lets us adjust before it's too late.",
      author: "Manoj Patel",
      role: "Production Manager",
      company: "PrecisionParts Ltd",
      rating: 5,
    },
    {
      quote:
        "Integrated quality checks caught defects 5x faster. Our rejection rate went from 4% to 0.8%.",
      author: "Sunita Verma",
      role: "Quality Head",
      company: "AutoComponents India",
      rating: 5,
    },
    {
      quote:
        "BOM version control eliminated costly production errors. We haven't had a wrong-component issue in 14 months.",
      author: "Rajiv Kumar",
      role: "Engineering Director",
      company: "ManufactureFirst",
      rating: 5,
    },
    {
      quote:
        "Production scheduling optimization increased our throughput by 35% without adding any new equipment.",
      author: "Anita Desai",
      role: "Operations VP",
      company: "AssemblyLine Corp",
      rating: 5,
    },
  ];

  const caseStudyData = {
    company: "PrecisionParts Ltd",
    industry: "Auto Components",
    employees: "2,800+",
    logo: "PP",
    challenge:
      "Cost variance averaging 15% due to no real-time tracking. Quality issues caught late in production. Manual BOM management causing errors.",
    solution:
      "Implemented IB Operations Production with live cost tracking, integrated QC checkpoints, and version-controlled BOM management.",
    results: [
      { metric: "80%", label: "Variance Reduction", detail: "15%→3%" },
      { metric: "80%", label: "Rejection Reduction", detail: "4%→0.8%" },
      { metric: "35%", label: "Throughput Increase", detail: "Same equipment" },
      { metric: "Zero", label: "BOM Errors", detail: "14 months" },
    ],
    quote:
      "Production efficiency and quality hit all-time highs. The real-time visibility transformed how we run the floor.",
    quotePerson: "Manoj Patel",
    quoteRole: "Production Manager",
  };

  const selected = productionOrders[selectedOrder];
  const variance = (
    ((selected.actualCost - selected.standardCost) / selected.standardCost) *
    100
  ).toFixed(1);
  const progress = ((selected.completed / selected.qty) * 100).toFixed(0);

  return (
    <IBOperationsHub>
      <div className="max-w-5xl">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#3A4E63] to-[#3A4E63] rounded-2xl flex items-center justify-center">
              <Activity className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Production</h1>
              <p className="text-lg text-[#3A4E63] font-semibold">
                Manufacturing Cost Tracking
              </p>
            </div>
          </div>
          <p className="text-xl text-slate-600 leading-relaxed">
            Bill of materials, production orders, and manufacturing cost
            analysis for makers.
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
          title="Production Management Demo"
          description="BOM, work orders, and cost tracking"
          duration="6 min"
          moduleName="IB Operations"
          subModule="Production Module"
          Icon={Activity}
          category="business"
        />

        {/* Interactive Demo */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Play className="h-6 w-6 text-[#3A4E63]" />
            <h2 className="text-3xl font-bold text-slate-900">
              Interactive Demo
            </h2>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-semibold">
              Production Orders
            </span>
          </div>
          <div className="bg-gradient-to-br from-[#EBF3FC] to-white p-6 rounded-3xl border-2 border-[#C4D9F4]">
            <div className="flex gap-3 mb-6 flex-wrap">
              {productionOrders.map((o, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedOrder(i)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedOrder === i ? "bg-[#3A4E63] text-white" : "bg-white text-slate-700 border border-slate-300 hover:border-[#3A4E63]"}`}
                >
                  {o.id}
                </button>
              ))}
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h4 className="text-xl font-bold text-slate-900">
                    {selected.product}
                  </h4>
                  <p className="text-slate-600">
                    {selected.id} • Due: {selected.dueDate}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${selected.status === "Completed" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}
                >
                  {selected.status}
                </span>
              </div>
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Production Progress</span>
                  <span className="font-semibold text-slate-900">
                    {selected.completed}/{selected.qty} units ({progress}%)
                  </span>
                </div>
                <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#3A4E63] to-[#3A4E63] rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Standard Cost</p>
                  <p className="text-xl font-bold text-slate-900">
                    ₹{(selected.standardCost / 100000).toFixed(1)}L
                  </p>
                </div>
                <div
                  className={`p-4 rounded-lg ${parseFloat(variance) > 0 ? "bg-red-50" : "bg-green-50"}`}
                >
                  <p className="text-sm text-slate-600 mb-1">Actual Cost</p>
                  <p
                    className={`text-xl font-bold ${parseFloat(variance) > 0 ? "text-red-600" : "text-green-600"}`}
                  >
                    ₹{(selected.actualCost / 100000).toFixed(1)}L
                  </p>
                </div>
                <div
                  className={`p-4 rounded-lg ${parseFloat(variance) > 0 ? "bg-red-50" : "bg-green-50"}`}
                >
                  <p className="text-sm text-slate-600 mb-1">Variance</p>
                  <p
                    className={`text-xl font-bold ${parseFloat(variance) > 0 ? "text-red-600" : "text-green-600"}`}
                  >
                    {parseFloat(variance) > 0 ? "+" : ""}
                    {variance}%
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Quality Rate</p>
                  <p className="text-xl font-bold text-blue-600">
                    {selected.quality}%
                  </p>
                </div>
              </div>
              {parseFloat(variance) > 5 && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span className="text-red-700 font-medium">
                    Cost variance exceeds 5% threshold.
                  </span>
                </div>
              )}
              {parseFloat(variance) < 0 && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="text-green-700 font-medium">
                    Production under budget! Savings: ₹
                    {Math.abs(
                      (selected.standardCost - selected.actualCost) / 1000,
                    ).toFixed(0)}
                    K
                  </span>
                </div>
              )}
            </div>
            <p className="text-center text-sm text-slate-500 mt-4">
              Click on different work orders to see their status
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
                className="bg-white p-6 rounded-2xl border-2 border-slate-200 hover:border-[#3A4E63] transition-all hover:shadow-lg"
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

        <section className="bg-gradient-to-r from-[#3A4E63] to-[#3A4E63] p-8 rounded-3xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Ready to Optimize Manufacturing?
              </h2>
              <p className="opacity-90">
                Track production costs with precision
              </p>
            </div>
            <Link to="/auth/signup">
              <button className="bg-white text-[#3A4E63] font-bold px-8 py-4 rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
                <Zap className="h-5 w-5" /> Start Free Trial
              </button>
            </Link>
          </div>
        </section>
      </div>
    </IBOperationsHub>
  );
};

export default ProductionPage;
