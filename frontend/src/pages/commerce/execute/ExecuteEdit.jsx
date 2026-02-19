import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Card } from "../../../components/ui/card";
import { ArrowLeft, Save, X, PlayCircle } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ExecuteEdit = () => {
  const { executionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [commits, setCommits] = useState([]);
  const [formData, setFormData] = useState({
    commit_id: "",
    order_id: "",
    execution_type: "Delivery",
    scheduled_date: "",
    description: "",
  });

  useEffect(() => {
    fetchCommits();
    fetchExecution();
  }, [executionId]);

  const fetchCommits = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/commerce/commit`);
      setCommits(response.data);
    } catch (error) {
      console.error("Failed to fetch commits:", error);
    }
  };

  const fetchExecution = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BACKEND_URL}/api/commerce/execute/${executionId}`,
      );
      const execution = response.data;

      setFormData({
        commit_id: execution.commit_id || "",
        order_id: execution.order_id || "",
        execution_type: execution.execution_type || "Delivery",
        scheduled_date: execution.scheduled_date || "",
        description: execution.description || "",
      });

      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch execution:", error);
      toast.error("Failed to load execution details");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        scheduled_date:
          formData.scheduled_date || new Date().toISOString().split("T")[0],
      };

      await axios.put(
        `${BACKEND_URL}/api/commerce/execute/${executionId}`,
        payload,
      );

      toast.success("Execution updated successfully!");
      navigate(`/commerce/execute/${executionId}`);
    } catch (error) {
      console.error("Failed to update execution:", error);
      toast.error(error.response?.data?.detail || "Failed to update execution");
    } finally {
      setSaving(false);
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={`/commerce/execute/${executionId}`}>
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
              Edit Execution
            </h2>
            <p className="text-slate-600 mt-1">Update execution information</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 bg-white border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#C4D9F4] rounded-lg flex items-center justify-center">
              <PlayCircle className="h-5 w-5 text-[#033F99]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Execution Details
              </h3>
              <p className="text-sm text-slate-600">
                Order execution information
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="commit_id">Linked Commitment *</Label>
              <select
                id="commit_id"
                name="commit_id"
                value={formData.commit_id}
                onChange={handleChange}
                required
                className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
              >
                <option value="">Select Commitment</option>
                {commits.map((commit) => (
                  <option key={commit.id} value={commit.commit_id}>
                    {commit.commit_id} - {commit.contract_title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="order_id">Order ID *</Label>
              <Input
                id="order_id"
                name="order_id"
                value={formData.order_id}
                onChange={handleChange}
                required
                placeholder="ORD-2025-001"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="execution_type">Execution Type *</Label>
              <select
                id="execution_type"
                name="execution_type"
                value={formData.execution_type}
                onChange={handleChange}
                required
                className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
              >
                <option value="Delivery">Delivery</option>
                <option value="Service">Service</option>
                <option value="Milestone">Milestone</option>
              </select>
            </div>

            <div>
              <Label htmlFor="scheduled_date">Scheduled Date *</Label>
              <Input
                id="scheduled_date"
                name="scheduled_date"
                type="date"
                value={formData.scheduled_date}
                onChange={handleChange}
                required
                className="mt-2"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description *</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="3"
                placeholder="Describe the execution details..."
                className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
              />
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Link to={`/commerce/execute/${executionId}`}>
            <Button type="button" variant="outline" className="gap-2">
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={saving}
            className="gap-2 bg-gradient-to-r from-[#033F99] to-[#033F99] hover:from-[#033F99] hover:to-[#033F99]"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ExecuteEdit;
