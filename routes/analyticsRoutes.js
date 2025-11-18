const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const authMiddleware = require("../middleware/authMiddleware");

// All analytics routes require authentication
router.use(authMiddleware);

// Overview statistics (All authenticated users can view their own stats)
router.get("/overview", analyticsController.getOverviewStats);

// Category distribution statistics
router.get("/categories", analyticsController.getCategoryStats);

// Engagement timeline (registrations, views over time)
router.get("/engagement-timeline", analyticsController.getEngagementTimeline);

// Top performing events
router.get("/top-events", analyticsController.getTopEvents);

// User activity statistics (Admin only)
router.get("/user-activity", analyticsController.getUserActivityStats);

// Event-specific attendance tracking (Organizer/Admin)
router.get("/attendance/:eventId", analyticsController.getEventAttendance);

module.exports = router;
