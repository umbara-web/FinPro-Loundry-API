"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const db_1 = __importDefault(require("../../configs/db"));
const token_helper_1 = require("../../common/utils/token.helper");
const customError_1 = require("../../common/utils/customError");
class UserService {
    async updateAvatar(userId, avatarUrl) {
        return await db_1.default.user.update({
            where: { id: userId },
            data: {
                profile_picture_url: avatarUrl,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isVerified: true,
                profile_picture_url: true,
                phone: true,
            },
        });
    }
    async updateProfile(userId, data) {
        // Check if email is being updated
        if (data.email) {
            const existingUser = await db_1.default.user.findFirst({
                where: {
                    email: data.email,
                    NOT: { id: userId },
                },
            });
            if (existingUser) {
                throw new Error('Email already in use');
            }
        }
        // If email changes, set isVerified to false
        // We need to fetch current user to compare? Or just update if data.email is present?
        // Let's assume controller filters `data`.
        const updateData = Object.assign({}, data);
        // We will handle email verification logic in controller or separate service method if needed.
        // For now simple update.
        // Actually, requirement says "wajib verifikasi ulang".
        // So if email changes, we set isVerified = false.
        const currentUser = await db_1.default.user.findUnique({ where: { id: userId } });
        if (data.email && data.email !== (currentUser === null || currentUser === void 0 ? void 0 : currentUser.email)) {
            updateData.isVerified = false;
            // Trigger verification email sending in controller
        }
        return await db_1.default.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isVerified: true,
                profile_picture_url: true,
                phone: true,
            },
        });
    }
    async changePassword(userId, oldPassword, newPassword) {
        const user = await db_1.default.user.findUnique({ where: { id: userId } });
        if (!user || !user.password) {
            throw (0, customError_1.createCustomError)(400, 'User not found or no password set');
        }
        const isMatch = await (0, token_helper_1.comparePassword)(oldPassword, user.password);
        if (!isMatch) {
            throw (0, customError_1.createCustomError)(400, 'Password lama salah');
        }
        const hashedPassword = await (0, token_helper_1.hashPassword)(newPassword);
        await db_1.default.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
        return { message: 'Password updated successfully' };
    }
}
exports.UserService = UserService;
