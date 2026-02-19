import React from "react";
import { Link } from "react-router-dom";
import { Zap, Phone, ArrowRight } from "lucide-react";

export const CTASection = ({
  title,
  subtitle,
  primaryCTA = "Start Free Trial",
  primaryLink = "/auth/signup",
  secondaryCTA,
  secondaryLink = "/contact",
  features = [],
  variant = "default", // default, dark, gradient, simple
  className = "",
}) => {
  if (variant === "simple") {
    return (
      <section
        className={`py-16 px-4 bg-slate-50 ${className}`}
        data-testid="cta-section"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">{title}</h2>
          {subtitle && (
            <p className="text-lg text-slate-600 mb-8">{subtitle}</p>
          )}

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to={primaryLink}
              className="inline-flex items-center gap-2 bg-[#033F99] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#033F99] transition-all"
            >
              {primaryCTA}
              <ArrowRight className="h-5 w-5" />
            </Link>
            {secondaryCTA && (
              <Link
                to={secondaryLink}
                className="inline-flex items-center gap-2 border-2 border-slate-300 text-slate-700 px-8 py-4 rounded-xl font-semibold hover:border-[#033F99] hover:text-[#033F99] transition-all"
              >
                {secondaryCTA}
              </Link>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (variant === "dark") {
    return (
      <section
        className={`py-20 px-4 bg-slate-900 ${className}`}
        data-testid="cta-section"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">{title}</h2>
          {subtitle && (
            <p className="text-xl text-slate-400 mb-10">{subtitle}</p>
          )}

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to={primaryLink}
              className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-xl font-semibold hover:bg-slate-100 transition-all"
            >
              <Zap className="h-5 w-5" />
              {primaryCTA}
            </Link>
            {secondaryCTA && (
              <Link
                to={secondaryLink}
                className="inline-flex items-center gap-2 border-2 border-slate-700 text-white px-8 py-4 rounded-xl font-semibold hover:border-slate-500 transition-all"
              >
                <Phone className="h-5 w-5" />
                {secondaryCTA}
              </Link>
            )}
          </div>

          {features.length > 0 && (
            <div className="flex flex-wrap justify-center gap-8 mt-10 text-slate-400">
              {features.map((feature, index) => (
                <div
                  key={`feature-${index}`}
                  className="flex items-center gap-2"
                >
                  <feature.icon className="h-5 w-5" />
                  <span>{feature.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  // Default gradient variant
  return (
    <section
      className={`py-24 px-4 bg-gradient-to-r from-[#033F99] via-[#033F99] to-[#033F99] relative overflow-hidden ${className}`}
      data-testid="cta-section"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to={primaryLink}
            className="inline-flex items-center gap-2 bg-white text-[#033F99] px-10 py-5 rounded-xl font-bold hover:bg-slate-100 transition-all transform hover:scale-105 shadow-xl"
          >
            <Zap className="h-5 w-5" />
            {primaryCTA}
          </Link>
          {secondaryCTA && (
            <Link
              to={secondaryLink}
              className="inline-flex items-center gap-2 border-2 border-white/30 text-white px-10 py-5 rounded-xl font-semibold hover:bg-white/10 transition-all backdrop-blur-sm"
            >
              <Phone className="h-5 w-5" />
              {secondaryCTA}
            </Link>
          )}
        </div>

        {features.length > 0 && (
          <div className="flex flex-wrap justify-center gap-8 mt-12 text-white/70">
            {features.map((feature, index) => (
              <div key={`feature-${index}`} className="flex items-center gap-2">
                <feature.icon className="h-5 w-5" />
                <span>{feature.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CTASection;
