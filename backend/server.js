/**
 * Express Server Entrypoint
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');

const connectDatabase = require('./config/db');
const movieRoutes = require('./routes/movieRoutes');
const statsRoutes = require('./routes/statsRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { successResponse } = require('./utils/apiResponse');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & HTTP Middleware
app.use(helmet());

// Dynamic CORS configuration supporting local dev and deployed Render origins
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173'
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);
      // In production or development, check if origin matches or is allowed
      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        process.env.NODE_ENV !== 'production' ||
        origin.endsWith('.onrender.com')
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Root welcome endpoint for direct browser visits
app.get('/', (req, res) => {
  return successResponse(res, 200, 'Welcome to CineTrack Movie Watchlist REST API', {
    service: 'CineTrack Backend',
    status: 'online',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    endpoints: {
      health: '/api/health',
      movies: '/api/movies',
      watchNext: '/api/movies/watch-next',
      stats: '/api/stats'
    }
  });
});

// Health check endpoint for Render monitoring
app.get('/api/health', (req, res) => {
  return successResponse(res, 200, 'Movie Watchlist API is healthy', {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// API Routes (Mounted on both /api/* and root /* for full client URL tolerance)
app.use('/api/movies', movieRoutes);
app.use('/movies', movieRoutes);

app.use('/api/stats', statsRoutes);
app.use('/stats', statsRoutes);

// Catch-all 404 handler
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

const startKeepAlive = require('./utils/keepAlive');

// Start server after connecting to MongoDB Atlas
if (require.main === module) {
  connectDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`[Server] Movie Watchlist API is running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
        startKeepAlive();
      });
    })
    .catch((err) => {
      console.error('[Server] Failed to initialize server:', err);
      process.exit(1);
    });
}

module.exports = app;
