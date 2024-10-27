// middlewares/error.js
const errorHandler = {
  // Not Found handler
  notFound: (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
  },

  // Global error handler
  errorHandler: (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    // Log error for debugging
    console.error({
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
      timestamp: new Date().toISOString()
    });

    res.status(statusCode).json({
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
  },

  // Async error wrapper
  asyncHandler: (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next)
};

module.exports = errorHandler;