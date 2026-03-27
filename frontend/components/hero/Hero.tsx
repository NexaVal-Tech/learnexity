"use client";
import React from "react";
// import Courses from "../headercourses/HeaderCourse";
import { PrimaryButton, SignUpButton2 } from "../button/Button";

const BRAND = "#4A3AFF";

export default function Hero() {
  return (
    <section className="relative pt-16 md:pt-25 overflow-hidden bg-black">
      {/* Video */}
      <video
        className="absolute inset-0 w-full h-full object-cover object-right z-0"
        src="/videos/landing_video.mp4"
        autoPlay
        loop
        muted
        playsInline
      />

      {/* Overlay */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.38) 60%, rgba(0,0,0,0.6) 100%)",
        }}
      />

      {/* Top nav */}
      {/* <div className="relative z-20">
        <Courses variant="white" />
      </div> */}

      {/* Main content */}
      <div className="relative z-10 flex items-center py-25 sm:py-20 px-5 sm:px-8 md:px-12 lg:px-16 ">
        <div className="w-full max-w-screen-xl mx-auto text-left lg:pl-8">
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-white mb-6"
            style={{ letterSpacing: "-0.01em" }}
          >
            Learn in-demand skill.{" "} <br/>
            <span >Gain practical experience.</span>{" "} <br/>
            Land real opportunities.
          </h1>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-start gap-3 mt-4">
            <SignUpButton2 />
            <PrimaryButton />
          </div>
        </div>
      </div>
    </section>
  );
}