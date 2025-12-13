import AppLayout from "@/components/layouts/AppLayout";
import Courses from "@/components/headercourses/HeaderCourse";
import Footer from "@/components/footer/Footer";
import Link from "next/link";
import {
  Calendar,
  MessageCircle,
  HelpCircle,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  ArrowRight,
} from "lucide-react";

type SocialIconProps = {
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  link: string;
};

export default function Contact() {
  return (
    <AppLayout>
      <Courses variant="white" />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-100 via-blue-100 to-purple-100 pt-30 pb-52 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Get in touch
          </h1>
          <p className="text-xl text-gray-700">
            Have questions? We're here to help. Choose the best way to reach us.
          </p>
        </div>
      </section>

      {/* Contact Cards Section */}
      <section className="px-6 relative">
        <div className="max-w-[1480px] mx-auto">

          {/* FIRST THREE CARDS — overlapping hero */}
          <div className="-mt-32 z-20 relative grid md:grid-cols-3 gap-6 mb-16">

            {/* Schedule a Free Call */}
            <div className="bg-[#6C63FF] text-white rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-opacity-20 rounded-lg flex items-center justify-center mb-6">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Schedule a Free Call</h3>
              <p className="mb-6 text-purple-100">
                Book a free consultation call with our team.
              </p>
              <a href="https://calendly.com/nexavaltech/30min" className="text-white font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                Book Now <ArrowRight className="w-5 h-5" />
              </a>
            </div>

            {/* Chat on WhatsApp */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <MessageCircle className="w-6 h-6 text-gray-700" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Chat on WhatsApp</h3>
              <p className="mb-6 text-gray-600">
                Get instant responses to your questions
              </p>
              <a href="https://wa.me/+1 (276) 252-8415" className="text-purple-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                Chat <ArrowRight className="w-5 h-5" />
              </a>
            </div>

            {/* Email Us */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <HelpCircle className="w-6 h-6 text-gray-700" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Email Us</h3>
              <p className="mb-6 text-gray-600">
                For detailed enquiries, send an email to{' '}
                <a href="mailto:info@learnexity.org" className="text-[#6C63FF] hover:underline">
                  info@learnexity.org
                </a>
              </p>
              <a href="mailto:hello@learnexity.com" className="text-[#6C63FF] font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                Send Email <ArrowRight className="w-5 h-5" />
              </a>
            </div>

          </div>

          {/* Quick Access Cards */}
          <div className="grid md:grid-cols-3 gap-6 py-8">

            {/* Current Students */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-4">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 rounded-full bg-purple-200 border-2 border-white"></div>
                  <div className="w-10 h-10 rounded-full bg-blue-200 border-2 border-white"></div>
                  <div className="w-10 h-10 rounded-full bg-pink-200 border-2 border-white"></div>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Current Students</h3>
              <p className="text-gray-600 text-sm mb-6">
                Already enrolled? Access your dashboard or contact support.
              </p>
              <Link href="/user/dashboard">
                <button className="border-2 border-[#6C63FF] text-[#6C63FF] px-6 py-2 rounded-full font-semibold hover:bg-purple-50 transition-colors">
                  Go to Dashboard
                </button>
              </Link>
            </div>

            {/* Course Information */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-4">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 rounded-full bg-green-200 border-2 border-white"></div>
                  <div className="w-10 h-10 rounded-full bg-yellow-200 border-2 border-white"></div>
                  <div className="w-10 h-10 rounded-full bg-orange-200 border-2 border-white"></div>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Course Information</h3>
              <p className="text-gray-600 text-sm mb-6">
                Looking for course details? Browse our catalog.
              </p>
              <Link href="/courses/courses">
                <button className="border-2 border-[#6C63FF] text-[#6C63FF] px-6 py-2 rounded-full font-semibold hover:bg-purple-50 transition-colors">
                  View Courses
                </button>
              </Link>
            </div>

            {/* Help Centre */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-4">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 rounded-full bg-red-200 border-2 border-white"></div>
                  <div className="w-10 h-10 rounded-full bg-indigo-200 border-2 border-white"></div>
                  <div className="w-10 h-10 rounded-full bg-teal-200 border-2 border-white"></div>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Help Centre</h3>
              <p className="text-gray-600 text-sm mb-6">
                Find answers to common questions.
              </p>
              <button className="border-2 border-[#6C63FF] text-[#6C63FF] px-6 py-2 rounded-full font-semibold hover:bg-purple-50 transition-colors">
                Visit FAQ
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Business Hours Section */}
      <section className="py-16 px-6 bg-white border-2 rounded-2xl max-w-[1480px] mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Business Hours & Response Times</h2>
          <div className="space-y-2 text-gray-700">
            <p>Response time: <span className="font-bold">Within 24 hours (Monday - Friday)</span></p>
            <p>Business hours: <span className="font-bold">9:00 AM - 5:00 PM WAT</span></p>
            <p>Weekend: <span className="font-bold">Messages received on weekends will be answered on Monday</span></p>
          </div>
        </div>
      </section>

      {/* Connect with us */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Connect with us</h2>
          <div className="flex justify-center gap-6">
            <SocialIcon Icon={Instagram} link="https://www.instagram.com/learnexity?igsh=enoyZGV3NTA2ZXVp" />
            <SocialIcon Icon={Facebook} link="https://www.facebook.com/Learnexity" />
            {/* <SocialIcon Icon={Twitter} link="https://twitter.com" /> */}
            <SocialIcon Icon={Linkedin} link="https://www.linkedin.com/company/valuable-globalus/" />
            <SocialIcon Icon={Youtube} link="https://youtube.com/@learnexity?si=R19UJgJTw0q7uWx-" />
          </div>
        </div>
      </section>

      <Footer />
    </AppLayout>
  );
}

function SocialIcon({ Icon, link }: SocialIconProps) {
  return (
    <a href={link} target="_blank"  rel="noopener noreferrer" className="w-12 h-12 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-purple-100 hover:border-gray-800 transition-all">
      <Icon className="w-5 h-5 text-gray-700" />
    </a>
  );
}
