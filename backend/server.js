// backend/server.js - Restructured for Vercel serverless deployment
require("./setup");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const subscriberRoutes = require("./routes/subscriberRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const chatRoutes = require("./routes/chatRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const skinAnalyzerRoutes = require("./routes/skinAnalyzerRoutes");
const { errorHandler } = require("./middleware/errorMiddleware");
const mongoose = require("mongoose");

// Connect to MongoDB (for both local development and Vercel)
let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) {
    console.log('Using existing MongoDB connection');
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log('MongoDB connected ✅');
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Don't exit the process in production, as this will crash the serverless function
    if (process.env.NODE_ENV !== 'production') {
      console.error('Failed to connect to MongoDB. Check your connection string.');
    }
    // Return error but don't crash
    return { error };
  }
};

// Initialize express app
const app = express();

// Allow React devserver (http://localhost:3000) to send cookies
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://the-ordinary-hqjz.vercel.app", // Frontend Vercel URL
      process.env.FRONTEND_URL || "*"
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ───── Session Middleware ──────────────────────────────────────────
app.use(
  session({
    secret: process.env.SESSION_SECRET || "replace_this_with_env_var",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // secure: true if HTTPS
  })
);

// ───── Route Mounting ──────────────────────────────────────────────
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api", subscriberRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/skin-analyzer", skinAnalyzerRoutes);

// ───── Error Handler ──────────────────────────────────────────────
app.use(errorHandler);

// For local development only, not used in Vercel
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  // Connect to database immediately in development mode
  connectToDatabase().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  });
}

// Connect to database before handling requests
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ message: 'Database connection failed' });
  }
});

// Export the Express API for Vercel
module.exports = app;
