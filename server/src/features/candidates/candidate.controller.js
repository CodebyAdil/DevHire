import * as candidateService from './candidate.service.js';

/**
 * `req.job` is already attached by `requireJobAccess`, so we don't need
 * to re-fetch or re-check ownership here — just use req.job._id / req.params.jobId.
 */

export async function upload(req, res, next) {
  try {
    const { created, failed } = await candidateService.createCandidatesFromUpload({
      jobId: req.job._id,
      files: req.files,
    });

    // 201 if at least one succeeded, 207-style partial info either way —
    // sticking with 201 (simpler for the frontend) but always returning
    // both arrays so the UI can show "3 uploaded, 1 failed: reason".
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