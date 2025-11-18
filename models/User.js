const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "organizer", "admin"], default: "student" },

  // Extended Profile Information
  profile: {
    avatar: { type: String, default: "" }, // Cloudinary URL
    bio: { type: String, maxlength: 500, default: "" },
    phone: { type: String, default: "" },
    department: { type: String, default: "" },
    year: { type: String, enum: ["1st", "2nd", "3rd", "4th", "Alumni", ""], default: "" },
    interests: { type: [String], default: [] }, // e.g., ["Tech", "Sports", "Cultural"]
    socialLinks: {
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
      twitter: { type: String, default: "" },
      instagram: { type: String, default: "" }
    }
  },

  // Gamification: Badges & Achievements
  badges: [{
    name: { type: String, required: true },
    description: { type: String },
    icon: { type: String }, // Emoji or icon name
    earnedAt: { type: Date, default: Date.now }
  }],

  // User Statistics
  stats: {
    eventsAttended: { type: Number, default: 0 },
    eventsOrganized: { type: Number, default: 0 },
    commentsPosted: { type: Number, default: 0 }
  },

  // Notification Preferences
  notificationPreferences: {
    email: {
      enabled: { type: Boolean, default: true },
      eventReminders: { type: Boolean, default: true }, // 24h before event
      eventUpdates: { type: Boolean, default: true }, // When event details change
      comments: { type: Boolean, default: true }, // New comments on registered events
      registrations: { type: Boolean, default: true } // New registrations (for organizers)
    }
  }
}, { timestamps: true }); // Adds createdAt and updatedAt

module.exports = mongoose.model("User", userSchema);
