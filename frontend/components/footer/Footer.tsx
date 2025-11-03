import { FadeUpOnScroll } from "../animations/Animation";

export default function Footer() {
  return (
    <FadeUpOnScroll>
    <div className="bg-[#6D4AFF] text-white mx-auto">
      {/* CTA Section */}
      <div className="text-center py-12 px-6">
        <h2 className="text-5xl font-semibold mb-8 leading-tight">
          Ready to Transform Your Career?
        </h2>
        <p className="text-lg mb-12 max-w-4xl mx-auto leading-relaxed text-white opacity-90">
         Choose your path and secure your spot in the next cohort strting soon
        </p>
        <div className="flex flex-row gap-4 justify-center items-center">
          <button className="bg-white text-[#6D4AFF] px-3 py-1 text-sm md:px-4 md:py-2 md:text-lg rounded-full font-semibold hover:bg-gray-100 transition-colors">
              Explore Courses
          </button>
          <button className="text-white text-sm md:text-lg hover:no-underline transition-all">
              Book Free Consultation
          </button>
        </div>
      </div>

      {/* Footer Links Section */}
      <div className="px-6 pb-6 pt-2">
        <div className="max-w-screen-2xl mx-auto">
          <div className="grid md:grid-cols-4 gap-16">
            {/* Logo and Copyright */}
            <div>
              {/* Logo placeholder with arrow icon */}
              <div className="flex items-center gap-2 mb-12">
                <img src="" alt="" />
              </div>
              <p className="text-white opacity-80">
                © 2025 Learnexity. All rights reserved.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold mb-8 text-white opacity-200 tracking-wider uppercase">
                QUICK LINKS
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="/courses/courses" className="text-white opacity-80 hover:opacity-100 transition-opacity">
                    Course Catalog
                  </a>
                </li>
                <li>
                  <a href="/about" className="text-white opacity-80 hover:opacity-100 transition-opacity">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white opacity-80 hover:opacity-100 transition-opacity">
                    Career Services
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white opacity-80 hover:opacity-100 transition-opacity">
                    Community
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-semibold mb-8 text-white opacity-90 tracking-wider uppercase">
                LEGAL
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-white opacity-80 hover:opacity-100 transition-opacity">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white opacity-80 hover:opacity-100 transition-opacity">
                    Terms of Services
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white opacity-80 hover:opacity-100 transition-opacity">
                    Refund Policy
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Us */}
            <div>
              <h3 className="text-sm font-semibold mb-8 text-white opacity-90 tracking-wider uppercase">
                CONTACT US
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="mailto:info@learnexity.com" className="text-white opacity-80 hover:opacity-100 transition-opacity">
                    info@learnexity.com
                  </a>
                </li>
                <li>
                  <a href="tel:+12762528415" className="text-white opacity-80 hover:opacity-100 transition-opacity">
                    +1 (276) 252-8415
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    </FadeUpOnScroll>
  );
}