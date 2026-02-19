import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import {
  ArrowLeft,
  Edit2,
  FileText,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Download,
  User,
} from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const TaxDetail = () => {
  const { taxId } = useParams();
  const navigate = useNavigate();
  const [tax, setTax] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTaxDetails();
  }, [taxId]);

  const fetchTaxDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BACKEND_URL}/api/commerce/tax/${taxId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setTax(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch tax details:", error);
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${BACKEND_URL}/api/commerce/tax/${taxId}/status?status=${newStatus}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchTaxDetails();
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

  if (!tax) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Tax record not found</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      Draft: "bg-slate-100 text-slate-700",
      Calculated: "bg-blue-100 text-blue-700",
      Filed: "bg-amber-100 text-amber-700",
      Paid: "bg-emerald-100 text-emerald-700",
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
            onClick={() => navigate("/commerce/tax")}
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
              {tax.tax_id}
            </h1>
            <p className="text-slate-600 mt-1">
              {tax.tax_type} - {tax.tax_period}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(`/commerce/tax/${taxId}/edit`)}
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
              className={`px-4 py-2 text-sm font-semibold rounded-full ${getStatusColor(tax.tax_status)}`}
            >
              {tax.tax_status}
            </span>
            {tax.late_filing_flag && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Late Filing</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {tax.tax_status === "Draft" && (
              <Button
                onClick={() => handleStatusUpdate("Calculated")}
                className="bg-[#0147CC] hover:bg-blue-700 text-white"
              >
                Calculate Tax
              </Button>
            )}
            {tax.tax_status === "Calculated" && (
              <Button
                onClick={() => handleStatusUpdate("Filed")}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Mark as Filed
              </Button>
            )}
            {tax.tax_status === "Filed" && (
              <Button
                onClick={() => handleStatusUpdate("Paid")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Mark as Paid
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
                Taxable Amount
              </p>
              <p className="text-2xl font-bold text-slate-900">
                ₹{(tax.taxable_amount / 100000).toFixed(2)}L
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-slate-400" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Tax Computed</p>
              <p className="text-2xl font-bold text-blue-900">
                ₹{(tax.tax_computed / 100000).toFixed(2)}L
              </p>
              <p className="text-xs text-slate-500">@ {tax.tax_rate}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-[#033F99]" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Input Tax Credit
              </p>
              <p className="text-2xl font-bold text-emerald-900">
                ₹{(tax.input_tax_credit / 100000).toFixed(2)}L
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-emerald-500" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-[#EBF3FC] to-[#C4D9F4] border-[#6B9FE6]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#033F99]">
                Net Tax Payable
              </p>
              <p className="text-2xl font-bold text-white">
                ₹{(tax.net_tax_payable / 100000).toFixed(2)}L
              </p>
            </div>
            <FileText className="h-8 w-8 text-[#033F99]" />
          </div>
        </Card>
      </div>

      {/* Tax Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#033F99]" />
            Tax Information
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Tax ID:</span>
              <span className="font-medium text-slate-900">{tax.tax_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Tax Period:</span>
              <span className="font-medium text-slate-900">
                {tax.tax_period}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Tax Type:</span>
              <span className="font-medium text-slate-900">{tax.tax_type}</span>
            </div>
            {tax.return_type && (
              <div className="flex justify-between">
                <span className="text-slate-600">Return Type:</span>
                <span className="font-medium text-slate-900">
                  {tax.return_type}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-600">Filing Due Date:</span>
              <span className="font-medium text-slate-900">
                {new Date(tax.filing_due_date).toLocaleDateString()}
              </span>
            </div>
            {tax.filing_date && (
              <div className="flex justify-between">
                <span className="text-slate-600">Filing Date:</span>
                <span className="font-medium text-emerald-600">
                  {new Date(tax.filing_date).toLocaleDateString()}
                </span>
              </div>
            )}
            {tax.filing_reference && (
              <div className="flex justify-between">
                <span className="text-slate-600">Filing Reference:</span>
                <span className="font-medium text-slate-900">
                  {tax.filing_reference}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Compliance Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            Compliance
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Compliance Score:</span>
              <span className="text-2xl font-bold text-emerald-600">
                {tax.compliance_score}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Late Filing:</span>
              <span
                className={`font-medium ${tax.late_filing_flag ? "text-red-600" : "text-emerald-600"}`}
              >
                {tax.late_filing_flag ? "Yes" : "No"}
              </span>
            </div>
            {tax.penalty_amount > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-600">Penalty Amount:</span>
                <span className="font-medium text-red-600">
                  ₹{tax.penalty_amount.toLocaleString()}
                </span>
              </div>
            )}
            {tax.interest_amount > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-600">Interest Amount:</span>
                <span className="font-medium text-amber-600">
                  ₹{tax.interest_amount.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Audit Trail */}
      {(tax.prepared_by ||
        tax.reviewed_by ||
        tax.approved_by ||
        tax.filed_by) && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-[#033F99]" />
              Audit Trail
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {tax.prepared_by && (
                <div>
                  <p className="text-sm text-slate-600">Prepared By</p>
                  <p className="font-medium text-slate-900">{tax.prepared_by}</p>
                </div>
              )}
              {tax.reviewed_by && (
                <div>
                  <p className="text-sm text-slate-600">Reviewed By</p>
                  <p className="font-medium text-slate-900">{tax.reviewed_by}</p>
                </div>
              )}
              {tax.approved_by && (
                <div>
                  <p className="text-sm text-slate-600">Approved By</p>
                  <p className="font-medium text-slate-900">{tax.approved_by}</p>
                </div>
              )}
              {tax.filed_by && (
                <div>
                  <p className="text-sm text-slate-600">Filed By</p>
                  <p className="font-medium text-slate-900">{tax.filed_by}</p>
                </div>
              )}
            </div>
          </Card>
        )}
    </div>
  );
};

export default TaxDetail;
