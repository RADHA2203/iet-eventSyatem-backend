# College Event Management System - Setup Guide

## Project Setup Complete! ✅

Your project has been successfully configured and is ready to run locally.

---

## 🎯 What Was Done

### Backend Setup ✅
- Created `package.json` with all required dependencies
- Installed: express, mongoose, dotenv, cors, bcryptjs, jsonwebtoken, nodemon
- Created database connection file (`Config Files/db.js`)
- Fixed server.js configuration paths
- Configured environment variables in `.env`
- Added npm scripts: `start` and `dev`

### Frontend Setup ✅
- Created `package.json` with React dependencies
- Installed: react, react-dom, react-router-dom, vite, @vitejs/plugin-react
- Reorganized files into proper React structure:
  - `src/components/` - Navbar, PrivateRoute
  - `src/pages/` - Home, Login, Register, Dashboard, EventDetails, EventCart
  - `src/styles/` - global.css
  - `src/` - App.jsx, index.jsx, api.js, AuthContext.jsx
- Created Vite configuration
- Created index.html
- Renamed all React files to .jsx extension
- Added npm scripts: `dev`, `build`, `preview`

---

## 🚀 How to Run the Project

### Step 1: Install and Start MongoDB

**Option A - Local MongoDB (Recommended for Development):**

1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Install MongoDB following the installer instructions
3. Start MongoDB service:
   - Windows: Open Services app and start "MongoDB" service
   - Or run in terminal: `net start MongoDB` (as Administrator)
   - Mac: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`

**Option B - MongoDB Atlas (Cloud):**

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account and cluster
3. Get your connection string
4. Update `College Event Backend/Config Files/.env` with your Atlas connection string:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/collegeEvents
   ```

### Step 2: Start the Backend Server

Open a terminal and run:

```bash
cd "College-Event-Management-System/College Event Backend"
npm run dev
```

You should see:
```
Server running on port 5000
MongoDB Connected Successfully
```

**If MongoDB connection fails**, make sure:
- MongoDB is running (local) or connection string is correct (Atlas)
- The database URL in `.env` is correct

### Step 3: Start the Frontend Development Server

Open a NEW terminal (keep backend running) and run:

```bash
cd "College-Event-Management-System/College Event Frontend"
npm run dev
```

The frontend will start on: http://localhost:3000

---

## 📝 Project Structure

```
College-Event-Management-System/
│
├── College Event Backend/
│   ├── Config Files/
│   │   ├── .env                    # Environment variables
│   │   └── db.js                   # Database connection
│   ├── controllers/
│   │   ├── authController.js       # Authentication logic
│   │   └── eventController.js      # Event management logic
│   ├── middleware/
│   │   └── authMiddleware.js       # JWT authentication middleware
│   ├── models/
│   │   ├── User.js                 # User schema
│   │   └── Event.js                # Event schema
│   ├── routes/
│   │   ├── authRoutes.js           # Auth endpoints
│   │   └── eventRoutes.js          # Event endpoints
│   ├── Server Setup/
│   │   └── server.js               # Express server
│   ├── package.json
│   └── node_modules/
│
└── College Event Frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   └── PrivateRoute.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── EventDetails.jsx
    │   │   └── EventCart.jsx
    │   ├── styles/
    │   │   └── global.css
    │   ├── App.jsx                 # Main app component
    │   ├── index.jsx               # React entry point
    │   ├── api.js                  # API calls
    │   └── AuthContext.jsx         # Authentication context
    ├── public/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── node_modules/
```

---

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create event (protected)
- `POST /api/events/:id/register` - Register for event (protected)

---

## 🛠️ Available Commands

### Backend
```bash
npm start         # Start server (production)
npm run dev       # Start server with nodemon (development)
```

### Frontend
```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
```

---

## 🔐 Environment Variables

Located in: `College Event Backend/Config Files/.env`

```env
# MongoDB - Currently configured for local MongoDB
MONGO_URI=mongodb://localhost:27017/collegeEvents

# JWT Secret - CHANGE THIS IN PRODUCTION!
JWT_SECRET=college_event_system_jwt_secret_key_change_this_in_production

# Server Port
PORT=5000
```

---

## ✅ Testing the Setup

1. Open http://localhost:3000 in your browser
2. Navigate to Register page
3. Create a new user account
4. Login with the created account
5. Check the Dashboard

---

## 🐛 Common Issues & Solutions

### Backend won't start:
- **Error: Cannot connect to MongoDB**
  - Solution: Make sure MongoDB is running
  - Check the MONGO_URI in .env file

- **Error: Port 5000 already in use**
  - Solution: Change PORT in .env to another port (e.g., 5001)

### Frontend won't start:
- **Error: Port 3000 already in use**
  - Solution: Change port in vite.config.js

### CORS errors:
- Backend is configured to accept all origins in development
- In production, update CORS settings in server.js

---

## 📦 Installed Dependencies

### Backend:
- express (5.1.0) - Web framework
- mongoose (8.19.2) - MongoDB ODM
- dotenv (17.2.3) - Environment variables
- cors (2.8.5) - Cross-origin resource sharing
- bcryptjs (3.0.2) - Password hashing
- jsonwebtoken (9.0.2) - JWT authentication
- nodemon (3.1.10) - Auto-restart server (dev)

### Frontend:
- react (19.2.0) - UI library
- react-dom (19.2.0) - React DOM bindings
- react-router-dom (7.9.5) - Routing
- vite (7.1.12) - Build tool
- @vitejs/plugin-react (5.1.0) - React plugin for Vite

---

## 🎉 Next Steps

1. **Test the application** - Try creating users and events
2. **Customize styling** - Update global.css
3. **Add features** - Implement the features from README.md
4. **Setup database seed** - Create sample data for testing
5. **Deploy** - Deploy to platforms like Vercel (frontend) and Render/Railway (backend)

---

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Vite Documentation](https://vitejs.dev)

---

## 🆘 Need Help?

If you encounter any issues:
1. Check the console for error messages
2. Verify MongoDB is running
3. Ensure all dependencies are installed
4. Check that both servers are running on correct ports

---

**Setup completed successfully! Happy coding! 🚀**
