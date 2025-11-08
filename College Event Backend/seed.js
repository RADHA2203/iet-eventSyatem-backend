const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "Config Files/.env") });

// Import models
const User = require("./models/User");
const Event = require("./models/Event");

// Sample Cloudinary images
const sampleImages = [
  "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
  "https://res.cloudinary.com/demo/image/upload/v1652345767/docs/models.jpg",
  "https://res.cloudinary.com/demo/image/upload/v1652366604/docs/colored_pencils.jpg",
  "https://res.cloudinary.com/demo/image/upload/v1652366604/docs/colored_pencils.jpg",
  "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
];

// Sample events data
const sampleEvents = [
  {
    title: "Tech Fest 2025 - Innovation Summit",
    description: "Join us for the biggest tech fest of the year! Featuring hackathons, coding competitions, tech talks from industry experts, and networking opportunities. Win prizes worth ₹1,00,000!",
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    location: "Main Auditorium, Block A",
    category: "Tech",
    capacity: 500,
    status: "published",
    featured: true,
    banner: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=600&fit=crop",
  },
  {
    title: "Annual Sports Championship 2025",
    description: "Inter-college sports championship featuring cricket, football, basketball, volleyball, and athletics. Show your sporting spirit and compete for the championship trophy!",
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    location: "Sports Complex",
    category: "Sports",
    capacity: 200,
    status: "published",
    featured: true,
    banner: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&h=600&fit=crop",
  },
  {
    title: "Cultural Fiesta - Rang De",
    description: "Experience the vibrant colors of culture! Featuring traditional dance performances, music concerts, drama, fashion show, and art exhibitions. Celebrate diversity!",
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
    location: "Open Air Theatre",
    category: "Cultural",
    capacity: 800,
    status: "published",
    featured: true,
    banner: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&h=600&fit=crop",
  },
  {
    title: "Web Development Workshop",
    description: "Learn modern web development from scratch! Topics covered: HTML, CSS, JavaScript, React, Node.js, and MongoDB. Hands-on training with real projects. Certificate provided.",
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    location: "Computer Lab 301",
    category: "Workshop",
    capacity: 50,
    status: "published",
    featured: false,
    banner: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=600&fit=crop",
  },
  {
    title: "AI & Machine Learning Seminar",
    description: "Discover the future of AI and Machine Learning with industry leaders. Topics: Deep Learning, Neural Networks, Computer Vision, NLP, and practical applications in industry.",
    date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
    location: "Seminar Hall, Block B",
    category: "Seminar",
    capacity: 300,
    status: "published",
    featured: false,
    banner: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=600&fit=crop",
  },
  {
    title: "National Coding Competition",
    description: "Test your coding skills in this national-level programming competition! Solve algorithmic problems, compete with the best coders, and win exciting prizes and internship opportunities.",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now (edge of 7-day window)
    location: "Online & Computer Center",
    category: "Competition",
    capacity: 150,
    status: "published",
    featured: true,
    banner: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=600&fit=crop",
  },
  {
    title: "Photography Workshop - Capture the Moment",
    description: "Master the art of photography! Learn composition, lighting, editing, and storytelling through images. Bring your camera and create stunning photographs.",
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    location: "Art Studio, Block C",
    category: "Workshop",
    capacity: 30,
    status: "published",
    featured: false,
    banner: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1200&h=600&fit=crop",
  },
  {
    title: "Entrepreneurship Summit 2025",
    description: "Meet successful entrepreneurs, learn startup strategies, pitch your ideas, and network with investors. Perfect for aspiring entrepreneurs and innovators!",
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    location: "Conference Hall",
    category: "Seminar",
    capacity: 200,
    status: "published",
    featured: false,
    banner: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&h=600&fit=crop",
  },
  {
    title: "Music Concert - Rock Night",
    description: "Rock your evening with live performances from college bands and special guest artists. Food stalls, games, and an electrifying atmosphere guaranteed!",
    date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    location: "Campus Ground",
    category: "Cultural",
    capacity: 1000,
    status: "published",
    featured: false,
    banner: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&h=600&fit=crop",
  },
  {
    title: "Basketball Tournament 2025",
    description: "3v3 Basketball championship! Form your team and compete for glory. Fast-paced action, thrilling matches, and amazing prizes await!",
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    location: "Basketball Court",
    category: "Sports",
    capacity: 100,
    status: "published",
    featured: false,
    banner: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&h=600&fit=crop",
  },
];

// Connect to MongoDB and seed data
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    // Find an organizer user (or create one)
    let organizer = await User.findOne({ role: "organizer" });

    if (!organizer) {
      // If no organizer exists, find any user and use them
      organizer = await User.findOne();

      if (!organizer) {
        console.log("❌ No users found in database. Please create a user first (register on the website).");
        process.exit(1);
      }
    }

    console.log(`✅ Using user: ${organizer.name} (${organizer.email}) as event creator`);

    // Clear existing events (optional - comment out if you want to keep existing events)
    await Event.deleteMany({});
    console.log("🗑️  Cleared existing events");

    // Create events
    const events = sampleEvents.map(event => ({
      ...event,
      createdBy: organizer._id,
      attendees: [],
      views: [],
    }));

    const createdEvents = await Event.insertMany(events);
    console.log(`✅ Created ${createdEvents.length} sample events`);

    console.log("\n🎉 Database seeded successfully!");
    console.log("\nCreated events:");
    createdEvents.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title} (${event.category})`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

// Run the seed script
seedDatabase();
