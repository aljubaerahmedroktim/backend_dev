const asyncHandler = require("../utils/asyncHandler.js");
const userService = require("../services/user.service.js");

const getAdminDashboard = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Welcome to the Admin Dashboard!",
  });
});

const getMyProfile = asyncHandler(async (req, res) => {
  const user = await userService.getMyProfile(req.user.userId);

  return res.status(200).json({
    success: true,
    user,
  });
});

const updateMyProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateMyProfile(req.user.userId, req.body);

  return res.status(201).json({
    success: true,
    user,
  });
});

const deleteMyAccount = asyncHandler(async (req, res) => {
  await userService.deleteMyAccount(req.user.userId);

  return res.status(200).json({
    success: true,
    message: "Account deleted successfully!",
  });
});

module.exports = {
  getAdminDashboard,
  getMyProfile,
  updateMyProfile,
  deleteMyAccount,
};
