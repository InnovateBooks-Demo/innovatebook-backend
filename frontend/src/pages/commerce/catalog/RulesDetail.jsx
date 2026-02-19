import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Shield, ArrowLeft, Edit, Trash2 } from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const RulesDetail = () => {
  const { rule_id } = useParams();
  const navigate = useNavigate();
  const [rule, setRule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRule();
  }, [rule_id]);

  const fetchRule = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/modules/catalog/rules/${rule_id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      if (data.success) setRule(data.rule);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this rule?")) return;
    const token = localStorage.getItem("access_token");
    await fetch(`${API_URL}/api/commerce/modules/catalog/rules/${rule_id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    navigate("/commerce/catalog/rules");
  };

  if (loading)
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#033F99] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  if (!rule)
    return (
      <div className="p-6 text-center">
        <p>Not found</p>
        <Link to="/commerce/catalog/rules" className="text-[#033F99]">
          Back
        </Link>
      </div>
    );

  const priorityColors = {
    1: "bg-red-100 text-red-700",
    2: "bg-orange-100 text-orange-700",
    3: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="p-6" data-testid="rules-detail">
      <div className="mb-6">
        <Link
          to="/commerce/catalog/rules"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#033F99]/10 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-[#033F99]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{rule.rule_name}</h1>
              <p className="text-sm text-gray-500">{rule.rule_id}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() =>
                navigate(`/commerce/catalog/rules/${rule_id}/edit`)
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
          <h2 className="text-lg font-semibold mb-4">Rule Configuration</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <span className="px-2.5 py-1 bg-gray-100 rounded-lg text-sm font-medium capitalize">
                  {rule.rule_type}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Priority</p>
                <span
                  className={`px-2.5 py-1 rounded-lg text-sm font-semibold ${priorityColors[rule.priority] || "bg-blue-100 text-blue-700"}`}
                >
                  P{rule.priority}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Condition</p>
              <p className="font-mono bg-gray-50 p-3 rounded-lg text-sm">
                {rule.condition || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Action</p>
              <p className="font-semibold">{rule.action || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Description</p>
              <p className="text-gray-700">{rule.description || "-"}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4">Status</h2>
          <span
            className={`px-3 py-1 rounded-lg text-sm font-semibold capitalize ${rule.status === "active" ? "bg-green-100 text-green-700" : rule.status === "draft" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"}`}
          >
            {rule.status}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RulesDetail;
