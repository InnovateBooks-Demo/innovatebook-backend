import React, { useState, useEffect } from "react";
import {
  FileBarChart,
  Plus,
  Play,
  Download,
  Calendar,
  Trash2,
  Edit2,
  Database,
  Filter,
  SortAsc,
  BarChart3,
  Table,
  PieChart,
  LineChart,
  X,
  Check,
  Loader2,
} from "lucide-react";
import { authService } from "../utils/auth";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ReportsBuilder = () => {
  const [reports, setReports] = useState([]);
  const [dataSources, setDataSources] = useState({});
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportResults, setReportResults] = useState(null);
  const [runningReport, setRunningReport] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = authService.getToken();
      const [reportsRes, sourcesRes, templatesRes] = await Promise.all([
        fetch(`${API_URL}/api/reports-builder/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/reports-builder/data-sources`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/reports-builder/templates/list`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (reportsRes.ok) setReports((await reportsRes.json()).reports || []);
      if (sourcesRes.ok)
        setDataSources((await sourcesRes.json()).data_sources || {});
      if (templatesRes.ok)
        setTemplates((await templatesRes.json()).templates || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const runReport = async (reportId) => {
    setRunningReport(true);
    try {
      const token = authService.getToken();
      const response = await fetch(
        `${API_URL}/api/reports-builder/${reportId}/run`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setReportResults(data);
        toast.success("Report generated");
      }
    } catch (error) {
      toast.error("Failed to run report");
    } finally {
      setRunningReport(false);
    }
  };

  const createReport = async (reportData) => {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/reports-builder/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reportData),
      });
      if (response.ok) {
        toast.success("Report created");
        fetchData();
        setShowCreateModal(false);
      }
    } catch (error) {
      toast.error("Failed to create report");
    }
  };

  const deleteReport = async (reportId) => {
    try {
      const token = authService.getToken();
      await fetch(`${API_URL}/api/reports-builder/${reportId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Report deleted");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete report");
    }
  };

  const exportReport = async (reportId, format) => {
    try {
      const token = authService.getToken();
      const response = await fetch(
        `${API_URL}/api/reports-builder/${reportId}/export?format=${format}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        const data = await response.json();
        // Download file
        const blob = new Blob(
          [format === "csv" ? data.data : JSON.stringify(data.data, null, 2)],
          { type: format === "csv" ? "text/csv" : "application/json" },
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = data.filename;
        a.click();
        toast.success("Report exported");
      }
    } catch (error) {
      toast.error("Failed to export report");
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
    <div className="min-h-screen bg-slate-50" data-testid="reports-builder">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#033F99] to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileBarChart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Reports Builder
                </h1>
                <p className="text-sm text-slate-500">
                  Create custom reports with drag-drop fields
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#033F99] text-white rounded-lg hover:bg-[#022a6b] transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              New Report
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Report Templates */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Quick Start Templates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {templates.map((template) => (
              <button
                key={template.template_id}
                onClick={() =>
                  createReport({
                    name: template.name,
                    description: template.description,
                    data_source: template.data_source,
                    columns: template.columns,
                    group_by: template.group_by,
                    aggregations: template.aggregations || [],
                    filters: template.filters || [],
                  })
                }
                className="p-4 bg-white border border-slate-200 rounded-xl hover:border-[#033F99] hover:shadow-md transition-all text-left"
              >
                <BarChart3 className="w-8 h-8 text-[#033F99] mb-3" />
                <p className="font-medium text-slate-900 text-sm">
                  {template.name}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {template.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* My Reports */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            My Reports
          </h2>
          {reports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reports.map((report) => (
                <div
                  key={report.report_id}
                  className="bg-white rounded-xl border border-slate-200 p-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {report.name}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {report.description || "No description"}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                      {dataSources[report.data_source]?.name ||
                        report.data_source}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                    <span>{report.columns?.length || 0} columns</span>
                    <span>•</span>
                    <span>Run {report.run_count || 0} times</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedReport(report);
                        runReport(report.report_id);
                      }}
                      disabled={runningReport}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#033F99] text-white rounded-lg hover:bg-[#022a6b] transition-colors text-sm"
                    >
                      {runningReport &&
                        selectedReport?.report_id === report.report_id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      Run
                    </button>
                    <button
                      onClick={() => exportReport(report.report_id, "csv")}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Export CSV"
                    >
                      <Download className="w-4 h-4 text-slate-600" />
                    </button>
                    <button
                      onClick={() => deleteReport(report.report_id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <FileBarChart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-4">No custom reports yet</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-[#033F99] text-white rounded-lg hover:bg-[#022a6b] text-sm"
              >
                Create Your First Report
              </button>
            </div>
          )}
        </div>

        {/* Report Results */}
        {reportResults && (
          <div className="mt-8 bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">
                {reportResults.report_name} - Results
              </h3>
              <button
                onClick={() => setReportResults(null)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {reportResults.aggregations &&
              Object.keys(reportResults.aggregations).length > 0 && (
                <div className="flex gap-4 mb-4">
                  {Object.entries(reportResults.aggregations).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="px-4 py-2 bg-slate-50 rounded-lg"
                      >
                        <span className="text-xs text-slate-500">
                          {key.replace("_", " ")}
                        </span>
                        <p className="text-lg font-bold text-slate-900">
                          {typeof value === "number"
                            ? value.toLocaleString()
                            : value}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    {reportResults.columns?.map((col) => (
                      <th
                        key={col}
                        className="px-4 py-3 text-left text-sm font-medium text-slate-600"
                      >
                        {col.replace(/_/g, " ")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportResults.data?.slice(0, 50).map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      {reportResults.columns?.map((col) => (
                        <td
                          key={col}
                          className="px-4 py-3 text-sm text-slate-700"
                        >
                          {typeof row[col] === "number"
                            ? row[col].toLocaleString()
                            : row[col] || "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Showing {Math.min(50, reportResults.data?.length || 0)} of{" "}
              {reportResults.total_rows} rows
            </p>
          </div>
        )}
      </div>

      {/* Create Report Modal */}
      {showCreateModal && (
        <CreateReportModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createReport}
          dataSources={dataSources}
        />
      )}
    </div>
  );
};

const CreateReportModal = ({ onClose, onCreate, dataSources }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    data_source: "leads",
    columns: [],
    filters: [],
    sort_by: "",
    group_by: "",
  });

  const selectedSource = dataSources[formData.data_source];

  const toggleColumn = (columnName) => {
    if (formData.columns.includes(columnName)) {
      setFormData({
        ...formData,
        columns: formData.columns.filter((c) => c !== columnName),
      });
    } else {
      setFormData({ ...formData, columns: [...formData.columns, columnName] });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || formData.columns.length === 0) {
      toast.error("Please enter a name and select at least one column");
      return;
    }
    onCreate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Create Report</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Report Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                placeholder="My Report"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Data Source
              </label>
              <select
                value={formData.data_source}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    data_source: e.target.value,
                    columns: [],
                  })
                }
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
              >
                {Object.entries(dataSources).map(([key, source]) => (
                  <option key={key} value={key}>
                    {source.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={2}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
              placeholder="Report description..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select Columns *{" "}
              <span className="text-slate-400">
                ({formData.columns.length} selected)
              </span>
            </label>
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-3 bg-slate-50 rounded-lg">
              {selectedSource?.fields?.map((field) => (
                <button
                  key={field.name}
                  type="button"
                  onClick={() => toggleColumn(field.name)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${formData.columns.includes(field.name)
                      ? "bg-[#033F99] text-white"
                      : "bg-white border border-slate-200 text-slate-700 hover:border-[#033F99]"
                    }`}
                >
                  {formData.columns.includes(field.name) && (
                    <Check className="w-4 h-4" />
                  )}
                  {field.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Group By
              </label>
              <select
                value={formData.group_by}
                onChange={(e) =>
                  setFormData({ ...formData, group_by: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
              >
                <option value="">None</option>
                {selectedSource?.fields?.map((field) => (
                  <option key={field.name} value={field.name}>
                    {field.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Sort By
              </label>
              <select
                value={formData.sort_by}
                onChange={(e) =>
                  setFormData({ ...formData, sort_by: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
              >
                <option value="">None</option>
                {selectedSource?.fields?.map((field) => (
                  <option key={field.name} value={field.name}>
                    {field.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#033F99] text-white rounded-lg hover:bg-[#022a6b] transition-colors"
            >
              Create Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportsBuilder;
