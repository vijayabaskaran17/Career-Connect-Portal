import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

const CAREER_STAGES = [
  'College Student',
  'School Student',
  'Recent Graduate',
  'Fresher',
  'Entry Level',
  'Working Professional',
  'Experienced Professional',
  'Career Switcher',
  'Returning to Work',
  'Freelancer',
  'Part-Time Job Seeker',
  'Retired / Looking for Opportunities',
  'Other',
];

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    careerStage: 'College Student',
    currentJobTitle: '',
    targetJobTitle: '',
    company: '',
    skills: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRoleSelect = (role) => {
    setForm({ ...form, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        skills: form.skills ? form.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
      };
      await register(payload);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* Banner */}
      <div className="auth-banner">
        <div className="auth-banner-header">
          <Logo variant="hero" size={56} />
          <h2>Join <span className="gradient-text">CareerConnect</span> Today</h2>
          <p>An intelligent career platform tailored for every career stage — from students to experienced leaders.</p>
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
        <h2>Create Account</h2>
        <p className="auth-subhead">Choose your role & career stage to get started</p>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Role</label>
            <div className="role-selector">
              <div
                className={`role-option ${form.role === 'student' ? 'active' : ''}`}
                onClick={() => handleRoleSelect('student')}
              >
                <span className="role-option-title">🎓 Job Seeker</span>
                <span className="role-option-desc">Students, professionals & career switchers</span>
              </div>
              <div
                className={`role-option ${form.role === 'recruiter' ? 'active' : ''}`}
                onClick={() => handleRoleSelect('recruiter')}
              >
                <span className="role-option-title">🏢 Recruiter</span>
                <span className="role-option-desc">Post jobs & hire top talent</span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Full Name</label>
            <input
              name="name"
              placeholder="e.g. Sarah Jenkins"
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              name="email"
              type="email"
              placeholder="e.g. sarah@domain.com"
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="password-input-wrapper">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
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

          {form.role === 'student' && (
            <>
              <div className="form-group">
                <label>Career Stage</label>
                <select name="careerStage" value={form.careerStage} onChange={handleChange}>
                  {CAREER_STAGES.map((cs) => (
                    <option key={cs} value={cs}>
                      {cs}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Target Job Title</label>
                <input
                  name="targetJobTitle"
                  placeholder="e.g. Senior Software Engineer / Data Scientist"
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Key Skills</label>
                <input
                  name="skills"
                  placeholder="e.g. React, Node.js, Python, SQL (comma separated)"
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          {form.role === 'recruiter' && (
            <div className="form-group">
              <label>Company Name</label>
              <input
                name="company"
                placeholder="e.g. Acme Tech Corp"
                onChange={handleChange}
                required
              />
            </div>
          )}

          {/* Temporary Account Expiration Settings */}
          <div className="form-group" style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)', marginTop: '14px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '6px' }}>
              <input
                type="checkbox"
                name="isTemporary"
                checked={form.isTemporary || false}
                onChange={(e) => setForm({ ...form, isTemporary: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
              />
              <strong>⏱️ Temporary Registration (Auto-Delete from DB)</strong>
            </label>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: form.isTemporary ? '10px' : '0' }}>
              When enabled, MongoDB will store this account temporarily and automatically delete/purge it from the database after expiration.
            </p>

            {form.isTemporary && (
              <div style={{ marginTop: '8px' }}>
                <label style={{ fontSize: '0.85rem' }}>Auto-Delete Expiration Duration:</label>
                <select
                  name="tempDurationHours"
                  value={form.tempDurationHours || '24'}
                  onChange={handleChange}
                  style={{ marginTop: '4px' }}
                >
                  <option value="1">⚡ 1 Hour (Testing & Quick Evaluation)</option>
                  <option value="12">⏳ 12 Hours</option>
                  <option value="24">📅 24 Hours (1 Day - Default)</option>
                  <option value="72">📅 72 Hours (3 Days)</option>
                  <option value="168">📅 168 Hours (7 Days)</option>
                </select>
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '16px' }}>
            {loading ? 'Creating Account...' : 'Register Now →'}
          </button>
        </form>

        <div className="auth-footer">
          Already registered? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
