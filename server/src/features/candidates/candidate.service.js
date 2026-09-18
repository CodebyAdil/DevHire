import { isValidObjectId } from 'mongoose';
import Candidate from './candidate.model.js';
import { extractTextFromPdf } from './pdf-parser.js';
import { AppError } from '../../utils/AppError.js';

/**
 * `createCandidatesFromUpload` processes each uploaded file independently.
 * If one PDF is corrupted, the others in the same batch still succeed —
 * matches the spec's non-functional note about handling failures
 * gracefully rather than blocking the whole flow. We return which files
 * succeeded and which failed instead of throwing on the first bad one.
 */
export async function createCandidatesFromUpload({ jobId, files }) {
  const created = [];
  const failed = [];

  for (const file of files) {
    try {
      const resumeText = await extractTextFromPdf(file.path);

      if (!resumeText) {
        // Extraction "succeeded" but found no text (likely a scanned PDF —
        // see the known limitation noted in pdf-parser.js). Still record
        // it as failed rather than silently saving an empty candidate.
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

export async function listCandidatesForJob(jobId) {
  return Candidate.find({ jobId }).sort({ createdAt: -1 });
}

export async function getCandidateById(candidateId, jobId) {
  return findCandidateOrThrow(candidateId, jobId);
}

export { findCandidateOrThrow };