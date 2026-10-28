/**
 * Frontend Constants & Business Rules
 */

export const GENRES = [
  'Action',
  'Comedy',
  'Drama',
  'Horror',
  'Sci-Fi',
  'Romance',
  'Thriller'
];

export const PLATFORMS = [
  'Netflix',
  'Prime Video',
  'Hotstar',
  'Theatre',
  'Other'
];

export const STATUS = {
  TO_WATCH: 'To Watch',
  WATCHING: 'Watching',
  WATCHED: 'Watched'
};

export const STATUS_LIST = Object.values(STATUS);

export const PERMITTED_STATUS_TRANSITIONS = {
  [STATUS.TO_WATCH]: [STATUS.WATCHING, STATUS.WATCHED],
  [STATUS.WATCHING]: [STATUS.TO_WATCH, STATUS.WATCHED],
  [STATUS.WATCHED]: [] // Watched is terminal!
};

export const VALIDATION = {
  RELEASE_YEAR_MIN: 1950,
  RELEASE_YEAR_MAX: new Date().getFullYear(),
  RUNTIME_MIN: 30,
  RUNTIME_MAX: 300,
  PRIORITY_MIN: 1,
  PRIORITY_MAX: 5,
  RATING_MIN: 1,
  RATING_MAX: 10,
  PAGE_SIZE: 6
};
