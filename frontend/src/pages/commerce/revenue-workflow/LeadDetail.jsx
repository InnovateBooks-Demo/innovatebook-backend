// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import {
//   Target,
//   ArrowLeft,
//   Edit,
//   ArrowRight,
//   Building2,
//   User,
//   CheckCircle2,
//   Clock,
//   AlertTriangle,
//   Loader2,
//   AlertCircle,
//   Calendar,
//   Activity,
// } from "lucide-react";
// import { toast } from "sonner";

// const API_URL = process.env.REACT_APP_BACKEND_URL;
// // ---- Age helpers (ADD HERE) ----
// const calculateAgeInDays = (createdAt) => {
//   if (!createdAt) return 0;

//   const created = new Date(createdAt);
//   const now = new Date();

//   const diffMs = now.getTime() - created.getTime();
//   return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
// };

// const formatAge = (createdAt) => {
//   const days = calculateAgeInDays(createdAt);
//   if (days === 0) return "Today";
//   if (days === 1) return "1 day";
//   return `${days} days`;
// };

// // --- Workflow Stepper helpers ---
// const WORKFLOW_STEPS = [
//   { key: "lead", label: "Lead", icon: Target },
//   { key: "evaluate", label: "Evaluate", icon: Activity },
//   { key: "commit", label: "Commit", icon: CheckCircle2 },
//   { key: "contract", label: "Contract", icon: Building2 },
//   { key: "handoff", label: "Hand off", icon: ArrowRight },
// ];

// const getCurrentWorkflowKey = (lead) => {
//   // ✅ Prefer a direct backend field if available
//   if (!lead) return "lead";
//   if (lead.workflow_stage) return lead.workflow_stage;

//   // ✅ Fallback inference (adjust to your API fields if needed)
//   if (lead.is_handed_off) return "handoff";
//   if (lead.has_contract) return "contract";
//   if (lead.is_committed) return "commit";
//   if (lead.is_converted) return "evaluate";
//   return "lead";
// };

// const getStepState = (steps, currentKey, stepKey) => {
//   const currentIndex = steps.findIndex((s) => s.key === currentKey);
//   const stepIndex = steps.findIndex((s) => s.key === stepKey);
//   if (stepIndex < currentIndex) return "done";
//   if (stepIndex === currentIndex) return "current";
//   return "upcoming";
// };

// // -- WorkFlow Stepper --
// const WorkflowStepper = ({ lead }) => {
//   const currentKey = getCurrentWorkflowKey(lead);

//   const currentIndex = WORKFLOW_STEPS.findIndex((s) => s.key === currentKey);
//   const safeCurrentIndex = currentIndex === -1 ? 0 : currentIndex;

//   return (
//     <div className="w-full mt-5">
//       <div className="bg-white border border-gray-200 rounded-xl px-5 py-5">
//         {/* Track */}
//         <div className="relative">
//           {/* Base arrow track (gray) */}
//           <div className="h-12 w-full bg-gray-200 rounded-full relative overflow-hidden">
//             {/* Arrow head */}
//             <div className="absolute right-0 top-0 h-12 w-16 bg-gray-200">
//               <div
//                 className="absolute right-0 top-0 h-12 w-16"
//                 style={{
//                   clipPath:
//                     "polygon(0 0, 60% 0, 100% 50%, 60% 100%, 0 100%, 25% 50%)",
//                   backgroundColor: "#E5E7EB", // gray-200
//                 }}
//               />
//             </div>

//             {/* Active progress fill (green) */}
//             <div
//               className="absolute left-0 top-0 h-12 bg-emerald-500 rounded-full"
//               style={{
//                 width: `${Math.max(
//                   8,
//                   (safeCurrentIndex / (WORKFLOW_STEPS.length - 1)) * 100,
//                 )}%`,
//               }}
//             />

//             {/* Active arrow head overlay */}
//             <div
//               className="absolute top-0 h-12"
//               style={{
//                 left: `calc(${Math.max(
//                   8,
//                   (safeCurrentIndex / (WORKFLOW_STEPS.length - 1)) * 100,
//                 )}% - 16px)`,
//                 width: "64px",
//               }}
//             >
//               <div
//                 className="h-12 w-16"
//                 style={{
//                   clipPath:
//                     "polygon(0 0, 60% 0, 100% 50%, 60% 100%, 0 100%, 25% 50%)",
//                   backgroundColor: "#10B981", // emerald-500
//                 }}
//               />
//             </div>
//           </div>

//           {/* Nodes */}
//           <div className="absolute inset-0 flex items-center justify-between px-3">
//             {WORKFLOW_STEPS.map((step, idx) => {
//               const state = getStepState(WORKFLOW_STEPS, currentKey, step.key);
//               const Icon = step.icon;

//               const circleBase =
//                 "h-12 w-12 rounded-full flex items-center justify-center border-4 shadow-sm transition-all";
//               const circleStyle =
//                 state === "done"
//                   ? "bg-emerald-500 border-white"
//                   : state === "current"
//                     ? "bg-emerald-500 border-white ring-4 ring-emerald-200"
//                     : "bg-gray-200 border-white";

//               const iconStyle =
//                 state === "done" || state === "current"
//                   ? "text-white"
//                   : "text-gray-400";

//               return (
//                 <div
//                   key={step.key}
//                   className="flex flex-col items-center gap-2"
//                 >
//                   <div className={`${circleBase} ${circleStyle}`}>
//                     <Icon className={`h-5 w-5 ${iconStyle}`} />
//                   </div>
//                   <div
//                     className={`text-xs font-semibold whitespace-nowrap ${
//                       state === "current"
//                         ? "text-emerald-700"
//                         : state === "done"
//                           ? "text-emerald-700"
//                           : "text-gray-400"
//                     }`}
//                   >
//                     {step.label}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>

//         {/* Optional: current label */}
//         {/* <div className="mt-4 text-xs text-gray-500">
//           Current stage:{" "}
//           <span className="font-semibold capitalize text-gray-700">
//             {currentKey}
//           </span>
//         </div> */}
//       </div>
//     </div>
//   );
// };

// // --- Main Component ---
// const RevenueLeadDetail = () => {
//   const { lead_id } = useParams();
//   const navigate = useNavigate();
//   const [lead, setLead] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchLead();
//     //// eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [lead_id]);

//   const fetchLead = async () => {
//     try {
//       const token = localStorage.getItem("access_token");
//       const res = await fetch(
//         `${API_URL}/api/commerce/workflow/revenue/leads/${lead_id}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         },
//       );
//       const data = await res.json();
//       if (data.success) setLead(data.lead);
//       else toast.error(data.detail || "Failed to fetch lead");
//     } catch (error) {
//       toast.error("Failed to fetch lead");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleStageChange = async (newStage) => {
//     try {
//       const token = localStorage.getItem("access_token");
//       const res = await fetch(
//         `${API_URL}/api/commerce/workflow/revenue/leads/${lead_id}/stage?new_stage=${newStage}`,
//         {
//           method: "PUT",
//           headers: { Authorization: `Bearer ${token}` },
//         },
//       );
//       const data = await res.json();
//       if (data.success) {
//         toast.success(`Stage changed to ${newStage}`);
//         fetchLead();
//       } else {
//         toast.error(data.detail || "Failed to change stage");
//       }
//     } catch (error) {
//       toast.error("Failed to change stage");
//     }
//   };

//   const handleConvertToEvaluate = async () => {
//     try {
//       const token = localStorage.getItem("access_token");
//       const res = await fetch(
//         `${API_URL}/api/commerce/workflow/revenue/leads/${lead_id}/convert-to-evaluate`,
//         {
//           method: "POST",
//           headers: { Authorization: `Bearer ${token}` },
//         },
//       );
//       const data = await res.json();
//       if (data.success) {
//         toast.success("Lead converted to evaluation");
//         navigate(
//           `/commerce/revenue-workflow/evaluations/${data.evaluation_id}`,
//         );
//       } else {
//         toast.error(data.detail || "Failed to convert lead");
//       }
//     } catch (error) {
//       toast.error("Failed to convert lead");
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

