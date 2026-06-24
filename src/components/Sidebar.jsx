import React from 'react';

export default function Sidebar({ activeTab, setActiveTab, onNewReferralClick, isOpen }) {
  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: 'dashboard' },
    { id: 'earnings', name: 'Earnings', icon: 'payments' },
    { id: 'schedule', name: 'Schedule', icon: 'calendar_month' },
    { id: 'tracking', name: 'Tracking', icon: 'group' },
    { id: 'projects', name: 'Projects', icon: 'photo_library' },
    { id: 'mechanics', name: 'Mechanics', icon: 'info' },
    { id: 'settings', name: 'Settings', icon: 'settings' },
  ];


  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <img src="/logo.jpeg" alt="VHBC Logo" className="sidebar-logo" />
        <div className="sidebar-brand-text">
          <h1 className="sidebar-title">VHBC</h1>
          <p className="sidebar-subtitle">Referral Program</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`sidebar-nav-btn ${activeTab === item.id ? 'active' : ''}`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="sidebar-nav-text">{item.name}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-cta-btn" onClick={onNewReferralClick}>
          <span className="material-symbols-outlined">add_circle</span>
          <span>New Referral</span>
        </button>
        <button className="sidebar-nav-btn secondary-btn" onClick={() => alert('Support clicked')}>
          <span className="material-symbols-outlined">help</span>
          <span className="sidebar-nav-text">Support</span>
        </button>
        <button className="sidebar-nav-btn secondary-btn" onClick={() => setActiveTab('logout')}>
          <span className="material-symbols-outlined">logout</span>
          <span className="sidebar-nav-text">Logout</span>
        </button>
      </div>
    </aside>
  );
}
