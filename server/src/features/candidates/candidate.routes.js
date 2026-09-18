import express from 'express';
import * as candidateController from './candidate.controller.js';
import { requireJobAccess } from './candidate.middleware.js';
import { handleUpload } from './resume-upload.middleware.js';
import { protect } from '../../middleware/auth.middleware.js';

// mergeParams: true is required so this router (mounted at
// /api/jobs/:jobId/candidates) can read req.params.jobId — without it,
// nested routers don't inherit the parent's route params.
const router = express.Router({ mergeParams: true });

router.use(protect, requireJobAccess);

router.post('/', handleUpload, candidateController.upload);
router.get('/', candidateController.list);
router.get('/:id', candidateController.getOne);

export default router;

/**
 * In your main app.js / server.js, mount this NESTED under jobs:
 *   import candidateRoutes from './features/candidates/candidate.routes.js';
 *   app.use('/api/jobs/:jobId/candidates', candidateRoutes);
 *
 * Endpoints (all require Authorization: Bearer <token>, and the token's
 * user must own the job — checked once per request by requireJobAccess):
 *   POST /api/jobs/:jobId/candidates
 *     multipart/form-data, field name "resumes" (up to 10 PDF files, 5MB each)
 *     -> { created: [...], failed: [...], summary }
 *   GET  /api/jobs/:jobId/candidates            -> { candidates: [] }
 *   GET  /api/jobs/:jobId/candidates/:id        -> { candidate }
 *
 * Uploaded files are saved to uploads/resumes/ on disk. To let the
 * frontend actually view/download a resume PDF, add this near your other
 * app.use() calls in server.js:
 *   app.use('/uploads', express.static('uploads'));
 * (This serves files by their random UUID filename only — not indexable,
 * but also not auth-protected. Fine for a portfolio project; if resume
 * privacy matters later, swap this for an authenticated download route
 * that streams the file instead.)
 */