import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
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
  ChevronRight,
  ArrowRight,
  RefreshCw,
  Edit3,
} from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const LeadAutomationPopup = ({ leadId, leadData, onClose, onComplete }) => {
  const navigate = useNavigate();
  const [currentStage, setCurrentStage] = useState("record_created");
  const [stages, setStages] = useState({
    record_created: { status: "running", data: null, error: null },
    duplicate_check: { status: "pending", data: null, error: null },
    enrichment: { status: "pending", data: null, error: null },
    validation: { status: "pending", data: null, error: null },
    scoring: { status: "pending", data: null, error: null },
    assignment: { status: "pending", data: null, error: null },
  });
  const [showManualInput, setShowManualInput] = useState(null);
  const [manualData, setManualData] = useState({});
  const [assignmentData, setAssignmentData] = useState({
    owner: "",
    followUpSLA: "4_hours",
    note: "",
  });
  const [isComplete, setIsComplete] = useState(false);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    runAutomationFlow();
  }, [leadId]);

  const runAutomationFlow = async () => {
    // Stage 1: Record Created
    await updateStageStatus("record_created", "running");
    await delay(500);
    await updateStageStatus("record_created", "success", { leadId });

    // Stage 2: Duplicate Check
    await runDuplicateCheck();

    // Stage 3: Enrichment
    await runEnrichment();

    // Stage 4: Validation
    await runValidation();

    // Stage 5: Scoring
    await runScoring();

    // Stage 6: Assignment (Manual - wait for user)
    setCurrentStage("assignment");
    await updateStageStatus("assignment", "manual");
  };

  const runDuplicateCheck = async () => {
    setCurrentStage("duplicate_check");
    await updateStageStatus("duplicate_check", "running");
    await delay(1500);

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/commerce/lead/duplicate-check`,
        {
          company_name: leadData.company_name,
          email: leadData.email,
          phone: leadData.phone,
        },
      );

      if (response.data.duplicates && response.data.duplicates.length > 0) {
        await updateStageStatus("duplicate_check", "warning", {
          message: "Possible duplicates found",
          duplicates: response.data.duplicates,
        });
      } else {
        await updateStageStatus("duplicate_check", "success", {
          message: "No duplicates found",
        });
      }
    } catch (error) {
      await updateStageStatus("duplicate_check", "error", {
        message: "Duplicate check API unavailable",
      });
    }
  };

  const runEnrichment = async () => {
    setCurrentStage("enrichment");
    await updateStageStatus("enrichment", "running");
    await delay(2000);

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/commerce/lead/${leadId}/enrich`,
      );

      if (response.data.enrichment_status === "Completed") {
        await updateStageStatus("enrichment", "success", {
          message: "Company details fetched successfully",
          fields: response.data.enriched_fields,
        });
      } else if (response.data.enrichment_status === "Partial") {
        await updateStageStatus("enrichment", "warning", {
          message: "Some data missing",
          fields: response.data.enriched_fields,
        });
      }
    } catch (error) {
      await updateStageStatus("enrichment", "error", {
        message: "Could not connect to registry",
      });
    }
  };

  const runValidation = async () => {
    setCurrentStage("validation");
    await updateStageStatus("validation", "running");
    await delay(1500);

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/commerce/lead/${leadId}/validate`,
      );

      const results = response.data.validation_results || {};
      const hasFailures = Object.values(results).some((r) => r === "Failed");
      const hasWarnings = Object.values(results).some((r) => r === "Warning");

      if (hasFailures) {
        await updateStageStatus("validation", "error", {
          message: "Some validations failed",
          results,
        });
      } else if (hasWarnings) {
        await updateStageStatus("validation", "warning", {
          message: "Validation completed with warnings",
          results,
        });
      } else {
        await updateStageStatus("validation", "success", {
          message: "All validations passed",
          results,
        });
      }
    } catch (error) {
      await updateStageStatus("validation", "error", {
        message: "Validation service unavailable",
      });
    }
  };

  const runScoring = async () => {
    setCurrentStage("scoring");
    await updateStageStatus("scoring", "running");
    await delay(1500);

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/commerce/lead/${leadId}/score`,
      );

      await updateStageStatus("scoring", "success", {
        fit_score: response.data.fit_score,
        intent_score: response.data.intent_score,
        potential_score: response.data.potential_score,
        lead_score: response.data.lead_score,
        score_label: response.data.score_label,
      });
    } catch (error) {
      await updateStageStatus("scoring", "error", {
        message: "Scoring engine unavailable",
      });
    }
  };

  const updateStageStatus = async (stage, status, data = null) => {
    setStages((prev) => ({
      ...prev,
      [stage]: { status, data, error: status === "error" ? data : null },
    }));
    await delay(300);
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleManualOverride = (stage) => {
    setShowManualInput(stage);
  };

  const submitManualData = async (stage) => {
    await updateStageStatus(stage, "success", {
      manual: true,
      ...manualData[stage],
    });
    setShowManualInput(null);
    setManualData({});
  };

  const handleAssignment = async () => {
    if (!assignmentData.owner) {
      alert("Please select an owner");
      return;
    }

    try {
      await axios.patch(`${BACKEND_URL}/api/commerce/lead/${leadId}`, {
        assigned_to: assignmentData.owner,
        follow_up_sla: assignmentData.followUpSLA,
        assignment_note: assignmentData.note,
      });

      await updateStageStatus("assignment", "success", {
        owner: assignmentData.owner,
        sla: assignmentData.followUpSLA,
      });

      setIsComplete(true);
      setCanClose(true);
    } catch (error) {
      alert("Failed to assign lead");
    }
  };

  const getStageIcon = (status) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-emerald-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "running":
        return <Loader2 className="h-5 w-5 text-[#033F99] animate-spin" />;
      case "manual":
        return <Clock className="h-5 w-5 text-purple-600" />;
      default:
        return <Clock className="h-5 w-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "border-emerald-200 bg-emerald-50";
      case "warning":
        return "border-amber-200 bg-amber-50";
      case "error":
        return "border-red-200 bg-red-50";
      case "running":
        return "border-[#033F99] bg-[#C4D9F4]";
      case "manual":
        return "border-purple-200 bg-purple-50";
      default:
        return "border-slate-200 bg-slate-50";
    }
  };

  const stageConfig = [
    {
      key: "record_created",
      name: "Record Created",
      icon: Database,
      desc: "Basic info saved successfully",
    },
    {
      key: "duplicate_check",
      name: "Duplicate Check",
      icon: Users,
      desc: "Checking for existing company",
    },
    {
      key: "enrichment",
      name: "Enrichment",
      icon: Globe,
      desc: "Fetching company data",
    },
    {
      key: "validation",
      name: "Validation",
      icon: Shield,
      desc: "Checking email, phone, registry",
    },
    {
      key: "scoring",
      name: "Scoring",
      icon: Target,
      desc: "Calculating Lead Score",
    },
    {
      key: "assignment",
      name: "Assignment",
      icon: UserCheck,
      desc: "Assigning lead to user/team",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#033F99] to-[#033F99] px-8 py-6 flex items-center justify-between">
          <div>
            <h2
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "Poppins" }}
            >
              {isComplete
                ? "✅ Lead Processing Complete"
                : "⚙️ Lead Processing Status"}
            </h2>
            <p className="text-[#033F99] mt-1 font-medium">
              {isComplete
                ? "All SOP steps completed successfully"
                : "Please wait while automations run"}
            </p>
          </div>
          {canClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Progress Stages */}
          <div className="space-y-4">
            {stageConfig.map((stage, idx) => {
              const StageIcon = stage.icon;
              const stageData = stages[stage.key];

              return (
                <div
                  key={stage.key}
                  className={`border-2 rounded-2xl p-5 transition-all duration-300 ${getStatusColor(stageData.status)}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div
                        className={`p-3 rounded-xl ${stageData.status === "success"
                            ? "bg-emerald-600"
                            : stageData.status === "warning"
                              ? "bg-amber-600"
                              : stageData.status === "error"
                                ? "bg-red-600"
                                : stageData.status === "running"
                                  ? "bg-[#033F99]"
                                  : stageData.status === "manual"
                                    ? "bg-purple-600"
                                    : "bg-slate-400"
                          }`}
                      >
                        <StageIcon className="h-6 w-6 text-white" />
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-lg text-slate-900">
                            {stage.name}
                          </h3>
                          <p className="text-sm text-slate-600">{stage.desc}</p>
                        </div>
                        {getStageIcon(stageData.status)}
                      </div>

                      {/* Stage-specific content */}
                      {stageData.status === "success" && stageData.data && (
                        <div className="mt-3 p-4 bg-white rounded-xl border border-emerald-200">
                          {stage.key === "record_created" && (
                            <p className="text-sm text-emerald-700 font-semibold">
                              Lead ID created successfully: {leadId}
                            </p>
                          )}
                          {stage.key === "duplicate_check" && (
                            <p className="text-sm text-emerald-700 font-semibold">
                              {stageData.data.message}
                            </p>
                          )}
                          {stage.key === "enrichment" && (
                            <div>
                              <p className="text-sm text-emerald-700 font-semibold mb-2">
                                {stageData.data.message}
                              </p>
                              {stageData.data.fields && (
                                <div className="text-xs text-slate-600">
                                  <span className="font-medium">
                                    Fields updated:{" "}
                                  </span>
                                  {Object.keys(stageData.data.fields).join(
                                    ", ",
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                          {stage.key === "validation" && (
                            <div className="space-y-1">
                              <p className="text-sm text-emerald-700 font-semibold">
                                {stageData.data.message}
                              </p>
                              {stageData.data.results && (
                                <div className="text-xs text-slate-600">
                                  {Object.entries(stageData.data.results).map(
                                    ([key, value]) => (
                                      <div
                                        key={key}
                                        className="flex items-center gap-2"
                                      >
                                        {value === "Verified" && (
                                          <CheckCircle className="h-3 w-3 text-emerald-600" />
                                        )}
                                        {value === "Warning" && (
                                          <AlertTriangle className="h-3 w-3 text-amber-600" />
                                        )}
                                        <span>
                                          {key}: {value}
                                        </span>
                                      </div>
                                    ),
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                          {stage.key === "scoring" && (
                            <div className="grid grid-cols-2 gap-3">
                              <div className="text-center p-3 bg-[#C4D9F4] rounded-lg">
                                <p className="text-xs text-slate-600 font-medium">
                                  Fit Score
                                </p>
                                <p className="text-2xl font-black text-[#033F99]">
                                  {stageData.data.fit_score}
                                </p>
                              </div>
                              <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <p className="text-xs text-slate-600 font-medium">
                                  Intent Score
                                </p>
                                <p className="text-2xl font-black text-blue-700">
                                  {stageData.data.intent_score}
                                </p>
                              </div>
                              <div className="text-center p-3 bg-purple-50 rounded-lg">
                                <p className="text-xs text-slate-600 font-medium">
                                  Potential Score
                                </p>
                                <p className="text-2xl font-black text-purple-700">
                                  {stageData.data.potential_score}
                                </p>
                              </div>
                              <div className="text-center p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
                                <p className="text-xs text-white font-medium">
                                  Overall Score
                                </p>
                                <p className="text-2xl font-black text-white">
                                  {stageData.data.lead_score}
                                </p>
                                <p className="text-xs text-white font-semibold mt-1">
                                  {stageData.data.score_label}
                                </p>
                              </div>
                            </div>
                          )}
                          {stage.key === "assignment" && (
                            <p className="text-sm text-emerald-700 font-semibold">
                              Lead assigned to {stageData.data.owner} • SLA:{" "}
                              {stageData.data.sla}
                            </p>
                          )}
                        </div>
                      )}

                      {stageData.status === "warning" && (
                        <div className="mt-3 p-4 bg-white rounded-xl border border-amber-200">
                          <p className="text-sm text-amber-700 font-semibold mb-3">
                            {stageData.data?.message}
                          </p>
                          <button
                            onClick={() => handleManualOverride(stage.key)}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors"
                          >
                            <Edit3 className="h-4 w-4" />
                            Complete Manually
                          </button>
                        </div>
                      )}

                      {stageData.status === "error" && (
                        <div className="mt-3 p-4 bg-white rounded-xl border border-red-200">
                          <p className="text-sm text-red-700 font-semibold mb-3">
                            {stageData.data?.message}
                          </p>
                          <button
                            onClick={() => handleManualOverride(stage.key)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                          >
                            <Edit3 className="h-4 w-4" />
                            Fill Manually
                          </button>
                        </div>
                      )}

                      {stageData.status === "manual" &&
                        stage.key === "assignment" &&
                        !stageData.data && (
                          <div className="mt-3 p-4 bg-white rounded-xl border border-purple-200">
                            <p className="text-sm text-purple-700 font-semibold mb-4">
                              No owner assigned yet. Please assign this lead to
                              a user/team before closing.
                            </p>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                  Owner *
                                </label>
                                <select
                                  value={assignmentData.owner}
                                  onChange={(e) =>
                                    setAssignmentData({
                                      ...assignmentData,
                                      owner: e.target.value,
                                    })
                                  }
                                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                                >
                                  <option value="">Select Owner</option>
                                  <option value="Rajesh Kumar">
                                    Rajesh Kumar
                                  </option>
                                  <option value="Priya Sharma">
                                    Priya Sharma
                                  </option>
                                  <option value="Sales Team">Sales Team</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                  Follow-up SLA
                                </label>
                                <select
                                  value={assignmentData.followUpSLA}
                                  onChange={(e) =>
                                    setAssignmentData({
                                      ...assignmentData,
                                      followUpSLA: e.target.value,
                                    })
                                  }
                                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                                >
                                  <option value="4_hours">
                                    Within 4 hours
                                  </option>
                                  <option value="1_day">Within 1 day</option>
                                  <option value="2_days">Within 2 days</option>
                                  <option value="1_week">Within 1 week</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                  Assignment Note (Optional)
                                </label>
                                <textarea
                                  value={assignmentData.note}
                                  onChange={(e) =>
                                    setAssignmentData({
                                      ...assignmentData,
                                      note: e.target.value,
                                    })
                                  }
                                  rows={3}
                                  placeholder="e.g., Assigning to Rajesh for follow-up demo"
                                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                                />
                              </div>
                              <button
                                onClick={handleAssignment}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-xl shadow-lg transition-all"
                              >
                                <UserCheck className="h-5 w-5" />
                                Assign Now
                              </button>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Completion Summary */}
          {isComplete && (
            <div className="mt-8 p-6 bg-gradient-to-br from-emerald-50 to-[#C4D9F4] rounded-2xl border-2 border-emerald-200">
              <h3 className="text-xl font-bold text-emerald-900 mb-4">
                📊 Processing Summary
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white rounded-xl">
                  <p className="text-xs text-slate-600 font-medium">
                    Duplicate Check
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {stages.duplicate_check.data?.message || "Completed"}
                  </p>
                </div>
                <div className="p-3 bg-white rounded-xl">
                  <p className="text-xs text-slate-600 font-medium">
                    Enrichment
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {stages.enrichment.data?.message || "Completed"}
                  </p>
                </div>
                <div className="p-3 bg-white rounded-xl">
                  <p className="text-xs text-slate-600 font-medium">
                    Validation
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {stages.validation.data?.message || "Verified"}
                  </p>
                </div>
                <div className="p-3 bg-white rounded-xl">
                  <p className="text-xs text-slate-600 font-medium">Scoring</p>
                  <p className="text-sm font-bold text-slate-900">
                    {stages.scoring.data?.lead_score} –{" "}
                    {stages.scoring.data?.score_label}
                  </p>
                </div>
                <div className="p-3 bg-white rounded-xl col-span-2">
                  <p className="text-xs text-slate-600 font-medium">
                    Assigned To
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {stages.assignment.data?.owner} • Next follow-up:{" "}
                    {stages.assignment.data?.sla}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {isComplete && (
          <div className="border-t-2 border-slate-200 px-8 py-6 bg-slate-50 flex gap-4">
            <button
              onClick={() => navigate(`/commerce/lead/${leadId}`)}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#033F99] to-[#033F99] hover:from-[#033F99] hover:to-[#033F99] text-white font-bold rounded-xl shadow-lg transition-all"
            >
              Go to Lead Detail Page
              <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => {
                onClose();
                navigate("/commerce/lead/create");
              }}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white hover:bg-slate-100 border-2 border-[#033F99] text-[#033F99] font-bold rounded-xl transition-all"
            >
              <RefreshCw className="h-5 w-5" />
              Add Another Lead
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadAutomationPopup;
