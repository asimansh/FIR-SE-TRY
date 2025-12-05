/**
 * Error Handling Middleware
 * 
 * Provides centralized error handling for the application.
 * Includes handlers for 404 Not Found and general errors.
 */

const config = require('../config/app');

/**
 * 404 Not Found Handler
 * Catches requests to undefined routes.
 */
exports.notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `The requested resource '${req.originalUrl}' was not found on this server`,
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Global Error Handler
 * Catches and processes all errors thrown in the application.
 * Must be defined with 4 parameters to be recognized as error middleware.
 */
exports.errorHandler = (err, req, res, next) => {
  // Log error in development
  if (config.nodeEnv === 'development') {
    console.error('='.repeat(50));
    console.error('ERROR:', err.message);
    console.error('Stack:', err.stack);
    console.error('='.repeat(50));
  }

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;
  
  // Build error response
  const errorResponse = {
    success: false,
    error: err.name || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
  };

  // Include stack trace in development mode only
  if (config.nodeEnv === 'development') {
    errorResponse.stack = err.stack;
    errorResponse.path = req.originalUrl;
    errorResponse.method = req.method;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Async Error Wrapper
 * Wraps async route handlers to catch errors and pass them to error handler.
 * 
 * Usage: router.get('/route', asyncHandler(async (req, res) => { ... }));
 */
exports.asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
