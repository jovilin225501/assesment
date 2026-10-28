import React from 'react';
import { X, Calendar, Clock, Tv, Star, CheckCircle, Info, Hash } from 'lucide-react';
import { STATUS } from '../utils/constants';

export const MovieDetailsModal = ({ isOpen, movie, onClose, onEdit, onChangeStatus }) => {
  if (!isOpen || !movie) return null;

  const formatRuntime = (mins) => {
    if (!mins) return 'N/A';
    const hours = Math.floor(mins / 60);
    const remainder = mins % 60;
    return `${hours}h ${remainder}m (${mins} minutes)`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const isWatched = movie.status === STATUS.WATCHED;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="details-modal-title">
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={20} style={{ color: 'var(--cyan-accent)' }} />
            <h3 id="details-modal-title">Movie Information</h3>
          </div>
          <button className="btn-icon-only btn-outline" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Header */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span className="movie-code-badge" style={{ fontSize: '0.88rem' }}>
                {movie.movieCode}
              </span>
              <span className={`status-badge ${movie.status === STATUS.TO_WATCH ? 'to-watch' : movie.status === STATUS.WATCHING ? 'watching' : 'watched'}`}>
                {movie.status}
              </span>
            </div>
            <h2 style={{ fontSize: '1.5rem', color: '#fff' }}>{movie.title}</h2>
          </div>

          {/* Details Table */}
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.25)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              fontSize: '0.9rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Genre</span>
              <strong>{movie.genre}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Release Year</span>
              <strong>{movie.releaseYear}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Runtime</span>
              <strong>{formatRuntime(movie.runtime)}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Streaming Platform</span>
              <strong>{movie.platform}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Priority Level</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontWeight: 600 }}>{movie.priority} / 5</span>
                <div className="priority-stars">
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

            {isWatched && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Audience / User Rating</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--amber-gold)', fontWeight: 700 }}>
                    <Star size={14} fill="currentColor" />
                    <span>{movie.rating ? movie.rating.toFixed(1) : 'N/A'} / 10</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Watched Date</span>
                  <strong>{formatDate(movie.watchedDate)}</strong>
                </div>
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              <span>Database ID</span>
              <code style={{ fontSize: '0.74rem' }}>{movie._id}</code>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              onClose();
              onEdit(movie);
            }}
          >
            Edit Info
          </button>
          {!isWatched && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                onClose();
                onChangeStatus(movie);
              }}
            >
              Change Status
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetailsModal;
