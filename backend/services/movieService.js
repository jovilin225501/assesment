/**
 * Movie Business Logic Service
 */
const Movie = require('../models/Movie');
const { getNextMovieCode } = require('./codeGeneratorService');
const { STATUS, PERMITTED_STATUS_TRANSITIONS, VALIDATION } = require('../utils/constants');

class MovieServiceError extends Error {
  constructor(message, statusCode = 400, errors = null) {
    super(message);
    this.name = 'MovieServiceError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

/**
 * Create a new movie with safe code generation and duplicate validation
 */
const createMovie = async (inputData) => {
  const { title, genre, releaseYear, runtime, platform, priority } = inputData;

  const normalizedTitle = title.trim().toLowerCase();
  const parsedYear = Number(releaseYear);

  // Check for duplicate movie by normalized title + releaseYear
  const existingMovie = await Movie.findOne({
    titleNormalized: normalizedTitle,
    releaseYear: parsedYear
  });

  if (existingMovie) {
    throw new MovieServiceError(
      `A movie with title "${title.trim()}" and release year ${parsedYear} already exists.`,
      409
    );
  }

  // Atomically generate year-specific Movie Code (MV-YYYY-XXX)
  const movieCode = await getNextMovieCode(parsedYear);

  // Force system defaults for protected fields: client cannot supply or overwrite
  const movie = new Movie({
    movieCode,
    title: title.trim(),
    titleNormalized: normalizedTitle,
    genre,
    releaseYear: parsedYear,
    runtime: Number(runtime),
    platform,
    priority: Number(priority),
    status: STATUS.TO_WATCH,
    rating: null,
    watchedDate: null
  });

  await movie.save();
  return movie;
};

/**
 * Retrieve movies with search, status & genre filtering, and pagination
 */
const getMovies = async ({ page = 1, limit = VALIDATION.PAGE_SIZE_DEFAULT, status, genre, search }) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.max(1, parseInt(limit, 10) || VALIDATION.PAGE_SIZE_DEFAULT);
  const skip = (pageNum - 1) * pageSize;

  // Build filter query
  const filter = {};

  if (status && Object.values(STATUS).includes(status)) {
    filter.status = status;
  }

  if (genre) {
    filter.genre = genre;
  }

  if (search && search.trim()) {
    filter.title = { $regex: search.trim(), $options: 'i' };
  }

  // Count total matching documents
  const totalMovies = await Movie.countDocuments(filter);
  const totalPages = Math.ceil(totalMovies / pageSize) || 1;

  // Ordering logic:
  // If no status filter is applied, 'To Watch' movies appear first, ordered by Priority DESC, Runtime ASC, movieCode ASC.
  // Then Watching, then Watched.
  let movies;

  if (status) {
    let sortCriteria = { priority: -1, runtime: 1, movieCode: 1 };
    if (status === STATUS.WATCHED) {
      sortCriteria = { watchedDate: -1, priority: -1, movieCode: 1 };
    }
    movies = await Movie.find(filter)
      .sort(sortCriteria)
      .skip(skip)
      .limit(pageSize);
  } else {
    // Aggregation pipeline to deterministically sort To Watch first, Watching second, Watched third
    const pipeline = [
      { $match: filter },
      {
        $addFields: {
          statusPriority: {
            $switch: {
              branches: [
                { case: { $eq: ['$status', STATUS.TO_WATCH] }, then: 1 },
                { case: { $eq: ['$status', STATUS.WATCHING] }, then: 2 },
                { case: { $eq: ['$status', STATUS.WATCHED] }, then: 3 }
              ],
              default: 4
            }
          }
        }
      },
      {
        $sort: {
          statusPriority: 1,
          priority: -1,
          runtime: 1,
          movieCode: 1
        }
      },
      { $skip: skip },
      { $limit: pageSize },
      { $project: { statusPriority: 0, __v: 0 } }
    ];

    movies = await Movie.aggregate(pipeline);
  }

  return {
    movies,
    pagination: {
      totalMovies,
      currentPage: pageNum,
      pageSize,
      totalPages,
      hasPrevPage: pageNum > 1,
      hasNextPage: pageNum < totalPages
    }
  };
};

/**
 * Get single movie by ID
 */
const getMovieById = async (id) => {
  const movie = await Movie.findById(id);
  if (!movie) {
    throw new MovieServiceError(`Movie with ID ${id} not found`, 404);
  }
  return movie;
};

/**
 * Update allowed fields only (Title, Genre, Runtime, Platform, Priority)
 * Protected fields (movieCode, releaseYear, watchedDate, status, rating) cannot be modified here.
 */
const updateMovie = async (id, inputData) => {
  const movie = await getMovieById(id);

  const { title, genre, runtime, platform, priority } = inputData;

  // Check if title change introduces a duplicate for the existing releaseYear
  if (title) {
    const normalizedNewTitle = title.trim().toLowerCase();
    const duplicate = await Movie.findOne({
      _id: { $ne: id },
      titleNormalized: normalizedNewTitle,
      releaseYear: movie.releaseYear
    });

    if (duplicate) {
      throw new MovieServiceError(
        `Another movie with title "${title.trim()}" and release year ${movie.releaseYear} already exists.`,
        409
      );
    }

    movie.title = title.trim();
    movie.titleNormalized = normalizedNewTitle;
  }

  if (genre) movie.genre = genre;
  if (runtime !== undefined) movie.runtime = Number(runtime);
  if (platform) movie.platform = platform;
  if (priority !== undefined) movie.priority = Number(priority);

  await movie.save();
  return movie;
};

/**
 * Update status enforcing examination workflow transitions
 */
const updateStatus = async (id, targetStatus, rating) => {
  const movie = await getMovieById(id);
  const currentStatus = movie.status;

  // Watched is a final status
  if (currentStatus === STATUS.WATCHED) {
    throw new MovieServiceError(
      'Watched is a final status. Status cannot be changed once a movie is marked as Watched.',
      400
    );
  }

  const allowedTransitions = PERMITTED_STATUS_TRANSITIONS[currentStatus] || [];
  if (!allowedTransitions.includes(targetStatus)) {
    throw new MovieServiceError(
      `Invalid status transition from "${currentStatus}" to "${targetStatus}". Permitted transitions are: ${allowedTransitions.join(', ') || 'None'}`,
      400
    );
  }

  // Handle transition to Watched
  if (targetStatus === STATUS.WATCHED) {
    const parsedRating = Number(rating);
    if (!rating || isNaN(parsedRating) || parsedRating < VALIDATION.RATING_MIN || parsedRating > VALIDATION.RATING_MAX) {
      throw new MovieServiceError(
        `A valid rating between ${VALIDATION.RATING_MIN} and ${VALIDATION.RATING_MAX} is required when marking a movie as Watched.`,
        400
      );
    }
    movie.status = STATUS.WATCHED;
    movie.rating = parsedRating;
    movie.watchedDate = new Date();
  } else {
    // When in To Watch or Watching, rating and watchedDate must be null
    movie.status = targetStatus;
    movie.rating = null;
    movie.watchedDate = null;
  }

  await movie.save();
  return movie;
};

/**
 * Update rating for an already Watched movie
 */
const updateRating = async (id, rating) => {
  const movie = await getMovieById(id);

  if (movie.status !== STATUS.WATCHED) {
    throw new MovieServiceError(
      'Ratings can only be assigned or edited for movies in "Watched" status.',
      400
    );
  }

  const parsedRating = Number(rating);
  if (isNaN(parsedRating) || parsedRating < VALIDATION.RATING_MIN || parsedRating > VALIDATION.RATING_MAX) {
    throw new MovieServiceError(
      `Rating must be a number between ${VALIDATION.RATING_MIN} and ${VALIDATION.RATING_MAX}.`,
      400
    );
  }

  movie.rating = parsedRating;
  await movie.save();
  return movie;
};

/**
 * Delete a movie with examination rule enforcement (Watching cannot be deleted)
 */
const deleteMovie = async (id) => {
  const movie = await getMovieById(id);

  if (movie.status === STATUS.WATCHING) {
    throw new MovieServiceError(
      'A movie in "Watching" status cannot be deleted. Please transition the movie to "To Watch" or "Watched" before deletion.',
      400
    );
  }

  await Movie.findByIdAndDelete(id);
  return movie;
};

/**
 * Watch Next recommendation rule:
 * Select a "To Watch" movie with:
 * 1. Highest Priority (5 -> 1)
 * 2. If priorities equal, shortest Runtime first
 * 3. Tie-breaker: Movie Code asc
 */
const getWatchNextRecommendation = async () => {
  const recommendation = await Movie.findOne({ status: STATUS.TO_WATCH })
    .sort({ priority: -1, runtime: 1, movieCode: 1 });

  if (!recommendation) {
    throw new MovieServiceError(
      'No movies currently in your "To Watch" list. Add some movies to receive recommendations!',
      404
    );
  }

  return recommendation;
};

module.exports = {
  createMovie,
  getMovies,
  getMovieById,
  updateMovie,
  updateStatus,
  updateRating,
  deleteMovie,
  getWatchNextRecommendation,
  MovieServiceError
};
