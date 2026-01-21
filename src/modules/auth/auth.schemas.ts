import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .regex(/^[0-9]+$/, "Phone number must be digits only")
    .min(10, "Phone number must be at least 10 digits"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const verifySchema = z.object({
  token: z.string(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type VerifyInput = z.infer<typeof verifySchema>;

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const requestResetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type RequestResetPasswordInput = z.infer<typeof requestResetPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
