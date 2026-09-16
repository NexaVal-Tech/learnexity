"use client";

import { FadeUpOnScroll } from "../animations/Animation";
import Image from "next/image";

const BRAND = "#4A3AFF";

export default function CurriculumPartners() {
  const partners = [
    { name: "Microsoft", logo: "/partners/microsoft.png" },
    { name: "Google Cloud", logo: "/partners/google.png" },
    // { name: "AWS", logo: "/partners/aws.png" },
    { name: "Cisco", logo: "/partners/cisco.png" },
    // { name: "IBM", logo: "/partners/IBM.png" },
    // { name: "Oracle", logo: "/partners/oracle.png" },
    // { name: "Udacity", logo: "/partners/udacity.png" },
    // { name: "edX", logo: "/partners/edx.png" },
    // { name: "CompTIA", logo: "/partners/comptia.png" },
    { name: "Oganiru Technologies", logo: "/partners/oganiru.png" },
  ];

  // Duplicated so the mobile marquee can loop seamlessly (second copy picks up
  // right where the first ends, no visible seam/jump).
  const marqueePartners = [...partners, ...partners];

  return (
    <section className="py-10">
      <style>{`
        .partner-card:hover {
          border-color: ${BRAND}66 !important;
          box-shadow: 0 0 20px ${BRAND}22 !important;
        }
        .partner-header-box {
          border-radius: 2rem 0.75rem 2rem 0.75rem;
        }
        @keyframes partners-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .partner-marquee-track {
          animation: partners-marquee 18s linear infinite;
        }
      `}</style>

      <FadeUpOnScroll>
        <div className="max-w-screen-xl mx-auto px-6 text-center">

          {/* Header — same card style as Method */}
          <div
            className="partner-header-box max-w-3xl mx-auto mb-10 px-10 py-6
              border border-[var(--border-subtle)]
              bg-[var(--surface-elevated)] backdrop-blur-sm
              shadow-2xl shadow-black/80"
          >
            <h2 className="text-4xl md:text-3xl font-semibold text-[var(--text-primary)] leading-tight">
              Trusted By
            </h2>
          </div>

          {/* Partner logos — static wrap on desktop, auto-scrolling marquee on mobile */}
          <div className="hidden sm:flex flex-wrap justify-center items-center gap-6 md:gap-8">
            {partners.map((partner) => (
              <div
                key={partner.name}
                className="partner-card flex items-center justify-center
                  border border-[var(--border-subtle)]
                  bg-[var(--surface-elevated)] backdrop-blur-sm
                  rounded-xl px-5 py-4
                  min-w-[100px] h-20
                  transition-all duration-300 cursor-pointer"
              >
                <Image
                  src={partner.logo}
                  alt={`${partner.name} logo`}
                  width={110}
                  height={42}
                  className="object-contain transition-opacity duration-200"
                />
              </div>
            ))}
          </div>

          <div className="sm:hidden overflow-hidden">
            <div className="partner-marquee-track flex items-center gap-6 w-max">
              {marqueePartners.map((partner, i) => (
                <div
                  key={`${partner.name}-${i}`}
                  className="partner-card flex items-center justify-center
                    border border-[var(--border-subtle)]
                    bg-[var(--surface-elevated)] backdrop-blur-sm
                    rounded-xl px-5 py-4
                    min-w-[100px] h-20
                    flex-shrink-0"
                >
                  <Image
                    src={partner.logo}
                    alt={`${partner.name} logo`}
                    width={110}
                    height={42}
                    className="object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </FadeUpOnScroll>
    </section>
  );
}