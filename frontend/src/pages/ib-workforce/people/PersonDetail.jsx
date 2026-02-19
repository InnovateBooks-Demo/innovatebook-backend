import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Users,
  ArrowLeft,
  Edit,
  UserCheck,
  UserX,
  LogOut,
  Shield,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Briefcase,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { authService } from "../../../utils/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PersonDetail = () => {
  const { person_id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [person, setPerson] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchPerson();
  }, [person_id]);

  const fetchPerson = async () => {
    try {
      const token = authService.getToken();
      const response = await fetch(
        `${API_URL}/api/ib-workforce/people/${person_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setPerson(data.data);
      } else {
        toast.error("Person not found");
        navigate("/ib-workforce/people");
      }
    } catch (error) {
      console.error("Failed to fetch person:", error);
      toast.error("Failed to load person details");
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    try {
      const token = authService.getToken();
      const response = await fetch(
        `${API_URL}/api/ib-workforce/people/${person_id}/activate`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        toast.success("Person activated successfully");
        fetchPerson();
      } else {
        const error = await response.json();
        toast.error(error.detail || "Failed to activate");
      }
    } catch (error) {
      toast.error("Failed to activate person");
    }
  };

  const handleSuspend = async () => {
    if (!window.confirm("Are you sure you want to suspend this person?"))
      return;

    try {
      const token = authService.getToken();
      const response = await fetch(
        `${API_URL}/api/ib-workforce/people/${person_id}/suspend`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: "Administrative suspension" }),
        },
      );
      if (response.ok) {
        toast.success("Person suspended");
        fetchPerson();
      } else {
        toast.error("Failed to suspend");
      }
    } catch (error) {
      toast.error("Failed to suspend person");
    }
  };

  const handleExit = async () => {
    if (
      !window.confirm(
        "Are you sure you want to exit this person? This action is irreversible.",
      )
    )
      return;

    try {
      const token = authService.getToken();
      const response = await fetch(
        `${API_URL}/api/ib-workforce/people/${person_id}/exit`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: "Voluntary exit" }),
        },
      );
      if (response.ok) {
        toast.success("Person exited successfully");
        fetchPerson();
      } else {
        toast.error("Failed to exit");
      }
    } catch (error) {
      toast.error("Failed to exit person");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-700";
      case "draft":
        return "bg-gray-100 text-gray-700";
      case "suspended":
        return "bg-amber-100 text-amber-700";
      case "exited":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#033F99]"></div>
      </div>
    );
  }

  if (!person) return null;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "employment", label: "Employment" },
    { id: "legal", label: "Legal & KYC" },
    { id: "roles", label: "Roles" },
    { id: "audit", label: "Audit" },
  ];

  return (
    <div className="min-h-screen bg-gray-50" data-testid="person-detail">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <button
            onClick={() => navigate("/ib-workforce/people")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to People
          </button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                {person.first_name?.charAt(0)}
                {person.last_name?.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {person.first_name} {person.last_name}
                  </h1>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(person.status)}`}
                  >
                    {person.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{person.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {person.status === "draft" && (
                <button
                  onClick={handleActivate}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  data-testid="activate-btn"
                >
                  <UserCheck className="h-4 w-4" />
                  Activate
                </button>
              )}
              {person.status === "active" && (
                <button
                  onClick={handleSuspend}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                  data-testid="suspend-btn"
                >
                  <UserX className="h-4 w-4" />
                  Suspend
                </button>
              )}
              {person.status === "suspended" && (
                <button
                  onClick={handleActivate}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  <UserCheck className="h-4 w-4" />
                  Reactivate
                </button>
              )}
              {person.status !== "exited" && (
                <>
                  <button
                    onClick={() =>
                      navigate(`/ib-workforce/people/${person_id}/edit`)
                    }
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    data-testid="edit-btn"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={handleExit}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    data-testid="exit-btn"
                  >
                    <LogOut className="h-4 w-4" />
                    Exit
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 mt-6 border-b border-gray-200 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                    ? "border-[#033F99] text-[#033F99]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {activeTab === "overview" && (
          <div className="grid grid-cols-3 gap-6">
            {/* Basic Info */}
            <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Basic Information
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">
                      {person.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900">
                      {person.phone || "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Department</p>
                    <p className="text-sm font-medium text-gray-900">
                      {person.department_name || "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="text-sm font-medium text-gray-900">
                      {person.location || "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Person Type</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {person.person_type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Joining Date</p>
                    <p className="text-sm font-medium text-gray-900">
                      {person.joining_date || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Status
                </h3>
                <div className="flex items-center gap-3">
                  {person.status === "active" ? (
                    <CheckCircle className="h-8 w-8 text-emerald-500" />
                  ) : person.status === "draft" ? (
                    <Clock className="h-8 w-8 text-gray-500" />
                  ) : (
                    <AlertTriangle className="h-8 w-8 text-amber-500" />
                  )}
                  <div>
                    <p className="text-lg font-semibold text-gray-900 capitalize">
                      {person.status}
                    </p>
                    <p className="text-xs text-gray-500">Current Status</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Assigned Roles
                </h3>
                {person.role_assignments?.length > 0 ? (
                  <div className="space-y-2">
                    {person.role_assignments.map((ra, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-purple-500" />
                        <span className="text-sm text-gray-700">
                          {ra.role_id}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No roles assigned</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "employment" && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Employment Profile
            </h3>
            {person.employment_profile ? (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-gray-500">Employee Code</p>
                  <p className="text-sm font-medium text-gray-900">
                    {person.employment_profile.employee_code || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Designation</p>
                  <p className="text-sm font-medium text-gray-900">
                    {person.employment_profile.designation || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Cost Center</p>
                  <p className="text-sm font-medium text-gray-900">
                    {person.employment_profile.cost_center || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Employment Status</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {person.employment_profile.employment_status || "-"}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No employment profile available
              </p>
            )}
          </div>
        )}

        {activeTab === "legal" && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Legal & KYC Profile
            </h3>
            {person.legal_profile ? (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-gray-500">Government ID Type</p>
                  <p className="text-sm font-medium text-gray-900">
                    {person.legal_profile.government_id_type || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Government ID Number</p>
                  <p className="text-sm font-medium text-gray-900">
                    {person.legal_profile.government_id_number || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tax Identifier</p>
                  <p className="text-sm font-medium text-gray-900">
                    {person.legal_profile.tax_identifier || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Country of Residence</p>
                  <p className="text-sm font-medium text-gray-900">
                    {person.legal_profile.country_of_residence || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Verification Status</p>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${person.legal_profile.verification_status === "verified"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                      }`}
                  >
                    {person.legal_profile.verification_status}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No legal profile available. Add legal profile to activate this
                person.
              </p>
            )}
          </div>
        )}

        {activeTab === "roles" && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Role Assignments
              </h3>
              {person.status === "active" && (
                <button className="text-sm text-[#033F99] hover:underline">
                  + Assign Role
                </button>
              )}
            </div>
            {person.role_assignments?.length > 0 ? (
              <div className="space-y-3">
                {person.role_assignments.map((ra, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {ra.role_id}
                        </p>
                        <p className="text-xs text-gray-500">
                          Since {ra.effective_from?.split("T")[0]}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${ra.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-700"
                        }`}
                    >
                      {ra.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No roles assigned to this person
              </p>
            )}
          </div>
        )}

        {activeTab === "audit" && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Audit Trail
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                <div className="w-2 h-2 mt-2 rounded-full bg-emerald-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Person Created
                  </p>
                  <p className="text-xs text-gray-500">{person.created_at}</p>
                </div>
              </div>
              {person.status === "active" && (
                <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                  <div className="w-2 h-2 mt-2 rounded-full bg-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Person Activated
                    </p>
                    <p className="text-xs text-gray-500">{person.updated_at}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonDetail;
