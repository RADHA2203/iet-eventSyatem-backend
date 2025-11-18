const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const cron = require("node-cron");
const connectDB = require("../Config Files/db");
const { sendBatchEventReminders } = require("../utils/emailService");

// Load environment variables from Backend root directory
const envPath = path.resolve(__dirname, "..", ".env");
console.log("Loading .env from:", envPath);
dotenv.config({ path: envPath });
console.log("MONGO_URI loaded:", process.env.MONGO_URI ? "✅ Yes" : "❌ No");
console.log("EMAIL_USER loaded:", process.env.EMAIL_USER ? "✅ Yes" : "❌ No");
connectDB();

const app = express();
app.use(express.json());
app.use(cors(
  {origin: "https://iet-eventsyatem-backend-production.up.railway.app/"}
));

// Setup cron job for event reminders
// Runs every day at 9:00 AM to send reminders for events happening in 24 hours
cron.schedule("0 9 * * *", async () => {
  console.log("🕐 Running scheduled event reminder job...");
  try {
    await sendBatchEventReminders();
    console.log("✅ Event reminder job completed successfully");
  } catch (error) {
    console.error("❌ Event reminder job failed:", error);
  }
});

console.log("✅ Cron job scheduled: Event reminders will be sent daily at 9:00 AM");

app.use("/api/auth", require("../routes/authRoutes"));
app.use("/api/events", require("../routes/eventRoutes"));
app.use("/api/users", require("../routes/userRoutes"));
app.use("/api/analytics", require("../routes/analyticsRoutes"));
app.use("/api/comments", require("../routes/commentRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
