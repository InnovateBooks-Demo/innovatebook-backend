import React, { useState } from "react";
import { Link } from "react-router-dom";
import IBWorkforceHub from "../IBWorkforceHub";
import {
  VideoWalkthrough,
  CaseStudy,
  TestimonialSection,
} from "../../components/marketing";
import {
  GraduationCap,
  CheckCircle,
  Zap,
  Play,
  BookOpen,
  Award,
  Clock,
  Target,
  Users,
  TrendingUp,
} from "lucide-react";

const LearningPage = () => {
  const [activeTab, setActiveTab] = useState("courses");

  const features = [
    {
      title: "Learning Paths",
      description:
        "Structured courses for skill development and career growth.",
      items: [
        "Role-based paths",
        "Skill assessments",
        "Certification tracking",
        "Learning objectives",
      ],
    },
    {
      title: "Training Management",
      description: "Schedule, track, and manage training programs for teams.",
      items: [
        "Batch scheduling",
        "Attendance tracking",
        "Trainer management",
        "Cost tracking",
      ],
    },
    {
      title: "Skills Matrix",
      description: "Map employee skills, certifications, and competencies.",
      items: [
        "Skill inventory",
        "Gap analysis",
        "Development plans",
        "Succession planning",
      ],
    },
    {
      title: "Learning Analytics",
      description: "Measure training effectiveness and ROI.",
      items: [
        "Completion rates",
        "Assessment scores",
        "Skill improvements",
        "Business impact",
      ],
    },
  ];

  const benefits = [
    { metric: "3x", label: "Training ROI", description: "Measured impact" },
    {
      metric: "85%",
      label: "Completion Rate",
      description: "Engaging content",
    },
    { metric: "40%", label: "Skill Growth", description: "In 6 months" },
  ];

  const demoCourses = [
    {
      name: "Leadership Fundamentals",
      progress: 75,
      enrolled: 45,
      duration: "8 hours",
      status: "In Progress",
    },
    {
      name: "Advanced Excel",
      progress: 100,
      enrolled: 120,
      duration: "4 hours",
      status: "Completed",
    },
    {
      name: "Project Management",
      progress: 30,
      enrolled: 32,
      duration: "12 hours",
      status: "In Progress",
    },
  ];

  const testimonials = [
    {
      quote:
        "Our training completion rate jumped from 40% to 85% after implementing the learning paths. Employees actually want to learn now.",
      author: "Deepa Sharma",
      role: "L&D Head",
      company: "TechGrowth India",
      rating: 5,
    },
    {
      quote:
        "Skills matrix finally gave us visibility into competency gaps. We reduced external hiring by 30% through internal upskilling.",
      author: "Vikram Menon",
      role: "HR Director",
      company: "ServiceExcel",
      rating: 5,
    },
    {
      quote:
        "Training ROI measurement was impossible before. Now we can show the board exactly how learning impacts business outcomes.",
      author: "Priya Kapoor",
      role: "Chief People Officer",
      company: "FinancePro",
      rating: 5,
    },
    {
      quote:
        "The certification tracking feature saved us from compliance nightmares. No more expired certifications going unnoticed.",
      author: "Amit Desai",
      role: "Compliance Manager",
      company: "PharmaWorks",
      rating: 5,
    },
  ];

  const caseStudyData = {
    company: "TechGrowth India",
    industry: "IT Services",
    employees: "1,500+",
    logo: "TG",
    challenge:
      "40% training completion rate, no visibility into skill gaps, and ₹1.2Cr annual training budget with no ROI measurement.",
    solution:
      "Deployed IB Workforce Learning with structured learning paths, skills matrix integration, and ROI analytics dashboard.",
    results: [
      { metric: "85%", label: "Completion Rate", detail: "Up from 40%" },
      { metric: "₹2.4Cr", label: "Training ROI", detail: "Measured impact" },
      {
        metric: "30%",
        label: "Less External Hiring",
        detail: "Internal upskilling",
      },
      { metric: "40%", label: "Skill Growth", detail: "In 6 months" },
    ],
    quote:
      "Our L&D function transformed from a cost center to a strategic driver of business performance. The ROI data speaks for itself.",
    quotePerson: "Deepa Sharma",
    quoteRole: "L&D Head",
  };

  return (
    <IBWorkforceHub>
      <div className="max-w-5xl">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-2xl flex items-center justify-center">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Learning</h1>
              <p className="text-lg text-[#033F99] font-semibold">
                Training & Development
              </p>
            </div>
          </div>
          <p className="text-xl text-slate-600 leading-relaxed">
            Develop employee skills with structured learning paths,
            certifications, and ROI tracking.
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
          title="Learning Management Demo"
          description="See how to build effective learning programs"
          duration="5 min"
          moduleName="IB Workforce"
          subModule="Learning Module"
          Icon={GraduationCap}
          category="team"
        />

        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Play className="h-6 w-6 text-[#033F99]" />
            <h2 className="text-3xl font-bold text-slate-900">
              Interactive Demo
            </h2>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-semibold">
              Learning Portal
            </span>
          </div>
          <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-[#033F99] to-[#033F99] p-4 flex items-center justify-between">
              <h3 className="text-white font-bold">Learning Dashboard</h3>
              <div className="flex gap-2">
                {["courses", "paths", "certifications"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 rounded-lg text-sm font-semibold capitalize ${activeTab === tab ? "bg-white text-[#033F99]" : "bg-white/20 text-white"}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {demoCourses.map((course, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#EBF3FC] rounded-xl flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-[#033F99]" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {course.name}
                        </p>
                        <p className="text-sm text-slate-500">
                          {course.enrolled} enrolled • {course.duration}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="w-32 bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-[#033F99] h-2 rounded-full"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${course.status === "Completed" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}
                      >
                        {course.progress}%
                      </span>
                    </div>
                  </div>
                ))}
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
                Ready to Transform Learning in Your Organization?
              </h2>
              <p className="opacity-90">
                Build a culture of continuous development
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

export default LearningPage;
