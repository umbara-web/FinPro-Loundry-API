"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("./user.service");
const auth_password_service_1 = require("../auth/auth.password.service");
const cloudinary_1 = require("../../configs/cloudinary");
const userService = new user_service_1.UserService();
class UserController {
    async updateAvatar(req, res, next) {
        try {
            if (!req.file) {
                throw new Error('No file uploaded');
            }
            const userId = req.user.userId;
            const { secure_url } = await (0, cloudinary_1.cloudinaryUpload)(req.file, 'profiles');
            const fileUrl = secure_url;
            const updatedUser = await userService.updateAvatar(userId, fileUrl);
            res.status(200).json({
                message: 'Avatar updated successfully',
                data: updatedUser,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateProfile(req, res, next) {
        try {
            const userId = req.user.userId;
            const data = req.body;
            // Basic validation handled by schema/zod usually, but if not:
            // Ensure only valid fields
            const { name, phone, email, birthDate } = data;
            const updatedUser = await userService.updateProfile(userId, {
                name,
                phone,
                email,
                birthDate: birthDate ? new Date(birthDate) : undefined,
            });
            if (updatedUser.isVerified === false) {
                // Updated user's isVerified is false. If it was an email change, we send verification.
                // Even if it was already false, re-sending is not harmful on profile update if explicit email change happens.
                // But userService only sets it to false if email changed.
                // We can check if `email` was in body.
                if (email && email !== req.user.email) {
                    await (0, auth_password_service_1.generateAndSendVerification)({
                        id: updatedUser.id,
                        email: updatedUser.email,
                        name: updatedUser.name,
                    });
                }
            }
            res.status(200).json({
                message: 'Profile updated successfully',
                data: updatedUser,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async changePassword(req, res, next) {
        try {
            const userId = req.user.userId;
            const { oldPassword, newPassword, confirmNewPassword } = req.body;
            if (newPassword !== confirmNewPassword) {
                throw new Error('Konfirmasi password baru tidak cocok');
            }
            if (newPassword.length < 6) {
                throw new Error('Password baru minimal 6 karakter');
            }
            await userService.changePassword(userId, oldPassword, newPassword);
            res.status(200).json({
                message: 'Password berhasil diperbarui',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UserController = UserController;
