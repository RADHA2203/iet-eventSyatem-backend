const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  category: {
    type: String,
    enum: ["Sports", "Tech", "Cultural", "Workshop", "Seminar", "Competition"],
    required: true
  },
  capacity: { type: Number, default: null }, // null = unlimited capacity
  banner: { type: String, default: null }, // Cloudinary image URL
  status: {
    type: String,
    enum: ["draft", "published", "cancelled"],
    default: "published"
  },
  featured: { type: Boolean, default: false }, // Admin can manually feature events
  views: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Track unique views per user
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true }); // Auto-add createdAt and updatedAt

module.exports = mongoose.model("Event", eventSchema);
