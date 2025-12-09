import React, { useState } from 'react';
import { Briefcase, FolderOpen, Users, Layers, Target, GraduationCap } from 'lucide-react';
import Footer from "@/components/footer/Footer";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <GraduationCap className="w-8 h-8 text-gray-900" />,
    title: "Mentorship from industry professionals",
    description: "We don't compromise on quality. Every course is industry-vetted, and every student gets the support they need to succeed."
  },
  {
    icon: <Briefcase className="w-8 h-8 text-gray-900" />,
    title: "Internship opportunities",
    description: "World-class education shouldn't be limited by location or background. We make quality training accessible to all through flexible payment plans and scholarship opportunities."
  },
  {
    icon: <FolderOpen className="w-8 h-8 text-gray-900" />,
    title: "Hands-on project collaboration",
    description: "Learning is better together. We build a supportive community where students help each other grow and succeed."
  },
  {
    icon: <Users className="w-8 h-8 text-gray-900" />,
    title: "Network with aspiring tech leaders",
    description: "We don't compromise on quality. Every course is industry-vetted, and every student gets the support they need to succeed."
  },
  {
    icon: <Layers className="w-8 h-8 text-gray-900" />,
    title: "Exclusive workshops and learning resources",
    description: "World-class education shouldn't be limited by location or background. We make quality training accessible to all through flexible payment plans and scholarship opportunities."
  },
  {
    icon: <Target className="w-8 h-8 text-gray-900" />,
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
    // Validate form data
    if (!formData.fullName || !formData.email || !formData.phoneNumber) {
      alert('Please fill in all fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // You can optionally send this data to your backend/database first
      // Example:
      // await fetch('/api/community-signup', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });

      console.log('Form submitted:', formData);

      // Close modal
      setShowModal(false);

      // Redirect to Discord invite link
      window.open('https://discord.gg/acrqPJEZ', '_blank');

      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phoneNumber: '',
        countryCode: '+234'
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="max-w-[1505px] mx-auto px-4 py-16 mt-12">
        <div className="bg-gradient-to-r from-purple-200 via-purple-100 to-blue-200 rounded-3xl p-12 text-center shadow-lg">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Learnexity Innovation Hub
          </h1>
          <p className="text-gray-700 text-lg max-w-3xl mx-auto mb-8 leading-relaxed">
            Access our exclusive Discord community where aspiring tech leaders collaborate on real projects, receive mentorship from industry professionals, network and discover job opportunities. Whether you're self-taught or in a structured program, grow your skills through practical experience.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#6C63FF] hover:bg-gray-700 text-white font-semibold px-4 py-1 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            Join Community
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-[1505px] mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
          Connect with mentors, gain hands-on experience,
        </h2>
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
          and build real solutions together
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white border-2 rounded-2xl p-8 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 transition-opacity duration-300 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-4 shadow-2xl">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
              Join our community
            </h2>

            <div className="space-y-1">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  required
                  className="w-full text-gray-800 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="johndoe@gmail.com"
                  required
                  className="w-full text-gray-800 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Phone number <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleInputChange}
                    className="px-3 py-2 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
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
                    className="flex-1 px-4 py-2 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-[#6C63FF] hover:bg-gray-900 text-white font-semibold py-2 rounded-full shadow-lg transition-all duration-300 mt-8 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Joining...' : 'Join'}
            </button>

            <button
              onClick={() => setShowModal(false)}
              disabled={isSubmitting}
              className="w-full text-[#6C63FF] hover:text-purple-700 font-semibold py-2 transition-colors duration-300 disabled:opacity-50"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* footer */}
      <Footer />
    </div>
  );
}