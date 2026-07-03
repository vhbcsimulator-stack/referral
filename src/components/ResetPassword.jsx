import React, { useState } from 'react';
import { authSupabase } from '../supabaseClient';

export default function ResetPassword({ onNavigate }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const getStrength = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getStrength(password);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#22c55e'][strength];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const { error: updateError } = await authSupabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setSuccess(true);
      // Sign out after reset so they log in fresh
      await authSupabase.auth.signOut();
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-bg-decor">
        <div className="decor-blob-1"></div>
        <div className="decor-blob-2"></div>
      </div>

      <div className="auth-container animate-scale-up">
        <header className="auth-header">
          <img src="/logo.jpeg" alt="VHBC Logo" className="auth-logo" />
          {success ? (
            <>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                backgroundColor: 'var(--color-primary-container)',
                color: 'var(--color-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', boxShadow: '0 4px 20px rgba(103,80,164,0.2)'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '38px' }}>check_circle</span>
              </div>
              <h1 className="auth-title">Password Updated!</h1>
              <p className="auth-subtitle">Your password has been reset successfully.</p>
            </>
          ) : (
            <>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                backgroundColor: 'var(--color-primary-container)',
                color: 'var(--color-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>lock_reset</span>
              </div>
              <h1 className="auth-title">Reset Password</h1>
              <p className="auth-subtitle">Enter your new password below.</p>
            </>
          )}
        </header>

        <div className="auth-divider"></div>

        <section className="auth-body">
          {success ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{
                fontSize: '14px', color: 'var(--color-on-surface-variant)',
                lineHeight: '1.6', marginBottom: '28px'
              }}>
                You can now sign in with your new password.
              </p>
              <button
                type="button"
                className="auth-submit-btn"
                onClick={() => onNavigate('signin')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <span>Go to Sign In</span>
                <span className="material-symbols-outlined">login</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              {error && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '12px 14px', borderRadius: '10px', marginBottom: '16px',
                  backgroundColor: 'rgba(186,26,26,0.1)', color: '#ba1a1a',
                  fontSize: '13px', border: '1px solid rgba(186,26,26,0.2)'
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
                  <span>{error}</span>
                </div>
              )}

              {/* New Password */}
              <div className="form-group">
                <label className="form-label" htmlFor="reset-password">New Password</label>
                <div className="auth-input-wrapper">
                  <span className="material-symbols-outlined auth-input-icon">lock</span>
                  <input
                    id="reset-password"
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input-field"
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="auth-pwd-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>

                {/* Strength meter */}
                {password && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{
                          flex: 1, height: '4px', borderRadius: '2px',
                          backgroundColor: i <= strength ? strengthColor : 'var(--color-outline-variant)',
                          transition: 'background-color 0.3s ease'
                        }} />
                      ))}
                    </div>
                    <span style={{ fontSize: '12px', color: strengthColor, fontWeight: 600 }}>
                      {strengthLabel}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label className="form-label" htmlFor="reset-confirm">Confirm New Password</label>
                <div className="auth-input-wrapper">
                  <span className="material-symbols-outlined auth-input-icon">lock_open</span>
                  <input
                    id="reset-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    className="auth-input-field"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="auth-pwd-toggle"
                    onClick={() => setShowConfirm(!showConfirm)}
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    <span className="material-symbols-outlined">
                      {showConfirm ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p style={{ fontSize: '12px', color: '#ba1a1a', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
                    Passwords do not match
                  </p>
                )}
                {confirmPassword && password === confirmPassword && (
                  <p style={{ fontSize: '12px', color: '#22c55e', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check</span>
                    Passwords match
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={isLoading}
                style={{ marginTop: '8px' }}
              >
                <span>{isLoading ? 'Updating Password...' : 'Update Password'}</span>
                {!isLoading && <span className="material-symbols-outlined">check_circle</span>}
              </button>

              <div className="auth-footer" style={{ marginTop: '20px' }}>
                <p>
                  <a
                    href="#signin"
                    className="auth-footer-link"
                    onClick={(e) => { e.preventDefault(); onNavigate('signin'); }}
                  >
                    ← Back to Sign In
                  </a>
                </p>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
