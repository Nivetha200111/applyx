import type { ParsedResume, TailorResult } from "@/lib/types";

export const demoResume: ParsedResume = {
  personal: {
    name: "Jane Doe",
    email: "jane.doe@example.com",
    phone: "+1 415 555 0132",
    location: "Singapore",
    linkedin: "linkedin.com/in/jane-doe",
    github: "github.com/janedoe",
    portfolio: "janedoe.dev",
  },
  summary:
    "Product-minded software engineer with 4+ years of experience shipping user-facing platforms, workflow automation, and measurable growth experiments across B2C and SaaS products.",
  experience: [
    {
      title: "Senior Frontend Engineer",
      company: "HireFlow Labs",
      location: "Remote",
      startDate: "Jul 2023",
      endDate: "Present",
      bullets: [
        "Led redesign of the candidate dashboard in Next.js and TypeScript, improving recruiter conversion from shortlist to interview by 24%.",
        "Built reusable analytics and experimentation components that reduced launch time for new features from 10 days to 3 days.",
        "Partnered with design and growth teams to ship mobile-first experiences used by 180k monthly users across Asia-Pacific markets.",
      ],
    },
    {
      title: "Software Engineer",
      company: "TalentBridge",
      location: "Singapore",
      startDate: "Jan 2021",
      endDate: "Jun 2023",
      bullets: [
        "Developed internal tools for application screening and resume scoring, reducing manual review time by 38%.",
        "Created REST APIs and PostgreSQL-backed services to support candidate profiles, resume uploads, and workflow automations.",
        "Improved page performance across the job seeker portal, lowering median page load time from 4.1s to 2.2s on mid-range Android devices.",
      ],
    },
  ],
  education: [
    {
      degree: "B.E. Computer Science and Engineering",
      institution: "Anna University",
      year: "2020",
      gpa: "8.7/10",
      highlights: ["Department rank top 5%", "Technical symposium coordinator"],
    },
  ],
  skills: {
    technical: [
      "TypeScript",
      "React.js",
      "Next.js",
      "Node.js",
      "PostgreSQL",
      "REST APIs",
    ],
    tools: [
      "PostgreSQL",
      "Vercel",
      "Figma",
      "GitHub Actions",
      "Sentry",
    ],
    soft: ["Cross-functional collaboration", "Product thinking", "Mentoring"],
    languages: ["English", "Tamil"],
    certifications: ["Google UX Design Certificate"],
  },
  projects: [
    {
      name: "Resume Rewriter",
      description:
        "Built an internal AI-assisted resume review workflow for recruiting coordinators.",
      techStack: ["Next.js", "OpenAI", "PostgreSQL"],
      bullets: [
        "Automated resume extraction and structured scoring for more than 12,000 candidate submissions.",
        "Designed a review interface that highlighted missing keywords and experience gaps for recruiters.",
      ],
    },
  ],
  achievements: [
    "Speaker at React Chennai meetup on mobile-first performance optimization.",
  ],
};

export const demoTailorResult: TailorResult = {
  tailored_resume: {
    ...demoResume,
    summary:
      "Frontend Engineer targeting Senior Product Engineer roles with experience delivering ATS-aware candidate workflows, analytics-driven dashboards, and mobile-first performance improvements for high-volume hiring products.",
    experience: [
      {
        ...demoResume.experience[0],
        bullets: [
          "Drove redesign of a Next.js candidate dashboard aligned to recruiter workflow requirements, increasing shortlist-to-interview conversion by 24%.",
          "Built reusable analytics and experimentation modules that accelerated product launches from 10 days to 3 days across candidate lifecycle features.",
          "Partnered with product, design, and growth teams to deliver mobile-first hiring experiences for 180k monthly users across Asia-Pacific markets.",
        ],
      },
      {
        ...demoResume.experience[1],
        bullets: [
          "Built application screening and resume scoring workflows that cut manual review time by 38% for recruiter operations.",
          "Developed PostgreSQL-backed services supporting candidate profile management, document ingestion, and workflow automation.",
          "Optimized job seeker portal performance on Android devices, reducing median page load from 4.1s to 2.2s.",
        ],
      },
    ],
    skills: {
      technical: [
        "Next.js",
        "React.js",
        "TypeScript",
        "REST APIs",
        "PostgreSQL",
        "Node.js",
      ],
      tools: ["PostgreSQL", "Vercel", "Sentry", "Figma", "GitHub Actions"],
      soft: ["Cross-functional collaboration", "Product thinking", "Mentoring"],
      languages: ["English", "Tamil"],
      certifications: ["Google UX Design Certificate"],
    },
  },
  match_score_before: 61,
  match_score_after: 87,
  changes: [
    {
      type: "add",
      section: "Summary",
      description:
        "Added a tailored headline and summary that mirror the product engineering language from the target JD.",
    },
    {
      type: "rewrite",
      section: "Professional Experience",
      description:
        "Reframed dashboard and workflow bullets using recruiter workflow, candidate lifecycle, and hiring-product terminology from the JD.",
    },
    {
      type: "reorder",
      section: "Skills",
      description:
        "Moved Next.js, React.js, and TypeScript to the front because they are ATS-critical skills in the target role.",
    },
  ],
};

export const tailoredResumeCards = [
  {
    id: "flipkart-senior-product-engineer",
    company: "Flipkart",
    role: "Senior Product Engineer",
    template: "Classic",
    createdAt: "Mar 6, 2026",
    matchScore: 87,
  },
  {
    id: "freshworks-frontend-engineer",
    company: "Freshworks",
    role: "Frontend Engineer",
    template: "Modern",
    createdAt: "Mar 4, 2026",
    matchScore: 82,
  },
  {
    id: "razorpay-software-engineer",
    company: "Razorpay",
    role: "Software Engineer II",
    template: "Minimal",
    createdAt: "Mar 2, 2026",
    matchScore: 79,
  },
];

export const applicationHistory = [
  {
    company: "Flipkart",
    role: "Senior Product Engineer",
    status: "Applied",
    date: "Mar 6, 2026",
    source: "LinkedIn",
  },
  {
    company: "Freshworks",
    role: "Frontend Engineer",
    status: "Interviewing",
    date: "Mar 4, 2026",
    source: "Company site",
  },
  {
    company: "Razorpay",
    role: "Software Engineer II",
    status: "Saved",
    date: "Mar 2, 2026",
    source: "Instahyre",
  },
];

export const resumeTemplates = [
  {
    id: "classic",
    name: "Classic",
    description: "Conservative ATS-safe layout with strong hierarchy.",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Tighter spacing with contemporary typography for digital roles.",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Compact single-column layout optimized for dense experience.",
  },
];
