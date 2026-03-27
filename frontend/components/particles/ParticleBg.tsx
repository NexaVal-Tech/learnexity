"use client";

import { useEffect, useState } from "react";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { initParticlesEngine } from "@tsparticles/react";

export default function ParticlesBackground() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setReady(true);
    });
  }, []);

  if (!ready) return null;

  return (
    <Particles
      id="tsparticles"
      options={{
        fullScreen: { enable: true },

        particles: {
          number: { value: 50 },

          color: {
            value: ["#5B1EF6", "#F59E0B", "#DE492B"],
          },

          shape: { type: "circle" },

          opacity: { value: 0.6 },

          size: { value: { min: 2, max: 6 } },

          move: {
            enable: true,
            speed: 1.2,
          },

          links: {
            enable: true,
            distance: 140,
            color: "#5B1EF6",
            opacity: 0.2,
          },
        },

        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: "repulse",
            },
          },
        },
      }}
    />
  );
}