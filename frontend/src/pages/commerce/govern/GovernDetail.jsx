import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import {
  ArrowLeft,
  Edit2,
  Shield,
  CheckCircle,
  AlertCircle,
  Award,
  TrendingUp,
  Download,
  FileText,
  Clock,
  Users,
} from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const GovernDetail = () => {
  const { governId } = useParams();
  const navigate = useNavigate();
  const [govern, setGovern] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGovernDetails();
  }, [governId]);

  const fetchGovernDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BACKEND_URL}/api/commerce/govern/${governId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setGovern(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch govern details:", error);
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${BACKEND_URL}/api/commerce/govern/${governId}/status?status=${newStatus}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchGovernDetails();
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-16 h-16 border-4 border-[#033F99] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!govern) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Governance record not found</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      Draft: "bg-slate-100 text-slate-700",
      Active: "bg-emerald-100 text-emerald-700",
      "Under Review": "bg-amber-100 text-amber-700",
      Archived: "bg-blue-100 text-blue-700",
    };
    return colors[status] || "bg-slate-100 text-slate-700";
  };

  const successRate =
    govern.total_runs > 0
      ? ((govern.successful_runs / govern.total_runs) * 100).toFixed(1)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/commerce/govern")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1
              className="text-3xl font-bold text-slate-900"
              style={{ fontFamily: "Poppins" }}
            >
              {govern.govern_id}
            </h1>
            <p className="text-slate-600 mt-1">{govern.sop_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(`/commerce/govern/${governId}/edit`)}
            className="flex items-center gap-2"
          >
            <Edit2 className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      {/* Status & Quick Actions */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span
              className={`px-4 py-2 text-sm font-semibold rounded-full ${getStatusColor(govern.sop_status)}`}
            >
              {govern.sop_status}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Version:</span>
              <span className="text-sm font-medium text-slate-900">
                {govern.sop_version}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Type:</span>
              <span className="text-sm font-medium text-[#033F99]">
                {govern.sop_type}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {govern.sop_status === "Draft" && (
              <Button
                onClick={() => handleStatusUpdate("Active")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Activate SOP
              </Button>
            )}
            {govern.sop_status === "Active" && (
              <Button
                onClick={() => handleStatusUpdate("Under Review")}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Mark for Review
              </Button>
            )}
            {govern.sop_status === "Under Review" && (
              <Button
                onClick={() => handleStatusUpdate("Archived")}
                className="bg-[#0147CC] hover:bg-blue-700 text-white"
              >
                Archive SOP
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                SLA Compliance
              </p>
              <p className="text-2xl font-bold text-emerald-900">
                {govern.sla_compliance_percent}%
              </p>
            </div>
            <Award className="h-8 w-8 text-emerald-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Runs</p>
              <p className="text-2xl font-bold text-slate-900">
                {govern.total_runs}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-slate-400" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Success Rate</p>
              <p className="text-2xl font-bold text-emerald-900">
                {successRate}%
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-emerald-500" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-[#EBF3FC] to-[#C4D9F4] border-[#6B9FE6]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#033F99]">Breach Count</p>
              <p className="text-2xl font-bold text-white">
                {govern.breach_count}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-[#033F99]" />
          </div>
        </Card>
      </div>

      {/* SOP Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#033F99]" />
            SOP Information
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Govern ID:</span>
              <span className="font-medium text-slate-900">
                {govern.govern_id}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">SOP Name:</span>
              <span className="font-medium text-slate-900">
                {govern.sop_name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Type:</span>
              <span className="font-medium text-slate-900">
                {govern.sop_type}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Version:</span>
              <span className="font-medium text-slate-900">
                {govern.sop_version}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Owner:</span>
              <span className="font-medium text-slate-900">
                {govern.sop_owner}
              </span>
            </div>
            {govern.department && (
              <div className="flex justify-between">
                <span className="text-slate-600">Department:</span>
                <span className="font-medium text-slate-900">
                  {govern.department}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-600">Effective Date:</span>
              <span className="font-medium text-slate-900">
                {new Date(govern.effective_date).toLocaleDateString()}
              </span>
            </div>
            {govern.next_review_date && (
              <div className="flex justify-between">
                <span className="text-slate-600">Next Review:</span>
                <span className="font-medium text-amber-600">
                  {new Date(govern.next_review_date).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Performance Metrics */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            Performance Metrics
          </h3>
          <div className="space-y-3">
            {govern.sla_defined && (
              <div>
                <p className="text-sm text-slate-600 mb-1">SLA Defined</p>
                <p className="text-sm font-medium text-slate-900">
                  {govern.sla_defined}
                </p>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-600">SLA Compliance:</span>
              <span className="font-medium text-emerald-600">
                {govern.sla_compliance_percent}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Successful Runs:</span>
              <span className="font-medium text-emerald-600">
                {govern.successful_runs}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Failed Runs:</span>
              <span className="font-medium text-red-600">
                {govern.failed_runs}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Breach Count:</span>
              <span className="font-medium text-amber-600">
                {govern.breach_count}
              </span>
            </div>
            {govern.last_breach_date && (
              <div className="flex justify-between">
                <span className="text-slate-600">Last Breach:</span>
                <span className="font-medium text-slate-900">
                  {new Date(govern.last_breach_date).toLocaleDateString()}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-600">Avg Execution Time:</span>
              <span className="font-medium text-slate-900">
                {govern.avg_execution_time}h
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Control Objectives & Risks */}
      {(govern.control_objectives.length > 0 ||
        govern.risk_addressed.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {govern.control_objectives.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  Control Objectives
                </h3>
                <ul className="space-y-2">
                  {govern.control_objectives.map((obj, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-600 mt-1">•</span>
                      <span className="text-sm text-slate-700">{obj}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {govern.risk_addressed.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  Risks Addressed
                </h3>
                <ul className="space-y-2">
                  {govern.risk_addressed.map((risk, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-600 mt-1">•</span>
                      <span className="text-sm text-slate-700">{risk}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        )}

      {/* Compliance Framework */}
      {govern.compliance_framework.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-[#033F99]" />
            Compliance Framework
          </h3>
          <div className="flex flex-wrap gap-2">
            {govern.compliance_framework.map((framework, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-[#C4D9F4] text-[#033F99] rounded-full text-sm font-medium"
              >
                {framework}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Audit Information */}
      {(govern.last_audit_date || govern.attestation_required) && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#0147CC]" />
            Audit & Attestation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {govern.last_audit_date && (
              <div>
                <p className="text-sm text-slate-600">Last Audit Date</p>
                <p className="font-medium text-slate-900">
                  {new Date(govern.last_audit_date).toLocaleDateString()}
                </p>
              </div>
            )}
            {govern.attestation_required && (
              <div>
                <p className="text-sm text-slate-600">Attestation Required</p>
                <p className="font-medium text-slate-900">Yes</p>
              </div>
            )}
            {govern.attested_by && (
              <div>
                <p className="text-sm text-slate-600">Attested By</p>
                <p className="font-medium text-slate-900">
                  {govern.attested_by}
                </p>
              </div>
            )}
            {govern.attestation_date && (
              <div>
                <p className="text-sm text-slate-600">Attestation Date</p>
                <p className="font-medium text-slate-900">
                  {new Date(govern.attestation_date).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {govern.audit_findings.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-slate-600 mb-2">Audit Findings</p>
              <ul className="space-y-1">
                {govern.audit_findings.map((finding, idx) => (
                  <li key={idx} className="text-sm text-slate-700">
                    • {finding}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default GovernDetail;
