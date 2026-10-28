import React, { useState } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import { GENRES, PLATFORMS, VALIDATION } from '../utils/constants';

export const AddMovieModal = ({ isOpen, onClose, onAddSuccess }) => {
  const currentYear = new Date().getFullYear();

  const initialForm = {
    title: '',
    genre: GENRES[0],
    releaseYear: currentYear,
    runtime: 120,
    platform: PLATFORMS[0],
    priority: 3
  };

  const [formData, setFormData] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

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

    const year = Number(formData.releaseYear);
    if (!year || isNaN(year) || year < VALIDATION.RELEASE_YEAR_MIN || year > currentYear) {
      errors.releaseYear = `Year must be between ${VALIDATION.RELEASE_YEAR_MIN} and ${currentYear}`;
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
      errors.priority = `Priority must be an integer between ${VALIDATION.PRIORITY_MIN} and ${VALIDATION.PRIORITY_MAX}`;
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
      await onAddSuccess({
        title: formData.title.trim(),
        genre: formData.genre,
        releaseYear: Number(formData.releaseYear),
        runtime: Number(formData.runtime),
        platform: formData.platform,
        priority: Number(formData.priority)
      });
      // Reset form and close upon success
      setFormData(initialForm);
      setFieldErrors({});
      onClose();
    } catch (err) {
      // Display the backend error message directly on the form without losing entered values
      setServerError(err.message || 'Failed to add movie to watchlist');
      if (err.errors && Array.isArray(err.errors)) {
        const backendFields = {};
        err.errors.forEach((e) => {
          if (e.field) backendFields[e.field] = e.message;
        });
        setFieldErrors((prev) => ({ ...prev, ...backendFields }));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="add-movie-title">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 id="add-movie-title">Add Movie to Watchlist</h3>
          <button className="btn-icon-only btn-outline" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Server Error / Duplicate Warning Banner */}
            {serverError && (
              <div
                id="add-movie-server-error"
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

            {/* Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="add-title">
                Movie Title <span className="req">*</span>
              </label>
              <input
                id="add-title"
                className={`form-input ${fieldErrors.title ? 'has-error' : ''}`}
                type="text"
                placeholder="e.g. Interstellar"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              {fieldErrors.title && <div className="field-error">{fieldErrors.title}</div>}
              <div className="form-help">Unique with Release Year (case-insensitive & trimmed)</div>
            </div>

            {/* Genre & Release Year */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="add-genre">
                  Genre <span className="req">*</span>
                </label>
                <select
                  id="add-genre"
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
                <label className="form-label" htmlFor="add-release-year">
                  Release Year <span className="req">*</span>
                </label>
                <input
                  id="add-release-year"
                  className={`form-input ${fieldErrors.releaseYear ? 'has-error' : ''}`}
                  type="number"
                  min={VALIDATION.RELEASE_YEAR_MIN}
                  max={currentYear}
                  value={formData.releaseYear}
                  onChange={(e) => setFormData({ ...formData, releaseYear: e.target.value })}
                  required
                />
                {fieldErrors.releaseYear && <div className="field-error">{fieldErrors.releaseYear}</div>}
              </div>
            </div>

            {/* Runtime & Platform */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="add-runtime">
                  Runtime (minutes) <span className="req">*</span>
                </label>
                <input
                  id="add-runtime"
                  className={`form-input ${fieldErrors.runtime ? 'has-error' : ''}`}
                  type="number"
                  min={VALIDATION.RUNTIME_MIN}
                  max={VALIDATION.RUNTIME_MAX}
                  value={formData.runtime}
                  onChange={(e) => setFormData({ ...formData, runtime: e.target.value })}
                  required
                />
                {fieldErrors.runtime && <div className="field-error">{fieldErrors.runtime}</div>}
                <div className="form-help">Between 30 and 300 minutes</div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="add-platform">
                  Streaming Platform <span className="req">*</span>
                </label>
                <select
                  id="add-platform"
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

            {/* Priority */}
            <div className="form-group">
              <label className="form-label" htmlFor="add-priority">
                Watch Priority (1 = Low, 5 = Urgent) <span className="req">*</span>
              </label>
              <select
                id="add-priority"
                className={`form-select ${fieldErrors.priority ? 'has-error' : ''}`}
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value={5}>5 - Highest Priority (Must Watch)</option>
                <option value={4}>4 - High Priority</option>
                <option value={3}>3 - Medium Priority</option>
                <option value={2}>2 - Low Priority</option>
                <option value={1}>1 - Lowest Priority</option>
              </select>
              {fieldErrors.priority && <div className="field-error">{fieldErrors.priority}</div>}
            </div>

            <div
              style={{
                fontSize: '0.78rem',
                color: 'var(--text-dim)',
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              ℹ Movie Code will be auto-generated in format <code>MV-{formData.releaseYear || 'YYYY'}-XXX</code>. Initial status will default to <em>To Watch</em>.
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button id="btn-submit-add-movie" type="submit" className="btn btn-primary" disabled={submitting}>
              <Plus size={16} />
              {submitting ? 'Adding Movie...' : 'Add to Watchlist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMovieModal;
