// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import {
//   Target,
//   Save,
//   ArrowLeft,
//   X,
//   Building2,
//   User,
//   Globe,
//   BadgeDollarSign,
//   CheckSquare,
//   Loader2,
// } from "lucide-react";
// import { toast } from "sonner";

// const API_URL = process.env.REACT_APP_BACKEND_URL;

// const RevenueLeadEdit = () => {
//   const { lead_id } = useParams();
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [formData, setFormData] = useState({
//     company_name: "",
//     website: "",
//     country: "",
//     industry: "",
//     contact_name: "",
//     contact_email: "",
//     contact_phone: "",
//     lead_source: "inbound",
//     estimated_deal_value: 0,
//     expected_timeline: "3-6 months",
//     problem_identified: false,
//     budget_mentioned: "unknown",
//     authority_known: false,
//     need_timeline: false,
//     notes: "",
//     next_action: "",
//   });

//   useEffect(() => {
//     fetchLead();
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
//       if (data.success && data.lead) {
//         const lead = data.lead;
//         setFormData({
//           company_name: lead.company_name || "",
//           website: lead.website || "",
//           country: lead.country || "",
//           industry: lead.industry || "",
//           contact_name: lead.contact_name || "",
//           contact_email: lead.contact_email || "",
//           contact_phone: lead.contact_phone || "",
//           lead_source: lead.lead_source || "inbound",
//           estimated_deal_value: lead.estimated_deal_value || 0,
//           expected_timeline: lead.expected_timeline || "3-6 months",
//           problem_identified: lead.problem_identified || false,
//           budget_mentioned: lead.budget_mentioned || "unknown",
//           authority_known: lead.authority_known || false,
//           need_timeline: lead.need_timeline || false,
//           notes: lead.notes || "",
//           next_action: lead.next_action || "",
//         });
//       }
//     } catch (error) {
//       toast.error("Failed to fetch lead");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]:
//         type === "checkbox"
//           ? checked
//           : type === "number"
//             ? parseFloat(value) || 0
//             : value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSaving(true);
//     try {
//       const token = localStorage.getItem("access_token");
//       const res = await fetch(
//         `${API_URL}/api/commerce/workflow/revenue/leads/${lead_id}`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify(formData),
//         },
//       );
//       const data = await res.json();
//       if (data.success) {
//         toast.success("Lead updated successfully");
//         navigate(`/commerce/revenue-workflow/leads/${lead_id}`);
//       } else {
//         toast.error(data.detail || "Failed to update lead");
//       }
//     } catch (error) {
//       toast.error("Error updating lead");
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading)
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <Loader2 className="h-8 w-8 animate-spin text-[#3A4E63]" />
//       </div>
//     );

//   return (
//     <div className="min-h-screen bg-gray-50" data-testid="revenue-lead-edit">
//       <div className="bg-white border-b border-gray-200">
//         <div className="px-8 py-6">
//           <div className="flex items-center gap-4">
//             <button
//               onClick={() =>
//                 navigate(`/commerce/revenue-workflow/leads/${lead_id}`)
//               }
//               className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
//             >
//               <ArrowLeft className="h-5 w-5" />
//             </button>
//             <div>
//               <h1 className="text-2xl font-semibold text-gray-900">
//                 Edit Lead
//               </h1>
//               <p className="mt-1 text-sm text-gray-500">
//                 Update lead information
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="px-8 py-6 max-w-4xl">
//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Company Info */}
//           <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//             <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
//               <div className="flex items-center gap-2">
//                 <Building2 className="h-5 w-5 text-gray-500" />
//                 <h2 className="text-lg font-medium text-gray-900">
//                   Company Information
//                 </h2>
//               </div>
//             </div>
//             <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="md:col-span-2">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Company Name *
//                 </label>
//                 <input
//                   type="text"
//                   name="company_name"
//                   value={formData.company_name}
//                   onChange={handleChange}
//                   required
//                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                   placeholder="Enter company name"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Website
//                 </label>
//                 <input
//                   type="url"
//                   name="website"
//                   value={formData.website}
//                   onChange={handleChange}
//                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                   placeholder="https://example.com"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Country *
//                 </label>
//                 <input
//                   type="text"
//                   name="country"
//                   value={formData.country}
//                   onChange={handleChange}
//                   required
//                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                   placeholder="Enter country"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Industry
//                 </label>
//                 <select
//                   name="industry"
//                   value={formData.industry}
//                   onChange={handleChange}
//                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63] bg-white"
//                 >
//                   <option value="">Select Industry</option>
//                   <option value="Technology">Technology</option>
//                   <option value="Manufacturing">Manufacturing</option>
//                   <option value="Healthcare">Healthcare</option>
//                   <option value="Finance">Finance</option>
//                   <option value="Retail">Retail</option>
//                   <option value="Education">Education</option>
//                   <option value="Other">Other</option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* Primary Contact */}
//           <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//             <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
//               <div className="flex items-center gap-2">
//                 <User className="h-5 w-5 text-gray-500" />
//                 <h2 className="text-lg font-medium text-gray-900">
//                   Primary Contact
//                 </h2>
//               </div>
//             </div>
//             <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Contact Name *
//                 </label>
//                 <input
//                   type="text"
//                   name="contact_name"
//                   value={formData.contact_name}
//                   onChange={handleChange}
//                   required
//                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                   placeholder="Enter name"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Email *
//                 </label>
//                 <input
//                   type="email"
//                   name="contact_email"
//                   value={formData.contact_email}
//                   onChange={handleChange}
//                   required
//                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                   placeholder="email@example.com"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Phone
//                 </label>
//                 <input
//                   type="tel"
//                   name="contact_phone"
//                   value={formData.contact_phone}
//                   onChange={handleChange}
//                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                   placeholder="+91-XXXXXXXXXX"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Lead Metadata */}
//           <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//             <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
//               <div className="flex items-center gap-2">
//                 <BadgeDollarSign className="h-5 w-5 text-gray-500" />
//                 <h2 className="text-lg font-medium text-gray-900">
//                   Lead Metadata
//                 </h2>
//               </div>
//             </div>
//             <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Lead Source *
//                 </label>
//                 <select
//                   name="lead_source"
//                   value={formData.lead_source}
//                   onChange={handleChange}
//                   required
//                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63] bg-white"
//                 >
//                   <option value="inbound">Inbound</option>
//                   <option value="outbound">Outbound</option>
//                   <option value="linkedin">LinkedIn</option>
//                   <option value="referral">Referral</option>
//                   <option value="website">Website</option>
//                   <option value="trade_show">Trade Show</option>
//                   <option value="partner">Partner</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Estimated Deal Value (₹)
//                 </label>
//                 <input
//                   type="number"
//                   name="estimated_deal_value"
//                   value={formData.estimated_deal_value}
//                   onChange={handleChange}
//                   min="0"
//                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Expected Timeline
//                 </label>
//                 <select
//                   name="expected_timeline"
//                   value={formData.expected_timeline}
//                   onChange={handleChange}
//                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63] bg-white"
//                 >
//                   <option value="0-3 months">0-3 months</option>
//                   <option value="3-6 months">3-6 months</option>
//                   <option value="6-12 months">6-12 months</option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* Qualification Checklist */}
//           <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//             <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
//               <div className="flex items-center gap-2">
//                 <CheckSquare className="h-5 w-5 text-gray-500" />
//                 <h2 className="text-lg font-medium text-gray-900">
//                   Qualification Checklist
//                 </h2>
//               </div>
//             </div>
//             <div className="p-6 space-y-4">
//               <label className="flex items-center gap-3 cursor-pointer">
//                 <input
//                   type="checkbox"
//                   name="problem_identified"
//                   checked={formData.problem_identified}
//                   onChange={handleChange}
//                   className="w-5 h-5 rounded border-gray-300 text-[#3A4E63] focus:ring-[#3A4E63]"
//                 />
//                 <span className="text-sm font-medium text-gray-700">
//                   Problem identified?
//                 </span>
//               </label>
//               <div className="flex items-center gap-4">
//                 <span className="text-sm font-medium text-gray-700">
//                   Budget mentioned?
//                 </span>
//                 <div className="flex gap-3">
//                   {["yes", "no", "unknown"].map((val) => (
//                     <label
//                       key={val}
//                       className="flex items-center gap-2 cursor-pointer"
//                     >
//                       <input
//                         type="radio"
//                         name="budget_mentioned"
//                         value={val}
//                         checked={formData.budget_mentioned === val}
//                         onChange={handleChange}
//                         className="w-4 h-4 text-[#3A4E63] focus:ring-[#3A4E63]"
//                       />
//                       <span className="text-sm text-gray-600 capitalize">
//                         {val}
//                       </span>
//                     </label>
//                   ))}
//                 </div>
//               </div>
//               <label className="flex items-center gap-3 cursor-pointer">
//                 <input
//                   type="checkbox"
//                   name="authority_known"
//                   checked={formData.authority_known}
//                   onChange={handleChange}
//                   className="w-5 h-5 rounded border-gray-300 text-[#3A4E63] focus:ring-[#3A4E63]"
//                 />
//                 <span className="text-sm font-medium text-gray-700">
//                   Authority/Decision maker known?
//                 </span>
//               </label>
//               <label className="flex items-center gap-3 cursor-pointer">
//                 <input
//                   type="checkbox"
//                   name="need_timeline"
//                   checked={formData.need_timeline}
//                   onChange={handleChange}
//                   className="w-5 h-5 rounded border-gray-300 text-[#3A4E63] focus:ring-[#3A4E63]"
//                 />
//                 <span className="text-sm font-medium text-gray-700">
//                   Timeline need established?
//                 </span>
//               </label>
//             </div>
//           </div>

//           {/* Next Action & Notes */}
//           <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//             <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
//               <h2 className="text-lg font-medium text-gray-900">
//                 Next Action & Notes
//               </h2>
//             </div>
//             <div className="p-6 space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Next Action
//                 </label>
//                 <input
//                   type="text"
//                   name="next_action"
//                   value={formData.next_action}
//                   onChange={handleChange}
//                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                   placeholder="e.g., Schedule demo, Follow up call"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Notes
//                 </label>
//                 <textarea
//                   name="notes"
//                   value={formData.notes}
//                   onChange={handleChange}
//                   rows={3}
//                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                   placeholder="Additional notes about this lead..."
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Actions */}
//           <div className="flex items-center justify-end gap-3">
//             <button
//               type="button"
//               onClick={() =>
//                 navigate(`/commerce/revenue-workflow/leads/${lead_id}`)
//               }
//               className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//             >
//               <X className="h-4 w-4" />
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={saving}
//               className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-[#3A4E63] rounded-lg hover:bg-[#022d6e] transition-colors shadow-sm disabled:opacity-50"
//             >
//               <Save className="h-4 w-4" />
//               {saving ? "Saving..." : "Save Changes"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default RevenueLeadEdit;

