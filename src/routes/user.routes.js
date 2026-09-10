const express = require("express");
const authMiddleware = require("../middleware/auth.middleware.js");
const authorize = require("../middleware/authorize.middleware.js");
const prisma = require("../lib/prisma.js");
const userController = require("../controllers/user.controller.js");
const { updateProfileSchema } = require("../validations/user.validation.js");
const validate = require("../middleware/validate.middleware.js");

const router = express.Router();

// User Routes
router.get(
  "/admin",
  authMiddleware,
  authorize("admin"),
  userController.getAdminDashboard,
);
// Make myself admin 😊
router.put("/update", authMiddleware, async (req, res) => {
  const { newRole } = req.body;
  await prisma.user.update({
    where: {
      id: req.user.userId,
    },
    data: {
      role: newRole,
    },
  });
  return res.status(200).json({ success: true });
});

// Get My Profile
router.get("/me", authMiddleware, userController.getMyProfile);

// Update My Profile
router.patch(
  "/me",
  authMiddleware,
  validate(updateProfileSchema),
  userController.updateMyProfile,
);

// Delete My Account
router.delete("/me", authMiddleware, userController.deleteMyAccount);

module.exports = router;
