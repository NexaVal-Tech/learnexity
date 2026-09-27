// Contact page sections (pages/contact.tsx) + the scrolling course-name ticker.
import React from "react";
import { ArrowRight } from "lucide-react";
import HeaderCourse from "@/components/headercourses/HeaderCourse";
import { ScrollFadeIn, FadeUpOnScroll } from "@/components/animations/Animation";
import { CmsLink, CmsText, SOCIAL_ICONS } from "@/components/cms/ui";
import { f, EMPHASIS_HELP } from "@/lib/cms/fields";
import type { BlockDefinition } from "@/lib/cms/blockTypes";

const BRAND = "#4A3AFF";

function ContactStyles() {
  return (
    <style>{`
      .contact-card { border-radius: 2rem 0.75rem 2rem 0.75rem; }
      .contact-card:hover {
        border-color: ${BRAND}66 !important;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6), 0 0 30px ${BRAND}33 !important;
      }
      .contact-card-brand { border-radius: 2rem 0.75rem 2rem 0.75rem; background-color: ${BRAND}; }
      .contact-card-brand:hover {
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6), 0 0 30px ${BRAND}66 !important;
        transform: translateY(-4px);
      }
      .contact-header-box { border-radius: 2rem 0.75rem 2rem 0.75rem; }
      .outline-btn {
        display: inline-block;
        border: 2px solid ${BRAND}66;
        color: ${BRAND};
        border-radius: 2rem 0.75rem 2rem 0.75rem;
        padding: 0.5rem 1.5rem;
        font-weight: 600;
        transition: all 0.3s;
      }
      .outline-btn:hover { background-color: ${BRAND}22; border-color: ${BRAND}; }
      .social-icon-btn { border-radius: 2rem 0.75rem 2rem 0.75rem; }
      .social-icon-btn:hover { background-color: ${BRAND}22 !important; border-color: ${BRAND}66 !important; }
    `}</style>
  );
}

// ─── Course ticker (live course names) ───────────────────────────────────────

export function CourseTicker() {
  return <HeaderCourse variant="white" />;
}

// ─── Hero + contact cards ────────────────────────────────────────────────────

interface ContactMethod {
  title: string;
  text: string;
  linkLabel: string;
  href: string;
  highlight: boolean;
}

interface QuickCard {
  title: string;
  text: string;
  buttonLabel: string;
  href: string;
  dots: string;
}

export interface ContactMainData {
  heading: string;
  text: string;
  methods: ContactMethod[];
  quickCards: QuickCard[];
}

/** The decorative dot trio on each quick card — preset colour sets. */
const DOT_SETS: Record<string, string[]> = {
  brand: [`${BRAND}44`, `${BRAND}66`, `${BRAND}88`],
  warm: ["rgba(20,83,45,0.4)", "rgba(113,63,18,0.4)", "rgba(124,45,18,0.4)"],
  cool: ["rgba(127,29,29,0.4)", "rgba(49,46,129,0.4)", "rgba(19,78,74,0.4)"],
  none: [],
};

