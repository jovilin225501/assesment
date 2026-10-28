/**
 * Statistics Service using MongoDB Aggregation
 */
const Movie = require('../models/Movie');
const { STATUS } = require('../utils/constants');

/**
 * Computes live dashboard statistics:
 * - Total movies overall
 * - Counts for To Watch, Watching, Watched
 * - Total hours watched (sum of runtimes of Watched / 60)
 * - Average rating of Watched movies (rounded to 1 decimal place or 'N/A')
 * - Most-watched genre (alphabetical tie-breaker, or 'N/A')
 */
const getWatchlistStatistics = async () => {
  // Aggregate status counts and total movies
  const statusCounts = await Movie.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  let toWatchCount = 0;
  let watchingCount = 0;
  let watchedCount = 0;

  statusCounts.forEach(item => {
    if (item._id === STATUS.TO_WATCH) toWatchCount = item.count;
    if (item._id === STATUS.WATCHING) watchingCount = item.count;
    if (item._id === STATUS.WATCHED) watchedCount = item.count;
  });

  const totalMovies = toWatchCount + watchingCount + watchedCount;

  // Aggregate watched movies statistics: total runtime and average rating
  const watchedStats = await Movie.aggregate([
    { $match: { status: STATUS.WATCHED } },
    {
      $group: {
        _id: null,
        totalMinutes: { $sum: '$runtime' },
        avgRating: { $avg: '$rating' },
        ratedCount: {
          $sum: {
            $cond: [{ $ne: ['$rating', null] }, 1, 0]
          }
        }
      }
    }
  ]);

  let totalHoursWatched = 0;
  let averageRating = 'N/A';

  if (watchedStats.length > 0) {
    const totalMinutes = watchedStats[0].totalMinutes || 0;
    // Round total hours to 1 decimal place
    totalHoursWatched = Math.round((totalMinutes / 60) * 10) / 10;

    if (watchedStats[0].ratedCount > 0 && watchedStats[0].avgRating !== null) {
      averageRating = (Math.round(watchedStats[0].avgRating * 10) / 10).toFixed(1);
    }
  }

  // Aggregate most-watched genre among Watched movies
  // Deterministic tie-breaker: sort by count DESC, then genre ASC (alphabetical)
  const topGenreStats = await Movie.aggregate([
    { $match: { status: STATUS.WATCHED } },
    {
      $group: {
        _id: '$genre',
        count: { $sum: 1 }
      }
    },
    {
      $sort: {
        count: -1,
        _id: 1 // alphabetical tie-breaker
      }
    },
    { $limit: 1 }
  ]);

  const mostWatchedGenre = topGenreStats.length > 0 ? topGenreStats[0]._id : 'N/A';

  return {
    totalMovies,
    toWatchCount,
    watchingCount,
    watchedCount,
    totalHoursWatched,
    averageRating,
    mostWatchedGenre
  };
};

module.exports = {
  getWatchlistStatistics
};
