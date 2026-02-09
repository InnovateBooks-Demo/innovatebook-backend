import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Edit,
  Play,
  CheckCircle,
  PieChart,
} from "lucide-react";
import { authService } from "../../../utils/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const RoundDetail = () => {
  const { round_id } = useParams();
  const [round, setRound] = useState(null);
  const [dilution, setDilution] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [round_id]);

  const fetchData = async () => {
    try {
      const [roundRes, dilutionRes] = await Promise.all([
        fetch(`${API_URL}/api/ib-capital/funding-rounds/${round_id}`, {
          headers: { Authorization: `Bearer ${authService.getToken()}` },
        }),
        fetch(`${API_URL}/api/ib-capital/dilution-analysis/${round_id}`, {
          headers: { Authorization: `Bearer ${authService.getToken()}` },
        }),
      ]);
      setRound(await roundRes.json());
      setDilution(await dilutionRes.json());
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
    return `₹${amount?.toLocaleString("en-IN") || 0}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3A4E63]"></div>
      </div>
    );
  }

  if (!round) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <p className="text-gray-500">Funding round not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" data-testid="round-detail">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/ib-capital/equity"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Equity
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {round.round_name}
              </h1>
              <span
                className={`px-3 py-1 text-sm rounded-full ${
                  round.status === "closed"
                    ? "bg-green-100 text-green-700"
                    : round.status === "open"
                      ? "bg-blue-100 text-blue-700"
                      : round.status === "planned"
                        ? "bg-gray-100 text-gray-700"
                        : "bg-red-100 text-red-700"
                }`}
              >
                {round.status}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {round.status === "planned" && (
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2">
                <Play className="w-4 h-4" />
                Open Round
              </button>
            )}
            {round.status === "open" && (
              <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Close Round
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Pre-Money Valuation</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(round.pre_money_valuation)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Post-Money Valuation</p>
          <p className="text-2xl font-bold text-[#3A4E63]">
            {formatCurrency(round.post_money_valuation)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Target Amount</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(round.target_amount)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Raised Amount</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(round.raised_amount)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dilution Analysis */}
        {dilution && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-[#3A4E63]" />
              Dilution Analysis
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Pre-Round Shares</span>
                <span className="font-bold text-gray-900">
                  {dilution.pre_round_shares?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">New Shares Issued</span>
                <span className="font-bold text-green-600">
                  +{dilution.new_shares_issued?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Post-Round Shares</span>
                <span className="font-bold text-gray-900">
                  {dilution.post_round_shares?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="text-gray-600">Dilution</span>
                <span className="font-bold text-red-600">
                  {dilution.dilution_percentage}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Equity Issues */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#3A4E63]" />
            Equity Issues ({round.equity_issues?.length || 0})
          </h2>
          {round.equity_issues?.length > 0 ? (
            <div className="space-y-3">
              {round.equity_issues.map((issue) => (
                <div
                  key={issue.issue_id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {issue.shares_issued?.toLocaleString()} shares
                    </p>
                    <p className="text-xs text-gray-500">
                      @ ₹{issue.price_per_share}/share • {issue.issue_date}
                    </p>
                  </div>
                  <span className="font-bold text-green-600">
                    {formatCurrency(
                      issue.shares_issued * issue.price_per_share,
                    )}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              No equity issues in this round
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoundDetail;
