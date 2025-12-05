/**
 * Main Routes
 * 
 * This file defines the main application routes (non-API routes).
 * These are typically used for serving pages or simple status endpoints.
 */

const express = require('express');
const router = express.Router();

// Import controllers
const homeController = require('../controllers/homeController');

// =============================================================================
// ROUTE DEFINITIONS
// =============================================================================

/**
 * GET /
 * Home route - Returns server status message
 */
router.get('/', homeController.index);

/**
 * GET /health
 * Health check endpoint - Useful for monitoring and load balancers
 */
router.get('/health', homeController.healthCheck);

/**
 * GET /info
 * Server information endpoint
 */
router.get('/info', homeController.serverInfo);

module.exports = router;
