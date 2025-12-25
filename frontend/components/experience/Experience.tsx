// import {  FadeUpOnScroll, } from "../animations/Animation";

export default function Experience() {
  return (
    <section className="py-20 bg-white">
      {/* <FadeUpOnScroll> */}
        <div className="max-w-screen-2xl mx-auto px-6 flex flex-col md:flex-row items-start">
    
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h2 className="text-4xl font-semibold text-gray-900 component-headers ">
              The <span className="text-[#F59E0B]">Experience</span> <br />Paradox Solved
            </h2>
          </div>

          <div className="md:w-[35%] md:ml-4">
            <p className="text-lg text-gray-900">
                You have the skills. The market wants experience. Learnexity bridges the gap with real projects, expert mentorship, and career pathways that turn knowledge into hire-ready confidence.
            </p>
          </div>
        </div>
      {/* </FadeUpOnScroll> */}
    </section>
  );
}
