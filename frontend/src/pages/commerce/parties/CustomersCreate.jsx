// // import React, { useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // import { Users, Save, ArrowLeft, X, Plus, Trash2 } from "lucide-react";
// // import { toast } from "sonner";
// // import axios from "axios";

// // const API_URL = process.env.REACT_APP_BACKEND_URL;

// // const CustomersCreate = () => {
// //   const navigate = useNavigate();
// //   const [loading, setLoading] = useState(false);
// //   const [formData, setFormData] = useState({
// //     display_name: "",
// //     legal_name: "",
// //     customer_type: "B2B",
// //     segment: "SMB",
// //     country_of_registration: "",
// //     industry_classification: "",
// //     status: "active",
// //     primary_role: "Customer",
// //     contacts: [],
// //     locations: [],
// //   });

// //   const [newContact, setNewContact] = useState({
// //     name: "",
// //     role: "",
// //     email: "",
// //     phone: "",
// //     is_primary: false,
// //   });

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setLoading(true);
// //     try {
// //       const token = localStorage.getItem("access_token");
// //       const response = await axios.post(
// //         `${API_URL}/api/commerce/parties/customers`,
// //         formData,
// //         { headers: { Authorization: `Bearer ${token}` } },
// //       );
// //       if (response.data.success) {
// //         toast.success("Customer created successfully");
// //         navigate("/commerce/parties/customers");
// //       }
// //     } catch (error) {
// //       const data = error?.response?.data;
// //       const detail = data?.detail ?? data;

// //       // Convert any error shape into a clean message string
// //       const message =
// //         typeof detail === "string"
// //           ? detail
// //           : detail?.message ||
// //             detail?.error ||
// //             data?.message ||
// //             "Failed to create customer";

// //       const statusBadge =
// //         typeof detail === "object" ? detail?.subscription_status : null;

// //       if (detail?.error === "UPGRADE_REQUIRED") {
// //         toast.error(
// //           <div>
// //             <div className="font-semibold">Upgrade Required</div>
// //             <div className="text-sm opacity-90">{detail?.message}</div>
// //             {detail?.subscription_status && (
// //               <div className="mt-1 text-xs opacity-70">
// //                 Plan: {detail.subscription_status}
// //               </div>
// //             )}
// //           </div>,
// //         );
// //         return;
// //       }

// //       toast.error(`${message}${statusBadge ? ` (${statusBadge})` : ""}`);
// //     } finally {
// //       setLoading(false);
// //     }
// //     // } catch (error) {
// //     //   toast.error(error.response?.data?.detail || "Failed to create customer");
// //     // } finally {
// //     //   setLoading(false);
// //     // }
// //   };

// //   const addContact = () => {
// //     if (newContact.name && newContact.email) {
// //       setFormData((prev) => ({
// //         ...prev,
// //         contacts: [
// //           ...prev.contacts,
// //           { ...newContact, preferred_mode: "email", is_active: true },
// //         ],
// //       }));
// //       setNewContact({
// //         name: "",
// //         role: "",
// //         email: "",
// //         phone: "",
// //         is_primary: false,
// //       });
// //     }
// //   };

