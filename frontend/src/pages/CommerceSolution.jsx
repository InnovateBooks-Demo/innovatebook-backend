import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  ArrowLeft,
  CheckCircle,
  ShoppingCart,
  TrendingUp,
  Users,
  Target,
} from "lucide-react";

const CommerceSolution = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const features = [
    "Smart invoicing (multi-currency, e-invoicing)",
    "Vendor lifecycle (PO → GRN → Bill → Payment)",
    "Payment reminders and auto-reconciliation",
    "Revenue recognition models (SaaS, milestone)",
  ];

  const impacts = [
    {
      icon: Target,
      title: "360° Traceability",
      desc: "Complete transaction visibility",
    },
    {
      icon: TrendingUp,
      title: "Predictive Receivables",
      desc: "AI-powered cash flow forecasting",
    },
    {
      icon: Users,
      title: "Smart Churn Forecasting",
      desc: "Customer retention insights",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C4D9F4] via-blue-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-[#033F99]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <img
                src="/innovate-books-logo.png"
                alt="Innovate Books"
                className="h-12 w-auto"
              />
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/solutions">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  All Solutions
                </Button>
              </Link>
              <Link to="/commerce/login">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-[#033F99] to-[#033F99] hover:from-[#033F99] hover:to-[#033F99] text-white shadow-lg"
                >
                  Try IB Commerce
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-2xl flex items-center justify-center shadow-xl">
              <ShoppingCart className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1
                className="text-5xl font-bold text-slate-900"
                style={{ fontFamily: "Poppins" }}
              >
                IB Commerce
              </h1>
              <p className="text-xl text-[#033F99] mt-1 font-medium">
                Reimagine Commerce Intelligence
              </p>
            </div>
          </div>
          <p className="text-2xl text-slate-700 mb-8 leading-relaxed">
            Every Transaction Tells a Story. Transform customer and vendor
            relationships into strategic insights with AI-powered intelligence.
          </p>
          <div className="flex gap-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-[#033F99] to-[#033F99] hover:from-[#033F99] hover:to-[#033F99] text-white shadow-xl"
              asChild
            >
              <Link to="/commerce/login">Try IB Commerce</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-[#033F99] text-[#033F99] hover:bg-[#C4D9F4]"
              asChild
            >
              <Link to="/contact">Schedule Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-3xl font-bold mb-12 text-slate-900"
            style={{ fontFamily: "Poppins" }}
          >
            Core Capabilities
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={`item-${index}`}
                className="flex items-start gap-4 bg-white p-6 rounded-xl border border-[#033F99] shadow-lg hover:shadow-xl transition-shadow"
              >
                <CheckCircle className="h-6 w-6 text-[#033F99] flex-shrink-0 mt-1" />
                <p className="text-slate-700 text-lg">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Unique Twist */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-3xl font-bold mb-6 text-slate-900"
            style={{ fontFamily: "Poppins" }}
          >
            Transaction Genome Engine
          </h2>
          <p className="text-slate-600 mb-6 text-lg">
            Each transaction carries financial DNA with predictive intelligence
          </p>
          <div className="bg-gradient-to-br from-slate-900 to-[#033F99] text-green-400 p-8 rounded-2xl font-mono text-sm overflow-x-auto shadow-2xl">
            <pre>{`{
  "EntityType": "Customer",
  "Nature": "Revenue",
  "Segment": "Enterprise SaaS",
  "LifecycleStage": "Renewal",
  "RiskScore": 0.12,
  "PredictedLTV": 2450000,
  "ChurnProbability": 0.08
}`}</pre>
          </div>
          <p className="text-slate-500 text-sm mt-4">
            AI enriches every transaction with context, predictions, and
            actionable insights
          </p>
        </div>
      </section>

      {/* Business Impact */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-3xl font-bold mb-12 text-center text-slate-900"
            style={{ fontFamily: "Poppins" }}
          >
            Business Impact
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {impacts.map((impact, index) => {
              const Icon = impact.icon;
              return (
                <div
                  key={`item-${index}`}
                  className="bg-white p-8 rounded-2xl border border-[#033F99] shadow-lg hover:shadow-xl transition-shadow text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-slate-900">
                    {impact.title}
                  </h3>
                  <p className="text-slate-600">{impact.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-[#033F99] via-[#033F99] to-purple-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className="text-4xl font-bold mb-4 text-white"
            style={{ fontFamily: "Poppins" }}
          >
            Ready to Transform Commerce Operations?
          </h2>
          <p className="text-xl mb-8 text-[#033F99]">
            ERPs record transactions. We understand them with AI.
          </p>
          <Button
            size="lg"
            className="bg-white text-[#033F99] hover:bg-[#C4D9F4] font-semibold shadow-xl"
            asChild
          >
            <Link to="/commerce/login">Try IB Commerce Free</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default CommerceSolution;
