import {
  ScrollFadeIn,
  FadeInCard,
  FadeUpOnScroll,
  ZoomAnimation,
} from "../animations/Animation";
import { SignUpButton2 } from "../button/Button";

export default function Skills() {
  const skills = [
    "Frontend Development",
    "Backend Development", 
    "Product Design",
    "Digital Marketing",
    "Web3 Development",
    "Cloud Computing",
    "Data Analytics",
    "Product Management",
    "AI Automation",
    "DevOps"
  ];

  return (
    <FadeUpOnScroll>
      <section className="py-20 bg-white dark:bg-[#0a0a0f]">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 dark:text-white mb-8">
            In - Demand Tech Skills We Support
          </h2>

          <FadeInCard>
            <div className="flex flex-wrap justify-center items-center gap-4">
              {skills.map((skill) => (
                <div
                  key={skill}
                  className="bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-lg text-gray-800 dark:text-white font-medium text-sm md:text-base"
                >
                  {skill}
                </div>
              ))}
            </div>
          </FadeInCard>
        </div>

        {/* ✅ Centered button */}
        <div className="mt-10 flex justify-center">
          <SignUpButton2 />
        </div>
      </section>
    </FadeUpOnScroll>
  );
}