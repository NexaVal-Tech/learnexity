"use client";

import { useState } from "react";
import { FadeUpOnScroll } from "../animations/Animation";

const BRAND = "#4A3AFF";

export default function FAQs() {
  const faqs = [
    {
      q: "Can I work while taking the course?",
      a: "Yes, our flexible schedule allows you to learn at your own pace while maintaining your current job.",
    },
    {
      q: "What if I don't have any technical background?",
      a: "Perfect! All our courses start with fundamentals and are specifically designed for career changers. No prior experience required.",
    },
    {
      q: "Do you provide job placement assistance?",
      a: "Yes, we offer comprehensive career support including resume review, interview preparation, and job placement assistance.",
    },
    {
      q: "What happens after I complete the program?",
      a: "You will receive industry-recognized certification and continue to have access to our alumni network and ongoing career support.",
    },
    {
      q: "Are the certificates recognized by employers?",
      a: "Absolutely! Our certificates are industry-recognized and valued by employers across the tech industry.",
    },
  ];

  const [open, setOpen] = useState<number | null>(1);

  return (
    <FadeUpOnScroll>
      <section className="py-20">
        <style>{`
          .faq-header-box {
            border-radius: 2rem 0.75rem 2rem 0.75rem;
          }
          .faq-item {
            border-radius: 2rem 0.75rem 2rem 0.75rem;
          }
          .faq-item-open {
            border-color: ${BRAND}66 !important;
            box-shadow: 0 0 30px ${BRAND}22 !important;
          }
          .faq-item:hover {
            border-color: ${BRAND}44 !important;
          }
        `}</style>

        <div className="max-w-5xl mx-auto px-4">

          {/* Header */}
          <div
            className="faq-header-box max-w-3xl mx-auto text-center mb-12 px-10 py-6
              border border-white/10
              bg-[#0f0f0f]/90 backdrop-blur-sm
              shadow-2xl shadow-black/80"
          >
            <h2 className="text-5xl font-bold text-white mb-4">
              Frequently asked questions
            </h2>
            <p className="text-gray-400">
              Can&apos;t find the answers you are looking for?{" "}
              <a href="/contact" className="underline" style={{ color: BRAND }}>
                Contact Us
              </a>
            </p>
          </div>

          {/* FAQ items */}
          <div className="space-y-3">
            {faqs.map((f, idx) => (
              <div
                key={idx}
                className={`faq-item border border-white/10 bg-[#0f0f0f]/90 backdrop-blur-sm
                  shadow-2xl shadow-black/80 transition-all duration-300
                  ${open === idx ? "faq-item-open" : ""}`}
              >
                <button
                  className="w-full flex justify-between items-center text-left py-8 px-6 font-medium text-xl text-white transition-colors"
                  onClick={() => setOpen(open === idx ? null : idx)}
                >
                  <span className="pr-8">{f.q}</span>
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xl font-light flex-shrink-0 transition-all duration-300"
                    style={
                      open === idx
                        ? { backgroundColor: `${BRAND}33`, border: `1px solid ${BRAND}66`, color: "white" }
                        : { color: "#9ca3af" }
                    }
                  >
                    {open === idx ? "−" : "+"}
                  </span>
                </button>
                {open === idx && (
                  <div className="px-6 pb-8">
                    <p className="text-gray-400 text-lg leading-relaxed">{f.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </FadeUpOnScroll>
  );
}