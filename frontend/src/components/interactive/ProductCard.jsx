import React from "react";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";

export const ProductCard = ({
  icon: Icon,
  title,
  subtitle,
  description,
  features = [],
  link,
  linkText = "Know more",
  badge,
  variant = "default", // default, featured, horizontal
  className = "",
}) => {
  if (variant === "horizontal") {
    return (
      <Link
        to={link || "#"}
        className={`group flex gap-6 p-6 bg-white rounded-2xl border border-slate-100 hover:border-[#033F99]/30 hover:shadow-xl transition-all duration-300 ${className}`}
        data-testid={`product-card-${title?.toLowerCase().replace(/\s+/g, "-")}`}
      >
        {Icon && (
          <div className="w-16 h-16 rounded-2xl bg-[#033F99]/10 group-hover:bg-[#033F99] flex items-center justify-center flex-shrink-0 transition-all duration-300">
            <Icon className="h-8 w-8 text-[#033F99] group-hover:text-white transition-colors duration-300" />
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">{title}</h3>
              {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
            </div>
            {badge && (
              <span className="px-2 py-1 bg-[#033F99]/10 text-[#033F99] text-xs font-semibold rounded-full">
                {badge}
              </span>
            )}
          </div>

          <p className="text-slate-600 text-sm mb-4">{description}</p>

          <div className="flex items-center gap-2 text-[#033F99] font-semibold text-sm group-hover:gap-3 transition-all duration-300">
            <span>{linkText}</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <div
        className={`relative bg-gradient-to-br from-[#033F99] to-[#033F99] p-8 rounded-3xl text-white overflow-hidden ${className}`}
        data-testid={`product-card-${title?.toLowerCase().replace(/\s+/g, "-")}`}
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />

        <div className="relative z-10">
          {badge && (
            <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold mb-4">
              {badge}
            </span>
          )}

          {Icon && (
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
              <Icon className="h-8 w-8 text-white" />
            </div>
          )}

          <h3 className="text-2xl font-bold mb-2">{title}</h3>
          {subtitle && <p className="text-white/70 mb-4">{subtitle}</p>}
          <p className="text-white/80 leading-relaxed mb-6">{description}</p>

          {features.length > 0 && (
            <ul className="space-y-2 mb-6">
              {features.map((feature, index) => (
                <li
                  key={`feature-${index}`}
                  className="flex items-center gap-2 text-white/90"
                >
                  <Check className="h-4 w-4 text-white" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          )}

          {link && (
            <Link
              to={link}
              className="inline-flex items-center gap-2 bg-white text-[#033F99] px-6 py-3 rounded-xl font-semibold hover:bg-slate-100 transition-colors"
            >
              {linkText}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <Link
      to={link || "#"}
      className={`group block p-6 bg-white rounded-2xl border-2 border-slate-100 hover:border-[#033F99] hover:-translate-y-2 hover:shadow-xl transition-all duration-300 ${className}`}
      data-testid={`product-card-${title?.toLowerCase().replace(/\s+/g, "-")}`}
    >
      {badge && (
        <span className="inline-block px-2 py-1 bg-[#033F99]/10 text-[#033F99] text-xs font-semibold rounded-full mb-4">
          {badge}
        </span>
      )}

      {Icon && (
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#033F99]/10 to-[#033F99]/5 group-hover:from-[#033F99] group-hover:to-[#033F99] flex items-center justify-center mb-4 transition-all duration-300">
          <Icon className="h-7 w-7 text-[#033F99] group-hover:text-white transition-colors duration-300" />
        </div>
      )}

      <h3 className="font-bold text-slate-900 text-lg mb-1">{title}</h3>
      {subtitle && (
        <p className="text-sm text-[#033F99] font-medium mb-2">{subtitle}</p>
      )}
      <p className="text-slate-600 text-sm leading-relaxed mb-4">
        {description}
      </p>

      <div className="flex items-center gap-2 text-[#033F99] font-semibold text-sm group-hover:gap-3 transition-all duration-300">
        <span>{linkText}</span>
        <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-300" />
      </div>
    </Link>
  );
};

export default ProductCard;
