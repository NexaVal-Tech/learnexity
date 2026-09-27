// Community page sections (pages/community.tsx).
import React, { useState } from "react";
import { ScrollFadeIn, FadeUpOnScroll } from "@/components/animations/Animation";
import { CmsIcon, CmsText } from "@/components/cms/ui";
import { safeHref } from "@/lib/cms/url";
import { f, EMPHASIS_HELP } from "@/lib/cms/fields";
import type { BlockDefinition } from "@/lib/cms/blockTypes";

const BRAND = "#4A3AFF";

function CommunityStyles() {
  return (
    <style>{`
      .community-hero { border-radius: 2rem 0.75rem 2rem 0.75rem; }
      .feature-card { border-radius: 2rem 0.75rem 2rem 0.75rem; }
      .feature-card:hover {
        border-color: ${BRAND}66 !important;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6), 0 0 30px ${BRAND}33 !important;
      }
      .community-header-box { border-radius: 2rem 0.75rem 2rem 0.75rem; }
      .modal-card { border-radius: 2rem 0.75rem 2rem 0.75rem; }
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
        background-color: var(--surface);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
        border-radius: 0.75rem;
        width: 100%;
        padding: 0.5rem 1rem;
        outline: none;
        transition: border-color 0.2s;
      }
      .input-field:focus { border-color: ${BRAND}99; box-shadow: 0 0 0 2px ${BRAND}22; }
      .input-field::placeholder { color: var(--text-muted); }
      .select-field {
        background-color: var(--surface);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
        border-radius: 0.75rem;
        padding: 0.5rem 0.75rem;
        outline: none;
        transition: border-color 0.2s;
      }
      .select-field:focus { border-color: ${BRAND}99; }
      .select-field option { background-color: var(--surface); }
    `}</style>
  );
}

// ─── Hero + join modal ────────────────────────────────────────────────────────

export interface CommunityHeroData {
  heading: string;
  text: string;
  buttonLabel: string;
  joinUrl: string;
  modalTitle: string;
  submitLabel: string;
}

