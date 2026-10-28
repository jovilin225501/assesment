import React, { useState, useEffect } from 'react';
import { X, ArrowRightLeft, Star, AlertCircle, Info } from 'lucide-react';
import { STATUS, PERMITTED_STATUS_TRANSITIONS, VALIDATION } from '../utils/constants';

export const StatusChangeModal = ({ isOpen, movie, onClose, onStatusUpdateSuccess }) => {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [rating, setRating] = useState(8);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (movie) {
      const allowed = PERMITTED_STATUS_TRANSITIONS[movie.status] || [];
      setSelectedStatus(allowed.length > 0 ? allowed[0] : '');
      setRating(8);
      setError('');
    }
  }, [movie]);

  if (!isOpen || !movie) return null;

  const currentStatus = movie.status;
  const allowedTransitions = PERMITTED_STATUS_TRANSITIONS[currentStatus] || [];
  const isWatched = currentStatus === STATUS.WATCHED;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (allowedTransitions.length === 0) {
      setError('Watched is a final status. Status transitions are not allowed.');
      return;
    }

    if (!selectedStatus) {
      setError('Please select a target status.');
      return;
    }

    if (selectedStatus === STATUS.WATCHED) {
      const numRating = Number(rating);
      if (isNaN(numRating) || numRating < VALIDATION.RATING_MIN || numRating > VALIDATION.RATING_MAX) {
        setError(`Please provide a rating between ${VALIDATION.RATING_MIN} and ${VALIDATION.RATING_MAX} for Watched status.`);
        return;
      }
    }

    setSubmitting(true);
    try {
      await onStatusUpdateSuccess(movie._id, {
        status: selectedStatus,
        rating: selectedStatus === STATUS.WATCHED ? Number(rating) : undefined
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Status transition failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="status-modal-title">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 id="status-modal-title">Change Movie Status</h3>
          <button className="btn-icon-only btn-outline" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div
                style={{
                  background: 'var(--danger-bg)',
                  border: '1px solid var(--danger-border)',
                  color: 'var(--danger)',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '18px',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Target Movie:</div>
              <strong style={{ fontSize: '1.1rem', color: '#fff' }}>{movie.title}</strong>{' '}
              <span className="movie-code-badge" style={{ marginLeft: '8px' }}>
                {movie.movieCode}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                background: 'rgba(0, 0, 0, 0.25)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '20px'
              }}
            >
              <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Current Status:</span>
              <span className={`status-badge ${movie.status === STATUS.TO_WATCH ? 'to-watch' : movie.status === STATUS.WATCHING ? 'watching' : 'watched'}`}>
                {movie.status}
              </span>
            </div>

            {isWatched ? (
              <div
                style={{
                  padding: '16px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid var(--status-watched-border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}
              >
                <Info size={18} style={{ color: 'var(--status-watched)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Watched is a terminal status.</strong>
                  <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                    Per examination rules, once a movie reaches <em>Watched</em> status, it cannot be reverted to <em>To Watch</em> or <em>Watching</em>. You may still update its audience rating.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label" htmlFor="select-next-status">
                    Select Permitted Next Status <span className="req">*</span>
                  </label>
                  <select
                    id="select-next-status"
                    className="form-select"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    required
                  >
                    {allowedTransitions.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rating Input if transitioning to Watched */}
                {selectedStatus === STATUS.WATCHED && (
                  <div
                    style={{
                      padding: '16px',
                      background: 'rgba(245, 158, 11, 0.08)',
                      border: '1px solid var(--status-towatch-border)',
                      borderRadius: 'var(--radius-sm)',
                      marginTop: '16px'
                    }}
                  >
                    <label className="form-label" htmlFor="watched-rating-input">
                      Rating (1 to 10) <span className="req">*</span>
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input
                        id="watched-rating-input"
                        type="number"
                        step="0.1"
                        min={VALIDATION.RATING_MIN}
                        max={VALIDATION.RATING_MAX}
                        className="form-input"
                        style={{ maxWidth: '140px' }}
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        required
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--amber-gold)' }}>
                        <Star size={18} fill="currentColor" />
                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>/ 10</span>
                      </div>
                    </div>
                    <div className="form-help" style={{ marginTop: '8px' }}>
                      Required per examination rules when transitioning to Watched. Watched Date will automatically be logged.
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            {!isWatched && (
              <button
                id="btn-confirm-status-transition"
                type="submit"
                className="btn btn-primary"
                disabled={submitting || allowedTransitions.length === 0}
              >
                <ArrowRightLeft size={16} />
                {submitting ? 'Updating...' : `Transition to ${selectedStatus}`}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default StatusChangeModal;
