const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const authMiddleware = require("../middleware/authMiddleware");

// All routes require authentication
router.use(authMiddleware);

// Public comment routes
router.post("/:eventId", commentController.createComment);
router.get("/:eventId", commentController.getComments);
router.put("/:commentId", commentController.editComment);
router.delete("/:commentId", commentController.deleteComment);

// Comment engagement
router.post("/:commentId/like", commentController.toggleLike);
router.post("/:commentId/reply", commentController.replyToComment);
router.post("/:commentId/report", commentController.reportComment);

// Moderation routes (organizer/admin only)
router.patch("/:commentId/pin", commentController.pinComment);
router.delete("/:commentId/moderate", commentController.moderateDelete);
router.get("/moderation/reported", commentController.getReportedComments);

module.exports = router;
