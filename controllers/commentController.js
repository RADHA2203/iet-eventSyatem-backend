const Comment = require("../models/Comment");
const Event = require("../models/Event");

// Create a new comment
exports.createComment = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // Validate event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Validate content
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Comment content is required" });
    }

    if (content.length > 500) {
      return res.status(400).json({ error: "Comment must be 500 characters or less" });
    }

    // Create comment
    const comment = new Comment({
      eventId,
      userId,
      content: content.trim()
    });

    await comment.save();

    // Populate user info
    await comment.populate("userId", "name email profile.avatar role");

    res.status(201).json({
      message: "Comment added successfully",
      comment
    });
  } catch (error) {
    console.error("Create comment error:", error);
    res.status(500).json({ error: "Failed to create comment" });
  }
};

// Get all comments for an event
exports.getComments = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { sort = "latest" } = req.query;

    // Validate event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Build query - only show non-deleted comments
    let query = Comment.find({
      eventId,
      isDeleted: false,
      parentId: null // Only top-level comments
    }).populate("userId", "name email profile.avatar role");

    // Apply sorting
    switch (sort) {
      case "oldest":
        query = query.sort({ createdAt: 1 });
        break;
      case "likes":
        query = query.sort({ likes: -1, createdAt: -1 });
        break;
      case "latest":
      default:
        query = query.sort({ isPinned: -1, createdAt: -1 }); // Pinned first, then latest
    }

    const comments = await query.exec();

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({
          parentId: comment._id,
          isDeleted: false
        })
          .populate("userId", "name email profile.avatar role")
          .sort({ createdAt: 1 })
          .exec();

        return {
          ...comment.toObject(),
          replies,
          likesCount: comment.likes.length,
          isLiked: req.user ? comment.likes.includes(req.user.id) : false
        };
      })
    );

    res.json({
      comments: commentsWithReplies,
      total: comments.length
    });
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
};

// Edit own comment
exports.editComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (comment.isDeleted) {
      return res.status(400).json({ error: "Cannot edit deleted comment" });
    }

    // Check ownership
    if (comment.userId.toString() !== userId) {
      return res.status(403).json({ error: "You can only edit your own comments" });
    }

    // Validate content
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Comment content is required" });
    }

    if (content.length > 500) {
      return res.status(400).json({ error: "Comment must be 500 characters or less" });
    }

    comment.content = content.trim();
    await comment.save();

    await comment.populate("userId", "name email profile.avatar role");

    res.json({
      message: "Comment updated successfully",
      comment
    });
  } catch (error) {
    console.error("Edit comment error:", error);
    res.status(500).json({ error: "Failed to edit comment" });
  }
};

// Delete own comment
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // Check ownership
    if (comment.userId.toString() !== userId) {
      return res.status(403).json({ error: "You can only delete your own comments" });
    }

    // Soft delete
    comment.isDeleted = true;
    await comment.save();

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ error: "Failed to delete comment" });
  }
};

// Toggle like on comment
exports.toggleLike = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (comment.isDeleted) {
      return res.status(400).json({ error: "Cannot like deleted comment" });
    }

    // Toggle like
    const likeIndex = comment.likes.indexOf(userId);
    if (likeIndex > -1) {
      // Unlike
      comment.likes.splice(likeIndex, 1);
    } else {
      // Like
      comment.likes.push(userId);
    }

    await comment.save();

    res.json({
      message: likeIndex > -1 ? "Comment unliked" : "Comment liked",
      likesCount: comment.likes.length,
      isLiked: likeIndex === -1
    });
  } catch (error) {
    console.error("Toggle like error:", error);
    res.status(500).json({ error: "Failed to toggle like" });
  }
};

// Reply to a comment
exports.replyToComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // Validate parent comment exists
    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      return res.status(404).json({ error: "Parent comment not found" });
    }

    if (parentComment.isDeleted) {
      return res.status(400).json({ error: "Cannot reply to deleted comment" });
    }

    // Don't allow nested replies (only 1 level deep)
    if (parentComment.parentId) {
      return res.status(400).json({ error: "Cannot reply to a reply. Please reply to the parent comment." });
    }

    // Validate content
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Reply content is required" });
    }

    if (content.length > 500) {
      return res.status(400).json({ error: "Reply must be 500 characters or less" });
    }

    // Create reply
    const reply = new Comment({
      eventId: parentComment.eventId,
      userId,
      content: content.trim(),
      parentId: commentId
    });

    await reply.save();
    await reply.populate("userId", "name email profile.avatar role");

    res.status(201).json({
      message: "Reply added successfully",
      comment: reply
    });
  } catch (error) {
    console.error("Reply to comment error:", error);
    res.status(500).json({ error: "Failed to add reply" });
  }
};

// Report a comment
exports.reportComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (comment.isDeleted) {
      return res.status(400).json({ error: "Cannot report deleted comment" });
    }

    // Check if already reported by this user
    if (comment.reportedBy.includes(userId)) {
      return res.status(400).json({ error: "You have already reported this comment" });
    }

    comment.reportedBy.push(userId);
    comment.isReported = true;
    await comment.save();

    res.json({ message: "Comment reported successfully" });
  } catch (error) {
    console.error("Report comment error:", error);
    res.status(500).json({ error: "Failed to report comment" });
  }
};

// Pin comment (organizer/admin only)
exports.pinComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const comment = await Comment.findById(commentId).populate("eventId");

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // Check if user is organizer of this event or admin
    const event = comment.eventId;
    if (userRole !== "admin" && event.createdBy.toString() !== userId) {
      return res.status(403).json({ error: "Only event organizers and admins can pin comments" });
    }

    comment.isPinned = !comment.isPinned;
    await comment.save();

    res.json({
      message: comment.isPinned ? "Comment pinned successfully" : "Comment unpinned successfully",
      isPinned: comment.isPinned
    });
  } catch (error) {
    console.error("Pin comment error:", error);
    res.status(500).json({ error: "Failed to pin comment" });
  }
};

// Delete any comment (moderation - organizer/admin only)
exports.moderateDelete = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const comment = await Comment.findById(commentId).populate("eventId");

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // Check if user is organizer of this event or admin
    const event = comment.eventId;
    if (userRole !== "admin" && event.createdBy.toString() !== userId) {
      return res.status(403).json({ error: "Only event organizers and admins can moderate comments" });
    }

    // Soft delete
    comment.isDeleted = true;
    await comment.save();

    // Also delete all replies
    await Comment.updateMany(
      { parentId: commentId },
      { isDeleted: true }
    );

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Moderate delete error:", error);
    res.status(500).json({ error: "Failed to delete comment" });
  }
};

// Get reported comments (organizer/admin only)
exports.getReportedComments = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = { isReported: true, isDeleted: false };

    // If organizer, only show comments from their events
    if (userRole === "organizer") {
      const events = await Event.find({ createdBy: userId }).select("_id");
      const eventIds = events.map(e => e._id);
      query.eventId = { $in: eventIds };
    }

    const reportedComments = await Comment.find(query)
      .populate("userId", "name email profile.avatar role")
      .populate("eventId", "title")
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      comments: reportedComments,
      total: reportedComments.length
    });
  } catch (error) {
    console.error("Get reported comments error:", error);
    res.status(500).json({ error: "Failed to fetch reported comments" });
  }
};

module.exports = exports;
