const express = require("express");
const prisma = require("../lib/prisma.js");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/auth.middleware.js");
const authController = require("../controllers/auth.controller.js");
const validate = require("../middleware/validate.middleware.js");
const {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  resendVerificationSchema,
} = require("../validations/auth.validation.js");

const router = express.Router();

// authentication routes
router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post(
  "/change-password",
  authMiddleware,
  validate(changePasswordSchema),
  authController.changePassword,
);
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  authController.resetPassword,
);
router.post(
  "/verify-email",
  validate(verifyEmailSchema),
  authController.verifyEmail,
);
router.post(
  "/resend-verification",
  validate(resendVerificationSchema),
  authController.resendVerificationEmail,
);

// refresh token
router.post("/refresh", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Invalid refresh token.",
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
    });

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        message: "Invalid refresh token.",
      });
    }

    const newAccessToken = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1m",
      },
    );

    return res.status(201).json({
      accessToken: newAccessToken,
    });
  } catch (e) {
    return res.status(401).json({
      message: "Invalid or expired refresh token.",
    });
  }
});

// logout
router.post("/logout", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      try {
        const decoded = jwt.verify(
          refreshToken,
          process.env.JWT_REFRESH_SECRET,
        );
        await prisma.user.update({
          where: {
            id: decoded.userId,
          },
          data: {
            refreshToken: null,
          },
        });
      } catch {
        // Nothing to do
      }
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.json({
      message: "Logout successful.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong.",
    });
  }
});

module.exports = router;
