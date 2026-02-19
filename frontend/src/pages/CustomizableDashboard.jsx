import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Plus,
  Settings,
  Grip,
  X,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckSquare,
  ThumbsUp,
  Zap,
  DollarSign,
  Users,
  Folder,
  Calendar,
  ArrowRight,
  Loader2,
  RefreshCw,
  MoreVertical,
} from "lucide-react";
import { authService } from "../utils/auth";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const widgetIcons = {
  kpi_card: TrendingUp,
  recent_activity: Activity,
  tasks_list: CheckSquare,
  approvals_list: ThumbsUp,
  signals_list: Zap,
  pipeline_funnel: DollarSign,
  revenue_summary: DollarSign,
  calendar_mini: Calendar,
  quick_actions: LayoutGrid,
};

const CustomizableDashboard = () => {
  const navigate = useNavigate();
  const [widgets, setWidgets] = useState([]);
  const [widgetData, setWidgetData] = useState({});
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [availableWidgets, setAvailableWidgets] = useState({});

  useEffect(() => {
    fetchLayout();
    fetchAvailableWidgets();
  }, []);

  const fetchLayout = async () => {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/dashboard/layout`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setWidgets(data.widgets || []);
        // Fetch data for each widget
        data.widgets?.forEach((w) =>
          fetchWidgetData(w.widget_type, w.config?.metric),
        );
      }
    } catch (error) {
      console.error("Failed to fetch layout:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableWidgets = async () => {
    try {
      const token = authService.getToken();
      const response = await fetch(
        `${API_URL}/api/dashboard/widgets/available`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setAvailableWidgets(data.widgets || {});
      }
    } catch (error) {
      console.error("Failed to fetch available widgets:", error);
    }
  };

  const fetchWidgetData = async (widgetType, config) => {
    try {
      const token = authService.getToken();
      const configParam = config ? `?config=${config}` : "";
      const response = await fetch(
        `${API_URL}/api/dashboard/widget/${widgetType}/data${configParam}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setWidgetData((prev) => ({
          ...prev,
          [`${widgetType}_${config || "default"}`]: data,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch widget data:", error);
    }
  };

  const saveLayout = async () => {
    try {
      const token = authService.getToken();
      await fetch(`${API_URL}/api/dashboard/layout`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ widgets }),
      });
      toast.success("Dashboard saved");
      setEditMode(false);
    } catch (error) {
      toast.error("Failed to save dashboard");
    }
  };

  const addWidget = async (widgetType) => {
    try {
      const token = authService.getToken();
      const response = await fetch(
        `${API_URL}/api/dashboard/widget/add?widget_type=${widgetType}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setWidgets([...widgets, data.widget]);
        fetchWidgetData(widgetType);
        toast.success("Widget added");
      }
    } catch (error) {
      toast.error("Failed to add widget");
    }
    setShowAddWidget(false);
  };

  const removeWidget = async (widgetId) => {
    try {
      const token = authService.getToken();
      await fetch(`${API_URL}/api/dashboard/widget/${widgetId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setWidgets(widgets.filter((w) => w.widget_id !== widgetId));
      toast.success("Widget removed");
    } catch (error) {
      toast.error("Failed to remove widget");
    }
  };

  const renderWidget = (widget) => {
    const data =
      widgetData[`${widget.widget_type}_${widget.config?.metric || "default"}`];
    const Icon = widgetIcons[widget.widget_type] || LayoutGrid;

    switch (widget.widget_type) {
      case "kpi_card":
        return (
          <div className="h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">{widget.title}</span>
              <Icon className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">
                {data?.format === "currency"
                  ? `₹${(data?.value || 0).toLocaleString()}`
                  : (data?.value || 0).toLocaleString()}
              </p>
              {data?.trend !== undefined && (
                <span
                  className={`text-sm flex items-center gap-1 ${data.trend >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {data.trend >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {Math.abs(data.trend)}%
                </span>
              )}
            </div>
          </div>
        );

      case "recent_activity":
        return (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-slate-900">{widget.title}</span>
              <Activity className="w-5 h-5 text-slate-400" />
            </div>
            <div className="flex-1 overflow-auto space-y-2">
              {(data?.activities || []).slice(0, 5).map((activity, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg"
                >
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-slate-400">
                      {activity.user_name}
                    </p>
                  </div>
                </div>
              ))}
              {(!data?.activities || data.activities.length === 0) && (
                <p className="text-sm text-slate-400 text-center py-4">
                  No recent activity
                </p>
              )}
            </div>
          </div>
        );

      case "tasks_list":
        return (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-slate-900">{widget.title}</span>
              <CheckSquare className="w-5 h-5 text-slate-400" />
            </div>
            <div className="flex-1 overflow-auto space-y-2">
              {(data?.tasks || []).slice(0, 5).map((task, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg"
                >
                  <div
                    className={`w-2 h-2 rounded-full ${task.priority === "urgent"
                        ? "bg-red-500"
                        : task.priority === "high"
                          ? "bg-orange-500"
                          : "bg-blue-500"
                      }`}
                  />
                  <span className="text-sm text-slate-700 truncate flex-1">
                    {task.title}
                  </span>
                </div>
              ))}
              {(!data?.tasks || data.tasks.length === 0) && (
                <p className="text-sm text-slate-400 text-center py-4">
                  No pending tasks
                </p>
              )}
            </div>
            <button
              onClick={() => navigate("/workspace/tasks")}
              className="mt-2 text-sm text-[#033F99] hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        );

      case "signals_list":
        return (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-slate-900">{widget.title}</span>
              <Zap className="w-5 h-5 text-amber-500" />
            </div>
            <div className="flex-1 overflow-auto space-y-2">
              {(data?.signals || []).slice(0, 5).map((signal, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-lg border-l-2 ${signal.severity === "critical"
                      ? "bg-red-50 border-red-500"
                      : signal.severity === "warning"
                        ? "bg-amber-50 border-amber-500"
                        : "bg-blue-50 border-blue-500"
                    }`}
                >
                  <p className="text-sm text-slate-700 truncate">
                    {signal.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    {signal.source_solution}
                  </p>
                </div>
              ))}
              {(!data?.signals || data.signals.length === 0) && (
                <p className="text-sm text-slate-400 text-center py-4">
                  No active signals
                </p>
              )}
            </div>
            <button
              onClick={() => navigate("/intelligence/signals")}
              className="mt-2 text-sm text-[#033F99] hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        );

      case "pipeline_funnel":
        return (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-slate-900">{widget.title}</span>
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <div className="flex-1 space-y-2">
              {(data?.stages || []).slice(0, 5).map((stage, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-20 text-xs text-slate-500 truncate">
                    {stage.stage || "Unknown"}
                  </div>
                  <div className="flex-1 bg-slate-100 rounded-full h-3">
                    <div
                      className="bg-[#033F99] h-3 rounded-full"
                      style={{
                        width: `${Math.min((stage.count / (data?.stages?.[0]?.count || 1)) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-700 w-8">
                    {stage.count}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate("/commerce/revenue/leads")}
              className="mt-2 text-sm text-[#033F99] hover:underline flex items-center gap-1"
            >
              View pipeline <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        );

      case "quick_actions":
        return (
          <div className="h-full">
            <span className="font-medium text-slate-900 mb-3 block">
              {widget.title}
            </span>
            <div className="grid grid-cols-2 gap-2">
              {(data?.actions || []).map((action, i) => (
                <button
                  key={i}
                  onClick={() => navigate(action.path)}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-left transition-colors"
                >
                  <span className="text-sm text-slate-700">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="h-full flex items-center justify-center text-slate-400">
            <p>Widget: {widget.widget_type}</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#033F99] animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-slate-50"
      data-testid="customizable-dashboard"
    >
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#033F99] to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <LayoutGrid className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  My Dashboard
                </h1>
                <p className="text-sm text-slate-500">
                  Customizable widgets and KPIs
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddWidget(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#033F99] text-white rounded-lg hover:bg-[#022a6b] transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Widget
              </button>
              {editMode ? (
                <button
                  onClick={saveLayout}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  Save Layout
                </button>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
                >
                  <Settings className="w-4 h-4" />
                  Customize
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="px-8 py-6">
        <div className="grid grid-cols-4 gap-4 auto-rows-[180px]">
          {widgets
            .filter((w) => w.visible !== false)
            .map((widget) => (
              <div
                key={widget.widget_id}
                className={`bg-white rounded-xl border border-slate-200 p-5 relative ${editMode ? "ring-2 ring-blue-200 ring-offset-2" : ""
                  }`}
                style={{
                  gridColumn: `span ${widget.position?.w || 1}`,
                  gridRow: `span ${widget.position?.h || 1}`,
                }}
              >
                {editMode && (
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <button className="p-1 hover:bg-slate-100 rounded cursor-move">
                      <Grip className="w-4 h-4 text-slate-400" />
                    </button>
                    <button
                      onClick={() => removeWidget(widget.widget_id)}
                      className="p-1 hover:bg-red-100 rounded"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                )}
                {renderWidget(widget)}
              </div>
            ))}
        </div>

        {widgets.length === 0 && (
          <div className="text-center py-16">
            <LayoutGrid className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No widgets yet
            </h3>
            <p className="text-slate-500 mb-4">
              Add widgets to customize your dashboard
            </p>
            <button
              onClick={() => setShowAddWidget(true)}
              className="px-4 py-2 bg-[#033F99] text-white rounded-lg hover:bg-[#022a6b] text-sm"
            >
              Add Your First Widget
            </button>
          </div>
        )}
      </div>

      {/* Add Widget Modal */}
      {showAddWidget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Add Widget</h2>
              <button
                onClick={() => setShowAddWidget(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
              {Object.entries(availableWidgets).map(([type, info]) => {
                const Icon = widgetIcons[type] || LayoutGrid;
                return (
                  <button
                    key={type}
                    onClick={() => addWidget(type)}
                    className="p-4 border border-slate-200 rounded-xl hover:border-[#033F99] hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5 text-slate-600" />
                    </div>
                    <p className="font-medium text-slate-900">{info.name}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {info.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomizableDashboard;
