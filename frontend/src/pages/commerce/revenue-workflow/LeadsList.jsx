// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Target,
//   Plus,
//   Search,
//   Users,
//   Clock,
//   CheckCircle2,
//   XCircle,
// } from "lucide-react";
// import { toast } from "sonner";

// const API_URL = process.env.REACT_APP_BACKEND_URL;

// const RevenueLeadsList = () => {
//   const navigate = useNavigate();
//   const [leads, setLeads] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [stageFilter, setStageFilter] = useState("");
//   const [stats, setStats] = useState({
//     total: 0,
//     new: 0,
//     contacted: 0,
//     qualified: 0,
//     disqualified: 0,
//   });

//   useEffect(() => {
//     fetchLeads();
//   }, [stageFilter]);

//   const fetchLeads = async () => {
//     try {
//       const token = localStorage.getItem("access_token");
//       const params = new URLSearchParams();
//       if (stageFilter) params.append("stage", stageFilter);

//       const res = await fetch(
//         `${API_URL}/api/commerce/workflow/revenue/leads?${params}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         },
//       );
//       const data = await res.json();
//       if (data.success) {
//         setLeads(data.leads);
//         // Calculate stats
//         const all = data.leads;
//         setStats({
//           total: all.length,
//           new: all.filter((l) => l.stage === "new").length,
//           contacted: all.filter((l) => l.stage === "contacted").length,
//           qualified: all.filter((l) => l.stage === "qualified").length,
//           disqualified: all.filter((l) => l.stage === "disqualified").length,
//         });
//       }
//     } catch (error) {
//       toast.error("Failed to fetch leads");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStageColor = (stage) => {
//     switch (stage) {
//       case "new":
//         return "bg-blue-100 text-blue-700";
//       case "contacted":
//         return "bg-yellow-100 text-yellow-700";
//       case "qualified":
//         return "bg-green-100 text-green-700";
//       case "disqualified":
//         return "bg-red-100 text-red-700";
//       default:
//         return "bg-gray-100 text-gray-700";
//     }
//   };

//   const filteredLeads = leads.filter(
//     (lead) =>
//       lead.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       lead.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()),
//   );

//   return (
//     <div
//       className="min-h-screen bg-gray-50 p-6"
//       data-testid="revenue-leads-list"
//     >
//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h1 className="text-2xl font-semibold text-gray-900">
//             Revenue Leads
//           </h1>
//           <p className="text-sm text-gray-500 mt-1">
//             Stage 1 of Revenue Workflow - Capture commercial interest
//           </p>
//         </div>
//         <button
//           onClick={() => navigate("/commerce/revenue-workflow/leads/create")}
//           className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#033F99] text-white rounded-lg hover:bg-[#022d6e] transition-colors"
//         >
//           <Plus className="h-5 w-5" />
//           New Lead
//         </button>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-5 gap-4 mb-6">
//         <div className="bg-white p-4 rounded-xl border border-gray-200">
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-gray-100 rounded-lg">
//               <Users className="h-5 w-5 text-gray-600" />
//             </div>
//             <div>
//               <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
//               <p className="text-xs text-gray-500">Total Leads</p>
//             </div>
//           </div>
//         </div>
//         <div className="bg-white p-4 rounded-xl border border-gray-200">
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-blue-100 rounded-lg">
//               <Target className="h-5 w-5 text-blue-600" />
//             </div>
//             <div>
//               <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
//               <p className="text-xs text-gray-500">New</p>
//             </div>
//           </div>
//         </div>
//         <div className="bg-white p-4 rounded-xl border border-gray-200">
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-yellow-100 rounded-lg">
//               <Clock className="h-5 w-5 text-yellow-600" />
//             </div>
//             <div>
//               <p className="text-2xl font-bold text-yellow-600">
//                 {stats.contacted}
//               </p>
//               <p className="text-xs text-gray-500">Contacted</p>
//             </div>
//           </div>
//         </div>
//         <div className="bg-white p-4 rounded-xl border border-gray-200">
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-green-100 rounded-lg">
//               <CheckCircle2 className="h-5 w-5 text-green-600" />
//             </div>
//             <div>
//               <p className="text-2xl font-bold text-green-600">
//                 {stats.qualified}
//               </p>
//               <p className="text-xs text-gray-500">Qualified</p>
//             </div>
//           </div>
//         </div>
//         <div className="bg-white p-4 rounded-xl border border-gray-200">
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-red-100 rounded-lg">
//               <XCircle className="h-5 w-5 text-red-600" />
//             </div>
//             <div>
//               <p className="text-2xl font-bold text-red-600">
//                 {stats.disqualified}
//               </p>
//               <p className="text-xs text-gray-500">Disqualified</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
//         <div className="flex items-center gap-4">
//           <div className="relative flex-1">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search leads..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
//             />
//           </div>
//           <select
//             value={stageFilter}
//             onChange={(e) => setStageFilter(e.target.value)}
//             className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99] bg-white"
//           >
//             <option value="">All Stages</option>
//             <option value="new">New</option>
//             <option value="contacted">Contacted</option>
//             <option value="qualified">Qualified</option>
//             <option value="disqualified">Disqualified</option>
//           </select>
//         </div>
//       </div>

