import React from "react";
import { Check, X, Minus } from "lucide-react";

export const ComparisonTable = ({
  headers = ["Feature", "Basic", "Pro", "Enterprise"],
  rows = [],
  highlightColumn = 2, // Index of column to highlight (1-based for data columns)
  variant = "default", // default, compact
  className = "",
}) => {
  const renderCell = (value, colIndex) => {
    if (value === true) {
      return <Check className="h-5 w-5 text-[#033F99] mx-auto" />;
    }
    if (value === false) {
      return <X className="h-5 w-5 text-slate-300 mx-auto" />;
    }
    if (value === "partial") {
      return <Minus className="h-5 w-5 text-yellow-500 mx-auto" />;
    }
    return <span className="text-slate-700">{value}</span>;
  };

  if (variant === "compact") {
    return (
      <div
        className={`overflow-x-auto ${className}`}
        data-testid="comparison-table"
      >
        <table className="w-full">
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th
                  key={`header-${index}`}
                  className={`px-4 py-3 text-left text-sm font-semibold ${index === 0
                      ? "text-slate-700"
                      : "text-center text-slate-600"
                    } ${index === highlightColumn ? "bg-[#033F99]/5" : ""}`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, rowIndex) => (
              <tr key={`row-${rowIndex}`} className="hover:bg-slate-50">
                {row.map((cell, cellIndex) => (
                  <td
                    key={`cell-${rowIndex}-${cellIndex}`}
                    className={`px-4 py-3 ${cellIndex === 0
                        ? "text-slate-700 font-medium"
                        : "text-center"
                      } ${cellIndex === highlightColumn ? "bg-[#033F99]/5" : ""}`}
                  >
                    {renderCell(cell, cellIndex)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={`overflow-x-auto ${className}`}
      data-testid="comparison-table"
    >
      <table className="w-full bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
        <thead>
          <tr className="bg-slate-50">
            {headers.map((header, index) => (
              <th
                key={`header-${index}`}
                className={`px-6 py-4 text-left font-bold ${index === 0 ? "text-slate-900" : "text-center"
                  } ${index === highlightColumn ? "bg-[#033F99] text-white" : "text-slate-700"}`}
              >
                {index === highlightColumn && (
                  <span className="block text-xs font-normal opacity-70 mb-1">
                    Most Popular
                  </span>
                )}
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, rowIndex) => (
            <tr
              key={`row-${rowIndex}`}
              className="hover:bg-slate-50 transition-colors"
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={`cell-${rowIndex}-${cellIndex}`}
                  className={`px-6 py-4 ${cellIndex === 0
                      ? "text-slate-700 font-medium"
                      : "text-center"
                    } ${cellIndex === highlightColumn ? "bg-[#033F99]/5" : ""}`}
                >
                  {renderCell(cell, cellIndex)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ComparisonTable;
