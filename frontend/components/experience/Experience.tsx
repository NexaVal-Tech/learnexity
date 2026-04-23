"use client";
import Image from "next/image";

import { ScrollFadeIn, FadeUpOnScroll } from "@/components/animations/Animation";

const BRAND = "#4A3AFF";

const cards = [
  {
    id: "experts",
    label: "Led by industry experts",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4A3AFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <line x1="12" y1="12" x2="12" y2="16" />
        <line x1="10" y1="14" x2="14" y2="14" />
      </svg>
    ),
  },
  {
    id: "partners",
    label: (
      <div className="flex flex-col items-center gap-3">
        <span>In partnership with</span>

        <div className="flex items-center gap-4">
          <Image
            src="/partners/cisco.png"
            alt="Cisco"
            width={90}
            height={30}
            className="object-contain"
          />

          <span className="text-white font-semibold text-sm">
            and
          </span>

          <Image
            src="/partners/microsoft.png"
            alt="Microsoft"
            width={110}
            height={30}
            className="object-contain"
          />
        </div>
      </div>
    ),
  },
  {
    id: "global",
    label: "Collaborating with global partners",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4A3AFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
];

export default function Experience() {
  return (
    <FadeUpOnScroll>
      <section className="py-4">
        <style>{`
          .experience-card:hover {
            border-color: ${BRAND}66 !important;
            box-shadow:
              0 20px 60px rgba(0, 0, 0, 0.6),
              0 0 30px ${BRAND}33 !important;
          }
        `}</style>

        <div className="max-w-screen-xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {cards.map((card, index) => (
              <ScrollFadeIn key={card.id} delay={index * 0.15}>
                <div
                  className="experience-card group flex flex-col items-center justify-center text-center px-8 py-10
                    rounded-xl rounded-tr-4xl
                    border border-white/10
                    bg-[#0f0f0f]/90 backdrop-blur-sm
                    shadow-lg shadow-black/40
                    hover:-translate-y-2
                    cursor-pointer transition-all duration-300 min-h-[200px]"
                >
                  <span className="mb-5">{card.icon}</span>
                  <span className="text-white font-bold text-lg leading-snug tracking-wide">
                    {card.label}
                  </span>
                </div>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>
    </FadeUpOnScroll>
  );
}