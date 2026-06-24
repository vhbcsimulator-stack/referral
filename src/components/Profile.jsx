import React, { useState, useEffect, useRef, useCallback } from 'react';
import { authSupabase } from '../supabaseClient';

const LOCATION_OPTIONS = ['Philippines', 'Overseas'];

// Generic silhouette SVG used as the default avatar (no initials, no photo)
const DEFAULT_AVATAR_SVG = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23c8d8d0'/><circle cx='50' cy='38' r='18' fill='%23ffffff' opacity='0.85'/><ellipse cx='50' cy='90' rx='28' ry='22' fill='%23ffffff' opacity='0.85'/></svg>`;

function StatusBadge({ status }) {
  const map = {
    verified: { label: 'Verified',  icon: 'verified_user',   color: '#16a34a', bg: '#16a34a18' },
    pending:  { label: 'Pending',   icon: 'pending_actions', color: '#d97706', bg: '#d9770618' },
    rejected: { label: 'Rejected',  icon: 'gpp_bad',         color: '#dc2626', bg: '#dc262618' },
  };
  const cfg = map[status?.toLowerCase()] || { label: status || 'Unknown', icon: 'help', color: '#6b7280', bg: '#6b728018' };
  return (
    <span className="profile-status-badge" style={{ color: cfg.color, backgroundColor: cfg.bg }}>
      <span className="material-symbols-outlined">{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

export default function Profile({ userId, userName, userEmail, onProfilePicChange }) {
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Edit form states
  const [editMode, setEditMode] = useState(false);
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState('');
  const [gps, setGps] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile picture states
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarDeleting, setAvatarDeleting] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const avatarInputRef = useRef(null);
  const avatarMenuRef = useRef(null);

  // Close avatar menu on outside click
  useEffect(() => {
    if (!showAvatarMenu) return;
    const handler = (e) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target)) {
        setShowAvatarMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showAvatarMenu]);

  // Fetch profile from app_users
  useEffect(() => {
    if (!userId) return;
    (async () => {
      setLoadingProfile(true);
      try {
        const { data, error } = await authSupabase
          .from('app_users')
          .select('full_name, mobile_number, location, current_address, latitude, longitude, verification_status, created_at, profile_picture_url')
          .eq('id', userId)
          .maybeSingle();

        if (error) throw error;
        setProfile(data || {});
        if (data) {
          setMobile(data.mobile_number || '');
          setAddress(data.current_address || '');
          setLocation(data.location || '');
          if (data.latitude && data.longitude) setGps(`${data.latitude}, ${data.longitude}`);
          setAvatarUrl(data.profile_picture_url || null);
        }
      } catch (e) {
        console.error('Failed to load profile:', e);
      } finally {
        setLoadingProfile(false);
      }
    })();
  }, [userId]);

  // ── GPS ──
  const handleGetLocation = () => {
    if (!navigator.geolocation) { alert('Geolocation not supported.'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => setGps(`${pos.coords.latitude}, ${pos.coords.longitude}`),
      (err) => alert(`Could not get location: ${err.message}`),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  // ── Save profile info ──
  const handleSaveProfile = async () => {
    if (!userId) return;
    setIsSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      let latitude = profile?.latitude;
      let longitude = profile?.longitude;
      if (gps) {
        const parts = gps.split(',');
        if (parts.length === 2) {
          latitude = parseFloat(parts[0].trim()) || latitude;
          longitude = parseFloat(parts[1].trim()) || longitude;
        }
      }
      const { error } = await authSupabase
        .from('app_users')
        .update({ mobile_number: mobile, current_address: address, location, latitude, longitude })
        .eq('id', userId);
      if (error) throw error;
      setProfile(prev => ({ ...prev, mobile_number: mobile, current_address: address, location, latitude, longitude }));
      setEditMode(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      setSaveError(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setSaveError('');
    setMobile(profile?.mobile_number || '');
    setAddress(profile?.current_address || '');
    setLocation(profile?.location || '');
    if (profile?.latitude && profile?.longitude) setGps(`${profile.latitude}, ${profile.longitude}`);
    else setGps('');
  };

  // ── Profile picture upload ──
  const handleAvatarFileSelected = async (file) => {
    if (!file || !userId) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      setAvatarError('Only JPG, PNG, WebP, or GIF images are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image must be smaller than 5 MB.');
      return;
    }

    setAvatarUploading(true);
    setAvatarError('');
    setShowAvatarMenu(false);

    try {
      const ext = file.name.split('.').pop().toLowerCase();
      const filePath = `avatars/${userId}/avatar.${ext}`;

      const { error: uploadError } = await authSupabase.storage
        .from('profile_pictures')
        .upload(filePath, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      // Add a cache-busting timestamp so the browser re-fetches the new image
      const { data: urlData } = authSupabase.storage
        .from('profile_pictures')
        .getPublicUrl(filePath);

      const newUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      const { error: dbError } = await authSupabase
        .from('app_users')
        .update({ profile_picture_url: newUrl })
        .eq('id', userId);

      if (dbError) throw dbError;

      setAvatarUrl(newUrl);
      setProfile(prev => ({ ...prev, profile_picture_url: newUrl }));
      if (onProfilePicChange) onProfilePicChange(newUrl);
    } catch (e) {
      setAvatarError(`Upload failed: ${e.message}`);
    } finally {
      setAvatarUploading(false);
    }
  };

  // ── Profile picture delete ──
  const handleDeleteAvatar = async () => {
    if (!userId || !avatarUrl) return;
    if (!window.confirm('Remove your profile picture?')) return;
    setAvatarDeleting(true);
    setAvatarError('');
    setShowAvatarMenu(false);
    try {
      // Extract the path segment after the bucket name
      const url = new URL(avatarUrl);
      const pathSegments = url.pathname.split('/profile_pictures/');
      const storagePath = pathSegments[1]?.split('?')[0];

      if (storagePath) {
        const { error: removeError } = await authSupabase.storage
          .from('profile_pictures')
          .remove([storagePath]);
        if (removeError) throw removeError;
      }

      const { error: dbError } = await authSupabase
        .from('app_users')
        .update({ profile_picture_url: null })
        .eq('id', userId);

      if (dbError) throw dbError;

      setAvatarUrl(null);
      setProfile(prev => ({ ...prev, profile_picture_url: null }));
      if (onProfilePicChange) onProfilePicChange(null);
    } catch (e) {
      setAvatarError(`Delete failed: ${e.message}`);
    } finally {
      setAvatarDeleting(false);
    }
  };

  const displayName = profile?.full_name || userName || '—';
  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '—';

  if (loadingProfile) {
    return (
      <div className="profile-loading">
        <div className="profile-loading-spinner" />
        <p>Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="profile-page animate-fade-in">

      {/* ── Hero Card ── */}
      <div className="profile-hero-card">
        <div className="profile-hero-bg" />
        <div className="profile-hero-content">

          {/* Avatar with edit overlay */}
          <div className="profile-avatar-wrap" ref={avatarMenuRef}>
            <div className="profile-avatar-container">
              <img
                src={avatarUrl || DEFAULT_AVATAR_SVG}
                alt="Profile picture"
                className="profile-avatar-img"
                onError={e => { e.target.src = DEFAULT_AVATAR_SVG; }}
              />
              {/* Camera overlay button */}
              <button
                className="profile-avatar-edit-btn"
                onClick={() => setShowAvatarMenu(prev => !prev)}
                aria-label="Change profile picture"
                disabled={avatarUploading || avatarDeleting}
              >
                {avatarUploading || avatarDeleting
                  ? <span className="profile-btn-spinner" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} />
                  : <span className="material-symbols-outlined">photo_camera</span>
                }
              </button>

              {/* Dropdown menu */}
              {showAvatarMenu && (
                <div className="profile-avatar-menu animate-fade-in">
                  <button
                    className="profile-avatar-menu-item"
                    onClick={() => { setShowAvatarMenu(false); avatarInputRef.current?.click(); }}
                  >
                    <span className="material-symbols-outlined">upload</span>
                    {avatarUrl ? 'Change Photo' : 'Upload Photo'}
                  </button>
                  {avatarUrl && (
                    <button
                      className="profile-avatar-menu-item danger"
                      onClick={handleDeleteAvatar}
                    >
                      <span className="material-symbols-outlined">delete</span>
                      Remove Photo
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              ref={avatarInputRef}
              style={{ display: 'none' }}
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={e => e.target.files[0] && handleAvatarFileSelected(e.target.files[0])}
            />
          </div>

          {/* Identity */}
          <div className="profile-hero-info">
            <div className="profile-hero-name-row">
              <h2 className="profile-hero-name">{displayName}</h2>
              <StatusBadge status={profile?.verification_status} />
            </div>
            <p className="profile-hero-email">{userEmail || '—'}</p>
            <p className="profile-hero-joined">
              <span className="material-symbols-outlined">calendar_today</span>
              Member since {joinDate}
            </p>
            {avatarError && (
              <p className="profile-avatar-error">
                <span className="material-symbols-outlined">error</span>
                {avatarError}
              </p>
            )}
          </div>

          {/* Edit button */}
          {!editMode && (
            <button className="profile-edit-btn" onClick={() => setEditMode(true)}>
              <span className="material-symbols-outlined">edit</span>
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Success toast */}
      {saveSuccess && (
        <div className="profile-toast animate-fade-in">
          <span className="material-symbols-outlined">check_circle</span>
          Profile updated successfully!
        </div>
      )}

      <div className="profile-grid">
        {/* ── Left column: Personal Info ── */}
        <div className="profile-main-col">
          <section className="profile-card">
            <div className="profile-card-header">
              <span className="material-symbols-outlined profile-card-icon">person</span>
              <h3 className="profile-card-title">Personal Information</h3>
            </div>

            {!editMode ? (
              <div className="profile-card-body">
                <div className="profile-info-grid">
                  <InfoField icon="badge"       label="Full Name"       value={displayName} />
                  <InfoField icon="mail"        label="Email Address"   value={userEmail || '—'} />
                  <InfoField icon="phone"       label="Mobile Number"   value={profile?.mobile_number || '—'} />
                  <InfoField icon="public"      label="General Location" value={profile?.location || '—'} />
                  <InfoField icon="home"        label="Detailed Address" value={profile?.current_address || '—'} fullWidth />
                  <InfoField
                    icon="location_on"
                    label="GPS Coordinates"
                    value={profile?.latitude && profile?.longitude ? `${profile.latitude}, ${profile.longitude}` : '—'}
                    fullWidth
                  />
                </div>
              </div>
            ) : (
              <div className="profile-card-body">
                {saveError && (
                  <div className="profile-error-banner">
                    <span className="material-symbols-outlined">error</span>
                    {saveError}
                  </div>
                )}
                <div className="profile-edit-grid">
                  {/* Read-only fields */}
                  <div className="profile-field-group">
                    <label className="profile-field-label">Full Name</label>
                    <div className="profile-field-readonly">
                      <span className="material-symbols-outlined profile-field-icon">badge</span>
                      <span>{displayName}</span>
                    </div>
                    <p className="profile-field-note">Name changes require admin approval.</p>
                  </div>
                  <div className="profile-field-group">
                    <label className="profile-field-label">Email Address</label>
                    <div className="profile-field-readonly">
                      <span className="material-symbols-outlined profile-field-icon">mail</span>
                      <span>{userEmail || '—'}</span>
                    </div>
                    <p className="profile-field-note">Email cannot be changed here.</p>
                  </div>

                  {/* Editable: Mobile */}
                  <div className="profile-field-group">
                    <label className="profile-field-label" htmlFor="edit-mobile">Mobile Number</label>
                    <div className="profile-input-wrap">
                      <span className="material-symbols-outlined profile-input-icon">phone</span>
                      <input id="edit-mobile" type="tel" className="profile-input" placeholder="+63 912 345 6789" value={mobile} onChange={e => setMobile(e.target.value)} />
                    </div>
                  </div>

                  {/* Editable: Location */}
                  <div className="profile-field-group">
                    <label className="profile-field-label" htmlFor="edit-location">General Location</label>
                    <div className="profile-input-wrap">
                      <span className="material-symbols-outlined profile-input-icon">public</span>
                      <select id="edit-location" className="profile-input profile-select" value={location} onChange={e => setLocation(e.target.value)}>
                        <option value="" disabled>Select location…</option>
                        {LOCATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Editable: Address */}
                  <div className="profile-field-group profile-field-full">
                    <label className="profile-field-label" htmlFor="edit-address">Detailed Address</label>
                    <div className="profile-input-wrap">
                      <span className="material-symbols-outlined profile-input-icon" style={{ alignSelf: 'flex-start', paddingTop: '10px' }}>home</span>
                      <textarea id="edit-address" className="profile-input profile-textarea" placeholder="Street address, building…" rows={2} value={address} onChange={e => setAddress(e.target.value)} />
                    </div>
                  </div>

                  {/* Editable: GPS */}
                  <div className="profile-field-group profile-field-full">
                    <label className="profile-field-label">GPS Coordinates</label>
                    <div className="profile-gps-row">
                      <div className="profile-input-wrap" style={{ flex: 1 }}>
                        <span className="material-symbols-outlined profile-input-icon">location_on</span>
                        <input type="text" className="profile-input" placeholder="Latitude, Longitude" value={gps} readOnly />
                      </div>
                      <button type="button" className="profile-gps-btn" onClick={handleGetLocation}>
                        <span className="material-symbols-outlined">my_location</span>
                        Get Location
                      </button>
                    </div>
                  </div>
                </div>

                <div className="profile-edit-actions">
                  <button className="profile-save-btn" onClick={handleSaveProfile} disabled={isSaving}>
                    {isSaving ? <><span className="profile-btn-spinner" /> Saving…</> : <><span className="material-symbols-outlined">save</span> Save Changes</>}
                  </button>
                  <button className="profile-cancel-btn" onClick={handleCancelEdit} disabled={isSaving}>Cancel</button>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* ── Right column: Account Status ── */}
        <div className="profile-side-col">
          <section className="profile-card">
            <div className="profile-card-header">
              <span className="material-symbols-outlined profile-card-icon">insights</span>
              <h3 className="profile-card-title">Account Status</h3>
            </div>
            <div className="profile-card-body">
              <div className="profile-stat-list">
                <StatRow
                  icon="verified_user"
                  iconColor={profile?.verification_status === 'verified' ? '#16a34a' : '#d97706'}
                  label="Verification"
                  value={<StatusBadge status={profile?.verification_status} />}
                />
                <StatRow icon="public"  iconColor="#0369a1" label="Location" value={profile?.location || '—'} />
                <StatRow icon="phone"   iconColor="#7c3aed" label="Mobile"   value={profile?.mobile_number || '—'} />
              </div>
            </div>
          </section>

          {/* Profile picture hint card */}
          <section className="profile-card">
            <div className="profile-card-header">
              <span className="material-symbols-outlined profile-card-icon">photo_camera</span>
              <h3 className="profile-card-title">Profile Picture</h3>
            </div>
            <div className="profile-card-body">
              <div className="profile-pic-hint">
                <img src={avatarUrl || DEFAULT_AVATAR_SVG} alt="Your avatar" className="profile-pic-hint-img" onError={e => { e.target.src = DEFAULT_AVATAR_SVG; }} />
                <div className="profile-pic-hint-actions">
                  <button
                    className="profile-pic-change-btn"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={avatarUploading}
                  >
                    <span className="material-symbols-outlined">upload</span>
                    {avatarUrl ? 'Change Photo' : 'Upload Photo'}
                  </button>
                  {avatarUrl && (
                    <button
                      className="profile-pic-delete-btn"
                      onClick={handleDeleteAvatar}
                      disabled={avatarDeleting}
                    >
                      <span className="material-symbols-outlined">delete</span>
                      {avatarDeleting ? 'Removing…' : 'Remove Photo'}
                    </button>
                  )}
                </div>
                <p className="profile-pic-hint-note">JPG, PNG, WebP or GIF · max 5 MB</p>
                {avatarError && <p className="profile-avatar-error"><span className="material-symbols-outlined">error</span>{avatarError}</p>}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──
function InfoField({ icon, label, value, fullWidth }) {
  return (
    <div className={`profile-info-field ${fullWidth ? 'full-width' : ''}`}>
      <span className="profile-info-label">{label}</span>
      <div className="profile-info-value">
        <span className="material-symbols-outlined profile-info-icon">{icon}</span>
        <span>{value}</span>
      </div>
    </div>
  );
}

function StatRow({ icon, iconColor, label, value }) {
  return (
    <div className="profile-stat-row">
      <div className="profile-stat-icon-wrap" style={{ backgroundColor: `${iconColor}18`, color: iconColor }}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div className="profile-stat-text">
        <span className="profile-stat-label">{label}</span>
        <span className="profile-stat-value">{value}</span>
      </div>
    </div>
  );
}