// //   return (
// //     <div className="min-h-screen bg-gray-50" data-testid="customers-create">
// //       <div className="bg-white border-b border-gray-200">
// //         <div className="px-8 py-6">
// //           <div className="flex items-center gap-4">
// //             <button
// //               onClick={() => navigate("/commerce/parties/customers")}
// //               className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
// //             >
// //               <ArrowLeft className="h-5 w-5" />
// //             </button>
// //             <div>
// //               <h1 className="text-2xl font-semibold text-gray-900">
// //                 Create New Customer
// //               </h1>
// //               <p className="mt-1 text-sm text-gray-500">
// //                 Add a new customer to your organization
// //               </p>
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       <div className="px-8 py-6 max-w-4xl">
// //         <form onSubmit={handleSubmit} className="space-y-6">
// //           {/* Basic Information */}
// //           <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
// //             <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
// //               <div className="flex items-center gap-2">
// //                 <Users className="h-5 w-5 text-gray-500" />
// //                 <h2 className="text-lg font-medium text-gray-900">
// //                   Basic Information
// //                 </h2>
// //               </div>
// //             </div>
// //             <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// //                   Display Name *
// //                 </label>
// //                 <input
// //                   type="text"
// //                   required
// //                   value={formData.display_name}
// //                   onChange={(e) =>
// //                     setFormData({ ...formData, display_name: e.target.value })
// //                   }
// //                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99] focus:border-transparent"
// //                   placeholder="Enter display name"
// //                 />
// //               </div>
// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// //                   Legal Name *
// //                 </label>
// //                 <input
// //                   type="text"
// //                   required
// //                   value={formData.legal_name}
// //                   onChange={(e) =>
// //                     setFormData({ ...formData, legal_name: e.target.value })
// //                   }
// //                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99] focus:border-transparent"
// //                   placeholder="Enter legal name"
// //                 />
// //               </div>
// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// //                   Customer Type *
// //                 </label>
// //                 <select
// //                   required
// //                   value={formData.customer_type}
// //                   onChange={(e) =>
// //                     setFormData({ ...formData, customer_type: e.target.value })
// //                   }
// //                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99] bg-white"
// //                 >
// //                   <option value="B2B">B2B</option>
// //                   <option value="B2C">B2C</option>
// //                   <option value="B2G">B2G</option>
// //                   <option value="Export">Export</option>
// //                 </select>
// //               </div>
// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// //                   Segment
// //                 </label>
// //                 <select
// //                   value={formData.segment}
// //                   onChange={(e) =>
// //                     setFormData({ ...formData, segment: e.target.value })
// //                   }
// //                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99] bg-white"
// //                 >
// //                   <option value="Enterprise">Enterprise</option>
// //                   <option value="SMB">SMB</option>
// //                   <option value="Individual">Individual</option>
// //                 </select>
// //               </div>
// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// //                   Country of Registration *
// //                 </label>
// //                 <input
// //                   type="text"
// //                   required
// //                   value={formData.country_of_registration}
// //                   onChange={(e) =>
// //                     setFormData({
// //                       ...formData,
// //                       country_of_registration: e.target.value,
// //                     })
// //                   }
// //                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99] focus:border-transparent"
// //                   placeholder="Enter country"
// //                 />
// //               </div>
// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// //                   Industry
// //                 </label>
// //                 <input
// //                   type="text"
// //                   value={formData.industry_classification}
// //                   onChange={(e) =>
// //                     setFormData({
// //                       ...formData,
// //                       industry_classification: e.target.value,
// //                     })
// //                   }
// //                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99] focus:border-transparent"
// //                   placeholder="Enter industry"
// //                 />
// //               </div>
// //             </div>
// //           </div>

// //           {/* Contacts */}
// //           <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
// //             <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
// //               <h2 className="text-lg font-medium text-gray-900">Contacts</h2>
// //             </div>
// //             <div className="p-6">
// //               <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
// //                 <input
// //                   type="text"
// //                   placeholder="Name"
// //                   value={newContact.name}
// //                   onChange={(e) =>
// //                     setNewContact({ ...newContact, name: e.target.value })
// //                   }
// //                   className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
// //                 />
// //                 <input
// //                   type="text"
// //                   placeholder="Role"
// //                   value={newContact.role}
// //                   onChange={(e) =>
// //                     setNewContact({ ...newContact, role: e.target.value })
// //                   }
// //                   className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
// //                 />
// //                 <input
// //                   type="email"
// //                   placeholder="Email"
// //                   value={newContact.email}
// //                   onChange={(e) =>
// //                     setNewContact({ ...newContact, email: e.target.value })
// //                   }
// //                   className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
// //                 />
// //                 <input
// //                   type="tel"
// //                   placeholder="Phone"
// //                   value={newContact.phone}
// //                   onChange={(e) =>
// //                     setNewContact({ ...newContact, phone: e.target.value })
// //                   }
// //                   className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
// //                 />
// //                 <button
// //                   type="button"
// //                   onClick={addContact}
// //                   className="px-4 py-2.5 bg-[#033F99] text-white rounded-lg hover:bg-[#022d6e] transition-colors"
// //                 >
// //                   <Plus className="h-5 w-5 mx-auto" />
// //                 </button>
// //               </div>
// //               {formData.contacts.map((contact, index) => (
// //                 <div
// //                   key={`item-${index}`}
// //                   className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg mb-2"
// //                 >
// //                   <span className="flex-1 font-medium text-sm">
// //                     {contact.name} - {contact.role}
// //                   </span>
// //                   <span className="text-sm text-gray-500">{contact.email}</span>
// //                   <button
// //                     type="button"
// //                     onClick={() =>
// //                       setFormData((prev) => ({
// //                         ...prev,
// //                         contacts: prev.contacts.filter((_, i) => i !== index),
// //                       }))
// //                     }
// //                     className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
// //                   >
// //                     <Trash2 className="h-4 w-4" />
// //                   </button>
// //                 </div>
// //               ))}
// //             </div>
// //           </div>

