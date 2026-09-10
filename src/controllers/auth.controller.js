const authService = require("../services/auth.service.js");
const asyncHandler = require("../utils/asyncHandler.js");

const register = asyncHandler(async (req, res, next) => {
  const user = await authService.registerUser(req.body);
  return res.status(201).json({
    success: true,
    message: "User registered successfully.",
    user,
  });
});

const login = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken } = await authService.loginUser(req.body);

  // save refresh token at cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    success: true,
    message: "Login successful",
    accessToken,
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  await authService.changePassword({
    userId: req.user.userId,
    currentPassword,
    newPassword,
  });

  return res.status(200).json({
    success: true,
    message: "Password changed successfully.",
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  await authService.forgotPassword(email);

  return res.status(200).json({
    success: true,
    message:
      "If an account with that email exists, a reset link has been sent.",
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  await authService.resetPassword({ token, newPassword });

  return res.status(200).json({
    success: true,
    message: "Password reset successfully.",
  });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;

  await authService.verifyEmail(token);

  return res.status(200).json({
    success: true,
    message: "Email verified successfully",
  });
});

const resendVerificationEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  await authService.resendVerificationEmail(email);

  return res.status(200).json({
    success: true,
    message: "If verification is required, a verification email will be sent",
  });
});

module.exports = {
  register,
  login,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
};
