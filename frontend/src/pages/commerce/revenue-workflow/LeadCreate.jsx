// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Target, Save, ArrowLeft, X, Building2, User, Globe, BadgeDollarSign, CheckSquare } from 'lucide-react';
// import { toast } from 'sonner';

// const API_URL = process.env.REACT_APP_BACKEND_URL;

// const RevenueLeadCreate = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     // Company Info
//     company_name: '',
//     website: '',
//     country: '',
//     industry: '',
//     // Primary Contact
//     contact_name: '',
//     contact_email: '',
//     contact_phone: '',
//     // Lead Metadata
//     lead_source: 'inbound',
//     estimated_deal_value: 0,
//     expected_timeline: '3-6 months',
//     // Qualification Checklist
//     problem_identified: false,
//     budget_mentioned: 'unknown',
//     authority_known: false,
//     need_timeline: false,
//     // Notes
//     notes: ''
//   });

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value)
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const token = localStorage.getItem('access_token');
//       const res = await fetch(`${API_URL}/api/commerce/workflow/revenue/leads`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
//         body: JSON.stringify(formData)
//       });
//       const data = await res.json();
//       if (data.success) {
//         toast.success('Lead created successfully');
//         navigate('/commerce/revenue-workflow/leads');
//       } else {
//         toast.error(data.detail || 'Failed to create lead');
//       }
//     } catch (error) {
//       toast.error('Error creating lead');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50" data-testid="revenue-lead-create">
//       <div className="bg-white border-b border-gray-200">
//         <div className="px-8 py-6">
//           <div className="flex items-center gap-4">
//             <button onClick={() => navigate('/commerce/revenue-workflow/leads')} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
//               <ArrowLeft className="h-5 w-5" />
//             </button>
//             <div>
//               <h1 className="text-2xl font-semibold text-gray-900">New Revenue Lead</h1>
//               <p className="mt-1 text-sm text-gray-500">Capture commercial interest - No pricing, no commitment</p>
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
//                 <h2 className="text-lg font-medium text-gray-900">Company Information</h2>
//               </div>
//             </div>
//             <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="md:col-span-2">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
//                 <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]" placeholder="Enter company name" />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
//                 <input type="url" name="website" value={formData.website} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]" placeholder="https://example.com" />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
//                 <input type="text" name="country" value={formData.country} onChange={handleChange} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]" placeholder="Enter country" />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
//                 <select name="industry" value={formData.industry} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63] bg-white">
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
//                 <h2 className="text-lg font-medium text-gray-900">Primary Contact</h2>
//               </div>
//             </div>
//             <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name *</label>
//                 <input type="text" name="contact_name" value={formData.contact_name} onChange={handleChange} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]" placeholder="Enter name" />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
//                 <input type="email" name="contact_email" value={formData.contact_email} onChange={handleChange} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]" placeholder="email@example.com" />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
//                 <input type="tel" name="contact_phone" value={formData.contact_phone} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]" placeholder="+91-XXXXXXXXXX" />
//               </div>
//             </div>
//           </div>

//           {/* Lead Metadata */}
//           <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//             <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
//               <div className="flex items-center gap-2">
//                 <BadgeDollarSign className="h-5 w-5 text-gray-500" />
//                 <h2 className="text-lg font-medium text-gray-900">Lead Metadata</h2>
//               </div>
//             </div>
//             <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Lead Source *</label>
//                 <select name="lead_source" value={formData.lead_source} onChange={handleChange} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63] bg-white">
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
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Deal Value (₹)</label>
//                 <input type="number" name="estimated_deal_value" value={formData.estimated_deal_value} onChange={handleChange} min="0" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]" />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Expected Timeline</label>
//                 <select name="expected_timeline" value={formData.expected_timeline} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63] bg-white">
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
//                 <h2 className="text-lg font-medium text-gray-900">Qualification Checklist</h2>
//               </div>
//               <p className="text-sm text-gray-500 mt-1">Lightweight qualification - No pricing, no catalog selection</p>
//             </div>
//             <div className="p-6 space-y-4">
//               <label className="flex items-center gap-3 cursor-pointer">
//                 <input type="checkbox" name="problem_identified" checked={formData.problem_identified} onChange={handleChange} className="w-5 h-5 rounded border-gray-300 text-[#3A4E63] focus:ring-[#3A4E63]" />
//                 <span className="text-sm font-medium text-gray-700">Problem identified?</span>
//               </label>
//               <div className="flex items-center gap-4">
//                 <span className="text-sm font-medium text-gray-700">Budget mentioned?</span>
//                 <div className="flex gap-3">
//                   {['yes', 'no', 'unknown'].map(val => (
//                     <label key={val} className="flex items-center gap-2 cursor-pointer">
//                       <input type="radio" name="budget_mentioned" value={val} checked={formData.budget_mentioned === val} onChange={handleChange} className="w-4 h-4 text-[#3A4E63] focus:ring-[#3A4E63]" />
//                       <span className="text-sm text-gray-600 capitalize">{val}</span>
//                     </label>
//                   ))}
//                 </div>
//               </div>
//               <label className="flex items-center gap-3 cursor-pointer">
//                 <input type="checkbox" name="authority_known" checked={formData.authority_known} onChange={handleChange} className="w-5 h-5 rounded border-gray-300 text-[#3A4E63] focus:ring-[#3A4E63]" />
//                 <span className="text-sm font-medium text-gray-700">Authority/Decision maker known?</span>
//               </label>
//               <label className="flex items-center gap-3 cursor-pointer">
//                 <input type="checkbox" name="need_timeline" checked={formData.need_timeline} onChange={handleChange} className="w-5 h-5 rounded border-gray-300 text-[#3A4E63] focus:ring-[#3A4E63]" />
//                 <span className="text-sm font-medium text-gray-700">Timeline need established?</span>
//               </label>
//             </div>
//           </div>

//           {/* Notes */}
//           <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//             <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
//               <h2 className="text-lg font-medium text-gray-900">Notes</h2>
//             </div>
//             <div className="p-6">
//               <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]" placeholder="Additional notes about this lead..." />
//             </div>
//           </div>

//           {/* Actions */}
//           <div className="flex items-center justify-end gap-3">
//             <button type="button" onClick={() => navigate('/commerce/revenue-workflow/leads')} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
//               <X className="h-4 w-4" />
//               Cancel
//             </button>
//             <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-[#3A4E63] rounded-lg hover:bg-[#022d6e] transition-colors shadow-sm disabled:opacity-50">
//               <Save className="h-4 w-4" />
//               {loading ? 'Creating...' : 'Create Lead'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default RevenueLeadCreate;

// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Save,
//   ArrowLeft,
//   X,
//   Building2,
//   User,
//   BadgeDollarSign,
//   CheckSquare,
// } from "lucide-react";
// import { toast } from "sonner";

// const API_URL = process.env.REACT_APP_BACKEND_URL;

// const RevenueLeadCreate = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);

//   const [formData, setFormData] = useState({
//     // Company Info
//     company_name: "",
//     website: "",
//     country: "",
//     industry: "",
//     // Primary Contact
//     contact_name: "",
//     contact_email: "",
//     contact_phone: "",
//     // Lead Metadata
//     lead_source: "inbound",
//     estimated_deal_value: 0,
//     expected_timeline: "3-6 months",
//     // Qualification Checklist
//     problem_identified: false,
//     budget_mentioned: "unknown",
//     authority_known: false,
//     need_timeline: false,
//     // Notes
//     notes: "",
//   });

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
//     setLoading(true);

//     try {
//       const token = localStorage.getItem("access_token");
//       const res = await fetch(
//         `${API_URL}/api/commerce/workflow/revenue/leads`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify(formData),
//         },
//       );

//       const data = await res.json();

//       if (data.success) {
//         toast.success("Lead created successfully");
//         navigate("/commerce/revenue-workflow/leads");
//       } else {
//         toast.error(data.detail || "Failed to create lead");
//       }
//     } catch (error) {
//       toast.error("Error creating lead");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div
//       className="min-h-screen flex flex-col bg-[#f4f6f8]"
//       data-testid="revenue-lead-create"
//     >
//       {/* Header */}
//       <div className="bg-white border-b border-gray-200">
//         <div className="px-10 py-7">
//           <div className="flex items-start gap-4">
//             <button
//               type="button"
//               onClick={() => navigate("/commerce/revenue-workflow/leads")}
//               className="mt-1 p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition"
//               title="Back"
//             >
//               <ArrowLeft className="h-5 w-5" />
//             </button>

//             <div className="text-left">
//               <h1 className="text-3xl font-semibold text-gray-900">
//                 New Revenue Lead
//               </h1>
//               <p className="mt-1 text-sm text-gray-500">
//                 Capture commercial interest - No pricing, no commitment
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Centered Content */}
//       <div className="flex-1 flex justify-center px-10 py-10">
//         <form onSubmit={handleSubmit} className="w-full max-w-5xl space-y-7">
//           {/* Company Info */}
//           <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//             <div className="px-8 py-5 border-b border-gray-200">
//               <div className="flex items-center gap-3">
//                 <Building2 className="h-5 w-5 text-gray-700" />
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   Company Information
//                 </h2>
//               </div>
//             </div>

//             <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-7">
//               <div className="md:col-span-2">
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Company Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="company_name"
//                   value={formData.company_name}
//                   onChange={handleChange}
//                   required
//                   placeholder="Enter company name"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Website
//                 </label>
//                 <input
//                   type="url"
//                   name="website"
//                   value={formData.website}
//                   onChange={handleChange}
//                   placeholder="https://example.com"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Country <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="country"
//                   value={formData.country}
//                   onChange={handleChange}
//                   required
//                   placeholder="Enter country"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Industry
//                 </label>
//                 <select
//                   name="industry"
//                   value={formData.industry}
//                   onChange={handleChange}
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
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
//           <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//             <div className="px-8 py-5 border-b border-gray-200">
//               <div className="flex items-center gap-3">
//                 <User className="h-5 w-5 text-gray-700" />
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   Primary Contact
//                 </h2>
//               </div>
//             </div>

//             <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Contact Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="contact_name"
//                   value={formData.contact_name}
//                   onChange={handleChange}
//                   required
//                   placeholder="Enter name"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Email <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="email"
//                   name="contact_email"
//                   value={formData.contact_email}
//                   onChange={handleChange}
//                   required
//                   placeholder="email@example.com"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Phone
//                 </label>
//                 <input
//                   type="tel"
//                   name="contact_phone"
//                   value={formData.contact_phone}
//                   onChange={handleChange}
//                   placeholder="+91-XXXXXXXXXX"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Lead Metadata */}
//           <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//             <div className="px-8 py-5 border-b border-gray-200">
//               <div className="flex items-center gap-3">
//                 <BadgeDollarSign className="h-5 w-5 text-gray-700" />
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   Lead Metadata
//                 </h2>
//               </div>
//             </div>

//             <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Lead Source <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   name="lead_source"
//                   value={formData.lead_source}
//                   onChange={handleChange}
//                   required
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
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
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Estimated Deal Value (₹)
//                 </label>
//                 <input
//                   type="number"
//                   name="estimated_deal_value"
//                   value={formData.estimated_deal_value}
//                   onChange={handleChange}
//                   min="0"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Expected Timeline
//                 </label>
//                 <select
//                   name="expected_timeline"
//                   value={formData.expected_timeline}
//                   onChange={handleChange}
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 >
//                   <option value="0-3 months">0-3 months</option>
//                   <option value="3-6 months">3-6 months</option>
//                   <option value="6-12 months">6-12 months</option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* Qualification Checklist */}
//           <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//             <div className="px-8 py-5 border-b border-gray-200">
//               <div className="flex items-center gap-3">
//                 <CheckSquare className="h-5 w-5 text-gray-700" />
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   Qualification Checklist
//                 </h2>
//               </div>
//               <p className="mt-1 text-sm text-gray-500">
//                 Lightweight qualification - No pricing, no catalog selection
//               </p>
//             </div>

//             <div className="px-8 py-8 space-y-5">
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

//               <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
//                 <span className="text-sm font-medium text-gray-700">
//                   Budget mentioned?
//                 </span>
//                 <div className="flex gap-4">
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

//           {/* Notes */}
//           <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//             <div className="px-8 py-5 border-b border-gray-200">
//               <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
//             </div>

//             <div className="px-8 py-8">
//               <textarea
//                 name="notes"
//                 value={formData.notes}
//                 onChange={handleChange}
//                 rows={3}
//                 placeholder="Additional notes about this lead..."
//                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400
//                            focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//               />
//             </div>
//           </div>

//           {/* Actions */}
//           <div className="flex items-center justify-end gap-4">
//             <button
//               type="button"
//               onClick={() => navigate("/commerce/revenue-workflow/leads")}
//               className="h-11 px-6 rounded-lg border border-gray-300 bg-white text-gray-800 font-medium hover:bg-gray-50 transition"
//             >
//               <X className="h-4 w-4 inline mr-2" />
//               Cancel
//             </button>

//             <button
//               type="submit"
//               disabled={loading}
//               className="h-11 px-7 rounded-lg bg-[#3A4E63] text-white font-semibold hover:bg-[#022d6e] transition disabled:opacity-50"
//             >
//               <Save className="h-4 w-4 inline mr-2" />
//               {loading ? "Creating..." : "Create Lead"}
//             </button>
//           </div>
//         </form>
//       </div>

//       {/* Footer */}
//       <footer className="border-t border-gray-200 bg-white py-5 text-center text-sm text-gray-600">
//         © {new Date().getFullYear()} Innovate Books. All rights reserved.
//       </footer>
//     </div>
//   );
// };

// export default RevenueLeadCreate;

// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Save,
//   ArrowLeft,
//   X,
//   Building2,
//   User,
//   BadgeDollarSign,
//   CheckSquare,
// } from "lucide-react";
// import { toast } from "sonner";

// const API_URL = process.env.REACT_APP_BACKEND_URL;

// const RevenueLeadCreate = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [checkingCustomers, setCheckingCustomers] = useState(false);

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
//   });

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;

//     setFormData((prev) => ({
//       ...prev,
//       [name]:
//         type === "checkbox"
//           ? checked
//           : type === "number"
//           ? parseFloat(value) || 0
//           : value,
//     }));
//   };

//   // ✅ NEW: check if active customers exist, else redirect to create customer
//   const handleEnsureCustomer = async () => {
//     setCheckingCustomers(true);

//     try {
//       const token = localStorage.getItem("access_token");
//       if (!token) {
//         toast.error("Please login again (token missing).");
//         return;
//       }

//       // NOTE: adjust endpoint if yours is different
//       const res = await fetch(`${API_URL}/api/commerce/parties/customers`, {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const data = await res.json();

//       // Your backend might return { success: true, data: [...] }
//       // or directly [...]
//       const customers = Array.isArray(data)
//         ? data
//         : data?.data || data?.results || [];

//       // ✅ Change this filter if your backend uses another field name
//       const activeCustomers = customers.filter(
//         (c) => c?.status === "active" || c?.is_active === true
//       );

//       if (activeCustomers.length === 0) {
//         toast.info("No active customer found. Please create a customer first.");
//         navigate("/commerce/parties/customers/create");
//         return;
//       }

//       toast.success(`Active customers found: ${activeCustomers.length}`);
//     } catch (err) {
//       toast.error("Failed to check customers");
//     } finally {
//       setCheckingCustomers(false);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const token = localStorage.getItem("access_token");
//       const res = await fetch(`${API_URL}/api/commerce/workflow/revenue/leads`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(formData),
//       });

//       const data = await res.json();

//       if (data.success) {
//         toast.success("Lead created successfully");
//         navigate("/commerce/revenue-workflow/leads");
//       } else {
//         toast.error(data.detail || "Failed to create lead");
//       }
//     } catch (error) {
//       toast.error("Error creating lead");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div
//       className="min-h-screen flex flex-col bg-[#f4f6f8]"
//       data-testid="revenue-lead-create"
//     >
//       {/* Header */}
//       <div className="bg-white border-b border-gray-200">
//         <div className="px-10 py-7">
//           <div className="flex items-start gap-4">
//             <button
//               type="button"
//               onClick={() => navigate("/commerce/revenue-workflow/leads")}
//               className="mt-1 p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition"
//               title="Back"
//             >
//               <ArrowLeft className="h-5 w-5" />
//             </button>

//             <div className="text-left flex-1">
//               <h1 className="text-3xl font-semibold text-gray-900">
//                 New Revenue Lead
//               </h1>
//               <p className="mt-1 text-sm text-gray-500">
//                 Capture commercial interest - No pricing, no commitment
//               </p>
//             </div>

//             {/* ✅ NEW BUTTON IN HEADER */}
//             <button
//               type="button"
//               onClick={handleEnsureCustomer}
//               disabled={checkingCustomers}
//               className="h-11 px-5 rounded-lg border border-gray-300 bg-white text-gray-800 font-medium hover:bg-gray-50 transition disabled:opacity-50"
//             >
//               {checkingCustomers ? "Checking Customers..." : "Check Active Customers"}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Centered Content */}
//       <div className="flex-1 flex justify-center px-10 py-10">
//         <form onSubmit={handleSubmit} className="w-full max-w-5xl space-y-7">
//           {/* Company Info */}
//           <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//             <div className="px-8 py-5 border-b border-gray-200">
//               <div className="flex items-center gap-3">
//                 <Building2 className="h-5 w-5 text-gray-700" />
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   Company Information
//                 </h2>
//               </div>
//             </div>

//             <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-7">
//               <div className="md:col-span-2">
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Company Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="company_name"
//                   value={formData.company_name}
//                   onChange={handleChange}
//                   required
//                   placeholder="Enter company name"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Website
//                 </label>
//                 <input
//                   type="url"
//                   name="website"
//                   value={formData.website}
//                   onChange={handleChange}
//                   placeholder="https://example.com"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Country <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="country"
//                   value={formData.country}
//                   onChange={handleChange}
//                   required
//                   placeholder="Enter country"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Industry
//                 </label>
//                 <select
//                   name="industry"
//                   value={formData.industry}
//                   onChange={handleChange}
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
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
//           <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//             <div className="px-8 py-5 border-b border-gray-200">
//               <div className="flex items-center gap-3">
//                 <User className="h-5 w-5 text-gray-700" />
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   Primary Contact
//                 </h2>
//               </div>
//             </div>

//             <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Contact Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="contact_name"
//                   value={formData.contact_name}
//                   onChange={handleChange}
//                   required
//                   placeholder="Enter name"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Email <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="email"
//                   name="contact_email"
//                   value={formData.contact_email}
//                   onChange={handleChange}
//                   required
//                   placeholder="email@example.com"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Phone
//                 </label>
//                 <input
//                   type="tel"
//                   name="contact_phone"
//                   value={formData.contact_phone}
//                   onChange={handleChange}
//                   placeholder="+91-XXXXXXXXXX"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Lead Metadata */}
//           <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//             <div className="px-8 py-5 border-b border-gray-200">
//               <div className="flex items-center gap-3">
//                 <BadgeDollarSign className="h-5 w-5 text-gray-700" />
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   Lead Metadata
//                 </h2>
//               </div>
//             </div>

//             <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Lead Source <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   name="lead_source"
//                   value={formData.lead_source}
//                   onChange={handleChange}
//                   required
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
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
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Estimated Deal Value (₹)
//                 </label>
//                 <input
//                   type="number"
//                   name="estimated_deal_value"
//                   value={formData.estimated_deal_value}
//                   onChange={handleChange}
//                   min="0"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Expected Timeline
//                 </label>
//                 <select
//                   name="expected_timeline"
//                   value={formData.expected_timeline}
//                   onChange={handleChange}
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 >
//                   <option value="0-3 months">0-3 months</option>
//                   <option value="3-6 months">3-6 months</option>
//                   <option value="6-12 months">6-12 months</option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* Qualification Checklist */}
//           <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//             <div className="px-8 py-5 border-b border-gray-200">
//               <div className="flex items-center gap-3">
//                 <CheckSquare className="h-5 w-5 text-gray-700" />
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   Qualification Checklist
//                 </h2>
//               </div>
//               <p className="mt-1 text-sm text-gray-500">
//                 Lightweight qualification - No pricing, no catalog selection
//               </p>
//             </div>

//             <div className="px-8 py-8 space-y-5">
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

//               <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
//                 <span className="text-sm font-medium text-gray-700">
//                   Budget mentioned?
//                 </span>
//                 <div className="flex gap-4">
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

//           {/* Notes */}
//           <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//             <div className="px-8 py-5 border-b border-gray-200">
//               <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
//             </div>

//             <div className="px-8 py-8">
//               <textarea
//                 name="notes"
//                 value={formData.notes}
//                 onChange={handleChange}
//                 rows={3}
//                 placeholder="Additional notes about this lead..."
//                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400
//                            focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//               />
//             </div>
//           </div>

//           {/* Actions */}
//           <div className="flex items-center justify-end gap-4">
//             <button
//               type="button"
//               onClick={() => navigate("/commerce/revenue-workflow/leads")}
//               className="h-11 px-6 rounded-lg border border-gray-300 bg-white text-gray-800 font-medium hover:bg-gray-50 transition"
//             >
//               <X className="h-4 w-4 inline mr-2" />
//               Cancel
//             </button>

//             <button
//               type="submit"
//               disabled={loading}
//               className="h-11 px-7 rounded-lg bg-[#3A4E63] text-white font-semibold hover:bg-[#022d6e] transition disabled:opacity-50"
//             >
//               <Save className="h-4 w-4 inline mr-2" />
//               {loading ? "Creating..." : "Create Lead"}
//             </button>
//           </div>
//         </form>
//       </div>

//       {/* Footer */}
//       <footer className="border-t border-gray-200 bg-white py-5 text-center text-sm text-gray-600">
//         © {new Date().getFullYear()} Innovate Books. All rights reserved.
//       </footer>
//     </div>
//   );
// };

// export default RevenueLeadCreate;

// import React, { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Save,
//   ArrowLeft,
//   X,
//   Building2,
//   User,
//   BadgeDollarSign,
//   CheckSquare,
// } from "lucide-react";
// import { toast } from "sonner";

// const API_URL = process.env.REACT_APP_BACKEND_URL;

// // ✅ Update this if your customers endpoint is different
// const CUSTOMERS_ENDPOINT = "/api/commerce/parties/customers";

// const RevenueLeadCreate = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);

//   // ✅ Customer check states
//   const [checkingCustomers, setCheckingCustomers] = useState(true);
//   const [customers, setCustomers] = useState([]);
//   const [customerCheckError, setCustomerCheckError] = useState("");

//   const [formData, setFormData] = useState({
//     // Company Info
//     company_name: "",
//     website: "",
//     country: "",
//     industry: "",
//     // Primary Contact
//     contact_name: "",
//     contact_email: "",
//     contact_phone: "",
//     // Lead Metadata
//     lead_source: "inbound",
//     estimated_deal_value: 0,
//     expected_timeline: "3-6 months",
//     // Qualification Checklist
//     problem_identified: false,
//     budget_mentioned: "unknown",
//     authority_known: false,
//     need_timeline: false,
//     // Notes
//     notes: "",
//   });

//   // ✅ Determine if at least 1 Active customer exists (safe for "Active"/"active")
//   const hasActiveCustomer = useMemo(() => {
//     return customers.some(
//       (c) => String(c?.status || "").toLowerCase() === "active",
//     );
//   }, [customers]);

//   // ✅ Fetch customers and check active customer exists
//   useEffect(() => {
//     const checkCustomers = async () => {
//       setCheckingCustomers(true);
//       setCustomerCheckError("");

//       try {
//         const token = localStorage.getItem("access_token");

//         // If API_URL is missing, better error
//         if (!API_URL) {
//           throw new Error(
//             "REACT_APP_BACKEND_URL is not set. Please set it in your .env and restart the React server.",
//           );
//         }

//         const res = await fetch(`${API_URL}${CUSTOMERS_ENDPOINT}`, {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         const data = await res.json();

//         // ✅ Handle API response shapes:
//         // (1) { success: true, data: [...] }
//         // (2) { data: [...] }
//         // (3) [...] directly
//         const list = Array.isArray(data)
//           ? data
//           : Array.isArray(data?.data)
//             ? data.data
//             : Array.isArray(data?.results)
//               ? data.results
//               : [];

//         setCustomers(list);

//         // If fetched but no customers
//         if (!list.length) {
//           setCustomerCheckError("No customers found in the system.");
//         }
//       } catch (err) {
//         setCustomerCheckError(err?.message || "Failed to fetch customers.");
//       } finally {
//         setCheckingCustomers(false);
//       }
//     };

//     checkCustomers();
//   }, []);

//   const goToCreateCustomer = () => {
//     navigate("/commerce/parties/customers/create");
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

//     // ✅ Block submit until customer check finishes
//     if (checkingCustomers) {
//       toast.error("Please wait... checking customers.");
//       return;
//     }

//     // ✅ Block submit if no active customer exists
//     if (!hasActiveCustomer) {
//       toast.error("No Active customer found. Please create a customer first.");
//       return;
//     }

//     setLoading(true);

//     try {
//       const token = localStorage.getItem("access_token");

//       const res = await fetch(
//         `${API_URL}/api/commerce/workflow/revenue/leads`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify(formData),
//         },
//       );

//       const data = await res.json();

