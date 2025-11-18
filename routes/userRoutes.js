const express = require("express");
const router = express.Router();
const {
  getUserProfile,
  getMyProfile,
  updateMyProfile,
  uploadAvatar,
  getUserEventHistory,
  awardBadge,
  updateNotificationPreferences
} = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const { uploadAvatar: avatarUpload } = require("../Config Files/cloudinary");

// Protected Routes (Authentication Required) - Must come BEFORE dynamic routes
router.get("/profile/me", authMiddleware, getMyProfile); // Get own profile
router.put("/profile/me", authMiddleware, updateMyProfile); // Update own profile
router.post("/profile/me/avatar", authMiddleware, avatarUpload.single("avatar"), uploadAvatar); // Upload avatar
router.get("/profile/me/history", authMiddleware, getUserEventHistory); // Get event history
router.put("/profile/me/notifications", authMiddleware, updateNotificationPreferences); // Update notification preferences

// Public Routes - Dynamic routes come last
router.get("/profile/:userId", getUserProfile); // Get any user's profile (public)

// Badge Routes (Admin or system use)
router.post("/:userId/badges", authMiddleware, awardBadge); // Award badge to user

module.exports = router;
