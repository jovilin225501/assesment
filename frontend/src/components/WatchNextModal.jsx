import React from 'react';
import { X, Sparkles, PlayCircle, Clock, Calendar, Tv, Star, Compass } from 'lucide-react';

export const WatchNextModal = ({ isOpen, recommendation, onClose, onStartWatching }) => {
  if (!isOpen) return null;

  const formatRuntime = (mins) => {
    if (!mins) return 'N/A';
    const hours = Math.floor(mins / 60);
    const remainder = mins % 60;
    if (hours === 0) return `${remainder}m`;
    if (remainder === 0) return `${hours}h`;
    return `${hours}h ${remainder}m`;
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="watch-next-modal-title">
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header" style={{ borderBottom: '1px solid rgba(147, 51, 234, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} style={{ color: 'var(--cyan-accent)' }} />
            <h3 id="watch-next-modal-title" className="gradient-text">
              Recommended: Watch Next
            </h3>
          </div>
          <button className="btn-icon-only btn-outline" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {recommendation ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.15), rgba(6, 182, 212, 0.12))',
                  padding: '20px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(147, 51, 234, 0.3)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="movie-code-badge">{recommendation.movieCode}</span>
                  <span className="status-badge to-watch">To Watch</span>
                </div>

                <h2 style={{ fontSize: '1.45rem', color: '#fff', marginBottom: '12px' }}>
                  {recommendation.title}
                </h2>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px 14px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.88rem'
                  }}
                >
                  <div className="meta-item">
                    <Calendar size={14} />
                    <span>{recommendation.releaseYear}</span>
                  </div>
                  <div className="meta-item">
                    <Clock size={14} />
                    <span>{formatRuntime(recommendation.runtime)}</span>
                  </div>
                  <div className="meta-item">
                    <Tv size={14} />
                    <span>{recommendation.platform}</span>
                  </div>
                  <div className="meta-item">
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Priority:</span>
                    <div className="priority-stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={12}
                          className={star <= recommendation.priority ? 'star-filled' : 'star-empty'}
                          fill={star <= recommendation.priority ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ padding: '4px 10px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '6px', fontSize: '0.82rem' }}>
                    {recommendation.genre}
                  </span>
                </div>
              </div>

              {/* Algorithm Explanation */}
              <div
                style={{
                  fontSize: '0.82rem',
                  color: 'var(--text-muted)',
                  background: 'rgba(0, 0, 0, 0.2)',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  lineHeight: 1.5
                }}
              >
                ✨ <strong>Selection Logic:</strong> Selected from your active <em>To Watch</em> queue by highest Priority ({recommendation.priority}/5), followed by shortest Runtime ({recommendation.runtime} mins) as a tie-breaker.
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px 10px' }}>
              <Compass size={40} style={{ color: 'var(--text-dim)', marginBottom: '12px' }} />
              <h4>No Recommendations Available</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
                Your "To Watch" list is currently empty. Add movies to receive algorithmic recommendations!
              </p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          {recommendation && (
            <button
              id="btn-start-watching-recommended"
              type="button"
              className="btn btn-magic"
              onClick={() => {
                onStartWatching(recommendation);
                onClose();
              }}
            >
              <PlayCircle size={16} />
              Start Watching Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WatchNextModal;
