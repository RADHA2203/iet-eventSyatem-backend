const User = require("../models/User");

// Badge definitions with criteria
const BADGES = {
  FIRST_STEP: {
    name: "First Step",
    description: "Attended your first event",
    icon: "🎉",
    criteria: (stats) => stats.eventsAttended === 1
  },
  ACTIVE_PARTICIPANT: {
    name: "Active Participant",
    description: "Attended 5 events",
    icon: "⭐",
    criteria: (stats) => stats.eventsAttended === 5
  },
  EVENT_ENTHUSIAST: {
    name: "Event Enthusiast",
    description: "Attended 10 events",
    icon: "🏆",
    criteria: (stats) => stats.eventsAttended === 10
  },
  EVENT_VETERAN: {
    name: "Event Veteran",
    description: "Attended 25 events",
    icon: "💎",
    criteria: (stats) => stats.eventsAttended === 25
  },
  EVENT_CREATOR: {
    name: "Event Creator",
    description: "Organized your first event",
    icon: "🎪",
    criteria: (stats) => stats.eventsOrganized === 1
  },
  POPULAR_ORGANIZER: {
    name: "Popular Organizer",
    description: "Organized an event with 50+ attendees",
    icon: "🌟",
    criteria: (stats, eventData) => eventData && eventData.attendeesCount >= 50
  },
  SUPER_ORGANIZER: {
    name: "Super Organizer",
    description: "Organized 10 events",
    icon: "👑",
    criteria: (stats) => stats.eventsOrganized === 10
  },
  CONVERSATION_STARTER: {
    name: "Conversation Starter",
    description: "Posted 10 comments",
    icon: "💬",
    criteria: (stats) => stats.commentsPosted === 10
  },
  COMMUNITY_BUILDER: {
    name: "Community Builder",
    description: "Posted 50 comments",
    icon: "🤝",
    criteria: (stats) => stats.commentsPosted === 50
  }
};

/**
 * Check and award badges to a user based on their current stats
 * @param {String} userId - User ID
 * @param {Object} eventData - Optional event-specific data (e.g., attendeesCount)
 */
const checkAndAwardBadges = async (userId, eventData = null) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      console.error("User not found for badge check");
      return;
    }

    const newBadges = [];

    // Check each badge
    for (const [key, badge] of Object.entries(BADGES)) {
      // Check if user already has this badge
      const hasBadge = user.badges.some(b => b.name === badge.name);

      if (!hasBadge) {
        // Check if user meets the criteria for this badge
        const meetsCriteria = badge.criteria(user.stats, eventData);

        if (meetsCriteria) {
          user.badges.push({
            name: badge.name,
            description: badge.description,
            icon: badge.icon,
            earnedAt: new Date()
          });
          newBadges.push(badge.name);
        }
      }
    }

    if (newBadges.length > 0) {
      await user.save();
      console.log(`Awarded badges to user ${userId}:`, newBadges);
      return newBadges;
    }

    return [];
  } catch (error) {
    console.error("Error in badge system:", error);
    return [];
  }
};

/**
 * Increment user stats and check for badges
 * @param {String} userId - User ID
 * @param {String} statType - 'eventsAttended' | 'eventsOrganized' | 'commentsPosted'
 * @param {Number} increment - Amount to increment (default: 1)
 * @param {Object} eventData - Optional event-specific data
 */
const updateStatsAndCheckBadges = async (userId, statType, increment = 1, eventData = null) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      console.error("User not found for stats update");
      return;
    }

    // Update stats
    user.stats[statType] += increment;
    await user.save();

    // Check for new badges
    const newBadges = await checkAndAwardBadges(userId, eventData);

    return {
      updatedStats: user.stats,
      newBadges
    };
  } catch (error) {
    console.error("Error updating stats:", error);
    return null;
  }
};

/**
 * Get all available badges
 */
const getAllBadges = () => {
  return Object.values(BADGES).map(badge => ({
    name: badge.name,
    description: badge.description,
    icon: badge.icon
  }));
};

module.exports = {
  checkAndAwardBadges,
  updateStatsAndCheckBadges,
  getAllBadges,
  BADGES
};
