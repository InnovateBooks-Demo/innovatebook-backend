// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Search,
//   Plus,
//   Eye,
//   Edit2,
//   MoreHorizontal,
//   Users,
//   Building2,
//   UserCheck,
//   TrendingUp,
//   Filter,
//   Download,
//   RefreshCw,
//   Mail,
//   Phone,
// } from "lucide-react";
// import axios from "axios";
// import { toast } from "sonner";

// const API_URL = process.env.REACT_APP_BACKEND_URL;

// const CustomersList = () => {
//   const navigate = useNavigate();
//   const [customers, setCustomers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedStatus, setSelectedStatus] = useState("all");
//   const [selectedType, setSelectedType] = useState("all");

//   useEffect(() => {
//     fetchCustomers();
//   }, []);

//   const fetchCustomers = async () => {
//     try {
//       const token = localStorage.getItem("access_token");
//       const response = await axios.get(
//         `${API_URL}/api/commerce/parties/customers`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         },
//       );
//       if (response.data.success) setCustomers(response.data.customers || []);
//     } catch (error) {
//       toast.error("Failed to load customers");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredCustomers = customers.filter((item) => {
//     const matchesSearch =
//       item.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       item.customer_id?.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesStatus =
//       selectedStatus === "all" || item.status === selectedStatus;
//     const matchesType =
//       selectedType === "all" || item.customer_type === selectedType;
//     return matchesSearch && matchesStatus && matchesType;
//   });

//   const getStatusConfig = (status) => {
//     const configs = {
//       active: {
//         color: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
//         dot: "bg-emerald-500",
//       },
//       on_hold: {
//         color: "bg-amber-50 text-amber-700 ring-amber-600/20",
//         dot: "bg-amber-500",
//       },
//       dormant: {
//         color: "bg-gray-50 text-gray-700 ring-gray-600/20",
//         dot: "bg-gray-500",
//       },
//       blocked: {
//         color: "bg-red-50 text-red-700 ring-red-600/20",
//         dot: "bg-red-500",
//       },
//     };
//     return configs[status] || configs["active"];
//   };

