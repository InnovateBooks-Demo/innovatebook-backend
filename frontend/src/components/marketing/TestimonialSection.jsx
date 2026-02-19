import React from "react";
import { Quote, Star } from "lucide-react";

/**
 * TestimonialSection - Reusable testimonials grid for module detail pages
 *
 * @param {Array} testimonials - Array of testimonial objects containing:
 *   - quote: Customer quote text
 *   - author: Author name
 *   - role: Author's job title
 *   - company: Author's company name
 *   - rating: Star rating (1-5, default 5)
 */
const TestimonialSection = ({ testimonials }) => {
  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <Quote className="h-6 w-6 text-[#033F99]" />
        <h2 className="text-3xl font-bold text-slate-900">
          What Our Customers Say
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-2xl border-2 border-slate-200"
          >
            {/* Star Rating */}
            <div className="flex gap-1 mb-4">
              {[...Array(testimonial.rating || 5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-5 w-5 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>

            {/* Quote */}
            <p className="text-slate-700 italic mb-4">"{testimonial.quote}"</p>

            {/* Author */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-full flex items-center justify-center text-white font-bold text-sm">
                {testimonial.author
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <p className="font-bold text-slate-900">{testimonial.author}</p>
                <p className="text-sm text-slate-600">
                  {testimonial.role}, {testimonial.company}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TestimonialSection;
