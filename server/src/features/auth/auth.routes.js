import express from 'express';
import * as authController from './auth.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import validate from '../../middleware/validate.js';
import { registerSchema, loginSchema } from './auth.validation.js';

const router = express.Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/me', protect, authController.getMe);

export default router;

/**
 * In your main app.js / server.js, mount this with:
 *   import authRoutes from './features/auth/auth.routes.js';
 *   app.use('/api/auth', authRoutes);
 *
 * Endpoints:
 *   POST /api/auth/register  { name, email, password } -> { user, token }
 *   POST /api/auth/login     { email, password }        -> { user, token }
 *   GET  /api/auth/me        (Authorization: Bearer <token>) -> { user }
 */