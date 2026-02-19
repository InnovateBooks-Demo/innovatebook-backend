import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Save, ArrowLeft, X } from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AuditCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    audit_name: "",
    audit_type: "internal",
    scope: "",
    auditor: "",
    scheduled_date: "",
    completion_date: "",
    findings: "",
    status: "planned",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/modules/governance/audits`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        },
      );
      const data = await res.json();
      if (data.success) {
        toast.success("Audit created successfully");
        navigate("/commerce/govern/audit");
      } else {
        toast.error(data.detail || "Failed to create audit");
      }
    } catch (error) {
      toast.error("Error creating audit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="audit-create">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/commerce/govern/audit")}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Create New Audit
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Schedule a new audit activity
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-gray-500" />
                <h2 className="text-lg font-medium text-gray-900">
                  Audit Information
                </h2>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Audit Name *
                </label>
                <input
                  type="text"
                  name="audit_name"
                  value={formData.audit_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99] focus:border-transparent"
                  placeholder="Enter audit name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Audit Type
                </label>
                <select
                  name="audit_type"
                  value={formData.audit_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99] bg-white"
                >
                  <option value="internal">Internal</option>
                  <option value="external">External</option>
                  <option value="compliance">Compliance</option>
                  <option value="financial">Financial</option>
                  <option value="operational">Operational</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99] bg-white"
                >
                  <option value="planned">Planned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auditor
                </label>
                <input
                  type="text"
                  name="auditor"
                  value={formData.auditor}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99] focus:border-transparent"
                  placeholder="Enter auditor name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scheduled Date
                </label>
                <input
                  type="date"
                  name="scheduled_date"
                  value={formData.scheduled_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99] focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scope
                </label>
                <textarea
                  name="scope"
                  value={formData.scope}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99] focus:border-transparent"
                  placeholder="Define audit scope..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Findings (if any)
                </label>
                <textarea
                  name="findings"
                  value={formData.findings}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99] focus:border-transparent"
                  placeholder="Document audit findings..."
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/commerce/govern/audit")}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-[#033F99] rounded-lg hover:bg-[#022d6e] transition-colors shadow-sm disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {loading ? "Creating..." : "Create Audit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuditCreate;
