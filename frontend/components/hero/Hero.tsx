"use client";
import React from "react";
import { PrimaryButton, SignUpButton2 } from "../button/Button";

export default function Hero() {
  return (
    <section
      className="relative overflow-hidden bg-black w-full min-h-[60vh] md:min-h-[80vh]"
    >
      {/* Background video */}
      <video className="absolute inset-0 w-full h-[750px] md:h-[750px] lg:h-[600px] object-cover z-0" src="/videos/landing_video.mp4" autoPlay loop muted
        playsInline
      />

      {/* Overlay */}
      <div className="absolute inset-0 z-[1]" style={{background:"linear-gradient(135deg, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.65) 100%)",}} />

      <div className="relative z-10 max-w-7xl mx-auto flex items-center px-5 sm:px-8 min-h-[60vh] md:min-h-[80vh]">
        <div className="max-w-5xl">
          {/* Heading */}
          <h1 className="text-left text-5xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white">
            The Digital Economy is Changing.
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            Are Your Skills Still Valuable?
          </h1>

          {/* Subheading */}
          <p className="mt-4 max-w-2xl text-lg sm:text-xl md:text-2xl leading-relaxed text-gray-200">
            Build specialised skills that increase your chances of landing a high paying remote role.
          </p>

          {/* Buttons */}
          <div className="flex flex-row sm:flex-row items-start gap-4 mt-10">
            <SignUpButton2 />
            <PrimaryButton />
          </div>
        </div>
      </div>
    </section>
  );
}