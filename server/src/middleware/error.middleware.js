/**
 * Centralized error-handling middleware — the single place all errors end
 * up, instead of try/catch-and-improvise scattered per route (per
 * CLAUDE.md's "Consistent error handling" convention).
 *
 * Every controller in this project calls `next(err)` on failure. Express
 * recognizes this as an error handler because it takes 4 arguments —
 * that's not optional, Express checks the function's arity to decide
 * whether a middleware is a normal one or an error handler.
 *
 * Mount this LAST, after all routes:
 *   app.use(errorHandler);
 */
export function errorHandler(err, req, res, next) {
  // AppError instances set their own statusCode (400, 401, 403, 404, 409...).
  // Anything else (a bug, a thrown TypeError, a DB connection drop) is an
  // unexpected 500 — we don't trust err.statusCode unless we set it ourselves.
  const statusCode = err.isOperational && err.statusCode ? err.statusCode : 500;

  // Don't leak internal error details (stack traces, raw DB errors) to the
  // client in production. Operational errors (AppError) always have a safe,
  // intentional message — unexpected errors get a generic one instead.
  const message = err.isOperational
    ? err.message
    : 'Something went wrong. Please try again later.';

  // Log the real error server-side regardless of what we send the client.
  // Unexpected (non-operational) errors are the ones worth paying attention to.
  if (!err.isOperational) {
    console.error('UNEXPECTED ERROR:', err);
  } else if (process.env.NODE_ENV !== 'production') {
    console.error(`[${statusCode}] ${err.message}`);
  }

  const body = { error: message };

  // Validation errors (from validate.js) attach a `details` array of
  // per-field messages — pass those through so the frontend can render them.
  if (err.details) {
    body.details = err.details;
  }

  // Stack traces only in non-production, purely for local debugging.
  if (process.env.NODE_ENV !== 'production') {
    body.stack = err.stack;
  }

  res.status(statusCode).json(body);
}

/**
 * 404 handler for routes that don't match anything — mount this AFTER all
 * your routes but BEFORE errorHandler:
 *   app.use(notFound);
 *   app.use(errorHandler);
 */
export function notFound(req, res, next) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

export default errorHandler;