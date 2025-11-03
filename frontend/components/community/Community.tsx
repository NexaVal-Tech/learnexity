import React from 'react';
import { SecondaryButton } from "../button/Button";
import {
  ScrollFadeIn,
  FadeInCard,
  FadeUpOnScroll,
  ZoomAnimation,
} from "../animations/Animation";

export default function Community() {
  return (
    <FadeUpOnScroll>
    <div className="relative max-w-[1480px] mx-auto min-h-96 bg-gradient-to-r from-purple-100 to-pink-50 overflow-hidden rounded-4xl w-[95%] sm:w-[90%] md:w-full">
      {/* Main Content */}
      <div className="relative z-10 max-w-screen2xl mx-auto px-8 py-16 ">
        <div className="max-w-lg">
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-6 leading-tight text-center md:text-left">
            Join Our Learning Community
          </h1>
          
          <p className="text-base md:text-lg text-gray-700 mb-8 leading-relaxed text-center md:text-left">
            Join a community that offers exclusive Discord access, a 5,000+ member alumni network, ongoing mentorship, and industry networking opportunities.
          </p>

          <div className="flex justify-center md:justify-start">
            <SecondaryButton />
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-8 md:hidden">
          <img src="/images/image.png" alt="" className="w-16 h-16 rounded-full object-cover" />
          <img src="/images/image2.png" alt="" className="w-16 h-16 rounded-full object-cover" />
          <img src="/images/image3.png" alt="" className="w-16 h-16 rounded-full object-cover" />
          {/* <img src="/images/image4.png" alt="" className="w-16 h-16 rounded-full object-cover" /> */}
          <img src="/images/image2.png" alt="" className="w-16 h-16 rounded-full object-cover" />
          <img src="/images/image5.png" alt="" className="w-16 h-16 rounded-full object-cover" />
      </div>
        </div>
      </div>

      {/* Profile Images Network */}
      <div className="absolute inset-0 pointer-events-none hidden lg:block">
        {/* Dotted connecting lines background pattern */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 400">
          <defs>
            <pattern id="dots" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#020810ff" opacity="0.5"/>
            </pattern>
          </defs>
          
          {/* Connecting dotted lines */}
          <path d="M600 80 Q700 120 800 100 T1000 140" stroke="url(#dots)" strokeWidth="4" fill="none" strokeDasharray="3,3" /> <path 
            d="M650 180 Q750 200 850 180 T1050 220" 
            stroke="url(#dots)" 
            strokeWidth="2" 
            fill="none"
            strokeDasharray="3,3"
          />
          <path 
            d="M700 280 Q800 320 900 300 T1100 340" 
            stroke="url(#dots)" 
            strokeWidth="4" 
            fill="none"
            strokeDasharray="3,3"
          />
          <path 
            d="M680 120 Q780 160 880 140" 
            stroke="url(#dots)" 
            strokeWidth="2" 
            fill="none"
            strokeDasharray="3,3"
          />
          <path 
            d="M750 200 Q850 240 950 220" 
            stroke="url(#dots)" 
            strokeWidth="2" 
            fill="none"
            strokeDasharray="3,3"
          />
        </svg>

        {/* Profile Image Placeholders */}
        {/* Top row */}
        <div className="absolute top-16 right-80 w-16 h-16 rounded-full ">
          <img src="/images/image.png" alt="" className="w-full h-full object-cover"/>
        </div>
        
        <div className="absolute top-24 right-48 w-16 h-16 bg-gray0 rounded-full">
          <img src="/images/image2.png" alt="" className="w-full h-full object-cover" />
        </div>

        <div className="absolute top-12 right-16 w-16 h-16 bg-g-300 rounded-full">
          <img src="/images/image3.png" alt="" className="w-full h-full object-cover"/>
        </div>


        <div className="absolute top-44 right-20 w-16 h-16 -gray-300 rounded-full">
         <img src="/images/image2.png" alt="" className="w-full h-full object-cover"/>
        </div>

        {/* Bottom area - you can add more as needed */}
        <div className="absolute bottom-20 right-60 w-16 h-16 bg-gy-300 rounded-full ">
          <img src="/images/image5.png" alt="" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
    </FadeUpOnScroll>
  );
}