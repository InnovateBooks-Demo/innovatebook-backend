import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import SharedNavigation from "../components/SharedNavigation";
import {
  Building2,
  Target,
  Shield,
  Users,
  Brain,
  Layers,
  CheckCircle,
  ArrowRight,
  Zap,
  TrendingUp,
  DollarSign,
  MessageSquare,
  FileCheck,
  BarChart3,
  Lock,
  Eye,
  Sparkles,
  Globe,
  Award,
  Heart,
} from "lucide-react";

const AboutPage = () => {
  // Intersection Observer for scroll animations
  const sectionsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fadeInUp");
            entry.target.style.opacity = "1";
          }
        });
      },
      { threshold: 0.1 },
    );

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const addToRefs = (el) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
    }
  };

  const beliefs = [
    { icon: Shield, title: "Clear commercial governance" },
    { icon: Target, title: "Predictable execution" },
    { icon: DollarSign, title: "Financial truth" },
    { icon: Users, title: "Workforce clarity" },
    { icon: TrendingUp, title: "Capital discipline" },
    { icon: Brain, title: "Intelligent decision support" },
  ];

  const problems = [
    { tool: "CRMs", purpose: "for sales", issue: "Revenue leakage" },
    { tool: "ERPs", purpose: "for finance", issue: "Delivery surprises" },
    { tool: "Project tools", purpose: "for execution", issue: "Cash stress" },
    { tool: "Payroll tools", purpose: "for people", issue: "Compliance risk" },
    {
      tool: "Cap table tools",
      purpose: "for investors",
      issue: "Capital mismanagement",
    },
  ];

  const architectureLayers = [
    {
      number: "1",
      title: "Workspace Layer",
      subtitle: "The communication and coordination backbone",
      color: "from-blue-500 to-blue-700",
      items: [
        "Internal collaboration",
        "Tasks & approvals",
        "Client & vendor communication",
        "Decision traceability",
      ],
      highlight: "Every conversation is connected to work, money, or capital.",
    },
    {
      number: "2",
      title: "Solutions Layer",
      subtitle: "Purpose-built systems that run the company",
      color: "from-green-500 to-emerald-700",
      items: [
        "IB Commerce — Commercial governance",
        "IB Operations — Execution & delivery control",
        "IB Finance — Financial system of record",
        "IB Workforce — People, time, payroll & compliance",
        "IB Capital — Ownership, funding & treasury governance",
      ],
      highlight: "Each solution is deep. Together, they form one system.",
    },
    {
      number: "3",
      title: "Intelligence Layer",
      subtitle: "The brain of the platform",
      color: "from-purple-500 to-violet-700",
      items: [
        "Detects risks early",
        "Forecasts outcomes",
        "Explains why things are happening",
        "Recommends what to consider next",
      ],
      highlight:
        "Intelligence advises. Governance decides. Humans remain in control.",
    },
  ];

  const targetAudience = [
    {
      icon: Sparkles,
      title: "Founders",
      description: "who want control, not chaos",
    },
    {
      icon: BarChart3,
      title: "CFOs",
      description: "who want truth, not reconciliation",
    },
    {
      icon: Target,
      title: "Operators",
      description: "who want predictability",
    },
    { icon: Eye, title: "Boards", description: "who want visibility" },
    {
      icon: TrendingUp,
      title: "Growing companies",
      description: "who want to scale safely",
    },
  ];

  const philosophy = [
    "Governance before execution",
    "Truth before speed",
    "Systems over spreadsheets",
    "Intelligence over intuition",
  ];

  return (
    <div className="min-h-screen bg-white">
      <SharedNavigation />

      {/* Hero Section - Full Color */}
      <section className="pt-24 pb-20 px-6 relative overflow-hidden bg-[#033F99]">
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute top-20 left-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-20 w-80 h-80 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-5 py-2.5 rounded-full text-white font-semibold text-sm mb-8">
            <Globe className="h-4 w-4" />
            About Us
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Innovate Books
          </h1>

          <p className="text-2xl md:text-3xl text-white/90 mb-4">
            Innovate Books is not software.
          </p>
          <p className="text-3xl md:text-4xl font-bold text-white mb-8">
            It is a{" "}
            <span className="italic font-light">
              Business Operating System.
            </span>
          </p>

          <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            Most companies today don't fail because of lack of effort. They fail
            because commercial decisions, execution, finance, people, and
            capital operate in{" "}
            <span className="font-semibold text-white">silos</span>.
          </p>
          <p className="text-xl text-white font-bold mt-4">
            Innovate Books exists to solve that.
          </p>
        </div>
      </section>

      {/* Our Belief Section */}
      <section
        ref={addToRefs}
        className="py-20 px-6 bg-white"
        style={{ opacity: 0 }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Our Belief
            </h2>
            <p className="text-xl text-slate-600">
              We believe every company deserves:
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {beliefs.map((belief, index) => {
              const Icon = belief.icon;
              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-2xl border-2 border-slate-200 hover:border-[#033F99] transition-all hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="w-12 h-12 bg-[#033F99]/10 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-[#033F99]" />
                  </div>
                  <p className="font-semibold text-slate-900">{belief.title}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-gradient-to-r from-[#033F99] to-[#033F99] rounded-3xl p-8 text-white text-center">
            <p className="text-xl md:text-2xl font-medium leading-relaxed">
              All in one connected system.
              <br />
              <span className="opacity-80">
                Not stitched together. Not reconciled later. Not guessed by
                spreadsheets.
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section
        ref={addToRefs}
        className="py-20 px-6 bg-slate-50"
        style={{ opacity: 0 }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              The Problem We Solve
            </h2>
            <p className="text-xl text-slate-600">
              Modern businesses run on fragmented tools:
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-4 mb-8">
            {problems.map((p, i) => (
              <div
                key={i}
                className="bg-white p-4 rounded-xl border border-slate-200 text-center"
              >
                <p className="font-bold text-slate-900">{p.tool}</p>
                <p className="text-sm text-slate-500">{p.purpose}</p>
              </div>
            ))}
          </div>

          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 mb-8">
            <p className="text-lg text-red-800 font-semibold text-center mb-6">
              Each system works in isolation. The result:
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {problems.map((p, i) => (
                <span
                  key={i}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-full font-medium"
                >
                  {p.issue}
                </span>
              ))}
              <span className="px-4 py-2 bg-red-100 text-red-700 rounded-full font-medium">
                Leadership decisions made too late
              </span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">
              No single system understands the business end-to-end.
            </p>
          </div>
        </div>
      </section>

      {/* Our Solution Section */}
      <section
        ref={addToRefs}
        className="py-20 px-6 bg-white"
        style={{ opacity: 0 }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Our Solution
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Innovate Books is a unified enterprise operating system that
              governs the entire business lifecycle:
            </p>
          </div>

          <div className="bg-gradient-to-r from-[#033F99]/10 to-purple-500/10 rounded-3xl p-8 mb-12 border border-[#033F99]/20">
            <div className="flex flex-wrap items-center justify-center gap-3 text-lg">
              {[
                "Lead",
                "Contract",
                "Delivery",
                "Billing",
                "Payroll",
                "Capital",
                "Intelligence",
              ].map((step, i) => (
                <React.Fragment key={i}>
                  <span className="font-bold text-[#033F99]">{step}</span>
                  {i < 6 && <ArrowRight className="h-5 w-5 text-slate-400" />}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {["Context-aware", "Governed", "Auditable", "Explainable"].map(
              (item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 bg-[#033F99]/10 rounded-xl border border-[#033F99]/20"
                >
                  <CheckCircle className="h-6 w-6 text-[#033F99] flex-shrink-0" />
                  <span className="text-lg font-semibold text-slate-900">
                    Every decision is{" "}
                    <span className="text-[#033F99]">{item}</span>
                  </span>
                </div>
              ),
            )}
          </div>

          <p className="text-center text-xl font-bold text-[#033F99] mt-8">
            Nothing happens in isolation.
          </p>
        </div>
      </section>

      {/* Architecture Section */}
      <section
        ref={addToRefs}
        className="py-20 px-6 bg-gradient-to-br from-slate-900 via-[#033F99]/90 to-slate-900"
        style={{ opacity: 0 }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Our Architecture
            </h2>
            <p className="text-xl text-white/70">What Makes Us Different</p>
            <p className="text-lg text-white/60 mt-4">
              Innovate Books is built on three foundational layers:
            </p>
          </div>

          <div className="space-y-8">
            {architectureLayers.map((layer, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all"
              >
                <div className="flex items-start gap-6">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${layer.color} rounded-2xl flex items-center justify-center flex-shrink-0`}
                  >
                    <span className="text-2xl font-bold text-white">
                      {layer.number}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-1">
                      {layer.title}
                    </h3>
                    <p className="text-white/70 mb-4">{layer.subtitle}</p>
                    <div className="grid md:grid-cols-2 gap-2 mb-4">
                      {layer.items.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-white/90"
                        >
                          <CheckCircle className="h-4 w-4 text-white flex-shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-white font-semibold bg-white/10 px-4 py-2 rounded-lg inline-block">
                      {layer.highlight}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Built For Section */}
      <section
        ref={addToRefs}
        className="py-20 px-6 bg-white"
        style={{ opacity: 0 }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Who Innovate Books Is Built For
            </h2>
            <p className="text-xl text-slate-600">
              From early growth to enterprise scale.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-4">
            {targetAudience.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-2xl border-2 border-slate-200 hover:border-[#033F99] transition-all text-center hover:shadow-lg"
                >
                  <div className="w-12 h-12 bg-[#033F99] rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <p className="font-bold text-slate-900 mb-1">{item.title}</p>
                  <p className="text-sm text-slate-600">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section
        ref={addToRefs}
        className="py-20 px-6 bg-slate-50"
        style={{ opacity: 0 }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Our Philosophy
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {philosophy.map((item, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl border-2 border-slate-200 flex items-center gap-4"
              >
                <div className="w-10 h-10 bg-[#033F99] rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <p className="text-xl font-semibold text-slate-900">{item}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-3xl p-8 border border-purple-200 text-center">
            <Heart className="h-12 w-12 text-[#033F99] mx-auto mb-4" />
            <p className="text-xl text-slate-700">
              We don't replace people.
              <br />
              <span className="font-bold text-[#033F99]">
                We make people better decision-makers.
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section
        ref={addToRefs}
        className="py-20 px-6 bg-gradient-to-r from-[#033F99] to-[#033F99]"
        style={{ opacity: 0 }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <Award className="h-16 w-16 text-white/80 mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-white mb-6">Our Vision</h2>
          <p className="text-2xl text-white/90 leading-relaxed mb-8">
            To become the default operating system for modern businesses — where
            every company runs with <span className="font-bold">clarity</span>,{" "}
            <span className="font-bold">discipline</span>, and{" "}
            <span className="font-bold">foresight</span>.
          </p>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
            <p className="text-3xl font-bold text-white mb-2">Innovate Books</p>
            <p className="text-xl text-white/80">
              Run your business as a system.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Ready to transform how you run your business?
          </h2>
          <p className="text-xl text-slate-600 mb-8">
            Join companies that run with clarity, not chaos.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth/signup">
              <button className="px-8 py-4 bg-gradient-to-r from-[#033F99] to-[#033F99] text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Start Free Trial
              </button>
            </Link>
            <Link to="/contact">
              <button className="px-8 py-4 border-2 border-slate-300 text-slate-700 font-bold rounded-xl hover:border-[#033F99] hover:text-[#033F99] transition-all flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Contact Us
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                <span className="text-[#033F99] font-bold text-xl">IB</span>
              </div>
              <span className="text-2xl font-bold">Innovate Books</span>
            </div>
            <p className="text-slate-400">
              © 2026 Innovate Books. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
