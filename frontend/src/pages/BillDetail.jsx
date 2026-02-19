import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { billAPI } from "../utils/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, FileText } from "lucide-react";

const BillDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBillDetails();
  }, [id]);

  const loadBillDetails = async () => {
    try {
      const response = await billAPI.getDetails(id);
      setData(response.data);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load bill details");
      setLoading(false);
    }
  };

  const formatCurrency = (amount) =>
    `₹${amount?.toLocaleString("en-IN", { maximumFractionDigits: 2 }) || 0}`;
  const formatDate = (date) => new Date(date).toLocaleDateString("en-IN");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const bill = data?.bill;
  const daysOverdue = data?.days_overdue || 0;
  const bucket = data?.bucket;

  return (
    <div className="p-8" data-testid="bill-detail-page">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/bills")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1
              className="text-3xl font-semibold"
              style={{ fontFamily: "Inter", color: "#033F99" }}
            >
              Bill {bill?.bill_number}
            </h1>
            <p className="text-gray-600">{bill?.vendor_name}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="chart-container">
          <CardHeader>
            <CardTitle style={{ color: "#033F99" }}>Bill Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Bill Date</span>
                <span className="font-medium">
                  {formatDate(bill?.bill_date)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Vendor</span>
                <span className="font-medium">{bill?.vendor_name}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Base Amount</span>
                <span className="font-medium">
                  {formatCurrency(bill?.base_amount)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">
                  GST ({bill?.gst_percent}%)
                </span>
                <span className="font-medium">
                  {formatCurrency(bill?.gst_amount)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Total Amount</span>
                <span
                  className="font-semibold text-lg"
                  style={{ color: "#033F99" }}
                >
                  {formatCurrency(bill?.total_amount)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Category</span>
                <span className="badge badge-info">
                  {bill?.expense_category}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="chart-container">
          <CardHeader>
            <CardTitle style={{ color: "#033F99" }}>
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Due Date</span>
                <span className="font-medium">
                  {formatDate(bill?.due_date)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Amount Paid</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(bill?.amount_paid)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Amount Outstanding</span>
                <span className="font-semibold text-red-600">
                  {formatCurrency(bill?.amount_outstanding)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Status</span>
                <span
                  className={`badge ${bill?.status === "Paid"
                      ? "badge-success"
                      : bill?.status === "Partially Paid"
                        ? "badge-warning"
                        : "badge-danger"
                    }`}
                >
                  {bill?.status}
                </span>
              </div>
              {daysOverdue > 0 && (
                <div className="flex justify-between py-2 bg-red-50 px-4 rounded-lg">
                  <span className="font-semibold text-red-700">
                    Days Overdue
                  </span>
                  <span className="font-semibold text-xl text-red-700">
                    {daysOverdue} Days
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BillDetail;
