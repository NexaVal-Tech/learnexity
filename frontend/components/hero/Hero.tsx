"use client";
import React from "react";
import { PrimaryButton, SignUpButton2 } from "../button/Button";

export default function Hero() {
  return (
    <section
      className="relative overflow-hidden bg-black w-full"
      style={{ minHeight: "90vh" }}
    >
      {/* Background video */}
      <video className="absolute inset-0 w-full h-[750px] md:h-[750px] lg:h-[600px] object-cover z-0" src="/videos/landing_video.mp4" autoPlay loop muted
        playsInline
      />

      {/* Overlay */}
      <div className="absolute inset-0 z-[1]" style={{background:"linear-gradient(135deg, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.65) 100%)",}} />

      <div className="relative z-10 max-w-7xl mx-auto flex items-center px-5 sm:px-8" style={{ minHeight: "90vh" }}>
        <div className="max-w-4xl">
          {/* Heading */}
          <h1 className="text-left text-2xl sm:text-3xl md:text-5xl lg:text-5xl font-bold leading-tight text-white">
            Learn in-demand tech skills,
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            Gain practical experience, and
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            Stay relevant in the world of Artificial Intelligence.
          </h1>

          {/* Subheading */}
          <p className="mt-4 max-w-2xl text-lg sm:text-xl md:text-2xl leading-relaxed text-gray-200">
            Learn to work with AI, Lead with AI, and
            Build the systems that power Artificial Intelligence.
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