//       {/* Leads Table */}
//       <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//         <table className="w-full">
//           <thead className="bg-gray-50 border-b border-gray-200">
//             <tr>
//               <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
//                 Lead ID
//               </th>
//               <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
//                 Company
//               </th>
//               <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
//                 Country
//               </th>
//               <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
//                 Deal Value
//               </th>
//               <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
//                 Source
//               </th>
//               <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
//                 Stage
//               </th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-100">
//             {loading ? (
//               <tr>
//                 <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
//                   Loading...
//                 </td>
//               </tr>
//             ) : filteredLeads.length === 0 ? (
//               <tr>
//                 <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
//                   No leads found
//                 </td>
//               </tr>
//             ) : (
//               filteredLeads.map((lead) => (
//                 <tr
//                   key={lead.lead_id}
//                   className="hover:bg-gray-50 cursor-pointer"
//                   onClick={() =>
//                     navigate(`/commerce/revenue-workflow/leads/${lead.lead_id}`)
//                   }
//                 >
//                   <td className="px-6 py-4 text-sm font-medium text-[#033F99]">
//                     {lead.lead_id}
//                   </td>
//                   <td className="px-6 py-4">
//                     <div>
//                       <p className="text-sm font-medium text-gray-900">
//                         {lead.company_name}
//                       </p>
//                       <p className="text-xs text-gray-500">
//                         {lead.contact_name}
//                       </p>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 text-sm text-gray-600">
//                     {lead.country}
//                   </td>
//                   <td className="px-6 py-4 text-sm font-semibold text-gray-900">
//                     ₹{(lead.estimated_deal_value || 0).toLocaleString()}
//                   </td>
//                   <td className="px-6 py-4 text-sm text-gray-600 capitalize">
//                     {lead.lead_source}
//                   </td>
//                   <td className="px-6 py-4">
//                     <span
//                       className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getStageColor(lead.stage)}`}
//                     >
//                       {lead.stage}
//                     </span>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default RevenueLeadsList;

// import React, { useMemo, useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Target,
//   Plus,
//   Search,
//   Users,
//   Clock,
//   CheckCircle2,
//   XCircle,
// } from "lucide-react";
// import { toast } from "sonner";

// const API_URL = process.env.REACT_APP_BACKEND_URL;

// const RevenueLeadsList = () => {
//   const navigate = useNavigate();
//   const [leads, setLeads] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [stageFilter, setStageFilter] = useState("");
//   const [stats, setStats] = useState({
//     total: 0,
//     new: 0,
//     contacted: 0,
//     qualified: 0,
//     disqualified: 0,
//   });

//   // Normalize stage across backend fields
//   const getLeadStage = (lead) => {
//     const raw =
//       lead?.stage ?? lead?.lead_status ?? lead?.status ?? lead?.leadStage ?? "";
//     return String(raw || "").toLowerCase();
//   };

