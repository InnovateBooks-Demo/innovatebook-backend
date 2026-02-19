import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FileText,
  ArrowLeft,
  Download,
  Calendar,
  Clock,
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  Play,
  Pause,
} from "lucide-react";

const ReportsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  const tabs = [
    {
      id: "standard",
      label: "Standard Reports",
      path: "/intelligence/reports/standard",
    },
    {
      id: "custom",
      label: "Custom Reports",
      path: "/intelligence/reports/custom",
    },
    {
      id: "scheduled",
      label: "Scheduled Reports",
      path: "/intelligence/reports/scheduled",
    },
  ];

  const activeTab =
    tabs.find((t) => location.pathname === t.path)?.id || "standard";

  const standardReports = [
    {
      id: 1,
      name: "Revenue Summary",
      category: "Finance",
      lastRun: "2 hours ago",
      format: "PDF",
      status: "ready",
    },
    {
      id: 2,
      name: "Procurement Analysis",
      category: "Operations",
      lastRun: "1 day ago",
      format: "Excel",
      status: "ready",
    },
    {
      id: 3,
      name: "Party Risk Report",
      category: "Compliance",
      lastRun: "3 days ago",
      format: "PDF",
      status: "ready",
    },
    {
      id: 4,
      name: "Sales Pipeline",
      category: "Sales",
      lastRun: "5 hours ago",
      format: "PDF",
      status: "ready",
    },
    {
      id: 5,
      name: "Vendor Performance",
      category: "Operations",
      lastRun: "1 week ago",
      format: "Excel",
      status: "ready",
    },
    {
      id: 6,
      name: "Cash Flow Statement",
      category: "Finance",
      lastRun: "2 days ago",
      format: "PDF",
      status: "ready",
    },
  ];

  const customReports = [
    {
      id: 1,
      name: "Q4 Board Deck",
      creator: "John Smith",
      created: "Dec 15, 2025",
      status: "draft",
    },
    {
      id: 2,
      name: "Regional Sales Analysis",
      creator: "Jane Doe",
      created: "Dec 10, 2025",
      status: "published",
    },
    {
      id: 3,
      name: "Vendor Comparison Matrix",
      creator: "Mike Johnson",
      created: "Dec 8, 2025",
      status: "published",
    },
  ];

  const scheduledReports = [
    {
      id: 1,
      name: "Daily Revenue Report",
      frequency: "Daily",
      nextRun: "Tomorrow 8:00 AM",
      recipients: 5,
      active: true,
    },
    {
      id: 2,
      name: "Weekly Sales Summary",
      frequency: "Weekly",
      nextRun: "Monday 9:00 AM",
      recipients: 12,
      active: true,
    },
    {
      id: 3,
      name: "Monthly P&L",
      frequency: "Monthly",
      nextRun: "Jan 1, 2026",
      recipients: 8,
      active: true,
    },
    {
      id: 4,
      name: "Quarterly Board Report",
      frequency: "Quarterly",
      nextRun: "Apr 1, 2026",
      recipients: 3,
      active: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50" data-testid="reports-page">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate("/intelligence")}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-500">
              Intelligence → Reports
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                <FileText className="h-7 w-7 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Reports
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Standard, custom, and scheduled business reports
                </p>
              </div>
            </div>
            {activeTab === "custom" && (
              <button className="flex items-center gap-2 px-4 py-2 bg-[#033F99] text-white rounded-lg hover:bg-[#022B6B] transition-colors">
                <Plus className="h-4 w-4" />
                Create Report
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="px-8 flex gap-1 border-t border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Search */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Standard Reports */}
        {activeTab === "standard" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {standardReports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                    {report.format}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {report.name}
                </h3>
                <p className="text-sm text-gray-500 mb-4">{report.category}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    Last run: {report.lastRun}
                  </span>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Custom Reports */}
        {activeTab === "custom" && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Report Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Creator
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Created
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {report.name}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {report.creator}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {report.created}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${report.status === "published"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                          }`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-green-600 rounded-lg">
                          <Download className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Scheduled Reports */}
        {activeTab === "scheduled" && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Report Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Frequency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Next Run
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                    Recipients
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {scheduledReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {report.name}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {report.frequency}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {report.nextRun}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-500">
                      {report.recipients}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${report.active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                          }`}
                      >
                        {report.active ? "Active" : "Paused"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg">
                          {report.active ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
