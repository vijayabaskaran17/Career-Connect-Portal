import { useState, useEffect } from 'react';
import api from '../api/axios';

const CAREER_STAGES = [
  'All',
  'School Student',
  'College Student',
  'Recent Graduate',
  'Fresher',
  'Entry Level',
  'Working Professional',
  'Experienced Professional',
  'Career Switcher',
  'Returning to Work',
  'Freelancer',
  'Part-Time Job Seeker',
];

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    careerStage: 'All',
    skill: '',
    experience: '',
    location: '',
    workPreference: 'All',
    search: '',
  });

  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [actionStatus, setActionStatus] = useState('');

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.careerStage !== 'All') params.append('careerStage', filters.careerStage);
        if (filters.skill) params.append('skill', filters.skill);
        if (filters.experience) params.append('experience', filters.experience);
        if (filters.location) params.append('location', filters.location);
        if (filters.workPreference !== 'All') params.append('workPreference', filters.workPreference);
        if (filters.search) params.append('search', filters.search);

        const { data } = await api.get(`/users/candidates?${params.toString()}`);
        setCandidates(data || []);
      } catch (err) {
        console.log('Error fetching candidates:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="candidates-page">
      <div className="page-header-banner">
        <div>
          <h1>👥 Multi-Stage Candidate Search & Discovery</h1>
          <p>Find qualified talent across all career stages based on verified skills, experience, and career goals.</p>
        </div>
        <span className="badge badge-purple">{candidates.length} Qualified Candidates</span>
      </div>

      {/* Filter Bar */}
      <div className="card glass-card filter-card">
        <div className="filter-grid">
          <div className="filter-item">
            <label>Search Keyword</label>
            <input
              type="text"
              name="search"
              placeholder="Name, role, or university..."
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-item">
            <label>Career Stage</label>
            <select name="careerStage" value={filters.careerStage} onChange={handleFilterChange}>
              {CAREER_STAGES.map((cs) => (
                <option key={cs} value={cs}>
                  {cs}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>Required Skill</label>
            <input
              type="text"
              name="skill"
              placeholder="e.g. React, Python, SQL"
              value={filters.skill}
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-item">
            <label>Min Experience (Years)</label>
            <input
              type="number"
              name="experience"
              placeholder="e.g. 2"
              value={filters.experience}
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-item">
            <label>Work Preference</label>
            <select name="workPreference" value={filters.workPreference} onChange={handleFilterChange}>
              <option value="All">All Preferences</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
          </div>
        </div>
      </div>

      {actionStatus && <div className="success-banner">{actionStatus}</div>}

      {/* Candidates List */}
      {loading ? (
        <div className="loading">Searching candidate database...</div>
      ) : candidates.length === 0 ? (
        <div className="empty-state card glass-card">
          <h3>No candidates match your current filter criteria</h3>
          <p>Try widening your search terms or experience requirements.</p>
        </div>
      ) : (
        <div className="candidate-grid">
          {candidates.map((candidate) => (
            <div key={candidate._id} className="card glass-card candidate-card">
              <div className="candidate-card-header">
                <div>
                  <h3>{candidate.name}</h3>
                  <span className="candidate-title">{candidate.currentJobTitle || candidate.careerStage}</span>
                </div>
                <div className="match-pill-badge">{candidate.matchScore || 88}% Job Match</div>
              </div>

              <div className="candidate-meta-list">
                <div>⚡ <strong>Skill Score:</strong> <span className="badge badge-warning" style={{ fontWeight: 'bold' }}>{candidate.skillScore || 250} Pts</span></div>
                <div>📌 <strong>Career Stage:</strong> {candidate.careerStage || 'College Student'}</div>
                <div>💼 <strong>Experience:</strong> {candidate.totalExperienceYears || 0} Years</div>
                <div>📍 <strong>Location:</strong> {candidate.currentLocation || 'Remote'} ({candidate.workPreference || 'Remote'})</div>
                <div>🎓 <strong>Education:</strong> {candidate.degree || candidate.highestQualification || 'B.Tech'}</div>
                {candidate.expectedSalary && candidate.expectedSalary !== 'Not disclosed' && (
                  <div>💰 <strong>Expected Salary:</strong> {candidate.expectedSalary}</div>
                )}
              </div>

              <div className="skills-cloud">
                {(candidate.skills || ['React', 'JavaScript']).slice(0, 5).map((sk) => (
                  <span key={sk} className="tag tag-skill">
                    {sk} ✓
                  </span>
                ))}
              </div>

              <div className="candidate-actions">
                <button className="btn-secondary" onClick={() => setSelectedCandidate(candidate)}>
                  View Full Profile
                </button>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setActionStatus(`Candidate ${candidate.name} shortlisted for review!`);
                    setTimeout(() => setActionStatus(''), 4000);
                  }}
                >
                  Shortlist Candidate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Candidate Profile Modal */}
      {selectedCandidate && (
        <div className="modal-backdrop" onClick={() => setSelectedCandidate(null)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedCandidate.name}</h2>
              <button className="close-btn" onClick={() => setSelectedCandidate(null)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="meta-pill-group">
                <span className="badge badge-warning">⚡ {selectedCandidate.skillScore || 250} Skill Score</span>
                <span className="badge badge-purple">{selectedCandidate.careerStage}</span>
                <span className="badge badge-blue">{selectedCandidate.totalExperienceYears || 0} Yrs Exp</span>
                <span className="badge badge-success">{selectedCandidate.workPreference}</span>
              </div>

              <h4>Target Role & Goals</h4>
              <p><strong>Target Role:</strong> {selectedCandidate.targetJobTitle || 'Software Engineer'}</p>
              <p><strong>Career Goals:</strong> {selectedCandidate.careerGoals || 'Seeking growth in software innovation.'}</p>

              <h4 style={{ marginTop: '16px' }}>Education</h4>
              <p>{selectedCandidate.highestQualification} - {selectedCandidate.degree} ({selectedCandidate.institution})</p>

              <h4 style={{ marginTop: '16px' }}>Verified Skills</h4>
              <div className="tag-cloud">
                {(selectedCandidate.skills || []).map((sk) => (
                  <span key={sk} className="tag tag-skill">{sk}</span>
                ))}
              </div>

              {selectedCandidate.resumeUrl && (
                <div style={{ marginTop: '20px' }}>
                  <a href={selectedCandidate.resumeUrl} target="_blank" rel="noreferrer" className="btn-secondary">
                    📄 View Candidate Resume PDF
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Candidates;
