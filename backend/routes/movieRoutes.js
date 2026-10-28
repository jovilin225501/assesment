/**
 * Movie Routes
 * IMPORTANT: Specific routes like /watch-next must be declared BEFORE parameter routes like /:id
 */
const express = require('express');
const router = express.Router();

const movieController = require('../controllers/movieController');
const {
  validateObjectId,
  validateAddMovie,
  validateEditMovie,
  validateStatusChange,
  validateRatingUpdate
} = require('../middleware/validator');

// List and Create
router.get('/', movieController.getMovies);
router.post('/', validateAddMovie, movieController.createMovie);

// Watch Next Recommendation - Must be placed BEFORE /:id
router.get('/watch-next', movieController.getWatchNext);

// Single Resource Operations
router.get('/:id', validateObjectId, movieController.getMovieById);
router.put('/:id', validateEditMovie, movieController.updateMovie);
router.patch('/:id/status', validateStatusChange, movieController.updateStatus);
router.patch('/:id/rating', validateRatingUpdate, movieController.updateRating);
router.delete('/:id', validateObjectId, movieController.deleteMovie);

module.exports = router;
