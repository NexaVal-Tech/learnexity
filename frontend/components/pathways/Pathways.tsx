import {
  ScrollFadeIn,
  FadeInCard,
  // FadeUpOnScroll,
  ZoomAnimation,
} from "../animations/Animation";

export default function Pathways() {
  return (
    
    <section className="pt-2 py-20 bg-white">
      <div className="max-w-screen-2xl mx-auto px-6">
        {/* <FadeUpOnScroll> */}
        <div className="mb-16 text-center md:text-left">
          <h2 className="text-4xl font-semibold text-black mb-4 component-headers">
            Our Pathways
          </h2>
          <p className="text-xl text-gray-600">
            Proven curriculum with measurable outcomes
          </p>
        </div>
        
        
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Card 01 - Gradient Card */}
          <div className="relative overflow-hidden rounded-4xl p-8 h-100" style={{ background:"linear-gradient(163.36deg, #5B1EF6 -33.94%, #F59E0B 18.93%, #5B1EF6 48.37%, #DE492B 97.22%)",
                  color: "white",
                }}
              >
            <div className="mb-6">
              <span className="text-orange-200 text-sm font-mono">[ 01 ]</span>
            </div>
            
            <h3 className="text-2xl font-semibold mb-6 sub-component-headers">
              On demand courses
            </h3>
            
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Access a library of courses with live expert tutors to master in-demand skills and accelerate your learning.
            </p>
            
            {/* <div className="flex justify-start">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}  d="M7 17l9.2-9.2M17 17V7H7" />
                </svg>
              </div>
            </div> */}
          </div>

          {/* Card 02 */}
          <div className="bg-gray-100 rounded-4xl p-8">
            <div className="mb-6">
              <span className="text-red-400 text-sm font-mono">[ 02 ]</span>
            </div>
            
            <h3 className="text-2xl font-semibold text-black mb-4 sub-component-headers">
              Self-Paced Tutoring
            </h3>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Get personalized tutoring on your schedule. Perfect for busy professionals who need flexible learning to fit their life.
            </p>
            
            {/* <div className="flex justify-start">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                <svg 
                  className="w-5 h-5 text-blue-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M7 17l9.2-9.2M17 17V7H7" 
                  />
                </svg>
              </div>
            </div> */}
          </div>

          {/* Card 03 */}
          <div className="bg-gray-100 rounded-4xl p-8">
            <div className="mb-6">
              <span className="text-red-400 text-sm font-mono">[ 03 ]</span>
            </div>
            
            <h3 className="text-2xl font-semibold text-black mb-4 sub-component-headers">
              Join Our One-on-One Coaching
            </h3>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Our most personalized learning experience.
                You’ll work directly with an instructor in private, focused sessions tailored to your goals. Expect clear direction, accelerated progress, and increased confidence as you build mastery in your chosen path.
            </p>
            
            {/* <div className="flex justify-start">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                <svg 
                  className="w-5 h-5 text-blue-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M7 17l9.2-9.2M17 17V7H7" 
                  />
                </svg>
              </div>
            </div> */}
          </div>
        </div>
        {/* </FadeUpOnScroll> */}
      </div>
      
    </section>
  );
}