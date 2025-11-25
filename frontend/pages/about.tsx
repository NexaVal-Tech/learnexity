import AppLayout from "@/components/layouts/AppLayout";
import Footer from "@/components/footer/Footer";
import Link from "next/link";
import { Target, Eye, Heart, Users, Briefcase, GraduationCap, User, Globe, MapPin, Lightbulb, Rocket } from "lucide-react";

export default function About() {
  const programs = [
    "AI & Machine Learning",
    "Product Management",
    "Cloud Computing",
    "UX/UI Design",
    "Data Analytics",
    "Frontend Development",
    "Cybersecurity",
    "Backend Development",
    "Digital Marketing",
    "DevOps",
    "Web3 & Blockchain",
    "Graphic Design"
  ];

  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="max-w-[1485px] mx-auto mt-30 bg-gradient-to-r from-purple-100 via-blue-100 to-purple-100 py-10 px-6 rounded-2xl">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-5xl font-bold text-gray-900 mb-6">
            Build Real Tech Skills. Gain Real Experience. Launch Your Career.
          </h1>
          <p className="text-lg text-gray-700 mb-8 max-w-3xl mx-auto">
            Learnexity helps you go from learning to doing, through hands-on training, internships, real-life experience, and pathways into jobs, freelancing, and entrepreneurship.
          </p>
          <Link href="/user/auth/login">
            <button className="bg-[#6C63FF] text-white px-4 py-1 rounded-full font-semibold hover:bg-purple-700 transition-colors">
              Start your journey
            </button>
          </Link>
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-[1485px] mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">Who We Are</h2>
          <p className="text-center font-semibold text-gray-700 mb-16 max-w-5xl mx-auto text-lg">
            Learnexity is a tech career launch platform built to bridge the gap between learning and real opportunity. We empower learners with skills, experience, and pathways into jobs, freelancing, or entrepreneurship.
          </p>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="border-2 rounded-xl p-4 text-left">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-700">Our Mission</h3>
              <p className="text-gray-600">
                To empower non-tech by connecting more skills to real-world opportunities through career pathways, practical training, and support systems.
              </p>
            </div>

            <div className="border-2 rounded-xl p-4 text-left">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Eye className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-700">Our Vision</h3>
              <p className="text-gray-600">
                A future where every tech-skilled person can build a sustainable and fulfilling career.
              </p>
            </div>

            <div className="border-2 rounded-xl p-4 text-left">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-700">Our Guiding Belief</h3>
              <p className="text-gray-600">
                We're not just teaching skills, we're transforming lives through skill development.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Different Section */}
      <section className="py-20 px-6 bg-gray-100">
        <div className="max-w-[1480px] mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">What Makes Us Different</h2>
          <p className="text-center text-gray-800 mb-8 text-lg">
            We don't just teach. We help you gain experience, build confidence, and launch your life through.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="rounded-3xl border-2 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="h-60">
                <img src="/images/about-1.png" alt="about image" className="w-full h-full p-4"/>
              </div>
              <div className="p-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">Team-based real projects</h3>
                <p className="text-gray-600">
                  Collaborate with peers on real-world projects that build both technical and teamwork skills.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border-2 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="h-60">
                <img src="/images/about-2.png" alt="about image" className="w-full h-full p-4" />
              </div>
              <div className="p-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4">
                  <Briefcase className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">Portfolio-building challenges</h3>
                <p className="text-gray-600">
                  Complete projects that showcase your skills and add real value to your portfolio.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border-2 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="h-60">
                <img src="/images/about-3.png" alt="about image" className="w-full h-full p-4"/>
              </div>
              <div className="p-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4">
                  <GraduationCap className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">Industry mentorship</h3>
                <p className="text-gray-600">
                  Learn from tech professionals who provide guidance, feedback, and industry insights.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Help Section */}
      <section className="py-20 px-3 bg-white">
        <div className="max-w-[1474px] mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">Who We Help</h2>
          <p className="text-center text-gray-700 mb-10 max-w-2xl mx-auto text-xl">
            Our platform is designed to support diverse learners at every stage of their tech journey.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 border-2 rounded-2xl p-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Career Switchers</h3>
              <p className="text-gray-600">
                Professionals switching jobs from other industries seeking structured learning and job-ready skills.
              </p>
            </div>

            <div className="text-center p-6 border-2 rounded-2xl p-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Aspiring Tech Professionals</h3>
              <p className="text-gray-600">
                Early-career individuals looking to break into the tech industry with hands-on experience.
              </p>
            </div>

            <div className="text-center p-6 border-2 rounded-2xl p-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Recent Graduates</h3>
              <p className="text-gray-600">
                New graduates who are looking to gain practical, work-ready skills to start their tech career.
              </p>
            </div>

            <div className="text-center p-6 border-2 rounded-2xl p-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Self-Taught Individuals</h3>
              <p className="text-gray-600">
                Autodidacts who have learned coding on their own and want to formalize their skills and real-world experience.
              </p>
            </div>

            <div className="text-center p-6 border-2 rounded-2xl p-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Women & Underrepresented Groups</h3>
              <p className="text-gray-600">
                Individuals from underrepresented backgrounds seeking inclusive learning programs, mentorship, and community.
              </p>
            </div>

            <div className="text-center p-6 border-2 rounded-2xl p-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Learners in Emerging Regions</h3>
              <p className="text-gray-600">
                Providing access to world-class tech education and opportunities to learners in Africa and beyond.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Learnexity Section */}
      <section className="py-4 px-6">
        <div className="max-w-[1474px] mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">Why Learnexity</h2>
          <div className="flex justify-center mb-8">
            <Link href="/user/auth/login">
              <button className="bg-[#6C63FF] text-white px-4 py-1 rounded-full font-semibold hover:bg-purple-700 transition-colors">
                Watch How It Works - Discover Why Learnexity Is For You
              </button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-200 p-8 rounded-2xl shadow-sm">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-6">
                <Lightbulb className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-700">Hands-on Project Experience</h3>
              <p className="text-gray-600 text-lg">
                Work on real projects that teach both technical skills and professional practices like version control and collaboration.
              </p>
            </div>

            <div className="bg-gray-200 p-8 rounded-2xl shadow-sm">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-6">
                <Rocket className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-700">Career Launch Programs</h3>
              <p className="text-gray-600 text-lg">
                Training by the Global Community for Jobs and Digital Marketing. We don't just prepare you, we connect you to opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Programs Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">Explore Our Programs</h2>
          <p className="text-center text-gray-700 mb-6">
            Comprehensive hands-on training programs designed to launch your tech career.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {programs.map((program, index) => (
              <div key={index} className="bg-gray-200 px-3 py-1 rounded-xl text-gray-700 font-medium hover:bg-purple-100 hover:text-purple-700 transition-colors cursor-pointer">
                {program}
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/courses/courses">
              <button className="bg-[#6C63FF] text-white px-4 py-1 rounded-full font-semibold hover:bg-gray-700 transition-colors">
                View All Courses
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* footer */}
      <Footer />
    </AppLayout>
  );
}