/**
 * Automated Tests for Movie Watchlist Manager
 * Covers:
 * - Duplicate title + year prevention (409)
 * - Movie code generation format (MV-YYYY-XXX)
 * - Field-level validations
 * - Status workflow permitted & forbidden transitions
 * - Rating validation rules
 * - Watching status deletion prohibition (400)
 * - Watch Next recommendation ordering (Priority DESC, Runtime ASC)
 * - Dashboard statistics aggregation
 */
require('dotenv').config();
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../server');
const Movie = require('../models/Movie');

describe('Movie Watchlist API & Business Rules Tests', () => {
  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
  });

  after(async () => {
    // Clean up test documents
    await Movie.deleteMany({ title: { $regex: /^TEST_/ } });
    await mongoose.disconnect();
  });

  test('GET /api/health should return 200 with database connected', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.database, 'connected');
  });

  test('POST /api/movies generates MV-YYYY-NNN code and defaults to "To Watch"', async () => {
    const movieData = {
      title: 'TEST_Inception Horizon',
      genre: 'Sci-Fi',
      releaseYear: 2025,
      runtime: 148,
      platform: 'Netflix',
      priority: 5
    };

    const res = await request(app).post('/api/movies').send(movieData);
    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.match(res.body.data.movieCode, /^MV-2025-\d{3}$/);
    assert.equal(res.body.data.status, 'To Watch');
    assert.equal(res.body.data.rating, null);
    assert.equal(res.body.data.watchedDate, null);
  });

  test('POST /api/movies rejects duplicate title and year with HTTP 409 (case-insensitive & trimmed)', async () => {
    const duplicateData = {
      title: '  test_inception horizon  ',
      genre: 'Sci-Fi',
      releaseYear: 2025,
      runtime: 130,
      platform: 'Theatre',
      priority: 4
    };

    const res = await request(app).post('/api/movies').send(duplicateData);
    assert.equal(res.status, 409);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /already exists/i);
  });

  test('POST /api/movies rejects invalid release year (< 1950) with HTTP 400', async () => {
    const invalidYearData = {
      title: 'TEST_Ancient Cinema',
      genre: 'Drama',
      releaseYear: 1920,
      runtime: 90,
      platform: 'Theatre',
      priority: 3
    };

    const res = await request(app).post('/api/movies').send(invalidYearData);
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  test('POST /api/movies rejects invalid runtime (< 30 or > 300) with HTTP 400', async () => {
    const invalidRuntimeData = {
      title: 'TEST_Short Reel',
      genre: 'Comedy',
      releaseYear: 2024,
      runtime: 15,
      platform: 'Other',
      priority: 2
    };

    const res = await request(app).post('/api/movies').send(invalidRuntimeData);
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  test('PATCH /api/movies/:id/status supports To Watch -> Watching', async () => {
    // Create a movie in To Watch
    const createRes = await request(app).post('/api/movies').send({
      title: 'TEST_Status Flow Movie 1',
      genre: 'Action',
      releaseYear: 2025,
      runtime: 110,
      platform: 'Hotstar',
      priority: 4
    });
    const movieId = createRes.body.data._id;

    // Transition To Watch -> Watching
    const statusRes = await request(app)
      .patch(`/api/movies/${movieId}/status`)
      .send({ status: 'Watching' });

    assert.equal(statusRes.status, 200);
    assert.equal(statusRes.body.data.status, 'Watching');
  });

  test('DELETE /api/movies/:id rejects deleting a movie in "Watching" status with HTTP 400', async () => {
    const createRes = await request(app).post('/api/movies').send({
      title: 'TEST_Cannot Delete While Watching',
      genre: 'Drama',
      releaseYear: 2025,
      runtime: 100,
      platform: 'Netflix',
      priority: 3
    });
    const movieId = createRes.body.data._id;

    // Transition to Watching
    await request(app).patch(`/api/movies/${movieId}/status`).send({ status: 'Watching' });

    // Attempt delete
    const deleteRes = await request(app).delete(`/api/movies/${movieId}`);
    assert.equal(deleteRes.status, 400);
    assert.equal(deleteRes.body.success, false);
    assert.match(deleteRes.body.message, /cannot be deleted/i);
  });

  test('PATCH /api/movies/:id/status requires rating when transitioning to "Watched"', async () => {
    const createRes = await request(app).post('/api/movies').send({
      title: 'TEST_Rating Required Check',
      genre: 'Thriller',
      releaseYear: 2025,
      runtime: 105,
      platform: 'Prime Video',
      priority: 3
    });
    const movieId = createRes.body.data._id;

    // Missing rating should fail with 400
    const failRes = await request(app)
      .patch(`/api/movies/${movieId}/status`)
      .send({ status: 'Watched' });

    assert.equal(failRes.status, 400);
    assert.equal(failRes.body.success, false);

    // Supplying valid rating should succeed
    const successRes = await request(app)
      .patch(`/api/movies/${movieId}/status`)
      .send({ status: 'Watched', rating: 8.5 });

    assert.equal(successRes.status, 200);
    assert.equal(successRes.body.data.status, 'Watched');
    assert.equal(successRes.body.data.rating, 8.5);
    assert.ok(successRes.body.data.watchedDate);
  });

  test('PATCH /api/movies/:id/status rejects transitioning from "Watched" to other status with HTTP 400', async () => {
    const createRes = await request(app).post('/api/movies').send({
      title: 'TEST_Terminal Watched Status',
      genre: 'Romance',
      releaseYear: 2025,
      runtime: 95,
      platform: 'Theatre',
      priority: 2
    });
    const movieId = createRes.body.data._id;

    // Move to Watched
    await request(app).patch(`/api/movies/${movieId}/status`).send({ status: 'Watched', rating: 9 });

    // Attempt to revert to To Watch
    const revertRes = await request(app)
      .patch(`/api/movies/${movieId}/status`)
      .send({ status: 'To Watch' });

    assert.equal(revertRes.status, 400);
    assert.equal(revertRes.body.success, false);
    assert.match(revertRes.body.message, /final status/i);
  });

  test('GET /api/movies/watch-next recommends highest priority To Watch movie with shortest runtime tie-breaker', async () => {
    const res = await request(app).get('/api/movies/watch-next');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'To Watch');
    // Among To Watch movies seeded, Neon Odyssey (priority 5, runtime 110) should be recommended over The Chrono Paradox (priority 5, runtime 142)
    assert.equal(res.body.data.title, 'Neon Odyssey');
  });

  test('GET /api/stats computes total movies, status counts, hours watched, and avg rating', async () => {
    const res = await request(app).get('/api/stats');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.totalMovies > 0);
    assert.ok(typeof res.body.data.totalHoursWatched === 'number');
    assert.ok(res.body.data.averageRating !== undefined);
  });
});
