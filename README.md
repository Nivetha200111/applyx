# ApplyX v2

ApplyX v2 is an India-first AI resume tailoring platform built with Next.js 14, TypeScript, Tailwind CSS, PostgreSQL, Anthropic, OpenAI fallback, and Dodo Payments. Users create an account, upload one master resume, paste any job description, and receive an ATS-optimized tailored resume in PDF or DOCX format.

## Stack

- Next.js 14 App Router with Server Components and Server Actions
- TypeScript in strict mode
- Tailwind CSS with local shadcn/ui-compatible components
- PostgreSQL-backed auth, session, resume, tailoring, usage, and payment records
- Provider-neutral PostgreSQL schema targeting Neon or any standard PostgreSQL host
- Anthropic Claude with OpenAI fallback
- Dodo Payments for hosted checkout and subscriptions

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template:

```bash
cp .env.local.example .env.local
```

3. Point `DATABASE_URL` at Neon PostgreSQL.
   Any standard PostgreSQL host is compatible. Cloudflare D1 is not used here
   because it is SQLite-based instead of PostgreSQL.

4. Apply the schema:

```bash
psql "$DATABASE_URL" -f db/schema.sql
```

If you previously applied an older local schema, run:

```bash
psql "$DATABASE_URL" -f db/migrations/20260308220000_add_auth_and_payments.sql
psql "$DATABASE_URL" -f db/migrations/20260308193000_replace_razorpay_with_dodo.sql
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
- Dodo hosted checkout, customer portal, and signed webhook routes
- Free, Basic, and Premium usage enforcement

To run it as a real product, you still need to provide:

- `DATABASE_URL`
- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`
- `DODO_PAYMENTS_API_KEY`
- `DODO_PAYMENTS_WEBHOOK_KEY`
- `DODO_BASIC_PRODUCT_ID`
- `DODO_PREMIUM_PRODUCT_ID`
- `NEXT_PUBLIC_APP_URL`
