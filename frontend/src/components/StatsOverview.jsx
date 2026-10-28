import React from 'react';
import { Film, Clock, PlayCircle, CheckCircle2, Hourglass, Star, Flame } from 'lucide-react';

export const StatsOverview = ({ stats, loading }) => {
  const cards = [
    {
      id: 'stat-total',
      label: 'Total Movies',
      value: stats ? stats.totalMovies : '-',
      subtext: 'Catalog total',
      icon: Film,
      color: 'var(--purple-primary)',
      bg: 'rgba(147, 51, 234, 0.15)'
    },
    {
      id: 'stat-towatch',
      label: 'To Watch',
      value: stats ? stats.toWatchCount : '-',
      subtext: 'In your queue',
      icon: Clock,
      color: 'var(--status-towatch)',
      bg: 'var(--status-towatch-bg)'
    },
    {
      id: 'stat-watching',
      label: 'Watching',
      value: stats ? stats.watchingCount : '-',
      subtext: 'In progress now',
      icon: PlayCircle,
      color: 'var(--status-watching)',
      bg: 'var(--status-watching-bg)'
    },
    {
      id: 'stat-watched',
      label: 'Watched',
      value: stats ? stats.watchedCount : '-',
      subtext: 'Completed screenings',
      icon: CheckCircle2,
      color: 'var(--status-watched)',
      bg: 'var(--status-watched-bg)'
    },
    {
      id: 'stat-hours',
      label: 'Hours Watched',
      value: stats ? `${stats.totalHoursWatched}h` : '-',
      subtext: 'Runtime / 60 hrs',
      icon: Hourglass,
      color: 'var(--blue-accent)',
      bg: 'rgba(59, 130, 246, 0.15)'
    },
    {
      id: 'stat-rating',
      label: 'Avg Rating',
      value: stats ? (stats.averageRating !== 'N/A' ? `★ ${stats.averageRating}` : 'N/A') : '-',
      subtext: 'Watched films',
      icon: Star,
      color: 'var(--amber-gold)',
      bg: 'rgba(245, 158, 11, 0.15)'
    },
    {
      id: 'stat-genre',
      label: 'Top Genre',
      value: stats ? stats.mostWatchedGenre : '-',
      subtext: 'Most watched category',
      icon: Flame,
      color: '#ec4899',
      bg: 'rgba(236, 72, 153, 0.15)'
    }
  ];

  return (
    <section className="stats-overview-section" aria-label="Watchlist Statistics">
      <div className="stats-grid">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.id} id={card.id} className="stat-card">
              <div className="stat-card-header">
                <span className="stat-label">{card.label}</span>
                <div
                  className="stat-icon"
                  style={{ background: card.bg, color: card.color }}
                >
                  <Icon size={18} />
                </div>
              </div>
              <div className="stat-value">
                {loading ? <div className="skeleton" style={{ height: '28px', width: '60%' }} /> : card.value}
              </div>
              <div className="stat-subtext">{card.subtext}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default StatsOverview;
