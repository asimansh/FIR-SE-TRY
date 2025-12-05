/**
 * Home Controller
 * 
 * Handles requests to the main application routes.
 * Contains logic for home page, health checks, and server info.
 */

const config = require('../config/app');

/**
 * GET /
 * Main home route handler
 * Returns a simple success message indicating the server is running.
 */
exports.index = (req, res) => {
  res.status(200).send('Server is running successfully!');
};

/**
 * GET /health
 * Health check endpoint
 * Returns server health status - useful for monitoring and load balancers.
 */
exports.healthCheck = (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'Server is healthy and responding',
  });
};

/**
 * GET /info
 * Server information endpoint
 * Returns details about the server environment and configuration.
 */
exports.serverInfo = (req, res) => {
  res.status(200).json({
    name: 'Express Starter Kit',
    version: '1.0.0',
    environment: config.nodeEnv,
    nodeVersion: process.version,
    platform: process.platform,
    timestamp: new Date().toISOString(),
  });
};
