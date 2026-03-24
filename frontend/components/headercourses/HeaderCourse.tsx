// components/headercourses/HeaderCourse.tsx
import React, { useEffect, useRef, useState } from "react";
import { Course } from "@/lib/api";
import { subscribeCourses } from "@/lib/courseCache";
import Link from "next/link";

interface CoursesProps {
  variant?: "white" | "black";
}

export default function HeaderCourse({ variant = "white" }: CoursesProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textColor = variant === "white" ? "text-white" : "text-black";

  useEffect(() => {
    // Uses the shared cache — zero extra network request if courses.tsx
    // or [id].tsx already fetched them.
    const unsub = subscribeCourses(setCourses);
    return unsub;
  }, []);

  // AUTO SCROLL EFFECT
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || courses.length === 0) return;

    const interval = setInterval(() => {
      container.scrollBy({ left: 200, behavior: "smooth" });

      if (container.scrollLeft + container.clientWidth >= container.scrollWidth) {
        setTimeout(() => {
          container.scrollTo({ left: 0, behavior: "smooth" });
        }, 500);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [courses]);

  return (
    <div className="py-2 overflow-hidden">
      <div className="max-w-screen-xl mx-auto px-8">
        <div
          ref={scrollRef}
          className="overflow-x-auto scrollbar-hide whitespace-nowrap"
        >
          <div className={`flex gap-8 text-sm sm:text-xl mt-2 min-w-max ${textColor}`}>
            {courses.length > 0 ? (
              courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.course_id}`}
                  className="cursor-pointer hover:text-gray-400 transition"
                >
                  {course.title}
                </Link>
              ))
            ) : (
              // Show pill skeletons while loading instead of "Loading courses..."
              <div className="flex gap-8">
                {[120, 90, 140, 100, 110].map((w, i) => (
                  <div
                    key={i}
                    className="h-5 rounded-full bg-gray-400/30 animate-pulse"
                    style={{ width: w }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}