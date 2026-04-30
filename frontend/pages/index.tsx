// import ScrollFadeIn  from "@/components/animations/Animation";
import Head from "next/head";
import AppLayout from "@/components/layouts/AppLayout";
import Hero from "@/components/hero/Hero";
import Experience from "@/components/experience/Experience";
import Pathways from "@/components/pathways/Pathways";
import Courses from "@/components/courses/Courses";
// import Skills from "@/components/skills/Skills";
// import Navbar from "@/components/navbar/Navbar";
import Method from "@/components/method/Method";
import Testimonials from "@/components/testimonials/Testimonials";
import FAQs from "@/components/FAQs/FAQs";
import TechCompany from "@/components/techcompany/TechCompany";
// import Community from "@/components/community/Community";
import Footer from "@/components/footer/Footer";
import InstallmentBanner from "@/components/installment/InstallmentBanner";
import ProbStatement from "@/components/probstatement/ProbStatement";
import ScholarshipBanner from "@/components/Scholarship/ScholarshipBanner";

export default function Home() {
  return (
    <AppLayout>
      <Head>
        <title>Learnexity — Learn In-Demand Tech Skills & Launch Your Career</title>
        <meta
          name="description"
          content="Learnexity helps you go from learning to doing — through hands-on training, internships, and real pathways into jobs, freelancing, and entrepreneurship in tech."
        />
        <meta property="og:title" content="Learnexity — Learn In-Demand Tech Skills" />
        <meta
          property="og:description"
          content="Build real tech skills and gain hands-on experience. Courses in AI (artificial intelligence), Web Development, UI/UX Design, Data Analytics and more."
        />
        <link rel="canonical" href="https://learnexity.org" />

        {/* WebSite JSON-LD — enables Google Sitelinks Search Box */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Learnexity",
              url: "https://learnexity.org",
            }),
          }}
        />
      </Head>

      {/* <Navbar /> */}
      <Hero />
      <Experience />
      <Testimonials />
      <Pathways />
      <InstallmentBanner />
      <ProbStatement />
      <Courses />
      <ScholarshipBanner />
      {/* <Skills /> */}
      <TechCompany />
      <Method />
      {/* <Community /> */}
      <FAQs />
      <Footer />
    </AppLayout>
  );
}
