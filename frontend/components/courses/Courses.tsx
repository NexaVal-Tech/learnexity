import React from "react";
import { FadeInCard, FadeUpOnScroll } from "../animations/Animation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Course } from "@/lib/api";
import { CmsText } from "@/components/cms/ui";
import { CarouselArrows, useCarousel } from "@/components/ui/CarouselArrows";
import { f } from "@/lib/cms/fields";
import type { BlockDefinition } from "@/lib/cms/blockTypes";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface HomeCoursesData {
  heading: string;
  subheading: string;
  /** No longer shown (the flexible-courses card was removed); kept so saved content still loads. */
  flexCardTitle?: string;
  flexCardText?: string;
}

export const HOME_COURSES_DEFAULTS: HomeCoursesData = {
  // The line break only applies below the lg breakpoint (as before).
  heading: "In-Demand Courses That\nGet Results",
  subheading: "Proven curriculum with measurable outcomes",
};

export default function Courses({ data = HOME_COURSES_DEFAULTS }: { data?: HomeCoursesData }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // No autoplay: visitors swipe (touch), drag (mouse) or use the arrows.
  const { ref: scrollerRef, canPrev, canNext, scrollByCard, dragHandlers } = useCarousel<HTMLDivElement>([courses.length]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          API_URL + "/api/courses/by-track?track[]=group_mentorship&track[]=one_on_one&lite=1",
          { headers: { Accept: "application/json" } }
        );
        const body = await res.json();
        setCourses(Array.isArray(body) ? body : body?.data ?? []);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
        setError("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <FadeUpOnScroll>
      <section className="py-20">
        <div className="max-w-screen-xl mx-auto px-6">
          <FadeInCard>
            <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
              <div>
                <h2 className="text-5xl font-semibold text-gray-900 dark:text-white mb-4 leading-tight">
                  {(data.heading ?? "").split("\n").map((line, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && <>{" "}<br className="block lg:hidden" /></>}
                      <CmsText text={line} />
                    </React.Fragment>
                  ))}
                </h2>
                <p className="text-gray-600 dark:text-gray-200 text-xl">
                  <CmsText text={data.subheading} />
                </p>
              </div>
            </div>
          </FadeInCard>

          {loading && (
            <div className="flex gap-4 overflow-hidden" aria-label="Loading courses">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-[19rem] sm:w-[18rem] md:w-[22rem] lg:w-[26rem] xl:w-[28rem] h-80 rounded-3xl animate-pulse bg-gray-100 dark:bg-gray-900"
                />
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-400 text-lg">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <FadeInCard>
              <div
                ref={scrollerRef}
                className="no-scrollbar overflow-x-auto relative snap-x snap-mandatory scroll-smooth cursor-grab active:cursor-grabbing select-none"
                {...dragHandlers}
              >
                <div className="flex gap-4 w-max items-stretch pb-1">
                  {courses.map((course) => (
                    <Link
                      key={course.id}
                      href={`/courses/${course.course_id}`}
                      draggable={false}
                      className="snap-start block transition-transform hover:-translate-y-1 flex-shrink-0 w-[19rem] sm:w-[18rem] md:w-[22rem] lg:w-[26rem] xl:w-[28rem]"
                    >
                      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-transparent rounded-3xl p-4 h-full flex flex-col cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-300 mb-4">{course.title}</h3>

                        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 line-clamp-3 flex-grow">{course.description}</p>

                        <div className="space-y-2">
                          {course.learnings?.length ? (
                            course.learnings.slice(0, 3).map((learning) => (
                              // Rectangular "what you'll learn" rows (small radius)
                              <div key={learning.id} className="bg-gray-100 dark:bg-gray-800 rounded-md px-3 py-2.5 flex items-center gap-3">
                                <div className="w-5 h-5 bg-[#4A3AFF] rounded flex items-center justify-center flex-shrink-0">
                                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                                <span className="text-gray-700 dark:text-gray-300 text-lg">{learning.learning_point}</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-gray-500 dark:text-gray-400 text-lg italic">Click to learn more about this course</div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <CarouselArrows
                className="mt-6 justify-end"
                canPrev={canPrev}
                canNext={canNext}
                onPrev={() => scrollByCard(-1)}
                onNext={() => scrollByCard(1)}
                label="course"
              />
            </FadeInCard>
          )}
        </div>
      </section>

      <style jsx>{`
        .no-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </FadeUpOnScroll>
  );
}

export const block: BlockDefinition<HomeCoursesData> = {
  type: "home.courses",
  label: "Featured courses carousel",
  category: "Homepage",
  description: "Heading plus the live course carousel. The courses themselves come from Course Management.",
  fields: [
    f.textarea("heading", "Heading", { rows: 2, help: "A line break here only applies on smaller screens." }),
    f.text("subheading", "Subheading"),
  ],
  defaults: HOME_COURSES_DEFAULTS,
};
