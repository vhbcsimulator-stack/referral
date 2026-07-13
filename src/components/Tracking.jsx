import React, { useState } from 'react';

export default function Tracking({ clients }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyLink = (id, link) => {
    navigator.clipboard.writeText(link).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const formatClientScheduleDate = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    return dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Filter clients based on search query
  const filteredClients = clients.filter((client) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      client.name.toLowerCase().includes(q) ||
      client.status.toLowerCase().includes(q) ||
      (client.propertyInterest && client.propertyInterest.toLowerCase().includes(q)) ||
      (client.email && client.email.toLowerCase().includes(q))
    );
  });

  // Calculate Pipeline Summary values (real data)
  const getStatusLower = (status) => (status || '').toLowerCase().trim();

  const closedCount = clients.filter(c => ['closed sale', 'closed sale with cts'].includes(getStatusLower(c.status))).length;
  const inProgressCount = clients.filter(c => ['done tripping', 'reserved', 'reschedule'].includes(getStatusLower(c.status))).length;
  const initialCount = clients.filter(c => getStatusLower(c.status) === 'for tripping').length;
  const notInterestedCount = clients.filter(c => getStatusLower(c.status) === 'cancelled').length;

  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>
      {/* Page Header & Actions */}
      <div className="tracking-header-row">
        <div>
          <h2 className="welcome-title" style={{ fontSize: '32px' }}>Client Tracking</h2>
          <p className="welcome-desc" style={{ marginTop: '4px' }}>
            Monitor the status and progress of your referred clients.
          </p>
        </div>
        <div className="tracking-actions-box">
          <div className="tracking-search-picker">
            <span className="material-symbols-outlined schedule-date-icon-left">search</span>
            <input
              type="text"
              className="tracking-search-input"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="tracking-filter-btn" onClick={() => alert('Filter options opened.')}>
            <span className="material-symbols-outlined">filter_list</span>
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Bento Grid Layout for Client Tracking */}
      <div className="tracking-bento-grid">
        {/* Main Tracking List */}
        <div className="tracking-left-col">
          {filteredClients.length > 0 ? (
            filteredClients.map((client) => (
              <div key={client.id} className="client-detail-card">
                <div className="client-card-header">
                  <div className="client-user-group">
                    <div className="client-avatar-circle">
                      {client.name.split(' ').map(w => w[0]).join('')}
                    </div>
                    <div>
                      <h3 className="client-card-title">{client.name}</h3>
                      <p className="client-card-date">Referred on {client.date || 'Oct 23, 2023'}</p>
                    </div>
                  </div>
                  <span className={`chip chip-${client.status.toLowerCase().replace(/\s+/g, '-')} client-card-status-badge`}>
                    {client.status}
                  </span>
                </div>

                <div className="client-card-info-grid">
                  <div>
                    <p className="info-section-title">Contact Info</p>
                    <p className="info-detail-text">
                      <span className="material-symbols-outlined">mail</span>
                      <span>{client.email || 'No email provided'}</span>
                    </p>
                    <p className="info-detail-text" style={{ marginTop: '4px' }}>
                      <span className="material-symbols-outlined">phone</span>
                      <span>{client.phone || 'No phone provided'}</span>
                    </p>
                  </div>
                  <div>
                    <p className="info-section-title">Schedule Info</p>
                    <p className="info-detail-text">
                      <span className="material-symbols-outlined">calendar_today</span>
                      <span>{client.scheduleDate ? formatClientScheduleDate(client.scheduleDate) : 'Not scheduled'} at {client.scheduleTime || 'N/A'}</span>
                    </p>
                    <p className="info-detail-text" style={{ marginTop: '4px' }}>
                      <span className="material-symbols-outlined">meeting_room</span>
                      <span style={{ textTransform: 'capitalize' }}>Platform: {client.platform ? client.platform.replace('_', ' ') : 'N/A'}</span>
                    </p>
                  </div>
                </div>

                {/* Meeting Link Section for Google Meet / Zoom */}
                {client.meetingLink && (client.platform === 'Google Meet' || client.platform === 'Zoom') && (
                  <div className="client-meeting-link-row">
                    <span className="material-symbols-outlined" style={{ color: client.platform === 'Google Meet' ? '#34a853' : '#2d8cff', flexShrink: 0 }}>
                      {client.platform === 'Google Meet' ? 'duo' : 'videocam'}
                    </span>
                    <a
                      href={client.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="client-meeting-link-url"
                      title={client.meetingLink}
                    >
                      {client.meetingLink}
                    </a>
                    <div className="client-meeting-link-actions">
                      <button
                        className="meeting-link-btn copy-btn"
                        onClick={() => handleCopyLink(client.id, client.meetingLink)}
                        title="Copy link"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                          {copiedId === client.id ? 'check' : 'content_copy'}
                        </span>
                        <span>{copiedId === client.id ? 'Copied!' : 'Copy Link'}</span>
                      </button>
                      <a
                        href={client.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="meeting-link-btn join-btn"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>open_in_new</span>
                        <span>Join Meeting</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="card-base" style={{ textAlign: 'center', padding: '48px 24px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--color-outline-variant)' }}>
                person_search
              </span>
              <p style={{ marginTop: '12px', color: 'var(--color-on-surface-variant)' }}>No matching clients found.</p>
            </div>
          )}
        </div>

        {/* Right Column Sidebar */}
        <div className="tracking-right-col">
          <div className="card-base pipeline-widget">
            <h3 className="pipeline-widget-title">Pipeline Summary</h3>
            <div className="pipeline-stat-list">
              <div className="pipeline-stat-row">
                <div className="pipeline-stat-label-box">
                  <div className="pipeline-dot primary"></div>
                  <span>Closed Sale</span>
                </div>
                <span className="pipeline-stat-value">{closedCount}</span>
              </div>
              <div className="pipeline-stat-row">
                <div className="pipeline-stat-label-box">
                  <div className="pipeline-dot secondary"></div>
                  <span>In Progress</span>
                </div>
                <span className="pipeline-stat-value">{inProgressCount}</span>
              </div>
              <div className="pipeline-stat-row">
                <div className="pipeline-stat-label-box">
                  <div className="pipeline-dot neutral"></div>
                  <span>Initial Contact</span>
                </div>
                <span className="pipeline-stat-value">{initialCount}</span>
              </div>
              <div className="pipeline-stat-row">
                <div className="pipeline-stat-label-box">
                  <div className="pipeline-dot" style={{ backgroundColor: 'var(--color-error, #ba1a1a)' }}></div>
                  <span>Not Interested</span>
                </div>
                <span className="pipeline-stat-value">{notInterestedCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
