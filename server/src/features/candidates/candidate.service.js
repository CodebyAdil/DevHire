import { isValidObjectId } from 'mongoose';
import Candidate from './candidate.model.js';
import { extractTextFromPdf } from './pdf-parser.js';
import { scoreCandidateResume } from '../../services/gemini.service.js';
import { AppError } from '../../utils/AppError.js';

/**
 * NOTE: this file supersedes Phase 4's candidate.service.js — it has
 * everything from Phase 4 (createCandidatesFromUpload, listCandidatesForJob,
 * getCandidateById, findCandidateOrThrow) PLUS the new Phase 5 scoring
 * functions below. Replace your existing candidate.service.js with this one
 * wholesale rather than merging by hand.
 */

export async function createCandidatesFromUpload({ jobId, files }) {
  const created = [];
  const failed = [];

  for (const file of files) {
    try {
      const resumeText = await extractTextFromPdf(file.path);

      if (!resumeText) {
        failed.push({ filename: file.originalname, reason: 'No extractable text found in PDF' });
        continue;
      }

      const candidate = await Candidate.create({
        jobId,
        resumeFileUrl: `/uploads/resumes/${file.filename}`,
        resumeText,
        status: 'uploaded',
      });

      created.push(candidate);
    } catch (err) {
      failed.push({
        filename: file.originalname,
        reason: err instanceof AppError ? err.message : 'Failed to process this file',
      });
    }
  }

  return { created, failed };
}

async function findCandidateOrThrow(candidateId, jobId) {
  if (!isValidObjectId(candidateId)) {
    throw new AppError('Invalid candidate id', 400);
  }
  const candidate = await Candidate.findOne({ _id: candidateId, jobId });
  if (!candidate) {
    throw new AppError('Candidate not found', 404);
  }
  return candidate;
}

/**
 * List is sorted so the ranked shortlist falls out "for free" — scored
 * candidates first (highest matchScore at the top), unscored ones last.
 * MongoDB sorts `null` as lower than any number in descending order, so
 * unscored candidates (matchScore: null) naturally sink to the bottom
 * without any extra query logic.
 */
export async function listCandidatesForJob(jobId) {
  return Candidate.find({ jobId }).sort({ matchScore: -1, createdAt: -1 });
}

export async function getCandidateById(candidateId, jobId) {
  return findCandidateOrThrow(candidateId, jobId);
}

/**
 * Scores a single candidate against its job. On AI failure, marks the
 * candidate `status: 'failed'` but does NOT delete/lose the candidate or
 * its resumeText — the recruiter can retry scoring later (e.g. once a
 * rate limit clears) by calling this endpoint again.
 */
export async function scoreCandidate(candidateId, job) {
  const candidate = await findCandidateOrThrow(candidateId, job._id);

  try {
    const result = await scoreCandidateResume(
      { title: job.title, description: job.description, requirements: job.requirements },
      candidate.resumeText
    );

    candidate.name = result.name;
    candidate.email = result.email;
    candidate.parsedData = {
      skills: result.skills,
      experience: result.experience,
      education: result.education,
    };
    candidate.matchScore = result.matchScore;
    candidate.matchSummary = result.matchSummary;
    candidate.status = 'scored';
    await candidate.save();

    return candidate;
  } catch (err) {
    candidate.status = 'failed';
    await candidate.save();
    throw err; // let the controller/error middleware report the real reason (timeout, bad format, etc.)
  }
}

/**
 * Scores every not-yet-scored candidate for a job, one at a time
 * (sequential, not Promise.all) — deliberately avoids firing a burst of
 * concurrent requests at the Claude API and hitting rate limits. Each
 * candidate's failure is isolated, same spirit as the upload batch: one
 * bad resume doesn't stop the rest from being scored.
 */
export async function scoreAllUnscoredCandidates(job) {
  const candidates = await Candidate.find({ jobId: job._id, status: { $ne: 'scored' } });

  const results = { scored: [], failed: [] };
  for (const candidate of candidates) {
    try {
      const scored = await scoreCandidate(candidate._id, job);
      results.scored.push(scored);
    } catch (err) {
      results.failed.push({
        candidateId: candidate._id,
        reason: err instanceof AppError ? err.message : 'Scoring failed',
      });
    }
  }
  return results;
}

export { findCandidateOrThrow };