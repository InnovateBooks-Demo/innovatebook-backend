import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "../../components/ui/card";
import {
  UserPlus,
  Search,
  FileText,
  CheckCircle,
  FileCheck,
  DollarSign,
  ShoppingCart,
  Wallet,
  TrendingUp,
  Receipt,
  Scale,
  Shield,
  ArrowRight,
  Activity,
  AlertCircle,
  Clock,
} from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CommerceDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("month"); // week, month, quarter, year

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/commerce/dashboard/stats`,
      );
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      setLoading(false);
    }
  };

  const modules = [
    {
      id: "lead",
      name: "Lead",
      description: "Capture and qualify new business opportunities",
      icon: UserPlus,
      color: "from-[#3A4E63] to-[#3A4E63]",
      path: "/commerce/lead",
      workflow: "Customer Revenue Cycle",
    },
    {
      id: "evaluate",
      name: "Evaluate",
      description: "Analyze commercial feasibility and risk",
      icon: Search,
      color: "from-[#3A4E63] to-[#3A4E63]",
      path: "/commerce/evaluate",
      workflow: "Customer Revenue Cycle",
    },
    {
      id: "commit",
      name: "Commit",
      description: "Formalize the commercial relationship",
      icon: FileText,
      color: "from-[#3A4E63] to-[#3A4E63]",
      path: "/commerce/commit",
      workflow: "Customer Revenue Cycle",
    },
    {
      id: "execute",
      name: "Execute",
      description: "Deliver what was promised",
      icon: CheckCircle,
      color: "from-[#3A4E63] to-[#3A4E63]",
      path: "/commerce/execute",
      workflow: "Customer Revenue Cycle",
    },
    {
      id: "bills",
      name: "Bill",
      description: "Generate and validate invoices",
      icon: FileCheck,
      color: "from-[#3A4E63] to-[#3A4E63]",
      path: "/commerce/bills",
      workflow: "Customer Revenue Cycle",
    },
    {
      id: "collect",
      name: "Collect",
      description: "Ensure cash comes in — on time",
      icon: DollarSign,
      color: "from-[#3A4E63] to-[#3A4E63]",
      path: "/commerce/collect",
      workflow: "Customer Revenue Cycle",
    },
    {
      id: "procure",
      name: "Procure",
      description: "Acquire goods or services from suppliers",
      icon: ShoppingCart,
      color: "from-purple-500 to-purple-600",
      path: "/commerce/procure",
      workflow: "Vendor Procurement Cycle",
    },
    {
      id: "pay",
      name: "Pay",
      description: "Disburse funds responsibly",
      icon: Wallet,
      color: "from-purple-500 to-purple-600",
      path: "/commerce/pay",
      workflow: "Vendor Procurement Cycle",
    },
    {
      id: "spend",
      name: "Spend",
      description: "Manage internal expenses and reimbursements",
      icon: TrendingUp,
      color: "from-amber-500 to-amber-600",
      path: "/commerce/spend",
      workflow: "Control & Governance",
    },
    {
      id: "tax",
      name: "Tax",
      description: "Comply with tax and statutory requirements",
      icon: Receipt,
      color: "from-amber-500 to-amber-600",
      path: "/commerce/tax",
      workflow: "Control & Governance",
    },
    {
      id: "reconcile",
      name: "Reconcile",
      description: "Verify the financial truth",
      icon: Scale,
      color: "from-amber-500 to-amber-600",
      path: "/commerce/reconcile",
      workflow: "Control & Governance",
    },
    {
      id: "govern",
      name: "Govern",
      description: "Oversee, audit, and continuously improve",
      icon: Shield,
      color: "from-amber-500 to-amber-600",
      path: "/commerce/govern",
      workflow: "Control & Governance",
    },
  ];

  const workflows = [
    {
      name: "Customer Revenue Cycle",
      color: "bg-[#3A4E63] text-white border-[#0558CC]",
    },
    {
      name: "Vendor Procurement Cycle",
      color: "bg-purple-100 text-purple-700 border-purple-300",
    },
    {
      name: "Control & Governance",
      color: "bg-amber-100 text-amber-700 border-amber-300",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#3A4E63] to-[#3A4E63] text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Activity className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1
                className="text-3xl font-bold"
                style={{ fontFamily: "Poppins" }}
              >
                IB Commerce
              </h1>
              <p className="text-[#3A4E63] text-sm">
                SOP-Driven Commercial Lifecycle Management
              </p>
            </div>
          </div>
          <p className="text-[#3A4E63] mt-2 max-w-3xl">
            Complete financial flow from lead capture to payment reconciliation
            — structured, verified, and SOP-governed across 12 intelligent
            modules
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-6 -mt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Active Leads",
              value: stats?.lead?.total || 0,
              icon: UserPlus,
              change: "+12%",
              color: "bg-blue-50 text-[#0147CC]",
            },
            {
              label: "Open Invoices",
              value: stats?.bills?.issued || 0,
              icon: FileCheck,
              change: "₹2.4M",
              color: "bg-emerald-50 text-emerald-600",
            },
            {
              label: "Collections Due",
              value: stats?.collect?.pending || 0,
              icon: DollarSign,
              change: "₹1.2M",
              color: "bg-amber-50 text-amber-600",
            },
            {
              label: "Active SOPs",
              value: stats?.govern?.active || 0,
              icon: Shield,
              change: "100%",
              color: "bg-[#C4D9F4] text-[#3A4E63]",
            },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={`item-${index}`}
                className="p-5 bg-white border border-slate-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {stat.value}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{stat.change}</p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Workflow Sections */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        {workflows.map((workflow, wIndex) => (
          <div key={wIndex} className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold border ${workflow.color}`}
              >
                {workflow.name}
              </span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {modules
                .filter((m) => m.workflow === workflow.name)
                .map((module, index) => {
                  const Icon = module.icon;
                  const moduleStats = stats?.[module.id];

                  return (
                    <Link
                      key={`item-${index}`}
                      to={module.path}
                      className="group"
                    >
                      <Card className="p-6 bg-white border border-slate-200 hover:border-[#0558CC] hover:shadow-xl transition-all h-full">
                        <div
                          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${module.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}
                        >
                          <Icon className="h-7 w-7 text-white" />
                        </div>
                        <h3
                          className="text-lg font-bold mb-2 text-slate-900 group-hover:text-[#3A4E63] transition-colors"
                          style={{ fontFamily: "Poppins" }}
                        >
                          {module.name}
                        </h3>
                        <p className="text-sm text-slate-600 mb-3 leading-relaxed">
                          {module.description}
                        </p>
                        {moduleStats && (
                          <div className="pt-3 border-t border-slate-100">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-500">Total</span>
                              <span className="font-semibold text-slate-700">
                                {moduleStats.total || 0}
                              </span>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center text-[#3A4E63] font-medium text-sm mt-3 group-hover:gap-2 transition-all">
                          Open <ArrowRight className="ml-1 h-4 w-4" />
                        </div>
                      </Card>
                    </Link>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      {/* Process Flow Visualization */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Card className="p-8 bg-gradient-to-br from-white to-[#C4D9F4] border border-[#6B9FE6]">
          <h2
            className="text-2xl font-bold mb-6 text-slate-900 flex items-center gap-2"
            style={{ fontFamily: "Poppins" }}
          >
            <Activity className="h-6 w-6 text-[#3A4E63]" />
            Complete Business Flow
          </h2>
          <div className="flex flex-wrap gap-2 items-center justify-center text-sm">
            {["Lead", "Evaluate", "Commit", "Execute", "Bill", "Collect"].map(
              (step, index, arr) => (
                <React.Fragment key={`item-${index}`}>
                  <div className="px-4 py-2 bg-gradient-to-r from-[#3A4E63] to-[#3A4E63] text-white rounded-lg font-semibold shadow-md">
                    {step}
                  </div>
                  {index < arr.length - 1 && (
                    <ArrowRight className="h-5 w-5 text-[#044AB3]" />
                  )}
                </React.Fragment>
              ),
            )}
          </div>
          <div className="my-4 text-center">
            <div className="inline-block px-4 py-1 bg-[#3A4E63] text-white rounded-full text-xs font-semibold">
              Revenue Cycle
            </div>
          </div>
          <div className="flex flex-wrap gap-2 items-center justify-center text-sm mt-6">
            {["Procure", "Pay"].map((step, index, arr) => (
              <React.Fragment key={`item-${index}`}>
                <div className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-semibold shadow-md">
                  {step}
                </div>
                {index < arr.length - 1 && (
                  <ArrowRight className="h-5 w-5 text-purple-400" />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="my-4 text-center">
            <div className="inline-block px-4 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
              Procurement Cycle
            </div>
          </div>
          <div className="flex flex-wrap gap-2 items-center justify-center text-sm mt-6">
            {["Spend", "Tax", "Reconcile", "Govern"].map((step, index, arr) => (
              <React.Fragment key={`item-${index}`}>
                <div className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-semibold shadow-md">
                  {step}
                </div>
                {index < arr.length - 1 && (
                  <ArrowRight className="h-5 w-5 text-amber-400" />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="mt-4 text-center">
            <div className="inline-block px-4 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
              Control & Governance
            </div>
          </div>
        </Card>
      </div>

      {/* System Health */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-5 bg-white border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">System Status</p>
                <p className="text-lg font-bold text-emerald-600">
                  Operational
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-white border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-[#0147CC]" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Avg Processing Time</p>
                <p className="text-lg font-bold text-[#0147CC]">&lt; 2 mins</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-white border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-[#3A4E63] rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-[#3A4E63]" />
              </div>
              <div>
                <p className="text-sm text-slate-600">SOP Compliance</p>
                <p className="text-lg font-bold text-[#3A4E63]">98.5%</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CommerceDashboard;
