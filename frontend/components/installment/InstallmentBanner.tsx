"use client";

import { useEffect, useRef, useState } from "react";
import { PrimaryButton2 } from "../button/Button";

const BRAND = "#4A3AFF";

export default function InstallmentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-6 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <style>{`
        .installment-header-box {
          border-radius: 2rem 0.75rem 2rem 0.75rem;
        }
        .installment-card {
          border-radius: 2rem 0.75rem 2rem 0.75rem;
        }
        .installment-card:hover {
          border-color: ${BRAND}66 !important;
          box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 30px ${BRAND}33 !important;
        }
        .installment-badge {
          border-radius: 2rem 0.75rem 2rem 0.75rem;
        }
      `}</style>

      {/* Subtle brand orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-5" style={{ background: BRAND }} />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-5" style={{ background: BRAND }} />

      <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6">

        {/* Heading */}
        <div className={`text-center mb-12 transition-all duration-700 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>

          {/* Pill badge — matches card number style: text-sm font-mono */}
          <span
            className="installment-badge inline-flex items-center gap-2 px-4 py-2 text-sm font-mono mb-4 border border-white/10 bg-[#0f0f0f]/90"
            style={{ color: BRAND }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: BRAND }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: BRAND }} />
            </span>
            Flexible Payments
          </span>

          {/* Header box */}
          <div
            className="installment-header-box max-w-7xl mx-auto px-10 py-6
              border border-white/10
              bg-[#0f0f0f]/90 backdrop-blur-sm
              shadow-2xl shadow-black/80"
          >
            {/* Matches: text-4xl font-semibold text-white component-headers */}
            <h2 className="text-4xl font-semibold text-white mb-4 component-headers">
              Learn Now, Pay As You Go
            </h2>

            {/* Matches: text-xl text-gray-400 leading-relaxed */}
            <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto">
              We believe cost should never be a barrier to education. Pay in flexible installments spread over your course duration — start learning immediately and settle the balance as you progress.
            </p>

            <div className="flex justify-center mt-6 py-4">
              <PrimaryButton2 />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}