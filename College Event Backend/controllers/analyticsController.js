const Event = require("../models/Event");
const User = require("../models/User");

// Get Overview Statistics (Dashboard)
exports.getOverviewStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Different queries based on role
    let eventQuery = {};
    if (userRole === "organizer") {
      eventQuery.createdBy = userId;
    }
    // Admin sees all events

    const events = await Event.find(eventQuery).populate("createdBy attendees");

    // Calculate statistics
    const totalEvents = events.length;
    const publishedEvents = events.filter(e => e.status === "published").length;
    const draftEvents = events.filter(e => e.status === "draft").length;
    const totalRegistrations = events.reduce((sum, event) => sum + event.attendees.length, 0);
    const totalViews = events.reduce((sum, event) => sum + event.views.length, 0);

    // Upcoming events (next 30 days)
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    const upcomingEvents = events.filter(e =>
      new Date(e.date) >= now && new Date(e.date) <= thirtyDaysFromNow && e.status === "published"
    ).length;

    // Past events
    const pastEvents = events.filter(e => new Date(e.date) < now).length;

    // Average attendance rate
    const eventsWithCapacity = events.filter(e => e.capacity);
    const avgAttendanceRate = eventsWithCapacity.length > 0
      ? eventsWithCapacity.reduce((sum, e) => sum + (e.attendees.length / e.capacity * 100), 0) / eventsWithCapacity.length
      : 0;

    // Most popular event
    const mostPopularEvent = events.length > 0
      ? events.reduce((max, event) => event.attendees.length > max.attendees.length ? event : max, events[0])
      : null;

    res.json({
      totalEvents,
      publishedEvents,
      draftEvents,
      upcomingEvents,
      pastEvents,
      totalRegistrations,
      totalViews,
      avgAttendanceRate: Math.round(avgAttendanceRate * 100) / 100,
      mostPopularEvent: mostPopularEvent ? {
        id: mostPopularEvent._id,
        title: mostPopularEvent.title,
        attendees: mostPopularEvent.attendees.length,
        views: mostPopularEvent.views.length
      } : null
    });
  } catch (error) {
    console.error("Overview stats error:", error);
    res.status(500).json({ error: "Failed to fetch overview statistics" });
  }
};

// Get Category Distribution
exports.getCategoryStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let eventQuery = { status: "published" };
    if (userRole === "organizer") {
      eventQuery.createdBy = userId;
    }

    const events = await Event.find(eventQuery);

    // Group by category
    const categoryStats = events.reduce((acc, event) => {
      const category = event.category;
      if (!acc[category]) {
        acc[category] = {
          category,
          count: 0,
          totalAttendees: 0,
          totalViews: 0
        };
      }
      acc[category].count++;
      acc[category].totalAttendees += event.attendees.length;
      acc[category].totalViews += event.views.length;
      return acc;
    }, {});

    // Convert to array and sort by count
    const categoryArray = Object.values(categoryStats).sort((a, b) => b.count - a.count);

    res.json(categoryArray);
  } catch (error) {
    console.error("Category stats error:", error);
    res.status(500).json({ error: "Failed to fetch category statistics" });
  }
};

// Get Event Engagement Over Time
exports.getEngagementTimeline = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { period = "month" } = req.query; // week, month, year

    let eventQuery = { status: "published" };
    if (userRole === "organizer") {
      eventQuery.createdBy = userId;
    }

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    let groupBy;

    switch (period) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        groupBy = "day";
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        groupBy = "month";
        break;
      case "month":
      default:
        startDate.setMonth(now.getMonth() - 1);
        groupBy = "day";
    }

    eventQuery.createdAt = { $gte: startDate };

    const events = await Event.find(eventQuery);

    // Group events by time period
    const timeline = {};
    events.forEach(event => {
      const date = new Date(event.createdAt);
      let key;

      if (groupBy === "day") {
        key = date.toISOString().split('T')[0]; // YYYY-MM-DD
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
      }

      if (!timeline[key]) {
        timeline[key] = {
          date: key,
          events: 0,
          registrations: 0,
          views: 0
        };
      }

      timeline[key].events++;
      timeline[key].registrations += event.attendees.length;
      timeline[key].views += event.views.length;
    });

    // Convert to array and sort by date
    const timelineArray = Object.values(timeline).sort((a, b) =>
      new Date(a.date) - new Date(b.date)
    );

    res.json(timelineArray);
  } catch (error) {
    console.error("Engagement timeline error:", error);
    res.status(500).json({ error: "Failed to fetch engagement timeline" });
  }
};

