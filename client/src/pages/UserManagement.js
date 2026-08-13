import { useState, useEffect } from 'react';
import api from '../api/axios';

const UserManagement = ({ initialTab = 'users' }) => {
  const [activeTab, setActiveTab] = useState(initialTab); // 'users', 'feedback', or 'applications'
  const [users, setUsers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [applications, setApplications] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Users filter state
  const [filterRole, setFilterRole] = useState('All');
  const [filterStage, setFilterStage] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserModal, setSelectedUserModal] = useState(null);

  // Feedback filter state
  const [feedbackRole, setFeedbackRole] = useState('All');
  const [feedbackCategory, setFeedbackCategory] = useState('All');
  const [feedbackStatus, setFeedbackStatus] = useState('All');
  const [selectedFeedbackModal, setSelectedFeedbackModal] = useState(null);

  // Applications Management filter & modal state
  const [appFilterStatus, setAppFilterStatus] = useState('All');
  const [appSearchTerm, setAppSearchTerm] = useState('');
  const [selectedAppModal, setSelectedAppModal] = useState(null);
  const [showCreateAppModal, setShowCreateAppModal] = useState(false);
  const [newAppForm, setNewAppForm] = useState({
    jobId: '',
    studentId: '',
    coverNote: '',
    status: 'pending',
  });
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchFeedbacks();
    fetchApplications();
    fetchJobs();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users/all-users');
      setUsers(data || []);
    } catch (err) {
      console.log('Error fetching all users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const { data } = await api.get('/feedback');
      setFeedbacks(data || []);
    } catch (err) {
      console.log('Error fetching feedbacks:', err);
    }
  };

  const fetchApplications = async () => {
    try {
      const { data } = await api.get('/applications/all');
      setApplications(data || []);
    } catch (err) {
      console.log('Error fetching applications:', err);
    }
  };

  const fetchJobs = async () => {
    try {
      const { data } = await api.get('/jobs?limit=100');
      setAllJobs(data?.jobs || []);
    } catch (err) {
      console.log('Error fetching jobs:', err);
    }
  };

  const handleToggleActive = async (userId) => {
    try {
      const { data } = await api.put(`/users/${userId}/toggle-active`);
      setUsers(
        users.map((u) => (u._id === userId ? { ...u, isActive: data.isActive } : u))
      );
    } catch (err) {
      console.log('Error toggling user status:', err);
    }
  };

  const handleApproveRecruiter = async (userId) => {
    try {
      await api.put(`/users/${userId}/approve`);
      setUsers(
        users.map((u) => (u._id === userId ? { ...u, isApproved: true } : u))
      );
    } catch (err) {
      console.log('Error approving recruiter:', err);
    }
  };

  const handleUpdateFeedbackStatus = async (feedbackId, newStatus) => {
    try {
      const { data } = await api.put(`/feedback/${feedbackId}/status`, { status: newStatus });
      setFeedbacks(
        feedbacks.map((f) => (f._id === feedbackId ? { ...f, status: data.feedback.status } : f))
      );
      if (selectedFeedbackModal && selectedFeedbackModal._id === feedbackId) {
        setSelectedFeedbackModal({ ...selectedFeedbackModal, status: data.feedback.status });
      }
    } catch (err) {
      console.log('Error updating feedback status:', err);
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    try {
      await api.delete(`/feedback/${feedbackId}`);
      setFeedbacks(feedbacks.filter((f) => f._id !== feedbackId));
      setSelectedFeedbackModal(null);
    } catch (err) {
      console.log('Error deleting feedback:', err);
    }
  };

  // Application Handlers
  const handleUpdateAppStatus = async (appId, newStatus) => {
    try {
      const { data } = await api.put(`/applications/${appId}/status`, { status: newStatus });
      setApplications(
        applications.map((app) => (app._id === appId ? { ...app, status: data.status } : app))
      );
      if (selectedAppModal && selectedAppModal._id === appId) {
        setSelectedAppModal({ ...selectedAppModal, status: data.status });
      }
    } catch (err) {
      console.log('Error updating application status:', err);
    }
  };

  const handleDeleteApplication = async (appId) => {
    if (!window.confirm('Are you sure you want to delete this job application?')) return;
    try {
      await api.delete(`/applications/${appId}`);
      setApplications(applications.filter((app) => app._id !== appId));
      setSelectedAppModal(null);
    } catch (err) {
      console.log('Error deleting application:', err);
    }
  };

  const handleCreateApplicationSubmit = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      const { data } = await api.post('/applications/admin-create', newAppForm);
      setApplications([data, ...applications]);
      setShowCreateAppModal(false);
      setNewAppForm({ jobId: '', studentId: '', coverNote: '', status: 'pending' });
      alert('✅ Job Application successfully created by Admin!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create application.');
    } finally {
      setCreateLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (filterRole !== 'All' && u.role !== filterRole) return false;
    if (filterStage !== 'All' && u.careerStage !== filterStage) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        (u.company && u.company.toLowerCase().includes(term))
      );
    }
    return true;
  });

  const filteredFeedbacks = feedbacks.filter((f) => {
    if (feedbackRole !== 'All' && f.role !== feedbackRole) return false;
    if (feedbackCategory !== 'All' && f.category !== feedbackCategory) return false;
    if (feedbackStatus !== 'All' && f.status !== feedbackStatus) return false;
    return true;
  });

  const filteredApplications = applications.filter((app) => {
    if (appFilterStatus !== 'All' && app.status !== appFilterStatus) return false;
    if (appSearchTerm) {
      const term = appSearchTerm.toLowerCase();
      const studentName = app.student?.name?.toLowerCase() || '';
      const studentEmail = app.student?.email?.toLowerCase() || '';
      const jobTitle = app.job?.title?.toLowerCase() || '';
      const company = app.job?.company?.toLowerCase() || '';
      return (
        studentName.includes(term) ||
        studentEmail.includes(term) ||
        jobTitle.includes(term) ||
        company.includes(term)
      );
    }
    return true;
  });

  // Candidate users list for app creation
  const candidateUsers = users.filter((u) => u.role === 'student');

  // Calculate metrics for feedbacks
  const totalFeedbackCount = feedbacks.length;
  const newFeedbackCount = feedbacks.filter((f) => f.status === 'New').length;
  const avgRating = totalFeedbackCount > 0
    ? (feedbacks.reduce((acc, f) => acc + (f.rating || 5), 0) / totalFeedbackCount).toFixed(1)
    : '5.0';

  // Calculate metrics for applications
  const totalAppCount = applications.length;
  const pendingAppCount = applications.filter((a) => a.status === 'pending').length;
  const shortlistedAppCount = applications.filter((a) => a.status === 'shortlisted' || a.status === 'interview').length;
  const selectedAppCount = applications.filter((a) => a.status === 'selected').length;

  return (
    <div className="user-management-page">
      <div className="page-header-banner">
        <div>
          <h1>🛡️ Admin Operations Dashboard</h1>
          <p>Inspect platform users, verify recruiters, manage job applications, and handle feedback inquiries.</p>
        </div>
        <div className="tab-pill-group">
          <button
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 User Registry ({users.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            📄 Job Applications ({applications.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'feedback' ? 'active' : ''}`}
            onClick={() => setActiveTab('feedback')}
          >
            📬 Feedbacks {newFeedbackCount > 0 && <span className="notif-badge">{newFeedbackCount}</span>}
          </button>
        </div>
      </div>

      {/* USER REGISTRY TAB */}
      {activeTab === 'users' && (
        <>
          {/* Filter Controls */}
          <div className="card glass-card filter-card">
            <div className="filter-grid">
              <div className="filter-item">
                <label>Search User</label>
                <input
                  type="text"
                  placeholder="Search by name, email, company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="filter-item">
                <label>Filter Role</label>
                <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                  <option value="All">All Roles</option>
                  <option value="student">Student / Job Seeker</option>
                  <option value="recruiter">Recruiter</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="filter-item">
                <label>Career Stage</label>
                <select value={filterStage} onChange={(e) => setFilterStage(e.target.value)}>
                  <option value="All">All Career Stages</option>
                  <option value="College Student">College Student</option>
                  <option value="Fresher">Fresher</option>
                  <option value="Working Professional">Working Professional</option>
                  <option value="Experienced Professional">Experienced Professional</option>
                  <option value="Career Switcher">Career Switcher</option>
                  <option value="Freelancer">Freelancer</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          {loading ? (
            <div className="loading">Loading user registry...</div>
          ) : (
            <div className="card glass-card table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role / Stage</th>
                    <th>Skill Score</th>
                    <th>Experience / Degree</th>
                    <th>Location</th>
                    <th>Account Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div className="table-user-cell">
                          <strong>{u.name}</strong>
                          <span className="text-muted">{u.email}</span>
                        </div>
                      </td>
                      <td>
                        <div className="meta-pill-group">
                          <span className={`badge ${u.role === 'admin' ? 'badge-danger' : u.role === 'recruiter' ? 'badge-purple' : 'badge-blue'}`}>
                            {u.role}
                          </span>
                          {u.role === 'student' && <span className="badge badge-subtle">{u.careerStage || 'College Student'}</span>}
                        </div>
                      </td>
                      <td>
                        {u.role === 'student' ? (
                          <span className="badge badge-warning">⚡ {u.skillScore || 250} Pts</span>
                        ) : (
                          <span className="text-muted">N/A</span>
                        )}
                      </td>
                      <td>
                        {u.role === 'student' ? (
                          <div>
                            <div>{u.degree || u.highestQualification || 'B.Tech'}</div>
                            <span className="text-muted">{u.totalExperienceYears || 0} Yrs Exp</span>
                          </div>
                        ) : (
                          <div>{u.company || 'Platform Admin'}</div>
                        )}
                      </td>
                      <td>{u.currentLocation || 'Remote'}</td>
                      <td>
                        <span className={`badge ${u.isActive !== false ? 'badge-success' : 'badge-danger'}`}>
                          {u.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="action-btn-group">
                          <button className="btn-text-sm" onClick={() => setSelectedUserModal(u)}>
                            Details
                          </button>
                          {u.role === 'recruiter' && !u.isApproved && (
                            <button className="btn-success-sm" onClick={() => handleApproveRecruiter(u._id)}>
                              Approve
                            </button>
                          )}
                          {u.role !== 'admin' && (
                            <button
                              className={u.isActive !== false ? 'btn-danger-sm' : 'btn-success-sm'}
                              onClick={() => handleToggleActive(u._id)}
                            >
                              {u.isActive !== false ? 'Deactivate' : 'Activate'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* JOB APPLICATIONS MANAGEMENT TAB FOR ADMIN */}
      {activeTab === 'applications' && (
        <>
          {/* Applications Metrics Grid */}
          <div className="stats-grid" style={{ marginBottom: '20px' }}>
            <div className="card glass-card metric-card">
              <span className="metric-icon">📄</span>
              <div>
                <h3>{totalAppCount}</h3>
                <p>Total Job Applications</p>
              </div>
            </div>
            <div className="card glass-card metric-card">
              <span className="metric-icon">⏳</span>
              <div>
                <h3 style={{ color: '#f59e0b' }}>{pendingAppCount}</h3>
                <p>Pending Review</p>
              </div>
            </div>
            <div className="card glass-card metric-card">
              <span className="metric-icon">⭐</span>
              <div>
                <h3 style={{ color: '#60a5fa' }}>{shortlistedAppCount}</h3>
                <p>Shortlisted / Interviewing</p>
              </div>
            </div>
            <div className="card glass-card metric-card">
              <span className="metric-icon">🏆</span>
              <div>
                <h3 style={{ color: '#10b981' }}>{selectedAppCount}</h3>
                <p>Selected / Offered</p>
              </div>
            </div>
          </div>

          {/* Action Bar & Filter Bar */}
          <div className="card glass-card filter-card" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div className="filter-grid" style={{ flex: 1, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="filter-item">
                  <label>Search Applications</label>
                  <input
                    type="text"
                    placeholder="Search candidate name, email, job title, company..."
                    value={appSearchTerm}
                    onChange={(e) => setAppSearchTerm(e.target.value)}
                  />
                </div>

                <div className="filter-item">
                  <label>Filter Status</label>
                  <select value={appFilterStatus} onChange={(e) => setAppFilterStatus(e.target.value)}>
                    <option value="All">All Application Statuses</option>
                    <option value="pending">⏳ Pending</option>
                    <option value="shortlisted">⭐ Shortlisted</option>
                    <option value="interview">📅 Interview Scheduled</option>
                    <option value="selected">🏆 Selected / Offer Extended</option>
                    <option value="rejected">❌ Rejected</option>
                  </select>
                </div>
              </div>

              <button className="btn-primary" onClick={() => setShowCreateAppModal(true)}>
                + Create New Application
              </button>
            </div>
          </div>

          {/* Applications Table */}
          {filteredApplications.length === 0 ? (
            <div className="card glass-card empty-state">
              <h3>No applications match your filter</h3>
              <p>Applications submitted by candidates or created by Admin will appear here.</p>
            </div>
          ) : (
            <div className="card glass-card table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Target Job & Company</th>
                    <th>Date Applied</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((app) => (
                    <tr key={app._id}>
                      <td>
                        <strong>{app.student?.name || 'Candidate'}</strong>
                        <div className="text-muted" style={{ fontSize: '0.82rem' }}>{app.student?.email}</div>
                        {app.student?.careerStage && (
                          <span className="badge badge-subtle" style={{ marginTop: '4px' }}>{app.student.careerStage}</span>
                        )}
                      </td>
                      <td>
                        <strong>{app.job?.title || 'Job Listing'}</strong>
                        <div className="text-muted" style={{ fontSize: '0.85rem' }}>{app.job?.company} • {app.job?.location}</div>
                        {app.job?.salaryRange && (
                          <span className="text-muted" style={{ fontSize: '0.78rem', color: 'var(--primary-light)' }}>{app.job.salaryRange}</span>
                        )}
                      </td>
                      <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${app.status === 'selected' ? 'badge-success' : app.status === 'shortlisted' || app.status === 'interview' ? 'badge-purple' : app.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                          {app.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-btn-group" style={{ flexWrap: 'wrap' }}>
                          <button className="btn-text-sm" onClick={() => setSelectedAppModal(app)}>
                            Inspect
                          </button>

                          {/* Quick Status Buttons for Admin */}
                          <button
                            className="btn-success-sm"
                            title="Set Shortlisted"
                            onClick={() => handleUpdateAppStatus(app._id, 'shortlisted')}
                          >
                            Shortlist
                          </button>
                          <button
                            className="btn-primary-sm"
                            title="Set Selected"
                            onClick={() => handleUpdateAppStatus(app._id, 'selected')}
                          >
                            Offer
                          </button>
                          <button
                            className="btn-danger-sm"
                            title="Delete Application"
                            onClick={() => handleDeleteApplication(app._id)}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* FEEDBACK & CONTACT MESSAGES TAB */}
      {activeTab === 'feedback' && (
        <>
          {/* Metrics summary banner */}
          <div className="stats-grid" style={{ marginBottom: '20px' }}>
            <div className="card glass-card metric-card">
              <span className="metric-icon">📬</span>
              <div>
                <h3>{totalFeedbackCount}</h3>
                <p>Total Submissions</p>
              </div>
            </div>
            <div className="card glass-card metric-card">
              <span className="metric-icon">⚡</span>
              <div>
                <h3 style={{ color: '#ef4444' }}>{newFeedbackCount}</h3>
                <p>New Pending Feedback</p>
              </div>
            </div>
            <div className="card glass-card metric-card">
              <span className="metric-icon">✅</span>
              <div>
                <h3 style={{ color: '#10b981' }}>{feedbacks.filter((f) => f.status === 'Resolved').length}</h3>
                <p>Resolved Inquiries</p>
              </div>
            </div>
            <div className="card glass-card metric-card">
              <span className="metric-icon">⭐</span>
              <div>
                <h3>{avgRating} / 5.0</h3>
                <p>Avg User Rating</p>
              </div>
            </div>
          </div>

          {/* Feedback Filter Bar */}
          <div className="card glass-card filter-card">
            <div className="filter-grid">
              <div className="filter-item">
                <label>Filter Sender Role</label>
                <select value={feedbackRole} onChange={(e) => setFeedbackRole(e.target.value)}>
                  <option value="All">All Senders (Candidates & Recruiters)</option>
                  <option value="student">🎓 Student / Candidate</option>
                  <option value="recruiter">💼 Recruiter / Employer</option>
                  <option value="guest">👤 Guest / Visitor</option>
                </select>
              </div>

              <div className="filter-item">
                <label>Filter by Category</label>
                <select value={feedbackCategory} onChange={(e) => setFeedbackCategory(e.target.value)}>
                  <option value="All">All Categories</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Feedback">Platform Feedback</option>
                  <option value="Bug Report">Technical Bug Report</option>
                  <option value="Recruiter Support">Recruiter Support</option>
                  <option value="Feature Request">Feature Request</option>
                </select>
              </div>

              <div className="filter-item">
                <label>Filter Status</label>
                <select value={feedbackStatus} onChange={(e) => setFeedbackStatus(e.target.value)}>
                  <option value="All">All Statuses</option>
                  <option value="New">New</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>
          </div>

          {/* Feedback List Table */}
          {filteredFeedbacks.length === 0 ? (
            <div className="card glass-card empty-state">
              <h3>No feedback entries match your filter criteria</h3>
              <p>When candidates or recruiters submit the contact form, messages will populate here.</p>
            </div>
          ) : (
            <div className="card glass-card table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Sender Info</th>
                    <th>Role</th>
                    <th>Category & Subject</th>
                    <th>Rating</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFeedbacks.map((f) => (
                    <tr key={f._id}>
                      <td>
                        <strong>{f.name}</strong>
                        <div className="text-muted" style={{ fontSize: '0.82rem' }}>{f.email}</div>
                      </td>
                      <td>
                        <span className={`badge ${f.role === 'recruiter' ? 'badge-purple' : f.role === 'student' ? 'badge-blue' : 'badge-subtle'}`}>
                          {f.role}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-subtle" style={{ marginRight: '6px' }}>{f.category}</span>
                        <strong>{f.subject}</strong>
                      </td>
                      <td>
                        <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>
                          {'★'.repeat(f.rating || 5)}{'☆'.repeat(5 - (f.rating || 5))} ({f.rating || 5}/5)
                        </span>
                      </td>
                      <td>{new Date(f.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${f.status === 'Resolved' ? 'badge-success' : f.status === 'In Progress' ? 'badge-warning' : 'badge-danger'}`}>
                          {f.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-btn-group">
                          <button className="btn-text-sm" onClick={() => setSelectedFeedbackModal(f)}>
                            View & Respond
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* User Details Modal */}
      {selectedUserModal && (
        <div className="modal-backdrop" onClick={() => setSelectedUserModal(null)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedUserModal.name}</h2>
              <button className="close-btn" onClick={() => setSelectedUserModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p><strong>Email:</strong> {selectedUserModal.email}</p>
              <p><strong>Role:</strong> {selectedUserModal.role}</p>
              <p><strong>Skill Score:</strong> {selectedUserModal.skillScore || 250} Points</p>
              <p><strong>Career Stage:</strong> {selectedUserModal.careerStage || 'N/A'}</p>
              <p><strong>Current Title:</strong> {selectedUserModal.currentJobTitle || 'N/A'}</p>
              <p><strong>Target Title:</strong> {selectedUserModal.targetJobTitle || 'N/A'}</p>
              <p><strong>Skills:</strong> {(selectedUserModal.skills || []).join(', ') || 'None listed'}</p>
              <p><strong>Joined Date:</strong> {new Date(selectedUserModal.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW APPLICATION MODAL FOR ADMIN */}
      {showCreateAppModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateAppModal(false)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>📄 Assign / Create Job Application</h2>
              <button className="close-btn" onClick={() => setShowCreateAppModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateApplicationSubmit} className="modal-body">
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Select Candidate / Student *</label>
                <select
                  value={newAppForm.studentId}
                  onChange={(e) => setNewAppForm({ ...newAppForm, studentId: e.target.value })}
                  required
                >
                  <option value="">-- Choose Candidate --</option>
                  {candidateUsers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.email}) - {c.careerStage || 'Student'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Select Target Job Opening *</label>
                <select
                  value={newAppForm.jobId}
                  onChange={(e) => setNewAppForm({ ...newAppForm, jobId: e.target.value })}
                  required
                >
                  <option value="">-- Choose Job Opening --</option>
                  {allJobs.map((j) => (
                    <option key={j._id} value={j._id}>
                      {j.title} @ {j.company} ({j.location})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Initial Application Status</label>
                <select
                  value={newAppForm.status}
                  onChange={(e) => setNewAppForm({ ...newAppForm, status: e.target.value })}
                >
                  <option value="pending">⏳ Pending</option>
                  <option value="shortlisted">⭐ Shortlisted</option>
                  <option value="interview">📅 Interview Scheduled</option>
                  <option value="selected">🏆 Selected / Offer Extended</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label>Admin Cover Note / Placement Remarks</label>
                <textarea
                  rows="3"
                  value={newAppForm.coverNote}
                  onChange={(e) => setNewAppForm({ ...newAppForm, coverNote: e.target.value })}
                  placeholder="Enter remarks or note for assigning this candidate to the job opening..."
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowCreateAppModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={createLoading}>
                  {createLoading ? 'Submitting Application...' : '🚀 Submit & Assign Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSPECT APPLICATION MODAL FOR ADMIN */}
      {selectedAppModal && (
        <div className="modal-backdrop" onClick={() => setSelectedAppModal(null)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h2>📄 Application Details</h2>
              <button className="close-btn" onClick={() => setSelectedAppModal(null)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="meta-pill-group" style={{ marginBottom: '16px' }}>
                <span className={`badge ${selectedAppModal.status === 'selected' ? 'badge-success' : selectedAppModal.status === 'shortlisted' ? 'badge-purple' : 'badge-warning'}`}>
                  Status: {selectedAppModal.status}
                </span>
                <span className="badge badge-blue">Job: {selectedAppModal.job?.title}</span>
                <span className="badge badge-subtle">Company: {selectedAppModal.job?.company}</span>
              </div>

              <p><strong>Candidate Name:</strong> {selectedAppModal.student?.name}</p>
              <p><strong>Candidate Email:</strong> {selectedAppModal.student?.email}</p>
              <p><strong>Applied Date:</strong> {new Date(selectedAppModal.createdAt).toLocaleString()}</p>
              
              {selectedAppModal.coverNote && (
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', marginTop: '12px' }}>
                  <strong>Cover Note / Remarks:</strong>
                  <p style={{ marginTop: '6px' }}>{selectedAppModal.coverNote}</p>
                </div>
              )}

              <div style={{ marginTop: '20px' }}>
                <label><strong>Update Application Status:</strong></label>
                <div className="status-button-group" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                  <button
                    className={`btn-sm ${selectedAppModal.status === 'pending' ? 'btn-warning' : 'btn-secondary'}`}
                    onClick={() => handleUpdateAppStatus(selectedAppModal._id, 'pending')}
                  >
                    ⏳ Pending
                  </button>
                  <button
                    className={`btn-sm ${selectedAppModal.status === 'shortlisted' ? 'btn-purple' : 'btn-secondary'}`}
                    onClick={() => handleUpdateAppStatus(selectedAppModal._id, 'shortlisted')}
                  >
                    ⭐ Shortlist
                  </button>
                  <button
                    className={`btn-sm ${selectedAppModal.status === 'interview' ? 'btn-blue' : 'btn-secondary'}`}
                    onClick={() => handleUpdateAppStatus(selectedAppModal._id, 'interview')}
                  >
                    📅 Interview
                  </button>
                  <button
                    className={`btn-sm ${selectedAppModal.status === 'selected' ? 'btn-success' : 'btn-secondary'}`}
                    onClick={() => handleUpdateAppStatus(selectedAppModal._id, 'selected')}
                  >
                    🏆 Offer Extended
                  </button>
                  <button
                    className={`btn-sm ${selectedAppModal.status === 'rejected' ? 'btn-danger' : 'btn-secondary'}`}
                    onClick={() => handleUpdateAppStatus(selectedAppModal._id, 'rejected')}
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                <button
                  className="btn-danger-sm"
                  onClick={() => handleDeleteApplication(selectedAppModal._id)}
                >
                  🗑️ Delete Application Record
                </button>
                <button className="btn-secondary" onClick={() => setSelectedAppModal(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FEEDBACK INSPECTOR MODAL FOR ADMIN */}
      {selectedFeedbackModal && (
        <div className="modal-backdrop" onClick={() => setSelectedFeedbackModal(null)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📬 Feedback: {selectedFeedbackModal.subject}</h2>
              <button className="close-btn" onClick={() => setSelectedFeedbackModal(null)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="meta-pill-group" style={{ marginBottom: '16px' }}>
                <span className="badge badge-purple">Role: {selectedFeedbackModal.role}</span>
                <span className="badge badge-blue">Category: {selectedFeedbackModal.category}</span>
                <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>Rating: {'★'.repeat(selectedFeedbackModal.rating || 5)} ({selectedFeedbackModal.rating || 5}/5)</span>
              </div>

              <p><strong>Submitted By:</strong> {selectedFeedbackModal.name} ({selectedFeedbackModal.email})</p>
              <p><strong>Date:</strong> {new Date(selectedFeedbackModal.createdAt).toLocaleString()}</p>

              <div className="feedback-message-box" style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px', marginTop: '14px', whiteSpace: 'pre-wrap' }}>
                <strong>Message:</strong>
                <p style={{ marginTop: '8px', lineHeight: '1.5' }}>{selectedFeedbackModal.message}</p>
              </div>

              <div style={{ marginTop: '20px' }}>
                <label><strong>Update Status:</strong></label>
                <div className="status-button-group" style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button
                    className={`btn-sm ${selectedFeedbackModal.status === 'New' ? 'btn-danger' : 'btn-secondary'}`}
                    onClick={() => handleUpdateFeedbackStatus(selectedFeedbackModal._id, 'New')}
                  >
                    Set New
                  </button>
                  <button
                    className={`btn-sm ${selectedFeedbackModal.status === 'In Progress' ? 'btn-warning' : 'btn-secondary'}`}
                    onClick={() => handleUpdateFeedbackStatus(selectedFeedbackModal._id, 'In Progress')}
                  >
                    Set In Progress
                  </button>
                  <button
                    className={`btn-sm ${selectedFeedbackModal.status === 'Resolved' ? 'btn-success' : 'btn-secondary'}`}
                    onClick={() => handleUpdateFeedbackStatus(selectedFeedbackModal._id, 'Resolved')}
                  >
                    Set Resolved ✅
                  </button>
                </div>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  className="btn-danger-sm"
                  onClick={() => handleDeleteFeedback(selectedFeedbackModal._id)}
                >
                  🗑️ Delete Feedback Entry
                </button>
                <button className="btn-secondary" onClick={() => setSelectedFeedbackModal(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
