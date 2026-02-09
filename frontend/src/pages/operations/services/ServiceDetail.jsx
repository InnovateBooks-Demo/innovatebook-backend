import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Briefcase,
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  FileText,
  Activity,
  TrendingUp,
  Pause,
  Play,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { authService } from "../../../utils/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ServiceDetail = () => {
  const navigate = useNavigate();
  const { service_instance_id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchService();
  }, [service_instance_id]);

  const fetchService = async () => {
    try {
      const token = authService.getToken();
      const response = await fetch(
        `${API_URL}/api/operations/services/${service_instance_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setService(data.data);
      }
    } catch (error) {
      toast.error("Failed to load service");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      const token = authService.getToken();
      const response = await fetch(
        `${API_URL}/api/operations/services/${service_instance_id}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );
      if (response.ok) {
        toast.success(`Service ${newStatus}`);
        fetchService();
      }
    } catch (error) {
      toast.error("Failed to update service");
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: FileText },
    { id: "sla", label: "SLA", icon: TrendingUp },
    { id: "usage", label: "Usage", icon: Activity },
    { id: "billing", label: "Billing", icon: DollarSign },
    { id: "incidents", label: "Incidents", icon: AlertTriangle },
  ];

  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-green-100 text-green-700",
      paused: "bg-yellow-100 text-yellow-700",
      suspended: "bg-red-100 text-red-700",
      completed: "bg-gray-100 text-gray-700",
    };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        Service not found
      </div>
    );
  }

  const usagePercent = service.usage_limit
    ? (service.usage_current / service.usage_limit) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gray-50" data-testid="service-detail">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate("/operations/services")}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-500">
              Operations → Services → {service.service_instance_id}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center">
                <Briefcase className="h-7 w-7 text-teal-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {service.service_name}
                </h1>
                <div className="flex items-center gap-4 mt-1">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(service.status)}`}
                  >
                    {service.status}
                  </span>
                  <span className="text-sm text-gray-500 capitalize">
                    {service.service_type} Service
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {service.status === "active" ? (
                <button
                  onClick={() => handleStatusUpdate("paused")}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100"
                >
                  <Pause className="h-4 w-4" />
                  Pause
                </button>
              ) : service.status === "paused" ? (
                <button
                  onClick={() => handleStatusUpdate("active")}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100"
                >
                  <Play className="h-4 w-4" />
                  Resume
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-8 flex gap-1 border-t border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-teal-600 text-teal-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Service Info */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Service Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Work Order</p>
                    <p className="font-medium text-gray-900">
                      {service.work_order_id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Service Type</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {service.service_type}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Party</p>
                    <p className="font-medium text-gray-900">
                      {service.party_name || service.party_id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Billing Cycle</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {service.billing_cycle}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-medium text-gray-900">
                      {service.service_start}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Renewal Date</p>
                    <p className="font-medium text-gray-900">
                      {service.next_renewal || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Usage Progress */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Current Period Usage
                </h3>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">
                      {service.usage_unit || "Units"}
                    </span>
                    <span
                      className={`text-lg font-bold ${usagePercent >= 100 ? "text-red-600" : usagePercent >= 80 ? "text-yellow-600" : "text-green-600"}`}
                    >
                      {usagePercent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-4 rounded-full ${usagePercent >= 100 ? "bg-red-500" : usagePercent >= 80 ? "bg-yellow-500" : "bg-green-500"}`}
                      style={{ width: `${Math.min(usagePercent, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-sm text-gray-500">
                    <span>{service.usage_current || 0} used</span>
                    <span>{service.usage_limit || 0} limit</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* SLA Status */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  SLA Status
                </h3>
                <div
                  className={`p-4 rounded-lg ${
                    service.sla_status === "on_track"
                      ? "bg-green-50"
                      : service.sla_status === "at_risk"
                        ? "bg-yellow-50"
                        : "bg-red-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {service.sla_status === "on_track" ? (
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    ) : service.sla_status === "at_risk" ? (
                      <AlertTriangle className="h-8 w-8 text-yellow-600" />
                    ) : (
                      <AlertTriangle className="h-8 w-8 text-red-600" />
                    )}
                    <div>
                      <p
                        className={`font-semibold capitalize ${
                          service.sla_status === "on_track"
                            ? "text-green-700"
                            : service.sla_status === "at_risk"
                              ? "text-yellow-700"
                              : "text-red-700"
                        }`}
                      >
                        {service.sla_status?.replace("_", " ")}
                      </p>
                      <p className="text-sm text-gray-500">
                        Current SLA compliance
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Stats
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Total Incidents
                    </span>
                    <span className="font-semibold text-gray-900">
                      {service.incident_count || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Open Incidents
                    </span>
                    <span className="font-semibold text-red-600">
                      {service.open_incidents || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Uptime</span>
                    <span className="font-semibold text-green-600">
                      {service.uptime_percent || 99.9}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLA Tab */}
        {activeTab === "sla" && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                SLA Metrics
              </h3>
            </div>
            <div className="p-6">
              {service.sla_metrics?.length > 0 ? (
                <div className="grid grid-cols-2 gap-6">
                  {service.sla_metrics.map((metric, i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">
                        {metric.metric_name}
                      </p>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {metric.current_value}
                        </span>
                        <span className="text-sm text-gray-500">
                          / {metric.target_value} {metric.unit}
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-2 rounded-full ${metric.is_met ? "bg-green-500" : "bg-red-500"}`}
                            style={{
                              width: `${Math.min((metric.current_value / metric.target_value) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p>No SLA metrics defined</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Usage Tab */}
        {activeTab === "usage" && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Usage History
              </h3>
            </div>
            <div className="p-6">
              {service.usage_history?.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Period
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                        Usage
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                        Limit
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                        %
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {service.usage_history.map((entry, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3 text-gray-900">
                          {entry.period}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {entry.usage}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {entry.limit}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              (entry.usage / entry.limit) * 100 >= 100
                                ? "bg-red-100 text-red-700"
                                : (entry.usage / entry.limit) * 100 >= 80
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-green-100 text-green-700"
                            }`}
                          >
                            {((entry.usage / entry.limit) * 100).toFixed(0)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p>No usage history available</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === "billing" && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Billing Information
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Monthly Fee</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    ₹{(service.monthly_fee || 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Current Bill</p>
                  <p className="text-2xl font-bold text-[#033F99] mt-1">
                    ₹{(service.current_bill || 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Total Billed (YTD)</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    ₹{(service.total_billed_ytd || 0).toLocaleString()}
                  </p>
                </div>
              </div>
              {service.billing_history?.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Invoice
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Period
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {service.billing_history.map((invoice, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {invoice.invoice_id}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {invoice.period}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          ₹{(invoice.amount || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              invoice.status === "paid"
                                ? "bg-green-100 text-green-700"
                                : invoice.status === "pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {invoice.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No billing history available</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Incidents Tab */}
        {activeTab === "incidents" && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Service Incidents
              </h3>
            </div>
            {service.incidents?.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {service.incidents.map((incident) => (
                  <div key={incident.incident_id} className="px-6 py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <AlertTriangle
                          className={`h-5 w-5 mt-0.5 ${
                            incident.severity === "critical"
                              ? "text-red-500"
                              : incident.severity === "high"
                                ? "text-orange-500"
                                : "text-yellow-500"
                          }`}
                        />
                        <div>
                          <p className="font-medium text-gray-900">
                            {incident.title}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {incident.description}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {incident.incident_id} • Reported:{" "}
                            {new Date(incident.reported_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          incident.status === "resolved"
                            ? "bg-green-100 text-green-700"
                            : incident.status === "investigating"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {incident.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-12 text-center text-gray-500">
                <CheckCircle className="h-12 w-12 text-green-300 mx-auto mb-4" />
                <p>No incidents reported</p>
                <p className="text-sm mt-2">This service is running smoothly</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceDetail;