// //           {/* Actions */}
// //           <div className="flex items-center justify-end gap-3">
// //             <button
// //               type="button"
// //               onClick={() => navigate("/commerce/parties/customers")}
// //               className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
// //             >
// //               <X className="h-4 w-4" />
// //               Cancel
// //             </button>
// //             <button
// //               type="submit"
// //               disabled={loading}
// //               className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-[#033F99] rounded-lg hover:bg-[#022d6e] transition-colors shadow-sm disabled:opacity-50"
// //             >
// //               <Save className="h-4 w-4" />
// //               {loading ? "Creating..." : "Create Customer"}
// //             </button>
// //           </div>
// //         </form>
// //       </div>
// //     </div>
// //   );
// // };

// // export default CustomersCreate;

// import React, { useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Users, Save, ArrowLeft, X, Plus, Trash2 } from "lucide-react";
// import { toast } from "sonner";
// import axios from "axios";

// const API_URL = process.env.REACT_APP_BACKEND_URL;

// const CustomersCreate = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);

//   const [formData, setFormData] = useState({
//     display_name: "",
//     legal_name: "",
//     customer_type: "B2B",
//     segment: "SMB",
//     country_of_registration: "",
//     industry_classification: "",
//     status: "active",
//     primary_role: "Customer",
//     contacts: [],
//     locations: [],
//   });

//   const [newContact, setNewContact] = useState({
//     name: "",
//     role: "",
//     email: "",
//     phone: "",
//     is_primary: false,
//   });

//   const canAddContact = useMemo(() => {
//     return (
//       Boolean(newContact.name?.trim()) && Boolean(newContact.email?.trim())
//     );
//   }, [newContact.name, newContact.email]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const token = localStorage.getItem("access_token");
//       const response = await axios.post(
//         `${API_URL}/api/commerce/parties/customers`,
//         formData,
//         { headers: { Authorization: `Bearer ${token}` } },
//       );

//       if (response.data.success) {
//         toast.success("Customer created successfully");
//         navigate("/commerce/parties/customers");
//       }
//     } catch (error) {
//       const data = error?.response?.data;
//       const detail = data?.detail ?? data;

//       const message =
//         typeof detail === "string"
//           ? detail
//           : detail?.message ||
//             detail?.error ||
//             data?.message ||
//             "Failed to create customer";

//       toast.error(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const addContact = () => {
//     if (!canAddContact) return;

//     setFormData((prev) => ({
//       ...prev,
//       contacts: [
//         ...prev.contacts,
//         { ...newContact, preferred_mode: "email", is_active: true },
//       ],
//     }));

//     setNewContact({
//       name: "",
//       role: "",
//       email: "",
//       phone: "",
//       is_primary: false,
//     });
//   };

//   const removeContact = (index) => {
//     setFormData((prev) => ({
//       ...prev,
//       contacts: prev.contacts.filter((_, i) => i !== index),
//     }));
//   };

//   // ====== UI classes (dashboard + clean) ======
//   const styles = {
//     page: "min-h-screen bg-gray-50",
//     topbar: "bg-white border-b border-gray-200",
//     wrap: "px-6 md:px-8 py-6",

