import { FadeInCard, FadeUpOnScroll } from "../animations/Animation";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { api, Course } from "@/lib/api";

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await api.courses.getAll();
        setCourses(data);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
        setError('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Track scroll progress for the indicator
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const max = el.scrollWidth - el.clientWidth;
      setScrollProgress(max > 0 ? el.scrollLeft / max : 0);
    };
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [loading]);

  const scrollBy = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "right" ? 320 : -320, behavior: "smooth" });
  };

  return (
    <FadeUpOnScroll>
      <section className="py-20">
        <div className="max-w-screen-xl mx-auto px-6">
          {/* Header */}
          <FadeInCard>
            <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
              <div>
                <h2 className="text-5xl font-semibold text-white mb-4 leading-tight">
                  In-Demand Courses That <br className="block lg:hidden" />
                  Get Results
                </h2>
                <p className="text-gray-200 text-xl">
                  Proven curriculum with measurable outcomes
                </p>
              </div>
            </div>
          </FadeInCard>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-white border-r-transparent"></div>
              <p className="text-white mt-4">Loading courses...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-red-400 text-lg">{error}</p>
            </div>
          )}

          {/* Course Cards */}
          {!loading && !error && (
            <FadeInCard>
              {/* Scroll hint label */}
              <p className="text-gray-400 text-sm mb-3 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Swipe or scroll to see more courses
              </p>

              <div
                ref={scrollRef}
                className="overflow-x-auto pb-4 scrollbar-hide"
              >
                {/* items-stretch + h-full chain makes all cards equal height */}
                <div className="flex gap-4 min-w-max items-stretch">
                  {courses.map((course) => (
                    <Link
                      key={course.id}
                      href={`/courses/${course.course_id}`}
                      className="block transition-transform hover:scale-105 flex-shrink-0
                                 w-[19rem] sm:w-[18rem] md:w-[22rem] lg:w-[26rem] xl:w-[28rem]"
                    >
                      {/* flex-col + h-full makes inner content fill the card */}
                      <div className="bg-gray-900 rounded-3xl p-4 h-full flex flex-col
                                      cursor-pointer hover:bg-gray-800 transition-colors">
                        {/* Course Title */}
                        <h3 className="text-2xl font-bold text-gray-300 mb-4">
                          {course.title}
                        </h3>

                        {/* Description — flex-grow pushes learnings to the bottom */}
                        <p className="text-lg text-gray-300 mb-6 line-clamp-3 flex-grow">
                          {course.description}
                        </p>

                        {/* Learnings — always at the bottom */}
                        <div className="space-y-2">
                          {course.learnings && course.learnings.length > 0 ? (
                            course.learnings.slice(0, 3).map((learning) => (
                              <div
                                key={learning.id}
                                className="bg-gray-700 rounded-full px-2 py-2 flex items-center gap-3"
                              >
                                <div className="w-5 h-5 bg-[#4A3AFF] rounded-full flex items-center justify-center flex-shrink-0">
                                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                                <span className="text-gray-300 text-lg">
                                  {learning.learning_point}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="text-gray-400 text-lg italic">
                              Click to learn more about this course
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Scroll controls */}
              <div className="flex items-center justify-center gap-4 mt-5">
                <button
                  onClick={() => scrollBy("left")}
                  aria-label="Scroll left"
                  className="w-9 h-9 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors
                             flex items-center justify-center text-white flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Progress bar */}
                <div className="w-40 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#4A3AFF] rounded-full transition-all duration-150"
                    style={{ width: `${Math.max(8, scrollProgress * 100)}%` }}
                  />
                </div>

                <button
                  onClick={() => scrollBy("right")}
                  aria-label="Scroll right"
                  className="w-9 h-9 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors
                             flex items-center justify-center text-white flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </FadeInCard>
          )}
        </div>
      </section>
    </FadeUpOnScroll>
  );
}