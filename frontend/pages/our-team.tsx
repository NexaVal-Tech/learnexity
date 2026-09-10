import { useState } from "react";
import Head from "next/head";
import AppLayout from "@/components/layouts/AppLayout";
import Footer from "@/components/footer/Footer";
import Image from "next/image";

const BRAND = "#4A3AFF";

// ─── TEAM DATA ────────────────────────────────────────────────────────────────
// Replace image paths and bio text when assets are ready.
// Add or remove members freely — the grid adapts automatically.
// `bio` is now an array of paragraphs — each entry renders as its own <p>.

interface TeamMember {
  name: string;
  role: string;
  bio: string[];
  image: string;
  linkedin?: string;
  twitter?: string;
  featured?: boolean;
}

const TEAM: TeamMember[] = [
  {
    name: "Mary Eze",
    role: "Founder | AI & Digital Transformation Strategist | Innovation, Governance & Human Development",
    bio: [
      "I’m Mary, the founder of Learnexity. I’m an AI Governance Advocate, AI Governance Certified professional (Harvard Business School), Generative & Agentic AI Certified professional, AI & Analytics Lead, Informatics Specialist (MSN), MBA, AWS Certified Cloud Practitioner, Career Coach, Mentor, Author, and member of the International Association of Privacy Professionals (IAPP), with over 12 years of experience at the intersection of healthcare, technology, and digital transformation.",
      "I’m passionate about human transformation and using AI and emerging technologies responsibly to create opportunities. Over the years, I’ve witnessed how rapidly technology is reshaping the future of work while creating a growing gap between learning and real-world opportunities. That realization inspired us to build Learnexity.",
      "Our mission is to discover and develop high-potential talent by helping professionals build future-relevant skills, gain practical experience, and access mentorship and global career pathways.",
      "We are building professionals who are prepared to contribute to the technologies shaping the future and thrive in the digital economy.",
      "I’m excited to share insights on AI, career growth, digital transformation, and the future of work with this community. If you’re committed to continuous learning and building a meaningful career, you’re in the right place.",
    ],
    image: "/images/emmas-sister.jpeg",
    linkedin: "https://www.linkedin.com/in/mary-eze-64271a302?utm_source=share_via&utm_content=profile&utm_medium=member_ios",
    twitter: "#",
    featured: true,
  },
  {
    name: "Kingsley Eze",
    role: "President, Learnexity",
    bio: [
      "Kingsley Eze serves as the President of Learnexity, where he plays a pivotal role in driving strategic growth, organizational excellence, and continuous innovation.",
      "With a strong foundation in systems thinking, he provides the executive leadership needed to design and scale programs that are both operationally sound and deeply learner-centered.",
    ],
    image: "/images/eze.jpeg",
    linkedin: "#",
  },
  {
    name: "Decency Onyekachi Ogbonna, MBA",
    role: "Executive Advisor, Learnexity",
    bio: [
      "Decency Onyekachi Ogbonna, MBA, serves as an Executive Advisor at Learnexity, where he contributes to the development of high-impact learning strategies and programs that drive measurable student success.",
      "As the Founder and CEO of Decency NCLEX Academy, he has built a results-driven platform dedicated to preparing aspiring nurses for licensure through structured training and mentorship.",
    ],
    image: "/images/decency.jpg",
    linkedin: "#",
  },
  {
    name: "Cynthia Arundu",
    role: "Executive Advisor",
    bio: [
      "Cynthia is an Adjunct Faculty Member at South College, Informatics Specialist (MSN), and a Google Certified Data Analyst passionate about empowering individuals through career development, technology, and lifelong learning.",
    ],
    image: "/images/arundu.png",
    linkedin: "#",
  },
  {
    name: "Hannah Francis",
    role: "Communication Specialist",
    bio: [
      "Hannah Francis is a Communication Specialist with over 10 years of experience helping organizations build strong relationships through effective communication, public engagement, and strategic messaging across digital and traditional platforms.",
      "Her expertise includes public relations, corporate communication, content strategy, media relations, presentation skills, crisis communication, stakeholder engagement, and brand storytelling. Hannah enjoys mentoring students on how to communicate with confidence, influence audiences, and build meaningful professional relationships.",
      "Her goal is to equip learners with the communication skills, emotional intelligence, and strategic thinking required to excel in leadership, business, and today's fast-paced professional environment.",
    ],
    image: "/images/hannah.jpg",
    linkedin: "#",
  },
  // {
  //   name: "David Shetty",
  //   role: "Head of Marketing",
  //   bio: [
  //     "Michael Anderson is a DevOps and Cloud Engineer with more than 9 years of experience designing, deploying, and managing cloud infrastructure for high-growth technology companies.",
  //     "His expertise includes AWS, Docker, Kubernetes, Terraform, Linux, CI/CD pipelines, and cloud security. Michael enjoys helping students understand modern DevOps practices by combining practical labs with real production scenarios.",
  //     "His goal is to equip learners with the technical skills and confidence needed to become industry-ready cloud and DevOps engineers.",
  //   ],
  //   image: "/images/micheal.png",
  //   linkedin: "#",
  // },
  // {
  //   name: "Evans Miller",
  //   role: "AI Automation Engineer",
  //   bio: [
  //     "Evans Miller is an AI Automation Engineer with over 8 years of experience designing intelligent workflows and automation systems that help businesses streamline operations, improve productivity, and reduce manual effort through artificial intelligence.",
  //     "whose expertise includes AI workflow automation, Python, OpenAI APIs, LangChain, n8n, Zapier, Make.com, API integrations, prompt engineering, and business process automation. Evans is passionate about teaching students how to build practical AI-powered solutions that solve real-world business challenges.",
  //     "His mission is to empower aspiring engineers with the knowledge and hands-on experience needed to create scalable AI automation systems and become highly sought-after professionals in the rapidly evolving AI industry.",
  //   ],
  //   image: "/images/Evans.jpg",
  //   linkedin: "#",
  // },
  {
    name: "Nmeribe Nnamdi",
    role: "Software Engineer",
    bio: [
      "Nmeribe a Software Engineer with 5+ years of experience and an Electrical/Electronics Engineer with a passion for building innovative digital solutions and solving complex technical problems.",
      "Who specializes in web and mobile application development and systems development, combining software expertise with strong engineering principles.",
      "Whose goal is to create reliable, efficient, and impactful technologies that drive business growth and improve user experiences.",
    ],
    image: "/images/chidiadi-1.png",
    linkedin: "#",
  },
  {
    name: "Opie Samuel",
    role: "AI Automation Engineer",
    bio: [
      "Opie Chisom Samuel is an AI content creator who specializes in building automated, scalable content systems.",
      "He has successfully monetized over three YouTube channels within three months and has helped more individuals achieve monetization. His work focuses on combining technology and strategy to create sustainable online income, while guiding others to grow and succeed in the digital space.",
      "He has built several automation systems and is passionate about helping others and businesses achieve the same.",
    ],
    image: "/images/opie.jpg",
  },
  {
    name: "Glory Chikadibia",
    role: "Social Media Management",
    bio: [
      "Chikadibia Glory is a results-driven social media manager and coach with over 4 years of experience crafting strategies that elevate brands and build influence.",
      "She goes beyond teaching and equipping individuals with the mindset, structure, and strategic thinking needed to operate as top professionals in the industry.",
    ],
    image: "/images/glory.jpg",
  },
  {
    name: "Sunday Goodnews",
    role: "Devops and Cloud Architect",
    bio: [
      "Sunday Goodnews is a software engineer with over 5 years of experience, who has led engineering teams to build solutions like ERPP and CAMP for the Nigerian Shippers Council.",
      "He teaches DevOps with a focus on preparing students to become industry-ready engineers.",
    ],
    image: "/images/instructor-2.jpg",
  },
  {
    name: "Loveth Nworie",
    role: "Cloud & AI Security (AI-SECOPS)",
    bio: [
      "Loveth Nworie is a Cloud and AI Security Engineer specializing in securing cloud infrastructure, AI systems, and modern enterprise applications. Her expertise includes cloud security, identity and access management (IAM), DevSecOps, container security, threat detection, compliance, and securing AI/ML workloads across production environments.",
      "She is passionate about helping aspiring cybersecurity professionals build practical, job-ready skills in Cloud Security and AI-SECOPS. Through hands-on labs and real-world scenarios, she teaches students how to identify vulnerabilities, implement security best practices, and protect cloud-native and AI-powered applications from emerging threats.",
    ],
    image: "/images/instructor-3.jpg",
  },
  {
    name: "Grant Erondu",
    role: "AI Systems & MLOps Instructor",
    bio: [
      "Grant Erondu is an AI Systems and MLOps Engineer with extensive experience designing, deploying, and maintaining production-ready machine learning solutions. He specializes in AI application development, model deployment, cloud infrastructure, CI/CD pipelines, Docker, Kubernetes, and scalable ML workflows.",
      "He has trained over 100 students in artificial intelligence, machine learning, and MLOps, helping them gain hands-on experience in building, deploying, monitoring, and optimizing intelligent systems using industry-standard tools and best practices.",
    ],
    image: "/images/instructor-1.jpg",
  },
];

