import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem('vhbc_dark_mode') === 'true'; } catch { return false; }
  });
  const [notifBooking, setNotifBooking] = useState(() => {
    try { return localStorage.getItem('vhbc_notif_booking') !== 'false'; } catch { return true; }
  });
  const [notifAccount, setNotifAccount] = useState(() => {
    try { return localStorage.getItem('vhbc_notif_account') !== 'false'; } catch { return true; }
  });
  const [notifEarnings, setNotifEarnings] = useState(() => {
    try { return localStorage.getItem('vhbc_notif_earnings') !== 'false'; } catch { return true; }
  });

  // Apply dark mode to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    try { localStorage.setItem('vhbc_dark_mode', String(darkMode)); } catch {}
  }, [darkMode]);

  // Persist notification prefs
  useEffect(() => {
    try { localStorage.setItem('vhbc_notif_booking', String(notifBooking)); } catch {}
  }, [notifBooking]);
  useEffect(() => {
    try { localStorage.setItem('vhbc_notif_account', String(notifAccount)); } catch {}
  }, [notifAccount]);
  useEffect(() => {
    try { localStorage.setItem('vhbc_notif_earnings', String(notifEarnings)); } catch {}
  }, [notifEarnings]);

  return (
    <SettingsContext.Provider value={{
      darkMode, setDarkMode,
      notifBooking, setNotifBooking,
      notifAccount, setNotifAccount,
      notifEarnings, setNotifEarnings,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
