const prisma = require("../lib/prisma.js");
const AppError = require("../utils/appError.js");

const getMyProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isEmailVerified: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError("User not found!", 404);
  }

  return user;
};

const updateMyProfile = async (userId, data) => {
  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isEmailVerified: true,
      updatedAt: true,
    },
  });

  return user;
};

const deleteMyAccount = async (userId) => {
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      refreshToken: null,
    },
  });
};

module.exports = { getMyProfile, updateMyProfile, deleteMyAccount };