//       if (data.success) {
//         toast.success("Lead created successfully");
//         navigate("/commerce/revenue-workflow/leads");
//       } else {
//         toast.error(data.detail || "Failed to create lead");
//       }
//     } catch (error) {
//       toast.error("Error creating lead");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div
//       className="min-h-screen flex flex-col bg-[#f4f6f8]"
//       data-testid="revenue-lead-create"
//     >
//       {/* Header */}
//       <div className="bg-white border-b border-gray-200">
//         <div className="px-10 py-7">
//           <div className="flex items-start gap-4">
//             <button
//               type="button"
//               onClick={() => navigate("/commerce/revenue-workflow/leads")}
//               className="mt-1 p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition"
//               title="Back"
//             >
//               <ArrowLeft className="h-5 w-5" />
//             </button>

//             <div className="text-left">
//               <h1 className="text-3xl font-semibold text-gray-900">
//                 New Revenue Lead
//               </h1>
//               <p className="mt-1 text-sm text-gray-500">
//                 Capture commercial interest - No pricing, no commitment
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Centered Content */}
//       <div className="flex-1 flex justify-center px-10 py-10">
//         <form onSubmit={handleSubmit} className="w-full max-w-5xl space-y-7">
//           {/* ✅ Customer Requirement Banner */}
//           <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-8 py-6">
//             {checkingCustomers ? (
//               <p className="text-sm text-gray-600">
//                 Checking if an Active customer exists...
//               </p>
//             ) : hasActiveCustomer ? (
//               <div className="flex items-center justify-between gap-4">
//                 <p className="text-sm text-green-700 font-medium">
//                   ✅ Active customer found — you can create a lead.
//                 </p>
//               </div>
//             ) : (
//               <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//                 <div>
//                   <p className="text-sm text-red-700 font-semibold">
//                     ❌ No Active customer found.
//                   </p>
//                   <p className="text-sm text-gray-600 mt-1">
//                     You must create an Active customer before creating a revenue
//                     lead.
//                   </p>
//                   {customerCheckError ? (
//                     <p className="text-xs text-gray-500 mt-1">
//                       Note: {customerCheckError}
//                     </p>
//                   ) : null}
//                 </div>

//                 <button
//                   type="button"
//                   onClick={goToCreateCustomer}
//                   className="h-11 px-6 rounded-lg bg-[#3A4E63] text-white font-semibold hover:bg-[#022d6e] transition"
//                 >
//                   Create Customer
//                 </button>
//               </div>
//             )}
//           </div>

//           {/* Company Info */}
//           <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//             <div className="px-8 py-5 border-b border-gray-200">
//               <div className="flex items-center gap-3">
//                 <Building2 className="h-5 w-5 text-gray-700" />
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   Company Information
//                 </h2>
//               </div>
//             </div>

//             <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-7">
//               <div className="md:col-span-2">
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Company Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="company_name"
//                   value={formData.company_name}
//                   onChange={handleChange}
//                   required
//                   placeholder="Enter company name"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Website
//                 </label>
//                 <input
//                   type="url"
//                   name="website"
//                   value={formData.website}
//                   onChange={handleChange}
//                   placeholder="https://example.com"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Country <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="country"
//                   value={formData.country}
//                   onChange={handleChange}
//                   required
//                   placeholder="Enter country"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Industry
//                 </label>
//                 <select
//                   name="industry"
//                   value={formData.industry}
//                   onChange={handleChange}
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
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
//           <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//             <div className="px-8 py-5 border-b border-gray-200">
//               <div className="flex items-center gap-3">
//                 <User className="h-5 w-5 text-gray-700" />
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   Primary Contact
//                 </h2>
//               </div>
//             </div>

//             <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Contact Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="contact_name"
//                   value={formData.contact_name}
//                   onChange={handleChange}
//                   required
//                   placeholder="Enter name"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Email <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="email"
//                   name="contact_email"
//                   value={formData.contact_email}
//                   onChange={handleChange}
//                   required
//                   placeholder="email@example.com"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Phone
//                 </label>
//                 <input
//                   type="tel"
//                   name="contact_phone"
//                   value={formData.contact_phone}
//                   onChange={handleChange}
//                   placeholder="+91-XXXXXXXXXX"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Lead Metadata */}
//           <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//             <div className="px-8 py-5 border-b border-gray-200">
//               <div className="flex items-center gap-3">
//                 <BadgeDollarSign className="h-5 w-5 text-gray-700" />
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   Lead Metadata
//                 </h2>
//               </div>
//             </div>

//             <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Lead Source <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   name="lead_source"
//                   value={formData.lead_source}
//                   onChange={handleChange}
//                   required
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
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
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Estimated Deal Value (₹)
//                 </label>
//                 <input
//                   type="number"
//                   name="estimated_deal_value"
//                   value={formData.estimated_deal_value}
//                   onChange={handleChange}
//                   min="0"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Expected Timeline
//                 </label>
//                 <select
//                   name="expected_timeline"
//                   value={formData.expected_timeline}
//                   onChange={handleChange}
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 >
//                   <option value="0-3 months">0-3 months</option>
//                   <option value="3-6 months">3-6 months</option>
//                   <option value="6-12 months">6-12 months</option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* Qualification Checklist */}
//           <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//             <div className="px-8 py-5 border-b border-gray-200">
//               <div className="flex items-center gap-3">
//                 <CheckSquare className="h-5 w-5 text-gray-700" />
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   Qualification Checklist
//                 </h2>
//               </div>
//               <p className="mt-1 text-sm text-gray-500">
//                 Lightweight qualification - No pricing, no catalog selection
//               </p>
//             </div>

//             <div className="px-8 py-8 space-y-5">
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

//               <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
//                 <span className="text-sm font-medium text-gray-700">
//                   Budget mentioned?
//                 </span>
//                 <div className="flex gap-4">
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

//           {/* Notes */}
//           <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//             <div className="px-8 py-5 border-b border-gray-200">
//               <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
//             </div>

//             <div className="px-8 py-8">
//               <textarea
//                 name="notes"
//                 value={formData.notes}
//                 onChange={handleChange}
//                 rows={3}
//                 placeholder="Additional notes about this lead..."
//                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400
//                            focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//               />
//             </div>
//           </div>

//           {/* Actions */}
//           <div className="flex items-center justify-end gap-4">
//             <button
//               type="button"
//               onClick={() => navigate("/commerce/revenue-workflow/leads")}
//               className="h-11 px-6 rounded-lg border border-gray-300 bg-white text-gray-800 font-medium hover:bg-gray-50 transition"
//             >
//               <X className="h-4 w-4 inline mr-2" />
//               Cancel
//             </button>

//             <button
//               type="submit"
//               disabled={loading || checkingCustomers || !hasActiveCustomer}
//               className="h-11 px-7 rounded-lg bg-[#3A4E63] text-white font-semibold hover:bg-[#022d6e] transition disabled:opacity-50"
//             >
//               <Save className="h-4 w-4 inline mr-2" />
//               {loading ? "Creating..." : "Create Lead"}
//             </button>
//           </div>
//         </form>
//       </div>

//       {/* Footer */}
//       <footer className="border-t border-gray-200 bg-white py-5 text-center text-sm text-gray-600">
//         © {new Date().getFullYear()} Innovate Books. All rights reserved.
//       </footer>
//     </div>
//   );
// };

// export default RevenueLeadCreate;

// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Save,
//   ArrowLeft,
//   X,
//   Building2,
//   User,
//   BadgeDollarSign,
//   CheckSquare,
//   AlertTriangle,
//   Plus,
// } from "lucide-react";
// import { toast } from "sonner";

// const API_URL = process.env.REACT_APP_BACKEND_URL;

// const RevenueLeadCreate = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);

//   // 🔑 customer existence state
//   const [checkingCustomers, setCheckingCustomers] = useState(true);
//   const [hasActiveCustomer, setHasActiveCustomer] = useState(false);

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
//   });

//   // 🔍 CHECK ACTIVE CUSTOMERS ON LOAD
//   useEffect(() => {
//     const checkCustomers = async () => {
//       try {
//         const token = localStorage.getItem("access_token");

//         const res = await fetch(`${API_URL}/api/commerce/parties/customers`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         const data = await res.json();

//         const activeCustomers = Array.isArray(data)
//           ? data.filter((c) => c.status === "Active")
//           : [];

//         setHasActiveCustomer(activeCustomers.length > 0);
//       } catch (err) {
//         toast.error("Unable to verify customers");
//         setHasActiveCustomer(false);
//       } finally {
//         setCheckingCustomers(false);
//       }
//     };

//     checkCustomers();
//   }, []);

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

//     if (!hasActiveCustomer) {
//       toast.error("Create an active customer before creating a lead");
//       return;
//     }

//     setLoading(true);

//     try {
//       const token = localStorage.getItem("access_token");

//       const res = await fetch(
//         `${API_URL}/api/commerce/workflow/revenue/leads`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify(formData),
//         },
//       );

//       const data = await res.json();

//       if (data.success) {
//         toast.success("Lead created successfully");
//         navigate("/commerce/revenue-workflow/leads");
//       } else {
//         toast.error(data.detail || "Failed to create lead");
//       }
//     } catch {
//       toast.error("Error creating lead");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ⏳ loading state while checking customers
//   if (checkingCustomers) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-[#f4f6f8]">
//         <p className="text-gray-600">Checking customer status…</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex flex-col bg-[#f4f6f8]">
//       {/* Header */}
//       <div className="bg-white border-b border-gray-200">
//         <div className="px-10 py-7 flex items-start gap-4">
//           <button
//             onClick={() => navigate("/commerce/revenue-workflow/leads")}
//             className="mt-1 p-2 rounded-lg hover:bg-gray-100"
//           >
//             <ArrowLeft className="h-5 w-5" />
//           </button>

//           <div>
//             <h1 className="text-3xl font-semibold">New Revenue Lead</h1>
//             <p className="text-sm text-gray-500">Capture commercial interest</p>
//           </div>
//         </div>
//       </div>

//       {/* ⚠️ NO CUSTOMER WARNING */}
//       {!hasActiveCustomer && (
//         <div className="mx-auto mt-8 max-w-5xl w-full px-10">
//           <div className="flex items-start gap-4 p-5 rounded-xl border border-yellow-300 bg-yellow-50">
//             <AlertTriangle className="h-6 w-6 text-yellow-600 mt-1" />
//             <div className="flex-1">
//               <h3 className="font-semibold text-yellow-900">
//                 No Active Customer Found
//               </h3>
//               <p className="text-sm text-yellow-800 mt-1">
//                 You must create at least one active customer before creating a
//                 revenue lead.
//               </p>

//               <button
//                 onClick={() => navigate("/commerce/parties/customers/create")}
//                 className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3A4E63] text-white font-medium"
//               >
//                 <Plus className="h-4 w-4" />
//                 Create Customer
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* FORM */}
//       <div className="flex-1 flex justify-center px-10 py-10">
//         <form
//           onSubmit={handleSubmit}
//           className={`w-full max-w-5xl space-y-7 ${
//             !hasActiveCustomer ? "opacity-50 pointer-events-none" : ""
//           }`}
//         >
//           {/* Company Info */}
//           <div className="bg-white rounded-2xl border p-8">
//             <div className="flex items-center gap-3 mb-6">
//               <Building2 className="h-5 w-5" />
//               <h2 className="text-lg font-semibold">Company Information</h2>
//             </div>

//             <input
//               name="company_name"
//               placeholder="Company Name *"
//               required
//               onChange={handleChange}
//               className="w-full h-11 px-4 border rounded-lg"
//             />
//           </div>

//           {/* Actions */}
//           <div className="flex justify-end gap-4">
//             <button
//               type="button"
//               onClick={() => navigate("/commerce/revenue-workflow/leads")}
//               className="h-11 px-6 border rounded-lg"
//             >
//               <X className="h-4 w-4 inline mr-2" />
//               Cancel
//             </button>

//             <button
//               type="submit"
//               disabled={loading}
//               className="h-11 px-7 rounded-lg bg-[#3A4E63] text-white"
//             >
//               <Save className="h-4 w-4 inline mr-2" />
//               {loading ? "Creating..." : "Create Lead"}
//             </button>
//           </div>
//         </form>
//       </div>

//       {/* Footer */}
//       <footer className="border-t bg-white py-5 text-center text-sm text-gray-600">
//         © {new Date().getFullYear()} Innovate Books. All rights reserved.
//       </footer>
//     </div>
//   );
// };

// export default RevenueLeadCreate;

// import React, { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Save,
//   ArrowLeft,
//   X,
//   Building2,
//   User,
//   BadgeDollarSign,
//   CheckSquare,
//   AlertTriangle,
//   Plus,
// } from "lucide-react";
// import { toast } from "sonner";

// const API_URL = process.env.REACT_APP_BACKEND_URL;

// const RevenueLeadCreate = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);

//   // ✅ customer existence state
//   const [checkingCustomers, setCheckingCustomers] = useState(true);
//   const [customers, setCustomers] = useState([]); // store customers list
//   const [selectedCustomerId, setSelectedCustomerId] = useState(""); // optional

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
//   });

//   // ✅ computed: has at least one ACTIVE customer
//   const hasActiveCustomer = useMemo(() => {
//     return customers.some(
//       (c) => String(c?.status || "").toLowerCase() === "active",
//     );
//   }, [customers]);

//   const activeCustomers = useMemo(() => {
//     return customers.filter(
//       (c) => String(c?.status || "").toLowerCase() === "active",
//     );
//   }, [customers]);

//   // 🔍 CHECK CUSTOMERS ON LOAD
//   useEffect(() => {
//     const checkCustomers = async () => {
//       setCheckingCustomers(true);
//       try {
//         const token = localStorage.getItem("access_token");
//         if (!token) {
//           toast.error("No token found. Please login again.");
//           setCustomers([]);
//           return;
//         }

//         const res = await fetch(`${API_URL}/api/commerce/parties/customers`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         // If backend returns non-2xx, show readable error
//         if (!res.ok) {
//           const errText = await res.text();
//           toast.error(`Failed to load customers (${res.status})`);
//           console.error("Customers API error:", res.status, errText);
//           setCustomers([]);
//           return;
//         }

//         const data = await res.json();

//         // ✅ Your backend shape: { success, customers, count }
//         const list = Array.isArray(data?.customers) ? data.customers : [];

//         setCustomers(list);

//         // Auto-select first active customer (optional)
//         const firstActive = list.find(
//           (c) => String(c?.status || "").toLowerCase() === "active",
//         );
//         if (firstActive?.customer_id) {
//           setSelectedCustomerId(firstActive.customer_id);
//         }
//       } catch (err) {
//         console.error(err);
//         toast.error("Unable to verify customers");
//         setCustomers([]);
//       } finally {
//         setCheckingCustomers(false);
//       }
//     };

//     checkCustomers();
//   }, []);

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

//     // ✅ Gate lead creation only when NO active customers exist
//     if (!hasActiveCustomer) {
//       toast.error("Create an active customer before creating a lead");
//       return;
//     }

//     // Optional: force selection (recommended)
//     if (!selectedCustomerId) {
//       toast.error("Please select a customer");
//       return;
//     }

//     setLoading(true);

//     try {
//       const token = localStorage.getItem("access_token");
//       if (!token) {
//         toast.error("No token found. Please login again.");
//         return;
//       }

//       // ✅ If your backend supports linking lead to customer, keep this:
//       const payload = {
//         ...formData,
//         customer_id: selectedCustomerId, // remove if your LeadCreate doesn't have this field
//       };

//       const res = await fetch(
//         `${API_URL}/api/commerce/workflow/revenue/leads`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify(payload),
//         },
//       );

//       const data = await res.json();

//       // If backend uses success flag:
//       if (data?.success) {
//         toast.success("Lead created successfully");
//         navigate("/commerce/revenue-workflow/leads");
//       } else {
//         // handle FastAPI error shapes too
//         const msg =
//           data?.detail?.message ||
//           data?.detail ||
//           data?.message ||
//           "Failed to create lead";
//         toast.error(typeof msg === "string" ? msg : "Failed to create lead");
//         console.error("Create lead error:", data);
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error("Error creating lead");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ⏳ loading state while checking customers
//   if (checkingCustomers) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-[#f4f6f8]">
//         <p className="text-gray-600">Checking customer status…</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex flex-col bg-[#f4f6f8]">
//       {/* Header */}
//       <div className="bg-white border-b border-gray-200">
//         <div className="px-10 py-7">
//           <div className="flex items-start gap-4">
//             <button
//               type="button"
//               onClick={() => navigate("/commerce/revenue-workflow/leads")}
//               className="mt-1 p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition"
//               title="Back"
//             >
//               <ArrowLeft className="h-5 w-5" />
//             </button>

//             <div className="text-left">
//               <h1 className="text-3xl font-semibold text-gray-900">
//                 New Revenue Lead
//               </h1>
//               <p className="mt-1 text-sm text-gray-500">
//                 Capture commercial interest
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ⚠️ NO CUSTOMER WARNING */}
//       {!hasActiveCustomer && (
//         <div className="mx-auto mt-8 max-w-5xl w-full px-10">
//           <div className="flex items-start gap-4 p-5 rounded-xl border border-yellow-300 bg-yellow-50">
//             <AlertTriangle className="h-6 w-6 text-yellow-600 mt-1" />
//             <div className="flex-1">
//               <h3 className="font-semibold text-yellow-900">
//                 No Active Customer Found
//               </h3>
//               <p className="text-sm text-yellow-800 mt-1">
//                 You must create at least one active customer before creating a
//                 revenue lead.
//               </p>

//               <button
//                 onClick={() => navigate("/commerce/parties/customers/create")}
//                 className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3A4E63] text-white font-medium"
//               >
//                 <Plus className="h-4 w-4" />
//                 Create Customer
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* FORM */}
//       <div className="flex-1 flex justify-center px-10 py-10">
//         <form
//           onSubmit={handleSubmit}
//           className={`w-full max-w-5xl space-y-7 ${
//             !hasActiveCustomer ? "opacity-50 pointer-events-none" : ""
//           }`}
//         >
//           {/* ✅ Customer selection (search in DB result) */}
//           <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//             <div className="px-8 py-5 border-b border-gray-200">
//               <div className="flex items-center gap-3">
//                 <User className="h-5 w-5 text-gray-700" />
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   Select Customer
//                 </h2>
//               </div>
//               <p className="mt-1 text-sm text-gray-500">
//                 We pulled these from the database. If none exist, create one.
//               </p>
//             </div>

//             <div className="px-8 py-8">
//               <label className="block text-sm font-medium text-gray-900 mb-2">
//                 Customer <span className="text-red-500">*</span>
//               </label>

//               <select
//                 value={selectedCustomerId}
//                 onChange={(e) => setSelectedCustomerId(e.target.value)}
//                 className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
//                            focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 required
//               >
//                 <option value="">Select an active customer</option>
//                 {activeCustomers.map((c) => (
//                   <option key={c.customer_id} value={c.customer_id}>
//                     {c.display_name || c.legal_name} ({c.customer_id})
//                   </option>
//                 ))}
//               </select>

//               <div className="mt-4 flex gap-3">
//                 <button
//                   type="button"
//                   onClick={() => navigate("/commerce/parties/customers")}
//                   className="h-11 px-5 rounded-lg border border-gray-300 bg-white text-gray-800 font-medium hover:bg-gray-50 transition"
//                 >
//                   View Customers
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() => navigate("/commerce/parties/customers/create")}
//                   className="h-11 px-5 rounded-lg bg-[#3A4E63] text-white font-medium hover:bg-[#022d6e] transition"
//                 >
//                   <Plus className="h-4 w-4 inline mr-2" />
//                   Create New Customer
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Company Info */}
//           <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//             <div className="px-8 py-5 border-b border-gray-200">
//               <div className="flex items-center gap-3">
//                 <Building2 className="h-5 w-5 text-gray-700" />
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   Company Information
//                 </h2>
//               </div>
//             </div>

//             <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-7">
//               <div className="md:col-span-2">
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Company Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="company_name"
//                   value={formData.company_name}
//                   onChange={handleChange}
//                   required
//                   placeholder="Enter company name"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Website
//                 </label>
//                 <input
//                   type="url"
//                   name="website"
//                   value={formData.website}
//                   onChange={handleChange}
//                   placeholder="https://example.com"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Country <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="country"
//                   value={formData.country}
//                   onChange={handleChange}
//                   required
//                   placeholder="Enter country"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Industry
//                 </label>
//                 <select
//                   name="industry"
//                   value={formData.industry}
//                   onChange={handleChange}
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
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
//           <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//             <div className="px-8 py-5 border-b border-gray-200">
//               <div className="flex items-center gap-3">
//                 <User className="h-5 w-5 text-gray-700" />
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   Primary Contact
//                 </h2>
//               </div>
//             </div>

//             <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Contact Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="contact_name"
//                   value={formData.contact_name}
//                   onChange={handleChange}
//                   required
//                   placeholder="Enter name"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Email <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="email"
//                   name="contact_email"
//                   value={formData.contact_email}
//                   onChange={handleChange}
//                   required
//                   placeholder="email@example.com"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Phone
//                 </label>
//                 <input
//                   type="tel"
//                   name="contact_phone"
//                   value={formData.contact_phone}
//                   onChange={handleChange}
//                   placeholder="+91-XXXXXXXXXX"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Lead Metadata */}
//           <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//             <div className="px-8 py-5 border-b border-gray-200">
//               <div className="flex items-center gap-3">
//                 <BadgeDollarSign className="h-5 w-5 text-gray-700" />
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   Lead Metadata
//                 </h2>
//               </div>
//             </div>

//             <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Lead Source <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   name="lead_source"
//                   value={formData.lead_source}
//                   onChange={handleChange}
//                   required
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
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
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Estimated Deal Value (₹)
//                 </label>
//                 <input
//                   type="number"
//                   name="estimated_deal_value"
//                   value={formData.estimated_deal_value}
//                   onChange={handleChange}
//                   min="0"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Expected Timeline
//                 </label>
//                 <select
//                   name="expected_timeline"
//                   value={formData.expected_timeline}
//                   onChange={handleChange}
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 >
//                   <option value="0-3 months">0-3 months</option>
//                   <option value="3-6 months">3-6 months</option>
//                   <option value="6-12 months">6-12 months</option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* Qualification Checklist */}
//           <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//             <div className="px-8 py-5 border-b border-gray-200">
//               <div className="flex items-center gap-3">
//                 <CheckSquare className="h-5 w-5 text-gray-700" />
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   Qualification Checklist
//                 </h2>
//               </div>
//               <p className="mt-1 text-sm text-gray-500">
//                 Lightweight qualification - No pricing, no catalog selection
//               </p>
//             </div>

//             <div className="px-8 py-8 space-y-5">
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

//               <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
//                 <span className="text-sm font-medium text-gray-700">
//                   Budget mentioned?
//                 </span>
//                 <div className="flex gap-4">
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

//           {/* Notes */}
//           <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//             <div className="px-8 py-5 border-b border-gray-200">
//               <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
//             </div>

//             <div className="px-8 py-8">
//               <textarea
//                 name="notes"
//                 value={formData.notes}
//                 onChange={handleChange}
//                 rows={3}
//                 placeholder="Additional notes about this lead..."
//                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400
//                            focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//               />
//             </div>
//           </div>

//           {/* Actions */}
//           <div className="flex items-center justify-end gap-4">
//             <button
//               type="button"
//               onClick={() => navigate("/commerce/revenue-workflow/leads")}
//               className="h-11 px-6 rounded-lg border border-gray-300 bg-white text-gray-800 font-medium hover:bg-gray-50 transition"
//             >
//               <X className="h-4 w-4 inline mr-2" />
//               Cancel
//             </button>

//             <button
//               type="submit"
//               disabled={loading}
//               className="h-11 px-7 rounded-lg bg-[#3A4E63] text-white font-semibold hover:bg-[#022d6e] transition disabled:opacity-50"
//             >
//               <Save className="h-4 w-4 inline mr-2" />
//               {loading ? "Creating..." : "Create Lead"}
//             </button>
//           </div>
//         </form>
//       </div>

//       {/* Footer */}
//       <footer className="border-t border-gray-200 bg-white py-5 text-center text-sm text-gray-600">
//         © {new Date().getFullYear()} Innovate Books. All rights reserved.
//       </footer>
//     </div>
//   );
// };

// export default RevenueLeadCreate;

// import React, { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Save,
//   ArrowLeft,
//   X,
//   Building2,
//   User,
//   BadgeDollarSign,
//   CheckSquare,
//   AlertTriangle,
//   Plus,
// } from "lucide-react";
// import { toast } from "sonner";

// const API_URL = process.env.REACT_APP_BACKEND_URL;

// const RevenueLeadCreate = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);

//   // ✅ customer existence state
//   const [checkingCustomers, setCheckingCustomers] = useState(true);
//   const [customers, setCustomers] = useState([]); // store customers list
//   const [selectedCustomerId, setSelectedCustomerId] = useState("");
//   const [selectedCustomer, setSelectedCustomer] = useState(null); // ✅ full object for display

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
//   });

//   // ✅ computed: has at least one ACTIVE customer
//   const hasActiveCustomer = useMemo(() => {
//     return customers.some(
//       (c) => String(c?.status || "").toLowerCase() === "active",
//     );
//   }, [customers]);

//   const activeCustomers = useMemo(() => {
//     return customers.filter(
//       (c) => String(c?.status || "").toLowerCase() === "active",
//     );
//   }, [customers]);

//   // helper: derive a readable contact
//   const getPrimaryContact = (c) => {
//     if (!c?.contacts || !Array.isArray(c.contacts) || c.contacts.length === 0)
//       return null;
//     return c.contacts.find((x) => x?.is_primary) || c.contacts[0];
//   };

