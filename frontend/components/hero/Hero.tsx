"use client";
import React from "react";

export default function Hero() {
  return (
    <div style={{ marginBottom: "0.5rem" }}>
      <section
        className="hero-section relative bg-black overflow-hidden pt-32 md:pt-25"
        style={{ height: "90vh" }}
      >
        <style>{`
          @media (max-width: 768px) {
            .hero-section {
              height: 47vh !important;
              padding-top: 0 !important;
            }
            .hero-video {
              height: calc(100% - 56px) !important;
              top: 56px !important;
            }
          }
        `}</style>

        <video
          className="hero-video"
          style={{
            position: "absolute",
            top: 60,
            left: 0,
            width: "100%",
            height: "calc(100% - 60px)",
            objectFit: "fill",
          }}
          src="/videos/hero-video.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
      </section>
    </div>
  );
}