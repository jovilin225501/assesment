/**
 * Statistics Controller
 */
const statsService = require('../services/statsService');
const { successResponse } = require('../utils/apiResponse');

const getStats = async (req, res, next) => {
  try {
    const stats = await statsService.getWatchlistStatistics();
    return successResponse(res, 200, 'Watchlist statistics retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats
};
