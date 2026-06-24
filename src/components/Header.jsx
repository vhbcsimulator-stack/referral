import React from 'react';

const DEFAULT_AVATAR_SVG = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23c8d8d0'/><circle cx='50' cy='38' r='18' fill='%23ffffff' opacity='0.85'/><ellipse cx='50' cy='90' rx='28' ry='22' fill='%23ffffff' opacity='0.85'/></svg>`;

export default function Header({
  searchVal, onSearchChange, onMenuToggle,
  onNotificationsClick, unreadCount,
  onSettingsClick, onProfileClick,
  profilePicUrl,
}) {
  return (
    <header className="header">
      <div className="header-left">
        <button className="mobile-menu-toggle" onClick={onMenuToggle} aria-label="Toggle Navigation Menu">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="search-container">
          <span className="material-symbols-outlined search-icon">search</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search referrals..."
            value={searchVal}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="header-right">
        <div className="header-actions">
          <button className="header-action-btn notif-bell-btn" onClick={onNotificationsClick} aria-label="Notifications">
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount > 0 && (
              <span className="notification-badge live-badge">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <button className="header-action-btn" onClick={onSettingsClick} aria-label="Settings">
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>

        {/* Clickable avatar → opens Profile page */}
        <button
          className="header-avatar-btn"
          onClick={onProfileClick}
          aria-label="Open profile"
          title="View Profile"
        >
          <img
            className="user-avatar"
            src={profilePicUrl || DEFAULT_AVATAR_SVG}
            alt="Profile"
            onError={e => { e.target.src = DEFAULT_AVATAR_SVG; }}
          />
        </button>
      </div>
    </header>
  );
}
