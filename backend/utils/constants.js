/**
 * Application Constants and Business Rule Definitions
 */

const GENRES = [
  'Action',
  'Comedy',
  'Drama',
  'Horror',
  'Sci-Fi',
  'Romance',
  'Thriller'
];

const PLATFORMS = [
  'Netflix',
  'Prime Video',
  'Hotstar',
  'Theatre',
  'Other'
];

const STATUS = {
  TO_WATCH: 'To Watch',
  WATCHING: 'Watching',
  WATCHED: 'Watched'
};

const STATUS_LIST = Object.values(STATUS);

// Strict status transition rules according to examination specification:
// To Watch -> Watching, Watched
// Watching -> Watched, To Watch
// Watched -> [] (terminal status, no further changes)
const PERMITTED_STATUS_TRANSITIONS = {
  [STATUS.TO_WATCH]: [STATUS.WATCHING, STATUS.WATCHED],
  [STATUS.WATCHING]: [STATUS.TO_WATCH, STATUS.WATCHED],
  [STATUS.WATCHED]: []
};

const VALIDATION = {
  RELEASE_YEAR_MIN: 1950,
  get RELEASE_YEAR_MAX() {
    return new Date().getFullYear();
  },
  RUNTIME_MIN: 30,
  RUNTIME_MAX: 300,
  PRIORITY_MIN: 1,
  PRIORITY_MAX: 5,
  RATING_MIN: 1,
  RATING_MAX: 10,
  PAGE_SIZE_DEFAULT: 6
};

module.exports = {
  GENRES,
  PLATFORMS,
  STATUS,
  STATUS_LIST,
  PERMITTED_STATUS_TRANSITIONS,
  VALIDATION
};
