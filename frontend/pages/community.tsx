"use client";

import React, { useState } from 'react';
import { Briefcase, FolderOpen, Users, Layers, Target, GraduationCap } from 'lucide-react';
import Footer from "@/components/footer/Footer";
import { ScrollFadeIn, FadeUpOnScroll } from "@/components/animations/Animation";

const BRAND = "#4A3AFF";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <GraduationCap className="w-8 h-8" style={{ color: BRAND }} />,
    title: "Mentorship from industry professionals",
    description: "We don't compromise on quality. Every course is industry-vetted, and every student gets the support they need to succeed."
  },
  {
    icon: <Briefcase className="w-8 h-8" style={{ color: BRAND }} />,
    title: "Internship opportunities",
    description: "World-class education shouldn't be limited by location or background. We make quality training accessible to all through flexible payment plans and scholarship opportunities."
  },
  {
    icon: <FolderOpen className="w-8 h-8" style={{ color: BRAND }} />,
    title: "Hands-on project collaboration",
    description: "Learning is better together. We build a supportive community where students help each other grow and succeed."
  },
  {
    icon: <Users className="w-8 h-8" style={{ color: BRAND }} />,
    title: "Network with aspiring tech leaders",
    description: "We don't compromise on quality. Every course is industry-vetted, and every student gets the support they need to succeed."
  },
  {
    icon: <Layers className="w-8 h-8" style={{ color: BRAND }} />,
    title: "Exclusive workshops and learning resources",
    description: "World-class education shouldn't be limited by location or background. We make quality training accessible to all through flexible payment plans and scholarship opportunities."
  },
  {
    icon: <Target className="w-8 h-8" style={{ color: BRAND }} />,
    title: "Career guidance and support",
    description: "Learning is better together. We build a supportive community where students help each other grow and succeed."
  }
];

export default function CommunityPage() {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    countryCode: '+234',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.email || !formData.phoneNumber) {
      alert('Please fill in all fields');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address');
      return;
    }
    setIsSubmitting(true);
    try {
      setShowModal(false);
      window.open('https://chat.whatsapp.com/INag8dBLGnS9KBANu87Jlm', '_blank');
      setFormData({ fullName: '', email: '', phoneNumber: '', countryCode: '+234' });
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <style>{`
        .community-hero {
          border-radius: 2rem 0.75rem 2rem 0.75rem;
        }
        .feature-card {
          border-radius: 2rem 0.75rem 2rem 0.75rem;
        }
        .feature-card:hover {
          border-color: ${BRAND}66 !important;
          box-shadow:
            0 20px 60px rgba(0, 0, 0, 0.6),
            0 0 30px ${BRAND}33 !important;
        }
        .community-header-box {
          border-radius: 2rem 0.75rem 2rem 0.75rem;
        }
        .modal-card {
          border-radius: 2rem 0.75rem 2rem 0.75rem;
        }
        .join-btn {
          background-color: ${BRAND};
          border-radius: 2rem 0.75rem 2rem 0.75rem;
          transition: all 0.3s;
        }
        .join-btn:hover {
          background-color: #3628e0;
          box-shadow: 0 0 20px ${BRAND}66;
          transform: translateY(-2px);
        }
        .input-field {
          background-color: #090909;
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
          border-radius: 0.75rem;
          width: 100%;
          padding: 0.5rem 1rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-field:focus {
          border-color: ${BRAND}99;
          box-shadow: 0 0 0 2px ${BRAND}22;
        }
        .input-field::placeholder {
          color: #6b7280;
        }
        .select-field {
          background-color: #090909;
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
          border-radius: 0.75rem;
          padding: 0.5rem 0.75rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .select-field:focus {
          border-color: ${BRAND}99;
        }
        .select-field option {
          background-color: #0f0f0f;
        }
      `}</style>

      {/* Hero Section */}
      <FadeUpOnScroll>
        <div className="max-w-[1260px] mx-auto px-4 py-16 mt-12">
          <div
            className="community-hero px-12 py-14 text-center
              bg-gradient-to-r from-purple-200 via-purple-100 to-blue-200
              shadow-2xl shadow-black/80
              relative overflow-hidden"
          >
            <h1 className="text-5xl font-bold text-gray-900 mb-6 relative z-10">
              Learnexity Innovation Hub
            </h1>
            <p className="text-gray-700 text-lg max-w-3xl mx-auto mb-8 leading-relaxed relative z-10">
              Access our exclusive Discord community where aspiring tech leaders collaborate on real projects, receive mentorship from industry professionals, network and discover job opportunities. Whether you&apos;re self-taught or in a structured program, grow your skills through practical experience.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="join-btn text-white font-semibold px-8 py-3 shadow-lg relative z-10"
            >
              Join Community
            </button>
          </div>
        </div>
      </FadeUpOnScroll>

      {/* Features Section */}
      <div className="max-w-[1260px] mx-auto px-4 py-16">

        {/* Section header */}
        <ScrollFadeIn delay={0}>
          <div
            className="community-header-box max-w-3xl mx-auto text-center mb-16 px-10 py-6
              border border-white/10
              bg-[#0f0f0f]/90 backdrop-blur-sm
              shadow-2xl shadow-black/80"
          >
            <h2 className="text-4xl font-bold text-white leading-snug">
              Connect with mentors, gain hands-on experience,{" "}
              <span className="block">and build real solutions together</span>
            </h2>
          </div>
        </ScrollFadeIn>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <ScrollFadeIn key={index} delay={index * 0.1} duration={0.3}>
              <div
                className="feature-card p-8
                  border border-white/10
                  bg-[#0f0f0f]/90 backdrop-blur-sm
                  shadow-2xl shadow-black/80
                  hover:-translate-y-2
                  cursor-pointer transition-all duration-300
                  h-full"
              >
                {/* Icon with brand bg bubble */}
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
                  style={{ backgroundColor: `${BRAND}22` }}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </ScrollFadeIn>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div
            className="modal-card max-w-md w-full p-8
              border border-white/10
              bg-[#0f0f0f]
              shadow-2xl shadow-black/80"
          >
            {/* Shimmer top bar */}
            <div
              className="h-1 w-full mb-8 rounded-full"
              style={{ background: `linear-gradient(to right, ${BRAND}88, ${BRAND}, ${BRAND}cc)` }}
            />

            <h2 className="text-3xl font-bold text-center text-white mb-8">
              Join our community
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-gray-400 font-medium mb-2 text-sm">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-2 text-sm">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="johndoe@gmail.com"
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-2 text-sm">
                  Phone number <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleInputChange}
                    className="select-field"
                  >
                    <option value="+234">+234</option>
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                    <option value="+91">+91</option>
                  </select>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="8012345678"
                    required
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="join-btn w-full text-white font-semibold py-3 mt-8 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Joining...' : 'Join'}
            </button>

            <button
              onClick={() => setShowModal(false)}
              disabled={isSubmitting}
              className="w-full font-semibold py-2 transition-colors duration-300 disabled:opacity-50"
              style={{ color: BRAND }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}