// components/button/button.tsx
import React from "react";
import Link from "next/link";
import { CourseActionButton } from "./CourseActionButton";

// Primary Button → White background, purple text, arrow bg purple + white arrow
export const PrimaryButton = ({ label = "Explore courses", href = "/courses/courses" }) => {
  return (
    <Link href={href}>
      <button className="bg-white text-[#6C63FF] px-2 py-1 rounded-full font-semibold text-base md:text-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
        <span>{label}</span>
        <span className="w-12 h-6 md:w-16 md:h-8 flex items-center justify-center rounded-full bg-[#4A3AFF] text-white">
          <img src="/icons/arrow_right_line (1).png" alt="icon" className="w-6 h-6 object-contain"/>
        </span>
      </button>
    </Link>
  );
};

// Secondary Button → Purple background, white text, arrow bg white + purple arrow
export const SecondaryButton = ({ label = "Join Community", href = "#" }) => {
  return (
    <Link href={href}>
      <button className="bg-[#4A3AFF] text-white px-2 py-1 rounded-full font-semibold text-base md:text-lg hover:bg-[#3A2AFF] transition-colors flex items-center space-x-2">
        <span>{label}</span>
        <span className="w-12 h-6 md:w-16 md:h-8 flex items-center justify-center rounded-full bg-white text-[#4A3AFF]">
          <img src="/icons/arrow_right_line_blue.png" alt="icon" className="w-6 h-6 object-contain" />
        </span>
      </button>
    </Link>
  );
};

// talk to an expert button
export const ExpertButton = ({ label = "talk to an expert", href = "#"}) => {
  return (
    <Link href={href}>
        <button className="text-indigo-600 font-medium hover:text-indigo-700 transition-colors tes-xl p-2">
           <span>{label}</span>
        </button>
    </Link>
  )
}

// Smart Get Started button - changes based on auth state
export const GetStarted = ({ 
  label = "Get Started", 
  courseId,
  courseName,
  coursePrice
}: { 
  label?: string;
  courseId?: string;
  courseName?: string;
  coursePrice?: number;
}) => {
  // If course details are provided, use the smart button
  if (courseId && courseName) {
    return (
      <CourseActionButton
        courseId={courseId}
        courseName={courseName}
        coursePrice={coursePrice}
        variant="get-started"
      />
    );
  }

  // Otherwise, use the static button
  return (
    <Link href="/user/auth/register">
      <button className="bg-white text-[#6C63FF] px-2 py-1 rounded-full font-semibold text-base md:text-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
        <span>{label}</span>
        <span className="w-12 h-6 md:w-16 md:h-8 flex items-center justify-center rounded-full bg-[#4A3AFF] text-white">
          <img src="/icons/arrow_right_line (1).png" alt="icon" className="w-6 h-6 object-contain"/>
        </span>
      </button>
    </Link>
  );
};

// Smart Payment button - changes based on enrollment state
export function MakePaymentButton({ 
  courseId, 
  courseName, 
  coursePrice 
}: { 
  courseId: string;
  courseName: string;
  coursePrice?: number;
}) {
  return (
    <CourseActionButton
      courseId={courseId}
      courseName={courseName}
      coursePrice={coursePrice}
      variant="make-payment"
    />
  );
}

// Export the smart button directly
export { CourseActionButton };