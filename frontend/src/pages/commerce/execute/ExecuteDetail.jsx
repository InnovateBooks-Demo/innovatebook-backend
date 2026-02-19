import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import {
  ArrowLeft,
  Edit2,
  Trash2,
  CheckCircle,
  PlayCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ExecuteDetail = () => {
  const { executionId } = useParams();
  const navigate = useNavigate();
  const [execution, setExecution] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExecutionDetail();
  }, [executionId]);

  const fetchExecutionDetail = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/commerce/execute/${executionId}`,
      );
      setExecution(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch execution:", error);
      toast.error("Failed to load execution details");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this execution?"))
      return;

    try {
      await axios.delete(`${BACKEND_URL}/api/commerce/execute/${executionId}`);
      toast.success("Execution deleted successfully");
      navigate("/commerce/execute");
    } catch (error) {
      console.error("Failed to delete execution:", error);
      toast.error("Failed to delete execution");
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await axios.patch(
        `${BACKEND_URL}/api/commerce/execute/${executionId}/status?status=${newStatus}`,
      );
      toast.success("Status updated successfully");
      fetchExecutionDetail();
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3 text-slate-600">
          <div className="w-6 h-6 border-2 border-[#033F99] border-t-transparent rounded-full animate-spin"></div>
          Loading execution details...
        </div>
      </div>
    );
  }

  if (!execution) {
    return (
      <div className="p-6">
        <Card className="p-12 text-center">
          <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Execution Not Found
          </h3>
          <p className="text-slate-600 mb-6">
            The execution you're looking for doesn't exist.
          </p>
          <Link to="/commerce/execute">
            <Button>Back to Executions</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/commerce/execute">
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
              {execution.description}
            </h2>
            <p className="text-slate-600 mt-1">
              Execution ID: {execution.execution_id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to={`/commerce/execute/${executionId}/edit`}>
            <Button className="gap-2 bg-[#033F99] hover:bg-[#033F99]">
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
          onClick={() => handleStatusChange("In Progress")}
          disabled={execution.execution_status !== "Scheduled"}
          variant="outline"
          className="h-auto py-4 flex-col gap-2"
        >
          <PlayCircle className="h-5 w-5" />
          <span className="text-xs">Start Execution</span>
        </Button>
        <Button
          onClick={() => handleStatusChange("Completed")}
          disabled={
            execution.execution_status === "Completed" ||
            execution.execution_status === "Verified"
          }
          variant="outline"
          className="h-auto py-4 flex-col gap-2 border-emerald-300 text-emerald-600 hover:bg-emerald-50"
        >
          <CheckCircle className="h-5 w-5" />
          <span className="text-xs">Mark Completed</span>
        </Button>
        <Button
          onClick={() => handleStatusChange("Verified")}
          disabled={execution.execution_status !== "Completed"}
          variant="outline"
          className="h-auto py-4 flex-col gap-2 border-purple-300 text-purple-600 hover:bg-purple-50"
        >
          <CheckCircle className="h-5 w-5" />
          <span className="text-xs">Verify Execution</span>
        </Button>
      </div>

      <Card className="p-6 bg-white border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#C4D9F4] rounded-lg flex items-center justify-center">
            <PlayCircle className="h-5 w-5 text-[#033F99]" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Execution Information
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <p className="text-sm text-slate-600 mb-1">Execution ID</p>
            <p className="text-sm font-medium text-slate-900">
              {execution.execution_id}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Order ID</p>
            <p className="text-sm font-medium text-[#033F99]">
              {execution.order_id}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Linked Commitment</p>
            <p className="text-sm font-medium text-slate-900">
              {execution.commit_id}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Execution Type</p>
            <p className="text-sm font-medium text-slate-900">
              {execution.execution_type}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Scheduled Date</p>
            <p className="text-sm font-medium text-slate-900">
              {execution.scheduled_date}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Status</p>
            <p className="text-sm font-medium text-slate-900">
              {execution.execution_status}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-slate-600 mb-1">Description</p>
            <p className="text-sm font-medium text-slate-900">
              {execution.description}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ExecuteDetail;
