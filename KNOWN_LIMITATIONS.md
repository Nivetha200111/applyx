# Known Limitations

ApplyX is in public beta.

## Current Limits

- billing is still partly manual for some payment flows
- resume parsing quality depends on extracted text quality from the uploaded file
- AI output can still miss edge cases on highly non-standard resumes or job descriptions
- international self-serve payments are not live yet

## What Is Already Hardened

- database access is user-scoped
- session tokens are hashed before storage
- key write endpoints now use DB-backed rate limiting
- upload validation checks file signatures, not just extensions

## What Still Needs Work

- broader end-to-end test coverage
- more polished billing automation
- stronger observability for provider failures
- deeper evaluation datasets for tailoring quality
