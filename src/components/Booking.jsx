import React, { useState } from 'react';

const TIMEZONES = [
  'UTC-12:00 – Baker Island, Howland Island',
  'UTC-11:00 – American Samoa, Niue',
  'UTC-10:00 – Hawaii, Cook Islands',
  'UTC-09:30 – Marquesas Islands',
  'UTC-09:00 – Alaska, Gambier Islands',
  'UTC-08:00 – Pacific Time (US & Canada)',
  'UTC-07:00 – Mountain Time (US & Canada)',
  'UTC-06:00 – Central Time (US & Canada), Mexico City',
  'UTC-05:00 – Eastern Time (US & Canada), Bogota, Lima',
  'UTC-04:00 – Atlantic Time (Canada), Caracas, La Paz',
  'UTC-03:30 – Newfoundland',
  'UTC-03:00 – Brasilia, Buenos Aires, Greenland',
  'UTC-02:00 – Mid-Atlantic, South Georgia',
  'UTC-01:00 – Azores, Cape Verde',
  'UTC±00:00 – GMT, London, Lisbon, Casablanca',
  'UTC+01:00 – Central European Time, Paris, Berlin',
  'UTC+02:00 – Eastern European Time, Cairo, Athens',
  'UTC+03:00 – Moscow, Baghdad, Riyadh, Nairobi',
  'UTC+03:30 – Tehran',
  'UTC+04:00 – Dubai, Baku, Tbilisi, Yerevan',
  'UTC+04:30 – Kabul',
  'UTC+05:00 – Karachi, Tashkent, Yekaterinburg',
  'UTC+05:30 – Indian Standard Time, Colombo',
  'UTC+05:45 – Kathmandu',
  'UTC+06:00 – Almaty, Dhaka, Omsk',
  'UTC+06:30 – Yangon, Cocos Islands',
  'UTC+07:00 – Bangkok, Hanoi, Jakarta, Krasnoyarsk',
  'UTC+08:00 – Beijing, Perth, Singapore, Manila',
  'UTC+08:45 – Eucla',
  'UTC+09:00 – Tokyo, Seoul, Yakutsk',
  'UTC+09:30 – Adelaide, Darwin',
  'UTC+10:00 – Eastern Australia, Guam, Vladivostok',
  'UTC+10:30 – Lord Howe Island',
  'UTC+11:00 – Magadan, Solomon Islands, New Caledonia',
  'UTC+12:00 – Auckland, Wellington, Fiji, Kamchatka',
  'UTC+12:45 – Chatham Islands',
  'UTC+13:00 – Nuku\'alofa, Samoa, Tokelau',
  'UTC+14:00 – Line Islands, Kiribati'
];

