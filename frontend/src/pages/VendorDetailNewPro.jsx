import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { vendorAPI, billAPI } from "../utils/api";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  DollarSign,
  FileText,
  Clock,
} from "lucide-react";

const VendorDetailNewPro = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVendorDetails();
  }, [id]);

  const loadVendorDetails = async () => {
    try {
      const [vendorRes, billsRes] = await Promise.all([
        vendorAPI.getDetails(id),
        billAPI.getAll(),
      ]);

      // The backend returns {vendor, bills, payments, ...} structure
      const vendorData = vendorRes.data.vendor || vendorRes.data;
      setVendor(vendorData);

      // Use bills from the detail response if available, otherwise filter from all bills
      const vendorBills =
        vendorRes.data.bills ||
        billsRes.data.filter((inv) => inv.vendor_id === id);
      setBills(vendorBills);
      setLoading(false);
    } catch (error) {
      console.error("Vendor details error:", error);
      toast.error("Failed to load vendor details");
      setLoading(false);
    }
  };

  const formatCurrency = (amount) =>
    `₹${amount?.toLocaleString("en-IN", { maximumFractionDigits: 2 }) || 0}`;
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const totalBilld = bills.reduce(
    (sum, inv) => sum + (inv.total_amount || 0),
    0,
  );
  const totalReceived = bills.reduce(
    (sum, inv) => sum + (inv.amount_received || 0),
    0,
  );
  const totalOutstanding = bills.reduce(
    (sum, inv) =>
      sum + (inv.total_amount - inv.tds_amount - inv.amount_received || 0),
    0,
  );
  const avgDSO =
    bills.length > 0
      ? bills.reduce((sum, inv) => sum + (inv.dso || 0), 0) / bills.length
      : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/vendors")}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Vendors
            </Button>
            <div className="h-8 w-px bg-gray-300"></div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Poppins" }}
              >
                #{vendor?.vendor_id}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">{vendor?.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total Billd
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {formatCurrency(totalBilld)}
            </p>
            <p className="text-sm text-gray-500">{bills.length} bills</p>
          </Card>

          <Card className="p-6 bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Received
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {formatCurrency(totalReceived)}
            </p>
            <p className="text-sm text-gray-500">
              {Math.round((totalReceived / totalBilld) * 100 || 0)}% collected
            </p>
          </Card>

          <Card className="p-6 bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Outstanding
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {formatCurrency(totalOutstanding)}
            </p>
            <p className="text-sm text-gray-500">Due amount</p>
          </Card>

          <Card className="p-6 bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Avg DSO
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {Math.round(avgDSO)}
            </p>
            <p className="text-sm text-gray-500">days</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 bg-white border-0 shadow-md">
              <h2
                className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"
                style={{ fontFamily: "Poppins" }}
              >
                <User className="h-5 w-5" style={{ color: "#3A4E63" }} />
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Email
                    </p>
                    <div className="flex items-center gap-2 text-gray-900">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <p className="font-semibold">{vendor?.email || "N/A"}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Phone
                    </p>
                    <div className="flex items-center gap-2 text-gray-900">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <p className="font-semibold">{vendor?.phone || "N/A"}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Address
                    </p>
                    <div className="flex items-center gap-2 text-gray-900">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <p className="font-semibold">
                        {vendor?.address || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white border-0 shadow-md">
              <h2
                className="text-lg font-bold text-gray-900 mb-4"
                style={{ fontFamily: "Poppins" }}
              >
                Recent Bills
              </h2>
              <div className="space-y-3">
                {bills.slice(0, 5).map((bill) => (
                  <div
                    key={bill.id}
                    className="p-4 border rounded-lg hover:bg-blue-50 cursor-pointer"
                    onClick={() => navigate(`/bills/${bill.id}`)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {bill.bill_number}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(bill.bill_date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {formatCurrency(bill.total_amount)}
                        </p>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            bill.status === "Paid"
                              ? "bg-green-100 text-green-700"
                              : bill.status === "Partially Paid"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {bill.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div>
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-[#EBF3FC] border-0 shadow-md">
              <h2
                className="text-lg font-bold text-gray-900 mb-4"
                style={{ fontFamily: "Poppins" }}
              >
                Quick Stats
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Paid Bills</span>
                  <span className="font-bold text-green-600">
                    {bills.filter((i) => i.status === "Paid").length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending Bills</span>
                  <span className="font-bold text-orange-600">
                    {bills.filter((i) => i.status !== "Paid").length}
                  </span>
                </div>
                <div className="h-px bg-gray-200"></div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-900">
                    Collection Rate
                  </span>
                  <span
                    className="font-bold text-xl"
                    style={{ color: "#3A4E63" }}
                  >
                    {Math.round((totalReceived / totalBilld) * 100 || 0)}%
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDetailNewPro;
