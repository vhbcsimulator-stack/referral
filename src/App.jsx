import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MetricCard from './components/MetricCard';
import RecentActivity from './components/RecentActivity';
import QuickActions from './components/QuickActions';
import UpcomingAppointments from './components/UpcomingAppointments';
import RewardsBanner from './components/RewardsBanner';
import BottomNavBar from './components/BottomNavBar';
import ReferralModal from './components/ReferralModal';
import MobileHeader from './components/MobileHeader';
import NotificationPanel from './components/NotificationPanel';
import { authSupabase } from './supabaseClient';
import { useNotifications } from './hooks/useNotifications';

// Import New Pages
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Earnings from './components/Earnings';
import Schedule from './components/Schedule';
import Tracking from './components/Tracking';
import Mechanics from './components/Mechanics';
import Booking from './components/Booking';
import Projects from './components/Projects';
import Settings from './components/Settings';
import Profile from './components/Profile';
import Support from './components/Support';
import EmailConfirmed from './components/EmailConfirmed';

const getPathRoute = () => {
  const path = window.location.pathname.replace(/^\/|\/$/g, '');
  const validRoutes = ['signin', 'signup', 'dashboard', 'earnings', 'schedule', 'tracking', 'mechanics', 'booking', 'projects', 'settings', 'profile', 'support', 'email-confirmed'];
  return validRoutes.includes(path) ? path : '';
};