// ─── NAMES WITH BIO NOT READY YET ─────────────────────────────────────────────
// Add/remove names here to control who shows "Coming soon" instead of a bio.
const COMING_SOON_MEMBERS = ["David Shetty", "Hannah Francis"];

// ─── SOCIAL ICONS ─────────────────────────────────────────────────────────────
function LinkedInIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.622 5.905-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={BRAND} strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
    </svg>
  );
}

// ─── SOCIAL LINK PILL (shared) ────────────────────────────────────────────────
function SocialLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (

    <a href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="social-link"
      onClick={(e) => e.stopPropagation()}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        border: "1px solid var(--border-strong)",
        color: "var(--text-secondary)",
        background: "var(--surface-alt)",
        transition: "all 0.25s ease",
      }}
    >
      {children}
    </a>
  );
}

// ─── BIO PARAGRAPHS (shared) ──────────────────────────────────────────────────
function BioParagraphs({ paragraphs, style }: { paragraphs: string[]; style?: React.CSSProperties }) {
  return (
    <>
      {paragraphs.map((para, i) => (
        <p
          key={i}
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.95rem",
            lineHeight: 1.75,
            margin: i === 0 ? "0 0 1rem" : "0 0 1rem",
            ...style,
          }}
        >
          {para}
        </p>
      ))}
    </>
  );
}

