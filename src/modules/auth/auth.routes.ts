import { Router } from 'express';
import { AuthController } from './auth.controller';
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
const authController = new AuthController();

// POST /api/auth/register
authRouter.post(
  '/register',
  validateBody(registerSchema),
  authController.register
);

// Login endpoint
authRouter.post('/login', validateBody(loginSchema), authController.login);

// Get Me endpoint
authRouter.get('/me', authMiddleware, authController.getMe);

// Logout endpoint
authRouter.post('/logout', authMiddleware, authController.logout);

// Social Login endpoint
authRouter.post('/social', authController.socialLoginController);

// Verification endpoint
authRouter.post(
  '/verification',
  validateBody(verifySchema),
  authController.verify
);

// Resend Verification Email endpoint
authRouter.post('/resend-verification', authController.resendVerificationEmail);

// Request Reset Password endpoint
authRouter.post(
  '/request-reset-password',
  validateBody(requestResetPasswordSchema),
  authController.requestResetPassword
);

// Reset Password endpoint
authRouter.post(
  '/reset-password',
  validateBody(resetPasswordSchema),
  authController.resetPassword
);

export default authRouter;
