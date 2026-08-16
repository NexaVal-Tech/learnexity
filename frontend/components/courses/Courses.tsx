import { FadeInCard, FadeUpOnScroll } from "../animations/Animation";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Course } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Auto-scroll speed (px/sec) and how long the carousel must sit idle
// (no hover/touch/drag) before autoplay resumes.
const AUTO_SCROLL_PX_PER_SEC = 45;
const RESUME_IDLE_MS = 7000;

export default function Courses() {
  const [deepTechCourses, setDeepTechCourses] = useState<Course[]>([]);
  const [flexCourses, setFlexCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Scroll container ref — this element is the actual `overflow-x-auto`
  // scroller now, driven by JS (scrollLeft) instead of a CSS transform, so
  // native touch/mouse-drag scrolling and the autoplay loop can share the
  // same scroll position without fighting each other.
  const scrollerRef = useRef<HTMLDivElement>(null);
  // true while the pointer is hovering or a touch is active over the carousel
  const isActiveRef = useRef(false);
  // true only while an actual mouse click-drag is in progress
  const isDraggingRef = useRef(false);
  // ms timestamp (Date.now()) of the last interaction — autoplay resumes
  // once this is more than RESUME_IDLE_MS in the past. Starts at 0 so
  // autoplay begins immediately on first mount.
  const lastInteractionRef = useRef(0);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);
  // true if the current/last mouse gesture moved enough to count as a drag
  // rather than a click — used to swallow the click so dragging a card
  // doesn't also navigate to it.
  const draggedRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);

        const [deepRes, flexRes] = await Promise.all([
          fetch(
            API_URL + "/api/courses/by-track?track[]=group_mentorship&track[]=one_on_one",
            { headers: { Accept: "application/json" } }
          ),
          fetch(
            API_URL + "/api/courses/by-track?track[]=self_paced",
            { headers: { Accept: "application/json" } }
          ),
        ]);

        const deepData = await deepRes.json();
        const flexData = await flexRes.json();

        setDeepTechCourses(Array.isArray(deepData) ? deepData : deepData?.data ?? []);
        setFlexCourses(Array.isArray(flexData) ? flexData : flexData?.data ?? []);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
        setError("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const allCards = [
    ...deepTechCourses.map((course) => ({
      type: "course" as const,
      data: course,
    })),
    ...(flexCourses.length > 0
      ? [
          {
            type: "flex" as const,
            data: null,
          },
        ]
      : []),
  ];

  const marqueeItems = [...allCards, ...allCards];

  // ── Autoplay loop ──────────────────────────────────────────────────────
  // Drives scrollLeft directly via requestAnimationFrame so it coexists
  // with native drag/touch scrolling on the same element. Pauses whenever
  // the carousel is hovered/touched/dragged, and resumes RESUME_IDLE_MS
  // after the last interaction ends.
  useEffect(() => {
    if (allCards.length === 0) return;
    let lastTime: number | null = null;

    const tick = (time: number) => {
      const el = scrollerRef.current;
      if (el) {
        const dt = lastTime == null ? 0 : time - lastTime;
        const idleMs = Date.now() - lastInteractionRef.current;
        const shouldAutoScroll = !isActiveRef.current && !isDraggingRef.current && idleMs >= RESUME_IDLE_MS;

        if (shouldAutoScroll && dt > 0) {
          el.scrollLeft += (AUTO_SCROLL_PX_PER_SEC * dt) / 1000;
          const half = el.scrollWidth / 2;
          if (half > 0 && el.scrollLeft >= half) {
            el.scrollLeft -= half;
          }
        }
      }
      lastTime = time;
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [allCards.length]);

  const markInteraction = () => {
    lastInteractionRef.current = Date.now();
  };

  const handleMouseEnter = () => {
    isActiveRef.current = true;
    markInteraction();
  };
  const handleMouseLeave = () => {
    isActiveRef.current = false;
    isDraggingRef.current = false;
    markInteraction();
  };
  const handleTouchStart = () => {
    isActiveRef.current = true;
    markInteraction();
  };
  const handleTouchEnd = () => {
    isActiveRef.current = false;
    markInteraction();
  };

  // Click-drag-to-scroll for desktop (mouse). Touch is left entirely to the
  // browser's native overflow-x-auto scrolling — we just bail out early for
  // touch pointers here so we never fight the native gesture.
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (!el || e.pointerType === 'touch') return;
    isDraggingRef.current = true;
    draggedRef.current = false;
    markInteraction();
    dragStartXRef.current = e.clientX;
    dragStartScrollLeftRef.current = el.scrollLeft;
    try { el.setPointerCapture(e.pointerId); } catch {}
  };
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const el = scrollerRef.current;
    if (!el) return;
    const dx = e.clientX - dragStartXRef.current;
    if (Math.abs(dx) > 5) draggedRef.current = true;
    el.scrollLeft = dragStartScrollLeftRef.current - dx;
    markInteraction();
  };
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    markInteraction();
    try { scrollerRef.current?.releasePointerCapture(e.pointerId); } catch {}
  };

  // Seamless forward loop: content is duplicated (marqueeItems), so once
  // scrollLeft passes the halfway point — whether from autoplay or a manual
  // drag/swipe — jump back by half so it looks continuous.
  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const half = el.scrollWidth / 2;
    if (half > 0 && el.scrollLeft >= half) {
      el.scrollLeft -= half;
    }
  };

  // Swallow the click that follows a drag so dragging a card doesn't also
  // navigate to it via the card's <Link>.
  const handleClickCapture = (e: React.MouseEvent) => {
    if (draggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      draggedRef.current = false;
    }
  };

  return (
    <FadeUpOnScroll>
      <section className="py-20">
        <div className="max-w-screen-xl mx-auto px-6">
          <FadeInCard>
            <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
              <div>
                <h2 className="text-5xl font-semibold text-gray-900 dark:text-white mb-4 leading-tight">
                  In-Demand Courses That <br className="block lg:hidden" />
                  Get Results
                </h2>
                <p className="text-gray-600 dark:text-gray-200 text-xl">
                  Proven curriculum with measurable outcomes
                </p>
              </div>
            </div>
          </FadeInCard>

          {loading && (
            <div className="text-center py-12">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-gray-900 dark:border-white border-r-transparent" />
              <p className="text-gray-900 dark:text-white mt-4">Loading courses...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-400 text-lg">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <FadeInCard>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-3 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Swipe or scroll to see more courses
              </p>

              <div
                ref={scrollerRef}
                className="overflow-x-auto relative no-scrollbar cursor-grab active:cursor-grabbing select-none"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onScroll={handleScroll}
                onClickCapture={handleClickCapture}
              >
                <div className="flex gap-4 w-max items-stretch">
                  {marqueeItems.map((item, index) => {
                    if (item.type === "course") {
                      const course = item.data as Course;

                      return (
                        <Link
                          key={`course-${course.id}-${index}`}
                          href={`/courses/${course.course_id}`}
                          className="block transition-transform hover:scale-105 flex-shrink-0 w-[19rem] sm:w-[18rem] md:w-[22rem] lg:w-[26rem] xl:w-[28rem]"
                        >
                          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-transparent rounded-3xl p-4 h-full flex flex-col cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-300 mb-4">
                              {course.title}
                            </h3>

                            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 line-clamp-3 flex-grow">
                              {course.description}
                            </p>

                            <div className="space-y-2">
                              {course.learnings?.length ? (
                                course.learnings.slice(0, 3).map((learning) => (
                                  <div
                                    key={learning.id}
                                    className="bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-2 flex items-center gap-3"
                                  >
                                    <div className="w-5 h-5 bg-[#4A3AFF] rounded-full flex items-center justify-center flex-shrink-0">
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

                                    <span className="text-gray-700 dark:text-gray-300 text-lg">
                                      {learning.learning_point}
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <div className="text-gray-500 dark:text-gray-400 text-lg italic">
                                  Click to learn more about this course
                                </div>
                              )}
                            </div>
                          </div>
                        </Link>
                      );
                    }

                    if (item.type === "flex") {
                      return (
                        <Link
                          key={`flex-${index}`}
                          href="/flex"
                          className="block flex-shrink-0 w-[19rem] sm:w-[18rem] md:w-[22rem] lg:w-[26rem] xl:w-[28rem]"
                        >
                          <div
                            className="h-full flex flex-col rounded-3xl p-5 cursor-pointer transition-all duration-300 hover:scale-[1.02] bg-gray-900"
                            style={{
                              border: "1px solid rgba(74,58,255,0.35)",
                              boxShadow:
                                "0 0 40px rgba(74,58,255,0.12), inset 0 1px 0 rgba(255,255,255,0.05)",
                            }}
                          >
                            <h3 className="text-2xl font-bold text-white mb-2 leading-snug">
                              Explore Our Flexible Courses
                            </h3>
                            <p className="text-gray-400 text-sm mb-5 leading-relaxed">
                              Learn at your own pace, no fixed schedule, Start anytime.
                            </p>

                            {/* Scrollable flex course list — shows ~3, scrolls for more */}
                            <div
                              className="flex-grow overflow-y-auto pr-0.5 flex-list"
                              style={{
                                maxHeight: "10.5rem" /* ~3 items × 3.5rem each */,
                                scrollbarWidth: "none" /* Firefox */,
                                msOverflowStyle: "none" /* IE */,
                              }}
                            >
                              <div className="space-y-2">
                                {flexCourses.map((course) => (
                                  <div
                                    key={course.id}
                                    className="flex items-center gap-3 rounded-full px-3 py-2"
                                    style={{
                                      background: "rgba(74,58,255,0.08)",
                                      border: "1px solid rgba(74,58,255,0.15)",
                                    }}
                                  >
                                    <div
                                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                      style={{ background: "rgba(74,58,255,0.3)" }}
                                    >
                                      <svg
                                        className="w-3 h-3"
                                        style={{ color: "#a89fff" }}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={3}
                                          d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                                        />
                                      </svg>
                                    </div>
                                    <span className="text-gray-300 font-medium text-sm truncate">
                                      {course.title}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div
                              className="mt-5 flex items-center justify-between px-4 py-3 rounded-2xl font-semibold text-sm text-white transition-all duration-200"
                              style={{
                                background: "#4A3AFF",
                                boxShadow: "0 4px 20px rgba(74,58,255,0.4)",
                              }}
                            >
                              <span>Browse flexible programmes</span>
                              <svg
                                className="w-4 h-4 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2.5}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </div>
                          </div>
                        </Link>
                      );
                    }

                    return null;
                  })}
                </div>
              </div>
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