//   if (loading)
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <Loader2 className="h-8 w-8 animate-spin text-[#3A4E63]" />
//       </div>
//     );

//   if (!lead)
//     return (
//       <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
//         <Target className="h-12 w-12 text-gray-300 mb-4" />
//         <p className="text-gray-500">Lead not found</p>
//       </div>
//     );

//   return (
//     <div className="min-h-screen bg-gray-50" data-testid="revenue-lead-detail">
//       {/* Header */}
//       <div className="bg-white border-b border-gray-200">
//         <div className="px-8 py-6">
//           <div className="flex items-center gap-4 mb-4">
//             <button
//               onClick={() => navigate("/commerce/revenue-workflow/leads")}
//               className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
//             >
//               <ArrowLeft className="h-5 w-5" />
//             </button>
//             <span className="text-sm text-gray-500">Back to Leads</span>
//           </div>

//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <div className="w-14 h-14 bg-[#3A4E63]/10 rounded-xl flex items-center justify-center">
//                 <Target className="h-7 w-7 text-[#3A4E63]" />
//               </div>
//               <div>
//                 <div className="flex items-center gap-3">
//                   <h1 className="text-2xl font-semibold text-gray-900">
//                     {lead.company_name}
//                   </h1>
//                   <span
//                     className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStageColor(
//                       lead.stage,
//                     )}`}
//                   >
//                     {lead.stage}
//                   </span>
//                 </div>
//                 <p className="text-sm text-gray-500 mt-1">
//                   {lead.lead_id} • {lead.contact_name}
//                 </p>
//               </div>
//             </div>

//             {/* Actions */}
//             <div className="flex items-center gap-3">
//               {lead.stage === "qualified" && !lead.is_converted && (
//                 <button
//                   onClick={handleConvertToEvaluate}
//                   className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
//                 >
//                   <ArrowRight className="h-4 w-4" />
//                   Convert to Evaluate
//                 </button>
//               )}

//               {lead.is_converted && (
//                 <button
//                   onClick={() =>
//                     navigate(
//                       `/commerce/revenue-workflow/evaluations/${lead.evaluation_id}`,
//                     )
//                   }
//                   className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
//                 >
//                   <ArrowRight className="h-4 w-4" />
//                   View Evaluation
//                 </button>
//               )}

//               <button
//                 onClick={() =>
//                   navigate(`/commerce/revenue-workflow/leads/${lead_id}/edit`)
//                 }
//                 className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
//               >
//                 <Edit className="h-4 w-4" />
//                 Edit
//               </button>
//             </div>
//           </div>

//           {/* ✅ New Stepper After Edit Div */}
//           <WorkflowStepper lead={lead} />
//         </div>
//       </div>

//       <div className="px-8 py-6">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Main Content */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* Company Info */}
//             <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//               <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
//                 <div className="flex items-center gap-2">
//                   <Building2 className="h-5 w-5 text-gray-500" />
//                   <h2 className="text-lg font-medium text-gray-900">
//                     Company Information
//                   </h2>
//                 </div>
//               </div>
//               <div className="p-6 grid grid-cols-2 gap-6">
//                 <div>
//                   <p className="text-sm text-gray-500 mb-1">Company Name</p>
//                   <p className="font-medium text-gray-900">
//                     {lead.company_name}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500 mb-1">Country</p>
//                   <p className="font-medium text-gray-900">{lead.country}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500 mb-1">Industry</p>
//                   <p className="font-medium text-gray-900">
//                     {lead.industry || "-"}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500 mb-1">Website</p>
//                   <a
//                     href={lead.website}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="font-medium text-[#3A4E63] hover:underline"
//                   >
//                     {lead.website || "-"}
//                   </a>
//                 </div>
//               </div>
//             </div>

//             {/* Contact Info */}
//             <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//               <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
//                 <div className="flex items-center gap-2">
//                   <User className="h-5 w-5 text-gray-500" />
//                   <h2 className="text-lg font-medium text-gray-900">
//                     Primary Contact
//                   </h2>
//                 </div>
//               </div>
//               <div className="p-6 grid grid-cols-3 gap-6">
//                 <div>
//                   <p className="text-sm text-gray-500 mb-1">Name</p>
//                   <p className="font-medium text-gray-900">
//                     {lead.contact_name}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500 mb-1">Email</p>
//                   <p className="font-medium text-gray-900">
//                     {lead.contact_email}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500 mb-1">Phone</p>
//                   <p className="font-medium text-gray-900">
//                     {lead.contact_phone || "-"}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Qualification Checklist */}
//             <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//               <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
//                 <h2 className="text-lg font-medium text-gray-900">
//                   Qualification Checklist
//                 </h2>
//               </div>
//               <div className="p-6 space-y-4">
//                 <div className="flex items-center gap-3">
//                   {lead.problem_identified ? (
//                     <CheckCircle2 className="h-5 w-5 text-green-500" />
//                   ) : (
//                     <Clock className="h-5 w-5 text-gray-300" />
//                   )}
//                   <span
//                     className={`text-sm ${
//                       lead.problem_identified
//                         ? "text-green-700"
//                         : "text-gray-500"
//                     }`}
//                   >
//                     Problem identified
//                   </span>
//                 </div>

//                 <div className="flex items-center gap-3">
//                   {lead.budget_mentioned === "yes" ? (
//                     <CheckCircle2 className="h-5 w-5 text-green-500" />
//                   ) : lead.budget_mentioned === "no" ? (
//                     <AlertTriangle className="h-5 w-5 text-red-500" />
//                   ) : (
//                     <Clock className="h-5 w-5 text-gray-300" />
//                   )}
//                   <span className="text-sm text-gray-600">
//                     Budget mentioned:{" "}
//                     <span className="capitalize font-medium">
//                       {lead.budget_mentioned}
//                     </span>
//                   </span>
//                 </div>

//                 <div className="flex items-center gap-3">
//                   {lead.authority_known ? (
//                     <CheckCircle2 className="h-5 w-5 text-green-500" />
//                   ) : (
//                     <Clock className="h-5 w-5 text-gray-300" />
//                   )}
//                   <span
//                     className={`text-sm ${
//                       lead.authority_known ? "text-green-700" : "text-gray-500"
//                     }`}
//                   >
//                     Authority/Decision maker known
//                   </span>
//                 </div>

//                 <div className="flex items-center gap-3">
//                   {lead.need_timeline ? (
//                     <CheckCircle2 className="h-5 w-5 text-green-500" />
//                   ) : (
//                     <Clock className="h-5 w-5 text-gray-300" />
//                   )}
//                   <span
//                     className={`text-sm ${
//                       lead.need_timeline ? "text-green-700" : "text-gray-500"
//                     }`}
//                   >
//                     Timeline need established
//                   </span>
//                 </div>
//               </div>
//             </div>

