import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  UserX,
  ChevronDown,
  CheckCircle,
  Clock,
  AlertTriangle,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { authService } from "../../../utils/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PeopleList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [people, setPeople] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    fetchPeople();
  }, [statusFilter, typeFilter]);

  const fetchPeople = async () => {
    try {
      const token = authService.getToken();
      let url = `${API_URL}/api/ib-workforce/people?`;
      if (statusFilter) url += `status=${statusFilter}&`;
      if (typeFilter) url += `person_type=${typeFilter}&`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setPeople(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch people:", error);
      toast.error("Failed to load people");
    } finally {
      setLoading(false);
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

  const getTypeColor = (type) => {
    switch (type) {
      case "employee":
        return "bg-blue-100 text-blue-700";
      case "contractor":
        return "bg-purple-100 text-purple-700";
      case "vendor":
        return "bg-amber-100 text-amber-700";
      case "external":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredPeople = people.filter(
    (p) =>
      `${p.first_name} ${p.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const stats = [
    {
      label: "Total People",
      value: people.length,
      icon: Users,
      color: "text-[#033F99]",
    },
    {
      label: "Active",
      value: people.filter((p) => p.status === "active").length,
      icon: CheckCircle,
      color: "text-emerald-600",
    },
    {
      label: "Draft",
      value: people.filter((p) => p.status === "draft").length,
      icon: Clock,
      color: "text-gray-600",
    },
    {
      label: "Suspended",
      value: people.filter((p) => p.status === "suspended").length,
      icon: AlertTriangle,
      color: "text-amber-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50" data-testid="people-list">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  People Directory
                </h1>
                <p className="text-sm text-gray-500">
                  Manage workforce identity & lifecycle
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/ib-workforce/people/create")}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#3A4E63] text-white rounded-lg hover:bg-[#022B6B] transition-colors"
              data-testid="create-person-btn"
            >
              <Plus className="h-4 w-4" />
              Add Person
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center ${stat.color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
                data-testid="search-input"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
              data-testid="status-filter"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="exited">Exited</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
              data-testid="type-filter"
            >
              <option value="">All Types</option>
              <option value="employee">Employee</option>
              <option value="contractor">Contractor</option>
              <option value="vendor">Vendor</option>
              <option value="external">External</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Person
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#3A4E63]"></div>
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : filteredPeople.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No people found.{" "}
                    <button
                      onClick={() => navigate("/ib-workforce/people/create")}
                      className="text-[#3A4E63] hover:underline"
                    >
                      Add your first person
                    </button>
                  </td>
                </tr>
              ) : (
                filteredPeople.map((person) => (
                  <tr
                    key={person.person_id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      navigate(`/ib-workforce/people/${person.person_id}`)
                    }
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                          {person.first_name?.charAt(0)}
                          {person.last_name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {person.first_name} {person.last_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {person.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(person.person_type)}`}
                      >
                        {person.person_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {person.department_name || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {person.location || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(person.status)}`}
                      >
                        {person.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className="flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() =>
                            navigate(`/ib-workforce/people/${person.person_id}`)
                          }
                          className="p-1.5 text-gray-400 hover:text-[#3A4E63] hover:bg-gray-100 rounded"
                          data-testid={`view-${person.person_id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {person.status !== "exited" && (
                          <button
                            onClick={() =>
                              navigate(
                                `/ib-workforce/people/${person.person_id}/edit`,
                              )
                            }
                            className="p-1.5 text-gray-400 hover:text-[#3A4E63] hover:bg-gray-100 rounded"
                            data-testid={`edit-${person.person_id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                      </div>
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

export default PeopleList;
