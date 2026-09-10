# DevHire — Task Breakdown

Work through these in order. Each task should be one focused session with Claude Code — review the diff, test it, commit, then move to the next.

## Phase 1 — Foundation
- [ ] Repo init, folder structure, `.gitignore`, base `package.json`
- [ ] Express server boilerplate + health-check route
- [ ] MongoDB connection setup
- [ ] Central config module (reads `.env`)
- [ ] Central error-handling middleware

## Phase 2 — Auth
- [ ] User model (Mongoose schema)
- [ ] Register endpoint + password hashing
- [ ] Login endpoint + JWT issuance
- [ ] Auth middleware (protect routes)
- [ ] Role-based access control (recruiter/admin)

## Phase 3 — Jobs
- [ ] Job model
- [ ] Create/Read/Update/Delete job endpoints
- [ ] Ownership checks (only the job's recruiter can edit/delete)

## Phase 4 — Resume Upload & Parsing
- [ ] Multer setup for resume upload (PDF, size/type validation)
- [ ] PDF → text extraction
- [ ] Candidate model + save parsed resume data

## Phase 5 — AI Matching
- [ ] Claude API service module (isolated, testable)
- [ ] Prompt design: candidate data + job requirements → score + summary
- [ ] Endpoint to trigger scoring for a candidate
- [ ] Error handling for AI API failures/timeouts

## Phase 6 — Frontend
- [ ] Auth pages (login/register)
- [ ] Job list + create job form
- [ ] Resume upload UI
- [ ] Candidate shortlist view (ranked by score)
- [ ] Candidate detail view

## Phase 7 — Polish
- [ ] Tests for all endpoints
- [ ] Basic loading/error states across UI
- [ ] Deployment (hosting + Mongo Atlas)
- [ ] README with setup instructions
