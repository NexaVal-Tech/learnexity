import Head from "next/head";
import AppLayout from "@/components/layouts/AppLayout";
import Footer from "@/components/footer/Footer";
import Image from "next/image";

const BRAND = "#4A3AFF";

// ─── TEAM DATA ────────────────────────────────────────────────────────────────
// Replace image paths and bio text when assets are ready.
// Add or remove members freely — the grid adapts automatically.

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
  linkedin?: string;
  twitter?: string;
  featured?: boolean;
}

const TEAM: TeamMember[] = [
  {
    name: "Mary Eze",
    role: "Founder | Clinical Informatics Specialist | Certified Cloud Practitioner",
    bio: "Mary Eze is the Founder of Learnexity, a premier technology training platform dedicated to workforce development and driving economic growth within underserved communities. As a Clinical Informatics Specialist and Certified Cloud Practitioner, she brings high-level expertise at the intersection of data and cloud technology to design innovative, scalable solutions.",
    image: "/images/ceo.jpeg",
    linkedin: "#",
    twitter: "#",
    featured: true,
  },
  {
    name: "Instructor Name",
    role: "Lead Instructor · Software Engineering",
    bio: "Add a short bio here — background, specialisation, and teaching style.",
    image: "/images/Nnamdi-2.png",
    linkedin: "#",
  },
  {
    name: "Instructor Name",
    role: "Instructor · UI/UX & Design",
    bio: "Add a short bio here — background, specialisation, and teaching style.",
    image: "/images/team/instructor-2.jpg",
    linkedin: "#",
  },
  {
    name: "Instructor Name",
    role: "Instructor · Data & AI",
    bio: "Add a short bio here — background, specialisation, and teaching style.",
    image: "/images/team/instructor-3.jpg",
    linkedin: "#",
  },
  {
    name: "Team Member Name",
    role: "Operations & Student Success",
    bio: "Add a short bio here.",
    image: "/images/team/member-1.jpg",
  },
  {
    name: "Team Member Name",
    role: "Marketing & Community",
    bio: "Add a short bio here.",
    image: "/images/team/member-2.jpg",
  },
];

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

// ─── FEATURED CARD (CEO) ──────────────────────────────────────────────────────
function FeaturedCard({ member }: { member: TeamMember }) {
  return (
    <div
      className="featured-card"
      style={{
        borderRadius: "2.5rem 1rem 2.5rem 1rem",
        border: `1px solid ${BRAND}44`,
        background: "rgba(28,28,32,0.97)",
        backdropFilter: "blur(12px)",
        padding: "0",
        overflow: "hidden",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 0,
        boxShadow: `0 0 60px ${BRAND}22, 0 30px 80px rgba(0,0,0,0.7)`,
      }}
    >
      {/* Photo side */}
      <div
        style={{
          position: "relative",
          minHeight: "420px",
          background: `linear-gradient(135deg, ${BRAND}18 0%, #1a1a22 100%)`,
          overflow: "hidden",
        }}
      >
        <Image
          src={member.image}
          alt={member.name}
          fill
          className="object-cover object-top"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        {/* Gradient overlay blending into right side */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to right, transparent 60%, rgba(28,28,32,0.97) 100%)",
          }}
        />
        {/* Bottom tint */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(28,28,32,0.6) 0%, transparent 50%)",
          }}
        />

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
        <div
          style={{
            position: "absolute",
            top: "1.5rem",
            left: "1.5rem",
            background: BRAND,
            color: "white",
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "0.35rem 0.85rem",
            borderRadius: "999px",
          }}
        >
          Leadership
        </div>
      </div>

      {/* Text side */}
      <div
        style={{
          padding: "3rem 2.5rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "1.25rem",
        }}
      >
        <div>
          <p
            style={{
              color: BRAND,
              fontSize: "0.8rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "0.5rem",
            }}
          >
            {member.role}
          </p>
          <h2
            style={{
              color: "white",
              fontSize: "clamp(1.6rem, 2.5vw, 2.25rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            {member.name}
          </h2>
        </div>

        <div
          style={{
            width: "2.5rem",
            height: "3px",
            background: BRAND,
            borderRadius: "999px",
          }}
        />

        <p
          style={{
            color: "rgba(255,255,255,0.65)",
            fontSize: "0.95rem",
            lineHeight: 1.75,
            margin: 0,
          }}
        >
          {member.bio}
        </p>

        {/* Social links */}
        {(member.linkedin || member.twitter) && (
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            {member.linkedin && (
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  color: "rgba(255,255,255,0.45)",
                  fontSize: "0.8rem",
                  textDecoration: "none",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "999px",
                  padding: "0.4rem 0.85rem",
                  transition: "all 0.25s",
                }}
                className="social-link"
              >
                <LinkedInIcon /> LinkedIn
              </a>
            )}
            {member.twitter && (
              <a
                href={member.twitter}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  color: "rgba(255,255,255,0.45)",
                  fontSize: "0.8rem",
                  textDecoration: "none",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "999px",
                  padding: "0.4rem 0.85rem",
                  transition: "all 0.25s",
                }}
                className="social-link"
              >
                <TwitterIcon /> X / Twitter
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── REGULAR MEMBER CARD ──────────────────────────────────────────────────────
function MemberCard({ member }: { member: TeamMember }) {
  return (
    <div
      className="member-card"
      style={{
        borderRadius: "2rem 0.75rem 2rem 0.75rem",
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(28,28,32,0.95)",
        backdropFilter: "blur(8px)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 25px 50px rgba(0,0,0,0.6)",
        transition: "all 0.35s ease",
      }}
    >
      {/* Photo */}
      <div
        style={{
          position: "relative",
          height: "260px",
          background: `linear-gradient(135deg, ${BRAND}14 0%, #18181f 100%)`,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <Image
          src={member.image}
          alt={member.name}
          fill
          className="object-cover member-photo"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(28,28,32,0.9) 0%, transparent 55%)",
          }}
        />
        {/* Placeholder */}
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
            color: "white",
            fontSize: "1.2rem",
            fontWeight: 700,
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {member.name}
        </h3>
        <p
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: "0.85rem",
            lineHeight: 1.65,
            margin: "0.25rem 0 0",
            flex: 1,
          }}
        >
          {member.bio}
        </p>

        {/* Social links */}
        {(member.linkedin || member.twitter) && (
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
            {member.linkedin && (
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.4)",
                  textDecoration: "none",
                  transition: "all 0.25s",
                }}
                aria-label={`${member.name} on LinkedIn`}
              >
                <LinkedInIcon />
              </a>
            )}
            {member.twitter && (
              <a
                href={member.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.4)",
                  textDecoration: "none",
                  transition: "all 0.25s",
                }}
                aria-label={`${member.name} on X`}
              >
                <TwitterIcon />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function Team() {
  const featured = TEAM.find((m) => m.featured);
  const rest = TEAM.filter((m) => !m.featured);

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
        <div style={{ minHeight: "100vh", background: "#090909", paddingBottom: "5rem" }}>

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
                  color: "white",
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
                <MemberCard key={member.name + member.role} member={member} />
              ))}
            </div>
          </div>
        </div>

        <Footer />
      </AppLayout>
    </>
  );
}