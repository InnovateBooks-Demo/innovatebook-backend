import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import {
  ArrowLeft,
  Edit2,
  GitCompare,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  Download,
  FileText,
} from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ReconcileDetail = () => {
  const { reconcileId } = useParams();
  const navigate = useNavigate();
  const [reconcile, setReconcile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReconcileDetails();
  }, [reconcileId]);

  const fetchReconcileDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BACKEND_URL}/api/commerce/reconcile/${reconcileId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setReconcile(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch reconcile details:", error);
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${BACKEND_URL}/api/commerce/reconcile/${reconcileId}/status?status=${newStatus}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchReconcileDetails();
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

  if (!reconcile) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Reconciliation not found</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      Open: "bg-slate-100 text-slate-700",
      Matched: "bg-emerald-100 text-emerald-700",
      "Partially Matched": "bg-amber-100 text-amber-700",
      Closed: "bg-blue-100 text-blue-700",
    };
    return colors[status] || "bg-slate-100 text-slate-700";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/commerce/reconcile")}
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
              {reconcile.reconcile_id}
            </h1>
            <p className="text-slate-600 mt-1">
              {reconcile.reconcile_type} Reconciliation
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(`/commerce/reconcile/${reconcileId}/edit`)}
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
              className={`px-4 py-2 text-sm font-semibold rounded-full ${getStatusColor(reconcile.reconcile_status)}`}
            >
              {reconcile.reconcile_status}
            </span>
            {reconcile.difference !== 0 && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm font-medium">
                  Difference: ₹{Math.abs(reconcile.difference).toLocaleString()}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {reconcile.reconcile_status === "Open" && (
              <Button
                onClick={() => handleStatusUpdate("Matched")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Mark as Matched
              </Button>
            )}
            {reconcile.reconcile_status === "Open" && (
              <Button
                onClick={() => handleStatusUpdate("Partially Matched")}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Partially Matched
              </Button>
            )}
            {(reconcile.reconcile_status === "Matched" ||
              reconcile.reconcile_status === "Partially Matched") && (
                <Button
                  onClick={() => handleStatusUpdate("Closed")}
                  className="bg-[#0147CC] hover:bg-blue-700 text-white"
                >
                  Close Reconciliation
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
                Internal Amount
              </p>
              <p className="text-2xl font-bold text-slate-900">
                ₹{(reconcile.amount_internal / 100000).toFixed(2)}L
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-slate-400" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                External Amount
              </p>
              <p className="text-2xl font-bold text-blue-900">
                ₹{(reconcile.amount_external / 100000).toFixed(2)}L
              </p>
            </div>
            <FileText className="h-8 w-8 text-[#033F99]" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Difference</p>
              <p
                className={`text-2xl font-bold ${reconcile.difference === 0 ? "text-emerald-900" : "text-red-900"}`}
              >
                ₹{(Math.abs(reconcile.difference) / 100000).toFixed(2)}L
              </p>
            </div>
            {reconcile.difference === 0 ? (
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            ) : (
              <XCircle className="h-8 w-8 text-red-500" />
            )}
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-[#EBF3FC] to-[#C4D9F4] border-[#6B9FE6]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#033F99]">
                Reconciliation Score
              </p>
              <p className="text-2xl font-bold text-white">
                {reconcile.reconciliation_score}%
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-[#033F99]" />
          </div>
        </Card>
      </div>

      {/* Reconciliation Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <GitCompare className="h-5 w-5 text-[#033F99]" />
            Reconciliation Information
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Reconcile ID:</span>
              <span className="font-medium text-slate-900">
                {reconcile.reconcile_id}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Type:</span>
              <span className="font-medium text-slate-900">
                {reconcile.reconcile_type}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Period:</span>
              <span className="font-medium text-slate-900">
                {new Date(reconcile.period_start).toLocaleDateString()} -{" "}
                {new Date(reconcile.period_end).toLocaleDateString()}
              </span>
            </div>
            {reconcile.internal_ref_no && (
              <div className="flex justify-between">
                <span className="text-slate-600">Internal Ref:</span>
                <span className="font-medium text-slate-900">
                  {reconcile.internal_ref_no}
                </span>
              </div>
            )}
            {reconcile.external_ref_no && (
              <div className="flex justify-between">
                <span className="text-slate-600">External Ref:</span>
                <span className="font-medium text-slate-900">
                  {reconcile.external_ref_no}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Matching Status */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            Matching Status
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Match Status:</span>
              <span
                className={`font-medium ${reconcile.match_status === "Matched"
                    ? "text-emerald-600"
                    : reconcile.match_status === "Mismatch"
                      ? "text-red-600"
                      : "text-amber-600"
                  }`}
              >
                {reconcile.match_status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Confidence:</span>
              <span className="font-medium text-slate-900">
                {reconcile.match_confidence}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Matched Entries:</span>
              <span className="font-medium text-emerald-600">
                {reconcile.reconciled_entries}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Unmatched Entries:</span>
              <span className="font-medium text-red-600">
                {reconcile.unmatched_entries}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Reconciled Value:</span>
              <span className="font-medium text-slate-900">
                ₹{reconcile.reconciled_value.toLocaleString()}
              </span>
            </div>
            {reconcile.exception_value > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-600">Exception Value:</span>
                <span className="font-medium text-red-600">
                  ₹{reconcile.exception_value.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Exception Details */}
      {(reconcile.exception_id || reconcile.mismatch_type) && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            Exception Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reconcile.exception_id && (
              <div>
                <p className="text-sm text-slate-600">Exception ID</p>
                <p className="font-medium text-slate-900">
                  {reconcile.exception_id}
                </p>
              </div>
            )}
            {reconcile.mismatch_type && (
              <div>
                <p className="text-sm text-slate-600">Mismatch Type</p>
                <p className="font-medium text-red-600">
                  {reconcile.mismatch_type}
                </p>
              </div>
            )}
            {reconcile.exception_description && (
              <div className="col-span-2">
                <p className="text-sm text-slate-600 mb-2">Description</p>
                <p className="text-slate-900">
                  {reconcile.exception_description}
                </p>
              </div>
            )}
            {reconcile.resolution_action && (
              <div>
                <p className="text-sm text-slate-600">Resolution Action</p>
                <p className="font-medium text-slate-900">
                  {reconcile.resolution_action}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default ReconcileDetail;
