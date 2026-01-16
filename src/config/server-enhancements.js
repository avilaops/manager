/**
 * 🚀 SERVER ENHANCEMENTS
 * Add this code to your server.js for production-ready features
 */

// ========================================
// 1. ADD IMPORTS (after existing imports)
// ========================================

import { registerHealthRoutes, requestCounter } from './src/middleware/health.js';
import logger from './src/utils/logger.js';
import { rateLimiter, strictRateLimiter } from './src/middleware/rateLimiter.js';

// ========================================
// 2. ADD MIDDLEWARE (after app initialization, before routes)
// ========================================

// Request counter for health checks
app.use(requestCounter);

// Logger middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`, {
        ip: req.ip,
        userAgent: req.get('user-agent')
    });
    next();
});

// Rate limiting
app.use('/api/', rateLimiter); // General API rate limit
app.use('/api/payments/', strictRateLimiter); // Strict for payments
app.use('/api/webhooks/', strictRateLimiter); // Strict for webhooks

// ========================================
// 3. REGISTER HEALTH CHECK ROUTES (before other routes)
// ========================================

// Health check routes
registerHealthRoutes(app);

// ========================================
// 4. ERROR HANDLING (at the end, before app.listen)
// ========================================

// 404 handler
app.use((req, res) => {
    logger.warn(`404 - Route not found: ${req.method} ${req.url}`);
    res.status(404).json({
        success: false,
        error: 'Route not found',
        path: req.url,
        method: req.method
    });
});

// Global error handler
app.use((err, req, res, next) => {
    logger.error('Unhandled error:', {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method
    });
    
    res.status(err.status || 500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
});

// ========================================
// 5. GRACEFUL SHUTDOWN (after app.listen)
// ========================================

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully...');
    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully...');
    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
});

// Unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

// ========================================
// USAGE INSTRUCTIONS
// ========================================

/**
 * To integrate these enhancements into your server.js:
 * 
 * 1. Copy the imports section to the top of server.js
 * 2. Add middleware section after app = express()
 * 3. Register health routes before your existing routes
 * 4. Add error handling at the end (before app.listen)
 * 5. Add graceful shutdown handlers after app.listen
 * 
 * Don't forget to install new dependencies:
 * npm install winston winston-daily-rotate-file express-rate-limit
 */

export default {
    message: 'Server enhancements ready for integration'
};
