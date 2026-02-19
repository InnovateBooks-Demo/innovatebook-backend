import React from "react";
import { Link } from "react-router-dom";
import { Brain, Zap, Shield, Globe, Database, Cpu } from "lucide-react";
import SharedNavigation from "../components/SharedNavigation";

const IntelligencePage = () => {
  const features = [
    {
      name: "AI-Powered Analytics",
      icon: Brain,
      description:
        "Machine learning models that learn from your data to provide actionable insights",
      color: "indigo",
    },
    {
      name: "Real-Time Processing",
      icon: Zap,
      description:
        "Process thousands of transactions per second with instant intelligence",
      color: "teal",
    },
    {
      name: "Enterprise Security",
      icon: Shield,
      description:
        "Bank-grade security with encryption, compliance, and audit trails",
      color: "indigo",
    },
    {
      name: "Global Scale",
      icon: Globe,
      description:
        "Multi-currency, multi-entity support for businesses worldwide",
      color: "teal",
    },
    {
      name: "Unified Data",
      icon: Database,
      description:
        "One source of truth for all your financial and operational data",
      color: "indigo",
    },
    {
      name: "Smart Automation",
      icon: Cpu,
      description:
        "Automate reconciliation, categorization, and reporting workflows",
      color: "teal",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#EBF3FC]/30">
      <SharedNavigation />

      <div className="pt-28 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1
              className="text-6xl font-bold mb-6 bg-gradient-to-r from-[#033F99] via-[#033F99] to-[#033F99] bg-clip-text text-transparent"
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            >
              Financial Intelligence
            </h1>
            <p className="text-2xl text-slate-600 font-medium max-w-3xl mx-auto">
              Advanced AI and automation powering your financial operations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const bgColor =
                feature.color === "indigo"
                  ? "from-[#033F99] to-[#033F99]"
                  : "from-[#033F99] to-[#033F99]";
              return (
                <div
                  key={feature.name}
                  className="bg-white rounded-3xl p-8 border border-slate-200 hover:border-[#0558CC] hover:shadow-xl transition-all duration-300"
                >
                  <div
                    className={`w-20 h-20 bg-gradient-to-br ${bgColor} rounded-3xl flex items-center justify-center mb-6 shadow-lg`}
                  >
                    <Icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">
                    {feature.name}
                  </h3>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-16 text-center">
            <Link
              to="/auth/signup"
              className="inline-block bg-gradient-to-r from-[#033F99] to-[#033F99] hover:from-[#033F99] hover:to-[#033F99] text-white font-bold px-12 py-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-xl"
            >
              Experience the Intelligence
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntelligencePage;
