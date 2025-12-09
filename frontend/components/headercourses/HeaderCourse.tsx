import React, { useEffect, useRef, useState } from "react";
import { api, Course } from "@/lib/api";
import Link from "next/link";

interface CoursesProps {
  variant?: "white" | "black";
}

export default function HeaderCourse({ variant = "white" }: CoursesProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textColor = variant === "white" ? "text-white" : "text-black";

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await api.courses.getAll();
        setCourses(data);
      } catch (error) {
        console.error("Failed to load courses:", error);
      }
    };

    fetchCourses();
  }, []);

  // AUTO SCROLL EFFECT
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const interval = setInterval(() => {
      container.scrollBy({ left: 200, behavior: "smooth" });

      // If reached end → go back to start
      if (container.scrollLeft + container.clientWidth >= container.scrollWidth) {
        setTimeout(() => {
          container.scrollTo({ left: 0, behavior: "smooth" });
        }, 500);
      }
    }, 2000); // <-- scroll every 2 seconds (you can increase or reduce)

    return () => clearInterval(interval);
  }, [courses]);

  return (
    <div className="py-2 overflow-hidden">
      <div className="max-w-screen-2xl mx-auto px-8">
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
              <span>Loading courses...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
