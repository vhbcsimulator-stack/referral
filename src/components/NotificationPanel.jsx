import React, { useEffect, useRef } from 'react';

const ICON_MAP = {
  booking_created: { icon: 'calendar_add_on', color: '#4f46e5' },
  booking_approved: { icon: 'event_available', color: '#0d9488' },
  booking_closed: { icon: 'check_circle', color: '#16a34a' },
  booking_cancelled: { icon: 'cancel', color: '#dc2626' },
  booking_pending: { icon: 'pending', color: '#d97706' },
  booking_tripped: { icon: 'task_alt', color: '#0d9488' },
  status_change: { icon: 'info', color: '#6b7280' },
  rescheduled: { icon: 'event_repeat', color: '#7c3aed' },
  account_status: { icon: 'manage_accounts', color: '#0369a1' },
  earnings_update: { icon: 'payments', color: '#16a34a' },
};

function formatRelative(iso) {
  if (!iso) return '';
  const now = new Date();
  const past = new Date(iso);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function NotificationPanel({ isOpen, onClose, notifications, unreadCount, onMarkRead, onMarkAllRead, onClearAll }) {
  const panelRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        // Check the button that opens the panel is not clicked (it has aria-label="Notifications")
        if (!e.target.closest('[aria-label="Notifications"]')) {
          onClose();
        }
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, onClose]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop (mobile) */}
      <div className="notif-backdrop" onClick={onClose} aria-hidden="true" />

      {/* Notification Panel */}
      <aside ref={panelRef} className="notif-panel animate-slide-in-right" role="dialog" aria-label="Notifications panel">
        {/* Header */}
        <div className="notif-panel-header">
          <div className="notif-panel-title-row">
            <span className="material-symbols-outlined notif-panel-bell-icon">notifications</span>
            <h3 className="notif-panel-title">Notifications</h3>
            {unreadCount > 0 && (
              <span className="notif-panel-unread-chip">{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </div>
          <div className="notif-panel-actions">
            {unreadCount > 0 && (
              <button className="notif-action-link" onClick={onMarkAllRead} title="Mark all as read">
                Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button className="notif-action-link danger" onClick={onClearAll} title="Clear all notifications">
                Clear all
              </button>
            )}
            <button className="notif-close-btn" onClick={onClose} aria-label="Close notifications">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="notif-panel-body">
          {notifications.length === 0 ? (
            <div className="notif-empty-state">
              <span className="material-symbols-outlined notif-empty-icon">notifications_off</span>
              <p className="notif-empty-title">All caught up!</p>
              <p className="notif-empty-sub">You have no notifications yet. Activity on your account and bookings will appear here.</p>
            </div>
          ) : (
            <ul className="notif-list">
              {notifications.map(notif => {
                const meta = ICON_MAP[notif.type] || { icon: notif.icon || 'circle_notifications', color: '#6b7280' };
                return (
                  <li
                    key={notif.id}
                    className={`notif-item ${!notif.read ? 'unread' : ''}`}
                    onClick={() => onMarkRead(notif.id)}
                  >
                    <div className="notif-item-icon-wrap" style={{ backgroundColor: `${meta.color}18`, color: meta.color }}>
                      <span className="material-symbols-outlined notif-item-icon">{meta.icon}</span>
                    </div>
                    <div className="notif-item-body">
                      <div className="notif-item-header-row">
                        <span className="notif-item-title">{notif.title}</span>
                        <span className="notif-item-time">{formatRelative(notif.timestamp)}</span>
                      </div>
                      <p className="notif-item-message">{notif.message}</p>
                    </div>
                    {!notif.read && <div className="notif-unread-dot" />}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}
