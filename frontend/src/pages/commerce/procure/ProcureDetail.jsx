import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import {
  ArrowLeft,
  Edit2,
  Download,
  DollarSign,
  CheckCircle,
  Clock,
  Package,
  FileText,
  Calendar,
  User,
  Building,
  ShoppingCart,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ProcureDetail = () => {
  const { requisitionId } = useParams();
  const [procurement, setProcurement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProcurementDetails();
  }, [requisitionId]);

  const fetchProcurementDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BACKEND_URL}/api/commerce/procure/${requisitionId}`,
      );
      setProcurement(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch procurement details:", error);
      toast.error("Failed to load procurement details");
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await axios.patch(
        `${BACKEND_URL}/api/commerce/procure/${requisitionId}/status`,
        null,
        {
          params: { status: newStatus },
        },
      );
      toast.success(`Procurement status updated to ${newStatus}`);
      fetchProcurementDetails();
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update procurement status");
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      Draft: { bg: "bg-slate-100", text: "text-slate-700", icon: Clock },
      Requested: { bg: "bg-blue-100", text: "text-blue-700", icon: FileText },
      Approved: {
        bg: "bg-[#C4D9F4]",
        text: "text-[#033F99]",
        icon: CheckCircle,
      },
      Ordered: {
        bg: "bg-purple-100",
        text: "text-purple-700",
        icon: ShoppingCart,
      },
      Received: {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        icon: Package,
      },
      Cancelled: { bg: "bg-red-100", text: "text-red-700", icon: Clock },
    };

    const badgeConfig = config[status] || config["Draft"];
    const Icon = badgeConfig.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${badgeConfig.bg} ${badgeConfig.text}`}
      >
        <Icon className="h-4 w-4" />
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3 text-purple-600">
          <div className="w-6 h-6 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-medium">
            Loading procurement details...
          </span>
        </div>
      </div>
    );
  }

  if (!procurement) {
    return (
      <div className="p-6">
        <Card className="p-12 text-center">
          <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Procurement Not Found
          </h3>
          <p className="text-slate-600 mb-4">
            The requested procurement could not be found.
          </p>
          <Link to="/commerce/procure">
            <Button variant="outline">Back to Procurements</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/commerce/procure">
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
              Procurement {procurement.requisition_id}
            </h2>
            <p className="text-slate-600 mt-1">Purchase requisition details</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(procurement.procurement_status)}
          <Link to={`/commerce/procure/${requisitionId}/edit`}>
            <Button variant="outline" className="gap-2">
              <Edit2 className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button className="gap-2 bg-gradient-to-r from-purple-600 to-purple-700">
            <Download className="h-4 w-4" />
            Download PO
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-600">Estimated Value</p>
            <DollarSign className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            ₹{(procurement.estimated_value / 100000).toFixed(2)}L
          </p>
        </Card>
        <Card className="p-4 bg-white border-l-4 border-[#033F99]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-600">PO Value</p>
            <FileText className="h-5 w-5 text-[#033F99]" />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            ₹{(procurement.po_value / 100000).toFixed(2)}L
          </p>
        </Card>
        <Card className="p-4 bg-white border-l-4 border-emerald-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-600">Budget Available</p>
            <CheckCircle className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            ₹{(procurement.budget_available / 100000).toFixed(2)}L
          </p>
        </Card>
        <Card className="p-4 bg-white border-l-4 border-amber-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-600">Payment Terms</p>
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <p className="text-lg font-bold text-slate-900">
            {procurement.payment_terms}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-white">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Building className="h-5 w-5 text-purple-600" />
            Vendor Information
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-600">Vendor Name</p>
              <p className="text-base font-medium text-slate-900">
                {procurement.vendor_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Vendor ID</p>
              <p className="text-base font-medium text-slate-900">
                {procurement.vendor_id}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Contact Person</p>
              <p className="text-base font-medium text-slate-900">
                {procurement.vendor_contact_person || "N/A"}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            Requisition Details
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-600">Department</p>
              <p className="text-base font-medium text-slate-900">
                {procurement.department}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Priority</p>
              <p className="text-base font-medium text-slate-900">
                {procurement.priority}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">PO Number</p>
              <p className="text-base font-medium text-slate-900">
                {procurement.purchase_order_number || "Not assigned"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {procurement.procurement_status === "Draft" && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Status Actions
          </h3>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => handleStatusUpdate("Requested")}
              className="bg-gradient-to-r from-purple-600 to-purple-700"
            >
              <FileText className="h-4 w-4 mr-2" />
              Submit Request
            </Button>
            <Button
              variant="outline"
              onClick={() => handleStatusUpdate("Cancelled")}
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {procurement.procurement_status === "Requested" && (
        <Card className="p-6 bg-[#EBF3FC] border-[#6B9FE6]">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Status Actions
          </h3>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => handleStatusUpdate("Approved")}
              className="bg-gradient-to-r from-purple-600 to-purple-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </div>
        </Card>
      )}

      {procurement.procurement_status === "Approved" && (
        <Card className="p-6 bg-purple-50 border-purple-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Status Actions
          </h3>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => handleStatusUpdate("Ordered")}
              className="bg-gradient-to-r from-purple-600 to-purple-700"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Place Order
            </Button>
          </div>
        </Card>
      )}

      {procurement.procurement_status === "Ordered" && (
        <Card className="p-6 bg-emerald-50 border-emerald-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Status Actions
          </h3>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => handleStatusUpdate("Received")}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700"
            >
              <Package className="h-4 w-4 mr-2" />
              Mark as Received
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProcureDetail;
