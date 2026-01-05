import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Placeholder animation components
const FadeUpOnScroll = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;

export default function Testimonials() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const data = [
    {
      name: "Jennifer A.",
      role: "Product Manager",
      video: "/videos/testimonial-1.mp4"
    },
    {
      name: "Design Sprint.",
      role: "project", 
      video:  "/videos/testimonial-2.mp4"
    },
    {
      name: "Isreal Obinna.",
      role: "Video Editing and Content Creation",
      video:  "/videos/testimonial-3.mp4"
    },
    {
      name: "Benedict.",
      role: "Video Editing and Content Creation",
      video: "/videos/testimonial-4.mp4"
    },
    {
      name: "Lilian Anekwe.",
      role: "Cybersecurity",
      video: "/videos/testimonial-5.mp4"
    },
    {
      name: "Mrs Lilian.",
      role: "AI Automation",
      video: "/videos/testimoial-6.mp4"
    },
    {
      name: "Benedict.",
      role: "Video Editing and Content Creation",
      video: "/videos/testimonial-8.mp4"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % data.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + data.length) % data.length);
  };

  // Handle touch events for mobile swipe
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const swipeThreshold = 50;
    const diff = touchStartX.current - touchEndX.current;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  // Handle mouse drag for desktop
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - scrollContainerRef.current.offsetLeft;
    scrollLeft.current = scrollContainerRef.current.scrollLeft;
    scrollContainerRef.current.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleMouseUp = () => {
    if (!scrollContainerRef.current) return;
    isDragging.current = false;
    scrollContainerRef.current.style.cursor = 'grab';
    
    // Snap to nearest slide
    const container = scrollContainerRef.current;
    const cardWidth = 384 + 24; // w-96 + gap
    const newSlide = Math.round(container.scrollLeft / cardWidth);
    setCurrentSlide(Math.max(0, Math.min(newSlide, data.length - 1)));
  };

  const handleMouseLeave = () => {
    if (isDragging.current) {
      handleMouseUp();
    }
  };

  // Handle wheel scroll for desktop
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    e.preventDefault();
    
    if (e.deltaY > 0 || e.deltaX > 0) {
      nextSlide();
    } else if (e.deltaY < 0 || e.deltaX < 0) {
      prevSlide();
    }
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
            <div 
              ref={scrollContainerRef}
              className="flex-1 relative overflow-x-clip pl-6 -ml-6 cursor-grab select-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onWheel={handleWheel}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div 
                  className="flex gap-6 transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 384}px)` }}
                >
                {data.map((testimonial, index) => (
                  <div key={index} className="flex-shrink-0 w-[32rem] p-6 bg-gray-200 rounded-4xl">
                    <video 
                      src={testimonial.video} 
                      controls 
                      className="w-full h-84 rounded-2xl mb-8 object-cover pointer-events-auto" 
                      preload="metadata"
                      onMouseDown={(e) => e.stopPropagation()}
                    />

                    <div className="flex items-center gap-3">
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

          {/* Horizontal scrolling container */}
          <div 
            className="relative overflow-hidden p-4 bg-white"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div 
              className="flex transition-transform duration-500 ease-in-out" 
              style={{ transform: `translateX(-${currentSlide * 260}px)` }}
            >
              {data.map((testimonial, index) => (
                <div 
                  key={index} 
                  className="flex-shrink-0 w-78 p-8 bg-white rounded-4xl shadow-2xl" 
                  style={{ marginLeft: index > 0 ? '-20px' : '0' }}
                >
                  <video 
                    src={testimonial.video} 
                    controls 
                    className="w-full h-64 rounded-2xl mb-8 object-cover" 
                    preload="metadata"
                  />

                  <div className="flex items-center gap-3">
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