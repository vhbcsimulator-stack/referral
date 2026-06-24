import { useState, useEffect, useRef, useCallback } from 'react';
import { authSupabase } from '../supabaseClient';

const STORAGE_PREFIX = 'vhbc_notifications_';
const MAX_NOTIFICATIONS = 50;

function buildStorageKey(userId) {
  return `${STORAGE_PREFIX}${userId}`;
}

function loadFromStorage(userId) {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(buildStorageKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(userId, notifications) {
  if (!userId) return;
  try {
    localStorage.setItem(buildStorageKey(userId), JSON.stringify(notifications.slice(0, MAX_NOTIFICATIONS)));
  } catch {
    // storage full or unavailable – silently fail
  }
}

function makeNotification({ type, title, message, icon }) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    title,
    message,
    icon,
    timestamp: new Date().toISOString(),
    read: false,
  };
}

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState(() => loadFromStorage(userId));
  const prevStatusRef = useRef({});

  // Persist every time notifications change
  useEffect(() => {
    saveToStorage(userId, notifications);
  }, [userId, notifications]);

  // Re-load from storage when userId changes (login switch)
  useEffect(() => {
    setNotifications(loadFromStorage(userId));
    prevStatusRef.current = {};
  }, [userId]);

  const addNotification = useCallback((notif) => {
    setNotifications(prev => {
      const next = [notif, ...prev].slice(0, MAX_NOTIFICATIONS);
      saveToStorage(userId, next);
      return next;
    });
  }, [userId]);

  const markRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    saveToStorage(userId, []);
  }, [userId]);

  // -------------------------------------------------------
  // Supabase Realtime subscriptions
  // -------------------------------------------------------
  useEffect(() => {
    if (!userId) return;

    // --- schedules table subscription ---
    const schedChannel = authSupabase
      .channel(`schedules-notif-${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'schedules', filter: `referrer_id=eq.${userId}` },
        (payload) => {
          const row = payload.new;
          addNotification(makeNotification({
            type: 'booking_created',
            title: 'New Booking Created',
            message: `A new appointment was booked for ${row.client_name || 'a client'} via ${row.platform || 'unknown platform'}.`,
            icon: 'calendar_add_on',
          }));
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'schedules', filter: `referrer_id=eq.${userId}` },
        (payload) => {
          const newRow = payload.new;
          const oldRow = payload.old;

          // Status changed?
          if (oldRow.status !== newRow.status) {
            const prevStatus = oldRow.status || prevStatusRef.current[newRow.id] || 'Unknown';
            prevStatusRef.current[newRow.id] = newRow.status;

            const status = newRow.status || 'updated';
            let icon = 'info';
            let type = 'status_change';

            if (['closed sale', 'closed', 'sold', 'reserved'].includes(status.toLowerCase())) {
              icon = 'check_circle';
              type = 'booking_closed';
            } else if (status.toLowerCase() === 'cancelled') {
              icon = 'cancel';
              type = 'booking_cancelled';
            } else if (status.toLowerCase() === 'approved' || status.toLowerCase() === 'for tripping') {
              icon = 'event_available';
              type = 'booking_approved';
            } else if (status.toLowerCase() === 'pending') {
              icon = 'pending';
              type = 'booking_pending';
            } else if (status.toLowerCase() === 'done tripping') {
              icon = 'task_alt';
              type = 'booking_tripped';
            }

            addNotification(makeNotification({
              type,
              title: 'Booking Status Updated',
              message: `${newRow.client_name || 'Client'} status changed from "${prevStatus}" to "${status}".`,
              icon,
            }));
          }

          // Schedule date/time rescheduled?
          const dateChanged = oldRow.schedule_date && newRow.schedule_date && oldRow.schedule_date !== newRow.schedule_date;
          const timeChanged = oldRow.schedule_time && newRow.schedule_time && oldRow.schedule_time !== newRow.schedule_time;
          if (dateChanged || timeChanged) {
            addNotification(makeNotification({
              type: 'rescheduled',
              title: 'Appointment Rescheduled',
              message: `Appointment for ${newRow.client_name || 'a client'} was rescheduled to ${newRow.schedule_date || 'a new date'}.`,
              icon: 'event_repeat',
            }));
          }
        }
      )
      .subscribe();

    // --- app_users table subscription (account status changes) ---
    const userChannel = authSupabase
      .channel(`user-account-notif-${userId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'app_users', filter: `id=eq.${userId}` },
        (payload) => {
          const newRow = payload.new;
          const oldRow = payload.old;

          // Verification status change
          if (oldRow.verification_status !== newRow.verification_status) {
            const status = newRow.verification_status || 'updated';
            let icon = 'manage_accounts';
            let title = 'Account Status Updated';
            let message = `Your account status has been changed to "${status}".`;

            if (status === 'verified') {
              icon = 'verified_user';
              title = 'Account Verified!';
              message = 'Your account has been verified by an admin. You now have full access.';
            } else if (status === 'rejected') {
              icon = 'gpp_bad';
              title = 'Account Verification Failed';
              message = 'Your verification was rejected. Please contact support.';
            } else if (status === 'pending') {
              icon = 'pending_actions';
              title = 'Account Under Review';
              message = 'Your account is pending admin verification.';
            }

            addNotification(makeNotification({ type: 'account_status', title, message, icon }));
          }
        }
      )
      .subscribe();

    // --- total_earnings table subscription ---
    const earningsChannel = authSupabase
      .channel(`earnings-notif-${userId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'total_earnings', filter: `user_id=eq.${userId}` },
        (payload) => {
          const newRow = payload.new;
          const oldRow = payload.old;
          if (oldRow.total_amount !== newRow.total_amount) {
            const diff = (Number(newRow.total_amount) - Number(oldRow.total_amount)).toFixed(2);
            const isIncrease = Number(diff) > 0;
            addNotification(makeNotification({
              type: 'earnings_update',
              title: isIncrease ? 'Earnings Increased' : 'Earnings Updated',
              message: isIncrease
                ? `Your total earnings increased by ₱${Math.abs(diff).toLocaleString()}.`
                : `Your total earnings were updated to ₱${Number(newRow.total_amount).toLocaleString()}.`,
              icon: 'payments',
            }));
          }
        }
      )
      .subscribe();

    return () => {
      authSupabase.removeChannel(schedChannel);
      authSupabase.removeChannel(userChannel);
      authSupabase.removeChannel(earningsChannel);
    };
  }, [userId, addNotification]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return { notifications, unreadCount, markRead, markAllRead, clearAll };
}