// import React, { useState, useEffect, useMemo } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import {
//   Save,
//   ArrowLeft,
//   X,
//   Building2,
//   User,
//   BadgeDollarSign,
//   CheckSquare,
//   Loader2,
//   Tag,
//   Calendar,
//   Briefcase,
//   Percent,
//   ShieldCheck,
// } from "lucide-react";
// import { toast } from "sonner";

// const API_URL = process.env.REACT_APP_BACKEND_URL;

// const RevenueLeadEdit = () => {
//   const { lead_id } = useParams();
//   const navigate = useNavigate();

//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   const [formData, setFormData] = useState({
//     // Company
//     company_name: "",
//     website: "",
//     country: "",
//     industry: "",

//     // Contact
//     contact_name: "",
//     contact_email: "",
//     contact_phone: "",

//     // Metadata
//     lead_source: "inbound",
//     estimated_deal_value: 0,
//     expected_timeline: "3-6 months",

//     // Qualification
//     problem_identified: false,
//     budget_mentioned: "unknown",
//     authority_known: false,
//     need_timeline: false,

//     // New fields (post-creation edits)
//     lead_stage: "new", // new, qualified, proposal, negotiation, won, lost
//     lead_status: "open", // open, on_hold, closed
//     priority: "medium", // low, medium, high
//     probability: 10, // 0 - 100
//     assigned_to: "", // owner name/email (based on your system)
//     tags: "", // comma separated
//     next_follow_up: "", // YYYY-MM-DD
//     last_contacted: "", // YYYY-MM-DD

//     // Notes & Action
//     notes: "",
//     next_action: "",
//   });

