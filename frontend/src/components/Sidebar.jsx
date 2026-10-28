import React from 'react';
import {
  Film,
  LayoutDashboard,
  BarChart3,
  ListVideo,
  PlusCircle,
  Sparkles,
  Clapperboard
} from 'lucide-react';

export const Sidebar = ({
  activeTab,
  onSelectTab,
  onOpenAddModal,
  onTriggerWatchNext,
  totalCount
}) => {
  return (
    <aside className="sidebar" aria-label="Main Navigation">
      <div className="sidebar-header">
        <div className="brand-icon">
          <Clapperboard size={22} />
        </div>
        <div className="brand-text">
          <h1>CineTrack</h1>
          <span>Watchlist Manager</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div
          id="nav-overview"
          className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => onSelectTab('overview')}
          role="button"
          tabIndex={0}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard Overview</span>
        </div>

        <div
          id="nav-watchlist"
          className={`nav-item ${activeTab === 'watchlist' ? 'active' : ''}`}
          onClick={() => onSelectTab('watchlist')}
          role="button"
          tabIndex={0}
        >
          <ListVideo size={18} />
          <span>Movie Watchlist</span>
          {totalCount !== undefined && (
            <span
              style={{
                marginLeft: 'auto',
                fontSize: '0.74rem',
                padding: '2px 7px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.08)'
              }}
            >
              {totalCount}
            </span>
          )}
        </div>

        <div
          id="nav-stats"
          className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => onSelectTab('stats')}
          role="button"
          tabIndex={0}
        >
          <BarChart3 size={18} />
          <span>Analytics &amp; Stats</span>
        </div>

        <div style={{ marginTop: '20px', padding: '0 8px' }}>
          <button
            id="sidebar-btn-add-movie"
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '10px' }}
            onClick={onOpenAddModal}
          >
            <PlusCircle size={16} />
            Add Movie
          </button>

          <button
            id="sidebar-btn-watch-next"
            className="btn btn-magic"
            style={{ width: '100%' }}
            onClick={onTriggerWatchNext}
          >
            <Sparkles size={16} />
            Watch Next
          </button>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div>MERN Stack Examination</div>
        <div style={{ fontSize: '0.72rem', color: 'var(--cyan-accent)', marginTop: '2px' }}>
          Node &bull; Express &bull; Mongo &bull; React
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
