import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";

export const HeroSection = ({
  badge,
  title,
  highlightedText,
  subtitle,
  primaryCTA,
  primaryLink = "/auth/signup",
  secondaryCTA,
  secondaryLink = "/contact",
  stats = [],
  variant = "default", // default, centered, split
  children,
  className = "",
}) => {
  const renderStats = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
      {stats.map((stat, index) => (
        <div key={`stat-${index}`} className="text-center">
          <p className="text-3xl font-bold text-[#033F99]">{stat.value}</p>
          <p className="text-sm text-slate-600">{stat.label}</p>
        </div>
      ))}
    </div>
  );

  if (variant === "split") {
    return (
      <section
        className={`pt-32 pb-20 px-4 relative overflow-hidden ${className}`}
        data-testid="hero-section"
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-[#033F99]/5" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-[#033F99]/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              {badge && (
                <div className="inline-flex items-center gap-2 bg-[#033F99]/10 px-4 py-2 rounded-full text-[#033F99] font-semibold text-sm mb-6">
                  <Sparkles className="h-4 w-4" />
                  {badge}
                </div>
              )}

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                {title}
                {highlightedText && (
                  <span className="text-[#033F99]"> {highlightedText}</span>
                )}
              </h1>

              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                {subtitle}
              </p>

              <div className="flex flex-wrap gap-4">
                {primaryCTA && (
                  <Link
                    to={primaryLink}
                    className="inline-flex items-center gap-2 bg-[#033F99] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#033F99] transition-all shadow-lg shadow-[#033F99]/25"
                  >
                    {primaryCTA}
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                )}
                {secondaryCTA && (
                  <Link
                    to={secondaryLink}
                    className="inline-flex items-center gap-2 border-2 border-slate-200 text-slate-700 px-8 py-4 rounded-xl font-semibold hover:border-[#033F99] hover:text-[#033F99] transition-all"
                  >
                    {secondaryCTA}
                  </Link>
                )}
              </div>
            </div>

            <div className="relative">
              {children || (
                <div className="bg-gradient-to-br from-[#033F99]/10 to-[#033F99]/5 rounded-3xl aspect-square flex items-center justify-center">
                  <div className="text-center text-slate-400">
                    <Sparkles className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p>Hero Visual</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {stats.length > 0 && renderStats()}
        </div>
      </section>
    );
  }

  // Default centered variant
  return (
    <section
      className={`pt-32 pb-20 px-4 relative overflow-hidden ${className}`}
      data-testid="hero-section"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-[#033F99]/5" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#033F99]/5 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute top-40 right-20 w-96 h-96 bg-[#033F99]/5 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      <div className="max-w-5xl mx-auto text-center relative z-10">
        {badge && (
          <div className="inline-flex items-center gap-2 bg-[#033F99]/10 px-5 py-2.5 rounded-full text-[#033F99] font-semibold text-sm mb-8 animate-bounce-slow">
            <Sparkles className="h-4 w-4" />
            {badge}
          </div>
        )}

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
          {title}
          {highlightedText && (
            <>
              <br />
              <span className="bg-gradient-to-r from-[#033F99] to-[#033F99] bg-clip-text text-transparent">
                {highlightedText}
              </span>
            </>
          )}
        </h1>

        <p className="text-xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
          {subtitle}
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          {primaryCTA && (
            <Link
              to={primaryLink}
              className="inline-flex items-center gap-2 bg-[#033F99] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#033F99] transition-all shadow-lg shadow-[#033F99]/25 hover:shadow-xl hover:shadow-[#033F99]/30 transform hover:-translate-y-0.5"
            >
              <Sparkles className="h-5 w-5" />
              {primaryCTA}
            </Link>
          )}
          {secondaryCTA && (
            <Link
              to={secondaryLink}
              className="inline-flex items-center gap-2 border-2 border-slate-200 text-slate-700 px-8 py-4 rounded-xl font-semibold hover:border-[#033F99] hover:text-[#033F99] transition-all"
            >
              {secondaryCTA}
            </Link>
          )}
        </div>

        {stats.length > 0 && renderStats()}

        {children}
      </div>
    </section>
  );
};

export default HeroSection;
