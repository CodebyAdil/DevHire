import { isValidObjectId } from 'mongoose';
import Job from './job.model.js';
import { AppError } from '../../utils/AppError.js';

/**
 * Same reasoning as auth.service.js: DB queries and ownership logic live
 * here, not in the controller, so they're easy to unit-test and reuse
 * (e.g. Phase 4/5 will need "is this job mine?" checks too, when uploading
 * resumes / triggering AI scoring against a specific job).
 */

async function findJobOrThrow(jobId) {
  if (!isValidObjectId(jobId)) {
    throw new AppError('Invalid job id', 400);
  }
  const job = await Job.findById(jobId);
  if (!job) {
    throw new AppError('Job not found', 404);
  }
  return job;
}

export async function createJob({ recruiterId, title, description, requirements }) {
  const job = await Job.create({ recruiterId, title, description, requirements });
  return job;
}

/**
 * Recruiters see only their own jobs. Admins see everything — useful for
 * moderation/oversight without needing a separate admin-only endpoint.
 */
export async function listJobs({ userId, role }) {
  const filter = role === 'admin' ? {} : { recruiterId: userId };
  return Job.find(filter).sort({ createdAt: -1 });
}

export async function getJobById(jobId) {
  return findJobOrThrow(jobId);
}

export async function updateJob(jobId, updates) {
  const job = await findJobOrThrow(jobId);
  Object.assign(job, updates);
  await job.save();
  return job;
}

export async function deleteJob(jobId) {
  const job = await findJobOrThrow(jobId);
  await job.deleteOne();
}

export { findJobOrThrow };