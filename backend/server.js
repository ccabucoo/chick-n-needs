// This line imports the Express.js library - it's like a toolbox for building web servers
// Express makes it easy to handle web requests and responses
const express = require('express');

// This imports CORS (Cross-Origin Resource Sharing) - it allows our frontend to talk to our backend
// Without this, your React app (running on localhost:5173) couldn't communicate with your Node.js server
const cors = require('cors');

// This imports Helmet - it's a security tool that adds protective headers to prevent common web attacks
// Think of it like a security guard for your website
const helmet = require('helmet');

// This imports Morgan - it's a logging tool that records all requests to your server
// It's like a security camera that records who visits your website and when
const morgan = require('morgan');

// This imports rate limiting - it prevents users from making too many requests too quickly
// This stops hackers from overwhelming your server with requests
const rateLimit = require('express-rate-limit');

// This imports cookie parser - it helps read cookies (small pieces of data stored in the user's browser)
// Cookies are used to remember if a user is logged in
const cookieParser = require('cookie-parser');

// This loads environment variables from a .env file
// Environment variables are like secret settings (database passwords, API keys) that shouldn't be in your code
require('dotenv').config();

// This imports our database connection test function
// We'll use this to make sure our database is working when the server starts
const { testConnection } = require('./config/database');

// These import our route files - each file handles different types of requests
// Think of routes like different departments in a store - each handles different things
const authRoutes = require('./routes/auth');        // Handles login, registration, user management
const productRoutes = require('./routes/products'); // Handles product catalog, search, filtering
const userRoutes = require('./routes/users');       // Handles user profiles and settings
const cartRoutes = require('./routes/cart');        // Handles shopping cart operations
const orderRoutes = require('./routes/orders');     // Handles order processing
const contactRoutes = require('./routes/contact');  // Handles contact form submissions

// This creates our Express application - it's like creating a new web server
const app = express();

// This sets the port number our server will run on
// process.env.PORT means "use the PORT setting from environment variables, or default to 5000"
const PORT = process.env.PORT || 5000;

// SECURITY MIDDLEWARE SECTION
// This applies security headers to every request
// It's like putting a security system on your house
app.use(helmet());

// RATE LIMITING - This prevents users from making too many requests too quickly
// This is like having a bouncer at a club who limits how many people can enter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,    // 15 minutes - the time window to count requests
  max: 1000,                    // Maximum 1000 requests per IP address per 15 minutes
  message: 'Too many requests, please try again later.', // Message shown when limit is exceeded
  standardHeaders: true,         // Include standard rate limit headers in response
  legacyHeaders: false,          // Don't include old-style headers
  skipSuccessfulRequests: true,  // Don't count successful requests (only failed ones)
  skipFailedRequests: false      // Do count failed requests
});
// Apply this rate limiter to all routes
app.use(limiter);

// CORS CONFIGURATION - This allows your frontend to communicate with your backend
// It's like giving permission for your React app to talk to your Node.js server
app.use(cors({
  origin: 'http://localhost:5173', // Only allow requests from your React app
  credentials: true                 // Allow cookies and authentication headers
}));

// LOGGING MIDDLEWARE - This records all requests to your server
// It's like a security camera that records everything that happens
app.use(morgan('combined')); // 'combined' means log everything in detail

// BODY PARSING MIDDLEWARE - This helps read data sent from the frontend
// It's like having a translator that converts frontend data into something the backend can understand
app.use(express.json({ limit: '10mb' }));           // Parse JSON data (like form submissions)
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded data
app.use(cookieParser());                            // Parse cookies from requests

// STATIC FILES - This serves uploaded files (like product images)
// It's like creating a public folder where people can access files
app.use('/uploads', express.static('uploads'));

// AUTHENTICATION RATE LIMITING - This is stricter rate limiting just for login/registration
// It's like having a special security guard just for the entrance
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,    // 15 minutes time window
  max: 10,                      // Only 10 authentication attempts per IP per 15 minutes
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,         // Include standard headers
  legacyHeaders: false,          // Don't include old headers
  skipSuccessfulRequests: true,  // Don't count successful logins
  skipFailedRequests: false      // Do count failed login attempts
});

// API ROUTES SECTION - This connects different parts of your application
// Think of this like connecting different rooms in a building with hallways
app.use('/api/auth', authLimiter, authRoutes);     // /api/auth/* routes use strict rate limiting
app.use('/api/products', productRoutes);           // /api/products/* routes for product operations
app.use('/api/users', userRoutes);                 // /api/users/* routes for user operations
app.use('/api/cart', cartRoutes);                  // /api/cart/* routes for shopping cart
app.use('/api/orders', orderRoutes);               // /api/orders/* routes for order processing
app.use('/api/contact', contactRoutes);            // /api/contact/* routes for contact form

// HEALTH CHECK ENDPOINT - This lets you check if your server is running
// It's like a heartbeat monitor for your website
app.get('/api/health', (req, res) => {
  // req = request (what the client sent)
  // res = response (what we send back to the client)
  res.json({ 
    status: 'OK',                                    // Server is working
    message: 'Chick\'N Needs API is running',        // Human-readable message
    timestamp: new Date().toISOString()              // Current time when request was made
  });
});

// ERROR HANDLING MIDDLEWARE - This catches any errors that happen in your application
// It's like having a safety net that catches anything that goes wrong
app.use((err, req, res, next) => {
  // Log the error to the console (for developers to see)
  console.error(err.stack);
  
  // Send a generic error message to the client
  // We don't send the actual error details for security reasons
  res.status(500).json({ 
    error: 'Something went wrong!',                  // Generic error message
    message: err.message                             // Basic error info (only in development)
  });
});

// 404 HANDLER - This handles requests to pages that don't exist
// It's like having a "Page Not Found" sign for unknown addresses
app.use('*', (req, res) => {
  // * means "any route that wasn't handled by the routes above"
  res.status(404).json({ error: 'Route not found' }); // Send 404 error
});

// START THE SERVER - This actually starts your web server
app.listen(PORT, () => {
  // This function runs when the server successfully starts
  console.log(`🚀 Chick'N Needs API Server running on port ${PORT}`);        // Server started message
  console.log(`📱 Frontend: http://localhost:5173`);                         // Frontend URL
  console.log(`🔗 API: http://localhost:${PORT}/api`);                       // API base URL
  console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);       // Health check URL
  
  // Test the database connection when the server starts
  // This makes sure your database is working before accepting requests
  testConnection();
});
