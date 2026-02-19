import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, ArrowLeft, Loader2, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ProcureContractsList = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/workflow/procure/contracts`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) setContracts(data.contracts || []);
    } catch (error) {
      toast.error("Failed to fetch contracts");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      draft: "bg-gray-100 text-gray-700",
      review: "bg-blue-100 text-blue-700",
      signed: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#033F99]" />
      </div>
    );

  return (
    <div
      className="min-h-screen bg-gray-50"
      data-testid="procure-contracts-list"
    >
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate("/commerce/procure-workflow/commits")}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-500">
              Procurement Workflow → Contract
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
              <FileText className="h-7 w-7 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Procurement Contracts
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Stage 4 of Procurement Workflow - Contract signing
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="px-8 py-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-100 text-gray-700 rounded-xl p-4">
            <p className="text-xs font-medium uppercase">Total</p>
            <p className="text-2xl font-bold mt-1">{contracts.length}</p>
          </div>
          <div className="bg-blue-100 text-blue-700 rounded-xl p-4">
            <p className="text-xs font-medium uppercase">Draft</p>
            <p className="text-2xl font-bold mt-1">
              {contracts.filter((c) => c.status === "draft").length}
            </p>
          </div>
          <div className="bg-yellow-100 text-yellow-700 rounded-xl p-4">
            <p className="text-xs font-medium uppercase">Review</p>
            <p className="text-2xl font-bold mt-1">
              {contracts.filter((c) => c.status === "review").length}
            </p>
          </div>
          <div className="bg-green-100 text-green-700 rounded-xl p-4">
            <p className="text-xs font-medium uppercase">Signed</p>
            <p className="text-2xl font-bold mt-1">
              {contracts.filter((c) => c.status === "signed").length}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Contract ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Vendor
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">
                  Value
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contracts.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No contracts yet.
                  </td>
                </tr>
              ) : (
                contracts.map((contract) => (
                  <tr
                    key={contract.contract_id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      navigate(
                        `/commerce/procure-workflow/contracts/${contract.contract_id}`,
                      )
                    }
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-[#033F99]">
                        {contract.contract_id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">
                        {contract.vendor_id || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-gray-900">
                        ₹{(contract.total_value || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(contract.status)}`}
                      >
                        {contract.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProcureContractsList;
