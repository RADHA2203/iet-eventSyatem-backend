const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
    index: true // For faster queries
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  content: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 500,
    trim: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
    default: null // null means top-level comment
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  isReported: {
    type: Boolean,
    default: false
  },
  reportedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Index for faster queries
commentSchema.index({ eventId: 1, createdAt: -1 });
commentSchema.index({ parentId: 1 });

// Virtual for reply count
commentSchema.virtual("replyCount", {
  ref: "Comment",
  localField: "_id",
  foreignField: "parentId",
  count: true
});

// Ensure virtuals are included in JSON
commentSchema.set("toJSON", { virtuals: true });
commentSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Comment", commentSchema);
