import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import {
  ArrowLeft,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Target,
  Award,
  ChevronRight,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const EvaluateDetail = () => {
  const { evaluationId } = useParams();
  const navigate = useNavigate();
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvaluationDetail();
  }, [evaluationId]);

  const fetchEvaluationDetail = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/commerce/evaluate/${evaluationId}`,
      );
      setEvaluation(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch evaluation:", error);
      toast.error("Failed to load evaluation details");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this evaluation?"))
      return;

    try {
      await axios.delete(
        `${BACKEND_URL}/api/commerce/evaluate/${evaluationId}`,
      );
      toast.success("Evaluation deleted successfully");
      navigate("/commerce/evaluate");
    } catch (error) {
      console.error("Failed to delete evaluation:", error);
      toast.error("Failed to delete evaluation");
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await axios.patch(
        `${BACKEND_URL}/api/commerce/evaluate/${evaluationId}/status?status=${newStatus}`,
      );
      toast.success("Status updated successfully");
      fetchEvaluationDetail();
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Draft: { bg: "bg-slate-100", text: "text-slate-700", icon: Clock },
      "In Review": {
        bg: "bg-blue-100",
        text: "text-blue-700",
        icon: AlertCircle,
      },
      Approved: {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        icon: CheckCircle,
      },
      Rejected: { bg: "bg-red-100", text: "text-red-700", icon: XCircle },
      Deferred: { bg: "bg-amber-100", text: "text-amber-700", icon: Clock },
    };

    const config = statusConfig[status] || statusConfig["Draft"];
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${config.bg} ${config.text}`}
      >
        <Icon className="h-4 w-4" />
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3 text-slate-600">
          <div className="w-6 h-6 border-2 border-[#033F99] border-t-transparent rounded-full animate-spin"></div>
          Loading evaluation details...
        </div>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="p-6">
        <Card className="p-12 text-center">
          <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Evaluation Not Found
          </h3>
          <p className="text-slate-600 mb-6">
            The evaluation you're looking for doesn't exist.
          </p>
          <Link to="/commerce/evaluate">
            <Button>Back to Evaluations</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const statusWorkflow = ["Draft", "In Review", "Approved"];
  const currentStatusIndex = statusWorkflow.indexOf(
    evaluation.evaluation_status,
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/commerce/evaluate">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2
                className="text-2xl font-bold text-slate-900"
                style={{ fontFamily: "Poppins" }}
              >
                {evaluation.opportunity_name}
              </h2>
              {getStatusBadge(evaluation.evaluation_status)}
            </div>
            <p className="text-slate-600 mt-1">
              Evaluation ID: {evaluation.evaluation_id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to={`/commerce/evaluate/${evaluationId}/edit`}>
            <Button className="gap-2 bg-[#033F99] hover:bg-[#033F99]">
              <Edit2 className="h-4 w-4" />
              Edit Evaluation
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Status Workflow */}
      <Card className="p-6 bg-white border-slate-200">
        <h3 className="text-sm font-semibold text-slate-600 mb-4 uppercase tracking-wider">
          Evaluation Workflow
        </h3>
        <div className="flex items-center justify-between">
          {statusWorkflow.map((status, index) => {
            const isCompleted = index <= currentStatusIndex;
            const isCurrent = index === currentStatusIndex;

            return (
              <React.Fragment key={status}>
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${isCompleted
                        ? "bg-[#033F99] text-white"
                        : "bg-slate-200 text-slate-400"
                      } ${isCurrent ? "ring-4 ring-[#6B9FE6]" : ""}`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-current"></div>
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium ${isCompleted ? "text-[#033F99]" : "text-slate-500"}`}
                  >
                    {status}
                  </span>
                </div>
                {index < statusWorkflow.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${isCompleted ? "bg-[#033F99]" : "bg-slate-200"}`}
                  ></div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          onClick={() => handleStatusChange("In Review")}
          disabled={evaluation.evaluation_status !== "Draft"}
          variant="outline"
          className="h-auto py-4 flex-col gap-2"
        >
          <AlertCircle className="h-5 w-5" />
          <span className="text-xs">Move to Review</span>
        </Button>
        <Button
          onClick={() => handleStatusChange("Approved")}
          disabled={
            evaluation.evaluation_status === "Approved" ||
            evaluation.evaluation_status === "Rejected"
          }
          variant="outline"
          className="h-auto py-4 flex-col gap-2 border-emerald-300 text-emerald-600 hover:bg-emerald-50"
        >
          <CheckCircle className="h-5 w-5" />
          <span className="text-xs">Approve Deal</span>
        </Button>
        <Button
          onClick={() => handleStatusChange("Rejected")}
          disabled={
            evaluation.evaluation_status === "Approved" ||
            evaluation.evaluation_status === "Rejected"
          }
          variant="outline"
          className="h-auto py-4 flex-col gap-2 border-red-300 text-red-600 hover:bg-red-50"
        >
          <XCircle className="h-5 w-5" />
          <span className="text-xs">Reject Deal</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Deal Information */}
          <Card className="p-6 bg-white border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#C4D9F4] rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-[#033F99]" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Deal Information
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <p className="text-sm text-slate-600 mb-1">Opportunity Name</p>
                <p className="text-sm font-medium text-slate-900">
                  {evaluation.opportunity_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Opportunity Type</p>
                <p className="text-sm font-medium text-slate-900">
                  {evaluation.opportunity_type}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Linked Lead</p>
                <p className="text-sm font-medium text-[#033F99]">
                  {evaluation.linked_lead_id}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">
                  Expected Deal Value
                </p>
                <p className="text-sm font-medium text-emerald-600">
                  ₹{(evaluation.expected_deal_value / 100000).toFixed(1)}L
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Payment Terms</p>
                <p className="text-sm font-medium text-slate-900">
                  {evaluation.proposed_payment_terms}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Currency</p>
                <p className="text-sm font-medium text-slate-900">
                  {evaluation.currency}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Deal Score */}
          <Card className="p-6 bg-gradient-to-br from-[#EBF3FC] to-purple-50 border-[#6B9FE6]">
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-2">Deal Score</p>
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="transform -rotate-90 w-32 h-32">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-slate-200"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - evaluation.deal_score / 100)}`}
                    className="text-[#033F99]"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-slate-900">
                    {Math.round(evaluation.deal_score)}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600">Out of 100</p>
              <div className="mt-4">
                <span className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold bg-[#C4D9F4] text-[#033F99]">
                  Grade {evaluation.deal_grade}
                </span>
              </div>
            </div>
          </Card>

          {/* Financial Details */}
          <Card className="p-6 bg-white border-slate-200">
            <h3 className="text-sm font-semibold text-slate-600 mb-4 uppercase tracking-wider">
              Financial Analysis
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <span className="text-sm text-slate-600">Gross Margin</span>
                <span className="text-sm font-semibold text-emerald-600">
                  {evaluation.gross_margin_percent.toFixed(1)}%
                </span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <span className="text-sm text-slate-600">Deal Grade</span>
                <span className="text-sm font-semibold text-slate-900">
                  {evaluation.deal_grade}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Approval Status</span>
                <span
                  className={`text-sm font-semibold ${evaluation.approval_status === "Approved"
                      ? "text-emerald-600"
                      : evaluation.approval_status === "Rejected"
                        ? "text-red-600"
                        : "text-amber-600"
                    }`}
                >
                  {evaluation.approval_status}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EvaluateDetail;
