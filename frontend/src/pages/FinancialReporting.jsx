import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  TrendingUp,
  FileText,
  Scale,
  Activity,
  BookOpen,
  ArrowRight,
  BarChart3,
  PieChart,
  DollarSign,
} from "lucide-react";

const FinancialReporting = () => {
  const navigate = useNavigate();

  const reports = [
    {
      id: "profit-loss",
      title: "Profit & Loss Statement",
      description: "View revenue, expenses, and net profit/loss for any period",
      icon: TrendingUp,
      color: "from-blue-500 to-[#3A4E63]",
      route: "/financial-reporting/profit-loss",
      features: [
        "Revenue breakdown",
        "Operating expenses",
        "Net profit calculation",
        "Period comparison",
      ],
    },
    {
      id: "balance-sheet",
      title: "Balance Sheet",
      description: "Assets, liabilities, and equity snapshot as of any date",
      icon: Scale,
      color: "from-green-500 to-emerald-600",
      route: "/financial-reporting/balance-sheet",
      features: [
        "Current & non-current assets",
        "Liabilities breakdown",
        "Equity position",
        "Balance verification",
      ],
    },
    {
      id: "cashflow",
      title: "Cash Flow Statement",
      description:
        "Operating, investing, and financing activities cash movement",
      icon: Activity,
      color: "from-purple-500 to-violet-600",
      route: "/financial-reporting/cashflow",
      features: [
        "Operating activities",
        "Investing activities",
        "Financing activities",
        "Net cash change",
      ],
    },
    {
      id: "trial-balance",
      title: "Trial Balance",
      description: "All accounts with debit and credit balances",
      icon: BarChart3,
      color: "from-orange-500 to-red-600",
      route: "/financial-reporting/trial-balance",
      features: [
        "All account balances",
        "Debit/Credit verification",
        "Export to Excel",
        "Date range filter",
      ],
    },
    {
      id: "general-ledger",
      title: "General Ledger",
      description: "Detailed transaction view for all accounts",
      icon: BookOpen,
      color: "from-pink-500 to-rose-600",
      route: "/financial-reporting/general-ledger",
      features: [
        "Transaction details",
        "Running balance",
        "Account-wise view",
        "Drill-down capability",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-[#3A4E63] flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1
                className="text-3xl font-bold text-gray-900"
                style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
              >
                Financial Reporting
              </h1>
              <p
                className="text-sm text-gray-500 mt-1"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Comprehensive financial statements generated from your
                accounting data
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Info Banner */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-[#EBF3FC] border border-blue-200">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3
                className="text-lg font-semibold text-blue-900 mb-2"
                style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
              >
                Auto-Generated Financial Statements
              </h3>
              <p
                className="text-sm text-blue-800"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                All financial statements are automatically generated from your
                journal entries. As you create invoices, bills, and post
                transactions, these reports update in real-time. Fully compliant
                with Companies Act 2013 and Ind AS standards.
              </p>
            </div>
          </div>
        </Card>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => {
            const Icon = report.icon;
            return (
              <Card
                key={report.id}
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 overflow-hidden"
                onClick={() => navigate(report.route)}
              >
                {/* Gradient Header */}
                <div
                  className={`h-32 bg-gradient-to-br ${report.color} p-6 relative`}
                >
                  <div className="absolute top-4 right-4 w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3
                    className="text-xl font-bold text-white mt-8"
                    style={{
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: 600,
                    }}
                  >
                    {report.title}
                  </h3>
                </div>

                {/* Content */}
                <div className="p-6 bg-white">
                  <p
                    className="text-sm text-gray-600 mb-4"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {report.description}
                  </p>

                  {/* Features List */}
                  <div className="space-y-2 mb-4">
                    {report.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs text-gray-700"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* View Button */}
                  <Button
                    className="w-full group-hover:bg-gray-900 transition-colors"
                    style={{
                      backgroundColor: "#3A4E63",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    <span>View Report</span>
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Stats Summary */}
        <div className="mt-12 grid grid-cols-3 gap-6">
          <Card className="p-6 bg-white border-0 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Data Source</p>
                <p className="text-2xl font-bold text-gray-900">
                  Journal Entries
                </p>
              </div>
              <PieChart className="h-10 w-10 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6 bg-white border-0 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Compliance</p>
                <p className="text-2xl font-bold text-gray-900">
                  Ind AS / GAAP
                </p>
              </div>
              <Scale className="h-10 w-10 text-green-600" />
            </div>
          </Card>

          <Card className="p-6 bg-white border-0 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Updates</p>
                <p className="text-2xl font-bold text-gray-900">Real-time</p>
              </div>
              <Activity className="h-10 w-10 text-purple-600" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FinancialReporting;
