"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.requestResetPasswordSchema = exports.loginSchema = exports.verifySchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name must be at most 50 characters"),
    email: zod_1.z.string().email("Invalid email address"),
    phone: zod_1.z
        .string()
        .regex(/^[0-9]+$/, "Phone number must be digits only")
        .min(10, "Phone number must be at least 10 digits"),
});
exports.verifySchema = zod_1.z.object({
    token: zod_1.z.string(),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(1, "Password is required"),
});
exports.requestResetPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
});
exports.resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string(),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
});
