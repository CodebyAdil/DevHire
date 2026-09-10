import * as authService from './auth.service.js';

/**
 * Controllers stay thin: validate happens in middleware (auth.validation.js
 * + validate.js), business logic happens in auth.service.js. This file's
 * only job is: call the service, shape the HTTP response, forward errors.
 */

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const { user, token } = await authService.registerUser({ name, email, password });
    res.status(201).json({ user, token });
  } catch (err) {
    next(err); // hands off to your centralized error middleware
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.loginUser({ email, password });
    res.status(200).json({ user, token });
  } catch (err) {
    next(err);
  }
}

/** GET /api/auth/me — quick way to confirm the auth middleware is working. */
export async function getMe(req, res, next) {
  try {
    // req.user is attached by the `protect` middleware
    const user = await authService.getUserById(req.user.sub);
    res.status(200).json({ user: authService.toPublicUser(user) });
  } catch (err) {
    next(err);
  }
}