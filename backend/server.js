// backend/server.js - Optimized for Vercel serverless deployment
require("./setup");
require("dotenv").config();

// Core dependencies
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const mongoose = require("mongoose");
const { errorHandler } = require("./middleware/errorMiddleware");

// Route imports
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const subscriberRoutes = require("./routes/subscriberRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const chatRoutes = require("./routes/chatRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const skinAnalyzerRoutes = require("./routes/skinAnalyzerRoutes");

// MongoDB connection with caching for serverless environment
const MONGODB_URI = process.env.MONGODB_URI;

// Global variable to track connection status
let cachedConnection = null;
let isConnected = false;

const connectToDatabase = async () => {
  if (cachedConnection) {
    console.log('Using existing MongoDB connection');
    return cachedConnection;
  }
  
  if (!MONGODB_URI) {
    console.error('MONGODB_URI not defined in environment variables');
    throw new Error('MONGODB_URI is required');
  }

  try {
    // Configure mongoose connection (important for Vercel)
    mongoose.set('strictQuery', false);
    
    // Connect with retry logic
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
    };
    
    const db = await mongoose.connect(MONGODB_URI, options);
    cachedConnection = db;
    isConnected = true;
    console.log('MongoDB connected successfully ✅');
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error; // Let the middleware handle this error
  }
};

// Initialize express app
const app = express();

// Simple CORS setup - allow all origins in production
app.use(
  cors({
    origin: '*', // Allow all origins in production for troubleshooting
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Simple health check route for Vercel - helps with troubleshooting
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', environment: process.env.NODE_ENV, timestamp: new Date().toISOString() });
});

// JSON body parser with increased limit for uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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
const PORT = process.env.PORT || 5000;

// Database connection middleware for ALL requests
const dbConnectMiddleware = async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return res.status(500).json({ 
      error: 'Database connection failed', 
      message: error.message 
    });
  }
};

// Apply database middleware BEFORE route handlers
app.use(dbConnectMiddleware);

// Start server in development mode
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Special route to debug database connection in production
app.get('/api/debug', async (req, res) => {
  try {
    const connectionStatus = mongoose.connection.readyState;
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    const statusText = ['disconnected', 'connected', 'connecting', 'disconnecting'][connectionStatus];
    
    return res.status(200).json({
      status: 'ok',
      database: statusText,
      environment: process.env.NODE_ENV,
      serverTime: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Vercel serverless handler
module.exports = app;

// Also export a specific handler function for Vercel
module.exports.handler = async (req, res) => {
  // This wrapper ensures proper handling in the serverless environment
  return app(req, res);
};
