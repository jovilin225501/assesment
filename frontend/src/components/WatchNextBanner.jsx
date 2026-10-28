import React from 'react';
import { Sparkles, Compass } from 'lucide-react';

export const WatchNextBanner = ({ onTriggerWatchNext, loading }) => {
  return (
    <div className="watch-next-banner">
      <div className="watch-next-info">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <Sparkles size={18} style={{ color: 'var(--cyan-accent)' }} />
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--cyan-accent)', fontWeight: 600 }}>
            Curated Decision Engine
          </span>
        </div>
        <h3>What Should I Watch Next?</h3>
        <p>
          Can't decide? Let our backend recommendation engine analyze your <em>To Watch</em> queue. It deterministically selects your highest priority title, resolving ties with the shortest runtime.
        </p>
      </div>
      <div>
        <button
          id="btn-watch-next-trigger"
          className="btn btn-magic"
          onClick={onTriggerWatchNext}
          disabled={loading}
          style={{ padding: '12px 24px', fontSize: '0.95rem' }}
        >
          <Compass size={18} />
          {loading ? 'Analyzing Queue...' : 'What Should I Watch Next?'}
        </button>
      </div>
    </div>
  );
};

export default WatchNextBanner;
