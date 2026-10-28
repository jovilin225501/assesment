import React from 'react';
import { Search, RotateCcw, Filter } from 'lucide-react';
import { GENRES, STATUS } from '../utils/constants';

export const Toolbar = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  genreFilter,
  onGenreFilterChange,
  onReset
}) => {
  const statusOptions = ['All', STATUS.TO_WATCH, STATUS.WATCHING, STATUS.WATCHED];

  const hasActiveFilters = search || statusFilter !== 'All' || genreFilter !== 'All';

  return (
    <div className="toolbar" role="search" aria-label="Filter movies">
      {/* Search Input */}
      <div className="search-box">
        <Search size={18} />
        <input
          id="search-movie-input"
          type="text"
          placeholder="Search movies by title..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Filter controls */}
      <div className="filters-group">
        {/* Status Tabs */}
        <div className="status-tabs" role="tablist">
          {statusOptions.map((opt) => (
            <button
              key={opt}
              id={`tab-status-${opt.toLowerCase().replace(/\s+/g, '-')}`}
              role="tab"
              aria-selected={statusFilter === opt}
              className={`status-tab ${statusFilter === opt ? 'active' : ''}`}
              onClick={() => onStatusFilterChange(opt)}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* Genre Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <select
            id="genre-filter-select"
            className="filter-select"
            value={genreFilter}
            onChange={(e) => onGenreFilterChange(e.target.value)}
            aria-label="Filter by genre"
          >
            <option value="All">All Genres</option>
            {GENRES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <button
            id="btn-reset-filters"
            className="btn btn-outline btn-sm"
            onClick={onReset}
            title="Reset search and filters"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        )}
      </div>
    </div>
  );
};

export default Toolbar;
