const { z } = require("zod");

const registerSchema = z
  .object({
    name: z
      .string()
      .min(3, "Name must be at least 3 characters")
      .max(50, "Name cannot exceed 50 characters"),
    email: z.string().email("Please provide valid email"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(50, "Password cannot exceed 50 characters"),
  })
  .strict();

const loginSchema = z
  .object({
    email: z.string().email("Please provide a valid email"),
    password: z.string().min(3, "Password is required"),
  })
  .strict();

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, "Current password required."),
    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(50, "Password cannot exceed 50 characters"),
  })
  .strict();

const forgotPasswordSchema = z
  .object({
    email: z.string().email("Please provide a valid email"),
  })
  .strict();

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required."),
    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(50, "Password cannot exceed 50 characters."),
  })
  .strict();

const verifyEmailSchema = z
  .object({
    token: z.string().min(1, "Verification token is required."),
  })
  .strict();

const resendVerificationSchema = z
  .object({
    email: z.string().email("Please provide a valid email"),
  })
  .strict();

module.exports = {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  resendVerificationSchema,
};