// Get Top Performing Events
exports.getTopEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { limit = 5, sortBy = "attendees" } = req.query; // attendees, views, engagement

    let eventQuery = { status: "published" };
    if (userRole === "organizer") {
      eventQuery.createdBy = userId;
    }

    const events = await Event.find(eventQuery)
      .populate("createdBy", "name email")
      .lean();

    // Calculate engagement score (views + attendees * 2)
    const eventsWithScore = events.map(event => ({
      ...event,
      engagementScore: event.views.length + (event.attendees.length * 2)
    }));

    // Sort based on criteria
    let sortedEvents;
    switch (sortBy) {
      case "views":
        sortedEvents = eventsWithScore.sort((a, b) => b.views.length - a.views.length);
        break;
      case "engagement":
        sortedEvents = eventsWithScore.sort((a, b) => b.engagementScore - a.engagementScore);
        break;
      case "attendees":
      default:
        sortedEvents = eventsWithScore.sort((a, b) => b.attendees.length - a.attendees.length);
    }

    // Take top N events
    const topEvents = sortedEvents.slice(0, parseInt(limit)).map(event => ({
      id: event._id,
      title: event.title,
      category: event.category,
      date: event.date,
      attendees: event.attendees.length,
      views: event.views.length,
      capacity: event.capacity,
      engagementScore: event.engagementScore,
      createdBy: event.createdBy
    }));

    res.json(topEvents);
  } catch (error) {
    console.error("Top events error:", error);
    res.status(500).json({ error: "Failed to fetch top events" });
  }
};

// Get User Activity Stats (Admin only)
exports.getUserActivityStats = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const users = await User.find().select("name email role stats badges");
    const events = await Event.find();

    // Calculate statistics
    const totalUsers = users.length;
    const studentCount = users.filter(u => u.role === "student").length;
    const organizerCount = users.filter(u => u.role === "organizer").length;
    const adminCount = users.filter(u => u.role === "admin").length;

    // Most active students (by events attended)
    const activeStudents = users
      .filter(u => u.role === "student")
      .sort((a, b) => (b.stats?.eventsAttended || 0) - (a.stats?.eventsAttended || 0))
      .slice(0, 5)
      .map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        eventsAttended: u.stats?.eventsAttended || 0,
        badges: u.badges?.length || 0
      }));

    // Most active organizers (by events created)
    const activeOrganizers = users
      .filter(u => u.role === "organizer")
      .sort((a, b) => (b.stats?.eventsOrganized || 0) - (a.stats?.eventsOrganized || 0))
      .slice(0, 5)
      .map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        eventsOrganized: u.stats?.eventsOrganized || 0,
        badges: u.badges?.length || 0
      }));

    res.json({
      totalUsers,
      studentCount,
      organizerCount,
      adminCount,
      activeStudents,
      activeOrganizers
    });
  } catch (error) {
    console.error("User activity stats error:", error);
    res.status(500).json({ error: "Failed to fetch user activity statistics" });
  }
};

// Get Attendance Tracking for Specific Event (Organizer/Admin)
exports.getEventAttendance = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId)
      .populate("attendees", "name email profile.department profile.year")
      .populate("createdBy", "name email");

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Check authorization
    if (req.user.role !== "admin" && event.createdBy._id.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to view attendance" });
    }

    const attendanceData = {
      eventId: event._id,
      eventTitle: event.title,
      eventDate: event.date,
      capacity: event.capacity,
      totalAttendees: event.attendees.length,
      capacityUtilization: event.capacity ? Math.round((event.attendees.length / event.capacity) * 100) : null,
      attendees: event.attendees.map(attendee => ({
        id: attendee._id,
        name: attendee.name,
        email: attendee.email,
        department: attendee.profile?.department || "N/A",
        year: attendee.profile?.year || "N/A"
      }))
    };

    res.json(attendanceData);
  } catch (error) {
    console.error("Event attendance error:", error);
    res.status(500).json({ error: "Failed to fetch event attendance" });
  }
};

module.exports = exports;
