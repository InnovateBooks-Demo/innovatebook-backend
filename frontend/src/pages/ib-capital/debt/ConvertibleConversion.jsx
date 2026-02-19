import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  Calculator,
  ArrowRight,
  AlertCircle,
  Check,
  DollarSign,
  PieChart,
} from "lucide-react";
import { authService } from "../../../utils/auth";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ConvertibleConversion = () => {
  const { debt_id } = useParams();
  const navigate = useNavigate();
  const [debt, setDebt] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const [conversionParams, setConversionParams] = useState({
    valuation_cap: "",
    discount_rate: "",
    instrument_id: "INS002",
  });

  useEffect(() => {
    fetchDebt();
  }, [debt_id]);

  const fetchDebt = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/ib-capital/debt/instruments/${debt_id}`,
        {
          headers: { Authorization: `Bearer ${authService.getToken()}` },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setDebt(data);
        // Set default values from debt record
        if (data.valuation_cap) {
          setConversionParams((prev) => ({
            ...prev,
            valuation_cap: data.valuation_cap,
          }));
        }
        if (data.discount_rate) {
          setConversionParams((prev) => ({
            ...prev,
            discount_rate: data.discount_rate,
          }));
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreview = async () => {
    try {
      let url = `${API_URL}/api/ib-capital/debt/${debt_id}/conversion-preview`;
      const params = new URLSearchParams();
      if (conversionParams.valuation_cap)
        params.append("valuation_cap", conversionParams.valuation_cap);
      if (conversionParams.discount_rate)
        params.append("discount_rate", conversionParams.discount_rate);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${authService.getToken()}` },
      });
      if (response.ok) {
        const data = await response.json();
        setPreview(data);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleConvert = async () => {
    if (!preview) {
      toast.error("Please preview conversion first");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to convert this note to equity? This action cannot be undone.",
      )
    ) {
      return;
    }

    setConverting(true);
    try {
      const response = await fetch(
        `${API_URL}/api/ib-capital/debt/${debt_id}/convert`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authService.getToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            valuation_cap:
              parseInt(conversionParams.valuation_cap) || undefined,
            discount_rate:
              parseInt(conversionParams.discount_rate) || undefined,
            instrument_id: conversionParams.instrument_id,
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        navigate("/ib-capital/debt");
      } else {
        const error = await response.json();
        toast.error(error.detail);
      }
    } catch (error) {
      toast.error("Failed to convert note");
    } finally {
      setConverting(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    return `₹${amount?.toLocaleString("en-IN") || 0}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#033F99]"></div>
      </div>
    );
  }

  if (!debt) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <p className="text-gray-500">Debt instrument not found</p>
      </div>
    );
  }

  if (debt.debt_type !== "convertible_note") {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-lg mx-auto mt-20 text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Not a Convertible Note
          </h2>
          <p className="text-gray-500 mb-4">
            Only convertible notes can be converted to equity.
          </p>
          <Link
            to="/ib-capital/debt"
            className="text-[#033F99] hover:underline"
          >
            Back to Debt Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (debt.status === "converted") {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-lg mx-auto mt-20 text-center">
          <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Already Converted
          </h2>
          <p className="text-gray-500 mb-4">
            This note has already been converted to equity.
          </p>
          <Link
            to="/ib-capital/debt"
            className="text-[#033F99] hover:underline"
          >
            Back to Debt Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const totalToConvert =
    (debt.outstanding_principal || 0) + (debt.accrued_interest || 0);

  return (
    <div
      className="min-h-screen bg-gray-50 p-6"
      data-testid="convertible-conversion"
    >
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/ib-capital/debt"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Debt Dashboard
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white">
            <RefreshCw className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Convert Note to Equity
            </h1>
            <p className="text-gray-500">{debt.lender_name}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Note Details */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Convertible Note Details
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Lender</span>
                <span className="font-medium text-gray-900">
                  {debt.lender_name}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Principal Amount</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(debt.outstanding_principal)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Accrued Interest</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(debt.accrued_interest)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Total to Convert</span>
                <span className="font-bold text-lg text-orange-600">
                  {formatCurrency(totalToConvert)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Interest Rate</span>
                <span className="font-medium text-gray-900">
                  {debt.interest_rate}% {debt.interest_type}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500">Maturity Date</span>
                <span className="font-medium text-gray-900">
                  {debt.maturity_date}
                </span>
              </div>
            </div>
          </div>

          {/* Conversion Parameters */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Conversion Parameters
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valuation Cap (₹)
                </label>
                <input
                  type="number"
                  value={conversionParams.valuation_cap}
                  onChange={(e) =>
                    setConversionParams({
                      ...conversionParams,
                      valuation_cap: e.target.value,
                    })
                  }
                  placeholder="e.g., 100000000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum valuation for conversion calculation
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Rate (%)
                </label>
                <input
                  type="number"
                  value={conversionParams.discount_rate}
                  onChange={(e) =>
                    setConversionParams({
                      ...conversionParams,
                      discount_rate: e.target.value,
                    })
                  }
                  placeholder="e.g., 20"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Discount on price per share vs current round
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Convert to Instrument
                </label>
                <select
                  value={conversionParams.instrument_id}
                  onChange={(e) =>
                    setConversionParams({
                      ...conversionParams,
                      instrument_id: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                >
                  <option value="INS001">Common Shares</option>
                  <option value="INS002">Series A Preferred</option>
                </select>
              </div>
              <button
                onClick={fetchPreview}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2"
              >
                <Calculator className="w-4 h-4" />
                Calculate Conversion
              </button>
            </div>
          </div>
        </div>

        {/* Conversion Preview */}
        <div className="space-y-6">
          {preview ? (
            <>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Conversion Preview
                </h2>

                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Debt Amount</p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(preview.total_to_convert)}
                      </p>
                    </div>
                    <ArrowRight className="w-6 h-6 text-gray-400" />
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Shares to Issue</p>
                      <p className="text-xl font-bold text-purple-600">
                        {preview.shares_to_issue?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Principal</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(preview.principal)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Interest</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(preview.accrued_interest)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Valuation Cap</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(preview.valuation_cap)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Discount Rate</span>
                    <span className="font-medium text-gray-900">
                      {preview.discount_rate}%
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Cap Price/Share</span>
                    <span className="font-medium text-gray-900">
                      ₹{preview.cap_price_per_share?.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">
                      Discounted Price/Share
                    </span>
                    <span className="font-medium text-gray-900">
                      ₹{preview.discounted_price_per_share?.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 bg-green-50 px-3 rounded-lg">
                    <span className="text-green-700 font-medium">
                      Conversion Price
                    </span>
                    <span className="font-bold text-green-700">
                      ₹{preview.conversion_price?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Post-Conversion Ownership
                </h3>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 relative">
                    <PieChart className="w-24 h-24 text-purple-200" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-purple-600">
                        {preview.post_conversion_ownership_percentage}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600">
                      {preview.lender} will own approximately{" "}
                      <span className="font-bold text-purple-600">
                        {preview.post_conversion_ownership_percentage}%
                      </span>{" "}
                      of the company after conversion.
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {preview.shares_to_issue?.toLocaleString()} new shares to
                      be issued
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleConvert}
                disabled={converting}
                className="w-full px-4 py-3 bg-[#033F99] text-white rounded-lg hover:bg-[#022B6B] disabled:opacity-50 flex items-center justify-center gap-2 text-lg font-medium"
              >
                <DollarSign className="w-5 h-5" />
                {converting ? "Converting..." : "Execute Conversion"}
              </button>
            </>
          ) : (
            <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
              <Calculator className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Calculate Conversion
              </h3>
              <p className="text-gray-500 mb-4">
                Set the conversion parameters and click &quot;Calculate
                Conversion&quot; to see a preview of the conversion.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConvertibleConversion;
