import { findJobOrThrow } from './job.service.js';
import { AppError } from '../../utils/AppError.js';

/**
 * `requireJobOwnership` — use on any route that modifies a specific job
 * (update, delete). Fetches the job once, attaches it to req.job so the
 * controller doesn't have to fetch it again, and rejects if the logged-in
 * user is neither the job's owner nor an admin.
 *
 * Use AFTER `protect` (needs req.user) and where the route has a `:id`
 * param, e.g.:
 *   router.patch('/:id', protect, requireJobOwnership, jobController.update)
 *
 * Why a separate middleware instead of checking inside the controller?
 * Same "protect vs authorize" split as auth — keeps the permission check
 * as one reusable, declarative step instead of repeated if-checks in
 * every controller method that touches a specific job.
 */
export async function requireJobOwnership(req, res, next) {
  try {
    const job = await findJobOrThrow(req.params.id);

    const isOwner = job.recruiterId.toString() === req.user.sub;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      // 403, not 404 — the job exists, the user just isn't allowed to act
      // on it. (Some APIs deliberately return 404 here to avoid confirming
      // the job exists at all; 403 is simpler and fine for this project
      // since job listings aren't meant to be secret, just not editable
      // by non-owners.)
      return next(new AppError('You do not have permission to modify this job', 403));
    }

    req.job = job; // controller can reuse this instead of re-querying
    next();
  } catch (err) {
    next(err);
  }
}