//     backBtn:
//       "p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors",
//     title: "text-2xl font-semibold text-gray-900",
//     subtitle: "mt-1 text-sm text-gray-500",

//     // Wider container to remove “empty/slaggy” feel
//     container: "px-6 md:px-8 py-6 max-w-7xl mx-auto",

//     grid: "grid grid-cols-1 lg:grid-cols-12 gap-6",

//     leftCol: "lg:col-span-7",
//     rightCol: "lg:col-span-5",

//     card: "bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm",
//     cardHead: "px-6 py-4 bg-gray-50 border-b border-gray-200",
//     cardTitleRow: "flex items-center gap-2",
//     cardTitle: "text-lg font-medium text-gray-900",
//     cardBody: "p-6",

//     label: "block text-sm font-medium text-gray-700 mb-2",

//     input:
//       "w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white " +
//       "focus:outline-none focus:ring-2 focus:ring-[#033F99] focus:border-transparent",
//     select:
//       "w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white " +
//       "focus:outline-none focus:ring-2 focus:ring-[#033F99] focus:border-transparent",

//     helpText: "mt-1 text-xs text-gray-500",

//     actionsBar: "flex items-center justify-end gap-3 pt-2",

//     btnCancel:
//       "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors",
//     btnPrimary:
//       "inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-[#033F99] rounded-lg hover:bg-[#022d6e] transition-colors shadow-sm disabled:opacity-50",

//     // Contacts add row (compact on right)
//     contactGrid: "grid grid-cols-1 md:grid-cols-2 gap-3",
//     plusBtn:
//       "h-[46px] w-full md:w-auto px-4 bg-[#033F99] text-white rounded-lg hover:bg-[#022d6e] transition-colors flex items-center justify-center disabled:opacity-50",

//     contactItem:
//       "flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200",
//     contactName: "font-medium text-sm text-gray-900 truncate",
//     contactMeta: "text-xs text-gray-500 truncate",
//     deleteBtn: "p-2 text-red-600 hover:bg-red-50 rounded-lg",

//     //footer

//     footer:
//       "mt-10 py-4 border-t border-gray-200 text-center text-xs text-gray-500",
//   };

//   return (
//     <div className={styles.page} data-testid="customers-create">
//       {/* Header */}
//       <div className={styles.topbar}>
//         <div className={styles.wrap}>
//           <div className="flex items-center gap-4">
//             <button
//               onClick={() => navigate("/commerce/parties/customers")}
//               className={styles.backBtn}
//               title="Back"
//             >
//               <ArrowLeft className="h-5 w-5" />
//             </button>

//             <div>
//               <h1 className={styles.title}>Create New Customer</h1>
//               <p className={styles.subtitle}>
//                 Add a new customer to your organization
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Content */}
//       <div className={styles.container}>
//         <form onSubmit={handleSubmit}>
//           <div className={styles.grid}>
//             {/* LEFT: Basic Info */}
//             <div className={styles.leftCol}>
//               <div className={styles.card}>
//                 <div className={styles.cardHead}>
//                   <div className={styles.cardTitleRow}>
//                     <Users className="h-5 w-5 text-gray-500" />
//                     <h2 className={styles.cardTitle}>Basic Information</h2>
//                   </div>
//                 </div>

//                 <div
//                   className={`${styles.cardBody} grid grid-cols-1 md:grid-cols-2 gap-6`}
//                 >
//                   <div>
//                     <label className={styles.label}>Display Name *</label>
//                     <input
//                       type="text"
//                       required
//                       value={formData.display_name}
//                       onChange={(e) =>
//                         setFormData({
//                           ...formData,
//                           display_name: e.target.value,
//                         })
//                       }
//                       className={styles.input}
//                       placeholder="Enter display name"
//                     />
//                     <p className={styles.helpText}>Used for invoices & UI.</p>
//                   </div>

