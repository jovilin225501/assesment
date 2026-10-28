/**
 * Movie Controller handling HTTP requests and delegating to MovieService
 */
const movieService = require('../services/movieService');
const { successResponse } = require('../utils/apiResponse');

const createMovie = async (req, res, next) => {
  try {
    const movie = await movieService.createMovie(req.body);
    return successResponse(res, 201, 'Movie successfully added to watchlist', movie);
  } catch (error) {
    next(error);
  }
};

const getMovies = async (req, res, next) => {
  try {
    const { page, limit, status, genre, search } = req.query;
    const result = await movieService.getMovies({ page, limit, status, genre, search });

    return successResponse(
      res,
      200,
      'Movies retrieved successfully',
      result.movies,
      { pagination: result.pagination }
    );
  } catch (error) {
    next(error);
  }
};

const getMovieById = async (req, res, next) => {
  try {
    const movie = await movieService.getMovieById(req.params.id);
    return successResponse(res, 200, 'Movie details retrieved successfully', movie);
  } catch (error) {
    next(error);
  }
};

const updateMovie = async (req, res, next) => {
  try {
    const movie = await movieService.updateMovie(req.params.id, req.body);
    return successResponse(res, 200, 'Movie updated successfully', movie);
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status, rating } = req.body;
    const movie = await movieService.updateStatus(req.params.id, status, rating);
    return successResponse(res, 200, `Movie status changed to "${movie.status}" successfully`, movie);
  } catch (error) {
    next(error);
  }
};

const updateRating = async (req, res, next) => {
  try {
    const { rating } = req.body;
    const movie = await movieService.updateRating(req.params.id, rating);
    return successResponse(res, 200, 'Movie rating updated successfully', movie);
  } catch (error) {
    next(error);
  }
};

const deleteMovie = async (req, res, next) => {
  try {
    const movie = await movieService.deleteMovie(req.params.id);
    return successResponse(res, 200, `Movie "${movie.title}" successfully deleted`, {
      id: movie._id,
      movieCode: movie.movieCode,
      title: movie.title
    });
  } catch (error) {
    next(error);
  }
};

const getWatchNext = async (req, res, next) => {
  try {
    const movie = await movieService.getWatchNextRecommendation();
    return successResponse(res, 200, 'Next movie recommendation found', movie);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMovie,
  getMovies,
  getMovieById,
  updateMovie,
  updateStatus,
  updateRating,
  deleteMovie,
  getWatchNext
};