//   // 🔍 CHECK CUSTOMERS ON LOAD
//   useEffect(() => {
//     const checkCustomers = async () => {
//       setCheckingCustomers(true);
//       try {
//         const token = localStorage.getItem("access_token");
//         if (!token) {
//           toast.error("No token found. Please login again.");
//           setCustomers([]);
//           setSelectedCustomerId("");
//           setSelectedCustomer(null);
//           return;
//         }

//         const res = await fetch(`${API_URL}/api/commerce/parties/customers`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         if (!res.ok) {
//           const errText = await res.text();
//           toast.error(`Failed to load customers (${res.status})`);
//           console.error("Customers API error:", res.status, errText);
//           setCustomers([]);
//           setSelectedCustomerId("");
//           setSelectedCustomer(null);
//           return;
//         }

//         const data = await res.json();

//         // ✅ Your backend shape: { success, customers, count }
//         const list = Array.isArray(data?.customers) ? data.customers : [];
//         setCustomers(list);

//         // ✅ Auto-select first active customer (optional)
//         const firstActive = list.find(
//           (c) => String(c?.status || "").toLowerCase() === "active",
//         );

//         if (firstActive?.customer_id) {
//           setSelectedCustomerId(firstActive.customer_id);
//           setSelectedCustomer(firstActive); // ✅ store full object
//         } else {
//           setSelectedCustomerId("");
//           setSelectedCustomer(null);
//         }
//       } catch (err) {
//         console.error(err);
//         toast.error("Unable to verify customers");
//         setCustomers([]);
//         setSelectedCustomerId("");
//         setSelectedCustomer(null);
//       } finally {
//         setCheckingCustomers(false);
//       }
//     };

//     checkCustomers();
//   }, []);

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

//   const handleCustomerChange = (e) => {
//     const id = e.target.value;
//     setSelectedCustomerId(id);

//     const match = customers.find((c) => c.customer_id === id) || null;
//     setSelectedCustomer(match);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!hasActiveCustomer) {
//       toast.error("Create an active customer before creating a lead");
//       return;
//     }

//     if (!selectedCustomerId) {
//       toast.error("Please select a customer");
//       return;
//     }

//     setLoading(true);

//     try {
//       const token = localStorage.getItem("access_token");
//       if (!token) {
//         toast.error("No token found. Please login again.");
//         return;
//       }

//       const payload = {
//         ...formData,
//         customer_id: selectedCustomerId, // keep only if backend supports it
//         customer_name:
//           selectedCustomer?.display_name || selectedCustomer?.legal_name || "",
//       };

//       const res = await fetch(
//         `${API_URL}/api/commerce/workflow/revenue/leads`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify(payload),
//         },
//       );

//       const data = await res.json();

//       if (data?.success) {
//         toast.success("Lead created successfully");
//         navigate("/commerce/revenue-workflow/leads");
//       } else {
//         const msg =
//           data?.detail?.message ||
//           data?.detail ||
//           data?.message ||
//           "Failed to create lead";
//         toast.error(typeof msg === "string" ? msg : "Failed to create lead");
//         console.error("Create lead error:", data);
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error("Error creating lead");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (checkingCustomers) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-[#f4f6f8]">
//         <p className="text-gray-600">Checking customer status…</p>
//       </div>
//     );
//   }

//   const primaryContact = selectedCustomer
//     ? getPrimaryContact(selectedCustomer)
//     : null;

//   return (
//     <div className="min-h-screen flex flex-col bg-[#f4f6f8]">
//       {/* Header */}
//       <div className="bg-white border-b border-gray-200">
//         <div className="px-10 py-7">
//           <div className="flex items-start gap-4">
//             <button
//               type="button"
//               onClick={() => navigate("/commerce/revenue-workflow/leads")}
//               className="mt-1 p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition"
//               title="Back"
//             >
//               <ArrowLeft className="h-5 w-5" />
//             </button>

//             <div className="text-left">
//               <h1 className="text-3xl font-semibold text-gray-900">
//                 New Revenue Lead
//               </h1>
//               <p className="mt-1 text-sm text-gray-500">
//                 Capture commercial interest
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ⚠️ NO CUSTOMER WARNING */}
//       {!hasActiveCustomer && (
//         <div className="mx-auto mt-8 max-w-5xl w-full px-10">
//           <div className="flex items-start gap-4 p-5 rounded-xl border border-yellow-300 bg-yellow-50">
//             <AlertTriangle className="h-6 w-6 text-yellow-600 mt-1" />
//             <div className="flex-1">
//               <h3 className="font-semibold text-yellow-900">
//                 No Active Customer Found
//               </h3>
//               <p className="text-sm text-yellow-800 mt-1">
//                 You must create at least one active customer before creating a
//                 revenue lead.
//               </p>

//               <button
//                 onClick={() => navigate("/commerce/parties/customers/create")}
//                 className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3A4E63] text-white font-medium"
//               >
//                 <Plus className="h-4 w-4" />
//                 Create Customer
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* FORM */}
//       <div className="flex-1 flex justify-center px-10 py-10">
//         <form
//           onSubmit={handleSubmit}
//           className={`w-full max-w-5xl space-y-7 ${
//             !hasActiveCustomer ? "opacity-50 pointer-events-none" : ""
//           }`}
//         >
//           {/* ✅ Customer selection */}
//           <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//             <div className="px-8 py-5 border-b border-gray-200">
//               <div className="flex items-center gap-3">
//                 <User className="h-5 w-5 text-gray-700" />
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   Customer
//                 </h2>
//               </div>
//               <p className="mt-1 text-sm text-gray-500">
//                 Select an active customer (pulled from the database).
//               </p>
//             </div>

//             <div className="px-8 py-8">
//               <label className="block text-sm font-medium text-gray-900 mb-2">
//                 Customer <span className="text-red-500">*</span>
//               </label>

//               <select
//                 value={selectedCustomerId}
//                 onChange={handleCustomerChange}
//                 className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
//                            focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 required
//               >
//                 <option value="">Select an active customer</option>
//                 {activeCustomers.map((c) => (
//                   <option key={c.customer_id} value={c.customer_id}>
//                     {c.display_name || c.legal_name} ({c.customer_id})
//                   </option>
//                 ))}
//               </select>

//               {/* ✅ Show selected customer details (name + id + email + status) */}
//               {selectedCustomer && (
//                 <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
//                   <p className="text-sm text-gray-800">
//                     <span className="font-semibold">Customer Name:</span>{" "}
//                     {selectedCustomer.display_name ||
//                       selectedCustomer.legal_name}
//                   </p>
//                   <p className="text-sm text-gray-700 mt-1">
//                     <span className="font-semibold">Customer ID:</span>{" "}
//                     {selectedCustomer.customer_id}
//                   </p>

//                   {primaryContact?.email && (
//                     <p className="text-sm text-gray-700 mt-1">
//                       <span className="font-semibold">Email:</span>{" "}
//                       {primaryContact.email}
//                     </p>
//                   )}

//                   <p className="text-sm text-gray-700 mt-1">
//                     <span className="font-semibold">Status:</span>{" "}
//                     <span className="capitalize">
//                       {selectedCustomer.status}
//                     </span>
//                   </p>
//                 </div>
//               )}

//               <div className="mt-4 flex gap-3">
//                 <button
//                   type="button"
//                   onClick={() => navigate("/commerce/parties/customers")}
//                   className="h-11 px-5 rounded-lg border border-gray-300 bg-white text-gray-800 font-medium hover:bg-gray-50 transition"
//                 >
//                   View Customers
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() => navigate("/commerce/parties/customers/create")}
//                   className="h-11 px-5 rounded-lg bg-[#3A4E63] text-white font-medium hover:bg-[#022d6e] transition"
//                 >
//                   <Plus className="h-4 w-4 inline mr-2" />
//                   Create New Customer
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Company Info */}
//           <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//             <div className="px-8 py-5 border-b border-gray-200">
//               <div className="flex items-center gap-3">
//                 <Building2 className="h-5 w-5 text-gray-700" />
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   Company Information
//                 </h2>
//               </div>
//             </div>

//             <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-7">
//               <div className="md:col-span-2">
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Company Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="company_name"
//                   value={formData.company_name}
//                   onChange={handleChange}
//                   required
//                   placeholder="Enter company name"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Website
//                 </label>
//                 <input
//                   type="url"
//                   name="website"
//                   value={formData.website}
//                   onChange={handleChange}
//                   placeholder="https://example.com"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Country <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="country"
//                   value={formData.country}
//                   onChange={handleChange}
//                   required
//                   placeholder="Enter country"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Industry
//                 </label>
//                 <select
//                   name="industry"
//                   value={formData.industry}
//                   onChange={handleChange}
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
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
//           <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//             <div className="px-8 py-5 border-b border-gray-200">
//               <div className="flex items-center gap-3">
//                 <User className="h-5 w-5 text-gray-700" />
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   Primary Contact
//                 </h2>
//               </div>
//             </div>

//             <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Contact Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="contact_name"
//                   value={formData.contact_name}
//                   onChange={handleChange}
//                   required
//                   placeholder="Enter name"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Email <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="email"
//                   name="contact_email"
//                   value={formData.contact_email}
//                   onChange={handleChange}
//                   required
//                   placeholder="email@example.com"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Phone
//                 </label>
//                 <input
//                   type="tel"
//                   name="contact_phone"
//                   value={formData.contact_phone}
//                   onChange={handleChange}
//                   placeholder="+91-XXXXXXXXXX"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Lead Metadata */}
//           <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//             <div className="px-8 py-5 border-b border-gray-200">
//               <div className="flex items-center gap-3">
//                 <BadgeDollarSign className="h-5 w-5 text-gray-700" />
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   Lead Metadata
//                 </h2>
//               </div>
//             </div>

//             <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Lead Source <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   name="lead_source"
//                   value={formData.lead_source}
//                   onChange={handleChange}
//                   required
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
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
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Estimated Deal Value (₹)
//                 </label>
//                 <input
//                   type="number"
//                   name="estimated_deal_value"
//                   value={formData.estimated_deal_value}
//                   onChange={handleChange}
//                   min="0"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Expected Timeline
//                 </label>
//                 <select
//                   name="expected_timeline"
//                   value={formData.expected_timeline}
//                   onChange={handleChange}
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 >
//                   <option value="0-3 months">0-3 months</option>
//                   <option value="3-6 months">3-6 months</option>
//                   <option value="6-12 months">6-12 months</option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* Qualification Checklist */}
//           <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//             <div className="px-8 py-5 border-b border-gray-200">
//               <div className="flex items-center gap-3">
//                 <CheckSquare className="h-5 w-5 text-gray-700" />
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   Qualification Checklist
//                 </h2>
//               </div>
//               <p className="mt-1 text-sm text-gray-500">
//                 Lightweight qualification - No pricing, no catalog selection
//               </p>
//             </div>

//             <div className="px-8 py-8 space-y-5">
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

//               <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
//                 <span className="text-sm font-medium text-gray-700">
//                   Budget mentioned?
//                 </span>
//                 <div className="flex gap-4">
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

//           {/* Notes */}
//           <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//             <div className="px-8 py-5 border-b border-gray-200">
//               <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
//             </div>

//             <div className="px-8 py-8">
//               <textarea
//                 name="notes"
//                 value={formData.notes}
//                 onChange={handleChange}
//                 rows={3}
//                 placeholder="Additional notes about this lead..."
//                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400
//                            focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//               />
//             </div>
//           </div>

//           {/* Actions */}
//           <div className="flex items-center justify-end gap-4">
//             <button
//               type="button"
//               onClick={() => navigate("/commerce/revenue-workflow/leads")}
//               className="h-11 px-6 rounded-lg border border-gray-300 bg-white text-gray-800 font-medium hover:bg-gray-50 transition"
//             >
//               <X className="h-4 w-4 inline mr-2" />
//               Cancel
//             </button>

//             <button
//               type="submit"
//               disabled={loading}
//               className="h-11 px-7 rounded-lg bg-[#3A4E63] text-white font-semibold hover:bg-[#022d6e] transition disabled:opacity-50"
//             >
//               <Save className="h-4 w-4 inline mr-2" />
//               {loading ? "Creating..." : "Create Lead"}
//             </button>
//           </div>
//         </form>
//       </div>

//       {/* Footer */}
//       <footer className="border-t border-gray-200 bg-white py-5 text-center text-sm text-gray-600">
//         © {new Date().getFullYear()} Innovate Books. All rights reserved.
//       </footer>
//     </div>
//   );
// };

// export default RevenueLeadCreate;

// import React, { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Save,
//   ArrowLeft,
//   X,
//   Building2,
//   User,
//   BadgeDollarSign,
//   CheckSquare,
//   AlertTriangle,
//   Plus,
// } from "lucide-react";
// import { toast } from "sonner";

// const API_URL = process.env.REACT_APP_BACKEND_URL;

// const RevenueLeadCreate = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);

//   const [checkingCustomers, setCheckingCustomers] = useState(true);
//   const [customers, setCustomers] = useState([]);
//   const [selectedCustomerId, setSelectedCustomerId] = useState("");
//   const [selectedCustomer, setSelectedCustomer] = useState(null);

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
//   });

//   // ✅ normalize status comparison
//   const isActive = (c) => String(c?.status || "").toLowerCase() === "active";

//   // ✅ get customer display name based on YOUR DB shape
//   const getCustomerName = (c) =>
//     c?.name ||
//     c?.company_name ||
//     c?.display_name ||
//     c?.legal_name ||
//     "Unnamed Customer";

//   const hasActiveCustomer = useMemo(
//     () => customers.some((c) => isActive(c)),
//     [customers],
//   );

//   const activeCustomers = useMemo(
//     () => customers.filter((c) => isActive(c)),
//     [customers],
//   );

//   // 🔍 load customers on page load
//   useEffect(() => {
//     const loadCustomers = async () => {
//       setCheckingCustomers(true);
//       try {
//         const token = localStorage.getItem("access_token");
//         if (!token) {
//           toast.error("No token found. Please login again.");
//           setCustomers([]);
//           setSelectedCustomerId("");
//           setSelectedCustomer(null);
//           return;
//         }

//         const res = await fetch(`${API_URL}/api/commerce/parties/customers`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         if (!res.ok) {
//           const errText = await res.text();
//           toast.error(`Failed to load customers (${res.status})`);
//           console.error("Customers API error:", res.status, errText);
//           setCustomers([]);
//           setSelectedCustomerId("");
//           setSelectedCustomer(null);
//           return;
//         }

//         const data = await res.json();

//         // ✅ backend shape: { success, customers, count }
//         const list = Array.isArray(data?.customers) ? data.customers : [];
//         setCustomers(list);

//         // ✅ auto-select first active customer
//         const firstActive = list.find((c) => isActive(c));
//         if (firstActive?.customer_id) {
//           setSelectedCustomerId(firstActive.customer_id);
//           setSelectedCustomer(firstActive);
//         } else {
//           setSelectedCustomerId("");
//           setSelectedCustomer(null);
//         }
//       } catch (err) {
//         console.error(err);
//         toast.error("Unable to load customers");
//         setCustomers([]);
//         setSelectedCustomerId("");
//         setSelectedCustomer(null);
//       } finally {
//         setCheckingCustomers(false);
//       }
//     };

//     loadCustomers();
//   }, []);

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

//   const handleCustomerChange = (e) => {
//     const id = e.target.value;
//     setSelectedCustomerId(id);

//     const match = customers.find((c) => c.customer_id === id) || null;
//     setSelectedCustomer(match);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!hasActiveCustomer) {
//       toast.error("Create an active customer before creating a lead");
//       return;
//     }

//     if (!selectedCustomerId) {
//       toast.error("Please select a customer");
//       return;
//     }

//     setLoading(true);

//     try {
//       const token = localStorage.getItem("access_token");
//       if (!token) {
//         toast.error("No token found. Please login again.");
//         return;
//       }

//       // ✅ attach customer info (keep only fields your backend accepts)
//       const payload = {
//         ...formData,
//         customer_id: selectedCustomerId,
//         customer_name: selectedCustomer
//           ? getCustomerName(selectedCustomer)
//           : "",
//       };

//       const res = await fetch(
//         `${API_URL}/api/commerce/workflow/revenue/leads`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify(payload),
//         },
//       );

//       const data = await res.json();

//       if (data?.success) {
//         toast.success("Lead created successfully");
//         navigate("/commerce/revenue-workflow/leads");
//       } else {
//         const msg =
//           data?.detail?.message ||
//           data?.detail ||
//           data?.message ||
//           "Failed to create lead";
//         toast.error(typeof msg === "string" ? msg : "Failed to create lead");
//         console.error("Create lead error:", data);
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error("Error creating lead");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (checkingCustomers) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-[#f4f6f8]">
//         <p className="text-gray-600">Checking customer status…</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex flex-col bg-[#f4f6f8]">
//       {/* Header */}
//       <div className="bg-white border-b border-gray-200">
//         <div className="px-10 py-7">
//           <div className="flex items-start gap-4">
//             <button
//               type="button"
//               onClick={() => navigate("/commerce/revenue-workflow/leads")}
//               className="mt-1 p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition"
//               title="Back"
//             >
//               <ArrowLeft className="h-5 w-5" />
//             </button>

//             <div className="text-left">
//               <h1 className="text-3xl font-semibold text-gray-900">
//                 New Revenue Lead
//               </h1>
//               <p className="mt-1 text-sm text-gray-500">
//                 Capture commercial interest
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ⚠️ NO CUSTOMER WARNING */}
//       {!hasActiveCustomer && (
//         <div className="mx-auto mt-8 max-w-5xl w-full px-10">
//           <div className="flex items-start gap-4 p-5 rounded-xl border border-yellow-300 bg-yellow-50">
//             <AlertTriangle className="h-6 w-6 text-yellow-600 mt-1" />
//             <div className="flex-1">
//               <h3 className="font-semibold text-yellow-900">
//                 No Active Customer Found
//               </h3>
//               <p className="text-sm text-yellow-800 mt-1">
//                 You must create at least one active customer before creating a
//                 revenue lead.
//               </p>

//               <button
//                 onClick={() => navigate("/commerce/parties/customers/create")}
//                 className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3A4E63] text-white font-medium"
//               >
//                 <Plus className="h-4 w-4" />
//                 Create Customer
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* FORM */}
//       <div className="flex-1 flex justify-center px-10 py-10">
//         <form
//           onSubmit={handleSubmit}
//           className={`w-full max-w-5xl space-y-7 ${
//             !hasActiveCustomer ? "opacity-50 pointer-events-none" : ""
//           }`}
//         >
//           {/* ✅ Customer selection */}
//           <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//             <div className="px-8 py-5 border-b border-gray-200">
//               <div className="flex items-center gap-3">
//                 <User className="h-5 w-5 text-gray-700" />
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   Customer
//                 </h2>
//               </div>
//               <p className="mt-1 text-sm text-gray-500">
//                 Select an active customer (pulled from the database).
//               </p>
//             </div>

//             <div className="px-8 py-8">
//               <label className="block text-sm font-medium text-gray-900 mb-2">
//                 Customer <span className="text-red-500">*</span>
//               </label>

//               <select
//                 value={selectedCustomerId}
//                 onChange={handleCustomerChange}
//                 className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
//                            focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 required
//               >
//                 <option value="">Select an active customer</option>
//                 {activeCustomers.map((c) => (
//                   <option key={c.customer_id} value={c.customer_id}>
//                     {getCustomerName(c)} ({c.customer_id})
//                   </option>
//                 ))}
//               </select>

//               {/* ✅ Show selected customer info */}
//               {selectedCustomer && (
//                 <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
//                   <p className="text-sm text-gray-800">
//                     <span className="font-semibold">Name:</span>{" "}
//                     {getCustomerName(selectedCustomer)}
//                   </p>
//                   <p className="text-sm text-gray-700 mt-1">
//                     <span className="font-semibold">Customer ID:</span>{" "}
//                     {selectedCustomer.customer_id}
//                   </p>
//                   {selectedCustomer.email && (
//                     <p className="text-sm text-gray-700 mt-1">
//                       <span className="font-semibold">Email:</span>{" "}
//                       {selectedCustomer.email}
//                     </p>
//                   )}
//                   <p className="text-sm text-gray-700 mt-1">
//                     <span className="font-semibold">Status:</span>{" "}
//                     <span className="capitalize">
//                       {selectedCustomer.status}
//                     </span>
//                   </p>
//                 </div>
//               )}

//               <div className="mt-4 flex gap-3">
//                 <button
//                   type="button"
//                   onClick={() => navigate("/commerce/parties/customers")}
//                   className="h-11 px-5 rounded-lg border border-gray-300 bg-white text-gray-800 font-medium hover:bg-gray-50 transition"
//                 >
//                   View Customers
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() => navigate("/commerce/parties/customers/create")}
//                   className="h-11 px-5 rounded-lg bg-[#3A4E63] text-white font-medium hover:bg-[#022d6e] transition"
//                 >
//                   <Plus className="h-4 w-4 inline mr-2" />
//                   Create New Customer
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Company Info */}
//           <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//             <div className="px-8 py-5 border-b border-gray-200">
//               <div className="flex items-center gap-3">
//                 <Building2 className="h-5 w-5 text-gray-700" />
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   Company Information
//                 </h2>
//               </div>
//             </div>

//             <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-7">
//               <div className="md:col-span-2">
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Company Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="company_name"
//                   value={formData.company_name}
//                   onChange={handleChange}
//                   required
//                   placeholder="Enter company name"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Website
//                 </label>
//                 <input
//                   type="url"
//                   name="website"
//                   value={formData.website}
//                   onChange={handleChange}
//                   placeholder="https://example.com"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Country <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="country"
//                   value={formData.country}
//                   onChange={handleChange}
//                   required
//                   placeholder="Enter country"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Industry
//                 </label>
//                 <select
//                   name="industry"
//                   value={formData.industry}
//                   onChange={handleChange}
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
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
//           <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//             <div className="px-8 py-5 border-b border-gray-200">
//               <div className="flex items-center gap-3">
//                 <User className="h-5 w-5 text-gray-700" />
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   Primary Contact
//                 </h2>
//               </div>
//             </div>

//             <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Contact Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="contact_name"
//                   value={formData.contact_name}
//                   onChange={handleChange}
//                   required
//                   placeholder="Enter name"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Email <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="email"
//                   name="contact_email"
//                   value={formData.contact_email}
//                   onChange={handleChange}
//                   required
//                   placeholder="email@example.com"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Phone
//                 </label>
//                 <input
//                   type="tel"
//                   name="contact_phone"
//                   value={formData.contact_phone}
//                   onChange={handleChange}
//                   placeholder="+91-XXXXXXXXXX"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Lead Metadata */}
//           <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//             <div className="px-8 py-5 border-b border-gray-200">
//               <div className="flex items-center gap-3">
//                 <BadgeDollarSign className="h-5 w-5 text-gray-700" />
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   Lead Metadata
//                 </h2>
//               </div>
//             </div>

//             <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Lead Source <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   name="lead_source"
//                   value={formData.lead_source}
//                   onChange={handleChange}
//                   required
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
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
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Estimated Deal Value (₹)
//                 </label>
//                 <input
//                   type="number"
//                   name="estimated_deal_value"
//                   value={formData.estimated_deal_value}
//                   onChange={handleChange}
//                   min="0"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Expected Timeline
//                 </label>
//                 <select
//                   name="expected_timeline"
//                   value={formData.expected_timeline}
//                   onChange={handleChange}
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
//                              focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                 >
//                   <option value="0-3 months">0-3 months</option>
//                   <option value="3-6 months">3-6 months</option>
//                   <option value="6-12 months">6-12 months</option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* Qualification Checklist */}
//           <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//             <div className="px-8 py-5 border-b border-gray-200">
//               <div className="flex items-center gap-3">
//                 <CheckSquare className="h-5 w-5 text-gray-700" />
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   Qualification Checklist
//                 </h2>
//               </div>
//               <p className="mt-1 text-sm text-gray-500">
//                 Lightweight qualification - No pricing, no catalog selection
//               </p>
//             </div>

//             <div className="px-8 py-8 space-y-5">
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

//               <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
//                 <span className="text-sm font-medium text-gray-700">
//                   Budget mentioned?
//                 </span>
//                 <div className="flex gap-4">
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

//           {/* Notes */}
//           <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//             <div className="px-8 py-5 border-b border-gray-200">
//               <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
//             </div>

//             <div className="px-8 py-8">
//               <textarea
//                 name="notes"
//                 value={formData.notes}
//                 onChange={handleChange}
//                 rows={3}
//                 placeholder="Additional notes about this lead..."
//                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400
//                            focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//               />
//             </div>
//           </div>

//           {/* Actions */}
//           <div className="flex items-center justify-end gap-4">
//             <button
//               type="button"
//               onClick={() => navigate("/commerce/revenue-workflow/leads")}
//               className="h-11 px-6 rounded-lg border border-gray-300 bg-white text-gray-800 font-medium hover:bg-gray-50 transition"
//             >
//               <X className="h-4 w-4 inline mr-2" />
//               Cancel
//             </button>

//             <button
//               type="submit"
//               disabled={loading}
//               className="h-11 px-7 rounded-lg bg-[#3A4E63] text-white font-semibold hover:bg-[#022d6e] transition disabled:opacity-50"
//             >
//               <Save className="h-4 w-4 inline mr-2" />
//               {loading ? "Creating..." : "Create Lead"}
//             </button>
//           </div>
//         </form>
//       </div>

//       {/* Footer */}
//       <footer className="border-t border-gray-200 bg-white py-5 text-center text-sm text-gray-600">
//         © {new Date().getFullYear()} Innovate Books. All rights reserved.
//       </footer>
//     </div>
//   );
// };

