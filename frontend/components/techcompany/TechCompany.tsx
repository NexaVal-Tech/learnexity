"use client";

import { FadeUpOnScroll } from "../animations/Animation";
import Image from "next/image";

const BRAND = "#4A3AFF";

export default function CurriculumPartners() {
  const partners = [
    { name: "Microsoft", logo: "/partners/microsoft.png" },
    { name: "Google Cloud", logo: "/partners/google.png" },
    { name: "AWS", logo: "/partners/aws.png" },
    { name: "Cisco", logo: "/partners/cisco.png" },
    { name: "IBM", logo: "/partners/IBM.png" },
    // { name: "Oracle", logo: "/partners/oracle.png" },
    { name: "Udacity", logo: "/partners/udacity.png" },
    // { name: "edX", logo: "/partners/edx.png" },
    { name: "CompTIA", logo: "/partners/comptia.png" },
    { name: "Coursera", logo: "/partners/coursera.png" },
  ];

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
      `}</style>

      <FadeUpOnScroll>
        <div className="max-w-screen-xl mx-auto px-6 text-center">

          {/* Header — same card style as Method */}
          <div
            className="partner-header-box max-w-3xl mx-auto mb-10 px-10 py-6
              border border-white/10
              bg-[#0f0f0f]/90 backdrop-blur-sm
              shadow-2xl shadow-black/80"
          >
            <h2 className="text-4xl md:text-3xl font-semibold text-white leading-tight">
              Our curriculum is designed to align with global<br /> tech leaders like:
            </h2>
          </div>

          {/* Partner logos */}
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8">
            {partners.map((partner) => (
              <div
                key={partner.name}
                className="partner-card flex items-center justify-center
                  border border-white/10
                  bg-[#0f0f0f]/90 backdrop-blur-sm
                  rounded-xl px-5 py-4
                  min-w-[100px] h-20
                  transition-all duration-300 cursor-pointer"
              >
                <Image
                  src={partner.logo}
                  alt={`${partner.name} logo`}
                  width={80}
                  height={30}
                  className="object-contain opacity-50 hover:opacity-100 transition-opacity duration-200"
                  style={{ filter: "brightness(0) invert(1)" }}
                />
              </div>
            ))}
          </div>
        </div>
      </FadeUpOnScroll>
    </section>
  );
}