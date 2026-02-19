import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const TabSection = ({
  tabs,
  variant = "default", // default, pills, underline
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState(0);

  const tabStyles = {
    default: {
      container:
        "flex flex-wrap gap-2 mb-8 p-1 bg-slate-100 rounded-xl w-fit mx-auto",
      tab: (isActive) =>
        `px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${isActive
          ? "bg-white text-[#033F99] shadow-sm"
          : "text-slate-600 hover:text-slate-900"
        }`,
    },
    pills: {
      container: "flex flex-wrap gap-3 mb-8 justify-center",
      tab: (isActive) =>
        `px-6 py-3 rounded-full font-semibold transition-all duration-300 border-2 ${isActive
          ? "bg-[#033F99] border-[#033F99] text-white"
          : "border-slate-200 text-slate-600 hover:border-[#033F99] hover:text-[#033F99]"
        }`,
    },
    underline: {
      container: "flex gap-8 mb-8 border-b border-slate-200 justify-center",
      tab: (isActive) =>
        `pb-4 font-semibold transition-all duration-300 relative ${isActive ? "text-[#033F99]" : "text-slate-500 hover:text-slate-700"
        } ${isActive ? "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#033F99]" : ""}`,
    },
  };

  return (
    <div className={className} data-testid="tab-section">
      {/* Tab Headers */}
      <div className={tabStyles[variant].container}>
        {tabs.map((tab, index) => (
          <button
            key={`tab-${tab.label}-${index}`}
            onClick={() => setActiveTab(index)}
            className={tabStyles[variant].tab(activeTab === index)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="relative">
        {tabs.map((tab, index) => (
          <div
            key={`content-${tab.label}-${index}`}
            className={`transition-all duration-300 ${activeTab === index
                ? "opacity-100 translate-y-0"
                : "opacity-0 absolute inset-0 pointer-events-none translate-y-4"
              }`}
          >
            {tab.content ? (
              tab.content
            ) : (
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Left: Content */}
                <div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-4">
                    {tab.title}
                  </h3>
                  <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                    {tab.description}
                  </p>

                  {tab.features && (
                    <ul className="space-y-3 mb-8">
                      {tab.features.map((feature, i) => (
                        <li
                          key={`feature-${i}`}
                          className="flex items-start gap-3"
                        >
                          <div className="w-5 h-5 rounded-full bg-[#033F99]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <div className="w-2 h-2 rounded-full bg-[#033F99]" />
                          </div>
                          <span className="text-slate-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {tab.link && (
                    <Link
                      to={tab.link}
                      className="inline-flex items-center gap-2 text-[#033F99] font-semibold hover:gap-3 transition-all duration-300"
                    >
                      {tab.linkText || "Learn more"}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>

                {/* Right: Image or Custom Content */}
                <div className="bg-gradient-to-br from-slate-50 to-[#033F99]/5 rounded-2xl p-8 aspect-video flex items-center justify-center">
                  {tab.image ? (
                    <img
                      src={tab.image}
                      alt={tab.title}
                      className="rounded-xl shadow-lg max-h-full"
                    />
                  ) : (
                    <div className="text-center">
                      {tab.icon && (
                        <tab.icon className="h-16 w-16 text-[#033F99]/30 mx-auto mb-4" />
                      )}
                      <p className="text-slate-400">Preview</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TabSection;
