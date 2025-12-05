/**
 * API Routes
 * 
 * This file defines all API routes for the application.
 * All routes here are prefixed with /api in index.js
 */

const express = require('express');
const router = express.Router();

// Import controllers
const apiController = require('../controllers/apiController');

// =============================================================================
// API ROUTE DEFINITIONS
// =============================================================================

/**
 * GET /api
 * API welcome message
 */
router.get('/', apiController.welcome);

/**
 * GET /api/status
 * API status and uptime information
 */
router.get('/status', apiController.status);

/**
 * GET /api/users (Example)
 * Example endpoint - Returns sample user data
 */
router.get('/users', apiController.getUsers);

/**
 * POST /api/users (Example)
 * Example endpoint - Creates a new user (simulated)
 */
router.post('/users', apiController.createUser);

/**
 * GET /api/users/:id (Example)
 * Example endpoint - Returns a specific user by ID
 */
router.get('/users/:id', apiController.getUserById);

module.exports = router;
