# ApplyX v2

ApplyX v2 is an India-first AI resume tailoring platform built with Next.js 14, TypeScript, Tailwind CSS, and a public demo dashboard. Users upload a master resume once, paste any job description, and receive an ATS-optimized tailored resume in PDF or DOCX format.

## Stack

- Next.js 14 App Router with Server Components and Server Actions
- TypeScript in strict mode
- Tailwind CSS with local shadcn/ui-compatible components
- Public demo mode with sample resume and tailoring data
- S3-compatible storage for original and generated resume files
- Anthropic Claude with OpenAI fallback
- Razorpay for India-first subscriptions

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template if you want to prepare future integrations:

```bash
cp .env.local.example .env.local
```

3. Start the dev server:

```bash
npm run dev
```

## Current Status

The current build is a public demo with auth removed. Resume parsing, tailoring, generation, billing, storage, and persistence still need to be wired behind the current sample-data experience.
