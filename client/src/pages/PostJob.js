import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const PostJob = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    jobType: 'Full-time',
    salaryRange: '',
    skillsRequired: '',
    deadline: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        skillsRequired: form.skillsRequired.split(',').map((s) => s.trim()).filter(Boolean),
      };
      await api.post('/jobs', payload);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '650px', margin: '30px auto' }}>
      <div className="auth-form-card">
        <h2>Post a New Job Opportunity</h2>
        <p className="auth-subhead">Fill out position requirements to reach top student candidates</p>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Job Title</label>
            <input
              name="title"
              placeholder="e.g. Full Stack Developer Intern"
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Job Description</label>
            <textarea
              name="description"
              placeholder="Describe roles, responsibilities, prerequisites, and perks..."
              onChange={handleChange}
              style={{ minHeight: '120px' }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Location</label>
              <input
                name="location"
                placeholder="e.g. Remote / New York, NY"
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Job Type</label>
              <select name="jobType" onChange={handleChange} value={form.jobType}>
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Internship</option>
                <option>Contract</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Salary Range</label>
              <input
                name="salaryRange"
                placeholder="e.g. $70k - $90k / yr"
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Application Deadline</label>
              <input name="deadline" type="date" onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Required Skills</label>
            <input
              name="skillsRequired"
              placeholder="e.g. React, Node.js, MongoDB, TypeScript (comma separated)"
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Publishing Job Listing...' : 'Publish Job Listing'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostJob;
