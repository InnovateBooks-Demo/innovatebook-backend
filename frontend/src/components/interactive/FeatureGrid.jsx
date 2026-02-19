import React from "react";

export const FeatureGrid = ({
  features,
  columns = 3, // 2, 3, 4
  variant = "default", // default, compact, icon-left
  className = "",
}) => {
  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  };

  const renderFeature = (feature, index) => {
    const Icon = feature.icon;

    if (variant === "icon-left") {
      return (
        <div
          key={`feature-${feature.title}-${index}`}
          className="flex gap-4 p-6 rounded-xl bg-white border border-slate-100 hover:border-[#033F99]/30 hover:shadow-lg transition-all duration-300 group"
          data-testid={`feature-${feature.title?.toLowerCase().replace(/\s+/g, "-")}`}
        >
          {Icon && (
            <div className="w-12 h-12 rounded-lg bg-[#033F99]/10 group-hover:bg-[#033F99] flex items-center justify-center flex-shrink-0 transition-all duration-300">
              <Icon className="h-6 w-6 text-[#033F99] group-hover:text-white transition-colors duration-300" />
            </div>
          )}
          <div>
            <h3 className="font-bold text-slate-900 mb-1">{feature.title}</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {feature.description}
            </p>
          </div>
        </div>
      );
    }

    if (variant === "compact") {
      return (
        <div
          key={`feature-${feature.title}-${index}`}
          className="text-center p-6 rounded-xl hover:bg-slate-50 transition-all duration-300 group"
          data-testid={`feature-${feature.title?.toLowerCase().replace(/\s+/g, "-")}`}
        >
          {Icon && (
            <div className="w-14 h-14 mx-auto rounded-xl bg-[#033F99]/10 group-hover:bg-[#033F99]/20 flex items-center justify-center mb-4 transition-all duration-300">
              <Icon className="h-7 w-7 text-[#033F99]" />
            </div>
          )}
          <h3 className="font-bold text-slate-900 mb-2">{feature.title}</h3>
          <p className="text-slate-600 text-sm">{feature.description}</p>
        </div>
      );
    }

    // Default variant
    return (
      <div
        key={`feature-${feature.title}-${index}`}
        className="bg-white p-8 rounded-2xl border border-slate-100 hover:border-[#033F99]/30 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group"
        data-testid={`feature-${feature.title?.toLowerCase().replace(/\s+/g, "-")}`}
      >
        {Icon && (
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#033F99]/10 to-[#033F99]/5 group-hover:from-[#033F99]/20 group-hover:to-[#033F99]/10 flex items-center justify-center mb-6 transition-all duration-300">
            <Icon className="h-7 w-7 text-[#033F99]" />
          </div>
        )}
        <h3 className="text-xl font-bold text-slate-900 mb-3">
          {feature.title}
        </h3>
        <p className="text-slate-600 leading-relaxed">{feature.description}</p>
        {feature.stats && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <span className="text-2xl font-bold text-[#033F99]">
              {feature.stats}
            </span>
            {feature.statsLabel && (
              <span className="text-slate-500 text-sm ml-2">
                {feature.statsLabel}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`grid grid-cols-1 ${gridCols[columns]} gap-6 ${className}`}>
      {features.map((feature, index) => renderFeature(feature, index))}
    </div>
  );
};

export default FeatureGrid;