export default function App() {
  // Navigation Routing States
  // Public tabs: 'signin', 'signup'
  // Private tabs: 'dashboard', 'earnings', 'schedule', 'tracking', 'mechanics', 'booking'
  const [currentRoute, setCurrentRoute] = useState(() => getPathRoute() || 'signin');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState(null);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);
  const [profilePicUrl, setProfilePicUrl] = useState(null);

  // Auth Verification States
  const [authLoading, setAuthLoading] = useState(true);
  const lastCheckedUserRef = useRef(null);
  const pendingCheckRef = useRef(null);

  // Search filter
  const [searchVal, setSearchVal] = useState('');

  // Modals & UI States
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rescheduleData, setRescheduleData] = useState(null);

  // Global State Arrays
  // Global State Arrays
  const [activities, setActivities] = useState([]);
  const [clients, setClients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Supabase Database States
  const [totalEarningsFromDb, setTotalEarningsFromDb] = useState(0);
  const [pendingEarningsFromDb, setPendingEarningsFromDb] = useState(0);
  const [dbLoading, setDbLoading] = useState(false);

  // Helper function to format time (HH:mm:ss -> 12-hour format)
  const formatDbTimeTo12Hour = (dbTime) => {
    if (!dbTime) return '12:00 PM';
    const parts = dbTime.split(':');
    if (parts.length < 2) return '12:00 PM';
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  };

  // Helper function to format relative time
  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return 'Just now';
    const now = new Date();
    const past = new Date(dateStr);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  // Fetch schedules & total earnings from Supabase
  const fetchSchedulesAndEarnings = async (userId) => {
    if (!userId) return;
    setDbLoading(true);
    try {
      // Fetch profile picture URL
      const { data: userProfile, error: profileError } = await authSupabase
        .from('app_users')
        .select('profile_picture_url')
        .eq('id', userId)
        .maybeSingle();

      if (!profileError && userProfile) {
        setProfilePicUrl(userProfile.profile_picture_url || null);
      }

      // 1. Fetch schedules
      const { data: schedules, error: schedError } = await authSupabase
        .from('schedules')
        .select()
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false });

      if (schedError) throw schedError;

      const safeSchedules = schedules || [];

      // 2. Fetch total earnings from table
      const { data: earnings, error: earnError } = await authSupabase
        .from('total_earnings')
        .select('total_amount')
        .eq('user_id', userId)
        .maybeSingle();

      if (earnError) throw earnError;

      // 3. Map schedules to activities
      const mappedActivities = safeSchedules.map(s => ({
        id: s.id,
        name: s.client_name,
        action: `${s.status} referral booking via ${s.platform}`,
        value: ['closed sale', 'closed', 'sold', 'reserved'].includes((s.status || '').toLowerCase().trim()) ? 1000 : 0,
        status: s.status === 'Approved' ? 'For Tripping' : s.status,
        time: formatRelativeTime(s.created_at),
        avatar: ''
      }));

      // 4. Map schedules to clients (tracking page)
      const mappedClients = safeSchedules.map(s => ({
        id: s.id,
        name: s.client_name,
        email: s.client_email,
        phone: s.client_number,
        status: s.status === 'Approved' ? 'For Tripping' : s.status,
        date: new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        propertyInterest: s.platform === 'site_tripping' ? 'Site Tripping View' : s.platform,
        scheduleDate: s.schedule_date,
        scheduleTime: formatDbTimeTo12Hour(s.schedule_time),
        platform: s.platform,
        meetingLink: s.meeting_link || ''
      }));

      // 5. Map schedules to appointments
      const mappedAppts = safeSchedules.map(s => {
        const dateParts = s.schedule_date ? s.schedule_date.split('-') : [];
        let day = '';
        let month = '';
        if (dateParts.length === 3) {
          const dateObj = new Date(parseInt(dateParts[0], 10), parseInt(dateParts[1], 10) - 1, parseInt(dateParts[2], 10));
          day = String(dateObj.getDate());
          month = dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
        }

        return {
          id: s.id,
          clientName: s.client_name,
          clientEmail: s.client_email,
          clientPhone: s.client_number || 'N/A',
          platform: s.platform,
          timezone: s.timezone || 'UTC+08:00 – Beijing, Perth, Singapore, Manila',
          subject: s.platform === 'site_tripping' ? 'Model House Site Tripping' : 'Initial Referral Consultation',
          time: formatDbTimeTo12Hour(s.schedule_time),
          date: s.schedule_date,
          rawTime: s.schedule_time || '00:00:00',
          day,
          month,
          duration: '1 hr 00 mins',
          status: s.status === 'Approved' ? 'For Tripping' : s.status,
          type: s.platform === 'site_tripping' ? 'site' : 'virtual',
          location: s.platform === 'site_tripping' ? 'VHBC Property Lot Tour' : 'Online Call',
          meetingLink: s.meeting_link || ''
        };
      });

      // 6. Map schedules to transactions
      const mappedTxs = safeSchedules.map(s => {
        const statusLower = (s.status || '').toLowerCase().trim();
        const isCleared = ['closed sale', 'closed', 'sold', 'reserved'].includes(statusLower);
        const isCancelled = statusLower === 'cancelled';
        return {
          id: s.id,
          clientName: s.client_name,
          details: `${s.platform} - Referral Reward`,
          amount: 1000.00,
          date: new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          type: s.platform === 'site_tripping' ? 'Villa' : 'Condo',
          status: isCleared ? 'Cleared' : isCancelled ? 'Cancelled' : 'Pending'
        };
      });

      // 7. Calculate total & pending values
      let calculatedTotal = 0.0;
      let calculatedPending = 0.0;
      for (const s of safeSchedules) {
        const statusLower = (s.status || '').toLowerCase().trim();
        if (['closed sale', 'closed', 'sold', 'reserved'].includes(statusLower)) {
          calculatedTotal += 1000.0;
        } else if (!statusLower.includes('cancel')) {
          calculatedPending += 1000.0;
        }
      }

      setActivities(mappedActivities);
      setClients(mappedClients);
      setAppointments(mappedAppts);
      setTransactions(mappedTxs);
      setTotalEarningsFromDb(earnings?.total_amount !== undefined ? Number(earnings.total_amount) : calculatedTotal);
      setPendingEarningsFromDb(calculatedPending);

      // Upsert total_amount to DB if unsynced
      if (!earnings || Number(earnings.total_amount) !== calculatedTotal) {
        await authSupabase.from('total_earnings').upsert({
          user_id: userId,
          total_amount: calculatedTotal,
          updated_at: new Date().toISOString(),
        });
        setTotalEarningsFromDb(calculatedTotal);
      }
    } catch (e) {
      console.error('Error fetching schedules & earnings:', e);
    } finally {
      setDbLoading(false);
    }
  };

  // Helper function to check user verification and manage login session
  const checkVerificationAndLogin = async (session, event) => {
    // If the user is on /email-confirmed, never redirect away — just clear state and stay.
    const currentPath = getPathRoute();
    if (currentPath === 'email-confirmed') {
      setIsLoggedIn(false);
      setUserId(null);
      setUserName('');
      setUserEmail('');
      setCurrentRoute('email-confirmed');
      setAuthLoading(false);
      return;
    }

    if (!session) {
      pendingCheckRef.current = null;
      lastCheckedUserRef.current = null;
      setIsLoggedIn(false);
      setUserId(null);
      setUserName('');
      setUserEmail('');

      const pathRoute = getPathRoute();
      if (pathRoute === 'signup') {
        setCurrentRoute('signup');
      } else {
        setCurrentRoute('signin');
      }

      setNotifPanelOpen(false);
      setActivities([]);
      setClients([]);
      setAppointments([]);
      setTransactions([]);
      setTotalEarningsFromDb(0);
      setPendingEarningsFromDb(0);
      setProfilePicUrl(null);
      setAuthLoading(false);
      return;
    }

    if (lastCheckedUserRef.current === session.user.id || pendingCheckRef.current === session.user.id) {
      setAuthLoading(false);
      return;
    }

    pendingCheckRef.current = session.user.id;

    try {
      // Check if the user is verified in the app_users table
      const { data: userRecord, error: dbError } = await authSupabase
        .from('app_users')
        .select('verification_status')
        .eq('id', session.user.id)
        .maybeSingle();

      if (dbError) throw dbError;

      const isVerified = userRecord?.verification_status === 'verified';

      if (!isVerified) {
        lastCheckedUserRef.current = null;
        pendingCheckRef.current = null;
        
        // Sign them out immediately so they can't access the app
        await authSupabase.auth.signOut();
        
        setIsLoggedIn(false);
        setUserId(null);
        setUserName('');
        setUserEmail('');

        const pathRoute = getPathRoute();
        if (pathRoute === 'signup') {
          setCurrentRoute('signup');
        } else {
          setCurrentRoute('signin');
        }

        if (event === 'SIGNED_IN' && getPathRoute() === 'signin') {
          alert('Your account is pending verification. Please wait for an admin to approve your account.');
        }
        setAuthLoading(false);
        return;
      }

      // User is verified, log them in
      lastCheckedUserRef.current = session.user.id;
      setIsLoggedIn(true);
      setUserId(session.user.id);
      setUserName(session.user.user_metadata?.full_name || session.user.email);
      setUserEmail(session.user.email || '');

      const pathRoute = getPathRoute();
      const privateRoutes = ['dashboard', 'earnings', 'schedule', 'tracking', 'mechanics', 'booking', 'projects', 'settings', 'profile', 'support'];
      if (privateRoutes.includes(pathRoute)) {
        setCurrentRoute(pathRoute);
      } else {
        setCurrentRoute('dashboard');
      }

      await fetchSchedulesAndEarnings(session.user.id);
    } catch (e) {
      console.error('Error verifying user status:', e);
      lastCheckedUserRef.current = null;
      // Only sign out & redirect if not on email-confirmed
      if (getPathRoute() !== 'email-confirmed') {
        await authSupabase.auth.signOut();
        setIsLoggedIn(false);
        setCurrentRoute('signin');
      }
    } finally {
      pendingCheckRef.current = null;
      setAuthLoading(false);
    }
  };

  // Auth Session State Effect
  useEffect(() => {
    // Check current active session
    authSupabase.auth.getSession().then(({ data: { session } }) => {
      checkVerificationAndLogin(session, 'INITIAL_SESSION');
    });

    // Listen for auth state changes
    const { data: { subscription } } = authSupabase.auth.onAuthStateChange((event, session) => {
      checkVerificationAndLogin(session, event);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Real-time Postgres status revocation listener
  useEffect(() => {
    if (!userId) return;

    const channel = authSupabase
      .channel(`user-security-check-${userId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'app_users', filter: `id=eq.${userId}` },
        async (payload) => {
          if (payload.new && payload.new.verification_status !== 'verified') {
            alert('Your account verification status has been updated. Logging out.');
            try {
              await authSupabase.auth.signOut();
            } catch (e) {
              console.error('Signout failed:', e);
            }
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId]);

  // Synchronize browser URL with currentRoute state
  useEffect(() => {
    const path = currentRoute === 'dashboard' ? '/' : `/${currentRoute}`;
    if (window.location.pathname !== path) {
      window.history.pushState({ route: currentRoute }, '', path);
    }
  }, [currentRoute]);

  // Handle browser back/forward buttons (popstate event)
  useEffect(() => {
    const handlePopState = (event) => {
      const pathRoute = getPathRoute();
      if (isLoggedIn) {
        const privateRoutes = ['dashboard', 'earnings', 'schedule', 'tracking', 'mechanics', 'booking', 'projects', 'settings', 'profile', 'support'];
        if (privateRoutes.includes(pathRoute)) {
          setCurrentRoute(pathRoute);
        } else {
          setCurrentRoute('dashboard');
        }
      } else {
        if (pathRoute === 'signup') {
          setCurrentRoute('signup');
        } else if (pathRoute === 'email-confirmed') {
          setCurrentRoute('email-confirmed');
        } else {
          setCurrentRoute('signin');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isLoggedIn]);

  // Notification hook — always called (rules of hooks)
  const { notifications, unreadCount, markRead, markAllRead, clearAll } = useNotifications(userId);

  // Auth Operations
  const handleLogin = (email) => {
    // Session state trigger handles user login data fetch
  };

  const handleRegister = (name) => {
    // Registration success will navigate directly to sign-in page
  };

  const handleLogout = async () => {
    try {
      await authSupabase.auth.signOut();
    } catch (e) {
      console.error('Signout failed:', e);
    }
  };

  // Referral / Booking Submits
  const handleCreateReferral = async (newRef) => {
    try {
      const { data: { user } } = await authSupabase.auth.getUser();
      if (!user) throw new Error('User not logged in.');

      const now = new Date();
      const formattedDate = now.toISOString().split('T')[0];
      const formattedTime = now.toTimeString().split(' ')[0];

      const { error } = await authSupabase.from('schedules').insert({
        referrer_id: user.id,
        client_name: newRef.name,
        client_email: newRef.email,
        client_number: newRef.phone || 'N/A',
        schedule_date: formattedDate,
        schedule_time: formattedTime,
        platform: newRef.action,
        status: newRef.status
      });

      if (error) throw error;

      setIsModalOpen(false);
      await fetchSchedulesAndEarnings(user.id);
      alert('Referral entry created successfully!');
    } catch (e) {
      alert(`Error creating referral: ${e.message}`);
    }
  };

  const handleAddBooking = async (bookingData) => {
    try {
      const { data: { user } } = await authSupabase.auth.getUser();
      if (!user) throw new Error('User not logged in.');

      const { preferredDate, preferredTime, timezone } = bookingData;

      // Parse parts from preferredDate ("yyyy-MM-dd") and preferredTime ("HH:mm")
      const dateParts = preferredDate.split('-');
      const timeParts = preferredTime.split(':');

      const year = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10);
      const day = parseInt(dateParts[2], 10);
      const hour = parseInt(timeParts[0], 10);
      const minute = parseInt(timeParts[1], 10);

      // Create timezone-independent milliseconds representation of local time
      const localMs = Date.UTC(year, month - 1, day, hour, minute, 0);

      // Parse offset of selected timezone (in minutes)
      let offsetMinutes = 8 * 60; // default to +08:00 (Manila)
      if (timezone && !timezone.includes('±00:00')) {
        const tzPrefix = timezone.split(' – ')[0]; // e.g. "UTC+08:00"
        const match = tzPrefix.match(/UTC([+-])(\d{2}):(\d{2})/);
        if (match) {
          const sign = match[1] === '-' ? -1 : 1;
          const hours = parseInt(match[2], 10);
          const minutes = parseInt(match[3], 10);
          offsetMinutes = (hours * 60 + minutes) * sign;
        }
      } else if (timezone && timezone.includes('±00:00')) {
        offsetMinutes = 0;
      }

      // Convert local time to UTC: subtract offset
      const utcMs = localMs - (offsetMinutes * 60 * 1000);

      // Convert UTC to Philippines Time (UTC+8): add 8 hours
      const phMs = utcMs + (8 * 60 * 60 * 1000);
      const phDateTime = new Date(phMs);

      // Format date: yyyy-MM-dd
      const formattedDate = phDateTime.getUTCFullYear() + '-' +
        String(phDateTime.getUTCMonth() + 1).padStart(2, '0') + '-' +
        String(phDateTime.getUTCDate()).padStart(2, '0');

      // Format time: HH:mm:ss
      const formattedTime = String(phDateTime.getUTCHours()).padStart(2, '0') + ':' +
        String(phDateTime.getUTCMinutes()).padStart(2, '0') + ':00';

      if (rescheduleData && rescheduleData.id) {
        // Update existing schedule
        const { error } = await authSupabase
          .from('schedules')
          .update({
            schedule_date: formattedDate,
            schedule_time: formattedTime,
            status: 'Pending' // Reset status to Pending on reschedule
          })
          .eq('id', rescheduleData.id);

        if (error) throw error;
        setRescheduleData(null);
      } else {
        // Insert new schedule
        const { error } = await authSupabase.from('schedules').insert({
          referrer_id: user.id,
          client_name: bookingData.clientName,
          client_email: bookingData.clientEmail,
          client_number: bookingData.contactNumber,
          schedule_date: formattedDate,
          schedule_time: formattedTime,
          platform: bookingData.platform,
          meeting_link: bookingData.meetingLink || null,
          timezone: timezone || 'UTC+08:00 – Beijing, Perth, Singapore, Manila',
          status: 'Pending'
        });

        if (error) throw error;
      }

      await fetchSchedulesAndEarnings(user.id);
      setCurrentRoute('schedule');
    } catch (e) {
      alert(`Error booking appointment: ${e.message}`);
    }
  };

  const handleConfirmAppointment = async (apptId) => {
    try {
      const { data: { user } } = await authSupabase.auth.getUser();
      if (!user) throw new Error('User not logged in.');

      const { error } = await authSupabase
        .from('schedules')
        .update({ status: 'Approved' })
        .eq('id', apptId);

      if (error) throw error;

      await fetchSchedulesAndEarnings(user.id);
      alert('Appointment approved successfully!');
    } catch (e) {
      alert(`Error confirming appointment: ${e.message}`);
    }
  };

  const handleCancelAppointment = async (apptId) => {
    try {
      const { data: { user } } = await authSupabase.auth.getUser();
      if (!user) throw new Error('User not logged in.');

      const { error } = await authSupabase
        .from('schedules')
        .delete()
        .eq('id', apptId);

      if (error) throw error;

      await fetchSchedulesAndEarnings(user.id);
      alert('Appointment deleted successfully!');
    } catch (e) {
      alert(`Error deleting appointment: ${e.message}`);
    }
  };

  // Calculate dynamic dashboard stats
  const earningsValue = totalEarningsFromDb;
  const pendingValue = pendingEarningsFromDb;
  const activeReferralsCount = appointments.filter(a => {
    const statusLower = (a.status || '').toLowerCase().trim();
    return !['cancelled', 'closed sale', 'closed', 'sold', 'cleared'].includes(statusLower);
  }).length;
  const conversionRate = appointments.length > 0
    ? Math.round((appointments.filter(a => ['closed sale', 'closed', 'sold', 'reserved', 'converted', 'cleared'].includes((a.status || '').toLowerCase().trim())).length / appointments.length) * 100)
    : 0;


  // Filter activities based on search value in Dashboard
  const filteredActivities = activities.filter((activity) => {
    const query = searchVal.toLowerCase().trim();
    if (!query) return true;
    return (
      activity.name.toLowerCase().includes(query) ||
      activity.action.toLowerCase().includes(query) ||
      activity.status.toLowerCase().includes(query)
    );
  });

  // Filter and sort upcoming appointments (today and onwards, nearest first)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const getApptDateTime = (dateStr, timeStr) => {
    if (!dateStr) return new Date(0);
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes, seconds] = (timeStr || '00:00:00').split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes, seconds || 0);
  };

  const upcomingAppointments = appointments
    .filter(appt => {
      const isUpcoming = getApptDateTime(appt.date, appt.rawTime) >= todayStart;
      const statusLower = (appt.status || '').toLowerCase().trim();
      const isClosed = ['closed sale', 'closed', 'sold', 'reserved', 'converted', 'cleared'].includes(statusLower);
      return isUpcoming && !isClosed;
    })
    .sort((a, b) => getApptDateTime(a.date, a.rawTime) - getApptDateTime(b.date, b.rawTime))
    .map((appt, index) => ({
      ...appt,
      isMain: index === 0
    }));

  // --- Router Render Options ---

  // Show /email-confirmed immediately — never wait for auth or redirect
  if (getPathRoute() === 'email-confirmed' || currentRoute === 'email-confirmed') {
    return <EmailConfirmed onNavigate={setCurrentRoute} />;
  }

  if (authLoading) {
    return (
      <div className="auth-page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div className="profile-loading-spinner" style={{ width: '48px', height: '48px', borderWidth: '4px' }}></div>
          <p style={{ color: 'var(--color-on-surface-variant)', fontWeight: '500' }}>Loading account details...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    if (currentRoute === 'signup') {
      return <SignUp onRegister={handleRegister} onNavigate={setCurrentRoute} />;
    }
    if (currentRoute === 'email-confirmed') {
      return <EmailConfirmed onNavigate={setCurrentRoute} />;
    }
    return <SignIn onLogin={handleLogin} onNavigate={setCurrentRoute} />;
  }

  // Private Portal Render
  return (
    <div className="layout-wrapper">
      {/* Sidebar Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setSidebarOpen(false)}
          style={{ zIndex: 98 }}
        ></div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        activeTab={currentRoute}
        setActiveTab={(tab) => {
          if (tab === 'logout') {
            handleLogout();
          } else {
            setCurrentRoute(tab);
          }
          setSidebarOpen(false);
        }}
        onNewReferralClick={() => {
          setRescheduleData(null);
          setCurrentRoute('booking');
          setSidebarOpen(false);
        }}
      />

      {/* Main Content Canvas Area */}
      <div className="main-canvas">
        {/* Notification Panel (rendered at portal level, above all content) */}
        <NotificationPanel
          isOpen={notifPanelOpen}
          onClose={() => setNotifPanelOpen(false)}
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkRead={markRead}
          onMarkAllRead={markAllRead}
          onClearAll={clearAll}
        />

        {/* Desktop sticky header */}
        <Header
          searchVal={searchVal}
          onSearchChange={setSearchVal}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          unreadCount={unreadCount}
          onNotificationsClick={() => setNotifPanelOpen(prev => !prev)}
          onSettingsClick={() => setCurrentRoute('settings')}
          onProfileClick={() => setCurrentRoute('profile')}
          profilePicUrl={profilePicUrl}
        />
        {/* Mobile sticky top bar */}
        <MobileHeader
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          unreadCount={unreadCount}
          onNotificationsClick={() => setNotifPanelOpen(prev => !prev)}
        />

        <main className="content-container">
          {currentRoute === 'dashboard' && (
            <>
              {/* Welcome Section */}
              <section className="welcome-section animate-fade-in">
                <div>
                  <h2 className="welcome-title">Welcome back, {userName}</h2>
                  <p className="welcome-desc">Here's what's happening with your referrals today.</p>
                </div>
                <div className="date-pill">
                  <span className="material-symbols-outlined">calendar_today</span>
                  <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </section>

              {/* Metrics Section */}
              <section className="metrics-grid animate-fade-in">
                <MetricCard
                  title="Total Earnings"
                  value={`$${earningsValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  trend="+12%"
                  isPositive={true}
                  icon="payments"
                  isHighlighted={true}
                />
                <MetricCard
                  title="Active Referrals"
                  value={activeReferralsCount.toString()}
                  trend="Active"
                  isPositive={false}
                  icon="group"
                />
                <MetricCard
                  title="Conversion Rate"
                  value={`${conversionRate}%`}
                  trend="+2.4%"
                  isPositive={true}
                  icon="ads_click"
                />
              </section>

              {/* Bento Grid */}
              <section className="dashboard-grid animate-fade-in">
                {/* Left Column */}
                <div className="dashboard-left">
                  <RecentActivity
                    activities={filteredActivities}
                    onClearSearch={() => setSearchVal('')}
                  />
                </div>

                {/* Right Column */}
                <div className="dashboard-right">
                  <QuickActions
                    onNewReferralClick={() => {
                      setRescheduleData(null);
                      setCurrentRoute('booking');
                    }}
                  />
                  <UpcomingAppointments
                    appointments={upcomingAppointments.slice(0, 2)}
                    onViewSchedule={() => setCurrentRoute('schedule')}
                  />
                  <RewardsBanner onLearnMore={() => alert('Referral rewards: earn $1,000 commission for every successful referral!')} />
                </div>
              </section>
            </>
          )}

          {currentRoute === 'earnings' && (
            <Earnings
              earningsValue={earningsValue}
              pendingValue={pendingValue}
              transactions={transactions}
            />
          )}

          {currentRoute === 'schedule' && (
            <Schedule
              appointments={appointments}
              onConfirmAppointment={handleConfirmAppointment}
              onCancelAppointment={handleCancelAppointment}
              onNavigate={(route, data) => {
                if (route === 'booking' && data) {
                  setRescheduleData(data);
                } else if (route === 'booking') {
                  setRescheduleData(null);
                }
                setCurrentRoute(route);
              }}
            />
          )}

          {currentRoute === 'tracking' && (
            <Tracking clients={clients} />
          )}

          {currentRoute === 'mechanics' && (
            <Mechanics />
          )}

          {currentRoute === 'booking' && (
            <Booking
              onAddBooking={handleAddBooking}
              onCancel={() => {
                setRescheduleData(null);
                setCurrentRoute('schedule');
              }}
              rescheduleData={rescheduleData}
            />
          )}

          {currentRoute === 'projects' && (
            <Projects />
          )}

          {currentRoute === 'settings' && (
            <Settings userName={userName} userEmail={userEmail} />
          )}

          {currentRoute === 'profile' && (
            <Profile
              userId={userId}
              userName={userName}
              userEmail={userEmail}
              onProfilePicChange={(url) => setProfilePicUrl(url)}
            />
          )}

          {currentRoute === 'support' && (
            <Support
              userName={userName}
              userEmail={userEmail}
            />
          )}

          {/* Spacer for clean bottom lines */}
          <div className="footer-spacing"></div>
        </main>

        {/* Floating Action Button (FAB) for mobile viewports */}
        {isLoggedIn && currentRoute !== 'booking' && (
          <button
            className="mobile-fab"
            onClick={() => {
              setRescheduleData(null);
              setCurrentRoute('booking');
            }}
            aria-label="New Referral"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        )}

        {/* Bottom Nav Bar (Mobile viewports) */}
        <BottomNavBar
          activeTab={currentRoute}
          setActiveTab={(tab) => {
            if (tab === 'logout') {
              handleLogout();
            } else {
              setCurrentRoute(tab);
            }
          }}
          profilePicUrl={profilePicUrl}
        />
      </div>
    </div>
  );
}
