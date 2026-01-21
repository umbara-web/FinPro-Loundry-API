import { Router } from 'express';
import {
  register,
  verify,
  login,
  socialLoginController,
  requestResetPassword,
  resetPassword,
  getMe,
  logout,
  resendVerificationEmail,
} from './auth.controller';
import { validateBody } from '../../common/middlewares/validate.middleware';
import {
  registerSchema,
  verifySchema,
  loginSchema,
  requestResetPasswordSchema,
  resetPasswordSchema,
} from './auth.schemas';
import { authMiddleware } from '../../common/middlewares/auth.middleware';

const authRouter = Router();

// POST /api/auth/register
authRouter.post('/register', validateBody(registerSchema), register);

// Login endpoint
authRouter.post('/login', validateBody(loginSchema), login);

// Get Me endpoint
authRouter.get('/me', authMiddleware, getMe);

// Logout endpoint
authRouter.post('/logout', authMiddleware, logout);

// Social Login endpoint
authRouter.post('/social', socialLoginController);

// Verification endpoint
authRouter.post('/verification', validateBody(verifySchema), verify);

// Resend Verification Email endpoint
authRouter.post('/resend-verification', resendVerificationEmail);

// Request Reset Password endpoint
authRouter.post(
  '/request-reset-password',
  validateBody(requestResetPasswordSchema),
  requestResetPassword
);

// Reset Password endpoint
authRouter.post(
  '/reset-password',
  validateBody(resetPasswordSchema),
  resetPassword
);

export default authRouter;
