import {
  ScrollFadeIn,
  FadeInCard,
  FadeUpOnScroll,
  ZoomAnimation,
} from "../animations/Animation";

export default function Experience() {
  return (
    <section className="py-20 bg-white">
      <FadeUpOnScroll>
        <div className="max-w-screen-2xl mx-auto px-6 flex flex-col md:flex-row items-start">
    
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h2 className="text-4xl font-semibold text-gray-900 component-headers ">
              The <span className="text-[#F59E0B]">Experience</span> <br />Paradox Solved
            </h2>
          </div>

          <div className="md:w-[35%] md:ml-4">
            <p className="text-lg text-gray-900">
              You’re Considering tech? You have the skills, but the job market
              demands experience. Now, Learnexity closes the classic “can’t get
              hired without experience, can’t get experience without being hired”
              loop. We provide real projects, mentorship, and pathways to help you
              transition into the next great field.
            </p>
          </div>
        </div>
      </FadeUpOnScroll>
    </section>
  );
}
