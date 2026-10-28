/**
 * Movie Model Schema
 */
const mongoose = require('mongoose');
const { GENRES, PLATFORMS, STATUS, VALIDATION } = require('../utils/constants');

const movieSchema = new mongoose.Schema(
  {
    movieCode: {
      type: String,
      required: [true, 'Movie Code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^MV-\d{4}-\d{3,}$/, 'Movie Code must follow format MV-YYYY-NNN']
    },
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
      minlength: [1, 'Title cannot be empty'],
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    titleNormalized: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    genre: {
      type: String,
      required: [true, 'Genre is required'],
      enum: {
        values: GENRES,
        message: 'Invalid genre. Allowed genres are: ' + GENRES.join(', ')
      }
    },
    releaseYear: {
      type: Number,
      required: [true, 'Release year is required'],
      min: [VALIDATION.RELEASE_YEAR_MIN, `Release year must be ${VALIDATION.RELEASE_YEAR_MIN} or later`],
      validate: {
        validator: function (v) {
          return Number.isInteger(v) && v <= new Date().getFullYear();
        },
        message: props => `${props.value} is not a valid release year (must be an integer up to ${new Date().getFullYear()})`
      }
    },
    runtime: {
      type: Number,
      required: [true, 'Runtime in minutes is required'],
      min: [VALIDATION.RUNTIME_MIN, `Runtime must be at least ${VALIDATION.RUNTIME_MIN} minutes`],
      max: [VALIDATION.RUNTIME_MAX, `Runtime cannot exceed ${VALIDATION.RUNTIME_MAX} minutes`],
      validate: {
        validator: Number.isInteger,
        message: 'Runtime must be a whole number of minutes'
      }
    },
    platform: {
      type: String,
      required: [true, 'Platform is required'],
      enum: {
        values: PLATFORMS,
        message: 'Invalid platform. Allowed platforms are: ' + PLATFORMS.join(', ')
      }
    },
    priority: {
      type: Number,
      required: [true, 'Priority is required'],
      min: [VALIDATION.PRIORITY_MIN, `Priority must be between ${VALIDATION.PRIORITY_MIN} and ${VALIDATION.PRIORITY_MAX}`],
      max: [VALIDATION.PRIORITY_MAX, `Priority must be between ${VALIDATION.PRIORITY_MIN} and ${VALIDATION.PRIORITY_MAX}`],
      validate: {
        validator: Number.isInteger,
        message: 'Priority must be an integer between 1 and 5'
      }
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: [STATUS.TO_WATCH, STATUS.WATCHING, STATUS.WATCHED],
        message: 'Status must be one of: To Watch, Watching, Watched'
      },
      default: STATUS.TO_WATCH
    },
    rating: {
      type: Number,
      default: null,
      min: [VALIDATION.RATING_MIN, `Rating must be at least ${VALIDATION.RATING_MIN}`],
      max: [VALIDATION.RATING_MAX, `Rating cannot exceed ${VALIDATION.RATING_MAX}`]
    },
    watchedDate: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Pre-validate middleware to automatically compute titleNormalized
movieSchema.pre('validate', function (next) {
  if (this.title) {
    this.titleNormalized = this.title.trim().toLowerCase();
  }
  next();
});

// Compound unique index ensuring title + releaseYear is strictly unique case-insensitively
movieSchema.index({ titleNormalized: 1, releaseYear: 1 }, { unique: true });

// Compound index to optimize Watch Next query: status + priority desc + runtime asc + movieCode asc
movieSchema.index({ status: 1, priority: -1, runtime: 1, movieCode: 1 });

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;
