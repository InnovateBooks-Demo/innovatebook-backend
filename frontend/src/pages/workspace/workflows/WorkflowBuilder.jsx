import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Workflow,
  Plus,
  Play,
  Pause,
  Trash2,
  Settings,
  Copy,
  ArrowLeft,
  ChevronRight,
  Clock,
  Zap,
  GitBranch,
  Bell,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  PenTool,
} from "lucide-react";
import { toast } from "sonner";
import { authService } from "../../../utils/auth";
import VisualWorkflowEditor from "../../../components/VisualWorkflowEditor";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const WorkflowBuilder = () => {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [showNewWorkflow, setShowNewWorkflow] = useState(false);
  const [showRuns, setShowRuns] = useState(false);
  const [runs, setRuns] = useState([]);
  const [showVisualEditor, setShowVisualEditor] = useState(false);

  const [newWorkflow, setNewWorkflow] = useState({
    name: "",
    description: "",
    trigger: {
      type: "manual",
      event_type: "",
      conditions: [],
    },
    steps: [],
  });

  useEffect(() => {
    fetchWorkflows();
    fetchTemplates();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/workflows/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setWorkflows(data.workflows || []);
      }
    } catch (error) {
      console.error("Failed to fetch workflows");
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/workflows/templates/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error("Failed to fetch templates");
    }
  };

  const fetchWorkflowDetails = async (workflowId) => {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/workflows/${workflowId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedWorkflow(data);
      }
    } catch (error) {
      toast.error("Failed to fetch workflow details");
    }
  };

  const fetchRuns = async (workflowId) => {
    try {
      const token = authService.getToken();
      const response = await fetch(
        `${API_URL}/api/workflows/${workflowId}/runs`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setRuns(data.runs || []);
        setShowRuns(true);
      }
    } catch (error) {
      toast.error("Failed to fetch runs");
    }
  };

  const createWorkflow = async () => {
    if (!newWorkflow.name) {
      toast.error("Workflow name is required");
      return;
    }
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/workflows/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newWorkflow),
      });
      if (response.ok) {
        toast.success("Workflow created");
        setShowNewWorkflow(false);
        setNewWorkflow({
          name: "",
          description: "",
          trigger: { type: "manual", event_type: "", conditions: [] },
          steps: [],
        });
        fetchWorkflows();
      }
    } catch (error) {
      toast.error("Failed to create workflow");
    }
  };

  const applyTemplate = async (templateId) => {
    try {
      const token = authService.getToken();
      const response = await fetch(
        `${API_URL}/api/workflows/templates/${templateId}/use`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        toast.success("Workflow created from template");
        fetchWorkflows();
      }
    } catch (error) {
      toast.error("Failed to create from template");
    }
  };

  const toggleWorkflow = async (workflowId) => {
    try {
      const token = authService.getToken();
      const response = await fetch(
        `${API_URL}/api/workflows/${workflowId}/toggle`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        const data = await response.json();
        toast.success(
          data.is_active ? "Workflow activated" : "Workflow deactivated",
        );
        fetchWorkflows();
        if (selectedWorkflow?.workflow_id === workflowId) {
          fetchWorkflowDetails(workflowId);
        }
      }
    } catch (error) {
      toast.error("Failed to toggle workflow");
    }
  };

  const runWorkflow = async (workflowId) => {
    try {
      const token = authService.getToken();
      const response = await fetch(
        `${API_URL}/api/workflows/${workflowId}/run`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ trigger_data: {} }),
        },
      );
      if (response.ok) {
        toast.success("Workflow execution started");
        fetchWorkflowDetails(workflowId);
      }
    } catch (error) {
      toast.error("Failed to run workflow");
    }
  };

  const deleteWorkflow = async (workflowId) => {
    if (!window.confirm("Delete this workflow?")) return;
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/workflows/${workflowId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        toast.success("Workflow deleted");
        if (selectedWorkflow?.workflow_id === workflowId) {
          setSelectedWorkflow(null);
        }
        fetchWorkflows();
      }
    } catch (error) {
      toast.error("Failed to delete workflow");
    }
  };

  const handleVisualEditorSave = async (updatedWorkflow) => {
    try {
      const token = authService.getToken();
      const response = await fetch(
        `${API_URL}/api/workflows/${selectedWorkflow.workflow_id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ steps: updatedWorkflow.steps }),
        },
      );
      if (response.ok) {
        toast.success("Workflow steps saved");
        setShowVisualEditor(false);
        fetchWorkflowDetails(selectedWorkflow.workflow_id);
      } else {
        toast.error("Failed to save workflow");
      }
    } catch (error) {
      toast.error("Failed to save workflow");
    }
  };

  const getTriggerIcon = (type) => {
    const icons = {
      event: <Zap className="h-4 w-4" />,
      schedule: <Clock className="h-4 w-4" />,
      manual: <Play className="h-4 w-4" />,
      webhook: <GitBranch className="h-4 w-4" />,
    };
    return icons[type] || <Workflow className="h-4 w-4" />;
  };

  const getStepIcon = (type) => {
    const icons = {
      trigger: <Zap className="h-4 w-4 text-yellow-500" />,
      condition: <GitBranch className="h-4 w-4 text-blue-500" />,
      action: <Play className="h-4 w-4 text-green-500" />,
      delay: <Clock className="h-4 w-4 text-orange-500" />,
      branch: <GitBranch className="h-4 w-4 text-purple-500" />,
    };
    return icons[type] || <Settings className="h-4 w-4" />;
  };

  const getRunStatusIcon = (status) => {
    const icons = {
      completed: <CheckCircle className="h-4 w-4 text-green-500" />,
      failed: <XCircle className="h-4 w-4 text-red-500" />,
      running: <Play className="h-4 w-4 text-blue-500 animate-pulse" />,
    };
    return (
      icons[status] || <AlertTriangle className="h-4 w-4 text-yellow-500" />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">Loading...</div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/workspace")}
            className="p-2 hover:bg-gray-200 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Workflow Builder
            </h1>
            <p className="text-gray-500">Automate cross-module processes</p>
          </div>
        </div>
        <button
          onClick={() => setShowNewWorkflow(true)}
          className="px-4 py-2 bg-[#033F99] text-white rounded-lg hover:bg-[#022d6e] flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Workflow
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Workflows List */}
        <div className="col-span-4 space-y-4">
          <div className="bg-white rounded-lg border p-4">
            <h2 className="font-semibold mb-4">Your Workflows</h2>

            {workflows.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Workflow className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No workflows yet</p>
                <p className="text-sm">Create one or use a template</p>
              </div>
            ) : (
              <div className="space-y-2">
                {workflows.map((workflow) => (
                  <div
                    key={workflow.workflow_id}
                    onClick={() => fetchWorkflowDetails(workflow.workflow_id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedWorkflow?.workflow_id === workflow.workflow_id
                        ? "border-[#033F99] bg-blue-50"
                        : "hover:bg-gray-50"
                      }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {getTriggerIcon(workflow.trigger?.type)}
                        <div>
                          <h3 className="font-medium">{workflow.name}</h3>
                          <p className="text-xs text-gray-500">
                            {workflow.description || "No description"}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`w-2 h-2 rounded-full ${workflow.is_active ? "bg-green-500" : "bg-gray-300"}`}
                      />
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>{workflow.steps?.length || 0} steps</span>
                      <span>{workflow.run_count || 0} runs</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Templates */}
          <div className="bg-white rounded-lg border p-4">
            <h2 className="font-semibold mb-4">Quick Start Templates</h2>
            <div className="space-y-2">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-sm">{template.name}</h3>
                      <p className="text-xs text-gray-500">
                        {template.description}
                      </p>
                    </div>
                    <button
                      onClick={() => applyTemplate(template.id)}
                      className="px-2 py-1 text-xs border rounded hover:bg-gray-100"
                    >
                      Use
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Workflow Details */}
        <div className="col-span-8">
          {selectedWorkflow ? (
            <div className="space-y-4">
              {/* Header */}
              <div className="bg-white rounded-lg border p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold">
                        {selectedWorkflow.name}
                      </h2>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${selectedWorkflow.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                          }`}
                      >
                        {selectedWorkflow.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">
                      {selectedWorkflow.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowVisualEditor(true)}
                      className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-1 text-sm"
                      data-testid="open-visual-editor-btn"
                    >
                      <PenTool className="h-4 w-4" />
                      Visual Editor
                    </button>
                    <button
                      onClick={() => runWorkflow(selectedWorkflow.workflow_id)}
                      className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1 text-sm"
                      data-testid="run-workflow-btn"
                    >
                      <Play className="h-4 w-4" />
                      Run Now
                    </button>
                    <button
                      onClick={() =>
                        toggleWorkflow(selectedWorkflow.workflow_id)
                      }
                      className={`px-3 py-1 border rounded-lg flex items-center gap-1 text-sm ${selectedWorkflow.is_active
                          ? "hover:bg-orange-50"
                          : "hover:bg-green-50"
                        }`}
                      data-testid="toggle-workflow-btn"
                    >
                      {selectedWorkflow.is_active ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                      {selectedWorkflow.is_active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => fetchRuns(selectedWorkflow.workflow_id)}
                      className="px-3 py-1 border rounded-lg hover:bg-gray-50 flex items-center gap-1 text-sm"
                      data-testid="workflow-history-btn"
                    >
                      <FileText className="h-4 w-4" />
                      History
                    </button>
                    <button
                      onClick={() =>
                        deleteWorkflow(selectedWorkflow.workflow_id)
                      }
                      className="px-3 py-1 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                      data-testid="delete-workflow-btn"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mt-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Trigger Type</p>
                    <p className="font-semibold capitalize">
                      {selectedWorkflow.trigger?.type}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Steps</p>
                    <p className="font-semibold">
                      {selectedWorkflow.steps?.length || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Total Runs</p>
                    <p className="font-semibold">
                      {selectedWorkflow.run_count || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Version</p>
                    <p className="font-semibold">
                      v{selectedWorkflow.version || 1}
                    </p>
                  </div>
                </div>
              </div>

              {/* Trigger */}
              <div className="bg-white rounded-lg border p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  Trigger
                </h3>
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2">
                    {getTriggerIcon(selectedWorkflow.trigger?.type)}
                    <span className="font-medium capitalize">
                      {selectedWorkflow.trigger?.type}
                    </span>
                    {selectedWorkflow.trigger?.event_type && (
                      <span className="text-gray-500">
                        • {selectedWorkflow.trigger.event_type}
                      </span>
                    )}
                  </div>
                  {selectedWorkflow.trigger?.conditions?.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      Conditions: {selectedWorkflow.trigger.conditions.length}
                    </div>
                  )}
                </div>
              </div>

              {/* Steps */}
              <div className="bg-white rounded-lg border p-4">
                <h3 className="font-semibold mb-3">Workflow Steps</h3>

                {selectedWorkflow.steps?.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <p>No steps configured</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedWorkflow.steps?.map((step, index) => (
                      <div
                        key={step.step_id}
                        className="flex items-start gap-3"
                      >
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${step.step_type === "condition"
                                ? "bg-blue-100"
                                : step.step_type === "action"
                                  ? "bg-green-100"
                                  : step.step_type === "delay"
                                    ? "bg-orange-100"
                                    : "bg-gray-100"
                              }`}
                          >
                            {getStepIcon(step.step_type)}
                          </div>
                          {index < selectedWorkflow.steps.length - 1 && (
                            <div className="w-0.5 h-8 bg-gray-200 mt-1" />
                          )}
                        </div>
                        <div className="flex-1 p-3 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-xs px-2 py-0.5 bg-gray-100 rounded capitalize">
                                {step.step_type}
                              </span>
                              <h4 className="font-medium mt-1">{step.name}</h4>
                            </div>
                          </div>
                          {step.config && (
                            <div className="mt-2 text-sm text-gray-600">
                              {step.step_type === "condition" && (
                                <span>
                                  If {step.config.field} {step.config.operator}{" "}
                                  {step.config.value}
                                </span>
                              )}
                              {step.step_type === "action" && (
                                <span>Action: {step.config.type}</span>
                              )}
                              {step.step_type === "delay" && (
                                <span>Wait {step.config.delay_seconds}s</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Runs */}
              {selectedWorkflow.recent_runs?.length > 0 && (
                <div className="bg-white rounded-lg border p-4">
                  <h3 className="font-semibold mb-3">Recent Runs</h3>
                  <div className="space-y-2">
                    {selectedWorkflow.recent_runs.slice(0, 5).map((run) => (
                      <div
                        key={run.run_id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div className="flex items-center gap-2">
                          {getRunStatusIcon(run.status)}
                          <span className="text-sm font-mono">
                            {run.run_id}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>
                            {run.steps_completed}/{run.steps_total} steps
                          </span>
                          <span>
                            {new Date(run.started_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg border p-8 text-center">
              <Workflow className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-700">
                Select a Workflow
              </h3>
              <p className="text-gray-500 mt-2">
                Choose a workflow to view details or create a new one
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Workflow Modal */}
      {showNewWorkflow && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[500px]">
            <h2 className="text-xl font-semibold mb-4">Create New Workflow</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Workflow Name *
                </label>
                <input
                  type="text"
                  value={newWorkflow.name}
                  onChange={(e) =>
                    setNewWorkflow({ ...newWorkflow, name: e.target.value })
                  }
                  className="w-full border rounded-lg p-2"
                  placeholder="e.g., Invoice Overdue Alert"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={newWorkflow.description}
                  onChange={(e) =>
                    setNewWorkflow({
                      ...newWorkflow,
                      description: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg p-2"
                  rows={2}
                  placeholder="What does this workflow do?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Trigger Type
                </label>
                <select
                  value={newWorkflow.trigger.type}
                  onChange={(e) =>
                    setNewWorkflow({
                      ...newWorkflow,
                      trigger: { ...newWorkflow.trigger, type: e.target.value },
                    })
                  }
                  className="w-full border rounded-lg p-2"
                >
                  <option value="manual">Manual (Run on demand)</option>
                  <option value="event">Event (When something happens)</option>
                  <option value="schedule">Schedule (Cron job)</option>
                </select>
              </div>
              {newWorkflow.trigger.type === "event" && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Event Type
                  </label>
                  <select
                    value={newWorkflow.trigger.event_type}
                    onChange={(e) =>
                      setNewWorkflow({
                        ...newWorkflow,
                        trigger: {
                          ...newWorkflow.trigger,
                          event_type: e.target.value,
                        },
                      })
                    }
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="">Select event...</option>
                    <option value="invoice_overdue">Invoice Overdue</option>
                    <option value="payment_received">Payment Received</option>
                    <option value="lead_created">New Lead Created</option>
                    <option value="contract_expiring">Contract Expiring</option>
                    <option value="task_completed">Task Completed</option>
                  </select>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-3 rounded-lg mt-4 text-sm text-gray-600">
              <p>
                💡 Tip: Create a basic workflow first, then add steps using a
                template or the visual editor.
              </p>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={createWorkflow}
                className="flex-1 px-4 py-2 bg-[#033F99] text-white rounded-lg hover:bg-[#022d6e]"
              >
                Create
              </button>
              <button
                onClick={() => setShowNewWorkflow(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Runs History Modal */}
      {showRuns && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[600px] max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Workflow Runs</h2>
              <button
                onClick={() => setShowRuns(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {runs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No runs yet</p>
            ) : (
              <div className="space-y-3">
                {runs.map((run) => (
                  <div key={run.run_id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getRunStatusIcon(run.status)}
                        <span className="font-mono text-sm">{run.run_id}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${run.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : run.status === "failed"
                                ? "bg-red-100 text-red-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                        >
                          {run.status}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(run.started_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <span>Trigger: {run.trigger_type}</span>
                      <span className="mx-2">•</span>
                      <span>
                        Steps: {run.steps_completed}/{run.steps_total}
                      </span>
                      {run.error && (
                        <div className="mt-1 text-red-600">
                          Error: {run.error}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Visual Workflow Editor Modal */}
      {showVisualEditor && selectedWorkflow && (
        <VisualWorkflowEditor
          workflow={selectedWorkflow}
          onSave={handleVisualEditorSave}
          onCancel={() => setShowVisualEditor(false)}
        />
      )}
    </div>
  );
};

export default WorkflowBuilder;