//   const stagePill = useMemo(() => {
//     const map = {
//       new: "bg-blue-50 text-blue-700 ring-blue-200",
//       qualified: "bg-indigo-50 text-indigo-700 ring-indigo-200",
//       proposal: "bg-amber-50 text-amber-700 ring-amber-200",
//       negotiation: "bg-orange-50 text-orange-700 ring-orange-200",
//       won: "bg-emerald-50 text-emerald-700 ring-emerald-200",
//       lost: "bg-rose-50 text-rose-700 ring-rose-200",
//     };
//     return map[formData.lead_stage] || "bg-gray-50 text-gray-700 ring-gray-200";
//   }, [formData.lead_stage]);

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

//       if (data.success && data.lead) {
//         const lead = data.lead;

//         setFormData((prev) => ({
//           ...prev,
//           company_name: lead.company_name || "",
//           website: lead.website || "",
//           country: lead.country || "",
//           industry: lead.industry || "",

//           contact_name: lead.contact_name || "",
//           contact_email: lead.contact_email || "",
//           contact_phone: lead.contact_phone || "",

//           lead_source: lead.lead_source || "inbound",
//           estimated_deal_value: lead.estimated_deal_value || 0,
//           expected_timeline: lead.expected_timeline || "3-6 months",

//           problem_identified: !!lead.problem_identified,
//           budget_mentioned: lead.budget_mentioned || "unknown",
//           authority_known: !!lead.authority_known,
//           need_timeline: !!lead.need_timeline,

//           // New fields (only if backend provides; otherwise they remain defaults)
//           lead_stage: lead.lead_stage || "new",
//           lead_status: lead.lead_status || "open",
//           priority: lead.priority || "medium",
//           probability:
//             typeof lead.probability === "number" ? lead.probability : 10,
//           assigned_to: lead.assigned_to || "",
//           tags: Array.isArray(lead.tags)
//             ? lead.tags.join(", ")
//             : lead.tags || "",
//           next_follow_up: lead.next_follow_up || "",
//           last_contacted: lead.last_contacted || "",

//           notes: lead.notes || "",
//           next_action: lead.next_action || "",
//         }));
//       } else {
//         toast.error(data.detail || "Failed to fetch lead");
//       }
//     } catch (error) {
//       toast.error("Failed to fetch lead");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;

//     setFormData((prev) => ({
//       ...prev,
//       [name]:
//         type === "checkbox"
//           ? checked
//           : type === "number"
//             ? Number.isFinite(parseFloat(value))
//               ? parseFloat(value)
//               : 0
//             : value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSaving(true);

//     try {
//       const token = localStorage.getItem("access_token");

//       // Optional: convert tags string to array before sending (if backend expects array)
//       const payload = {
//         ...formData,
//         tags:
//           typeof formData.tags === "string"
//             ? formData.tags
//                 .split(",")
//                 .map((t) => t.trim())
//                 .filter(Boolean)
//             : formData.tags,
//       };

//       const res = await fetch(
//         `${API_URL}/api/commerce/workflow/revenue/leads/${lead_id}`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify(payload),
//         },
//       );

//       const data = await res.json();

//       if (data.success) {
//         toast.success("Lead updated successfully");
//         navigate(`/commerce/revenue-workflow/leads/${lead_id}`);
//       } else {
//         toast.error(data.detail || "Failed to update lead");
//       }
//     } catch (error) {
//       toast.error("Error updating lead");
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading)
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
//         <div className="flex items-center gap-3 text-slate-700">
//           <Loader2 className="h-7 w-7 animate-spin text-[#3A4E63]" />
//           <span className="text-sm">Loading lead...</span>
//         </div>
//       </div>
//     );

//   return (
//     <div
//       className="min-h-screen bg-gradient-to-b from-slate-50 to-white"
//       data-testid="revenue-lead-edit"
//     >
//       {/* Sticky header + actions */}
//       <div className="sticky top-0 z-20 backdrop-blur bg-white/80 border-b border-slate-200">
//         <div className="px-6 md:px-10 py-4 flex items-center justify-between gap-4">
//           <div className="flex items-center gap-3">
//             <button
//               onClick={() =>
//                 navigate(`/commerce/revenue-workflow/leads/${lead_id}`)
//               }
//               className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
//               title="Back"
//             >
//               <ArrowLeft className="h-5 w-5" />
//             </button>

//             <div>
//               <div className="flex items-center gap-2">
//                 <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
//                   Edit Lead
//                 </h1>
//                 <span
//                   className={`text-xs px-2 py-1 rounded-full ring-1 ${stagePill}`}
//                 >
//                   {formData.lead_stage.replace("_", " ")}
//                 </span>
//               </div>
//               <p className="text-sm text-slate-500">
//                 Update lead information & qualification
//               </p>
//             </div>
//           </div>

//           <div className="flex items-center gap-2">
//             <button
//               type="button"
//               onClick={() =>
//                 navigate(`/commerce/revenue-workflow/leads/${lead_id}`)
//               }
//               className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition"
//             >
//               <X className="h-4 w-4" />
//               Cancel
//             </button>

//             <button
//               form="lead-edit-form"
//               type="submit"
//               disabled={saving}
//               className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-[#3A4E63] rounded-xl hover:bg-[#022d6e] transition shadow-sm disabled:opacity-60"
//             >
//               {saving ? (
//                 <>
//                   <Loader2 className="h-4 w-4 animate-spin" />
//                   Saving...
//                 </>
//               ) : (
//                 <>
//                   <Save className="h-4 w-4" />
//                   Save Changes
//                 </>
//               )}
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="px-6 md:px-10 py-8 max-w-5xl">
//         <form id="lead-edit-form" onSubmit={handleSubmit} className="space-y-6">
//           {/* Quick Controls */}
//           <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
//             <Card title="Stage" icon={Briefcase}>
//               <select
//                 name="lead_stage"
//                 value={formData.lead_stage}
//                 onChange={handleChange}
//                 className="field"
//               >
//                 <option value="new">New</option>
//                 <option value="qualified">Qualified</option>
//                 <option value="proposal">Proposal</option>
//                 <option value="negotiation">Negotiation</option>
//                 <option value="won">Won</option>
//                 <option value="lost">Lost</option>
//               </select>
//             </Card>

//             <Card title="Status" icon={ShieldCheck}>
//               <select
//                 name="lead_status"
//                 value={formData.lead_status}
//                 onChange={handleChange}
//                 className="field"
//               >
//                 <option value="open">Open</option>
//                 <option value="on_hold">On Hold</option>
//                 <option value="closed">Closed</option>
//               </select>
//             </Card>

//             <Card title="Priority" icon={CheckSquare}>
//               <select
//                 name="priority"
//                 value={formData.priority}
//                 onChange={handleChange}
//                 className="field"
//               >
//                 <option value="low">Low</option>
//                 <option value="medium">Medium</option>
//                 <option value="high">High</option>
//               </select>
//             </Card>

