"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.verify = verify;
exports.login = login;
exports.getMe = getMe;
exports.logout = logout;
exports.socialLoginController = socialLoginController;
exports.requestResetPassword = requestResetPassword;
exports.resetPassword = resetPassword;
exports.resendVerificationEmail = resendVerificationEmail;
const auth_service_1 = require("./auth.service");
async function register(req, res, next) {
    try {
        const result = await (0, auth_service_1.registerUser)(req.body);
        res.status(201).json({
            message: 'OK',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
}
async function verify(req, res, next) {
    try {
        const result = await (0, auth_service_1.verifyUser)(req.body);
        res.status(200).json({
            message: 'OK',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
}
async function login(req, res, next) {
    try {
        const result = await (0, auth_service_1.loginUser)(req.body);
        res.cookie('auth_token', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });
        res.status(200).json({
            message: 'Login successful',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
}
async function getMe(req, res, next) {
    try {
        const user = req.user;
        if (!user)
            throw new Error('Unauthorized');
        const result = await (0, auth_service_1.getMe)(user.userId);
        res.status(200).json({
            message: 'OK',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
}
async function logout(req, res, next) {
    try {
        res.clearCookie('auth_token');
        res.status(200).json({
            message: 'Logout successful',
        });
    }
    catch (error) {
        next(error);
    }
}
async function socialLoginController(req, res, next) {
    try {
        const result = await (0, auth_service_1.socialLogin)(req.body);
        res.cookie('auth_token', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });
        res.status(200).json({
            message: 'Social login successful',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
}
async function requestResetPassword(req, res, next) {
    try {
        const result = await (0, auth_service_1.requestResetPassword)(req.body);
        res.status(200).json({
            message: 'Reset password email sent',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
}
async function resetPassword(req, res, next) {
    try {
        const result = await (0, auth_service_1.resetPassword)(req.body);
        res.status(200).json({
            message: 'Password reset successfully',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
}
async function resendVerificationEmail(req, res, next) {
    try {
        const { email } = req.body;
        const result = await (0, auth_service_1.resendVerification)(email);
        res.status(200).json({
            message: 'Verification email resent',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
}
