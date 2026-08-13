import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Logo from '../components/Logo';

const DEMO_ACCOUNTS = [
  { label: '🎓 Student', email: 'student1@university.edu', pass: 'Password@123', role: 'Student Candidate' },
  { label: '💼 Working Pro', email: 'pro@techcorp.com', pass: 'Password@123', role: 'Senior Pro' },
  { label: '🏢 Recruiter', email: 'recruiter@google.com', pass: 'Password@123', role: 'Google Talent Lead' },
  { label: '👑 Admin', email: 'admin@careerconnect.com', pass: 'Password@123', role: 'Platform Admin' },
];

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot Password Reset Modal State with Password Verification & Visibility Toggles
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetForm, setResetForm] = useState({ email: '', newPassword: '', confirmPassword: '' });
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('expired')) {
      setError('⚡ Your session expired or the database was reset. Please sign in again.');
    }
  }, [location.search]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleDemoSelect = (acc) => {
    setForm({ email: acc.email, password: acc.pass });
    setError('');
    setSuccessMsg(`Selected demo account: ${acc.label}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    if (resetForm.newPassword !== resetForm.confirmPassword) {
      return setResetError('Passwords do not match. Please verify your new password.');
    }
    if (resetForm.newPassword.length < 6) {
      return setResetError('Password must be at least 6 characters.');
    }

    setResetLoading(true);
    try {
      const { data } = await api.post('/auth/reset-password', {
        email: resetForm.email,
        newPassword: resetForm.newPassword,
      });
      setResetSuccess(data.message || 'Password reset successfully! You can now log in.');
      setForm({ email: resetForm.email, password: resetForm.newPassword });
      setTimeout(() => {
        setShowForgotModal(false);
        setSuccessMsg('✅ Password verified & reset complete! Click Sign In below.');
      }, 1500);
    } catch (err) {
      setResetError(err.response?.data?.message || err.message || 'Failed to reset password');
    } finally {
      setResetLoading(false);
    }
  };

  const passwordsMatch =
    resetForm.newPassword &&
    resetForm.confirmPassword &&
    resetForm.newPassword === resetForm.confirmPassword;

  const passwordsMismatch =
    resetForm.newPassword &&
    resetForm.confirmPassword &&
    resetForm.newPassword !== resetForm.confirmPassword;

  return (
    <div className="auth-wrapper">
      {/* Banner */}
      <div className="auth-banner">
        <div className="auth-banner-header">
          <Logo variant="hero" size={56} />
          <h2>Welcome Back to <span className="gradient-text">CareerConnect</span></h2>
          <p>Your intelligent career platform for every stage — from student milestones to executive leadership.</p>
        </div>

        {/* Live Platform Stats */}
        <div className="auth-stats-row">
          <div className="auth-stat-card">
            <span className="stat-val">12.5k+</span>
            <span className="stat-lbl">Active Roles</span>
          </div>
          <div className="auth-stat-card">
            <span className="stat-val">98.4%</span>
            <span className="stat-lbl">Match Accuracy</span>
          </div>
          <div className="auth-stat-card">
            <span className="stat-val">45k+</span>
            <span className="stat-lbl">Candidates</span>
          </div>
        </div>

        {/* Career Stage Pills */}
        <div className="auth-tracks-box">
          <span className="auth-tracks-title">Tailored Roadmaps For:</span>
          <div className="auth-track-pills">
            <span className="track-pill">🎓 Students & Freshers</span>
            <span className="track-pill">💼 Working Professionals</span>
            <span className="track-pill">🔄 Career Switchers</span>
            <span className="track-pill">🚀 Tech & Executive</span>
          </div>
        </div>

        {/* Platform Feature Highlights */}
        <div className="feature-list">
          <div className="feature-item">
            <span className="feature-item-icon">✓</span>
            <div>
              <strong>Stage-Specific Roadmaps</strong>
              <div className="feature-item-desc">Skill gap analysis & customized learning missions</div>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-item-icon">✓</span>
            <div>
              <strong>Multi-Factor Matching Engine</strong>
              <div className="feature-item-desc">Weighted candidate-to-job compatibility scoring</div>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-item-icon">✓</span>
            <div>
              <strong>Real-Time Application Tracker</strong>
              <div className="feature-item-desc">Direct status updates & interview scheduler</div>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-item-icon">✓</span>
            <div>
              <strong>Practice Missions & Streaks</strong>
              <div className="feature-item-desc">Daily coding, interview prep & XP rewards</div>
            </div>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="auth-trust-badge">
          <div className="trust-avatars">
            <span className="trust-avatar av-1">JD</span>
            <span className="trust-avatar av-2">SK</span>
            <span className="trust-avatar av-3">AM</span>
          </div>
          <span>Trusted by 45,000+ students & 850+ recruiters</span>
        </div>
      </div>

      {/* Form Card */}
      <div className="auth-form-card">
        <div>
          <h2>Sign In</h2>
          <p className="auth-subhead">Enter your credentials to access your career dashboard</p>

          {error && <div className="error">{error}</div>}
          {successMsg && <div className="success-banner">{successMsg}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                name="email"
                type="email"
                placeholder="e.g. alex@university.edu"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <div className="label-row">
                <label>Password</label>
                <button
                  type="button"
                  className="forgot-password-link"
                  onClick={() => setShowForgotModal(true)}
                >
                  Forgot Password?
                </button>
              </div>
              <div className="password-input-wrapper">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="auth-options-row">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="checkbox-label">Remember this device</span>
              </label>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '14px' }}>
              {loading ? 'Authenticating...' : 'Sign In →'}
            </button>
          </form>

          {/* Quick Demo Login Accounts Section to fill space seamlessly */}
          <div className="demo-accounts-container">
            <span className="demo-accounts-title">⚡ 1-Click Quick Demo Sign-In</span>
            <div className="demo-accounts-grid">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  className="demo-acc-btn"
                  onClick={() => handleDemoSelect(acc)}
                  title={`Fill credentials for ${acc.role}`}
                >
                  <span className="demo-acc-label">{acc.label}</span>
                  <span className="demo-acc-email">{acc.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Security Badge & Footer */}
        <div>
          <div className="auth-security-note">
            🔒 256-Bit SSL Encrypted & OAuth 2.0 Secure Authentication
          </div>
          <div className="auth-footer">
            Don't have an account? <Link to="/register">Create an Account</Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Reset & Verification Modal */}
      {showForgotModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card">
            <div className="modal-header">
              <h3>🔑 Reset & Verify Password</h3>
              <button
                className="modal-close-btn"
                onClick={() => {
                  setShowForgotModal(false);
                  setResetError('');
                  setResetSuccess('');
                }}
              >
                ✕
              </button>
            </div>

            <p className="modal-subtitle">
              Enter your registered email and new password. Toggle the eye icon to verify your password before resetting.
            </p>

            {resetError && <div className="error">{resetError}</div>}
            {resetSuccess && <div className="success-banner">{resetSuccess}</div>}

            <form onSubmit={handleResetSubmit}>
              <div className="form-group">
                <label>Registered Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. student1@university.edu"
                  value={resetForm.email}
                  onChange={(e) => setResetForm({ ...resetForm, email: e.target.value })}
                  required
                />
              </div>

              {/* New Password with Eye Toggle */}
              <div className="form-group">
                <label>New Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    value={resetForm.newPassword}
                    onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    title={showResetPassword ? 'Hide password' : 'Verify password text'}
                    aria-label={showResetPassword ? 'Hide password' : 'Verify password text'}
                  >
                    {showResetPassword ? (
                      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm New Password with Eye Toggle */}
              <div className="form-group">
                <label>Confirm New Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showResetConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter new password to verify"
                    value={resetForm.confirmPassword}
                    onChange={(e) => setResetForm({ ...resetForm, confirmPassword: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                    title={showResetConfirmPassword ? 'Hide password' : 'Verify password text'}
                    aria-label={showResetConfirmPassword ? 'Hide password' : 'Verify password text'}
                  >
                    {showResetConfirmPassword ? (
                      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>

                {/* Password Verification Live Indicator Badge */}
                {passwordsMatch && (
                  <div className="verify-badge match">
                    ✓ Passwords match! Ready to reset.
                  </div>
                )}
                {passwordsMismatch && (
                  <div className="verify-badge mismatch">
                    ⚠️ Passwords do not match. Please verify.
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowForgotModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={resetLoading || (resetForm.confirmPassword && !passwordsMatch)}
                >
                  {resetLoading ? 'Resetting Password...' : 'Reset & Verify Password →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
