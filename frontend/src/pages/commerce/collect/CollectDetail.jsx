import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import {
  ArrowLeft,
  Edit2,
  Download,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
  Calendar,
  User,
  FileText,
  TrendingUp,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CollectDetail = () => {
  const { collectionId } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    method: "Bank Transfer",
    reference: "",
  });

  useEffect(() => {
    fetchCollectionDetails();
  }, [collectionId]);

  const fetchCollectionDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BACKEND_URL}/api/commerce/collect/${collectionId}`,
      );
      setCollection(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch collection details:", error);
      toast.error("Failed to load collection details");
      setLoading(false);
    }
  };

  const handleRecordPayment = async () => {
    if (paymentData.amount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    try {
      await axios.patch(
        `${BACKEND_URL}/api/commerce/collect/${collectionId}/payment`,
        null,
        {
          params: {
            payment_amount: paymentData.amount,
            payment_method: paymentData.method,
            payment_reference: paymentData.reference,
          },
        },
      );
      toast.success("Payment recorded successfully");
      setShowPaymentDialog(false);
      setPaymentData({ amount: 0, method: "Bank Transfer", reference: "" });
      fetchCollectionDetails();
    } catch (error) {
      console.error("Failed to record payment:", error);
      toast.error("Failed to record payment");
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      Pending: { bg: "bg-slate-100", text: "text-slate-700", icon: Clock },
      Partial: { bg: "bg-amber-100", text: "text-amber-700", icon: TrendingUp },
      Paid: {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        icon: CheckCircle,
      },
      Overdue: { bg: "bg-red-100", text: "text-red-700", icon: AlertCircle },
    };

    const badgeConfig = config[status] || config["Pending"];
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
        <div className="flex items-center gap-3 text-[#033F99]">
          <div className="w-6 h-6 border-3 border-[#033F99] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-medium">
            Loading collection details...
          </span>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="p-6">
        <Card className="p-12 text-center">
          <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Collection Not Found
          </h3>
          <p className="text-slate-600 mb-4">
            The requested collection could not be found.
          </p>
          <Link to="/commerce/collect">
            <Button variant="outline">Back to Collections</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/commerce/collect">
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
              Collection {collection.collection_id}
            </h2>
            <p className="text-slate-600 mt-1">
              Payment tracking and management
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(collection.payment_status)}
          <Link to={`/commerce/collect/${collectionId}/edit`}>
            <Button variant="outline" className="gap-2">
              <Edit2 className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button className="gap-2 bg-gradient-to-r from-[#033F99] to-[#033F99]">
            <Download className="h-4 w-4" />
            Download Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border-l-4 border-[#033F99]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-600">Amount Due</p>
            <DollarSign className="h-5 w-5 text-[#033F99]" />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            ₹{(collection.amount_due / 100000).toFixed(2)}L
          </p>
        </Card>
        <Card className="p-4 bg-white border-l-4 border-emerald-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-600">Amount Received</p>
            <CheckCircle className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            ₹{(collection.amount_received / 100000).toFixed(2)}L
          </p>
        </Card>
        <Card className="p-4 bg-white border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-600">Outstanding</p>
            <AlertCircle className="h-5 w-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            ₹{(collection.amount_outstanding / 100000).toFixed(2)}L
          </p>
        </Card>
        <Card className="p-4 bg-white border-l-4 border-amber-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-600">Days Overdue</p>
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {collection.days_overdue}
          </p>
        </Card>
      </div>

      {/* Main Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-white">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#033F99]" />
            Collection Information
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-600">Invoice ID</p>
              <p className="text-base font-medium text-slate-900">
                {collection.invoice_id}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Customer ID</p>
              <p className="text-base font-medium text-slate-900">
                {collection.customer_id}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Collection Priority</p>
              <p className="text-base font-medium text-slate-900">
                {collection.collection_priority}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Dunning Level</p>
              <p className="text-base font-medium text-slate-900">
                Level {collection.dunning_level}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-[#033F99]" />
            Payment Details
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-600">Due Date</p>
              <p className="text-base font-medium text-slate-900 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                {collection.due_date
                  ? new Date(collection.due_date).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Payment Method</p>
              <p className="text-base font-medium text-slate-900">
                {collection.payment_method || "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Payment Reference</p>
              <p className="text-base font-medium text-slate-900">
                {collection.payment_reference || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Bank Account</p>
              <p className="text-base font-medium text-slate-900">
                {collection.bank_account || "N/A"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Payment Actions */}
      {collection.payment_status !== "Paid" && (
        <Card className="p-6 bg-[#EBF3FC] border-[#6B9FE6]">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Record Payment
          </h3>
          {!showPaymentDialog ? (
            <Button
              onClick={() => setShowPaymentDialog(true)}
              className="bg-gradient-to-r from-[#033F99] to-[#033F99] hover:from-[#033F99] hover:to-[#033F99]"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Payment Amount (₹)
                  </label>
                  <Input
                    type="number"
                    value={paymentData.amount}
                    onChange={(e) =>
                      setPaymentData((prev) => ({
                        ...prev,
                        amount: parseFloat(e.target.value),
                      }))
                    }
                    min="0"
                    step="0.01"
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={paymentData.method}
                    onChange={(e) =>
                      setPaymentData((prev) => ({
                        ...prev,
                        method: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Reference Number
                  </label>
                  <Input
                    value={paymentData.reference}
                    onChange={(e) =>
                      setPaymentData((prev) => ({
                        ...prev,
                        reference: e.target.value,
                      }))
                    }
                    placeholder="UTR/Ref number"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleRecordPayment}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Payment
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowPaymentDialog(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default CollectDetail;
