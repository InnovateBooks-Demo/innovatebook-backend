// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   User,
//   Building2,
//   Phone,
//   Briefcase,
//   ArrowLeft,
//   ArrowRight,
//   Check,
//   Target,
// } from "lucide-react";
// import { toast } from "sonner";

// const API_URL = process.env.REACT_APP_BACKEND_URL;

// const LeadCreate = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [currentStep, setCurrentStep] = useState(1);
//   const totalSteps = 5;

//   const [formData, setFormData] = useState({
//     lead_owner: "",
//     salutation: "",
//     first_name: "",
//     last_name: "",
//     title: "",
//     company: "",
//     industry: "",
//     annual_revenue: "",
//     no_of_employees: "",
//     lead_source: "",
//     lead_status: "New",
//     rating: "",
//     lifecycle_stage: "Lead",
//     phone: "",
//     mobile: "",
//     email: "",
//     website: "",
//     street: "",
//     city: "",
//     state: "",
//     zip_code: "",
//     country: "India",
//     linkedin_url: "",
//     twitter_handle: "",
//     campaign_source: "",
//     campaign_name: "",
//     deal_value: "",
//     deal_stage: "",
//     deal_probability: "",
//     expected_close_date: "",
//     description: "",
//     tags: "",
//   });

//   const salutations = ["Mr.", "Mrs.", "Ms.", "Dr.", "Prof."];
//   const leadSources = [
//     "Advertisement",
//     "Cold Call",
//     "Referral",
//     "Partner",
//     "Trade Show",
//     "Website",
//     "Google Ads",
//     "LinkedIn",
//     "Organic",
//   ];
//   const leadStatuses = [
//     "New",
//     "Contacted",
//     "Qualified",
//     "Proposal Sent",
//     "Negotiation",
//   ];
//   const lifecycleStages = ["Subscriber", "Lead", "MQL", "SQL", "Opportunity"];
//   const dealStages = [
//     "Qualification",
//     "Proposal",
//     "Negotiation",
//     "Closed Won",
//     "Closed Lost",
//   ];
//   const industries = [
//     "Banking",
//     "Consulting",
//     "Education",
//     "Finance",
//     "Healthcare",
//     "Insurance",
//     "Manufacturing",
//     "Retail",
//     "Technology",
//     "Other",
//   ];
//   const ratings = ["Hot", "Warm", "Cold"];

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const validateStep = () => {
//     if (currentStep === 1 && !formData.last_name) {
//       toast.error("Last Name is required");
//       return false;
//     }
//     if (currentStep === 2 && !formData.company) {
//       toast.error("Company is required");
//       return false;
//     }
//     return true;
//   };

//   const nextStep = () => {
//     if (validateStep())
//       setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
//   };
//   const prevStep = () => {
//     setCurrentStep((prev) => Math.max(prev - 1, 1));
//   };

//   const handleSubmit = async () => {
//     if (!formData.last_name || !formData.company) {
//       toast.error("Last Name and Company are required");
//       return;
//     }
//     setLoading(true);
//     try {
//       const token = localStorage.getItem("access_token");
//       const submitData = {
//         ...formData,
//         annual_revenue: formData.annual_revenue
//           ? parseFloat(formData.annual_revenue)
//           : null,
//         no_of_employees: formData.no_of_employees
//           ? parseInt(formData.no_of_employees)
//           : null,
//         deal_value: formData.deal_value
//           ? parseFloat(formData.deal_value)
//           : null,
//         deal_probability: formData.deal_probability
//           ? parseInt(formData.deal_probability)
//           : null,
//         tags: formData.tags
//           ? formData.tags
//               .split(",")
//               .map((t) => t.trim())
//               .filter(Boolean)
//           : [],
//       };
//       const res = await fetch(`${API_URL}/api/commerce/modules/revenue/leads`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(submitData),
//       });
//       if (res.ok) {
//         toast.success("Lead created successfully");
//         navigate("/commerce/lead");
//       } else {
//         const data = await res.json();
//         toast.error(data.detail || "Failed to create lead");
//       }
//     } catch (error) {
//       toast.error("Error creating lead");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const steps = [
//     { num: 1, label: "Lead Info", icon: User },
//     { num: 2, label: "Company", icon: Building2 },
//     { num: 3, label: "Contact", icon: Phone },
//     { num: 4, label: "Campaign", icon: Target },
//     { num: 5, label: "Deal", icon: Briefcase },
//   ];

//   const inputClass =
//     "w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3A4E63] bg-white";
//   const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

//   return (
//     <div className="p-8">
//       <div className="max-w-3xl mx-auto">
//         <button
//           onClick={() => navigate("/commerce/lead")}
//           className="flex items-center gap-2 text-slate-600 hover:text-[#3A4E63] mb-4"
//         >
//           <ArrowLeft className="h-4 w-4" />
//           <span className="text-sm font-medium">Back to Leads</span>
//         </button>
//         <h1 className="text-3xl font-bold text-slate-900 mb-8">
//           Create New Lead
//         </h1>

//         {/* Step Progress - Workspace Style Card */}
//         <div className="bg-white rounded-xl p-6 border border-slate-200 mb-6">
//           <div className="flex items-center justify-between">
//             {steps.map((step, index) => (
//               <React.Fragment key={step.num}>
//                 <div className="flex flex-col items-center">
//                   <div
//                     className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
//                       currentStep > step.num
//                         ? "bg-green-500 text-white"
//                         : currentStep === step.num
//                           ? "bg-[#3A4E63] text-white"
//                           : "bg-slate-100 text-slate-400"
//                     }`}
//                   >
//                     {currentStep > step.num ? (
//                       <Check className="h-5 w-5" />
//                     ) : (
//                       step.num
//                     )}
//                   </div>
//                   <span
//                     className={`text-xs mt-2 font-medium ${currentStep >= step.num ? "text-slate-900" : "text-slate-400"}`}
//                   >
//                     {step.label}
//                   </span>
//                 </div>
//                 {index < steps.length - 1 && (
//                   <div
//                     className={`flex-1 h-1 mx-3 rounded ${currentStep > step.num ? "bg-green-500" : "bg-slate-200"}`}
//                   />
//                 )}
//               </React.Fragment>
//             ))}
//           </div>
//         </div>

//         {/* Step Content - Workspace Style Card */}
//         <div className="bg-white rounded-xl p-6 border border-slate-200">
//           <h2 className="text-xl font-bold text-slate-900 mb-6">
//             {steps[currentStep - 1].label}
//           </h2>

//           {currentStep === 1 && (
//             <div className="grid grid-cols-2 gap-6">
//               <div>
//                 <label className={labelClass}>Salutation</label>
//                 <select
//                   name="salutation"
//                   value={formData.salutation}
//                   onChange={handleChange}
//                   className={inputClass}
//                 >
//                   <option value="">Select</option>
//                   {salutations.map((s) => (
//                     <option key={s} value={s}>
//                       {s}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label className={labelClass}>First Name</label>
//                 <input
//                   type="text"
//                   name="first_name"
//                   value={formData.first_name}
//                   onChange={handleChange}
//                   className={inputClass}
//                   placeholder="First name"
//                 />
//               </div>
//               <div>
//                 <label className={labelClass}>Last Name *</label>
//                 <input
//                   type="text"
//                   name="last_name"
//                   value={formData.last_name}
//                   onChange={handleChange}
//                   className={inputClass}
//                   placeholder="Last name"
//                 />
//               </div>
//               <div>
//                 <label className={labelClass}>Job Title</label>
//                 <input
//                   type="text"
//                   name="title"
//                   value={formData.title}
//                   onChange={handleChange}
//                   className={inputClass}
//                   placeholder="e.g. CEO"
//                 />
//               </div>
//               <div>
//                 <label className={labelClass}>Lead Source</label>
//                 <select
//                   name="lead_source"
//                   value={formData.lead_source}
//                   onChange={handleChange}
//                   className={inputClass}
//                 >
//                   <option value="">Select</option>
//                   {leadSources.map((s) => (
//                     <option key={s} value={s}>
//                       {s}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label className={labelClass}>Lead Status</label>
//                 <select
//                   name="lead_status"
//                   value={formData.lead_status}
//                   onChange={handleChange}
//                   className={inputClass}
//                 >
//                   {leadStatuses.map((s) => (
//                     <option key={s} value={s}>
//                       {s}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label className={labelClass}>Rating</label>
//                 <select
//                   name="rating"
//                   value={formData.rating}
//                   onChange={handleChange}
//                   className={inputClass}
//                 >
//                   <option value="">Select</option>
//                   {ratings.map((r) => (
//                     <option key={r} value={r}>
//                       {r}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label className={labelClass}>Lifecycle Stage</label>
//                 <select
//                   name="lifecycle_stage"
//                   value={formData.lifecycle_stage}
//                   onChange={handleChange}
//                   className={inputClass}
//                 >
//                   {lifecycleStages.map((s) => (
//                     <option key={s} value={s}>
//                       {s}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//           )}

//           {currentStep === 2 && (
//             <div className="grid grid-cols-2 gap-6">
//               <div className="col-span-2">
//                 <label className={labelClass}>Company Name *</label>
//                 <input
//                   type="text"
//                   name="company"
//                   value={formData.company}
//                   onChange={handleChange}
//                   className={inputClass}
//                   placeholder="Company name"
//                 />
//               </div>
//               <div>
//                 <label className={labelClass}>Industry</label>
//                 <select
//                   name="industry"
//                   value={formData.industry}
//                   onChange={handleChange}
//                   className={inputClass}
//                 >
//                   <option value="">Select</option>
//                   {industries.map((i) => (
//                     <option key={i} value={i}>
//                       {i}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label className={labelClass}>No. of Employees</label>
//                 <input
//                   type="number"
//                   name="no_of_employees"
//                   value={formData.no_of_employees}
//                   onChange={handleChange}
//                   className={inputClass}
//                   placeholder="e.g. 50"
//                 />
//               </div>
//               <div className="col-span-2">
//                 <label className={labelClass}>Annual Revenue (₹)</label>
//                 <input
//                   type="number"
//                   name="annual_revenue"
//                   value={formData.annual_revenue}
//                   onChange={handleChange}
//                   className={inputClass}
//                   placeholder="e.g. 10000000"
//                 />
//               </div>
//             </div>
//           )}

//           {currentStep === 3 && (
//             <div className="grid grid-cols-2 gap-6">
//               <div>
//                 <label className={labelClass}>Email</label>
//                 <input
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   className={inputClass}
//                   placeholder="email@example.com"
//                 />
//               </div>
//               <div>
//                 <label className={labelClass}>Phone</label>
//                 <input
//                   type="tel"
//                   name="phone"
//                   value={formData.phone}
//                   onChange={handleChange}
//                   className={inputClass}
//                   placeholder="+91 XXXXX XXXXX"
//                 />
//               </div>
//               <div>
//                 <label className={labelClass}>Mobile</label>
//                 <input
//                   type="tel"
//                   name="mobile"
//                   value={formData.mobile}
//                   onChange={handleChange}
//                   className={inputClass}
//                   placeholder="+91 XXXXX XXXXX"
//                 />
//               </div>
//               <div>
//                 <label className={labelClass}>Website</label>
//                 <input
//                   type="url"
//                   name="website"
//                   value={formData.website}
//                   onChange={handleChange}
//                   className={inputClass}
//                   placeholder="https://example.com"
//                 />
//               </div>
//               <div>
//                 <label className={labelClass}>City</label>
//                 <input
//                   type="text"
//                   name="city"
//                   value={formData.city}
//                   onChange={handleChange}
//                   className={inputClass}
//                   placeholder="City"
//                 />
//               </div>
//               <div>
//                 <label className={labelClass}>State</label>
//                 <input
//                   type="text"
//                   name="state"
//                   value={formData.state}
//                   onChange={handleChange}
//                   className={inputClass}
//                   placeholder="State"
//                 />
//               </div>
//               <div>
//                 <label className={labelClass}>Country</label>
//                 <input
//                   type="text"
//                   name="country"
//                   value={formData.country}
//                   onChange={handleChange}
//                   className={inputClass}
//                   placeholder="Country"
//                 />
//               </div>
//               <div>
//                 <label className={labelClass}>Zip Code</label>
//                 <input
//                   type="text"
//                   name="zip_code"
//                   value={formData.zip_code}
//                   onChange={handleChange}
//                   className={inputClass}
//                   placeholder="Postal code"
//                 />
//               </div>
//             </div>
//           )}

//           {currentStep === 4 && (
//             <div className="grid grid-cols-2 gap-6">
//               <div>
//                 <label className={labelClass}>LinkedIn URL</label>
//                 <input
//                   type="url"
//                   name="linkedin_url"
//                   value={formData.linkedin_url}
//                   onChange={handleChange}
//                   className={inputClass}
//                   placeholder="https://linkedin.com/in/..."
//                 />
//               </div>
//               <div>
//                 <label className={labelClass}>Twitter Handle</label>
//                 <input
//                   type="text"
//                   name="twitter_handle"
//                   value={formData.twitter_handle}
//                   onChange={handleChange}
//                   className={inputClass}
//                   placeholder="@username"
//                 />
//               </div>
//               <div>
//                 <label className={labelClass}>Campaign Source</label>
//                 <input
//                   type="text"
//                   name="campaign_source"
//                   value={formData.campaign_source}
//                   onChange={handleChange}
//                   className={inputClass}
//                   placeholder="e.g. Google"
//                 />
//               </div>
//               <div>
//                 <label className={labelClass}>Campaign Name</label>
//                 <input
//                   type="text"
//                   name="campaign_name"
//                   value={formData.campaign_name}
//                   onChange={handleChange}
//                   className={inputClass}
//                   placeholder="Campaign name"
//                 />
//               </div>
//             </div>
//           )}

//           {currentStep === 5 && (
//             <div className="grid grid-cols-2 gap-6">
//               <div>
//                 <label className={labelClass}>Deal Value (₹)</label>
//                 <input
//                   type="number"
//                   name="deal_value"
//                   value={formData.deal_value}
//                   onChange={handleChange}
//                   className={inputClass}
//                   placeholder="e.g. 500000"
//                 />
//               </div>
//               <div>
//                 <label className={labelClass}>Deal Stage</label>
//                 <select
//                   name="deal_stage"
//                   value={formData.deal_stage}
//                   onChange={handleChange}
//                   className={inputClass}
//                 >
//                   <option value="">Select</option>
//                   {dealStages.map((s) => (
//                     <option key={s} value={s}>
//                       {s}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label className={labelClass}>Probability (%)</label>
//                 <input
//                   type="number"
//                   name="deal_probability"
//                   value={formData.deal_probability}
//                   onChange={handleChange}
//                   min="0"
//                   max="100"
//                   className={inputClass}
//                   placeholder="0-100"
//                 />
//               </div>
//               <div>
//                 <label className={labelClass}>Expected Close Date</label>
//                 <input
//                   type="date"
//                   name="expected_close_date"
//                   value={formData.expected_close_date}
//                   onChange={handleChange}
//                   className={inputClass}
//                 />
//               </div>
//               <div className="col-span-2">
//                 <label className={labelClass}>Description</label>
//                 <textarea
//                   name="description"
//                   value={formData.description}
//                   onChange={handleChange}
//                   rows={3}
//                   className={inputClass}
//                   placeholder="Notes..."
//                 />
//               </div>
//               <div className="col-span-2">
//                 <label className={labelClass}>Tags (comma-separated)</label>
//                 <input
//                   type="text"
//                   name="tags"
//                   value={formData.tags}
//                   onChange={handleChange}
//                   className={inputClass}
//                   placeholder="e.g. enterprise, hot-lead"
//                 />
//               </div>
//             </div>
//           )}

//           {/* Navigation */}
//           <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
//             <button
//               onClick={prevStep}
//               disabled={currentStep === 1}
//               className="px-4 py-3 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-all"
//             >
//               <ArrowLeft className="h-4 w-4 inline mr-2" />
//               Previous
//             </button>
//             {currentStep < totalSteps ? (
//               <button
//                 onClick={nextStep}
//                 className="px-4 py-3 text-sm font-medium text-white bg-[#3A4E63] rounded-lg hover:bg-[#3A4E63] transition-all"
//               >
//                 Next
//                 <ArrowRight className="h-4 w-4 inline ml-2" />
//               </button>
//             ) : (
//               <button
//                 onClick={handleSubmit}
//                 disabled={loading}
//                 className="px-4 py-3 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all"
//               >
//                 <Check className="h-4 w-4 inline mr-2" />
//                 {loading ? "Creating..." : "Create Lead"}
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LeadCreate;