//   const getStageLabel = (lead) => {
//     // Keep original capitalization if you store it, else title case
//     const s = getLeadStage(lead);
//     if (!s) return "—";
//     return s.charAt(0).toUpperCase() + s.slice(1);
//   };

//   const getStageColor = (stageLower) => {
//     switch (stageLower) {
//       case "new":
//         return "bg-blue-100 text-blue-700";
//       case "contacted":
//         return "bg-yellow-100 text-yellow-700";
//       case "qualified":
//         return "bg-green-100 text-green-700";
//       case "disqualified":
//         return "bg-red-100 text-red-700";
//       default:
//         return "bg-gray-100 text-gray-700";
//     }
//   };

//   useEffect(() => {
//     fetchLeads();
//   }, [stageFilter]);

//   const fetchLeads = async () => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem("access_token");
//       if (!token) {
//         toast.error("No token found. Please login again.");
//         setLeads([]);
//         return;
//       }

//       const params = new URLSearchParams();
//       if (stageFilter) params.append("stage", stageFilter);

//       const res = await fetch(
//         `${API_URL}/api/commerce/workflow/revenue/leads?${params}`,
//         { headers: { Authorization: `Bearer ${token}` } },
//       );

//       if (!res.ok) {
//         const text = await res.text();
//         console.error("Fetch leads failed:", res.status, text);
//         toast.error(`Failed to fetch leads (${res.status})`);
//         setLeads([]);
//         return;
//       }

//       const data = await res.json();

//       if (data?.success) {
//         const list = Array.isArray(data?.leads) ? data.leads : [];
//         setLeads(list);

//         // Calculate stats from the fetched list (filtered by stageFilter if provided)
//         const all = list;
//         setStats({
//           total: all.length,
//           new: all.filter((l) => getLeadStage(l) === "new").length,
//           contacted: all.filter((l) => getLeadStage(l) === "contacted").length,
//           qualified: all.filter((l) => getLeadStage(l) === "qualified").length,
//           qualified: all.filter((l) => getLeadStage(l) === "won").length,
//           disqualified: all.filter((l) => getLeadStage(l) === "disqualified")
//             .length,
//           qualified: all.filter((l) => getLeadStage(l) === "lost").length,
//         });
//       } else {
//         console.error("Leads API returned failure:", data);
//         toast.error("Failed to fetch leads");
//         setLeads([]);
//       }
//     } catch (error) {
//       console.error(error);
//       toast.error("Failed to fetch leads");
//       setLeads([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Search now checks Lead Name + Company Name + Lead ID + Owner
//   const filteredLeads = useMemo(() => {
//     const q = searchTerm.trim().toLowerCase();
//     if (!q) return leads;

//     return leads.filter((lead) => {
//       const leadId = String(lead?.lead_id || "").toLowerCase();

//       // Lead Name (you can change to lead.lead_name if you add it in backend)
//       const leadName = String(
//         lead?.lead_name || lead?.contact_name || lead?.contact_person || "",
//       ).toLowerCase();

//       // Company Name
//       const companyName = String(
//         lead?.company_name || lead?.company || lead?.display_name || "",
//       ).toLowerCase();

//       // Owner (creator)
//       const owner = String(
//         lead?.owner_name ||
//           lead?.captured_by ||
//           lead?.created_by ||
//           lead?.created_by_name ||
//           "",
//       ).toLowerCase();

//       return (
//         leadId.includes(q) ||
//         leadName.includes(q) ||
//         companyName.includes(q) ||
//         owner.includes(q)
//       );
//     });
//   }, [leads, searchTerm]);

