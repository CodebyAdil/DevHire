import * as authService from '../features/auth/auth.service.js';
import { AppError } from '../utils/AppError.js';

/**
 * `protect` — verifies the JWT on incoming requests and attaches the
 * decoded payload to req.user. Any route that needs a logged-in user
 * (creating a job, uploading resumes, etc.) goes through this first.
 *
 * Expects: Authorization: Bearer <token>
 */
export function protect(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Not authenticated — no token provided', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = authService.verifyToken(token); // { sub, role, iat, exp }
    req.user = decoded;
    next();
  } catch (err) {
    // jwt.verify throws on both expired and malformed/invalid tokens.
    // We collapse both into one message — no need to tell the client which.
    return next(new AppError('Not authenticated — invalid or expired token', 401));
  }
}

/**
 * `authorize(...roles)` — role-based access control. Use AFTER `protect`,
 * since it depends on req.user already being set.
 *
 * Usage:
 *   router.delete('/jobs/:id', protect, authorize('admin'), jobController.remove)
 *   router.post('/jobs', protect, authorize('recruiter', 'admin'), jobController.create)
 */
export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      // Defensive check — means `protect` wasn't run first. This is a
      // developer mistake, not a client error, but 401 is still correct
      // since from the client's point of view they're unauthenticated.
      return next(new AppError('Not authenticated', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
}