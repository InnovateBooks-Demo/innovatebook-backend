import React from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const InteractiveCard = ({
  icon: Icon,
  title,
  description,
  link,
  linkText = "Learn more",
  variant = "default", // default, highlight, dark
  className = "",
}) => {
  const baseClasses =
    "group relative p-8 rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden";

  const variants = {
    default:
      "bg-white border-2 border-slate-100 hover:border-[#033F99]/30 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(3,63,153,0.15)]",
    highlight:
      "bg-gradient-to-br from-[#033F99] to-[#033F99] text-white hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(3,63,153,0.4)]",
    dark: "bg-slate-900 text-white border border-slate-800 hover:border-[#033F99]/50 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(3,63,153,0.3)]",
  };

  const iconBgVariants = {
    default: "bg-[#033F99]/10 group-hover:bg-[#033F99]/20",
    highlight: "bg-white/20 group-hover:bg-white/30",
    dark: "bg-[#033F99] group-hover:bg-[#033F99]/80",
  };

  const textVariants = {
    default: { title: "text-slate-900", desc: "text-slate-600" },
    highlight: { title: "text-white", desc: "text-white/80" },
    dark: { title: "text-white", desc: "text-slate-400" },
  };

  const CardContent = () => (
    <>
      {/* Animated background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#033F99]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        {Icon && (
          <div
            className={`w-14 h-14 rounded-xl ${iconBgVariants[variant]} flex items-center justify-center mb-6 transition-all duration-300`}
          >
            <Icon
              className={`h-7 w-7 ${variant === "default" ? "text-[#033F99]" : "text-white"}`}
            />
          </div>
        )}

        <h3 className={`text-xl font-bold mb-3 ${textVariants[variant].title}`}>
          {title}
        </h3>

        <p
          className={`text-base leading-relaxed mb-4 ${textVariants[variant].desc}`}
        >
          {description}
        </p>

        {link && (
          <div
            className={`flex items-center gap-2 font-semibold ${variant === "default" ? "text-[#033F99]" : "text-white"} group-hover:gap-3 transition-all duration-300`}
          >
            <span>{linkText}</span>
            <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-300" />
          </div>
        )}
      </div>
    </>
  );

  if (link) {
    return (
      <Link
        to={link}
        className={`${baseClasses} ${variants[variant]} ${className}`}
        data-testid={`interactive-card-${title?.toLowerCase().replace(/\s+/g, "-")}`}
      >
        <CardContent />
      </Link>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variants[variant]} ${className}`}
      data-testid={`interactive-card-${title?.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <CardContent />
    </div>
  );
};

export default InteractiveCard;
