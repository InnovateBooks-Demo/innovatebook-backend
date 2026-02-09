import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet,
  Plus,
  Search,
  FileText,
  Calculator,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { authService } from "../../../utils/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PayrollDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [payruns, setPayruns] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [compensation, setCompensation] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = authService.getToken();

      const [payrunsRes, payslipsRes, compRes] = await Promise.all([
        fetch(`${API_URL}/api/ib-workforce/payruns`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/ib-workforce/payslips`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/ib-workforce/compensation`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (payrunsRes.ok) {
        const data = await payrunsRes.json();
        setPayruns(data.data || []);
      }
      if (payslipsRes.ok) {
        const data = await payslipsRes.json();
        setPayslips(data.data || []);
      }
      if (compRes.ok) {
        const data = await compRes.json();
        setCompensation(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch payroll data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayrun = async () => {
    try {
      const token = authService.getToken();
      const period = new Date().toISOString().substring(0, 7); // YYYY-MM

      const response = await fetch(`${API_URL}/api/ib-workforce/payruns`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ period, payroll_group: "default" }),
      });

      if (response.ok) {
        toast.success("Pay run created");
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.detail || "Failed to create pay run");
      }
    } catch (error) {
      toast.error("Failed to create pay run");
    }
  };

  const handleCalculate = async (payrunId) => {
    try {
      const token = authService.getToken();
      const response = await fetch(
        `${API_URL}/api/ib-workforce/payruns/${payrunId}/calculate`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        const data = await response.json();
        toast.success(
          `Payroll calculated: ${data.data.employees_processed} employees processed`,
        );
        fetchData();
      } else {
        toast.error("Failed to calculate payroll");
      }
    } catch (error) {
      toast.error("Failed to calculate payroll");
    }
  };

  const handleApprove = async (payrunId) => {
    try {
      const token = authService.getToken();
      const response = await fetch(
        `${API_URL}/api/ib-workforce/payruns/${payrunId}/approve`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        toast.success("Pay run approved");
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.detail || "Failed to approve");
      }
    } catch (error) {
      toast.error("Failed to approve pay run");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const totalPayroll = payruns
    .filter((p) => p.status === "approved")
    .reduce((sum, p) => sum + (p.total_net || 0), 0);

  const stats = [
    {
      label: "Total Pay Runs",
      value: payruns.length,
      icon: FileText,
      color: "text-blue-600",
    },
    {
      label: "Pending Approval",
      value: payruns.filter((p) => p.status === "calculated").length,
      icon: Clock,
      color: "text-amber-600",
    },
    {
      label: "Compensation Profiles",
      value: compensation.length,
      icon: Users,
      color: "text-purple-600",
    },
    {
      label: "Total Disbursed",
      value: formatCurrency(totalPayroll),
      icon: DollarSign,
      color: "text-emerald-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50" data-testid="payroll-dashboard">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Payroll Management
                </h1>
                <p className="text-sm text-gray-500">
                  Compensation, pay runs & payslips
                </p>
              </div>
            </div>
            <button
              onClick={handleCreatePayrun}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#3A4E63] text-white rounded-lg hover:bg-[#022B6B] transition-colors"
              data-testid="create-payrun-btn"
            >
              <Plus className="h-4 w-4" />
              New Pay Run
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center ${stat.color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pay Runs */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pay Runs</h3>
          {loading ? (
            <div className="py-8 text-center text-gray-500">Loading...</div>
          ) : payruns.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No pay runs created yet. Click "New Pay Run" to create your first
              payroll.
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Period
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Group
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Total Gross
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Total Net
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payruns.map((run, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {run.period}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {run.payroll_group}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatCurrency(run.total_gross)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                      {formatCurrency(run.total_net)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          run.status === "approved"
                            ? "bg-emerald-100 text-emerald-700"
                            : run.status === "posted"
                              ? "bg-purple-100 text-purple-700"
                              : run.status === "calculated"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {run.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {run.status === "draft" && (
                          <button
                            onClick={() => handleCalculate(run.payrun_id)}
                            className="text-sm text-[#3A4E63] hover:underline flex items-center gap-1"
                          >
                            <Calculator className="h-3 w-3" /> Calculate
                          </button>
                        )}
                        {run.status === "calculated" && (
                          <button
                            onClick={() => handleApprove(run.payrun_id)}
                            className="text-sm text-emerald-600 hover:underline flex items-center gap-1"
                          >
                            <CheckCircle className="h-3 w-3" /> Approve
                          </button>
                        )}
                        <button
                          onClick={() =>
                            navigate(`/ib-workforce/payroll/${run.payrun_id}`)
                          }
                          className="text-sm text-gray-600 hover:underline"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent Payslips */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Payslips
          </h3>
          {loading ? (
            <div className="py-8 text-center text-gray-500">Loading...</div>
          ) : payslips.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No payslips generated yet. Calculate a pay run to generate
              payslips.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {payslips.slice(0, 6).map((slip, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-900">
                      {slip.person_name}
                    </p>
                    <span className="text-xs text-gray-500">{slip.period}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Gross</span>
                      <span className="text-gray-900">
                        {formatCurrency(slip.gross_pay)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Deductions</span>
                      <span className="text-red-600">
                        -{formatCurrency(slip.total_deductions)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-medium border-t border-gray-200 pt-1 mt-1">
                      <span className="text-gray-700">Net Pay</span>
                      <span className="text-emerald-600">
                        {formatCurrency(slip.net_pay)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayrollDashboard;
