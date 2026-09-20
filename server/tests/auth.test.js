import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

const validUser = { name: 'Test Recruiter', email: 'recruiter@example.com', password: 'password123' };

describe('POST /api/auth/register', () => {
  it('creates a user and returns a token (happy path)', async () => {
    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.token).toBeTypeOf('string');
    expect(res.body.user.email).toBe(validUser.email);
    expect(res.body.user.role).toBe('recruiter'); // never trust client-supplied role
    expect(res.body.user.passwordHash).toBeUndefined(); // never leak the hash
  });

  it('rejects a duplicate email (failure case)', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already exists/i);
  });

  it('ignores a client-supplied role and defaults to recruiter', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, role: 'admin' });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('recruiter');
  });
});

describe('POST /api/auth/login', () => {
  it('logs in with correct credentials (happy path)', async () => {
    await request(app).post('/api/auth/register').send(validUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTypeOf('string');
  });

  it('rejects an incorrect password (failure case)', async () => {
    await request(app).post('/api/auth/register').send(validUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/invalid email or password/i);
  });
});

describe('GET /api/auth/me', () => {
  it('returns the logged-in user with a valid token (happy path)', async () => {
    const { body } = await request(app).post('/api/auth/register').send(validUser);

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${body.token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(validUser.email);
  });

  it('rejects a missing token (failure case)', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});