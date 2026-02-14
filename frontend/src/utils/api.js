import axios from 'axios';
import { getAuthHeaders } from './auth';

// Ensure API_URL always ends with /api
let envUrl = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000";
// Remove trailing slash if present
if (envUrl.endsWith("/")) envUrl = envUrl.slice(0, -1);
// Append /api if not present
const API_URL = envUrl.endsWith("/api") ? envUrl : `${envUrl}/api`;

const api = axios.create({
  baseURL: API_URL,
});

console.log("[API] baseURL:", api.defaults.baseURL);

// Add auth header to all requests
// api.interceptors.request.use((config) => {
//   const headers = getAuthHeaders();
//   config.headers = { ...config.headers, ...headers };
//   return config;
// });

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);




// Dashboard APIs
export const dashboardAPI = {
  getMetrics: () => api.get('/dashboard/metrics'),
};

// Customer APIs
export const customerAPI = {
  getAll: () => api.get('/customers'),
  getById: (id) => api.get(`/customers/${id}`),
  getDetails: (id) => api.get(`/customers/${id}/details`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/customers/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadFile: (formData) => api.post('/customers/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  downloadTemplate: () => api.get('/templates/customers', { responseType: 'blob' }),
  exportToExcel: () => api.get('/customers/export/excel', { responseType: 'blob' }),
};

// Vendor APIs
export const vendorAPI = {
  getAll: () => api.get('/vendors'),
  getById: (id) => api.get(`/vendors/${id}`),
  getDetails: (id) => api.get(`/vendors/${id}/details`),
  create: (data) => api.post('/vendors', data),
  update: (id, data) => api.put(`/vendors/${id}`, data),
  delete: (id) => api.delete(`/vendors/${id}`),
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/vendors/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  downloadTemplate: () => api.get('/templates/vendors', { responseType: 'blob' }),
};

// Invoice APIs
export const invoiceAPI = {
  getAll: () => api.get('/invoices'),
  getById: (id) => api.get(`/invoices/${id}`),
  getDetails: (id) => api.get(`/invoices/${id}/details`),
  getAging: () => api.get('/invoices/aging'),
  create: (data) => api.post('/invoices', data),
  update: (id, data) => api.put(`/invoices/${id}`, data),
  delete: (id) => api.delete(`/invoices/${id}`),
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/invoices/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadFile: (formData) => api.post('/invoices/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  downloadTemplate: () => api.get('/templates/invoices', { responseType: 'blob' }),
  createBill: (data) => api.post('/bills', data),
};

// Cash Flow APIs
export const cashFlowAPI = {
  getSummary: (params) => api.get('/cashflow/actuals/summary', { params }),
  getTransactions: (params) => api.get('/cashflow/actuals/transactions', { params }),
  getStatement: (params) => api.get('/cashflow/actuals/statement', { params }),
  getCharts: (params) => api.get('/cashflow/actuals/charts', { params }),
  getBudget: () => api.get('/cashflow/budget'),
  getForecast: () => api.get('/cashflow/forecast'),
  generateAIForecast: () => api.post('/cashflow/forecast/generate'),
  getVariance: (period) => api.get(`/cashflow/variance?period=${period}`)
};

// Collections APIs
export const collectionsAPI = {
  getAll: () => api.get('/collections'),
  updateStatus: (invoiceId, status, comment) =>
    api.post(`/collections/${invoiceId}/status`, { status, comment }),
};

// Bill APIs
export const billAPI = {
  getAll: () => api.get('/bills'),
  getById: (id) => api.get(`/bills/${id}`),
  getDetails: (id) => api.get(`/bills/${id}/details`),
  getAging: () => api.get('/bills/aging'),
  create: (data) => api.post('/bills', data),
  update: (id, data) => api.put(`/bills/${id}`, data),
  delete: (id) => api.delete(`/bills/${id}`),
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/bills/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  downloadTemplate: () => api.get('/templates/bills', { responseType: 'blob' }),
};

// Payments APIs
export const paymentsAPI = {
  getAll: () => api.get('/payments'),
  updateStatus: (billId, status, comment, scheduledDate = null) =>
    api.post(`/payments/${billId}/status`, { status, comment, scheduled_date: scheduledDate }),
};

// Bank Account APIs
export const bankAPI = {
  getAccounts: () => api.get('/bank-accounts'),
  createAccount: (data) => api.post('/bank-accounts', data),
  updateAccount: (id, data) => api.put(`/bank-accounts/${id}`, data),
  deleteAccount: (id) => api.delete(`/bank-accounts/${id}`),
  getTransactions: () => api.get('/transactions'),
  createTransaction: (data) => api.post('/transactions', data),
  deleteTransaction: (id) => api.delete(`/transactions/${id}`),
  getMatchSuggestions: (transactionId) => api.get(`/transactions/${transactionId}/match-suggestions-enhanced`),
  matchTransaction: (transactionId, entityType, entityId) =>
    api.post(`/transactions/${transactionId}/match`, null, {
      params: { entity_type: entityType, entity_id: entityId }
    }),
  matchTransactionManual: (transactionId, matches) =>
    api.post(`/transactions/${transactionId}/match-manual`, matches),
  dematchTransaction: (transactionId) => api.post(`/transactions/${transactionId}/dematch`),
  getTransactionDetails: (transactionId) => api.get(`/transactions/${transactionId}/details`),
  reconcileTransactions: (transactionIds, period) =>
    api.post('/transactions/reconcile', { transaction_ids: transactionIds, period }),
  deReconcileTransaction: (transactionId) =>
    api.post(`/transactions/${transactionId}/de-reconcile`),
  uploadTransactions: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/transactions/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  downloadTransactionTemplate: () => api.get('/templates/transactions', { responseType: 'blob' }),
};


// Category Master APIs
export const categoryAPI = {
  getAllCategories: () => api.get('/categories'),
  getAll: (params) => api.get('/categories', { params }),
  getById: (id) => api.get(`/categories/${id}`),
  getStats: () => api.get('/categories/summary/stats'),
  create: (data) => api.post('/categories', data),
  getOperatingInflows: () => api.get('/categories', {
    params: { cashflow_activity: 'Operating', cashflow_flow: 'Inflow' }
  }),
  getOperatingOutflows: () => api.get('/categories', {
    params: { cashflow_activity: 'Operating', cashflow_flow: 'Outflow' }
  }),
};

// Journal Entry APIs
export const journalAPI = {
  getAll: (params) => api.get('/journal-entries', { params }),
  getById: (id) => api.get(`/journal-entries/${id}`),
  create: (data) => api.post('/journal-entries', data),
  delete: (id) => api.delete(`/journal-entries/${id}`),
  getInvoiceJournal: (invoiceId) => api.get(`/invoices/${invoiceId}/journal`),
  getBillJournal: (billId) => api.get(`/bills/${billId}/journal`),
};

// Cash Flow APIs - consolidated with actuals endpoints above

// Reports APIs
export const reportAPI = {
  getARSummary: () => api.get('/reports/ar-summary'),
  getAPSummary: () => api.get('/reports/ap-summary'),
};

// Financial Reporting APIs
export const financialReportingAPI = {
  getProfitLoss: (params) => api.get('/reports/profit-loss', { params }),
  getBalanceSheet: (params) => api.get('/reports/balance-sheet', { params }),
  getCashFlowStatement: (params) => api.get('/reports/cashflow-statement', { params }),
  getTrialBalance: (params) => api.get('/reports/trial-balance', { params }),
  getGeneralLedger: (params) => api.get('/reports/general-ledger', { params }),
};

export default api;






// import axios from "axios";
// import { getAuthHeaders } from "./auth";

// /**
//  * =====================================
//  * ✅ FIX 1: Correct backend base URL
//  * =====================================
//  * Backend runs on http://127.0.0.1:8000 locally
//  * No hardcoded /api unless backend explicitly uses it
//  */
// const API_URL = process.env.REACT_APP_BACKEND_URL;

// /**
//  * Axios instance
//  */
// const api = axios.create({
//   baseURL: API_URL,

//   /**
//    * ✅ FIX 2: Enable cookies (FastAPI auth/session support)
//    */
//   withCredentials: true,
// });

// /**
//  * Attach auth headers automatically
//  */
// api.interceptors.request.use(
//   (config) => {
//     const headers = getAuthHeaders();

//     config.headers = {
//       ...config.headers,
//       ...headers,
//     };

//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// /* =========================
//    AUTH APIs
// ========================= */

// export const authAPI = {
//   login: (email, password) =>
//     api.post("/auth/login", { email, password }),

//   logout: () => api.post("/auth/logout"),

//   me: () => api.get("/auth/me"),
// };

// /* =========================
//    DASHBOARD
// ========================= */

// export const dashboardAPI = {
//   getMetrics: () => api.get("/dashboard/metrics"),
// };

// /* =========================
//    CUSTOMER
// ========================= */

// export const customerAPI = {
//   getAll: () => api.get("/customers"),
//   getById: (id) => api.get(`/customers/${id}`),
//   getDetails: (id) => api.get(`/customers/${id}/details`),
//   create: (data) => api.post("/customers", data),
//   update: (id, data) => api.put(`/customers/${id}`, data),
//   delete: (id) => api.delete(`/customers/${id}`),
// };

// /* =========================
//    VENDOR
// ========================= */

// export const vendorAPI = {
//   getAll: () => api.get("/vendors"),
//   getById: (id) => api.get(`/vendors/${id}`),
//   create: (data) => api.post("/vendors", data),
//   update: (id, data) => api.put(`/vendors/${id}`, data),
//   delete: (id) => api.delete(`/vendors/${id}`),
// };

// /* =========================
//    INVOICE
// ========================= */

// export const invoiceAPI = {
//   getAll: () => api.get("/invoices"),
//   getById: (id) => api.get(`/invoices/${id}`),
//   create: (data) => api.post("/invoices", data),
//   update: (id, data) => api.put(`/invoices/${id}`, data),
//   delete: (id) => api.delete(`/invoices/${id}`),
// };

// /* =========================
//    BILL (🔥 REQUIRED)
// ========================= */

// export const billAPI = {
//   getAll: () => api.get("/bills"),
//   getById: (id) => api.get(`/bills/${id}`),
//   getDetails: (id) => api.get(`/bills/${id}/details`),
//   create: (data) => api.post("/bills", data),
//   update: (id, data) => api.put(`/bills/${id}`, data),
//   delete: (id) => api.delete(`/bills/${id}`),
// };

// /* =========================
//    BANKING (🔥 REQUIRED)
// ========================= */

// export const bankAPI = {
//   getAccounts: () => api.get("/bank-accounts"),
//   createAccount: (data) => api.post("/bank-accounts", data),
//   updateAccount: (id, data) => api.put(`/bank-accounts/${id}`, data),
//   deleteAccount: (id) => api.delete(`/bank-accounts/${id}`),

//   getTransactions: () => api.get("/transactions"),
//   matchTransaction: (transactionId, payload) =>
//     api.post(`/transactions/${transactionId}/match`, payload),
// };

// /* =========================
//    CASH FLOW (🔥 REQUIRED)
// ========================= */

// export const cashFlowAPI = {
//   getSummary: () => api.get("/cashflow/actuals/summary"),
//   getTransactions: () => api.get("/cashflow/actuals/transactions"),
//   getForecast: () => api.get("/cashflow/forecast"),
//   getVariance: (period) =>
//     api.get(`/cashflow/variance?period=${period}`),
// };

// /* =========================
//    CATEGORY (🔥 REQUIRED)
// ========================= */

// export const categoryAPI = {
//   getAll: () => api.get("/categories"),
//   create: (data) => api.post("/categories", data),
// };

// /* =========================
//    REPORTS (🔥 REQUIRED)
// ========================= */

// export const reportAPI = {
//   getARSummary: () => api.get("/reports/ar-summary"),
//   getAPSummary: () => api.get("/reports/ap-summary"),
// };




// /* =========================
//    JOURNAL ENTRIES (🔥 REQUIRED)
// ========================= */

// export const journalAPI = {
//   getAll: (params) => api.get("/journal-entries", { params }),
//   getById: (id) => api.get(`/journal-entries/${id}`),
//   create: (data) => api.post("/journal-entries", data),
//   delete: (id) => api.delete(`/journal-entries/${id}`),

//   // Bill & Invoice journals
//   getInvoiceJournal: (invoiceId) =>
//     api.get(`/invoices/${invoiceId}/journal`),

//   getBillJournal: (billId) =>
//     api.get(`/bills/${billId}/journal`),
// };


// /* =========================
//    PAYMENTS
// ========================= */

// export const paymentsAPI = {
//   getAll: () => api.get("/payments"),
//   updateStatus: (id, status) =>
//     api.post(`/payments/${id}/status`, { status }),
// };

// /* =========================
//    DEFAULT EXPORT
// ========================= */

// export default api;




/**
 * ======================================================
 * ❌ OLD IMPLEMENTATION (COMMENTED – DO NOT USE)
 * ======================================================
 * Problems:
 * - Mixed base URLs
 * - Manual axios usage everywhere
 * - Auth headers not guaranteed
 * - Hard to maintain in large SaaS apps
 */

// import axios from 'axios';
// import { getAuthHeaders } from './auth';
// const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';
// const api = axios.create({ baseURL: API_URL });
// api.interceptors.request.use((config) => {
//   const headers = getAuthHeaders();
//   config.headers = { ...config.headers, ...headers };
//   return config;
// });
// export default api;

// /**
//  * ======================================================
//  * ✅ NEW IMPLEMENTATION (USE THIS)
//  * ======================================================
//  */

// import axios from "axios";
// import { getAuthHeaders } from "./auth";

// /**
//  * ======================================================
//  * ✅ FIX 1: Correct backend base URL
//  * ------------------------------------------------------
//  * Backend runs on:
//  *   http://127.0.0.1:8000
//  *
//  * All backend routes already start with /api/...
//  * So we DO NOT append /api here
//  * ======================================================
//  */
// const API_URL = process.env.REACT_APP_BACKEND_URL;

// /**
//  * ======================================================
//  * ✅ FIX 2: Create ONE centralized Axios instance
//  * ------------------------------------------------------
//  * Benefits:
//  * - Single source of truth
//  * - Auto auth headers
//  * - Easy debugging
//  * - Enterprise-grade pattern
//  * ======================================================
//  */
// const api = axios.create({
//   baseURL: API_URL,

//   // Required for FastAPI + cookies (safe even if unused)
//   withCredentials: false,
// });

// /**
//  * ======================================================
//  * ✅ FIX 3: Automatically attach auth headers
//  * ------------------------------------------------------
//  * This ensures EVERY request has:
//  *   AUTH_HEADER <token>
//  * ======================================================
//  */
// api.interceptors.request.use(
//   (config) => {
//     const headers = getAuthHeaders();

//     config.headers = {
//       ...config.headers,
//       ...headers,
//     };

//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// /* =====================================================
//    AUTH APIs
// ===================================================== */

// export const authAPI = {
//   login: (email, password) =>
//     api.post("/api/auth/login", { email, password }),

//   logout: () => api.post("/api/auth/logout"),

//   me: () => api.get("/api/auth/me"),
// };

// /* =====================================================
//    DASHBOARD
// ===================================================== */

// export const dashboardAPI = {
//   getMetrics: () => api.get("/api/dashboard/metrics"),
// };

// /* =====================================================
//    CUSTOMERS (🔥 FIXED PATH)
//    Backend expects:
//    /api/commerce/parties/customers
// ===================================================== */

// export const customerAPI = {
//   getAll: () =>
//     api.get("/api/commerce/parties/customers"),

//   getById: (id) =>
//     api.get(`/api/commerce/parties/customers/${id}`),

//   create: (data) =>
//     api.post("/api/commerce/parties/customers", data),

//   update: (id, data) =>
//     api.put(`/api/commerce/parties/customers/${id}`, data),

//   delete: (id) =>
//     api.delete(`/api/commerce/parties/customers/${id}`),
// };

// /* =====================================================
//    VENDORS
// ===================================================== */

// export const vendorAPI = {
//   getAll: () => api.get("/api/vendors"),
//   getById: (id) => api.get(`/api/vendors/${id}`),
//   create: (data) => api.post("/api/vendors", data),
//   update: (id, data) => api.put(`/api/vendors/${id}`, data),
//   delete: (id) => api.delete(`/api/vendors/${id}`),
// };

// /* =====================================================
//    INVOICES
// ===================================================== */

// export const invoiceAPI = {
//   getAll: () => api.get("/api/invoices"),
//   getById: (id) => api.get(`/api/invoices/${id}`),
//   create: (data) => api.post("/api/invoices", data),
//   update: (id, data) => api.put(`/api/invoices/${id}`, data),
//   delete: (id) => api.delete(`/api/invoices/${id}`),
// };

// /* =====================================================
//    BILLS
// ===================================================== */

// export const billAPI = {
//   getAll: () => api.get("/api/bills"),
//   getById: (id) => api.get(`/api/bills/${id}`),
//   getDetails: (id) => api.get(`/api/bills/${id}/details`),
//   create: (data) => api.post("/api/bills", data),
//   update: (id, data) => api.put(`/api/bills/${id}`, data),
//   delete: (id) => api.delete(`/api/bills/${id}`),
// };

// /* =====================================================
//    BANKING
// ===================================================== */

// export const bankAPI = {
//   getAccounts: () => api.get("/api/bank-accounts"),
//   createAccount: (data) => api.post("/api/bank-accounts", data),
//   updateAccount: (id, data) =>
//     api.put(`/api/bank-accounts/${id}`, data),
//   deleteAccount: (id) =>
//     api.delete(`/api/bank-accounts/${id}`),

//   getTransactions: () => api.get("/api/transactions"),
// };

// /* =====================================================
//    CASH FLOW
// ===================================================== */

// export const cashFlowAPI = {
//   getSummary: () => api.get("/api/cashflow/actuals/summary"),
//   getTransactions: () =>
//     api.get("/api/cashflow/actuals/transactions"),
//   getForecast: () => api.get("/api/cashflow/forecast"),
//   getVariance: (period) =>
//     api.get(`/api/cashflow/variance?period=${period}`),
// };

// /* =====================================================
//    CATEGORIES
// ===================================================== */

// export const categoryAPI = {
//   getAll: () => api.get("/api/categories"),
//   create: (data) => api.post("/api/categories", data),
// };

// /* =====================================================
//    JOURNAL ENTRIES
// ===================================================== */

// export const journalAPI = {
//   getAll: (params) =>
//     api.get("/api/journal-entries", { params }),

//   getById: (id) =>
//     api.get(`/api/journal-entries/${id}`),

//   create: (data) =>
//     api.post("/api/journal-entries", data),

//   delete: (id) =>
//     api.delete(`/api/journal-entries/${id}`),

//   getInvoiceJournal: (invoiceId) =>
//     api.get(`/api/invoices/${invoiceId}/journal`),

//   getBillJournal: (billId) =>
//     api.get(`/api/bills/${billId}/journal`),
// };

// /* =====================================================
//    PAYMENTS
// ===================================================== */

// export const paymentsAPI = {
//   getAll: () => api.get("/api/payments"),
//   updateStatus: (id, status) =>
//     api.post(`/api/payments/${id}/status`, { status }),
// };




// /* =========================
//    REPORTS
// ========================= */

// export const reportAPI = {
//   getARSummary: () => api.get("/reports/ar-summary"),
//   getAPSummary: () => api.get("/reports/ap-summary"),
//   getProfitLoss: (params) =>
//     api.get("/reports/profit-loss", { params }),
//   getBalanceSheet: (params) =>
//     api.get("/reports/balance-sheet", { params }),
//   getCashFlowStatement: (params) =>
//     api.get("/reports/cashflow-statement", { params }),
//   getTrialBalance: (params) =>
//     api.get("/reports/trial-balance", { params }),
//   getGeneralLedger: (params) =>
//     api.get("/reports/general-ledger", { params }),
// };


// /* =====================================================
//    DEFAULT EXPORT
// ===================================================== */

// export default api;
