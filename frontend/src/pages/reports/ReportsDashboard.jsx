import React from "react";
import { BarChart3, TrendingUp, PieChart, FileText } from "lucide-react";

const ReportsDashboard = () => {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Reports Hub</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: BarChart3,
              title: "Revenue Analysis",
              description: "View comprehensive revenue reports and trends",
            },
            {
              icon: TrendingUp,
              title: "Cash Flow Reports",
              description: "Monitor cash flow and liquidity positions",
            },
            {
              icon: PieChart,
              title: "Expense Breakdown",
              description: "Analyze spending patterns and cost centers",
            },
            {
              icon: FileText,
              title: "Custom Reports",
              description: "Build and schedule custom report templates",
            },
          ].map((report, index) => {
            const Icon = report.icon;
            return (
              <div
                key={`item-${index}`}
                className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="w-12 h-12 bg-[#033F99] rounded-lg flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {report.title}
                </h3>
                <p className="text-sm text-slate-600">{report.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;
