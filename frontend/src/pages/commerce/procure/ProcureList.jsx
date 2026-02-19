import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card } from "../../../components/ui/card";
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit2,
  Trash2,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ProcureList = () => {
  const [procurements, setProcurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchProcurements();
  }, [statusFilter]);

  const fetchProcurements = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const response = await axios.get(
        `${BACKEND_URL}/api/commerce/procure${params}`,
      );
      setProcurements(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch procurements:", error);
      toast.error("Failed to load procurements");
      setLoading(false);
    }
  };

  const handleDelete = async (requisitionId) => {
    if (!window.confirm("Are you sure you want to delete this procurement?"))
      return;

    try {
      await axios.delete(
        `${BACKEND_URL}/api/commerce/procure/${requisitionId}`,
      );
      toast.success("Procurement deleted successfully");
      fetchProcurements();
    } catch (error) {
      console.error("Failed to delete procurement:", error);
      toast.error("Failed to delete procurement");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Draft: { bg: "bg-slate-100", text: "text-slate-700", icon: Clock },
      Requested: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        icon: AlertCircle,
      },
      Approved: {
        bg: "bg-[#C4D9F4]",
        text: "text-[#033F99]",
        icon: CheckCircle,
      },
      Ordered: {
        bg: "bg-purple-100",
        text: "text-purple-700",
        icon: ShoppingCart,
      },
      Received: {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        icon: Package,
      },
      Cancelled: { bg: "bg-red-100", text: "text-red-700", icon: XCircle },
    };

    const config = statusConfig[status] || statusConfig["Draft"];
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
      >
        <Icon className="h-3 w-3" />
        {status}
      </span>
    );
  };

  const filteredProcurements = procurements.filter((proc) => {
    const matchesSearch =
      proc.requisition_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proc.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proc.purchase_order_number
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProcurements = filteredProcurements.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredProcurements.length / itemsPerPage);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-2xl font-bold text-slate-900"
            style={{ fontFamily: "Poppins" }}
          >
            Procurement & Purchase Orders
          </h2>
          <p className="text-slate-600 mt-1">
            Manage vendor procurement and PO tracking
          </p>
        </div>
        <Link to="/commerce/procure/new">
          <Button className="gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
            <Plus className="h-4 w-4" />
            New Procurement
          </Button>
        </Link>
      </div>

      <Card className="p-4 bg-white border-slate-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Search by requisition ID, vendor, or PO number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Requested">Requested</option>
            <option value="Approved">Approved</option>
            <option value="Ordered">Ordered</option>
            <option value="Received">Received</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            More Filters
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        {[
          {
            label: "Total",
            value: procurements.length,
            color: "text-slate-900",
            icon: ShoppingCart,
          },
          {
            label: "Draft",
            value: procurements.filter((p) => p.procurement_status === "Draft")
              .length,
            color: "text-slate-600",
            icon: Clock,
          },
          {
            label: "Requested",
            value: procurements.filter(
              (p) => p.procurement_status === "Requested",
            ).length,
            color: "text-[#0147CC]",
            icon: AlertCircle,
          },
          {
            label: "Approved",
            value: procurements.filter(
              (p) => p.procurement_status === "Approved",
            ).length,
            color: "text-[#033F99]",
            icon: CheckCircle,
          },
          {
            label: "Ordered",
            value: procurements.filter(
              (p) => p.procurement_status === "Ordered",
            ).length,
            color: "text-purple-600",
            icon: ShoppingCart,
          },
          {
            label: "Received",
            value: procurements.filter(
              (p) => p.procurement_status === "Received",
            ).length,
            color: "text-emerald-600",
            icon: Package,
          },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={`item-${index}`}
              className="p-4 bg-white border-slate-200"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-600">{stat.label}</p>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </Card>
          );
        })}
      </div>

      <Card className="bg-white border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
                    Requisition ID <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  PO Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-500">
                      <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                      Loading procurements...
                    </div>
                  </td>
                </tr>
              ) : currentProcurements.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    No procurements found. Create your first procurement to get
                    started!
                  </td>
                </tr>
              ) : (
                currentProcurements.map((proc) => (
                  <tr
                    key={proc.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/commerce/procure/${proc.requisition_id}`}
                        className="text-sm font-medium text-purple-600 hover:text-purple-700"
                      >
                        {proc.requisition_id}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">
                        {proc.vendor_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">
                        {proc.purchase_order_number || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">
                        ₹
                        {(
                          (proc.po_value || proc.estimated_value) / 100000
                        ).toFixed(1)}
                        L
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(proc.procurement_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/commerce/procure/${proc.requisition_id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link
                          to={`/commerce/procure/${proc.requisition_id}/edit`}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(proc.requisition_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Showing {indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, filteredProcurements.length)} of{" "}
              {filteredProcurements.length} procurements
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProcureList;
