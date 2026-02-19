import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  DollarSign,
  Tag,
  Layers,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const CatalogDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    items: [],
    pricing: [],
    costing: [],
    rules: [],
    packages: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const headers = { Authorization: `Bearer ${token}` };

      const [itemsRes, pricingRes, costingRes, rulesRes, packagesRes] =
        await Promise.all([
          fetch(`${API_URL}/api/commerce/modules/catalog/items`, { headers }),
          fetch(`${API_URL}/api/commerce/modules/catalog/pricing`, { headers }),
          fetch(`${API_URL}/api/commerce/modules/catalog/costing`, { headers }),
          fetch(`${API_URL}/api/commerce/modules/catalog/rules`, { headers }),
          fetch(`${API_URL}/api/commerce/modules/catalog/packages`, {
            headers,
          }),
        ]);

      const [items, pricing, costing, rules, packages] = await Promise.all([
        itemsRes.json(),
        pricingRes.json(),
        costingRes.json(),
        rulesRes.json(),
        packagesRes.json(),
      ]);

      setStats({
        items: items.items || [],
        pricing: pricing.pricing || [],
        costing: costing.costing || [],
        rules: rules.rules || [],
        packages: packages.packages || [],
      });
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const totalItems = stats.items.length;
  const activeItems = stats.items.filter((i) => i.status === "active").length;
  const totalValue = stats.items.reduce(
    (sum, i) => sum + (i.base_price || 0),
    0,
  );
  const categories = [
    ...new Set(stats.items.map((i) => i.category).filter(Boolean)),
  ];

  const quickStats = [
    {
      label: "Total Items",
      value: totalItems,
      icon: Package,
      color: "blue",
      change: "+12%",
      trend: "up",
    },
    {
      label: "Active Items",
      value: activeItems,
      icon: Activity,
      color: "emerald",
      change: "+8%",
      trend: "up",
    },
    {
      label: "Pricing Rules",
      value: stats.pricing.length,
      icon: DollarSign,
      color: "purple",
      change: "+5%",
      trend: "up",
    },
    {
      label: "Total Value",
      value: `₹${(totalValue / 100000).toFixed(1)}L`,
      icon: TrendingUp,
      color: "amber",
      change: "+15%",
      trend: "up",
    },
  ];

  const modules = [
    {
      name: "Items",
      count: stats.items.length,
      active: stats.items.filter((i) => i.status === "active").length,
      path: "/commerce/catalog/items",
      icon: Package,
      color: "blue",
    },
    {
      name: "Pricing",
      count: stats.pricing.length,
      active: stats.pricing.filter((p) => p.status === "active").length,
      path: "/commerce/catalog/pricing",
      icon: DollarSign,
      color: "purple",
    },
    {
      name: "Costing",
      count: stats.costing.length,
      active: stats.costing.filter((c) => c.status === "active").length,
      path: "/commerce/catalog/costing",
      icon: BarChart3,
      color: "emerald",
    },
    {
      name: "Rules",
      count: stats.rules.length,
      active: stats.rules.filter((r) => r.status === "active").length,
      path: "/commerce/catalog/rules",
      icon: Layers,
      color: "amber",
    },
    {
      name: "Packages",
      count: stats.packages.length,
      active: stats.packages.filter((p) => p.status === "active").length,
      path: "/commerce/catalog/packages",
      icon: Tag,
      color: "indigo",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#033F99]"></div>
          <p className="text-sm text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="catalog-dashboard">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Catalog Overview
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Product catalog performance and insights
          </p>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {quickStats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">
                    {stat.value}
                  </p>
                  <div className="mt-2 flex items-center gap-1">
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                    <span
                      className={`text-sm font-medium ${stat.trend === "up" ? "text-emerald-600" : "text-red-600"}`}
                    >
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-400">vs last month</span>
                  </div>
                </div>
                <div
                  className={`h-12 w-12 rounded-lg bg-${stat.color}-50 flex items-center justify-center`}
                >
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {modules.map((module, idx) => (
            <div
              key={idx}
              onClick={() => navigate(module.path)}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-[#033F99]/30 transition-all cursor-pointer group"
            >
              <div
                className={`h-10 w-10 rounded-lg bg-${module.color}-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <module.icon className={`h-5 w-5 text-${module.color}-600`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {module.name}
              </h3>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total</span>
                  <span className="font-medium text-gray-900">
                    {module.count}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Active</span>
                  <span className="font-medium text-emerald-600">
                    {module.active}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <span className="text-sm text-[#033F99] font-medium group-hover:underline">
                  View all →
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Category Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Categories
              </h3>
              <PieChart className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {categories.slice(0, 5).map((cat, idx) => {
                const count = stats.items.filter(
                  (i) => i.category === cat,
                ).length;
                const pct = Math.round((count / totalItems) * 100);
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{cat}</span>
                        <span className="text-gray-500">{count} items</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#033F99] rounded-full"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Activity
              </h3>
              <Activity className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {stats.items.slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#033F99] to-[#0550c8] flex items-center justify-center text-white text-xs font-semibold">
                    {item.name?.charAt(0) || "I"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.category || "Uncategorized"}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    ₹{(item.base_price || 0).toLocaleString()}
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

export default CatalogDashboard;
