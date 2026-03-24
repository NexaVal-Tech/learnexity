import {
  ScrollFadeIn,
  FadeInCard,
  // FadeUpOnScroll,
  ZoomAnimation,
} from "../animations/Animation";
import { SignUpButton2 } from "../button/Button";

export default function Pathways() {
  return (
    
    <section className="pt-2 py-20 bg-white">
      <div className="max-w-screen-xl mx-auto px-6">
        {/* <FadeUpOnScroll> */}
        <div className="mb-16 flex flex-col gap-6 text-center md:text-left lg:flex-row lg:items-center lg:justify-between">
          
          {/* Left: Title + description */}
          <div>
            <h2 className="text-4xl font-semibold text-black mb-4 component-headers">
              Our Pathways
            </h2>
            <p className="text-xl text-gray-600">
              Proven curriculum with measurable outcomes
            </p>
          </div>

          {/* Right: Button */}
          <div className="flex justify-center md:justify-start lg:justify-end">
            <SignUpButton2 />
          </div>

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
                Work directly with a mentor in private , focused sessions tailored to your goals. Expect clear direction, accelerated progress, and increased confidence as you build mastery in your chosen path.
            </p>
            
          </div>
        </div>
        {/* </FadeUpOnScroll> */}
      </div>
      
    </section>
  );
}