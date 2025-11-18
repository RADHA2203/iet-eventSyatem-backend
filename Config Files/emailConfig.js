const nodemailer = require("nodemailer");
const path = require("path");
// Load .env from Backend root directory
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email configuration error:", error);
  } else {
    console.log("✅ Email server is ready to send messages");
  }
});

module.exports = transporter;
