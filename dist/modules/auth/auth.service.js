"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendVerification = exports.resetPassword = exports.requestResetPassword = void 0;
exports.registerUser = registerUser;
exports.verifyUser = verifyUser;
exports.loginUser = loginUser;
exports.socialLogin = socialLogin;
exports.getMe = getMe;
const db_1 = __importDefault(require("../../configs/db"));
const customError_1 = require("../../common/utils/customError");
const token_helper_1 = require("../../common/utils/token.helper");
const auth_password_service_1 = require("./auth.password.service");
// Re-export from password service for backwards compatibility
var auth_password_service_2 = require("./auth.password.service");
Object.defineProperty(exports, "requestResetPassword", { enumerable: true, get: function () { return auth_password_service_2.requestResetPassword; } });
Object.defineProperty(exports, "resetPassword", { enumerable: true, get: function () { return auth_password_service_2.resetPassword; } });
Object.defineProperty(exports, "resendVerification", { enumerable: true, get: function () { return auth_password_service_2.resendVerification; } });
async function registerUser(data) {
    const existingUser = await db_1.default.user.findUnique({
        where: { email: data.email },
    });
    if (existingUser) {
        if (existingUser.password) {
            throw (0, customError_1.createCustomError)(400, 'Email already registered');
        }
        await (0, auth_password_service_1.generateAndSendVerification)(existingUser);
        return { message: 'Verification email sent (resend)' };
    }
    const user = await db_1.default.user.create({
        data: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            password: '',
            lat: '',
            long: '',
        },
    });
    await (0, auth_password_service_1.generateAndSendVerification)(user);
    return { message: 'Verification email sent' };
}
async function verifyUser(data) {
    const tokenRecord = await db_1.default.registerToken.findUnique({
        where: { token: data.token },
    });
    if (!tokenRecord) {
        throw (0, customError_1.createCustomError)(400, 'Invalid or expired verification token');
    }
    const decoded = (0, token_helper_1.verifyToken)(data.token);
    const hashedPassword = await (0, token_helper_1.hashPassword)(data.password);
    await db_1.default.user.update({
        where: { id: decoded.userId },
        data: { password: hashedPassword, isVerified: true },
    });
    await db_1.default.registerToken.delete({ where: { token: data.token } });
    return { message: 'Email verified successfully' };
}
async function loginUser(data) {
    const user = await db_1.default.user.findUnique({ where: { email: data.email } });
    if (!user)
        throw (0, customError_1.createCustomError)(400, 'Invalid email or password');
    if (!user.password) {
        throw (0, customError_1.createCustomError)(400, 'Please verify your email address before logging in');
    }
    const isPasswordValid = await (0, token_helper_1.comparePassword)(data.password, user.password);
    if (!isPasswordValid)
        throw (0, customError_1.createCustomError)(400, 'Invalid email or password');
    return buildLoginResponse(user);
}
function buildLoginResponse(user) {
    const token = (0, token_helper_1.generateToken)({
        userId: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
    }, '1d');
    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            profile_picture_url: user.profile_picture_url,
        },
        token,
    };
}
async function socialLogin(data) {
    let user = await db_1.default.user.findUnique({ where: { email: data.email } });
    if (!user) {
        user = await db_1.default.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: '',
                role: 'CUSTOMER',
                lat: '',
                long: '',
                isVerified: true,
            },
        });
    }
    return buildLoginResponse(user);
}
async function getMe(userId) {
    const user = await db_1.default.user.findUnique({ where: { id: userId } });
    if (!user)
        throw (0, customError_1.createCustomError)(404, 'User not found');
    const { password } = user, userWithoutPassword = __rest(user, ["password"]);
    return userWithoutPassword;
}