//   return (
//     <div
//       className="min-h-screen bg-gray-50 p-6"
//       data-testid="revenue-leads-list"
//     >
//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h1 className="text-2xl font-semibold text-gray-900">
//             Revenue Leads
//           </h1>
//           <p className="text-sm text-gray-500 mt-1">
//             Stage 1 of Revenue Workflow - Capture commercial interest
//           </p>
//         </div>
//         <button
//           onClick={() => navigate("/commerce/revenue-workflow/leads/create")}
//           className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#033F99] text-white rounded-lg hover:bg-[#022d6e] transition-colors"
//         >
//           <Plus className="h-5 w-5" />
//           New Lead
//         </button>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-6 gap-4 mb-6">
//         <div className="bg-white p-4 rounded-xl border border-gray-200">
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-gray-100 rounded-lg">
//               <Users className="h-5 w-5 text-gray-600" />
//             </div>
//             <div>
//               <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
//               <p className="text-xs text-gray-500">Total Leads</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white p-4 rounded-xl border border-gray-200">
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-blue-100 rounded-lg">
//               <Target className="h-5 w-5 text-blue-600" />
//             </div>
//             <div>
//               <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
//               <p className="text-xs text-gray-500">New</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white p-4 rounded-xl border border-gray-200">
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-yellow-100 rounded-lg">
//               <Clock className="h-5 w-5 text-yellow-600" />
//             </div>
//             <div>
//               <p className="text-2xl font-bold text-yellow-600">
//                 {stats.contacted}
//               </p>
//               <p className="text-xs text-gray-500">Contacted</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white p-4 rounded-xl border border-gray-200">
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-green-100 rounded-lg">
//               <CheckCircle2 className="h-5 w-5 text-green-600" />
//             </div>
//             <div>
//               <p className="text-2xl font-bold text-green-600">
//                 {stats.qualified}
//               </p>
//               <p className="text-xs text-gray-500">Qualified</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white p-4 rounded-xl border border-gray-200">
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-green-100 rounded-lg">
//               <CheckCircle2 className="h-5 w-5 text-green-600" />
//             </div>
//             <div>
//               <p className="text-2xl font-bold text-green-600">
//                 {stats.won || "0"}
//               </p>
//               <p className="text-xs text-gray-500">Won</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white p-4 rounded-xl border border-gray-200">
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-red-100 rounded-lg">
//               <XCircle className="h-5 w-5 text-red-600" />
//             </div>
//             <div>
//               <p className="text-2xl font-bold text-red-600">
//                 {stats.lost || "0"}
//               </p>
//               <p className="text-xs text-gray-500">Lost</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
//         <div className="flex items-center gap-4">
//           <div className="relative flex-1">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search leads..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
//             />
//           </div>

//           <select
//             value={stageFilter}
//             onChange={(e) => setStageFilter(e.target.value)}
//             className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99] bg-white"
//           >
//             <option value="">All Stages</option>
//             <option value="imported">Imported</option>
//             <option value="new">New</option>
//             <option value="contacted">Contacted</option>
//             <option value="qualified">Qualified</option>
//             <option value="proposal_sent">Proposal Sent</option>
//             <option value="won">Won</option>
//             <option value="lost">Lost</option>
//           </select>
//         </div>
//       </div>

//       {/* Leads Table */}
//       <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//         <table className="w-full">
//           <thead className="bg-gray-50 border-b border-gray-200">
//             <tr>
//               <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
//                 Lead ID
//               </th>
//               <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
//                 Lead Name
//               </th>
//               <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
//                 Company Name
//               </th>
//               <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
//                 Deal Value
//               </th>
//               <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
//                 Stage
//               </th>
//               <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
//                 Owner
//               </th>
//             </tr>
//           </thead>

//           <tbody className="divide-y divide-gray-100">
//             {loading ? (
//               <tr>
//                 <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
//                   Loading...
//                 </td>
//               </tr>
//             ) : filteredLeads.length === 0 ? (
//               <tr>
//                 <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
//                   No leads found
//                 </td>
//               </tr>
//             ) : (
//               filteredLeads.map((lead) => {
//                 const stageLower = getLeadStage(lead);

//                 const leadName =
//                   lead?.lead_name ||
//                   lead?.contact_name ||
//                   lead?.contact_person ||
//                   "—";

//                 const companyName =
//                   lead?.company_name ||
//                   lead?.company ||
//                   lead?.display_name ||
//                   "—";

