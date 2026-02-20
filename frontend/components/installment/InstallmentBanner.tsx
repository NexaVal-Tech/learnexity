"use client";

import { useEffect, useRef, useState } from "react";
import { PrimaryButton2 } from "../button/Button";

const installmentSteps = [
  { label: "Enroll", description: "Sign up and get instant course access", icon: "🎓" },
  { label: "Pay 1st", description: "Make your first installment to kick things off", icon: "💳" },
  { label: "Learn", description: "Work through the course material at your own pace", icon: "📚" },
  { label: "Pay 2nd", description: "Mid-course payment, you're already halfway there!", icon: "💳" },
  { label: "Complete", description: "Finish strong, get certified, and land your dream role", icon: "🏆" },
];

const BRAND = "#4A3AFF";
const BRAND_LIGHT = "#f5f4ff";
const BRAND_BORDER = "#d6d3ff";
const BRAND_SOFT = "#a09aff";
const BRAND_DARK = "#2e1fff";

export default function InstallmentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
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

  useEffect(() => {
    if (!isVisible || isHovered) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % installmentSteps.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [isVisible, isHovered]);

  const progressPercent = (activeStep / (installmentSteps.length - 1)) * 100;

  return (
    <section
      ref={sectionRef}
      className="relative py-6 overflow-hidden bg-gradient-to-b from-gray-50 to-white"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Decorative orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: BRAND }} />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ background: BRAND }} />

      <div className="relative z-10 max-w-screen-2xl mx-auto px-4 sm:px-6">

        {/* Heading */}
        <div className={`text-center mb-12 transition-all duration-700 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4" style={{ background: BRAND_LIGHT, color: BRAND }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: BRAND }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: BRAND }} />
            </span>
            Flexible Payments
          </span>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent"
            style={{ backgroundImage: `linear-gradient(to right, #111827, ${BRAND})` }}
          >
            Learn Now, Pay As You Go
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            Don't let finances hold you back. Split your course fee into installments across your learning journey, zero interest, zero stress.
          </p>
        </div>

        {/* Card */}
        <div className={`relative bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-1000 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>

          {/* Animated top bar */}
          <div className="h-1.5 w-full relative overflow-hidden" style={{ background: `linear-gradient(to right, ${BRAND_SOFT}, ${BRAND}, ${BRAND_DARK})` }}>
            <div className="absolute inset-0 opacity-60" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)", animation: "installment-shimmer 2.5s infinite" }} />
          </div>

          <div className="p-6 sm:p-8 md:p-12">
            <div className="grid lg:grid-cols-2 gap-10 items-center">

              {/* Left */}
              <div className={`space-y-6 transition-all duration-700 delay-200 ease-out ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}>
                <div className="inline-flex items-center gap-3 rounded-2xl px-5 py-3 border" style={{ background: BRAND_LIGHT, borderColor: BRAND_BORDER }}>
                  <span className="text-3xl">💡</span>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Available on all courses</p>
                    <p className="text-base sm:text-lg font-bold text-gray-900">Installment Payment Plan</p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                  We believe cost should never be a barrier to education. Pay in flexible installments spread over your course duration, start learning immediately and settle the balance as you progress.
                </p>
                <ul className="space-y-3">
                  {[
                    { icon: "✅", text: "No hidden fees or interest charges", delay: "delay-300" },
                    { icon: "📅", text: "Payments timed to your course milestones", delay: "delay-400" },
                    // { icon: "🔒", text: "Full course access from day one", delay: "delay-500" },
                    { icon: "🤝", text: "Flexible plans tailored per course", delay: "delay-600" },
                  ].map(({ icon, text, delay }) => (
                    <li key={text} className={`flex items-start gap-3 text-gray-700 transition-all duration-700 ${delay} ease-out ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}>
                      <span className="text-lg mt-0.5 shrink-0">{icon}</span>
                      <span className="text-sm font-medium">{text}</span>
                    </li>
                  ))}
                </ul>

                <PrimaryButton2 />
              </div>

              {/* Right */}
              <div className={`transition-all duration-700 delay-400 ease-out ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6 text-center">How it works</p>

                {/* Desktop stepper — hidden on mobile */}
                <div className="relative hidden sm:block">
                  <div className="absolute top-8 left-8 right-8 h-0.5 bg-gray-200 z-0" />
                  <div
                    className="absolute top-8 left-8 h-0.5 z-0 transition-all duration-700 ease-out"
                    style={{
                      width: `calc(${progressPercent}% * (100% - 4rem) / 100)`,
                      background: `linear-gradient(to right, ${BRAND_SOFT}, ${BRAND})`,
                    }}
                  />
                  <div className="relative z-10 flex justify-between">
                    {installmentSteps.map((step, i) => (
                      <button key={step.label} onClick={() => setActiveStep(i)} className="flex flex-col items-center gap-2 focus:outline-none">
                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-all duration-500 ${i <= activeStep ? "shadow-lg scale-110" : "bg-gray-100 scale-100"}`}
                          style={i <= activeStep ? {
                            background: BRAND,
                            outline: i === activeStep ? `4px solid ${BRAND_BORDER}` : undefined,
                            outlineOffset: "2px",
                          } : {}}
                        >
                          {step.icon}
                        </div>
                        <span className={`text-xs font-semibold transition-colors duration-300 ${i <= activeStep ? "text-gray-900" : "text-gray-400"}`}>{step.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile stepper — vertical */}
                <div className="sm:hidden space-y-3">
                  {installmentSteps.map((step, i) => (
                    <button
                      key={step.label}
                      onClick={() => setActiveStep(i)}
                      className="w-full flex items-center gap-4 focus:outline-none"
                    >
                      <div
                        className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center text-lg transition-all duration-500 ${i <= activeStep ? "shadow-md" : "bg-gray-100"}`}
                        style={i <= activeStep ? {
                          background: BRAND,
                          outline: i === activeStep ? `3px solid ${BRAND_BORDER}` : undefined,
                          outlineOffset: "1px",
                        } : {}}
                      >
                        {step.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <p className={`text-xs font-bold leading-tight ${i <= activeStep ? "text-gray-900" : "text-gray-400"}`}>{step.label}</p>
                        {i === activeStep && (
                          <p className="text-xs text-gray-500 mt-0.5 leading-snug">{step.description}</p>
                        )}
                      </div>
                      <div
                        className="w-2 h-2 rounded-full shrink-0 transition-all duration-300"
                        style={{
                          background: i === activeStep ? BRAND : i < activeStep ? BRAND_SOFT : "#e5e7eb",
                          transform: i === activeStep ? "scale(1.25)" : "scale(1)",
                        }}
                      />
                    </button>
                  ))}
                </div>

                {/* Step detail card */}
                <div
                  key={activeStep}
                  className="mt-6 p-5 rounded-2xl border relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${BRAND_LIGHT}, #eeedff)`,
                    borderColor: BRAND_BORDER,
                    animation: "installment-fadeSlideUp 0.4s ease-out",
                  }}
                >
                  <div className="absolute inset-0 opacity-40" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)", animation: "installment-shimmer 3s infinite" }} />
                  <p className="text-sm font-bold mb-1 relative z-10" style={{ color: BRAND_DARK }}>
                    Step {activeStep + 1}: {installmentSteps[activeStep].label}
                  </p>
                  <p className="text-sm relative z-10" style={{ color: BRAND }}>
                    {installmentSteps[activeStep].description}
                  </p>
                  <div className="mt-3 flex gap-1.5 relative z-10">
                    {installmentSteps.map((_, i) => (
                      <div
                        key={i}
                        className="h-1 rounded-full transition-all duration-500"
                        style={{
                          width: i === activeStep ? "1.5rem" : "0.75rem",
                          background: i === activeStep ? BRAND : i < activeStep ? BRAND_SOFT : BRAND_BORDER,
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2 justify-center">
                  {["Pay 25% upfront", "Rest over course duration", "0% interest"].map((pill) => (
                    <span
                      key={pill}
                      className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-medium rounded-full shadow-sm cursor-default transition-colors duration-200"
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = BRAND;
                        (e.currentTarget as HTMLElement).style.color = BRAND;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = "";
                        (e.currentTarget as HTMLElement).style.color = "";
                      }}
                    >
                      {pill}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes installment-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes installment-fadeSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}