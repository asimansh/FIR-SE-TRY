/**
 * Application Configuration
 * 
 * This file centralizes all application configuration settings.
 * Values are loaded from environment variables with sensible defaults.
 * 
 * Usage: const config = require('./config/app');
 */

module.exports = {
  // Server Configuration
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // CORS Configuration
  // In production, set this to your frontend domain(s)
  corsOrigin: process.env.CORS_ORIGIN || '*',
  
  // Database Configuration (example - uncomment and configure as needed)
  // database: {
  //   host: process.env.DB_HOST || 'localhost',
  //   port: process.env.DB_PORT || 5432,
  //   name: process.env.DB_NAME || 'myapp',
  //   user: process.env.DB_USER || 'postgres',
  //   password: process.env.DB_PASSWORD || '',
  // },
  
  // JWT Configuration (example - uncomment and configure as needed)
  // jwt: {
  //   secret: process.env.JWT_SECRET || 'your-super-secret-key',
  //   expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  // },
  
  // API Configuration
  api: {
    version: 'v1',
    prefix: '/api',
  },
  
  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enabled: process.env.LOGGING_ENABLED !== 'false',
  },
};
