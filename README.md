# ApplyX v2

ApplyX v2 is an India-first AI resume tailoring platform built with Next.js 14, TypeScript, Tailwind CSS, shadcn/ui patterns, and Supabase. Users upload a master resume once, paste any job description, and receive an ATS-optimized tailored resume in PDF or DOCX format.

## Stack

- Next.js 14 App Router with Server Components and Server Actions
- TypeScript in strict mode
- Tailwind CSS with local shadcn/ui-compatible components
- Supabase for auth, storage, and PostgreSQL
- Anthropic Claude with OpenAI fallback
- Razorpay for India-first subscriptions

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template and fill in your keys:

```bash
cp .env.local.example .env.local
```

3. Apply the SQL in [supabase/schema.sql](/home/nivetha/applyx/supabase/schema.sql) or run the migration in [supabase/migrations/20260307093000_applyx_v2_init.sql](/home/nivetha/applyx/supabase/migrations/20260307093000_applyx_v2_init.sql) against your Supabase project.

4. Start the dev server:

```bash
npm run dev
```

## Current Status

Step 1 project setup is scaffolded: route groups, shared layouts, Supabase clients, migration SQL, prompt constants, environment template, and the v2 design system foundation. Authentication, parsing, tailoring, generation, and billing flows are implemented in subsequent steps.
