import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus,
  Compass,
  Film,
  Sparkles,
  Inbox,
  AlertCircle
} from 'lucide-react';
import movieApi from './api/movieApi';
import Sidebar from './components/Sidebar';
import StatsOverview from './components/StatsOverview';
import WatchNextBanner from './components/WatchNextBanner';
import Toolbar from './components/Toolbar';
import MovieCard from './components/MovieCard';
import Pagination from './components/Pagination';
import AddMovieModal from './components/AddMovieModal';
import EditMovieModal from './components/EditMovieModal';
import StatusChangeModal from './components/StatusChangeModal';
import RatingModal from './components/RatingModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import MovieDetailsModal from './components/MovieDetailsModal';
import WatchNextModal from './components/WatchNextModal';
import ToastContainer from './components/Toast';
import StatisticsPage from './pages/StatisticsPage';
import { STATUS } from './utils/constants';

export const App = () => {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState('overview');

  // Watchlist & Pagination State
  const [movies, setMovies] = useState([]);
  const [pagination, setPagination] = useState({
    totalMovies: 0,
    currentPage: 1,
    pageSize: 6,
    totalPages: 1
  });
  const [stats, setStats] = useState(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [genreFilter, setGenreFilter] = useState('All');
  const [page, setPage] = useState(1);

  // Loading States
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingWatchNext, setLoadingWatchNext] = useState(false);

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [statusChangeMovie, setStatusChangeMovie] = useState(null);
  const [ratingEditMovie, setRatingEditMovie] = useState(null);
  const [deleteConfirmMovie, setDeleteConfirmMovie] = useState(null);
  const [detailsMovie, setDetailsMovie] = useState(null);
  const [watchNextRecommendation, setWatchNextRecommendation] = useState(null);
  const [isWatchNextModalOpen, setIsWatchNextModalOpen] = useState(false);

  // Toast Notification System
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch live statistics
  const fetchStatistics = useCallback(async () => {
    try {
      setLoadingStats(true);
      const res = await movieApi.getStats();
      if (res && res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Fetch movies based on current search, filters, and page
  const fetchMovies = useCallback(async () => {
    try {
      setLoadingMovies(true);
      const res = await movieApi.getMovies({
        page,
        limit: 6,
        status: statusFilter,
        genre: genreFilter,
        search
      });

      if (res && res.success) {
        setMovies(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to fetch movies:', err);
      addToast(err.message || 'Failed to load movies from backend server', 'error');
    } finally {
      setLoadingMovies(false);
    }
  }, [page, statusFilter, genreFilter, search]);

  // Initial load & filter effect with debounce for search
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchMovies();
    }, 250);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [fetchMovies]);

  // Handle Search Input Change
  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1); // Reset to page 1 on search change
  };

  // Handle Status Filter Change
  const handleStatusFilterChange = (val) => {
    setStatusFilter(val);
    setPage(1);
  };

  // Handle Genre Filter Change
  const handleGenreFilterChange = (val) => {
    setGenreFilter(val);
    setPage(1);
  };

  // Handle Filter Reset
  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setGenreFilter('All');
    setPage(1);
  };

  // Handle Watch Next Recommendation
  const handleTriggerWatchNext = async () => {
    setLoadingWatchNext(true);
    try {
      const res = await movieApi.getWatchNext();
      if (res && res.success) {
        setWatchNextRecommendation(res.data);
        setIsWatchNextModalOpen(true);
      }
    } catch (err) {
      if (err.status === 404) {
        setWatchNextRecommendation(null);
        setIsWatchNextModalOpen(true);
      } else {
        addToast(err.message || 'Failed to retrieve recommendation', 'error');
      }
    } finally {
      setLoadingWatchNext(false);
    }
  };

  // Add Movie
  const handleAddMovie = async (movieData) => {
    const res = await movieApi.createMovie(movieData);
    addToast(`"${res.data.title}" added with code ${res.data.movieCode}!`, 'success');
    fetchMovies();
    fetchStatistics();
  };

  // Edit Movie
  const handleUpdateMovie = async (id, updateData) => {
    const res = await movieApi.updateMovie(id, updateData);
    addToast(`"${res.data.title}" details updated successfully!`, 'success');
    fetchMovies();
    fetchStatistics();
  };

  // Status Change
  const handleStatusChange = async (id, statusData) => {
    const res = await movieApi.updateStatus(id, statusData);
    addToast(`"${res.data.title}" status updated to ${res.data.status}!`, 'success');
    fetchMovies();
    fetchStatistics();
  };

  // Rating Update
  const handleRatingUpdate = async (id, rating) => {
    const res = await movieApi.updateRating(id, rating);
    addToast(`Rating updated to ${res.data.rating}/10 for "${res.data.title}"!`, 'success');
    fetchMovies();
    fetchStatistics();
  };

  // Delete Movie
  const handleDeleteMovie = async (id) => {
    const res = await movieApi.deleteMovie(id);
    addToast(res.message || 'Movie deleted successfully', 'success');
    fetchMovies();
    fetchStatistics();
  };

  // Fast Transition from Watch Next Modal to 'Watching'
  const handleStartWatchingFromRecommendation = async (movie) => {
    try {
      await handleStatusChange(movie._id, { status: STATUS.WATCHING });
      addToast(`Now Watching "${movie.title}"! Enjoy the film.`, 'success');
    } catch (err) {
      addToast(err.message || 'Could not transition movie to Watching', 'error');
    }
  };

  return (
    <div className="app-container">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onTriggerWatchNext={handleTriggerWatchNext}
        totalCount={stats ? stats.totalMovies : undefined}
      />

      {/* Main Content Area */}
      <main className="main-wrapper">
        {/* Top Header Bar */}
        <header className="topbar">
          <div className="topbar-title">
            <h2>
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'watchlist' && 'Movie Watchlist'}
              {activeTab === 'stats' && 'Analytics & Statistics'}
            </h2>
            <p>
              {activeTab === 'overview' && 'Live catalog metrics, intelligent recommendations, and quick access.'}
              {activeTab === 'watchlist' && 'Search, filter, paginate, and manage movie workflow statuses.'}
              {activeTab === 'stats' && 'Deep-dive aggregation metrics, watch times, and audience ratings.'}
            </p>
          </div>

          <div className="topbar-actions">
            <button
              id="topbar-btn-watch-next"
              className="btn btn-magic btn-sm"
              onClick={handleTriggerWatchNext}
              disabled={loadingWatchNext}
            >
              <Sparkles size={15} />
              {loadingWatchNext ? 'Analyzing...' : 'Watch Next'}
            </button>

            <button
              id="topbar-btn-add-movie"
              className="btn btn-primary btn-sm"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus size={15} />
              Add Movie
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="content-body">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div>
              <StatsOverview stats={stats} loading={loadingStats} />

              <WatchNextBanner
                onTriggerWatchNext={handleTriggerWatchNext}
                loading={loadingWatchNext}
              />

              <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem' }}>Active Watchlist</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Six movies per page, prioritized by status and priority rank.
                  </p>
                </div>
              </div>

              <Toolbar
                search={search}
                onSearchChange={handleSearchChange}
                statusFilter={statusFilter}
                onStatusFilterChange={handleStatusFilterChange}
                genreFilter={genreFilter}
                onGenreFilterChange={handleGenreFilterChange}
                onReset={handleResetFilters}
              />

              {loadingMovies ? (
                <div className="movies-grid">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <div key={n} className="skeleton skeleton-card" />
                  ))}
                </div>
              ) : movies.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <Inbox size={32} />
                  </div>
                  <h4>No Movies Found</h4>
                  <p>
                    {search || statusFilter !== 'All' || genreFilter !== 'All'
                      ? 'No titles match your current search and filter criteria. Try resetting filters.'
                      : 'Your movie watchlist is currently empty. Click "Add Movie" to begin!'}
                  </p>
                  {(search || statusFilter !== 'All' || genreFilter !== 'All') && (
                    <button className="btn btn-outline" onClick={handleResetFilters}>
                      Reset Filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="movies-grid">
                    {movies.map((movie) => (
                      <MovieCard
                        key={movie._id}
                        movie={movie}
                        onEdit={(m) => setEditingMovie(m)}
                        onChangeStatus={(m) => setStatusChangeMovie(m)}
                        onEditRating={(m) => setRatingEditMovie(m)}
                        onDelete={(m) => setDeleteConfirmMovie(m)}
                        onViewDetails={(m) => setDetailsMovie(m)}
                      />
                    ))}
                  </div>

                  <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    totalMovies={pagination.totalMovies}
                    pageSize={pagination.pageSize}
                    onPageChange={(p) => setPage(p)}
                  />
                </>
              )}
            </div>
          )}

          {/* WATCHLIST TAB */}
          {activeTab === 'watchlist' && (
            <div>
              <Toolbar
                search={search}
                onSearchChange={handleSearchChange}
                statusFilter={statusFilter}
                onStatusFilterChange={handleStatusFilterChange}
                genreFilter={genreFilter}
                onGenreFilterChange={handleGenreFilterChange}
                onReset={handleResetFilters}
              />

              {loadingMovies ? (
                <div className="movies-grid">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <div key={n} className="skeleton skeleton-card" />
                  ))}
                </div>
              ) : movies.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <Inbox size={32} />
                  </div>
                  <h4>No Movies Found</h4>
                  <p>No titles matched your query. Click below to add a new movie.</p>
                  <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
                    <Plus size={16} /> Add Movie
                  </button>
                </div>
              ) : (
                <>
                  <div className="movies-grid">
                    {movies.map((movie) => (
                      <MovieCard
                        key={movie._id}
                        movie={movie}
                        onEdit={(m) => setEditingMovie(m)}
                        onChangeStatus={(m) => setStatusChangeMovie(m)}
                        onEditRating={(m) => setRatingEditMovie(m)}
                        onDelete={(m) => setDeleteConfirmMovie(m)}
                        onViewDetails={(m) => setDetailsMovie(m)}
                      />
                    ))}
                  </div>

                  <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    totalMovies={pagination.totalMovies}
                    pageSize={pagination.pageSize}
                    onPageChange={(p) => setPage(p)}
                  />
                </>
              )}
            </div>
          )}

          {/* STATS TAB */}
          {activeTab === 'stats' && (
            <StatisticsPage stats={stats} loading={loadingStats} />
          )}
        </div>
      </main>

      {/* Modals & Dialogs */}
      <AddMovieModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddSuccess={handleAddMovie}
      />

      <EditMovieModal
        isOpen={!!editingMovie}
        movie={editingMovie}
        onClose={() => setEditingMovie(null)}
        onUpdateSuccess={handleUpdateMovie}
      />

      <StatusChangeModal
        isOpen={!!statusChangeMovie}
        movie={statusChangeMovie}
        onClose={() => setStatusChangeMovie(null)}
        onStatusUpdateSuccess={handleStatusChange}
      />

      <RatingModal
        isOpen={!!ratingEditMovie}
        movie={ratingEditMovie}
        onClose={() => setRatingEditMovie(null)}
        onRatingUpdateSuccess={handleRatingUpdate}
      />

      <DeleteConfirmModal
        isOpen={!!deleteConfirmMovie}
        movie={deleteConfirmMovie}
        onClose={() => setDeleteConfirmMovie(null)}
        onConfirmDelete={handleDeleteMovie}
      />

      <MovieDetailsModal
        isOpen={!!detailsMovie}
        movie={detailsMovie}
        onClose={() => setDetailsMovie(null)}
        onEdit={(m) => setEditingMovie(m)}
        onChangeStatus={(m) => setStatusChangeMovie(m)}
      />

      <WatchNextModal
        isOpen={isWatchNextModalOpen}
        recommendation={watchNextRecommendation}
        onClose={() => setIsWatchNextModalOpen(false)}
        onStartWatching={handleStartWatchingFromRecommendation}
      />
    </div>
  );
};

export default App;
