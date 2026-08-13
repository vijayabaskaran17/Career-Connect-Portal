import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const JobDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [coverNote, setCoverNote] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get(`/jobs/${id}`)
      .then((res) => setJob(res.data))
      .catch(console.error);
  }, [id]);

  const handleApply = async () => {
    setMessage('');
    setIsError(false);
    setSubmitting(true);
    try {
      await api.post('/applications', { jobId: id, coverNote });
      setMessage('🎉 Application submitted successfully! Good luck!');
      setCoverNote('');
    } catch (err) {
      setIsError(true);
      setMessage(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (!job) {
    return (
      <div className="center-msg">
        <p>Loading job details...</p>
      </div>
    );
  }

  const companyInitial = job.company ? job.company.charAt(0).toUpperCase() : 'C';

  return (
    <div className="job-detail-container">
      {/* Header Banner */}
      <div className="job-detail-header">
        <div className="job-card-header" style={{ marginBottom: '20px' }}>
          <div className="company-logo-placeholder" style={{ width: '64px', height: '64px', fontSize: '1.6rem' }}>
            {companyInitial}
          </div>
          <div>
            <h2>{job.title}</h2>
            <p className="job-company" style={{ fontSize: '1.05rem' }}>
              🏢 {job.company}
            </p>
          </div>
        </div>

        <div className="job-meta-pills" style={{ marginBottom: '20px' }}>
          <span className="meta-pill">📍 {job.location || 'Remote'}</span>
          <span className="meta-pill">💼 {job.jobType || 'Full-time'}</span>
          <span className="meta-pill" style={{ color: 'var(--accent-emerald)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
            💰 {job.salaryRange || 'Competitive Salary'}
          </span>
          {job.deadline && (
            <span className="meta-pill" style={{ color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
              ⏰ Deadline: {new Date(job.deadline).toLocaleDateString()}
            </span>
          )}
        </div>

        <div>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
            Required Skills
          </h4>
          <div className="skill-tags">
            {job.skillsRequired?.map((skill) => (
              <span key={skill} className="tag">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Description Body */}
      <div className="job-detail-body">
        <h4>Job Overview & Responsibilities</h4>
        <p className="job-desc">{job.description}</p>

        {/* Apply Section */}
        {user?.role === 'student' && (
          <div className="apply-box">
            <h4 style={{ margin: '0 0 12px', color: 'var(--text-main)' }}>Submit Application</h4>
            {message && <div className={isError ? 'error' : 'info-msg'}>{message}</div>}

            <textarea
              placeholder="Introduce yourself or add an optional cover note for the recruiter..."
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
            />
            <button className="btn-primary" onClick={handleApply} disabled={submitting}>
              {submitting ? 'Submitting Application...' : 'Apply for this Role'}
            </button>
          </div>
        )}

        {!user && (
          <div className="info-msg" style={{ marginTop: '24px', textAlign: 'center' }}>
            Looking to apply? <Link to="/login">Sign in as a student</Link> to submit your application.
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetail;
