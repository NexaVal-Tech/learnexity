import React from "react";

interface CoursesProps {
  variant?: "white" | "black"; // controls text color
}

const courses = [
  "AI Courses",
  "Cloud Computing",
  "DevOps",
  "Cybersecurity",
  "Web3",
  "Product Design",
  "Data Analytics",
  "Product Management",
  "Web Development",
  "Digital Marketing",
  "Video Editing",
  "AI Courses",
  "Cloud Computing",
  "DevOps",
];

export default function HeaderCourse({ variant = "white" }: CoursesProps) {
  const textColor = variant === "white" ? "text-white" : "text-black";

  return (
    <div className="b-[#5B4FFF] py-2">
      <div className="max-w-screen-2xl mx-auto px-8">
        <div className="overflow-x-auto scrollbar-hide">
          <div className={`flex space-x-8 text-sm sm:text-xl mt-2 sm:mt-2 min-w-max ${textColor}`}>
            {courses.map((course, index) => (
              <span key={index} className="whitespace-nowrap">
                {course}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
