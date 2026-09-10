# CLAUDE.md — DevHire

This file is read by Claude Code at the start of every session. Keep it accurate — update it whenever a convention or decision changes.

## Project Overview
DevHire is an AI-assisted recruitment platform. It helps recruiters screen candidates faster by using AI (Claude API) to parse resumes, match candidates to job requirements, and surface ranked shortlists. This is Adil's primary portfolio project.

## Tech Stack
- **Frontend:** React
- **Backend:** Node.js + Express
- **Database:** MongoDB (Mongoose ODM)
- **AI:** Claude API (resume parsing, candidate-job matching, scoring)
- **Auth:** JWT
- **File handling:** Multer (resume uploads), PDF parsing library (TBD — see decisions log)

Do not introduce a different framework, database, or ORM without discussing it first — stick to this stack.

## Core Features (v1 scope)
- User auth (recruiter accounts only — no candidate accounts) — JWT-based, role-based access control
- Job posting CRUD
- Bulk resume upload (PDF, multiple files in one request) → parsed into structured candidate data
- AI-powered candidate-to-job matching/scoring via Claude API
- Ranked candidate shortlist per job
- Basic dashboard (recruiter view of jobs + candidates)

## Out of scope for v1 (don't build unless asked)
- Multi-tenant/org accounts
- Candidate-facing portal
- Payment/billing
- Advanced analytics

## Coding Conventions
- Feature-based folder structure (not layer-based): group by feature (e.g. `/features/jobs`, `/features/candidates`), not by type (`/controllers`, `/models` flat at root).
- Use async/await, not raw promise chains.
- All API routes validated with a schema validation library (e.g. Zod or Joi) — don't trust raw `req.body`.
- Environment variables accessed only via a single `config.js`/`config.ts` — never `process.env.X` scattered through the codebase.
- Consistent error handling: centralized Express error-handling middleware, not try/catch-and-improvise per route.
- Mongoose schemas: always define with explicit types and required fields, no implicit `any`.

## Testing Expectations
- Every new API endpoint gets at least one test (happy path + one failure case) before being considered done.
- Use [Jest / Supertest — confirm choice] for backend tests.
- Don't skip tests to move faster — flag it instead if time-boxing is needed.

## Commands
```
npm run dev        # start dev server
npm test            # run test suite
npm run lint         # lint check
npm run build       # production build
```
(Update these once actual package.json scripts are finalized.)

## Working Style / Instructions for Claude Code
- Work in small, scoped chunks — one feature or endpoint at a time. Don't build multiple features in one pass.
- Before making large structural changes (new folders, renamed modules, schema changes), explain the plan first and wait for confirmation.
- Don't add new npm dependencies without asking first.
- After finishing a chunk, summarize what changed and what to test manually.
- Prefer clarity over cleverness — this is a portfolio project that may be reviewed by others (interviewers, collaborators).
- When unsure about a requirement, ask rather than assume.

## Known Gaps / Things Adil Is Still Learning
- Hands-on backend experience is still developing — JWT auth, Mongoose schema design, and Multer file handling are active learning areas. Explain reasoning, not just code, when implementing these.
- PDF parsing and AI API integration are new areas — flag tradeoffs between library options when relevant.

## Decisions Log
(Add entries here as decisions get made, so future sessions don't relitigate them.)
- Stack chosen: React + Node/Express + MongoDB + Claude API
- Recruiter-only in v1 — no candidate accounts or candidate-facing pages
- Candidate model scoped per-job (not a reusable entity across jobs)
- Resume upload is bulk (multiple files in one request via `upload.array('resumes')`), not one-by-one
- [ ] PDF parsing library — not yet decided
- [ ] Backend test framework — not yet decided
- [ ] Hosting target — not yet decided
