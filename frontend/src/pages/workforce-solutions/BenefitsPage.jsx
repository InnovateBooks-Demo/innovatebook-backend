import React, { useState } from "react";
import { Link } from "react-router-dom";
import IBWorkforceHub from "../IBWorkforceHub";
import {
  VideoWalkthrough,
  CaseStudy,
  TestimonialSection,
} from "../../components/marketing";
import {
  Heart,
  CheckCircle,
  Zap,
  Shield,
  TrendingUp,
  DollarSign,
  Play,
  Calendar,
  Users,
} from "lucide-react";

const BenefitsPage = () => {
  const [activeSection, setActiveSection] = useState("health");

  const features = [
    {
      title: "Health Insurance Management",
      description:
        "Manage group health insurance enrollment, claims, and policy renewals.",
      items: [
        "Employee enrollment",
        "Dependent management",
        "Claim tracking",
        "Policy comparison",
      ],
    },
    {
      title: "ESOP & Equity Management",
      description:
        "Track stock options, grants, vesting schedules, and exercises.",
      items: [
        "Grant management",
        "Vesting schedules",
        "Exercise tracking",
        "Cap table integration",
      ],
    },
    {
      title: "Leave & Time-Off",
      description:
        "Comprehensive leave management with balance tracking and approvals.",
      items: [
        "Leave balance tracking",
        "Holiday calendar",
        "Comp-off management",
        "Leave encashment",
      ],
    },
    {
      title: "Reimbursements",
      description:
        "Process expense claims, travel reimbursements, and allowances.",
      items: [
        "Expense submission",
        "Approval workflows",
        "Receipt management",
        "Payment tracking",
      ],
    },
  ];

  const benefits = [
    {
      metric: "₹50K",
      label: "Avg Benefits/Employee",
      description: "Beyond salary",
    },
    {
      metric: "100%",
      label: "Enrollment Rate",
      description: "Easy self-service",
    },
    { metric: "3x", label: "Faster Claims", description: "Digital processing" },
  ];

  const benefitsDemo = {
    health: {
      title: "Health Insurance",
      icon: Shield,
      data: [
        { label: "Coverage", value: "₹5,00,000" },
        { label: "Premium (Employer)", value: "₹24,000/yr" },
        { label: "Dependents", value: "4 covered" },
        { label: "Claims YTD", value: "₹45,000" },
      ],
    },
    esop: {
      title: "ESOP Holdings",
      icon: TrendingUp,
      data: [
        { label: "Total Granted", value: "5,000 shares" },
        { label: "Vested", value: "2,500 shares" },
        { label: "Current Value", value: "₹12,50,000" },
        { label: "Next Vesting", value: "Mar 2026" },
      ],
    },
    leave: {
      title: "Leave Balance",
      icon: Calendar,
      data: [
        { label: "Earned Leave", value: "12 days" },
        { label: "Sick Leave", value: "6 days" },
        { label: "Casual Leave", value: "4 days" },
        { label: "Comp-off", value: "2 days" },
      ],
    },
  };

  const testimonials = [
    {
      quote:
        "Self-service benefits enrollment increased participation from 60% to 98%. Employees love seeing their total compensation package.",
      author: "Kavitha Raman",
      role: "HR Director",
      company: "FinanceHub India",
      rating: 5,
    },
    {
      quote:
        "ESOP management was a nightmare before. Now our employees can track their equity value in real-time. It's a retention game-changer.",
      author: "Rohan Desai",
      role: "CEO",
      company: "TechStartup Inc",
      rating: 5,
    },
    {
      quote:
        "Leave management is now completely self-service. HR team saved 20 hours per week on leave tracking and approvals.",
      author: "Priya Nair",
      role: "HR Manager",
      company: "ServicePro",
      rating: 5,
    },
    {
      quote:
        "The reimbursement module with receipt OCR processing cut claim processing time from 2 weeks to 2 days.",
      author: "Amit Sharma",
      role: "Finance Head",
      company: "ConsultingFirst",
      rating: 5,
    },
  ];

  const caseStudyData = {
    company: "TechStartup Inc",
    industry: "Technology",
    employees: "320+",
    logo: "TI",
    challenge:
      "Low benefits enrollment (60%), no visibility into total compensation, and ESOP tracking on spreadsheets causing employee dissatisfaction.",
    solution:
      "Deployed IB Workforce Benefits with integrated health insurance enrollment, ESOP tracking dashboard, and total compensation statements.",
    results: [
      { metric: "98%", label: "Benefits Enrollment", detail: "Up from 60%" },
      { metric: "45%", label: "Retention Improved", detail: "ESOP visibility" },
      { metric: "₹18L", label: "Admin Savings", detail: "Self-service" },
      {
        metric: "92%",
        label: "Employee Satisfaction",
        detail: "Benefits clarity",
      },
    ],
    quote:
      "Our employees finally understand their true total compensation. ESOP visibility alone improved retention of key talent by 45%.",
    quotePerson: "Rohan Desai",
    quoteRole: "CEO",
  };

  const ActiveIcon = benefitsDemo[activeSection].icon;

  return (
    <IBWorkforceHub>
      <div className="max-w-5xl">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-2xl flex items-center justify-center">
              <Heart className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Benefits</h1>
              <p className="text-lg text-[#033F99] font-semibold">
                Employee Benefits & Equity
              </p>
            </div>
          </div>
          <p className="text-xl text-slate-600 leading-relaxed">
            Manage health insurance, ESOPs, leaves, and reimbursements with
            real-time cost tracking and easy enrollment.
          </p>
        </div>

        {/* Benefits Stats */}
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

        {/* Features */}
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

        {/* Video Walkthrough */}
        <VideoWalkthrough
          title="Benefits Management Demo"
          description="See how to manage employee benefits effortlessly"
          duration="4 min"
          moduleName="IB Workforce"
          subModule="Benefits Module"
          Icon={Heart}
          category="team"
        />

        {/* Interactive Demo */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Play className="h-6 w-6 text-[#033F99]" />
            <h2 className="text-3xl font-bold text-slate-900">
              Interactive Demo
            </h2>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-semibold">
              Employee View
            </span>
          </div>
          <div className="bg-gradient-to-br from-[#EBF3FC] to-white p-6 rounded-3xl border-2 border-[#C4D9F4]">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-full flex items-center justify-center text-white font-bold">
                RM
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Rahul Mehta - Benefits Dashboard
                </h3>
                <p className="text-slate-600">
                  Total Compensation:{" "}
                  <span className="font-bold text-[#033F99]">
                    ₹18,50,000/year
                  </span>
                </p>
              </div>
            </div>
            <div className="flex gap-2 mb-6">
              {Object.keys(benefitsDemo).map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveSection(key)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${activeSection === key
                      ? "bg-[#033F99] text-white"
                      : "bg-white text-slate-700 hover:bg-slate-100"
                    }`}
                >
                  {benefitsDemo[key].title}
                </button>
              ))}
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#EBF3FC] rounded-lg flex items-center justify-center">
                  <ActiveIcon className="h-5 w-5 text-[#033F99]" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">
                  {benefitsDemo[activeSection].title}
                </h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {benefitsDemo[activeSection].data.map((d, i) => (
                  <div key={i} className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-sm text-slate-500 mb-1">{d.label}</p>
                    <p className="text-xl font-bold text-slate-900">
                      {d.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-center text-sm text-slate-500 mt-4">
              Click tabs above to explore different benefit types
            </p>
          </div>
        </section>

        {/* Case Study */}
        <CaseStudy data={caseStudyData} />

        {/* Testimonials */}
        <TestimonialSection testimonials={testimonials} />

        {/* CTA */}
        <section className="bg-gradient-to-r from-[#033F99] to-[#033F99] p-8 rounded-3xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Ready to Streamline Benefits Management?
              </h2>
              <p className="opacity-90">
                Give your employees the benefits experience they deserve
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

export default BenefitsPage;
