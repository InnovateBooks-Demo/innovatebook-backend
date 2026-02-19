/**
 * IB Commerce Design System
 * Soft Indigo Color Palette (#6366f1)
 *
 * This file contains reusable styled components for the entire Commerce solution
 */

import React from "react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";

// ==================== COLOR PALETTE ====================
export const colors = {
  // Indigo Palette (Primary Brand)
  indigo50: "#eef2ff",
  indigo100: "#e0e7ff",
  indigo200: "#c7d2fe",
  indigo300: "#a5b4fc",
  indigo400: "#818cf8",
  indigo500: "#6366f1",
  indigo600: "#4f46e5", // PRIMARY BRAND
  indigo700: "#4338ca",
  indigo800: "#3730a3",
  indigo900: "#312e81",
};

// ==================== PAGE WRAPPER ====================
export const PageWrapper = ({ children }) => (
  <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-[#EBF3FC] via-white to-[#EBF3FC]/50">
    {children}
  </div>
);

// ==================== PAGE HEADER ====================
export const PageHeader = ({ title, subtitle, action }) => (
  <div className="flex items-center justify-between mb-6">
    <div>
      <h1
        className="text-3xl font-bold text-white"
        style={{ fontFamily: "Poppins" }}
      >
        {title}
      </h1>
      {subtitle && (
        <p className="text-[#033F99] mt-1 font-medium">{subtitle}</p>
      )}
    </div>
    {action && <div>{action}</div>}
  </div>
);

// ==================== PRIMARY BUTTON ====================
export const PrimaryButton = ({ children, onClick, icon: Icon, ...props }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#033F99] to-[#033F99] hover:from-[#033F99] hover:to-[#033F99] text-white font-semibold rounded-xl shadow-lg shadow-[#6B9FE6]/50 hover:shadow-xl hover:shadow-[#0558CC]/60 transition-all duration-200 transform hover:scale-105"
    {...props}
  >
    {Icon && <Icon className="h-5 w-5" />}
    <span>{children}</span>
  </button>
);

// ==================== SECONDARY BUTTON ====================
export const SecondaryButton = ({
  children,
  onClick,
  icon: Icon,
  ...props
}) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 px-5 py-2.5 bg-[#C4D9F4] hover:bg-[#6B9FE6] text-[#033F99] font-semibold rounded-xl transition-all duration-200"
    {...props}
  >
    {Icon && <Icon className="h-4 w-4" />}
    <span>{children}</span>
  </button>
);

// ==================== OUTLINE BUTTON ====================
export const OutlineButton = ({ children, onClick, icon: Icon, ...props }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 px-5 py-2.5 border-2 border-[#0558CC] hover:border-[#044AB3] text-[#033F99] hover:bg-[#EBF3FC] font-semibold rounded-xl transition-all duration-200"
    {...props}
  >
    {Icon && <Icon className="h-4 w-4" />}
    <span>{children}</span>
  </button>
);

// ==================== KPI CARD ====================
export const KPICard = ({
  icon: Icon,
  label,
  value,
  color = "indigo",
  trend,
}) => (
  <div className="bg-gradient-to-br from-[#EBF3FC] to-[#C4D9F4] rounded-2xl p-6 border-2 border-[#6B9FE6] shadow-md hover:shadow-xl hover:border-[#0558CC] transition-all duration-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-[#033F99] uppercase tracking-wide mb-2">
          {label}
        </p>
        <p className="text-3xl font-bold text-white">{value}</p>
        {trend && (
          <p
            className={`text-sm font-medium mt-2 ${trend >= 0 ? "text-emerald-600" : "text-red-600"}`}
          >
            {trend >= 0 ? "+" : ""}
            {trend}%
          </p>
        )}
      </div>
      {Icon && (
        <div className="w-14 h-14 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-xl flex items-center justify-center shadow-lg shadow-[#0558CC]/50">
          <Icon className="h-7 w-7 text-white" />
        </div>
      )}
    </div>
  </div>
);

// ==================== STATS CARD (Alternative KPI) ====================
export const StatsCard = ({ icon: Icon, label, value, sublabel }) => (
  <div className="bg-white rounded-2xl p-5 border-2 border-[#6B9FE6] shadow-md hover:shadow-lg hover:border-[#6B9FE6] transition-all duration-200">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-[#033F99] mb-1">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {sublabel && <p className="text-xs text-[#033F99] mt-1">{sublabel}</p>}
      </div>
      {Icon && (
        <div className="w-12 h-12 bg-[#C4D9F4] rounded-xl flex items-center justify-center">
          <Icon className="h-6 w-6 text-[#033F99]" />
        </div>
      )}
    </div>
  </div>
);

// ==================== CONTENT CARD ====================
export const ContentCard = ({ title, children, actions }) => (
  <div className="bg-white rounded-2xl shadow-lg border-2 border-[#6B9FE6] overflow-hidden hover:shadow-xl hover:border-[#6B9FE6] transition-all duration-200">
    {title && (
      <div className="px-6 py-4 bg-gradient-to-r from-[#EBF3FC] to-white border-b-2 border-[#6B9FE6] flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

// ==================== TABLE CONTAINER ====================
export const TableContainer = ({ children }) => (
  <div className="bg-white rounded-2xl shadow-lg border-2 border-[#6B9FE6] overflow-hidden">
    <div className="overflow-x-auto">{children}</div>
  </div>
);

// ==================== TABLE HEADER ====================
export const TableHeader = ({ children }) => (
  <thead className="bg-gradient-to-r from-[#EBF3FC] to-[#C4D9F4] border-b-2 border-[#6B9FE6]">
    {children}
  </thead>
);

// ==================== TABLE CELL ====================
export const TableHeaderCell = ({ children, ...props }) => (
  <th
    className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider"
    {...props}
  >
    {children}
  </th>
);

// ==================== TABLE ROW ====================
export const TableRow = ({ children, active, ...props }) => (
  <tr
    className={`border-b border-[#EBF3FC] transition-all duration-150 ${active
        ? "bg-[#C4D9F4]/50 border-l-4 border-[#033F99]"
        : "hover:bg-[#EBF3FC]/50"
      }`}
    {...props}
  >
    {children}
  </tr>
);

// ==================== STATUS BADGE ====================
export const StatusBadge = ({ status, children }) => {
  const getStatusStyle = (status) => {
    const styles = {
      Draft: "bg-[#C4D9F4] text-[#033F99]",
      Active:
        "bg-gradient-to-r from-[#033F99] to-[#033F99] text-white shadow-md",
      Pending: "bg-[#6B9FE6] text-white",
      Approved: "bg-[#033F99] text-white",
      Completed: "bg-[#033F99] text-white",
      Cancelled: "bg-slate-200 text-slate-700",
    };
    return styles[status] || "bg-[#C4D9F4] text-[#033F99]";
  };

  return (
    <span
      className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-full ${getStatusStyle(status)}`}
    >
      {children || status}
    </span>
  );
};

// ==================== SEARCH BAR ====================
export const SearchBar = ({ value, onChange, placeholder, icon: Icon }) => (
  <div className="relative flex-1">
    {Icon && (
      <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#044AB3]" />
    )}
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder || "Search..."}
      className={`w-full ${Icon ? "pl-12" : "pl-4"} pr-4 py-3 border-2 border-[#6B9FE6] rounded-xl focus:border-[#033F99] focus:ring-4 focus:ring-[#C4D9F4] outline-none transition-all duration-200 text-slate-700 font-medium`}
    />
  </div>
);

// ==================== FILTER BAR ====================
export const FilterBar = ({ children }) => (
  <div className="bg-white rounded-2xl p-4 border-2 border-[#6B9FE6] shadow-md">
    <div className="flex flex-col md:flex-row gap-4">{children}</div>
  </div>
);

// ==================== SELECT DROPDOWN ====================
export const SelectDropdown = ({ value, onChange, options, label }) => (
  <div className="flex flex-col">
    {label && (
      <label className="text-sm font-semibold text-[#033F99] mb-2">
        {label}
      </label>
    )}
    <select
      value={value}
      onChange={onChange}
      className="px-4 py-3 border-2 border-[#6B9FE6] rounded-xl focus:border-[#033F99] focus:ring-4 focus:ring-[#C4D9F4] outline-none transition-all duration-200 text-slate-700 font-medium bg-white"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

// ==================== FORM INPUT ====================
export const FormInput = ({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
}) => (
  <div className="flex flex-col">
    <label className="text-sm font-bold text-white mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className="px-4 py-3 border-2 border-[#6B9FE6] rounded-xl focus:border-[#033F99] focus:ring-4 focus:ring-[#C4D9F4] outline-none transition-all duration-200 text-slate-700 font-medium"
    />
  </div>
);

// ==================== FORM TEXTAREA ====================
export const FormTextarea = ({
  label,
  name,
  placeholder,
  value,
  onChange,
  rows = 4,
}) => (
  <div className="flex flex-col">
    <label className="text-sm font-bold text-white mb-2">{label}</label>
    <textarea
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows}
      className="px-4 py-3 border-2 border-[#6B9FE6] rounded-xl focus:border-[#033F99] focus:ring-4 focus:ring-[#C4D9F4] outline-none transition-all duration-200 text-slate-700 font-medium resize-none"
    />
  </div>
);

// ==================== FORM SELECT ====================
export const FormSelect = ({
  label,
  name,
  value,
  onChange,
  options = [],
  required,
}) => (
  <div className="flex flex-col">
    <label className="text-sm font-bold text-white mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="px-4 py-3 border-2 border-[#6B9FE6] rounded-xl focus:border-[#033F99] focus:ring-4 focus:ring-[#C4D9F4] outline-none transition-all duration-200 text-slate-700 font-medium bg-white"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

// ==================== INFO BOX ====================
export const InfoBox = ({ children, type = "info" }) => {
  const styles = {
    info: "bg-[#EBF3FC] border-[#6B9FE6] text-white",
    warning: "bg-amber-50 border-amber-200 text-amber-900",
    success: "bg-emerald-50 border-emerald-200 text-emerald-900",
    error: "bg-red-50 border-red-200 text-red-900",
  };

  return (
    <div className={`p-4 rounded-xl border-2 ${styles[type]}`}>
      <p className="text-sm font-medium">{children}</p>
    </div>
  );
};

// ==================== ACTION BUTTON GROUP ====================
export const ActionButtons = ({
  onView,
  onEdit,
  onDelete,
  viewLabel,
  editLabel,
  deleteLabel,
}) => (
  <div className="flex items-center gap-2">
    {onView && (
      <button
        onClick={onView}
        className="p-2 text-[#033F99] hover:text-white hover:bg-[#EBF3FC] rounded-lg transition-all"
        title={viewLabel || "View"}
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
      </button>
    )}
    {onEdit && (
      <button
        onClick={onEdit}
        className="p-2 text-[#033F99] hover:text-white hover:bg-[#EBF3FC] rounded-lg transition-all"
        title={editLabel || "Edit"}
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      </button>
    )}
    {onDelete && (
      <button
        onClick={onDelete}
        className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-all"
        title={deleteLabel || "Delete"}
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    )}
  </div>
);

// ==================== LOADING SPINNER ====================
export const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-96">
    <div className="w-16 h-16 border-4 border-[#6B9FE6] border-t-[#033F99] rounded-full animate-spin"></div>
  </div>
);

// ==================== EMPTY STATE ====================
export const EmptyState = ({ icon: Icon, title, message }) => (
  <div className="text-center py-16">
    {Icon && (
      <div className="flex justify-center mb-4">
        <Icon className="h-16 w-16 text-[#0558CC]" />
      </div>
    )}
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-[#033F99]">{message}</p>
  </div>
);

export default {
  colors,
  PageWrapper,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  OutlineButton,
  KPICard,
  StatsCard,
  ContentCard,
  TableContainer,
  TableHeader,
  TableHeaderCell,
  TableRow,
  StatusBadge,
  SearchBar,
  FilterBar,
  SelectDropdown,
  FormInput,
  FormTextarea,
  InfoBox,
  ActionButtons,
  LoadingSpinner,
  EmptyState,
};
