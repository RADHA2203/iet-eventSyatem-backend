const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173";

// Base email template with consistent styling
const baseEmailTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IET DAVV Events</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 0 20px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .content {
      padding: 30px;
    }
    .event-card {
      background: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 20px;
      margin: 20px 0;
      border-radius: 5px;
    }
    .event-detail {
      margin: 10px 0;
      font-size: 15px;
    }
    .event-detail strong {
      color: #667eea;
      display: inline-block;
      width: 120px;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white !important;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;
    }
    .button:hover {
      opacity: 0.9;
    }
    .footer {
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    .banner-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
      border-radius: 5px;
      margin: 15px 0;
    }
    .badge {
      display: inline-block;
      padding: 5px 15px;
      background: #667eea;
      color: white;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      margin: 5px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 IET DAVV Events</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>Institute of Engineering & Technology, DAVV</p>
      <p>This is an automated email. Please do not reply to this message.</p>
      <p style="margin-top: 15px;">
        <a href="${frontendURL}/profile" style="color: #667eea; text-decoration: none;">Manage Notification Preferences</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

// Event Registration Confirmation Email
const registrationConfirmationEmail = (user, event) => {
  const eventDate = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const eventTime = new Date(event.date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const content = `
    <h2>🎉 Registration Confirmed!</h2>
    <p>Dear ${user.name},</p>
    <p>You have successfully registered for the following event:</p>

    <div class="event-card">
      ${event.banner ? `<img src="${event.banner}" alt="${event.title}" class="banner-image">` : ""}
      <h3 style="margin-top: 0; color: #667eea;">${event.title}</h3>
      <div class="event-detail"><strong>📅 Date:</strong> ${eventDate}</div>
      <div class="event-detail"><strong>⏰ Time:</strong> ${eventTime}</div>
      <div class="event-detail"><strong>📍 Location:</strong> ${event.location}</div>
      <div class="event-detail"><strong>🏷️ Category:</strong> <span class="badge">${event.category}</span></div>
      ${event.capacity ? `<div class="event-detail"><strong>👥 Capacity:</strong> ${event.attendees?.length || 0} / ${event.capacity} registered</div>` : ""}
    </div>

    <p><strong>What's Next?</strong></p>
    <ul>
      <li>📧 You'll receive a reminder 24 hours before the event</li>
      <li>🔔 Check your dashboard for event updates</li>
      <li>💬 Join the discussion and connect with other attendees</li>
    </ul>

    <center>
      <a href="${frontendURL}/events/${event._id}" class="button">View Event Details</a>
    </center>

    <p>We look forward to seeing you there!</p>
    <p>Best regards,<br><strong>IET DAVV Events Team</strong></p>
  `;

  return baseEmailTemplate(content);
};

// Event Reminder Email (24 hours before)
const eventReminderEmail = (user, event) => {
  const eventDate = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const eventTime = new Date(event.date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const content = `
    <h2>⏰ Event Reminder: Tomorrow!</h2>
    <p>Dear ${user.name},</p>
    <p>This is a friendly reminder that you're registered for an event <strong>happening tomorrow</strong>:</p>

    <div class="event-card">
      ${event.banner ? `<img src="${event.banner}" alt="${event.title}" class="banner-image">` : ""}
      <h3 style="margin-top: 0; color: #667eea;">${event.title}</h3>
      <div class="event-detail"><strong>📅 Date:</strong> ${eventDate}</div>
      <div class="event-detail"><strong>⏰ Time:</strong> ${eventTime}</div>
      <div class="event-detail"><strong>📍 Location:</strong> ${event.location}</div>
      <div class="event-detail"><strong>🏷️ Category:</strong> <span class="badge">${event.category}</span></div>
    </div>

    <p><strong>Don't Forget:</strong></p>
    <ul>
      <li>✅ Mark your calendar</li>
      <li>📍 Note the location: ${event.location}</li>
      <li>💼 Bring any required materials</li>
      <li>🕐 Arrive 10 minutes early</li>
    </ul>

    <center>
      <a href="${frontendURL}/events/${event._id}" class="button">View Event Details</a>
    </center>

    <p>See you tomorrow!</p>
    <p>Best regards,<br><strong>IET DAVV Events Team</strong></p>
  `;

  return baseEmailTemplate(content);
};

// Event Update Notification Email
const eventUpdateEmail = (user, event, changes) => {
  const eventDate = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const eventTime = new Date(event.date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const content = `
    <h2>📢 Event Update Notification</h2>
    <p>Dear ${user.name},</p>
    <p>Important updates have been made to an event you're registered for:</p>

    <div class="event-card">
      ${event.banner ? `<img src="${event.banner}" alt="${event.title}" class="banner-image">` : ""}
      <h3 style="margin-top: 0; color: #667eea;">${event.title}</h3>
      <div class="event-detail"><strong>📅 Date:</strong> ${eventDate}</div>
      <div class="event-detail"><strong>⏰ Time:</strong> ${eventTime}</div>
      <div class="event-detail"><strong>📍 Location:</strong> ${event.location}</div>
      <div class="event-detail"><strong>🏷️ Category:</strong> <span class="badge">${event.category}</span></div>
    </div>

    ${changes ? `
    <p><strong>What Changed:</strong></p>
    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 5px; margin: 15px 0;">
      ${changes}
    </div>
    ` : ""}

    <center>
      <a href="${frontendURL}/events/${event._id}" class="button">View Updated Details</a>
    </center>

    <p>Please make note of these changes. We apologize for any inconvenience.</p>
    <p>Best regards,<br><strong>IET DAVV Events Team</strong></p>
  `;

  return baseEmailTemplate(content);
};

// Event Cancellation Email
const eventCancellationEmail = (user, event, reason) => {
  const content = `
    <h2>❌ Event Cancelled</h2>
    <p>Dear ${user.name},</p>
    <p>We regret to inform you that the following event has been <strong>cancelled</strong>:</p>

    <div class="event-card" style="border-left-color: #dc3545;">
      ${event.banner ? `<img src="${event.banner}" alt="${event.title}" class="banner-image" style="opacity: 0.6;">` : ""}
      <h3 style="margin-top: 0; color: #dc3545;">${event.title}</h3>
      <div class="event-detail"><strong>📅 Was Scheduled:</strong> ${new Date(event.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
      <div class="event-detail"><strong>📍 Location:</strong> ${event.location}</div>
      <div class="event-detail"><strong>🏷️ Category:</strong> <span class="badge" style="background: #dc3545;">${event.category}</span></div>
    </div>

    ${reason ? `
    <p><strong>Reason:</strong></p>
    <div style="background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; border-radius: 5px; margin: 15px 0;">
      ${reason}
    </div>
    ` : ""}

    <p>We apologize for any inconvenience this may cause. Please check our events page for other upcoming events you might be interested in.</p>

    <center>
      <a href="${frontendURL}/events" class="button">Browse Other Events</a>
    </center>

    <p>Thank you for your understanding.</p>
    <p>Best regards,<br><strong>IET DAVV Events Team</strong></p>
  `;

  return baseEmailTemplate(content);
};

// New Comment Notification Email
const newCommentEmail = (user, event, comment, commenter) => {
  const content = `
    <h2>💬 New Comment on Your Event</h2>
    <p>Dear ${user.name},</p>
    <p>Someone commented on an event you're interested in:</p>

    <div class="event-card">
      <h3 style="margin-top: 0; color: #667eea;">${event.title}</h3>
    </div>

    <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; border-radius: 5px; margin: 15px 0;">
      <p style="margin: 0 0 10px 0;"><strong>${commenter.name}</strong> commented:</p>
      <p style="margin: 0; color: #666;">"${comment.content}"</p>
    </div>

    <center>
      <a href="${frontendURL}/events/${event._id}#comments" class="button">View Comment</a>
    </center>

    <p>Join the discussion and share your thoughts!</p>
    <p>Best regards,<br><strong>IET DAVV Events Team</strong></p>
  `;

  return baseEmailTemplate(content);
};

// New Registration Notification for Organizers
const newRegistrationEmail = (organizer, event, student) => {
  const content = `
    <h2>🎉 New Registration for Your Event</h2>
    <p>Dear ${organizer.name},</p>
    <p>Good news! A student has registered for your event:</p>

    <div class="event-card">
      <h3 style="margin-top: 0; color: #667eea;">${event.title}</h3>
      <div class="event-detail"><strong>📅 Date:</strong> ${new Date(event.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
      <div class="event-detail"><strong>👥 Total Registered:</strong> ${event.attendees?.length || 0}${event.capacity ? ` / ${event.capacity}` : ""}</div>
    </div>

    <div style="background: #d4edda; border-left: 4px solid #28a745; padding: 15px; border-radius: 5px; margin: 15px 0;">
      <p style="margin: 0;"><strong>New Attendee:</strong></p>
      <p style="margin: 5px 0 0 0;">👤 ${student.name}</p>
      <p style="margin: 5px 0 0 0;">📧 ${student.email}</p>
      ${student.profile?.department ? `<p style="margin: 5px 0 0 0;">🏢 ${student.profile.department}</p>` : ""}
      ${student.profile?.year ? `<p style="margin: 5px 0 0 0;">📚 ${student.profile.year} Year</p>` : ""}
    </div>

    <center>
      <a href="${frontendURL}/events/${event._id}" class="button">View Event Details</a>
    </center>

    <p>Keep up the great work organizing amazing events!</p>
    <p>Best regards,<br><strong>IET DAVV Events Team</strong></p>
  `;

  return baseEmailTemplate(content);
};

// Welcome Email for New Users
const welcomeEmail = (user) => {
  const content = `
    <h2>🎉 Welcome to IET DAVV Events!</h2>
    <p>Dear ${user.name},</p>
    <p>Thank you for joining our College Event Management System. We're excited to have you as part of our community!</p>

    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
      <h3 style="margin: 0 0 15px 0;">Your account has been created successfully!</h3>
      <p style="margin: 0; font-size: 18px;">Role: <strong>${user.role.toUpperCase()}</strong></p>
    </div>

    <p><strong>What You Can Do:</strong></p>
    <ul>
      <li>🎪 Browse and discover exciting campus events</li>
      <li>✅ Register for events with one click</li>
      <li>💬 Engage with event discussions</li>
      <li>🏆 Earn badges and achievements</li>
      <li>📊 Track your event history</li>
      ${user.role === "organizer" ? "<li>🎯 Create and manage your own events</li>" : ""}
    </ul>

    <center>
      <a href="${frontendURL}/events" class="button">Explore Events</a>
    </center>

    <p><strong>Quick Tips:</strong></p>
    <ul>
      <li>Complete your profile to get personalized recommendations</li>
      <li>Enable notifications to never miss an event</li>
      <li>Check your dashboard regularly for updates</li>
    </ul>

    <p>If you have any questions, feel free to reach out to us.</p>
    <p>Happy exploring!</p>
    <p>Best regards,<br><strong>IET DAVV Events Team</strong></p>
  `;

  return baseEmailTemplate(content);
};

module.exports = {
  registrationConfirmationEmail,
  eventReminderEmail,
  eventUpdateEmail,
  eventCancellationEmail,
  newCommentEmail,
  newRegistrationEmail,
  welcomeEmail,
};
