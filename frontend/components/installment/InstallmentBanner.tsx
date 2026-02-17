"use client";

import { useEffect, useRef, useState } from "react";
import { PrimaryButton2 } from "../button/Button";

const installmentSteps = [
  { label: "Enroll", description: "Sign up and get instant course access from day one", icon: "🎓", color: "from-blue-500 to-blue-600" },
  { label: "Pay 1st", description: "Make your first installment to kick things off", icon: "💳", color: "from-purple-500 to-purple-600" },
  { label: "Learn", description: "Work through the course material at your own pace", icon: "📚", color: "from-green-500 to-green-600" },
  { label: "Pay 2nd", description: "Mid-course payment — you're already halfway there!", icon: "💳", color: "from-purple-500 to-purple-600" },
  { label: "Complete the rest", description: "Finish strong, get certified, and land your dream role", icon: "🏆", color: "from-blue-500 to-purple-600" },
];

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
      {/* Decorative orbs — matches your landing page */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-30" />

      <div className="relative z-10 max-w-screen-2xl mx-auto px-6">

        {/* Heading */}
        <div className={`text-center mb-16 transition-all duration-700 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
            </span>
            Flexible Payments
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
            Learn Now, Pay As You Go
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Don't let finances hold you back. Split your course fee into installments across your learning journey — zero interest, zero stress.
          </p>
        </div>

        {/* Card */}
        <div className={`relative bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-1000 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
          
          {/* Animated top bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 relative overflow-hidden">
            <div className="absolute inset-0 opacity-60" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)", animation: "installment-shimmer 2.5s infinite" }} />
          </div>

          <div className="p-8 md:p-12">
            <div className="grid lg:grid-cols-2 gap-12 items-center">

              {/* Left */}
              <div className={`space-y-6 transition-all duration-700 delay-200 ease-out ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}>
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl px-5 py-3 border border-blue-100">
                  <span className="text-3xl">💡</span>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Available on all courses</p>
                    <p className="text-lg font-bold text-gray-900">Installment Payment Plan</p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  We believe cost should never be a barrier to education. Pay in flexible installments spread over your course duration — start learning immediately and settle the balance as you progress.
                </p>
                <ul className="space-y-3">
                  {[
                    { icon: "✅", text: "No hidden fees or interest charges", delay: "delay-300" },
                    { icon: "📅", text: "Payments timed to your course milestones", delay: "delay-400" },
                    { icon: "🔒", text: "Full course access from day one", delay: "delay-500" },
                    { icon: "🤝", text: "Flexible plans tailored per course", delay: "delay-600" },
                  ].map(({ icon, text, delay }) => (
                    <li key={text} className={`flex items-center gap-3 text-gray-700 transition-all duration-700 ${delay} ease-out ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}>
                      <span className="text-lg">{icon}</span>
                      <span className="text-sm font-medium">{text}</span>
                    </li>
                  ))}
                </ul>

                <PrimaryButton2 />
 
              </div>

              {/* Right */}
              <div className={`transition-all duration-700 delay-400 ease-out ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-8 text-center">How it works</p>

                <div className="relative">
                  <div className="absolute top-8 left-8 right-8 h-0.5 bg-gray-200 z-0" />
                  <div
                    className="absolute top-8 left-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 z-0 transition-all duration-700 ease-out"
                    style={{ width: `calc(${progressPercent}% * (100% - 4rem) / 100)` }}
                  />
                  <div className="relative z-10 flex justify-between">
                    {installmentSteps.map((step, i) => (
                      <button key={step.label} onClick={() => setActiveStep(i)} className="flex flex-col items-center gap-2 focus:outline-none">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl transition-all duration-500 ${i <= activeStep ? `bg-gradient-to-br ${step.color} shadow-lg scale-110` : "bg-gray-100 scale-100"} ${i === activeStep ? "ring-4 ring-offset-2 ring-blue-300" : ""}`}>
                          {step.icon}
                        </div>
                        <span className={`text-xs font-semibold transition-colors duration-300 ${i <= activeStep ? "text-gray-900" : "text-gray-400"}`}>{step.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div key={activeStep} className="mt-8 p-5 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-100 relative overflow-hidden" style={{ animation: "installment-fadeSlideUp 0.4s ease-out" }}>
                  <div className="absolute inset-0 opacity-40" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)", animation: "installment-shimmer 3s infinite" }} />
                  <p className="text-sm font-bold text-gray-900 mb-1 relative z-10">Step {activeStep + 1}: {installmentSteps[activeStep].label}</p>
                  <p className="text-sm text-gray-600 relative z-10">{installmentSteps[activeStep].description}</p>
                  <div className="mt-3 flex gap-1.5 relative z-10">
                    {installmentSteps.map((_, i) => (
                      <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === activeStep ? "bg-blue-500 w-6" : i < activeStep ? "bg-purple-400 w-3" : "bg-gray-200 w-3"}`} />
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2 justify-center">
                  {["Pay 25% upfront", "Rest over course duration", "0% interest"].map((pill) => (
                    <span key={pill} className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-medium rounded-full shadow-sm hover:border-blue-300 hover:text-blue-700 transition-colors duration-200 cursor-default">{pill}</span>
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