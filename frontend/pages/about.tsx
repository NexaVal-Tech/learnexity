// pages/about.tsx

import Head from "next/head";
import AppLayout from "@/components/layouts/AppLayout";
import Footer from "@/components/footer/Footer";
import Link from "next/link";
import { Target, Eye, Heart, Users, Briefcase, GraduationCap, User, Globe, MapPin, Lightbulb, Rocket } from "lucide-react";

const BRAND = "#4A3AFF";

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
    <>
      <Head>
        <title>About Us — Who we are, And What Makes us Different</title>

        <meta
          name="description"
          content="Learn about Learnexity's mission to empower tech learners in Africa and beyond with hands-on training, mentorship, and real career pathways."
        />
        <link rel="canonical" href="https://learnexity.org/about" />
      </Head>

    <AppLayout>
      <style>{`
        .about-card {
          border-radius: 1rem;
          border: 1px solid var(--border-subtle);
          background-color: var(--surface-elevated);
          backdrop-filter: blur(8px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.6);
          transition: all 0.3s;
        }
        .about-card:hover {
          border-color: ${BRAND}44;
          box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 24px ${BRAND}22;
        }
        .about-card-rounded {
          border-radius: 1.5rem;
          border: 1px solid var(--border-subtle);
          background-color: var(--surface-elevated);
          backdrop-blur: blur(8px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.6);
          overflow: hidden;
          transition: box-shadow 0.3s;
        }
        .about-card-rounded:hover {
          box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 24px ${BRAND}22;
        }
        .icon-bubble {
          background-color: ${BRAND}22;
        }
        .program-pill {
          background-color: var(--surface-alt);
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          border-radius: 0.75rem;
          padding: 0.25rem 0.75rem;
          font-weight: 500;
          transition: all 0.2s;
          cursor: pointer;
        }
        .program-pill:hover {
          background-color: ${BRAND}22;
          border-color: ${BRAND}66;
          color: white;
        }
        .hero-box {
          border-radius: 2rem 0.75rem 2rem 0.75rem;
          border: 1px solid var(--border-subtle);
          background-color: var(--surface-elevated);
          backdrop-filter: blur(8px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.8);
        }
        .cta-btn {
          background-color: ${BRAND};
          color: white;
          padding: 0.35rem 1.25rem;
          border-radius: 9999px;
          font-weight: 600;
          transition: all 0.3s;
        }
        .cta-btn:hover {
          background-color: #3628e0;
          box-shadow: 0 0 20px ${BRAND}66;
        }
        .highlight-box {
          border-radius: 1rem;
          border: 1px solid var(--border-subtle);
          background-color: var(--surface-alt);
          backdrop-filter: blur(8px);
        }
      `}</style>

      {/* Hero Section — no bg, particle shows through */}
      <section className="max-w-[1230px] mx-auto mt-19 py-10 px-6">
        <div className="hero-box py-10 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-6">
              Learn in-demand tech skills, Gain practical experience, and Stay relevant in the world of Artificial Intelligence..
            </h1>
            <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-3xl mx-auto">
              Learnexity helps you go from learning to doing, through hands-on training, internships, real-life experience, and pathways into jobs, freelancing, and entrepreneurship.
            </p>
            <Link href="/user/auth/register">
              <button className="cta-btn">Start your journey</button>
            </Link>
          </div>
        </div>
      </section>

      {/* Who We Are — no section bg */}
      <section className="py-20 px-6">
        <div className="max-w-[1230px] mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-[var(--text-primary)]">Who We Are</h2>
          <p className="text-center font-semibold text-[var(--text-secondary)] mb-16 max-w-5xl mx-auto text-lg">
            Learnexity is a tech career launch platform built to bridge the gap between learning and real opportunity. We empower learners with skills, experience, and pathways into jobs, freelancing, or entrepreneurship.
          </p>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="about-card p-6 text-left">
              <h3 className="text-xl font-bold mb-4 text-[var(--text-primary)]">Our Mission</h3>
              <p className="text-[var(--text-secondary)]">
                Our promise is that every decision we make from curriculum to mentorship to projects is designed to maximize your readiness for the modern technology workforce. 
                Our success is measured by the long-term success of our learners. 
              </p>
            </div>

            <div className="about-card p-6 text-left">
              <h3 className="text-xl font-bold mb-4 text-[var(--text-primary)]">Our Mision</h3>
              <p className="text-[var(--text-secondary)]">
               Our mission is to identify high-potential professionals, help them develop future-relevant skills, provide practical experience, and connect qualified individuals with global opportunity networks. We are building professionals who are ready to contribute to the technologies shaping the future. 
              </p>
            </div>

            <div className="about-card p-6 text-left">
              <h3 className="text-xl font-bold mb-4 text-[var(--text-primary)]">Our Guiding Belief</h3>
              <p className="text-[var(--text-secondary)]">
                Learning alone is no longer enough. Knowledge becomes valuable when it can be applied to real problems, demonstrated through practical work, and continuously adapted as technology evolves. That belief shapes everything we build. 
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Different — no section bg */}
      <section className="py-20 px-6">
        <div className="max-w-[1230px] mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-[var(--text-primary)]">What Makes Us Different</h2>
          <p className="text-center text-[var(--text-secondary)] mb-8 text-lg">
            We do not chase every trend. We focus on areas that form the foundation of the modern AI economy. Every program is selected because it supports how organizations build, deploy, secure, and scale intelligent systems. We would rather build deep capability than offer dozens of disconnected courses. 
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="about-card-rounded" style={{ border: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-elevated)' }}>
              <div className="h-60">
                <img src="/images/about-1.png" alt="about image" className="w-full h-full p-4 object-contain" />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold mb-3 text-[var(--text-primary)]">Team-based real projects</h3>
                <p className="text-[var(--text-secondary)]">
                  Collaborate with peers on real-world projects that build both technical and teamwork skills.
                </p>
              </div>
            </div>

            <div className="about-card-rounded" style={{ border: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-elevated)' }}>
              <div className="h-60">
                <img src="/images/about-2.png" alt="about image" className="w-full h-full p-4 object-contain" />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold mb-3 text-[var(--text-primary)]">Portfolio-building challenges</h3>
                <p className="text-[var(--text-secondary)]">
                  Complete projects that showcase your skills and add real value to your portfolio.
                </p>
              </div>
            </div>

            <div className="about-card-rounded" style={{ border: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-elevated)' }}>
              <div className="h-60">
                <img src="/images/about-3.png" alt="about image" className="w-full h-full p-4 object-contain" />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold mb-3 text-[var(--text-primary)]">Industry mentorship</h3>
                <p className="text-[var(--text-secondary)]">
                  Learn from tech professionals who provide guidance, feedback, and industry insights.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Help — no section bg */}
      <section className="py-20 px-3">
        <div className="max-w-[1230px] mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-[var(--text-primary)]">Who We Help</h2>
          <p className="text-center text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto text-xl">
            Our platform is designed to support diverse learners at every stage of their tech journey.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { Icon: Users, title: "Career Switchers", desc: "Professionals switching jobs from other industries seeking structured learning and job-ready skills." },
              { Icon: Briefcase, title: "Aspiring Tech Professionals", desc: "Early-career individuals looking to break into the tech industry with hands-on experience." },
              { Icon: GraduationCap, title: "Recent Graduates", desc: "New graduates who are looking to gain practical, work-ready skills to start their tech career." },
              { Icon: User, title: "Self-Taught Individuals", desc: "Autodidacts who have learned coding on their own and want to formalize their skills and real-world experience." },
              { Icon: Globe, title: "Women & Underrepresented Groups", desc: "Individuals from underrepresented backgrounds seeking inclusive learning programs, mentorship, and community." },
              { Icon: MapPin, title: "Learners in Emerging Regions", desc: "Providing access to world-class tech education and opportunities to learners in Africa and beyond." },
            ].map(({ Icon, title, desc }, i) => (
              <div key={i} className="about-card text-center p-8">
                <h3 className="text-xl font-bold mb-3 text-[var(--text-primary)]">{title}</h3>
                <p className="text-[var(--text-secondary)]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Learnexity — no section bg */}
      <section className="py-4 px-6">
        <div className="max-w-[1230px] mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-[var(--text-primary)]">Why Learnexity</h2>
          <div className="flex justify-center mb-8">
            <Link href="/user/auth/login">
              <button className="cta-btn">Watch How It Works - Discover Why Learnexity Is For You</button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="highlight-box p-8">
              <h3 className="text-2xl font-bold mb-4 text-[var(--text-primary)]">Hands-on Project Experience</h3>
              <p className="text-[var(--text-secondary)] text-lg">
                Work on real projects that teach both technical skills and professional practices like version control and collaboration.
              </p>
            </div>

            <div className="highlight-box p-8">
              <h3 className="text-2xl font-bold mb-4 text-[var(--text-primary)]">Career Launch Programs</h3>
              <p className="text-[var(--text-secondary)] text-lg">
                Training by the Global Community for Jobs and Digital Marketing. We don't just prepare you, we connect you to opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Programs — no section bg */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-[var(--text-primary)]">Explore Our Programs</h2>
          <p className="text-center text-[var(--text-secondary)] mb-6">
            Comprehensive hands-on training programs designed to launch your tech career.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {programs.map((program, index) => (
              <div key={index} className="program-pill">
                {program}
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/courses/courses">
              <button className="cta-btn">View All Courses</button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </AppLayout>
    </>
  );
}