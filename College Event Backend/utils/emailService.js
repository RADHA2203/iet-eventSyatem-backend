const transporter = require("../Config Files/emailConfig");
const {
  registrationConfirmationEmail,
  eventReminderEmail,
  eventUpdateEmail,
  eventCancellationEmail,
  newCommentEmail,
  newRegistrationEmail,
  welcomeEmail,
} = require("./emailTemplates");

// Helper function to check if user wants to receive emails
const shouldSendEmail = (user, emailType) => {
  // If user has no notification preferences, send by default
  if (!user.notificationPreferences?.email) {
    return true;
  }

  const prefs = user.notificationPreferences.email;

  // Check if email notifications are globally enabled
  if (!prefs.enabled) {
    return false;
  }

  // Check specific email type preferences
  switch (emailType) {
    case "eventReminders":
      return prefs.eventReminders !== false;
    case "eventUpdates":
      return prefs.eventUpdates !== false;
    case "comments":
      return prefs.comments !== false;
    case "registrations":
      return prefs.registrations !== false;
    default:
      return true;
  }
};

// Send registration confirmation email
const sendRegistrationConfirmation = async (user, event) => {
  try {
    if (!shouldSendEmail(user, "eventReminders")) {
      console.log(`⏭️ Skipping registration email for ${user.email} (user preference)`);
      return;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: `✅ Registration Confirmed: ${event.title}`,
      html: registrationConfirmationEmail(user, event),
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Registration confirmation sent to ${user.email}`);
  } catch (error) {
    console.error("❌ Error sending registration confirmation:", error);
    throw error;
  }
};

// Send event reminder email (24 hours before)
const sendEventReminder = async (user, event) => {
  try {
    if (!shouldSendEmail(user, "eventReminders")) {
      console.log(`⏭️ Skipping reminder email for ${user.email} (user preference)`);
      return;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: `⏰ Reminder: ${event.title} is Tomorrow!`,
      html: eventReminderEmail(user, event),
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Event reminder sent to ${user.email}`);
  } catch (error) {
    console.error("❌ Error sending event reminder:", error);
    throw error;
  }
};

// Send event update notification
const sendEventUpdateNotification = async (user, event, changes) => {
  try {
    if (!shouldSendEmail(user, "eventUpdates")) {
      console.log(`⏭️ Skipping update email for ${user.email} (user preference)`);
      return;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: `📢 Update: ${event.title}`,
      html: eventUpdateEmail(user, event, changes),
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Event update notification sent to ${user.email}`);
  } catch (error) {
    console.error("❌ Error sending event update notification:", error);
    throw error;
  }
};

// Send event cancellation notification
const sendEventCancellationNotification = async (user, event, reason) => {
  try {
    if (!shouldSendEmail(user, "eventUpdates")) {
      console.log(`⏭️ Skipping cancellation email for ${user.email} (user preference)`);
      return;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: `❌ Event Cancelled: ${event.title}`,
      html: eventCancellationEmail(user, event, reason),
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Event cancellation notification sent to ${user.email}`);
  } catch (error) {
    console.error("❌ Error sending event cancellation notification:", error);
    throw error;
  }
};

// Send new comment notification
const sendNewCommentNotification = async (user, event, comment, commenter) => {
  try {
    if (!shouldSendEmail(user, "comments")) {
      console.log(`⏭️ Skipping comment email for ${user.email} (user preference)`);
      return;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: `💬 New Comment: ${event.title}`,
      html: newCommentEmail(user, event, comment, commenter),
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ New comment notification sent to ${user.email}`);
  } catch (error) {
    console.error("❌ Error sending new comment notification:", error);
    throw error;
  }
};

// Send new registration notification to organizer
const sendNewRegistrationNotification = async (organizer, event, student) => {
  try {
    if (!shouldSendEmail(organizer, "registrations")) {
      console.log(`⏭️ Skipping registration notification for ${organizer.email} (user preference)`);
      return;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: organizer.email,
      subject: `🎉 New Registration: ${event.title}`,
      html: newRegistrationEmail(organizer, event, student),
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ New registration notification sent to ${organizer.email}`);
  } catch (error) {
    console.error("❌ Error sending new registration notification:", error);
    throw error;
  }
};

// Send welcome email to new users
const sendWelcomeEmail = async (user) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "🎉 Welcome to IET DAVV Events!",
      html: welcomeEmail(user),
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${user.email}`);
  } catch (error) {
    console.error("❌ Error sending welcome email:", error);
    // Don't throw error for welcome emails (non-critical)
  }
};

// Batch send event reminders (used by cron job)
const sendBatchEventReminders = async () => {
  try {
    const Event = require("../models/Event");
    const User = require("../models/User");

    // Find events happening in 24 hours (±1 hour window)
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 24);

    const oneDayFromNow = new Date(tomorrow);
    oneDayFromNow.setHours(oneDayFromNow.getHours() - 1);

    const oneDayPlusOneHour = new Date(tomorrow);
    oneDayPlusOneHour.setHours(oneDayPlusOneHour.getHours() + 1);

    const upcomingEvents = await Event.find({
      date: {
        $gte: oneDayFromNow,
        $lte: oneDayPlusOneHour,
      },
      status: "published",
    }).populate("attendees");

    console.log(`📧 Found ${upcomingEvents.length} events to send reminders for`);

    let sentCount = 0;
    let skippedCount = 0;

    for (const event of upcomingEvents) {
      for (const attendee of event.attendees) {
        try {
          await sendEventReminder(attendee, event);
          sentCount++;
        } catch (error) {
          console.error(`Failed to send reminder to ${attendee.email}:`, error.message);
          skippedCount++;
        }
      }
    }

    console.log(`✅ Batch reminders complete: ${sentCount} sent, ${skippedCount} skipped`);
    return { sentCount, skippedCount };
  } catch (error) {
    console.error("❌ Error in batch event reminders:", error);
    throw error;
  }
};

module.exports = {
  sendRegistrationConfirmation,
  sendEventReminder,
  sendEventUpdateNotification,
  sendEventCancellationNotification,
  sendNewCommentNotification,
  sendNewRegistrationNotification,
  sendWelcomeEmail,
  sendBatchEventReminders,
};
