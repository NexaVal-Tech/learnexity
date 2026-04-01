"use client";

import {
  ScrollFadeIn,
  FadeUpOnScroll,
} from "../animations/Animation";
import { SignUpButton2 } from "../button/Button";

const BRAND = "#4A3AFF";

const cards = [
  {
    number: "[ 01 ]",
    title: "On Demand Courses",
    description:
      "Access a library of courses with live expert tutors to master in-demand skills and accelerate your learning.",
    gradient: true,
  },
  {
    number: "[ 02 ]",
    title: "Self-Paced Tutoring",
    description:
      "Get personalized tutoring on your schedule. Perfect for busy professionals who need flexible learning to fit their life.",
    gradient: false,
  },
  {
    number: "[ 03 ]",
    title: "Join Our One-on-One Coaching",
    description:
      "Work directly with a mentor in private, focused sessions tailored to your goals. Expect clear direction and accelerated progress.",
    gradient: false,
  },
];

export default function Pathways() {
  return (
    <section className="pt-2 py-20">
      <style>{`
        .pathway-card:hover {
          border-color: ${BRAND}66 !important;
          box-shadow:
            0 20px 60px rgba(0, 0, 0, 0.6),
            0 0 30px ${BRAND}33 !important;
        }
        .pathway-card {
          border-radius: 2rem 0.75rem 2rem 0.75rem;
        }
      `}</style>

      <div className="max-w-screen-xl mx-auto px-6">
        <FadeUpOnScroll>
          {/* Header */}
          <div className="mb-16 flex flex-col gap-6 text-center md:text-left lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-4xl font-semibold text-white mb-4 component-headers">
                Our Pathways
              </h2>
              <p className="text-xl text-gray-400">
                Proven curriculum with measurable outcomes
              </p>
            </div>
            <div className="flex justify-center md:justify-start lg:justify-end">
              <SignUpButton2 />
            </div>
          </div>
        </FadeUpOnScroll>

        <div className="grid lg:grid-cols-3 gap-4">
          {cards.map((card, index) =>
            card.gradient ? (
              /* Card 01 — gradient, untouched style, only add animation + border-radius */
              <ScrollFadeIn key={card.number} delay={index * 0.15} duration={0.3}>
                <div
                  className="relative overflow-hidden p-8 h-100"
                  style={{
                    background:
                      "linear-gradient(163.36deg, #5B1EF6 -33.94%, #F59E0B 18.93%, #5B1EF6 48.37%, #DE492B 97.22%)",
                    color: "white",
                    borderRadius: "2rem 0.75rem 2rem 0.75rem",
                  }}
                >
                  <div className="mb-6">
                    <span className="text-orange-200 text-sm font-mono">
                      {card.number}
                    </span>
                  </div>
                  <h3 className="text-2xl font-semibold mb-6 sub-component-headers">
                    {card.title}
                  </h3>
                  <p className="text-xl text-white/90 mb-8 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </ScrollFadeIn>
            ) : (
              /* Cards 02 & 03 — dark themed */
              <ScrollFadeIn key={card.number} delay={index * 0.15} duration={0.3}>
                <div
                  className="pathway-card p-8 h-100
                    border border-white/10
                    bg-[#0f0f0f]/90 backdrop-blur-sm
                    shadow-lg shadow-black/40
                    hover:-translate-y-2
                    cursor-pointer transition-all duration-300"
                >
                  <div className="mb-6">
                    <span className="text-sm font-mono" style={{ color: `${BRAND}99` }}>
                      {card.number}
                    </span>
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-4 sub-component-headers">
                    {card.title}
                  </h3>
                  <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </ScrollFadeIn>
            )
          )}
        </div>
      </div>
    </section>
  );
}