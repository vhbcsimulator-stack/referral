import React from 'react';

export default function BottomNavBar({ activeTab, setActiveTab, profilePicUrl }) {
  const items = [
    { id: 'dashboard', label: 'Home', icon: 'dashboard' },
    { id: 'earnings', label: 'Earnings', icon: 'payments' },
    { id: 'projects', label: 'Projects', icon: 'photo_library' },
    { id: 'schedule', label: 'Schedule', icon: 'calendar_month' },
    { id: 'profile', label: 'Profile', icon: 'account_circle' }
  ];


  return (
    <nav className="bottom-nav">
      {items.map((item) => {
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`bottom-nav-btn ${activeTab === item.id ? 'active' : ''}`}
          >
            {item.id === 'profile' && profilePicUrl ? (
              <img
                src={profilePicUrl}
                alt="Profile"
                className="bottom-nav-profile-pic"
              />
            ) : (
              <span className="material-symbols-outlined">{item.icon}</span>
            )}
            <span className="bottom-nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
