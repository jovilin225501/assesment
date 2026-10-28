import React, { useState, useEffect } from 'react';
import { X, Star, AlertCircle } from 'lucide-react';
import { VALIDATION } from '../utils/constants';

export const RatingModal = ({ isOpen, movie, onClose, onRatingUpdateSuccess }) => {
  const [rating, setRating] = useState(8);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (movie) {
      setRating(movie.rating || 8);
      setError('');
    }
  }, [movie]);

  if (!isOpen || !movie) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const parsedRating = Number(rating);
    if (isNaN(parsedRating) || parsedRating < VALIDATION.RATING_MIN || parsedRating > VALIDATION.RATING_MAX) {
      setError(`Rating must be a number between ${VALIDATION.RATING_MIN} and ${VALIDATION.RATING_MAX}.`);
      return;
    }

    setSubmitting(true);
    try {
      await onRatingUpdateSuccess(movie._id, parsedRating);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update rating.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="rating-modal-title">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 id="rating-modal-title">Update Movie Rating</h3>
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

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Movie:</div>
              <strong style={{ fontSize: '1.1rem', color: '#fff' }}>{movie.title}</strong>{' '}
              <span className="movie-code-badge" style={{ marginLeft: '8px' }}>
                {movie.movieCode}
              </span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-rating-input">
                Rating (1.0 to 10.0) <span className="req">*</span>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <input
                  id="edit-rating-input"
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--amber-gold)' }}>
                  <Star size={20} fill="currentColor" />
                  <strong style={{ fontSize: '1.1rem' }}>{Number(rating || 0).toFixed(1)} / 10</strong>
                </div>
              </div>
              <div className="form-help">Enter a rating between 1 and 10 for this watched title.</div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button id="btn-submit-rating" type="submit" className="btn btn-primary" disabled={submitting}>
              <Star size={16} />
              {submitting ? 'Updating...' : 'Save Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;
