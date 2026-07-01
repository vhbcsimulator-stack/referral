import React from 'react';

export default function EmailConfirmed({ onNavigate }) {
  return (
    <div className="auth-page-wrapper">
      {/* Background decorations matching the SignIn/SignUp pages */}
      <div className="auth-bg-decor">
        <div className="decor-blob-1"></div>
        <div className="decor-blob-2"></div>
      </div>

      <div className="auth-container animate-scale-up" style={{ textAlign: 'center', padding: '40px 30px' }}>
        <header className="auth-header" style={{ marginBottom: '24px' }}>
          <img
            src="/logo.jpeg"
            alt="VHBC Logo"
            className="auth-logo"
            style={{ marginBottom: '16px' }}
          />
          
          {/* Animated Success Checkmark Ring */}
          <div className="confirmed-icon-circle animate-pulse" style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary-container)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 4px 12px rgba(13, 122, 66, 0.15)'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '38px', fontWeight: 'bold' }}>
              mark_email_read
            </span>
          </div>

          <h1 className="auth-title" style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>
            Welcome to VHBC Referral App
          </h1>
          <p className="auth-subtitle" style={{ color: 'var(--color-primary)', fontWeight: '700', fontSize: '15px', marginBottom: '16px' }}>
            Email is confirmed!
          </p>
        </header>

        <div className="auth-divider" style={{ margin: '16px 0 24px' }}></div>

        <section className="auth-body">
          <p style={{
            fontSize: '14px',
            color: 'var(--color-on-surface-variant)',
            lineHeight: '1.6',
            marginBottom: '32px',
            padding: '0 10px'
          }}>
            Thank you for verifying your email. Your account is currently undergoing admin review. 
            Please wait for <strong>at least an hour</strong> for admin verification to complete before attempting to sign in.
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
        </section>
      </div>
    </div>
  );
}
