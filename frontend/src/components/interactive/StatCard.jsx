import React, { useRef, useEffect, useState } from "react";
import { AnimatedCounter } from "./AnimatedCounter";

export const StatCard = ({
  value,
  label,
  prefix = "",
  suffix = "",
  description,
  icon: Icon,
  trend,
  trendLabel,
  variant = "default", // default, large, compact, dark
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  if (variant === "large") {
    return (
      <div
        ref={ref}
        className={`text-center p-8 ${className}`}
        data-testid={`stat-card-${label?.toLowerCase().replace(/\s+/g, "-")}`}
      >
        {Icon && (
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#033F99]/10 flex items-center justify-center mb-6">
            <Icon className="h-8 w-8 text-[#033F99]" />
          </div>
        )}
        <p className="text-5xl md:text-6xl font-bold text-[#033F99] mb-2">
          {isVisible ? (
            <AnimatedCounter end={value} prefix={prefix} suffix={suffix} />
          ) : (
            `${prefix}0${suffix}`
          )}
        </p>
        <p className="text-xl font-semibold text-slate-900 mb-1">{label}</p>
        {description && <p className="text-slate-500">{description}</p>}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div
        ref={ref}
        className={`flex items-center gap-4 ${className}`}
        data-testid={`stat-card-${label?.toLowerCase().replace(/\s+/g, "-")}`}
      >
        {Icon && (
          <div className="w-10 h-10 rounded-lg bg-[#033F99]/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-[#033F99]" />
          </div>
        )}
        <div>
          <p className="text-2xl font-bold text-slate-900">
            {isVisible ? (
              <AnimatedCounter end={value} prefix={prefix} suffix={suffix} />
            ) : (
              `${prefix}0${suffix}`
            )}
          </p>
          <p className="text-sm text-slate-500">{label}</p>
        </div>
      </div>
    );
  }

  if (variant === "dark") {
    return (
      <div
        ref={ref}
        className={`bg-slate-900 p-6 rounded-2xl text-center ${className}`}
        data-testid={`stat-card-${label?.toLowerCase().replace(/\s+/g, "-")}`}
      >
        <p className="text-4xl font-bold text-white mb-2">
          {isVisible ? (
            <AnimatedCounter end={value} prefix={prefix} suffix={suffix} />
          ) : (
            `${prefix}0${suffix}`
          )}
        </p>
        <p className="text-slate-400">{label}</p>
      </div>
    );
  }

  // Default variant
  return (
    <div
      ref={ref}
      className={`bg-white p-6 rounded-2xl border border-slate-100 hover:border-[#033F99]/30 hover:shadow-lg transition-all duration-300 ${className}`}
      data-testid={`stat-card-${label?.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div className="flex items-start justify-between mb-4">
        {Icon && (
          <div className="w-12 h-12 rounded-xl bg-[#033F99]/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-[#033F99]" />
          </div>
        )}
        {trend && (
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${trend > 0
                ? "bg-[#033F99]/10 text-[#033F99]"
                : "bg-red-100 text-red-700"
              }`}
          >
            {trend > 0 ? "+" : ""}
            {trend}%
          </span>
        )}
      </div>

      <p className="text-3xl font-bold text-slate-900 mb-1">
        {isVisible ? (
          <AnimatedCounter end={value} prefix={prefix} suffix={suffix} />
        ) : (
          `${prefix}0${suffix}`
        )}
      </p>
      <p className="text-slate-600 font-medium">{label}</p>
      {trendLabel && (
        <p className="text-sm text-slate-400 mt-1">{trendLabel}</p>
      )}
    </div>
  );
};

export default StatCard;
