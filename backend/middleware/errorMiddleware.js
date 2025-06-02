/**
 * Enhanced error handler middleware for Express
 * Properly formats error responses and logs errors
 */
const errorHandler = (err, req, res, next) => {
    // Log error details for debugging
    console.error('Error occurred:', err.message);
    console.error('Stack trace:', err.stack);
    
    // Check if headers are already sent
    if (res.headersSent) {
        return next(err);
    }
    
    // Determine appropriate status code
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    
    // Structure the error response
    const errorResponse = {
        message: err.message || 'Server error',
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
        path: req.originalUrl,
        timestamp: new Date().toISOString()
    };
    
    // Send structured error response
    res.status(statusCode).json(errorResponse);
};

module.exports = { errorHandler };
