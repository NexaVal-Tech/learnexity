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
              height: 45vh !important;
            }
            .hero-video {
              height: 100% !important;
              top: 0 !important;
            }
          }
        `}</style>

        <video className="hero-video"
          style={{
            position: "absolute",
            top: 60,
            left: 0,
            width: "100%",
            height: "90%",
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