//             {/* Notes */}
//             {lead.notes && (
//               <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//                 <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
//                   <h2 className="text-lg font-medium text-gray-900">Notes</h2>
//                 </div>
//                 <div className="p-6">
//                   <p className="text-gray-700 whitespace-pre-wrap">
//                     {lead.notes}
//                   </p>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Sidebar */}
//           <div className="space-y-6">
//             {/* Age & Health */}
//             <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//               <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
//                 <div className="flex items-center gap-2">
//                   <Activity className="h-5 w-5 text-gray-500" />
//                   <h2 className="text-lg font-medium text-gray-900">
//                     Lead Health
//                   </h2>
//                 </div>
//               </div>
//               <div className="p-6 space-y-4">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-gray-500 mb-1">Age</p>
//                     <div className="flex items-center gap-2">
//                       <Calendar className="h-4 w-4 text-gray-400" />
//                       {/* <p className="font-semibold text-gray-900">
//                         {calculateAgeInDays(lead.created_at)} days
//                       </p> */}
//                       <p className="font-semibold text-gray-900">
//                         {formatAge(lead.created_at)}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="text-right">
//                     <p className="text-sm text-gray-500 mb-1">Health Status</p>
//                     <div className="flex items-center gap-2 justify-end">
//                       <AlertCircle
//                         className={`h-5 w-5 ${
//                           lead.health === "good"
//                             ? "text-green-500"
//                             : lead.health === "warning"
//                               ? "text-yellow-500"
//                               : lead.health === "critical"
//                                 ? "text-red-500"
//                                 : "text-gray-400"
//                         }`}
//                       />
//                       <span
//                         className={`text-sm font-semibold capitalize ${
//                           lead.health === "good"
//                             ? "text-green-600"
//                             : lead.health === "warning"
//                               ? "text-yellow-600"
//                               : lead.health === "critical"
//                                 ? "text-red-600"
//                                 : "text-gray-600"
//                         }`}
//                       >
//                         {lead.health || "Unknown"}
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="pt-4 border-t border-gray-100">
//                   <p className="text-xs text-gray-500">
//                     {lead.health === "good" &&
//                       "Lead is progressing well within expected timeline."}
//                     {lead.health === "warning" &&
//                       "Lead may need attention - consider following up soon."}
//                     {lead.health === "critical" &&
//                       "Lead requires immediate attention - overdue for follow-up."}
//                     {!lead.health &&
//                       "Health status will be calculated based on activity."}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Quick Actions */}
//             {!lead.is_converted && lead.stage !== "disqualified" && (
//               <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//                 <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
//                   <h2 className="text-lg font-medium text-gray-900">
//                     Quick Actions
//                   </h2>
//                 </div>
//                 <div className="p-6 space-y-3">
//                   {lead.stage === "qualified" && !lead.is_converted && (
//                     <button
//                       onClick={handleConvertToEvaluate}
//                       className="w-full px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
//                     >
//                       <ArrowRight className="h-4 w-4" />
//                       Convert to Evaluate
//                     </button>
//                   )}

//                   {lead.stage === "new" && (
//                     <button
//                       onClick={() => handleStageChange("contacted")}
//                       className="w-full px-4 py-2.5 text-sm font-medium text-yellow-700 bg-yellow-100 rounded-lg hover:bg-yellow-200"
//                     >
//                       Mark as Contacted
//                     </button>
//                   )}

//                   {lead.stage === "contacted" && (
//                     <button
//                       onClick={() => handleStageChange("qualified")}
//                       className="w-full px-4 py-2.5 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200"
//                     >
//                       Mark as Qualified
//                     </button>
//                   )}

//                   <button
//                     onClick={() => handleStageChange("disqualified")}
//                     className="w-full px-4 py-2.5 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200"
//                   >
//                     Disqualify Lead
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* Deal Info */}
//             <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//               <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
//                 <h2 className="text-lg font-medium text-gray-900">
//                   Deal Information
//                 </h2>
//               </div>
//               <div className="p-6 space-y-4">
//                 <div>
//                   <p className="text-sm text-gray-500 mb-1">
//                     Estimated Deal Value
//                   </p>
//                   <p className="text-2xl font-bold text-gray-900">
//                     ₹{(lead.estimated_deal_value || 0).toLocaleString()}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500 mb-1">
//                     Expected Timeline
//                   </p>
//                   <p className="font-medium text-gray-900">
//                     {lead.expected_timeline}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500 mb-1">Lead Source</p>
//                   <p className="font-medium text-gray-900 capitalize">
//                     {lead.lead_source}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Status */}
//             <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//               <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
//                 <h2 className="text-lg font-medium text-gray-900">Status</h2>
//               </div>
//               <div className="p-6 space-y-4">
//                 <div>
//                   <p className="text-sm text-gray-500 mb-1">Current Stage</p>
//                   <span
//                     className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold capitalize ${getStageColor(
//                       lead.stage,
//                     )}`}
//                   >
//                     {lead.stage}
//                   </span>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500 mb-1">Next Action</p>
//                   <p className="font-medium text-gray-900">
//                     {lead.next_action || "Not set"}
//                   </p>
//                 </div>
//                 {lead.is_converted && (
//                   <div className="pt-4 border-t border-gray-200">
//                     <p className="text-sm text-green-600 font-medium">
//                       ✓ Converted to Evaluation
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RevenueLeadDetail;

// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import {
//   Target,
//   ArrowLeft,
//   Edit,
//   ArrowRight,
//   User,
//   CheckCircle2,
//   Clock,
//   AlertTriangle,
//   Loader2,
//   AlertCircle,
//   Calendar,
//   Activity,
//   Globe,
//   BriefcaseBusiness,
//   Mail,
//   Phone,
//   BadgeIndianRupee,
//   MapPin,
//   ClipboardList,

//   // stepper icons
//   FileText,
//   PlusCircle,
//   PhoneCall,
//   SearchCheck,
//   BadgeCheck,
//   Send,
//   ClipboardCheck,
//   Trophy,
//   FileSignature,
//   Share2,
// } from "lucide-react";
// import { toast } from "sonner";

// const API_URL = process.env.REACT_APP_BACKEND_URL;

// // ---- Age helpers ----
// const calculateAgeInDays = (createdAt) => {
//   if (!createdAt) return 0;
//   const created = new Date(createdAt);
//   if (Number.isNaN(created.getTime())) return 0;

//   const now = new Date();
//   const diffMs = now.getTime() - created.getTime();
//   return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
// };

// const formatAge = (createdAt) => {
//   const days = calculateAgeInDays(createdAt);
//   if (days === 0) return "Today";
//   if (days === 1) return "1 day";
//   return `${days} days`;
// };

// // --- Workflow Stepper helpers ---
// const WORKFLOW_STEPS = [
//   { key: "lead", label: "Lead", icon: FileText },

//   // between Lead → Evaluate
//   { key: "new", label: "New", icon: PlusCircle },
//   { key: "contacted", label: "Contacted", icon: PhoneCall },

//   { key: "evaluate", label: "Evaluate", icon: SearchCheck },

//   // between Evaluate → Commit
//   { key: "qualified", label: "Qualified", icon: BadgeCheck },
//   { key: "proposal_sent", label: "Proposal Sent", icon: Send },

//   { key: "commit", label: "Commit", icon: ClipboardCheck },

//   // between Commit → Contract
//   { key: "won", label: "Won", icon: Trophy },

//   { key: "contract", label: "Contract", icon: FileSignature },

//   { key: "handoff", label: "Hand Off", icon: Share2 },
// ];

// const normalizeKey = (v) =>
//   String(v ?? "")
//     .toLowerCase()
//     .trim()
//     .replace(/\s+/g, "_");

// const getCurrentWorkflowKey = (lead) => {
//   if (!lead) return "lead";

//   // 1) Prefer explicit stage fields first
//   const explicit =
//     normalizeKey(lead.workflow_stage) ||
//     normalizeKey(lead.stage) ||
//     normalizeKey(lead.lead_status) ||
//     normalizeKey(lead.status);

//   if (WORKFLOW_STEPS.some((s) => s.key === explicit)) return explicit;

//   // 2) Fallback to boolean flags only if explicit stage isn't usable
//   if (lead.is_handed_off) return "handoff";
//   if (lead.has_contract) return "contract";
//   if (lead.is_won) return "won";
//   if (lead.is_committed) return "commit";
//   if (lead.is_converted) return "evaluate";

//   return "lead";
// };

