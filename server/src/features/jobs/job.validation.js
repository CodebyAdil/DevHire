import { z } from 'zod';

/**
 * Create: does NOT accept `recruiterId` from the client — same reasoning
 * as auth's register schema not accepting `role`. The owner of a job is
 * always the authenticated user creating it (set server-side from
 * req.user.sub in the controller), never something the client can set.
 * `status` also isn't accepted on create — every new job starts 'open'.
 */
export const createJobSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, 'Title is required').max(200),
    description: z.string().trim().min(1, 'Description is required'),
    requirements: z.string().trim().max(5000).optional(),
  }),
});

/**
 * Update: everything optional (partial update), but at least one field
 * must be present — an empty PATCH body is almost certainly a client bug,
 * better to reject it than silently no-op.
 */
export const updateJobSchema = z.object({
  body: z
    .object({
      title: z.string().trim().min(1).max(200).optional(),
      description: z.string().trim().min(1).optional(),
      requirements: z.string().trim().max(5000).optional(),
      status: z.enum(['open', 'closed']).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided',
    }),
}); 