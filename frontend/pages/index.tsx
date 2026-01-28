// import ScrollFadeIn  from "@/components/animations/Animation";
import AppLayout from "@/components/layouts/AppLayout";
import Hero from "@/components/hero/Hero";
import Experience from "@/components/experience/Experience";
import Pathways from "@/components/pathways/Pathways";
import Courses from "@/components/courses/Courses";
// import Skills from "@/components/skills/Skills";
import Method from "@/components/method/Method";
import Testimonials from "@/components/testimonials/Testimonials";
import FAQs from "@/components/FAQs/FAQs";
import TechCompany from "@/components/techcompany/TechCompany";
import Community from "@/components/community/Community";
import Footer from "@/components/footer/Footer";

export default function Home() {
  return (
    <AppLayout>
      <Hero />
      <Experience />
      <Testimonials />
      <Pathways />
      <Courses />
      {/* <Skills /> */}
      <TechCompany />
      <Method />
      <Community />
      <FAQs />
      <Footer />
    </AppLayout>
  );
}
