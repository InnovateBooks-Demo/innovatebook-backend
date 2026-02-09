import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Building2,
  ArrowLeft,
  Edit2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Shield,
  Loader2,
  FileText,
  Receipt,
  Scale,
  ClipboardCheck,
  History,
  Users,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PartyEngineDetail = () => {
  const { party_id } = useParams();
  const navigate = useNavigate();
  const [party, setParty] = useState(null);
  const [profiles, setProfiles] = useState({});
  const [readiness, setReadiness] = useState({});
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchParty();
  }, [party_id]);

  const fetchParty = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/parties-engine/parties/${party_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) {
        setParty(data.party);
        setProfiles(data.profiles || {});
        setReadiness(data.readiness || {});
        setAuditLogs(data.audit_logs || []);
      }
    } catch (error) {
      toast.error("Failed to fetch party");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyProfile = async (profileType) => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/parties-engine/parties/${party_id}/${profileType}/verify`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) {
        toast.success(`${profileType} profile verified`);
        fetchParty();
      }
    } catch (error) {
      toast.error("Failed to verify profile");
    }
  };

  const handleUpdateStatus = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/parties-engine/parties/${party_id}/update-status`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) {
        toast.success(`Status updated to: ${data.status}`);
        fetchParty();
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      draft: "bg-gray-100 text-gray-700",
      minimum_ready: "bg-yellow-100 text-yellow-700",
      verified: "bg-green-100 text-green-700",
      restricted: "bg-orange-100 text-orange-700",
      blocked: "bg-red-100 text-red-700",
      pending: "bg-gray-100 text-gray-600",
      rejected: "bg-red-100 text-red-700",
    };
    return styles[status] || styles.pending;
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: Building2 },
    { id: "identity", label: "Identity", icon: Users },
    { id: "legal", label: "Legal", icon: FileText },
    { id: "tax", label: "Tax", icon: Receipt },
    { id: "risk", label: "Risk", icon: AlertTriangle },
    { id: "compliance", label: "Compliance", icon: ClipboardCheck },
    { id: "audit", label: "Audit", icon: History },
  ];

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#3A4E63]" />
      </div>
    );
  if (!party)
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Building2 className="h-12 w-12 text-gray-300 mb-4" />
        <p className="text-gray-500">Party not found</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50" data-testid="party-engine-detail">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate("/commerce/parties-engine")}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-500">
              Parties Engine → Detail
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center ${party.status === "verified" ? "bg-green-100" : party.status === "blocked" ? "bg-red-100" : "bg-gray-100"}`}
              >
                <Building2
                  className={`h-7 w-7 ${party.status === "verified" ? "text-green-600" : party.status === "blocked" ? "text-red-600" : "text-gray-600"}`}
                />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {party.legal_name}
                  </h1>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(party.status)}`}
                  >
                    {party.status?.replace("_", " ")}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm text-gray-500">
                    {party.party_id}
                  </span>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-500">{party.country}</span>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-500">
                    {(party.party_roles || []).join(", ")}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleUpdateStatus}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Scale className="h-4 w-4" />
                Recalculate Status
              </button>
              <button
                onClick={() =>
                  navigate(`/commerce/parties-engine/${party_id}/edit`)
                }
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#3A4E63] rounded-lg hover:bg-[#022d6e]"
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-8 flex gap-1 border-t border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-[#3A4E63] text-[#3A4E63]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Readiness Card */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">
                      Party Readiness
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-3 gap-6 mb-6">
                      <div
                        className={`p-4 rounded-lg border-2 ${readiness.can_evaluate ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {readiness.can_evaluate ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          <span className="font-semibold text-gray-900">
                            Can Evaluate
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Allowed to enter evaluation stage
                        </p>
                      </div>
                      <div
                        className={`p-4 rounded-lg border-2 ${readiness.can_commit ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {readiness.can_commit ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          <span className="font-semibold text-gray-900">
                            Can Commit
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Allowed to commit to deals
                        </p>
                      </div>
                      <div
                        className={`p-4 rounded-lg border-2 ${readiness.can_contract ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {readiness.can_contract ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          <span className="font-semibold text-gray-900">
                            Can Contract
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Allowed to sign contracts
                        </p>
                      </div>
                    </div>

                    {/* Blocking Reasons */}
                    {readiness.blocking_reasons &&
                      readiness.blocking_reasons.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 text-red-800 mb-2">
                            <AlertTriangle className="h-5 w-5" />
                            <span className="font-semibold">
                              Blocking Reasons
                            </span>
                          </div>
                          <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                            {readiness.blocking_reasons.map((reason, i) => (
                              <li key={i}>{reason}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {/* Missing Profiles */}
                    {readiness.missing_profiles &&
                      readiness.missing_profiles.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                          <div className="flex items-center gap-2 text-yellow-800 mb-2">
                            <Clock className="h-5 w-5" />
                            <span className="font-semibold">
                              Missing Profiles
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {readiness.missing_profiles.map((profile, i) => (
                              <span
                                key={i}
                                className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm capitalize"
                              >
                                {profile}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                {/* Profile Verification Status */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">
                      Profile Verification Status
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {[
                        {
                          key: "identity",
                          label: "Identity",
                          data: profiles.identity,
                        },
                        {
                          key: "legal",
                          label: "Legal Profile",
                          data: profiles.legal,
                        },
                        {
                          key: "tax",
                          label: "Tax Profile",
                          data: profiles.tax,
                        },
                        {
                          key: "risk",
                          label: "Risk Profile",
                          data: profiles.risk,
                        },
                        {
                          key: "compliance",
                          label: "Compliance Profile",
                          data: profiles.compliance,
                        },
                      ].map((profile) => {
                        const status =
                          profile.data?.verification_status ||
                          (profile.data ? "pending" : "missing");
                        const isVerified = status === "verified";

                        return (
                          <div
                            key={profile.key}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              {isVerified ? (
                                <CheckCircle2 className="h-6 w-6 text-green-500" />
                              ) : status === "missing" ? (
                                <XCircle className="h-6 w-6 text-gray-300" />
                              ) : (
                                <Clock className="h-6 w-6 text-yellow-500" />
                              )}
                              <div>
                                <p className="font-medium text-gray-900">
                                  {profile.label}
                                </p>
                                <p className="text-sm text-gray-500 capitalize">
                                  {status}
                                </p>
                              </div>
                            </div>
                            {!isVerified &&
                              profile.data &&
                              profile.key !== "risk" && (
                                <button
                                  onClick={() =>
                                    handleVerifyProfile(profile.key)
                                  }
                                  className="px-3 py-1.5 text-sm font-medium text-[#3A4E63] bg-[rgba(3,63,153,0.08)] rounded-lg hover:bg-blue-100"
                                >
                                  Verify
                                </button>
                              )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Identity Tab */}
            {activeTab === "identity" && profiles.identity && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    Identity Profile
                  </h2>
                </div>
                <div className="p-6 grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-gray-500">Legal Name</label>
                    <p className="font-medium text-gray-900">
                      {profiles.identity.legal_name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Trade Name</label>
                    <p className="font-medium text-gray-900">
                      {profiles.identity.trade_name || "-"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Country</label>
                    <p className="font-medium text-gray-900">
                      {profiles.identity.country}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">
                      Registration Number
                    </label>
                    <p className="font-medium text-gray-900">
                      {profiles.identity.registration_number || "-"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">
                      Business Type
                    </label>
                    <p className="font-medium text-gray-900 capitalize">
                      {profiles.identity.business_type?.replace("_", " ") ||
                        "-"}
                    </p>
                  </div>
                  {profiles.identity.address && (
                    <div className="col-span-2">
                      <label className="text-sm text-gray-500">Address</label>
                      <p className="font-medium text-gray-900">
                        {profiles.identity.address.city},{" "}
                        {profiles.identity.address.country}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Legal Tab */}
            {activeTab === "legal" && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">
                    Legal Profile
                  </h2>
                  {profiles.legal &&
                    profiles.legal.verification_status !== "verified" && (
                      <button
                        onClick={() => handleVerifyProfile("legal")}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                      >
                        Verify Legal
                      </button>
                    )}
                </div>
                <div className="p-6">
                  {profiles.legal ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="text-sm text-gray-500">
                            Verification Status
                          </label>
                          <p
                            className={`font-medium capitalize ${profiles.legal.verification_status === "verified" ? "text-green-600" : "text-yellow-600"}`}
                          >
                            {profiles.legal.verification_status}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">
                            Certificate Verified
                          </label>
                          <p className="font-medium text-gray-900">
                            {profiles.legal.certificate_verified ? "Yes" : "No"}
                          </p>
                        </div>
                      </div>
                      {profiles.legal.authorized_signatories &&
                        profiles.legal.authorized_signatories.length > 0 && (
                          <div>
                            <label className="text-sm text-gray-500 mb-2 block">
                              Authorized Signatories
                            </label>
                            <div className="space-y-2">
                              {profiles.legal.authorized_signatories.map(
                                (sig, i) => (
                                  <div
                                    key={i}
                                    className="p-3 bg-gray-50 rounded-lg flex items-center justify-between"
                                  >
                                    <div>
                                      <p className="font-medium text-gray-900">
                                        {sig.name}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        {sig.designation}
                                      </p>
                                    </div>
                                    {sig.verified && (
                                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    )}
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No legal profile found. Click Edit to add.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Tax Tab */}
            {activeTab === "tax" && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">
                    Tax Profile
                  </h2>
                  {profiles.tax &&
                    profiles.tax.verification_status !== "verified" && (
                      <button
                        onClick={() => handleVerifyProfile("tax")}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                      >
                        Verify Tax
                      </button>
                    )}
                </div>
                <div className="p-6">
                  {profiles.tax ? (
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm text-gray-500">
                          Tax Residency
                        </label>
                        <p className="font-medium text-gray-900">
                          {profiles.tax.tax_residency || "-"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Tax ID</label>
                        <p className="font-medium text-gray-900">
                          {profiles.tax.tax_id || "-"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">
                          Tax ID Type
                        </label>
                        <p className="font-medium text-gray-900 uppercase">
                          {profiles.tax.tax_id_type || "-"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">
                          Tax Classification
                        </label>
                        <p className="font-medium text-gray-900 capitalize">
                          {profiles.tax.tax_classification || "-"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">
                          Verification Status
                        </label>
                        <p
                          className={`font-medium capitalize ${profiles.tax.verification_status === "verified" ? "text-green-600" : "text-yellow-600"}`}
                        >
                          {profiles.tax.verification_status}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No tax profile found. Click Edit to add.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Risk Tab */}
            {activeTab === "risk" && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    Risk Profile
                  </h2>
                </div>
                <div className="p-6">
                  {profiles.risk ? (
                    <div className="space-y-6">
                      {/* Risk Score */}
                      <div className="text-center">
                        <div
                          className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-3xl font-bold ${
                            profiles.risk.risk_score >= 70
                              ? "bg-red-100 text-red-700"
                              : profiles.risk.risk_score >= 40
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                          }`}
                        >
                          {profiles.risk.risk_score}
                        </div>
                        <p
                          className={`mt-2 font-semibold capitalize ${
                            profiles.risk.risk_level === "high"
                              ? "text-red-600"
                              : profiles.risk.risk_level === "medium"
                                ? "text-yellow-600"
                                : "text-green-600"
                          }`}
                        >
                          {profiles.risk.risk_level} Risk
                        </p>
                      </div>

                      {/* Risk Components */}
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          {
                            label: "Country Risk",
                            value: profiles.risk.country_risk,
                          },
                          {
                            label: "Industry Risk",
                            value: profiles.risk.industry_risk,
                          },
                          {
                            label: "Credit Risk",
                            value: profiles.risk.credit_risk,
                          },
                          {
                            label: "Exposure Risk",
                            value: profiles.risk.exposure_risk,
                          },
                          {
                            label: "Sanctions Risk",
                            value: profiles.risk.sanctions_risk,
                          },
                        ].map((item, i) => (
                          <div key={i} className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">
                              {item.label}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 h-2 bg-gray-200 rounded-full">
                                <div
                                  className={`h-2 rounded-full ${item.value >= 70 ? "bg-red-500" : item.value >= 40 ? "bg-yellow-500" : "bg-green-500"}`}
                                  style={{ width: `${item.value}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {item.value}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Risk Factors */}
                      {profiles.risk.risk_factors &&
                        profiles.risk.risk_factors.length > 0 && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="font-semibold text-red-800 mb-2">
                              Risk Factors
                            </p>
                            <ul className="list-disc list-inside text-sm text-red-700">
                              {profiles.risk.risk_factors.map((f, i) => (
                                <li key={i}>{f}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No risk profile found.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Compliance Tab */}
            {activeTab === "compliance" && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">
                    Compliance Profile
                  </h2>
                  {profiles.compliance &&
                    profiles.compliance.verification_status !== "verified" && (
                      <button
                        onClick={() => handleVerifyProfile("compliance")}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                      >
                        Verify Compliance
                      </button>
                    )}
                </div>
                <div className="p-6">
                  {profiles.compliance ? (
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm text-gray-500">
                          KYC Status
                        </label>
                        <p
                          className={`font-medium capitalize ${profiles.compliance.kyc_status === "verified" ? "text-green-600" : "text-yellow-600"}`}
                        >
                          {profiles.compliance.kyc_status}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">
                          AML Check Status
                        </label>
                        <p
                          className={`font-medium capitalize ${profiles.compliance.aml_check_status === "verified" ? "text-green-600" : "text-yellow-600"}`}
                        >
                          {profiles.compliance.aml_check_status}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">
                          Sanctions Screened
                        </label>
                        <p className="font-medium text-gray-900">
                          {profiles.compliance.sanctions_screened
                            ? "Yes"
                            : "No"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">
                          Sanctions Clear
                        </label>
                        <p
                          className={`font-medium ${profiles.compliance.sanctions_clear ? "text-green-600" : "text-red-600"}`}
                        >
                          {profiles.compliance.sanctions_clear
                            ? "Clear"
                            : "Flagged"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">
                          Verification Status
                        </label>
                        <p
                          className={`font-medium capitalize ${profiles.compliance.verification_status === "verified" ? "text-green-600" : profiles.compliance.verification_status === "rejected" ? "text-red-600" : "text-yellow-600"}`}
                        >
                          {profiles.compliance.verification_status}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No compliance profile found.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Audit Tab */}
            {activeTab === "audit" && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    Audit Log
                  </h2>
                </div>
                <div className="p-6">
                  {auditLogs.length > 0 ? (
                    <div className="space-y-4">
                      {auditLogs.map((log, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <History className="h-5 w-5 text-[#033F99]" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 capitalize">
                              {log.action?.replace(/_/g, " ")}
                            </p>
                            <p className="text-sm text-gray-500">
                              By: {log.actor}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(log.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No audit logs found.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Quick Info
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Party ID</p>
                  <p className="font-mono text-[#3A4E63]">{party.party_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(party.status)}`}
                  >
                    {party.status?.replace("_", " ")}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Readiness</p>
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(readiness.readiness_status)}`}
                  >
                    {readiness.readiness_status?.replace("_", " ")}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created From</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {party.created_source}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="font-medium text-gray-900">
                    {new Date(party.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Roles */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Party Roles
                </h2>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2">
                  {(party.party_roles || []).map((role, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium capitalize"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartyEngineDetail;
