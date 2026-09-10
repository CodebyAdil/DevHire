import { AppError } from '../utils/AppError.js';

/**
 * Generic validation middleware factory. Pass it a Zod schema shaped like
 * { body: z.object({...}) } (and optionally params/query if you need them
 * later), and it validates req against that shape before the route handler
 * ever runs — matching CLAUDE.md's "don't trust raw req.body" rule.
 *
 * Usage:
 *   router.post('/register', validate(registerSchema), authController.register)
 */
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      // Flatten Zod's error tree into a simple field -> message list,
      // easier for a frontend to render next to form fields.
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return next(new AppError('Validation failed', 400, errors));
    }

    // Overwrite req.body with the parsed/coerced data (e.g. lowercased email)
    req.body = result.data.body;
    next();
  };
}

export default validate;