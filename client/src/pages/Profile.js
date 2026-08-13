import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const CAREER_STAGES = [
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
  'Retired / Looking for Opportunities',
  'Other',
];

const Profile = () => {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('basic');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    dob: user?.dob || '',
    gender: user?.gender || '',
    currentLocation: user?.currentLocation || '',
    preferredLocation: user?.preferredLocation || '',

    // Career Info
    careerStage: user?.careerStage || 'College Student',
    currentJobTitle: user?.currentJobTitle || '',
    targetJobTitle: user?.targetJobTitle || '',
    totalExperienceYears: user?.totalExperienceYears || 0,
    industry: user?.industry || '',
    preferredIndustry: user?.preferredIndustry || '',
    employmentType: user?.employmentType || 'Full-time',
    expectedSalary: user?.expectedSalary || '',
    noticePeriod: user?.noticePeriod || 'Immediate',
    workPreference: user?.workPreference || 'Remote',

    // Education
    highestQualification: user?.highestQualification || "Bachelor's Degree",
    degree: user?.degree || '',
    specialization: user?.specialization || '',
    institution: user?.institution || '',
    graduationYear: user?.graduationYear || '',
    cgpa: user?.cgpa || '',

    // Skills & Goals
    skills: user?.skills?.join(', ') || '',
    targetRoles: user?.targetRoles?.join(', ') || '',
    careerGoals: user?.careerGoals || '',
    resumeUrl: user?.resumeUrl || '',

    // Recruiter
    company: user?.company || '',
    companyIndustry: user?.companyIndustry || '',
    companyLocation: user?.companyLocation || '',
    companySize: user?.companySize || '10-50',
    website: user?.website || '',
    recruiterPosition: user?.recruiterPosition || 'Hiring Manager',
  });

  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    setLoading(true);
    try {
      const payload = {
        ...form,
        skills: form.skills ? form.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
        targetRoles: form.targetRoles ? form.targetRoles.split(',').map((s) => s.trim()).filter(Boolean) : [],
        totalExperienceYears: parseFloat(form.totalExperienceYears) || 0,
      };
      const { data } = await api.put('/users/profile', payload);
      const updated = { ...user, ...data };
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
      setMessage('✅ Profile updated successfully!');
    } catch (err) {
      setIsError(true);
      setMessage(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page-wrapper">
      <div className="card glass-card profile-card">
        <div className="profile-header-pill" style={{ justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="user-avatar" style={{ width: '64px', height: '64px', fontSize: '1.6rem' }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2>{user?.name}</h2>
              <div className="meta-pill-group">
                <span className="role-badge">{user?.role}</span>
                <span className="badge badge-purple">{user?.careerStage || 'College Student'}</span>
                <span className="badge badge-blue">{user?.currentLocation || 'Remote'}</span>
                {user?.role === 'student' && (
                  <span className="badge badge-warning" style={{ fontWeight: 'bold' }}>
                    ⚡ {user?.skillScore || 250} Skill Score
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-logout-banner" style={{ margin: 0 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Log Out</span>
          </button>
        </div>

        {message && <div className={isError ? 'error' : 'info-msg'}>{message}</div>}

        <div className="tab-menu" style={{ marginTop: '20px', marginBottom: '20px' }}>
          <button
            className={`tab-btn ${activeTab === 'basic' ? 'active' : ''}`}
            onClick={() => setActiveTab('basic')}
          >
            👤 Basic Info
          </button>
          <button
            className={`tab-btn ${activeTab === 'career' ? 'active' : ''}`}
            onClick={() => setActiveTab('career')}
          >
            💼 Career Info
          </button>
          <button
            className={`tab-btn ${activeTab === 'education' ? 'active' : ''}`}
            onClick={() => setActiveTab('education')}
          >
            🎓 Education
          </button>
          <button
            className={`tab-btn ${activeTab === 'skills' ? 'active' : ''}`}
            onClick={() => setActiveTab('skills')}
          >
            ⚡ Skills & Goals
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {activeTab === 'basic' && (
            <div className="form-grid-2">
              <div className="form-group">
                <label>Full Name</label>
                <input name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="+1 (555) 019-2834" />
              </div>
              <div className="form-group">
                <label>Date of Birth / Age</label>
                <input name="dob" value={form.dob} onChange={handleChange} placeholder="YYYY-MM-DD or Age (e.g. 24)" />
              </div>
              <div className="form-group">
                <label>Gender (Optional)</label>
                <input name="gender" value={form.gender} onChange={handleChange} placeholder="e.g. Male, Female, Non-binary" />
              </div>
              <div className="form-group">
                <label>Current Location</label>
                <input name="currentLocation" value={form.currentLocation} onChange={handleChange} placeholder="City, Country" />
              </div>
              <div className="form-group">
                <label>Preferred Location</label>
                <input name="preferredLocation" value={form.preferredLocation} onChange={handleChange} placeholder="City or Remote" />
              </div>
            </div>
          )}

          {activeTab === 'career' && (
            <div className="form-grid-2">
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
                <label>Total Experience (Years)</label>
                <input name="totalExperienceYears" type="number" step="0.5" value={form.totalExperienceYears} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Current Job Title</label>
                <input name="currentJobTitle" value={form.currentJobTitle} onChange={handleChange} placeholder="e.g. Student / Software Dev" />
              </div>
              <div className="form-group">
                <label>Target Job Title</label>
                <input name="targetJobTitle" value={form.targetJobTitle} onChange={handleChange} placeholder="e.g. Senior Full Stack Engineer" />
              </div>
              <div className="form-group">
                <label>Work Preference</label>
                <select name="workPreference" value={form.workPreference} onChange={handleChange}>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>
              <div className="form-group">
                <label>Employment Type</label>
                <select name="employmentType" value={form.employmentType} onChange={handleChange}>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Apprenticeship">Apprenticeship</option>
                </select>
              </div>
              <div className="form-group">
                <label>Expected Salary</label>
                <input name="expectedSalary" value={form.expectedSalary} onChange={handleChange} placeholder="e.g. $120,000 / yr or $50/hr" />
              </div>
              <div className="form-group">
                <label>Notice Period</label>
                <select name="noticePeriod" value={form.noticePeriod} onChange={handleChange}>
                  <option value="Immediate">Immediate</option>
                  <option value="15 Days">15 Days</option>
                  <option value="30 Days">30 Days</option>
                  <option value="60 Days">60 Days</option>
                  <option value="90 Days">90 Days</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'education' && (
            <div className="form-grid-2">
              <div className="form-group">
                <label>Highest Qualification</label>
                <input name="highestQualification" value={form.highestQualification} onChange={handleChange} placeholder="e.g. Bachelor's Degree" />
              </div>
              <div className="form-group">
                <label>Degree Name</label>
                <input name="degree" value={form.degree} onChange={handleChange} placeholder="e.g. B.Tech / B.S." />
              </div>
              <div className="form-group">
                <label>Specialization / Major</label>
                <input name="specialization" value={form.specialization} onChange={handleChange} placeholder="e.g. Computer Science" />
              </div>
              <div className="form-group">
                <label>Institution / University</label>
                <input name="institution" value={form.institution} onChange={handleChange} placeholder="e.g. Stanford University" />
              </div>
              <div className="form-group">
                <label>Graduation Year</label>
                <input name="graduationYear" value={form.graduationYear} onChange={handleChange} placeholder="e.g. 2026" />
              </div>
              <div className="form-group">
                <label>CGPA / Percentage</label>
                <input name="cgpa" value={form.cgpa} onChange={handleChange} placeholder="e.g. 3.8/4.0 or 85%" />
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div>
              <div className="form-group">
                <label>Technical & Soft Skills (comma separated)</label>
                <input
                  name="skills"
                  value={form.skills}
                  onChange={handleChange}
                  placeholder="e.g. Python, React, Node.js, SQL, Leadership"
                />
              </div>
              <div className="form-group">
                <label>Target Job Roles (comma separated)</label>
                <input
                  name="targetRoles"
                  value={form.targetRoles}
                  onChange={handleChange}
                  placeholder="e.g. Full Stack Developer, Data Analyst, Solution Architect"
                />
              </div>
              <div className="form-group">
                <label>Career Goals & Vision</label>
                <textarea
                  name="careerGoals"
                  rows="3"
                  value={form.careerGoals}
                  onChange={handleChange}
                  placeholder="Describe your 3-year career growth objective..."
                ></textarea>
              </div>
              <div className="form-group">
                <label>Resume PDF Document URL</label>
                <input
                  name="resumeUrl"
                  value={form.resumeUrl}
                  onChange={handleChange}
                  placeholder="e.g. https://drive.google.com/your-resume-link"
                />
              </div>
            </div>
          )}

          {user?.role === 'recruiter' && (
            <div className="form-grid-2" style={{ marginTop: '16px' }}>
              <div className="form-group">
                <label>Company Name</label>
                <input name="company" value={form.company} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Company Industry</label>
                <input name="companyIndustry" value={form.companyIndustry} onChange={handleChange} placeholder="e.g. Enterprise Software" />
              </div>
              <div className="form-group">
                <label>Recruiter Title / Position</label>
                <input name="recruiterPosition" value={form.recruiterPosition} onChange={handleChange} placeholder="e.g. Talent Manager" />
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '20px' }}>
            {loading ? 'Saving Profile...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
