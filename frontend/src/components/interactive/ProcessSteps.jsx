import React from "react";
import { CheckCircle, ArrowRight } from "lucide-react";

export const ProcessSteps = ({
  steps,
  variant = "horizontal", // horizontal, vertical, numbered
  className = "",
}) => {
  if (variant === "vertical") {
    return (
      <div
        className={`relative ${className}`}
        data-testid="process-steps-vertical"
      >
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#033F99] to-[#033F99]/20" />

        <div className="space-y-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={`step-${step.title}-${index}`}
                className="relative pl-16 group"
              >
                {/* Step circle */}
                <div className="absolute left-0 w-12 h-12 rounded-full bg-white border-2 border-[#033F99] flex items-center justify-center group-hover:bg-[#033F99] transition-all duration-300 z-10">
                  {Icon ? (
                    <Icon className="h-5 w-5 text-[#033F99] group-hover:text-white transition-colors duration-300" />
                  ) : (
                    <span className="font-bold text-[#033F99] group-hover:text-white transition-colors duration-300">
                      {index + 1}
                    </span>
                  )}
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-100 hover:border-[#033F99]/30 hover:shadow-lg transition-all duration-300">
                  <h3 className="font-bold text-slate-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (variant === "numbered") {
    return (
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}
        data-testid="process-steps-numbered"
      >
        {steps.map((step, index) => (
          <div
            key={`step-${step.title}-${index}`}
            className="relative bg-white p-8 rounded-2xl border border-slate-100 hover:border-[#033F99]/30 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group"
          >
            {/* Step number */}
            <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-[#033F99] flex items-center justify-center">
              <span className="font-bold text-white">{index + 1}</span>
            </div>

            {/* Connector arrow */}
            {index < steps.length - 1 && (
              <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                <ArrowRight className="h-6 w-6 text-[#033F99]/30" />
              </div>
            )}

            <div className="pt-4">
              <h3 className="font-bold text-slate-900 mb-2">{step.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Horizontal variant (default)
  return (
    <div
      className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${className}`}
      data-testid="process-steps-horizontal"
    >
      {steps.map((step, index) => {
        const Icon = step.icon || CheckCircle;
        return (
          <React.Fragment key={`step-${step.title}-${index}`}>
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-full bg-[#033F99]/10 group-hover:bg-[#033F99] flex items-center justify-center transition-all duration-300">
                <Icon className="h-6 w-6 text-[#033F99] group-hover:text-white transition-colors duration-300" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{step.title}</h4>
                {step.description && (
                  <p className="text-slate-500 text-sm">{step.description}</p>
                )}
              </div>
            </div>

            {index < steps.length - 1 && (
              <div className="hidden md:block">
                <ArrowRight className="h-5 w-5 text-slate-300" />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default ProcessSteps;
