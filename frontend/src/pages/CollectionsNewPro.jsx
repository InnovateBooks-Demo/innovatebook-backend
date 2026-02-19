import React, { useState, useEffect } from "react";
import { collectionsAPI } from "../utils/api";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Search,
} from "lucide-react";

const CollectionsNewPro = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      const response = await collectionsAPI.getAll();
      setCollections(response.data);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load collections");
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

  const filteredCollections = collections.filter(
    (col) =>
      col.entity_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      col.reference?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalCollected = collections.reduce(
    (sum, col) => sum + (col.amount || 0),
    0,
  );
  const thisMonth = collections.filter((col) => {
    const colDate = new Date(col.date);
    const now = new Date();
    return (
      colDate.getMonth() === now.getMonth() &&
      colDate.getFullYear() === now.getFullYear()
    );
  });
  const monthlyTotal = thisMonth.reduce(
    (sum, col) => sum + (col.amount || 0),
    0,
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className="text-3xl font-bold text-gray-900"
              style={{ fontFamily: "Poppins" }}
            >
              Collections
            </h1>
            <p className="text-gray-600 mt-1">
              {filteredCollections.length} payment records
            </p>
          </div>
          <Button
            style={{ backgroundColor: "#033F99" }}
            className="text-white hover:opacity-90"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Record Collection
          </Button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search collections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Collected
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {formatCurrency(totalCollected)}
          </p>
          <p className="text-sm text-gray-500">All time</p>
        </Card>

        <Card className="p-6 bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              This Month
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {formatCurrency(monthlyTotal)}
          </p>
          <p className="text-sm text-gray-500">{thisMonth.length} payments</p>
        </Card>

        <Card className="p-6 bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Records
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {collections.length}
          </p>
          <p className="text-sm text-gray-500">Collections</p>
        </Card>
      </div>

      <Card className="bg-white shadow-lg border-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCollections.map((collection, index) => (
                <tr
                  key={collection.id}
                  className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="font-semibold text-gray-900">
                        {formatDate(collection.date)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-blue-600 font-semibold">
                      {collection.reference}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">
                      {collection.entity_name}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="font-bold text-green-600">
                      {formatCurrency(collection.amount)}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {collection.payment_method || "Bank Transfer"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                      Collected
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default CollectionsNewPro;