//   const getTypeColor = (type) => {
//     const colors = {
//       B2B: "bg-blue-100 text-blue-700",
//       B2C: "bg-purple-100 text-purple-700",
//       B2G: "bg-indigo-100 text-indigo-700",
//       Export: "bg-emerald-100 text-emerald-700",
//     };
//     return colors[type] || "bg-gray-100 text-gray-700";
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="flex flex-col items-center gap-3">
//           <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
//           <p className="text-sm text-gray-500">Loading customers...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50" data-testid="customers-list">
//       <div className="bg-white border-b border-gray-200">
//         <div className="px-8 py-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-2xl font-semibold text-gray-900">
//                 Customers
//               </h1>
//               <p className="mt-1 text-sm text-gray-500">
//                 Manage your customer relationships
//               </p>
//             </div>
//             <div className="flex items-center gap-3">
//               <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
//                 <Download className="h-4 w-4" />
//                 Export
//               </button>
//               <button
//                 onClick={() => navigate("/commerce/parties/customers/create")}
//                 className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#033F99] rounded-lg hover:bg-[#022d6e] transition-colors shadow-sm"
//               >
//                 <Plus className="h-4 w-4" />
//                 New Customer
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="px-8 py-6">
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//           <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-500">
//                   Total Customers
//                 </p>
//                 <p className="mt-2 text-3xl font-semibold text-gray-900">
//                   {customers.length}
//                 </p>
//               </div>
//               <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
//                 <Users className="h-6 w-6 text-blue-600" />
//               </div>
//             </div>
//           </div>
//           <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-500">Active</p>
//                 <p className="mt-2 text-3xl font-semibold text-gray-900">
//                   {customers.filter((c) => c.status === "active").length}
//                 </p>
//               </div>
//               <div className="h-12 w-12 rounded-lg bg-emerald-50 flex items-center justify-center">
//                 <UserCheck className="h-6 w-6 text-emerald-600" />
//               </div>
//             </div>
//           </div>
//           <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-500">B2B</p>
//                 <p className="mt-2 text-3xl font-semibold text-gray-900">
//                   {customers.filter((c) => c.customer_type === "B2B").length}
//                 </p>
//               </div>
//               <div className="h-12 w-12 rounded-lg bg-purple-50 flex items-center justify-center">
//                 <Building2 className="h-6 w-6 text-purple-600" />
//               </div>
//             </div>
//           </div>
//           <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-500">B2C</p>
//                 <p className="mt-2 text-3xl font-semibold text-gray-900">
//                   {customers.filter((c) => c.customer_type === "B2C").length}
//                 </p>
//               </div>
//               <div className="h-12 w-12 rounded-lg bg-amber-50 flex items-center justify-center">
//                 <TrendingUp className="h-6 w-6 text-amber-600" />
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl border border-gray-200 mb-6">
//           <div className="p-4 flex items-center justify-between gap-4">
//             <div className="flex items-center gap-3 flex-1">
//               <div className="relative flex-1 max-w-md">
//                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Search customers..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
//                 />
//               </div>
//               <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
//                 <Filter className="h-4 w-4" />
//                 Filters
//               </button>
//             </div>
//             <div className="flex items-center gap-3">
//               <select
//                 value={selectedType}
//                 onChange={(e) => setSelectedType(e.target.value)}
//                 className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
//               >
//                 <option value="all">All Types</option>
//                 <option value="B2B">B2B</option>
//                 <option value="B2C">B2C</option>
//                 <option value="B2G">B2G</option>
//                 <option value="Export">Export</option>
//               </select>
//               <select
//                 value={selectedStatus}
//                 onChange={(e) => setSelectedStatus(e.target.value)}
//                 className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
//               >
//                 <option value="all">All Status</option>
//                 <option value="active">Active</option>
//                 <option value="on_hold">On Hold</option>
//                 <option value="dormant">Dormant</option>
//                 <option value="blocked">Blocked</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead>
//               <tr className="bg-gray-50">
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                   Customer
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                   Contact
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                   Type
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                   Country
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200 bg-white">
//               {filteredCustomers.length === 0 ? (
//                 <tr>
//                   <td colSpan={6} className="px-6 py-16 text-center">
//                     <Users className="mx-auto h-12 w-12 text-gray-300" />
//                     <p className="mt-4 text-sm font-medium text-gray-900">
//                       No customers found
//                     </p>
//                     <button
//                       onClick={() =>
//                         navigate("/commerce/parties/customers/create")
//                       }
//                       className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#033F99] rounded-lg"
//                     >
//                       <Plus className="h-4 w-4" />
//                       New Customer
//                     </button>
//                   </td>
//                 </tr>
//               ) : (
//                 filteredCustomers.map((item) => {
//                   const statusConfig = getStatusConfig(item.status);
//                   const contact = item.contacts?.[0] || {};
//                   return (
//                     <tr
//                       key={item.customer_id}
//                       className="hover:bg-gray-50 cursor-pointer transition-colors"
//                       onClick={() =>
//                         navigate(
//                           `/commerce/parties/customers/${item.customer_id}`,
//                         )
//                       }
//                     >
//                       <td className="px-6 py-4">
//                         <div className="flex items-center gap-3">
//                           <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#033F99] to-[#0550c8] flex items-center justify-center text-white font-semibold text-sm">
//                             {(item.display_name || item.name)?.charAt(0) || "C"}
//                           </div>
//                           <div>
//                             <p className="text-sm font-medium text-gray-900">
//                               {item.display_name || item.name}
//                             </p>
//                             <p className="text-xs text-gray-500 font-mono">
//                               {item.customer_id}
//                             </p>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="space-y-1">
//                           {(contact.email || item.email) && (
//                             <div className="flex items-center gap-1 text-sm text-gray-600">
//                               <Mail className="h-3 w-3" />
//                               {contact.email || item.email}
//                             </div>
//                           )}
//                           {(contact.phone || item.phone) && (
//                             <div className="flex items-center gap-1 text-xs text-gray-500">
//                               <Phone className="h-3 w-3" />
//                               {contact.phone || item.phone}
//                             </div>
//                           )}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         {item.customer_type && (
//                           <span
//                             className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getTypeColor(item.customer_type)}`}
//                           >
//                             {item.customer_type}
//                           </span>
//                         )}
//                       </td>
//                       <td className="px-6 py-4">
//                         <span className="text-sm text-gray-600">
//                           {item.country_of_registration || "—"}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <span
//                           className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${statusConfig.color}`}
//                         >
//                           <span
//                             className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`}
//                           ></span>
//                           {item.status?.replace("_", " ") || "active"}
//                         </span>
//                       </td>
//                       <td
//                         className="px-6 py-4 text-right"
//                         onClick={(e) => e.stopPropagation()}
//                       >
//                         <div className="flex items-center justify-end gap-1">
//                           <button
//                             onClick={() =>
//                               navigate(
//                                 `/commerce/parties/customers/${item.customer_id}`,
//                               )
//                             }
//                             className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
//                           >
//                             <Eye className="h-4 w-4" />
//                           </button>
//                           <button
//                             onClick={() =>
//                               navigate(
//                                 `/commerce/parties/customers/${item.customer_id}/edit`,
//                               )
//                             }
//                             className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
//                           >
//                             <Edit2 className="h-4 w-4" />
//                           </button>
//                           <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
//                             <MoreHorizontal className="h-4 w-4" />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>
//         </div>
//         {filteredCustomers.length > 0 && (
//           <div className="mt-4 flex items-center justify-between">
//             <p className="text-sm text-gray-500">
//               Showing{" "}
//               <span className="font-medium">{filteredCustomers.length}</span> of{" "}
//               <span className="font-medium">{customers.length}</span> customers
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CustomersList;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Eye,
  Edit2,
  MoreHorizontal,
  Users,
  Building2,
  UserCheck,
  TrendingUp,
  Filter,
  Download,
  RefreshCw,
  Mail,
  Phone,
} from "lucide-react";

