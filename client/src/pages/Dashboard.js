import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

// Helper to compute readiness score (0-100)
const computeReadinessScore = (user) => {
  if (!user) return 70;
  let score = 30; // base
  if (user.name && user.email) score += 10;
  if (user.phone && user.currentLocation) score += 10;
  if (user.skills && user.skills.length > 0) score += Math.min(20, user.skills.length * 4);
  if (user.resumeUrl) score += 15;
  if (user.degree || user.highestQualification) score += 10;
  if (user.totalExperienceYears > 0) score += 5;
  return Math.min(100, score);
};

// Stage-specific recommendations
const STAGE_RECOMMENDATIONS = {
  'College Student': [
    { icon: '🎓', title: 'Campus Placement Prep', desc: 'Practice 20+ aptitude questions & coding challenges for campus hiring drives.' },
    { icon: '💼', title: 'Summer Internships', desc: 'Apply to top tech internships matching your college degree & key skills.' },
    { icon: '📜', title: 'Resume Building', desc: 'Format your academic projects and coursework into ATS-friendly sections.' },
  ],
  'Fresher': [
    { icon: '🚀', title: 'Entry-Level Roles', desc: 'Explore associate & graduate engineer programs with mentorship.' },
    { icon: '💻', title: 'Coding Challenges', desc: 'Solve daily DSA algorithms to ace recruiter technical assessments.' },
    { icon: '🎯', title: 'Interview Preparation', desc: 'Practice mock technical questions & common behavioral scenarios.' },
  ],
  'Working Professional': [
    { icon: '⚡', title: 'Senior & Lead Roles', desc: 'Target high-paying senior engineer & technical lead openings.' },
    { icon: '📈', title: 'Salary Growth', desc: 'Explore remote & hybrid roles offering +35% salary acceleration.' },
    { icon: '🛠️', title: 'Skill Upgrades', desc: 'Learn Cloud Architecture, System Design & Kubernetes.' },
  ],
  'Experienced Professional': [
    { icon: '👑', title: 'Leadership & Director Roles', desc: 'Executive opportunities leading engineering & tech strategy.' },
    { icon: '🤝', title: 'Consulting & Advisory', desc: 'High-value advisory positions & strategic tech leadership.' },
    { icon: '💰', title: 'Executive Compensation', desc: 'Filter roles by salary expectation ($180k+ / yr).' },
  ],
  'Career Switcher': [
    { icon: '🔄', title: 'Target Career Selection', desc: 'Identify overlap between your past domain expertise & new tech role.' },
    { icon: '📊', title: 'Skill Gap Analysis', desc: 'Audit missing skills needed to bridge into Data Analytics / Engineering.' },
    { icon: '🚀', title: 'Transition Opportunities', desc: 'Apply to entry-level & associate roles open to career switchers.' },
  ],
};

const STAGE_MISSIONS = {
  'College Student': [
    { id: 'm1', title: 'Solve 1 Aptitude Question', xp: 20 },
    { id: 'm2', title: 'Update Resume Link in Profile', xp: 30 },
    { id: 'm3', title: 'Apply to 2 Summer Internships', xp: 50 },
  ],
  'Fresher': [
    { id: 'm1', title: 'Complete Daily Coding Challenge', xp: 30 },
    { id: 'm2', title: 'Practice 1 Behavioral Interview Q', xp: 20 },
    { id: 'm3', title: 'Apply to 3 Entry-Level Jobs', xp: 50 },
  ],
  'Working Professional': [
    { id: 'm1', title: 'Run Skill Gap Audit for Target Role', xp: 25 },
    { id: 'm2', title: 'Review 3 High-Growth Job Openings', xp: 25 },
    { id: 'm3', title: 'Update Expected Salary & Work Pref', xp: 20 },
  ],
  'Career Switcher': [
    { id: 'm1', title: 'Complete Target Skill Learning Module', xp: 30 },
    { id: 'm2', title: 'Check Skill Gap Score for Target Role', xp: 20 },
    { id: 'm3', title: 'Explore 2 Switcher-Friendly Openings', xp: 40 },
  ],
};