export function ContactMain({ data }: { data: ContactMainData }) {
  const methods = data.methods ?? [];
  const quick = data.quickCards ?? [];
  return (
    <>
      <ContactStyles />
      <section className="pt-30 pb-52 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-[var(--text-primary)] mb-4">
            <CmsText text={data.heading} />
          </h1>
          <p className="text-xl text-[var(--text-secondary)]">
            <CmsText text={data.text} />
          </p>
        </div>
      </section>

      <section className="px-6 relative">
        <div className="max-w-[1230px] mx-auto">
          <div className="-mt-32 z-20 relative grid md:grid-cols-3 gap-6 mb-16">
            {methods.map((m, i) => (
              <ScrollFadeIn key={i} delay={i * 0.15} duration={0.3}>
                <div
                  className={
                    m.highlight
                      ? "contact-card-brand text-white p-8 transition-all duration-300 cursor-pointer h-full"
                      : "contact-card border border-[var(--border-subtle)] bg-[var(--surface-elevated)] backdrop-blur-sm shadow-2xl shadow-black/80 p-8 transition-all duration-300 cursor-pointer h-full"
                  }
                >
                  <h3 className={`text-2xl font-bold mb-3 ${m.highlight ? "" : "text-[var(--text-primary)]"}`}>
                    <CmsText text={m.title} />
                  </h3>
                  <p className={`mb-6 ${m.highlight ? "text-purple-100" : "text-[var(--text-secondary)]"}`}>
                    <CmsText text={m.text} accentColor={m.highlight ? "#ffffff" : BRAND} />
                  </p>
                  {m.linkLabel && (
                    <CmsLink
                      href={m.href}
                      className="font-semibold flex items-center gap-2 hover:gap-3 transition-all w-fit"
                      style={{ color: m.highlight ? "#ffffff" : BRAND }}
                    >
                      {m.linkLabel} <ArrowRight className="w-5 h-5" />
                    </CmsLink>
                  )}
                </div>
              </ScrollFadeIn>
            ))}
          </div>

          {quick.length > 0 && (
            <div className="grid md:grid-cols-3 gap-6 py-8">
              {quick.map((q, i) => (
                <ScrollFadeIn key={i} delay={i * 0.15} duration={0.3}>
                  <div className="contact-card border border-[var(--border-subtle)] bg-[var(--surface-elevated)] backdrop-blur-sm shadow-2xl shadow-black/80 p-8 text-center transition-all duration-300 cursor-pointer h-full">
                    {(DOT_SETS[q.dots] ?? DOT_SETS.brand).length > 0 && (
                      <div className="flex justify-center mb-4">
                        <div className="flex -space-x-2">
                          {(DOT_SETS[q.dots] ?? DOT_SETS.brand).map((c, di) => (
                            <div key={di} className="w-10 h-10 rounded-full border-2 border-[var(--border-subtle)]" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                      </div>
                    )}
                    <h3 className="text-xl font-bold mb-2 text-[var(--text-primary)]">
                      <CmsText text={q.title} />
                    </h3>
                    <p className="text-[var(--text-secondary)] text-sm mb-6">
                      <CmsText text={q.text} />
                    </p>
                    {q.buttonLabel &&
                      (q.href ? (
                        <CmsLink href={q.href} className="outline-btn">
                          {q.buttonLabel}
                        </CmsLink>
                      ) : (
                        <span className="outline-btn">{q.buttonLabel}</span>
                      ))}
                  </div>
                </ScrollFadeIn>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

// ─── Business hours ───────────────────────────────────────────────────────────

export interface ContactHoursData {
  heading: string;
  rows: { label: string; value: string }[];
}

export function ContactHours({ data }: { data: ContactHoursData }) {
  return (
    <FadeUpOnScroll>
      <ContactStyles />
      <section className="py-16 px-6">
        <div className="contact-header-box max-w-[1230px] mx-auto px-10 py-12 border border-[var(--border-subtle)] bg-[var(--surface-elevated)] backdrop-blur-sm shadow-2xl shadow-black/80 text-center">
          <h2 className="text-4xl font-bold text-[var(--text-primary)] mb-8">
            <CmsText text={data.heading} />
          </h2>
          <div className="space-y-2 text-[var(--text-secondary)]">
            {(data.rows ?? []).map((r, i) => (
              <p key={i}>
                {r.label}: <span className="font-bold text-[var(--text-primary)]">{r.value}</span>
              </p>
            ))}
          </div>
        </div>
      </section>
    </FadeUpOnScroll>
  );
}

// ─── Social links ─────────────────────────────────────────────────────────────

export interface ContactSocialsData {
  heading: string;
  socials: { platform: string; href: string }[];
}

export function ContactSocials({ data }: { data: ContactSocialsData }) {
  return (
    <FadeUpOnScroll>
      <ContactStyles />
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-[var(--text-primary)] mb-8">
            <CmsText text={data.heading} />
          </h2>
          <div className="flex justify-center gap-4 flex-wrap">
            {(data.socials ?? []).filter((s) => s.href).map((s, i) => {
              const Icon = SOCIAL_ICONS[s.platform?.toLowerCase()] ?? SOCIAL_ICONS.website;
              return (
                <CmsLink
                  key={i}
                  href={s.href}
                  newTab
                  aria-label={s.platform}
                  className="social-icon-btn w-12 h-12 border border-[var(--border-subtle)] bg-[var(--surface-elevated)] flex items-center justify-center transition-all duration-300"
                >
                  <Icon className="w-5 h-5 text-[var(--text-secondary)]" />
                </CmsLink>
              );
            })}
          </div>
        </div>
      </section>
    </FadeUpOnScroll>
  );
}

// ─── Definitions ──────────────────────────────────────────────────────────────

export const SOCIAL_PLATFORM_OPTIONS = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "youtube", label: "YouTube" },
  { value: "x", label: "X / Twitter" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "website", label: "Website" },
];

export const contactBlocks: BlockDefinition[] = [
  {
    type: "general.courseTicker",
    label: "Scrolling course names",
    category: "Lists & Cards",
    description: "A line of live course names that scrolls sideways (courses come from Course Management).",
    fields: [],
    defaults: {},
  },
  {
    type: "contact.main",
    label: "Contact — heading + contact cards",
    category: "Contact",
    fields: [
      f.textarea("heading", "Heading", { rows: 2, help: EMPHASIS_HELP }),
      f.textarea("text", "Text", { rows: 2, help: EMPHASIS_HELP }),
      f.list(
        "methods",
        "Contact methods (overlapping cards)",
        [
          f.text("title", "Title"),
          f.textarea("text", "Text", { rows: 2, help: EMPHASIS_HELP }),
          f.text("linkLabel", "Link text"),
          f.url("href", "Link", "e.g. https://calendly.com/…, https://wa.me/…, mailto:you@example.com"),
          f.bool("highlight", "Purple highlighted card"),
        ],
        { itemLabelKey: "title", addLabel: "Add contact method", max: 6, itemDefaults: { title: "New method", text: "", linkLabel: "Open", href: "", highlight: false } }
      ),
      f.list(
        "quickCards",
        "Quick-access cards",
        [
          f.text("title", "Title"),
          f.textarea("text", "Text", { rows: 2 }),
          f.text("buttonLabel", "Button text"),
          f.url("href", "Button link"),
          f.select("dots", "Decoration", [
            { value: "brand", label: "Purple dots" },
            { value: "warm", label: "Green/amber dots" },
            { value: "cool", label: "Red/indigo/teal dots" },
            { value: "none", label: "None" },
          ]),
        ],
        { itemLabelKey: "title", addLabel: "Add card", max: 6, itemDefaults: { title: "New card", text: "", buttonLabel: "Open", href: "", dots: "brand" } }
      ),
    ],
    defaults: {
      heading: "Get in touch",
      text: "Have questions? We're here to help. Choose the best way to reach us.",
      methods: [
        { title: "Schedule a Free Call", text: "Book a free consultation call with our team.", linkLabel: "Book Now", href: "https://calendly.com/nexavaltech/30min", highlight: true },
        { title: "Chat on WhatsApp", text: "Get instant responses to your questions", linkLabel: "Chat", href: "https://wa.me/+12762528415", highlight: false },
        { title: "Email Us", text: "For detailed enquiries, send an email to **info@learnexity.org**", linkLabel: "Send Email", href: "mailto:info@learnexity.org", highlight: false },
      ],
      quickCards: [
        { title: "Current Students", text: "Already enrolled? Access your dashboard or contact support.", buttonLabel: "Go to Dashboard", href: "/user/dashboard", dots: "brand" },
        { title: "Course Information", text: "Looking for course details? Browse our catalog.", buttonLabel: "View Courses", href: "/courses/courses", dots: "warm" },
        { title: "Help Centre", text: "Find answers to common questions.", buttonLabel: "Visit FAQ", href: "/#faqs", dots: "cool" },
      ],
    } satisfies ContactMainData,
  },
  {
    type: "contact.hours",
    label: "Contact — business hours",
    category: "Contact",
    fields: [
      f.textarea("heading", "Heading", { rows: 1 }),
      f.list("rows", "Rows", [f.text("label", "Label"), f.text("value", "Value (bold)")], {
        itemLabelKey: "label",
        addLabel: "Add row",
        itemDefaults: { label: "Label", value: "Value" },
      }),
    ],
    defaults: {
      heading: "Business Hours & Response Times",
      rows: [
        { label: "Response time", value: "Within 24 hours (Monday - Friday)" },
        { label: "Business hours", value: "9:00 AM - 5:00 PM WAT" },
        { label: "Weekend", value: "Messages received on weekends will be answered on Monday" },
      ],
    } satisfies ContactHoursData,
  },
  {
    type: "contact.socials",
    label: "Social media links",
    category: "Contact",
    fields: [
      f.textarea("heading", "Heading", { rows: 1 }),
      f.list("socials", "Links", [f.select("platform", "Platform", SOCIAL_PLATFORM_OPTIONS), f.url("href", "URL")], {
        itemLabelKey: "platform",
        addLabel: "Add link",
        itemDefaults: { platform: "instagram", href: "" },
      }),
    ],
    defaults: {
      heading: "Connect with us",
      socials: [
        { platform: "instagram", href: "https://www.instagram.com/learnexity?igsh=enoyZGV3NTA2ZXVp" },
        { platform: "facebook", href: "https://www.facebook.com/Learnexity" },
        { platform: "linkedin", href: "https://www.linkedin.com/company/valuable-globalus/" },
        { platform: "youtube", href: "https://youtube.com/@learnexity?si=R19UJgJTw0q7uWx-" },
      ],
    } satisfies ContactSocialsData,
  },
];
