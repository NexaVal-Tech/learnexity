"use client";
import React from "react";
// import Courses from "../headercourses/HeaderCourse";
import { PrimaryButton, SignUpButton2 } from "../button/Button";



export default function Hero() {
  return (
    <section
      className="relative overflow-hidden bg-black w-full"
      style={{ minHeight: "90vh" }}
    >
      {/* Background video — full section */}
      <video
        className="absolute inset-0 w-full h-[750px] md:h-[750px] lg:h-[600px] object-cover z-0"
        src="/videos/landing_video.mp4"
        autoPlay
        loop
        muted
        playsInline
      />

      {/* Dark overlay over background video */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(135deg, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.65) 100%)",
        }}
      />

      {/* Inner max-w-5xl container */}
      <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col pt-15" style={{ minHeight: "90vh" }}>

        {/* Courses nav bar */}
        {/* <div className="pt-16 md:pt-6 px-5 sm:px-8">
          <Courses variant="white" />
        </div> */}

        {/* Main row: text left, hero-video right */}
        <div className="flex flex-col md:flex-row items-center flex-1 gap-6 px-5 sm:px-8 py-10 md:py-0">

          {/* Left: text */}
          <div className="flex-1 text-left">
            <h1
              className="text-4xl sm:text-5xl md:text-5xl font-bold leading-tight text-white mb-6"
              style={{ letterSpacing: "-0.01em" }}
            >
              Learn in-demand skill.{" "}<br />
              <span>Gain practical experience.</span>{" "}<br />
              Land real opportunities.
            </h1>

            <div className="flex flex-wrap items-center justify-start gap-3 mt-4">
              <SignUpButton2 />
              <PrimaryButton />
            </div>
          </div>

          {/* Right: foreground video */}
          <div className="flex-1 w-full rounded-2xl overflow-hidden shadow-2xl" style={{ maxHeight: "520px" }}>
            <video
              className="w-full h-full object-cover"
              style={{ maxHeight: "520px" }}
              src="/videos/hero-video.mp4"
              autoPlay
              controls
              loop
              muted
              playsInline
            />
          </div>

        </div>
      </div>
    </section>
  );
}