// ❌ DO NOT use raw axios (kept commented for reference)
// import axios from "axios";

// ✅ USE centralized API instance (auto auth + org handling)
import api from "@/utils/api";

import { toast } from "sonner";

// ❌ Not needed anymore (baseURL already handled by api.js)
// const API_URL = process.env.REACT_APP_BACKEND_URL;

// console.log("API_URL =", API_URL);

const CustomersList = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  useEffect(() => {
    fetchCustomers();
  }, []);

  /**
   * =====================================
   * ✅ FIXED: Fetch customers using api.js
   * =====================================
   * - Authorization header auto attached
   * - org_id / tenant context preserved
   * - Consistent with rest of application
   */
  // const fetchCustomers = async () => {
  //   try {
  //     const response = await api.get("/api/commerce/parties/customers");
  //     if (response.data?.success) {
  //       setCustomers(response.data.customers || []);
  //     } else {
  //       toast.error("Failed to load customers");
  //     }
  //   } catch (error) {
  //     console.error("Failed to load customers:", error);
  //     toast.error("Failed to load customers");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchCustomers = async () => {
    try {
      const response = await api.get("/api/commerce/parties/customers");

      if (response.data?.success) {
        setCustomers(response.data.customers || []);
      } else {
        // Backend responded but marked failure
        toast.error(response.data?.message || "Failed to load customers");
      }
    } catch (err) {
      console.error("Failed to load customers:", err);

      const data = err.response?.data;

      // 🔐 Permission error
      if (err.response?.status === 403) {
        toast.error(
          data?.detail || "You don’t have permission to view customers",
        );
      }

      // 💳 Subscription error
      else if (err.response?.status === 402) {
        toast.error(data?.message || "Subscription upgrade required");
        // OPTIONAL: open upgrade modal here
        // setShowUpgradeModal(true);
      }

      // 🔑 Auth error
      else if (err.response?.status === 401) {
        toast.error("Session expired. Please login again");
        // OPTIONAL: redirect to login
        // navigate("/login");
      }

      // ❌ Fallback
      else {
        toast.error(data?.message || "Failed to load customers");
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter((item) => {
    const matchesSearch =
      item.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customer_id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || item.status === selectedStatus;

    const matchesType =
      selectedType === "all" || item.customer_type === selectedType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusConfig = (status) => {
    const configs = {
      active: {
        color: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
        dot: "bg-emerald-500",
      },
      on_hold: {
        color: "bg-amber-50 text-amber-700 ring-amber-600/20",
        dot: "bg-amber-500",
      },
      dormant: {
        color: "bg-gray-50 text-gray-700 ring-gray-600/20",
        dot: "bg-gray-500",
      },
      blocked: {
        color: "bg-red-50 text-red-700 ring-red-600/20",
        dot: "bg-red-500",
      },
    };

    return configs[status] || configs.active;
  };

  const getTypeColor = (type) => {
    const colors = {
      B2B: "bg-blue-100 text-blue-700",
      B2C: "bg-purple-100 text-purple-700",
      B2G: "bg-indigo-100 text-indigo-700",
      Export: "bg-emerald-100 text-emerald-700",
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          <p className="text-sm text-gray-500">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="customers-list">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your customer relationships
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button
              onClick={() => navigate("/commerce/parties/customers/create")}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#033F99] rounded-lg hover:bg-[#022d6e]"
            >
              <Plus className="h-4 w-4" />
              New Customer
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredCustomers.map((item) => {
                const statusConfig = getStatusConfig(item.status);
                const contact = item.contacts?.[0] || {};

                return (
                  <tr
                    key={item.customer_id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      navigate(
                        `/commerce/parties/customers/${item.customer_id}`,
                      )
                    }
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-[#033F99] text-white flex items-center justify-center">
                          {(item.display_name || item.name)?.charAt(0) || "C"}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {item.display_name || item.name}
                          </p>
                          <p className="text-xs text-gray-500 font-mono">
                            {item.customer_id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {(contact.email || item.email) && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Mail className="h-3 w-3" />
                          {contact.email || item.email}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {item.customer_type && (
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getTypeColor(
                            item.customer_type,
                          )}`}
                        >
                          {item.customer_type}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.country_of_registration || "—"}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${statusConfig.color}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`}
                        />
                        {item.status?.replace("_", " ") || "active"}
                      </span>
                    </td>

                    <td
                      className="px-6 py-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomersList;
