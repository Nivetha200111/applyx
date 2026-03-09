# Contributing

ApplyX is in public beta. Small, focused fixes are the most useful contributions right now.

## Repository Model

This repository is source-available, not open source. See `LICENSE` before reusing code
outside this repository.

## Ways To Help

- report broken resume parsing or export formatting
- improve job tracker and dashboard UX
- harden auth, billing, and API abuse protections
- improve prompt quality and evaluation coverage

## Local Setup

1. Install dependencies with `npm install`.
2. Copy `.env.local.example` to `.env.local`.
3. Add `DATABASE_URL` and AI keys.
4. Apply the schema with `db/schema.sql`.
5. Run the app with `npm run dev`.

## Before Opening A PR

- keep changes scoped
- run `npm run lint`
- run `npm run build`
- include screenshots for UI changes
- describe user impact, risks, and manual test steps
- do not include secrets, production data, exported resumes, or billing records

## Contribution Terms

By submitting a pull request, you agree that your contribution can be used, modified,
relicensed, and distributed by the maintainer as part of ApplyX.

## Issue Reports

When filing bugs, include:

- the page or API route involved
- exact input used
- expected vs actual behavior
- screenshots or exported file samples when relevant

## Product Context

ApplyX is a solo-built ATS resume tailoring and job tracking product. The highest-value contributions are the ones that improve reliability, clarity, and trust for real job seekers.
