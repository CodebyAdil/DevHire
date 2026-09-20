import express from 'express';
import * as candidateController from './candidate.controller.js';
import { requireJobAccess } from './candidate.middleware.js';
import { handleUpload } from './resume-upload.middleware.js';
import { protect } from '../../middleware/auth.middleware.js';

// NOTE: supersedes Phase 4's candidate.routes.js — adds the two scoring
// routes at the bottom. Replace the whole file.

const router = express.Router({ mergeParams: true });

router.use(protect, requireJobAccess);

router.post('/', handleUpload, candidateController.upload);
router.get('/', candidateController.list);
router.get('/:id', candidateController.getOne);
router.post('/:id/score', candidateController.score);
router.post('/score-all', candidateController.scoreAll);

export default router;

/**
 * Endpoints (all require Authorization: Bearer <token> + job ownership):
 *   POST /api/jobs/:jobId/candidates              upload resumes (Phase 4)
 *   GET  /api/jobs/:jobId/candidates               ranked list — highest
 *                                                   matchScore first, unscored last
 *   GET  /api/jobs/:jobId/candidates/:id            candidate detail
 *   POST /api/jobs/:jobId/candidates/:id/score      score ONE candidate against the job
 *   POST /api/jobs/:jobId/candidates/score-all      score every not-yet-scored candidate
 *
 * Typical flow: upload resumes -> POST .../score-all -> GET the list,
 * already ranked, for the shortlist view.
 */