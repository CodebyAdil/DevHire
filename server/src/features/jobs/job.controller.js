import * as jobService from './job.service.js';

/**
 * Controllers stay thin: validation happens in middleware, ownership checks
 * happen in job.middleware.js, business logic happens in job.service.js.
 */

export async function create(req, res, next) {
  try {
    const { title, description, requirements } = req.body;
    const job = await jobService.createJob({
      recruiterId: req.user.sub, // owner is always the authenticated user — never from body
      title,
      description,
      requirements,
    });
    res.status(201).json({ job });
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const jobs = await jobService.listJobs({ userId: req.user.sub, role: req.user.role });
    res.status(200).json({ jobs });
  } catch (err) {
    next(err);
  }
}

/** requireJobOwnership already ran and attached req.job — just return it. */
export async function getOne(req, res, next) {
  res.status(200).json({ job: req.job });
}

/** requireJobOwnership already ran and attached req.job — update it directly. */
export async function update(req, res, next) {
  try {
    const job = await jobService.updateJob(req.job._id, req.body);
    res.status(200).json({ job });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    await jobService.deleteJob(req.job._id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}