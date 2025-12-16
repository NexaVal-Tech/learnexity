// import {
//   ScrollFadeIn,
//   FadeInCard,
//   FadeUpOnScroll,
//   ZoomAnimation,
// } from "../animations/Animation";

export default function Method() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-screen-2xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4">
            What Makes Us Dofferent
          </h2>
          <p className="text-xl text-gray-900 max-w-2xl mx-auto">
            We provide the structure and support you need to build a portfolio that gets 
            noticed and land a job.
          </p>
        </div>

        {/* Top Section */}
       
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Features */}
          <div className="space-y-8 order-1 lg:order-1">
            {/* Real-World Projects */}
            <div className="flex gap-4 bg-gray-200 p-2 rounded-3xl">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <img src="/icons/black_folder.png" alt="Monitor Icon" className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Real World Projects
                </h3>
                <p className="text-gray-600 text-base">
                  Work on real-life projects just like in a professional workplace. 
                  This hands on experience builds a portfolio that hiring 
                  managers want to see.
                </p>
              </div>
            </div>

            {/* Mentored Internships */}
            <div className="flex gap-4 p-2">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <img src="/icons/hugeicons_mentoring.png" alt="Monitor Icon" className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Mentored Internships
                </h3>
                <p className="text-gray-600 text-base">
                  Our internships provide hands-on experience under the guidance 
                  of industrial experts. Learn industry best practices and what it 
                  takes to thrive in a professional role.
                </p>
              </div>
            </div>

            {/* Job Placement */}
            <div className="flex gap-4 p-2">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <img src="/icons/job.png" alt="Monitor Icon" className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Career Support
                </h3>
                <p className="text-gray-600 text-base">
                  Our ultimate goal is your success. We connect our best candidates 
                  with a network of hiring partners and prepare you for interviews to 
                  help you secure your first tech role.
                </p>
              </div>
            </div>

            {/* International Certification Readiness */}
            <div className="flex gap-4 p-2">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <img src="/icons/international.png" alt="Monitor Icon" className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  International Certification Readiness
                </h3>
                <p className="text-gray-600 text-base">
                  Our curriculum is designed to align with global tech leaders 
                  (Microsoft, AWS, Google Cloud, Cisco, CompTIA, Oracle, IBM, 
                  Coursera, and more), preparing you for internationally recognized 
                  certifications.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="order-2 lg:order-2">
            <div className="rounded-2xl overflow-hidden">
              {/* Placeholder for image */}
              <div className="w-full h-full flex items-center justify-center">
                <img src="/images/image 182.png" alt="" className="w-full h-auto max-h-80 sm:max-h-[500px] object-contain"/>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-start mt-20">
          {/* Left Column - Image */}
          <div className="order-2 lg:order-1">
            <div className="bg-gray-200 rounded-2xl overflow-hidden">
              {/* Placeholder for image */}
              <div className="w-full h-full flex items-center justify-center">
                <img src="/images/image 182 (1).png" alt="" className="w-full h-auto max-h-80 sm:max-h-[500px] object-contain" />
              </div>
            </div>
          </div>

          {/* Right Column - Features */}
          <div className="space-y-8 order-1 lg:order-2">
            {/* Scholarship Opportunities */}
            <div className="flex gap-4 bg-gray-200 p-2 rounded-3xl">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <img src="/icons/graduation.png" alt="Monitor Icon" className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Scholarship Opportunities
                </h3>
                <p className="text-gray-600 text-base">
                  We provide access to scholarships and funding support, 
                  ensuring that cost is never a barrier to learning.
                </p>
              </div>
            </div>

            {/* Leadership Development */}
            <div className="flex gap-4 p-2">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <img src="/icons/sparkles.png" alt="Monitor Icon" className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Leadership Development
                </h3>
                <p className="text-gray-600 text-base">
                  Beyond technical skills, we equip you with leadership, 
                  communication, and teamwork training to thrive in today&apos;s global 
                  workplace.
                </p>
              </div>
            </div>

            {/* Flexible Learning Schedules */}
            <div className="flex gap-4 p-2">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <img src="/icons/clock.png" alt="Monitor Icon" className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Flexible Learning Schedules
                </h3>
                <p className="text-gray-600 text-base">
                  Learn at your own pace with our flexible course options designed 
                  for working professionals, students, and career changers.
                </p>
              </div>
            </div>
          </div>
        </div>
       
      </div>
    </section>
  );
}
