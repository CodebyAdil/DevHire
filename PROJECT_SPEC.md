# DevHire — Project Spec (v1)

## Problem
Recruiters spend too long manually reading resumes and matching candidates to job requirements. DevHire uses AI to parse resumes and score candidates against a job, so recruiters can focus on a ranked shortlist instead of a raw pile of applications.

## Target user
Individual recruiter or small hiring team screening candidates for open roles.

## Definition of done (v1)
A recruiter can: sign up/log in → post a job → receive/upload candidate resumes → get an AI-generated match score and ranked shortlist per job → view candidate details.

## Data Model (draft)

**User**
- id, name, email, passwordHash, role (recruiter/admin), createdAt

**Job**
- id, recruiterId (ref User), title, description, requirements (structured or text), status (open/closed), createdAt

**Candidate**
- id, jobId (ref Job), name, email, resumeFileUrl, parsedData (skills, experience, education — structured from AI parsing), matchScore, matchSummary, createdAt

**Application** (if you want jobs/candidates decoupled — i.e. a candidate can apply to multiple jobs)
- id, jobId, candidateId, status, matchScore

> Confirmed: Candidate is scoped to one job for v1 (no separate Application model, no reusable candidate profiles across jobs). Revisit later if needed.

## Core Flow (v1 — recruiter-only, confirmed)
1. Recruiter registers/logs in (JWT auth)
2. Recruiter creates a job posting
3. Recruiter bulk-uploads multiple candidate resumes (PDF) at once for that job — not one-by-one
4. Backend parses each resume (PDF → text → structured data) — via parsing library + Claude API
5. Claude API scores/matches each candidate against job requirements
6. Recruiter views ranked shortlist + candidate detail view

Note: v1 has no candidate accounts or candidate-facing pages. Recruiter uploads resumes on the candidates' behalf.

## Non-functional notes
- Resume files should be validated (file type, size limit) before upload accepted
- AI API calls should handle failure gracefully (don't block the whole flow if Claude API times out)
- Keep AI prompt/response logic isolated in its own service module — not scattered through controllers, so it's easy to test and swap later

## Decided
- [x] Candidate scoping: per-job (not reusable across jobs)
- [x] Upload flow: recruiter-only, bulk upload (multiple resumes per job in one request)

## Open decisions
- [ ] PDF parsing approach (library vs. sending raw PDF text to Claude directly)
- [ ] Matching approach: one Claude call per candidate in a loop, or batched into fewer calls?
- [ ] Hosting (Render/Railway/Vercel + Mongo Atlas, etc.)
- [ ] Test framework
