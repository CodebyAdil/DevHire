import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

async function registerAndLogin() {
  const user = {
    name: 'Recruiter',
    email: `recruiter-${Date.now()}-${Math.random()}@example.com`,
    password: 'password123',
  };
  const res = await request(app).post('/api/auth/register').send(user);
  return res.body.token;
}

async function createJob(token) {
  const res = await request(app)
    .post('/api/jobs')
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Backend Engineer', description: 'Build APIs', requirements: 'Node.js' });
  return res.body.job._id;
}

describe('POST /api/jobs/:jobId/candidates', () => {
  let token, jobId;

  beforeEach(async () => {
    token = await registerAndLogin();
    jobId = await createJob(token);
  });

  it('rejects a request with no files attached (failure case)', async () => {
    const res = await request(app).post(`/api/jobs/${jobId}/candidates`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  it('rejects a non-PDF file', async () => {
    const res = await request(app)
      .post(`/api/jobs/${jobId}/candidates`)
      .set('Authorization', `Bearer ${token}`)
      .attach('resumes', Buffer.from('not a pdf'), { filename: 'resume.txt', contentType: 'text/plain' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/only pdf files/i);
  });

  it('blocks uploading to a job you do not own', async () => {
    const otherToken = await registerAndLogin();
    const res = await request(app)
      .post(`/api/jobs/${jobId}/candidates`)
      .set('Authorization', `Bearer ${otherToken}`)
      .attach('resumes', Buffer.from('not a pdf'), { filename: 'resume.pdf', contentType: 'application/pdf' });

    expect(res.status).toBe(403);
  });

  // NOTE: a true happy-path test (real PDF -> text extracted -> Candidate
  // saved) needs an actual PDF fixture file, which isn't included here —
  // add one under tests/fixtures/sample-resume.pdf and .attach() it to
  // cover that path. Left as a follow-up rather than shipping a fake/
  // hand-rolled PDF that might not exercise pdf-parse realistically.
});

describe('GET /api/jobs/:jobId/candidates', () => {
  it('blocks listing candidates for a job you do not own', async () => {
    const token = await registerAndLogin();
    const jobId = await createJob(token);

    const otherToken = await registerAndLogin();
    const res = await request(app)
      .get(`/api/jobs/${jobId}/candidates`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.status).toBe(403);
  });

  it('returns an empty list for a job with no candidates yet (happy path)', async () => {
    const token = await registerAndLogin();
    const jobId = await createJob(token);

    const res = await request(app).get(`/api/jobs/${jobId}/candidates`).set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.candidates).toEqual([]);
  });
});