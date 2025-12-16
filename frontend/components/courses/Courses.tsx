import { FadeInCard, FadeUpOnScroll } from "../animations/Animation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { api, Course } from "@/lib/api";

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch courses from database
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await api.courses.getAll();
        // Show all courses
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
                <p className="text-gray-200 text-lg">
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
              <div className="overflow-x-auto pb-4 scrollbar-hide">
                <div className="flex gap-4 min-w-max">
                  {courses.map((course) => (
                    <Link 
                      key={course.id} 
                      href={`/courses/${course.course_id}`}
                      className="block transition-transform hover:scale-105"
                    >
                      <div className="bg-gray-900 rounded-3xl p-4 w-[19rem] sm:w-[18rem] md:w-[22rem] lg:w-[26rem] xl:w-[28rem] flex-shrink-0 cursor-pointer hover:bg-gray-800 transition-colors">
                        {/* Course Title */}
                        <h3 className="text-2xl font-bold text-gray-300 mb-4">
                          {course.title}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-300 mb-6 line-clamp-3">
                          {course.description}
                        </p>

                        {/* What You Will Learn (first 3 items) */}
                        <div className="space-y-2">
                          {course.learnings && course.learnings.length > 0 ? (
                            course.learnings.slice(0, 3).map((learning) => (
                              <div 
                                key={learning.id} 
                                className="bg-gray-700 rounded-full px-2 py-2 flex items-center gap-3"
                              >
                                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                  <svg 
                                    className="w-3 h-3 text-white" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                  >
                                    <path 
                                      strokeLinecap="round" 
                                      strokeLinejoin="round" 
                                      strokeWidth={3} 
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                </div>
                                <span className="text-gray-300 text-sm">
                                  {learning.learning_point}
                                </span>
                              </div>
                            ))
                          ) : (
                            // Fallback if no learnings available
                            <div className="text-gray-400 text-sm italic">
                              Click to learn more about this course
                            </div>
                          )}
                        </div>

                        {/* Optional: Display price */}
                        {course.price > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-700">
                            <span className="text-green-400 font-bold text-xl">
                              ${course.price}
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </FadeInCard>
          )}
        </div>
      </section>
    </FadeUpOnScroll>
  );
}