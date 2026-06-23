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
    image: "/images/emmas-sister.jpeg",
    linkedin: "#",
    twitter: "#",
    featured: true,
  },
  {
    name: "Kingsley Eze",
    role: "President, Learnexity",
    bio: "Kingsley Eze serves as the President of Learnexity, where he plays a pivotal role in driving strategic growth, organizational excellence, and continuous innovation. With a strong foundation in systems thinking, he provides the executive leadership needed to design and scale programs that are both operationally sound and deeply learner-centered.",
    image: "/images/decenc.jpg",
    linkedin: "#",
  },
  {
    name: "Decency Onyekachi Ogbonna, MBA",
    role: "Executive Advisor, Learnexity",
    bio: "Decency Onyekachi Ogbonna, MBA, serves as an Executive Advisor at Learnexity, where he contributes to the development of high-impact learning strategies and programs that drive measurable student success. As the Founder and CEO of Decency NCLEX Academy, he has built a results-driven platform dedicated to preparing aspiring nurses for licensure through structured training and mentorship.",
    image: "/images/decency.jpg",
    linkedin: "#",
  },
  {
    name: "Nmeribe Nnamdi",
    role: "Software Engineer",
    bio: "Nmeribe a Software Engineer with 5+ years of experience and an Electrical/Electronics Engineer with a passion for building innovative digital solutions and solving complex technical problems. who specializes in web and mobile application development systems development, combining software expertise with strong engineering principles. whose goal is to create reliable, efficient, and impactful technologies that drive business growth and improve user experiences.",
    image: "/images/chidiadi-1.png",
    linkedin: "#",
  },
  {
    name: "Opie Samuel",
    role: "Full-Stack Developer",
    bio: "Opie Chisom Samuel is a full-stack developer and AI content creator who specializes in building automated, scalable content systems. He has successfully monetized over three YouTube channels within three months and has helped more than 10 individuals achieve monetization. His work focuses on combining technology and strategy to create sustainable online income, while guiding others to grow and succeed in the digital space.",
    image: "/images/opie.jpg",
  },
  {
    name: "Glory Chikadibia",
    role: "Social Media Management",
    bio: "Chikadibia Glory is a results-driven social media manager and coach with over 4 years of experience crafting strategies that elevate brands and build influence. She goes beyond teaching equipping individuals with the mindset, structure, and strategic thinking needed to operate as top professionals in the industry.",
    image: "/images/glory.jpg",
  },
  {
    name: "Sunday Goodnews",
    role: "Software Engineer",
    bio: "Sunday Goodnews is a software engineer with over 5 years of experience, who has led engineering teams to build solutions like ERPP and CAMP for the Nigerian Shippers Council. He teaches DevOps with a focus on preparing students to become industry-ready engineers..",
    image: "/images/instructor-2.jpg",
  },
  {
    name: "Ejiro Okereke",
    role: "UI/UX Designer",
    bio: "Ejiro Okereka is a Product and Brand Designer with over 3 years of experience creating intuitive digital products and cohesive brand identities across industries like finance, wellness, education, and productivity. She specializes in transforming ideas into user-friendly, visually engaging experiences—combining functionality with strong visual direction. Passionate about growth, she helps beginners build solid design foundations and confidently apply their skills to real-world projects.",
    image: "/images/instructor-3.jpg",
  },
  {
    name: "Grant Erondu",
    role: "Data science and machine learning",
    bio: "Grant Erondu is a data science and machine learning enthusiast with a passion for understanding how intelligent systems behave and make decisions. Over the years, he has trained over 100 students, equipping them with practical skills to analyze data and build impactful solutions.",
    image: "/images/instructor-1.jpg",
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
          minHeight: "460px",
          background: `linear-gradient(135deg, ${BRAND}18 0%, #1a1a22 100%)`,
          overflow: "hidden",
        }}
      >
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
          height: "320px",
          background: `linear-gradient(135deg, ${BRAND}14 0%, #18181f 100%)`,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
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
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(28,28,32,0.9) 0%, transparent 55%)",
          }}
        />

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
            color: "white",
            fontSize: "1.2rem",
            fontWeight: 700,
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {member.name}
        </h3>
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