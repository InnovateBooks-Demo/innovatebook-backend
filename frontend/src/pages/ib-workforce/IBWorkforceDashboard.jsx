import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Shield,
  Clock,
  Calendar,
  Wallet,
  FileCheck,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { authService } from "../../utils/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const IBWorkforceDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/ib-workforce/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.data || {});
      }
    } catch (error) {
      console.error("Failed to fetch dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const modules = [
    {
      id: "people",
      title: "People",
      description: "Identity & Lifecycle Management",
      icon: Users,
      path: "/ib-workforce/people",
      color: "from-blue-500 to-blue-600",
      metrics: [
        { label: "Total", value: stats.people?.total || 0 },
        { label: "Active", value: stats.people?.active || 0 },
      ],
    },
    {
      id: "roles",
      title: "Roles",
      description: "Authority & Access Control",
      icon: Shield,
      path: "/ib-workforce/roles",
      color: "from-purple-500 to-purple-600",
      metrics: [
        { label: "Total", value: stats.roles?.total || 0 },
        { label: "Active", value: stats.roles?.active || 0 },
      ],
    },
    {
      id: "capacity",
      title: "Capacity",
      description: "Availability & Allocation",
      icon: TrendingUp,
      path: "/ib-workforce/capacity",
      color: "from-emerald-500 to-emerald-600",
      metrics: [
        { label: "Profiles", value: stats.capacity?.profiles || 0 },
        { label: "Allocations", value: stats.capacity?.allocations || 0 },
      ],
    },
    {
      id: "time",
      title: "Time",
      description: "Attendance & Time Tracking",
      icon: Clock,
      path: "/ib-workforce/time",
      color: "from-amber-500 to-amber-600",
      metrics: [
        { label: "Pending", value: stats.time?.pending_timesheets || 0 },
        { label: "Today", value: stats.time?.today_attendance || 0 },
      ],
    },
    {
      id: "payroll",
      title: "Payroll",
      description: "Compensation & Pay Runs",
      icon: Wallet,
      path: "/ib-workforce/payroll",
      color: "from-cyan-500 to-cyan-600",
      metrics: [
        { label: "Pending", value: stats.payroll?.pending_payruns || 0 },
        { label: "Status", value: "Active" },
      ],
    },
    {
      id: "compliance",
      title: "Compliance",
      description: "Statutory & Risk Control",
      icon: FileCheck,
      path: "/ib-workforce/compliance",
      color: "from-rose-500 to-rose-600",
      metrics: [
        { label: "Violations", value: stats.compliance?.open_violations || 0 },
        { label: "Expiring", value: stats.compliance?.expiring_docs || 0 },
      ],
    },
  ];

  const kpis = [
    {
      label: "Total Employees",
      value: stats.people?.total || 0,
      change: "+3",
      up: true,
      icon: Users,
    },
    {
      label: "Active Roles",
      value: stats.roles?.active || 0,
      change: "+1",
      up: true,
      icon: Shield,
    },
    {
      label: "Pending Timesheets",
      value: stats.time?.pending_timesheets || 0,
      change: "-2",
      up: true,
      icon: Clock,
    },
    {
      label: "Open Violations",
      value: stats.compliance?.open_violations || 0,
      change: "0",
      up: true,
      icon: AlertTriangle,
    },
  ];

  return (
    <div
      className="min-h-screen bg-gray-50"
      data-testid="ib-workforce-dashboard"
    >
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  IB Workforce
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Human Capacity, Accountability & Compliance Engine
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/ib-workforce/people/create")}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#033F99] text-white rounded-lg hover:bg-[#022B6B] transition-colors"
              data-testid="add-person-btn"
            >
              <UserPlus className="h-4 w-4" />
              Add Person
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {kpis.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <div
                key={`item-${index}`}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Icon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div
                    className={`flex items-center gap-1 text-sm ${kpi.up ? "text-emerald-600" : "text-red-600"}`}
                  >
                    {kpi.up ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    {kpi.change}
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                <p className="text-sm text-gray-500 mt-1">{kpi.label}</p>
              </div>
            );
          })}
        </div>

        {/* Module Cards */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Workforce Modules
        </h2>
        <div className="grid grid-cols-3 gap-6">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <div
                key={module.id}
                onClick={() => navigate(module.path)}
                className="bg-white rounded-xl border border-gray-200 p-6 cursor-pointer hover:shadow-lg hover:border-gray-300 transition-all group"
                data-testid={`module-${module.id}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-[#033F99] transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {module.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {module.description}
                </p>
                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                  {module.metrics.map((metric, idx) => (
                    <div key={`item-${idx}`}>
                      <p className="text-lg font-bold text-gray-900">
                        {metric.value}
                      </p>
                      <p className="text-xs text-gray-500">{metric.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3">
              {[
                {
                  action: "New employee onboarded",
                  person: "Rajesh Kumar",
                  time: "2 hours ago",
                  icon: UserPlus,
                  color: "text-emerald-600",
                },
                {
                  action: "Timesheet approved",
                  person: "Priya Sharma",
                  time: "4 hours ago",
                  icon: CheckCircle,
                  color: "text-blue-600",
                },
                {
                  action: "Role assigned",
                  person: "Amit Patel",
                  time: "1 day ago",
                  icon: Shield,
                  color: "text-purple-600",
                },
                {
                  action: "Compliance alert",
                  person: "Document expiring",
                  time: "2 days ago",
                  icon: AlertTriangle,
                  color: "text-amber-600",
                },
              ].map((item, idx) => {
                const ItemIcon = item.icon;
                return (
                  <div
                    key={`item-${idx}`}
                    className="flex items-center gap-3 py-2"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center ${item.color}`}
                    >
                      <ItemIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {item.action}
                      </p>
                      <p className="text-xs text-gray-500">{item.person}</p>
                    </div>
                    <span className="text-xs text-gray-400">{item.time}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Pending Actions
            </h3>
            <div className="space-y-3">
              {[
                {
                  task: "Review timesheet submissions",
                  count: stats.time?.pending_timesheets || 3,
                  priority: "high",
                },
                {
                  task: "Approve pending pay run",
                  count: stats.payroll?.pending_payruns || 1,
                  priority: "high",
                },
                {
                  task: "Complete onboarding",
                  count: stats.people?.draft || 2,
                  priority: "medium",
                },
                {
                  task: "Resolve compliance violations",
                  count: stats.compliance?.open_violations || 1,
                  priority: "high",
                },
              ].map((item, idx) => (
                <div
                  key={`item-${idx}`}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${item.priority === "high" ? "bg-red-500" : "bg-amber-500"}`}
                    />
                    <span className="text-sm text-gray-700">{item.task}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IBWorkforceDashboard;