//                   <div>
//                     <label className={styles.label}>Legal Name *</label>
//                     <input
//                       type="text"
//                       required
//                       value={formData.legal_name}
//                       onChange={(e) =>
//                         setFormData({ ...formData, legal_name: e.target.value })
//                       }
//                       className={styles.input}
//                       placeholder="Enter legal name"
//                     />
//                     <p className={styles.helpText}>
//                       Used in contracts & compliance.
//                     </p>
//                   </div>

//                   <div>
//                     <label className={styles.label}>Customer Type *</label>
//                     <select
//                       required
//                       value={formData.customer_type}
//                       onChange={(e) =>
//                         setFormData({
//                           ...formData,
//                           customer_type: e.target.value,
//                         })
//                       }
//                       className={styles.select}
//                     >
//                       <option value="B2B">B2B</option>
//                       <option value="B2C">B2C</option>
//                       <option value="B2G">B2G</option>
//                       <option value="Export">Export</option>
//                     </select>
//                   </div>

//                   <div>
//                     <label className={styles.label}>Segment</label>
//                     <select
//                       value={formData.segment}
//                       onChange={(e) =>
//                         setFormData({ ...formData, segment: e.target.value })
//                       }
//                       className={styles.select}
//                     >
//                       <option value="Enterprise">Enterprise</option>
//                       <option value="SMB">SMB</option>
//                       <option value="Individual">Individual</option>
//                     </select>
//                   </div>

//                   <div>
//                     <label className={styles.label}>
//                       Country of Registration *
//                     </label>
//                     <input
//                       type="text"
//                       required
//                       value={formData.country_of_registration}
//                       onChange={(e) =>
//                         setFormData({
//                           ...formData,
//                           country_of_registration: e.target.value,
//                         })
//                       }
//                       className={styles.input}
//                       placeholder="Enter country"
//                     />
//                   </div>

//                   <div>
//                     <label className={styles.label}>Industry</label>
//                     <input
//                       type="text"
//                       value={formData.industry_classification}
//                       onChange={(e) =>
//                         setFormData({
//                           ...formData,
//                           industry_classification: e.target.value,
//                         })
//                       }
//                       className={styles.input}
//                       placeholder="Enter industry"
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* RIGHT: Contacts */}
//             <div className={styles.rightCol}>
//               <div className={styles.card}>
//                 <div className={styles.cardHead}>
//                   <h2 className={styles.cardTitle}>Contacts</h2>
//                 </div>

//                 <div className={styles.cardBody}>
//                   <div className={`${styles.contactGrid} mb-3`}>
//                     <div>
//                       <label className={styles.label}>Name *</label>
//                       <input
//                         type="text"
//                         placeholder="Full name"
//                         value={newContact.name}
//                         onChange={(e) =>
//                           setNewContact({ ...newContact, name: e.target.value })
//                         }
//                         className={styles.input}
//                       />
//                     </div>

//                     <div>
//                       <label className={styles.label}>Role</label>
//                       <input
//                         type="text"
//                         placeholder="Billing / Sales / Ops"
//                         value={newContact.role}
//                         onChange={(e) =>
//                           setNewContact({ ...newContact, role: e.target.value })
//                         }
//                         className={styles.input}
//                       />
//                     </div>

//                     <div>
//                       <label className={styles.label}>Email *</label>
//                       <input
//                         type="email"
//                         placeholder="name@company.com"
//                         value={newContact.email}
//                         onChange={(e) =>
//                           setNewContact({
//                             ...newContact,
//                             email: e.target.value,
//                           })
//                         }
//                         className={styles.input}
//                       />
//                     </div>

//                     <div>
//                       <label className={styles.label}>Phone</label>
//                       <input
//                         type="tel"
//                         placeholder="+91 xxxxx xxxxx"
//                         value={newContact.phone}
//                         onChange={(e) =>
//                           setNewContact({
//                             ...newContact,
//                             phone: e.target.value,
//                           })
//                         }
//                         className={styles.input}
//                       />
//                     </div>
//                   </div>