// export default RevenueLeadCreate;

// import React, { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   ArrowLeft,
//   Save,
//   X,
//   Plus,
//   Building2,
//   User,
//   MapPin,
//   Briefcase,
//   BadgeDollarSign,
//   FileText,
// } from "lucide-react";
// import { toast } from "sonner";

// const API_URL = process.env.REACT_APP_BACKEND_URL;

// // -------- helpers --------
// const pad2 = (n) => String(n).padStart(2, "0");

// // REV-LEAD-YYYYMMDDHHmmss
// const generateLeadId = () => {
//   const d = new Date();
//   const y = d.getFullYear();
//   const mo = pad2(d.getMonth() + 1);
//   const da = pad2(d.getDate());
//   const hh = pad2(d.getHours());
//   const mm = pad2(d.getMinutes());
//   const ss = pad2(d.getSeconds());
//   return `REV-LEAD-${y}${mo}${da}${hh}${mm}${ss}`;
// };

// const toNum = (v) => {
//   const n = Number(String(v ?? "").replace(/[^\d.]/g, ""));
//   return Number.isFinite(n) ? n : 0;
// };

// const RevenueLeadCreate = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);

//   // ✅ structured form data (new CRM-style shape)
//   const [formData, setFormData] = useState({
//     lead_id: "",
//     lead_name: "",
//     company_name: "",
//     website: "",
//     description: "",
//     expected_deal_value: "",

//     lead_status: "new", // dropdown values

//     // contacts: [
//     //   {
//     //     full_name: "",
//     //     email: "",
//     //     phone: "",
//     //     role: "",
//     //     is_primary: true,
//     //   },
//     // ],
//     contacts: [
//       {
//         full_name: "",
//         email: "",
//         phone: "",
//         role: "",
//         is_primary: true,
//       },
//     ],
//     additional_contacts: [], // ✅ optional contacts here

//     address: {
//       country: "",
//       street: "",
//       city: "",
//       state: "",
//       postal_code: "",
//     },

//     business: {
//       industry: "",
//       employees: "",
//       annual_revenue: "",
//       lead_source: "inbound",
//       assigned_to: "",
//     },
//   });

//   // auto-generate lead_id on first load (still editable)
//   useEffect(() => {
//     setFormData((prev) => ({
//       ...prev,
//       lead_id: prev.lead_id || generateLeadId(),
//     }));
//   }, []);

//   const statusOptions = useMemo(
//     () => [
//       { value: "imported", label: "Imported" },
//       { value: "new", label: "New" },
//       { value: "contacted", label: "Contacted" },
//       { value: "qualified", label: "Qualified" },
//       { value: "proposal_sent", label: "Proposal Sent" },
//       { value: "won", label: "Won" },
//       { value: "lost", label: "Lost" },
//     ],
//     [],
//   );

//   const handleBasicChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((p) => ({ ...p, [name]: value }));
//   };

//   const handleAddressChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((p) => ({
//       ...p,
//       address: { ...p.address, [name]: value },
//     }));
//   };

//   const handleBusinessChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((p) => ({
//       ...p,
//       business: { ...p.business, [name]: value },
//     }));
//   };

//   const handleContactChange = (index, field, value) => {
//     setFormData((p) => {
//       const next = [...p.contacts];
//       next[index] = { ...next[index], [field]: value };
//       return { ...p, contacts: next };
//     });
//   };

//   const addContact = () => {
//     setFormData((p) => ({
//       ...p,
//       contacts: [
//         ...p.contacts,
//         { full_name: "", email: "", phone: "", role: "", is_primary: false },
//       ],
//     }));
//   };
//   const addAdditionalContact = () => {
//     setFormData((p) => ({
//       ...p,
//       additional_contacts: [
//         ...p.additional_contacts,
//         { full_name: "", email: "", phone: "", role: "" },
//       ],
//     }));
//   };

//   const removeAdditionalContact = (index) => {
//     setFormData((p) => ({
//       ...p,
//       additional_contacts: p.additional_contacts.filter((_, i) => i !== index),
//     }));
//   };

//   const handleAdditionalContactChange = (index, field, value) => {
//     setFormData((p) => {
//       const next = [...p.additional_contacts];
//       next[index] = { ...next[index], [field]: value };
//       return { ...p, additional_contacts: next };
//     });
//   };

//   const removeContact = (index) => {
//     setFormData((p) => {
//       const next = p.contacts.filter((_, i) => i !== index);
//       // keep at least one row
//       if (next.length === 0) {
//         return {
//           ...p,
//           contacts: [
//             { full_name: "", email: "", phone: "", role: "", is_primary: true },
//           ],
//         };
//       }
//       // ensure at least one primary
//       if (!next.some((c) => c.is_primary)) next[0].is_primary = true;
//       return { ...p, contacts: next };
//     });
//   };

//   const makePrimary = (index) => {
//     setFormData((p) => {
//       const next = p.contacts.map((c, i) => ({
//         ...c,
//         is_primary: i === index,
//       }));
//       return { ...p, contacts: next };
//     });
//   };

//   const validate = () => {
//     const leadId = String(formData.lead_id || "").trim();
//     const leadName = String(formData.lead_name || "").trim();
//     const company = String(formData.company_name || "").trim();

//     if (!leadName) return "Lead Name is required";
//     if (!company) return "Company Name is required";

//     // contact section: require at least primary name+email
//     const primary =
//       formData.contacts.find((c) => c.is_primary) || formData.contacts[0];
//     if (!String(primary?.full_name || "").trim())
//       return "Primary contact full name is required";
//     if (!String(primary?.email || "").trim())
//       return "Primary contact email is required";

//     // lead_id optional: if empty we’ll generate at submit
//     if (leadId && leadId.length < 6) return "Lead ID looks too short";
//     return null;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const err = validate();
//     if (err) {
//       toast.error(err);
//       return;
//     }

//     setLoading(true);
//     try {
//       const token = localStorage.getItem("access_token");
//       if (!token) {
//         toast.error("No token found. Please login again.");
//         return;
//       }

//       // if user clears lead_id, generate on submit
//       const lead_id_final =
//         String(formData.lead_id || "").trim() || generateLeadId();

//       const primary =
//         formData.contacts.find((c) => c.is_primary) || formData.contacts[0];

//       // ✅ payload: includes your new schema + compatibility keys
//       const payload = {
//         // new keys
//         lead_id: lead_id_final,
//         lead_name: String(formData.lead_name || "").trim(),
//         company_name: String(formData.company_name || "").trim(),
//         website: String(formData.website || "").trim(),
//         description: String(formData.description || "").trim(),
//         deal_value: toNum(formData.expected_deal_value), // matches your other DB sample
//         expected_deal_value: toNum(formData.expected_deal_value), // also keep this key
//         stage: formData.lead_status, // some APIs use stage
//         lead_status: formData.lead_status,
//         status: formData.lead_status, // fallback, if backend uses status field

//         // contact + address + business profile
//         contacts: formData.contacts.map((c) => ({
//           full_name: String(c.full_name || "").trim(),
//           email: String(c.email || "").trim(),
//           phone: String(c.phone || "").trim(),
//           role: String(c.role || "").trim(),
//           is_primary: !!c.is_primary,
//         })),
//         address: {
//           country: String(formData.address.country || "").trim(),
//           street: String(formData.address.street || "").trim(),
//           city: String(formData.address.city || "").trim(),
//           state: String(formData.address.state || "").trim(),
//           postal_code: String(formData.address.postal_code || "").trim(),
//         },
//         business_profile: {
//           industry: String(formData.business.industry || "").trim(),
//           employees: String(formData.business.employees || "").trim(),
//           annual_revenue: String(formData.business.annual_revenue || "").trim(),
//           lead_source: String(formData.business.lead_source || "").trim(),
//           assigned_to: String(formData.business.assigned_to || "").trim(),
//         },

//         // compatibility fields (if your existing backend expects these)
//         contact_name: String(primary?.full_name || "").trim(),
//         contact_email: String(primary?.email || "").trim(),
//         contact_phone: String(primary?.phone || "").trim(),
//         country: String(formData.address.country || "").trim(),
//         industry: String(formData.business.industry || "").trim(),
//         lead_source: String(formData.business.lead_source || "").trim(),
//       };

//       const res = await fetch(
//         `${API_URL}/api/commerce/workflow/revenue/leads`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify(payload),
//         },
//       );

//       const data = await res.json();

//       if (res.ok && data?.success) {
//         toast.success("Lead created successfully");

//         // ✅ to refresh list if you add listener there
//         window.dispatchEvent(new Event("revenueLeadChanged"));

//         navigate("/commerce/revenue-workflow/leads");
//       } else {
//         const msg =
//           data?.detail?.message ||
//           data?.detail ||
//           data?.message ||
//           `Failed to create lead (${res.status})`;
//         toast.error(typeof msg === "string" ? msg : "Failed to create lead");
//         console.error("Create lead error:", data);
//       }
//     } catch (error) {
//       console.error(error);
//       toast.error("Error creating lead");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div
//       className="min-h-screen bg-[#f4f6f8]"
//       data-testid="revenue-lead-create"
//     >
//       {/* Header */}
//       <div className="bg-white border-b border-gray-200">
//         <div className="px-10 py-7">
//           <div className="flex items-start gap-4">
//             <button
//               type="button"
//               onClick={() => navigate("/commerce/revenue-workflow/leads")}
//               className="mt-1 p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition"
//               title="Back"
//             >
//               <ArrowLeft className="h-5 w-5" />
//             </button>

//             <div className="text-left">
//               <h1 className="text-3xl font-semibold text-gray-900">
//                 Create New Lead
//               </h1>
//               <p className="mt-1 text-sm text-gray-500">
//                 Add a new lead to your organization
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Content */}
//       <div className="mx-auto max-w-6xl px-10 py-10">
//         <form onSubmit={handleSubmit} className="space-y-8">
//           {/* Two-column top like your screenshot */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//             {/* Basic Information */}
//             <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//               <div className="px-8 py-5 border-b border-gray-200">
//                 <div className="flex items-center gap-3">
//                   <Building2 className="h-5 w-5 text-gray-700" />
//                   <h2 className="text-lg font-semibold text-gray-900">
//                     Basic Information
//                   </h2>
//                 </div>
//               </div>

//               <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* Lead ID (optional editable) */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-900 mb-2">
//                     Lead ID <span className="text-gray-400">(optional)</span>
//                   </label>
//                   <input
//                     type="text"
//                     name="lead_id"
//                     value={formData.lead_id}
//                     onChange={handleBasicChange}
//                     placeholder="Auto-generated (editable)"
//                     className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
//                                focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                   />
//                   <p className="text-xs text-gray-500 mt-2">
//                     Leave as-is or edit. If cleared, it will auto-generate on
//                     save.
//                   </p>
//                 </div>

//                 {/* Lead Status */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-900 mb-2">
//                     Lead Status
//                   </label>
//                   <select
//                     name="lead_status"
//                     value={formData.lead_status}
//                     onChange={(e) =>
//                       setFormData((p) => ({
//                         ...p,
//                         lead_status: e.target.value,
//                       }))
//                     }
//                     className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
//                                focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                   >
//                     {statusOptions.map((o) => (
//                       <option key={o.value} value={o.value}>
//                         {o.label}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Lead Name */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-900 mb-2">
//                     Lead Name <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     name="lead_name"
//                     value={formData.lead_name}
//                     onChange={handleBasicChange}
//                     required
//                     placeholder="Enter lead name"
//                     className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
//                                focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                   />
//                 </div>

//                 {/* Company Name */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-900 mb-2">
//                     Company Name <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     name="company_name"
//                     value={formData.company_name}
//                     onChange={handleBasicChange}
//                     required
//                     placeholder="Enter company name"
//                     className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
//                                focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                   />
//                 </div>

//                 {/* Website */}
//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-gray-900 mb-2">
//                     Website <span className="text-gray-400">(optional)</span>
//                   </label>
//                   <input
//                     type="url"
//                     name="website"
//                     value={formData.website}
//                     onChange={handleBasicChange}
//                     placeholder="https://example.com"
//                     className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
//                                focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                   />
//                 </div>

//                 {/* Description */}
//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-gray-900 mb-2">
//                     Description{" "}
//                     <span className="text-gray-400">(optional)</span>
//                   </label>
//                   <textarea
//                     name="description"
//                     value={formData.description}
//                     onChange={handleBasicChange}
//                     rows={4}
//                     placeholder="Describe the opportunity..."
//                     className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900
//                                focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                   />
//                 </div>

//                 {/* Expected Deal Value */}
//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-gray-900 mb-2">
//                     Expected Deal Value (₹){" "}
//                     <span className="text-gray-400">(optional)</span>
//                   </label>
//                   <div className="relative">
//                     <BadgeDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                     <input
//                       type="number"
//                       name="expected_deal_value"
//                       value={formData.expected_deal_value}
//                       onChange={handleBasicChange}
//                       min="0"
//                       placeholder="0"
//                       className="w-full h-11 pl-11 pr-4 rounded-lg border border-gray-300 bg-white text-gray-900
//                                  focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Contacts (dynamic) */}
//             <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//               <div className="px-8 py-5 border-b border-gray-200">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-3">
//                     <User className="h-5 w-5 text-gray-700" />
//                     <h2 className="text-lg font-semibold text-gray-900">
//                       Contacts
//                     </h2>
//                   </div>

//                   <button
//                     type="button"
//                     onClick={addContact}
//                     className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#3A4E63] text-white text-sm font-medium hover:bg-[#022d6e] transition"
//                   >
//                     <Plus className="h-4 w-4" />
//                     Add Contact
//                   </button>
//                 </div>
//               </div>

//               <div className="px-8 py-8 space-y-6">
//                 {formData.contacts.map((c, idx) => (
//                   <div
//                     key={idx}
//                     className="rounded-xl border border-gray-200 p-4 bg-white"
//                   >
//                     <div className="flex items-start justify-between gap-3 mb-4">
//                       <div>
//                         <p className="text-sm font-semibold text-gray-900">
//                           Contact #{idx + 1}{" "}
//                           {c.is_primary && (
//                             <span className="ml-2 inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
//                               Primary
//                             </span>
//                           )}
//                         </p>
//                         <p className="text-xs text-gray-500 mt-1">
//                           Add at least one primary contact (name + email
//                           required).
//                         </p>
//                       </div>

//                       <div className="flex items-center gap-2">
//                         {!c.is_primary && (
//                           <button
//                             type="button"
//                             onClick={() => makePrimary(idx)}
//                             className="px-3 py-2 text-xs font-semibold rounded-lg border border-gray-300 hover:bg-gray-50"
//                           >
//                             Make Primary
//                           </button>
//                         )}
//                         <button
//                           type="button"
//                           onClick={() => removeContact(idx)}
//                           className="px-3 py-2 text-xs font-semibold rounded-lg border border-gray-300 hover:bg-gray-50"
//                         >
//                           Remove
//                         </button>
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-900 mb-2">
//                           Full Name{" "}
//                           {c.is_primary && (
//                             <span className="text-red-500">*</span>
//                           )}
//                         </label>
//                         <input
//                           type="text"
//                           value={c.full_name}
//                           onChange={(e) =>
//                             handleContactChange(
//                               idx,
//                               "full_name",
//                               e.target.value,
//                             )
//                           }
//                           placeholder="Full name"
//                           className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
//                                      focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                         />
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-900 mb-2">
//                           Role <span className="text-gray-400">(optional)</span>
//                         </label>
//                         <input
//                           type="text"
//                           value={c.role}
//                           onChange={(e) =>
//                             handleContactChange(idx, "role", e.target.value)
//                           }
//                           placeholder="Billing / Sales / Ops"
//                           className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
//                                      focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                         />
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-900 mb-2">
//                           Email{" "}
//                           {c.is_primary && (
//                             <span className="text-red-500">*</span>
//                           )}
//                         </label>
//                         <input
//                           type="email"
//                           value={c.email}
//                           onChange={(e) =>
//                             handleContactChange(idx, "email", e.target.value)
//                           }
//                           placeholder="name@company.com"
//                           className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
//                                      focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                         />
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-900 mb-2">
//                           Phone Number{" "}
//                           <span className="text-gray-400">(optional)</span>
//                         </label>
//                         <input
//                           type="tel"
//                           value={c.phone}
//                           onChange={(e) =>
//                             handleContactChange(idx, "phone", e.target.value)
//                           }
//                           placeholder="+91 XXXXX XXXXX"
//                           className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
//                                      focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Address + Business Profile (below) */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//             {/* Address */}
//             <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//               <div className="px-8 py-5 border-b border-gray-200">
//                 <div className="flex items-center gap-3">
//                   <MapPin className="h-5 w-5 text-gray-700" />
//                   <h2 className="text-lg font-semibold text-gray-900">
//                     Address
//                   </h2>
//                 </div>
//               </div>

//               <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-900 mb-2">
//                     Country
//                   </label>
//                   <input
//                     type="text"
//                     name="country"
//                     value={formData.address.country}
//                     onChange={handleAddressChange}
//                     placeholder="Enter country"
//                     className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
//                                focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-900 mb-2">
//                     State / Province
//                   </label>
//                   <input
//                     type="text"
//                     name="state"
//                     value={formData.address.state}
//                     onChange={handleAddressChange}
//                     placeholder="Enter state/province"
//                     className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
//                                focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                   />
//                 </div>

//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-gray-900 mb-2">
//                     Street
//                   </label>
//                   <input
//                     type="text"
//                     name="street"
//                     value={formData.address.street}
//                     onChange={handleAddressChange}
//                     placeholder="Street address"
//                     className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
//                                focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-900 mb-2">
//                     City
//                   </label>
//                   <input
//                     type="text"
//                     name="city"
//                     value={formData.address.city}
//                     onChange={handleAddressChange}
//                     placeholder="City"
//                     className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
//                                focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-900 mb-2">
//                     Zip / Postal Code
//                   </label>
//                   <input
//                     type="text"
//                     name="postal_code"
//                     value={formData.address.postal_code}
//                     onChange={handleAddressChange}
//                     placeholder="Postal code"
//                     className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
//                                focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Business Profile */}
//             <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//               <div className="px-8 py-5 border-b border-gray-200">
//                 <div className="flex items-center gap-3">
//                   <Briefcase className="h-5 w-5 text-gray-700" />
//                   <h2 className="text-lg font-semibold text-gray-900">
//                     Business Profile
//                   </h2>
//                 </div>
//               </div>

//               <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-900 mb-2">
//                     Industry
//                   </label>
//                   <input
//                     type="text"
//                     name="industry"
//                     value={formData.business.industry}
//                     onChange={handleBusinessChange}
//                     placeholder="e.g., Finance"
//                     className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
//                                focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-900 mb-2">
//                     Number of Employees
//                   </label>
//                   <input
//                     type="number"
//                     name="employees"
//                     value={formData.business.employees}
//                     onChange={handleBusinessChange}
//                     min="0"
//                     placeholder="e.g., 250"
//                     className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
//                                focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-900 mb-2">
//                     Annual Revenue{" "}
//                     <span className="text-gray-400">(optional)</span>
//                   </label>
//                   <input
//                     type="text"
//                     name="annual_revenue"
//                     value={formData.business.annual_revenue}
//                     onChange={handleBusinessChange}
//                     placeholder="e.g., ₹10 Cr"
//                     className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
//                                focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-900 mb-2">
//                     Lead Source
//                   </label>
//                   <select
//                     name="lead_source"
//                     value={formData.business.lead_source}
//                     onChange={handleBusinessChange}
//                     className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
//                                focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                   >
//                     <option value="inbound">Inbound</option>
//                     <option value="outbound">Outbound</option>
//                     <option value="linkedin">LinkedIn</option>
//                     <option value="referral">Referral</option>
//                     <option value="website">Website</option>
//                     <option value="trade_show">Trade Show</option>
//                     <option value="partner">Partner</option>
//                     <option value="other">Other</option>
//                   </select>
//                 </div>

//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-gray-900 mb-2">
//                     Assigned To{" "}
//                     <span className="text-gray-400">(optional)</span>
//                   </label>
//                   <input
//                     type="text"
//                     name="assigned_to"
//                     value={formData.business.assigned_to}
//                     onChange={handleBusinessChange}
//                     placeholder="e.g., Rahul Gupta"
//                     className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
//                                focus:outline-none focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Actions */}
//           <div className="flex items-center justify-end gap-4">
//             <button
//               type="button"
//               onClick={() => navigate("/commerce/revenue-workflow/leads")}
//               className="h-11 px-6 rounded-lg border border-gray-300 bg-white text-gray-800 font-medium hover:bg-gray-50 transition"
//             >
//               <X className="h-4 w-4 inline mr-2" />
//               Cancel
//             </button>

//             <button
//               type="submit"
//               disabled={loading}
//               className="h-11 px-7 rounded-lg bg-[#3A4E63] text-white font-semibold hover:bg-[#022d6e] transition disabled:opacity-50"
//             >
//               <Save className="h-4 w-4 inline mr-2" />
//               {loading ? "Creating..." : "Create Lead"}
//             </button>
//           </div>
//         </form>

//         {/* Footer */}
//         <footer className="mt-10 border-t border-gray-200 bg-transparent py-5 text-center text-sm text-gray-600">
//           © {new Date().getFullYear()} Innovate Books. All rights reserved.
//         </footer>
//       </div>
//     </div>
//   );
// };

// export default RevenueLeadCreate;

// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   ArrowLeft,
//   Save,
//   X,
//   Plus,
//   Building2,
//   User,
//   MapPin,
//   Briefcase,
//   BadgeDollarSign,
//   Search,
//   CheckCircle2,
//   AlertTriangle,
// } from "lucide-react";
// import { toast } from "sonner";

// const API_URL = process.env.REACT_APP_BACKEND_URL;

// // -------- helpers --------
// const pad2 = (n) => String(n).padStart(2, "0");

// // REV-LEAD-YYYYMMDDHHmmss
// const generateLeadId = () => {
//   const d = new Date();
//   const y = d.getFullYear();
//   const mo = pad2(d.getMonth() + 1);
//   const da = pad2(d.getDate());
//   const hh = pad2(d.getHours());
//   const mm = pad2(d.getMinutes());
//   const ss = pad2(d.getSeconds());
//   return `REV-LEAD-${y}${mo}${da}${hh}${mm}${ss}`;
// };

// const toNum = (v) => {
//   const n = Number(String(v ?? "").replace(/[^\d.]/g, ""));
//   return Number.isFinite(n) ? n : 0;
// };

// const normalize = (s) =>
//   String(s ?? "")
//     .trim()
//     .toLowerCase();

// const getCustomerName = (c) =>
//   c?.name || c?.company_name || c?.display_name || c?.legal_name || "Unnamed";

// const RevenueLeadCreate = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);

//   // ---------------- Customers ----------------
//   const [checkingCustomers, setCheckingCustomers] = useState(true);
//   const [customers, setCustomers] = useState([]);
//   const [selectedCustomer, setSelectedCustomer] = useState(null);

//   // searchable dropdown UI
//   const [customerQuery, setCustomerQuery] = useState("");
//   const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
//   const dropdownRef = useRef(null);

//   // "auto open create modal if not found"
//   const [autoOpenCreateModal, setAutoOpenCreateModal] = useState(true);

//   // create customer popup
//   const [showCreateCustomer, setShowCreateCustomer] = useState(false);
//   const [creatingCustomer, setCreatingCustomer] = useState(false);
//   const [newCustomer, setNewCustomer] = useState({
//     display_name: "",
//     legal_name: "",
//     customer_type: "B2B",
//     segment: "SMB",
//     country_of_registration: "",
//     industry: "",
//     contact: { name: "", role: "", email: "", phone: "" },
//     status: "active",
//   });

//   // ---------------- Lead form ----------------
//   const [formData, setFormData] = useState({
//     lead_id: "",
//     lead_name: "",
//     company_name: "",
//     website: "",
//     description: "",
//     expected_deal_value: "",
//     lead_status: "new",

//     contacts: [
//       { full_name: "", email: "", phone: "", role: "", is_primary: true },
//     ],

//     address: { country: "", street: "", city: "", state: "", postal_code: "" },

//     business: {
//       industry: "",
//       employees: "",
//       annual_revenue: "",
//       lead_source: "inbound",
//       assigned_to: "",
//     },
//   });

//   // auto-generate lead_id on first load (still editable)
//   useEffect(() => {
//     setFormData((prev) => ({
//       ...prev,
//       lead_id: prev.lead_id || generateLeadId(),
//     }));
//   }, []);

//   const statusOptions = useMemo(
//     () => [
//       { value: "imported", label: "Imported" },
//       { value: "new", label: "New" },
//       { value: "contacted", label: "Contacted" },
//       { value: "qualified", label: "Qualified" },
//       { value: "proposal_sent", label: "Proposal Sent" },
//       { value: "won", label: "Won" },
//       { value: "lost", label: "Lost" },
//     ],
//     [],
//   );

//   // Load customers
//   useEffect(() => {
//     const loadCustomers = async () => {
//       setCheckingCustomers(true);
//       try {
//         const token = localStorage.getItem("access_token");
//         if (!token) {
//           toast.error("No token found. Please login again.");
//           setCustomers([]);
//           setSelectedCustomer(null);
//           return;
//         }

