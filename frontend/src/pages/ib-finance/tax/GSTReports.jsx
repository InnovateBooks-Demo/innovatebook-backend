import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Download,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Calculator,
} from "lucide-react";
import { toast } from "sonner";
import { authService } from "../../../utils/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const GSTReports = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [period, setPeriod] = useState("2025-01");
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [gstr1Data, setGstr1Data] = useState(null);
  const [gstr3bData, setGstr3bData] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = authService.getToken();

      // Fetch dashboard summary
      const dashRes = await fetch(
        `${API_URL}/api/ib-finance/gst/dashboard?period=${period}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (dashRes.ok) {
        const data = await dashRes.json();
        setDashboard(data.data);
      }

      // Fetch GSTR-1 data
      const gstr1Res = await fetch(
        `${API_URL}/api/ib-finance/gst/gstr1?period=${period}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (gstr1Res.ok) {
        const data = await gstr1Res.json();
        setGstr1Data(data.data);
      }

      // Fetch GSTR-3B data
      const gstr3bRes = await fetch(
        `${API_URL}/api/ib-finance/gst/gstr3b?period=${period}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (gstr3bRes.ok) {
        const data = await gstr3bRes.json();
        setGstr3bData(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch GST data:", error);
      toast.error("Failed to load GST reports");
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = (reportType) => {
    toast.success(`${reportType} report download started`);
    // In production, this would generate and download a PDF/JSON file
  };

  const getStatusBadge = (status) => {
    const styles = {
      filed: "bg-green-100 text-green-700",
      pending: "bg-amber-100 text-amber-700",
      overdue: "bg-red-100 text-red-700",
    };
    const icons = {
      filed: <CheckCircle className="h-3 w-3" />,
      pending: <Clock className="h-3 w-3" />,
      overdue: <AlertCircle className="h-3 w-3" />,
    };
    return (
      <span
        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}
      >
        {icons[status] || icons.pending}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const tabs = [
    { id: "dashboard", name: "Dashboard" },
    { id: "gstr1", name: "GSTR-1" },
    { id: "gstr3b", name: "GSTR-3B" },
  ];

  return (
    <div className="min-h-screen bg-gray-50" data-testid="gst-reports">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate("/ib-finance/tax")}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-500">
              IB Finance → Tax → GST Reports
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-rose-100 rounded-xl flex items-center justify-center">
                <Calculator className="h-7 w-7 text-rose-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  GST Reports
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  GSTR-1 & GSTR-3B compliance reports
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="2025-01">January 2025</option>
                <option value="2024-12">December 2024</option>
                <option value="2024-11">November 2024</option>
                <option value="2024-10">October 2024</option>
              </select>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-6 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "text-rose-600 border-rose-600"
                    : "text-gray-500 border-transparent hover:text-gray-700"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
          </div>
        ) : (
          <>
            {/* Dashboard Tab */}
            {activeTab === "dashboard" && dashboard && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-red-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-500">
                        Output Tax
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(dashboard.output_tax)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {dashboard.transaction_count?.output || 0} transactions
                    </p>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <TrendingDown className="h-5 w-5 text-green-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-500">
                        Input Tax Credit
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(dashboard.input_tax_credit)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {dashboard.transaction_count?.input || 0} transactions
                    </p>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                        <Calculator className="h-5 w-5 text-amber-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-500">
                        Net Liability
                      </p>
                    </div>
                    <p
                      className={`text-2xl font-bold ${dashboard.net_liability >= 0 ? "text-amber-600" : "text-green-600"}`}
                    >
                      {formatCurrency(Math.abs(dashboard.net_liability))}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {dashboard.net_liability >= 0
                        ? "Payable"
                        : "Credit Balance"}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-[#033F99]" />
                      </div>
                      <p className="text-sm font-medium text-gray-500">
                        Filing Status
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">GSTR-1</span>
                        {getStatusBadge(dashboard.filing_status?.gstr1)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">GSTR-3B</span>
                        {getStatusBadge(dashboard.filing_status?.gstr3b)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Report Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          GSTR-1
                        </h3>
                        <p className="text-sm text-gray-500">
                          Outward supplies details
                        </p>
                      </div>
                      {getStatusBadge(dashboard.filing_status?.gstr1)}
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Monthly return for outward supplies to be filed by the
                      11th of the following month.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setActiveTab("gstr1")}
                        className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                      >
                        View Report
                      </button>
                      <button
                        onClick={() => downloadReport("GSTR-1")}
                        className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          GSTR-3B
                        </h3>
                        <p className="text-sm text-gray-500">
                          Summary return with tax payment
                        </p>
                      </div>
                      {getStatusBadge(dashboard.filing_status?.gstr3b)}
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Monthly summary return with tax liability to be filed by
                      the 20th of the following month.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setActiveTab("gstr3b")}
                        className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                      >
                        View Report
                      </button>
                      <button
                        onClick={() => downloadReport("GSTR-3B")}
                        className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* GSTR-1 Tab */}
            {activeTab === "gstr1" && gstr1Data && (
              <div className="space-y-6">
                {/* Grand Total Summary */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    GSTR-1 Summary - {period}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">
                        Total Invoices
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {gstr1Data.grand_total?.total_invoices || 0}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">
                        Taxable Value
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(
                          gstr1Data.grand_total?.total_taxable_value,
                        )}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">CGST</p>
                      <p className="text-lg font-bold text-[#033F99]">
                        {formatCurrency(gstr1Data.grand_total?.total_cgst)}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">SGST</p>
                      <p className="text-lg font-bold text-purple-600">
                        {formatCurrency(gstr1Data.grand_total?.total_sgst)}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">IGST</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(gstr1Data.grand_total?.total_igst)}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Total Tax</p>
                      <p className="text-lg font-bold text-red-600">
                        {formatCurrency(gstr1Data.grand_total?.total_tax)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sections */}
                {Object.entries(gstr1Data.sections || {}).map(
                  ([key, section]) => (
                    <div
                      key={key}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                    >
                      <button
                        onClick={() =>
                          setExpandedSection(
                            expandedSection === key ? null : key,
                          )
                        }
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {expandedSection === key ? (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          )}
                          <div className="text-left">
                            <h4 className="font-semibold text-gray-900">
                              {section.title}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {section.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <span className="text-gray-500">
                            {section.summary?.count || 0} invoices
                          </span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(section.summary?.invoice_value)}
                          </span>
                        </div>
                      </button>

                      {expandedSection === key &&
                        section.invoices?.length > 0 && (
                          <div className="border-t border-gray-200">
                            <table className="w-full">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                    Invoice
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                    Party
                                  </th>
                                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                                    Taxable
                                  </th>
                                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                                    CGST
                                  </th>
                                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                                    SGST
                                  </th>
                                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                                    IGST
                                  </th>
                                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                                    Total
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {section.invoices.map((inv, idx) => (
                                  <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                      <p className="font-medium text-gray-900">
                                        {inv.invoice_number || "-"}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {inv.invoice_date?.split("T")[0]}
                                      </p>
                                    </td>
                                    <td className="px-6 py-4">
                                      <p className="text-gray-700">
                                        {inv.party_name}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {inv.party_gstin || "No GSTIN"}
                                      </p>
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-900">
                                      {formatCurrency(inv.taxable_value)}
                                    </td>
                                    <td className="px-6 py-4 text-right text-[#033F99]">
                                      {formatCurrency(inv.cgst)}
                                    </td>
                                    <td className="px-6 py-4 text-right text-purple-600">
                                      {formatCurrency(inv.sgst)}
                                    </td>
                                    <td className="px-6 py-4 text-right text-green-600">
                                      {formatCurrency(inv.igst)}
                                    </td>
                                    <td className="px-6 py-4 text-right font-semibold text-gray-900">
                                      {formatCurrency(inv.invoice_value)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                      {expandedSection === key &&
                        (!section.invoices ||
                          section.invoices.length === 0) && (
                          <div className="px-6 py-8 text-center text-gray-500 border-t border-gray-200">
                            No invoices in this category
                          </div>
                        )}
                    </div>
                  ),
                )}
              </div>
            )}

            {/* GSTR-3B Tab */}
            {activeTab === "gstr3b" && gstr3bData && (
              <div className="space-y-6">
                {/* Summary */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    GSTR-3B Summary - {period}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                      <p className="text-sm text-red-600 mb-1">
                        Total Output Tax
                      </p>
                      <p className="text-2xl font-bold text-red-700">
                        {formatCurrency(gstr3bData.summary?.total_output_tax)}
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                      <p className="text-sm text-green-600 mb-1">Total ITC</p>
                      <p className="text-2xl font-bold text-green-700">
                        {formatCurrency(
                          gstr3bData.summary?.total_input_tax_credit,
                        )}
                      </p>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                      <p className="text-sm text-amber-600 mb-1">
                        Net Tax Payable
                      </p>
                      <p className="text-2xl font-bold text-amber-700">
                        {formatCurrency(gstr3bData.summary?.net_tax_payable)}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 mb-2">Breakdown</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">CGST:</span>
                          <span className="font-medium">
                            {formatCurrency(
                              gstr3bData.summary?.breakdown?.cgst_payable,
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">SGST:</span>
                          <span className="font-medium">
                            {formatCurrency(
                              gstr3bData.summary?.breakdown?.sgst_payable,
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">IGST:</span>
                          <span className="font-medium">
                            {formatCurrency(
                              gstr3bData.summary?.breakdown?.igst_payable,
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3.1 - Outward Supplies */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h4 className="font-semibold text-gray-900">
                      {gstr3bData.sections?.section_3_1?.title}
                    </h4>
                  </div>
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                          Description
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                          Taxable Value
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                          IGST
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                          CGST
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                          SGST/UTGST
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                          Cess
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {gstr3bData.sections?.section_3_1?.rows?.map(
                        (row, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {row.description}
                            </td>
                            <td className="px-6 py-4 text-right text-gray-900">
                              {formatCurrency(row.taxable_value)}
                            </td>
                            <td className="px-6 py-4 text-right text-green-600">
                              {formatCurrency(row.integrated_tax)}
                            </td>
                            <td className="px-6 py-4 text-right text-[#033F99]">
                              {formatCurrency(row.central_tax)}
                            </td>
                            <td className="px-6 py-4 text-right text-purple-600">
                              {formatCurrency(row.state_ut_tax)}
                            </td>
                            <td className="px-6 py-4 text-right text-gray-500">
                              {formatCurrency(row.cess)}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Section 4 - Eligible ITC */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h4 className="font-semibold text-gray-900">
                      {gstr3bData.sections?.section_4?.title}
                    </h4>
                  </div>
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                          Description
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                          IGST
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                          CGST
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                          SGST/UTGST
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                          Cess
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {gstr3bData.sections?.section_4?.rows?.map((row, idx) => (
                        <tr
                          key={idx}
                          className={`hover:bg-gray-50 ${row.description.includes("Net ITC") ? "bg-green-50" : ""}`}
                        >
                          <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                            {row.description}
                          </td>
                          <td className="px-6 py-4 text-right text-green-600">
                            {formatCurrency(row.integrated_tax)}
                          </td>
                          <td className="px-6 py-4 text-right text-[#033F99]">
                            {formatCurrency(row.central_tax)}
                          </td>
                          <td className="px-6 py-4 text-right text-purple-600">
                            {formatCurrency(row.state_ut_tax)}
                          </td>
                          <td className="px-6 py-4 text-right text-gray-500">
                            {formatCurrency(row.cess)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Section 6 - Payment of Tax */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h4 className="font-semibold text-gray-900">
                      {gstr3bData.sections?.section_6?.title}
                    </h4>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-red-50 rounded-lg">
                        <p className="text-sm text-red-600 font-medium mb-2">
                          Tax Payable
                        </p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>IGST:</span>
                            <span className="font-medium">
                              {formatCurrency(
                                gstr3bData.sections?.section_6?.summary
                                  ?.integrated_tax,
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>CGST:</span>
                            <span className="font-medium">
                              {formatCurrency(
                                gstr3bData.sections?.section_6?.summary
                                  ?.central_tax,
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>SGST:</span>
                            <span className="font-medium">
                              {formatCurrency(
                                gstr3bData.sections?.section_6?.summary
                                  ?.state_ut_tax,
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-600 font-medium mb-2">
                          ITC Utilized
                        </p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>IGST:</span>
                            <span className="font-medium">
                              {formatCurrency(
                                gstr3bData.sections?.section_6?.itc_utilized
                                  ?.integrated_tax,
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>CGST:</span>
                            <span className="font-medium">
                              {formatCurrency(
                                gstr3bData.sections?.section_6?.itc_utilized
                                  ?.central_tax,
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>SGST:</span>
                            <span className="font-medium">
                              {formatCurrency(
                                gstr3bData.sections?.section_6?.itc_utilized
                                  ?.state_ut_tax,
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-amber-50 rounded-lg">
                        <p className="text-sm text-amber-600 font-medium mb-2">
                          Cash Payable
                        </p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>IGST:</span>
                            <span className="font-medium">
                              {formatCurrency(
                                gstr3bData.sections?.section_6?.cash_payable
                                  ?.integrated_tax,
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>CGST:</span>
                            <span className="font-medium">
                              {formatCurrency(
                                gstr3bData.sections?.section_6?.cash_payable
                                  ?.central_tax,
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>SGST:</span>
                            <span className="font-medium">
                              {formatCurrency(
                                gstr3bData.sections?.section_6?.cash_payable
                                  ?.state_ut_tax,
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Download Button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => downloadReport("GSTR-3B")}
                    className="flex items-center gap-2 px-6 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                  >
                    <Download className="h-5 w-5" />
                    Download GSTR-3B
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GSTReports;
