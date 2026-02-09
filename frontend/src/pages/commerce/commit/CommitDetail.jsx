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
  FileText,
  DollarSign,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CommitDetail = () => {
  const { commitId } = useParams();
  const navigate = useNavigate();
  const [commit, setCommit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommitDetail();
  }, [commitId]);

  const fetchCommitDetail = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/commerce/commit/${commitId}`,
      );
      setCommit(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch commitment:", error);
      toast.error("Failed to load commitment details");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this commitment?"))
      return;

    try {
      await axios.delete(`${BACKEND_URL}/api/commerce/commit/${commitId}`);
      toast.success("Commitment deleted successfully");
      navigate("/commerce/commit");
    } catch (error) {
      console.error("Failed to delete commitment:", error);
      toast.error("Failed to delete commitment");
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await axios.patch(
        `${BACKEND_URL}/api/commerce/commit/${commitId}/status?status=${newStatus}`,
      );
      toast.success("Status updated successfully");
      fetchCommitDetail();
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3 text-slate-600">
          <div className="w-6 h-6 border-2 border-[#3A4E63] border-t-transparent rounded-full animate-spin"></div>
          Loading commitment details...
        </div>
      </div>
    );
  }

  if (!commit) {
    return (
      <div className="p-6">
        <Card className="p-12 text-center">
          <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Commitment Not Found
          </h3>
          <p className="text-slate-600 mb-6">
            The commitment you're looking for doesn't exist.
          </p>
          <Link to="/commerce/commit">
            <Button>Back to Commitments</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/commerce/commit">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h2
              className="text-2xl font-bold text-slate-900"
              style={{ fontFamily: "Poppins" }}
            >
              {commit.contract_title}
            </h2>
            <p className="text-slate-600 mt-1">
              Commitment ID: {commit.commit_id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to={`/commerce/commit/${commitId}/edit`}>
            <Button className="gap-2 bg-[#3A4E63] hover:bg-[#3A4E63]">
              <Edit2 className="h-4 w-4" />
              Edit
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          onClick={() => handleStatusChange("Under Review")}
          disabled={commit.commit_status !== "Draft"}
          variant="outline"
          className="h-auto py-4 flex-col gap-2"
        >
          <AlertCircle className="h-5 w-5" />
          <span className="text-xs">Move to Review</span>
        </Button>
        <Button
          onClick={() => handleStatusChange("Approved")}
          disabled={
            commit.commit_status === "Executed" ||
            commit.commit_status === "Cancelled"
          }
          variant="outline"
          className="h-auto py-4 flex-col gap-2 border-blue-300 text-[#0147CC] hover:bg-[rgba(3,63,153,0.08)]"
        >
          <CheckCircle className="h-5 w-5" />
          <span className="text-xs">Approve Contract</span>
        </Button>
        <Button
          onClick={() => handleStatusChange("Executed")}
          disabled={
            commit.commit_status === "Executed" ||
            commit.commit_status === "Cancelled"
          }
          variant="outline"
          className="h-auto py-4 flex-col gap-2 border-emerald-300 text-emerald-600 hover:bg-emerald-50"
        >
          <CheckCircle className="h-5 w-5" />
          <span className="text-xs">Mark Executed</span>
        </Button>
      </div>

      <Card className="p-6 bg-white border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#C4D9F4] rounded-lg flex items-center justify-center">
            <FileText className="h-5 w-5 text-[#3A4E63]" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Contract Information
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <p className="text-sm text-slate-600 mb-1">Contract Number</p>
            <p className="text-sm font-medium text-slate-900">
              {commit.contract_number}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Linked Evaluation</p>
            <p className="text-sm font-medium text-[#3A4E63]">
              {commit.evaluation_id}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Customer ID</p>
            <p className="text-sm font-medium text-slate-900">
              {commit.customer_id}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Contract Value</p>
            <p className="text-sm font-medium text-emerald-600">
              ₹{(commit.contract_value / 100000).toFixed(1)}L
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Effective Date</p>
            <p className="text-sm font-medium text-slate-900">
              {commit.effective_date}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Expiry Date</p>
            <p className="text-sm font-medium text-slate-900">
              {commit.expiry_date}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Payment Terms</p>
            <p className="text-sm font-medium text-slate-900">
              {commit.payment_terms}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Status</p>
            <p className="text-sm font-medium text-slate-900">
              {commit.commit_status}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CommitDetail;
