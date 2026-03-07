# ApplyX v2

ApplyX v2 is an India-first AI resume tailoring platform built with Next.js 14, TypeScript, Tailwind CSS, Better Auth, PostgreSQL, and S3-compatible object storage. Users upload a master resume once, paste any job description, and receive an ATS-optimized tailored resume in PDF or DOCX format.

## Stack

- Next.js 14 App Router with Server Components and Server Actions
- TypeScript in strict mode
- Tailwind CSS with local shadcn/ui-compatible components
- Better Auth for email/password and Google OAuth
- PostgreSQL for auth and application data
- S3-compatible storage for original and generated resume files
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

3. Apply the SQL in [db/schema.sql](/home/nivetha/applyx/db/schema.sql) or run the migration in [db/migrations/20260308103000_applyx_v2_init.sql](/home/nivetha/applyx/db/migrations/20260308103000_applyx_v2_init.sql) against your PostgreSQL database.

4. Start the dev server:

```bash
npm run dev
```

## Current Status

The scaffold now uses Better Auth and plain PostgreSQL for the backend foundation. Resume parsing, tailoring, generation, billing, and storage integrations build on top of that.