// ─── BIO MODAL ────────────────────────────────────────────────────────────────
function BioModal({ member, onClose }: { member: TeamMember; onClose: () => void }) {
  const isComingSoon = COMING_SOON_MEMBERS.includes(member.name);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "var(--overlay)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "560px",
          maxHeight: "85vh",
          overflowY: "auto",
          borderRadius: "2rem 0.75rem 2rem 0.75rem",
          border: `1px solid ${BRAND}44`,
          background: "var(--surface-elevated)",
          boxShadow: `0 0 60px ${BRAND}22, 0 30px 80px rgba(0,0,0,0.8)`,
          padding: "2.5rem",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: "1.25rem",
            right: "1.25rem",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: "1px solid var(--border-strong)",
            background: "var(--surface-alt)",
            color: "var(--text-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <CloseIcon />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem", paddingRight: "2.5rem" }}>
          {member.image && (
            <div style={{ position: "relative", width: "64px", height: "64px", borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: `1.5px solid ${BRAND}55` }}>
              <Image src={member.image} alt={member.name} fill style={{ objectFit: "cover", objectPosition: "center 18%" }} />
            </div>
          )}
          <div>
            <h3 style={{ color: "var(--text-primary)", fontSize: "1.3rem", fontWeight: 700, margin: 0, lineHeight: 1.2 }}>{member.name}</h3>
            <p style={{ color: BRAND, fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0.35rem 0 0" }}>
              {member.role}
            </p>
          </div>
        </div>

        {isComingSoon ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              padding: "2rem 1rem",
              gap: "1rem",
            }}
          >
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: `${BRAND}14`,
                border: `1.5px solid ${BRAND}33`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ClockIcon />
            </div>
            <h4 style={{ color: "var(--text-primary)", fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
              Bio coming soon
            </h4>
          </div>
        ) : (
          <div>
            <BioParagraphs paragraphs={member.bio} />
          </div>
        )}

        {!isComingSoon && (member.linkedin || member.twitter) && (
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem" }}>
            {member.linkedin && (
              <SocialLink href={member.linkedin}>
                <LinkedInIcon />
              </SocialLink>
            )}
            {member.twitter && (
              <SocialLink href={member.twitter}>
                <TwitterIcon />
              </SocialLink>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── FEATURED CARD (CEO) ──────────────────────────────────────────────────────
function FeaturedCard({ member }: { member: TeamMember }) {
  return (
    <div className="featured-card" style={{borderRadius: "2.5rem 1rem 2.5rem 1rem", border: `1px solid ${BRAND}44`, background: "var(--surface-elevated)", backdropFilter: "blur(12px)", padding: "0", overflow: "hidden",
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, boxShadow: `0 0 60px ${BRAND}22, 0 30px 80px rgba(0,0,0,0.7)`, }}>
      {/* Photo side */}
      <div style={{position: "relative", minHeight: "460px", background: `linear-gradient(135deg, ${BRAND}18 0%, #1a1a22 100%)`, overflow: "hidden", }} >
        {member.image && (
          <Image
            src={member.image}
            alt={member.name}
            fill
            style={{ objectFit: "cover", objectPosition: "center 20%" }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        )}
        {/* Gradient overlay blending into right side */}
        <div style={{position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 60%, rgba(28,28,32,0.97) 100%)",}} />
        {/* Bottom tint */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(28,28,32,0.6) 0%, transparent 50%)",}} />

        {/* Placeholder icon — only shown when there is no image */}
        {!member.image && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={BRAND} strokeWidth="1.5">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>
        )}

        {/* Leadership badge */}
        <div style={{position: "absolute", top: "1.5rem", left: "1.5rem", background: BRAND, color: "white", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.35rem 0.  85rem", borderRadius: "999px",}}> Leadership
         </div>
      </div>

      {/* Text side */}
      <div style={{padding: "3rem 2.5rem", display: "flex", flexDirection: "column", justifyContent: "center", gap: "1.25rem", }}>
        <div>
          <p style={{color: BRAND, fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.5rem",}}>
            {member.role}
          </p>
          <h2 style={{color: "var(--text-primary)", fontSize: "clamp(1.6rem, 2.5vw, 2.25rem)", fontWeight: 800, lineHeight: 1.1, margin: 0,}}>
            {member.name}
          </h2>
        </div>

        <div style={{width: "2.5rem", height: "3px", background: BRAND, borderRadius: "999px",}}/>

        <div>
          <BioParagraphs paragraphs={member.bio} />
        </div>

        {/* Social links — LinkedIn (and Twitter, if provided) */}
        {(member.linkedin || member.twitter) && (
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
            {member.linkedin && (
              <SocialLink href={member.linkedin}>
                <LinkedInIcon />
              </SocialLink>
            )}
            {member.twitter && (
              <SocialLink href={member.twitter}>
                <TwitterIcon />
              </SocialLink>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── REGULAR MEMBER CARD ──────────────────────────────────────────────────────
function MemberCard({ member, onReadBio }: { member: TeamMember; onReadBio: (member: TeamMember) => void }) {
  return (
    <div className="member-card" style={{borderRadius: "2rem 0.75rem 2rem 0.75rem", border: "1px solid var(--border-subtle)", background: "var(--surface-elevated)", backdropFilter: "blur(8px)", overflow: "hidden",
        display: "flex", flexDirection: "column", boxShadow: "0 25px 50px rgba(0,0,0,0.6)", transition: "all 0.35s ease",}}>
      {/* Photo */}
      <div style={{position: "relative", height: "320px", background: `linear-gradient(135deg, ${BRAND}14 0%, #18181f 100%)`, overflow: "hidden", flexShrink: 0,}} >
        {member.image && (
          <Image
            src={member.image}
            alt={member.name}
            fill
            className="member-photo"
            style={{ objectFit: "cover", objectPosition: "center 18%" }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        )}
        <div style={{position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(28,28,32,0.9) 0%, transparent 55%)",}} />

        {/* Placeholder — only shown when there is no image */}
        {!member.image && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: `${BRAND}1a`,
                border: `1.5px solid ${BRAND}33`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={`${BRAND}88`} strokeWidth="1.5">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Text */}
      <div style={{ padding: "1.5rem 1.75rem 1.75rem", flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <p
          style={{
            color: BRAND,
            fontSize: "0.72rem",
            fontWeight: 600,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          {member.role}
        </p>
        <h3
          style={{
            color: "var(--text-primary)",
            fontSize: "1.2rem",
            fontWeight: 700,
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {member.name}
        </h3>

        {/* Bio is hidden by default — revealed via modal */}
        <button
          onClick={() => onReadBio(member)}
          className="read-bio-btn"
          style={{
            marginTop: "0.75rem",
            alignSelf: "flex-start",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            background: `${BRAND}14`,
            border: `1px solid ${BRAND}44`,
            color: BRAND,
            fontSize: "0.8rem",
            fontWeight: 600,
            letterSpacing: "0.02em",
            padding: "0.5rem 1rem",
            borderRadius: "999px",
            cursor: "pointer",
            transition: "all 0.25s ease",
          }}
        >
          Learn more
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function Team() {
  const featured = TEAM.find((m) => m.featured);
  const rest = TEAM.filter((m) => !m.featured);
  const [activeMember, setActiveMember] = useState<TeamMember | null>(null);

  return (
    <>
      <Head>
        <title>Our Team - Learnexity</title>
        <meta
          name="description"
          content="Meet the passionate team behind Learnexity, dedicated to revolutionizing education through technology."
        />
      </Head>

      <AppLayout>
        <style>{`
          .member-card:hover {
            border-color: ${BRAND}55;
            box-shadow: 0 20px 60px rgba(0,0,0,0.7), 0 0 30px ${BRAND}22;
            transform: translateY(-6px);
          }
          .member-card:hover .member-photo {
            transform: scale(1.04);
            transition: transform 0.5s ease;
          }
          .social-link:hover {
            border-color: ${BRAND} !important;
            color: ${BRAND} !important;
            background: ${BRAND}18 !important;
          }
          .read-bio-btn:hover {
            background: ${BRAND}26 !important;
            box-shadow: 0 0 16px ${BRAND}33;
          }
          .featured-card {
            transition: box-shadow 0.35s ease;
          }
          .featured-card:hover {
            box-shadow: 0 0 80px ${BRAND}33, 0 40px 100px rgba(0,0,0,0.8) !important;
          }
          .cta-link:hover {
            box-shadow: 0 0 24px ${BRAND}66 !important;
          }
          @media (max-width: 768px) {
            .featured-card {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>

        {/* ── Deep dark page background ── */}
        <div style={{ minHeight: "100vh", background: "var(--page-bg)", paddingBottom: "5rem" }}>

          {/* ── HERO ── */}
          <div
            style={{
              position: "relative",
              paddingTop: "9rem",
              paddingBottom: "5rem",
              textAlign: "center",
              overflow: "hidden",
            }}
          >
            {/* Background glow orbs */}
            <div
              style={{
                position: "absolute",
                top: "20%",
                left: "50%",
                transform: "translateX(-50%)",
                width: "600px",
                height: "300px",
                background: `radial-gradient(ellipse, ${BRAND}18 0%, transparent 70%)`,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "15%",
                width: "300px",
                height: "300px",
                background: `radial-gradient(ellipse, ${BRAND}0d 0%, transparent 70%)`,
                pointerEvents: "none",
              }}
            />

            <div style={{ position: "relative", zIndex: 1, padding: "0 1.5rem" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: `${BRAND}18`,
                  border: `1px solid ${BRAND}44`,
                  borderRadius: "999px",
                  padding: "0.4rem 1.1rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: BRAND,
                    boxShadow: `0 0 8px ${BRAND}`,
                  }}
                />
                <span
                  style={{
                    color: BRAND,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  The People Behind Learnexity
                </span>
              </div>

              <h1
                style={{
                  color: "var(--text-primary)",
                  fontSize: "clamp(2.2rem, 5vw, 3.75rem)",
                  fontWeight: 800,
                  lineHeight: 1.08,
                  margin: "0 auto 1.25rem",
                  maxWidth: "1500px",
                }}
              >
                Built by educators. Driven by purpose.
              </h1>
            </div>
          </div>

          {/* ── CONTENT ── */}
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem" }}>

            {/* Section label — Leadership */}
            <p
              style={{
                color: BRAND,
                fontSize: "0.8rem",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "1.5rem",
              }}
            >
              Leadership
            </p>

            {/* Featured CEO card */}
            {featured && (
              <div style={{ marginBottom: "4rem" }}>
                <FeaturedCard member={featured} />
              </div>
            )}

            {/* Section label — Instructors & Team */}
            <p
              style={{
                color: BRAND,
                fontSize: "0.8rem",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "1.5rem",
              }}
            >
              Instructors & Team
            </p>

            {/* Team grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "1.75rem",
              }}
            >
              {rest.map((member) => (
                <MemberCard key={member.name + member.role} member={member} onReadBio={setActiveMember} />
              ))}
            </div>
          </div>
        </div>

        <Footer />
      </AppLayout>

      {/* Bio modal — only rendered when a member is selected */}
      {activeMember && <BioModal member={activeMember} onClose={() => setActiveMember(null)} />}
    </>
  );
}