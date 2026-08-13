import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const ROLE_SKILL_DATABASE = {
  'Data Scientist': ['Python', 'SQL', 'Statistics', 'Machine Learning', 'Deep Learning', 'Tableau'],
  'Full Stack Engineer': ['React', 'Node.js', 'TypeScript', 'MongoDB', 'System Design', 'Git'],
  'Senior Software Engineer': ['React', 'TypeScript', 'Node.js', 'AWS', 'Docker', 'System Design', 'Kubernetes'],
  'Data Analyst': ['Python', 'SQL', 'Excel', 'Tableau', 'Power BI', 'Statistics'],
  'Cloud Systems Architect': ['Kubernetes', 'AWS', 'Docker', 'System Architecture', 'Python', 'Go'],
  'Product Manager': ['Agile Leadership', 'Product Strategy', 'Data Analytics', 'User Research', 'SQL'],
};

const STAGE_ROADMAPS = {
  'College Student': [
    { step: '1. Foundation', desc: 'Master Data Structures, Algorithms & Core Programming (Python/Java/JS)' },
    { step: '2. Projects & Portfolio', desc: 'Build 3 Full-Stack or Analytics projects and host on GitHub' },
    { step: '3. Resume & Certifications', desc: 'Craft ATS-ready resume and earn cloud/developer certifications' },
    { step: '4. Internships & Placements', desc: 'Apply to campus placements, internships & hackathons' }
  ],
  'Fresher': [
    { step: '1. Skill Polish', desc: 'Hone production-ready skills and framework best practices' },
    { step: '2. Mock Interviews', desc: 'Practice 20+ aptitude questions & coding challenges weekly' },
    { step: '3. Entry Level Target', desc: 'Apply to entry-level associate software engineer roles' }
  ],
  'Working Professional': [
    { step: '1. System Design & Cloud', desc: 'Deep dive into microservices, scalability, Docker & Kubernetes' },
    { step: '2. Leadership & Mentorship', desc: 'Mentor junior devs and lead technical project deliveries' },
    { step: '3. Senior Role Target', desc: 'Target Senior Engineer / Tech Lead positions with high compensation' }
  ],
  'Career Switcher': [
    { step: '1. Transferable Audit', desc: 'Identify overlap between previous domain experience & target role' },
    { step: '2. Intensive Bootcamp / Courses', desc: 'Upskill in missing core technical requirements (SQL, Python, React)' },
    { step: '3. Transition Projects', desc: 'Build domain-bridging portfolio projects demonstrating immediate ROI' }
  ],
};

const CareerGrowth = () => {
  const { user } = useAuth();
  const [selectedTargetRole, setSelectedTargetRole] = useState(user?.targetJobTitle || 'Data Scientist');

  const userSkills = (user?.skills || []).map((s) => s.toLowerCase());
  const requiredSkills = ROLE_SKILL_DATABASE[selectedTargetRole] || ['Python', 'SQL', 'React', 'Node.js'];

  const matched = [];
  const missing = [];

  requiredSkills.forEach((sk) => {
    if (userSkills.some((uSk) => uSk.includes(sk.toLowerCase()) || sk.toLowerCase().includes(uSk))) {
      matched.push(sk);
    } else {
      missing.push(sk);
    }
  });

  const matchRatio = requiredSkills.length > 0 ? Math.round((matched.length / requiredSkills.length) * 100) : 70;

  const currentStageSteps = STAGE_ROADMAPS[user?.careerStage] || STAGE_ROADMAPS['College Student'];

  return (
    <div className="career-growth-page">
      <div className="page-header-banner">
        <div>
          <h1>🚀 Career Growth Hub</h1>
          <p>Personalized career roadmaps, skill gap analysis, and transition guides for {user?.careerStage || 'Job Seekers'}.</p>
        </div>
        <Link to="/practice" className="btn-primary">
          Start Skill Practice →
        </Link>
      </div>

      <div className="growth-grid">
        {/* Skill Gap Analyzer Widget */}
        <div className="card glass-card">
          <div className="card-header">
            <h3>📊 Skill Gap Analyzer</h3>
            <span className="badge badge-purple">{matchRatio}% Match</span>
          </div>

          <div className="form-group" style={{ marginTop: '12px' }}>
            <label>Select Target Role</label>
            <select
              value={selectedTargetRole}
              onChange={(e) => setSelectedTargetRole(e.target.value)}
              className="select-input"
            >
              {Object.keys(ROLE_SKILL_DATABASE).map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div className="match-bar-container" style={{ margin: '16px 0' }}>
            <div className="match-bar-label">
              <span>Overall Skill Match Score</span>
              <span><strong>{matchRatio}%</strong></span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${matchRatio}%` }}></div>
            </div>
          </div>

          <div className="skills-breakdown-grid">
            <div className="skill-box strong-box">
              <h4>✅ Strong Matched Skills ({matched.length})</h4>
              <div className="tag-cloud">
                {matched.length === 0 ? <p className="text-muted">No matching skills yet.</p> : matched.map((sk) => <span key={sk} className="tag tag-success">{sk} ✓</span>)}
              </div>
            </div>

            <div className="skill-box missing-box">
              <h4>❌ Skill Gaps / Recommended to Learn ({missing.length})</h4>
              <div className="tag-cloud">
                {missing.length === 0 ? <p className="text-muted">Great job! You have all core skills for this role.</p> : missing.map((sk) => <span key={sk} className="tag tag-danger">{sk} ⚡</span>)}
              </div>
            </div>
          </div>

          {missing.length > 0 && (
            <div className="recommendation-callout" style={{ marginTop: '20px' }}>
              🎯 <strong>Next Learning Step:</strong> Focus on mastering <strong>{missing[0]}</strong> to boost your role match to {Math.min(99, matchRatio + 20)}%!
            </div>
          )}
        </div>

        {/* Personalized Stage Roadmap */}
        <div className="card glass-card">
          <div className="card-header">
            <h3>🗺️ Stage Roadmap: {user?.careerStage || 'Job Seeker'}</h3>
            <span className="badge badge-blue">Stage 2 of 4</span>
          </div>
          <p className="text-muted" style={{ marginBottom: '16px' }}>
            Actionable milestones tailored to step from <strong>{user?.currentJobTitle || user?.careerStage || 'Current Role'}</strong> to <strong>{selectedTargetRole}</strong>.
          </p>

          <div className="roadmap-timeline">
            {currentStageSteps.map((st, i) => (
              <div key={i} className="timeline-item">
                <div className="timeline-badge">{i + 1}</div>
                <div className="timeline-content">
                  <h4>{st.step}</h4>
                  <p>{st.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerGrowth;
