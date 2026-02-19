import React, { useState } from "react";
import { Link } from "react-router-dom";
import IBWorkforceHub from "../IBWorkforceHub";
import {
  VideoWalkthrough,
  CaseStudy,
  TestimonialSection,
} from "../../components/marketing";
import {
  Award,
  CheckCircle,
  Zap,
  Play,
  TrendingUp,
  Target,
  Users,
  BarChart3,
  Star,
  DollarSign,
} from "lucide-react";

const PerformancePage = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(0);

  const features = [
    {
      title: "Goal Management (OKRs)",
      description:
        "Set, track, and cascade organizational objectives and key results.",
      items: [
        "Company to individual cascade",
        "Progress tracking",
        "Key result metrics",
        "Alignment visualization",
      ],
    },
    {
      title: "Performance Reviews",
      description:
        "Structured review cycles with 360-degree feedback capabilities.",
      items: [
        "Customizable templates",
        "Self & manager reviews",
        "360-degree feedback",
        "Calibration support",
      ],
    },
    {
      title: "Employee ROI Analytics",
      description: "Calculate the true return on investment for each employee.",
      items: [
        "Revenue attribution",
        "Cost analysis",
        "Productivity metrics",
        "Contribution tracking",
      ],
    },
    {
      title: "Continuous Feedback",
      description: "Real-time feedback and recognition to drive engagement.",
      items: [
        "Instant feedback",
        "Peer recognition",
        "Achievement badges",
        "Feedback analytics",
      ],
    },
  ];

  const benefits = [
    {
      metric: "670%",
      label: "Avg Employee ROI",
      description: "Measured contribution",
    },
    {
      metric: "92%",
      label: "Goal Alignment",
      description: "Company-wide OKRs",
    },
    {
      metric: "45%",
      label: "More Engagement",
      description: "Continuous feedback",
    },
  ];

  const employeeROI = [
    {
      name: "Rahul Mehta",
      role: "Senior PM",
      revenue: 4500000,
      cost: 1800000,
      roi: "150%",
      rating: 4.5,
    },
    {
      name: "Priya Sharma",
      role: "Lead Designer",
      revenue: 2800000,
      cost: 1500000,
      roi: "87%",
      rating: 4.2,
    },
    {
      name: "Amit Kumar",
      role: "Engineer",
      revenue: 3200000,
      cost: 1200000,
      roi: "167%",
      rating: 4.8,
    },
  ];

  const testimonials = [
    {
      quote:
        "Employee ROI visibility changed how we make talent decisions. We now know exactly who our top performers are based on data, not intuition.",
      author: "Sanjay Kumar",
      role: "CEO",
      company: "ServiceGrowth",
      rating: 5,
    },
    {
      quote:
        "OKR cascading finally got everyone aligned. We went from 40% goal alignment to 92% in one quarter.",
      author: "Meera Reddy",
      role: "Chief People Officer",
      company: "TechVentures",
      rating: 5,
    },
    {
      quote:
        "Continuous feedback increased our engagement scores by 45%. Employees feel heard and valued.",
      author: "Vikram Shah",
      role: "HR Director",
      company: "ConsultPro",
      rating: 5,
    },
    {
      quote:
        "Performance calibration is now data-driven. No more bias in promotions and increments.",
      author: "Priya Nair",
      role: "VP HR",
      company: "FinanceHub",
      rating: 5,
    },
  ];

  const caseStudyData = {
    company: "ServiceGrowth",
    industry: "Professional Services",
    employees: "800+",
    logo: "SG",
    challenge:
      "No visibility into employee ROI, subjective performance reviews, and only 40% of employees aligned to company goals.",
    solution:
      "Deployed IB Workforce Performance with ROI analytics, OKR management, continuous feedback, and data-driven calibration.",
    results: [
      {
        metric: "670%",
        label: "Avg Employee ROI",
        detail: "Revenue/cost ratio",
      },
      { metric: "92%", label: "Goal Alignment", detail: "OKR adoption" },
      { metric: "45%", label: "Engagement Lift", detail: "Feedback culture" },
      { metric: "₹2Cr", label: "Talent ROI Gains", detail: "Better decisions" },
    ],
    quote:
      "We can now quantify every employee's contribution. This transformed our talent strategy from gut-feel to data-driven.",
    quotePerson: "Sanjay Kumar",
    quoteRole: "CEO",
  };

  const selected = employeeROI[selectedEmployee];

  return (
    <IBWorkforceHub>
      <div className="max-w-5xl">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-2xl flex items-center justify-center">
              <Award className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Performance</h1>
              <p className="text-lg text-[#033F99] font-semibold">
                ROI Analytics & Reviews
              </p>
            </div>
          </div>
          <p className="text-xl text-slate-600 leading-relaxed">
            Measure employee contribution with ROI analytics, OKRs, and
            data-driven performance reviews.
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

        <VideoWalkthrough
          title="Performance Analytics Demo"
          description="See how to measure employee ROI and drive performance"
          duration="5 min"
          moduleName="IB Workforce"
          subModule="Performance Module"
          Icon={Award}
          category="analytics"
        />

        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Play className="h-6 w-6 text-[#033F99]" />
            <h2 className="text-3xl font-bold text-slate-900">
              Employee ROI Dashboard
            </h2>
          </div>
          <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
            <div className="bg-slate-100 p-4 flex items-center gap-4 border-b border-slate-200">
              {employeeROI.map((emp, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedEmployee(i)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${selectedEmployee === i ? "bg-[#033F99] text-white" : "bg-white text-slate-700 hover:bg-slate-200"}`}
                >
                  {emp.name}
                </button>
              ))}
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {selected.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">
                      {selected.name}
                    </h3>
                    <p className="text-slate-600">{selected.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < Math.floor(selected.rating) ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`}
                    />
                  ))}
                  <span className="ml-2 font-bold text-slate-900">
                    {selected.rating}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <p className="text-sm text-green-700 mb-1">
                    Revenue Generated
                  </p>
                  <p className="text-2xl font-bold text-green-700">
                    ₹{(selected.revenue / 100000).toFixed(1)}L
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                  <p className="text-sm text-red-700 mb-1">Total Cost</p>
                  <p className="text-2xl font-bold text-red-700">
                    ₹{(selected.cost / 100000).toFixed(1)}L
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <p className="text-sm text-slate-600 mb-1">
                    Net Contribution
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    ₹{((selected.revenue - selected.cost) / 100000).toFixed(1)}L
                  </p>
                </div>
                <div className="bg-[#EBF3FC] p-4 rounded-xl border border-[#C4D9F4]">
                  <p className="text-sm text-[#033F99] mb-1">Employee ROI</p>
                  <p className="text-2xl font-bold text-[#033F99]">
                    {selected.roi}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <CaseStudy data={caseStudyData} />
        <TestimonialSection testimonials={testimonials} />

        <section className="bg-gradient-to-r from-[#033F99] to-[#033F99] p-8 rounded-3xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Ready to Measure What Matters?
              </h2>
              <p className="opacity-90">
                Transform performance management with data
              </p>
            </div>
            <Link to="/auth/signup">
              <button className="bg-white text-[#033F99] font-bold px-8 py-4 rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
                <Zap className="h-5 w-5" /> Start Free Trial
              </button>
            </Link>
          </div>
        </section>
      </div>
    </IBWorkforceHub>
  );
};

export default PerformancePage;