//         const res = await fetch(`${API_URL}/api/commerce/parties/customers`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         if (!res.ok) {
//           const errText = await res.text();
//           toast.error(`Failed to load customers (${res.status})`);
//           console.error("Customers API error:", res.status, errText);
//           setCustomers([]);
//           setSelectedCustomer(null);
//           return;
//         }

//         const data = await res.json();
//         const list = Array.isArray(data?.customers) ? data.customers : [];
//         setCustomers(list);

//         // optional: preselect first active
//         const firstActive = list.find((c) => normalize(c?.status) === "active");
//         if (firstActive) {
//           setSelectedCustomer(firstActive);
//           setCustomerQuery(getCustomerName(firstActive));
//         }
//       } catch (err) {
//         console.error(err);
//         toast.error("Unable to load customers");
//         setCustomers([]);
//         setSelectedCustomer(null);
//       } finally {
//         setCheckingCustomers(false);
//       }
//     };

//     loadCustomers();
//   }, []);

//   // close dropdown on outside click
//   useEffect(() => {
//     const onDown = (e) => {
//       if (!dropdownRef.current) return;
//       if (!dropdownRef.current.contains(e.target)) {
//         setCustomerDropdownOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", onDown);
//     return () => document.removeEventListener("mousedown", onDown);
//   }, []);

//   const filteredCustomers = useMemo(() => {
//     const q = normalize(customerQuery);
//     if (!q) return customers;

//     return customers.filter((c) => {
//       const name = normalize(getCustomerName(c));
//       const id = normalize(c?.customer_id);
//       const email = normalize(c?.email);
//       return name.includes(q) || id.includes(q) || email.includes(q);
//     });
//   }, [customers, customerQuery]);

//   // ✅ auto-open create modal when no results (debounced)
//   useEffect(() => {
//     if (!autoOpenCreateModal) return;
//     const q = customerQuery.trim();
//     if (!q) return;

//     // if dropdown isn't open, ignore
//     if (!customerDropdownOpen) return;

//     const t = setTimeout(() => {
//       const noResults = filteredCustomers.length === 0;
//       if (noResults) {
//         // open modal and prefill names
//         setShowCreateCustomer(true);
//         setNewCustomer((p) => ({
//           ...p,
//           display_name: p.display_name || q,
//           legal_name: p.legal_name || q,
//         }));
//         setCustomerDropdownOpen(false);
//       }
//     }, 500); // debounce

//     return () => clearTimeout(t);
//   }, [
//     customerQuery,
//     filteredCustomers.length,
//     customerDropdownOpen,
//     autoOpenCreateModal,
//   ]);

//   const selectCustomer = (c) => {
//     setSelectedCustomer(c);
//     setCustomerQuery(getCustomerName(c));
//     setCustomerDropdownOpen(false);
//   };

//   const openCreateCustomerWithQuery = () => {
//     const q = customerQuery.trim();
//     setShowCreateCustomer(true);
//     setNewCustomer((p) => ({
//       ...p,
//       display_name: p.display_name || q,
//       legal_name: p.legal_name || q,
//     }));
//     setCustomerDropdownOpen(false);
//   };

//   const handleNewCustomerChange = (e) => {
//     const { name, value } = e.target;
//     setNewCustomer((p) => ({ ...p, [name]: value }));
//   };

//   const handleNewCustomerContactChange = (e) => {
//     const { name, value } = e.target;
//     setNewCustomer((p) => ({
//       ...p,
//       contact: { ...p.contact, [name]: value },
//     }));
//   };

//   const refreshCustomers = async (token) => {
//     const res2 = await fetch(`${API_URL}/api/commerce/parties/customers`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     const data2 = await res2.json();
//     const list = Array.isArray(data2?.customers) ? data2.customers : [];
//     setCustomers(list);
//     return list;
//   };

//   const createCustomer = async () => {
//     if (!newCustomer.display_name.trim())
//       return toast.error("Display Name is required");
//     if (!newCustomer.legal_name.trim())
//       return toast.error("Legal Name is required");
//     if (!newCustomer.country_of_registration.trim())
//       return toast.error("Country of Registration is required");

//     setCreatingCustomer(true);
//     try {
//       const token = localStorage.getItem("access_token");
//       if (!token) {
//         toast.error("No token found. Please login again.");
//         return;
//       }

//       const payload = {
//         display_name: newCustomer.display_name.trim(),
//         legal_name: newCustomer.legal_name.trim(),
//         customer_type: newCustomer.customer_type,
//         segment: newCustomer.segment,
//         country_of_registration: newCustomer.country_of_registration.trim(),
//         industry: newCustomer.industry.trim(),
//         status: newCustomer.status || "active",
//         contacts: [
//           {
//             name: newCustomer.contact.name.trim(),
//             role: newCustomer.contact.role.trim(),
//             email: newCustomer.contact.email.trim(),
//             phone: newCustomer.contact.phone.trim(),
//             is_primary: true,
//           },
//         ],
//       };

//       const res = await fetch(`${API_URL}/api/commerce/parties/customers`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(payload),
//       });

//       const data = await res.json();

//       if (!res.ok || !data?.success) {
//         const msg =
//           data?.detail?.message ||
//           data?.detail ||
//           data?.message ||
//           `Failed to create customer (${res.status})`;
//         toast.error(
//           typeof msg === "string" ? msg : "Failed to create customer",
//         );
//         console.error("Create customer error:", data);
//         return;
//       }

//       toast.success("Customer created");

//       const list = await refreshCustomers(token);

//       // select new customer by exact display name
//       const match = list.find(
//         (c) =>
//           normalize(getCustomerName(c)) === normalize(newCustomer.display_name),
//       );
//       if (match) {
//         selectCustomer(match);
//       } else if (data?.customer?.customer_id) {
//         const byId = list.find(
//           (c) => c.customer_id === data.customer.customer_id,
//         );
//         if (byId) selectCustomer(byId);
//       }

//       setShowCreateCustomer(false);
//     } catch (err) {
//       console.error(err);
//       toast.error("Error creating customer");
//     } finally {
//       setCreatingCustomer(false);
//     }
//   };

//   // ------------- lead form handlers -------------
//   const handleBasicChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((p) => ({ ...p, [name]: value }));
//   };

//   const handleAddressChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((p) => ({
//       ...p,
//       address: { ...p.address, [name]: value },
//     }));
//   };

//   const handleBusinessChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((p) => ({
//       ...p,
//       business: { ...p.business, [name]: value },
//     }));
//   };

//   const handleContactChange = (index, field, value) => {
//     setFormData((p) => {
//       const next = [...p.contacts];
//       next[index] = { ...next[index], [field]: value };
//       return { ...p, contacts: next };
//     });
//   };

//   const addContact = () => {
//     setFormData((p) => ({
//       ...p,
//       contacts: [
//         ...p.contacts,
//         { full_name: "", email: "", phone: "", role: "", is_primary: false },
//       ],
//     }));
//   };

//   const removeContact = (index) => {
//     setFormData((p) => {
//       const next = p.contacts.filter((_, i) => i !== index);
//       if (next.length === 0) {
//         return {
//           ...p,
//           contacts: [
//             { full_name: "", email: "", phone: "", role: "", is_primary: true },
//           ],
//         };
//       }
//       if (!next.some((c) => c.is_primary)) next[0].is_primary = true;
//       return { ...p, contacts: next };
//     });
//   };

//   const makePrimary = (index) => {
//     setFormData((p) => {
//       const next = p.contacts.map((c, i) => ({
//         ...c,
//         is_primary: i === index,
//       }));
//       return { ...p, contacts: next };
//     });
//   };

//   const validate = () => {
//     const leadName = String(formData.lead_name || "").trim();
//     const company = String(formData.company_name || "").trim();

//     if (!selectedCustomer?.customer_id) return "Please select a customer";
//     if (!leadName) return "Lead Name is required";
//     if (!company) return "Company Name is required";

//     const primary =
//       formData.contacts.find((c) => c.is_primary) || formData.contacts[0];
//     if (!String(primary?.full_name || "").trim())
//       return "Primary contact full name is required";
//     if (!String(primary?.email || "").trim())
//       return "Primary contact email is required";

//     return null;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const err = validate();
//     if (err) return toast.error(err);

//     setLoading(true);
//     try {
//       const token = localStorage.getItem("access_token");
//       if (!token) return toast.error("No token found. Please login again.");

//       const lead_id_final =
//         String(formData.lead_id || "").trim() || generateLeadId();
//       const primary =
//         formData.contacts.find((c) => c.is_primary) || formData.contacts[0];

//       const payload = {
//         customer_id: selectedCustomer.customer_id,
//         customer_name: getCustomerName(selectedCustomer),

//         lead_id: lead_id_final,
//         lead_name: String(formData.lead_name || "").trim(),
//         company_name: String(formData.company_name || "").trim(),
//         website: String(formData.website || "").trim(),
//         description: String(formData.description || "").trim(),
//         deal_value: toNum(formData.expected_deal_value),
//         expected_deal_value: toNum(formData.expected_deal_value),
//         stage: formData.lead_status,
//         lead_status: formData.lead_status,
//         status: formData.lead_status,

//         contacts: formData.contacts.map((c) => ({
//           full_name: String(c.full_name || "").trim(),
//           email: String(c.email || "").trim(),
//           phone: String(c.phone || "").trim(),
//           role: String(c.role || "").trim(),
//           is_primary: !!c.is_primary,
//         })),

//         address: {
//           country: String(formData.address.country || "").trim(),
//           street: String(formData.address.street || "").trim(),
//           city: String(formData.address.city || "").trim(),
//           state: String(formData.address.state || "").trim(),
//           postal_code: String(formData.address.postal_code || "").trim(),
//         },

//         business_profile: {
//           industry: String(formData.business.industry || "").trim(),
//           employees: String(formData.business.employees || "").trim(),
//           annual_revenue: String(formData.business.annual_revenue || "").trim(),
//           lead_source: String(formData.business.lead_source || "").trim(),
//           assigned_to: String(formData.business.assigned_to || "").trim(),
//         },

//         // compatibility
//         contact_name: String(primary?.full_name || "").trim(),
//         contact_email: String(primary?.email || "").trim(),
//         contact_phone: String(primary?.phone || "").trim(),
//         country: String(formData.address.country || "").trim(),
//         industry: String(formData.business.industry || "").trim(),
//         lead_source: String(formData.business.lead_source || "").trim(),
//       };

//       const res = await fetch(
//         `${API_URL}/api/commerce/workflow/revenue/leads`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify(payload),
//         },
//       );

//       const data = await res.json();

//       if (res.ok && data?.success) {
//         toast.success("Lead created successfully");
//         window.dispatchEvent(new Event("revenueLeadChanged"));
//         navigate("/commerce/revenue-workflow/leads");
//       } else {
//         const msg =
//           data?.detail?.message ||
//           data?.detail ||
//           data?.message ||
//           `Failed to create lead (${res.status})`;
//         toast.error(typeof msg === "string" ? msg : "Failed to create lead");
//       }
//     } catch (error) {
//       console.error(error);
//       toast.error("Error creating lead");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (checkingCustomers) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-[#f4f6f8]">
//         <p className="text-gray-600">Loading customers…</p>
//       </div>
//     );
//   }

//   return (
//     <div
//       className="min-h-screen bg-[#f4f6f8]"
//       data-testid="revenue-lead-create"
//     >
//       {/* Header */}
//       <div className="bg-white border-b border-gray-200">
//         <div className="px-10 py-7">
//           <div className="flex items-start gap-4">
//             <button
//               type="button"
//               onClick={() => navigate("/commerce/revenue-workflow/leads")}
//               className="mt-1 p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition"
//               title="Back"
//             >
//               <ArrowLeft className="h-5 w-5" />
//             </button>

//             <div className="text-left">
//               <h1 className="text-3xl font-semibold text-gray-900">
//                 Create New Lead
//               </h1>
//               <p className="mt-1 text-sm text-gray-500">
//                 Add a new lead to your organization
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Content */}
//       <div className="mx-auto max-w-6xl px-10 py-10">
//         <form onSubmit={handleSubmit} className="space-y-8">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//             {/* Basic Information */}
//             <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//               <div className="px-8 py-5 border-b border-gray-200">
//                 <div className="flex items-center gap-3">
//                   <Building2 className="h-5 w-5 text-gray-700" />
//                   <h2 className="text-lg font-semibold text-gray-900">
//                     Basic Information
//                   </h2>
//                 </div>
//               </div>

//               <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-900 mb-2">
//                     Lead ID <span className="text-gray-400">(optional)</span>
//                   </label>
//                   <input
//                     type="text"
//                     name="lead_id"
//                     value={formData.lead_id}
//                     onChange={handleBasicChange}
//                     className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-900 mb-2">
//                     Lead Status
//                   </label>
//                   <select
//                     name="lead_status"
//                     value={formData.lead_status}
//                     onChange={(e) =>
//                       setFormData((p) => ({
//                         ...p,
//                         lead_status: e.target.value,
//                       }))
//                     }
//                     className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                   >
//                     {statusOptions.map((o) => (
//                       <option key={o.value} value={o.value}>
//                         {o.label}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-900 mb-2">
//                     Lead Name <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     name="lead_name"
//                     value={formData.lead_name}
//                     onChange={handleBasicChange}
//                     required
//                     className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-900 mb-2">
//                     Company Name <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     name="company_name"
//                     value={formData.company_name}
//                     onChange={handleBasicChange}
//                     required
//                     className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                   />
//                 </div>

//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-gray-900 mb-2">
//                     Website <span className="text-gray-400">(optional)</span>
//                   </label>
//                   <input
//                     type="url"
//                     name="website"
//                     value={formData.website}
//                     onChange={handleBasicChange}
//                     className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                   />
//                 </div>

//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-gray-900 mb-2">
//                     Description{" "}
//                     <span className="text-gray-400">(optional)</span>
//                   </label>
//                   <textarea
//                     name="description"
//                     value={formData.description}
//                     onChange={handleBasicChange}
//                     rows={4}
//                     className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                   />
//                 </div>

//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-gray-900 mb-2">
//                     Expected Deal Value (₹){" "}
//                     <span className="text-gray-400">(optional)</span>
//                   </label>
//                   <div className="relative">
//                     <BadgeDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                     <input
//                       type="number"
//                       name="expected_deal_value"
//                       value={formData.expected_deal_value}
//                       onChange={handleBasicChange}
//                       min="0"
//                       className="w-full h-11 pl-11 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Right column */}
//             <div className="space-y-8">
//               {/* Customer Selector */}
//               <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//                 <div className="px-8 py-5 border-b border-gray-200">
//                   <div className="flex items-center gap-3">
//                     <Search className="h-5 w-5 text-gray-700" />
//                     <h2 className="text-lg font-semibold text-gray-900">
//                       Customer
//                     </h2>
//                   </div>
//                   <p className="mt-1 text-sm text-gray-500">
//                     Search & select an existing customer. If not found, create a
//                     new one.
//                   </p>
//                 </div>

//                 <div className="px-8 py-6" ref={dropdownRef}>
//                   <label className="block text-sm font-medium text-gray-900 mb-2">
//                     Customer <span className="text-red-500">*</span>
//                   </label>

//                   <div className="relative">
//                     <input
//                       value={customerQuery}
//                       onChange={(e) => {
//                         setCustomerQuery(e.target.value);
//                         setCustomerDropdownOpen(true);
//                         setSelectedCustomer(null);
//                       }}
//                       onFocus={() => setCustomerDropdownOpen(true)}
//                       placeholder="Type customer name / id / email…"
//                       className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                     />

//                     {customerDropdownOpen && (
//                       <div className="absolute z-30 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden">
//                         <div className="max-h-80 overflow-auto">
//                           {filteredCustomers.length > 0 ? (
//                             filteredCustomers.map((c) => (
//                               <button
//                                 type="button"
//                                 key={c.customer_id}
//                                 onClick={() => selectCustomer(c)}
//                                 className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-start justify-between gap-4 border-b border-gray-100"
//                               >
//                                 <div className="min-w-0">
//                                   <p className="text-sm font-semibold text-gray-900 truncate">
//                                     {getCustomerName(c)}
//                                   </p>
//                                   <p className="text-xs text-gray-500 mt-1 truncate">
//                                     <span className="font-medium text-gray-700">
//                                       {c.customer_id}
//                                     </span>
//                                     {c.email ? ` • ${c.email}` : ""}
//                                   </p>
//                                 </div>

//                                 <span
//                                   className={`shrink-0 text-xs font-semibold px-2 py-1 rounded-full ${
//                                     normalize(c.status) === "active"
//                                       ? "bg-green-100 text-green-700"
//                                       : "bg-gray-100 text-gray-700"
//                                   }`}
//                                 >
//                                   {c.status || "unknown"}
//                                 </span>
//                               </button>
//                             ))
//                           ) : (
//                             <div className="px-4 py-4 text-sm text-gray-600">
//                               No results found for{" "}
//                               <span className="font-semibold">
//                                 “{customerQuery}”
//                               </span>
//                               .
//                               <div className="mt-3">
//                                 <button
//                                   type="button"
//                                   onClick={openCreateCustomerWithQuery}
//                                   className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3A4E63] text-white font-semibold hover:bg-[#022d6e]"
//                                 >
//                                   <Plus className="h-4 w-4" />
//                                   Create New Customer
//                                 </button>
//                               </div>
//                             </div>
//                           )}
//                         </div>

