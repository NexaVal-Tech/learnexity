// pages/contact.tsx

import Head from "next/head";
import AppLayout from "@/components/layouts/AppLayout";
import Courses from "@/components/headercourses/HeaderCourse";
import Footer from "@/components/footer/Footer";
import Link from "next/link";
import { ScrollFadeIn, FadeUpOnScroll } from "@/components/animations/Animation";
import {
  Calendar,
  MessageCircle,
  HelpCircle,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  ArrowRight,
} from "lucide-react";

const BRAND = "#4A3AFF";

type SocialIconProps = {
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  link: string;
};

export default function Contact() {
  return (
    <>
          <Head>
            <title>Contact us - Choose any prefered method to reach out to us </title>
    
            <meta
              name="description"
              content="Choose any prefered method to reach out to us."
            />
            <link rel="canonical" href="https://learnexity.org/contact" />
          </Head>

      <AppLayout>
        <style>{`
          .contact-card {
            border-radius: 2rem 0.75rem 2rem 0.75rem;
          }
          .contact-card:hover {
            border-color: ${BRAND}66 !important;
            box-shadow:
              0 20px 60px rgba(0, 0, 0, 0.6),
              0 0 30px ${BRAND}33 !important;
          }
          .contact-card-brand {
            border-radius: 2rem 0.75rem 2rem 0.75rem;
            background-color: ${BRAND};
          }
          .contact-card-brand:hover {
            box-shadow:
              0 20px 60px rgba(0, 0, 0, 0.6),
              0 0 30px ${BRAND}66 !important;
            transform: translateY(-4px);
          }
          .contact-header-box {
            border-radius: 2rem 0.75rem 2rem 0.75rem;
          }
          .outline-btn {
            border: 2px solid ${BRAND}66;
            color: ${BRAND};
            border-radius: 2rem 0.75rem 2rem 0.75rem;
            padding: 0.5rem 1.5rem;
            font-weight: 600;
            transition: all 0.3s;
          }
          .outline-btn:hover {
            background-color: ${BRAND}22;
            border-color: ${BRAND};
          }
          .social-icon-btn {
            border-radius: 2rem 0.75rem 2rem 0.75rem;
          }
          .social-icon-btn:hover {
            background-color: ${BRAND}22 !important;
            border-color: ${BRAND}66 !important;
          }
        `}</style>

        <Courses variant="white" />

        {/* Hero Section — no bg so particle shows through */}
        <section className="pt-30 pb-52 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-[var(--text-primary)] mb-4">
              Get in touch
            </h1>
            <p className="text-xl text-[var(--text-secondary)]">
              Have questions? We&apos;re here to help. Choose the best way to reach us.
            </p>
          </div>
        </section>

        {/* Contact Cards Section — no bg */}
        <section className="px-6 relative">
          <div className="max-w-[1230px] mx-auto">

            {/* FIRST THREE CARDS — overlapping hero */}
            <div className="-mt-32 z-20 relative grid md:grid-cols-3 gap-6 mb-16">

              <ScrollFadeIn delay={0} duration={0.3}>
                <div className="contact-card-brand text-white p-8 transition-all duration-300 cursor-pointer h-full">
                  <h3 className="text-2xl font-bold mb-3">Schedule a Free Call</h3>
                  <p className="mb-6 text-purple-100">
                    Book a free consultation call with our team.
                  </p>
                  <a href="https://calendly.com/nexavaltech/30min" className="text-white font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                    Book Now <ArrowRight className="w-5 h-5" />
                  </a>
                </div>
              </ScrollFadeIn>

              <ScrollFadeIn delay={0.15} duration={0.3}>
                <div className="contact-card border border-[var(--border-subtle)] bg-[var(--surface-elevated)] backdrop-blur-sm shadow-2xl shadow-black/80 p-8 transition-all duration-300 cursor-pointer h-full">
                  <h3 className="text-2xl font-bold mb-3 text-[var(--text-primary)]">Chat on WhatsApp</h3>
                  <p className="mb-6 text-[var(--text-secondary)]">
                    Get instant responses to your questions
                  </p>
                  <a href="https://wa.me/+12762528415" className="font-semibold flex items-center gap-2 hover:gap-3 transition-all" style={{ color: BRAND }}>
                    Chat <ArrowRight className="w-5 h-5" />
                  </a>
                </div>
              </ScrollFadeIn>

              <ScrollFadeIn delay={0.3} duration={0.3}>
                <div className="contact-card border border-[var(--border-subtle)] bg-[var(--surface-elevated)] backdrop-blur-sm shadow-2xl shadow-black/80 p-8 transition-all duration-300 cursor-pointer h-full">
                  <h3 className="text-2xl font-bold mb-3 text-[var(--text-primary)]">Email Us</h3>
                  <p className="mb-6 text-[var(--text-secondary)]">
                    For detailed enquiries, send an email to{" "}
                    <a href="mailto:info@learnexity.org" className="underline" style={{ color: BRAND }}>
                      info@learnexity.org
                    </a>
                  </p>
                  <a href="mailto:hello@learnexity.com" className="font-semibold flex items-center gap-2 hover:gap-3 transition-all" style={{ color: BRAND }}>
                    Send Email <ArrowRight className="w-5 h-5" />
                  </a>
                </div>
              </ScrollFadeIn>

            </div>

            {/* Quick Access Cards */}
            <div className="grid md:grid-cols-3 gap-6 py-8">

              <ScrollFadeIn delay={0} duration={0.3}>
                <div className="contact-card border border-[var(--border-subtle)] bg-[var(--surface-elevated)] backdrop-blur-sm shadow-2xl shadow-black/80 p-8 text-center transition-all duration-300 cursor-pointer h-full">
                  <div className="flex justify-center mb-4">
                    <div className="flex -space-x-2">
                      <div className="w-10 h-10 rounded-full border-2 border-[var(--border-subtle)]" style={{ backgroundColor: `${BRAND}44` }}></div>
                      <div className="w-10 h-10 rounded-full border-2 border-[var(--border-subtle)]" style={{ backgroundColor: `${BRAND}66` }}></div>
                      <div className="w-10 h-10 rounded-full border-2 border-[var(--border-subtle)]" style={{ backgroundColor: `${BRAND}88` }}></div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-[var(--text-primary)]">Current Students</h3>
                  <p className="text-[var(--text-secondary)] text-sm mb-6">
                    Already enrolled? Access your dashboard or contact support.
                  </p>
                  <Link href="/user/dashboard">
                    <button className="outline-btn">Go to Dashboard</button>
                  </Link>
                </div>
              </ScrollFadeIn>

              <ScrollFadeIn delay={0.15} duration={0.3}>
                <div className="contact-card border border-[var(--border-subtle)] bg-[var(--surface-elevated)] backdrop-blur-sm shadow-2xl shadow-black/80 p-8 text-center transition-all duration-300 cursor-pointer h-full">
                  <div className="flex justify-center mb-4">
                    <div className="flex -space-x-2">
                      <div className="w-10 h-10 rounded-full border-2 border-[var(--border-subtle)] bg-green-900/40"></div>
                      <div className="w-10 h-10 rounded-full border-2 border-[var(--border-subtle)] bg-yellow-900/40"></div>
                      <div className="w-10 h-10 rounded-full border-2 border-[var(--border-subtle)] bg-orange-900/40"></div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-[var(--text-primary)]">Course Information</h3>
                  <p className="text-[var(--text-secondary)] text-sm mb-6">
                    Looking for course details? Browse our catalog.
                  </p>
                  <Link href="/courses/courses">
                    <button className="outline-btn">View Courses</button>
                  </Link>
                </div>
              </ScrollFadeIn>

              <ScrollFadeIn delay={0.3} duration={0.3}>
                <div className="contact-card border border-[var(--border-subtle)] bg-[var(--surface-elevated)] backdrop-blur-sm shadow-2xl shadow-black/80 p-8 text-center transition-all duration-300 cursor-pointer h-full">
                  <div className="flex justify-center mb-4">
                    <div className="flex -space-x-2">
                      <div className="w-10 h-10 rounded-full border-2 border-[var(--border-subtle)] bg-red-900/40"></div>
                      <div className="w-10 h-10 rounded-full border-2 border-[var(--border-subtle)] bg-indigo-900/40"></div>
                      <div className="w-10 h-10 rounded-full border-2 border-[var(--border-subtle)] bg-teal-900/40"></div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-[var(--text-primary)]">Help Centre</h3>
                  <p className="text-[var(--text-secondary)] text-sm mb-6">
                    Find answers to common questions.
                  </p>
                  <button className="outline-btn">Visit FAQ</button>
                </div>
              </ScrollFadeIn>

            </div>
          </div>
        </section>

        {/* Business Hours — no section bg */}
        <FadeUpOnScroll>
          <section className="py-16 px-6">
            <div
              className="contact-header-box max-w-[1230px] mx-auto px-10 py-12
                border border-[var(--border-subtle)]
                bg-[var(--surface-elevated)] backdrop-blur-sm
                shadow-2xl shadow-black/80 text-center"
            >
              <h2 className="text-4xl font-bold text-[var(--text-primary)] mb-8">Business Hours & Response Times</h2>
              <div className="space-y-2 text-[var(--text-secondary)]">
                <p>Response time: <span className="font-bold text-[var(--text-primary)]">Within 24 hours (Monday - Friday)</span></p>
                <p>Business hours: <span className="font-bold text-[var(--text-primary)]">9:00 AM - 5:00 PM WAT</span></p>
                <p>Weekend: <span className="font-bold text-[var(--text-primary)]">Messages received on weekends will be answered on Monday</span></p>
              </div>
            </div>
          </section>
        </FadeUpOnScroll>

        {/* Connect with us — no section bg */}
        <FadeUpOnScroll>
          <section className="py-16 px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold text-[var(--text-primary)] mb-8">Connect with us</h2>
              <div className="flex justify-center gap-4">
                <SocialIcon Icon={Instagram} link="https://www.instagram.com/learnexity?igsh=enoyZGV3NTA2ZXVp" />
                <SocialIcon Icon={Facebook} link="https://www.facebook.com/Learnexity" />
                <SocialIcon Icon={Linkedin} link="https://www.linkedin.com/company/valuable-globalus/" />
                <SocialIcon Icon={Youtube} link="https://youtube.com/@learnexity?si=R19UJgJTw0q7uWx-" />
              </div>
            </div>
          </section>
        </FadeUpOnScroll>

        <Footer />
      </AppLayout>
    </>  
  );
}

function SocialIcon({ Icon, link }: SocialIconProps) {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="social-icon-btn w-12 h-12 border border-[var(--border-subtle)] bg-[var(--surface-elevated)] flex items-center justify-center transition-all duration-300"
    >
      <Icon className="w-5 h-5 text-[var(--text-secondary)]" />
    </a>
  );
}