//             <Card title="Probability" icon={Percent}>
//               <div className="flex items-center gap-3">
//                 <input
//                   type="range"
//                   name="probability"
//                   min="0"
//                   max="100"
//                   value={formData.probability}
//                   onChange={handleChange}
//                   className="w-full"
//                 />
//                 <span className="text-sm font-semibold text-slate-800 w-10 text-right">
//                   {Math.round(formData.probability)}%
//                 </span>
//               </div>
//               <p className="text-xs text-slate-500 mt-2">
//                 Your best estimate of conversion chance.
//               </p>
//             </Card>
//           </div>

//           {/* Company Info */}
//           <Section title="Company Information" icon={Building2}>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//               <Field label="Company Name *">
//                 <input
//                   type="text"
//                   name="company_name"
//                   value={formData.company_name}
//                   onChange={handleChange}
//                   required
//                   className="field"
//                   placeholder="Enter company name"
//                 />
//               </Field>

//               <Field label="Website">
//                 <input
//                   type="url"
//                   name="website"
//                   value={formData.website}
//                   onChange={handleChange}
//                   className="field"
//                   placeholder="https://example.com"
//                 />
//               </Field>

//               <Field label="Country *">
//                 <input
//                   type="text"
//                   name="country"
//                   value={formData.country}
//                   onChange={handleChange}
//                   required
//                   className="field"
//                   placeholder="Enter country"
//                 />
//               </Field>

//               <Field label="Industry">
//                 <select
//                   name="industry"
//                   value={formData.industry}
//                   onChange={handleChange}
//                   className="field"
//                 >
//                   <option value="">Select Industry</option>
//                   <option value="Technology">Technology</option>
//                   <option value="Manufacturing">Manufacturing</option>
//                   <option value="Healthcare">Healthcare</option>
//                   <option value="Finance">Finance</option>
//                   <option value="Retail">Retail</option>
//                   <option value="Education">Education</option>
//                   <option value="Other">Other</option>
//                 </select>
//               </Field>
//             </div>
//           </Section>

//           {/* Primary Contact */}
//           <Section title="Primary Contact" icon={User}>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
//               <Field label="Contact Name *">
//                 <input
//                   type="text"
//                   name="contact_name"
//                   value={formData.contact_name}
//                   onChange={handleChange}
//                   required
//                   className="field"
//                   placeholder="Enter name"
//                 />
//               </Field>

//               <Field label="Email *">
//                 <input
//                   type="email"
//                   name="contact_email"
//                   value={formData.contact_email}
//                   onChange={handleChange}
//                   required
//                   className="field"
//                   placeholder="email@example.com"
//                 />
//               </Field>

//               <Field label="Phone">
//                 <input
//                   type="tel"
//                   name="contact_phone"
//                   value={formData.contact_phone}
//                   onChange={handleChange}
//                   className="field"
//                   placeholder="+91-XXXXXXXXXX"
//                 />
//               </Field>
//             </div>
//           </Section>

//           {/* Lead Metadata */}
//           <Section title="Lead Metadata" icon={BadgeDollarSign}>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
//               <Field label="Lead Source *">
//                 <select
//                   name="lead_source"
//                   value={formData.lead_source}
//                   onChange={handleChange}
//                   required
//                   className="field"
//                 >
//                   <option value="inbound">Inbound</option>
//                   <option value="outbound">Outbound</option>
//                   <option value="linkedin">LinkedIn</option>
//                   <option value="referral">Referral</option>
//                   <option value="website">Website</option>
//                   <option value="trade_show">Trade Show</option>
//                   <option value="partner">Partner</option>
//                 </select>
//               </Field>

//               <Field label="Estimated Deal Value (₹)">
//                 <input
//                   type="number"
//                   name="estimated_deal_value"
//                   value={formData.estimated_deal_value}
//                   onChange={handleChange}
//                   min="0"
//                   className="field"
//                 />
//               </Field>

//               <Field label="Expected Timeline">
//                 <select
//                   name="expected_timeline"
//                   value={formData.expected_timeline}
//                   onChange={handleChange}
//                   className="field"
//                 >
//                   <option value="0-3 months">0-3 months</option>
//                   <option value="3-6 months">3-6 months</option>
//                   <option value="6-12 months">6-12 months</option>
//                 </select>
//               </Field>

//               <Field label="Assigned To">
//                 <input
//                   type="text"
//                   name="assigned_to"
//                   value={formData.assigned_to}
//                   onChange={handleChange}
//                   className="field"
//                   placeholder="e.g., revanth@company.com"
//                 />
//               </Field>

//               <Field label="Tags" hint="Comma separated">
//                 <div className="relative">
//                   <Tag className="h-4 w-4 text-slate-400 absolute left-3 top-3.5" />
//                   <input
//                     type="text"
//                     name="tags"
//                     value={formData.tags}
//                     onChange={handleChange}
//                     className="field pl-9"
//                     placeholder="e.g., enterprise, warm, referral"
//                   />
//                 </div>
//               </Field>
//             </div>
//           </Section>

//           {/* Qualification Checklist */}
//           <Section title="Qualification Checklist" icon={CheckSquare}>
//             <div className="space-y-4">
//               <CheckboxRow
//                 name="problem_identified"
//                 checked={formData.problem_identified}
//                 onChange={handleChange}
//                 label="Problem identified?"
//               />

//               <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
//                 <span className="text-sm font-medium text-slate-700">
//                   Budget mentioned?
//                 </span>
//                 <div className="flex gap-3">
//                   {["yes", "no", "unknown"].map((val) => (
//                     <label
//                       key={val}
//                       className={`px-3 py-2 rounded-xl border text-sm cursor-pointer transition ${
//                         formData.budget_mentioned === val
//                           ? "border-[#3A4E63] bg-blue-50 text-[#3A4E63]"
//                           : "border-slate-200 hover:bg-slate-50 text-slate-600"
//                       }`}
//                     >
//                       <input
//                         type="radio"
//                         name="budget_mentioned"
//                         value={val}
//                         checked={formData.budget_mentioned === val}
//                         onChange={handleChange}
//                         className="hidden"
//                       />
//                       <span className="capitalize">{val}</span>
//                     </label>
//                   ))}
//                 </div>
//               </div>

//               <CheckboxRow
//                 name="authority_known"
//                 checked={formData.authority_known}
//                 onChange={handleChange}
//                 label="Authority / Decision maker known?"
//               />

