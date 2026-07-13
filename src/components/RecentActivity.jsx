import React from 'react';

export default function RecentActivity({ activities, onClearSearch }) {
  return (
    <div className="recent-activity-card card-base">
      <div className="activity-header">
        <h4 className="activity-title">Recent Activity</h4>
        <button className="activity-view-all-btn">View All</button>
      </div>

      <div className="activity-list">
        {activities.length > 0 ? (
          activities.map((item) => (
            <div key={item.id} className="activity-item animate-fade-in">
              <div className="activity-user-avatar-wrapper">
                {item.avatar ? (
                  <img src={item.avatar} alt={item.name} className="activity-user-avatar" />
                ) : (
                  <div className="activity-user-avatar-placeholder">
                    {item.name ? item.name.charAt(0) : 'R'}
                  </div>
                )}
              </div>
              <div className="activity-details">
                <h5 className="activity-user-name">{item.name}</h5>
                <p className="activity-action">{item.action}</p>
              </div>
              <div className="activity-meta">
                <span className={`chip chip-${item.status.toLowerCase().replace(/\s+/g, '-')}`}>
                  {item.status}
                </span>
                <p className="activity-time">{item.time}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="activity-empty-state">
            <span className="material-symbols-outlined empty-state-icon">search_off</span>
            <p className="empty-state-text">No matching activity found.</p>
            {onClearSearch && (
              <button className="empty-state-btn" onClick={onClearSearch}>
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
