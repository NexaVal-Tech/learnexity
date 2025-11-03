"use client";
import { useState } from "react";
import {
  ScrollFadeIn,
  FadeInCard,
  FadeUpOnScroll,
  ZoomAnimation,
} from "../animations/Animation";

export default function FAQs() {
  const faqs = [
    { 
      q: "Can I work while taking the course?", 
      a: "Yes, our flexible schedule allows you to learn at your own pace while maintaining your current job." 
    },
    { 
      q: "What if I don't have any technical background?", 
      a: "Perfect! All our courses start with fundamentals and are specifically designed for career changers. No prior experience required." 
    },
    { 
      q: "Do you provide job placement assistance?", 
      a: "Yes, we offer comprehensive career support including resume review, interview preparation, and job placement assistance." 
    },
    { 
      q: "What happens after I complete the program?", 
      a: "You will receive industry-recognized certification and continue to have access to our alumni network and ongoing career support." 
    },
    { 
      q: "Are the certificates recognized by employers?", 
      a: "Absolutely! Our certificates are industry-recognized and valued by employers across the tech industry." 
    },
  ];

  const [open, setOpen] = useState<number | null>(1); // Second question is open by default

  return (
    <FadeUpOnScroll>
    <section className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-black mb-4">
            Frequently asked questions
          </h2>
          <p className="text-gray-600">
            Can&apos;t find the answers you are looking for? <a href="/contact" className="text-blue-600 underline">Contact Us</a>
          </p>
        </div>

        <div className="space-y-0">
          {faqs.map((f, idx) => (
            <div 
              key={idx} 
              className={`border-gray-200 rounded-3xl ${
                open === idx ? 'bg-gray-200' : 'bg-white'
              } transition-colors duration-200`}
            >
              <button
                className="w-full flex justify-between items-center text-left py-8 px-6 font-medium text-xl text-black hover:bg-gray-25 transition-colors"
                onClick={() => setOpen(open === idx ? null : idx)}
              >
                <span className="pr-8">{f.q}</span>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xl font-light flex-shrink-0 transition-colors ${
                  open === idx 
                    ? 'bg-white text-gray-800 shadow-sm' 
                    : 'text-gray-600'
                }`}>
                  {open === idx ? "−" : "+"}
                </span>
              </button>
              {open === idx && (
                <div className="px-6 pb-8">
                  <p className="text-gray-500 text-lg leading-relaxed">{f.a}</p>
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