//                         {/* sticky footer create */}
//                         <div className="p-3 border-t border-gray-200 bg-white sticky bottom-0">
//                           <button
//                             type="button"
//                             onClick={openCreateCustomerWithQuery}
//                             className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-lg bg-[#3A4E63] text-white font-semibold hover:bg-[#022d6e]"
//                           >
//                             <Plus className="h-4 w-4" />
//                             Create New Customer
//                           </button>
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   {selectedCustomer && (
//                     <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 flex items-start justify-between gap-3">
//                       <div>
//                         <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
//                           <CheckCircle2 className="h-4 w-4 text-green-600" />
//                           {getCustomerName(selectedCustomer)}
//                         </p>
//                         <p className="text-xs text-gray-600 mt-1">
//                           {selectedCustomer.customer_id}
//                           {selectedCustomer.email
//                             ? ` • ${selectedCustomer.email}`
//                             : ""}
//                         </p>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Contacts */}
//               <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//                 <div className="px-8 py-5 border-b border-gray-200">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                       <User className="h-5 w-5 text-gray-700" />
//                       <h2 className="text-lg font-semibold text-gray-900">
//                         Contacts
//                       </h2>
//                     </div>

//                     <button
//                       type="button"
//                       onClick={addContact}
//                       className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#3A4E63] text-white text-sm font-medium hover:bg-[#022d6e] transition"
//                     >
//                       <Plus className="h-4 w-4" />
//                       Add Contact
//                     </button>
//                   </div>
//                 </div>

//                 <div className="px-8 py-8 space-y-6">
//                   {formData.contacts.map((c, idx) => (
//                     <div
//                       key={idx}
//                       className="rounded-xl border border-gray-200 p-4 bg-white"
//                     >
//                       <div className="flex items-start justify-between gap-3 mb-4">
//                         <div>
//                           <p className="text-sm font-semibold text-gray-900">
//                             Contact #{idx + 1}{" "}
//                             {c.is_primary && (
//                               <span className="ml-2 inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
//                                 Primary
//                               </span>
//                             )}
//                           </p>
//                         </div>

//                         <div className="flex items-center gap-2">
//                           {!c.is_primary && (
//                             <button
//                               type="button"
//                               onClick={() => makePrimary(idx)}
//                               className="px-3 py-2 text-xs font-semibold rounded-lg border border-gray-300 hover:bg-gray-50"
//                             >
//                               Make Primary
//                             </button>
//                           )}
//                           <button
//                             type="button"
//                             onClick={() => removeContact(idx)}
//                             className="px-3 py-2 text-xs font-semibold rounded-lg border border-gray-300 hover:bg-gray-50"
//                           >
//                             Remove
//                           </button>
//                         </div>
//                       </div>

//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                           <label className="block text-sm font-medium text-gray-900 mb-2">
//                             Full Name{" "}
//                             {c.is_primary && (
//                               <span className="text-red-500">*</span>
//                             )}
//                           </label>
//                           <input
//                             type="text"
//                             value={c.full_name}
//                             onChange={(e) =>
//                               handleContactChange(
//                                 idx,
//                                 "full_name",
//                                 e.target.value,
//                               )
//                             }
//                             className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                           />
//                         </div>

//                         <div>
//                           <label className="block text-sm font-medium text-gray-900 mb-2">
//                             Role{" "}
//                             <span className="text-gray-400">(optional)</span>
//                           </label>
//                           <input
//                             type="text"
//                             value={c.role}
//                             onChange={(e) =>
//                               handleContactChange(idx, "role", e.target.value)
//                             }
//                             className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                           />
//                         </div>

//                         <div>
//                           <label className="block text-sm font-medium text-gray-900 mb-2">
//                             Email{" "}
//                             {c.is_primary && (
//                               <span className="text-red-500">*</span>
//                             )}
//                           </label>
//                           <input
//                             type="email"
//                             value={c.email}
//                             onChange={(e) =>
//                               handleContactChange(idx, "email", e.target.value)
//                             }
//                             className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                           />
//                         </div>

//                         <div>
//                           <label className="block text-sm font-medium text-gray-900 mb-2">
//                             Phone{" "}
//                             <span className="text-gray-400">(optional)</span>
//                           </label>
//                           <input
//                             type="tel"
//                             value={c.phone}
//                             onChange={(e) =>
//                               handleContactChange(idx, "phone", e.target.value)
//                             }
//                             className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   ))}

//                   {!selectedCustomer?.customer_id && (
//                     <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-900 flex items-start gap-3">
//                       <AlertTriangle className="h-5 w-5 text-yellow-700 mt-0.5" />
//                       <div>
//                         Select a customer first. Lead creation requires a
//                         customer.
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Address + Business Profile (below) */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//             <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//               <div className="px-8 py-5 border-b border-gray-200 flex items-center gap-3">
//                 <MapPin className="h-5 w-5 text-gray-700" />
//                 <h2 className="text-lg font-semibold text-gray-900">Address</h2>
//               </div>

//               <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <input
//                   name="country"
//                   value={formData.address.country}
//                   onChange={handleAddressChange}
//                   placeholder="Country"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                 />
//                 <input
//                   name="state"
//                   value={formData.address.state}
//                   onChange={handleAddressChange}
//                   placeholder="State/Province"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                 />
//                 <input
//                   name="street"
//                   value={formData.address.street}
//                   onChange={handleAddressChange}
//                   placeholder="Street"
//                   className="md:col-span-2 w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                 />
//                 <input
//                   name="city"
//                   value={formData.address.city}
//                   onChange={handleAddressChange}
//                   placeholder="City"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                 />
//                 <input
//                   name="postal_code"
//                   value={formData.address.postal_code}
//                   onChange={handleAddressChange}
//                   placeholder="Zip/Postal Code"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                 />
//               </div>
//             </div>

//             <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//               <div className="px-8 py-5 border-b border-gray-200 flex items-center gap-3">
//                 <Briefcase className="h-5 w-5 text-gray-700" />
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   Business Profile
//                 </h2>
//               </div>

//               <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <input
//                   name="industry"
//                   value={formData.business.industry}
//                   onChange={handleBusinessChange}
//                   placeholder="Industry"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                 />
//                 <input
//                   name="employees"
//                   value={formData.business.employees}
//                   onChange={handleBusinessChange}
//                   placeholder="Employees"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                 />
//                 <input
//                   name="annual_revenue"
//                   value={formData.business.annual_revenue}
//                   onChange={handleBusinessChange}
//                   placeholder="Annual revenue"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                 />
//                 <select
//                   name="lead_source"
//                   value={formData.business.lead_source}
//                   onChange={handleBusinessChange}
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                 >
//                   <option value="inbound">Inbound</option>
//                   <option value="outbound">Outbound</option>
//                   <option value="linkedin">LinkedIn</option>
//                   <option value="referral">Referral</option>
//                   <option value="website">Website</option>
//                   <option value="trade_show">Trade Show</option>
//                   <option value="partner">Partner</option>
//                   <option value="other">Other</option>
//                 </select>
//                 <input
//                   name="assigned_to"
//                   value={formData.business.assigned_to}
//                   onChange={handleBusinessChange}
//                   placeholder="Assigned to"
//                   className="md:col-span-2 w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Actions */}
//           <div className="flex items-center justify-end gap-4">
//             <button
//               type="button"
//               onClick={() => navigate("/commerce/revenue-workflow/leads")}
//               className="h-11 px-6 rounded-lg border border-gray-300 bg-white text-gray-800 font-medium hover:bg-gray-50 transition"
//             >
//               <X className="h-4 w-4 inline mr-2" />
//               Cancel
//             </button>

//             <button
//               type="submit"
//               disabled={loading || !selectedCustomer?.customer_id}
//               className="h-11 px-7 rounded-lg bg-[#3A4E63] text-white font-semibold hover:bg-[#022d6e] transition disabled:opacity-50"
//             >
//               <Save className="h-4 w-4 inline mr-2" />
//               {loading ? "Creating..." : "Create Lead"}
//             </button>
//           </div>
//         </form>
//       </div>

//       {/* Create Customer Modal */}
//       {showCreateCustomer && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center">
//           <div
//             className="absolute inset-0 bg-black/30"
//             onClick={() => !creatingCustomer && setShowCreateCustomer(false)}
//           />

//           <div className="relative w-[95%] max-w-3xl bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
//             <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900">
//                   Create New Customer
//                 </h3>
//                 <p className="text-sm text-gray-500 mt-1">
//                   Add customer and continue creating the lead.
//                 </p>
//               </div>
//               <button
//                 type="button"
//                 onClick={() =>
//                   !creatingCustomer && setShowCreateCustomer(false)
//                 }
//                 className="p-2 rounded-lg hover:bg-gray-100"
//               >
//                 <X className="h-5 w-5 text-gray-700" />
//               </button>
//             </div>

//             <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <div className="rounded-xl border border-gray-200 p-5">
//                 <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                   <Building2 className="h-4 w-4 text-gray-700" /> Basic
//                   Information
//                 </h4>

//                 <div className="space-y-4">
//                   <input
//                     name="display_name"
//                     value={newCustomer.display_name}
//                     onChange={handleNewCustomerChange}
//                     placeholder="Display name *"
//                     className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                   />
//                   <input
//                     name="legal_name"
//                     value={newCustomer.legal_name}
//                     onChange={handleNewCustomerChange}
//                     placeholder="Legal name *"
//                     className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                   />
//                   <input
//                     name="country_of_registration"
//                     value={newCustomer.country_of_registration}
//                     onChange={handleNewCustomerChange}
//                     placeholder="Country of registration *"
//                     className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                   />
//                   <input
//                     name="industry"
//                     value={newCustomer.industry}
//                     onChange={handleNewCustomerChange}
//                     placeholder="Industry (optional)"
//                     className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                   />
//                 </div>
//               </div>

//               <div className="rounded-xl border border-gray-200 p-5">
//                 <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                   <User className="h-4 w-4 text-gray-700" /> Primary Contact
//                 </h4>

//                 <div className="space-y-4">
//                   <input
//                     name="name"
//                     value={newCustomer.contact.name}
//                     onChange={handleNewCustomerContactChange}
//                     placeholder="Full name (optional)"
//                     className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                   />
//                   <input
//                     name="email"
//                     value={newCustomer.contact.email}
//                     onChange={handleNewCustomerContactChange}
//                     placeholder="Email (optional)"
//                     className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                   />
//                   <input
//                     name="phone"
//                     value={newCustomer.contact.phone}
//                     onChange={handleNewCustomerContactChange}
//                     placeholder="Phone (optional)"
//                     className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                   />
//                   <input
//                     name="role"
//                     value={newCustomer.contact.role}
//                     onChange={handleNewCustomerContactChange}
//                     placeholder="Role (optional)"
//                     className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="px-6 py-5 border-t border-gray-200 flex items-center justify-end gap-3 bg-white">
//               <button
//                 type="button"
//                 onClick={() =>
//                   !creatingCustomer && setShowCreateCustomer(false)
//                 }
//                 className="h-11 px-5 rounded-lg border border-gray-300 bg-white text-gray-800 font-medium hover:bg-gray-50"
//                 disabled={creatingCustomer}
//               >
//                 Cancel
//               </button>
//               <button
//                 type="button"
//                 onClick={createCustomer}
//                 disabled={creatingCustomer}
//                 className="h-11 px-6 rounded-lg bg-[#3A4E63] text-white font-semibold hover:bg-[#022d6e] disabled:opacity-50"
//               >
//                 {creatingCustomer ? "Creating..." : "Create Customer"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default RevenueLeadCreate;
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   ArrowLeft,
//   Save,
//   X,
//   Plus,
//   Building2,
//   User,
//   MapPin,
//   Briefcase,
//   BadgeDollarSign,
//   CheckCircle2,
//   AlertTriangle,
//   Users,
//   TrendingUp,
//   ShieldCheck,
//   Sparkles,
// } from "lucide-react";
// import { toast } from "sonner";

// import CustomersCreate from "../parties/CustomersCreate";

// const API_URL = process.env.REACT_APP_BACKEND_URL;

// // -------- helpers --------
// const pad2 = (n) => String(n).padStart(2, "0");

// // REV-LEAD-YYYYMMDDHHmmss
// const generateLeadId = () => {
//   const d = new Date();
//   const y = d.getFullYear();
//   const mo = pad2(d.getMonth() + 1);
//   const da = pad2(d.getDate());
//   const hh = pad2(d.getHours());
//   const mm = pad2(d.getMinutes());
//   const ss = pad2(d.getSeconds());
//   return `REV-LEAD-${y}${mo}${da}${hh}${mm}${ss}`;
// };

// const toNum = (v) => {
//   const n = Number(String(v ?? "").replace(/[^\d.]/g, ""));
//   return Number.isFinite(n) ? n : 0;
// };

// const normalize = (s) =>
//   String(s ?? "")
//     .trim()
//     .toLowerCase();

// const getCustomerName = (c) =>
//   c?.name || c?.company_name || c?.display_name || c?.legal_name || "Unnamed";

// const formatINR = (num) => {
//   const n = Number(num);
//   if (!Number.isFinite(n) || n <= 0) return "₹0";
//   try {
//     return new Intl.NumberFormat("en-IN", {
//       style: "currency",
//       currency: "INR",
//       maximumFractionDigits: 0,
//     }).format(n);
//   } catch {
//     return `₹${Math.round(n)}`;
//   }
// };

// const RevenueLeadCreate = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);

//   // ---------------- Customers ----------------
//   const [checkingCustomers, setCheckingCustomers] = useState(true);
//   const [customers, setCustomers] = useState([]);
//   const [selectedCustomer, setSelectedCustomer] = useState(null);

//   // ✅ overlay CustomersCreate
//   const [showCreateCustomer, setShowCreateCustomer] = useState(false);

//   // ---------------- Lead form ----------------
//   const [formData, setFormData] = useState({
//     lead_id: "",
//     lead_name: "", // ✅ now optional
//     company_name: "",
//     website: "",
//     description: "",
//     expected_deal_value: "",
//     lead_status: "new",

//     contacts: [
//       { full_name: "", email: "", phone: "", role: "", is_primary: true },
//     ],

//     address: { country: "", street: "", city: "", state: "", postal_code: "" },

//     business: {
//       industry: "",
//       employees: "",
//       annual_revenue: "",
//       lead_source: "inbound",
//       assigned_to: "",
//     },
//   });

//   // ✅ init lead id (auto) and keep it read-only in UI (no manual/auto buttons)
//   useEffect(() => {
//     setFormData((prev) => ({
//       ...prev,
//       lead_id: prev.lead_id || generateLeadId(),
//     }));
//   }, []);

//   const statusOptions = useMemo(
//     () => [
//       { value: "imported", label: "Imported" },
//       { value: "new", label: "New" },
//       { value: "contacted", label: "Contacted" },
//       { value: "qualified", label: "Qualified" },
//       { value: "proposal_sent", label: "Proposal Sent" },
//       { value: "won", label: "Won" },
//       { value: "lost", label: "Lost" },
//     ],
//     [],
//   );

//   // Return list so we can reliably select after reload (no stale state)
//   const loadCustomers = async () => {
//     setCheckingCustomers(true);
//     try {
//       const token = localStorage.getItem("access_token");
//       if (!token) {
//         toast.error("No token found. Please login again.");
//         setCustomers([]);
//         setSelectedCustomer(null);
//         return [];
//       }

//       const res = await fetch(`${API_URL}/api/commerce/parties/customers`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (!res.ok) {
//         const errText = await res.text();
//         toast.error(`Failed to load customers (${res.status})`);
//         console.error("Customers API error:", res.status, errText);
//         setCustomers([]);
//         setSelectedCustomer(null);
//         return [];
//       }

//       const data = await res.json();
//       const list = Array.isArray(data?.customers) ? data.customers : [];
//       setCustomers(list);
//       return list;
//     } catch (err) {
//       console.error(err);
//       toast.error("Unable to load customers");
//       setCustomers([]);
//       setSelectedCustomer(null);
//       return [];
//     } finally {
//       setCheckingCustomers(false);
//     }
//   };

//   // Load customers
//   useEffect(() => {
//     loadCustomers();
//     //// eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // ------------- lead form handlers -------------
//   const handleBasicChange = (e) => {
//     const { name, value } = e.target;

//     // lead_id is read-only in UI; keep safe anyway
//     if (name === "lead_id") return;

//     setFormData((p) => ({ ...p, [name]: value }));
//   };

//   const handleAddressChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((p) => ({
//       ...p,
//       address: { ...p.address, [name]: value },
//     }));
//   };

//   const handleBusinessChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((p) => ({
//       ...p,
//       business: { ...p.business, [name]: value },
//     }));
//   };

//   const handleContactChange = (index, field, value) => {
//     setFormData((p) => {
//       const next = [...p.contacts];
//       next[index] = { ...next[index], [field]: value };
//       return { ...p, contacts: next };
//     });
//   };

//   // keep exactly ONE contact
//   const ensureSinglePrimaryContact = () => {
//     setFormData((p) => ({
//       ...p,
//       contacts: [
//         {
//           full_name: p.contacts?.[0]?.full_name || "",
//           email: p.contacts?.[0]?.email || "",
//           phone: p.contacts?.[0]?.phone || "",
//           role: p.contacts?.[0]?.role || "",
//           is_primary: true,
//         },
//       ],
//     }));
//   };

//   useEffect(() => {
//     ensureSinglePrimaryContact();
//     // // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const validate = () => {
//     const company = String(formData.company_name || "").trim();
//     const assignedTo = String(formData.business.assigned_to || "").trim();

//     if (!selectedCustomer?.customer_id) return "Please select a customer";
//     // ✅ lead_name optional now
//     if (!company) return "Company Name is required";
//     if (!assignedTo) return "Assigned To (Owner) is required";

//     const primary = formData.contacts?.[0];
//     if (!String(primary?.full_name || "").trim())
//       return "Primary contact full name is required";
//     if (!String(primary?.email || "").trim())
//       return "Primary contact email is required";

//     const id = String(formData.lead_id || "").trim();
//     if (!id.startsWith("REV-LEAD-")) return "Lead ID must start with REV-LEAD-";

//     return null;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const err = validate();
//     if (err) return toast.error(err);

//     setLoading(true);
//     try {
//       const token = localStorage.getItem("access_token");
//       if (!token) return toast.error("No token found. Please login again.");

//       const primary = formData.contacts?.[0];

//       const payload = {
//         customer_id: selectedCustomer.customer_id,
//         customer_name: getCustomerName(selectedCustomer),

//         lead_id: String(formData.lead_id || "").trim(),
//         lead_name: String(formData.lead_name || "").trim(), // optional
//         company_name: String(formData.company_name || "").trim(),
//         website: String(formData.website || "").trim(),
//         description: String(formData.description || "").trim(),
//         deal_value: toNum(formData.expected_deal_value),
//         expected_deal_value: toNum(formData.expected_deal_value),
//         stage: formData.lead_status,
//         lead_status: formData.lead_status,
//         status: formData.lead_status,

//         contacts: [
//           {
//             full_name: String(primary?.full_name || "").trim(),
//             email: String(primary?.email || "").trim(),
//             phone: String(primary?.phone || "").trim(),
//             role: String(primary?.role || "").trim(),
//             is_primary: true,
//           },
//         ],

//         address: {
//           country: String(formData.address.country || "").trim(),
//           street: String(formData.address.street || "").trim(),
//           city: String(formData.address.city || "").trim(),
//           state: String(formData.address.state || "").trim(),
//           postal_code: String(formData.address.postal_code || "").trim(),
//         },

//         business_profile: {
//           industry: String(formData.business.industry || "").trim(),
//           employees: String(formData.business.employees || "").trim(),
//           annual_revenue: String(formData.business.annual_revenue || "").trim(),
//           lead_source: String(formData.business.lead_source || "").trim(),
//           assigned_to: String(formData.business.assigned_to || "").trim(),
//         },

//         // compatibility
//         contact_name: String(primary?.full_name || "").trim(),
//         contact_email: String(primary?.email || "").trim(),
//         contact_phone: String(primary?.phone || "").trim(),
//         country: String(formData.address.country || "").trim(),
//         industry: String(formData.business.industry || "").trim(),
//         lead_source: String(formData.business.lead_source || "").trim(),
//       };

//       const res = await fetch(
//         `${API_URL}/api/commerce/workflow/revenue/leads`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify(payload),
//         },
//       );

//       const data = await res.json();

//       if (res.ok && data?.success) {
//         toast.success("Lead created successfully");
//         window.dispatchEvent(new Event("revenueLeadChanged"));
//         navigate("/commerce/revenue-workflow/leads");
//       } else {
//         const msg =
//           data?.detail?.message ||
//           data?.detail ||
//           data?.message ||
//           `Failed to create lead (${res.status})`;
//         toast.error(typeof msg === "string" ? msg : "Failed to create lead");
//       }
//     } catch (error) {
//       console.error(error);
//       toast.error("Error creating lead");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ called when CustomersCreate succeeds in modal
//   const handleCustomerCreatedInModal = async (createdCustomerMaybe) => {
//     const list = await loadCustomers();

//     const id = createdCustomerMaybe?.customer_id;
//     if (id) {
//       const match = list.find((c) => c.customer_id === id);
//       if (match) {
//         setSelectedCustomer(match);
//         toast.success("Customer created and selected");
//         return;
//       }
//     }

//     toast.success("Customer created. Please select it from the list.");
//   };

//   // UI helpers
//   const dealValueNum = useMemo(
//     () => toNum(formData.expected_deal_value),
//     [formData.expected_deal_value],
//   );

//   const isReadyForSubmit =
//     !!selectedCustomer?.customer_id &&
//     String(formData.company_name || "").trim() &&
//     String(formData.business.assigned_to || "").trim() &&
//     String(formData.contacts?.[0]?.full_name || "").trim() &&
//     String(formData.contacts?.[0]?.email || "").trim();

//   if (checkingCustomers) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-[#f4f6f8]">
//         <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-6 py-5 flex items-center gap-3">
//           <div className="h-3 w-3 rounded-full text-blue-700 animate-pulse" />
//           <p className="text-gray-700 font-medium">Loading customers…</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div
//       className="min-h-screen bg-[#f4f6f8]"
//       data-testid="revenue-lead-create"
//     >
//       {/* Header (finance feel) */}
//       <div className="bg-white border-b border-gray-200">
//         <div className="px-10 py-7">
//           <div className="flex items-start gap-4">
//             <button
//               type="button"
//               onClick={() => navigate("/commerce/revenue-workflow/leads")}
//               className="mt-1 p-2 rounded-xl hover:bg-gray-100 text-gray-700 transition"
//               title="Back"
//             >
//               <ArrowLeft className="h-5 w-5" />
//             </button>

//             <div className="flex-1">
//               <div className="flex items-start justify-between gap-4">
//                 <div className="text-left">
//                   <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(3,63,153,0.25)] bg-[rgba(3,63,153,0.08)] text-blue-700 text-xs font-semibold">
//                     <ShieldCheck className="h-4 w-4" />
//                     Finance Workflow
//                   </div>
//                   <h1 className="mt-3 text-3xl font-semibold text-gray-900">
//                     Create New Lead
//                   </h1>
//                   <p className="mt-1 text-sm text-gray-500">
//                     Capture a revenue opportunity with a verified customer &
//                     primary contact.
//                   </p>
//                 </div>

//                 {/* Small finance-style KPI strip */}
//                 <div className="hidden lg:flex items-stretch gap-3">
//                   <div className="rounded-2xl border border-gray-200 bg-white shadow-sm px-4 py-3 min-w-[180px]">
//                     <div className="flex items-center gap-2 text-gray-600 text-xs font-semibold">
//                       <TrendingUp className="h-4 w-4" />
//                       Expected Value
//                     </div>
//                     <div className="mt-1 text-lg font-bold text-gray-900">
//                       {formatINR(dealValueNum)}
//                     </div>
//                   </div>
//                   <div className="rounded-2xl border border-gray-200 bg-white shadow-sm px-4 py-3 min-w-[180px]">
//                     <div className="flex items-center gap-2 text-gray-600 text-xs font-semibold">
//                       <Users className="h-4 w-4" />
//                       Customer
//                     </div>
//                     <div className="mt-1 text-sm font-bold text-gray-900 truncate max-w-[160px]">
//                       {selectedCustomer
//                         ? getCustomerName(selectedCustomer)
//                         : "—"}
//                     </div>
//                   </div>
//                   <div className="rounded-2xl border border-gray-200 bg-white shadow-sm px-4 py-3 min-w-[180px]">
//                     <div className="flex items-center gap-2 text-gray-600 text-xs font-semibold">
//                       <Sparkles className="h-4 w-4" />
//                       Status
//                     </div>
//                     <div className="mt-1 text-sm font-bold text-gray-900">
//                       {statusOptions.find(
//                         (s) => s.value === formData.lead_status,
//                       )?.label || "New"}
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* subtle divider */}
//               <div className="mt-6 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Content */}
//       <div className="mx-auto max-w-7xl px-10 py-10">
//         <form onSubmit={handleSubmit} className="space-y-8">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
//             {/* Basic Information */}
//             <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm h-full">
//               <div className="px-8 py-5 border-b border-gray-200">
//                 <div className="flex items-center gap-3">
//                   <Building2 className="h-5 w-5 text-gray-700" />
//                   <h2 className="text-lg font-semibold text-gray-900">
//                     Basic Information
//                   </h2>
//                 </div>
//                 <p className="mt-1 text-sm text-gray-500">
//                   Auto-generated Lead ID ensures audit-friendly tracking.
//                 </p>
//               </div>

//               <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* Lead ID + Lead Status */}
//                 <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
//                   {/* Lead ID (read-only, no buttons) */}
//                   <div className="md:col-span-1">
//                     <label className="block text-sm font-medium text-gray-900 mb-2">
//                       Lead ID
//                     </label>
//                     <input
//                       type="text"
//                       name="lead_id"
//                       value={formData.lead_id}
//                       readOnly
//                       className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                     />
//                     <p className="text-xs text-gray-500 mt-2">
//                       Generated internally • Prefix{" "}
//                       <span className="font-medium">REV-LEAD-</span>
//                     </p>
//                   </div>

//                   {/* Lead Status */}
//                   <div className="md:col-span-1">
//                     <label className="block text-sm font-medium text-gray-900 mb-2">
//                       Lead Status
//                     </label>
//                     <select
//                       name="lead_status"
//                       value={formData.lead_status}
//                       onChange={(e) =>
//                         setFormData((p) => ({
//                           ...p,
//                           lead_status: e.target.value,
//                         }))
//                       }
//                       className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                     >
//                       {statusOptions.map((o) => (
//                         <option key={o.value} value={o.value}>
//                           {o.label}
//                         </option>
//                       ))}
//                     </select>
//                     <p className="text-xs text-gray-500 mt-2">
//                       Used for pipeline reporting & forecast.
//                     </p>
//                   </div>
//                 </div>

//                 {/* ✅ Lead Name optional */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-900 mb-2">
//                     Lead Name <span className="text-gray-400">(optional)</span>
//                   </label>
//                   <input
//                     type="text"
//                     name="lead_name"
//                     value={formData.lead_name}
//                     onChange={handleBasicChange}
//                     className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                     placeholder="e.g., Q2 Renewal - ABC"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-900 mb-2">
//                     Company Name <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     name="company_name"
//                     value={formData.company_name}
//                     onChange={handleBasicChange}
//                     required
//                     className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                     placeholder="Registered/Trading name"
//                   />
//                 </div>

//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-gray-900 mb-2">
//                     Website <span className="text-gray-400">(optional)</span>
//                   </label>
//                   <input
//                     type="url"
//                     name="website"
//                     value={formData.website}
//                     onChange={handleBasicChange}
//                     className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                     placeholder="https://"
//                   />
//                 </div>

//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-gray-900 mb-2">
//                     Description{" "}
//                     <span className="text-gray-400">(optional)</span>
//                   </label>
//                   <textarea
//                     name="description"
//                     value={formData.description}
//                     onChange={handleBasicChange}
//                     rows={4}
//                     className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                     placeholder="Add context for finance review / underwriting / deal notes…"
//                   />
//                 </div>

//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-gray-900 mb-2">
//                     Expected Deal Value (₹){" "}
//                     <span className="text-gray-400">(optional)</span>
//                   </label>
//                   <div className="relative">
//                     <BadgeDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                     <input
//                       type="number"
//                       name="expected_deal_value"
//                       value={formData.expected_deal_value}
//                       onChange={handleBasicChange}
//                       min="0"
//                       className="w-full h-11 pl-11 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                       placeholder="0"
//                     />
//                     {dealValueNum > 0 && (
//                       <div className="mt-2 text-xs text-gray-600">
//                         Preview:{" "}
//                         <span className="font-semibold text-gray-900">
//                           {formatINR(dealValueNum)}
//                         </span>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Right column */}
//             <div className="flex flex-col gap-8 h-full">
//               {/* ✅ Customer Selector (NO search) */}
//               <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col">
//                 <div className="px-8 py-5 border-b border-gray-200">
//                   <div className="flex items-center gap-3">
//                     <Users className="h-5 w-5 text-gray-700" />
//                     <h2 className="text-lg font-semibold text-gray-900">
//                       Customer
//                     </h2>
//                   </div>
//                   <p className="mt-1 text-sm text-gray-500">
//                     Select an existing customer. If not available, create a new
//                     customer.
//                   </p>
//                 </div>

//                 <div className="px-8 py-6">
//                   <label className="block text-sm font-medium text-gray-900 mb-2">
//                     Customer <span className="text-red-500">*</span>
//                   </label>

//                   <div className="flex flex-col md:flex-row gap-3">
//                     <select
//                       value={selectedCustomer?.customer_id || ""}
//                       onChange={(e) => {
//                         const id = e.target.value;
//                         const found = customers.find(
//                           (c) => String(c.customer_id) === String(id),
//                         );
//                         setSelectedCustomer(found || null);
//                       }}
//                       className="w-full md:flex-1 h-11 px-4 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                     >
//                       <option value="" disabled>
//                         Select a customer…
//                       </option>
//                       {customers.map((c) => (
//                         <option key={c.customer_id} value={c.customer_id}>
//                           {getCustomerName(c)} — {c.customer_id}
//                         </option>
//                       ))}
//                     </select>

//                     <button
//                       type="button"
//                       onClick={() => setShowCreateCustomer(true)}
//                       className="h-11 px-4 rounded-lg bg-[#3A4E63] text-white font-semibold hover:bg-[#022d6e] transition inline-flex items-center justify-center gap-2"
//                     >
//                       <Plus className="h-4 w-4" />
//                       New
//                     </button>
//                   </div>

//                   {selectedCustomer && (
//                     <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 flex items-start justify-between gap-3">
//                       <div>
//                         <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
//                           <CheckCircle2 className="h-4 w-4 text-green-600" />
//                           {getCustomerName(selectedCustomer)}
//                         </p>
//                         <p className="text-xs text-gray-600 mt-1">
//                           {selectedCustomer.customer_id}
//                           {selectedCustomer.email
//                             ? ` • ${selectedCustomer.email}`
//                             : ""}
//                         </p>
//                       </div>
//                       <span
//                         className={`shrink-0 text-xs font-semibold px-2 py-1 rounded-full ${
//                           normalize(selectedCustomer.status) === "active"
//                             ? "bg-green-100 text-green-700"
//                             : "bg-gray-100 text-gray-700"
//                         }`}
//                       >
//                         {selectedCustomer.status || "unknown"}
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Contacts (single primary only) */}
//               <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col flex-1">
//                 <div className="px-8 py-5 border-b border-gray-200">
//                   <div className="flex items-center gap-3">
//                     <User className="h-5 w-5 text-gray-700" />
//                     <h2 className="text-lg font-semibold text-gray-900">
//                       Contacts
//                     </h2>
//                   </div>
//                   <p className="mt-1 text-sm text-gray-500">
//                     Finance communications will use the primary contact details.
//                   </p>
//                 </div>

//                 <div className="px-8 py-8 flex-1 flex flex-col">
//                   <div className="rounded-xl border border-gray-200 p-4 bg-white">
//                     <p className="text-sm font-semibold text-gray-900 mb-4">
//                       Primary Contact{" "}
//                       <span className="ml-2 inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
//                         Required
//                       </span>
//                     </p>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-900 mb-2">
//                           Full Name <span className="text-red-500">*</span>
//                         </label>
//                         <input
//                           type="text"
//                           value={formData.contacts[0].full_name}
//                           onChange={(e) =>
//                             handleContactChange(0, "full_name", e.target.value)
//                           }
//                           className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                         />
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-900 mb-2">
//                           Role <span className="text-gray-400">(optional)</span>
//                         </label>
//                         <input
//                           type="text"
//                           value={formData.contacts[0].role}
//                           onChange={(e) =>
//                             handleContactChange(0, "role", e.target.value)
//                           }
//                           className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                         />
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-900 mb-2">
//                           Email <span className="text-red-500">*</span>
//                         </label>
//                         <input
//                           type="email"
//                           value={formData.contacts[0].email}
//                           onChange={(e) =>
//                             handleContactChange(0, "email", e.target.value)
//                           }
//                           className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                         />
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-900 mb-2">
//                           Phone{" "}
//                           <span className="text-gray-400">(optional)</span>
//                         </label>
//                         <input
//                           type="tel"
//                           value={formData.contacts[0].phone}
//                           onChange={(e) =>
//                             handleContactChange(0, "phone", e.target.value)
//                           }
//                           className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   {!selectedCustomer?.customer_id && (
//                     <div className="mt-auto pt-4">
//                       <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-900 flex items-start gap-3">
//                         <AlertTriangle className="h-5 w-5 text-yellow-700 mt-0.5" />
//                         <div>
//                           Select a customer first. Lead creation requires a
//                           customer.
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Address + Business Profile (below) */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//             <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//               <div className="px-8 py-5 border-b border-gray-200 flex items-center gap-3">
//                 <MapPin className="h-5 w-5 text-gray-700" />
//                 <h2 className="text-lg font-semibold text-gray-900">Address</h2>
//               </div>

