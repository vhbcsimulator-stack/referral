import React, { useState } from 'react';
import { authSupabase } from '../supabaseClient';

export default function SignUp({ onRegister, onNavigate }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [location, setLocation] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [gps, setGps] = useState('');
  const [fileName, setFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setGps(`${latitude}, ${longitude}`);
      },
      (error) => {
        console.error('Error fetching GPS coordinates:', error);
        alert(`Failed to fetch GPS coordinates: ${error.message}. Please make sure location access is enabled.`);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setFileName(file.name);
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      alert('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    if (!selectedFile) {
      alert('Please upload your Verification ID.');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Upload ID card to Storage
      const fileExt = selectedFile.name.split('.').pop();
      const storageFileName = `${Date.now()}.${fileExt}`;
      const filePath = `ids/${storageFileName}`;

      const { error: uploadError } = await authSupabase.storage
        .from('identification_cards')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = authSupabase.storage
        .from('identification_cards')
        .getPublicUrl(filePath);

      const idCardUrl = publicUrlData.publicUrl;

      // Parse GPS coordinates
      let latitude = 14.599512;
      let longitude = 120.984224;
      if (gps) {
        const parts = gps.split(',');
        if (parts.length === 2) {
          latitude = parseFloat(parts[0].trim()) || latitude;
          longitude = parseFloat(parts[1].trim()) || longitude;
        }
      }

      // 2. Register user via Supabase Auth
      const { data, error } = await authSupabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            mobile_number: mobile,
            location: location,
            current_address: address,
            id_card_url: idCardUrl,
            latitude,
            longitude,
          }
        }
      });

      if (error) throw error;

      alert('Registration successful! Your account is pending verification. A confirmation email has been sent to your email address. Please check your inbox and verify your email.');
      onNavigate('signin');
    } catch (err) {
      alert(`Registration error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper" style={{ padding: '40px 16px' }}>
      <div className="auth-bg-decor">
        <div className="decor-blob-1"></div>
        <div className="decor-blob-2"></div>
      </div>

      <div className="auth-container signup-wide animate-scale-up">
        <header className="auth-header" style={{ paddingBottom: '24px' }}>
          <img
            src="/logo.jpeg"
            alt="VHBC Logo"
            className="auth-logo"
          />
          <h1 className="auth-title">Create an Account</h1>
          <p className="auth-subtitle" style={{ maxWidth: '480px' }}>
            Join the VHBC Referral network to start building leisure lifestyle communities and tracking your earnings.
          </p>
        </header>

        <div className="auth-divider"></div>

        <form onSubmit={handleSubmit} className="auth-body">
          <div className="auth-form-grid">
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full Name *</label>
              <input
                id="reg-name"
                type="text"
                className="auth-input-field no-icon"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            {/* Email Address */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email Address *</label>
              <input
                id="reg-email"
                type="email"
                className="auth-input-field no-icon"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Mobile Number */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-mobile">Mobile Number</label>
              <input
                id="reg-mobile"
                type="tel"
                className="auth-input-field no-icon"
                placeholder="+1 (555) 000-0000"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
            </div>

            {/* General Location */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-location">General Location *</label>
              <select
                id="reg-location"
                className="auth-input-field no-icon"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              >
                <option value="" disabled>Select General Location</option>
                <option value="Philippines">Philippines</option>
                <option value="Overseas">Overseas</option>
              </select>
              {location === 'Overseas' && (
                <p style={{ fontSize: '12px', color: 'var(--color-error, #ba1a1a)', marginTop: '6px', fontWeight: '500', fontStyle: 'italic' }}>
                  Note: The ID should prove that you are currently abroad.
                </p>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password *</label>
              <input
                id="reg-password"
                type="password"
                className="auth-input-field no-icon"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-confpassword">Confirm Password *</label>
              <input
                id="reg-confpassword"
                type="password"
                className="auth-input-field no-icon"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {/* Detailed Address */}
            <div className="form-group form-full-width">
              <label className="form-label" htmlFor="reg-address">Detailed Address</label>
              <textarea
                id="reg-address"
                className="auth-input-field textarea-field"
                placeholder="Street address, building, apartment..."
                rows="2"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              ></textarea>
            </div>

            {/* GPS Coordinates */}
            <div className="form-group form-full-width">
              <label className="form-label" htmlFor="reg-gps">GPS Coordinates</label>
              <div className="gps-wrapper">
                <div className="auth-input-wrapper" style={{ flex: 1 }}>
                  <span className="material-symbols-outlined auth-input-icon">location_on</span>
                  <input
                    id="reg-gps"
                    type="text"
                    className="auth-input-field"
                    style={{ backgroundColor: 'var(--color-surface-container-low)' }}
                    placeholder="Latitude, Longitude"
                    value={gps}
                    readOnly
                  />
                </div>
                <button type="button" className="gps-btn" onClick={handleGetLocation}>
                  <span className="material-symbols-outlined">my_location</span>
                  <span>Get Location</span>
                </button>
              </div>
            </div>

            {/* Upload Verification ID */}
            <div className="form-group form-full-width" style={{ marginTop: '8px' }}>
              <label className="form-label">Upload Verification ID</label>
              <div
                className={`dropzone ${dragOver ? 'border-primary' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="reg-upload"
                  className="dropzone-file-input"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                />
                <div className="dropzone-icon">
                  <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>cloud_upload</span>
                </div>
                <p className="dropzone-title">
                  {fileName ? (
                    <span style={{ color: 'var(--color-primary)' }}>Selected: {fileName}</span>
                  ) : (
                    'Click to upload or drag and drop'
                  )}
                </p>
                <p className="dropzone-desc">SVG, PNG, JPG or PDF (max. 5MB)</p>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="auth-signup-actions">
            <button type="submit" className="auth-submit-btn" style={{ width: 'auto', padding: '0 40px' }} disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
            <div>
              <span className="font-body-md" style={{ color: 'var(--color-on-surface-variant)' }}>
                Already have an account?{' '}
              </span>
              <a
                href="#signin"
                className="auth-link"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('signin');
                }}
              >
                Sign in
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
