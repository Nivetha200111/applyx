# ApplyX v2

ApplyX v2 is an India-first AI resume tailoring platform built with Next.js 14, TypeScript, Tailwind CSS, PostgreSQL, Anthropic, OpenAI fallback, and Razorpay. Users create an account, upload one master resume, paste any job description, and receive an ATS-optimized tailored resume in PDF or DOCX format.

## Stack

- Next.js 14 App Router with Server Components and Server Actions
- TypeScript in strict mode
- Tailwind CSS with local shadcn/ui-compatible components
- PostgreSQL-backed auth, session, resume, tailoring, usage, and payment records
- Provider-neutral PostgreSQL schema targeting AWS RDS or Azure Database for PostgreSQL
- Anthropic Claude with OpenAI fallback
- Razorpay for India-first subscriptions

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template:

```bash
cp .env.local.example .env.local
```

3. Point `DATABASE_URL` at AWS RDS PostgreSQL.
   Azure Database for PostgreSQL is also compatible. Cloudflare D1 is not used here
   because it is SQLite-based instead of PostgreSQL.

4. Apply the schema:

```bash
psql "$DATABASE_URL" -f db/schema.sql
```

If you previously applied an older local schema, run:

```bash
psql "$DATABASE_URL" -f db/migrations/20260308220000_add_auth_and_payments.sql
```

5. Start the dev server:

```bash
npm run dev
```

## Current Status

The current build now includes:

- Email/password auth with Postgres-backed sessions
- Resume upload and AI parsing for PDF and DOCX
- JD analysis and AI tailoring with plan-based model selection
- PDF and DOCX download generation
- Razorpay checkout and payment verification routes
- Free, Basic, and Premium usage enforcement

To run it as a real product, you still need to provide:

- `DATABASE_URL`
- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `NEXT_PUBLIC_APP_URL`
