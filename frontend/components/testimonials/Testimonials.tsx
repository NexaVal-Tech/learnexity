import { useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import {
  ScrollFadeIn,
  FadeInCard,
  FadeUpOnScroll,
  ZoomAnimation,
} from "../animations/Animation";

export default function Testimonials() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const data = [
    {
      name: "Jennifer A.",
      role: "Product Manager",
      text: "Landed a Product Manager role at a fintech startup 2 months after completing the program. The hands-on approach and career support made all the difference.",
      avatar: "/images/Ellipse 12.png"
    },
    {
      name: "Michael R.",
      role: "Cybersecurity Analyst", 
      text: "Transitioned from retail to cybersecurity analyst with a 60% salary increase. The instructors really know the industry.",
      avatar: "/images/ELLipse 9.png"
    },
    {
      name: "Priya S.",
      role: "Full Stack Developer",
      text: "The portfolio I built through the program impressed everyone I interviewed with. Now I'm at a fast-growing startup doing work I love.",
      avatar: "/images/Ellipse 11.png"
    },
    {
      name: "Priya S.",
      role: "Full Stack Developer",
      text: "The portfolio I built through the program impressed everyone I interviewed with. Now I'm at a fast-growing startup doing work I love.",
      avatar: "/images/Ellipse 12.png"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % data.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + data.length) % data.length);
  };

  return (
    <section className="py-20 bg-white overflow-x-hidden">
      <FadeUpOnScroll>
      <div className="max-w-screen-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Student Transformations
          </h2>
          <p className="text-xl text-gray-600 max-w-sm mx-auto">
            Stories of growth, resilience, and landing the right opportunities.
          </p>
        </div>

        {/* Desktop/Tablet View */}
        <div className="hidden md:block relative">
          <div className="flex items-start gap-12">
            {/* Left Side - Title and Navigation - Fixed */}
            <div className="bg-white flex-shrink-0 relative z-10 w-96 p-6">
              <h3 className="text-3xl font-bold text-gray-900 mb-8 leading-tight">
                What our students<br />are saying
              </h3>
              
              <div className="flex gap-3">
                <button
                  onClick={prevSlide}
                  className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={nextSlide}
                  className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            

            {/* Right Side - Testimonials Container with overflow */}
            <div className="flex-1 relative overflow-x-clip pl-6 -ml-6">
              <div 
                  className="flex gap-6 transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 384}px)` }} // match w-96
                >
                {data.map((testimonial, index) => (
                  <div key={index} className="flex-shrink-0 w-[32rem] p-12 bg-gray-200 rounded-4xl">
                    {/* 5 Stars */}
                    <div className="flex gap-1 mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-black text-black" />
                      ))}
                    </div>

                    {/* Testimonial Text */}
                    <p className="text-gray-800 text-xl leading-relaxed mb-12">
                      {testimonial.text}
                    </p>

                    {/* Author Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden">
                        <img src={testimonial.avatar} alt={testimonial.name} className="w-full h-full object-cover"/>
                      </div>
                      <div>
                        <p className="text-base text-gray-900 text-sm">
                          {testimonial.name}, {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            
            </div>
          </div>
        </div>

        {/* Mobile View - Horizontal scrolling cards */}
        <div className="md:hidden px-6">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              What our students<br />are saying
            </h3>
            
            <div className="flex justify-center gap-3 mb-8">
              <button
                onClick={prevSlide}
                className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={nextSlide}
                className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Horizontal scrolling container with gray border */}
          <div className="relative overflow-hidde p-4 bg-white">
            <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentSlide * 260}px)` }}>
              {data.map((testimonial, index) => (
                <div 
                  key={index} 
                  className="flex-shrink-0 w-78 p-8 bg-white rounded-4xl shadow-2xl"
                  style={{ marginLeft: index > 0 ? '-20px' : '0' }}
                >
                  {/* 5 Stars for first card, 3 for others */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(index === 0 ? 5 : 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-black text-black" />
                    ))}
                  </div>

                  {/* Testimonial Text */}
                  <p className="text-gray-800 text-sm leading-relaxed mb-4">
                    {testimonial.text}
                  </p>

                  {/* Author Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden">
                      <img 
                        src={testimonial.avatar} 
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-xs">
                        {testimonial.name}, {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </FadeUpOnScroll>
    </section>
  );
}