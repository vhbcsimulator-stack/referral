import React, { useState } from 'react';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const WEEKDAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay(); // 0 = Sun … 6 = Sat
}

export default function Schedule({ appointments, onConfirmAppointment, onCancelAppointment, onNavigate }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [selectedClient, setSelectedClient] = useState(null);

  // ---- Calendar data ----
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDow = getFirstDayOfMonth(viewYear, viewMonth);

  // Previous month fill-in
  const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
  const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

  const calendarDays = [];
  for (let i = firstDow - 1; i >= 0; i--) {
    calendarDays.push({ day: daysInPrevMonth - i, isCurrentMonth: false });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({ day: i, isCurrentMonth: true });
  }
  // Fill remaining cells to complete last row
  const remainder = calendarDays.length % 7;
  if (remainder !== 0) {
    for (let i = 1; i <= 7 - remainder; i++) {
      calendarDays.push({ day: i, isCurrentMonth: false });
    }
  }

  // Days that have appointments (for event dots)
  const appointmentDays = new Set(
    appointments.map((a) => {
      if (a.date) {
        const d = new Date(a.date);
        if (d.getFullYear() === viewYear && d.getMonth() === viewMonth) {
          return d.getDate();
        }
      }
      return null;
    }).filter(Boolean)
  );
  // Fallback hardcoded dots when no appointments have .date
  const defaultDotDays = appointments.length === 0 ? new Set() : new Set([4, 6, 9, 12, 18]);
  const effectiveDotDays = appointmentDays.size > 0 ? appointmentDays : defaultDotDays;

  // ---- Selected day info ----
  const selectedDow = new Date(viewYear, viewMonth, selectedDay).getDay();
  const selectedDayLabel = `${WEEKDAY_FULL[selectedDow]}, ${MONTHS[viewMonth]} ${selectedDay}`;

  // ---- Month navigation ----
  const goPrevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else { setViewMonth(m => m - 1); }
    setSelectedDay(1);
  };
  const goNextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else { setViewMonth(m => m + 1); }
    setSelectedDay(1);
  };

  // ---- Filter and sort upcoming appointments for the list (today and onwards, nearest first) ----
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const getApptDateTime = (dateStr, timeStr) => {
    if (!dateStr) return new Date(0);
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes, seconds] = (timeStr || '00:00:00').split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes, seconds || 0);
  };

  const upcomingAppts = appointments
    .filter(appt => {
      const isUpcoming = getApptDateTime(appt.date, appt.rawTime) >= todayStart;
      const statusLower = (appt.status || '').toLowerCase().trim();
      const isClosed = ['closed sale', 'closed', 'sold', 'reserved', 'converted', 'cleared'].includes(statusLower);
      return isUpcoming && !isClosed;
    })
    .sort((a, b) => getApptDateTime(a.date, a.rawTime) - getApptDateTime(b.date, b.rawTime));

  const formatApptDate = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    return dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // ---- Stats ----
  const siteVisits = upcomingAppts.filter(a => a.type === 'site').length;
  const virtualConsults = upcomingAppts.filter(a => a.type === 'virtual').length;
  const pendingConfirmations = upcomingAppts.filter(a => a.status === 'Pending').length;

  const isCurrentMonthView =
    viewYear === today.getFullYear() && viewMonth === today.getMonth();

  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>
      {/* Page Header & Actions */}
      <div className="schedule-filters-row">
        <div>
          <h2 className="welcome-title" style={{ fontSize: '32px' }}>Upcoming Appointments</h2>
          <p className="welcome-desc" style={{ marginTop: '4px' }}>
            Manage your referral site visits and consultations.
          </p>
        </div>
        <div className="schedule-actions-box">
          <div className="schedule-date-picker">
            <span className="material-symbols-outlined schedule-date-icon-left">event</span>
            <input
              type="text"
              className="schedule-date-picker-input"
              value={`${MONTHS[viewMonth]} ${viewYear}`}
              readOnly
            />
            <span className="material-symbols-outlined schedule-date-icon-right">arrow_drop_down</span>
          </div>
          <button
            className="sidebar-cta-btn"
            style={{ margin: 0, height: '42px', display: 'flex', alignItems: 'center' }}
            onClick={() => onNavigate('booking')}
          >
            <span className="material-symbols-outlined">add</span>
            <span>Book Appointment</span>
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="schedule-flex-grid">
        {/* Left Column: Mini Calendar & Quick Stats */}
        <div className="schedule-left-col">
          {/* Mini Calendar Card */}
          <div className="card-base mini-calendar-card">
            <div className="calendar-month-header">
              <h3 className="calendar-month-title">{MONTHS[viewMonth]} {viewYear}</h3>
              <div className="calendar-arrows">
                <button className="calendar-arrow-btn" aria-label="Previous Month" onClick={goPrevMonth}>
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button className="calendar-arrow-btn" aria-label="Next Month" onClick={goNextMonth}>
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>

            {/* Weekday headers */}
            <div className="calendar-week-days">
              {WEEKDAYS.map(d => <div key={d}>{d}</div>)}
            </div>

            {/* Day cells */}
            <div className="calendar-days-grid">
              {calendarDays.map((d, index) => {
                const isSelected = d.isCurrentMonth && d.day === selectedDay;
                const isToday = d.isCurrentMonth && isCurrentMonthView && d.day === today.getDate();
                const hasDot = d.isCurrentMonth && effectiveDotDays.has(d.day) && !isSelected;
                const dotClass = d.day === 9 ? 'calendar-day-dot-secondary' : 'calendar-day-dot-primary';

                return (
                  <div
                    key={index}
                    onClick={() => d.isCurrentMonth && setSelectedDay(d.day)}
                    className={[
                      'calendar-day-cell',
                      !d.isCurrentMonth ? 'inactive-day' : '',
                      isSelected ? 'today-active' : '',
                      !isSelected && isToday ? 'calendar-day-today-ring' : '',
                      hasDot ? dotClass : '',
                    ].filter(Boolean).join(' ')}
                  >
                    {d.day}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekly Summary */}
          <div className="card-base weekly-stats-card">
            <h3 className="weekly-stats-label">This Week</h3>
            <div className="weekly-stats-list">
              <div className="weekly-stat-row">
                <span className="weekly-stat-name">Site Visits</span>
                <span className="weekly-stat-count">{siteVisits}</span>
              </div>
              <div className="weekly-stat-row">
                <span className="weekly-stat-name">Virtual Consults</span>
                <span className="weekly-stat-count">{virtualConsults}</span>
              </div>
              <div className="weekly-stat-row">
                <span className="weekly-stat-name">Pending Confirmations</span>
                <span className="weekly-stat-count">{pendingConfirmations}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Schedule List */}
        <div className="card-base schedule-list-card">
          <div className="schedule-list-header">
            <div>
              <h3 className="schedule-header-date">Upcoming Schedules</h3>
              <p className="schedule-header-subtitle">
                {upcomingAppts.length} Appointment{upcomingAppts.length !== 1 ? 's' : ''} scheduled
              </p>
            </div>
            <button className="schedule-print-btn" onClick={() => window.print()}>
              <span className="material-symbols-outlined">print</span>
              <span>Print</span>
            </button>
          </div>

          <div className="schedule-events-container">
            {upcomingAppts.length === 0 ? (
              <div className="schedule-empty-state">
                <span className="material-symbols-outlined schedule-empty-icon">event_available</span>
                <p className="schedule-empty-title">No upcoming appointments</p>
                <p className="schedule-empty-desc">
                  Click <strong>Book Appointment</strong> to add one.
                </p>
              </div>
            ) : (
              upcomingAppts.map((appt) => (
                <div key={appt.id} className="schedule-event-card">
                  <div className={`schedule-event-glow ${appt.status === 'Confirmed' ? 'primary' : appt.status === 'Virtual' ? 'secondary' : 'tertiary'}`}></div>

                  {/* Time */}
                  <div className="event-time-col">
                    <div>
                      <span className="event-time-val">{appt.time.split(' ')[0]}</span>{' '}
                      <span className="event-time-ampm">{appt.time.split(' ')[1]}</span>
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px', fontWeight: '500', color: 'var(--color-primary, #6750a4)' }}>
                      {formatApptDate(appt.date)}
                    </div>
                    <span className={`chip chip-${appt.status.toLowerCase().replace(' ', '-')} event-time-badge-mobile`}>
                      {appt.status}
                    </span>
                  </div>

                  <div className="event-divider-line"></div>

                  {/* Content */}
                  <div className="event-content-col">
                    <div className="event-content-header">
                      <div>
                        <h4 className="event-content-title">{appt.subject}</h4>
                        <p className="event-content-meta">
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>person</span>
                          <span>Client: {appt.clientName}</span>
                        </p>
                        {appt.clientEmail && (
                          <p className="event-content-meta" style={{ marginTop: '2px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>mail</span>
                            <span>{appt.clientEmail}</span>
                          </p>
                        )}
                      </div>
                      <span className={`chip chip-${appt.status.toLowerCase().replace(' ', '-')} event-badge-desktop`}>
                        {appt.status}
                      </span>
                    </div>

                    <div className="event-footer-details">
                      <div className="event-detail-item">
                        <span className="material-symbols-outlined">
                          {appt.type === 'virtual' ? 'videocam' : 'location_on'}
                        </span>
                        {appt.type === 'virtual' ? (
                          <a href="#zoom" onClick={(e) => { e.preventDefault(); alert('Connecting to video call...'); }}>
                            {appt.location}
                          </a>
                        ) : (
                          <span>{appt.location}</span>
                        )}
                      </div>
                      <div className="event-detail-item">
                        <span className="material-symbols-outlined">schedule</span>
                        <span>{appt.duration}</span>
                      </div>
                    </div>

                    <div className="event-action-buttons">
                      {appt.status === 'Pending' ? (
                        <>
                          <button
                            className="event-btn-action"
                            style={{ color: 'var(--color-error, #ba1a1a)' }}
                            onClick={() => onCancelAppointment(appt.id)}
                          >
                            Cancel
                          </button>
                          <button
                            className="event-btn-action"
                            onClick={() => setSelectedClient(appt)}
                          >
                            View Client
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="event-btn-action" onClick={() => onNavigate('booking', appt)}>
                            Reschedule
                          </button>
                          <button className="event-btn-action" onClick={() => setSelectedClient(appt)}>
                            View Client
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Client Detail Modal */}
      {selectedClient && (
        <div className="modal-backdrop" onClick={() => setSelectedClient(null)} style={{ zIndex: 1000 }}>
          <div 
            className="card-base" 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              width: '90%', 
              maxWidth: '500px', 
              padding: '28px', 
              position: 'fixed', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)', 
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              borderRadius: '24px',
              border: '1px solid var(--color-outline-variant, #cac4d0)',
              backgroundColor: 'var(--color-surface-container-high, #ece6f0)',
              zIndex: 1001,
              animation: 'modalFadeIn 0.2s ease-out'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', margin: 0, color: 'var(--color-on-surface, #1d1b20)' }}>Client Profile Details</h3>
              <button 
                onClick={() => setSelectedClient(null)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  color: 'var(--color-on-surface-variant, #49454f)' 
                }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div 
                style={{ 
                  width: '56px', 
                  height: '56px', 
                  borderRadius: '50%', 
                  backgroundColor: 'var(--color-primary-container, #eaddff)', 
                  color: 'var(--color-on-primary-container, #21005d)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '20px', 
                  fontWeight: 'bold' 
                }}
              >
                {selectedClient.clientName.split(' ').map(w => w[0]).join('')}
              </div>
              <div>
                <h4 style={{ fontSize: '18px', fontWeight: '600', margin: 0, color: 'var(--color-on-surface, #1d1b20)' }}>{selectedClient.clientName}</h4>
                <span 
                  className={`chip chip-${selectedClient.status.toLowerCase().replace(' ', '-')}`}
                  style={{ marginTop: '6px', display: 'inline-block' }}
                >
                  {selectedClient.status}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              {/* Contact Info */}
              <div style={{ borderBottom: '1px solid var(--color-outline-variant, #cac4d0)', paddingBottom: '16px' }}>
                <p style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--color-on-surface-variant, #49454f)', margin: '0 0 8px 0' }}>Contact Information</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-on-surface, #1d1b20)', fontSize: '14px', marginBottom: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>mail</span>
                  <span>{selectedClient.clientEmail || 'No email provided'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-on-surface, #1d1b20)', fontSize: '14px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>phone</span>
                  <span>{selectedClient.clientPhone || 'No phone number provided'}</span>
                </div>
              </div>

              {/* Schedule Info */}
              <div>
                <p style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--color-on-surface-variant, #49454f)', margin: '0 0 8px 0' }}>Appointment Details</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-on-surface, #1d1b20)', fontSize: '14px', marginBottom: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>calendar_today</span>
                  <span>{formatApptDate(selectedClient.date)} at {selectedClient.time}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-on-surface, #1d1b20)', fontSize: '14px', marginBottom: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>meeting_room</span>
                  <span style={{ textTransform: 'capitalize' }}>Platform: {selectedClient.platform.replace('_', ' ')}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-on-surface, #1d1b20)', fontSize: '14px', marginBottom: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>map</span>
                  <span>Location: {selectedClient.location}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-on-surface, #1d1b20)', fontSize: '14px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>public</span>
                  <span>Timezone: {selectedClient.timezone}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                className="sidebar-cta-btn" 
                onClick={() => setSelectedClient(null)}
                style={{ margin: 0, padding: '10px 24px', height: 'auto' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
