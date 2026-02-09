import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Building2,
  Handshake,
  Share2,
  FileUser,
  TrendingUp,
  AlertCircle,
  Clock,
  Plus,
  ArrowRight,
  Activity,
  PieChart,
  BarChart3,
} from "lucide-react";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PartiesDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    customers: { total: 0, active: 0, new: 0 },
    vendors: { total: 0, active: 0, critical: 0 },
    partners: { total: 0, active: 0, resellers: 0 },
    channels: { total: 0, active: 0 },
    profiles: { total: 0, active: 0 },
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchAllStats();
  }, []);

  const fetchAllStats = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const headers = { Authorization: `Bearer ${token}` };

      const [customersRes, vendorsRes, partnersRes, channelsRes, profilesRes] =
        await Promise.all([
          axios
            .get(`${API_URL}/api/commerce/parties/customers`, { headers })
            .catch(() => ({ data: { customers: [] } })),
          axios
            .get(`${API_URL}/api/commerce/parties/vendors`, { headers })
            .catch(() => ({ data: { vendors: [] } })),
          axios
            .get(`${API_URL}/api/commerce/parties/partners`, { headers })
            .catch(() => ({ data: { partners: [] } })),
          axios
            .get(`${API_URL}/api/commerce/parties/channels`, { headers })
            .catch(() => ({ data: { channels: [] } })),
          axios
            .get(`${API_URL}/api/commerce/parties/profiles`, { headers })
            .catch(() => ({ data: { profiles: [] } })),
        ]);

      const customers = customersRes.data.customers || [];
      const vendors = vendorsRes.data.vendors || [];
      const partners = partnersRes.data.partners || [];
      const channels = channelsRes.data.channels || [];
      const profiles = profilesRes.data.profiles || [];

      setStats({
        customers: {
          total: customers.length,
          active: customers.filter((c) => c.status === "active").length,
          new: customers.filter((c) => {
            const created = new Date(c.created_at);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return created > weekAgo;
          }).length,
        },
        vendors: {
          total: vendors.length,
          active: vendors.filter((v) => v.status === "active").length,
          critical: vendors.filter((v) => v.critical_vendor_flag).length,
        },
        partners: {
          total: partners.length,
          active: partners.filter((p) => p.status === "active").length,
          resellers: partners.filter((p) => p.partner_type === "Reseller")
            .length,
        },
        channels: {
          total: channels.length,
          active: channels.filter((c) => c.status === "active").length,
        },
        profiles: {
          total: profiles.length,
          active: profiles.filter((p) => p.status === "active").length,
        },
      });

      // Create recent activity from all parties
      const allParties = [
        ...customers.map((c) => ({
          ...c,
          type: "Customer",
          icon: Users,
          color: "blue",
        })),
        ...vendors.map((v) => ({
          ...v,
          type: "Vendor",
          icon: Building2,
          color: "purple",
        })),
        ...partners.map((p) => ({
          ...p,
          type: "Partner",
          icon: Handshake,
          color: "emerald",
        })),
        ...channels.map((c) => ({
          ...c,
          type: "Channel",
          icon: Share2,
          color: "indigo",
        })),
        ...profiles.map((p) => ({
          ...p,
          type: "Profile",
          icon: FileUser,
          color: "amber",
        })),
      ]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10);

      setRecentActivity(allParties);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const modules = [
    {
      title: "Customers",
      description: "Manage B2B, B2C, and enterprise customers",
      icon: Users,
      color: "blue",
      bgGradient: "from-blue-600 to-blue-700",
      lightBg: "bg-blue-100",
      path: "/commerce/parties/customers",
      stats: [
        { label: "Total", value: stats.customers.total },
        { label: "Active", value: stats.customers.active },
        { label: "New (7d)", value: stats.customers.new },
      ],
    },
    {
      title: "Vendors",
      description: "Manage suppliers and service providers",
      icon: Building2,
      color: "purple",
      bgGradient: "from-purple-600 to-purple-700",
      lightBg: "bg-purple-100",
      path: "/commerce/parties/vendors",
      stats: [
        { label: "Total", value: stats.vendors.total },
        { label: "Active", value: stats.vendors.active },
        { label: "Critical", value: stats.vendors.critical, alert: true },
      ],
    },
    {
      title: "Partners",
      description: "Manage business partners and alliances",
      icon: Handshake,
      color: "emerald",
      bgGradient: "from-emerald-600 to-emerald-700",
      lightBg: "bg-emerald-100",
      path: "/commerce/parties/partners",
      stats: [
        { label: "Total", value: stats.partners.total },
        { label: "Active", value: stats.partners.active },
        { label: "Resellers", value: stats.partners.resellers },
      ],
    },
    {
      title: "Channels",
      description: "Manage sales and distribution channels",
      icon: Share2,
      color: "indigo",
      bgGradient: "from-indigo-600 to-indigo-700",
      lightBg: "bg-indigo-100",
      path: "/commerce/parties/channels",
      stats: [
        { label: "Total", value: stats.channels.total },
        { label: "Active", value: stats.channels.active },
      ],
    },
    {
      title: "Profiles",
      description: "Manage commercial terms and pricing profiles",
      icon: FileUser,
      color: "amber",
      bgGradient: "from-amber-600 to-amber-700",
      lightBg: "bg-amber-100",
      path: "/commerce/parties/profiles",
      stats: [
        { label: "Total", value: stats.profiles.total },
        { label: "Active", value: stats.profiles.active },
      ],
    },
  ];

  const totalParties =
    stats.customers.total +
    stats.vendors.total +
    stats.partners.total +
    stats.channels.total +
    stats.profiles.total;
  const totalActive =
    stats.customers.active +
    stats.vendors.active +
    stats.partners.active +
    stats.channels.active +
    stats.profiles.active;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50"
      style={{ fontFamily: "Poppins" }}
    >
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Parties Dashboard
              </h1>
              <p className="text-gray-600 font-medium mt-1">
                Manage all your business relationships in one place
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/commerce/parties/customers/create")}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-[rgba(3,63,153,0.25)] text-blue-700 rounded-xl hover:bg-[rgba(3,63,153,0.08)] transition-all font-semibold"
              >
                <Plus className="h-4 w-4" />
                New Customer
              </button>
              <button
                onClick={() => navigate("/commerce/parties/vendors/create")}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-purple-200 text-purple-700 rounded-xl hover:bg-purple-50 transition-all font-semibold"
              >
                <Plus className="h-4 w-4" />
                New Vendor
              </button>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Total Parties
                </p>
                <p className="text-4xl font-bold text-gray-900">
                  {totalParties}
                </p>
                <p className="text-sm text-green-600 font-medium mt-1">
                  Across all types
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                <PieChart className="h-7 w-7 text-[#033F99]" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Active Parties
                </p>
                <p className="text-4xl font-bold text-green-600">
                  {totalActive}
                </p>
                <p className="text-sm text-gray-500 font-medium mt-1">
                  {Math.round((totalActive / totalParties) * 100) || 0}% of
                  total
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-7 w-7 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Customers</p>
                <p className="text-4xl font-bold text-[#033F99]">
                  {stats.customers.total}
                </p>
                <p className="text-sm text-gray-500 font-medium mt-1">
                  {stats.customers.new} new this week
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                <Users className="h-7 w-7 text-[#033F99]" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Vendors</p>
                <p className="text-4xl font-bold text-purple-600">
                  {stats.vendors.total}
                </p>
                <p className="text-sm text-red-600 font-medium mt-1">
                  {stats.vendors.critical} critical
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                <Building2 className="h-7 w-7 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {modules.map((module) => (
            <div
              key={module.title}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group"
              onClick={() => navigate(module.path)}
              data-testid={`module-card-${module.title.toLowerCase()}`}
            >
              <div className={`bg-gradient-to-r ${module.bgGradient} p-6`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <module.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {module.title}
                      </h3>
                      <p className="text-white/80 text-sm">
                        {module.description}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-3 gap-4">
                  {module.stats.map((stat, idx) => (
                    <div key={idx} className="text-center">
                      <p
                        className={`text-2xl font-bold ${stat.alert ? "text-red-600" : "text-gray-900"}`}
                      >
                        {stat.value}
                      </p>
                      <p className="text-xs text-gray-500 font-medium">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>

          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => {
                    const paths = {
                      Customer: `/commerce/parties/customers/${item.customer_id}`,
                      Vendor: `/commerce/parties/vendors/${item.vendor_id}`,
                      Partner: `/commerce/parties/partners/${item.partner_id}`,
                      Channel: `/commerce/parties/channels/${item.channel_id}`,
                      Profile: `/commerce/parties/profiles/${item.profile_id}`,
                    };
                    navigate(paths[item.type]);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 ${item.lightBg || `bg-${item.color}-100`} rounded-lg flex items-center justify-center`}
                    >
                      <item.icon className={`h-5 w-5 text-${item.color}-600`} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {item.display_name ||
                          item.channel_name ||
                          item.profile_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.type} •{" "}
                        {item.customer_id ||
                          item.vendor_id ||
                          item.partner_id ||
                          item.channel_id ||
                          item.profile_id}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        item.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {(item.status || "active").toUpperCase()}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartiesDashboard;
