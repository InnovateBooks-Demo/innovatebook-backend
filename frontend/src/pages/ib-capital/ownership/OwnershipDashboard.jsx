import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  PieChart,
  Plus,
  Search,
  Download,
  Eye,
} from "lucide-react";
import { authService } from "../../../utils/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const OwnershipDashboard = () => {
  const [capTable, setCapTable] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("cap-table");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [capRes, ownersRes] = await Promise.all([
        fetch(`${API_URL}/api/ib-capital/cap-table`, {
          headers: { Authorization: `Bearer ${authService.getToken()}` },
        }),
        fetch(`${API_URL}/api/ib-capital/owners`, {
          headers: { Authorization: `Bearer ${authService.getToken()}` },
        }),
      ]);
      const capData = await capRes.json();
      const ownersData = await ownersRes.json();
      setCapTable(capData.cap_table || []);
      setOwners(ownersData.owners || []);
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

  const filteredCapTable = capTable.filter((entry) =>
    entry.owner_name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredOwners = owners.filter((owner) =>
    owner.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3A4E63]"></div>
      </div>
    );
  }

  const totalShares = capTable.reduce((sum, e) => sum + (e.shares || 0), 0);

  return (
    <div
      className="min-h-screen bg-gray-50 p-6"
      data-testid="ownership-dashboard"
    >
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <PieChart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Ownership</h1>
              <p className="text-gray-500">Cap Table & Shareholder Registry</p>
            </div>
          </div>
          <Link
            to="/ib-capital/ownership/create"
            className="px-4 py-2 bg-[#3A4E63] text-white rounded-lg hover:bg-[#022B6B] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Shareholder
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Shareholders</p>
          <p className="text-2xl font-bold text-gray-900">{owners.length}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Shares</p>
          <p className="text-2xl font-bold text-gray-900">
            {totalShares.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Estimated Value</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(totalShares * 10)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Active Owners</p>
          <p className="text-2xl font-bold text-gray-900">
            {owners.filter((o) => o.status === "active").length}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-100 px-4">
          <div className="flex gap-6">
            {["cap-table", "shareholders"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-[#3A4E63] text-[#3A4E63]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab === "cap-table" ? "Cap Table" : "Shareholders"}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Filter */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]/20"
              />
            </div>
            <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {activeTab === "cap-table" && (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Shareholder
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Shares
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Ownership %
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCapTable.map((entry) => (
                  <tr
                    key={entry.owner_id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#033F99] font-semibold text-sm">
                          {entry.owner_name?.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">
                          {entry.owner_name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          entry.owner_type === "individual"
                            ? "bg-blue-100 text-blue-700"
                            : entry.owner_type === "entity"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {entry.owner_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900">
                      {entry.shares?.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#3A4E63] rounded-full"
                            style={{
                              width: `${Math.min(entry.ownership_percentage, 100)}%`,
                            }}
                          />
                        </div>
                        <span className="font-medium text-gray-900">
                          {entry.ownership_percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link
                        to={`/ib-capital/ownership/${entry.owner_id}`}
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

          {activeTab === "shareholders" && (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Country
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOwners.map((owner) => (
                  <tr
                    key={owner.owner_id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#033F99] font-semibold text-sm">
                          {owner.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {owner.name}
                          </p>
                          <p className="text-xs text-gray-500">{owner.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          owner.owner_type === "individual"
                            ? "bg-blue-100 text-blue-700"
                            : owner.owner_type === "entity"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {owner.owner_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{owner.country}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          owner.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {owner.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link
                        to={`/ib-capital/ownership/${owner.owner_id}`}
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
        </div>
      </div>
    </div>
  );
};

export default OwnershipDashboard;
