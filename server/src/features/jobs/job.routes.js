import express from 'express';
import * as jobController from './job.controller.js';
import { requireJobOwnership } from './job.middleware.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';
import validate from '../../middleware/validate.js';
import { createJobSchema, updateJobSchema } from './job.validation.js';

const router = express.Router();

// Every job route requires a logged-in user. Only recruiters/admins can
// create jobs at all — there are no other roles in v1, but this keeps the
// intent explicit and future-proofs against a role being added later.
router.use(protect);

router.post('/', authorize('recruiter', 'admin'), validate(createJobSchema), jobController.create);
router.get('/', jobController.list);
router.get('/:id', requireJobOwnership, jobController.getOne);
router.patch('/:id', requireJobOwnership, validate(updateJobSchema), jobController.update);
router.delete('/:id', requireJobOwnership, jobController.remove);

export default router;

/**
 * In your main app.js / server.js, mount this with:
 *   import jobRoutes from './features/jobs/job.routes.js';
 *   app.use('/api/jobs', jobRoutes);
 *
 * Endpoints:
 *   POST   /api/jobs      { title, description, requirements? } -> { job }        (201)
 *   GET    /api/jobs                                             -> { jobs: [] }   (own jobs, or all if admin)
 *   GET    /api/jobs/:id                                         -> { job }        (owner or admin only)
 *   PATCH  /api/jobs/:id  { title?, description?, requirements?, status? } -> { job }
 *   DELETE /api/jobs/:id                                         -> 204 No Content
 *
 * All routes require Authorization: Bearer <token>.
 */