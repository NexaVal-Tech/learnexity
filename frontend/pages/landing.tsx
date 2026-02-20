import Testimonials from "@/components/testimonials/Testimonials";
import AnimatedHeroSection from "@/components/landing/AnimatedHeroSection";
import InstallmentBanner from "@/components/installment/InstallmentBanner";

export default function EnrollLandingPage() {
  return (
    <main className="bg-white text-gray-900">

      {/* ================= ANIMATED HERO SECTION ================= */}
      <AnimatedHeroSection />

      {/* ================= VALUE SECTION ================= */}
      <section className="py-12 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-30" />
        
        <div className="max-w-screen-2xl mx-auto px-6 relative z-10">
          
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
              Why Choose Us
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
              Why Students Choose Learnexity
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Experience learning that goes beyond tutorials and actually prepares you for the real world
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">

            {/* Card 1 */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                
                <h3 className="text-2xl font-bold mb-3 text-gray-900">
                  Real Projects
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Build portfolio-worthy projects that employers actually care about and stand out in interviews.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                
                <h3 className="text-2xl font-bold mb-3 text-gray-900">
                  Internship Experience
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Gain real-world internship experience and build a results-driven portfolio that proves to employers you’re ready to contribute from day one.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-teal-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                
                <h3 className="text-2xl font-bold mb-3 text-gray-900">
                  Career Support
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  CV reviews, interview prep, and job application strategy to land your dream role.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* installment payment banner */}
      <InstallmentBanner />

      {/* ================= TESTIMONIALS ================= */}
      <Testimonials />

      {/* ================= FINAL CTA ================= */}
      <section className="py-24 bg-black text-white text-center">
        <div className="max-w-3xl mx-auto px-6">

          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Career?
          </h2>

          <p className="text-lg text-white/80 mb-10">
            Join hundreds of students building real tech careers.
          </p>
          <a          
            href="/user/auth/register"
            className="inline-block bg-white text-black font-semibold px-10 py-5 rounded-full text-lg hover:scale-105 transition-transform"
          >
            Start Your Journey Today
          </a>

        </div>
      </section>

    </main>
  );
}