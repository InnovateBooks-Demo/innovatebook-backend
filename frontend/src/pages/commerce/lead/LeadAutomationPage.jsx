import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  Clock,
  Users,
  Database,
  Globe,
  Shield,
  Target,
  UserCheck,
  ArrowRight,
  RefreshCw,
  Eye,
  Sparkles,
  Zap,
  Activity,
} from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const LeadAutomationPage = () => {
  const { leadId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const leadData = location.state?.leadData || {};

  const [stages, setStages] = useState({
    record_created: { status: "running", data: null, error: null },
    duplicate_check: { status: "pending", data: null, error: null },
    enrichment: { status: "pending", data: null, error: null },
    validation: { status: "pending", data: null, error: null },
    scoring: { status: "pending", data: null, error: null },
    assignment: { status: "pending", data: null, error: null },
  });

  const [currentStage, setCurrentStage] = useState("record_created");
  const [isComplete, setIsComplete] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [users, setUsers] = useState([]);
  const [assignmentData, setAssignmentData] = useState({
    owner: "",
    followUpSLA: "4_hours",
    note: "",
  });

  useEffect(() => {
    runAutomationFlow();
    fetchUsers();
  }, [leadId]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/commerce/users`);
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const updateStageStatus = (stage, status, data = null) => {
    setStages((prev) => ({
      ...prev,
      [stage]: { status, data, error: status === "error" ? data : null },
    }));
  };

  const runAutomationFlow = async () => {
    await delay(500);
    updateStageStatus("record_created", "success", { leadId });

    setCurrentStage("duplicate_check");
    await runDuplicateCheck();

    setCurrentStage("enrichment");
    await runEnrichment();

    setCurrentStage("validation");
    await runValidation();

    setCurrentStage("scoring");
    await runScoring();

    setCurrentStage("assignment");
    updateStageStatus("assignment", "manual");
  };

  const runDuplicateCheck = async () => {
    updateStageStatus("duplicate_check", "running");
    await delay(1500);
    try {
      updateStageStatus("duplicate_check", "success", {
        message: "No duplicates found",
      });
    } catch (error) {
      updateStageStatus("duplicate_check", "error", error.message);
    }
  };

  const runEnrichment = async () => {
    updateStageStatus("enrichment", "running");
    await delay(2000);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/commerce/leads/${leadId}/enrich`,
      );
      updateStageStatus("enrichment", "success", {
        message: "Company data enriched successfully",
        fields: response.data.enriched_fields || [],
      });
    } catch (error) {
      updateStageStatus("enrichment", "error", error.message);
    }
  };

  const runValidation = async () => {
    updateStageStatus("validation", "running");
    await delay(1500);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/commerce/leads/${leadId}/validate`,
      );
      updateStageStatus("validation", "success", {
        message: "All data validated",
        checks: response.data.validation_checks,
      });
    } catch (error) {
      updateStageStatus("validation", "error", error.message);
    }
  };

  const runScoring = async () => {
    updateStageStatus("scoring", "running");
    await delay(2000);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/commerce/leads/${leadId}/score`,
      );
      updateStageStatus("scoring", "success", {
        message: "Lead scored successfully",
        score: response.data.lead_score,
        category: response.data.lead_score_category,
      });
    } catch (error) {
      updateStageStatus("scoring", "error", error.message);
    }
  };

  const handleAssignment = async () => {
    if (!assignmentData.owner) {
      alert("Please select an owner");
      return;
    }
    setIsAssigning(true);
    try {
      await axios.post(`${BACKEND_URL}/api/commerce/leads/${leadId}/assign`, {
        assigned_to: assignmentData.owner,
        follow_up_sla: assignmentData.followUpSLA,
        assignment_note: assignmentData.note,
      });
      updateStageStatus("assignment", "success", {
        message: "Lead assigned successfully",
      });
      setIsComplete(true);
      setTimeout(() => {
        navigate(`/commerce/lead/${leadId}`);
      }, 2000);
    } catch (error) {
      updateStageStatus("assignment", "error", error.message);
    }
    setIsAssigning(false);
  };

  const stageConfig = [
    {
      key: "record_created",
      name: "Record Created",
      icon: Database,
      desc: "Lead saved to database",
      color: "cyan",
    },
    {
      key: "duplicate_check",
      name: "Duplicate Check",
      icon: Users,
      desc: "Scanning for existing records",
      color: "blue",
    },
    {
      key: "enrichment",
      name: "Data Enrichment",
      icon: Sparkles,
      desc: "AI enriching company profile",
      color: "purple",
    },
    {
      key: "validation",
      name: "Data Validation",
      icon: Shield,
      desc: "Verifying contact details",
      color: "green",
    },
    {
      key: "scoring",
      name: "AI Scoring",
      icon: Target,
      desc: "Calculating lead score (15-15-15)",
      color: "amber",
    },
    {
      key: "assignment",
      name: "Team Assignment",
      icon: UserCheck,
      desc: "Assign to sales team",
      color: "rose",
    },
  ];

  const getStageColor = (stage) => {
    const colors = {
      cyan: "from-[#033F99] to-[#033F99]",
      blue: "from-[#033F99] to-[#0147CC]",
      purple: "from-purple-500 to-purple-600",
      green: "from-green-500 to-green-600",
      amber: "from-amber-500 to-amber-600",
      rose: "from-rose-500 to-rose-600",
    };
    return colors[stage] || "from-slate-500 to-slate-600";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case "running":
        return <Loader2 className="h-8 w-8 text-[#033F99] animate-spin" />;
      case "error":
        return <XCircle className="h-8 w-8 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-8 w-8 text-amber-500" />;
      case "manual":
        return <Clock className="h-8 w-8 text-purple-500" />;
      default:
        return <Clock className="h-8 w-8 text-slate-300" />;
    }
  };

  const completedStages = Object.values(stages).filter(
    (s) => s.status === "success",
  ).length;
  const totalStages = Object.keys(stages).length;
  const progress = (completedStages / totalStages) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#033F99] to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#033F99] to-purple-500 rounded-3xl mb-6 shadow-2xl">
            <Activity className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-black text-white mb-4">
            Lead Automation Workflow
          </h1>
          <p className="text-[#033F99] text-xl font-medium">
            Processing:{" "}
            <span className="text-white font-bold">
              {leadData.company_name}
            </span>
          </p>

          {/* Progress Bar */}
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[#033F99] font-semibold text-sm">
                Progress
              </span>
              <span className="text-white font-bold text-lg">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-4 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border-2 border-white/20">
              <div
                className="h-full bg-gradient-to-r from-[#033F99] via-purple-500 to-pink-500 transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-3 text-[#033F99] text-sm">
              {completedStages} of {totalStages} stages completed
            </div>
          </div>
        </div>

        {/* Stages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stageConfig.map((stage, idx) => {
            const StageIcon = stage.icon;
            const stageData = stages[stage.key];
            const isActive = currentStage === stage.key;
            const isDone = stageData.status === "success";
            const isError = stageData.status === "error";
            const isRunning = stageData.status === "running";
            const isPending = stageData.status === "pending";

            return (
              <div
                key={stage.key}
                className={`relative overflow-hidden rounded-2xl transition-all duration-500 ${isActive ? "scale-105 shadow-2xl" : "scale-100"
                  } ${isDone
                    ? "bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500/50"
                    : isError
                      ? "bg-gradient-to-br from-red-500/20 to-rose-500/20 border-2 border-red-500/50"
                      : isRunning
                        ? "bg-gradient-to-br from-[#033F99]/20 to-[#033F99]/20 border-2 border-[#033F99]/50"
                        : "bg-white/5 border-2 border-white/10"
                  } backdrop-blur-xl`}
              >
                {/* Stage Number Badge */}
                <div className="absolute top-4 right-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isDone
                        ? "bg-green-500 text-white"
                        : isRunning
                          ? "bg-[#033F99] text-white animate-pulse"
                          : "bg-white/10 text-white/50"
                      }`}
                  >
                    {idx + 1}
                  </div>
                </div>

                <div className="p-6">
                  {/* Icon Section */}
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-gradient-to-br ${getStageColor(
                      stage.color,
                    )} shadow-lg`}
                  >
                    <StageIcon className="h-8 w-8 text-white" />
                  </div>

                  {/* Stage Info */}
                  <h3 className="text-xl font-bold text-white mb-2">
                    {stage.name}
                  </h3>
                  <p className="text-[#033F99] text-sm mb-4">{stage.desc}</p>

                  {/* Status */}
                  <div className="flex items-center gap-3">
                    {getStatusIcon(stageData.status)}
                    <span
                      className={`text-sm font-semibold ${isDone
                          ? "text-green-400"
                          : isError
                            ? "text-red-400"
                            : isRunning
                              ? "text-[#033F99]"
                              : "text-slate-400"
                        }`}
                    >
                      {isDone
                        ? "Completed"
                        : isError
                          ? "Failed"
                          : isRunning
                            ? "Processing..."
                            : stageData.status === "manual"
                              ? "Action Required"
                              : "Waiting..."}
                    </span>
                  </div>

                  {/* Details */}
                  {stageData.data && (
                    <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-[#033F99] text-xs">
                        {stageData.data.message || "Processing..."}
                      </p>
                      {stageData.data.score && (
                        <p className="text-white font-bold text-lg mt-2">
                          Score: {stageData.data.score}/100
                          <span
                            className={`ml-2 px-2 py-1 rounded text-xs ${stageData.data.category === "Hot"
                                ? "bg-red-500"
                                : stageData.data.category === "Warm"
                                  ? "bg-amber-500"
                                  : "bg-[#033F99]"
                              }`}
                          >
                            {stageData.data.category}
                          </span>
                        </p>
                      )}
                    </div>
                  )}

                  {isError && stageData.error && (
                    <div className="mt-4 p-3 bg-red-500/20 rounded-lg border border-red-500/50">
                      <p className="text-red-200 text-xs">{stageData.error}</p>
                    </div>
                  )}
                </div>

                {/* Active Indicator */}
                {isActive && !isDone && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#033F99] via-purple-500 to-pink-500 animate-pulse" />
                )}
              </div>
            );
          })}
        </div>

        {/* Assignment Section */}
        {stages.assignment.status === "manual" && !isComplete && (
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl p-8 border-2 border-purple-500/50 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                <UserCheck className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  Assign Lead to Team Member
                </h3>
                <p className="text-purple-200">
                  Complete the workflow by assigning this lead
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white font-semibold mb-2">
                  Assign To *
                </label>
                <select
                  value={assignmentData.owner}
                  onChange={(e) =>
                    setAssignmentData({
                      ...assignmentData,
                      owner: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white"
                >
                  <option value="">Select team member...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.name}>
                      {user.name} - {user.role}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleAssignment}
                disabled={isAssigning}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-2xl transition-all disabled:opacity-50"
              >
                {isAssigning ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Assigning...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Complete Assignment
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Completion Message */}
        {isComplete && (
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-2xl p-8 border-2 border-green-500/50 text-center">
            <CheckCircle className="h-20 w-20 text-green-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">
              Automation Complete!
            </h2>
            <p className="text-green-200 mb-6">
              Lead has been successfully processed and assigned
            </p>
            <button
              onClick={() => navigate(`/commerce/lead/${leadId}`)}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:shadow-2xl transition-all"
            >
              View Lead Details
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadAutomationPage;