//               <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <input
//                   name="country"
//                   value={formData.address.country}
//                   onChange={handleAddressChange}
//                   placeholder="Country"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                 />
//                 <input
//                   name="state"
//                   value={formData.address.state}
//                   onChange={handleAddressChange}
//                   placeholder="State/Province"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                 />
//                 <input
//                   name="street"
//                   value={formData.address.street}
//                   onChange={handleAddressChange}
//                   placeholder="Street"
//                   className="md:col-span-2 w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                 />
//                 <input
//                   name="city"
//                   value={formData.address.city}
//                   onChange={handleAddressChange}
//                   placeholder="City"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                 />
//                 <input
//                   name="postal_code"
//                   value={formData.address.postal_code}
//                   onChange={handleAddressChange}
//                   placeholder="Zip/Postal Code"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                 />
//               </div>
//             </div>

//             <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//               <div className="px-8 py-5 border-b border-gray-200 flex items-center gap-3">
//                 <Briefcase className="h-5 w-5 text-gray-700" />
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   Business Profile
//                 </h2>
//               </div>

//               <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <input
//                   name="industry"
//                   value={formData.business.industry}
//                   onChange={handleBusinessChange}
//                   placeholder="Industry"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                 />
//                 <input
//                   name="employees"
//                   value={formData.business.employees}
//                   onChange={handleBusinessChange}
//                   placeholder="Employees"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                 />
//                 <input
//                   name="annual_revenue"
//                   value={formData.business.annual_revenue}
//                   onChange={handleBusinessChange}
//                   placeholder="Annual revenue"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                 />
//                 <select
//                   name="lead_source"
//                   value={formData.business.lead_source}
//                   onChange={handleBusinessChange}
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                 >
//                   <option value="inbound">Inbound</option>
//                   <option value="outbound">Outbound</option>
//                   <option value="linkedin">LinkedIn</option>
//                   <option value="referral">Referral</option>
//                   <option value="website">Website</option>
//                   <option value="trade_show">Trade Show</option>
//                   <option value="partner">Partner</option>
//                   <option value="other">Other</option>
//                 </select>

//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-gray-900 mb-2">
//                     Assigned To (Owner) <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     name="assigned_to"
//                     value={formData.business.assigned_to}
//                     onChange={handleBusinessChange}
//                     placeholder="Assigned to"
//                     className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                   />
//                   <p className="text-xs text-gray-500 mt-2">
//                     Owner is required for approvals & audit trail.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Actions */}
//           <div className="flex items-center justify-end gap-4">
//             <button
//               type="button"
//               onClick={() => navigate("/commerce/revenue-workflow/leads")}
//               className="h-11 px-6 rounded-lg border border-gray-300 bg-white text-gray-800 font-medium hover:bg-gray-50 transition"
//             >
//               <X className="h-4 w-4 inline mr-2" />
//               Cancel
//             </button>

//             <button
//               type="submit"
//               disabled={loading || !selectedCustomer?.customer_id}
//               className="h-11 px-7 rounded-lg bg-[#3A4E63] text-white font-semibold hover:bg-[#022d6e] transition disabled:opacity-50"
//               title={!isReadyForSubmit ? "Fill required fields to enable" : ""}
//             >
//               <Save className="h-4 w-4 inline mr-2" />
//               {loading ? "Creating..." : "Create Lead"}
//             </button>
//           </div>
//         </form>
//       </div>

//       {/* ✅ CustomersCreate Overlay Modal */}
//       {showCreateCustomer && (
//         <div className="fixed inset-0 z-[10000] flex items-center justify-center">
//           <div
//             className="absolute inset-0 bg-black/35"
//             onClick={() => setShowCreateCustomer(false)}
//           />
//           <div className="relative w-[95%] max-w-6xl max-h-[92vh] overflow-auto rounded-2xl">
//             <CustomersCreate
//               isModal
//               onClose={() => setShowCreateCustomer(false)}
//               onCreated={(createdCustomer) => {
//                 setShowCreateCustomer(false);
//                 handleCustomerCreatedInModal(createdCustomer);
//               }}
//             />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default RevenueLeadCreate;

// import React, { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   ArrowLeft,
//   Save,
//   X,
//   Building2,
//   User,
//   MapPin,
//   Briefcase,
//   BadgeDollarSign,
//   TrendingUp,
//   ShieldCheck,
//   Sparkles,
//   UserCircle2,
//   Copy,
//   Plus,
//   Trash2,
//   Crown,
// } from "lucide-react";
// import { toast } from "sonner";

// const API_URL = process.env.REACT_APP_BACKEND_URL;

// // -------- helpers --------
// const pad2 = (n) => String(n).padStart(2, "0");

// // REV-LEAD-YYYYMMDDHHmmss
// const generateLeadId = () => {
//   const d = new Date();
//   const y = d.getFullYear();
//   const mo = pad2(d.getMonth() + 1);
//   const da = pad2(d.getDate());
//   const hh = pad2(d.getHours());
//   const mm = pad2(d.getMinutes());
//   const ss = pad2(d.getSeconds());
//   return `REV-LEAD-${y}${mo}${da}${hh}${mm}${ss}`;
// };

// const toNum = (v) => {
//   const n = Number(String(v ?? "").replace(/[^\d.]/g, ""));
//   return Number.isFinite(n) ? n : 0;
// };

// const formatINR = (num) => {
//   const n = Number(num);
//   if (!Number.isFinite(n) || n <= 0) return "₹0";
//   try {
//     return new Intl.NumberFormat("en-IN", {
//       style: "currency",
//       currency: "INR",
//       maximumFractionDigits: 0,
//     }).format(n);
//   } catch {
//     return `₹${Math.round(n)}`;
//   }
// };

// // tries to infer a "current user" label from localStorage safely
// const getCurrentUserLabel = () => {
//   const candidates = [
//     "user",
//     "current_user",
//     "profile",
//     "me",
//     "auth_user",
//     "account",
//   ];
//   for (const key of candidates) {
//     const raw = localStorage.getItem(key);
//     if (!raw) continue;
//     try {
//       const obj = JSON.parse(raw);
//       const label =
//         obj?.name ||
//         obj?.full_name ||
//         obj?.username ||
//         obj?.email ||
//         obj?.display_name;
//       if (label) return label;
//     } catch {
//       if (raw.includes("@") || raw.length >= 3) return raw;
//     }
//   }
//   return "Current User";
// };

// const emptyContact = (isPrimary = false) => ({
//   full_name: "",
//   email: "",
//   phone: "",
//   role: "",
//   is_primary: isPrimary,
// });

// const RevenueLeadCreate = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);

//   // Current user banner
//   const [currentUserLabel, setCurrentUserLabel] = useState("Current User");

//   // Lead form
//   const [formData, setFormData] = useState({
//     lead_id: "",
//     lead_name: "", // optional
//     company_name: "",
//     website: "",
//     description: "",
//     expected_deal_value: "",
//     lead_status: "new",

//     // ✅ multi contacts
//     contacts: [emptyContact(true)],

//     address: { country: "", street: "", city: "", state: "", postal_code: "" },

//     business: {
//       industry: "",
//       employees: "",
//       annual_revenue: "",
//       lead_source: "inbound",
//       assigned_to: "",
//     },
//   });

//   // init lead id and user label
//   useEffect(() => {
//     setFormData((prev) => ({
//       ...prev,
//       lead_id: prev.lead_id || generateLeadId(),
//     }));
//     setCurrentUserLabel(getCurrentUserLabel());
//   }, []);

//   const statusOptions = useMemo(
//     () => [
//       { value: "imported", label: "Imported" },
//       { value: "new", label: "New" },
//       { value: "contacted", label: "Contacted" },
//       { value: "qualified", label: "Qualified" },
//       { value: "proposal_sent", label: "Proposal Sent" },
//       { value: "won", label: "Won" },
//       { value: "lost", label: "Lost" },
//     ],
//     [],
//   );

//   const dealValueNum = useMemo(
//     () => toNum(formData.expected_deal_value),
//     [formData.expected_deal_value],
//   );

//   // handlers
//   const handleBasicChange = (e) => {
//     const { name, value } = e.target;
//     if (name === "lead_id") return;
//     setFormData((p) => ({ ...p, [name]: value }));
//   };

//   const handleAddressChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((p) => ({
//       ...p,
//       address: { ...p.address, [name]: value },
//     }));
//   };

//   const handleBusinessChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((p) => ({
//       ...p,
//       business: { ...p.business, [name]: value },
//     }));
//   };

//   const handleContactChange = (index, field, value) => {
//     setFormData((p) => {
//       const next = [...p.contacts];
//       next[index] = { ...next[index], [field]: value };
//       return { ...p, contacts: next };
//     });
//   };

//   const setPrimaryContact = (index) => {
//     setFormData((p) => {
//       const next = p.contacts.map((c, i) => ({
//         ...c,
//         is_primary: i === index,
//       }));
//       return { ...p, contacts: next };
//     });
//   };

//   const addContact = () => {
//     setFormData((p) => ({
//       ...p,
//       contacts: [...p.contacts, emptyContact(false)],
//     }));
//   };

//   const removeContact = (index) => {
//     setFormData((p) => {
//       const next = [...p.contacts];
//       const wasPrimary = !!next[index]?.is_primary;
//       next.splice(index, 1);

//       // keep at least 1 contact
//       if (next.length === 0) next.push(emptyContact(true));

//       // if removed primary, make first one primary
//       if (wasPrimary) {
//         next[0] = { ...next[0], is_primary: true };
//         for (let i = 1; i < next.length; i++) {
//           next[i] = { ...next[i], is_primary: false };
//         }
//       }

//       // also ensure exactly one primary
//       const primaryCount = next.filter((c) => c.is_primary).length;
//       if (primaryCount === 0) next[0] = { ...next[0], is_primary: true };
//       if (primaryCount > 1) {
//         let found = false;
//         for (let i = 0; i < next.length; i++) {
//           if (next[i].is_primary) {
//             if (!found) found = true;
//             else next[i] = { ...next[i], is_primary: false };
//           }
//         }
//       }

//       return { ...p, contacts: next };
//     });
//   };

//   const validate = () => {
//     const company = String(formData.company_name || "").trim();
//     const assignedTo = String(formData.business.assigned_to || "").trim();
//     if (!company) return "Company Name is required";
//     if (!assignedTo) return "Assigned To (Owner) is required";

//     const id = String(formData.lead_id || "").trim();
//     if (!id.startsWith("REV-LEAD-")) return "Lead ID must start with REV-LEAD-";

//     const primary =
//       formData.contacts.find((c) => c.is_primary) || formData.contacts[0];
//     if (!primary) return "At least one contact is required";
//     if (!String(primary.full_name || "").trim())
//       return "Primary contact full name is required";
//     if (!String(primary.email || "").trim())
//       return "Primary contact email is required";

//     return null;
//   };

//   const handleCopyLeadId = async () => {
//     try {
//       await navigator.clipboard.writeText(String(formData.lead_id || ""));
//       toast.success("Lead ID copied");
//     } catch {
//       toast.error("Unable to copy");
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const err = validate();
//     if (err) return toast.error(err);

//     setLoading(true);
//     try {
//       const token = localStorage.getItem("access_token");
//       if (!token) return toast.error("No token found. Please login again.");

//       const primary =
//         formData.contacts.find((c) => c.is_primary) || formData.contacts[0];

//       const contactsPayload = (formData.contacts || [])
//         .map((c) => ({
//           full_name: String(c.full_name || "").trim(),
//           email: String(c.email || "").trim(),
//           phone: String(c.phone || "").trim(),
//           role: String(c.role || "").trim(),
//           is_primary: !!c.is_primary,
//         }))
//         // avoid sending totally empty rows
//         .filter(
//           (c) => c.full_name || c.email || c.phone || c.role || c.is_primary,
//         );

//       // ensure at least primary contact is present in payload
//       if (contactsPayload.length === 0) {
//         contactsPayload.push({
//           full_name: String(primary?.full_name || "").trim(),
//           email: String(primary?.email || "").trim(),
//           phone: String(primary?.phone || "").trim(),
//           role: String(primary?.role || "").trim(),
//           is_primary: true,
//         });
//       }

//       const payload = {
//         // customer = current user
//         customer_id: null,
//         customer_name: currentUserLabel,

//         lead_id: String(formData.lead_id || "").trim(),
//         lead_name: String(formData.lead_name || "").trim(), // optional
//         company_name: String(formData.company_name || "").trim(),
//         website: String(formData.website || "").trim(),
//         description: String(formData.description || "").trim(),
//         deal_value: toNum(formData.expected_deal_value),
//         expected_deal_value: toNum(formData.expected_deal_value),
//         stage: formData.lead_status,
//         lead_status: formData.lead_status,
//         status: formData.lead_status,

//         contacts: contactsPayload,

//         address: {
//           country: String(formData.address.country || "").trim(),
//           street: String(formData.address.street || "").trim(),
//           city: String(formData.address.city || "").trim(),
//           state: String(formData.address.state || "").trim(),
//           postal_code: String(formData.address.postal_code || "").trim(),
//         },

//         business_profile: {
//           industry: String(formData.business.industry || "").trim(),
//           employees: String(formData.business.employees || "").trim(),
//           annual_revenue: String(formData.business.annual_revenue || "").trim(),
//           lead_source: String(formData.business.lead_source || "").trim(),
//           assigned_to: String(formData.business.assigned_to || "").trim(),
//         },

//         // compatibility (uses primary)
//         contact_name: String(primary?.full_name || "").trim(),
//         contact_email: String(primary?.email || "").trim(),
//         contact_phone: String(primary?.phone || "").trim(),
//         country: String(formData.address.country || "").trim(),
//         industry: String(formData.business.industry || "").trim(),
//         lead_source: String(formData.business.lead_source || "").trim(),
//       };

//       const res = await fetch(
//         `${API_URL}/api/commerce/workflow/revenue/leads`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify(payload),
//         },
//       );

//       const data = await res.json();

//       if (res.ok && data?.success) {
//         toast.success("Lead created successfully");
//         window.dispatchEvent(new Event("revenueLeadChanged"));
//         navigate("/commerce/revenue-workflow/leads");
//       } else {
//         const msg =
//           data?.detail?.message ||
//           data?.detail ||
//           data?.message ||
//           `Failed to create lead (${res.status})`;
//         toast.error(typeof msg === "string" ? msg : "Failed to create lead");
//       }
//     } catch (error) {
//       console.error(error);
//       toast.error("Error creating lead");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div
//       className="min-h-screen bg-[#f4f6f8]"
//       data-testid="revenue-lead-create"
//     >
//       {/* Finance header */}
//       <div className="bg-white border-b border-gray-200">
//         <div className="px-10 py-7">
//           <div className="flex items-start gap-4">
//             <button
//               type="button"
//               onClick={() => navigate("/commerce/revenue-workflow/leads")}
//               className="mt-1 p-2 rounded-xl hover:bg-gray-100 text-gray-700 transition"
//               title="Back"
//             >
//               <ArrowLeft className="h-5 w-5" />
//             </button>

//             <div className="flex-1">
//               <div className="flex flex-col gap-4">
//                 <div className="flex items-start justify-between gap-6">
//                   <div>
//                     <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(3,63,153,0.25)] bg-[rgba(3,63,153,0.08)] text-blue-700 text-xs font-semibold">
//                       <ShieldCheck className="h-4 w-4" />
//                       Finance Revenue Workflow
//                     </div>
//                     <h1 className="mt-3 text-3xl font-semibold text-gray-900">
//                       Create New Lead
//                     </h1>
//                     <p className="mt-1 text-sm text-gray-500">
//                       Track opportunities with clean IDs, owners and contacts.
//                     </p>
//                   </div>

//                   {/* KPI */}
//                   <div className="hidden lg:flex items-stretch gap-3">
//                     <div className="rounded-2xl border border-gray-200 bg-white shadow-sm px-4 py-3 min-w-[190px]">
//                       <div className="flex items-center gap-2 text-gray-600 text-xs font-semibold">
//                         <TrendingUp className="h-4 w-4" />
//                         Expected Value
//                       </div>
//                       <div className="mt-1 text-lg font-bold text-gray-900">
//                         {formatINR(dealValueNum)}
//                       </div>
//                     </div>
//                     <div className="rounded-2xl border border-gray-200 bg-white shadow-sm px-4 py-3 min-w-[190px]">
//                       <div className="flex items-center gap-2 text-gray-600 text-xs font-semibold">
//                         <Sparkles className="h-4 w-4" />
//                         Status
//                       </div>
//                       <div className="mt-1 text-sm font-bold text-gray-900">
//                         {statusOptions.find(
//                           (s) => s.value === formData.lead_status,
//                         )?.label || "New"}
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Current user (customer) banner */}
//                 {/* <div className="rounded-2xl border border-gray-200 bg-gradient-to-r from-white to-blue-50 p-4 flex items-center justify-between gap-4">
//                   <div className="flex items-center gap-3 min-w-0">
//                     <div className="h-10 w-10 rounded-2xl text-blue-700/10 flex items-center justify-center">
//                       <UserCircle2 className="h-5 w-5 text-blue-700" />
//                     </div>
//                     <div className="min-w-0">
//                       <p className="text-xs font-semibold text-gray-600">
//                         Customer (Current User)
//                       </p>
//                       <p className="text-sm font-bold text-gray-900 truncate">
//                         {currentUserLabel}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="text-xs font-semibold text-gray-600">
//                     Auto-linked for audit trail
//                   </div>
//                 </div> */}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Content */}
//       <div className="mx-auto max-w-7xl px-10 py-10">
//         <form onSubmit={handleSubmit} className="space-y-8">
//           {/* Top two cards */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
//             {/* Basic Information */}
//             <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm h-full">
//               <div className="px-8 py-5 border-b border-gray-200">
//                 <div className="flex items-center gap-3">
//                   <Building2 className="h-5 w-5 text-gray-700" />
//                   <h2 className="text-lg font-semibold text-gray-900">
//                     Basic Information
//                   </h2>
//                 </div>
//                 <p className="mt-1 text-sm text-gray-500">
//                   Lead ID is generated internally and is immutable.
//                 </p>
//               </div>

//               <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* Lead ID - full visible + copy */}
//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-gray-900 mb-2">
//                     Lead ID
//                   </label>

//                   <div className="flex gap-2">
//                     <input
//                       type="text"
//                       name="lead_id"
//                       value={formData.lead_id}
//                       readOnly
//                       title={formData.lead_id}
//                       className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 font-semibold tracking-wide focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                       style={{ fontVariantLigatures: "none" }}
//                     />
//                     <button
//                       type="button"
//                       onClick={async () => {
//                         try {
//                           await navigator.clipboard.writeText(
//                             String(formData.lead_id || ""),
//                           );
//                           toast.success("Lead ID copied");
//                         } catch {
//                           toast.error("Unable to copy");
//                         }
//                       }}
//                       className="h-11 px-4 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 font-semibold inline-flex items-center gap-2"
//                       title="Copy Lead ID"
//                     >
//                       <Copy className="h-4 w-4" />
//                       Copy
//                     </button>
//                   </div>
//                 </div>

//                 {/* Lead Status */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-900 mb-2">
//                     Lead Status
//                   </label>
//                   <select
//                     name="lead_status"
//                     value={formData.lead_status}
//                     onChange={(e) =>
//                       setFormData((p) => ({
//                         ...p,
//                         lead_status: e.target.value,
//                       }))
//                     }
//                     className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                   >
//                     {statusOptions.map((o) => (
//                       <option key={o.value} value={o.value}>
//                         {o.label}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Lead Name optional */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-900 mb-2">
//                     Lead Name <span className="text-gray-400">(optional)</span>
//                   </label>
//                   <input
//                     type="text"
//                     name="lead_name"
//                     value={formData.lead_name}
//                     onChange={handleBasicChange}
//                     className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                     placeholder="e.g., Q2 Renewal - ABC"
//                   />
//                 </div>

//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-gray-900 mb-2">
//                     Company Name <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     name="company_name"
//                     value={formData.company_name}
//                     onChange={handleBasicChange}
//                     required
//                     className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                     placeholder="Registered/Trading name"
//                   />
//                 </div>

//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-gray-900 mb-2">
//                     Website <span className="text-gray-400">(optional)</span>
//                   </label>
//                   <input
//                     type="url"
//                     name="website"
//                     value={formData.website}
//                     onChange={handleBasicChange}
//                     className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                     placeholder="https://"
//                   />
//                 </div>

//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-gray-900 mb-2">
//                     Description{" "}
//                     <span className="text-gray-400">(optional)</span>
//                   </label>
//                   <textarea
//                     name="description"
//                     value={formData.description}
//                     onChange={handleBasicChange}
//                     rows={4}
//                     className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                     placeholder="Notes for finance review / underwriting / deal details…"
//                   />
//                 </div>

//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-gray-900 mb-2">
//                     Expected Deal Value (₹){" "}
//                     <span className="text-gray-400">(optional)</span>
//                   </label>
//                   <div className="relative">
//                     <BadgeDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                     <input
//                       type="number"
//                       name="expected_deal_value"
//                       value={formData.expected_deal_value}
//                       onChange={handleBasicChange}
//                       min="0"
//                       className="w-full h-11 pl-11 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                       placeholder="0"
//                     />
//                   </div>

//                   {dealValueNum > 0 && (
//                     <div className="mt-2 text-xs text-gray-600">
//                       Preview:{" "}
//                       <span className="font-semibold text-gray-900">
//                         {formatINR(dealValueNum)}
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* ✅ Contacts (multiple) */}
//             {/* <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col h-full">
//               <div className="px-8 py-5 border-b border-gray-200 flex items-center justify-between gap-4">
//                 <div>
//                   <div className="flex items-center gap-3">
//                     <User className="h-5 w-5 text-gray-700" />
//                     <h2 className="text-lg font-semibold text-gray-900">
//                       Contacts
//                     </h2>
//                   </div>
//                   <p className="mt-1 text-sm text-gray-500">
//                     Add multiple contacts and mark one as Primary.
//                   </p>
//                 </div>

//                 <button
//                   type="button"
//                   onClick={addContact}
//                   className="h-10 px-4 rounded-lg bg-[#3A4E63] text-white font-semibold hover:bg-[#022d6e] transition inline-flex items-center gap-2"
//                 >
//                   <Plus className="h-4 w-4" />
//                   Add Contact
//                 </button>
//               </div>

//               <div className="px-8 py-8 flex-1 flex flex-col gap-5">
//                 {formData.contacts.map((c, idx) => {
//                   const isPrimary = !!c.is_primary;
//                   return (
//                     <div
//                       key={idx}
//                       className={`rounded-2xl border overflow-hidden ${
//                         isPrimary
//                           ? "border-[rgba(3,63,153,0.25)] bg-[rgba(3,63,153,0.08)]/40"
//                           : "border-gray-200 bg-white"
//                       }`}
//                     >
//                       <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between gap-3">
//                         <div className="flex items-center gap-2">
//                           {isPrimary ? (
//                             <span className="inline-flex items-center gap-2 text-xs font-bold text-blue-700">
//                               <Crown className="h-4 w-4" />
//                               Primary Contact
//                             </span>
//                           ) : (
//                             <span className="text-xs font-semibold text-gray-600">
//                               Contact {idx + 1}
//                             </span>
//                           )}
//                         </div>

//                         <div className="flex items-center gap-2">
//                           {!isPrimary && (
//                             <button
//                               type="button"
//                               onClick={() => setPrimaryContact(idx)}
//                               className="h-9 px-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 text-xs font-semibold"
//                             >
//                               Make Primary
//                             </button>
//                           )}

//                           <button
//                             type="button"
//                             onClick={() => removeContact(idx)}
//                             className="h-9 px-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 text-xs font-semibold inline-flex items-center gap-2"
//                             title="Remove contact"
//                           >
//                             <Trash2 className="h-4 w-4" />
//                             Remove
//                           </button>
//                         </div>
//                       </div>

//                       <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                           <label className="block text-sm font-medium text-gray-900 mb-2">
//                             Full Name{" "}
//                             {isPrimary && (
//                               <span className="text-red-500">*</span>
//                             )}
//                           </label>
//                           <input
//                             type="text"
//                             value={c.full_name}
//                             onChange={(e) =>
//                               handleContactChange(
//                                 idx,
//                                 "full_name",
//                                 e.target.value,
//                               )
//                             }
//                             className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                           />
//                         </div>

//                         <div>
//                           <label className="block text-sm font-medium text-gray-900 mb-2">
//                             Role{" "}
//                             <span className="text-gray-400">(optional)</span>
//                           </label>
//                           <input
//                             type="text"
//                             value={c.role}
//                             onChange={(e) =>
//                               handleContactChange(idx, "role", e.target.value)
//                             }
//                             className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                           />
//                         </div>

//                         <div>
//                           <label className="block text-sm font-medium text-gray-900 mb-2">
//                             Email{" "}
//                             {isPrimary && (
//                               <span className="text-red-500">*</span>
//                             )}
//                           </label>
//                           <input
//                             type="email"
//                             value={c.email}
//                             onChange={(e) =>
//                               handleContactChange(idx, "email", e.target.value)
//                             }
//                             className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                           />
//                         </div>

