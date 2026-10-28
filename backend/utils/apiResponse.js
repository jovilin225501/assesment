/**
 * Standardized API Response Helpers
 */

const successResponse = (res, statusCode = 200, message = 'Operation successful', data = null, extra = {}) => {
  const payload = {
    success: true,
    message,
    ...(data !== null && data !== undefined ? { data } : {}),
    ...extra
  };
  return res.status(statusCode).json(payload);
};

const errorResponse = (res, statusCode = 500, message = 'An unexpected error occurred', errors = null) => {
  const payload = {
    success: false,
    message,
    ...(errors ? { errors } : {})
  };
  return res.status(statusCode).json(payload);
};

module.exports = {
  successResponse,
  errorResponse
};
