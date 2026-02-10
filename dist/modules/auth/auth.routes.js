"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const validate_middleware_1 = require("../../common/middlewares/validate.middleware");
const auth_schemas_1 = require("./auth.schemas");
const auth_middleware_1 = require("../../common/middlewares/auth.middleware");
const authRouter = (0, express_1.Router)();
// POST /api/auth/register
authRouter.post('/register', (0, validate_middleware_1.validateBody)(auth_schemas_1.registerSchema), auth_controller_1.register);
// Login endpoint
authRouter.post('/login', (0, validate_middleware_1.validateBody)(auth_schemas_1.loginSchema), auth_controller_1.login);
// Get Me endpoint
authRouter.get('/me', auth_middleware_1.authMiddleware, auth_controller_1.getMe);
// Logout endpoint
authRouter.post('/logout', auth_middleware_1.authMiddleware, auth_controller_1.logout);
// Social Login endpoint
authRouter.post('/social', auth_controller_1.socialLoginController);
// Verification endpoint
authRouter.post('/verification', (0, validate_middleware_1.validateBody)(auth_schemas_1.verifySchema), auth_controller_1.verify);
// Resend Verification Email endpoint
authRouter.post('/resend-verification', auth_controller_1.resendVerificationEmail);
// Request Reset Password endpoint
authRouter.post('/request-reset-password', (0, validate_middleware_1.validateBody)(auth_schemas_1.requestResetPasswordSchema), auth_controller_1.requestResetPassword);
// Reset Password endpoint
authRouter.post('/reset-password', (0, validate_middleware_1.validateBody)(auth_schemas_1.resetPasswordSchema), auth_controller_1.resetPassword);
exports.default = authRouter;