//                 const owner =
//                   lead?.owner_name ||
//                   lead?.captured_by ||
//                   lead?.created_by ||
//                   lead?.created_by_name ||
//                   "—";

//                 return (
//                   <tr
//                     key={lead.lead_id}
//                     className="hover:bg-gray-50 cursor-pointer"
//                     onClick={() =>
//                       navigate(
//                         `/commerce/revenue-workflow/leads/${lead.lead_id}`,
//                       )
//                     }
//                   >
//                     <td className="px-6 py-4 text-sm font-medium text-[#033F99]">
//                       {lead.lead_id}
//                     </td>

//                     <td className="px-6 py-4 text-sm text-gray-900">
//                       {leadName}
//                     </td>

//                     <td className="px-6 py-4 text-sm text-gray-900">
//                       {companyName}
//                     </td>

//                     <td className="px-6 py-4 text-sm font-semibold text-gray-900">
//                       ₹{(lead.estimated_deal_value || 0).toLocaleString()}
//                     </td>

//                     <td className="px-6 py-4">
//                       <span
//                         className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getStageColor(stageLower)}`}
//                       >
//                         {getStageLabel(lead)}
//                       </span>
//                     </td>

//                     <td className="px-6 py-4 text-sm text-gray-700">{owner}</td>
//                   </tr>
//                 );
//               })
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default RevenueLeadsList;

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Users,
  Target,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

// ---------- helpers ----------
const toLower = (v) =>
  String(v ?? "")
    .trim()
    .toLowerCase();

const normalizeStage = (lead) => {
  // your backend might return: stage OR lead_status OR lead_stage
  const raw =
    lead?.stage ?? lead?.lead_status ?? lead?.lead_stage ?? lead?.status ?? "";

  const s = toLower(raw);

  // normalize common variants
  if (s === "new") return "new";
  if (s === "contacted") return "contacted";
  if (s === "qualified") return "qualified";
  if (s === "disqualified") return "disqualified";

  // if your system uses other states like enriching/closed_won, keep them
  return s || "new";
};

const stageLabel = (stage) => {
  // pretty label for UI
  const s = toLower(stage);
  if (!s) return "—";
  return s.replace(/_/g, " ");
};

