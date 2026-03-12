# ApplyX v2

ApplyX v2 is a source-available AI resume tailoring, job application tracking, and mock interview platform built with Next.js 14, TypeScript, Tailwind CSS, PostgreSQL, and Google Gemini. Users create an account, upload a master resume, paste any job description, and receive an ATS-optimized tailored resume in PDF or DOCX format. The platform also includes AI-powered mock interviews with live video body language analysis and voice interaction.

The code is visible for evaluation and upstream contributions, but commercial reuse is not permitted without written permission. See `LICENSE`.

## Stack

- Next.js 14 App Router with Server Components, Streaming, and Suspense
- TypeScript in strict mode
- Tailwind CSS with local shadcn/ui-compatible components
- Framer Motion for panel entrance animations, pure CSS for page transitions
- PostgreSQL-backed auth, session, resume, tailoring, usage, and payment records
- Provider-neutral PostgreSQL schema targeting Neon or any standard PostgreSQL host
- Edge middleware for instant auth gating (cookie-based, zero DB calls)
- Google Gemini 2.5 Flash / Flash Lite for AI tailoring and mock interview generation
- Gemini Embedding (`gemini-embedding-001`) for semantic answer evaluation
- Gemini 2.5 Flash Vision for live webcam body language analysis
- Web Speech API for voice-powered interview responses (speech-to-text and text-to-speech)
- Dodo Payments for hosted checkout when available
- Manual UPI / international payment link fallback with founder approval scripts

## Features

### Resume Tailoring
- Upload master resumes (PDF or DOCX) with AI parsing
- Paste a job description and receive an ATS-optimized tailored resume
- Plan-based tailoring quality (fast mode on Basic, deep rewrite on Premium)
- PDF and DOCX download generation
- Match score tracking before and after tailoring

### Job Application Tracker
- Spreadsheet-style tracker with AI auto-fill from pasted JDs
- Authenticity and resume-fit signals for tracked roles
- Status management, follow-up reminders, and snooze
- Auto-set status and schedule follow-ups on JD parse (Basic+)
- Full automation: parse → tailor → status → follow-up (Premium)

### AI Mock Interviews
- AI-generated interview questions based on role, company, and difficulty
- Semantic answer evaluation using Gemini Embedding 2 for similarity scoring
- Live webcam video feed with real-time body language analysis (posture, eye contact, gestures, facial expressions)
- Voice-powered responses — speak answers instead of typing
- Text-to-speech for AI questions and feedback
- Post-interview summary with overall score and hiring likelihood

### Jobs For You
- Aggregated job feed from external sources (Adzuna, RemoteOK)
- AI-powered job matching based on resume profile
- Dismiss and track jobs directly from the feed

### Analytics & History
- Application analytics with response rates and status breakdowns
- Activity history for resume parsing, tailoring, and billing events
- Templates library for common resume formats

### Performance
- Edge middleware for sub-millisecond auth redirects
- Synchronous layouts with instant skeleton loading states
- Client-side data fetching for dashboard and sidebar (no layout blocking)
- `React.cache()` deduplication for database calls
- Pure CSS page transitions (retro CRT theme) — no JS overhead
- `loading.tsx` skeletons on every dashboard route

### Billing
- Dodo Payments hosted checkout and customer portal
- Signed webhook processing for subscription lifecycle
- Manual billing fallback with UPI QR and international payment links
- Free, Basic, and Premium usage enforcement

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

## Environment Variables

To run it as a real product, you need to provide:

### Required
- `DATABASE_URL` — Neon PostgreSQL connection string
- `NEXT_PUBLIC_APP_URL` — public URL of the deployed app

### AI & Tailoring
- `ANTHROPIC_API_KEY` — Anthropic Claude for resume tailoring
- `OPENAI_API_KEY` — OpenAI fallback for tailoring
- `XAI_API_KEY` — xAI Grok models for plan-based tailoring
- `GEMINI_API_KEY` — Google Gemini for mock interviews, embeddings, and body language analysis

### Billing
- `DODO_PAYMENTS_API_KEY`
- `DODO_PAYMENTS_WEBHOOK_KEY`
- `DODO_BASIC_PRODUCT_ID` — monthly USD Basic subscription product
- `DODO_PREMIUM_PRODUCT_ID` — monthly USD Premium subscription product
- `DODO_ENVIRONMENT=test_mode` — if your Dodo merchant is not live-enabled yet
- `MANUAL_UPI_ID` and `MANUAL_UPI_NAME` — for in-app UPI QR code
- or `MANUAL_UPI_PAYMENT_URL` / `MANUAL_INTERNATIONAL_PAYMENT_URL` — for direct payment links

### Optional
- `APPLYX_INTERNAL_API_KEY` — signup conversion callbacks to `grow.applyx.space`
- `OPENCLAW_NOTIFY_URL` and `OPENCLAW_NOTIFY_SECRET` — WhatsApp alerts through OpenClaw bridge

## Dodo Billing Setup

For ApplyX paid plans to work correctly with Dodo:

- enable live payments on your Dodo merchant before using live-mode checkout
- configure both ApplyX plans as recurring monthly subscription products, not one-time products
- set Basic to `USD 2.99 / month`
- set Premium to `USD 6.99 / month`
- disable adaptive pricing / adaptive currency if you want fixed USD globally
- if Dodo forces you to create replacement subscription products, update `DODO_BASIC_PRODUCT_ID` and `DODO_PREMIUM_PRODUCT_ID` in your app envs and redeploy

If live payments are not enabled yet, the Dodo API will reject checkout session creation with
`MERCHANT_NOT_LIVE`.

## Manual Billing Operations

If gateway onboarding is blocked, the app can still monetize with manual billing:

```bash
npm run billing:list
npm run billing:approve -- <payment-id-or-checkout-id>
```

Users pay via the configured manual links, submit a transaction reference in the app, and you approve the payment to activate their plan for 30 days.

## Internal Conversion Callback

If you want marketing attribution from the real signup flow, set `APPLYX_INTERNAL_API_KEY`.
ApplyX will send a server-side callback after successful signup to:

- `https://grow.applyx.space/api/internal/conversion`

The payload includes:

- `eventType: "signup"`
- `source` from `/signup?source=...`
- `slug` from `/signup?slug=...`
- `userId`
- `metadata: null`

If the internal key is missing or the callback fails, account creation still succeeds.

## Job Signal Backfill

After deploying tracker signal changes, apply the latest migration first. New tracked jobs
will score automatically. Existing tracked jobs can be populated in two ways:

- users can click `Refresh Signals` in the tracker to batch-generate missing scores
- a developer admin can POST to `/api/admin/job-signals/backfill` while signed in to backfill
  existing rows in batches

## Optional OpenClaw Notifications

If you want a WhatsApp alert whenever a tracked role enters the `applied` state, use the
VM-side bridge in `services/openclaw-notifier/README.md`.

ApplyX sends a signed webhook to your notifier service when:

- an application is created directly as `applied`
- a tracked application is updated into `applied`
- auto-tailor promotes a tracked application into `applied`
