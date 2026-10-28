import React, { useState } from 'react';
import { X, Trash2, AlertTriangle, AlertCircle } from 'lucide-react';
import { STATUS } from '../utils/constants';

export const DeleteConfirmModal = ({ isOpen, movie, onClose, onConfirmDelete }) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !movie) return null;

  const isWatching = movie.status === STATUS.WATCHING;

  const handleConfirm = async () => {
    if (isWatching) {
      setError('A movie in "Watching" status cannot be deleted per examination rules.');
      return;
    }

    setDeleting(true);
    setError('');
    try {
      await onConfirmDelete(movie._id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete movie.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <h3 id="delete-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)' }}>
            <AlertTriangle size={20} />
            Confirm Movie Deletion
          </h3>
          <button className="btn-icon-only btn-outline" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div
              style={{
                background: 'var(--danger-bg)',
                border: '1px solid var(--danger-border)',
                color: 'var(--danger)',
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '16px',
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

          {isWatching ? (
            <div
              style={{
                padding: '16px',
                background: 'var(--danger-bg)',
                border: '1px solid var(--danger-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-main)',
                fontSize: '0.9rem'
              }}
            >
              <strong style={{ color: 'var(--danger)', display: 'block', marginBottom: '6px' }}>
                Deletion Forbidden: Movie is in "Watching" Status
              </strong>
              <p style={{ color: 'var(--text-muted)' }}>
                Under the examination workflow rules, movies currently in <em>Watching</em> status cannot be deleted. You must transition this movie to either <em>To Watch</em> or <em>Watched</em> before it can be removed.
              </p>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '14px' }}>
                Are you sure you want to permanently delete this movie from your watchlist?
              </p>
              <div
                style={{
                  padding: '12px 16px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Movie:</div>
                <strong style={{ fontSize: '1.05rem', color: '#fff' }}>{movie.title}</strong>
                <div style={{ marginTop: '4px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className="movie-code-badge">{movie.movieCode}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                    ({movie.releaseYear} &bull; {movie.genre} &bull; {movie.status})
                  </span>
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '12px' }}>
                This action is permanent and cannot be undone. Sequence numbers for this year will not be reused.
              </p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          {!isWatching && (
            <button
              id="btn-confirm-delete-dialog"
              type="button"
              className="btn btn-danger"
              onClick={handleConfirm}
              disabled={deleting}
            >
              <Trash2 size={16} />
              {deleting ? 'Deleting...' : 'Delete Movie'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