//                         <div>
//                           <label className="block text-sm font-medium text-gray-900 mb-2">
//                             Phone{" "}
//                             <span className="text-gray-400">(optional)</span>
//                           </label>
//                           <input
//                             type="tel"
//                             value={c.phone}
//                             onChange={(e) =>
//                               handleContactChange(idx, "phone", e.target.value)
//                             }
//                             className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}

//                 <div className="rounded-xl border border-[rgba(3,63,153,0.25)] bg-[rgba(3,63,153,0.08)] p-4 text-sm text-blue-900 flex items-start gap-3">
//                   <ShieldCheck className="h-5 w-5 text-blue-700 mt-0.5" />
//                   <div>
//                     Only the <span className="font-semibold">Primary</span>{" "}
//                     contact is mandatory. Others are optional but useful for
//                     finance comms.
//                   </div>
//                 </div>
//               </div>
//             </div> */}

//             {/* Contacts (multiple) */}
//             <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col h-full">
//               {/* Header */}
//               <div className="px-8 py-5 border-b border-gray-200 flex items-start justify-between gap-4">
//                 <div>
//                   <div className="flex items-center gap-3">
//                     <User className="h-5 w-5 text-gray-700" />
//                     <h2 className="text-lg font-semibold text-gray-900">
//                       Contacts
//                     </h2>
//                   </div>
//                   <p className="mt-1 text-sm text-gray-500">
//                     Add multiple contacts and mark one as Primary.
//                   </p>
//                 </div>

//                 <button
//                   type="button"
//                   onClick={addContact}
//                   className="h-11 px-5 rounded-xl bg-[#3A4E63] text-white font-semibold hover:bg-[#022d6e] transition inline-flex items-center gap-2 shadow-sm"
//                 >
//                   <Plus className="h-4 w-4" />
//                   Add Contact
//                 </button>
//               </div>

//               {/* Body */}
//               <div className="px-8 py-8 flex-1 flex flex-col gap-6">
//                 {formData.contacts.map((c, idx) => {
//                   const isPrimary = !!c.is_primary;

//                   return (
//                     <div
//                       key={idx}
//                       className={`rounded-2xl border overflow-hidden ${
//                         isPrimary
//                           ? "border-[rgba(3,63,153,0.25)] bg-[rgba(3,63,153,0.08)]/30"
//                           : "border-gray-200 bg-white"
//                       }`}
//                     >
//                       {/* Card header row */}
//                       <div
//                         className={`px-6 py-4 flex items-center justify-between gap-4 ${
//                           isPrimary
//                             ? "border-b border-[rgba(3,63,153,0.25)]/70"
//                             : "border-b border-gray-200"
//                         }`}
//                       >
//                         <div className="flex items-center gap-2">
//                           {isPrimary ? (
//                             <span className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
//                               <Crown className="h-4 w-4" />
//                               Primary Contact
//                             </span>
//                           ) : (
//                             <span className="text-sm font-semibold text-gray-700">
//                               Contact {idx + 1}
//                             </span>
//                           )}
//                         </div>

//                         <div className="flex items-center gap-3">
//                           {!isPrimary && (
//                             <button
//                               type="button"
//                               onClick={() => setPrimaryContact(idx)}
//                               className="h-10 px-4 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-900 text-sm font-semibold transition"
//                             >
//                               Make Primary
//                             </button>
//                           )}

//                           <button
//                             type="button"
//                             onClick={() => removeContact(idx)}
//                             className="h-10 px-4 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-900 text-sm font-semibold transition inline-flex items-center gap-2"
//                           >
//                             <Trash2 className="h-4 w-4" />
//                             Remove
//                           </button>
//                         </div>
//                       </div>

//                       {/* Fields */}
//                       <div className="px-6 py-6">
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
//                           {/* Full Name */}
//                           <div>
//                             <label className="block text-sm font-semibold text-gray-900 mb-2">
//                               Full Name{" "}
//                               {isPrimary ? (
//                                 <span className="text-red-500">*</span>
//                               ) : null}
//                             </label>
//                             <input
//                               type="text"
//                               value={c.full_name}
//                               onChange={(e) =>
//                                 handleContactChange(
//                                   idx,
//                                   "full_name",
//                                   e.target.value,
//                                 )
//                               }
//                               className="w-full h-11 px-4 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                             />
//                           </div>

//                           {/* Role */}
//                           <div>
//                             <label className="block text-sm font-semibold text-gray-900 mb-2">
//                               Role{" "}
//                               <span className="text-gray-400 font-medium">
//                                 (optional)
//                               </span>
//                             </label>
//                             <input
//                               type="text"
//                               value={c.role}
//                               onChange={(e) =>
//                                 handleContactChange(idx, "role", e.target.value)
//                               }
//                               className="w-full h-11 px-4 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                             />
//                           </div>

//                           {/* Email */}
//                           <div>
//                             <label className="block text-sm font-semibold text-gray-900 mb-2">
//                               Email{" "}
//                               {isPrimary ? (
//                                 <span className="text-red-500">*</span>
//                               ) : null}
//                             </label>
//                             <input
//                               type="email"
//                               value={c.email}
//                               onChange={(e) =>
//                                 handleContactChange(
//                                   idx,
//                                   "email",
//                                   e.target.value,
//                                 )
//                               }
//                               className="w-full h-11 px-4 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                             />
//                           </div>

//                           {/* Phone */}
//                           <div>
//                             <label className="block text-sm font-semibold text-gray-900 mb-2">
//                               Phone{" "}
//                               <span className="text-gray-400 font-medium">
//                                 (optional)
//                               </span>
//                             </label>
//                             <input
//                               type="tel"
//                               value={c.phone}
//                               onChange={(e) =>
//                                 handleContactChange(
//                                   idx,
//                                   "phone",
//                                   e.target.value,
//                                 )
//                               }
//                               className="w-full h-11 px-4 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                             />
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}

//                 {/* Footer note */}
//                 <div className="rounded-2xl border border-[rgba(3,63,153,0.25)] bg-[rgba(3,63,153,0.08)] px-5 py-4 flex items-start gap-3">
//                   <ShieldCheck className="h-5 w-5 text-blue-700 mt-0.5" />
//                   <p className="text-sm text-blue-900">
//                     <span className="font-semibold">Only the Primary</span>{" "}
//                     contact is mandatory. Others are optional but useful for
//                     finance comms.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Address + Business Profile */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//             <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//               <div className="px-8 py-5 border-b border-gray-200 flex items-center gap-3">
//                 <MapPin className="h-5 w-5 text-gray-700" />
//                 <h2 className="text-lg font-semibold text-gray-900">Address</h2>
//               </div>

//               <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <input
//                   name="country"
//                   value={formData.address.country}
//                   onChange={handleAddressChange}
//                   placeholder="Country"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                 />
//                 <input
//                   name="state"
//                   value={formData.address.state}
//                   onChange={handleAddressChange}
//                   placeholder="State/Province"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                 />
//                 <input
//                   name="street"
//                   value={formData.address.street}
//                   onChange={handleAddressChange}
//                   placeholder="Street"
//                   className="md:col-span-2 w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                 />
//                 <input
//                   name="city"
//                   value={formData.address.city}
//                   onChange={handleAddressChange}
//                   placeholder="City"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                 />
//                 <input
//                   name="postal_code"
//                   value={formData.address.postal_code}
//                   onChange={handleAddressChange}
//                   placeholder="Zip/Postal Code"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                 />
//               </div>
//             </div>

//             <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//               <div className="px-8 py-5 border-b border-gray-200 flex items-center gap-3">
//                 <Briefcase className="h-5 w-5 text-gray-700" />
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   Business Profile
//                 </h2>
//               </div>

//               <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <input
//                   name="industry"
//                   value={formData.business.industry}
//                   onChange={handleBusinessChange}
//                   placeholder="Industry"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                 />
//                 <input
//                   name="employees"
//                   value={formData.business.employees}
//                   onChange={handleBusinessChange}
//                   placeholder="Employees"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                 />
//                 <input
//                   name="annual_revenue"
//                   value={formData.business.annual_revenue}
//                   onChange={handleBusinessChange}
//                   placeholder="Annual revenue"
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                 />
//                 <select
//                   name="lead_source"
//                   value={formData.business.lead_source}
//                   onChange={handleBusinessChange}
//                   className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                 >
//                   <option value="inbound">Inbound</option>
//                   <option value="outbound">Outbound</option>
//                   <option value="linkedin">LinkedIn</option>
//                   <option value="referral">Referral</option>
//                   <option value="website">Website</option>
//                   <option value="trade_show">Trade Show</option>
//                   <option value="partner">Partner</option>
//                   <option value="other">Other</option>
//                 </select>

//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-gray-900 mb-2">
//                     Assigned To (Owner) <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     name="assigned_to"
//                     value={formData.business.assigned_to}
//                     onChange={handleBusinessChange}
//                     placeholder="Assigned to"
//                     className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Actions */}
//           <div className="flex items-center justify-end gap-4">
//             <button
//               type="button"
//               onClick={() => navigate("/commerce/revenue-workflow/leads")}
//               className="h-11 px-6 rounded-lg border border-gray-300 bg-white text-gray-800 font-medium hover:bg-gray-50 transition"
//             >
//               <X className="h-4 w-4 inline mr-2" />
//               Cancel
//             </button>

//             <button
//               type="submit"
//               disabled={loading}
//               className="h-11 px-7 rounded-lg bg-[#3A4E63] text-white font-semibold hover:bg-[#022d6e] transition disabled:opacity-50"
//             >
//               <Save className="h-4 w-4 inline mr-2" />
//               {loading ? "Creating..." : "Create Lead"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default RevenueLeadCreate;

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  X,
  Building2,
  User,
  MapPin,
  Briefcase,
  BadgeDollarSign,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  UserCircle2,
  Copy,
  Plus,
  Trash2,
  Crown,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

// -------- helpers --------
const pad2 = (n) => String(n).padStart(2, "0");

// REV-LEAD-YYYYMMDDHHmmss
const generateLeadId = () => {
  const d = new Date();
  const y = d.getFullYear();
  const mo = pad2(d.getMonth() + 1);
  const da = pad2(d.getDate());
  const hh = pad2(d.getHours());
  const mm = pad2(d.getMinutes());
  const ss = pad2(d.getSeconds());
  return `REV-LEAD-${y}${mo}${da}${hh}${mm}${ss}`;
};

const toNum = (v) => {
  const n = Number(String(v ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const formatINR = (num) => {
  const n = Number(num);
  if (!Number.isFinite(n) || n <= 0) return "₹0";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `₹${Math.round(n)}`;
  }
};

// tries to infer a "current user" label from localStorage safely
const getCurrentUserLabel = () => {
  const candidates = [
    "user",
    "current_user",
    "profile",
    "me",
    "auth_user",
    "account",
  ];
  for (const key of candidates) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const obj = JSON.parse(raw);
      const label =
        obj?.name ||
        obj?.full_name ||
        obj?.username ||
        obj?.email ||
        obj?.display_name;
      if (label) return label;
    } catch {
      if (raw.includes("@") || raw.length >= 3) return raw;
    }
  }
  return "Current User";
};

const emptyContact = (isPrimary = false) => ({
  full_name: "",
  email: "",
  phone: "",
  role: "",
  is_primary: isPrimary,
});

const RevenueLeadCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Current user banner
  const [currentUserLabel, setCurrentUserLabel] = useState("Current User");

  // Lead form
  const [formData, setFormData] = useState({
    lead_id: "",
    lead_name: "", // optional (UI only)
    company_name: "",
    website: "",
    description: "", // UI only
    expected_deal_value: "",
    lead_status: "new", // UI only (workflow backend sets stage itself)

    // ✅ multi contacts (UI only - we map primary to flat fields)
    contacts: [emptyContact(true)],

    address: { country: "", street: "", city: "", state: "", postal_code: "" },

    business: {
      industry: "",
      employees: "", // UI only
      annual_revenue: "", // UI only
      lead_source: "inbound",
      assigned_to: "", // UI only (we map to owner_id)
    },

    // qualification fields (backend supports these)
    problem_identified: false,
    budget_mentioned: "unknown",
    authority_known: false,
    need_timeline: false,

    // backend supports this
    expected_timeline: "3-6 months",
    notes: "",
  });

  // init lead id and user label
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      lead_id: prev.lead_id || generateLeadId(),
    }));
    setCurrentUserLabel(getCurrentUserLabel());
  }, []);

  const statusOptions = useMemo(
    () => [
      { value: "imported", label: "Imported" },
      { value: "new", label: "New" },
      { value: "contacted", label: "Contacted" },
      { value: "qualified", label: "Qualified" },
      { value: "proposal_sent", label: "Proposal Sent" },
      { value: "won", label: "Won" },
      { value: "lost", label: "Lost" },
    ],
    [],
  );

  const dealValueNum = useMemo(
    () => toNum(formData.expected_deal_value),
    [formData.expected_deal_value],
  );

  // handlers
  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    if (name === "lead_id") return;
    setFormData((p) => ({ ...p, [name]: value }));
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

  const handleContactChange = (index, field, value) => {
    setFormData((p) => {
      const next = [...p.contacts];
      next[index] = { ...next[index], [field]: value };
      return { ...p, contacts: next };
    });
  };

  const setPrimaryContact = (index) => {
    setFormData((p) => {
      const next = p.contacts.map((c, i) => ({
        ...c,
        is_primary: i === index,
      }));
      return { ...p, contacts: next };
    });
  };

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

      // keep at least 1 contact
      if (next.length === 0) next.push(emptyContact(true));

      // if removed primary, make first one primary
      if (wasPrimary) {
        next[0] = { ...next[0], is_primary: true };
        for (let i = 1; i < next.length; i++) {
          next[i] = { ...next[i], is_primary: false };
        }
      }

      // also ensure exactly one primary
      const primaryCount = next.filter((c) => c.is_primary).length;
      if (primaryCount === 0) next[0] = { ...next[0], is_primary: true };
      if (primaryCount > 1) {
        let found = false;
        for (let i = 0; i < next.length; i++) {
          if (next[i].is_primary) {
            if (!found) found = true;
            else next[i] = { ...next[i], is_primary: false };
          }
        }
      }

      return { ...p, contacts: next };
    });
  };

  const validate = () => {
    const company = String(formData.company_name || "").trim();
    const assignedTo = String(formData.business.assigned_to || "").trim();
    if (!company) return "Company Name is required";
    if (!assignedTo) return "Assigned To (Owner) is required";

    // lead_id is UI-only; backend generates REV-LEAD-* itself,
    // but keeping this validation is fine if you want it.
    const id = String(formData.lead_id || "").trim();
    if (!id.startsWith("REV-LEAD-")) return "Lead ID must start with REV-LEAD-";

    const primary =
      formData.contacts.find((c) => c.is_primary) || formData.contacts[0];
    if (!primary) return "At least one contact is required";
    if (!String(primary.full_name || "").trim())
      return "Primary contact full name is required";
    if (!String(primary.email || "").trim())
      return "Primary contact email is required";

    // backend requires country in model
    const country = String(formData.address.country || "").trim();
    if (!country) return "Country is required";

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return toast.error(err);

    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return toast.error("No token found. Please login again.");

      const primary =
        formData.contacts.find((c) => c.is_primary) ||
        formData.contacts[0] ||
        {};

      // ✅ IMPORTANT: workflow backend expects FLAT RevenueLeadCreate fields only
      const payload = {
        company_name: String(formData.company_name || "").trim(),
        website: String(formData.website || "").trim() || null,

        country: String(formData.address.country || "").trim(),
        industry: String(formData.business.industry || "").trim() || null,

        contact_name: String(primary.full_name || "").trim(),
        contact_email: String(primary.email || "").trim(),
        contact_phone: String(primary.phone || "").trim() || null,

        lead_source: String(formData.business.lead_source || "inbound").trim(),
        estimated_deal_value: toNum(formData.expected_deal_value),
        expected_timeline: String(
          formData.expected_timeline || "3-6 months",
        ).trim(),

        owner_id: String(formData.business.assigned_to || "").trim() || null,

        problem_identified: !!formData.problem_identified,
        budget_mentioned: formData.budget_mentioned || "unknown",
        authority_known: !!formData.authority_known,
        need_timeline: !!formData.need_timeline,

        notes: String(formData.notes || "").trim() || "",
      };

      const res = await fetch(
        `${API_URL}/api/commerce/workflow/revenue/leads`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();

      if (res.ok && data?.success) {
        toast.success("Lead created successfully");
        window.dispatchEvent(new Event("revenueLeadChanged"));
        navigate("/commerce/revenue-workflow/leads");
      } else {
        const msg =
          data?.detail?.message ||
          data?.detail ||
          data?.message ||
          `Failed to create lead (${res.status})`;
        toast.error(typeof msg === "string" ? msg : "Failed to create lead");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error creating lead");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#f4f6f8]"
      data-testid="revenue-lead-create"
    >
      {/* Finance header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-10 py-7">
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={() => navigate("/commerce/revenue-workflow/leads")}
              className="mt-1 p-2 rounded-xl hover:bg-gray-100 text-gray-700 transition"
              title="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="flex-1">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(3,63,153,0.25)] bg-[rgba(3,63,153,0.08)] text-blue-700 text-xs font-semibold">
                      <ShieldCheck className="h-4 w-4" />
                      Finance Revenue Workflow
                    </div>
                    <h1 className="mt-3 text-3xl font-semibold text-gray-900">
                      Create New Lead
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                      Track opportunities with clean IDs, owners and contacts.
                    </p>
                  </div>

                  {/* KPI */}
                  <div className="hidden lg:flex items-stretch gap-3">
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm px-4 py-3 min-w-[190px]">
                      <div className="flex items-center gap-2 text-gray-600 text-xs font-semibold">
                        <TrendingUp className="h-4 w-4" />
                        Expected Value
                      </div>
                      <div className="mt-1 text-lg font-bold text-gray-900">
                        {formatINR(dealValueNum)}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm px-4 py-3 min-w-[190px]">
                      <div className="flex items-center gap-2 text-gray-600 text-xs font-semibold">
                        <Sparkles className="h-4 w-4" />
                        Status
                      </div>
                      <div className="mt-1 text-sm font-bold text-gray-900">
                        {statusOptions.find(
                          (s) => s.value === formData.lead_status,
                        )?.label || "New"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Current user label is still kept (not sent to backend) */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-10 py-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Top two cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Basic Information */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm h-full">
              <div className="px-8 py-5 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-gray-700" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Basic Information
                  </h2>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Lead ID is generated internally and is immutable.
                </p>
              </div>

              <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Lead ID - UI only */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Lead ID
                  </label>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="lead_id"
                      value={formData.lead_id}
                      readOnly
                      title={formData.lead_id}
                      className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 font-semibold tracking-wide focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                      style={{ fontVariantLigatures: "none" }}
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(
                            String(formData.lead_id || ""),
                          );
                          toast.success("Lead ID copied");
                        } catch {
                          toast.error("Unable to copy");
                        }
                      }}
                      className="h-11 px-4 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 font-semibold inline-flex items-center gap-2"
                      title="Copy Lead ID"
                    >
                      <Copy className="h-4 w-4" />
                      Copy
                    </button>
                  </div>
                </div>

                {/* Lead Status (UI only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Lead Status
                  </label>
                  <select
                    name="lead_status"
                    value={formData.lead_status}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        lead_status: e.target.value,
                      }))
                    }
                    className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                  >
                    {statusOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Lead Name optional (UI only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Lead Name <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    name="lead_name"
                    value={formData.lead_name}
                    onChange={handleBasicChange}
                    className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                    placeholder="e.g., Q2 Renewal - ABC"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleBasicChange}
                    required
                    className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                    placeholder="Registered/Trading name"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Website <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleBasicChange}
                    className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                    placeholder="https://"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Description{" "}
                    <span className="text-gray-400">(optional)</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleBasicChange}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                    placeholder="Notes for finance review / underwriting / deal details…"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Expected Deal Value (₹){" "}
                    <span className="text-gray-400">(optional)</span>
                  </label>
                  <div className="relative">
                    <BadgeDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      name="expected_deal_value"
                      value={formData.expected_deal_value}
                      onChange={handleBasicChange}
                      min="0"
                      className="w-full h-11 pl-11 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                      placeholder="0"
                    />
                  </div>

                  {dealValueNum > 0 && (
                    <div className="mt-2 text-xs text-gray-600">
                      Preview:{" "}
                      <span className="font-semibold text-gray-900">
                        {formatINR(dealValueNum)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contacts (multiple) */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col h-full">
              {/* Header */}
              <div className="px-8 py-5 border-b border-gray-200 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-700" />
                    <h2 className="text-lg font-semibold text-gray-900">
                      Contacts
                    </h2>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Add multiple contacts and mark one as Primary.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addContact}
                  className="h-11 px-5 rounded-xl bg-[#3A4E63] text-white font-semibold hover:bg-[#022d6e] transition inline-flex items-center gap-2 shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  Add Contact
                </button>
              </div>

              {/* Body */}
              <div className="px-8 py-8 flex-1 flex flex-col gap-6">
                {formData.contacts.map((c, idx) => {
                  const isPrimary = !!c.is_primary;

                  return (
                    <div
                      key={idx}
                      className={`rounded-2xl border overflow-hidden ${
                        isPrimary
                          ? "border-[rgba(3,63,153,0.25)] bg-[rgba(3,63,153,0.08)]/30"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      {/* Card header row */}
                      <div
                        className={`px-6 py-4 flex items-center justify-between gap-4 ${
                          isPrimary
                            ? "border-b border-[rgba(3,63,153,0.25)]/70"
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

                        <div className="flex items-center gap-3">
                          {!isPrimary && (
                            <button
                              type="button"
                              onClick={() => setPrimaryContact(idx)}
                              className="h-10 px-4 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-900 text-sm font-semibold transition"
                            >
                              Make Primary
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => removeContact(idx)}
                            className="h-10 px-4 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-900 text-sm font-semibold transition inline-flex items-center gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Fields */}
                      <div className="px-6 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                          <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                              Full Name{" "}
                              {isPrimary ? (
                                <span className="text-red-500">*</span>
                              ) : null}
                            </label>
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
                              className="w-full h-11 px-4 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                              Role{" "}
                              <span className="text-gray-400 font-medium">
                                (optional)
                              </span>
                            </label>
                            <input
                              type="text"
                              value={c.role}
                              onChange={(e) =>
                                handleContactChange(idx, "role", e.target.value)
                              }
                              className="w-full h-11 px-4 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                              Email{" "}
                              {isPrimary ? (
                                <span className="text-red-500">*</span>
                              ) : null}
                            </label>
                            <input
                              type="email"
                              value={c.email}
                              onChange={(e) =>
                                handleContactChange(
                                  idx,
                                  "email",
                                  e.target.value,
                                )
                              }
                              className="w-full h-11 px-4 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                              Phone{" "}
                              <span className="text-gray-400 font-medium">
                                (optional)
                              </span>
                            </label>
                            <input
                              type="tel"
                              value={c.phone}
                              onChange={(e) =>
                                handleContactChange(
                                  idx,
                                  "phone",
                                  e.target.value,
                                )
                              }
                              className="w-full h-11 px-4 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="rounded-2xl border border-[rgba(3,63,153,0.25)] bg-[rgba(3,63,153,0.08)] px-5 py-4 flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-blue-700 mt-0.5" />
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">Only the Primary</span>{" "}
                    contact is mandatory. Others are optional but useful for
                    finance comms.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Address + Business Profile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-8 py-5 border-b border-gray-200 flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-700" />
                <h2 className="text-lg font-semibold text-gray-900">Address</h2>
              </div>

              <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  name="country"
                  value={formData.address.country}
                  onChange={handleAddressChange}
                  placeholder="Country"
                  className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                />
                <input
                  name="state"
                  value={formData.address.state}
                  onChange={handleAddressChange}
                  placeholder="State/Province"
                  className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                />
                <input
                  name="street"
                  value={formData.address.street}
                  onChange={handleAddressChange}
                  placeholder="Street"
                  className="md:col-span-2 w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                />
                <input
                  name="city"
                  value={formData.address.city}
                  onChange={handleAddressChange}
                  placeholder="City"
                  className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                />
                <input
                  name="postal_code"
                  value={formData.address.postal_code}
                  onChange={handleAddressChange}
                  placeholder="Zip/Postal Code"
                  className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-8 py-5 border-b border-gray-200 flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-gray-700" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Business Profile
                </h2>
              </div>

              <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  name="industry"
                  value={formData.business.industry}
                  onChange={handleBusinessChange}
                  placeholder="Industry"
                  className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                />
                <input
                  name="employees"
                  value={formData.business.employees}
                  onChange={handleBusinessChange}
                  placeholder="Employees"
                  className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                />
                <input
                  name="annual_revenue"
                  value={formData.business.annual_revenue}
                  onChange={handleBusinessChange}
                  placeholder="Annual revenue"
                  className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                />
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

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Assigned To (Owner) <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="assigned_to"
                    value={formData.business.assigned_to}
                    onChange={handleBusinessChange}
                    placeholder="Assigned to"
                    className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/commerce/revenue-workflow/leads")}
              className="h-11 px-6 rounded-lg border border-gray-300 bg-white text-gray-800 font-medium hover:bg-gray-50 transition"
            >
              <X className="h-4 w-4 inline mr-2" />
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="h-11 px-7 rounded-lg bg-[#3A4E63] text-white font-semibold hover:bg-[#022d6e] transition disabled:opacity-50"
            >
              <Save className="h-4 w-4 inline mr-2" />
              {loading ? "Creating..." : "Create Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RevenueLeadCreate;
