"use client";

import { useState } from "react";
import { FadeUpOnScroll } from "../animations/Animation";
import { CmsLink, CmsText } from "@/components/cms/ui";
import { f } from "@/lib/cms/fields";
import type { BlockDefinition } from "@/lib/cms/blockTypes";

const BRAND = "#4A3AFF";

export interface FaqsData {
  heading: string;
  subtext: string;
  linkLabel: string;
  linkHref: string;
  /** 1-based index of the question open on page load; 0 = all closed. */
  openItem: number;
  faqs: { q: string; a: string }[];
}

export const FAQS_DEFAULTS: FaqsData = {
  heading: "Frequently asked questions",
  subtext: "Can't find the answers you are looking for?",
  linkLabel: "Contact Us",
  linkHref: "/contact",
  openItem: 2,
  faqs: [
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
  ],
};

export default function FAQs({ data = FAQS_DEFAULTS }: { data?: FaqsData }) {
  const faqs = data.faqs ?? [];
  const initial = Number(data.openItem ?? 0) - 1;
  const [open, setOpen] = useState<number | null>(initial >= 0 ? initial : null);

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
              border border-gray-200 dark:border-white/10
              bg-white dark:bg-[#0f0f0f]/90 backdrop-blur-sm
              shadow-2xl shadow-black/10 dark:shadow-black/80"
          >
            <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              <CmsText text={data.heading} />
            </h2>
            {(data.subtext || data.linkLabel) && (
              <p className="text-gray-600 dark:text-gray-400">
                {data.subtext}{" "}
                {data.linkLabel && (
                  <CmsLink href={data.linkHref} className="underline" style={{ color: BRAND }}>
                    {data.linkLabel}
                  </CmsLink>
                )}
              </p>
            )}
          </div>

          {/* FAQ items */}
          <div className="space-y-3">
            {faqs.map((item, idx) => (
              <div
                key={idx}
                className={`faq-item border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f0f0f]/90 backdrop-blur-sm
                  shadow-2xl shadow-black/10 dark:shadow-black/80 transition-all duration-300
                  ${open === idx ? "faq-item-open" : ""}`}
              >
                <button
                  className="w-full flex justify-between items-center text-left py-8 px-6 font-medium text-xl text-gray-900 dark:text-white transition-colors"
                  onClick={() => setOpen(open === idx ? null : idx)}
                  aria-expanded={open === idx}
                >
                  <span className="pr-8">{item.q}</span>
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xl font-light flex-shrink-0 transition-all duration-300"
                    style={
                      open === idx
                        ? { backgroundColor: `${BRAND}33`, border: `1px solid ${BRAND}66`, color: "white" }
                        : { color: "var(--text-muted)" }
                    }
                  >
                    {open === idx ? "−" : "+"}
                  </span>
                </button>
                {open === idx && (
                  <div className="px-6 pb-8">
                    <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                      <CmsText text={item.a} />
                    </p>
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

export const block: BlockDefinition<FaqsData> = {
  type: "home.faqs",
  label: "FAQs (homepage style)",
  category: "Homepage",
  description: "Header card with a contact link, then an accordion of questions.",
  fields: [
    f.text("heading", "Heading"),
    f.text("subtext", "Text under heading"),
    f.text("linkLabel", "Link text"),
    f.url("linkHref", "Link"),
    f.number("openItem", "Question open on load (1 = first, 0 = none)", { min: 0, max: 50 }),
    f.list("faqs", "Questions", [f.text("q", "Question"), f.textarea("a", "Answer", { rows: 4 })], {
      itemLabelKey: "q",
      addLabel: "Add question",
      itemDefaults: { q: "New question?", a: "The answer." },
    }),
  ],
  defaults: FAQS_DEFAULTS,
};
