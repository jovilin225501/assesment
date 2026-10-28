import React from 'react';
import {
  Calendar,
  Clock,
  Tv,
  Star,
  Edit2,
  Trash2,
  ArrowRightLeft,
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { STATUS } from '../utils/constants';

export const MovieCard = ({
  movie,
  onEdit,
  onChangeStatus,
  onEditRating,
  onDelete,
  onViewDetails
}) => {
  const isWatching = movie.status === STATUS.WATCHING;
  const isWatched = movie.status === STATUS.WATCHED;
  const isToWatch = movie.status === STATUS.TO_WATCH;

  // Format runtime: e.g. 142 mins -> 2h 22m
  const formatRuntime = (mins) => {
    if (!mins) return 'N/A';
    const hours = Math.floor(mins / 60);
    const remainder = mins % 60;
    if (hours === 0) return `${remainder}m`;
    if (remainder === 0) return `${hours}h`;
    return `${hours}h ${remainder}m`;
  };

  const statusClass = isToWatch
    ? 'to-watch'
    : isWatching
    ? 'watching'
    : 'watched';

  return (
    <article className="movie-card" id={`movie-card-${movie._id}`}>
      {/* Top Header: Movie Code & Status Badge */}
      <div className="card-top">
        <span className="movie-code-badge" title="Year-based unique sequential code">
          {movie.movieCode}
        </span>
        <span className={`status-badge ${statusClass}`}>
          <span className="status-dot" />
          {movie.status}
        </span>
      </div>

      {/* Title */}
      <h3
        className="card-title"
        onClick={() => onViewDetails(movie)}
        title="View details"
      >
        {movie.title}
      </h3>

      {/* Metadata Grid */}
      <div className="card-metadata-grid">
        <div className="meta-item">
          <Calendar size={14} />
          <span>{movie.releaseYear}</span>
        </div>
        <div className="meta-item">
          <Clock size={14} />
          <span>{formatRuntime(movie.runtime)}</span>
        </div>
        <div className="meta-item">
          <Tv size={14} />
          <span>{movie.platform}</span>
        </div>
        <div className="meta-item">
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Priority:</span>
          <div className="priority-stars" title={`Priority ${movie.priority} of 5`}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={12}
                className={star <= movie.priority ? 'star-filled' : 'star-empty'}
                fill={star <= movie.priority ? 'currentColor' : 'none'}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Information: Genre, Rating & Watched Date */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', fontSize: '0.82rem' }}>
        <span style={{ padding: '3px 8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', color: 'var(--text-muted)' }}>
          {movie.genre}
        </span>

        {isWatched && movie.rating && (
          <div className="rating-display" title="Audience / User Rating">
            <Star size={13} fill="currentColor" />
            <span>{movie.rating.toFixed(1)} / 10</span>
          </div>
        )}
      </div>

      {/* Card Actions Footer */}
      <div className="card-actions">
        <div className="actions-left">
          {/* Status Transition Button */}
          <button
            id={`btn-status-${movie._id}`}
            className="btn btn-secondary btn-sm"
            onClick={() => onChangeStatus(movie)}
            title={isWatched ? 'Watched is a terminal status' : 'Change movie workflow status'}
            disabled={isWatched}
          >
            <ArrowRightLeft size={13} />
            Status
          </button>

          {/* Edit General Info Button */}
          <button
            id={`btn-edit-${movie._id}`}
            className="btn btn-outline btn-sm"
            onClick={() => onEdit(movie)}
            title="Edit movie information"
          >
            <Edit2 size={13} />
            Edit
          </button>

          {/* Edit Rating Button (Only for Watched movies) */}
          {isWatched && (
            <button
              id={`btn-rating-${movie._id}`}
              className="btn btn-outline btn-sm"
              onClick={() => onEditRating(movie)}
              title="Update movie rating"
              style={{ color: 'var(--amber-gold)' }}
            >
              <Star size={13} />
              Rating
            </button>
          )}
        </div>

        <div className="actions-right">
          {/* Details Button */}
          <button
            className="btn btn-outline btn-sm btn-icon-only"
            onClick={() => onViewDetails(movie)}
            title="View full movie details"
            aria-label="View movie details"
          >
            <Info size={15} />
          </button>

          {/* Delete Button with Watching status prohibition */}
          <button
            id={`btn-delete-${movie._id}`}
            className="btn btn-danger btn-sm btn-icon-only"
            onClick={() => onDelete(movie)}
            disabled={isWatching}
            title={
              isWatching
                ? 'Movies currently in "Watching" status cannot be deleted per examination rules.'
                : 'Delete movie'
            }
            aria-label="Delete movie"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Explanation banner if Watching delete is locked */}
      {isWatching && (
        <div
          style={{
            marginTop: '8px',
            fontSize: '0.74rem',
            color: 'var(--text-dim)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <AlertCircle size={12} style={{ color: 'var(--status-watching)' }} />
          <span>Cannot delete while in Watching status</span>
        </div>
      )}
    </article>
  );
};

export default MovieCard;
