import React from 'react';
import { Film, Clock, PlayCircle, CheckCircle2, Hourglass, Star, Flame, Trophy, TrendingUp } from 'lucide-react';

export const StatisticsPage = ({ stats, loading }) => {
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="skeleton" style={{ height: '140px' }} />
        <div className="skeleton" style={{ height: '300px' }} />
      </div>
    );
  }

  if (!stats) return null;

  const completionRate = stats.totalMovies > 0
    ? Math.round((stats.watchedCount / stats.totalMovies) * 100)
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2), rgba(6, 182, 212, 0.15))',
          padding: '28px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div>
          <span style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--cyan-accent)', fontWeight: 600 }}>
            Live Analytics Dashboard
          </span>
          <h2 style={{ fontSize: '1.8rem', marginTop: '4px' }}>Watchlist Performance &amp; Progress</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '4px' }}>
            Server-side MongoDB aggregation computing total runtimes, completion ratios, and rating averages.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <div
            style={{
              padding: '16px 20px',
              background: 'rgba(0, 0, 0, 0.35)',
              borderRadius: 'var(--radius-sm)',
              textAlign: 'center',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Completion Rate</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--status-watched)' }}>
              {completionRate}%
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Key Metrics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Catalog</span>
            <div className="stat-icon" style={{ background: 'rgba(147, 51, 234, 0.15)', color: 'var(--purple-primary)' }}>
              <Film size={18} />
            </div>
          </div>
          <div className="stat-value">{stats.totalMovies}</div>
          <div className="stat-subtext">Total tracked titles</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Queued To Watch</span>
            <div className="stat-icon" style={{ background: 'var(--status-towatch-bg)', color: 'var(--status-towatch)' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="stat-value">{stats.toWatchCount}</div>
          <div className="stat-subtext">Awaiting playback</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Currently Watching</span>
            <div className="stat-icon" style={{ background: 'var(--status-watching-bg)', color: 'var(--status-watching)' }}>
              <PlayCircle size={18} />
            </div>
          </div>
          <div className="stat-value">{stats.watchingCount}</div>
          <div className="stat-subtext">In active progress</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Finished (Watched)</span>
            <div className="stat-icon" style={{ background: 'var(--status-watched-bg)', color: 'var(--status-watched)' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="stat-value">{stats.watchedCount}</div>
          <div className="stat-subtext">Completed screenings</div>
        </div>
      </div>

      {/* Deep Dive Breakdown Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Watch Time & Hours Card */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--blue-accent)' }}>
              <Hourglass size={18} />
            </div>
            <h4>Screen Time Investment</h4>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--blue-accent)' }}>
            {stats.totalHoursWatched} <span style={{ fontSize: '1.2rem', fontWeight: 500, color: 'var(--text-muted)' }}>hours</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '8px' }}>
            Calculated as the cumulative runtime in minutes of all <em>Watched</em> titles divided by 60, rounded to one decimal place.
          </p>
        </div>

        {/* Quality Rating Card */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--amber-gold)' }}>
              <Star size={18} />
            </div>
            <h4>Average Audience Rating</h4>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--amber-gold)' }}>
            {stats.averageRating !== 'N/A' ? `${stats.averageRating} / 10` : 'N/A'}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '8px' }}>
            Mean rating awarded across all Watched movies. Defaults to N/A when no completed screenings exist.
          </p>
        </div>

        {/* Favorite Genre Card */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div className="stat-icon" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899' }}>
              <Flame size={18} />
            </div>
            <h4>Top Watched Genre</h4>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#ec4899' }}>
            {stats.mostWatchedGenre}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '8px' }}>
            Genre with the highest frequency among completed movies, using deterministic alphabetical tie-breaking.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;
