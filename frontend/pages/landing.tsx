// import Testimonials from "@/components/testimonials/Testimonials";
// import AnimatedHeroSection from "@/components/landing/AnimatedHeroSection";
// import InstallmentBanner from "@/components/installment/InstallmentBanner";

// export default function EnrollLandingPage() {
//   return (
//     <main className="bg-white text-gray-900">

//       {/* ================= ANIMATED HERO SECTION ================= */}
//       <AnimatedHeroSection />

//       {/* ================= VALUE SECTION ================= */}
//       <section className="py-12 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
//         {/* Decorative background elements */}
//         <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30" />
//         <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-30" />
        
//         <div className="max-w-screen-2xl mx-auto px-6 relative z-10">
          
//           <div className="text-center mb-16">
//             <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
//               Why Choose Us
//             </span>
//             <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
//               Why Students Choose Learnexity
//             </h2>
//             <p className="text-gray-600 text-lg max-w-2xl mx-auto">
//               Experience learning that goes beyond tutorials and actually prepares you for the real world
//             </p>
//           </div>

//           <div className="grid md:grid-cols-3 gap-8">

//             {/* Card 1 */}
//             <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
//               <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
//               <div className="relative">
//                 <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
//                   <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                   </svg>
//                 </div>
                
//                 <h3 className="text-2xl font-bold mb-3 text-gray-900">
//                   Real Projects
//                 </h3>
//                 <p className="text-gray-600 leading-relaxed">
//                   Build portfolio-worthy projects that employers actually care about and stand out in interviews.
//                 </p>
//               </div>
//             </div>

//             {/* Card 2 */}
//             <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
//               <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
//               <div className="relative">
//                 <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
//                   <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
//                   </svg>
//                 </div>
                
//                 <h3 className="text-2xl font-bold mb-3 text-gray-900">
//                   Internship Experience
//                 </h3>
//                 <p className="text-gray-600 leading-relaxed">
//                   Gain real-world internship experience and build a results-driven portfolio that proves to employers you’re ready to contribute from day one.
//                 </p>
//               </div>
//             </div>

//             {/* Card 3 */}
//             <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
//               <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-teal-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
//               <div className="relative">
//                 <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
//                   <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//                   </svg>
//                 </div>
                
//                 <h3 className="text-2xl font-bold mb-3 text-gray-900">
//                   Career Support
//                 </h3>
//                 <p className="text-gray-600 leading-relaxed">
//                   CV reviews, interview prep, and job application strategy to land your dream role.
//                 </p>
//               </div>
//             </div>

//           </div>
//         </div>
//       </section>

//       {/* installment payment banner */}
//       <InstallmentBanner />

//       {/* ================= TESTIMONIALS ================= */}
//       <Testimonials />

//       {/* ================= FINAL CTA ================= */}
//       <section className="py-24 bg-black text-white text-center">
//         <div className="max-w-3xl mx-auto px-6">

//           <h2 className="text-3xl md:text-5xl font-bold mb-6">
//             Ready to Transform Your Career?
//           </h2>

//           <p className="text-lg text-white/80 mb-10">
//             Join hundreds of students building real tech careers.
//           </p>
//           <a          
//             href="/user/auth/register"
//             className="inline-block bg-white text-black font-semibold px-10 py-5 rounded-full text-lg hover:scale-105 transition-transform"
//           >
//             Start Your Journey Today
//           </a>

//         </div>
//       </section>

//     </main>
//   );
// }

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

import { Menu, Share2, Copy, X } from "lucide-react";

import {
  FaFacebookF,
  FaYoutube,
  FaWhatsapp,
  FaLinkedinIn,
  FaXTwitter,
  FaInstagram,
} from "react-icons/fa6";



type SocialLink = {
  icon: React.ComponentType<{ size?: number }>;
  link: string;
};

type Feature = {
  title: string;
  description: string;
};

type LinkItem = {
  title: string;
  link: string;
};

type Community = {
  name: string;
  whatsappLink: string;
  images: string[];
};