// const getStepState = (steps, currentKey, stepKey) => {
//   const currentIndex = steps.findIndex((s) => s.key === currentKey);
//   const stepIndex = steps.findIndex((s) => s.key === stepKey);
//   if (stepIndex < currentIndex) return "done";
//   if (stepIndex === currentIndex) return "current";
//   return "upcoming";
// };

// // ✅ stepper component
// const WorkflowStepper = ({ lead }) => {
//   // ✅ Bigger steps you asked for
//   const BIG_STEPS = new Set(["lead", "evaluate", "commit", "won", "handoff"]);

//   const currentKey = getCurrentWorkflowKey(lead);

//   const currentIndex = WORKFLOW_STEPS.findIndex((s) => s.key === currentKey);
//   const safeCurrentIndex = currentIndex === -1 ? 0 : currentIndex;

//   const progressPct = Math.max(
//     8,
//     (safeCurrentIndex / (WORKFLOW_STEPS.length - 1)) * 100,
//   );

//   return (
//     <div className="w-full mt-5">
//       <div className="bg-white border border-gray-200 rounded-xl px-5 py-5">
//         <div className="relative">
//           {/* Base track */}
//           <div className="h-12 w-full bg-gray-200 rounded-full relative overflow-hidden">
//             {/* Gray arrow head */}
//             <div className="absolute right-0 top-0 h-12 w-16">
//               <div
//                 className="absolute right-0 top-0 h-12 w-16"
//                 style={{
//                   clipPath:
//                     "polygon(0 0, 60% 0, 100% 50%, 60% 100%, 0 100%, 25% 50%)",
//                   backgroundColor: "#E5E7EB",
//                 }}
//               />
//             </div>

//             {/* Active fill */}
//             <div
//               className="absolute left-0 top-0 h-12 bg-[rgba(3,63,153,0.08)]0 rounded-full"
//               style={{ width: `${progressPct}%` }}
//             />

//             {/* Active arrow head */}
//             <div
//               className="absolute top-0 h-12"
//               style={{
//                 left: `calc(${progressPct}% - 16px)`,
//                 width: "64px",
//               }}
//             >
//               <div
//                 className="h-12 w-16"
//                 style={{
//                   clipPath:
//                     "polygon(0 0, 60% 0, 100% 50%, 60% 100%, 0 100%, 25% 50%)",
//                   backgroundColor: "#93C5FD", // lighter blue
//                 }}
//               />
//             </div>
//           </div>

//           {/* Nodes */}
//           <div className="absolute inset-0 flex items-center justify-between px-3">
//             {WORKFLOW_STEPS.map((step) => {
//               const state = getStepState(WORKFLOW_STEPS, currentKey, step.key);
//               const Icon = step.icon;

//               const isBig = BIG_STEPS.has(step.key);

//               const circleBase = `rounded-full flex items-center justify-center border-4 shadow-sm transition-all ${
//                 isBig ? "h-16 w-16" : "h-12 w-12"
//               }`;

//               const circleStyle =
//                 state === "done"
//                   ? "bg-[rgba(3,63,153,0.08)]0 border-white"
//                   : state === "current"
//                     ? "bg-[rgba(3,63,153,0.08)]0 border-white ring-4 ring-blue-200"
//                     : "bg-gray-200 border-white";

//               const iconStyle =
//                 state === "done" || state === "current"
//                   ? "text-white"
//                   : "text-gray-400";

//               const iconSize = isBig ? "h-7 w-7" : "h-5 w-5";

//               const labelStyle = `font-semibold whitespace-nowrap ${
//                 isBig ? "text-base" : "text-xs"
//               } ${
//                 state === "current" || state === "done"
//                   ? "text-blue-700"
//                   : "text-gray-400"
//               }`;

//               return (
//                 <div
//                   key={step.key}
//                   className="flex flex-col items-center gap-2"
//                 >
//                   <div className={`${circleBase} ${circleStyle}`}>
//                     <Icon className={`${iconSize} ${iconStyle}`} />
//                   </div>
//                   <div className={labelStyle}>{step.label}</div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const RevenueLeadDetail = () => {
//   const { lead_id } = useParams();
//   const navigate = useNavigate();
//   const [lead, setLead] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchLead();
//     //// eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [lead_id]);

//   const fetchLead = async () => {
//     try {
//       const token = localStorage.getItem("access_token");
//       const res = await fetch(
//         `${API_URL}/api/commerce/workflow/revenue/leads/${lead_id}`,
//         { headers: { Authorization: `Bearer ${token}` } },
//       );
//       const data = await res.json();
//       if (data.success) setLead(data.lead);
//       else toast.error(data.detail || "Failed to fetch lead");
//     } catch (error) {
//       toast.error("Failed to fetch lead");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleStageChange = async (newStage) => {
//     try {
//       const token = localStorage.getItem("access_token");
//       const res = await fetch(
//         `${API_URL}/api/commerce/workflow/revenue/leads/${lead_id}/stage?new_stage=${newStage}`,
//         { method: "PUT", headers: { Authorization: `Bearer ${token}` } },
//       );
//       const data = await res.json();
//       if (data.success) {
//         toast.success(`Stage changed to ${newStage}`);
//         fetchLead();
//       } else {
//         toast.error(data.detail || "Failed to change stage");
//       }
//     } catch (error) {
//       toast.error("Failed to change stage");
//     }
//   };

//   const handleConvertToEvaluate = async () => {
//     try {
//       const token = localStorage.getItem("access_token");
//       const res = await fetch(
//         `${API_URL}/api/commerce/workflow/revenue/leads/${lead_id}/convert-to-evaluate`,
//         { method: "POST", headers: { Authorization: `Bearer ${token}` } },
//       );
//       const data = await res.json();
//       if (data.success) {
//         toast.success("Lead converted to evaluation");
//         navigate(
//           `/commerce/revenue-workflow/evaluations/${data.evaluation_id}`,
//         );
//       } else {
//         toast.error(data.detail || "Failed to convert lead");
//       }
//     } catch (error) {
//       toast.error("Failed to convert lead");
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
//       case "proposal_sent":
//         return "bg-indigo-100 text-indigo-700";
//       case "won":
//         return "bg-emerald-100 text-emerald-700";
//       case "disqualified":
//       case "lost":
//         return "bg-red-100 text-red-700";
//       default:
//         return "bg-gray-100 text-gray-700";
//     }
//   };

//   if (loading)
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <Loader2 className="h-8 w-8 animate-spin text-[#3A4E63]" />
//       </div>
//     );

//   if (!lead)
//     return (
//       <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
//         <Target className="h-12 w-12 text-gray-300 mb-4" />
//         <p className="text-gray-500">Lead not found</p>
//       </div>
//     );

//   return (
//     <div className="min-h-screen bg-gray-50" data-testid="revenue-lead-detail">
//       {/* Header */}
//       <div className="bg-white border-b border-gray-200">
//         <div className="px-8 py-6">
//           <div className="flex items-center gap-4 mb-4">
//             <button
//               onClick={() => navigate("/commerce/revenue-workflow/leads")}
//               className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
//             >
//               <ArrowLeft className="h-5 w-5" />
//             </button>
//             <span className="text-sm text-gray-500">Back to Leads</span>
//           </div>

//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <div className="w-14 h-14 bg-[#3A4E63]/10 rounded-xl flex items-center justify-center">
//                 <Target className="h-7 w-7 text-[#3A4E63]" />
//               </div>
//               <div>
//                 <div className="flex items-center gap-3">
//                   <h1 className="text-2xl font-semibold text-gray-900">
//                     {lead.company_name}
//                   </h1>
//                   <span
//                     className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStageColor(
//                       lead.stage,
//                     )}`}
//                   >
//                     {lead.stage}
//                   </span>
//                 </div>
//                 <p className="text-sm text-gray-500 mt-1">
//                   {lead.lead_id} • {lead.contact_name}
//                 </p>
//               </div>
//             </div>

