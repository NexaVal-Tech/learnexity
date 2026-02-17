import React from "react";
import Courses from "../headercourses/HeaderCourse";

export default function Hero() {
  return (
    <section className=" relative pt-16 md:pt-20 h-screen overflow-hidden bg-black">

      {/* Full-screen Background Video */}
      <video
        className="absolute inset-0 w-full h-full object-cover object-right"
        // other options: object-top, object-bottom, object-left, 
        // or arbitrary: [object-position:75%_25%]
        src="/videos/landing_video.mp4"
        autoPlay
        loop
        muted
        playsInline
        controls
      />

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Course Categories Navigation — preserved in same position */}
      <div className="relative z-10">
        <Courses variant="white" />
      </div>

    </section>
  );
}