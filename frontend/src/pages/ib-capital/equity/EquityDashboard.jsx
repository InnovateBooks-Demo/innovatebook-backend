import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  TrendingUp,
  Plus,
  Search,
  Eye,
  Play,
  CheckCircle,
} from "lucide-react";
import { authService } from "../../../utils/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const EquityDashboard = () => {
  const [rounds, setRounds] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("rounds");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [roundsRes, instrumentsRes] = await Promise.all([
        fetch(`${API_URL}/api/ib-capital/funding-rounds`, {
          headers: { Authorization: `Bearer ${authService.getToken()}` },
        }),
        fetch(`${API_URL}/api/ib-capital/instruments`, {
          headers: { Authorization: `Bearer ${authService.getToken()}` },
        }),
      ]);
      const roundsData = await roundsRes.json();
      const instrumentsData = await instrumentsRes.json();
      setRounds(roundsData.rounds || []);
      setInstruments(instrumentsData.instruments || []);
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#033F99]"></div>
      </div>
    );
  }

  const totalRaised = rounds.reduce(
    (sum, r) => sum + (r.raised_amount || 0),
    0,
  );
  const closedRounds = rounds.filter((r) => r.status === "closed").length;

  return (
    <div className="min-h-screen bg-gray-50 p-6" data-testid="equity-dashboard">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/ib-capital"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Capital
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Equity</h1>
              <p className="text-gray-500">Funding Rounds & Instruments</p>
            </div>
          </div>
          <Link
            to="/ib-capital/equity/create"
            className="px-4 py-2 bg-[#033F99] text-white rounded-lg hover:bg-[#022B6B] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Round
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Raised</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(totalRaised)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Funding Rounds</p>
          <p className="text-2xl font-bold text-gray-900">{rounds.length}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Closed Rounds</p>
          <p className="text-2xl font-bold text-gray-900">{closedRounds}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Instrument Classes</p>
          <p className="text-2xl font-bold text-gray-900">
            {instruments.length}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-100 px-4">
          <div className="flex gap-6">
            {["rounds", "instruments"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 text-sm font-medium border-b-2 transition-colors capitalize ${activeTab === tab
                    ? "border-[#033F99] text-[#033F99]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
              >
                {tab === "rounds" ? "Funding Rounds" : "Instruments"}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {activeTab === "rounds" && (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Round
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Pre-Money
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Target
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Raised
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {rounds.map((round) => (
                  <tr
                    key={round.round_id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {round.round_name}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">
                      {formatCurrency(round.pre_money_valuation)}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">
                      {formatCurrency(round.target_amount)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900">
                      {formatCurrency(round.raised_amount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${round.status === "closed"
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
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link
                        to={`/ib-capital/equity/${round.round_id}`}
                        className="p-2 hover:bg-gray-100 rounded-lg inline-block"
                      >
                        <Eye className="w-4 h-4 text-gray-500" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "instruments" && (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Class Name
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Par Value
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Voting
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Dividend
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Liq. Pref
                  </th>
                </tr>
              </thead>
              <tbody>
                {instruments.map((inst) => (
                  <tr
                    key={inst.instrument_id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {inst.class_name}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${inst.instrument_type === "common"
                            ? "bg-blue-100 text-blue-700"
                            : inst.instrument_type === "preferred"
                              ? "bg-purple-100 text-purple-700"
                              : inst.instrument_type === "esop"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-gray-100 text-gray-700"
                          }`}
                      >
                        {inst.instrument_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">
                      ₹{inst.par_value}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {inst.voting_rights ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {inst.dividend_rights ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">
                      {inst.liquidation_preference}x
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default EquityDashboard;