//               <CheckboxRow
//                 name="need_timeline"
//                 checked={formData.need_timeline}
//                 onChange={handleChange}
//                 label="Timeline need established?"
//               />
//             </div>
//           </Section>

//           {/* Follow-ups */}
//           <Section title="Follow-up" icon={Calendar}>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//               <Field label="Next Follow-up Date">
//                 <input
//                   type="date"
//                   name="next_follow_up"
//                   value={formData.next_follow_up}
//                   onChange={handleChange}
//                   className="field"
//                 />
//               </Field>

//               <Field label="Last Contacted">
//                 <input
//                   type="date"
//                   name="last_contacted"
//                   value={formData.last_contacted}
//                   onChange={handleChange}
//                   className="field"
//                 />
//               </Field>
//             </div>
//           </Section>

//           {/* Next Action & Notes */}
//           <Section title="Next Action & Notes">
//             <div className="space-y-4">
//               <Field label="Next Action">
//                 <input
//                   type="text"
//                   name="next_action"
//                   value={formData.next_action}
//                   onChange={handleChange}
//                   className="field"
//                   placeholder="e.g., Schedule demo, Follow up call"
//                 />
//               </Field>

//               <Field label="Notes">
//                 <textarea
//                   name="notes"
//                   value={formData.notes}
//                   onChange={handleChange}
//                   rows={4}
//                   className="field"
//                   placeholder="Additional notes about this lead..."
//                 />
//               </Field>
//             </div>
//           </Section>
//         </form>
//       </div>

//       {/* Tailwind helpers */}
//       <style>{`
//         .field {
//           width: 100%;
//           padding: 10px 12px;
//           border: 1px solid rgb(203 213 225);
//           border-radius: 12px;
//           outline: none;
//           background: white;
//         }
//         .field:focus {
//           border-color: #3A4E63;
//           box-shadow: 0 0 0 3px rgba(3, 63, 153, 0.15);
//         }
//       `}</style>
//     </div>
//   );
// };

// function Section({ title, icon: Icon, children }) {
//   return (
//     <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
//       <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
//         <div className="flex items-center gap-2">
//           {Icon ? <Icon className="h-5 w-5 text-slate-500" /> : null}
//           <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
//         </div>
//       </div>
//       <div className="p-6">{children}</div>
//     </div>
//   );
// }

// function Card({ title, icon: Icon, children }) {
//   return (
//     <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
//       <div className="flex items-center gap-2 mb-3">
//         {Icon ? <Icon className="h-4 w-4 text-slate-500" /> : null}
//         <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
//       </div>
//       {children}
//     </div>
//   );
// }

// function Field({ label, hint, children }) {
//   return (
//     <div>
//       <div className="flex items-baseline justify-between gap-2 mb-2">
//         <label className="block text-sm font-medium text-slate-700">
//           {label}
//         </label>
//         {hint ? <span className="text-xs text-slate-400">{hint}</span> : null}
//       </div>
//       {children}
//     </div>
//   );
// }

// function CheckboxRow({ name, checked, onChange, label }) {
//   return (
//     <label className="flex items-center gap-3 cursor-pointer select-none">
//       <input
//         type="checkbox"
//         name={name}
//         checked={checked}
//         onChange={onChange}
//         className="w-5 h-5 rounded border-slate-300 text-[#3A4E63] focus:ring-[#3A4E63]"
//       />
//       <span className="text-sm font-medium text-slate-700">{label}</span>
//     </label>
//   );
// }

// export default RevenueLeadEdit;

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  X,
  Building2,
  User,
  MapPin,
  Briefcase,
  BadgeDollarSign,
  CheckSquare,
  Loader2,
  Plus,
  Trash2,
  Crown,
  Globe,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

// ---------- helpers ----------
const emptyContact = (isPrimary = false) => ({
  full_name: "",
  email: "",
  phone: "",
  role: "",
  is_primary: isPrimary,
});

