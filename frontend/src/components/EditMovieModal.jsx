import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Lock } from 'lucide-react';
import { GENRES, PLATFORMS, VALIDATION } from '../utils/constants';

export const EditMovieModal = ({ isOpen, movie, onClose, onUpdateSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    runtime: 0,
    platform: '',
    priority: 3
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (movie) {
      setFormData({
        title: movie.title || '',
        genre: movie.genre || GENRES[0],
        runtime: movie.runtime || 120,
        platform: movie.platform || PLATFORMS[0],
        priority: movie.priority || 3
      });
      setFieldErrors({});
      setServerError('');
    }
  }, [movie]);

  if (!isOpen || !movie) return null;

  const validate = () => {
    const errors = {};
    if (!formData.title || !formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.trim().length > 150) {
      errors.title = 'Title cannot exceed 150 characters';
    }

    if (!formData.genre || !GENRES.includes(formData.genre)) {
      errors.genre = 'Please select a valid genre';
    }

    const runtime = Number(formData.runtime);
    if (!runtime || isNaN(runtime) || runtime < VALIDATION.RUNTIME_MIN || runtime > VALIDATION.RUNTIME_MAX) {
      errors.runtime = `Runtime must be between ${VALIDATION.RUNTIME_MIN} and ${VALIDATION.RUNTIME_MAX} minutes`;
    }

    if (!formData.platform || !PLATFORMS.includes(formData.platform)) {
      errors.platform = 'Please select a valid platform';
    }

    const priority = Number(formData.priority);
    if (!priority || isNaN(priority) || priority < VALIDATION.PRIORITY_MIN || priority > VALIDATION.PRIORITY_MAX) {
      errors.priority = `Priority must be between ${VALIDATION.PRIORITY_MIN} and ${VALIDATION.PRIORITY_MAX}`;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setSubmitting(true);
    try {
      await onUpdateSuccess(movie._id, {
        title: formData.title.trim(),
        genre: formData.genre,
        runtime: Number(formData.runtime),
        platform: formData.platform,
        priority: Number(formData.priority)
      });
      onClose();
    } catch (err) {
      setServerError(err.message || 'Failed to update movie information');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="edit-movie-title">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 id="edit-movie-title">Edit Movie &mdash; {movie.movieCode}</h3>
          <button className="btn-icon-only btn-outline" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {serverError && (
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
                <span>{serverError}</span>
              </div>
            )}

            {/* Read-only Protected Fields Banner */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                padding: '12px',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '18px',
                fontSize: '0.82rem'
              }}
            >
              <div>
                <span style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Lock size={12} /> Movie Code:
                </span>
                <strong style={{ color: 'var(--cyan-accent)' }}>{movie.movieCode}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Lock size={12} /> Release Year:
                </span>
                <strong>{movie.releaseYear}</strong>
              </div>
            </div>

            {/* Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="edit-title">
                Movie Title <span className="req">*</span>
              </label>
              <input
                id="edit-title"
                className={`form-input ${fieldErrors.title ? 'has-error' : ''}`}
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              {fieldErrors.title && <div className="field-error">{fieldErrors.title}</div>}
            </div>

            {/* Genre & Platform */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="edit-genre">
                  Genre <span className="req">*</span>
                </label>
                <select
                  id="edit-genre"
                  className={`form-select ${fieldErrors.genre ? 'has-error' : ''}`}
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                >
                  {GENRES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                {fieldErrors.genre && <div className="field-error">{fieldErrors.genre}</div>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-platform">
                  Streaming Platform <span className="req">*</span>
                </label>
                <select
                  id="edit-platform"
                  className={`form-select ${fieldErrors.platform ? 'has-error' : ''}`}
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                {fieldErrors.platform && <div className="field-error">{fieldErrors.platform}</div>}
              </div>
            </div>

            {/* Runtime & Priority */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="edit-runtime">
                  Runtime (minutes) <span className="req">*</span>
                </label>
                <input
                  id="edit-runtime"
                  className={`form-input ${fieldErrors.runtime ? 'has-error' : ''}`}
                  type="number"
                  min={VALIDATION.RUNTIME_MIN}
                  max={VALIDATION.RUNTIME_MAX}
                  value={formData.runtime}
                  onChange={(e) => setFormData({ ...formData, runtime: e.target.value })}
                  required
                />
                {fieldErrors.runtime && <div className="field-error">{fieldErrors.runtime}</div>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-priority">
                  Priority <span className="req">*</span>
                </label>
                <select
                  id="edit-priority"
                  className={`form-select ${fieldErrors.priority ? 'has-error' : ''}`}
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value={5}>5 - Highest Priority</option>
                  <option value={4}>4 - High Priority</option>
                  <option value={3}>3 - Medium Priority</option>
                  <option value={2}>2 - Low Priority</option>
                  <option value={1}>1 - Lowest Priority</option>
                </select>
                {fieldErrors.priority && <div className="field-error">{fieldErrors.priority}</div>}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button id="btn-submit-edit-movie" type="submit" className="btn btn-primary" disabled={submitting}>
              <Check size={16} />
              {submitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMovieModal;
