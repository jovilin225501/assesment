/**
 * Input Validation Middleware using express-validator
 */
const { body, param, query, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const { GENRES, PLATFORMS, STATUS_LIST, VALIDATION } = require('../utils/constants');
const { errorResponse } = require('../utils/apiResponse');

// Check validation results and return 400 on error
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value
    }));
    return errorResponse(res, 400, 'Validation failed for submitted data', formattedErrors);
  }
  next();
};

// Validate MongoDB ObjectId in route parameters
const validateObjectId = [
  param('id').custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('Invalid movie identifier format');
    }
    return true;
  }),
  handleValidationErrors
];

// Validation rules for adding a movie
const validateAddMovie = [
  body('title')
    .exists({ checkFalsy: true }).withMessage('Title is required')
    .isString().withMessage('Title must be a text string')
    .trim()
    .isLength({ min: 1, max: 150 }).withMessage('Title must be between 1 and 150 characters'),

  body('genre')
    .exists({ checkFalsy: true }).withMessage('Genre is required')
    .trim()
    .isIn(GENRES).withMessage(`Genre must be one of: ${GENRES.join(', ')}`),

  body('releaseYear')
    .exists().withMessage('Release year is required')
    .isInt({ min: VALIDATION.RELEASE_YEAR_MIN, max: new Date().getFullYear() })
    .withMessage(`Release year must be an integer between ${VALIDATION.RELEASE_YEAR_MIN} and ${new Date().getFullYear()}`),

  body('runtime')
    .exists().withMessage('Runtime is required')
    .isInt({ min: VALIDATION.RUNTIME_MIN, max: VALIDATION.RUNTIME_MAX })
    .withMessage(`Runtime must be an integer between ${VALIDATION.RUNTIME_MIN} and ${VALIDATION.RUNTIME_MAX} minutes`),

  body('platform')
    .exists({ checkFalsy: true }).withMessage('Platform is required')
    .trim()
    .isIn(PLATFORMS).withMessage(`Platform must be one of: ${PLATFORMS.join(', ')}`),

  body('priority')
    .exists().withMessage('Priority is required')
    .isInt({ min: VALIDATION.PRIORITY_MIN, max: VALIDATION.PRIORITY_MAX })
    .withMessage(`Priority must be an integer between ${VALIDATION.PRIORITY_MIN} and ${VALIDATION.PRIORITY_MAX}`),

  handleValidationErrors
];

// Validation rules for editing allowed movie fields
const validateEditMovie = [
  ...validateObjectId,

  body('title')
    .exists({ checkFalsy: true }).withMessage('Title is required')
    .isString().withMessage('Title must be a text string')
    .trim()
    .isLength({ min: 1, max: 150 }).withMessage('Title must be between 1 and 150 characters'),

  body('genre')
    .exists({ checkFalsy: true }).withMessage('Genre is required')
    .trim()
    .isIn(GENRES).withMessage(`Genre must be one of: ${GENRES.join(', ')}`),

  body('runtime')
    .exists().withMessage('Runtime is required')
    .isInt({ min: VALIDATION.RUNTIME_MIN, max: VALIDATION.RUNTIME_MAX })
    .withMessage(`Runtime must be an integer between ${VALIDATION.RUNTIME_MIN} and ${VALIDATION.RUNTIME_MAX} minutes`),

  body('platform')
    .exists({ checkFalsy: true }).withMessage('Platform is required')
    .trim()
    .isIn(PLATFORMS).withMessage(`Platform must be one of: ${PLATFORMS.join(', ')}`),

  body('priority')
    .exists().withMessage('Priority is required')
    .isInt({ min: VALIDATION.PRIORITY_MIN, max: VALIDATION.PRIORITY_MAX })
    .withMessage(`Priority must be an integer between ${VALIDATION.PRIORITY_MIN} and ${VALIDATION.PRIORITY_MAX}`),

  handleValidationErrors
];

// Validation rules for status transition
const validateStatusChange = [
  ...validateObjectId,

  body('status')
    .exists({ checkFalsy: true }).withMessage('Target status is required')
    .trim()
    .isIn(STATUS_LIST).withMessage(`Status must be one of: ${STATUS_LIST.join(', ')}`),

  body('rating')
    .if(body('status').equals('Watched'))
    .exists({ checkNull: true }).withMessage('Rating is required when status is changed to Watched')
    .isFloat({ min: VALIDATION.RATING_MIN, max: VALIDATION.RATING_MAX })
    .withMessage(`Rating must be a number between ${VALIDATION.RATING_MIN} and ${VALIDATION.RATING_MAX}`),

  handleValidationErrors
];

// Validation rules for rating update on Watched movies
const validateRatingUpdate = [
  ...validateObjectId,

  body('rating')
    .exists({ checkNull: true }).withMessage('Rating is required')
    .isFloat({ min: VALIDATION.RATING_MIN, max: VALIDATION.RATING_MAX })
    .withMessage(`Rating must be a number between ${VALIDATION.RATING_MIN} and ${VALIDATION.RATING_MAX}`),

  handleValidationErrors
];

module.exports = {
  validateObjectId,
  validateAddMovie,
  validateEditMovie,
  validateStatusChange,
  validateRatingUpdate
};
