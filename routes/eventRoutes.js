const express = require("express");
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerForEvent,
  unregisterFromEvent,
  getMyRegisteredEvents,
  getMyCreatedEvents,
  toggleFeatured,
  getDashboardStats,
} = require("../controllers/eventController");
const authMiddleware = require("../middleware/authMiddleware");
const optionalAuthMiddleware = require("../middleware/optionalAuthMiddleware");
const { upload } = require("../Config Files/cloudinary");

const router = express.Router();

// Public routes
router.get("/all", getEvents);

// Protected routes (require authentication)
router.get("/my/registered", authMiddleware, getMyRegisteredEvents);
router.get("/my/created", authMiddleware, getMyCreatedEvents);
router.get("/stats/dashboard", authMiddleware, getDashboardStats);

router.post("/create", authMiddleware, upload.single("banner"), createEvent);
router.put("/:id", authMiddleware, upload.single("banner"), updateEvent);
router.delete("/:id", authMiddleware, deleteEvent);

router.post("/:id/register", authMiddleware, registerForEvent);
router.post("/:id/unregister", authMiddleware, unregisterFromEvent);

router.patch("/:id/toggle-featured", authMiddleware, toggleFeatured);

// Get single event by ID - must be last to avoid conflicts
router.get("/:id", optionalAuthMiddleware, getEventById);

module.exports = router;
