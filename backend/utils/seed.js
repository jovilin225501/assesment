/**
 * Database Seed Script for Movie Watchlist Manager
 * Inserts diverse, high-quality sample records respecting all validation rules and counter sequences.
 * 
 * Usage:
 * npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const Counter = require('../models/Counter');
const { getNextMovieCode } = require('../services/codeGeneratorService');
const { STATUS } = require('./constants');

const sampleMovies = [
  {
    title: 'The Chrono Paradox',
    genre: 'Sci-Fi',
    releaseYear: 2024,
    runtime: 142,
    platform: 'Netflix',
    priority: 5,
    status: STATUS.TO_WATCH
  },
  {
    title: 'Neon Odyssey',
    genre: 'Sci-Fi',
    releaseYear: 2024,
    runtime: 110,
    platform: 'Prime Video',
    priority: 5,
    status: STATUS.TO_WATCH
  },
  {
    title: 'Quantum Drift: Tokyo Horizon',
    genre: 'Action',
    releaseYear: 2024,
    runtime: 128,
    platform: 'Hotstar',
    priority: 4,
    status: STATUS.TO_WATCH
  },
  {
    title: 'Beneath the Iron Skyline',
    genre: 'Action',
    releaseYear: 2023,
    runtime: 134,
    platform: 'Netflix',
    priority: 5,
    status: STATUS.WATCHING
  },
  {
    title: 'Midnight in Vienna',
    genre: 'Romance',
    releaseYear: 2021,
    runtime: 108,
    platform: 'Prime Video',
    priority: 3,
    status: STATUS.WATCHING
  },
  {
    title: 'The Laughing Detective',
    genre: 'Comedy',
    releaseYear: 2022,
    runtime: 98,
    platform: 'Hotstar',
    priority: 2,
    status: STATUS.TO_WATCH
  },
  {
    title: 'Whispers of the Blackwood',
    genre: 'Horror',
    releaseYear: 2022,
    runtime: 92,
    platform: 'Theatre',
    priority: 1,
    status: STATUS.TO_WATCH
  },
  {
    title: 'Shadows of the Forgotten Peak',
    genre: 'Thriller',
    releaseYear: 2019,
    runtime: 126,
    platform: 'Theatre',
    priority: 4,
    status: STATUS.WATCHED,
    rating: 8.8,
    watchedDate: new Date('2024-03-15T20:30:00Z')
  },
  {
    title: 'Echoes in the Red Dust',
    genre: 'Sci-Fi',
    releaseYear: 2020,
    runtime: 165,
    platform: 'Prime Video',
    priority: 4,
    status: STATUS.WATCHED,
    rating: 9.1,
    watchedDate: new Date('2024-02-10T18:15:00Z')
  },
  {
    title: 'The Silent Cellist',
    genre: 'Drama',
    releaseYear: 2018,
    runtime: 115,
    platform: 'Other',
    priority: 3,
    status: STATUS.WATCHED,
    rating: 7.9,
    watchedDate: new Date('2023-11-20T21:00:00Z')
  },
  {
    title: 'The Baker of Seville',
    genre: 'Comedy',
    releaseYear: 2017,
    runtime: 104,
    platform: 'Netflix',
    priority: 2,
    status: STATUS.WATCHED,
    rating: 8.2,
    watchedDate: new Date('2023-09-04T19:45:00Z')
  },
  {
    title: 'A Winter in Montmartre',
    genre: 'Drama',
    releaseYear: 2016,
    runtime: 121,
    platform: 'Other',
    priority: 4,
    status: STATUS.WATCHED,
    rating: 8.5,
    watchedDate: new Date('2023-05-18T20:00:00Z')
  }
];

const seedDatabase = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not set in environment.');
    }

    console.log('[Seed] Connecting to MongoDB Atlas...');
    await mongoose.connect(uri);
    console.log('[Seed] Connected to database:', mongoose.connection.name);

    // Prompt check: Safe to run without creating duplicate records.
    // Reset existing movies and counters to guarantee clean reproducible testing
    console.log('[Seed] Resetting existing movies and counters collections for clean seed...');
    await Movie.deleteMany({});
    await Counter.deleteMany({});

    console.log('[Seed] Inserting sample movies with per-year sequence codes...');

    for (const item of sampleMovies) {
      const movieCode = await getNextMovieCode(item.releaseYear);
      const movie = new Movie({
        movieCode,
        title: item.title,
        titleNormalized: item.title.trim().toLowerCase(),
        genre: item.genre,
        releaseYear: item.releaseYear,
        runtime: item.runtime,
        platform: item.platform,
        priority: item.priority,
        status: item.status,
        rating: item.status === STATUS.WATCHED ? item.rating : null,
        watchedDate: item.status === STATUS.WATCHED ? item.watchedDate : null
      });

      await movie.save();
      console.log(`  + Seeded [${movie.movieCode}] "${movie.title}" (${movie.releaseYear}) -> ${movie.status}`);
    }

    console.log('[Seed] Successfully seeded 12 diverse sample movies!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Error during seeding:', err);
    process.exit(1);
  }
};

seedDatabase();
