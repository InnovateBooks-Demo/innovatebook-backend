import React, { useState } from "react";
import { ChevronDown, Plus, Minus } from "lucide-react";

const defaultFaqs = [
  {
    question: "What is Innovate Books?",
    answer:
      "Innovate Books is a Business Operating System that unifies commercial decisions, execution, finance, people, and capital into one connected platform. It's not just software—it's the backbone of how modern businesses run.",
  },
  {
    question: "How is it different from traditional ERP?",
    answer:
      "Unlike traditional ERPs that operate in silos, Innovate Books connects every business function. From lead to contract to delivery to billing to payroll—everything is context-aware, governed, auditable, and explainable.",
  },
  {
    question: "What industries do you serve?",
    answer:
      "Innovate Books serves businesses across industries including Technology, Manufacturing, Services, Retail, and more. Any business that needs clarity, control, and governance in their operations can benefit.",
  },
];

export const FAQAccordion = ({
  faqs = defaultFaqs,
  variant = "default", // default, bordered, minimal
  allowMultiple = false,
  className = "",
}) => {
  const [openItems, setOpenItems] = useState([]);

  const toggleItem = (index) => {
    if (allowMultiple) {
      setOpenItems((prev) =>
        prev.includes(index)
          ? prev.filter((i) => i !== index)
          : [...prev, index],
      );
    } else {
      setOpenItems((prev) => (prev.includes(index) ? [] : [index]));
    }
  };

  const isOpen = (index) => openItems.includes(index);

  if (variant === "bordered") {
    return (
      <div className={`space-y-4 ${className}`} data-testid="faq-accordion">
        {faqs.map((faq, index) => (
          <div
            key={`faq-${index}`}
            className={`border-2 rounded-2xl transition-all duration-300 ${isOpen(index)
                ? "border-[#033F99] shadow-lg"
                : "border-slate-200 hover:border-slate-300"
              }`}
          >
            <button
              onClick={() => toggleItem(index)}
              className="w-full p-6 flex items-center justify-between text-left"
              aria-expanded={isOpen(index)}
            >
              <span className="font-bold text-slate-900 text-lg pr-4">
                {faq.question}
              </span>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isOpen(index) ? "bg-[#033F99] rotate-180" : "bg-slate-100"
                  }`}
              >
                <ChevronDown
                  className={`h-5 w-5 transition-colors ${isOpen(index) ? "text-white" : "text-slate-600"
                    }`}
                />
              </div>
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ${isOpen(index) ? "max-h-96" : "max-h-0"
                }`}
            >
              <div className="px-6 pb-6 text-slate-600 leading-relaxed">
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <div
        className={`divide-y divide-slate-200 ${className}`}
        data-testid="faq-accordion"
      >
        {faqs.map((faq, index) => (
          <div key={`faq-${index}`} className="py-6">
            <button
              onClick={() => toggleItem(index)}
              className="w-full flex items-center justify-between text-left group"
              aria-expanded={isOpen(index)}
            >
              <span className="font-semibold text-slate-900 group-hover:text-[#033F99] transition-colors pr-4">
                {faq.question}
              </span>
              {isOpen(index) ? (
                <Minus className="h-5 w-5 text-[#033F99] flex-shrink-0" />
              ) : (
                <Plus className="h-5 w-5 text-slate-400 group-hover:text-[#033F99] flex-shrink-0 transition-colors" />
              )}
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ${isOpen(index) ? "max-h-96 mt-4" : "max-h-0"
                }`}
            >
              <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default variant
  return (
    <div className={`space-y-3 ${className}`} data-testid="faq-accordion">
      {faqs.map((faq, index) => (
        <div
          key={`faq-${index}`}
          className={`bg-white rounded-xl border transition-all duration-300 ${isOpen(index)
              ? "border-[#033F99]/30 shadow-md"
              : "border-slate-200 hover:border-slate-300"
            }`}
        >
          <button
            onClick={() => toggleItem(index)}
            className="w-full p-5 flex items-center justify-between text-left"
            aria-expanded={isOpen(index)}
          >
            <span className="font-semibold text-slate-900 pr-4">
              {faq.question}
            </span>
            <ChevronDown
              className={`h-5 w-5 text-slate-500 flex-shrink-0 transition-transform duration-300 ${isOpen(index) ? "rotate-180" : ""
                }`}
            />
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ${isOpen(index) ? "max-h-96" : "max-h-0"
              }`}
          >
            <div className="px-5 pb-5 text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
              {faq.answer}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FAQAccordion;
