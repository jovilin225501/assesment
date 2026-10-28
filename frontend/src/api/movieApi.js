/**
 * Centralized API Client for CineTrack Backend
 */

let normalizedBase = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').trim().replace(/\/+$/, '');

// If the user provided the domain without /api, append /api automatically
if (!normalizedBase.endsWith('/api') && !normalizedBase.includes('<') && !normalizedBase.includes('>')) {
  normalizedBase = `${normalizedBase}/api`;
}

const BASE_URL = normalizedBase;

class ApiError extends Error {
  constructor(message, status, errors = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

const request = async (endpoint, options = {}) => {
  // Check if placeholder was accidentally left in environment variables
  if (BASE_URL.includes('<') || BASE_URL.includes('>') || BASE_URL.includes('YOUR-RENDER-BACKEND-URL')) {
    throw new ApiError(
      'Configuration Error: VITE_API_BASE_URL still contains placeholder "<YOUR-RENDER-BACKEND-URL>". In Render, go to your Frontend Static Site -> Environment -> update VITE_API_BASE_URL with your actual backend URL (without < >).',
      0
    );
  }

  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message = (data && data.message) || `Request failed with status ${response.status}`;
      const errors = data && data.errors ? data.errors : null;
      throw new ApiError(message, response.status, errors);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network or connectivity issue
    throw new ApiError(
      error.message || 'Unable to connect to the backend server. Ensure backend is running.',
      0
    );
  }
};

export const movieApi = {
  // Get paginated movies with search & filter
  getMovies: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.genre && params.genre !== 'All') query.append('genre', params.genre);
    if (params.search && params.search.trim()) query.append('search', params.search.trim());

    const qs = query.toString();
    return request(`/movies${qs ? `?${qs}` : ''}`);
  },

  // Get single movie by ID
  getMovieById: (id) => request(`/movies/${id}`),

  // Create new movie
  createMovie: (movieData) =>
    request('/movies', {
      method: 'POST',
      body: JSON.stringify(movieData)
    }),

  // Update movie editable fields (Title, Genre, Runtime, Platform, Priority)
  updateMovie: (id, movieData) =>
    request(`/movies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(movieData)
    }),

  // Update status (To Watch, Watching, Watched)
  updateStatus: (id, statusData) =>
    request(`/movies/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(statusData)
    }),

  // Update rating for Watched movie
  updateRating: (id, rating) =>
    request(`/movies/${id}/rating`, {
      method: 'PATCH',
      body: JSON.stringify({ rating })
    }),

  // Delete movie
  deleteMovie: (id) =>
    request(`/movies/${id}`, {
      method: 'DELETE'
    }),

  // Watch Next recommendation
  getWatchNext: () => request('/movies/watch-next'),

  // Live statistics
  getStats: () => request('/stats'),

  // Backend health check
  getHealth: () => request('/health')
};

export default movieApi;
