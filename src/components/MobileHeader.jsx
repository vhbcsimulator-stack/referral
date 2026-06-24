import React from 'react';

export default function MobileHeader({ onMenuToggle, onNotificationsClick, unreadCount }) {
  return (
    <header className="mobile-top-bar">
      <button
        className="mobile-top-bar-menu"
        onClick={onMenuToggle}
        aria-label="Open Navigation Menu"
      >
        <span className="material-symbols-outlined">menu</span>
      </button>

      <div className="mobile-top-bar-brand">
        <span className="mobile-top-bar-title">VHBC</span>
        <span className="mobile-top-bar-sub">Referral Program</span>
      </div>

      <div className="mobile-top-bar-actions">
        <button
          className="mobile-top-bar-notif notif-bell-btn"
          onClick={onNotificationsClick}
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined">notifications</span>
          {unreadCount > 0 && (
            <span className="notification-badge live-badge">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