export default function landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [siteUrl, setSiteUrl] = useState("");

  const [selected, setSelected] = useState<Community | null>(null);

  useEffect(() => {
    setSiteUrl(window.location.href);
  }, []);

  const copyLink = async () => {
    await navigator.clipboard.writeText(siteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(siteUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(siteUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(siteUrl)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(siteUrl)}`,
  };

  const socialLinks: SocialLink[] = [
    { icon: FaFacebookF, link: "https://facebook.com" },
    { icon: FaYoutube, link: "https://youtube.com" },
    { icon: FaWhatsapp, link: "https://wa.me/1234567890" },
    { icon: FaLinkedinIn, link: "https://linkedin.com" },
    { icon: FaXTwitter, link: "https://twitter.com" },
    { icon: FaInstagram, link: "https://instagram.com" },
  ];

  const features: Feature[] = [
    {
      title: "Turn Your Skill To Income",
      description:
        "We do not just teach tech skills; we help you start earning with them.",
    },
    {
      title: "Get Job Placement",
      description:
        "Get matched with our local and international partners for your dream job.",
    },
    {
      title: "Gain Real-World Internship Experience",
      description:
        "We provide hands-on experience employers are looking for.",
    },
    {
      title: "Job Support",
      description:
        "Resume reviews, LinkedIn optimization, interview prep, and global job access.",
    },
  ];

  const links: LinkItem[] = [
    {
      title: "Chat with Learnexity",
      link: "https://wa.me/12762528415",
    },
    {
      title: "Join Learnexity Community",
      link: "https://chat.whatsapp.com/GNMAOp0663AAlNOkJYbiCR?mode=gi_t",
    },
  ];

  const communities: Community[] = [
    {
      name: "AI Content Automation",
      whatsappLink: "https://chat.whatsapp.com/YOUR_LINK_1",
      images: ["/images/AI.jpeg"],
    },
    {
      name: "Video Editing & Motion Graphics",
      whatsappLink: "https://chat.whatsapp.com/YOUR_LINK_2",
      images: ["/images/VE.jpeg"],
    },
    {
      name: "AI Web Development (Vibe Coding)",
      whatsappLink: "https://chat.whatsapp.com/YOUR_LINK_3",
      images: ["/images/WD.jpeg"],
    },
    {
      name: "UI/UX Design",
      whatsappLink: "https://chat.whatsapp.com/YOUR_LINK_4",
      images: ["/images/UI.jpeg"],
    },
    {
      name: "Frontend Development",
      whatsappLink: "https://chat.whatsapp.com/YOUR_LINK_5",
      images: ["/images/FD.jpeg"],
    },
    {
      name: "Backend Development",
      whatsappLink: "https://chat.whatsapp.com/YOUR_LINK_6",
      images: ["/images/BD.jpeg"],
    },
  ];

  return (
    <main className="min-h-screen bg-[#ececef] pb-20">

   
      <header className="fixed top-4 left-0 w-full z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3 bg-white/90 backdrop-blur-md shadow-lg rounded-2xl">
          <h1 className="text-2xl font-bold">
            <span className="text-purple-600">Learn</span>exity
          </h1>

          <div className="flex items-center gap-4">
            <button onClick={() => setShareOpen(!shareOpen)}>
              <Share2 className="text-purple-600" />
            </button>

            <button onClick={() => setMenuOpen(!menuOpen)}>
              <Menu className="text-purple-600" />
            </button>
          </div>
        </div>
      </header>

      
      {menuOpen && (
        <div className="fixed right-6 top-24 w-80 z-50 bg-white p-5 rounded-2xl shadow-xl">
          <button onClick={() => setMenuOpen(false)}>
            <X />
          </button>

              {/* for registeration */}
          <Link href="#" className="block mt-4 text-purple-600 font-bold">
            Register
          </Link>  

          <a href={links[1].link} className="block mt-4 text-green-600">
            WhatsApp Community
          </a>
        </div>
      )}

     
      {shareOpen && (
        <div className="fixed right-6 top-24 w-80 z-50 bg-white p-5 rounded-2xl shadow-xl">
          <button onClick={() => setShareOpen(false)}>
            <X />
          </button>

          <button onClick={copyLink} className="mt-4 flex items-center gap-2">
            <Copy /> {copied ? "Copied!" : "Copy Link"}
          </button>

          <a href={shareLinks.whatsapp}>WhatsApp</a>
          <a href={shareLinks.facebook}>Facebook</a>
          <a href={shareLinks.twitter}>Twitter</a>
          <a href={shareLinks.telegram}>Telegram</a>
        </div>
      )}

    
      <div className="h-24" />

      <section className="relative flex justify-center px-4">
        <div className="max-w-4xl w-full bg-white p-8 rounded-3xl shadow-lg">

          <h1 className="text-3xl font-bold">
            Learn High Income Digital Skills
          </h1>

          
          <div className="grid md:grid-cols-2 gap-4 mt-8">
            {features.map((f, i) => (
              <div key={i}>
                <button
                  onClick={() => setActiveCard(activeCard === i ? null : i)}
                  className="bg-purple-600 text-white w-full p-4 rounded-xl"
                >
                  {f.title}
                </button>

                {activeCard === i && (
                  <div className="p-3 bg-white border mt-2 rounded-xl">
                    {f.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section className="max-w-md mx-auto mt-10 space-y-4">
        {links.map((l, i) => (
          <a
            key={i}
            href={l.link}
            className="block bg-purple-600 text-white text-center p-4 rounded-full"
          >
            {l.title}
          </a>
        ))}
      </section>

     
      <section className="max-w-3xl mx-auto mt-10 space-y-4 px-4">
        {communities.map((c, i) => (
          <button
            key={i}
            onClick={() => setSelected(c)}
            className="w-full bg-purple-600 text-white p-5 rounded-full"
          >
            {c.name}
          </button>
        ))}
      </section>

      
      {selected && (
        <div
          className="fixed inset-0 bg-black/80 flex justify-center items-center"
          onClick={() => setSelected(null)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <img src={selected.images[0]} className="w-96 h-96 object-cover" />
            <a
              href={selected.whatsappLink}
              className="bg-green-500 text-white p-2 block text-center mt-2"
            >
              Join WhatsApp
            </a>
          </div>
        </div>
      )}

    </main>
  );
}