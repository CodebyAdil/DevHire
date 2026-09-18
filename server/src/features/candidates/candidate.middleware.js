import { findJobOrThrow } from '../jobs/job.service.js';
import { AppError } from '../../utils/AppError.js';

/**
 * Candidate routes are nested under a job: /api/jobs/:jobId/candidates.
 * This is the same ownership logic as job.middleware.js's
 * `requireJobOwnership`, just reading `req.params.jobId` instead of
 * `req.params.id` (the param name Express gives us here, since :id would
 * collide with a candidate's own :id further down the route).
 *
 * Kept as its own small middleware rather than trying to force
 * requireJobOwnership to handle both param names — simpler to read than a
 * generic "which param has the job id" abstraction for just two routes.
 */
export async function requireJobAccess(req, res, next) {
  try {
    const job = await findJobOrThrow(req.params.jobId);

    const isOwner = job.recruiterId.toString() === req.user.sub;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return next(new AppError('You do not have permission to access this job', 403));
    }

    req.job = job;
    next();
  } catch (err) {
    next(err);
  }
}