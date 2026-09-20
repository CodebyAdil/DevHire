import * as candidateService from './candidate.service.js';

/**
 * NOTE: supersedes Phase 4's candidate.controller.js — has everything from
 * Phase 4 plus the two new scoring handlers at the bottom. Replace the
 * whole file rather than merging by hand.
 */

export async function upload(req, res, next) {
  try {
    const { created, failed } = await candidateService.createCandidatesFromUpload({
      jobId: req.job._id,
      files: req.files,
    });

    res.status(201).json({
      created,
      failed,
      summary: `${created.length} uploaded, ${failed.length} failed`,
    });
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const candidates = await candidateService.listCandidatesForJob(req.params.jobId);
    res.status(200).json({ candidates });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    const candidate = await candidateService.getCandidateById(req.params.id, req.params.jobId);
    res.status(200).json({ candidate });
  } catch (err) {
    next(err);
  }
}

/** POST /api/jobs/:jobId/candidates/:id/score */
export async function score(req, res, next) {
  try {
    const candidate = await candidateService.scoreCandidate(req.params.id, req.job);
    res.status(200).json({ candidate });
  } catch (err) {
    next(err); // candidate is already marked 'failed' in the service before this fires
  }
}

/** POST /api/jobs/:jobId/candidates/score-all */
export async function scoreAll(req, res, next) {
  try {
    const results = await candidateService.scoreAllUnscoredCandidates(req.job);
    res.status(200).json({
      ...results,
      summary: `${results.scored.length} scored, ${results.failed.length} failed`,
    });
  } catch (err) {
    next(err);
  }
} 