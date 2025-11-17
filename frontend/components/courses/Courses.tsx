import { FadeInCard, FadeUpOnScroll } from "../animations/Animation";
import Link from "next/link";
import { coursesData } from "@/data/coursesData";

export default function Courses() {
  // Limit to first 4–5 items or show all (your choice)
  const previewCourses = coursesData.slice(0, 4); // You can increase if needed

  return (
    <FadeUpOnScroll>
      <section className="py-20 bg-black">
        <div className="max-w-screen-2xl mx-auto px-6">
          {/* Header */}
          <FadeInCard>
            <div className="flex flex-col md:flex-row justify-between items-start mb-16 gap-6">
              <div>
                <h2 className="text-5xl font-semibold text-white mb-4 leading-tight">
                  In-Demand Courses That <br className="hidden md:block" />
                  Get Results
                </h2>
              </div>
              <div className="text-right">
                <p className="text-gray-200 mb-6 text-lg">
                  Proven curriculum with measurable
                  outcomes
                </p>
                <Link href="courses/courses">
                  <button className="bg-white text-purple-600 px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition flex items-center gap-2">
                    See complete course catalog
                    <img
                      src="/icons/arrow_right_line.png"
                      alt="icon"
                      width={16}
                      height={16}
                    />
                  </button>
                </Link>
              </div>
            </div>
          </FadeInCard>

          {/* Course Cards */}
          <FadeInCard>
            <div className="overflow-x-auto pb-4 scrollbar-hide">
              <div className="flex gap-4 min-w-max">

                {/* LOOP THROUGH COURSES */}
                {previewCourses.map((course) => (
                  <div key={course.id} className="bg-gray-900 rounded-3xl p-4 w-[19rem] sm:w-[18rem] md:w-[22rem] lg:w-[26rem] xl:w-[28rem] flex-shrink-0">
                    {/* Dynamic Course Title */}
                    <h3 className="text-2xl font-bold text-gray-300 mb-4">
                      {course.title}
                    </h3>

                    {/* Dynamic Description */}
                    <p className="text-gray-300 mb-6">
                      {course.description}
                    </p>

                    {/* Dynamic What You Will Learn (first 3 bullets only) */}
                    <div className="space-y-2">
                      {course.whatYouWillLearn.slice(0, 3).map((item, index) => (
                        <div  key={index} className="bg-gray-700 rounded-full px-2 py-2 flex items-center gap-3">
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                            </svg>
                          </div>
                          <span className="text-gray-300 text-sm">
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

              </div>
            </div>
          </FadeInCard>
        </div>
      </section>
    </FadeUpOnScroll>
  );
}
