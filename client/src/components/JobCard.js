import { Link } from 'react-router-dom';

const JobCard = ({ job }) => {
  const getCompanyInitial = (company) => {
    return company ? company.charAt(0).toUpperCase() : 'C';
  };

  return (
    <div className="job-card">
      <div>
        <div className="job-card-header">
          <div className="company-logo-placeholder">
            {getCompanyInitial(job.company)}
          </div>
          <div className="job-title-group">
            <h3>{job.title}</h3>
            <p className="job-company">
              <span>{job.company}</span>
            </p>
          </div>
          {job.matchPercentage && (
            <span className="match-pill-badge">{job.matchPercentage}%</span>
          )}
        </div>

        <div className="job-meta-pills">
          <span className="meta-pill">📍 {job.location || 'Remote'}</span>
          <span className="meta-pill">💼 {job.jobType || 'Full-time'}</span>
          {job.experienceLevel && (
            <span className="meta-pill">📊 {job.experienceLevel}</span>
          )}
          {job.workPreference && (
            <span className="meta-pill">🏠 {job.workPreference}</span>
          )}
        </div>

        <div className="skill-tags">
          {job.skillsRequired?.slice(0, 4).map((skill) => (
            <span key={skill} className="tag">
              {skill}
            </span>
          ))}
          {job.skillsRequired?.length > 4 && (
            <span className="tag" style={{ opacity: 0.6 }}>+{job.skillsRequired.length - 4} more</span>
          )}
        </div>
      </div>

      <div className="job-card-footer">
        <div className="salary-tag">
          {job.salaryRange ? job.salaryRange : 'Competitive'}
        </div>
        <Link to={`/jobs/${job._id}`} className="btn-small">
          View Details →
        </Link>
      </div>
    </div>
  );
};

export default JobCard;
