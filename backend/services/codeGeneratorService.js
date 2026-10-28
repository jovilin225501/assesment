/**
 * Service to generate safe, per-year sequential Movie Codes
 * Format: MV-<ReleaseYear>-<ThreeDigitSequence> (e.g., MV-2024-001)
 */
const Counter = require('../models/Counter');

/**
 * Atomically increments and retrieves the next sequence code for a given release year.
 * Deleting a movie will never decrement or reuse allocated sequence numbers.
 * 
 * @param {number|string} releaseYear 
 * @returns {Promise<string>} e.g., 'MV-2024-001'
 */
const getNextMovieCode = async (releaseYear) => {
  const yearKey = String(releaseYear).trim();

  // Atomically increment the sequence for this year; create if it does not exist
  const updatedCounter = await Counter.findByIdAndUpdate(
    yearKey,
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const sequenceNumber = String(updatedCounter.seq).padStart(3, '0');
  return `MV-${yearKey}-${sequenceNumber}`;
};

module.exports = {
  getNextMovieCode
};
