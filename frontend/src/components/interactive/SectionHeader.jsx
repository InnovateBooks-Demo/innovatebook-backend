import React from "react";

export const SectionHeader = ({
  badge,
  title,
  subtitle,
  alignment = "center", // center, left
  variant = "default", // default, large, compact
  className = "",
}) => {
  const alignmentClasses = {
    center: "text-center mx-auto",
    left: "text-left",
  };

  const sizeClasses = {
    default: {
      title: "text-3xl md:text-4xl",
      subtitle: "text-lg",
      maxWidth: "max-w-3xl",
    },
    large: {
      title: "text-4xl md:text-5xl",
      subtitle: "text-xl",
      maxWidth: "max-w-4xl",
    },
    compact: {
      title: "text-2xl md:text-3xl",
      subtitle: "text-base",
      maxWidth: "max-w-2xl",
    },
  };

  const sizes = sizeClasses[variant];

  return (
    <div
      className={`mb-12 ${alignmentClasses[alignment]} ${alignment === "center" ? sizes.maxWidth : ""} ${className}`}
      data-testid="section-header"
    >
      {badge && (
        <span className="inline-block px-4 py-1.5 bg-[#033F99]/10 text-[#033F99] text-sm font-semibold rounded-full mb-4">
          {badge}
        </span>
      )}

      <h2 className={`${sizes.title} font-bold text-slate-900 mb-4`}>
        {title}
      </h2>

      {subtitle && (
        <p className={`${sizes.subtitle} text-slate-600 leading-relaxed`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;
