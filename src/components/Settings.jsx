import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';

function Toggle({ checked, onChange, id }) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`settings-toggle ${checked ? 'on' : ''}`}
    >
      <span className="settings-toggle-knob" />
    </button>
  );
}

function SettingRow({ icon, iconColor, title, desc, control }) {
  return (
    <div className="settings-row">
      <div className="settings-row-icon" style={{ backgroundColor: `${iconColor}18`, color: iconColor }}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div className="settings-row-text">
        <span className="settings-row-title">{title}</span>
        <span className="settings-row-desc">{desc}</span>
      </div>
      <div className="settings-row-control">
        {control}
      </div>
    </div>
  );
}

export default function Settings({ userName, userEmail }) {
  const {
    darkMode, setDarkMode,
    notifBooking, setNotifBooking,
    notifAccount, setNotifAccount,
    notifEarnings, setNotifEarnings,
  } = useSettings();

  const [savedToast, setSavedToast] = useState(false);

  const showSaved = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const handleToggle = (setter) => (val) => {
    setter(val);
    showSaved();
  };

  return (
    <div className="settings-page animate-fade-in">
      {/* Page Header */}
      <div className="settings-page-header">
        <div>
          <h2 className="settings-page-title">Settings</h2>
          <p className="settings-page-subtitle">Manage your preferences and account options.</p>
        </div>
        {savedToast && (
          <div className="settings-saved-toast animate-fade-in">
            <span className="material-symbols-outlined">check_circle</span>
            <span>Preferences saved.</span>
          </div>
        )}
      </div>

      {/* ── Appearance Card ── */}
      <section className="settings-card">
        <div className="settings-card-header">
          <span className="material-symbols-outlined settings-section-icon">palette</span>
          <h3 className="settings-card-title">Appearance</h3>
        </div>
        <div className="settings-card-body">
          <SettingRow
            icon="dark_mode"
            iconColor="#4f46e5"
            title="Dark Mode"
            desc="Switch to a dark color scheme to reduce eye strain in low-light environments."
            control={
              <div className="settings-toggle-group">
                <span className="settings-toggle-label">{darkMode ? 'On' : 'Off'}</span>
                <Toggle
                  id="toggle-dark-mode"
                  checked={darkMode}
                  onChange={handleToggle(setDarkMode)}
                />
              </div>
            }
          />
        </div>
      </section>

      {/* ── Notification Preferences Card ── */}
      <section className="settings-card">
        <div className="settings-card-header">
          <span className="material-symbols-outlined settings-section-icon">notifications</span>
          <h3 className="settings-card-title">Notifications</h3>
        </div>
        <div className="settings-card-body">
          <SettingRow
            icon="calendar_add_on"
            iconColor="#7c3aed"
            title="Booking Updates"
            desc="Receive in-app notifications when your booking status changes."
            control={
              <div className="settings-toggle-group">
                <span className="settings-toggle-label">{notifBooking ? 'On' : 'Off'}</span>
                <Toggle id="toggle-notif-booking" checked={notifBooking} onChange={handleToggle(setNotifBooking)} />
              </div>
            }
          />
          <div className="settings-divider" />
          <SettingRow
            icon="manage_accounts"
            iconColor="#0369a1"
            title="Account Alerts"
            desc="Get notified when your account verification status is updated."
            control={
              <div className="settings-toggle-group">
                <span className="settings-toggle-label">{notifAccount ? 'On' : 'Off'}</span>
                <Toggle id="toggle-notif-account" checked={notifAccount} onChange={handleToggle(setNotifAccount)} />
              </div>
            }
          />
          <div className="settings-divider" />
          <SettingRow
            icon="payments"
            iconColor="#16a34a"
            title="Earnings Alerts"
            desc="Get notified when your total earnings are updated."
            control={
              <div className="settings-toggle-group">
                <span className="settings-toggle-label">{notifEarnings ? 'On' : 'Off'}</span>
                <Toggle id="toggle-notif-earnings" checked={notifEarnings} onChange={handleToggle(setNotifEarnings)} />
              </div>
            }
          />
        </div>
      </section>

      {/* ── Account Info Card ── */}
      <section className="settings-card">
        <div className="settings-card-header">
          <span className="material-symbols-outlined settings-section-icon">person</span>
          <h3 className="settings-card-title">Account</h3>
        </div>
        <div className="settings-card-body">
          <div className="settings-account-info-grid">
            <div className="settings-info-field">
              <label className="settings-info-label">Full Name</label>
              <div className="settings-info-value">
                <span className="material-symbols-outlined settings-info-icon">badge</span>
                <span>{userName || '—'}</span>
              </div>
            </div>
            <div className="settings-info-field">
              <label className="settings-info-label">Email Address</label>
              <div className="settings-info-value">
                <span className="material-symbols-outlined settings-info-icon">mail</span>
                <span>{userEmail || '—'}</span>
              </div>
            </div>
          </div>
          <div className="settings-account-note">
            <span className="material-symbols-outlined">info</span>
            <span>To update your account details, go to your Profile page or contact your VHBC administrator.</span>
          </div>
        </div>
      </section>
    </div>
  );
}