export default function Booking({ onAddBooking, onCancel, rescheduleData }) {
  // Helper to get platform identifier from platform name/label
  const getPlatformId = (platformName) => {
    if (!platformName) return 'site_tripping';
    const name = platformName.toLowerCase();
    if (name.includes('meet')) return 'google_meet';
    if (name.includes('zoom')) return 'zoom';
    if (name.includes('messenger') || name.includes('call')) return 'messenger';
    if (name.includes('site') || name.includes('tripping')) return 'site_tripping';
    return 'site_tripping';
  };

  const [clientName, setClientName] = useState(rescheduleData?.clientName || '');
  const [clientEmail, setClientEmail] = useState(rescheduleData?.clientEmail || '');
  const [contactNumber, setContactNumber] = useState(rescheduleData?.clientPhone || '');
  const [preferredDate, setPreferredDate] = useState(rescheduleData?.date || '');
  const [preferredTime, setPreferredTime] = useState(rescheduleData?.rawTime ? rescheduleData.rawTime.slice(0, 5) : '');
  const [timezone, setTimezone] = useState(rescheduleData?.timezone || 'UTC+08:00 – Beijing, Perth, Singapore, Manila');
  const [platform, setPlatform] = useState(getPlatformId(rescheduleData?.platform));
  const [meetingLink, setMeetingLink] = useState(rescheduleData?.meetingLink || '');
  const [notes, setNotes] = useState('');

  const isVirtualMeeting = platform === 'google_meet' || platform === 'zoom';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!clientName || !clientEmail || !contactNumber || !preferredDate || !preferredTime || !timezone) {
      alert('Please fill in all required fields.');
      return;
    }

    // Validate meeting link for virtual platforms
    if (isVirtualMeeting && meetingLink) {
      try { new URL(meetingLink); } catch {
        alert('Please enter a valid meeting link URL.');
        return;
      }
    }

    // Check if the selected date and time are in the future
    const now = new Date();
    const selectedDateTime = new Date(`${preferredDate}T${preferredTime}`);
    if (selectedDateTime <= now) {
      alert('Please select a date and time in the future.');
      return;
    }

    const platformLabel = {
      google_meet: 'Google Meet',
      zoom: 'Zoom',
      messenger: 'Messenger Call',
      site_tripping: 'Site Tripping'
    }[platform] || platform;

    onAddBooking({
      clientName,
      clientEmail,
      contactNumber,
      preferredDate,
      preferredTime,
      timezone,
      platform: platformLabel,
      meetingLink: isVirtualMeeting ? meetingLink.trim() : ''
    });

    alert(rescheduleData ? 'Appointment rescheduled successfully!' : 'Appointment booking confirmed successfully!');
  };

  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>
      {/* Page Header */}
      <header className="welcome-section" style={{ marginBottom: '32px' }}>
        <div>
          <h2 className="welcome-title" style={{ fontSize: '32px' }}>Schedule Booking</h2>
          <p className="welcome-desc" style={{ marginTop: '4px' }}>
            Arrange a property viewing or consultation for your potential client.
          </p>
        </div>
      </header>

      {/* Booking Form Container */}
      <div className="max-w-[800px] mx-auto">
        <div className="booking-form-wrapper">
          <div className="booking-decor-tab"></div>
          
          <form onSubmit={handleSubmit} className="relative z-10" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Client Information */}
            <div>
              <h3 className="booking-form-section-title">
                <span className="material-symbols-outlined">person</span>
                <span>Client Information</span>
              </h3>
              <div className="booking-form-grid">
                <div className="form-group booking-span-full">
                  <label className="form-label" htmlFor="book-client">Client Name *</label>
                  <input
                    type="text"
                    id="book-client"
                    className="form-input"
                    placeholder="Jane Doe"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    readOnly={!!rescheduleData}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="book-email">Client Email *</label>
                  <input
                    type="email"
                    id="book-email"
                    className="form-input"
                    placeholder="jane.doe@example.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    readOnly={!!rescheduleData}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="book-contact">Contact Number *</label>
                  <input
                    type="tel"
                    id="book-contact"
                    className="form-input"
                    placeholder="(555) 123-4567"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    readOnly={!!rescheduleData}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Appointment Details */}
            <div>
              <h3 className="booking-form-section-title">
                <span className="material-symbols-outlined">event_available</span>
                <span>Appointment Details</span>
              </h3>
              <div className="booking-form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="book-date">Preferred Date *</label>
                  <div className="auth-input-wrapper">
                    <span className="material-symbols-outlined auth-input-icon">calendar_today</span>
                    <input
                      type="date"
                      id="book-date"
                      className="form-input"
                      style={{ paddingLeft: '40px' }}
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="book-time">Preferred Time *</label>
                  <div className="auth-input-wrapper">
                    <span className="material-symbols-outlined auth-input-icon">schedule</span>
                    <input
                      type="time"
                      id="book-time"
                      className="form-input"
                      style={{ paddingLeft: '40px' }}
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-group booking-span-full">
                  <label className="form-label" htmlFor="book-timezone">Timezone *</label>
                  <select
                    id="book-timezone"
                    className="form-input select"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    disabled={!!rescheduleData}
                    required
                  >
                    {TIMEZONES.map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group booking-span-full">
                  <label className="form-label" htmlFor="book-platform">Meeting Platform *</label>
                  <select
                    id="book-platform"
                    className="form-input select"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    disabled={!!rescheduleData}
                    required
                  >
                    <option value="site_tripping">Site Tripping (Physical viewings)</option>
                    <option value="google_meet">Google Meet</option>
                    <option value="zoom">Zoom</option>
                    <option value="messenger">Messenger Call</option>
                  </select>
                </div>
                {isVirtualMeeting && (
                  <div className="form-group booking-span-full">
                    <label className="form-label" htmlFor="book-meeting-link">
                      {platform === 'google_meet' ? 'Google Meet Link' : 'Zoom Meeting Link'}
                      <span style={{ color: 'var(--color-on-surface-variant)', fontWeight: 400, marginLeft: 6 }}>(Optional)</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-on-surface-variant)', fontSize: '18px', pointerEvents: 'none' }}>link</span>
                      <input
                        id="book-meeting-link"
                        type="url"
                        className="form-input"
                        style={{ paddingLeft: '38px' }}
                        placeholder={platform === 'google_meet' ? 'https://meet.google.com/xxx-xxxx-xxx' : 'https://zoom.us/j/xxxxxxxxxx'}
                        value={meetingLink}
                        onChange={(e) => setMeetingLink(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <h3 className="booking-form-section-title">
                <span className="material-symbols-outlined">notes</span>
                <span>Additional Notes</span>
              </h3>
              <div className="form-group">
                <label className="form-label" htmlFor="book-notes">Notes (Optional)</label>
                <textarea
                  id="book-notes"
                  className="form-input"
                  placeholder="Any specific requirements or questions from the client?"
                  rows="4"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                ></textarea>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="modal-footer" style={{ borderTop: '1px solid var(--color-outline-variant)', paddingTop: '24px', marginTop: '8px' }}>
              <button type="button" className="btn-modal-cancel" onClick={onCancel} style={{ padding: '12px 24px', height: '48px' }}>
                Cancel
              </button>
              <button type="submit" className="btn-modal-submit" style={{ padding: '0 24px', height: '48px', borderRadius: 'var(--rounded-default)' }}>
                Confirm Booking
              </button>
            </div>
          </form>
        </div>

        {/* Context Info banner */}
        <div className="booking-info-banner animate-fade-in">
          <div className="booking-info-icon">
            <span className="material-symbols-outlined fill text-2xl">info</span>
          </div>
          <div>
            <h4 className="booking-info-title">Booking Confirmation Process</h4>
            <p className="booking-info-text">
              Once submitted, our sales team will reach out to the client within 24 hours to confirm the exact time and meeting location. You will receive an email notification once the appointment is locked in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