//             <div className="flex items-center gap-3">
//               {lead.stage === "qualified" && !lead.is_converted && (
//                 <button
//                   onClick={handleConvertToEvaluate}
//                   className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
//                 >
//                   <ArrowRight className="h-4 w-4" />
//                   Convert to Evaluate
//                 </button>
//               )}

//               {lead.is_converted && (
//                 <button
//                   onClick={() =>
//                     navigate(
//                       `/commerce/revenue-workflow/evaluations/${lead.evaluation_id}`,
//                     )
//                   }
//                   className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
//                 >
//                   <ArrowRight className="h-4 w-4" />
//                   View Evaluation
//                 </button>
//               )}

//               <button
//                 onClick={() =>
//                   navigate(`/commerce/revenue-workflow/leads/${lead_id}/edit`)
//                 }
//                 className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
//               >
//                 <Edit className="h-4 w-4" />
//                 Edit
//               </button>
//             </div>
//           </div>

//           <WorkflowStepper lead={lead} />
//         </div>
//       </div>

//       {/* ✅ Everything below remains exactly the same as your current file */}
//       {/* (keep your existing content after this point) */}
//       <div className="px-8 py-6">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* LEFT */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* Basic Information */}
//             <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//               <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
//                 <div className="flex items-center gap-2">
//                   <ClipboardList className="h-5 w-5 text-gray-500" />
//                   <h2 className="text-lg font-semibold text-gray-900">
//                     Basic Information
//                   </h2>
//                 </div>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Core identifiers & current stage
//                 </p>
//               </div>

//               <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
//                 <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
//                   <p className="text-xs text-gray-500 mb-1">Lead ID</p>
//                   <p className="font-semibold text-gray-900">{lead.lead_id}</p>
//                 </div>
//                 <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
//                   <p className="text-xs text-gray-500 mb-1">Stage</p>
//                   <span
//                     className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStageColor(
//                       lead.stage,
//                     )}`}
//                   >
//                     {lead.stage}
//                   </span>
//                 </div>
//                 <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
//                   <p className="text-xs text-gray-500 mb-1">Next Action</p>
//                   <p className="font-semibold text-gray-900">
//                     {lead.next_action || "Not set"}
//                   </p>
//                 </div>
//                 <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
//                   <p className="text-xs text-gray-500 mb-1">Age</p>
//                   <div className="flex items-center gap-2">
//                     <Calendar className="h-4 w-4 text-gray-400" />
//                     <p className="font-semibold text-gray-900">
//                       {formatAge(lead.created_at)}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Business Profile */}
//             <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//               <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
//                 <div className="flex items-center gap-2">
//                   <BriefcaseBusiness className="h-5 w-5 text-gray-500" />
//                   <h2 className="text-lg font-semibold text-gray-900">
//                     Business Profile
//                   </h2>
//                 </div>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Company details & online presence
//                 </p>
//               </div>

//               <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
//                 <div className="p-4 rounded-xl bg-white border border-gray-100">
//                   <p className="text-xs text-gray-500 mb-1">Company Name</p>
//                   <p className="font-semibold text-gray-900">
//                     {lead.company_name}
//                   </p>
//                 </div>

//                 <div className="p-4 rounded-xl bg-white border border-gray-100">
//                   <p className="text-xs text-gray-500 mb-1">Country</p>
//                   <div className="flex items-center gap-2">
//                     <MapPin className="h-4 w-4 text-gray-400" />
//                     <p className="font-semibold text-gray-900">
//                       {lead.country || "-"}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="p-4 rounded-xl bg-white border border-gray-100">
//                   <p className="text-xs text-gray-500 mb-1">Industry</p>
//                   <p className="font-semibold text-gray-900">
//                     {lead.industry || "-"}
//                   </p>
//                 </div>

//                 <div className="p-4 rounded-xl bg-white border border-gray-100">
//                   <p className="text-xs text-gray-500 mb-1">Website</p>
//                   {lead.website ? (
//                     <a
//                       href={lead.website}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="inline-flex items-center gap-2 font-semibold text-[#3A4E63] hover:underline"
//                     >
//                       <Globe className="h-4 w-4" />
//                       {lead.website}
//                     </a>
//                   ) : (
//                     <p className="font-semibold text-gray-900">-</p>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Contact Details */}
//             <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//               <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
//                 <div className="flex items-center gap-2">
//                   <User className="h-5 w-5 text-gray-500" />
//                   <h2 className="text-lg font-semibold text-gray-900">
//                     Contact Details
//                   </h2>
//                 </div>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Primary point of contact
//                 </p>
//               </div>

//               <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
//                 <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
//                   <p className="text-xs text-gray-500 mb-1">Name</p>
//                   <p className="font-semibold text-gray-900">
//                     {lead.contact_name || "-"}
//                   </p>
//                 </div>

//                 <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
//                   <p className="text-xs text-gray-500 mb-1">Email</p>
//                   <div className="flex items-center gap-2">
//                     <Mail className="h-4 w-4 text-gray-400" />
//                     <p className="font-semibold text-gray-900 break-all">
//                       {lead.contact_email || "-"}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
//                   <p className="text-xs text-gray-500 mb-1">Phone</p>
//                   <div className="flex items-center gap-2">
//                     <Phone className="h-4 w-4 text-gray-400" />
//                     <p className="font-semibold text-gray-900">
//                       {lead.contact_phone || "-"}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Deal Information */}
//             <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//               <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
//                 <div className="flex items-center gap-2">
//                   <BadgeIndianRupee className="h-5 w-5 text-gray-500" />
//                   <h2 className="text-lg font-semibold text-gray-900">
//                     Deal Information
//                   </h2>
//                 </div>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Value, timeline & source
//                 </p>
//               </div>

//               <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
//                 <div className="p-5 rounded-2xl bg-gradient-to-b from-blue-50 to-white border border-blue-100">
//                   <p className="text-xs text-gray-500 mb-2">
//                     Estimated Deal Value
//                   </p>
//                   <p className="text-2xl font-extrabold text-gray-900">
//                     ₹{(lead.estimated_deal_value || 0).toLocaleString()}
//                   </p>
//                 </div>

//                 <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
//                   <p className="text-xs text-gray-500 mb-2">
//                     Expected Timeline
//                   </p>
//                   <p className="text-lg font-bold text-gray-900">
//                     {lead.expected_timeline || "-"}
//                   </p>
//                 </div>

//                 <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
//                   <p className="text-xs text-gray-500 mb-2">Lead Source</p>
//                   <p className="text-lg font-bold text-gray-900 capitalize">
//                     {lead.lead_source || "-"}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Qualification Checklist */}
//             <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//               <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   Qualification Checklist
//                 </h2>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Quick BANT-style readiness indicators
//                 </p>
//               </div>

//               <div className="p-6 space-y-4">
//                 <div className="flex items-center gap-3">
//                   {lead.problem_identified ? (
//                     <CheckCircle2 className="h-5 w-5 text-[#033F99]" />
//                   ) : (
//                     <Clock className="h-5 w-5 text-gray-300" />
//                   )}
//                   <span
//                     className={`text-sm ${
//                       lead.problem_identified
//                         ? "text-blue-700 font-semibold"
//                         : "text-gray-600"
//                     }`}
//                   >
//                     Problem identified
//                   </span>
//                 </div>

//                 <div className="flex items-center gap-3">
//                   {lead.budget_mentioned === "yes" ? (
//                     <CheckCircle2 className="h-5 w-5 text-[#033F99]" />
//                   ) : lead.budget_mentioned === "no" ? (
//                     <AlertTriangle className="h-5 w-5 text-red-500" />
//                   ) : (
//                     <Clock className="h-5 w-5 text-gray-300" />
//                   )}
//                   <span className="text-sm text-gray-600">
//                     Budget mentioned:{" "}
//                     <span className="capitalize font-semibold text-gray-900">
//                       {lead.budget_mentioned}
//                     </span>
//                   </span>
//                 </div>

