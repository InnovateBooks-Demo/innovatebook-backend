import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FileText, ArrowLeft, Edit, Trash2 } from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ContractsDetail = () => {
  const { contract_id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContract();
  }, [contract_id]);

  const fetchContract = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/modules/revenue/contracts/${contract_id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      if (data.success) setContract(data.contract);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this contract?")) return;
    const token = localStorage.getItem("access_token");
    await fetch(
      `${API_URL}/api/commerce/modules/revenue/contracts/${contract_id}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
    );
    navigate("/commerce/revenue/contracts");
  };

  const statusColors = {
    draft: "bg-gray-100 text-gray-700",
    active: "bg-green-100 text-green-700",
    expired: "bg-red-100 text-red-700",
    pending_renewal: "bg-yellow-100 text-yellow-700",
  };

  if (loading)
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#033F99] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  if (!contract)
    return (
      <div className="p-6 text-center">
        <p>Not found</p>
        <Link to="/commerce/revenue/contracts" className="text-[#033F99]">
          Back
        </Link>
      </div>
    );

  return (
    <div className="p-6" data-testid="contracts-detail">
      <div className="mb-6">
        <Link
          to="/commerce/revenue/contracts"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#033F99]/10 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#033F99]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {contract.contract_name || contract.name}
              </h1>
              <p className="text-sm text-gray-500">{contract.contract_id}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() =>
                navigate(`/commerce/revenue/contracts/${contract_id}/edit`)
              }
              className="flex items-center gap-2 px-4 py-2.5 border rounded-xl hover:bg-gray-50"
            >
              <Edit className="w-4 h-4" /> Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 rounded-xl hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4">Contract Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Customer</p>
              <p className="font-semibold">{contract.customer_name || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Type</p>
              <span className="px-2.5 py-1 bg-gray-100 rounded-lg text-sm font-medium capitalize">
                {contract.contract_type}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Value</p>
              <p className="text-2xl font-bold text-[#033F99]">
                ₹{contract.value?.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Payment Terms</p>
              <p className="font-semibold">{contract.payment_terms || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Start Date</p>
              <p className="font-semibold">{contract.start_date || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">End Date</p>
              <p className="font-semibold">{contract.end_date || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Auto Renew</p>
              <p className="font-semibold">
                {contract.auto_renew ? "Yes" : "No"}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4">Status</h2>
          <span
            className={`px-3 py-1 rounded-lg text-sm font-semibold capitalize ${statusColors[contract.status] || "bg-gray-100"}`}
          >
            {contract.status?.replace("_", " ")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ContractsDetail;
