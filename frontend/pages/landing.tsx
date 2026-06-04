

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