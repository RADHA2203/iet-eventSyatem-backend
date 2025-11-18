const User = require("../models/User");
const Event = require("../models/Event");
const cloudinary = require("../Config Files/cloudinary");

// @desc    Get user profile by user ID (public)
// @route   GET /api/users/profile/:userId
// @access  Public
const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get current user's profile (authenticated)
// @route   GET /api/users/profile/me
// @access  Private
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Get my profile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Update current user's profile
// @route   PUT /api/users/profile/me
// @access  Private
const updateMyProfile = async (req, res) => {
  try {
    const { bio, phone, department, year, interests, socialLinks } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update profile fields
    if (bio !== undefined) user.profile.bio = bio;
    if (phone !== undefined) user.profile.phone = phone;
    if (department !== undefined) user.profile.department = department;
    if (year !== undefined) user.profile.year = year;
    if (interests !== undefined) user.profile.interests = interests;

    if (socialLinks) {
      if (socialLinks.linkedin !== undefined) user.profile.socialLinks.linkedin = socialLinks.linkedin;
      if (socialLinks.github !== undefined) user.profile.socialLinks.github = socialLinks.github;
      if (socialLinks.twitter !== undefined) user.profile.socialLinks.twitter = socialLinks.twitter;
      if (socialLinks.instagram !== undefined) user.profile.socialLinks.instagram = socialLinks.instagram;
    }

    await user.save();

    // Return updated user without password
    const updatedUser = await User.findById(req.user.id).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Upload/Update user avatar
// @route   POST /api/users/profile/me/avatar
// @access  Private
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload an image" });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Delete old avatar from Cloudinary if exists
    if (user.profile.avatar) {
      try {
        const publicId = user.profile.avatar.split("/").slice(-2).join("/").split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.log("Error deleting old avatar:", err);
      }
    }

    // Save new avatar URL
    user.profile.avatar = req.file.path;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
      avatarUrl: req.file.path
    });
  } catch (error) {
    console.error("Upload avatar error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get user's event history (attended & organized)
// @route   GET /api/users/profile/me/history
// @access  Private
const getUserEventHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get events user has attended (registered for)
    const attendedEvents = await Event.find({
      attendees: userId,
      status: "published"
    }).populate("createdBy", "name email").sort({ date: -1 });

    // Get events user has organized
    const organizedEvents = await Event.find({
      createdBy: userId
    }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      attendedEvents,
      organizedEvents
    });
  } catch (error) {
    console.error("Get event history error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Award badge to user (internal use or admin)
// @route   POST /api/users/:userId/badges
// @access  Private (Admin or system call)
const awardBadge = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, description, icon } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if user already has this badge
    const hasBadge = user.badges.some(badge => badge.name === name);

    if (hasBadge) {
      return res.status(400).json({ success: false, message: "User already has this badge" });
    }

    // Add badge
    user.badges.push({ name, description, icon });
    await user.save();

    res.status(200).json({
      success: true,
      message: "Badge awarded successfully",
      badge: user.badges[user.badges.length - 1]
    });
  } catch (error) {
    console.error("Award badge error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Update notification preferences
// @route   PUT /api/users/profile/me/notifications
// @access  Private
const updateNotificationPreferences = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update notification preferences
    if (email) {
      if (email.enabled !== undefined) {
        user.notificationPreferences.email.enabled = email.enabled;
      }
      if (email.eventReminders !== undefined) {
        user.notificationPreferences.email.eventReminders = email.eventReminders;
      }
      if (email.eventUpdates !== undefined) {
        user.notificationPreferences.email.eventUpdates = email.eventUpdates;
      }
      if (email.comments !== undefined) {
        user.notificationPreferences.email.comments = email.comments;
      }
      if (email.registrations !== undefined) {
        user.notificationPreferences.email.registrations = email.registrations;
      }
    }

    await user.save();

    // Return updated user without password
    const updatedUser = await User.findById(req.user.id).select("-password");

    res.status(200).json({
      success: true,
      message: "Notification preferences updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Update notification preferences error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getUserProfile,
  getMyProfile,
  updateMyProfile,
  uploadAvatar,
  getUserEventHistory,
  awardBadge,
  updateNotificationPreferences
};