const toNum = (v) => {
  const n = Number(String(v ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const RevenueLeadEdit = () => {
  const { lead_id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // keep stage/status but do NOT show in UI (avoid accidental reset)
  const [lockedMeta, setLockedMeta] = useState({
    stage: "new",
    lead_status: "new",
    status: "new",
    workflow_stage: "",
  });

  const [formData, setFormData] = useState({
    // Basic
    lead_id: "",
    lead_name: "",
    company_name: "",
    website: "",
    description: "",

    // Address (MUST match create + detail)
    address: {
      country: "",
      street: "",
      city: "",
      state: "",
      postal_code: "",
    },

    // Business profile
    business: {
      industry: "",
      employees: "",
      annual_revenue: "",
      lead_source: "inbound",
      assigned_to: "",
    },

    // Deal
    expected_timeline: "3-6 months",
    estimated_deal_value: 0, // your old edit uses this
    expected_deal_value: 0, // create uses this
    deal_value: 0, // create uses this

    // Contacts (same shape as create)
    contacts: [emptyContact(true)],

    // Qualification
    problem_identified: false,
    budget_mentioned: "unknown",
    authority_known: false,
    need_timeline: false,

    // Notes & Action
    notes: "",
    next_action: "",
  });

  const dealValueNum = useMemo(
    () =>
      toNum(
        formData.expected_deal_value ??
          formData.estimated_deal_value ??
          formData.deal_value,
      ),
    [
      formData.expected_deal_value,
      formData.estimated_deal_value,
      formData.deal_value,
    ],
  );

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
      if (!data?.success || !data?.lead) {
        toast.error(data?.detail || "Failed to fetch lead");
        setLoading(false);
        return;
      }

      const lead = data.lead;

      // preserve stage/status without showing
      setLockedMeta({
        stage: lead.stage || lead.lead_status || lead.status || "new",
        lead_status: lead.lead_status || lead.stage || lead.status || "new",
        status: lead.status || lead.stage || lead.lead_status || "new",
        workflow_stage: lead.workflow_stage || "",
      });

      // normalize contacts:
      // 1) backend may send lead.contacts[]
      // 2) OR only send contact_name/contact_email/contact_phone
      let contacts = [];
      if (Array.isArray(lead.contacts) && lead.contacts.length > 0) {
        contacts = lead.contacts.map((c) => ({
          full_name: c?.full_name || c?.name || "",
          email: c?.email || "",
          phone: c?.phone || "",
          role: c?.role || "",
          is_primary: !!c?.is_primary,
        }));

        // ensure exactly one primary
        const primaryCount = contacts.filter((c) => c.is_primary).length;
        if (primaryCount === 0) contacts[0].is_primary = true;
        if (primaryCount > 1) {
          let found = false;
          contacts = contacts.map((c) => {
            if (c.is_primary) {
              if (!found) {
                found = true;
                return c;
              }
              return { ...c, is_primary: false };
            }
            return c;
          });
        }
      } else {
        contacts = [
          {
            full_name: lead.contact_name || "",
            email: lead.contact_email || "",
            phone: lead.contact_phone || "",
            role: "",
            is_primary: true,
          },
        ];
      }

      // normalize address (expects street, NOT line1)
      const addr = lead.address || {};
      const address = {
        country: addr.country ?? lead.country ?? "",
        street: addr.street ?? lead.street ?? "",
        city: addr.city ?? lead.city ?? "",
        state: addr.state ?? lead.state ?? "",
        postal_code: addr.postal_code ?? lead.postal_code ?? "",
      };

      // normalize business
      const bp = lead.business_profile || lead.business || {};
      const business = {
        industry: bp.industry ?? lead.industry ?? "",
        employees: bp.employees ?? "",
        annual_revenue: bp.annual_revenue ?? "",
        lead_source: bp.lead_source ?? lead.lead_source ?? "inbound",
        assigned_to: bp.assigned_to ?? lead.assigned_to ?? "",
      };

      setFormData((prev) => ({
        ...prev,
        lead_id: lead.lead_id || lead_id || "",
        lead_name: lead.lead_name || "",

        company_name: lead.company_name || "",
        website: lead.website || "",
        description: lead.description || "",

        address,
        business,

        expected_timeline: lead.expected_timeline || "3-6 months",

        // deal values (store in all 3 so you always send consistent payload)
        estimated_deal_value:
          lead.estimated_deal_value ??
          lead.expected_deal_value ??
          lead.deal_value ??
          0,
        expected_deal_value:
          lead.expected_deal_value ??
          lead.estimated_deal_value ??
          lead.deal_value ??
          0,
        deal_value:
          lead.deal_value ??
          lead.expected_deal_value ??
          lead.estimated_deal_value ??
          0,

        contacts,

        problem_identified: !!lead.problem_identified,
        budget_mentioned: lead.budget_mentioned || "unknown",
        authority_known: !!lead.authority_known,
        need_timeline: !!lead.need_timeline,

        notes: lead.notes || "",
        next_action: lead.next_action || "",
      }));
    } catch (err) {
      toast.error("Failed to fetch lead");
    } finally {
      setLoading(false);
    }
  };

  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    if (name === "lead_id") return; // immutable
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleDealChange = (e) => {
    const { name, value } = e.target;
    const n = toNum(value);
    setFormData((p) => ({
      ...p,
      [name]: n,
      // keep all 3 in sync when user changes any one
      estimated_deal_value:
        name === "estimated_deal_value" ? n : p.estimated_deal_value,
      expected_deal_value:
        name === "expected_deal_value" ? n : p.expected_deal_value,
      deal_value: name === "deal_value" ? n : p.deal_value,
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({
      ...p,
      address: { ...p.address, [name]: value },
    }));
  };

  const handleBusinessChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({
      ...p,
      business: { ...p.business, [name]: value },
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // contacts
  const addContact = () => {
    setFormData((p) => ({
      ...p,
      contacts: [...p.contacts, emptyContact(false)],
    }));
  };

  const removeContact = (index) => {
    setFormData((p) => {
      const next = [...p.contacts];
      const wasPrimary = !!next[index]?.is_primary;
      next.splice(index, 1);

      if (next.length === 0) next.push(emptyContact(true));

      if (wasPrimary) {
        next[0] = { ...next[0], is_primary: true };
        for (let i = 1; i < next.length; i++) {
          next[i] = { ...next[i], is_primary: false };
        }
      }

      // ensure exactly one primary
      const primaryCount = next.filter((c) => c.is_primary).length;
      if (primaryCount === 0) next[0].is_primary = true;
      if (primaryCount > 1) {
        let found = false;
        for (let i = 0; i < next.length; i++) {
          if (next[i].is_primary) {
            if (!found) found = true;
            else next[i].is_primary = false;
          }
        }
      }

      return { ...p, contacts: next };
    });
  };

  const setPrimaryContact = (index) => {
    setFormData((p) => ({
      ...p,
      contacts: p.contacts.map((c, i) => ({ ...c, is_primary: i === index })),
    }));
  };

  const handleContactChange = (idx, field, value) => {
    setFormData((p) => {
      const next = [...p.contacts];
      next[idx] = { ...next[idx], [field]: value };
      return { ...p, contacts: next };
    });
  };

  const validate = () => {
    const company = String(formData.company_name || "").trim();
    if (!company) return "Company Name is required";

    const primary =
      formData.contacts.find((c) => c.is_primary) || formData.contacts[0];
    if (!primary) return "At least one contact is required";
    if (!String(primary.full_name || "").trim())
      return "Primary contact full name is required";
    if (!String(primary.email || "").trim())
      return "Primary contact email is required";

    // if your backend requires assigned_to like create page, enforce it:
    // if (!String(formData.business.assigned_to || "").trim())
    //   return "Assigned To (Owner) is required";

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return toast.error(err);

    setSaving(true);
    try {
      const token = localStorage.getItem("access_token");

      // contacts payload (same as create)
      let contactsPayload = (formData.contacts || [])
        .map((c) => ({
          full_name: String(c.full_name || "").trim(),
          email: String(c.email || "").trim(),
          phone: String(c.phone || "").trim(),
          role: String(c.role || "").trim(),
          is_primary: !!c.is_primary,
        }))
        .filter(
          (c) => c.full_name || c.email || c.phone || c.role || c.is_primary,
        );

      // ensure at least one primary
      if (contactsPayload.length === 0) contactsPayload = [emptyContact(true)];
      const primary =
        contactsPayload.find((c) => c.is_primary) || contactsPayload[0] || {};

      // payload aligned with Create + Detail expectations
      const payload = {
        // immutable id
        lead_id: String(formData.lead_id || lead_id || "").trim(),

        lead_name: String(formData.lead_name || "").trim(),
        company_name: String(formData.company_name || "").trim(),
        website: String(formData.website || "").trim(),
        description: String(formData.description || "").trim(),

        // preserve stage/status but don't show
        stage: lockedMeta.stage,
        lead_status: lockedMeta.lead_status,
        status: lockedMeta.status,
        workflow_stage: lockedMeta.workflow_stage,

        // deal values (send all 3 for compatibility)
        expected_timeline: String(formData.expected_timeline || "").trim(),
        estimated_deal_value: toNum(formData.estimated_deal_value),
        expected_deal_value: toNum(formData.expected_deal_value),
        deal_value: toNum(formData.deal_value),

        // contacts
        contacts: contactsPayload,

        // address (IMPORTANT: street key)
        address: {
          country: String(formData.address.country || "").trim(),
          street: String(formData.address.street || "").trim(),
          city: String(formData.address.city || "").trim(),
          state: String(formData.address.state || "").trim(),
          postal_code: String(formData.address.postal_code || "").trim(),
        },

        // business profile (like create)
        business_profile: {
          industry: String(formData.business.industry || "").trim(),
          employees: String(formData.business.employees || "").trim(),
          annual_revenue: String(formData.business.annual_revenue || "").trim(),
          lead_source: String(formData.business.lead_source || "").trim(),
          assigned_to: String(formData.business.assigned_to || "").trim(),
        },

        // compatibility fields used by your detail page cards
        contact_name: String(primary.full_name || "").trim(),
        contact_email: String(primary.email || "").trim(),
        contact_phone: String(primary.phone || "").trim(),
        country: String(formData.address.country || "").trim(),
        industry: String(formData.business.industry || "").trim(),
        lead_source: String(formData.business.lead_source || "").trim(),

        // qualification
        problem_identified: !!formData.problem_identified,
        budget_mentioned: formData.budget_mentioned || "unknown",
        authority_known: !!formData.authority_known,
        need_timeline: !!formData.need_timeline,

        // notes/action
        notes: String(formData.notes || "").trim(),
        next_action: String(formData.next_action || "").trim(),

        // address (nested)
        address: {
          country: String(formData.address.country || "").trim(),
          street: String(formData.address.street || "").trim(),
          city: String(formData.address.city || "").trim(),
          state: String(formData.address.state || "").trim(),
          postal_code: String(formData.address.postal_code || "").trim(),
        },

        // ✅ ALSO send flat fields (backend may only store these)
        country: String(formData.address.country || "").trim(),
        street: String(formData.address.street || "").trim(),
        city: String(formData.address.city || "").trim(),
        state: String(formData.address.state || "").trim(),
        postal_code: String(formData.address.postal_code || "").trim(),
      };

      const res = await fetch(
        `${API_URL}/api/commerce/workflow/revenue/leads/${lead_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();

      if (res.ok && data?.success) {
        toast.success("Lead updated successfully");
        window.dispatchEvent(new Event("revenueLeadChanged"));
        navigate(`/commerce/revenue-workflow/leads/${lead_id}`);
      } else {
        const msg =
          data?.detail?.message ||
          data?.detail ||
          data?.message ||
          `Failed to update lead (${res.status})`;
        toast.error(typeof msg === "string" ? msg : "Failed to update lead");
      }
    } catch (error) {
      toast.error("Error updating lead");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#3A4E63]" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50" data-testid="revenue-lead-edit">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="px-8 py-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() =>
                navigate(`/commerce/revenue-workflow/leads/${lead_id}`)
              }
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Edit Lead
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Update lead information (address + contacts supported)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                navigate(`/commerce/revenue-workflow/leads/${lead_id}`)
              }
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>

            <button
              type="submit"
              form="lead-edit-form"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-[#3A4E63] rounded-lg hover:bg-[#022d6e] transition-colors shadow-sm disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 max-w-6xl">
        <form id="lead-edit-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Company Information */}
          <Section title="Company Information" icon={Building2}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Lead ID">
                <input
                  type="text"
                  name="lead_id"
                  value={formData.lead_id}
                  readOnly
                  className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 font-semibold"
                />
              </Field>

              <Field label="Lead Name (optional)">
                <input
                  type="text"
                  name="lead_name"
                  value={formData.lead_name}
                  onChange={handleBasicChange}
                  className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                  placeholder="e.g., Q2 Renewal - ABC"
                />
              </Field>

              <div className="md:col-span-2">
                <Field label="Company Name *">
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleBasicChange}
                    required
                    className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                    placeholder="Enter company name"
                  />
                </Field>
              </div>

              <Field label="Website (optional)">
                <div className="relative">
                  <Globe className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleBasicChange}
                    className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                    placeholder="https://example.com"
                  />
                </div>
              </Field>

              <Field label="Industry (optional)">
                <input
                  type="text"
                  name="industry"
                  value={formData.business.industry}
                  onChange={handleBusinessChange}
                  className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                  placeholder="Industry"
                />
              </Field>

              <div className="md:col-span-2">
                <Field label="Description (optional)">
                  <div className="relative">
                    <FileText className="h-4 w-4 text-gray-400 absolute left-3 top-3.5" />
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleBasicChange}
                      rows={3}
                      className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                      placeholder="Short description about the company..."
                    />
                  </div>
                </Field>
              </div>
            </div>

            {/* Address */}
            <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-gray-500" />
                <h3 className="text-base font-semibold text-gray-900">
                  Address
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Country">
                  <input
                    name="country"
                    value={formData.address.country}
                    onChange={handleAddressChange}
                    className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                    placeholder="Country"
                  />
                </Field>

                <Field label="State/Province">
                  <input
                    name="state"
                    value={formData.address.state}
                    onChange={handleAddressChange}
                    className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                    placeholder="State"
                  />
                </Field>

                <div className="md:col-span-2">
                  <Field label="Street">
                    <input
                      name="street"
                      value={formData.address.street}
                      onChange={handleAddressChange}
                      className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                      placeholder="Street"
                    />
                  </Field>
                </div>

                <Field label="City">
                  <input
                    name="city"
                    value={formData.address.city}
                    onChange={handleAddressChange}
                    className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                    placeholder="City"
                  />
                </Field>

                <Field label="Zip/Postal Code">
                  <input
                    name="postal_code"
                    value={formData.address.postal_code}
                    onChange={handleAddressChange}
                    className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                    placeholder="Postal Code"
                  />
                </Field>
              </div>
            </div>
          </Section>

          {/* Contacts */}
          <Section title="Contacts" icon={User}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <p className="text-sm text-gray-500">
                Add multiple contacts and mark one as Primary.
              </p>
              <button
                type="button"
                onClick={addContact}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#3A4E63] rounded-lg hover:bg-[#022d6e] transition"
              >
                <Plus className="h-4 w-4" />
                Add Contact
              </button>
            </div>

            <div className="space-y-5">
              {formData.contacts.map((c, idx) => {
                const isPrimary = !!c.is_primary;

                return (
                  <div
                    key={idx}
                    className={`rounded-xl border overflow-hidden ${
                      isPrimary
                        ? "border-blue-200 bg-blue-50/30"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div
                      className={`px-5 py-4 flex items-center justify-between gap-4 ${
                        isPrimary
                          ? "border-b border-blue-200/70"
                          : "border-b border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isPrimary ? (
                          <span className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
                            <Crown className="h-4 w-4" />
                            Primary Contact
                          </span>
                        ) : (
                          <span className="text-sm font-semibold text-gray-700">
                            Contact {idx + 1}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {!isPrimary && (
                          <button
                            type="button"
                            onClick={() => setPrimaryContact(idx)}
                            className="px-3 py-2 text-sm font-semibold bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            Make Primary
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => removeContact(idx)}
                          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Field label={`Full Name${isPrimary ? " *" : ""}`}>
                        <input
                          type="text"
                          value={c.full_name}
                          onChange={(e) =>
                            handleContactChange(
                              idx,
                              "full_name",
                              e.target.value,
                            )
                          }
                          className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                        />
                      </Field>

                      <Field label="Role (optional)">
                        <input
                          type="text"
                          value={c.role}
                          onChange={(e) =>
                            handleContactChange(idx, "role", e.target.value)
                          }
                          className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                        />
                      </Field>

                      <Field label={`Email${isPrimary ? " *" : ""}`}>
                        <input
                          type="email"
                          value={c.email}
                          onChange={(e) =>
                            handleContactChange(idx, "email", e.target.value)
                          }
                          className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                        />
                      </Field>

                      <Field label="Phone (optional)">
                        <input
                          type="tel"
                          value={c.phone}
                          onChange={(e) =>
                            handleContactChange(idx, "phone", e.target.value)
                          }
                          className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                        />
                      </Field>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>

          {/* Business + Deal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Section title="Business Profile" icon={Briefcase}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Employees (optional)">
                  <input
                    name="employees"
                    value={formData.business.employees}
                    onChange={handleBusinessChange}
                    className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                    placeholder="Employees"
                  />
                </Field>

                <Field label="Annual Revenue (optional)">
                  <input
                    name="annual_revenue"
                    value={formData.business.annual_revenue}
                    onChange={handleBusinessChange}
                    className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                    placeholder="Annual revenue"
                  />
                </Field>

                <Field label="Lead Source">
                  <select
                    name="lead_source"
                    value={formData.business.lead_source}
                    onChange={handleBusinessChange}
                    className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                  >
                    <option value="inbound">Inbound</option>
                    <option value="outbound">Outbound</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="referral">Referral</option>
                    <option value="website">Website</option>
                    <option value="trade_show">Trade Show</option>
                    <option value="partner">Partner</option>
                    <option value="other">Other</option>
                  </select>
                </Field>

                <Field label="Assigned To (Owner) (optional)">
                  <input
                    name="assigned_to"
                    value={formData.business.assigned_to}
                    onChange={handleBusinessChange}
                    className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                    placeholder="Assigned to"
                  />
                </Field>
              </div>
            </Section>

            <Section title="Deal Information" icon={BadgeDollarSign}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Estimated Deal Value (₹)">
                  <input
                    type="number"
                    name="estimated_deal_value"
                    value={formData.estimated_deal_value}
                    onChange={handleDealChange}
                    min="0"
                    className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Preview:{" "}
                    <span className="font-semibold text-gray-900">
                      ₹{Math.round(dealValueNum).toLocaleString()}
                    </span>
                  </p>
                </Field>

                <Field label="Expected Timeline">
                  <select
                    name="expected_timeline"
                    value={formData.expected_timeline}
                    onChange={handleChange}
                    className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                  >
                    <option value="0-3 months">0-3 months</option>
                    <option value="3-6 months">3-6 months</option>
                    <option value="6-12 months">6-12 months</option>
                  </select>
                </Field>
              </div>
            </Section>
          </div>

          {/* Qualification */}
          <Section title="Qualification Checklist" icon={CheckSquare}>
            <div className="space-y-4">
              <CheckboxRow
                name="problem_identified"
                checked={formData.problem_identified}
                onChange={handleChange}
                label="Problem identified?"
              />

              <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
                <span className="text-sm font-medium text-gray-700">
                  Budget mentioned?
                </span>
                <div className="flex gap-3 flex-wrap">
                  {["yes", "no", "unknown"].map((val) => (
                    <label
                      key={val}
                      className={`px-3 py-2 rounded-lg border text-sm cursor-pointer transition ${
                        formData.budget_mentioned === val
                          ? "border-[#3A4E63] bg-blue-50 text-[#3A4E63]"
                          : "border-gray-200 hover:bg-gray-50 text-gray-600"
                      }`}
                    >
                      <input
                        type="radio"
                        name="budget_mentioned"
                        value={val}
                        checked={formData.budget_mentioned === val}
                        onChange={handleChange}
                        className="hidden"
                      />
                      <span className="capitalize">{val}</span>
                    </label>
                  ))}
                </div>
              </div>

              <CheckboxRow
                name="authority_known"
                checked={formData.authority_known}
                onChange={handleChange}
                label="Authority/Decision maker known?"
              />

              <CheckboxRow
                name="need_timeline"
                checked={formData.need_timeline}
                onChange={handleChange}
                label="Timeline need established?"
              />
            </div>
          </Section>

          {/* Notes */}
          <Section title="Next Action & Notes">
            <div className="space-y-4">
              <Field label="Next Action">
                <input
                  type="text"
                  name="next_action"
                  value={formData.next_action}
                  onChange={handleChange}
                  className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                  placeholder="e.g., Schedule demo, Follow up call"
                />
              </Field>

              <Field label="Notes">
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                  placeholder="Additional notes about this lead..."
                />
              </Field>
            </div>
          </Section>
        </form>
      </div>
    </div>
  );
};

// ---------- small UI components ----------
function Section({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          {Icon ? <Icon className="h-5 w-5 text-gray-500" /> : null}
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

function CheckboxRow({ name, checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="w-5 h-5 rounded border-gray-300 text-[#3A4E63] focus:ring-[#3A4E63]"
      />
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </label>
  );
}

export default RevenueLeadEdit;
