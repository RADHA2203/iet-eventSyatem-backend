const Event = require("../models/Event");
const User = require("../models/User");
const { cloudinary } = require("../Config Files/cloudinary");
const { updateStatsAndCheckBadges, checkAndAwardBadges } = require("../utils/badgeSystem");
const {
  sendRegistrationConfirmation,
  sendEventUpdateNotification,
  sendNewRegistrationNotification,
} = require("../utils/emailService");

// Create Event (Organizer/Admin)
exports.createEvent = async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      createdBy: req.user.id,
      banner: req.file ? req.file.path : null, // Cloudinary URL
    };

    const event = new Event(eventData);
    await event.save();

    // Update stats and check for badges (Event Creator badge)
    const result = await updateStatsAndCheckBadges(req.user.id, "eventsOrganized");

    const populatedEvent = await Event.findById(event._id).populate("createdBy", "name email role");

    const response = {
      message: "Event created successfully",
      event: populatedEvent
    };

    // Include new badges in response if any were awarded
    if (result && result.newBadges && result.newBadges.length > 0) {
      response.newBadges = result.newBadges;
    }

    res.status(201).json(response);
  } catch (error) {
    console.error("Event creation error:", error);
    res.status(500).json({ error: "Event creation failed", details: error.message });
  }
};

// Get All Events (with filters)
exports.getEvents = async (req, res) => {
  try {
    const { status, category, featured, upcoming, popular, search } = req.query;

    let query = { status: "published" }; // Only show published events by default

    if (status) query.status = status;
    if (category) query.category = category;
    if (featured === "true") query.featured = true;
    if (upcoming === "true") {
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      query.date = { $gte: new Date(), $lte: sevenDaysFromNow };
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    let events = await Event.find(query)
      .populate("createdBy", "name email role")
      .sort({ date: 1 }); // Sort by date ascending

    // If popular=true, sort by number of views (descending)
    if (popular === "true") {
      events = events.sort((a, b) => b.views.length - a.views.length);
    }

    res.json(events);
  } catch (error) {
    console.error("Fetching events error:", error);
    res.status(500).json({ error: "Fetching events failed" });
  }
};

// Get Single Event (with view tracking)
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("createdBy", "name email role")
      .populate("attendees", "name email");

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Track unique view (if user is logged in)
    if (req.user && !event.views.includes(req.user.id)) {
      event.views.push(req.user.id);
      await event.save();
    }

    res.json(event);
  } catch (error) {
    console.error("Fetching event error:", error);
    res.status(500).json({ error: "Fetching event failed" });
  }
};

// Update Event (Organizer/Admin - only own events)
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Check if user owns this event (or is admin)
    if (event.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized to update this event" });
    }

    // Track what changed for email notification
    const changes = [];
    if (req.body.title && req.body.title !== event.title) {
      changes.push(`Title changed to: ${req.body.title}`);
    }
    if (req.body.date && new Date(req.body.date).getTime() !== new Date(event.date).getTime()) {
      changes.push(`Date/Time changed to: ${new Date(req.body.date).toLocaleString()}`);
    }
    if (req.body.location && req.body.location !== event.location) {
      changes.push(`Location changed to: ${req.body.location}`);
    }

    // Handle banner update
    if (req.file) {
      // Delete old image from Cloudinary if exists
      if (event.banner) {
        const publicId = event.banner.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`cems_event_banners/${publicId}`);
      }
      req.body.banner = req.file.path;
    }

    Object.assign(event, req.body);
    await event.save();

    const updatedEvent = await Event.findById(event._id)
      .populate("createdBy", "name email role")
      .populate("attendees");

    // Send update notification emails to all attendees
    if (changes.length > 0 && updatedEvent.attendees.length > 0) {
      try {
        const changesText = changes.map(change => `• ${change}`).join('<br>');

        for (const attendee of updatedEvent.attendees) {
          try {
            await sendEventUpdateNotification(attendee, updatedEvent, changesText);
          } catch (emailError) {
            console.error(`Failed to send update email to ${attendee.email}:`, emailError.message);
          }
        }
      } catch (emailError) {
        console.error("Email notification error:", emailError);
        // Don't fail the update if email fails
      }
    }

    res.json({ message: "Event updated successfully", event: updatedEvent });
  } catch (error) {
    console.error("Update event error:", error);
    res.status(500).json({ error: "Event update failed", details: error.message });
  }
};

// Delete Event (Organizer/Admin - only own events)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Check if user owns this event (or is admin)
    if (event.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized to delete this event" });
    }

    // Delete banner from Cloudinary if exists
    if (event.banner) {
      const publicId = event.banner.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`cems_event_banners/${publicId}`);
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Delete event error:", error);
    res.status(500).json({ error: "Event deletion failed" });
  }
};

