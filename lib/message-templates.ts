export interface MessageTemplate {
  id: string;
  title: string;
  category: "cold-outreach" | "referral-request" | "follow-up" | "thank-you";
  channel: "email" | "linkedin";
  subject: string;
  body: string; // uses {company}, {role}, {name}, {contactName} placeholders
}

export const templateCategories = {
  "cold-outreach": "Cold Outreach",
  "referral-request": "Referral Request",
  "follow-up": "Follow-up",
  "thank-you": "Thank You",
} as const;

export function fillTemplate(
  template: MessageTemplate,
  vars: Record<string, string>,
): { subject: string; body: string } {
  let subject = template.subject;
  let body = template.body;
  for (const [key, value] of Object.entries(vars)) {
    const re = new RegExp(`\\{${key}\\}`, "g");
    subject = subject.replace(re, value);
    body = body.replace(re, value);
  }
  return { subject, body };
}

export const templates: MessageTemplate[] = [
  // ---------- Cold Outreach ----------
  {
    id: "cold-email-hiring-manager",
    title: "Cold Email to Hiring Manager",
    category: "cold-outreach",
    channel: "email",
    subject: "Interested in the {role} opening at {company}",
    body: `Hi {contactName},

I came across the {role} position at {company} and was genuinely excited — the work your team is doing aligns closely with my background and what I'm looking to do next.

I've spent the past few years building skills directly relevant to this role, and I'd love the chance to contribute to {company}. I've attached my resume for context, but I'd be happy to share more details over a quick call if you're open to it.

Thanks for your time, and I hope to hear from you.

Best,
{name}`,
  },
  {
    id: "cold-linkedin-recruiter",
    title: "Cold LinkedIn Message to Recruiter",
    category: "cold-outreach",
    channel: "linkedin",
    subject: "",
    body: `Hi {contactName}, I noticed {company} is hiring for a {role} and I'd love to be considered. My background is a strong match for what you're looking for, and I'm very interested in the team's work. Would you be open to a brief chat? Happy to share my resume. Thanks! — {name}`,
  },
  {
    id: "cold-email-team-lead",
    title: "Cold Email to Team Lead",
    category: "cold-outreach",
    channel: "email",
    subject: "Quick intro — interested in {role} at {company}",
    body: `Hi {contactName},

I hope this note finds you well. I recently saw the {role} opening on your team at {company} and wanted to reach out directly.

I've been following {company}'s work and find the problems you're tackling really compelling. My experience maps well to what the role calls for, and I'd welcome the opportunity to discuss how I could contribute.

No pressure at all — I just wanted to put myself on your radar. Thanks for reading this.

Warm regards,
{name}`,
  },

  // ---------- Referral Request ----------
  {
    id: "referral-connection",
    title: "Referral Request to a Connection",
    category: "referral-request",
    channel: "email",
    subject: "Would you be open to referring me at {company}?",
    body: `Hi {contactName},

I hope you're doing well! I'm reaching out because I saw that {company} has an opening for a {role}, and I noticed you're currently there.

I've been really interested in {company} for a while, and this role feels like a great fit for my skills and experience. Would you be comfortable submitting a referral for me? I completely understand if you'd prefer not to — no hard feelings at all.

I'm happy to send over my resume and any other details you'd need. Thanks so much for considering it.

Best,
{name}`,
  },
  {
    id: "referral-alumni",
    title: "Referral Request to Alumni",
    category: "referral-request",
    channel: "email",
    subject: "Fellow alum — asking about the {role} at {company}",
    body: `Hi {contactName},

I'm {name} — a fellow alum reaching out because I saw the {role} position at {company} and immediately thought of connecting with someone on the inside.

I've done my homework on the role and the team, and I believe my background is a strong match. I know cold emails from strangers can be a lot, so I want to be straightforward: if you'd be open to referring me or even just sharing some advice about the hiring process at {company}, I'd be incredibly grateful.

Either way, I appreciate your time and wish you all the best.

Thanks,
{name}`,
  },
  {
    id: "referral-linkedin",
    title: "Referral Request via LinkedIn",
    category: "referral-request",
    channel: "linkedin",
    subject: "",
    body: `Hi {contactName}! I hope you don't mind me reaching out — I'm {name} and I'm very interested in the {role} opening at {company}. Since you're there, I was wondering if you'd be open to referring me or pointing me to the right person on the team. Totally understand if not! Happy to share my resume if helpful. Thanks either way!`,
  },

  // ---------- Follow-up ----------
  {
    id: "followup-after-applying",
    title: "Follow-up After Applying (1 Week)",
    category: "follow-up",
    channel: "email",
    subject: "Following up — {role} application at {company}",
    body: `Hi {contactName},

I submitted my application for the {role} position at {company} about a week ago and wanted to follow up. I'm very enthusiastic about this opportunity and believe my experience makes me a strong candidate.

I understand you're likely reviewing many applications, so I appreciate your time. If there's any additional information I can provide, please don't hesitate to let me know.

Looking forward to hearing from you.

Best regards,
{name}`,
  },
  {
    id: "followup-no-response-linkedin",
    title: "Follow-up After No Response (LinkedIn)",
    category: "follow-up",
    channel: "linkedin",
    subject: "",
    body: `Hi {contactName}, just circling back on my earlier message about the {role} at {company}. I know things get busy, so no worries if the timing isn't right. Still very interested and happy to chat whenever works. Thanks! — {name}`,
  },
  {
    id: "followup-after-interview",
    title: "Follow-up After Interview (No Decision Yet)",
    category: "follow-up",
    channel: "email",
    subject: "Checking in — {role} at {company}",
    body: `Hi {contactName},

I wanted to check in on the {role} position. I really enjoyed our conversation and came away even more excited about the work at {company}.

I completely understand that decisions take time and there may be many factors at play. Whenever there's an update, I'd love to hear from you. In the meantime, please let me know if there's anything else I can provide.

Thanks again for the opportunity.

Best,
{name}`,
  },

  // ---------- Thank You ----------
  {
    id: "thankyou-phone-screen",
    title: "Thank You After Phone Screen",
    category: "thank-you",
    channel: "email",
    subject: "Thank you — {role} conversation",
    body: `Hi {contactName},

Thank you so much for taking the time to speak with me today about the {role} position at {company}. I enjoyed learning more about the team and the challenges you're working on.

Our conversation reinforced my excitement about this opportunity. The work at {company} is exactly the kind of challenge I'm looking for, and I'm confident I could make a meaningful contribution.

Please don't hesitate to reach out if you need any additional information from my end. I look forward to the next steps.

Best regards,
{name}`,
  },
  {
    id: "thankyou-onsite",
    title: "Thank You After Onsite Interview",
    category: "thank-you",
    channel: "email",
    subject: "Thank you for the {role} onsite at {company}",
    body: `Hi {contactName},

I wanted to express my sincere thanks for the opportunity to interview onsite for the {role} at {company}. Meeting the team and getting a firsthand look at the work environment was a real highlight.

I was particularly energized by the conversations around the team's current projects and future direction. It's clear that {company} is a place where I could grow and contribute, and I left more excited than ever about this role.

Thank you again for the thoughtful and well-organized interview process. I look forward to hearing from you.

Warm regards,
{name}`,
  },
  {
    id: "thankyou-linkedin",
    title: "Thank You After Interview (LinkedIn)",
    category: "thank-you",
    channel: "linkedin",
    subject: "",
    body: `Hi {contactName}, just wanted to say thanks again for taking the time to chat with me about the {role} at {company}. I really enjoyed the conversation and came away excited about the team and the work. Looking forward to what's next! — {name}`,
  },
];
