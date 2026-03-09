export interface InterviewQuestion {
  id: string;
  question: string;
  category: "behavioral" | "technical" | "system-design" | "role-specific";
  tags: string[]; // lowercase keyword tags for matching
  tip: string; // brief answering tip/framework
}

export const categoryLabels: Record<InterviewQuestion["category"], string> = {
  behavioral: "Behavioral",
  technical: "Technical",
  "system-design": "System Design",
  "role-specific": "Role-Specific",
};

export const questionBank: InterviewQuestion[] = [
  // ── Behavioral (15) ────────────────────────────────────────────────
  {
    id: "b1",
    question: "Tell me about a time you disagreed with a team member. How did you handle it?",
    category: "behavioral",
    tags: ["conflict", "teamwork", "communication"],
    tip: "Use the STAR method: Situation, Task, Action, Result. Focus on how you listened, found common ground, and reached a productive outcome.",
  },
  {
    id: "b2",
    question: "Describe a project where you had to learn something new quickly.",
    category: "behavioral",
    tags: ["adaptability", "growth", "learning"],
    tip: "Highlight the specific skill gap, the resources you used, and the measurable impact of ramping up fast.",
  },
  {
    id: "b3",
    question: "How do you prioritize when you have multiple deadlines?",
    category: "behavioral",
    tags: ["prioritization", "time-management", "organization"],
    tip: "Describe a concrete framework you use (e.g., urgency/impact matrix) and give one real example where it worked.",
  },
  {
    id: "b4",
    question: "Tell me about a time you failed. What did you learn?",
    category: "behavioral",
    tags: ["failure", "growth", "resilience"],
    tip: "Pick a genuine failure, own the mistake honestly, then spend most of your answer on the lesson and how you applied it later.",
  },
  {
    id: "b5",
    question: "Describe a situation where you took initiative beyond your role.",
    category: "behavioral",
    tags: ["initiative", "leadership", "ownership"],
    tip: "Show you identified a gap proactively. Quantify the outcome (time saved, revenue gained, bugs prevented).",
  },
  {
    id: "b6",
    question: "Give an example of how you handled a difficult stakeholder.",
    category: "behavioral",
    tags: ["communication", "stakeholder", "conflict"],
    tip: "Emphasize empathy: understanding their concerns first, then aligning on shared goals before proposing solutions.",
  },
  {
    id: "b7",
    question: "Tell me about a time you mentored or helped a colleague grow.",
    category: "behavioral",
    tags: ["leadership", "teamwork", "mentoring"],
    tip: "Describe the coaching approach you took and how the colleague's skills or output measurably improved.",
  },
  {
    id: "b8",
    question: "Describe a situation where you had to work under pressure.",
    category: "behavioral",
    tags: ["pressure", "resilience", "problem-solving"],
    tip: "Show you stayed calm, broke the problem into steps, communicated status updates, and delivered on time.",
  },
  {
    id: "b9",
    question: "How do you handle receiving critical feedback?",
    category: "behavioral",
    tags: ["growth", "communication", "feedback"],
    tip: "Give a real example where feedback stung but you acted on it. Interviewers want to see coachability.",
  },
  {
    id: "b10",
    question: "Tell me about a cross-functional project you led or contributed to.",
    category: "behavioral",
    tags: ["leadership", "teamwork", "cross-functional"],
    tip: "Highlight how you coordinated across teams with different priorities, and the alignment techniques you used.",
  },
  {
    id: "b11",
    question: "Describe a time you had to persuade others to adopt your idea.",
    category: "behavioral",
    tags: ["communication", "influence", "leadership"],
    tip: "Explain the resistance, how you built your case with data or prototypes, and the eventual buy-in.",
  },
  {
    id: "b12",
    question: "Tell me about a time you had to make a decision with incomplete information.",
    category: "behavioral",
    tags: ["problem-solving", "decision-making", "ambiguity"],
    tip: "Show your thought process: what data you gathered, what assumptions you made, and how you mitigated risk.",
  },
  {
    id: "b13",
    question: "Give an example of when you improved a process or workflow.",
    category: "behavioral",
    tags: ["initiative", "problem-solving", "efficiency"],
    tip: "Quantify the before/after: time saved, error reduction, cost decrease. Show you measured the impact.",
  },
  {
    id: "b14",
    question: "Describe a time you had to deliver bad news to a manager or client.",
    category: "behavioral",
    tags: ["communication", "integrity", "stakeholder"],
    tip: "Show transparency and preparation: how you framed the issue, presented alternatives, and rebuilt trust.",
  },
  {
    id: "b15",
    question: "Tell me about a goal you set for yourself and how you achieved it.",
    category: "behavioral",
    tags: ["initiative", "growth", "goal-setting"],
    tip: "Pick a professional goal with a clear timeline. Walk through the milestones and what kept you on track.",
  },

  // ── Technical (20) ─────────────────────────────────────────────────
  {
    id: "t1",
    question: "Explain the difference between a stack and a queue. When would you use each?",
    category: "technical",
    tags: ["data-structures", "algorithms", "fundamentals"],
    tip: "Give real-world analogies (undo history for stack, task queue for queue), then mention time complexities.",
  },
  {
    id: "t2",
    question: "What is the virtual DOM in React and why does it improve performance?",
    category: "technical",
    tags: ["react", "javascript", "frontend"],
    tip: "Explain the diffing algorithm, batched updates, and reconciliation. Mention React Fiber if you can.",
  },
  {
    id: "t3",
    question: "Explain closures in JavaScript with an example.",
    category: "technical",
    tags: ["javascript", "fundamentals", "frontend"],
    tip: "Define closure as a function retaining access to its lexical scope. Show a counter factory or debounce example.",
  },
  {
    id: "t4",
    question: "What is the difference between SQL and NoSQL databases? When would you choose one over the other?",
    category: "technical",
    tags: ["sql", "database", "backend", "nosql"],
    tip: "Compare schema rigidity, scalability patterns, ACID vs. BASE, and give concrete use-case examples for each.",
  },
  {
    id: "t5",
    question: "How does Python's GIL affect multi-threaded programs?",
    category: "technical",
    tags: ["python", "concurrency", "backend"],
    tip: "Explain that the GIL serializes bytecode execution, making CPU-bound threads ineffective. Mention multiprocessing as the workaround.",
  },
  {
    id: "t6",
    question: "What is the difference between REST and GraphQL?",
    category: "technical",
    tags: ["api", "rest", "graphql", "backend"],
    tip: "Compare over-fetching/under-fetching, endpoint proliferation vs. single endpoint, caching strategies, and tooling ecosystems.",
  },
  {
    id: "t7",
    question: "Explain the event loop in Node.js.",
    category: "technical",
    tags: ["nodejs", "javascript", "backend"],
    tip: "Walk through the phases (timers, I/O, check), the microtask queue, and why blocking the loop is dangerous.",
  },
  {
    id: "t8",
    question: "What are the SOLID principles? Give a brief example of each.",
    category: "technical",
    tags: ["oop", "design-patterns", "java", "backend"],
    tip: "Keep examples short: one class or interface per principle. Interviewers want to see you can apply them, not just list them.",
  },
  {
    id: "t9",
    question: "How would you optimize a slow SQL query?",
    category: "technical",
    tags: ["sql", "database", "performance", "backend"],
    tip: "Mention EXPLAIN plans, indexing, query rewriting, avoiding SELECT *, and N+1 query detection.",
  },
  {
    id: "t10",
    question: "What is the difference between TCP and UDP?",
    category: "technical",
    tags: ["networking", "fundamentals", "backend"],
    tip: "TCP: reliable, ordered, connection-oriented. UDP: fast, connectionless, no delivery guarantee. Give use-case examples.",
  },
  {
    id: "t11",
    question: "Explain how you would write unit tests for a function that calls an external API.",
    category: "technical",
    tags: ["testing", "api", "backend", "frontend"],
    tip: "Describe mocking/stubbing the HTTP client, asserting on request parameters, and testing error/timeout paths.",
  },
  {
    id: "t12",
    question: "What is a hash map and how does it handle collisions?",
    category: "technical",
    tags: ["data-structures", "algorithms", "fundamentals"],
    tip: "Explain hashing, bucket arrays, and collision strategies (chaining vs. open addressing). Mention O(1) average lookup.",
  },
  {
    id: "t13",
    question: "Explain the CSS box model and how box-sizing affects layout.",
    category: "technical",
    tags: ["css", "html", "frontend"],
    tip: "Describe content, padding, border, margin. Explain that border-box includes padding/border in the declared width.",
  },
  {
    id: "t14",
    question: "What is TypeScript and what benefits does it provide over plain JavaScript?",
    category: "technical",
    tags: ["typescript", "javascript", "frontend"],
    tip: "Mention static type checking, better IDE support, catching bugs at compile time, and improved refactoring confidence.",
  },
  {
    id: "t15",
    question: "Explain Git branching strategies you have used in team projects.",
    category: "technical",
    tags: ["git", "devops", "collaboration"],
    tip: "Describe feature branches, main/develop flow, pull requests, and how you handled merge conflicts and code reviews.",
  },
  {
    id: "t16",
    question: "What is a Docker container and how does it differ from a virtual machine?",
    category: "technical",
    tags: ["docker", "devops", "infrastructure"],
    tip: "Containers share the host kernel (lightweight, fast), VMs include a full OS (heavier, more isolated). Mention images and layers.",
  },
  {
    id: "t17",
    question: "Explain the concept of Big O notation. Give examples of common complexities.",
    category: "technical",
    tags: ["algorithms", "data-structures", "fundamentals"],
    tip: "Define it as upper-bound growth rate. Walk through O(1), O(log n), O(n), O(n log n), O(n^2) with concrete algorithm examples.",
  },
  {
    id: "t18",
    question: "How do you handle authentication and authorization in a web application?",
    category: "technical",
    tags: ["security", "backend", "api", "frontend"],
    tip: "Distinguish authn vs. authz. Mention JWTs, session cookies, OAuth 2.0, role-based access control, and CSRF protection.",
  },
  {
    id: "t19",
    question: "What are React hooks? Explain useState and useEffect with examples.",
    category: "technical",
    tags: ["react", "javascript", "frontend", "typescript"],
    tip: "Explain the motivation (reuse stateful logic without classes). Show a counter with useState and a data-fetch with useEffect + cleanup.",
  },
  {
    id: "t20",
    question: "Explain the difference between Kubernetes Pods, Services, and Deployments.",
    category: "technical",
    tags: ["kubernetes", "devops", "infrastructure", "docker"],
    tip: "Pod = smallest deployable unit. Service = stable network endpoint. Deployment = declarative rollout/scaling. Keep it concise.",
  },

  // ── System Design (10) ─────────────────────────────────────────────
  {
    id: "sd1",
    question: "Design a URL shortener like bit.ly.",
    category: "system-design",
    tags: ["system-design", "scalability", "database", "backend"],
    tip: "Cover hashing strategy, base62 encoding, read-heavy cache layer, analytics pipeline, and collision handling.",
  },
  {
    id: "sd2",
    question: "Design a notification system (email, SMS, push).",
    category: "system-design",
    tags: ["system-design", "distributed-systems", "microservices", "backend"],
    tip: "Discuss message queue (Kafka/SQS), priority lanes, retry/backoff, user preferences, and delivery tracking.",
  },
  {
    id: "sd3",
    question: "Design a real-time chat application like Slack.",
    category: "system-design",
    tags: ["system-design", "scalability", "distributed-systems", "backend"],
    tip: "Cover WebSockets, presence service, message storage, search indexing, and fan-out strategies.",
  },
  {
    id: "sd4",
    question: "Design a rate limiter for an API gateway.",
    category: "system-design",
    tags: ["system-design", "backend", "infrastructure", "scalability"],
    tip: "Compare token bucket, sliding window, and leaky bucket. Discuss distributed coordination with Redis.",
  },
  {
    id: "sd5",
    question: "Design a distributed cache (like Redis or Memcached).",
    category: "system-design",
    tags: ["system-design", "caching", "distributed-systems", "infrastructure"],
    tip: "Cover consistent hashing, eviction policies (LRU/LFU), replication, and cache invalidation strategies.",
  },
  {
    id: "sd6",
    question: "Design an e-commerce product search with autocomplete.",
    category: "system-design",
    tags: ["system-design", "scalability", "database", "backend", "senior"],
    tip: "Discuss Elasticsearch/Solr, trie-based autocomplete, ranking algorithms, and result caching at the CDN edge.",
  },
  {
    id: "sd7",
    question: "Design a file storage service like Google Drive or Dropbox.",
    category: "system-design",
    tags: ["system-design", "distributed-systems", "infrastructure", "scalability"],
    tip: "Cover chunked uploads, deduplication, sync conflict resolution, metadata DB, and CDN distribution.",
  },
  {
    id: "sd8",
    question: "Design a social media news feed (like Twitter or Instagram).",
    category: "system-design",
    tags: ["system-design", "scalability", "caching", "backend", "senior"],
    tip: "Compare fan-out-on-write vs. fan-out-on-read, timeline caching, ranking signals, and celebrity problem.",
  },
  {
    id: "sd9",
    question: "Design a ride-sharing matching system like Uber.",
    category: "system-design",
    tags: ["system-design", "distributed-systems", "scalability", "backend", "staff"],
    tip: "Cover geospatial indexing, real-time location updates, matching algorithm, surge pricing, and ETA calculation.",
  },
  {
    id: "sd10",
    question: "Design a video streaming platform like YouTube.",
    category: "system-design",
    tags: ["system-design", "scalability", "infrastructure", "distributed-systems", "staff"],
    tip: "Discuss transcoding pipeline, adaptive bitrate streaming (HLS/DASH), CDN, thumbnail generation, and recommendation engine.",
  },

  // ── Role-Specific (10) ─────────────────────────────────────────────
  {
    id: "rs1",
    question: "How do you ensure accessibility (a11y) in a frontend application?",
    category: "role-specific",
    tags: ["frontend", "css", "html", "accessibility"],
    tip: "Mention semantic HTML, ARIA attributes, keyboard navigation, color contrast, screen reader testing, and automated a11y audits.",
  },
  {
    id: "rs2",
    question: "Describe your approach to building a CI/CD pipeline from scratch.",
    category: "role-specific",
    tags: ["devops", "docker", "kubernetes", "infrastructure"],
    tip: "Walk through source control triggers, build/test stages, artifact storage, deployment strategies (blue-green, canary), and rollback.",
  },
  {
    id: "rs3",
    question: "How do you design a RESTful API that is easy to version and maintain?",
    category: "role-specific",
    tags: ["backend", "api", "rest", "fullstack"],
    tip: "Cover URL versioning vs. header versioning, consistent error formats, pagination, rate limiting, and OpenAPI documentation.",
  },
  {
    id: "rs4",
    question: "How would you approach building a data pipeline for a large dataset?",
    category: "role-specific",
    tags: ["data", "backend", "sql", "infrastructure"],
    tip: "Discuss ETL vs. ELT, batch vs. streaming, data validation, idempotency, monitoring, and tools (Airflow, Spark, dbt).",
  },
  {
    id: "rs5",
    question: "How do you decide what to test manually vs. automate in a QA process?",
    category: "role-specific",
    tags: ["qa", "testing", "automation"],
    tip: "Explain the testing pyramid (unit > integration > E2E), risk-based prioritization, and when exploratory testing adds value.",
  },
  {
    id: "rs6",
    question: "Walk me through how you would plan and scope a product feature from idea to launch.",
    category: "role-specific",
    tags: ["product", "leadership", "stakeholder"],
    tip: "Cover user research, success metrics, MVP scoping, cross-team alignment, launch checklist, and post-launch measurement.",
  },
  {
    id: "rs7",
    question: "How do you handle state management in a large React or mobile application?",
    category: "role-specific",
    tags: ["frontend", "react", "mobile", "fullstack"],
    tip: "Compare local state, context, and external stores (Redux, Zustand, MobX). Discuss when each is appropriate and performance trade-offs.",
  },
  {
    id: "rs8",
    question: "Explain the differences between native, hybrid, and cross-platform mobile development.",
    category: "role-specific",
    tags: ["mobile", "ios", "android", "frontend"],
    tip: "Compare Swift/Kotlin (native) vs. React Native/Flutter (cross-platform) vs. Ionic/Cordova (hybrid). Discuss performance, dev speed, and UX trade-offs.",
  },
  {
    id: "rs9",
    question: "How do you evaluate and improve an ML model's performance in production?",
    category: "role-specific",
    tags: ["machine-learning", "ml", "data", "backend"],
    tip: "Cover metrics selection (precision/recall/F1), A/B testing, monitoring for data drift, retraining schedules, and feature stores.",
  },
  {
    id: "rs10",
    question: "Describe how you would migrate a monolithic application to microservices.",
    category: "role-specific",
    tags: ["backend", "microservices", "infrastructure", "senior", "fullstack"],
    tip: "Discuss strangler fig pattern, domain-driven design for service boundaries, shared data decomposition, and incremental rollout.",
  },
];

export function suggestQuestionsForApplication(
  requiredSkills: string[],
  preferredSkills: string[],
  roleTitle: string,
): InterviewQuestion[] {
  const tokens = new Set(
    [...requiredSkills, ...preferredSkills, ...roleTitle.split(/[\s/,.-]+/)]
      .map((s) => s.toLowerCase().replace(/[^a-z0-9+#]/g, ""))
      .filter(Boolean),
  );

  // Always include top 5 behavioral
  const behavioral = questionBank.filter((q) => q.category === "behavioral").slice(0, 5);

  // Score remaining by tag overlap
  const scored = questionBank
    .filter((q) => q.category !== "behavioral")
    .map((q) => ({
      question: q,
      score: q.tags.filter((tag) => tokens.has(tag)).length,
    }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((s) => s.question);

  // If no matches, include general technical
  if (scored.length === 0) {
    const general = questionBank
      .filter((q) => q.category === "technical")
      .slice(0, 5);
    return [...behavioral, ...general];
  }

  return [...behavioral, ...scored];
}