const getStageColor = (stage) => {
  const s = toLower(stage);
  switch (s) {
    case "new":
      return "bg-blue-100 text-blue-700";
    case "contacted":
      return "bg-yellow-100 text-yellow-700";
    case "qualified":
      return "bg-green-100 text-green-700";
    case "disqualified":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

// revenue lead detector: keep only revenue leads you actually created
const isRevenueLead = (lead) => {
  const id = String(lead?.lead_id ?? "");
  // Your revenue leads appear like: REV-LEAD-20260203...
  if (id.startsWith("REV-LEAD-")) return true;
  // id.startsWith("LEAD-")
  // fallback (if any other marker exists in your schema)
  // keep records that at least look like revenue lead shape
  const hasRevenueFields =
    lead?.company_name ||
    lead?.contact_name ||
    lead?.lead_source ||
    lead?.estimated_deal_value !== undefined;

  return Boolean(hasRevenueFields);
};

const getLeadName = (lead) => {
  // Lead Name = person name
  // in your old UI, under company you showed contact_name
  return (
    lead?.lead_name || lead?.contact_name || lead?.primary_contact_name || "—"
  );
};

const getCompanyName = (lead) => {
  return lead?.company_name || lead?.company || lead?.organization_name || "—";
};

const getOwner = (lead) => {
  return lead?.owner || "—";
};
// const getOwner = (lead) => {
//   // backend: captured_by="current_user_id" (TODO) so might be useless now
//   // try multiple keys
//   return (
//     lead?.owner_name ||
//     lead?.owner ||
//     lead?.captured_by ||
//     lead?.created_by ||
//     "—"
//   );
// };

// ---------- component ----------
const RevenueLeadsList = () => {
  const navigate = useNavigate();

  const [allLeads, setAllLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState(""); // new/contacted/qualified/disqualified

  // fetch leads (don’t send stage filter to backend if it causes mixed results)
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.error("No token found. Please login again.");
        setAllLeads([]);
        return;
      }

      // IMPORTANT:
      // If backend stage filter works for revenue leads, you can keep it.
      // But you said "All stages" returns irrelevant records.
      // So we fetch without stage, then filter revenue-only client-side.
      const res = await fetch(
        `${API_URL}/api/commerce/workflow/revenue/leads`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) {
        const txt = await res.text();
        console.error("Leads API error:", res.status, txt);
        toast.error(`Failed to fetch leads (${res.status})`);
        setAllLeads([]);
        return;
      }

      const data = await res.json();

      // Your earlier code assumes: { success, leads }
      const list = Array.isArray(data?.leads)
        ? data.leads
        : Array.isArray(data)
          ? data
          : [];

      // normalize stage once
      const normalized = list.map((l) => ({
        ...l,
        __stage: normalizeStage(l),
      }));

      setAllLeads(normalized);
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch leads");
      setAllLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // only revenue leads
  const revenueLeads = useMemo(() => {
    return allLeads.filter(isRevenueLead);
  }, [allLeads]);

  // apply stage filter + search filter
  const filteredLeads = useMemo(() => {
    const term = toLower(searchTerm);

    return revenueLeads
      .filter((l) => {
        if (!stageFilter) return true;
        return toLower(l.__stage) === toLower(stageFilter);
      })
      .filter((l) => {
        if (!term) return true;
        const leadName = toLower(getLeadName(l));
        const companyName = toLower(getCompanyName(l));
        const leadId = toLower(l?.lead_id);
        return (
          leadName.includes(term) ||
          companyName.includes(term) ||
          leadId.includes(term)
        );
      });
  }, [revenueLeads, stageFilter, searchTerm]);

  // stats based on *all revenue leads* (not filtered list)
  const stats = useMemo(() => {
    const all = revenueLeads;
    const countBy = (s) => all.filter((l) => toLower(l.__stage) === s).length;

    return {
      total: all.length,
      new: countBy("new"),
      contacted: countBy("contacted"),
      qualified: countBy("qualified"),
      disqualified: countBy("disqualified"),
    };
  }, [revenueLeads]);

  return (
    <div
      className="min-h-screen bg-gray-50 p-6"
      data-testid="revenue-leads-list"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Revenue Leads
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Stage 1 of Revenue Workflow - Capture commercial interest
          </p>
        </div>

        <button
          onClick={() => navigate("/commerce/revenue-workflow/leads/create")}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#033F99] text-white rounded-lg hover:bg-[#022d6e] transition-colors"
        >
          <Plus className="h-5 w-5" />
          New Lead
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Users className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total Leads</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
              <p className="text-xs text-gray-500">New</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.contacted}
              </p>
              <p className="text-xs text-gray-500">Contacted</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {stats.qualified}
              </p>
              <p className="text-xs text-gray-500">Qualified</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {stats.won || "0"}
              </p>
              <p className="text-xs text-gray-500">Won</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {stats.lost || "0"}
              </p>
              <p className="text-xs text-gray-500">Lost</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
            />
          </div>

          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99] bg-white"
          >
            <option value="">All</option>
            <option value="imported">Imported</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="disqualified">Disqualified</option>
            <option value="proposal_sent">Proposal Sent</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                Lead ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                Lead Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                Company Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                Deal Value
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                Stage
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                Owner
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No leads found
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => (
                <tr
                  key={lead.lead_id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() =>
                    navigate(`/commerce/revenue-workflow/leads/${lead.lead_id}`)
                  }
                >
                  <td className="px-6 py-4 text-sm font-medium text-[#033F99]">
                    {lead.lead_id}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-900">
                    {getLeadName(lead)}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-900">
                    {getCompanyName(lead)}
                  </td>

                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    ₹{Number(lead.estimated_deal_value || 0).toLocaleString()}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getStageColor(
                        lead.__stage,
                      )}`}
                    >
                      {stageLabel(lead.__stage)}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-700">
                    {getOwner(lead)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RevenueLeadsList;
