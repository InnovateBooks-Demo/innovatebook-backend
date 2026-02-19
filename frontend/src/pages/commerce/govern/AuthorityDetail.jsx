import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  UserCog,
  ArrowLeft,
  Edit,
  Trash2,
  DollarSign,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AuthorityDetail = () => {
  const { authority_id } = useParams();
  const navigate = useNavigate();
  const [authority, setAuthority] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuthority();
  }, [authority_id]);

  const fetchAuthority = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/modules/governance/authority/${authority_id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      if (data.success) setAuthority(data.authority);
    } catch (error) {
      toast.error("Failed to fetch authority");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this authority?")) return;
    try {
      const token = localStorage.getItem("access_token");
      await fetch(
        `${API_URL}/api/commerce/modules/governance/authority/${authority_id}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Authority deleted successfully");
      navigate("/commerce/govern/authority");
    } catch (error) {
      toast.error("Failed to delete authority");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#033F99]" />
      </div>
    );
  if (!authority)
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <UserCog className="h-12 w-12 text-gray-300 mb-4" />
        <p className="text-gray-500 mb-4">Authority not found</p>
        <button
          onClick={() => navigate("/commerce/govern/authority")}
          className="text-[#033F99] hover:underline"
        >
          Back to Authorities
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50" data-testid="authority-detail">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate("/commerce/govern/authority")}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-500">Back to Authorities</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#033F99]/10 rounded-xl flex items-center justify-center">
                <UserCog className="h-7 w-7 text-[#033F99]" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {authority.authority_name}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {authority.authority_id}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  navigate(`/commerce/govern/authority/${authority_id}/edit`)
                }
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Authority Details
              </h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Authority Type
                </p>
                <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium capitalize">
                  {authority.authority_type}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Level</p>
                <span className="inline-flex items-center px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium capitalize">
                  {authority.level}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Max Amount
                </p>
                <span className="inline-flex items-center text-xl font-semibold text-gray-900">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  {authority.max_amount?.toLocaleString()} {authority.currency}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Scope</p>
                <span className="text-gray-900 capitalize">
                  {authority.scope}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Status</h2>
            </div>
            <div className="p-6">
              <span
                className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold capitalize ${authority.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
              >
                <span
                  className={`w-2 h-2 rounded-full mr-2 ${authority.status === "active" ? "bg-green-500" : "bg-gray-500"}`}
                ></span>
                {authority.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorityDetail;
