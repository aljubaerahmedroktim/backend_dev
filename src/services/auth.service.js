const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const prisma = require("../lib/prisma.js");
const AppError = require("../utils/appError.js");
const {
  sendPasswordResetEmail,
  sendVerificationEmail,
} = require("./email.service.js");
const { generateToken, hashToken } = require("../utils/token.js");

const registerUser = async (data) => {
  const { name, email, password } = data;
  if (!name || !email || !password) {
    throw new AppError("Name, email and password are required.", 400);
  }

  const hasUser = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (hasUser) {
    throw new AppError("Email already registered", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  const { token, hashedToken } = generateToken();

  const emailVerifyExpires = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      emailVerifyToken: hashedToken,
      emailVerifyExpires,
    },
  });

  const verificationUrl =
    `${process.env.CLIENT_URL}` + `/verify-email?token=${token}`;

  try {
    await sendVerificationEmail({
      email: user.email,
      verificationUrl,
    });
  } catch (error) {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        emailVerifyToken: null,
        emailVerifyExpires: null,
      },
    });

    throw new AppError("Unable to send verification url", 500);
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

const loginUser = async (data) => {
  const { email, password } = data;

  if (!email || !password) {
    throw new AppError("Email and password are required.", 400);
  }

  const user = await prisma.user.findFirst({
    where: {
      email: email,
      isDeleted: false,
    },
  });

  if (!user) {
    throw new AppError("Invalid email or password.", 401);
  }

  if (!user.isEmailVerified) {
    throw new AppError("Please verify your email before logging in", 403);
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    throw new AppError("Invalid email or password.", 401);
  }

  // Generate access token
  const accessToken = jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "15m",
    },
  );

  // Generate refresh Token
  const refreshToken = jwt.sign(
    {
      userId: user.id,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: "7d",
    },
  );

  // Save refresh token
  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      refreshToken,
    },
  });

  return {
    accessToken,
    refreshToken,
  };
};

const changePassword = async (data) => {
  const { userId, currentPassword, newPassword } = data;

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const isPasswordCorrect = await bcrypt.compare(
    currentPassword,
    user.password,
  );

  if (!isPasswordCorrect) {
    throw new AppError("Current password is incorrect.");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password: hashedPassword,
      refreshToken: null,
    },
  });

  return true;
};

const forgotPassword = async (email) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return true;
  }

  const { token, hashedToken } = generateToken();

  const hashedResetToken = hashToken(token);

  const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.user.update({
    where: {
      email,
    },
    data: {
      passwordResetToken: hashedResetToken,
      passwordResetExpires,
    },
  });

  const resetUrl =
    `${process.env.CLIENT_URL}` + `/reset-password?token=${resetToken}`;

  try {
    await sendPasswordResetEmail({
      email: user.email,
      resetUrl,
    });
  } catch (error) {
    console.log("Forgot password: ", error);
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    throw new AppError("Unable to send password reset email", 500);
  }

  return true;
};

const resetPassword = async (data) => {
  const { token, newPassword } = data;

  const hashedToken = hashToken(token);

  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpires: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw new AppError("Invalid or expired reset token.", 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
      refreshToken: null,
    },
  });

  return true;
};

const verifyEmail = async (token) => {
  const hashedToken = hashToken(token);

  const user = await prisma.user.findFirst({
    where: {
      emailVerifyToken: hashedToken,
      emailVerifyExpires: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw new AppError("Invalid or expired verification token", 400);
  }

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      isEmailVerified: true,
      emailVerifyExpires: null,
      emailVerifyToken: null,
    },
  });

  return true;
};

const resendVerificationEmail = async (email) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return;
  }

  if (user.isEmailVerified) {
    return;
  }

  const { token, hashedToken } = generateToken();

  const emailVerifyExpires = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.user.update({
    where: {
      email,
    },
    data: {
      emailVerifyExpires,
      emailVerifyToken: hashedToken,
    },
  });

  const verificationUrl =
    `${process.env.CLIENT_URL}` + `/verify-email?token=${token}`;

  await sendVerificationEmail({
    email: user.email,
    verificationUrl,
  });
};

module.exports = {
  registerUser,
  loginUser,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
};
