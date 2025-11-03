import {
  // ScrollFadeIn,
  FadeInCard,
  FadeUpOnScroll,
  // ZoomAnimation,
} from "../animations/Animation";

export default function Courses() {
  return (
    <FadeUpOnScroll>
    <section className="py-20 bg-black">
      <div className="max-w-screen-2xl mx-auto px-6">
        {/* Header */}
        <FadeInCard>
        <div className="flex flex-col md:flex-row justify-between items-start mb-16 gap-6">
          <div>
            <h2 className="text-5xl font-semibold text-white mb-4 leading-tight">
              In-Demand Courses That <br className="hidden md:block"/>
              Get Results
            </h2>
          </div>
          <div className="text-right">
            <p className="text-gray-200 mb-6 text-lg">
              Proven curriculum with measurable
              outcomes
            </p>
            <button className="bg-white text-purple-600 px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition flex items-center gap-2">
              See complete course catalog
              <img src="/icons/arrow_right_line.png" alt="icon" width={16} height={16} />
            </button>
          </div>
        </div>
        </FadeInCard>

        {/* Scrollable Cards Container */}
        <FadeInCard>
        <div className="overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex gap-8 min-w-max">
            {/* AI Courses Card */}
            <div className="bg-gray-900 rounded-3xl p-8 w-[28rem] flex-shrink-0">
              <h3 className="text-2xl font-bold text-gray-300 mb-4">
                AI Courses
              </h3>
              <p className="text-gray-300 mb-6">
                Lorem ipsum dolor sit amet consectetur.
              </p>
              <div className="space-y-3">
                <div className="bg-gray-700 rounded-full px-4 py-3 flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300 font-medium">Lorem ipsum neque nec malesuada</span>
                </div>
                <div className="bg-gray-700 rounded-full px-4 py-3 flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300 font-medium">Lorem ipsum neque nec malesuada</span>
                </div>
                <div className="bg-gray-700 rounded-full px-4 py-3 flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300 font-medium">Lorem ipsum neque nec malesuada</span>
                </div>
              </div>
            </div>
            

            {/* Cloud Computing Card */}
            <div className="bg-gray-900 rounded-3xl p-8 w-[28rem] flex-shrink-0">
              <h3 className="text-2xl font-bold text-gray-300 mb-4">
                Cloud Computing
              </h3>
              <p className="text-gray-300 mb-6">
                Lorem ipsum dolor sit amet consectetur.
              </p>
              <div className="space-y-3">
                <div className="bg-gray-700 rounded-full px-4 py-3 flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300 font-medium">Lorem ipsum neque nec malesuada</span>
                </div>
                <div className="bg-gray-700 rounded-full px-4 py-3 flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300 font-medium">Lorem ipsum neque nec malesuada</span>
                </div>
                <div className="bg-gray-700 rounded-full px-4 py-3 flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300 font-medium">Lorem ipsum neque nec malesuada</span>
                </div>
              </div>
            </div>

            {/* Cybersecurity Card */}
            <div className="bg-gray-900 rounded-3xl p-8 w-[28rem] flex-shrink-0">
              <h3 className="text-2xl font-bold text-gray-300 mb-4">
                Cybersecurity
              </h3>
              <p className="text-gray-300 mb-6">
                Lorem ipsum dolor sit amet consectetur.
              </p>
              <div className="space-y-3">
                <div className="bg-gray-700 rounded-full px-4 py-3 flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300 font-medium">Lorem ipsum neque nec malesuada</span>
                </div>
                <div className="bg-gray-700 rounded-full px-4 py-3 flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300 font-medium">Lorem ipsum neque nec malesuada</span>
                </div>
                <div className="bg-gray-700 rounded-full px-4 py-3 flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300 font-medium">Lorem ipsum neque nec malesuada</span>
                </div>
              </div>
            </div>

            {/* Additional cards for more scrolling content */}
            <div className="bg-gray-900 rounded-3xl p-8 w-[28rem] flex-shrink-0">
              <h3 className="text-2xl font-bold text-gray-300 mb-4">
                Data Science
              </h3>
              <p className="text-gray-300 mb-6">
                Lorem ipsum dolor sit amet consectetur.
              </p>
              <div className="space-y-3">
                <div className="bg-gray-700 rounded-full px-4 py-3 flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300 font-medium">Lorem ipsum neque nec malesuada</span>
                </div>
                <div className="bg-gray-700 rounded-full px-4 py-3 flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300 font-medium">Lorem ipsum neque nec malesuada</span>
                </div>
                <div className="bg-gray-700 rounded-full px-4 py-3 flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300 font-medium">Lorem ipsum neque nec malesuada</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        </FadeInCard>
      </div>
    </section>
    </FadeUpOnScroll>
  );
}
