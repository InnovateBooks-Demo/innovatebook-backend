import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaIndustry,
  FaCheckCircle,
  FaClock,
  FaDollarSign,
  FaClipboardCheck,
  FaHistory,
} from "react-icons/fa";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ManufacturingLeadDetail = () => {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchLeadDetails();
  }, [leadId]);

  const fetchLeadDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${API_URL}/api/manufacturing/leads/${leadId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setLead(data.lead);
      }
    } catch (error) {
      console.error("Error fetching lead:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      New: "bg-blue-100 text-blue-800",
      Intake: "bg-purple-100 text-purple-800",
      "Feasibility Check": "bg-yellow-100 text-yellow-800",
      Costing: "bg-orange-100 text-orange-800",
      "Approval Pending": "bg-red-100 text-red-800",
      Approved: "bg-green-100 text-green-800",
      Converted: "bg-teal-100 text-teal-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading lead details...</p>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-6xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Lead not found</h2>
          <button
            onClick={() => navigate("/commerce/manufacturing-leads")}
            className="mt-4 text-[#033F99] hover:text-blue-800"
          >
            Back to Leads
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/commerce/manufacturing-leads")}
            className="text-[#033F99] hover:text-blue-800 flex items-center gap-2 mb-4"
          >
            <FaArrowLeft /> Back to Leads
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FaIndustry className="text-[#033F99]" />
                {lead.lead_id}
              </h1>
              <p className="text-gray-600 mt-1">
                {lead.customer_name} -{" "}
                {lead.product_description?.substring(0, 60)}...
              </p>
            </div>
            <div className="flex gap-3">
              <span
                className={`px-4 py-2 rounded-lg font-semibold ${getStatusBadgeColor(lead.status)}`}
              >
                {lead.status}
              </span>
              <span className="px-4 py-2 rounded-lg font-semibold bg-gray-100 text-gray-700">
                Stage: {lead.current_stage}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-6 py-4 font-medium transition-colors ${activeTab === "overview" ? "border-b-2 border-blue-600 text-[#033F99]" : "text-gray-600 hover:text-gray-900"}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("feasibility")}
              className={`px-6 py-4 font-medium transition-colors ${activeTab === "feasibility" ? "border-b-2 border-blue-600 text-[#033F99]" : "text-gray-600 hover:text-gray-900"}`}
            >
              Feasibility
            </button>
            <button
              onClick={() => setActiveTab("costing")}
              className={`px-6 py-4 font-medium transition-colors ${activeTab === "costing" ? "border-b-2 border-blue-600 text-[#033F99]" : "text-gray-600 hover:text-gray-900"}`}
            >
              Costing
            </button>
            <button
              onClick={() => setActiveTab("approvals")}
              className={`px-6 py-4 font-medium transition-colors ${activeTab === "approvals" ? "border-b-2 border-blue-600 text-[#033F99]" : "text-gray-600 hover:text-gray-900"}`}
            >
              Approvals
            </button>
            <button
              onClick={() => setActiveTab("audit")}
              className={`px-6 py-4 font-medium transition-colors ${activeTab === "audit" ? "border-b-2 border-blue-600 text-[#033F99]" : "text-gray-600 hover:text-gray-900"}`}
            >
              Audit Trail
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaIndustry className="text-[#033F99]" />
                Customer Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Customer Name</p>
                  <p className="font-medium text-gray-900">
                    {lead.customer_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Industry</p>
                  <p className="font-medium text-gray-900">
                    {lead.customer_industry}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Contact Person</p>
                  <p className="font-medium text-gray-900">
                    {lead.contact_person}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Contact Email</p>
                  <p className="font-medium text-gray-900">
                    {lead.contact_email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Contact Phone</p>
                  <p className="font-medium text-gray-900">
                    {lead.contact_phone}
                  </p>
                </div>
                {lead.rfq_number && (
                  <div>
                    <p className="text-sm text-gray-600">RFQ Number</p>
                    <p className="font-medium text-gray-900">
                      {lead.rfq_number}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Product Requirements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Product Description</p>
                  <p className="font-medium text-gray-900">
                    {lead.product_description}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Quantity</p>
                  <p className="font-medium text-gray-900">
                    {lead.quantity} {lead.uom}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    Delivery Date Required
                  </p>
                  <p className="font-medium text-gray-900">
                    {new Date(lead.delivery_date_required).toLocaleDateString()}
                  </p>
                </div>
                {lead.application && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Application</p>
                    <p className="font-medium text-gray-900">
                      {lead.application}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Technical Specs */}
            {lead.technical_specs && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Technical Specifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lead.technical_specs.material_grade && (
                    <div>
                      <p className="text-sm text-gray-600">Material Grade</p>
                      <p className="font-medium text-gray-900">
                        {lead.technical_specs.material_grade}
                      </p>
                    </div>
                  )}
                  {lead.technical_specs.tolerances && (
                    <div>
                      <p className="text-sm text-gray-600">Tolerances</p>
                      <p className="font-medium text-gray-900">
                        {lead.technical_specs.tolerances}
                      </p>
                    </div>
                  )}
                  {lead.technical_specs.surface_finish && (
                    <div>
                      <p className="text-sm text-gray-600">Surface Finish</p>
                      <p className="font-medium text-gray-900">
                        {lead.technical_specs.surface_finish}
                      </p>
                    </div>
                  )}
                  {lead.technical_specs.coating && (
                    <div>
                      <p className="text-sm text-gray-600">Coating</p>
                      <p className="font-medium text-gray-900">
                        {lead.technical_specs.coating}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "feasibility" && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaClipboardCheck className="text-[#033F99]" />
              Feasibility Checks
            </h3>

            {lead.feasibility ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">
                    Overall Status
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      lead.feasibility.overall_status === "Feasible"
                        ? "bg-green-100 text-green-800"
                        : lead.feasibility.overall_status === "Not Feasible"
                          ? "bg-red-100 text-red-800"
                          : lead.feasibility.overall_status === "In Progress"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {lead.feasibility.overall_status}
                  </span>
                </div>

                {/* Engineering Feasibility */}
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">
                      Engineering Feasibility
                    </h4>
                    {lead.feasibility.engineering_feasible !== null && (
                      <FaCheckCircle
                        className={
                          lead.feasibility.engineering_feasible
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      />
                    )}
                  </div>
                  {lead.feasibility.engineering_notes && (
                    <p className="text-sm text-gray-600">
                      {lead.feasibility.engineering_notes}
                    </p>
                  )}
                  {lead.feasibility.engineering_checked_by && (
                    <p className="text-xs text-gray-500 mt-1">
                      Checked by: {lead.feasibility.engineering_checked_by}
                    </p>
                  )}
                </div>

                {/* Production Feasibility */}
                <div className="border-l-4 border-green-500 pl-4 py-2">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">
                      Production Feasibility
                    </h4>
                    {lead.feasibility.production_feasible !== null && (
                      <FaCheckCircle
                        className={
                          lead.feasibility.production_feasible
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      />
                    )}
                  </div>
                  {lead.feasibility.production_notes && (
                    <p className="text-sm text-gray-600">
                      {lead.feasibility.production_notes}
                    </p>
                  )}
                  {lead.feasibility.production_plant_id && (
                    <p className="text-xs text-gray-500 mt-1">
                      Plant: {lead.feasibility.production_plant_id}
                    </p>
                  )}
                </div>

                {/* QC Feasibility */}
                <div className="border-l-4 border-orange-500 pl-4 py-2">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">
                      QC Feasibility
                    </h4>
                    {lead.feasibility.qc_feasible !== null && (
                      <FaCheckCircle
                        className={
                          lead.feasibility.qc_feasible
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      />
                    )}
                  </div>
                  {lead.feasibility.qc_notes && (
                    <p className="text-sm text-gray-600">
                      {lead.feasibility.qc_notes}
                    </p>
                  )}
                </div>

                {/* RM Feasibility */}
                <div className="border-l-4 border-purple-500 pl-4 py-2">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">
                      Raw Material Feasibility
                    </h4>
                    {lead.feasibility.rm_feasible !== null && (
                      <FaCheckCircle
                        className={
                          lead.feasibility.rm_feasible
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      />
                    )}
                  </div>
                  {lead.feasibility.rm_notes && (
                    <p className="text-sm text-gray-600">
                      {lead.feasibility.rm_notes}
                    </p>
                  )}
                  {lead.feasibility.rm_lead_time && (
                    <p className="text-xs text-gray-500 mt-1">
                      Lead Time: {lead.feasibility.rm_lead_time} days
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Feasibility checks not yet started
              </p>
            )}
          </div>
        )}

        {activeTab === "costing" && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaDollarSign className="text-[#033F99]" />
              Costing & Pricing
            </h3>

            {lead.costing ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-[rgba(3,63,153,0.08)] rounded-lg">
                    <p className="text-sm text-gray-600">Material Cost</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{lead.costing.material_cost?.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Labor Cost</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{lead.costing.labor_cost?.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-gray-600">Overhead Cost</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{lead.costing.overhead_cost?.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600">Tooling Cost</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{lead.costing.tooling_cost?.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="border-t-2 border-gray-200 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        Total Cost Per Unit
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        ₹{lead.costing.total_cost_per_unit?.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <p className="text-sm text-gray-600">Margin</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {lead.costing.margin_percentage}%
                      </p>
                    </div>
                    <div className="p-4 bg-green-100 rounded-lg">
                      <p className="text-sm text-gray-600">
                        Quoted Price Per Unit
                      </p>
                      <p className="text-2xl font-bold text-green-700">
                        ₹{lead.costing.quoted_price?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {lead.costing.calculated_by && (
                  <p className="text-xs text-gray-500">
                    Calculated by: {lead.costing.calculated_by} on{" "}
                    {new Date(lead.costing.calculated_at).toLocaleString()}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Costing not yet calculated
              </p>
            )}
          </div>
        )}

        {activeTab === "approvals" && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaCheckCircle className="text-[#033F99]" />
              Approval Status
            </h3>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Overall Approval Status</p>
              <p
                className={`text-lg font-bold ${
                  lead.approval_status === "Approved"
                    ? "text-green-600"
                    : lead.approval_status === "Rejected"
                      ? "text-red-600"
                      : lead.approval_status === "Pending"
                        ? "text-yellow-600"
                        : "text-gray-600"
                }`}
              >
                {lead.approval_status}
              </p>
            </div>

            {lead.approvals && lead.approvals.length > 0 ? (
              <div className="space-y-4">
                {lead.approvals.map((approval, index) => (
                  <div
                    key={`item-${index}`}
                    className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded-r-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">
                        {approval.approval_type}
                      </h4>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          approval.status === "Approved"
                            ? "bg-green-100 text-green-800"
                            : approval.status === "Rejected"
                              ? "bg-red-100 text-red-800"
                              : approval.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {approval.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Approver Role: {approval.approver_role}
                    </p>
                    {approval.approver_name && (
                      <p className="text-sm text-gray-600">
                        Approver: {approval.approver_name}
                      </p>
                    )}
                    {approval.comments && (
                      <p className="text-sm text-gray-600 mt-2">
                        Comments: {approval.comments}
                      </p>
                    )}
                    {approval.responded_at && (
                      <p className="text-xs text-gray-500 mt-1">
                        Responded:{" "}
                        {new Date(approval.responded_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No approvals submitted yet
              </p>
            )}
          </div>
        )}

        {activeTab === "audit" && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaHistory className="text-[#033F99]" />
              Audit Trail
            </h3>

            {lead.audit_logs && lead.audit_logs.length > 0 ? (
              <div className="space-y-3">
                {lead.audit_logs.map((log, index) => (
                  <div
                    key={`item-${index}`}
                    className="flex gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      <FaClock className="text-gray-400 text-xl" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-gray-900">
                          {log.action}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600">{log.user_name}</p>
                      {log.notes && (
                        <p className="text-sm text-gray-700 mt-2">
                          {log.notes}
                        </p>
                      )}
                      {log.field_changed && (
                        <p className="text-xs text-gray-500 mt-1">
                          Field: {log.field_changed}
                          {log.old_value && ` | Old: ${log.old_value}`}
                          {log.new_value && ` | New: ${log.new_value}`}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No audit logs available
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManufacturingLeadDetail;
