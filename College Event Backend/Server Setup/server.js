const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("../Config Files/db");

// Load environment variables from Config Files directory
dotenv.config({ path: path.join(__dirname, "../Config Files/.env") });
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/auth", require("../routes/authRoutes"));
app.use("/api/events", require("../routes/eventRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
