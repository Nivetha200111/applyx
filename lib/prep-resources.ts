import type { PrepResource } from "@/lib/types";

export const prepResourceCatalog: PrepResource[] = [
  // DSA
  { label: "NeetCode 150", url: "https://neetcode.io/practice", category: "dsa" },
  { label: "NeetCode Roadmap", url: "https://neetcode.io/roadmap", category: "dsa" },
  { label: "LeetCode Top 100", url: "https://leetcode.com/problem-list/top-100-liked-questions/", category: "dsa" },
  { label: "Striver's SDE Sheet", url: "https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/", category: "dsa" },
  { label: "LeetCode Patterns", url: "https://seanprashad.com/leetcode-patterns/", category: "dsa" },

  // System Design
  { label: "System Design Primer", url: "https://github.com/donnemartin/system-design-primer", category: "system-design" },
  { label: "ByteByteGo", url: "https://bytebytego.com/", category: "system-design" },
  { label: "Grokking System Design", url: "https://github.com/Jeevan-kumar-Raj/Grokking-System-Design", category: "system-design" },
  { label: "High Scalability", url: "http://highscalability.com/", category: "system-design" },

  // Behavioral
  { label: "STAR Method Guide", url: "https://www.themuse.com/advice/star-interview-method", category: "behavioral" },
  { label: "Behavioral Q&A Bank", url: "https://www.techinterviewhandbook.org/behavioral-interview/", category: "behavioral" },

  // General
  { label: "Tech Interview Handbook", url: "https://www.techinterviewhandbook.org/", category: "general" },
  { label: "Glassdoor Interview Reviews", url: "https://www.glassdoor.co.in/Interview/", category: "general" },
  { label: "AmbitionBox", url: "https://www.ambitionbox.com/", category: "general" },
  { label: "Levels.fyi", url: "https://www.levels.fyi/", category: "general" },
];

const categoryKeywords: Record<PrepResource["category"], string[]> = {
  dsa: ["algorithm", "data structure", "dsa", "leetcode", "coding", "problem solving", "competitive programming"],
  "system-design": ["system design", "distributed", "scalab", "architect", "microservice", "high availability", "cloud", "aws", "gcp", "azure"],
  behavioral: ["leadership", "team", "communication", "stakeholder", "cross-functional", "agile", "scrum", "management"],
  "company-specific": [],
  general: [],
};

export function suggestPrepResources(requiredSkills: string[]): PrepResource[] {
  const skillsLower = requiredSkills.map((s) => s.toLowerCase()).join(" ");
  const matched = new Set<PrepResource["category"]>();

  for (const [category, keywords] of Object.entries(categoryKeywords) as Array<[PrepResource["category"], string[]]>) {
    for (const kw of keywords) {
      if (skillsLower.includes(kw)) {
        matched.add(category);
        break;
      }
    }
  }

  // Always include general
  matched.add("general");

  return prepResourceCatalog.filter((r) => matched.has(r.category));
}

export const prepCategoryLabels: Record<PrepResource["category"], string> = {
  dsa: "DSA & Coding",
  "system-design": "System Design",
  behavioral: "Behavioral",
  "company-specific": "Company-Specific",
  general: "General",
};
