// data/coursesData.ts
import { Course } from "@/types/course";

export const coursesData: Course[] = [
  {
    id: "ai",
    title: "AI (Generative AI & Automation)",
    project: "Complete AI-powered solution with automation",
    description:
      "Master AI tools and no-code automation. Build AI-powered solutions from prompt engineering to workflow automation using cutting-edge generative AI platforms.",
    heroImage: "/images/ai-1.png",
    secondaryImage: "/images/a1-2.png",
    price: 299,
    tools: [
      { name: "Make", icon: "/images/tools/aitool-1.png" },
      { name: "OpenAI", icon: "/images/tools/aitool-2.png" },
      { name: "Zapier", icon: "/images/tools/aitool-3.png" },
      { name: "MidJourney", icon: "/images/tools/aitool4.png" },
      { name: "Gemini", icon: "/images/tools/aitool-5.png" },
      { name: "DALL-E", icon: "/images/tools/aitool-6.png" },
      { name: "Notion", icon: "/images/tools/aitool-7.png" },
      { name: "Synthesia", icon: "/images/tools/aitool-8.png" },
    ],
    whatYouWillLearn: [
      "Advanced prompt engineering techniques",
      "AI content creation for video, images, and text",
      "No-code automation and workflow design",
      "Building AI agents and knowledge systems",
      "Ethical AI implementation and best practices",
    ],
    keyBenefits: [
      { title: "Cutting-Edge Technology", text: "Master the most transformative technology of our time" },
      { title: "Productivity Multiplier", text: "Automate repetitive tasks and enhance efficiency" },
      { title: "Creative Enhancement", text: "Augment human creativity with AI capabilities" },
      { title: "Future-Proof Skills", text: "Position yourself for the AI-driven economy" },
    ],
    careerPath: {
      entry: ["AI Prompt Engineer", "Automation Specialist"],
      mid: ["AI Solutions Developer", "Process Automation Manager"],
      advanced: ["AI Strategy Consultant", "Head of Digital Transformation"],
      specialized: ["AI Trainer", "Content Automation Specialist", "Workflow Designer"],
    },
    industries: [
      { title: "Content Creation", text: "Marketing agencies, media companies, publishing" },
      { title: "Customer Service", text: "Chatbot development, automated support systems" },
      { title: "Education", text: "AI tutors, automated grading, personalized learning" },
      { title: "Business Process", text: "Automation consultancies, enterprise solutions" },
      { title: "E-commerce", text: "Product descriptions, customer interactions, inventory management" },
      { title: "Healthcare", text: "Medical documentation, patient communication, research assistance" },
    ],
    salary: {
      entry: "Entry level: $30,000 - $55,000 USD annually",
      mid: "Mid level: $55,000 - $90,000 USD annually",
      senior: "Senior level: $150,000+ USD annually",
    },
  },
  

  {
    id: "cloud-foundation",
    title: "Cloud Foundation",
    project: "Enterprise cloud infrastructure deployment with auto-scaling and monitoring",
    description:
      "Master cloud infrastructure and services across major platforms. Learn to design, deploy, and manage scalable cloud solutions following AWS, Microsoft Azure, and Google Cloud best practices.",
    heroImage: "/images/cloud-1.png",
    secondaryImage: "/images/cloud-2.png",
    price: 299,
    tools: [
      { name: "Make", icon: "/images/tools/cloudtool-1.png" },
      { name: "OpenAI", icon: "/images/tools/cloudtool-2.png" },
      { name: "Zapier", icon: "/images/tools/cloudtool-3.png" },
      { name: "MidJourney", icon: "/images/tools/cloudtool-4.png" },
      { name: "Gemini", icon: "/images/tools/cloudtool-5.png" },
      { name: "DALL-E", icon: "/images/tools/cloudtool-6.png" },
      { name: "Notion", icon: "/images/tools/cloudtool-7.png" },
    ],
    whatYouWillLearn: [
      "Cloud architecture design and implementation",
      "Cloud security and compliance best practices",
      "Cost optimization and resource management",
      "Multi-cloud and hybrid cloud strategies",
    ],
    keyBenefits: [
      { title: "High-Demand Skills:", text: "Cloud expertise is essential for modern businesses" },
      { title: "Scalability Focus:", text: "Learn to build systems that grow with business needs" },
      { title: "Cost Efficiency:", text: "Master cloud economics and optimization strategies" },
      { title: "Future-Proof Career:", text: "Cloud adoption continues accelerating globally" },
    ],
    careerPath: {
      entry: ["Cloud Support Engineer", "Junior Cloud Developer"],
      mid: ["Cloud Solutions Architect"],
      advanced: ["Senior Cloud Architect", "Cloud Engineering Manage"],
      specialized: ["Cloud Security Specialist", "Cloud Cost Optimization Consultant"],
    },
    industries: [
      { title: "Technology:", text: "Software companies, SaaS platforms, tech startups" },
      { title: "Enterprise:", text: "Large corporations migrating to cloud infrastructure" },
      { title: "Financial Services:", text: "Banking systems, fintech platforms, trading systems" },
      { title: "Healthcare:", text: "Medical records, telemedicine, research platforms" },
      { title: "E-commerce", text: "Scalable retail platforms, marketplace infrastructure" },
      { title: "Government", text: "Public sector cloud adoption, citizen services" },
    ],
    salary: {
      entry: "Entry level: $32,000 - $58,000 USD annually",
      mid: "Mid level: $58,000 - $95,000 USD annually",
      senior: "Senior level: $160,000 - $160,000+ USD annually",
    },
  },
  
      {
    id: "cybersecurity",
    title: "Cybersecurity",
    project: "End-to-end cybersecurity implementation",
    description:
      "Build cybersecurity skills from zero experience to job-ready proficiency. Aligned with ISC2 Certified in Cybersecurity (CC) standards and includes practical vulnerability assessment and incident response training.",
    heroImage: "/images/cyber-1.png",
    secondaryImage: "/images/cyber-2.png",
    price: 299,
    tools: [
      { name: "Make", icon: "/images/tools/cybertool-1.png" },
      { name: "OpenAI", icon: "/images/tools/cybertool-2.png" },
      { name: "Zapier", icon: "/images/tools/cybertool-3.png" },
      { name: "MidJourney", icon: "/images/tools/cybertool-4.png" },
      { name: "Gemini", icon: "/images/tools/cybertool-5.png" },
      { name: "DALL-E", icon: "/images/tools/cybertool-6.png" },
    ],
    whatYouWillLearn: [
      "Network security and vulnerability assessment",
      "Incident response and threat detection",
      "Security frameworks and compliance (NIST, ISO, CIS)",
      "Ethical hacking and penetration testing",
      "Risk assessment and security auditing",
    ],
    keyBenefits: [
      { title: "Critical Industry Need:", text: "Cybersecurity skills shortage creates abundant opportunities" },
      { title: "Recession-Proof Career:", text: "Security remains essential regardless of economic conditions" },
      { title: "Ethical Impact:", text: "Protect organizations and individuals from cyber threats" },
      { title: "Continuous Learning:", text: "Dynamic field with constant evolution and growth opportunities" },
    ],
    careerPath: {
      entry: ["SOC Analyst", "Security Analyst"],
      mid: ["Cybersecurity Engineer", "Incident Response Specialist"],
      advanced: ["Security Architect", "CISO"],
      specialized: ["Penetration Tester", "Forensics Analyst", "Compliance Manager"],
    },
    industries: [
      { title: "Financial Services:", text: "Banks, fintech companies, payment processors" },
      { title: "Healthcare:", text: "Hospitals, pharmaceutical companies, medical devices" },
      { title: "Defense:", text: "Defense, law enforcement, public sector" },
      { title: "Technology", text: "Software companies, cloud providers, tech startups" },
      { title: "Energy and Utilities:", text: "Power grids, oil & gas, infrastructure" },
      { title: "Consulting:", text: "Security firms, risk assessment companies" },
    ],
    salary: {
      entry: "Entry level: $30,000 - $55,000 USD annually",
      mid: "Mid level: $50,000 - $85,000 USD annually",
      senior: "Senior level: $85,000 - $150,000+ USD annually",
    },
  },

    {
    id: "DevOps",
    title: "Devops",
    project: "Complete DevOps pipeline with automated testing, deployment, and monitoring",
    description:
      "Master DevOps practices and tools for continuous integration, deployment, and infrastructure management. Learn to bridge development and operations following industry best practices.",
    heroImage: "/images/devops-1.png",
    secondaryImage: "/images/devops-2.png",
    price: 299,
    tools: [
      { name: "Make", icon: "/images/tools/devopstool-1.png" },
      { name: "OpenAI", icon: "/images/tools/devopstool2.png" },
      { name: "Zapier", icon: "/images/tools/devopstool-3.png" },
      { name: "MidJourney", icon: "/images/tools/devopstool-4.png" },
      { name: "Gemini", icon: "/images/tools/devopstool-5" },
      { name: "DALL-E", icon: "/images/tools/devopstool-6.png" },
      { name: "Notion", icon: "/images/tools/devopstool-7.png" },
      { name: "Synthesia", icon: "/images/tools/devopstool-8.png" },
      { name: "Synthesia", icon: "/images/tools/devopstool-9.png" },
      { name: "Synthesia", icon: "/images/tools/devopstool-10.png" },
    ],
    whatYouWillLearn: [
      "CI/CD pipeline design and implementation",
      "Infrastructure as Code and automation",
      "Container orchestration with Kubernetes",
      "Monitoring, logging, and observability",
      "DevOps culture and collaboration practices",
    ],
    keyBenefits: [
      { title: "Bridge Technical Gap", text: "Connect development and operations teams" },
      { title: "Automation Mastery", text: "Eliminate manual processes and reduce errors" },
      { title: "Faster Delivery", text: "Enable rapid, reliable software releases" },
      { title: "System Reliability", text: "Build robust, scalable, and monitored systems" },
    ],
    careerPath: {
      entry: ["Junior DevOps Engineer", "Build and Release Engineer"],
      mid: ["Senior DevOps Engineer", "Site Reliability Engineer (SRE)"],
      advanced: ["DevOps Architect", "Platform Engineering Manager"],
      specialized: ["Cloud DevOps Specialist", "Security DevOps Engineer"],
    },
    industries: [
      { title: "Content Creation", text: "Marketing agencies, media companies, publishing" },
      { title: "Customer Service", text: "Chatbot development, automated support systems" },
      { title: "Education", text: "AI tutors, automated grading, personalized learning" },
      { title: "Business Process", text: "Automation consultancies, enterprise solutions" },
      { title: "E-commerce", text: "Product descriptions, customer interactions, inventory management" },
      { title: "Healthcare", text: "Medical documentation, patient communication, research assistance" },
    ],
    salary: {
      entry: "Entry level: $30,000 - $55,000 USD annually",
      mid: "Mid level: $55,000 - $90,000 USD annually",
      senior: "Senior level: $150,000+ USD annually",
    },
  },
  
  {
    id: "Web3-and-Blockchain-development",
    title: "Web3 and Blockchain development",
    project: "Build and deploy a functional Web3 dApp",
    description:
      "Master blockchain fundamentals and build decentralized applications from scratch. Learn Solidity programming, smart contracts, and Web3 integration following ConsenSys and Ethereum Foundation standards.",
    heroImage: "/images/web3-1.png",
    secondaryImage: "/images/we3-2.png",
    price: 299,
    tools: [
      { name: "Make", icon: "/images/tools/web3tool-1.png" },
      { name: "OpenAI", icon: "/images/tools/web3-tool-2.png" },
      { name: "Zapier", icon: "/images/tools/web3tool-3.png" },
      { name: "MidJourney", icon: "/images/tools/web3tool-4.png" },
      { name: "Gemini", icon: "/images/tools/web3tools-5.png" },
      { name: "DALL-E", icon: "/images/tools/web3tool-6.png" },
      { name: "Notion", icon: "/images/tools/web3tool-7.png" },
    ],
    whatYouWillLearn: [
      "Smart contract development and deployment",
      "NFT creation and IPFS integration",
      "Building decentralized applications (dApps)",
      "Blockchain security best practices",
      "DAO governance and tokenomics",
    ],
    keyBenefits: [
      { title: "Cutting-Edge Technology", text: "Master the most innovative technology reshaping finance and digital ownership" },
      { title: "High-Demand Skills:", text: "Blockchain developers are among the most sought-after professionals globally" },
      { title: "Decentralized Future:", text: "Position yourself at the forefront of Web3 revolution" },
      { title: "Premium Earning Potential:", text: "Command top-tier salaries in emerging technology sector" },
    ],
    careerPath: {
      entry: ["Junior Blockchain Developer", "Smart Contract Developer"],
      mid: ["Senior Blockchain Engineer", "dApp Architect"],
      advanced: ["Lead Blockchain Architect", "Crypto Technical Consultant"],
      specialized: ["DeFi Developer", "NFT Platform Engineer", "Tokenomics Designer"],
    },
    industries: [
      { title: "Financial Services:", text: "DeFi protocols, cryptocurrency exchanges, digital banking" },
      { title: "Gaming:", text: "Play-to-earn games, NFT gaming platforms, virtual worlds" },
      { title: "Supply Chain:", text: "Traceability solutions, logistics transparency" },
      { title: "Real Estate:", text: "Property tokenization, fractional ownership" },
      { title: "Healthcare:", text: "Secure patient data, pharmaceutical tracking" },
      { title: "Government:", text: "Voting systems, identity verification, public records" },
    ],
    salary: {
      entry: "Entry level: $35,000 - $65,000 USD annually",
      mid: "Mid level: $65,000 - $120,000 USD annually",
      senior: "Senior level:$120,000 - $150,000+ USD annually",
    },
  },

  {
    id: "ui-ux",
    title: "UI/UX (Product Design) Design",
    project: "Full product UI/UX design with case study",
    description:
      "Design user-centered digital experiences. Master design principles, user research, and create responsive interfaces with industry-standard tools and accessibility guidelines.",
    heroImage: "/images/ui.png",
    secondaryImage: "/images/ui-2.png",
    price: 299,
    tools: [
      { name: "Make", icon: "/images/tools/uitool-1.png" },
      { name: "OpenAI", icon: "/images/tools/uitool-2.png" },
      { name: "Zapier", icon: "/images/tools/uitool-3.png" },
      { name: "MidJourney", icon: "/images/tools/uitool-4.png" },
      { name: "Gemini", icon: "/images/tools/uitool-5.png" },
      { name: "DALL-E", icon: "/images/tools/uitool-6.png" },
    ],
    whatYouWillLearn: [
      "Design foundations and color theory",
      "User research and wireframing techniques",
      "Interactive prototyping and user testing",
      "Design systems and component libraries",
      "Accessibility and inclusive design practices",
    ],
    keyBenefits: [
      { title: "Creative Problem-Solving:", text: "Design solutions that improve user experiences" },
      { title: "High Visual Impact:", text: "Create interfaces that delight and engage users" },
      { title: "User Advocacy:", text: "Champion user needs in product development" },
      { title: "Design Thinking:", text: "Apply systematic approach to complex challenges" },
    ],
    careerPath: {
      entry: ["Junior UX Designer", "Visual Designer"],
      mid: ["Senior UX Designer", "Product Designer"],
      advanced: ["Design Lead", "UX Director"],
      specialized: ["Interaction Designer", "UX Researcher", "Design Systems Lead"],
    },
    industries: [
      { title: "Technology:", text: "Software interfaces, mobile apps, web platforms" },
      { title: "E-commerce:", text: "Shopping experiences, checkout flows, product catalogs" },
      { title: "Healthcare:", text: "Medical software, patient portals, health apps" },
      { title: "Finance:", text: "Banking interfaces, investment platforms, payment systems" },
      { title: "Education:", text: "Learning platforms, educational tools, student portals" },
      { title: "Gaming:", text: "Game interfaces, user experience flows, interactive design" },
    ],
    salary: {
      entry: "Entry level: $26,000 - $45,000 USD annually",
      mid: "Mid level: $45,000 - $75,000 USD annually",
      senior: "Senior level:$75,000 - $120,000+ USD annually",
    },
  },

  {
    id: "product-management",
    title: "Product Management",
    project: "Complete product strategy and pitch presentation",
    description:
      "Lead product development from ideation to launch. Master user research, roadmapping, and cross-functional team management following Product School and Pragmatic Institute frameworks.",
    heroImage: "/images/product-1.png",
    secondaryImage: "/images/product-2.png",
    price: 299,
    tools: [
      { name: "Make", icon: "/images/tools/producttool-1.png" },
      { name: "OpenAI", icon: "/images/tools/producttool-2.png" },
      { name: "Zapier", icon: "/images/tools/producttool-3.png" },
      { name: "MidJourney", icon: "/images/tools/producttool-4.png" },
      { name: "Gemini", icon: "/images/tools/producttool-5.png" },
      { name: "DALL-E", icon: "/images/tools/producttool-6.png" },
    ],
    whatYouWillLearn: [
      "Product strategy and roadmap development",
      "User research and persona creation",
      "Agile methodologies and team leadership",
      "A/B testing and metrics analysis",
      "Go-to-market strategy and launch planning",
    ],
    keyBenefits: [
      { title: "Strategic Leadership:", text: "Shape product direction and business outcomes" },
      { title: "Cross-Functional Impact:", text: "Work with engineering, design, marketing, and sales" },
      { title: "Business Acumen:", text: "Develop deep understanding of market dynamics" },
      { title: "High-Growth Potential:", text: "Product management is a pathway to executive roles" },
    ],
    careerPath: {
      entry: ["Associate Product Manager", "Product Analyst"],
      mid: ["Senior Product Manager", "Product Owner"],
      advanced: ["Head of Product", "VP of Product Strategy"],
      specialized: ["Technical Product Manager", "Growth Product Manager"],
    },
    industries: [
      { title: "Technology:", text: "Software products, mobile apps, platform development" },
      { title: "E-commerce:", text: "Marketplace features, shopping experiences, logistics tools" },
      { title: "Fintech:", text: "Payment systems, banking products, investment platforms" },
      { title: "SaaS:", text: "Business software, productivity tools, enterprise solutions" },
      { title: "Education:", text: "Learning platforms, educational tools, student portals" },
      { title: "Healthcare:", text: "Medical devices, health apps, telemedicine platforms" },
    ],
    salary: {
      entry: "Entry level: $35,000 - $60,000 USD annually",
      mid: "Mid level: $60,000 - $100,000 USD annually",
      senior: "Senior level:$100,000 - $180,000+ USD annually",
    },
  },

  {
    id: "Digital-marketing",
    title: "Digital marketing",
    project: "Complete digital marketing campaign for real/fictional brand",
    description:
      "Master digital marketing from SEO to paid advertising. Build complete marketing campaigns and measure success with analytics following Google Digital Garage and HubSpot Academy standards.",
    heroImage: "/images/digital-1.png",
    secondaryImage: "/images/digital-2.png",
    price: 299,
    tools: [
      { name: "Make", icon: "/images/tools/marketingtool-1.png" },
      { name: "OpenAI", icon: "/images/tools/marketingtool-2.png" },
      { name: "Zapier", icon: "/images/tools/marketingtool-3.png" },
      { name: "MidJourney", icon: "/images/tools/marketingtool-4.png" },
      { name: "Gemini", icon: "/images/tools/marketingtool-5.png" },
    ],
    whatYouWillLearn: [
      "SEO optimization and content marketing",
      "Social media and paid advertising campaigns",
      "Email marketing automation and funnels",
      "Analytics and conversion optimization",
      "E-commerce marketing strategies",
    ],
    keyBenefits: [
      { title: "Business Impact:", text: "Directly drive revenue and growth for organizations" },
      { title: "Versatile Skills:", text: "Apply knowledge across any industry or business size" },
      { title: "Data-Driven Results:", text: "Measure and optimize campaign performance" },
      { title: "Entrepreneurial Path:", text: "Start your own agency or consultancy" },
    ],
    careerPath: {
      entry: ["Digital Marketing Assistant", "SEO Specialist"],
      mid: ["Digital Marketing Manager", "Growth Marketer"],
      advanced: ["Marketing Director", "Chief Marketing Officer"],
      specialized: ["PPC Specialist", "Content Marketing Manager", "Social Media Manager"],
    },
    industries: [
      { title: "Technology:", text: "SaaS marketing, app promotion, lead generation" },
      { title: "E-commerce:", text: "Online retail, marketplace optimization, conversion rate optimization" },
      { title: "Fintech:", text: "Fintech marketing, investment services, insurance" },
      { title: "SaaS:", text: "Business software, productivity tools, enterprise solutions" },
      { title: "Education:", text: "School enrollment, course promotion, e-learning marketing" },
      { title: "Healthcare:", text: "Medical practice marketing, pharmaceutical promotion" },
      { title: "Real Estate:", text: "Real Estate: Property marketing, lead generation, brand building"},
    ],
    salary: {
      entry: "Entry level: $22,000 - $38,000 USD annually",
      mid: "Mid level: $38,000 - $65,000 USD annually",
      senior: "Senior level:$65,000 - $110,000+ USD annually",
    },
  },

  {
    id: "Data-Analysis",
    title: "Data Analysis",
    duration: "16 Weeks (4 Months)",
    level: "Beginner to Professional",
    description:
      "Transform raw data into actionable insights. Master data analysis, visualization, and predictive modeling with Python and Power BI following Microsoft and Google certification standards.",
    heroImage: "/images/data-1.png",
    secondaryImage: "/images/data-2.png",
    price: 299,
    tools: [
      { name: "Python/Pandas", icon: "/images/tools/analysistool-1.png" },
      { name: "Power BI", icon: "/images/tools/analysistool-2.png" },
      { name: "Excel", icon: "/images/tools/analysistool-3.png" },
      { name: "SQL/MySQL", icon: "/images/tools/analysistool-4.png" },
      { name: "Matplotlib", icon: "/images/tools/analysistool-5.png" },
      { name: "scikit-learn", icon: "/images/tools/analysistool-6.png" },
      { name: "scikit-learn", icon: "/images/tools/analysistool-7.png" }
    ],
    whatYouWillLearn: [
      "Data cleaning and statistical analysis",
      "SQL querying and database management",
      "Interactive dashboards and visualizations",
      "Predictive modeling and regression",
      "Business intelligence and reporting"
    ],
    project: "Business case analysis with data-driven recommendations",
    keyBenefits: [
      { title: "Decision-Making Power:", text: "Influence business strategy with data insights" },
      { title: "Cross-Industry Demand:", text: "Every sector needs data analysis capabilities" },
      { title: "Analytical Thinking:", text: "Develop critical problem-solving skills" },
      { title: "Foundation for AI/ML:", text: "Gateway to advanced data science careers" }
    ],
    careerPath: {
      entry: ["Junior Data Analyst", "Business Intelligence Analyst"],
      mid: ["Senior Data Analyst", "Data Scientist"],
      advanced: ["Lead Data Scientist", "Head of Analytics"],
      specialized: ["Business Intelligence Developer", "Quantitative Analyst"]
    },
    industries: [
      { title: "Finance:", text: "Risk analysis, fraud detection, algorithmic trading" },
      { title: "Healthcare:", text: "Patient outcomes, drug research, operational efficiency" },
      { title: "Retail:", text: "Customer behavior, inventory optimization, pricing strategies" },
      { title: "Technology:", text: "User analytics, product optimization, growth metrics" },
      { title: "Manufacturing:", text: "Quality control, supply chain optimization, predictive maintenance" },
      { title: "Government:", text: "Policy analysis, public health data, economic research" }
    ],
    salary: {
      entry: "Entry Level: $25,000 - $42,000 USD annually",
      mid: "Mid Level: $42,000 - $75,000 USD annually",
      senior: "Senior Level: $75,000 - $125,000+ USD annually"
    }
  },

  {
    id: "Video-Editing",
    title: "Video Editing & Content Creation",
    duration: "16 Weeks (4 Months)",
    level: "Beginner to Professional",
    description:
      "Master professional video editing from storytelling to final export. Create engaging content for social media, commercials, and documentaries following Adobe Certified Professional standards.",
    heroImage: "/images/video-1.png",
    secondaryImage: "/images/video-2.png",
    price: 299,
    tools: [
      { name: "Python/Pandas", icon: "/images/tools/videotool-1.png" },
      { name: "Power BI", icon: "/images/tools/videotool-2.png" },
      { name: "Excel", icon: "/images/tools/videotool-3.png" },
      { name: "SQL/MySQL", icon: "/images/tools/videotool-4.png" },
      { name: "Matplotlib", icon: "/images/tools/videotool-5.png" },
      { name: "scikit-learn", icon: "/images/tools/videotool-6.png" }
    ],
    whatYouWillLearn: [
      "Professional editing techniques and transitions",
      "Color grading and audio design",
      "Motion graphics and green screen effects",
      "Social media optimization and delivery",
      "Client workflow management"
    ],
    project: "Professional 2–5 minute video showcasing all skills",
    keyBenefits: [
      { title: "Creative Expression:", text: "Transform ideas into compelling visual narratives" },
      { title: "Growing Market:", text: "Video content dominates digital marketing and entertainment" },
      { title: "Flexible Work Options:", text: "Freelance, remote, or in-house opportunities" },
      { title: "Multiple Revenue Streams:", text: "Corporate clients, social media, personal projects" }
    ],
    careerPath: {
      entry: ["Video Editor", "Content Creator"],
      mid: ["Senior Video Producer", "Creative Director"],
      advanced: ["Media Production Manager", "Creative Agency Owner"],
      specialized: ["Motion Graphics Artist", "Social Media Video Specialist"]
    },
    industries: [
      { title: "Media & Entertainment:", text: "TV stations, streaming platforms, production houses" },
      { title: "Digital Marketing:", text: "Advertising agencies, social media companies" },
      { title: "Corporate:", text: "Internal communications, training videos, product demos" },
      { title: "Education:", text: "E-learning platforms, educational content creation" },
      { title: "Events:", text: "Wedding videography, corporate events, conferences" },
      { title: "Freelance:", text: "YouTube creators, personal branding, small business content" }
    ],
    salary: {
      entry: "Entry Level: $20,000 - $35,000 USD annually",
      mid: "Mid Level: $35,000 - $60,000 USD annually",
      senior: "Senior Level: $60,000 - $100,000+ USD annually"
    }
  },

  {
    id: "Frontend-Development",
    title: "Frontend Development",
    duration: "16 Weeks (4 Months)",
    level: "Beginner to Job-Ready",
    description:
      "Build modern, responsive web applications with JavaScript and React. Master frontend development from basic programming to full-stack integration following Google, Microsoft, and Meta standards.",
    heroImage: "/images/front-1.png",
    secondaryImage: "/images/front-2.png",
    price: 299,
    tools: [
      { name: "JavaScript ES6+" , icon: "/images/tools/frontendtool-1.png"},
      { name: "React", icon: "/images/tools/frontendtool-2.png" },
      { name: "HTML5/CSS3", icon: "/images/tools/frontendtool-3.png" },
      { name: "Git/GitHub", icon: "/images/tools/frontendtool-4.png" },
      { name: "VS Code" , icon: "/images/tools/frontendtool-5.png"},
      { name: "Netlify/Vercel", icon: "/images/tools/frontendtool-6.png" },
      { name: "Netlify/Vercel", icon: "/images/tools/frontendtool-7.png" },
      { name: "Netlify/Vercel", icon: "/images/tools/frontendtool-8.png" }
    ],
    whatYouWillLearn: [
      "Modern JavaScript and React development",
      "Responsive design with CSS Grid/Flexbox",
      "API integration and state management",
      "Testing, deployment, and team collaboration",
      "Professional portfolio development"
    ],
    project: "Collaborative frontend application deployed live",
    keyBenefits: [
      { title: "High Demand:", text: "Frontend developers needed across all industries" },
      { title: "Creative & Technical:", text: "Blend aesthetic design with programming logic" },
      { title: "Remote-Friendly:", text: "Easily work with global teams and clients" },
      { title: "Foundation for Growth:", text: "Gateway to full-stack and specialized development" }
    ],
    careerPath: {
      entry: ["Junior Frontend Developer", "UI Developer"],
      mid: ["Senior Frontend Engineer", "React Specialist"],
      advanced: ["Frontend Architect", "Technical Lead"],
      specialized: ["React Native Developer", "Frontend Performance Specialist"]
    },
    industries: [
      { title: "Technology:", text: "Software companies, tech startups, SaaS platforms" },
      { title: "E-commerce:", text: "Online retailers, marketplace platforms" },
      { title: "Finance:", text: "Fintech apps, banking portals, trading platforms" },
      { title: "Healthcare:", text: "Medical portals, telemedicine platforms" },
      { title: "Education:", text: "E-learning platforms, educational tools" },
      { title: "Media:", text: "News websites, streaming services, content platforms" }
    ],
    salary: {
      entry: "Entry Level: $25,000 - $45,000 USD annually",
      mid: "Mid Level: $45,000 - $80,000 USD annually",
      senior: "Senior Level: $80,000 - $130,000+ USD annually"
    }
  },

  {
    id: "Backend-Development",
    title: "Backend Development",
    duration: "16 Weeks (4 Months)",
    level: "Beginner to Professional",
    description:
      "Master server-side development with PHP and Laravel. Build secure, scalable backend systems and REST APIs following PSR standards and OWASP security practices.",
    heroImage: "/images/back-1.png",
    secondaryImage: "/images/back-2.png",
    price: 299,
    tools: [
      { name: "PHP 8+", icon: "/images/tools/frontendtool-6.png"},
      { name: "Laravel", icon: "/images/tools/frontendtool-6.png" },
      { name: "MySQL", icon: "/images/tools/frontendtool-6.png" },
      { name: "Composer", icon: "/images/tools/frontendtool-6.png" },
      { name: "Postman", icon: "/images/tools/frontendtool-6.png" },
      { name: "Laravel Forge", icon: "/images/tools/frontendtool-6.png" },
      { name: "PHPUnit", icon: "/images/tools/frontendtool-6.png" }
    ],
    whatYouWillLearn: [
      "Laravel framework and Eloquent ORM",
      "RESTful API development and authentication",
      "Database design and security practices",
      "Testing and code quality assurance",
      "Team collaboration with Git workflows"
    ],
    project: "Production-ready Laravel application with API",
    keyBenefits: [
      { title: "Server-Side Mastery:", text: "Control application logic and data management" },
      { title: "Scalability Focus:", text: "Build systems that handle enterprise-level traffic" },
      { title: "Security Expertise:", text: "Master cybersecurity best practices in development" },
      { title: "API Development:", text: "Create services that power mobile and web applications" }
    ],
    careerPath: {
      entry: ["Junior PHP Developer", "API Developer"],
      mid: ["Senior Laravel Developer", "Backend Engineer"],
      advanced: ["Solutions Architect", "Technical Team Lead"],
      specialized: ["Database Administrator", "API Architect", "Backend Security Specialist"]
    },
    industries: [
      { title: "E-commerce:", text: "Online stores, payment systems, inventory management" },
      { title: "Enterprise Software:", text: "CRM systems, ERP solutions, business tools" },
      { title: "Financial Services:", text: "Banking systems, payment processors, fintech APIs" },
      { title: "Healthcare:", text: "Patient management systems, medical records, telemedicine" },
      { title: "SaaS Platforms:", text: "Software-as-a-service applications, subscription systems" },
      { title: "Government:", text: "Public service platforms, citizen portals, data management" }
    ],
    salary: {
      entry: "Entry Level: $28,000 - $50,000 USD annually",
      mid: "Mid Level: $50,000 - $85,000 USD annually",
      senior: "Senior Level: $85,000 - $140,000+ USD annually"
    }
  },

  {
    id: "Leadership-Training",
    title: "Leadership Training (Soft Skill Development)",
    duration: "16 Weeks (4 Months)",
    level: "All Levels",
    description:
      "Develop essential workplace skills for career success. Master communication, leadership, and emotional intelligence following the World Economic Forum 21st Century Skills framework.",
    heroImage: "/images/leadership-1.png",
    secondaryImage: "/images/leadership-2.png",
    price: 299,
    tools: [
      { name: "Communication", icon: "/images/tools/frontendtool-6.png" },
      { name: "Leadership", icon: "/images/tools/frontendtool-6.png" },
      { name: "Emotional Intelligence", icon: "/images/tools/frontendtool-6.png" },
      { name: "Time Management", icon: "/images/tools/frontendtool-6.png" },
      { name: "Teamwork", icon: "/images/tools/frontendtool-6.png" },
      { name: "Public Speaking", icon: "/images/tools/frontendtool-6.png" }
    ],
    whatYouWillLearn: [
      "Effective communication and active listening",
      "Leadership and cross-functional collaboration",
      "Conflict resolution and critical thinking",
      "Career planning and goal setting",
      "Professional workplace etiquette"
    ],
    project: "Leadership workshop facilitation and career plan",
    keyBenefits: [
      { title: "Universal Application:", text: "Enhance performance in any role or industry" },
      { title: "Leadership Preparation:", text: "Develop skills for management and executive positions" },
      { title: "Career Acceleration:", text: "Stand out in interviews and workplace interactions" },
      { title: "Personal Growth:", text: "Build confidence and professional presence" }
    ],
    careerPath: {
      entry: ["Team Lead", "Department Manager", "Executive Positions"],
      mid: ["Leadership Coach", "Organizational Development Consultant"],
      advanced: ["Business Leader", "Team Builder", "Stakeholder Manager"],
      specialized: ["Solutions Architect", "Technical Team Lead"]
    },
    industries: [
      { title: "All Industries:", text: "Universal skills applicable across every sector" },
      { title: "Leadership Roles:", text: "Management positions, team leadership" },
      { title: "Client-Facing Positions:", text: "Sales, customer success, account management" },
      { title: "Project Management:", text: "Cross-functional team coordination" },
      { title: "Consulting:", text: "Change management, organizational development" },
      { title: "Training & Development:", text: "Corporate training, professional development" }
    ],
    salary: {
      entry: "Entry Level: $28,000 - $50,000 USD annually",
      mid: "₦5M–₦20M+ annually depending on level",
      senior: "₦15M–₦50M+ annually"
    }
  }

  // add more courses here
];
