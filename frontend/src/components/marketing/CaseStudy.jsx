import React from "react";
import { Link } from "react-router-dom";
import { Target, ArrowRight } from "lucide-react";

/**
 * CaseStudy - Reusable case study section for module detail pages
 *
 * @param {Object} data - Case study data object containing:
 *   - company: Company name
 *   - industry: Industry description
 *   - employees: Employee count string
 *   - logo: 2-letter logo initials
 *   - challenge: Description of the challenge
 *   - solution: Description of the solution
 *   - results: Array of {metric, label, detail} objects (4 items)
 *   - quote: Customer quote
 *   - quotePerson: Quote attribution (name, title)
 */
const CaseStudy = ({ data }) => {
  const {
    company,
    industry,
    employees,
    logo,
    challenge,
    solution,
    results,
    quote,
    quotePerson,
  } = data;

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <Target className="h-6 w-6 text-[#033F99]" />
        <h2 className="text-3xl font-bold text-slate-900">Case Study</h2>
        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full font-semibold">
          Success Story
        </span>
      </div>

      <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl border-2 border-slate-200 overflow-hidden">
        <div className="p-8">
          {/* Company Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                {logo}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">{company}</h3>
                <p className="text-slate-600">
                  {industry} • {employees} employees
                </p>
              </div>
            </div>
          </div>

          {/* Challenge & Solution Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-red-50 p-4 rounded-xl border border-red-200">
              <h4 className="font-bold text-red-700 mb-2">The Challenge</h4>
              <p className="text-slate-700 text-sm">{challenge}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-xl border border-green-200">
              <h4 className="font-bold text-green-700 mb-2">The Solution</h4>
              <p className="text-slate-700 text-sm">{solution}</p>
            </div>
          </div>

          {/* Results Metrics */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {results.map((result, i) => (
              <div
                key={i}
                className="bg-white p-4 rounded-xl border border-slate-200 text-center"
              >
                <p className="text-3xl font-bold text-[#033F99]">
                  {result.metric}
                </p>
                <p className="font-semibold text-slate-900 text-sm">
                  {result.label}
                </p>
                <p className="text-xs text-slate-500">{result.detail}</p>
              </div>
            ))}
          </div>

          {/* Customer Quote */}
          <div className="bg-[#EBF3FC] p-4 rounded-xl border border-[#C4D9F4]">
            <p className="text-slate-700 italic mb-2">"{quote}"</p>
            <p className="text-[#033F99] font-semibold text-sm">
              — {quotePerson}
            </p>
          </div>
        </div>

        {/* CTA Footer */}
        <div className="bg-[#033F99] p-4 flex items-center justify-between">
          <p className="text-white font-semibold">
            Want similar results for your organization?
          </p>
          <Link to="/auth/signup">
            <button className="bg-white text-[#033F99] px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:shadow-lg transition-all">
              Get Started <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CaseStudy;
