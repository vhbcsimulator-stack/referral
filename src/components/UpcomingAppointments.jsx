import React from 'react';

export default function UpcomingAppointments({ appointments, onViewSchedule }) {
  return (
    <div className="upcoming-appointments-card card-base">
      <div className="upcoming-header">
        <h4 className="upcoming-title">Upcoming</h4>
        <span className="live-badge">Live</span>
      </div>

      <div className="appointments-list">
        {appointments.map((appt) => (
          <div key={appt.id} className="appointment-item">
            <div className={`date-badge ${appt.isMain ? 'primary' : 'neutral'}`}>
              <span className="date-day">{appt.day}</span>
              <span className="date-month">{appt.month}</span>
            </div>
            <div className="appointment-info">
              <p className="appointment-subject">{appt.subject}</p>
              <p className="appointment-details">{appt.time} • {appt.type}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="view-schedule-btn" onClick={onViewSchedule}>
        <span className="material-symbols-outlined">calendar_month</span>
        <span>View Schedule</span>
      </button>
    </div>
  );
}
