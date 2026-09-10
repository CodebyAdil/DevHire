/**
 * Small custom error class so we can throw errors with an HTTP status code
 * attached, and let the centralized error-handling middleware (from Phase 1)
 * turn them into a consistent JSON response.
 *
 * ASSUMPTION: your Phase 1 error middleware reads `err.statusCode` and
 * `err.message`. If your middleware expects something different, adjust
 * this class (or just delete it and use whatever error shape you already
 * have — the rest of the auth code only relies on `statusCode` + `message`).
 */
export class AppError extends Error {
  constructor(message, statusCode, details = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.details = details; // optional extra info, e.g. per-field validation errors
    this.isOperational = true; // marks "expected" errors (bad input, auth failure)
                                 // vs. unexpected bugs, useful if your middleware
                                 // logs differently based on this flag
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;