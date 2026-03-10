# ApplyX v2

ApplyX v2 is a source-available AI resume tailoring and job application workflow product built with Next.js 14, TypeScript, Tailwind CSS, PostgreSQL, Anthropic, OpenAI fallback, and a billing layer that prefers Dodo Payments but can fall back to manual payment links. Users create an account, upload one master resume, paste any job description, and receive an ATS-optimized tailored resume in PDF or DOCX format.

The code is visible for evaluation and upstream contributions, but commercial reuse is not permitted without written permission. See `LICENSE`.

## Stack

- Next.js 14 App Router with Server Components and Server Actions
- TypeScript in strict mode
- Tailwind CSS with local shadcn/ui-compatible components
- PostgreSQL-backed auth, session, resume, tailoring, usage, and payment records
- Provider-neutral PostgreSQL schema targeting Neon or any standard PostgreSQL host
- Anthropic Claude with OpenAI fallback
- Dodo Payments for hosted checkout when available
- Manual UPI / international payment link fallback with founder approval scripts

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
- Manual billing fallback page, transaction submission flow, and approval scripts
- Free, Basic, and Premium usage enforcement
- Optional OpenClaw WhatsApp notification bridge for `applied` events

To run it as a real product, you still need to provide:

- `DATABASE_URL`
- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`
- `XAI_API_KEY`
- `DODO_PAYMENTS_API_KEY`
- `DODO_PAYMENTS_WEBHOOK_KEY`
- `DODO_BASIC_PRODUCT_ID`
- `DODO_PREMIUM_PRODUCT_ID`
- `MANUAL_UPI_ID` and `MANUAL_UPI_NAME` for an in-app UPI QR code
- or `MANUAL_UPI_PAYMENT_URL` / `MANUAL_INTERNATIONAL_PAYMENT_URL` if you want direct payment links
- `NEXT_PUBLIC_APP_URL`
- `OPENCLAW_NOTIFY_URL` and `OPENCLAW_NOTIFY_SECRET` if you want WhatsApp alerts through a VM-side OpenClaw bridge

## Manual Billing Operations

If gateway onboarding is blocked, the app can still monetize with manual billing:

```bash
npm run billing:list
npm run billing:approve -- <payment-id-or-checkout-id>
```

Users pay via the configured manual links, submit a transaction reference in the app, and you approve the payment to activate their plan for 30 days.

## Optional OpenClaw Notifications

If you want a WhatsApp alert whenever a tracked role enters the `applied` state, use the
VM-side bridge in `services/openclaw-notifier/README.md`.

ApplyX sends a signed webhook to your notifier service when:

- an application is created directly as `applied`
- a tracked application is updated into `applied`
- auto-tailor promotes a tracked application into `applied`
