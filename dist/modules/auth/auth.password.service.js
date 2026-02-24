"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAndSendVerification = generateAndSendVerification;
exports.requestResetPassword = requestResetPassword;
exports.resetPassword = resetPassword;
exports.resendVerification = resendVerification;
const db_1 = __importDefault(require("../../configs/db"));
const customError_1 = require("../../common/utils/customError");
const env_config_1 = require("../../configs/env.config");
const email_helper_1 = require("../../common/utils/email.helper");
const token_helper_1 = require("../../common/utils/token.helper");
async function generateAndSendVerification(user) {
    const token = (0, token_helper_1.generateToken)({ userId: user.id, email: user.email }, '1h');
    await db_1.default.registerToken.create({ data: { token } });
    const verificationLink = `${env_config_1.NEXT_PUBLIC_WEB_URL}/auth/verify-email?token=${token}`;
    await (0, email_helper_1.sendVerificationEmail)(user.email, user.name, verificationLink);
}
async function requestResetPassword(data) {
    const user = await db_1.default.user.findUnique({ where: { email: data.email } });
    if (!user)
        throw (0, customError_1.createCustomError)(404, 'User not found');
    if (!user.password) {
        throw (0, customError_1.createCustomError)(400, 'Cannot reset password for social login accounts');
    }
    const token = (0, token_helper_1.generateToken)({ userId: user.id }, '1h');
    await db_1.default.registerToken.create({ data: { token } });
    const resetLink = `${env_config_1.NEXT_PUBLIC_WEB_URL}/auth/reset-password/confirm/${token}`;
    await (0, email_helper_1.sendResetPasswordEmail)(user.email, user.name, resetLink);
    return { message: 'Reset password email sent' };
}
async function resetPassword(data) {
    const tokenRecord = await db_1.default.registerToken.findUnique({
        where: { token: data.token },
    });
    if (!tokenRecord)
        throw (0, customError_1.createCustomError)(400, 'Invalid or expired reset token');
    const decoded = (0, token_helper_1.verifyToken)(data.token);
    const hashedPassword = await (0, token_helper_1.hashPassword)(data.password);
    await db_1.default.user.update({
        where: { id: decoded.userId },
        data: { password: hashedPassword },
    });
    await db_1.default.registerToken.delete({ where: { token: data.token } });
    return { message: 'Password reset successfully' };
}
async function resendVerification(email) {
    const user = await db_1.default.user.findUnique({ where: { email } });
    if (!user)
        throw (0, customError_1.createCustomError)(404, 'Email tidak ditemukan');
    if (user.isVerified) {
        throw (0, customError_1.createCustomError)(400, 'Akun sudah terverifikasi. Silakan login.');
    }
    const token = (0, token_helper_1.generateToken)({ userId: user.id, email: user.email }, '1h');
    await db_1.default.registerToken.create({ data: { token } });
    const verificationLink = `${env_config_1.NEXT_PUBLIC_WEB_URL}/auth/verify-email?token=${token}`;
    await (0, email_helper_1.sendVerificationEmail)(user.email, user.name, verificationLink);
    return { message: 'Email verifikasi telah dikirim ulang' };
}