//                   <button
//                     type="button"
//                     onClick={addContact}
//                     disabled={!canAddContact}
//                     className={styles.plusBtn}
//                     title={
//                       !canAddContact ? "Enter Name and Email" : "Add contact"
//                     }
//                   >
//                     <Plus className="h-5 w-5" />
//                     <span className="ml-2 text-sm font-medium">
//                       Add Contact
//                     </span>
//                   </button>

//                   <div className="mt-5">
//                     {formData.contacts.length === 0 ? (
//                       <div className="text-sm text-gray-500">
//                         No contacts added yet.
//                         <div className="text-xs text-gray-400 mt-1">
//                           Add a primary contact for billing & support.
//                         </div>
//                       </div>
//                     ) : (
//                       <div className="space-y-2">
//                         {formData.contacts.map((contact, index) => (
//                           <div
//                             key={`item-${index}`}
//                             className={styles.contactItem}
//                           >
//                             <div className="min-w-0 flex-1">
//                               <div className="flex items-center gap-2 min-w-0">
//                                 <span className={styles.contactName}>
//                                   {contact.name}
//                                 </span>
//                                 {contact.is_primary ? (
//                                   <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
//                                     Primary
//                                   </span>
//                                 ) : null}
//                               </div>
//                               <div className={styles.contactMeta}>
//                                 {contact.email}
//                                 {contact.role ? ` • ${contact.role}` : ""}
//                                 {contact.phone ? ` • ${contact.phone}` : ""}
//                               </div>
//                             </div>

//                             <button
//                               type="button"
//                               onClick={() => removeContact(index)}
//                               className={styles.deleteBtn}
//                               title="Remove contact"
//                             >
//                               <Trash2 className="h-4 w-4" />
//                             </button>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Actions */}
//           <div className={styles.actionsBar}>
//             <button
//               type="button"
//               onClick={() => navigate("/commerce/parties/customers")}
//               className={styles.btnCancel}
//             >
//               <X className="h-4 w-4" />
//               Cancel
//             </button>

//             <button
//               type="submit"
//               disabled={loading}
//               className={styles.btnPrimary}
//             >
//               <Save className="h-4 w-4" />
//               {loading ? "Creating..." : "Create Customer"}
//             </button>
//           </div>
//         </form>
//         {/* Footer */}
//         <footer className={styles.footer}>
//           © {new Date().getFullYear()} Innovate Books. All rights reserved.
//         </footer>
//       </div>
//     </div>
//   );
// };

// export default CustomersCreate;

