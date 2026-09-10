import { z } from 'zod';

/**
 * Register: intentionally does NOT accept `role` from the request body.
 * If a client could pass role: 'admin' on signup, anyone could self-promote
 * to admin. Role defaults to 'recruiter' at the model level instead.
 * (Revisit later if you need an admin-invite flow.)
 */
const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Name is required').max(100),
    email: z.string().trim().toLowerCase().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password must be at most 72 characters'), // bcrypt truncates beyond 72 bytes
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export { registerSchema, loginSchema };