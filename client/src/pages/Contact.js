import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Contact = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Admin View tab state: 'inbox' (Received Feedbacks) or 'submit' (Submit Message Preview)
  const [adminActiveSubTab, setAdminActiveSubTab] = useState('inbox');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student',
    category: 'General Inquiry',
    subject: '',
    message: '',
    rating: 5,
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Admin Feedback Inbox State
  const [feedbacks, setFeedbacks] = useState([]);
  const [inboxLoading, setInboxLoading] = useState(false);
  const [filterRole, setFilterRole] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedFeedbackModal, setSelectedFeedbackModal] = useState(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        role: user.role === 'admin' ? 'student' : user.role || 'student',
      }));
    }
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchFeedbacks();
    }
  }, [isAdmin]);

  const fetchFeedbacks = async () => {
    setInboxLoading(true);
    try {
      const { data } = await api.get('/feedback');
      setFeedbacks(data || []);
    } catch (err) {
      console.log('Error fetching feedbacks for admin:', err);
    } finally {
      setInboxLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRatingClick = (stars) => {
    setFormData({ ...formData, rating: stars });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const { data } = await api.post('/feedback', formData);
      setSuccessMsg(data.message || 'Feedback submitted successfully! Admin will review it shortly.');
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        role: user?.role === 'admin' ? 'student' : user?.role || 'student',
        category: 'General Inquiry',
        subject: '',
        message: '',
        rating: 5,
      });

      if (isAdmin) {
        fetchFeedbacks();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to send feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Admin Feedback Management Handlers
  const handleUpdateStatus = async (feedbackId, newStatus) => {
    try {
      const { data } = await api.put(`/feedback/${feedbackId}/status`, {
        status: newStatus,
        adminNotes: adminNoteInput || selectedFeedbackModal?.adminNotes || '',
      });
      setFeedbacks(
        feedbacks.map((f) => (f._id === feedbackId ? { ...f, status: data.feedback.status, adminNotes: data.feedback.adminNotes } : f))
      );
      if (selectedFeedbackModal && selectedFeedbackModal._id === feedbackId) {
        setSelectedFeedbackModal({ ...selectedFeedbackModal, status: data.feedback.status, adminNotes: data.feedback.adminNotes });
      }
    } catch (err) {
      console.log('Error updating status:', err);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedFeedbackModal) return;
    try {
      const { data } = await api.put(`/feedback/${selectedFeedbackModal._id}/status`, {
        adminNotes: adminNoteInput,
      });
      setFeedbacks(
        feedbacks.map((f) => (f._id === selectedFeedbackModal._id ? { ...f, adminNotes: data.feedback.adminNotes } : f))
      );
      setSelectedFeedbackModal({ ...selectedFeedbackModal, adminNotes: data.feedback.adminNotes });
      alert('Admin notes saved successfully!');
    } catch (err) {
      console.log('Error saving admin notes:', err);
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm('Are you sure you want to delete this feedback entry?')) return;
    try {
      await api.delete(`/feedback/${feedbackId}`);
      setFeedbacks(feedbacks.filter((f) => f._id !== feedbackId));
      setSelectedFeedbackModal(null);
    } catch (err) {
      console.log('Error deleting feedback:', err);
    }
  };

  const openFeedbackModal = (fb) => {
    setSelectedFeedbackModal(fb);
    setAdminNoteInput(fb.adminNotes || '');
  };

  // Filter feedbacks for Admin Inbox
  const filteredFeedbacks = feedbacks.filter((f) => {
    if (filterRole !== 'All' && f.role !== filterRole) return false;
    if (filterCategory !== 'All' && f.category !== filterCategory) return false;
    if (filterStatus !== 'All' && f.status !== filterStatus) return false;
    return true;
  });

  const totalCount = feedbacks.length;
  const newCount = feedbacks.filter((f) => f.status === 'New').length;
  const resolvedCount = feedbacks.filter((f) => f.status === 'Resolved').length;
  const studentFeedbackCount = feedbacks.filter((f) => f.role === 'student').length;
  const recruiterFeedbackCount = feedbacks.filter((f) => f.role === 'recruiter').length;
  const avgRating = totalCount > 0
    ? (feedbacks.reduce((acc, f) => acc + (f.rating || 5), 0) / totalCount).toFixed(1)
    : '5.0';

  return (
    <div className="contact-page">
      <div className="page-header-banner">
        <div>
          <h1>{isAdmin ? '📬 Admin Feedback Center' : '📬 Contact Us & Platform Feedback'}</h1>
          <p>
            {isAdmin
              ? 'Platform Admin inbox for reviewing and managing feedback, support requests, and bug reports from candidates and recruiters.'
              : 'Whether you are a job candidate or recruiter — we are here to support your career journey. All feedback is delivered directly to the platform Admin.'}
          </p>
        </div>

        {isAdmin ? (
          <div className="tab-pill-group">
            <button
              className={`tab-btn ${adminActiveSubTab === 'inbox' ? 'active' : ''}`}
              onClick={() => setAdminActiveSubTab('inbox')}
            >
              📥 Received Feedbacks ({totalCount}) {newCount > 0 && <span className="notif-badge">{newCount}</span>}
            </button>
            <button
              className={`tab-btn ${adminActiveSubTab === 'submit' ? 'active' : ''}`}
              onClick={() => setAdminActiveSubTab('submit')}
            >
              📝 Submit Form Preview
            </button>
          </div>
        ) : (
          <div className="support-badge-pill" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/ai_support_executive.png" alt="Support Executive" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--primary)' }} />
            <span>💬 Live Admin Support</span>
          </div>
        )}
      </div>

      {/* ADMIN RECEIVED FEEDBACKS INBOX HUB */}
      {isAdmin && adminActiveSubTab === 'inbox' ? (
        <div className="admin-feedback-inbox-section">
          {/* Metrics Banner */}
          <div className="stats-grid" style={{ marginBottom: '20px' }}>
            <div className="card glass-card metric-card">
              <span className="metric-icon">📬</span>
              <div>
                <h3>{totalCount}</h3>
                <p>Total Received Messages</p>
              </div>
            </div>
            <div className="card glass-card metric-card">
              <span className="metric-icon">🎓</span>
              <div>
                <h3 style={{ color: '#60a5fa' }}>{studentFeedbackCount}</h3>
                <p>Candidate Feedbacks</p>
              </div>
            </div>
            <div className="card glass-card metric-card">
              <span className="metric-icon">💼</span>
              <div>
                <h3 style={{ color: '#a855f7' }}>{recruiterFeedbackCount}</h3>
                <p>Recruiter Feedbacks</p>
              </div>
            </div>
            <div className="card glass-card metric-card">
              <span className="metric-icon">⚡</span>
              <div>
                <h3 style={{ color: '#ef4444' }}>{newCount}</h3>
                <p>Pending / New</p>
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

          {/* Filter Bar */}
          <div className="card glass-card filter-card" style={{ marginBottom: '20px' }}>
            <div className="filter-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <div className="filter-item">
                <label>Filter Sender Role</label>
                <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                  <option value="All">All Senders (Candidates & Recruiters)</option>
                  <option value="student">🎓 Student / Candidate</option>
                  <option value="recruiter">💼 Recruiter / Employer</option>
                  <option value="guest">👤 Guest / Visitor</option>
                </select>
              </div>

              <div className="filter-item">
                <label>Filter Topic Category</label>
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
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
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="All">All Statuses</option>
                  <option value="New">⚡ New Pending</option>
                  <option value="In Progress">⏳ In Progress</option>
                  <option value="Resolved">✅ Resolved</option>
                </select>
              </div>
            </div>
          </div>

          {/* Feedbacks List Table */}
          {inboxLoading ? (
            <div className="loading card glass-card">Loading received feedback inbox...</div>
          ) : filteredFeedbacks.length === 0 ? (
            <div className="card glass-card empty-state">
              <h3>No feedback entries match your filter</h3>
              <p>When candidates or recruiters submit messages, Admin receives them here automatically.</p>
            </div>
          ) : (
            <div className="card glass-card table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Sender</th>
                    <th>Role</th>
                    <th>Category & Subject</th>
                    <th>Rating</th>
                    <th>Date Received</th>
                    <th>Status</th>
                    <th>Action</th>
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
                          {f.role === 'recruiter' ? '💼 Recruiter' : f.role === 'student' ? '🎓 Candidate' : '👤 Guest'}
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
                        <button className="btn-text-sm" onClick={() => openFeedbackModal(f)}>
                          Inspect & Respond &rarr;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* USER / RECRUITER SUBMIT FEEDBACK FORM VIEW */
        <div className="contact-layout-grid">
          {/* Info Cards */}
          <div className="contact-info-section">
            <div className="card glass-card info-box-card">
              <div className="info-icon">🎓</div>
              <div>
                <h4>Candidate Support Desk</h4>
                <p>Questions about job applications, resume scores, or skill workouts? Reach out to our team.</p>
              </div>
            </div>

            <div className="card glass-card info-box-card">
              <div className="info-icon">💼</div>
              <div>
                <h4>Recruiter & Hiring Support</h4>
                <p>Need assistance posting jobs, searching candidate databases, or managing applicant pipelines?</p>
              </div>
            </div>

            <div className="card glass-card info-box-card">
              <div className="info-icon">⭐</div>
              <div>
                <h4>Platform Feedback</h4>
                <p>Help us improve CareerConnect! Share your feedback, bug reports, or feature requests with our platform administration.</p>
              </div>
            </div>

            <div className="card glass-card contact-meta-card" style={{ position: 'relative', overflow: 'hidden' }}>
              <div className="ai-executive-hero-badge" style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px', background: 'rgba(14, 165, 233, 0.08)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                <img src="/ai_support_executive.png" alt="Platform Executive" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }} />
                <div>
                  <strong style={{ display: 'block', color: '#fff', fontSize: '0.95rem' }}>Sarah Vance</strong>
                  <span className="text-muted" style={{ fontSize: '0.8rem' }}>Head of Candidate & Recruiter Support</span>
                </div>
              </div>
              <h4>📍 Contact Information</h4>
              <ul className="contact-details-list">
                <li><strong>Email:</strong> support@careerconnect.com</li>
                <li><strong>Recruiter Desk:</strong> hiring@careerconnect.com</li>
                <li><strong>Response Time:</strong> Within 24 Hours</li>
                <li><strong>Hours:</strong> Mon - Fri, 9:00 AM - 6:00 PM EST</li>
              </ul>
            </div>
          </div>

          {/* Feedback Submission Form */}
          <div className="card glass-card contact-form-card">
            <h2>Send Us a Message / Submit Feedback</h2>
            <p className="text-muted" style={{ marginBottom: '20px' }}>
              Your feedback is delivered directly to the platform <strong>Admin</strong> for review.
            </p>

            {successMsg && (
              <div className="alert-success-banner">
                ✅ {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="alert-danger-banner">
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Your Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Alex Rivera"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@company.com"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>I am a *</label>
                  <select name="role" value={formData.role} onChange={handleChange}>
                    <option value="student">🎓 Student / Job Candidate</option>
                    <option value="recruiter">💼 Recruiter / Employer</option>
                    <option value="guest">👤 Guest / General Visitor</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Topic Category *</label>
                  <select name="category" value={formData.category} onChange={handleChange}>
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Feedback">Platform Feedback</option>
                    <option value="Bug Report">Technical Bug Report</option>
                    <option value="Recruiter Support">Recruiter Support</option>
                    <option value="Feature Request">Feature Request</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Subject *</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Brief summary of your message or inquiry..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Platform Satisfaction Rating</label>
                <div className="star-rating-selector">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star-btn ${formData.rating >= star ? 'active' : ''}`}
                      onClick={() => handleRatingClick(star)}
                    >
                      ★
                    </button>
                  ))}
                  <span className="rating-label-text">
                    {formData.rating === 5 ? '5/5 Excellent' : formData.rating === 4 ? '4/5 Good' : formData.rating === 3 ? '3/5 Average' : '2/5 Needs Improvement'}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label>Message / Detailed Feedback *</label>
                <textarea
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your feedback, inquiry details, or suggestions here..."
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Submitting feedback to Admin...' : '🚀 Submit Feedback to Admin'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FEEDBACK INSPECTOR MODAL FOR ADMIN */}
      {selectedFeedbackModal && (
        <div className="modal-backdrop" onClick={() => setSelectedFeedbackModal(null)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h2>📬 Feedback: {selectedFeedbackModal.subject}</h2>
              <button className="close-btn" onClick={() => setSelectedFeedbackModal(null)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="meta-pill-group" style={{ marginBottom: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span className={`badge ${selectedFeedbackModal.role === 'recruiter' ? 'badge-purple' : selectedFeedbackModal.role === 'student' ? 'badge-blue' : 'badge-subtle'}`}>
                  Role: {selectedFeedbackModal.role === 'recruiter' ? 'Recruiter' : selectedFeedbackModal.role === 'student' ? 'Candidate' : 'Guest'}
                </span>
                <span className="badge badge-subtle">Category: {selectedFeedbackModal.category}</span>
                <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>
                  Rating: {'★'.repeat(selectedFeedbackModal.rating || 5)} ({selectedFeedbackModal.rating || 5}/5)
                </span>
              </div>

              <p><strong>Submitted By:</strong> {selectedFeedbackModal.name} ({selectedFeedbackModal.email})</p>
              <p><strong>Date Received:</strong> {new Date(selectedFeedbackModal.createdAt).toLocaleString()}</p>

              <div className="feedback-message-box" style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px', marginTop: '14px', whiteSpace: 'pre-wrap' }}>
                <strong>Message Content:</strong>
                <p style={{ marginTop: '8px', lineHeight: '1.5' }}>{selectedFeedbackModal.message}</p>
              </div>

              <div style={{ marginTop: '20px' }}>
                <label><strong>Update Inquiry Status:</strong></label>
                <div className="status-button-group" style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button
                    className={`btn-sm ${selectedFeedbackModal.status === 'New' ? 'btn-danger' : 'btn-secondary'}`}
                    onClick={() => handleUpdateStatus(selectedFeedbackModal._id, 'New')}
                  >
                    ⚡ Set New
                  </button>
                  <button
                    className={`btn-sm ${selectedFeedbackModal.status === 'In Progress' ? 'btn-warning' : 'btn-secondary'}`}
                    onClick={() => handleUpdateStatus(selectedFeedbackModal._id, 'In Progress')}
                  >
                    ⏳ Set In Progress
                  </button>
                  <button
                    className={`btn-sm ${selectedFeedbackModal.status === 'Resolved' ? 'btn-success' : 'btn-secondary'}`}
                    onClick={() => handleUpdateStatus(selectedFeedbackModal._id, 'Resolved')}
                  >
                    ✅ Set Resolved
                  </button>
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <label><strong>Admin Resolution Notes / Response Action:</strong></label>
                <textarea
                  rows="3"
                  value={adminNoteInput}
                  onChange={(e) => setAdminNoteInput(e.target.value)}
                  placeholder="Record internal resolution steps or reply action notes..."
                  style={{ width: '100%', marginTop: '6px', padding: '10px', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
                ></textarea>
                <button className="btn-small-outline" style={{ marginTop: '8px' }} onClick={handleSaveNotes}>
                  💾 Save Admin Notes
                </button>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
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

export default Contact;