// Register for Event (Student)
exports.registerForEvent = async (req, res) => {
  try {
    console.log("=== Register for Event Request ===");
    console.log("Event ID:", req.params.id);
    console.log("User ID:", req.user?.id);
    console.log("User Role:", req.user?.role);

    const event = await Event.findById(req.params.id);

    if (!event) {
      console.log("❌ Event not found");
      return res.status(404).json({ error: "Event not found" });
    }

    console.log("Event Status:", event.status);
    console.log("Event Attendees:", event.attendees.length);
    console.log("Event Capacity:", event.capacity);

    if (event.status !== "published") {
      console.log("❌ Event is not published");
      return res.status(400).json({ error: "Cannot register for this event" });
    }

    // Check if already registered
    if (event.attendees.includes(req.user.id)) {
      console.log("❌ User already registered");
      return res.status(400).json({ error: "Already registered for this event" });
    }

    // Check capacity
    if (event.capacity && event.attendees.length >= event.capacity) {
      console.log("❌ Event is full");
      return res.status(400).json({ error: "Event is full" });
    }

    event.attendees.push(req.user.id);
    await event.save();

    // Update stats and check for badges (First Step, Active Participant badges)
    const result = await updateStatsAndCheckBadges(req.user.id, "eventsAttended");

    // Check if organizer earned "Popular Organizer" badge (50+ attendees)
    if (event.attendees.length >= 50) {
      await checkAndAwardBadges(event.createdBy.toString(), {
        attendeesCount: event.attendees.length
      });
    }

    // Send email notifications
    try {
      // Get full user and organizer details
      const student = await User.findById(req.user.id);
      const organizer = await User.findById(event.createdBy);
      const populatedEvent = await Event.findById(event._id).populate("createdBy attendees");

      // Send confirmation email to student
      await sendRegistrationConfirmation(student, populatedEvent);

      // Send notification email to organizer
      if (organizer) {
        await sendNewRegistrationNotification(organizer, populatedEvent, student);
      }
    } catch (emailError) {
      console.error("Email notification error:", emailError);
      // Don't fail the registration if email fails
    }

    const response = {
      message: "Successfully registered for event",
      event
    };

    // Include new badges in response if any were awarded
    if (result && result.newBadges && result.newBadges.length > 0) {
      response.newBadges = result.newBadges;
    }

    res.json(response);
  } catch (error) {
    console.error("Event registration error:", error);
    res.status(500).json({ error: "Event registration failed" });
  }
};

// Unregister from Event (Student)
exports.unregisterFromEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    event.attendees = event.attendees.filter(
      (attendeeId) => attendeeId.toString() !== req.user.id
    );
    await event.save();

    res.json({ message: "Successfully unregistered from event" });
  } catch (error) {
    console.error("Unregister error:", error);
    res.status(500).json({ error: "Unregister failed" });
  }
};

// Get My Registered Events (Student)
exports.getMyRegisteredEvents = async (req, res) => {
  try {
    const events = await Event.find({ attendees: req.user.id })
      .populate("createdBy", "name email role")
      .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    console.error("Fetching registered events error:", error);
    res.status(500).json({ error: "Fetching registered events failed" });
  }
};

// Get My Created Events (Organizer)
exports.getMyCreatedEvents = async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.user.id })
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.json(events);
  } catch (error) {
    console.error("Fetching created events error:", error);
    res.status(500).json({ error: "Fetching created events failed" });
  }
};

// Toggle Featured Status (Admin only)
exports.toggleFeatured = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Only admins can feature events" });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    event.featured = !event.featured;
    await event.save();

    res.json({ message: `Event ${event.featured ? "featured" : "unfeatured"} successfully`, event });
  } catch (error) {
    console.error("Toggle featured error:", error);
    res.status(500).json({ error: "Toggle featured failed" });
  }
};

// Get Dashboard Stats (for organizers/admin)
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = userRole === "admin" ? {} : { createdBy: userId };

    const totalEvents = await Event.countDocuments(query);
    const publishedEvents = await Event.countDocuments({ ...query, status: "published" });
    const draftEvents = await Event.countDocuments({ ...query, status: "draft" });

    const events = await Event.find(query);
    const totalRegistrations = events.reduce((sum, event) => sum + event.attendees.length, 0);

    res.json({
      totalEvents,
      publishedEvents,
      draftEvents,
      totalRegistrations,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ error: "Fetching dashboard stats failed" });
  }
};