const CareerDashboard = () => {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Skill Gap State
  const [targetRole, setTargetRole] = useState(user?.targetJobTitle || 'Full Stack Engineer');

  useEffect(() => {
    Promise.all([api.get('/applications/mine'), api.get('/jobs?limit=6')])
      .then(([appsRes, jobsRes]) => {
        setApplications(appsRes.data || []);
        setJobs(jobsRes.data?.jobs || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const readinessScore = computeReadinessScore(user);
  const stage = user?.careerStage || 'College Student';
  const recommendations = STAGE_RECOMMENDATIONS[stage] || STAGE_RECOMMENDATIONS['College Student'];
  const missions = STAGE_MISSIONS[stage] || STAGE_MISSIONS['College Student'];

  const userSkills = (user?.skills || []).map((s) => s.toLowerCase());

  // Skill Gap Math
  const targetSkillsRequired = ['React', 'Node.js', 'TypeScript', 'MongoDB', 'System Design', 'SQL'];
  const matchedSkills = targetSkillsRequired.filter((sk) =>
    userSkills.some((uSk) => uSk.includes(sk.toLowerCase()) || sk.toLowerCase().includes(uSk))
  );
  const missingSkills = targetSkillsRequired.filter((sk) => !matchedSkills.includes(sk));
  const skillGapPercentage = Math.round((matchedSkills.length / targetSkillsRequired.length) * 100);

  const handleCompleteMission = async () => {
    try {
      const { data } = await api.post('/users/daily-mission/complete', { missionId: 'm1' });
      setUser({ ...user, xp: data.xp, streak: data.streak });
    } catch (err) {
      console.log('Error completing mission:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      {/* Top Banner Greeting */}
      <div className="dashboard-banner glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="banner-bg-hero-overlay" style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '45%', backgroundImage: 'linear-gradient(to right, rgba(15, 23, 42, 1) 0%, rgba(15, 23, 42, 0.3) 100%), url(/ai_hero_workspace.png)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.35, pointerEvents: 'none' }}></div>
        <div className="banner-text" style={{ position: 'relative', zIndex: 2 }}>
          <h2>Welcome back, {user?.name} 👋</h2>
          <p>
            Current Stage: <span className="badge badge-purple">{stage}</span> • Target: <strong>{user?.targetJobTitle || 'Software Engineer'}</strong>
          </p>
        </div>

        <div className="banner-actions-group">
          <Link to="/profile" className="btn-dash-action">
            👤 Profile
          </Link>
          <button onClick={handleLogout} className="btn-logout-banner" title="Log out of your account">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Log Out</span>
          </button>
        </div>

        <div className="readiness-gauge-box">
          <div className="gauge-circle">
            <svg viewBox="0 0 36 36" className="circular-chart">
              <path
                className="circle-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="circle"
                strokeDasharray={`${readinessScore}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.35" className="percentage">
                {readinessScore}
              </text>
            </svg>
          </div>
          <div className="gauge-label">
            <strong>Career Readiness</strong>
            <span>Score: {readinessScore}/100</span>
          </div>
        </div>
      </div>

      {/* Career Readiness Breakdown */}
      <div className="readiness-breakdown-card card glass-card">
        <h4>📊 Career Readiness Breakdown</h4>
        <div className="breakdown-grid">
          <div className="breakdown-item">
            <span>Profile Completion</span>
            <div className="progress-track"><div className="progress-fill" style={{ width: '85%' }}></div></div>
            <span className="breakdown-val">85%</span>
          </div>
          <div className="breakdown-item">
            <span>Verified Skills ({user?.skills?.length || 0})</span>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${Math.min(100, (user?.skills?.length || 0) * 15)}%` }}></div></div>
            <span className="breakdown-val">{Math.min(100, (user?.skills?.length || 0) * 15)}%</span>
          </div>
          <div className="breakdown-item">
            <span>Resume PDF</span>
            <div className="progress-track"><div className="progress-fill" style={{ width: user?.resumeUrl ? '100%' : '20%' }}></div></div>
            <span className="breakdown-val">{user?.resumeUrl ? '100%' : '20%'}</span>
          </div>
          <div className="breakdown-item">
            <span>Practice Performance</span>
            <div className="progress-track"><div className="progress-fill" style={{ width: '75%' }}></div></div>
            <span className="breakdown-val">75%</span>
          </div>
        </div>
      </div>

      {/* Grid Row: Status Card & Daily Mission */}
      <div className="dash-row-grid">
        {/* Your Career Status Card */}
        <div className="card glass-card">
          <div className="card-header">
            <h3>📌 Your Career Status</h3>
            <Link to="/profile" className="btn-text-sm">Edit Profile</Link>
          </div>
          <div className="status-info-list">
            <div className="status-info-item">
              <span className="status-label">Career Stage:</span>
              <strong className="badge badge-purple">{stage}</strong>
            </div>
            <div className="status-info-item">
              <span className="status-label">Total Experience:</span>
              <strong>{user?.totalExperienceYears || 0} Years</strong>
            </div>
            <div className="status-info-item">
              <span className="status-label">Current Role:</span>
              <strong>{user?.currentJobTitle || 'Candidate'}</strong>
            </div>
            <div className="status-info-item">
              <span className="status-label">Target Role:</span>
              <strong style={{ color: 'var(--primary-light)' }}>{user?.targetJobTitle || 'Software Engineer'}</strong>
            </div>
            <div className="status-info-item">
              <span className="status-label">Career Goal:</span>
              <p className="text-muted">{user?.careerGoals || 'Build tech expertise & join top innovation team.'}</p>
            </div>
          </div>
        </div>

        {/* Today's Career Mission */}
        <div className="card glass-card">
          <div className="card-header">
            <h3>🔥 Today's Career Mission</h3>
            <span className="xp-badge">⚡ {user?.xp || 150} XP • {user?.streak?.count || 1} Day Streak</span>
          </div>
          <p className="text-muted" style={{ marginBottom: '16px' }}>Complete activities to earn XP and level up your career profile.</p>

          <div className="mission-list">
            {missions.map((m) => (
              <div key={m.id} className="mission-item">
                <div className="mission-info">
                  <strong>{m.title}</strong>
                  <span className="tag tag-success">+{m.xp} XP</span>
                </div>
                <button className="btn-small-outline" onClick={handleCompleteMission}>
                  Complete ✓
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Personalized Recommendations Section */}
      <div className="section-block">
        <h3>💡 Personalized Recommendations for {stage}</h3>
        <div className="rec-grid">
          {recommendations.map((rec, i) => (
            <div key={i} className="card glass-card rec-card">
              <div className="rec-icon">{rec.icon}</div>
              <h4>{rec.title}</h4>
              <p>{rec.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Skill Gap & Roadmap Section */}
      <div className="dash-row-grid">
        {/* Skill Gap Analyzer */}
        <div className="card glass-card">
          <div className="card-header">
            <h3>📊 Skill Gap Analyzer</h3>
            <span className="badge badge-blue">{skillGapPercentage}% Match</span>
          </div>
          <div className="form-group" style={{ margin: '12px 0' }}>
            <label>Target Role</label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Full Stack Engineer"
            />
          </div>
          <div className="skills-cloud">
            <p><strong>Matched Skills:</strong></p>
            {matchedSkills.map((sk) => (
              <span key={sk} className="tag tag-success">{sk} ✓</span>
            ))}
          </div>
          <div className="skills-cloud" style={{ marginTop: '12px' }}>
            <p><strong>Missing Skills:</strong></p>
            {missingSkills.map((sk) => (
              <span key={sk} className="tag tag-danger">{sk} ⚡</span>
            ))}
          </div>
          <Link to="/growth" className="btn-secondary" style={{ marginTop: '16px', display: 'inline-block' }}>
            Open Full Career Roadmap &rarr;
          </Link>
        </div>

        {/* My Career Roadmap */}
        <div className="card glass-card">
          <h3>🗺️ My Career Roadmap</h3>
          <div className="roadmap-path">
            <div className="roadmap-step current">
              <span className="step-tag">CURRENT</span>
              <strong>{user?.currentJobTitle || stage}</strong>
            </div>
            <div className="roadmap-arrow">↓</div>
            <div className="roadmap-step target">
              <span className="step-tag">TARGET</span>
              <strong>{user?.targetJobTitle || 'Full Stack Software Engineer'}</strong>
            </div>
          </div>
          <div style={{ marginTop: '16px' }}>
            <p className="text-muted">Recommended Next Action: Learn <strong>{missingSkills[0] || 'System Design'}</strong> to complete role transition.</p>
          </div>
        </div>
      </div>

      {/* Matching Jobs Feed */}
      <div className="section-block">
        <div className="card-header" style={{ marginBottom: '16px' }}>
          <h3>🎯 High-Match Jobs for You</h3>
          <Link to="/jobs" className="btn-text-sm">View All Jobs &rarr;</Link>
        </div>

        {loading ? (
          <div className="loading">Loading job matches...</div>
        ) : (
          <div className="jobs-match-grid">
            {jobs.map((job) => (
              <div key={job._id} className="card glass-card job-match-card">
                <div className="job-match-header">
                  <div>
                    <h4>{job.title}</h4>
                    <span className="text-muted">{job.company} • {job.location}</span>
                  </div>
                  <div className="match-pill-badge">{job.matchPercentage || 92}% Match</div>
                </div>

                <div className="skills-cloud" style={{ margin: '12px 0' }}>
                  {(job.skillsRequired || []).slice(0, 4).map((sk) => (
                    <span key={sk} className="tag tag-skill">{sk}</span>
                  ))}
                </div>

                <div className="job-card-footer">
                  <span className="job-salary">{job.salaryRange}</span>
                  <Link to={`/jobs/${job._id}`} className="btn-primary-sm">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const RecruiterDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/jobs/recruiter/mine')
      .then((res) => setJobs(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h2>Recruiter Dashboard</h2>
          <p style={{ color: 'var(--text-muted)' }}>Hiring pipeline overview & candidate application management</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/candidates" className="btn-secondary">
            🔍 Candidate Search
          </Link>
          <Link to="/post-job" className="btn-primary">
            + Post New Job
          </Link>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card glass-card">
          <h3>{jobs.length}</h3>
          <p>Active Job Listings</p>
          <div className="stat-icon-bg">📢</div>
        </div>
        <div className="stat-card glass-card">
          <h3>14</h3>
          <p>Total Applications Received</p>
          <div className="stat-icon-bg">📄</div>
        </div>
        <div className="stat-card glass-card">
          <h3 style={{ color: '#60a5fa' }}>5</h3>
          <p>Shortlisted Candidates</p>
          <div className="stat-icon-bg">⭐</div>
        </div>
        <div className="stat-card glass-card">
          <h3 style={{ color: '#34d399' }}>2</h3>
          <p>Interviews Scheduled</p>
          <div className="stat-icon-bg">📅</div>
        </div>
      </div>

      <div>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', marginBottom: '16px' }}>Manage Posted Jobs</h3>

        {loading ? (
          <div className="center-msg">Loading posted jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="center-msg card glass-card">
            <h3>No jobs posted yet</h3>
            <p>Create your first job listing to start receiving candidate applications.</p>
            <br />
            <Link to="/post-job" className="btn-primary">
              + Post Job Now
            </Link>
          </div>
        ) : (
          <div className="table-container card glass-card">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Experience Level</th>
                  <th>Work Preference</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((j) => (
                  <tr key={j._id}>
                    <td style={{ fontWeight: 600 }}>{j.title}</td>
                    <td>{j.experienceLevel || 'Entry'}</td>
                    <td>{j.workPreference || 'Remote'}</td>
                    <td>
                      <span className={`status status-${j.status === 'open' ? 'open' : 'closed'}`}>{j.status}</span>
                    </td>
                    <td>
                      <Link to={`/applicants/${j._id}`} className="btn-small">
                        View Applicants &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([api.get('/users/stats'), api.get('/users/pending-recruiters'), api.get('/feedback')])
      .then(([statsRes, pendingRes, feedbackRes]) => {
        setStats(statsRes.data);
        setPending(pendingRes.data);
        setFeedbackCount(feedbackRes.data?.length || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const approve = async (id) => {
    try {
      await api.put(`/users/${id}/approve`);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header card glass-card" style={{ position: 'relative', overflow: 'hidden', padding: '24px', borderRadius: '16px', marginBottom: '24px', border: '1px solid var(--border-color)' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '40%', backgroundImage: 'linear-gradient(to right, rgba(15, 23, 42, 1) 0%, rgba(15, 23, 42, 0.2) 100%), url(/ai_hero_workspace.png)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.3, pointerEvents: 'none' }}></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h2>System Admin Dashboard</h2>
          <p style={{ color: 'var(--text-muted)' }}>Platform analytics, user distribution & recruiter verification</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', position: 'relative', zIndex: 2 }}>
          <Link to="/admin-feedback" className="btn-secondary">
            📬 Feedback Inbox ({feedbackCount})
          </Link>
          <Link to="/users-management" className="btn-primary">
            🛡️ Manage Users
          </Link>
        </div>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card glass-card">
            <h3>{stats.totalUsers || 0}</h3>
            <p>Total Registered Users</p>
            <div className="stat-icon-bg">👥</div>
          </div>
          <div className="stat-card glass-card">
            <h3>{stats.studentCount || 0}</h3>
            <p>Candidates / Job Seekers</p>
            <div className="stat-icon-bg">🎓</div>
          </div>
          <div className="stat-card glass-card">
            <h3>{stats.approvedRecruiters || stats.recruiterCount || 0}</h3>
            <p>Verified Recruiters</p>
            <div className="stat-icon-bg">🏢</div>
          </div>
          <div className="stat-card glass-card">
            <h3>{stats.jobCount || 0}</h3>
            <p>Active Job Postings</p>
            <div className="stat-icon-bg">📢</div>
          </div>
          <div className="stat-card glass-card">
            <h3 style={{ color: '#a855f7' }}>{feedbackCount}</h3>
            <p>Feedbacks Received</p>
            <div className="stat-icon-bg">📬</div>
          </div>
          <div className="stat-card glass-card">
            <h3 style={{ color: '#34d399' }}>{stats.selectedCount || 0}</h3>
            <p>Successful Placements</p>
            <div className="stat-icon-bg">🏆</div>
          </div>
        </div>
      )}

      {/* Candidate Stage Distribution */}
      {stats?.stageBreakdown && (
        <div className="card glass-card" style={{ marginBottom: '24px' }}>
          <h3>🌐 Candidate Breakdown by Career Stage</h3>
          <div className="stage-distribution-grid">
            {Object.entries(stats.stageBreakdown).map(([stage, count]) => (
              <div key={stage} className="stage-stat-item">
                <div className="stage-stat-name">{stage}</div>
                <div className="stage-stat-count">{count} Candidates</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', marginBottom: '16px' }}>Pending Recruiter Verification</h3>

        {loading ? (
          <div className="center-msg">Loading pending approvals...</div>
        ) : pending.length === 0 ? (
          <div className="center-msg card glass-card">
            <h3>No pending recruiter approvals</h3>
            <p>All registered recruiter accounts are currently verified.</p>
          </div>
        ) : (
          <div className="table-container card glass-card">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Recruiter Name</th>
                  <th>Company</th>
                  <th>Email</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((r) => (
                  <tr key={r._id}>
                    <td style={{ fontWeight: 600 }}>{r.name}</td>
                    <td>{r.company}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{r.email}</td>
                    <td>
                      <button className="btn-small" style={{ background: '#10b981' }} onClick={() => approve(r._id)}>
                        Approve Recruiter
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === 'student') return <CareerDashboard />;
  if (user.role === 'recruiter') return <RecruiterDashboard />;
  return <AdminDashboard />;
};

export default Dashboard;
