import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit2,
  Trash2,
  CheckCircle,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Activity,
  TrendingUp,
  AlertCircle,
  Clock,
  Target,
  Sparkles,
  FileText,
  Calendar,
  Users,
  DollarSign,
  Shield,
  Award,
  GitBranch,
  Eye,
  Play,
} from "lucide-react";
import axios from "axios";
import {
  PageWrapper,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  OutlineButton,
  ContentCard,
  StatusBadge,
  LoadingSpinner,
  InfoBox,
} from "../CommerceDesignSystem";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const LeadDetailSOP = () => {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [auditTrail, setAuditTrail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchLeadDetail();
    fetchAuditTrail();
  }, [leadId]);

  const fetchLeadDetail = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BACKEND_URL}/api/commerce/leads/${leadId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setLead(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch lead:", error);
      setLoading(false);
    }
  };

  const fetchAuditTrail = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BACKEND_URL}/api/commerce/leads/sop/audit/${leadId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setAuditTrail(response.data);
    } catch (error) {
      console.error("Failed to fetch audit trail:", error);
    }
  };

  const executeSOP = async (sopStage) => {
    setProcessing(true);
    try {
      const token = localStorage.getItem("token");
      let response;

      if (sopStage === "approve") {
        response = await axios.post(
          `${BACKEND_URL}/api/commerce/leads/sop/approve/${leadId}?approved_by=demo_user&remarks=Approved via UI`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } else if (sopStage === "convert") {
        response = await axios.post(
          `${BACKEND_URL}/api/commerce/leads/sop/convert/${leadId}?create_evaluation=true`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } else {
        response = await axios.post(
          `${BACKEND_URL}/api/commerce/leads/sop/${sopStage}/${leadId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }

      if (response.data.success) {
        alert(`✅ ${sopStage.toUpperCase()} completed successfully!`);
        fetchLeadDetail();
        fetchAuditTrail();
      } else {
        alert(`⚠️ ${response.data.message}`);
      }
    } catch (error) {
      console.error(`Failed to execute ${sopStage}:`, error);
      alert(`❌ Failed to execute ${sopStage}`);
    } finally {
      setProcessing(false);
    }
  };

  const runDuplicateCheck = async () => {
    setProcessing(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${BACKEND_URL}/api/commerce/leads/sop/duplicate-check/${leadId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        const result = response.data.duplicate_result;
        if (result.is_duplicate) {
          alert(
            `⚠️ Duplicate detected! Similarity: ${result.similarity_score}%\nMatched IDs: ${result.duplicate_lead_ids.join(", ")}`,
          );
        } else {
          alert("✅ No duplicates found");
        }
        fetchLeadDetail();
      }
    } catch (error) {
      console.error("Duplicate check failed:", error);
      alert("❌ Duplicate check failed");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!lead)
    return (
      <PageWrapper>
        <InfoBox type="error">Lead not found</InfoBox>
      </PageWrapper>
    );

  // SOP Stages Configuration
  const sopStages = [
    { id: "Lead_Intake_SOP", name: "Intake", icon: FileText, action: "intake" },
    { id: "Lead_Enrich_SOP", name: "Enrich", icon: Sparkles, action: "enrich" },
    {
      id: "Lead_Qualify_SOP",
      name: "Qualify",
      icon: Target,
      action: "qualify",
    },
    {
      id: "Lead_Score_SOP",
      name: "AI Score",
      icon: TrendingUp,
      action: "score",
    },
    {
      id: "Lead_Approve_SOP",
      name: "Approve",
      icon: CheckCircle,
      action: "approve",
    },
    {
      id: "Lead_Convert_SOP",
      name: "Convert",
      icon: GitBranch,
      action: "convert",
    },
  ];

  const getStageStatus = (stageId) => {
    return lead.sop_completion_status?.[stageId] || false;
  };

  const getCurrentStageIndex = () => {
    const currentStage = lead.current_sop_stage;
    return sopStages.findIndex((s) => s.id === currentStage);
  };

  const aiScore = lead.ai_lead_score || lead.lead_score || 0;
  const aiGrade = lead.credit_grade || "C";
  const aiReasoning = lead.ai_score_reasoning || "AI scoring pending";

  return (
    <PageWrapper>
      <PageHeader
        title={lead.business_name}
        subtitle={
          <div className="flex items-center gap-4">
            <span className="text-slate-600">{lead.lead_id}</span>
            <StatusBadge status={lead.lead_status}>
              {lead.lead_status}
            </StatusBadge>
            <span className="text-xs px-2 py-1 rounded bg-[#C4D9F4] text-[#033F99] font-medium">
              {lead.current_sop_stage?.replace("Lead_", "").replace("_SOP", "")}
            </span>
          </div>
        }
        action={
          <div className="flex items-center gap-3">
            <SecondaryButton
              icon={ArrowLeft}
              onClick={() => navigate("/commerce/lead")}
            >
              Back
            </SecondaryButton>
            <PrimaryButton
              icon={Edit2}
              onClick={() => navigate(`/commerce/lead/${leadId}/edit`)}
            >
              Edit
            </PrimaryButton>
          </div>
        }
      />

      {/* SOP Stage Progress Tracker */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-[#033F99]" />
            SOP Workflow Progress
          </h2>
          <span className="text-sm text-slate-500">
            {sopStages.filter((s) => getStageStatus(s.id)).length} of{" "}
            {sopStages.length} completed
          </span>
        </div>

        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-8 left-0 right-0 h-1 bg-slate-200 -z-10"></div>
          <div
            className="absolute top-8 left-0 h-1 bg-gradient-to-r from-[#033F99] to-emerald-500 -z-10 transition-all duration-500"
            style={{
              width: `${(sopStages.filter((s) => getStageStatus(s.id)).length / sopStages.length) * 100}%`,
            }}
          ></div>

          {/* Stage Nodes */}
          <div className="flex justify-between items-start">
            {sopStages.map((stage, index) => {
              const isCompleted = getStageStatus(stage.id);
              const isCurrent = getCurrentStageIndex() === index;
              const Icon = stage.icon;

              return (
                <div
                  key={stage.id}
                  className="flex flex-col items-center"
                  style={{ width: "16.66%" }}
                >
                  <div
                    className={`
                    w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-all duration-300
                    ${isCompleted
                        ? "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/50"
                        : isCurrent
                          ? "bg-gradient-to-br from-[#033F99] to-[#033F99] shadow-lg shadow-[#033F99]/50 ring-4 ring-[#6B9FE6]"
                          : "bg-slate-200"
                      }
                  `}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-8 h-8 text-white" />
                    ) : (
                      <Icon
                        className={`w-7 h-7 ${isCurrent ? "text-white" : "text-slate-400"}`}
                      />
                    )}
                  </div>
                  <div className="text-center">
                    <p
                      className={`text-sm font-semibold mb-1 ${isCompleted || isCurrent ? "text-slate-900" : "text-slate-500"}`}
                    >
                      {stage.name}
                    </p>
                    {!isCompleted && (
                      <button
                        onClick={() => executeSOP(stage.action)}
                        disabled={
                          processing ||
                          (index > 0 &&
                            !getStageStatus(sopStages[index - 1].id))
                        }
                        className={`
                          text-xs px-3 py-1 rounded-full font-medium transition-all
                          ${processing ||
                            (index > 0 &&
                              !getStageStatus(sopStages[index - 1].id))
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : "bg-[#C4D9F4] text-[#033F99] hover:bg-[#6B9FE6]"
                          }
                        `}
                      >
                        {processing ? "Processing..." : "Run"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 mb-6">
        {[
          { id: "overview", label: "Overview", icon: Eye },
          { id: "ai-insights", label: "AI Insights", icon: Sparkles },
          { id: "enrichment", label: "Enrichment", icon: Target },
          { id: "audit", label: "Audit Trail", icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-6 py-3 font-medium transition-all
                ${activeTab === tab.id
                  ? "text-[#033F99] border-b-2 border-[#033F99]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Business & Contact */}
          <div className="lg:col-span-2 space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-lg p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded">
                    AI Score
                  </span>
                </div>
                <p className="text-3xl font-bold">{Math.round(aiScore)}</p>
                <p className="text-sm text-[#C4D9F4]">Grade: {aiGrade}</p>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs text-slate-500">Compliance</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {Math.round(lead.compliance_score || 0)}%
                </p>
                <p className="text-xs text-slate-500">{lead.kyc_status}</p>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <Award className="w-5 h-5 text-amber-600" />
                  <span className="text-xs text-slate-500">Credit</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {Math.round(lead.credit_score_internal || 0)}
                </p>
                <p className="text-xs text-slate-500">
                  Grade {lead.credit_grade}
                </p>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-5 h-5 text-violet-600" />
                  <span className="text-xs text-slate-500">Deal Value</span>
                </div>
                <p className="text-xl font-bold text-slate-900">
                  ₹
                  {(lead.expected_deal_value || 0).toLocaleString("en-IN", {
                    maximumFractionDigits: 0,
                  })}
                </p>
                <p className="text-xs text-slate-500">
                  {lead.timeline_to_close || 0} days
                </p>
              </div>
            </div>

            {/* Business Information */}
            <ContentCard
              title={
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#033F99]" />
                  Business Information
                </div>
              }
            >
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <InfoItem label="Company Name" value={lead.business_name} />
                <InfoItem label="Trade Name" value={lead.trade_name || "N/A"} />
                <InfoItem label="Industry" value={lead.industry_type} />
                <InfoItem
                  label="Business Size"
                  value={lead.business_size || "N/A"}
                />
                <InfoItem label="Business Model" value={lead.business_model} />
                <InfoItem
                  label="Employees"
                  value={lead.number_of_employees || "N/A"}
                />
                <InfoItem
                  label="Annual Revenue"
                  value={
                    lead.annual_revenue
                      ? `₹${lead.annual_revenue.toLocaleString("en-IN")}`
                      : "N/A"
                  }
                />
                <InfoItem
                  label="Tax Registration"
                  value={lead.tax_registration_number}
                />
              </div>
              {lead.website_url && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <a
                    href={lead.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#033F99] hover:text-[#033F99] font-medium"
                  >
                    <Globe className="w-4 h-4" />
                    Visit Website
                  </a>
                </div>
              )}
            </ContentCard>

            {/* Contact Information */}
            <ContentCard
              title={
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-[#033F99]" />
                  Contact Information
                </div>
              }
            >
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <InfoItem
                  label="Primary Contact"
                  value={lead.primary_contact_name}
                />
                <InfoItem
                  label="Designation"
                  value={lead.designation || "N/A"}
                />
                <InfoItem
                  label="Email"
                  value={lead.primary_email}
                  icon={Mail}
                />
                <InfoItem
                  label="Phone"
                  value={lead.primary_phone}
                  icon={Phone}
                />
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200">
                <InfoItem
                  label="Address"
                  value={`${lead.office_address}, ${lead.city}, ${lead.state} ${lead.postal_code}`}
                  icon={MapPin}
                />
              </div>
            </ContentCard>
          </div>

          {/* Right Column - Quick Actions & Status */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <ContentCard title="Quick Actions">
              <div className="space-y-3">
                <button
                  onClick={runDuplicateCheck}
                  disabled={processing}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-[#6B9FE6] bg-[#EBF3FC] hover:bg-[#C4D9F4] text-[#033F99] font-medium transition-all"
                >
                  <Users className="w-5 h-5" />
                  Run Duplicate Check
                </button>

                {lead.qualified_to_evaluate_id && (
                  <button
                    onClick={() =>
                      navigate(
                        `/commerce/evaluate/${lead.qualified_to_evaluate_id}`,
                      )
                    }
                    className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium transition-all"
                  >
                    <GitBranch className="w-5 h-5" />
                    View Evaluation
                  </button>
                )}
              </div>
            </ContentCard>

            {/* Duplicate Alert */}
            {lead.duplicate_check_status === "Duplicate_Found" &&
              lead.duplicate_check_result && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-amber-900 mb-2">
                        Duplicate Detected
                      </h3>
                      <p className="text-sm text-amber-800 mb-2">
                        Similarity:{" "}
                        {Math.round(
                          lead.duplicate_check_result.similarity_score || 0,
                        )}
                        %
                      </p>
                      <p className="text-xs text-amber-700">
                        Matched IDs:{" "}
                        {(
                          lead.duplicate_check_result.duplicate_lead_ids || []
                        ).join(", ")}
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {/* Status Info */}
            <ContentCard title="Status Information">
              <div className="space-y-4">
                <InfoItem label="Lead Status" value={lead.lead_status} badge />
                <InfoItem
                  label="Lead Priority"
                  value={lead.lead_priority || "Medium"}
                  badge
                />
                <InfoItem
                  label="Approval Status"
                  value={lead.approval_status}
                  badge
                />
                <InfoItem
                  label="Risk Category"
                  value={lead.risk_category}
                  badge
                />
                <InfoItem label="Lead Source" value={lead.lead_source} />
                <InfoItem
                  label="Capture Channel"
                  value={lead.capture_channel || "N/A"}
                />
              </div>
            </ContentCard>

            {/* Dates */}
            <ContentCard title="Important Dates">
              <div className="space-y-3">
                <InfoItem
                  label="Captured On"
                  value={new Date(lead.capture_date).toLocaleDateString()}
                  icon={Calendar}
                />
                <InfoItem
                  label="Created At"
                  value={new Date(lead.created_at).toLocaleDateString()}
                  icon={Calendar}
                />
                {lead.approval_date && (
                  <InfoItem
                    label="Approved On"
                    value={new Date(lead.approval_date).toLocaleDateString()}
                    icon={Calendar}
                  />
                )}
                {lead.conversion_date && (
                  <InfoItem
                    label="Converted On"
                    value={new Date(lead.conversion_date).toLocaleDateString()}
                    icon={Calendar}
                  />
                )}
              </div>
            </ContentCard>
          </div>
        </div>
      )}

      {activeTab === "ai-insights" && <AIInsightsTab lead={lead} />}

      {activeTab === "enrichment" && <EnrichmentTab lead={lead} />}

      {activeTab === "audit" && <AuditTrailTab auditTrail={auditTrail} />}
    </PageWrapper>
  );
};

// Helper Components
const InfoItem = ({ label, value, icon: Icon, badge }) => (
  <div>
    <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </p>
    {badge ? (
      <span
        className={`
        inline-block px-3 py-1 rounded-full text-sm font-medium
        ${value === "Approved" || value === "Qualified" || value === "Converted"
            ? "bg-emerald-100 text-emerald-700"
            : value === "Pending" || value === "Captured"
              ? "bg-amber-100 text-amber-700"
              : value === "High"
                ? "bg-rose-100 text-rose-700"
                : value === "Low"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-[#C4D9F4] text-[#033F99]"
          }
      `}
      >
        {value}
      </span>
    ) : (
      <p className="text-sm font-semibold text-slate-900">{value}</p>
    )}
  </div>
);

const AIInsightsTab = ({ lead }) => {
  const aiScore = lead.ai_lead_score || lead.lead_score || 0;
  const breakdown = lead.lead_score_breakdown || {};

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* AI Score Visualization */}
      <div className="bg-gradient-to-br from-[#033F99] to-violet-600 rounded-lg p-8 text-white">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-8 h-8" />
          <h2 className="text-2xl font-bold">AI-Powered Score</h2>
        </div>

        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <svg className="w-48 h-48" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="12"
              />
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="white"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${(aiScore / 100) * 565} 565`}
                transform="rotate(-90 100 100)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-6xl font-bold">{Math.round(aiScore)}</p>
              <p className="text-xl">out of 100</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="inline-block px-6 py-2 bg-white/20 rounded-full text-2xl font-bold mb-4">
            Grade: {lead.credit_grade || "C"}
          </div>
          <p className="text-lg text-[#C4D9F4]">
            {lead.risk_category || "Medium"} Risk Profile
          </p>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="space-y-6">
        <ContentCard title="Score Breakdown">
          <div className="space-y-4">
            {Object.entries(breakdown).length > 0 ? (
              Object.entries(breakdown).map(([key, value]) => (
                <div key={key}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700 capitalize">
                      {key.replace(/_/g, " ")}
                    </span>
                    <span className="text-sm font-bold text-[#033F99]">
                      {value}/20
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#033F99] to-violet-500 transition-all duration-500"
                      style={{ width: `${(value / 20) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">
                Run AI scoring to see detailed breakdown
              </p>
            )}
          </div>
        </ContentCard>

        <ContentCard title="AI Reasoning">
          <p className="text-sm text-slate-700 leading-relaxed">
            {lead.ai_score_reasoning ||
              "AI scoring not yet performed. Run the Score SOP stage to generate AI insights."}
          </p>
        </ContentCard>
      </div>
    </div>
  );
};

const EnrichmentTab = ({ lead }) => {
  const enrichment = lead.enrichment_data || {};

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ContentCard title="Enrichment Summary">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <span className="text-sm font-medium text-slate-700">
              Enrichment Status
            </span>
            <StatusBadge status={lead.enrichment_status || "Pending"}>
              {lead.enrichment_status || "Pending"}
            </StatusBadge>
          </div>

          {enrichment.confidence_score && (
            <div className="p-4 bg-[#EBF3FC] rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-white">
                  Confidence Score
                </span>
                <span className="text-lg font-bold text-[#033F99]">
                  {enrichment.confidence_score}%
                </span>
              </div>
              <div className="h-2 bg-[#6B9FE6] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#033F99]"
                  style={{ width: `${enrichment.confidence_score}%` }}
                ></div>
              </div>
            </div>
          )}

          <InfoItem
            label="Enrichment Source"
            value={enrichment.enrichment_source || "N/A"}
          />
          {enrichment.enrichment_date && (
            <InfoItem
              label="Last Updated"
              value={new Date(enrichment.enrichment_date).toLocaleString()}
              icon={Calendar}
            />
          )}
        </div>
      </ContentCard>

      <ContentCard title="Verified Information">
        <div className="space-y-4">
          <InfoItem
            label="Company Size"
            value={enrichment.company_size_verified || "Not verified"}
          />
          <InfoItem
            label="Industry"
            value={enrichment.industry_verified || "Not verified"}
          />
          <InfoItem
            label="Revenue Range"
            value={enrichment.revenue_range_verified || "Not verified"}
          />
          <InfoItem
            label="Employee Count"
            value={enrichment.employee_count_verified || "Not verified"}
          />
          <InfoItem
            label="Website Analysis"
            value={enrichment.website_analysis || "Not analyzed"}
          />
        </div>
      </ContentCard>

      {enrichment.social_media_presence &&
        Object.keys(enrichment.social_media_presence).length > 0 && (
          <ContentCard title="Social Media Presence">
            <div className="space-y-3">
              {Object.entries(enrichment.social_media_presence).map(
                ([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-[#0558CC] hover:bg-[#EBF3FC] transition-all"
                  >
                    <Globe className="w-5 h-5 text-[#033F99]" />
                    <span className="text-sm font-medium text-slate-900 capitalize">
                      {platform}
                    </span>
                  </a>
                ),
              )}
            </div>
          </ContentCard>
        )}

      {enrichment.tech_stack && enrichment.tech_stack.length > 0 && (
        <ContentCard title="Technology Stack">
          <div className="flex flex-wrap gap-2">
            {enrichment.tech_stack.map((tech, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-[#C4D9F4] text-[#033F99] rounded-full text-sm font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </ContentCard>
      )}
    </div>
  );
};

const AuditTrailTab = ({ auditTrail }) => {
  if (!auditTrail) return <LoadingSpinner />;

  const {
    sop_stage_history = [],
    audit_trail = [],
    engagement_activities = [],
  } = auditTrail;

  return (
    <div className="space-y-6">
      {/* SOP Stage History */}
      <ContentCard
        title={
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-[#033F99]" />
            SOP Stage History
          </div>
        }
      >
        <div className="space-y-3">
          {sop_stage_history.length > 0 ? (
            sop_stage_history.map((entry, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#C4D9F4] flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-[#033F99]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-slate-900">
                      {entry.stage?.replace("Lead_", "").replace("_SOP", "")}
                    </h4>
                    <span className="text-xs text-slate-500">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{entry.notes}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    By: {entry.performed_by}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500 text-center py-4">
              No SOP stages completed yet
            </p>
          )}
        </div>
      </ContentCard>

      {/* Audit Trail */}
      <ContentCard
        title={
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#033F99]" />
            Complete Audit Log
          </div>
        }
      >
        <div className="space-y-2">
          {audit_trail.length > 0 ? (
            audit_trail.map((entry, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 border-l-4 border-[#033F99] bg-slate-50 rounded-r-lg"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {entry.action}
                  </p>
                  <p className="text-xs text-slate-600">{entry.details}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">
                    {new Date(entry.timestamp).toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-400">{entry.performed_by}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500 text-center py-4">
              No audit entries yet
            </p>
          )}
        </div>
      </ContentCard>

      {/* Engagement Activities */}
      {engagement_activities.length > 0 && (
        <ContentCard
          title={
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#033F99]" />
              Engagement History
            </div>
          }
        >
          <div className="space-y-3">
            {engagement_activities.map((activity, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-4 bg-gradient-to-r from-violet-50 to-[#EBF3FC] rounded-lg"
              >
                <Activity className="w-5 h-5 text-violet-600 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-900">
                      {activity.activity_type}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(activity.activity_date).toLocaleString()}
                    </span>
                  </div>
                  {activity.notes && (
                    <p className="text-sm text-slate-700 mb-1">
                      {activity.notes}
                    </p>
                  )}
                  {activity.outcome && (
                    <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                      {activity.outcome}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ContentCard>
      )}
    </div>
  );
};

export default LeadDetailSOP;
