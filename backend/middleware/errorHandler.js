/**
 * Centralized Error Handling Middleware
 */
const { errorResponse } = require('../utils/apiResponse');

// 404 handler for unmatched routes
const notFoundHandler = (req, res, next) => {
  return errorResponse(res, 404, `Cannot ${req.method} ${req.originalUrl} - Route not found`);
};

// Global error handler
const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.originalUrl} ->`, err);

  // MongoDB duplicate key error (code 11000)
  if (err.code === 11000) {
    if (err.keyPattern && (err.keyPattern.titleNormalized || err.keyPattern.releaseYear)) {
      return errorResponse(
        res,
        409,
        'A movie with this title and release year already exists in your watchlist.'
      );
    }
    if (err.keyPattern && err.keyPattern.movieCode) {
      return errorResponse(
        res,
        409,
        'Generated movie code conflict occurred. Please retry your request.'
      );
    }
    return errorResponse(res, 409, 'A resource uniqueness conflict occurred.');
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const formattedErrors = Object.values(err.errors).map(val => ({
      field: val.path,
      message: val.message
    }));
    return errorResponse(res, 400, 'Data validation failed', formattedErrors);
  }

  // Mongoose CastError (invalid ObjectId or type conversion)
  if (err.name === 'CastError') {
    return errorResponse(res, 400, `Invalid ${err.path}: ${err.value}`);
  }

  // Known custom status errors
  if (err.statusCode) {
    return errorResponse(res, err.statusCode, err.message, err.errors || null);
  }

  // Fallback 500 error
  const message = process.env.NODE_ENV === 'production'
    ? 'An unexpected server error occurred. Please try again later.'
    : err.message || 'Internal Server Error';

  return errorResponse(res, 500, message);
};

module.exports = {
  notFoundHandler,
  errorHandler
};