export function CommunityHero({ data }: { data: CommunityHeroData }) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", email: "", phoneNumber: "", countryCode: "+234" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.email || !formData.phoneNumber) {
      alert("Please fill in all fields");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert("Please enter a valid email address");
      return;
    }
    setIsSubmitting(true);
    try {
      setShowModal(false);
      const url = safeHref(data.joinUrl);
      if (url !== "#") window.open(url, "_blank", "noopener,noreferrer");
      setFormData({ fullName: "", email: "", phoneNumber: "", countryCode: "+234" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <CommunityStyles />
      <FadeUpOnScroll>
        <div className="max-w-[1260px] mx-auto px-4 py-16 mt-12">
          <div className="community-hero px-12 py-14 text-center bg-gradient-to-r from-purple-200 via-purple-100 to-blue-200 shadow-2xl shadow-black/80 relative overflow-hidden">
            <h1 className="text-5xl font-bold text-gray-900 mb-6 relative z-10">
              <CmsText text={data.heading} />
            </h1>
            <p className="text-gray-700 text-lg max-w-3xl mx-auto mb-8 leading-relaxed relative z-10">
              <CmsText text={data.text} />
            </p>
            {data.buttonLabel && (
              <button onClick={() => setShowModal(true)} className="join-btn text-white font-semibold px-8 py-3 shadow-lg relative z-10">
                {data.buttonLabel}
              </button>
            )}
          </div>
        </div>
      </FadeUpOnScroll>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="modal-card max-w-md w-full p-8 border border-white/10 bg-[#0f0f0f] shadow-2xl shadow-black/80">
            <div className="h-1 w-full mb-8 rounded-full" style={{ background: `linear-gradient(to right, ${BRAND}88, ${BRAND}, ${BRAND}cc)` }} />
            <h2 className="text-3xl font-bold text-center text-white mb-8">{data.modalTitle || "Join our community"}</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-gray-400 font-medium mb-2 text-sm">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="John Doe" required className="input-field" />
              </div>
              <div>
                <label className="block text-gray-400 font-medium mb-2 text-sm">
                  Email <span className="text-red-400">*</span>
                </label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="johndoe@gmail.com" required className="input-field" />
              </div>
              <div>
                <label className="block text-gray-400 font-medium mb-2 text-sm">
                  Phone number <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-2">
                  <select name="countryCode" value={formData.countryCode} onChange={handleInputChange} className="select-field">
                    <option value="+234">+234</option>
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                    <option value="+91">+91</option>
                  </select>
                  <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder="8012345678" required className="input-field" />
                </div>
              </div>
            </div>
            <button onClick={handleSubmit} disabled={isSubmitting} className="join-btn w-full text-white font-semibold py-3 mt-8 mb-4 disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? "Joining..." : data.submitLabel || "Join"}
            </button>
            <button onClick={() => setShowModal(false)} disabled={isSubmitting} className="w-full font-semibold py-2 transition-colors duration-300 disabled:opacity-50" style={{ color: BRAND }}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────

export interface CommunityFeaturesData {
  heading: string;
  features: { title: string; description: string; icon: string }[];
}

export function CommunityFeatures({ data }: { data: CommunityFeaturesData }) {
  return (
    <div className="max-w-[1260px] mx-auto px-4 py-16">
      <CommunityStyles />
      {data.heading && (
        <ScrollFadeIn delay={0}>
          <div className="community-header-box max-w-3xl mx-auto text-center mb-16 px-10 py-6 border border-white/10 bg-[#0f0f0f]/90 backdrop-blur-sm shadow-2xl shadow-black/80">
            <h2 className="text-4xl font-bold text-white leading-snug">
              <CmsText text={data.heading} accentColor="#a5b4fc" />
            </h2>
          </div>
        </ScrollFadeIn>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(data.features ?? []).map((feature, index) => (
          <ScrollFadeIn key={index} delay={index * 0.1} duration={0.3}>
            <div className="feature-card p-8 border border-white/10 bg-[#0f0f0f]/90 backdrop-blur-sm shadow-2xl shadow-black/80 hover:-translate-y-2 cursor-pointer transition-all duration-300 h-full">
              {feature.icon && (
                <span className="block mb-4">
                  <CmsIcon value={feature.icon} size={32} color={BRAND} />
                </span>
              )}
              <h3 className="text-xl font-bold text-white mb-3">
                <CmsText text={feature.title} />
              </h3>
              <p className="text-gray-400 leading-relaxed">
                <CmsText text={feature.description} />
              </p>
            </div>
          </ScrollFadeIn>
        ))}
      </div>
    </div>
  );
}

// ─── Definitions ──────────────────────────────────────────────────────────────

export const communityBlocks: BlockDefinition[] = [
  {
    type: "community.hero",
    label: "Community — hero with join form",
    category: "Community",
    description: "The Join button opens a short form, then sends visitors to your community link.",
    fields: [
      f.textarea("heading", "Heading", { rows: 2, help: EMPHASIS_HELP }),
      f.textarea("text", "Text", { rows: 5, help: EMPHASIS_HELP }),
      f.text("buttonLabel", "Button text"),
      f.url("joinUrl", "Community link", "Where visitors go after filling in the form, e.g. your WhatsApp or Discord invite link."),
      f.text("modalTitle", "Form title"),
      f.text("submitLabel", "Form submit button text"),
    ],
    defaults: {
      heading: "Learnexity Innovation Hub",
      text: "Access our exclusive Discord community where aspiring tech leaders collaborate on real projects, receive mentorship from industry professionals, network and discover job opportunities. Whether you're self-taught or in a structured program, grow your skills through practical experience.",
      buttonLabel: "Join Community",
      joinUrl: "https://chat.whatsapp.com/GNMAOp0663AAlNOkJYbiCR?mode=gi_t",
      modalTitle: "Join our community",
      submitLabel: "Join",
    } satisfies CommunityHeroData,
  },
  {
    type: "community.features",
    label: "Community — feature cards",
    category: "Community",
    fields: [
      f.textarea("heading", "Heading", { rows: 2, help: EMPHASIS_HELP }),
      f.list("features", "Features", [f.textarea("title", "Title", { rows: 1 }), f.textarea("description", "Description", { rows: 3 }), f.icon("icon", "Icon (optional)")], {
        itemLabelKey: "title",
        addLabel: "Add feature",
        itemDefaults: { title: "New feature", description: "Describe it.", icon: "" },
      }),
    ],
    defaults: {
      heading: "Connect with mentors, gain hands-on experience,\nand build real solutions together",
      features: [
        { title: "Mentorship from industry professionals", description: "We don't compromise on quality. Every course is industry-vetted, and every student gets the support they need to succeed.", icon: "" },
        { title: "Internship opportunities", description: "World-class education shouldn't be limited by location or background. We make quality training accessible to all through flexible payment plans and scholarship opportunities.", icon: "" },
        { title: "Hands-on project collaboration", description: "Learning is better together. We build a supportive community where students help each other grow and succeed.", icon: "" },
        { title: "Network with aspiring tech leaders", description: "We don't compromise on quality. Every course is industry-vetted, and every student gets the support they need to succeed.", icon: "" },
        { title: "Exclusive workshops and learning resources", description: "World-class education shouldn't be limited by location or background. We make quality training accessible to all through flexible payment plans and scholarship opportunities.", icon: "" },
        { title: "Career guidance and support", description: "Learning is better together. We build a supportive community where students help each other grow and succeed.", icon: "" },
      ],
    } satisfies CommunityFeaturesData,
  },
];
