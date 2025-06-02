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
let isConnected = false;

const connectToDatabase = async () => {
  // If already connected, reuse the connection
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('Using existing MongoDB connection');
    return mongoose.connection;
  }
  
  if (!MONGODB_URI) {
    console.error('MONGODB_URI not defined in environment variables');
    throw new Error('MONGODB_URI is required');
  }

  try {
    // Configure mongoose connection (important for Vercel)
    mongoose.set('strictQuery', false);
    
    // Connect with retry logic and optimized settings for serverless
    const options = {
      serverSelectionTimeoutMS: 10000, // Increased timeout for cold starts
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
      maxPoolSize: 10, // Optimize for serverless
      minPoolSize: 5,
    };
    
    const connection = await mongoose.connect(MONGODB_URI, options);
    isConnected = true;
    console.log('MongoDB connected successfully ✅');
    return connection;
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

// Handle static image serving in a serverless-compatible way
app.get('/static/:imageName', (req, res) => {
  try {
    // In serverless environments, we can't use the filesystem for static files across functions
    // Instead, we'll redirect to a CDN or public URL where these images are stored
    const imageName = req.params.imageName;
    
    // Option 1: Return a placeholder image URL for now (for testing)
    const placeholderUrl = 'https://via.placeholder.com/300';
    
    // Option 2: Redirect to where your images are actually stored (e.g., S3, Cloudinary, etc.)
    // const actualImageUrl = `https://your-actual-storage-url.com/${imageName}`;
    
    // For now, use the placeholder to test the connection is working
    return res.redirect(placeholderUrl);
  } catch (error) {
    console.error('Error serving static file:', error);
    return res.status(404).json({ error: 'Image not found' });
  }
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
    
    // Try to connect if not connected
    let connectionResult = null;
    if (connectionStatus !== 1) {
      try {
        connectionResult = await connectToDatabase();
      } catch (connErr) {
        connectionResult = { error: connErr.message };
      }
    }
    
    return res.status(200).json({
      status: 'ok',
      database: {
        readyState: connectionStatus,
        status: statusText,
        host: mongoose.connection.host || 'not connected',
        name: mongoose.connection.name || 'not connected',
        connectionResult: connectionResult ? 'attempted' : 'not attempted',
        isConnected: isConnected
      },
      environment: process.env.NODE_ENV,
      serverTime: new Date().toISOString(),
      mongodbUri: MONGODB_URI ? 'configured' : 'missing',
      vercel: {
        region: process.env.VERCEL_REGION || 'unknown',
        environment: process.env.VERCEL_ENV || 'unknown'
      }
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? 'hidden in production' : error.stack 
    });
  }
});

// Vercel serverless handler
module.exports = app;

// Also export a specific handler function for Vercel
module.exports.handler = async (req, res) => {
  // This wrapper ensures proper handling in the serverless environment
  return app(req, res);
};
