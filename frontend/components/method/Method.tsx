"use client";

import { ScrollFadeIn } from "@/components/animations/Animation";

const BRAND = "#4A3AFF";

const cards = [
  {
    label: "Turn Your Skills Into Income",
    icon: "/icons/black_folder.png",
    description:
      "We do not just teach tech skills; we help you start earning with them.",
  },
  {
    label: "Get Job Placement",
    icon: "/icons/hugeicons_mentoring.png",
    description:
      "Get matched with our local and international partners for your dream job.  ",
  },
  {
    label: "Gain Real-World Internship Experience",
    icon: "/icons/job.png",
    description:
      "We provide the hands-on experience employers are looking for.",
  },
  {
    label: "Job Support:",
    icon: "/icons/job.png",
    description:
      "We help you with resume reviews, LinkedIn optimization, interview preparation, and access to remote and global job opportunities.",
  },
];

export default function Method() {
  return (
    <section className="py-16">
      <style>{`
        .method-card:hover {
          border-color: ${BRAND}66 !important;
          box-shadow:
            0 20px 60px rgba(0, 0, 0, 0.6),
            0 0 30px ${BRAND}33 !important;
        }
        .header-box {
          border-radius: 2rem 0.75rem 2rem 0.75rem;
        }
        .method-card {
          border-radius: 2rem 0.75rem 2rem 0.75rem;
        }
      `}</style>

      <div className="max-w-screen-xl mx-auto px-6">
        {/* Header */}
        <ScrollFadeIn delay={0}>
          <div
            className="header-box max-w-3xl mx-auto text-center mb-10 px-10 py-6
              border border-white/10
              bg-[#0f0f0f]/90 backdrop-blur-sm
              shadow-2xl shadow-black/80"
          >
            <h2 className="text-4xl md:text-5xl font-semibold text-white mb-4">
              Why Choose Learnexity
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              We help you move from learning, 
              <span style={{ color: "#4A3AFF" }}> to earning, </span> 
               to real opportunity, without quitting your job.
            </p>
          </div>
        </ScrollFadeIn>

        {/* 4 cards in a single row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => (
            <ScrollFadeIn key={card.label} delay={index * 0.15} duration={0.3}>
              <div
                className="h-full method-card flex flex-col items-center text-center px-6 py-8
                  border border-white/10
                  bg-[#0f0f0f]/90 backdrop-blur-sm
                  shadow-2xl shadow-black/80
                  hover:-translate-y-2
                  cursor-pointer transition-all duration-300
                  min-h-[280px]"
              >
                {/* Icon centered on top in brand color */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-5 flex-shrink-0"
                  style={{ backgroundColor: `${BRAND}22` }}
                >
                  <img
                    src={card.icon}
                    alt={card.label}
                    className="w-6 h-6"
                    style={{ filter: "invert(30%) sepia(90%) saturate(500%) hue-rotate(210deg) brightness(120%)" }}
                  />
                </div>

                {/* Text below */}
                <h3 className="text-2xl font-semibold text-white mb-2">
                  {card.label}
                </h3>
                <p className="text-gray-400 text-xl">
                  {card.description}
                </p>
              </div>
            </ScrollFadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}