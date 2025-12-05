/**
 * Express Starter Kit - Main Entry Point
 * 
 * This is the main server file that initializes and configures the Express application.
 * It loads environment variables, sets up middleware, and starts the HTTP server.
 * 
 * @author Your Name
 * @version 1.0.0
 */

// Load environment variables from .env file (must be first)
require('dotenv').config();

// Import required modules
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import route modules
const mainRoutes = require('./src/routes/index');
const apiRoutes = require('./src/routes/api');

// Import middleware
const { requestLogger } = require('./src/middleware/logger');
const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler');

// Import configuration
const config = require('./src/config/app');

// Initialize Express application
const app = express();

// =============================================================================
// MIDDLEWARE CONFIGURATION
// =============================================================================

// Enable CORS for all origins (configure as needed for production)
app.use(cors({
  origin: config.corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies (form data)
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Custom request logging middleware
app.use(requestLogger);

// =============================================================================
// VIEW ENGINE CONFIGURATION (Optional - for server-side rendering)
// =============================================================================

// Set the views directory
app.set('views', path.join(__dirname, 'views'));

// Set EJS as the default view engine (you can change this to pug, handlebars, etc.)
// Uncomment the line below if you want to use a view engine
// app.set('view engine', 'ejs');

// =============================================================================
// ROUTE CONFIGURATION
// =============================================================================

// Main routes (home, about, etc.)
app.use('/', mainRoutes);

// API routes (prefixed with /api)
app.use('/api', apiRoutes);

// =============================================================================
// ERROR HANDLING
// =============================================================================

// Handle 404 - Not Found
app.use(notFoundHandler);

// Global error handler (must be last middleware)
app.use(errorHandler);

// =============================================================================
// SERVER STARTUP
// =============================================================================

// Get port from environment variable or use default
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(50));
  console.log(`  Express Starter Kit`);
  console.log('='.repeat(50));
  console.log(`  Environment: ${config.nodeEnv}`);
  console.log(`  Server URL:  http://localhost:${PORT}`);
  console.log(`  API URL:     http://localhost:${PORT}/api`);
  console.log('='.repeat(50));
  console.log('  Server is running successfully!');
  console.log('='.repeat(50));
});

// Export app for testing purposes
module.exports = app;
