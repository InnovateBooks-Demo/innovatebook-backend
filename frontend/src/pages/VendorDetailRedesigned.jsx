import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { vendorAPI } from "../utils/api";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Receipt,
  DollarSign,
  TrendingDown,
  Calendar,
  Loader2,
  Edit,
  Trash2,
} from "lucide-react";

const VendorDetailRedesigned = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [bills, setBills] = useState([]);
  const [totalBilled, setTotalBilled] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadVendorDetails();
    }
  }, [id]);

  const loadVendorDetails = async () => {
    try {
      setLoading(true);
      console.log("Loading vendor details for ID:", id);
      const response = await vendorAPI.getDetails(id);
      console.log("Vendor details response:", response);
      const data = response.data;
      console.log("Vendor data:", data);
      setVendor(data.vendor);
      setBills(data.bills || []);
      setTotalBilled(data.total_billed || 0);
      setTotalPaid(data.total_paid || 0);
      setLoading(false);
    } catch (error) {
      console.error("Error loading vendor details:", error);
      toast.error(`Failed to load vendor details: ${error.message}`);
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/vendors/${id}/edit`);
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete ${vendor.name}? This action cannot be undone.`,
      )
    ) {
      try {
        await vendorAPI.delete(id);
        toast.success("Vendor deleted successfully");
        navigate("/vendors");
      } catch (error) {
        toast.error("Failed to delete vendor");
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Vendor not found
          </h3>
          <Button onClick={() => navigate("/vendors")}>Back to Vendors</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/vendors")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="h-8 w-px bg-gray-300" />
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-xl">
                  {vendor.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h1
                    className="text-2xl font-bold text-gray-900"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    {vendor.name}
                  </h1>
                  <p className="text-sm text-gray-500 font-mono">
                    #{vendor.vendor_id || "N/A"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2" onClick={handleEdit}>
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                className="gap-2 text-red-600 hover:bg-red-50"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Stats & Info */}
          <div className="space-y-6">
            {/* Stats Cards */}
            <Card className="p-6 bg-white border-0 shadow-md">
              <h3
                className="text-lg font-semibold text-gray-900 mb-4"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Financial Summary
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-red-600" />
                    <span className="text-sm font-medium text-gray-900">
                      Payable
                    </span>
                  </div>
                  <span className="text-lg font-bold text-red-600">
                    {formatCurrency(vendor.outstanding_amount || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <TrendingDown className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">
                      Total Paid
                    </span>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(totalPaid)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Receipt className="h-5 w-5 text-orange-600" />
                    <span className="text-sm font-medium text-gray-900">
                      Total Bills
                    </span>
                  </div>
                  <span className="text-lg font-bold text-orange-600">
                    {bills.length}
                  </span>
                </div>
              </div>
            </Card>

            {/* Contact Info */}
            <Card className="p-6 bg-white border-0 shadow-md">
              <h3
                className="text-lg font-semibold text-gray-900 mb-4"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Contact Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {vendor.email || "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {vendor.phone || "N/A"}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <span className="text-sm text-gray-900">
                    {vendor.address || "N/A"}
                  </span>
                </div>
              </div>
            </Card>

            {/* Tax Info */}
            <Card className="p-6 bg-white border-0 shadow-md">
              <h3
                className="text-lg font-semibold text-gray-900 mb-4"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Tax Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">GSTIN</p>
                  <p className="text-sm font-mono text-gray-900">
                    {vendor.gstin || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">PAN</p>
                  <p className="text-sm font-mono text-gray-900">
                    {vendor.pan || "N/A"}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Bills */}
          <div className="lg:col-span-2">
            <Card className="p-6 bg-white border-0 shadow-md">
              <div className="flex items-center justify-between mb-6">
                <h3
                  className="text-lg font-semibold text-gray-900"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Bill History
                </h3>
                <Button
                  style={{ backgroundColor: "#033F99" }}
                  className="text-white gap-2"
                  onClick={() => navigate("/bills/create")}
                >
                  <Receipt className="h-4 w-4" />
                  New Bill
                </Button>
              </div>

              {bills.length === 0 ? (
                <div className="text-center py-12">
                  <Receipt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    No bills yet
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Create the first bill for this vendor
                  </p>
                  <Button onClick={() => navigate("/bills/create")}>
                    Create Bill
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                          Bill #
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                          Date
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                          Balance
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {bills.map((bill, index) => (
                        <tr
                          key={bill.id}
                          className={`border-b border-gray-100 hover:bg-orange-50 cursor-pointer ${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }`}
                          onClick={() => navigate(`/bills/${bill.id}`)}
                        >
                          <td className="px-4 py-3">
                            <span className="font-mono text-sm font-semibold text-orange-600">
                              {bill.bill_number}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-900">
                                {formatDate(bill.bill_date)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-sm font-semibold text-gray-900">
                              {formatCurrency(bill.total_amount || 0)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-sm font-semibold text-red-600">
                              {formatCurrency(bill.balance_due || 0)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${bill.status === "Paid"
                                  ? "bg-green-100 text-green-700"
                                  : bill.status === "Approved"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                            >
                              {bill.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDetailRedesigned;
