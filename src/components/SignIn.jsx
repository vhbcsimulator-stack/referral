import React, { useState } from 'react';
import { authSupabase } from '../supabaseClient';

export default function SignIn({ onLogin, onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Please fill in all credentials.');
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await authSupabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      if (data.user) {
        // Check if the user is verified in the app_users table
        const { data: userRecord, error: dbError } = await authSupabase
          .from('app_users')
          .select('verification_status')
          .eq('id', data.user.id)
          .maybeSingle();

        if (dbError) throw dbError;

        const isVerified = userRecord?.verification_status === 'verified';

        if (!isVerified) {
          // Sign them out immediately so they can't access the app
          await authSupabase.auth.signOut();
          alert('Your account is pending verification. Please wait for an admin to approve your account.');
          return;
        }

        if (onLogin) onLogin(email);
      }
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('invalid login credentials')) {
        alert("User not found or incorrect password. Please register if you haven't.");
      } else {
        alert(`Login error: ${err.message}`);
      }
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
          <img
            src="/logo.jpeg"
            alt="VHBC Logo"
            className="auth-logo"
          />
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to manage your referrals</p>
        </header>

        <div className="auth-divider"></div>

        <section className="auth-body">
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="auth-email">Email Address</label>
              <div className="auth-input-wrapper">
                <span className="material-symbols-outlined auth-input-icon">mail</span>
                <input
                  id="auth-email"
                  type="email"
                  className="auth-input-field"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                <label className="form-label" htmlFor="auth-password" style={{ margin: 0 }}>Password</label>
                <a className="auth-link" href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password reset link sent.'); }}>
                  Forgot password?
                </a>
              </div>
              <div className="auth-input-wrapper">
                <span className="material-symbols-outlined auth-input-icon">lock</span>
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input-field"
                  placeholder="••••••••"
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
            </div>

            <div className="auth-remember-row">
              <label className="auth-checkbox-label">
                <input type="checkbox" className="auth-checkbox" defaultChecked />
                <span>Remember me</span>
              </label>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
              {!isLoading && <span className="material-symbols-outlined">arrow_forward</span>}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <a
                href="#signup"
                className="auth-footer-link"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('signup');
                }}
              >
                Sign up here
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
