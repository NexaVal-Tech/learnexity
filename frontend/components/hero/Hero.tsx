import React from "react";
import { PrimaryButton } from "../button/Button";
import { FadeInCard, FadeUpOnScroll,} from "../animations/Animation";
import Courses from "../headercourses/HeaderCourse"; 

export default function Hero() {
  return (
    <FadeUpOnScroll>
      <section className="bg-gradient-to-br from-[#6025F5] via-[#855EEA] to-[#B2A0DD] pt-16 md:pt-20 pb-10 min-h-screen">
        
        {/* Course Categories Navigation */}
        <Courses variant="white" />

        {/* Main Hero Content */}
        <div className="flex items-center flex-1 pt-8 md:pt-30">
          <div className="max-w-screen-2xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <FadeInCard>
              <div className="text-white">
                <h1 className="text-5xl md:text-6xl font-semibold leading-tight mb-8 md:mb-12">
                  Build and Get Hired  with 
                  <span className="text-white"> Learnexity</span>.
                </h1>
                <p className="text-lg md:text-xl text-white/90 mb-6 md:mb-8 leading-relaxed">
                  We provide the real-world experience and mentorship that
                  transforms your skills into a career.
                </p>

                <PrimaryButton />
              </div>
            </FadeInCard>

            {/* Right Content - Hero Image */}
            <div className="flex justify-center mt-[-16] md:mt-0">
              <div className="w-full flex justify-center md:justify-end gap-3 sm:gap-8 pt-6 md:pt-0">
                    <img src="/images/hero-1.png" alt="" className="border-4 border-white rounded-2xl w-40 h-60 sm:w-40 sm:h-56 md:w-52 md:h-72 lg:w-70 lg:h-120 object-cover -mt-8"/>
                    <img src="/images/hero-2.png" alt="" className="border-4 border-white rounded-2xl w-40 h-60 sm:w-40 sm:h-56 md:w-52 md:h-72 lg:w-70 lg:h-120 object-cover"/>
              </div>
            </div>
          </div>
        </div>
      </section>
    </FadeUpOnScroll>
  );
}