//                 <div className="flex items-center gap-3">
//                   {lead.authority_known ? (
//                     <CheckCircle2 className="h-5 w-5 text-[#033F99]" />
//                   ) : (
//                     <Clock className="h-5 w-5 text-gray-300" />
//                   )}
//                   <span
//                     className={`text-sm ${
//                       lead.authority_known
//                         ? "text-blue-700 font-semibold"
//                         : "text-gray-600"
//                     }`}
//                   >
//                     Authority/Decision maker known
//                   </span>
//                 </div>

//                 <div className="flex items-center gap-3">
//                   {lead.need_timeline ? (
//                     <CheckCircle2 className="h-5 w-5 text-[#033F99]" />
//                   ) : (
//                     <Clock className="h-5 w-5 text-gray-300" />
//                   )}
//                   <span
//                     className={`text-sm ${
//                       lead.need_timeline
//                         ? "text-emerald-700 font-semibold"
//                         : "text-gray-600"
//                     }`}
//                   >
//                     Timeline need established
//                   </span>
//                 </div>
//               </div>
//             </div>

//             {/* Notes */}
//             {lead.notes && (
//               <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//                 <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
//                   <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
//                 </div>
//                 <div className="p-6">
//                   <p className="text-gray-700 whitespace-pre-wrap">
//                     {lead.notes}
//                   </p>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* RIGHT */}
//           <div className="space-y-6">
//             {/* Lead Health */}
//             <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//               <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
//                 <div className="flex items-center gap-2">
//                   <Activity className="h-5 w-5 text-gray-500" />
//                   <h2 className="text-lg font-semibold text-gray-900">
//                     Lead Health
//                   </h2>
//                 </div>
//               </div>
//               <div className="p-6 space-y-4">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-gray-500 mb-1">Age</p>
//                     <div className="flex items-center gap-2">
//                       <Calendar className="h-4 w-4 text-gray-400" />
//                       <p className="font-semibold text-gray-900">
//                         {formatAge(lead.created_at)}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-sm text-gray-500 mb-1">Health Status</p>
//                     <div className="flex items-center gap-2 justify-end">
//                       <AlertCircle
//                         className={`h-5 w-5 ${
//                           lead.health === "good"
//                             ? "text-green-500"
//                             : lead.health === "warning"
//                               ? "text-yellow-500"
//                               : lead.health === "critical"
//                                 ? "text-red-500"
//                                 : "text-gray-400"
//                         }`}
//                       />
//                       <span
//                         className={`text-sm font-semibold capitalize ${
//                           lead.health === "good"
//                             ? "text-green-600"
//                             : lead.health === "warning"
//                               ? "text-yellow-600"
//                               : lead.health === "critical"
//                                 ? "text-red-600"
//                                 : "text-gray-600"
//                         }`}
//                       >
//                         {lead.health || "Unknown"}
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="pt-4 border-t border-gray-100">
//                   <p className="text-xs text-gray-500">
//                     {lead.health === "good" &&
//                       "Lead is progressing well within expected timeline."}
//                     {lead.health === "warning" &&
//                       "Lead may need attention - consider following up soon."}
//                     {lead.health === "critical" &&
//                       "Lead requires immediate attention - overdue for follow-up."}
//                     {!lead.health &&
//                       "Health status will be calculated based on activity."}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Quick Actions */}
//             {!lead.is_converted && lead.stage !== "disqualified" && (
//               <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//                 <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
//                   <h2 className="text-lg font-semibold text-gray-900">
//                     Quick Actions
//                   </h2>
//                 </div>
//                 <div className="p-6 space-y-3">
//                   {lead.stage === "qualified" && !lead.is_converted && (
//                     <button
//                       onClick={handleConvertToEvaluate}
//                       className="w-full px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
//                     >
//                       <ArrowRight className="h-4 w-4" />
//                       Convert to Evaluate
//                     </button>
//                   )}

//                   {lead.stage === "new" && (
//                     <button
//                       onClick={() => handleStageChange("contacted")}
//                       className="w-full px-4 py-2.5 text-sm font-medium text-yellow-700 bg-yellow-100 rounded-lg hover:bg-yellow-200"
//                     >
//                       Mark as Contacted
//                     </button>
//                   )}

//                   {lead.stage === "contacted" && (
//                     <button
//                       onClick={() => handleStageChange("qualified")}
//                       className="w-full px-4 py-2.5 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200"
//                     >
//                       Mark as Qualified
//                     </button>
//                   )}

//                   <button
//                     onClick={() => handleStageChange("disqualified")}
//                     className="w-full px-4 py-2.5 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200"
//                   >
//                     Disqualify Lead
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* Status */}
//             <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//               <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
//                 <h2 className="text-lg font-semibold text-gray-900">Status</h2>
//               </div>
//               <div className="p-6 space-y-4">
//                 <div>
//                   <p className="text-sm text-gray-500 mb-1">Current Stage</p>
//                   <span
//                     className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold capitalize ${getStageColor(
//                       lead.stage,
//                     )}`}
//                   >
//                     {lead.stage}
//                   </span>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500 mb-1">Next Action</p>
//                   <p className="font-medium text-gray-900">
//                     {lead.next_action || "Not set"}
//                   </p>
//                 </div>
//                 {lead.is_converted && (
//                   <div className="pt-4 border-t border-gray-200">
//                     <p className="text-sm text-green-600 font-medium">
//                       ✓ Converted to Evaluation
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RevenueLeadDetail;

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Target,
  ArrowLeft,
  Edit,
  ArrowRight,
  User,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  AlertCircle,
  Calendar,
  Activity,
  Globe,
  BriefcaseBusiness,
  Mail,
  Phone,
  BadgeIndianRupee,
  MapPin,
  ClipboardList,

  // stepper icons
  FileText,
  PlusCircle,
  PhoneCall,
  SearchCheck,
  BadgeCheck,
  Send,
  ClipboardCheck,
  Trophy,
  FileSignature,
  Share2,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

// ---- Age helpers ----
const calculateAgeInDays = (createdAt) => {
  if (!createdAt) return 0;
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return 0;

  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
};

const formatAge = (createdAt) => {
  const days = calculateAgeInDays(createdAt);
  if (days === 0) return "Today";
  if (days === 1) return "1 day";
  return `${days} days`;
};

// --- Workflow Stepper helpers ---
const WORKFLOW_STEPS = [
  { key: "lead", label: "Lead", icon: FileText },
  { key: "new", label: "New", icon: PlusCircle },
  { key: "contacted", label: "Contacted", icon: PhoneCall },
  { key: "evaluate", label: "Evaluate", icon: SearchCheck },
  { key: "qualified", label: "Qualified", icon: BadgeCheck },
  { key: "proposal_sent", label: "Proposal Sent", icon: Send },
  { key: "commit", label: "Commit", icon: ClipboardCheck },
  { key: "won", label: "Won", icon: Trophy },
  { key: "contract", label: "Contract", icon: FileSignature },
  { key: "handoff", label: "Hand Off", icon: Share2 },
];

const normalizeKey = (v) =>
  String(v ?? "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_");

const getCurrentWorkflowKey = (lead) => {
  if (!lead) return "lead";

  const explicit =
    normalizeKey(lead.workflow_stage) ||
    normalizeKey(lead.stage) ||
    normalizeKey(lead.lead_status) ||
    normalizeKey(lead.status);

  if (WORKFLOW_STEPS.some((s) => s.key === explicit)) return explicit;

  if (lead.is_handed_off) return "handoff";
  if (lead.has_contract) return "contract";
  if (lead.is_won) return "won";
  if (lead.is_committed) return "commit";
  if (lead.is_converted) return "evaluate";

  return "lead";
};

