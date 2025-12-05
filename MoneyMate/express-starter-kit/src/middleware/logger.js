/**
 * Request Logger Middleware
 * 
 * Logs incoming HTTP requests with useful information.
 * Can be configured to log to console, file, or external service.
 */

const config = require('../config/app');

/**
 * Request logging middleware
 * Logs method, URL, status code, and response time for each request.
 */
exports.requestLogger = (req, res, next) => {
  // Skip logging if disabled in config
  if (!config.logging.enabled) {
    return next();
  }

  // Record start time
  const startTime = Date.now();
  
  // Track request count
  req.app.locals.requestCount = (req.app.locals.requestCount || 0) + 1;

  // Log when response is finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const timestamp = new Date().toISOString();
    const statusCode = res.statusCode;
    
    // Color code based on status
    let statusColor = statusCode >= 500 ? '\x1b[31m' : // Red for 5xx
                      statusCode >= 400 ? '\x1b[33m' : // Yellow for 4xx
                      statusCode >= 300 ? '\x1b[36m' : // Cyan for 3xx
                      '\x1b[32m';                      // Green for 2xx
    
    const resetColor = '\x1b[0m';
    
    console.log(
      `${timestamp} | ${req.method.padEnd(7)} ${req.originalUrl.padEnd(30)} | ` +
      `${statusColor}${statusCode}${resetColor} | ${duration}ms`
    );
  });

  next();
};