import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Save, ArrowLeft, X, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const CustomersCreate = ({ isOverlay = false, onSuccess, onCancel }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    display_name: "",
    legal_name: "",
    customer_type: "B2B",
    segment: "SMB",
    country_of_registration: "",
    industry_classification: "",
    status: "active",
    primary_role: "Customer",
    contacts: [],
    locations: [],
  });

  const [newContact, setNewContact] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    is_primary: false,
  });

  const canAddContact = useMemo(() => {
    return (
      Boolean(newContact.name?.trim()) && Boolean(newContact.email?.trim())
    );
  }, [newContact.name, newContact.email]);

  const goBack = () => {
    if (isOverlay && onCancel) return onCancel();
    navigate("/commerce/parties/customers");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.post(
        `${API_URL}/api/commerce/parties/customers`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        toast.success("Customer created successfully");

        const created =
          response.data.customer || response.data.data || response.data;

        if (isOverlay && onSuccess) {
          onSuccess(created);
          return;
        }

        navigate("/commerce/parties/customers");
      }
    } catch (error) {
      const data = error?.response?.data;
      const detail = data?.detail ?? data;

      const message =
        typeof detail === "string"
          ? detail
          : detail?.message ||
          detail?.error ||
          data?.message ||
          "Failed to create customer";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const addContact = () => {
    if (!canAddContact) return;

    setFormData((prev) => ({
      ...prev,
      contacts: [
        ...prev.contacts,
        { ...newContact, preferred_mode: "email", is_active: true },
      ],
    }));

    setNewContact({
      name: "",
      role: "",
      email: "",
      phone: "",
      is_primary: false,
    });
  };

  const removeContact = (index) => {
    setFormData((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index),
    }));
  };

  // ====== UI classes (unchanged from your file) ======
  const styles = {
    page: "min-h-screen bg-gray-50",
    topbar: "bg-white border-b border-gray-200",
    wrap: "px-6 md:px-8 py-6",

    backBtn:
      "p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors",
    title: "text-2xl font-semibold text-gray-900",
    subtitle: "mt-1 text-sm text-gray-500",

    container: "px-6 md:px-8 py-6 max-w-7xl mx-auto",

    grid: "grid grid-cols-1 lg:grid-cols-12 gap-6",

    leftCol: "lg:col-span-7",
    rightCol: "lg:col-span-5",

    card: "bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm",
    cardHead: "px-6 py-4 bg-gray-50 border-b border-gray-200",
    cardTitleRow: "flex items-center gap-2",
    cardTitle: "text-lg font-medium text-gray-900",
    cardBody: "p-6",

    label: "block text-sm font-medium text-gray-700 mb-2",

    input:
      "w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white " +
      "focus:outline-none focus:ring-2 focus:ring-[#033F99] focus:border-transparent",
    select:
      "w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white " +
      "focus:outline-none focus:ring-2 focus:ring-[#033F99] focus:border-transparent",

    helpText: "mt-1 text-xs text-gray-500",

    actionsBar: "flex items-center justify-end gap-3 pt-2",

    btnCancel:
      "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors",
    btnPrimary:
      "inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-[#033F99] rounded-lg hover:bg-[#022d6e] transition-colors shadow-sm disabled:opacity-50",

    contactGrid: "grid grid-cols-1 md:grid-cols-2 gap-3",
    plusBtn:
      "h-[46px] w-full md:w-auto px-4 bg-[#033F99] text-white rounded-lg hover:bg-[#022d6e] transition-colors flex items-center justify-center disabled:opacity-50",

    contactItem:
      "flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200",
    contactName: "font-medium text-sm text-gray-900 truncate",
    contactMeta: "text-xs text-gray-500 truncate",
    deleteBtn: "p-2 text-red-600 hover:bg-red-50 rounded-lg",

    footer:
      "mt-10 py-4 border-t border-gray-200 text-center text-xs text-gray-500",
  };

  return (
    <div className={styles.page} data-testid="customers-create">
      {/* Header */}
      <div className={styles.topbar}>
        <div className={styles.wrap}>
          <div className="flex items-center gap-4">
            <button onClick={goBack} className={styles.backBtn} title="Back">
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div>
              <h1 className={styles.title}>Create New Customer</h1>
              <p className={styles.subtitle}>
                Add a new customer to your organization
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={styles.container}>
        <form onSubmit={handleSubmit}>
          <div className={styles.grid}>
            {/* LEFT: Basic Info */}
            <div className={styles.leftCol}>
              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <div className={styles.cardTitleRow}>
                    <Users className="h-5 w-5 text-gray-500" />
                    <h2 className={styles.cardTitle}>Basic Information</h2>
                  </div>
                </div>

                <div
                  className={`${styles.cardBody} grid grid-cols-1 md:grid-cols-2 gap-6`}
                >
                  <div>
                    <label className={styles.label}>Display Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.display_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          display_name: e.target.value,
                        })
                      }
                      className={styles.input}
                      placeholder="Enter display name"
                    />
                    <p className={styles.helpText}>Used for invoices & UI.</p>
                  </div>

                  <div>
                    <label className={styles.label}>Legal Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.legal_name}
                      onChange={(e) =>
                        setFormData({ ...formData, legal_name: e.target.value })
                      }
                      className={styles.input}
                      placeholder="Enter legal name"
                    />
                    <p className={styles.helpText}>
                      Used in contracts & compliance.
                    </p>
                  </div>

                  <div>
                    <label className={styles.label}>Customer Type *</label>
                    <select
                      required
                      value={formData.customer_type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customer_type: e.target.value,
                        })
                      }
                      className={styles.select}
                    >
                      <option value="B2B">B2B</option>
                      <option value="B2C">B2C</option>
                      <option value="B2G">B2G</option>
                      <option value="Export">Export</option>
                    </select>
                  </div>

                  <div>
                    <label className={styles.label}>Segment</label>
                    <select
                      value={formData.segment}
                      onChange={(e) =>
                        setFormData({ ...formData, segment: e.target.value })
                      }
                      className={styles.select}
                    >
                      <option value="Enterprise">Enterprise</option>
                      <option value="SMB">SMB</option>
                      <option value="Individual">Individual</option>
                    </select>
                  </div>

                  <div>
                    <label className={styles.label}>
                      Country of Registration *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.country_of_registration}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          country_of_registration: e.target.value,
                        })
                      }
                      className={styles.input}
                      placeholder="Enter country"
                    />
                  </div>

                  <div>
                    <label className={styles.label}>Industry</label>
                    <input
                      type="text"
                      value={formData.industry_classification}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          industry_classification: e.target.value,
                        })
                      }
                      className={styles.input}
                      placeholder="Enter industry"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Contacts */}
            <div className={styles.rightCol}>
              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <h2 className={styles.cardTitle}>Contacts</h2>
                </div>

                <div className={styles.cardBody}>
                  <div className={`${styles.contactGrid} mb-3`}>
                    <div>
                      <label className={styles.label}>Name *</label>
                      <input
                        type="text"
                        placeholder="Full name"
                        value={newContact.name}
                        onChange={(e) =>
                          setNewContact({ ...newContact, name: e.target.value })
                        }
                        className={styles.input}
                      />
                    </div>

                    <div>
                      <label className={styles.label}>Role</label>
                      <input
                        type="text"
                        placeholder="Billing / Sales / Ops"
                        value={newContact.role}
                        onChange={(e) =>
                          setNewContact({ ...newContact, role: e.target.value })
                        }
                        className={styles.input}
                      />
                    </div>

                    <div>
                      <label className={styles.label}>Email *</label>
                      <input
                        type="email"
                        placeholder="name@company.com"
                        value={newContact.email}
                        onChange={(e) =>
                          setNewContact({
                            ...newContact,
                            email: e.target.value,
                          })
                        }
                        className={styles.input}
                      />
                    </div>

                    <div>
                      <label className={styles.label}>Phone</label>
                      <input
                        type="tel"
                        placeholder="+91 xxxxx xxxxx"
                        value={newContact.phone}
                        onChange={(e) =>
                          setNewContact({
                            ...newContact,
                            phone: e.target.value,
                          })
                        }
                        className={styles.input}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={addContact}
                    disabled={!canAddContact}
                    className={styles.plusBtn}
                    title={
                      !canAddContact ? "Enter Name and Email" : "Add contact"
                    }
                  >
                    <Plus className="h-5 w-5" />
                    <span className="ml-2 text-sm font-medium">
                      Add Contact
                    </span>
                  </button>

                  <div className="mt-5">
                    {formData.contacts.length === 0 ? (
                      <div className="text-sm text-gray-500">
                        No contacts added yet.
                        <div className="text-xs text-gray-400 mt-1">
                          Add a primary contact for billing & support.
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {formData.contacts.map((contact, index) => (
                          <div
                            key={`item-${index}`}
                            className={styles.contactItem}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className={styles.contactName}>
                                  {contact.name}
                                </span>
                                {contact.is_primary ? (
                                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                    Primary
                                  </span>
                                ) : null}
                              </div>
                              <div className={styles.contactMeta}>
                                {contact.email}
                                {contact.role ? ` • ${contact.role}` : ""}
                                {contact.phone ? ` • ${contact.phone}` : ""}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeContact(index)}
                              className={styles.deleteBtn}
                              title="Remove contact"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className={styles.actionsBar}>
            <button type="button" onClick={goBack} className={styles.btnCancel}>
              <X className="h-4 w-4" />
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className={styles.btnPrimary}
            >
              <Save className="h-4 w-4" />
              {loading ? "Creating..." : "Create Customer"}
            </button>
          </div>
        </form>

        {/* Footer */}
        <footer className={styles.footer}>
          © {new Date().getFullYear()} Innovate Books. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default CustomersCreate;