const getStepState = (steps, currentKey, stepKey) => {
  const currentIndex = steps.findIndex((s) => s.key === currentKey);
  const stepIndex = steps.findIndex((s) => s.key === stepKey);
  if (stepIndex < currentIndex) return "done";
  if (stepIndex === currentIndex) return "current";
  return "upcoming";
};

const WorkflowStepper = ({ lead }) => {
  const BIG_STEPS = new Set(["lead", "evaluate", "commit", "won", "handoff"]);
  const currentKey = getCurrentWorkflowKey(lead);

  const currentIndex = WORKFLOW_STEPS.findIndex((s) => s.key === currentKey);
  const safeCurrentIndex = currentIndex === -1 ? 0 : currentIndex;

  const progressPct = Math.max(
    8,
    (safeCurrentIndex / (WORKFLOW_STEPS.length - 1)) * 100,
  );

  return (
    <div className="w-full mt-5">
      <div className="bg-white border border-gray-200 rounded-xl px-5 py-5">
        <div className="relative">
          <div className="h-12 w-full bg-gray-200 rounded-full relative overflow-hidden">
            <div className="absolute right-0 top-0 h-12 w-16">
              <div
                className="absolute right-0 top-0 h-12 w-16"
                style={{
                  clipPath:
                    "polygon(0 0, 60% 0, 100% 50%, 60% 100%, 0 100%, 25% 50%)",
                  backgroundColor: "#E5E7EB",
                }}
              />
            </div>

            <div
              className="absolute left-0 top-0 h-12 bg-[rgba(3,63,153,0.08)]0 rounded-full"
              style={{ width: `${progressPct}%` }}
            />

            <div
              className="absolute top-0 h-12"
              style={{
                left: `calc(${progressPct}% - 16px)`,
                width: "64px",
              }}
            >
              <div
                className="h-12 w-16"
                style={{
                  clipPath:
                    "polygon(0 0, 60% 0, 100% 50%, 60% 100%, 0 100%, 25% 50%)",
                  backgroundColor: "#93C5FD",
                }}
              />
            </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-between px-3">
            {WORKFLOW_STEPS.map((step) => {
              const state = getStepState(WORKFLOW_STEPS, currentKey, step.key);
              const Icon = step.icon;

              const isBig = BIG_STEPS.has(step.key);

              const circleBase = `rounded-full flex items-center justify-center border-4 shadow-sm transition-all ${
                isBig ? "h-16 w-16" : "h-12 w-12"
              }`;

              const circleStyle =
                state === "done"
                  ? "bg-[rgba(3,63,153,0.08)]0 border-white"
                  : state === "current"
                    ? "bg-[rgba(3,63,153,0.08)]0 border-white ring-4 ring-blue-200"
                    : "bg-gray-200 border-white";

              const iconStyle =
                state === "done" || state === "current"
                  ? "text-white"
                  : "text-gray-400";

              const iconSize = isBig ? "h-7 w-7" : "h-5 w-5";

              const labelStyle = `font-semibold whitespace-nowrap ${
                isBig ? "text-base" : "text-xs"
              } ${
                state === "current" || state === "done"
                  ? "text-blue-700"
                  : "text-gray-400"
              }`;

              return (
                <div
                  key={step.key}
                  className="flex flex-col items-center gap-2"
                >
                  <div className={`${circleBase} ${circleStyle}`}>
                    <Icon className={`${iconSize} ${iconStyle}`} />
                  </div>
                  <div className={labelStyle}>{step.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const RevenueLeadDetail = () => {
  const { lead_id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLead();
    //// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead_id]);

  const fetchLead = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/workflow/revenue/leads/${lead_id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      if (data.success) setLead(data.lead);
      else toast.error(data.detail || "Failed to fetch lead");
    } catch (error) {
      toast.error("Failed to fetch lead");
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = async (newStage) => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/workflow/revenue/leads/${lead_id}/stage?new_stage=${newStage}`,
        { method: "PUT", headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      if (data.success) {
        toast.success(`Stage changed to ${newStage}`);
        fetchLead();
      } else {
        toast.error(data.detail || "Failed to change stage");
      }
    } catch (error) {
      toast.error("Failed to change stage");
    }
  };

  const handleConvertToEvaluate = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/workflow/revenue/leads/${lead_id}/convert-to-evaluate`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      if (data.success) {
        toast.success("Lead converted to evaluation");
        navigate(
          `/commerce/revenue-workflow/evaluations/${data.evaluation_id}`,
        );
      } else {
        toast.error(data.detail || "Failed to convert lead");
      }
    } catch (error) {
      toast.error("Failed to convert lead");
    }
  };

  const getStageColor = (stage) => {
    switch (stage) {
      case "new":
        return "bg-blue-100 text-blue-700";
      case "contacted":
        return "bg-yellow-100 text-yellow-700";
      case "qualified":
        return "bg-green-100 text-green-700";
      case "proposal_sent":
        return "bg-indigo-100 text-indigo-700";
      case "won":
        return "bg-emerald-100 text-emerald-700";
      case "disqualified":
      case "lost":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const expectedValue =
    lead?.expected_deal_value ??
    lead?.deal_value ??
    lead?.estimated_deal_value ??
    0;

  // address normalization (works whether backend sends address object OR flat fields)
  const addr = lead?.address || {};
  const addressView = {
    street: addr.street ?? lead?.street ?? "",
    city: addr.city ?? lead?.city ?? "",
    state: addr.state ?? lead?.state ?? "",
    postal_code: addr.postal_code ?? lead?.postal_code ?? "",
    country: addr.country ?? lead?.country ?? "",
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#3A4E63]" />
      </div>
    );

  if (!lead)
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Target className="h-12 w-12 text-gray-300 mb-4" />
        <p className="text-gray-500">Lead not found</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50" data-testid="revenue-lead-detail">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate("/commerce/revenue-workflow/leads")}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-500">Back to Leads</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#3A4E63]/10 rounded-xl flex items-center justify-center">
                <Target className="h-7 w-7 text-[#3A4E63]" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {lead.company_name}
                  </h1>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStageColor(
                      lead.stage,
                    )}`}
                  >
                    {lead.stage}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {lead.lead_id} • {lead.contact_name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {lead.stage === "qualified" && !lead.is_converted && (
                <button
                  onClick={handleConvertToEvaluate}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                >
                  <ArrowRight className="h-4 w-4" />
                  Convert to Evaluate
                </button>
              )}

              {lead.is_converted && (
                <button
                  onClick={() =>
                    navigate(
                      `/commerce/revenue-workflow/evaluations/${lead.evaluation_id}`,
                    )
                  }
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                >
                  <ArrowRight className="h-4 w-4" />
                  View Evaluation
                </button>
              )}

              <button
                onClick={() =>
                  navigate(`/commerce/revenue-workflow/leads/${lead_id}/edit`)
                }
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>
            </div>
          </div>

          <WorkflowStepper lead={lead} />
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">
            {/* ✅ Basic Information (match Lead Create fields) */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-gray-500" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Basic Information
                  </h2>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Lead ID, status & core details
                </p>
              </div>

              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Lead ID</p>
                  <p className="font-semibold text-gray-900 break-all">
                    {lead.lead_id}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Lead Status</p>
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStageColor(
                      lead.stage,
                    )}`}
                  >
                    {lead.stage || "-"}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Lead Name</p>
                  <p className="font-semibold text-gray-900">
                    {lead.lead_name || "-"}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Company Name</p>
                  <p className="font-semibold text-gray-900">
                    {lead.company_name || "-"}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Website</p>
                  {lead.website ? (
                    <a
                      href={lead.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 font-semibold text-[#3A4E63] hover:underline break-all"
                    >
                      <Globe className="h-4 w-4" />
                      {lead.website}
                    </a>
                  ) : (
                    <p className="font-semibold text-gray-900">-</p>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Expected Value</p>
                  <p className="font-extrabold text-gray-900">
                    ₹{Number(expectedValue || 0).toLocaleString()}
                  </p>
                </div>

                <div className="sm:col-span-2 p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Description</p>
                  <p className="font-medium text-gray-900 whitespace-pre-wrap">
                    {lead.description || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Business Profile (keep as now) */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <BriefcaseBusiness className="h-5 w-5 text-gray-500" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Business Profile
                  </h2>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Company details & online presence
                </p>
              </div>

              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl bg-white border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Company Name</p>
                  <p className="font-semibold text-gray-900">
                    {lead.company_name}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Country</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <p className="font-semibold text-gray-900">
                      {lead.country || "-"}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Industry</p>
                  <p className="font-semibold text-gray-900">
                    {lead.industry || "-"}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Website</p>
                  {lead.website ? (
                    <a
                      href={lead.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 font-semibold text-[#3A4E63] hover:underline"
                    >
                      <Globe className="h-4 w-4" />
                      {lead.website}
                    </a>
                  ) : (
                    <p className="font-semibold text-gray-900">-</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact (same) */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-500" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Contact Details
                  </h2>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Primary point of contact
                </p>
              </div>

              <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Name</p>
                  <p className="font-semibold text-gray-900">
                    {lead.contact_name || "-"}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <p className="font-semibold text-gray-900 break-all">
                      {lead.contact_email || "-"}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Phone</p>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <p className="font-semibold text-gray-900">
                      {lead.contact_phone || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Deal Information (same) */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <BadgeIndianRupee className="h-5 w-5 text-gray-500" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Deal Information
                  </h2>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Value, timeline & source
                </p>
              </div>

              <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-5 rounded-2xl bg-gradient-to-b from-blue-50 to-white border border-blue-100">
                  <p className="text-xs text-gray-500 mb-2">
                    Estimated Deal Value
                  </p>
                  <p className="text-2xl font-extrabold text-gray-900">
                    ₹{Number(lead.estimated_deal_value || 0).toLocaleString()}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">
                    Expected Timeline
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {lead.expected_timeline || "-"}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">Lead Source</p>
                  <p className="text-lg font-bold text-gray-900 capitalize">
                    {lead.lead_source || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Qualification Checklist (same) */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Qualification Checklist
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Quick BANT-style readiness indicators
                </p>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  {lead.problem_identified ? (
                    <CheckCircle2 className="h-5 w-5 text-[#033F99]" />
                  ) : (
                    <Clock className="h-5 w-5 text-gray-300" />
                  )}
                  <span
                    className={`text-sm ${
                      lead.problem_identified
                        ? "text-blue-700 font-semibold"
                        : "text-gray-600"
                    }`}
                  >
                    Problem identified
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {lead.budget_mentioned === "yes" ? (
                    <CheckCircle2 className="h-5 w-5 text-[#033F99]" />
                  ) : lead.budget_mentioned === "no" ? (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  ) : (
                    <Clock className="h-5 w-5 text-gray-300" />
                  )}
                  <span className="text-sm text-gray-600">
                    Budget mentioned:{" "}
                    <span className="capitalize font-semibold text-gray-900">
                      {lead.budget_mentioned}
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {lead.authority_known ? (
                    <CheckCircle2 className="h-5 w-5 text-[#033F99]" />
                  ) : (
                    <Clock className="h-5 w-5 text-gray-300" />
                  )}
                  <span
                    className={`text-sm ${
                      lead.authority_known
                        ? "text-blue-700 font-semibold"
                        : "text-gray-600"
                    }`}
                  >
                    Authority/Decision maker known
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {lead.need_timeline ? (
                    <CheckCircle2 className="h-5 w-5 text-[#033F99]" />
                  ) : (
                    <Clock className="h-5 w-5 text-gray-300" />
                  )}
                  <span
                    className={`text-sm ${
                      lead.need_timeline
                        ? "text-emerald-700 font-semibold"
                        : "text-gray-600"
                    }`}
                  >
                    Timeline need established
                  </span>
                </div>
              </div>
            </div>

            {/* Notes (unchanged) */}
            {lead.notes && (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
                </div>
                <div className="p-6">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {lead.notes}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT (keep current) + ✅ Address section added */}
          <div className="space-y-6">
            {/* Lead Health */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-gray-500" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Lead Health
                  </h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Age</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <p className="font-semibold text-gray-900">
                        {formatAge(lead.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 mb-1">Health Status</p>
                    <div className="flex items-center gap-2 justify-end">
                      <AlertCircle
                        className={`h-5 w-5 ${
                          lead.health === "good"
                            ? "text-green-500"
                            : lead.health === "warning"
                              ? "text-yellow-500"
                              : lead.health === "critical"
                                ? "text-red-500"
                                : "text-gray-400"
                        }`}
                      />
                      <span
                        className={`text-sm font-semibold capitalize ${
                          lead.health === "good"
                            ? "text-green-600"
                            : lead.health === "warning"
                              ? "text-yellow-600"
                              : lead.health === "critical"
                                ? "text-red-600"
                                : "text-gray-600"
                        }`}
                      >
                        {lead.health || "Unknown"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    {lead.health === "good" &&
                      "Lead is progressing well within expected timeline."}
                    {lead.health === "warning" &&
                      "Lead may need attention - consider following up soon."}
                    {lead.health === "critical" &&
                      "Lead requires immediate attention - overdue for follow-up."}
                    {!lead.health &&
                      "Health status will be calculated based on activity."}
                  </p>
                </div>
              </div>
            </div>

            {/* ✅ Address (new on right) */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Address
                  </h2>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 gap-4">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Street</p>
                  <p className="font-semibold text-gray-900">
                    {addressView.street || "-"}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">City</p>
                    <p className="font-semibold text-gray-900">
                      {addressView.city || "-"}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">State/Province</p>
                    <p className="font-semibold text-gray-900">
                      {addressView.state || "-"}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">
                      Zip/Postal Code
                    </p>
                    <p className="font-semibold text-gray-900">
                      {addressView.postal_code || "-"}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Country</p>
                    <p className="font-semibold text-gray-900">
                      {addressView.country || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions (same) */}
            {!lead.is_converted && lead.stage !== "disqualified" && (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Quick Actions
                  </h2>
                </div>
                <div className="p-6 space-y-3">
                  {lead.stage === "qualified" && !lead.is_converted && (
                    <button
                      onClick={handleConvertToEvaluate}
                      className="w-full px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <ArrowRight className="h-4 w-4" />
                      Convert to Evaluate
                    </button>
                  )}

                  {lead.stage === "new" && (
                    <button
                      onClick={() => handleStageChange("contacted")}
                      className="w-full px-4 py-2.5 text-sm font-medium text-yellow-700 bg-yellow-100 rounded-lg hover:bg-yellow-200"
                    >
                      Mark as Contacted
                    </button>
                  )}

                  {lead.stage === "contacted" && (
                    <button
                      onClick={() => handleStageChange("qualified")}
                      className="w-full px-4 py-2.5 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200"
                    >
                      Mark as Qualified
                    </button>
                  )}

                  <button
                    onClick={() => handleStageChange("disqualified")}
                    className="w-full px-4 py-2.5 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200"
                  >
                    Disqualify Lead
                  </button>
                </div>
              </div>
            )}

            {/* Status (same) */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Status</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Current Stage</p>
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold capitalize ${getStageColor(
                      lead.stage,
                    )}`}
                  >
                    {lead.stage}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Next Action</p>
                  <p className="font-medium text-gray-900">
                    {lead.next_action || "Not set"}
                  </p>
                </div>
                {lead.is_converted && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-green-600 font-medium">
                      ✓ Converted to Evaluation
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* /RIGHT */}
        </div>
      </div>
    </div>
  );
};

export default RevenueLeadDetail;
